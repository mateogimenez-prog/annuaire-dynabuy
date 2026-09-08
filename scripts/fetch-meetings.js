#!/usr/bin/env node
'use strict';

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const APP_JS = path.join(__dirname, '..', 'app.js');
const BASE = 'https://www.rencontres-dirigeants.com';

// Animateurs du réseau Dynabuy Nouvelle-Aquitaine
const ANIMATEURS = ['GIMENEZ', 'GRATAS', 'BARICAULT'];

// Agences connues (sera complété automatiquement via le dropdown)
const AGENCES_CONNUES = [254]; // Patricia GRATAS = 254

const MOIS = {
  'janv': '01', 'janvier': '01',
  'fevr': '02', 'fevrier': '02', 'fevr': '02',
  'mars': '03',
  'avr': '04', 'avril': '04',
  'mai': '05',
  'juin': '06',
  'juil': '07', 'juillet': '07',
  'aout': '08',
  'sept': '09', 'septembre': '09',
  'oct': '10', 'octobre': '10',
  'nov': '11', 'novembre': '11',
  'dec': '12', 'decembre': '12',
};

function parseDateFr(str) {
  if (!str) return null;
  // ISO: "2026-09-03T18:00"
  let m = str.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  // Français: "3 septembre 2026", "3 sept. 2026"
  const clean = str.toLowerCase().replace(/[éèê]/g, 'e').replace(/[àâ]/g, 'a');
  m = clean.match(/(\d{1,2})\s+(\w+)\.?\s+(\d{4})/);
  if (!m) return null;
  const [, day, mon, year] = m;
  const month = MOIS[mon] || MOIS[mon.slice(0, 4)] || MOIS[mon.slice(0, 3)];
  if (!month) return null;
  return `${year}-${month}-${day.padStart(2, '0')}`;
}

function parseHeure(str) {
  if (!str) return null;
  const m = str.match(/(\d{1,2})[h:](\d{2})(?:\s*(AM|PM))?/i);
  if (!m) return null;
  let h = parseInt(m[1]);
  const min = m[2];
  if (m[3]?.toUpperCase() === 'PM' && h < 12) h += 12;
  if (m[3]?.toUpperCase() === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}h${min}`;
}

function formatPrix(str) {
  if (!str) return 'Voir site';
  if (/gratuit/i.test(str)) return 'Gratuit';
  const m = str.match(/([\d\s,]+)\s*€/);
  if (!m) return 'Voir site';
  const montant = m[1].trim().replace(/\s/g, '').replace('.', ',');
  return /HT|hors/i.test(str) ? `${montant} € HT` : `${montant} € (sur place)`;
}

function buildTitre(ville, format) {
  if (format === 'Repas') return `Déjeuner réseau — ${ville}`;
  if (format === 'Évènementiel') return `Événement réseau — ${ville}`;
  if (format === 'Soirée') return `Soirée réseau — ${ville}`;
  return `Rencontre réseau — ${ville}`;
}

async function getAgencyIds(page) {
  try {
    await page.goto(`${BASE}/nos-rencontres`, { waitUntil: 'networkidle2', timeout: 30000 });

    const ids = await page.evaluate((animateurs) => {
      const found = [];
      document.querySelectorAll('select').forEach(sel => {
        [...sel.options].forEach(opt => {
          if (animateurs.some(a => opt.text.toUpperCase().includes(a))) {
            const id = parseInt(opt.value);
            if (id > 0) found.push({ id, text: opt.text.trim() });
          }
        });
      });
      return found;
    }, ANIMATEURS);

    if (ids.length > 0) {
      console.log('Agences découvertes:', ids.map(a => `${a.id}=${a.text}`).join(', '));
      return [...new Set([...AGENCES_CONNUES, ...ids.map(a => a.id)])];
    }
  } catch (err) {
    console.warn('Impossible de lire le dropdown agences:', err.message);
  }
  return AGENCES_CONNUES;
}

async function getMeetingIds(page, agencyId) {
  try {
    const url = `${BASE}/nos-rencontres?agency=${agencyId}`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });

    // Si redirigé vers la page principale, l'agence n'existe pas
    if (!page.url().includes(`agency=${agencyId}`)) return [];

    await page.waitForSelector('a[href*="/nos-rencontres/"]', { timeout: 5000 }).catch(() => {});

    return await page.evaluate(() => {
      const ids = new Set();
      document.querySelectorAll('a[href*="/nos-rencontres/"]').forEach(a => {
        const m = a.href.match(/\/nos-rencontres\/(\d{4,6})(?:[?#]|$)/);
        if (m) ids.add(parseInt(m[1]));
      });
      return [...ids];
    });
  } catch (err) {
    console.warn(`Agence ${agencyId} erreur:`, err.message);
    return [];
  }
}

async function parseMeeting(page, meetingId) {
  try {
    const res = await page.goto(`${BASE}/nos-rencontres/${meetingId}`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });
    if (!res?.ok()) return null;

    // Réunion expirée → redirigée
    if (!page.url().includes(`/${meetingId}`)) return null;

    // JSON-LD (données structurées)
    const ld = await page.evaluate(() => {
      for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
        try {
          const d = JSON.parse(s.textContent);
          if (d['@type'] === 'Event' || d.startDate) return d;
        } catch {}
      }
      return null;
    });

    const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 5000));
    const h1 = await page.evaluate(() => document.querySelector('h1')?.innerText?.trim() || '');

    // Date
    let date = ld?.startDate ? parseDateFr(ld.startDate) : null;
    if (!date) {
      const m = bodyText.match(/\d{1,2}\s+\w+\.?\s+\d{4}/);
      if (m) date = parseDateFr(m[0]);
    }
    if (!date) return null;

    const today = new Date().toISOString().slice(0, 10);
    if (date < today) return null;

    // Heures
    let heure = ld?.startDate ? parseHeure(ld.startDate.split('T')[1] || '') : null;
    let fin = ld?.endDate ? parseHeure(ld.endDate.split('T')[1] || '') : null;
    if (!heure || !fin) {
      const m = bodyText.match(/(\d{1,2}h\d{2})\s*[à\-–]\s*(\d{1,2}h\d{2})/);
      if (m) { heure = m[1]; fin = m[2]; }
    }

    // Ville
    let ville = ld?.location?.address?.addressLocality
      || ld?.location?.name?.split(',')[0]?.trim();
    if (!ville) {
      let m = (h1 || bodyText).match(/[àa]\s+([A-ZÀ-Ÿ][A-Za-zÀ-ÿ\-' ]{2,}?)(?=\s*[,\n(])/);
      if (m) ville = m[1].trim();
    }
    if (!ville) return null;

    // Animateur
    let animateur = ld?.organizer?.name || null;
    if (!animateur) {
      for (const nom of ANIMATEURS) {
        if (bodyText.toUpperCase().includes(nom)) {
          const m = bodyText.match(new RegExp(`([A-ZÀ-Ÿ][a-zà-ÿ]+\\s+${nom}|${nom}\\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)`, 'i'));
          animateur = m ? m[1] : nom;
          break;
        }
      }
    }
    if (!animateur || !ANIMATEURS.some(a => animateur.toUpperCase().includes(a))) return null;

    // Prix
    let prix = null;
    if (ld?.offers?.price != null) {
      prix = ld.offers.price === 0 || ld.offers.price === '0'
        ? 'Gratuit'
        : `${String(ld.offers.price).replace('.', ',')} € HT`;
    }
    if (!prix) {
      const m = bodyText.match(/([\d\s,.]+\s*€[^.]{0,30})/);
      if (m) prix = formatPrix(m[1]);
    }

    // Format
    let format = 'Présentiel';
    const txt = bodyText.toLowerCase();
    if (/repas|déjeuner|lunch/i.test(txt)) format = 'Repas';
    else if (/distanciel|visio/i.test(txt)) format = 'Distanciel';
    else if (/soirée|cocktail/i.test(txt)) format = 'Soirée';
    else if (/événement|conférence/i.test(txt)) format = 'Évènementiel';

    // Capitaliser animateur
    const animFinal = animateur.split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
      .replace(new RegExp(ANIMATEURS.join('|'), 'ig'), w => w.toUpperCase());

    return {
      id: `m${meetingId}`,
      titre: buildTitre(ville.trim(), format),
      date,
      heure: heure || '09h00',
      fin: fin || '11h30',
      lieu: ville.trim(),
      format,
      animateur: animFinal,
      prix: prix || 'Voir site',
      lien: `${BASE}/nos-rencontres/${meetingId}`,
    };
  } catch {
    return null;
  }
}

function updateAppJs(meetings) {
  const src = fs.readFileSync(APP_JS, 'utf8');

  const lines = meetings.map((m, i) => {
    const comma = i < meetings.length - 1 ? ',' : '';
    const titre = m.titre.replace(/'/g, "\\'");
    const lieu = m.lieu.replace(/'/g, "\\'");
    return `  {\n    id: '${m.id}',\n    titre: '${titre}',\n    date: '${m.date}', heure: '${m.heure}', fin: '${m.fin}',\n    lieu: '${lieu}', format: '${m.format}',\n    animateur: '${m.animateur}', prix: '${m.prix}',\n    lien: '${m.lien}'\n  }${comma}`;
  });

  const newBlock = `const SAMPLE_MEETINGS = [\n${lines.join('\n')}\n];`;
  const newSrc = src.replace(/const SAMPLE_MEETINGS = \[[\s\S]*?\];/, newBlock);

  if (newSrc === src) return false;
  fs.writeFileSync(APP_JS, newSrc, 'utf8');
  return true;
}

function prunePastMeetings() {
  const src = fs.readFileSync(APP_JS, 'utf8');
  const today = new Date().toISOString().slice(0, 10);
  const blockMatch = src.match(/const SAMPLE_MEETINGS = \[([\s\S]*?)\];/);
  if (!blockMatch) return false;

  const existing = [];
  const re = /\{\s*id:\s*'([^']+)',[\s\S]*?date:\s*'(\d{4}-\d{2}-\d{2})'[\s\S]*?lien:\s*'([^']+)'\s*\}/g;
  let m;
  while ((m = re.exec(blockMatch[1])) !== null) {
    existing.push({ raw: m[0], date: m[2] });
  }

  const kept = existing.filter(e => e.date >= today);
  if (kept.length === existing.length) return false;

  const lines = kept.map((e, i) => `  ${e.raw.replace(/^\s+|\s+$/g, '')}${i < kept.length - 1 ? ',' : ''}`);
  const newBlock = `const SAMPLE_MEETINGS = [\n${lines.join('\n')}\n];`;
  const newSrc = src.replace(/const SAMPLE_MEETINGS = \[[\s\S]*?\];/, newBlock);
  fs.writeFileSync(APP_JS, newSrc, 'utf8');
  return true;
}

async function main() {
  console.log(`[${new Date().toISOString()}] Démarrage de la mise à jour des réunions...`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    page.setDefaultNavigationTimeout(20000);

    // 1. Trouver les IDs d'agences
    const agencyIds = await getAgencyIds(page);
    console.log('Agences à scraper:', agencyIds.join(', '));

    // 2. Collecter les IDs de réunions
    const allIds = new Set();
    for (const id of agencyIds) {
      const ids = await getMeetingIds(page, id);
      console.log(`Agence ${id}: ${ids.length} réunions`);
      ids.forEach(i => allIds.add(i));
    }

    if (allIds.size === 0) {
      console.log('Aucune réunion trouvée, abandon.');
      return;
    }

    // 3. Parser chaque réunion (les plus récentes en premier, max 100)
    const sortedIds = [...allIds].sort((a, b) => b - a).slice(0, 100);
    const today = new Date().toISOString().slice(0, 10);
    const limitDate = new Date();
    limitDate.setMonth(limitDate.getMonth() + 9);
    const endDate = limitDate.toISOString().slice(0, 10);

    const meetings = [];
    for (const id of sortedIds) {
      const m = await parseMeeting(page, id);
      if (m && m.date >= today && m.date <= endDate) {
        meetings.push(m);
        console.log(`✓ ${m.date} ${m.heure} — ${m.titre} (${m.animateur})`);
      }
      await new Promise(r => setTimeout(r, 300));
    }

    meetings.sort((a, b) => a.date.localeCompare(b.date));
    console.log(`\n${meetings.length} réunion(s) trouvée(s)`);

    if (meetings.length > 0) {
      const changed = updateAppJs(meetings);
      console.log(changed ? '✓ app.js mis à jour' : 'app.js inchangé');
    } else {
      console.log('⚠ Aucune réunion trouvée sur le site, nettoyage des dates passées uniquement');
      const pruned = prunePastMeetings();
      console.log(pruned ? '✓ Réunions passées supprimées de app.js' : 'Aucune réunion passée à supprimer');
    }
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('Erreur:', err.message);
  process.exit(1);
});
