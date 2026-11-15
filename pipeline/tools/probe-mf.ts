// Diagnostic du paquet Météo-France 6 min : forme réelle de la réponse (stations, heures, champs remplis). Aucune valeur affichée.
const MF = process.env.METEOFRANCE_KEY?.trim(); if (!MF) { console.log('clé absente'); process.exit(0); }
const base = 'https://public-api.meteofrance.fr/public/DPPaquetObs/v1';
for (const id of ['11202001', '30133005', '13054001', '83069001']) {
  const r = await fetch(`${base}/paquet/infrahoraire-6m?id_station=${id}&format=json`, { headers: { apikey: MF, accept: '*/*' } });
  const t = await r.text(); if (!r.ok) { console.log(id, r.status, t.slice(0, 150)); continue; }
  const a: any[] = JSON.parse(t);
  const ids = new Set(a.map((o) => o.geo_id_insee)), times = [...new Set(a.map((o) => o.validity_time))].sort();
  const mine = a.filter((o) => String(o.geo_id_insee) === id);
  const filled = (k: string) => mine.filter((o) => o[k] != null).length;
  console.log(`${id} : ${a.length} lignes, ${ids.size} station(s) dans la réponse (${[...ids].slice(0, 5).join(', ')}…), ${times.length} heures de ${times[0]} à ${times[times.length - 1]}`);
  console.log(`   lignes de cette station : ${mine.length} ; remplies : ff ${filled('ff')}, dd ${filled('dd')}, fxi10 ${filled('fxi10')}, dxi10 ${filled('dxi10')} ; pas entre heures : ${[...new Set(times.slice(-5).map((x, i, z) => i ? (Date.parse(x) - Date.parse(z[i - 1])) / 60000 : 0))].join('/')} min`);
  await new Promise((ok) => setTimeout(ok, 1500));
}
