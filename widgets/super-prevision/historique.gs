// =====================================================================
// OCEAN — historique des relevés (à AJOUTER au script de la super prévision)
// Tom, 13/11/2026 : dans l'app (mode perso), toucher un relevé « En direct » affiche les relevés de la journée,
// et dessous les stats des spots (jours du mois avec du vent à 15 nd ou plus).
//
// Ce code ne contient aucune clé ni aucun identifiant. Il lit la feuille « Observations » que le script remplit
// déjà toutes les heures (moyenne horaire Winds-Up, rafale max, direction ; ~3 mois gardés). Rien n'est publié :
// la réponse n'est envoyée qu'à la personne qui a le lien secret (même clé que ?action=live).
//
// À FAIRE (une fois) :
//  1. Colle tout ce fichier À LA FIN de ton script (Apps Script → super-prevision-vent.gs).
//  2. Dans doGet, juste après la ligne « if (e.parameter.action === 'live') … », ajoute :
//       if (e.parameter.action === 'histo') return json_(histoOcean_());
//  3. Déployer → Gérer les déploiements → modifier → Nouvelle version (le lien ne change pas).
// =====================================================================
const HISTO_SEUIL_ND = 15;        // un « jour à 15 nd » : au moins une heure de jour à 15 nd de moyenne ou plus
const HISTO_HEURES = [8, 19];     // heures de jour comptées (8 h → 19 h compris, heure de Paris)

function histoOcean_() {
  const cache = CacheService.getScriptCache();
  try { const c = cache.get('histoOcean'); if (c) return JSON.parse(c); } catch (err) { /* recalcul */ }
  const sh = classeur_().getSheetByName('Observations');
  const out = { updated: Date.now(), seuil: HISTO_SEUIL_ND, heures: HISTO_HEURES, spots: {} };
  if (!sh || sh.getLastRow() < 2) return out;
  const auj = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
  const parId = {};
  SPOTS.forEach((s) => { parId[s.id] = { nom: s.nom, jour: [], jours: {} }; });
  sh.getRange(2, 1, sh.getLastRow() - 1, 8).getValues().forEach((r) => {
    const x = parId[r[0]], t = Number(r[1]), v = Number(String(r[3]).replace(',', '.'));
    if (!x || !(t > 0) || r[3] === '' || !isFinite(v) || r[7] === 'écart') return;
    const raf = Number(String(r[4]).replace(',', '.'));
    const j = Utilities.formatDate(new Date(t), TZ, 'yyyy-MM-dd'), h = Number(Utilities.formatDate(new Date(t), TZ, 'H'));
    if (j === auj) x.jour.push([t, Math.round(v * 10) / 10, isFinite(raf) && raf > 0 ? Math.round(raf) : null, r[5] || null]);
    if (h < HISTO_HEURES[0] || h > HISTO_HEURES[1]) return;
    const d = x.jours[j] || (x.jours[j] = [0, 0]);   // [moyenne horaire max du jour, heures à HISTO_SEUIL_ND ou plus]
    d[0] = Math.max(d[0], Math.round(v * 10) / 10);
    if (v >= HISTO_SEUIL_ND) d[1]++;
  });
  Object.keys(parId).forEach((id) => {
    const x = parId[id];
    x.jour.sort((a, b) => a[0] - b[0]);
    out.spots[id] = { nom: x.nom, jour: x.jour, jours: Object.keys(x.jours).sort().map((j) => [j, x.jours[j][0], x.jours[j][1]]) };
  });
  try { cache.put('histoOcean', JSON.stringify(out), 15 * 60); } catch (err) { /* trop gros : pas de cache */ }
  return out;
}
