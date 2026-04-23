// ═══════════════════════════════════════════
//  Annuaire Dynabuy — Données & Utilitaires
// ═══════════════════════════════════════════

// Incrémenter ce numéro force un reset du localStorage (supprime les vieilles données)
const DATA_VERSION = '3';

function initDataVersion() {
  const stored = localStorage.getItem('dynabuy_version');
  if (stored !== DATA_VERSION) {
    ['dynabuy_members', 'dynabuy_meetings', 'dynabuy_version'].forEach(k => localStorage.removeItem(k));
    localStorage.setItem('dynabuy_version', DATA_VERSION);
  }
}

initDataVersion();

const SECTORS = [
  'Formation & Management',
  'Comptabilité & Finance',
  'Juridique & Droit',
  'Immobilier',
  'Informatique & Digital',
  'Communication & Marketing',
  'Santé & Bien-être',
  'Bâtiment & Construction',
  'Plomberie & Chauffage',
  'Électricité',
  'Commerce & Vente',
  'Transport & Logistique',
  'Restauration & Hôtellerie',
  'Assurance',
  'Ressources Humaines',
  "Artisanat & Métiers d'art",
  'Autre'
];

const AVATAR_COLORS = {
  'Formation & Management': '#7C3AED',
  'Comptabilité & Finance': '#10B981',
  'Juridique & Droit': '#8B5CF6',
  'Immobilier': '#EF4444',
  'Informatique & Digital': '#06B6D4',
  'Communication & Marketing': '#DB2777',
  'Santé & Bien-être': '#EC4899',
  'Bâtiment & Construction': '#92400E',
  'Plomberie & Chauffage': '#3B82F6',
  'Électricité': '#F59E0B',
  'Commerce & Vente': '#F97316',
  'Transport & Logistique': '#6366F1',
  'Restauration & Hôtellerie': '#D97706',
  'Assurance': '#059669',
  'Ressources Humaines': '#A21CAF',
  "Artisanat & Métiers d'art": '#B45309',
  'Autre': '#6B7280'
};

// Seule vraie adhérente de départ
const INITIAL_MEMBERS = [
  {
    id: '1',
    prenom: 'Patricia',
    nom: 'Gratas',
    entreprise: 'Oxycom Compétences',
    secteur: 'Formation & Management',
    ville: 'Blanquefort',
    email: 'patricia.gratas@oxycom-competences.fr',
    tel: '06 19 67 62 23',
    date: '2026-04-23'
  }
];

const LIEN_INSCRIPTION = 'https://www.rencontres-dirigeants.com/nos-rencontres';

const SAMPLE_MEETINGS = [
  {
    id: 'm1',
    titre: 'Rencontre réseau — Mont-de-Marsan',
    date: '2026-04-24', heure: '09h00', fin: '11h30',
    lieu: 'Mont-de-Marsan', format: 'Présentiel',
    animateur: 'Michaël GIMENEZ', prix: '13,00 € HT'
  },
  {
    id: 'm2',
    titre: 'Déjeuner réseau — Libourne',
    date: '2026-04-29', heure: '12h30', fin: '14h00',
    lieu: 'Libourne', format: 'Repas',
    animateur: 'Tanguy BARICAULT', prix: '~20 € (sur place)'
  },
  {
    id: 'm3',
    titre: 'Rencontre réseau — Bordeaux',
    date: '2026-04-30', heure: '15h00', fin: '17h30',
    lieu: 'Bordeaux', format: 'Présentiel',
    animateur: 'Michaël GIMENEZ', prix: '11,00 € HT'
  },
  {
    id: 'm4',
    titre: 'Rencontre réseau — Lons',
    date: '2026-05-05', heure: '09h00', fin: '11h30',
    lieu: 'Lons', format: 'Présentiel',
    animateur: 'Michaël GIMENEZ', prix: '10,00 € HT'
  },
  {
    id: 'm5',
    titre: 'Rencontre réseau — Bordeaux',
    date: '2026-05-05', heure: '14h00', fin: '16h30',
    lieu: 'Bordeaux', format: 'Présentiel',
    animateur: 'Patricia GRATAS', prix: '12,50 € HT'
  },
  {
    id: 'm6',
    titre: 'Rencontre réseau — Dax',
    date: '2026-05-06', heure: '09h00', fin: '11h30',
    lieu: 'Dax', format: 'Présentiel',
    animateur: 'Michaël GIMENEZ', prix: '8,00 € HT'
  },
  {
    id: 'm7',
    titre: 'Rencontre réseau — Arcachon',
    date: '2026-05-12', heure: '09h00', fin: '11h30',
    lieu: 'Arcachon', format: 'Présentiel',
    animateur: 'Michaël GIMENEZ', prix: '10,41 € HT'
  },
  {
    id: 'm8',
    titre: 'Déjeuner réseau — Blanquefort',
    date: '2026-05-20', heure: '12h30', fin: '14h00',
    lieu: 'Blanquefort', format: 'Repas',
    animateur: 'Patricia GRATAS', prix: '~20 € (sur place)'
  },
  {
    id: 'm9',
    titre: 'Rencontre réseau — Mont-de-Marsan',
    date: '2026-05-21', heure: '14h00', fin: '16h30',
    lieu: 'Mont-de-Marsan', format: 'Présentiel',
    animateur: 'Michaël GIMENEZ', prix: '13,00 € HT'
  },
  {
    id: 'm10',
    titre: 'Rencontre réseau — Biarritz',
    date: '2026-05-22', heure: '09h00', fin: '11h30',
    lieu: 'Biarritz', format: 'Présentiel',
    animateur: 'Michaël GIMENEZ', prix: '10,00 € HT'
  },
  {
    id: 'm11',
    titre: 'Rencontre réseau — Bordeaux',
    date: '2026-05-28', heure: '15h00', fin: '17h30',
    lieu: 'Bordeaux', format: 'Présentiel',
    animateur: 'Michaël GIMENEZ', prix: '11,00 € HT'
  },
  {
    id: 'm12',
    titre: 'Soirée réseau — Bordeaux',
    date: '2026-06-02', heure: '18h00', fin: '20h30',
    lieu: 'Bordeaux', format: 'Soirée',
    animateur: 'Patricia GRATAS', prix: '25,00 € HT'
  },
  {
    id: 'm13',
    titre: 'Rencontre réseau — Mont-de-Marsan',
    date: '2026-06-04', heure: '09h00', fin: '11h30',
    lieu: 'Mont-de-Marsan', format: 'Présentiel',
    animateur: 'Michaël GIMENEZ', prix: '13,00 € HT'
  },
  {
    id: 'm14',
    titre: 'Événement réseau — Monein',
    date: '2026-06-05', heure: '10h00', fin: '13h30',
    lieu: 'Monein', format: 'Évènementiel',
    animateur: 'Michaël GIMENEZ', prix: '39,00 € HT'
  },
  {
    id: 'm15',
    titre: 'Rencontre réseau — Saint-Émilion',
    date: '2026-06-11', heure: '09h00', fin: '11h30',
    lieu: 'Saint-Émilion', format: 'Présentiel',
    animateur: 'Tanguy BARICAULT', prix: '16,00 € HT'
  },
  {
    id: 'm16',
    titre: 'Rencontre réseau — Hendaye',
    date: '2026-06-12', heure: '09h00', fin: '11h30',
    lieu: 'Hendaye', format: 'Présentiel',
    animateur: 'Michaël GIMENEZ', prix: '8,50 € HT'
  }
];

// ─── STORAGE ───────────────────────────────
function getMembers() {
  const stored = localStorage.getItem('dynabuy_members');
  if (!stored) {
    localStorage.setItem('dynabuy_members', JSON.stringify(INITIAL_MEMBERS));
    return [...INITIAL_MEMBERS];
  }
  return JSON.parse(stored);
}

function saveMembers(members) {
  localStorage.setItem('dynabuy_members', JSON.stringify(members));
}

function addMember(data) {
  const members = getMembers();
  const member = {
    ...data,
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0]
  };
  members.push(member);
  saveMembers(members);
  return member;
}

function getMeetings() {
  // Les réunions sont fixes (source : rencontres-dirigeants.com), pas de persistance locale
  return SAMPLE_MEETINGS;
}

// ─── VCARD ─────────────────────────────────
function generateVCard(member) {
  const tel = member.tel.replace(/\s/g, '');
  return `BEGIN:VCARD\r\nVERSION:3.0\r\nN:${member.nom};${member.prenom};;;\r\nFN:${member.prenom} ${member.nom}\r\nORG:${member.entreprise}\r\nTITLE:${member.secteur}\r\nTEL;TYPE=CELL:${tel}\r\nEMAIL:${member.email}\r\nADR;TYPE=WORK:;;${member.ville};;;;FR\r\nNOTE:Adhérent Dynabuy Réseau\r\nEND:VCARD`;
}

// ─── CARTE MEMBRE ──────────────────────────
function buildMemberCardHTML(member, qrContainerId) {
  const initials = getInitials(member.prenom, member.nom);
  const color = getAvatarColor(member.secteur);
  return `
    <div class="member-card-visual">
      <div class="card-top">
        <div class="card-top-logo">
          <div class="logo-icon">D</div>
          Dynabuy Réseau
        </div>
        <div class="card-network-label">Carte Adhérent</div>
      </div>
      <div class="card-body">
        <div class="card-info">
          <div class="card-avatar" style="background:${color}">${escapeHtml(initials)}</div>
          <div class="card-name">${escapeHtml(member.prenom)} ${escapeHtml(member.nom)}</div>
          <div class="card-company">${escapeHtml(member.entreprise)}</div>
          <div class="card-sector">
            <span class="sector-badge">${escapeHtml(member.secteur)}</span>
          </div>
          <div class="card-contacts">
            <div class="card-contact-row">
              <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              ${escapeHtml(member.ville)}
            </div>
            <div class="card-contact-row">
              <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              ${escapeHtml(member.email)}
            </div>
            <div class="card-contact-row">
              <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.128.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.61 5.61l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.572 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>
              ${escapeHtml(member.tel)}
            </div>
          </div>
        </div>
        <div class="card-qr">
          <div id="${qrContainerId}"></div>
          <div class="card-qr-label">Scannez pour<br>ajouter le contact</div>
        </div>
      </div>
      <div class="card-footer">
        Membre du réseau <span>Dynabuy</span> — dynabuy.fr
      </div>
    </div>`;
}

function generateMemberQR(member, containerId, size = 110) {
  const container = document.getElementById(containerId);
  if (!container || typeof QRCode === 'undefined') return;
  container.innerHTML = '';
  new QRCode(container, {
    text: generateVCard(member),
    width: size,
    height: size,
    colorDark: '#1A1A2E',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.M
  });
}

// ─── UI HELPERS ────────────────────────────
function showToast(message, type = 'success') {
  document.querySelector('.toast')?.remove();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 3800);
}

function getInitials(prenom, nom) {
  return ((prenom?.[0] || '') + (nom?.[0] || '')).toUpperCase();
}

function getAvatarColor(secteur) {
  return AVATAR_COLORS[secteur] || '#E8392A';
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getDateParts(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return {
    day: d.getDate(),
    month: d.toLocaleDateString('fr-FR', { month: 'short' })
  };
}

function getFormatLabel(meeting) {
  if (meeting.format === 'Repas') return 'Repas';
  const [h, min] = (meeting.fin || '12h00').split('h').map(Number);
  const finMin = h * 60 + (min || 0);
  if (finMin <= 12 * 60)       return 'Matinale';
  if (finMin <= 17 * 60 + 30)  return 'Après-midi';
  return 'After Work';
}

function escapeHtml(str) {
  const el = document.createElement('div');
  el.textContent = str ?? '';
  return el.innerHTML;
}

// ─── NAV MOBILE ────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger?.addEventListener('click', () => {
    navLinks?.classList.toggle('open');
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => navLinks?.classList.remove('open'));
  });
});
