// Diagnostic : le script de la super prévision répond-il à ?action=histo (D-59) ?
// N'affiche AUCUN relevé (journal public) : seulement présent / absent et des nombres de lignes par spot.
const url = process.env.SUPER_PREVISION_URL;
if (!url) { console.log('secret SUPER_PREVISION_URL absent'); process.exit(1); }
const r = await fetch(url + (url.includes('?') ? '&' : '?') + 'action=histo', { redirect: 'follow' });
if (!r.ok) { console.log('HTTP ' + r.status); process.exit(1); }
const j: any = await r.json();
if (j.error) { console.log('erreur du script : ' + j.error); process.exit(1); }
if (!j.spots || j.seuil == null) { console.log('ABSENT : le script renvoie la prévision, pas l’historique (ajout historique.gs ou ligne doGet manquant, ou nouvelle version pas déployée)'); process.exit(1); }
const ids = Object.keys(j.spots);
console.log(`PRÉSENT : seuil ${j.seuil} nd, heures ${j.heures?.join('–')} h, ${ids.length} spots`);
for (const id of ids) { const s = j.spots[id];
  console.log(`  spot ${ids.indexOf(id) + 1} : ${s.jour?.length ?? 0} heure(s) aujourd’hui, ${s.jours?.length ?? 0} jour(s) d’historique, du ${s.jours?.[0]?.[0] ?? '—'} au ${s.jours?.at(-1)?.[0] ?? '—'}`); }
