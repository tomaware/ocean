// Diagnostic : API Météo-France v2 (Observations, Package Observations) face à la v1 utilisée. Aucune clé affichée.
const K = { v1pack: process.env.METEOFRANCE_KEY?.trim(), obs2: process.env.METEOFRANCE_KEY_OBS2?.trim(), pack2: process.env.METEOFRANCE_KEY_PACK2?.trim() };
const B = 'https://public-api.meteofrance.fr/public';
const ST = ['11202001', '30133005', '13054001', '83069001'];
const tries: [string, string | undefined, string][] = [
  ['paquet v1', K.v1pack, `${B}/DPPaquetObs/v1/paquet/infrahoraire-6m?id_station={id}&format=json`],
  ['paquet v2', K.pack2, `${B}/DPPaquetObs/v2/paquet/infrahoraire-6m?id_station={id}&format=json`],
  ['obs v2 6 min', K.obs2, `${B}/DPObs/v2/station/infrahoraire-6m?id_station={id}&format=json`],
  ['obs v2 horaire', K.obs2, `${B}/DPObs/v2/station/horaire?id_station={id}&format=json`],
];
const now = Date.now();
for (const [name, key, url] of tries) {
  if (!key) { console.log(`${name} : clé absente`); continue; }
  for (const id of ST) {
    await new Promise((ok) => setTimeout(ok, 1500));
    let r: Response | null = null; for (let k = 0; k < 3 && !r; k++) { try { r = await fetch(url.replace('{id}', id), { headers: { apikey: key, accept: '*/*' } }); } catch (e) { console.log(`${name} ${id} : ${(e as any).cause?.code ?? e}`); await new Promise((ok) => setTimeout(ok, 5000)); } }
    if (!r) continue; const t = await r.text();
    if (!r.ok) { console.log(`${name} ${id} : HTTP ${r.status} ${t.slice(0, 140).replace(/\s+/g, ' ')}`); if (r.status === 404 || r.status === 403) break; continue; }
    let a: any[]; try { const j = JSON.parse(t); a = Array.isArray(j) ? j : [j]; } catch { console.log(`${name} ${id} : pas du JSON : ${t.slice(0, 100)}`); continue; }
    const mine = a.filter((o) => o.geo_id_insee == null || String(o.geo_id_insee) === id);
    const times = mine.map((o) => Date.parse(o.validity_time)).filter(Number.isFinite).sort((x, y) => x - y);
    const keys = [...new Set(mine.flatMap((o) => Object.keys(o).filter((k) => o[k] != null)))];
    const gust = keys.filter((k) => /^(fx|dx)/.test(k));
    console.log(`${name} ${id} : ${mine.length} lignes, de ${new Date(times[0]).toISOString().slice(5, 16)} à ${new Date(times[times.length - 1]).toISOString().slice(5, 16)}, dernière il y a ${Math.round((now - times[times.length - 1]) / 60000)} min ; champs remplis : ${keys.length} ; rafales : ${gust.join(', ') || 'aucune'}`);
    if (id === ST[0]) console.log(`   champs : ${keys.join(', ')}`);
  }
}
