#!/bin/bash
# Mise à jour automatique des réunions Dynabuy
# Appelé par cron à 3h UTC (= 5h Paris CEST / 4h CET)

DIR="/Users/mateo/Desktop/Claude Code/dynabuy landing page"
LOG="$DIR/scripts/update.log"

log() { echo "[$(date '+%Y-%m-%d %H:%M')] $1" | tee -a "$LOG"; }

log "=== Démarrage mise à jour réunions ==="
cd "$DIR" || { log "ERREUR: impossible d'accéder au répertoire"; exit 1; }

# Limiter le log à 500 lignes
if [ -f "$LOG" ] && [ "$(wc -l < "$LOG")" -gt 500 ]; then
  tail -200 "$LOG" > "$LOG.tmp" && mv "$LOG.tmp" "$LOG"
fi

# 1. Scraper les réunions
log "Lancement du scraper..."
if ! node scripts/fetch-meetings.js >> "$LOG" 2>&1; then
  log "ERREUR: le scraper a échoué"
  exit 1
fi

# 2. Vérifier si app.js a changé
if git diff --quiet app.js; then
  log "Aucun changement détecté dans app.js — arrêt"
  exit 0
fi

log "Changements détectés dans app.js — commit + deploy"

# 3. Commit + push GitHub
git add app.js
git commit -m "chore: mise à jour automatique des réunions ($(date '+%d/%m/%Y %H:%M'))"
git push origin main >> "$LOG" 2>&1

# 4. Deploy Vercel
log "Déploiement Vercel..."
vercel deploy --prod >> "$LOG" 2>&1 && log "Déployé sur Vercel ✓" || log "ERREUR déploiement Vercel"

log "=== Terminé ==="
