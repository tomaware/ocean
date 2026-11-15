// Diagnostic : stations libres (Météo-France paquet v2, Pioupiou) près de spots candidats. Distances et présence seulement.
const MF = (process.env.METEOFRANCE_KEY_PACK2 || process.env.METEOFRANCE_KEY)?.trim();
const C: [string, number, number][] = [['Gruissan (plage des Chalets / étang)', 43.103, 3.105], ['Port-Leucate / Les Sidrières (étang)', 42.86, 3.03], ['Le Barcarès', 42.79, 3.04], ['Canet-en-Roussillon', 42.70, 3.04],
  ['Narbonne-Plage / St-Pierre', 43.17, 3.18], ['Sète Lido / Villeroy', 43.37, 3.62], ['Étang de Thau (Marseillan / Bouzigues)', 43.40, 3.60], ['Palavas / Carnon', 43.53, 3.95], ['Villeneuve-lès-Maguelone', 43.51, 3.87],
  ['Saintes-Maries / Piémanson', 43.45, 4.43], ['Carro / La Couronne', 43.33, 5.04], ['Six-Fours (Brutal Beach)', 43.08, 5.82], ['Giens / Bergerie', 43.05, 6.13]];
const km = (a: number, b: number, c: number, d: number) => { const r = Math.PI / 180, x = Math.sin(((c - a) * r) / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(((d - b) * r) / 2) ** 2; return 2 * 6371 * Math.asin(Math.sqrt(x)); };
const st: { src: string; id: string; name: string; lat: number; lon: number; ok?: string }[] = [];
const pp = await (await fetch('https://api.pioupiou.fr/v1/live/all')).json();
for (const s of pp.data ?? []) if (s.location?.latitude != null && Date.now() - Date.parse(s.measurements?.date ?? 0) < 3 * 3600e3) st.push({ src: 'pioupiou', id: String(s.id), name: s.meta?.name ?? '?', lat: s.location.latitude, lon: s.location.longitude, ok: 'en ligne' });
const base = 'https://public-api.meteofrance.fr/public/DPPaquetObs/' + (process.env.METEOFRANCE_KEY_PACK2 ? 'v2' : 'v1');
const list = await (await fetch(base + '/liste-stations', { headers: { apikey: MF!, accept: '*/*' } })).text();
const rows = list.trim().split('\n'); const h = rows[0].split(';');
for (const l of rows.slice(1)) { const c = l.split(';'); st.push({ src: 'meteo-france', id: c[h.indexOf('Id_station')] ?? c[0], name: c[2], lat: Number(c[3]), lon: Number(c[4]) }); }
const checked = new Map<string, string>();
for (const [n, la, lo] of C) {
  console.log('\n' + n);
  const near = st.map((x) => ({ x, d: km(la, lo, x.lat, x.lon) })).filter((y) => y.d <= 12).sort((a, b) => a.d - b.d).slice(0, 4);
  if (!near.length) console.log('  rien à moins de 12 km');
  for (const { x, d } of near) {
    if (x.src === 'meteo-france' && !checked.has(x.id)) { await new Promise((ok) => setTimeout(ok, 1300));
      try { const r = await fetch(`${base}/paquet/infrahoraire-6m?id_station=${x.id}&format=json`, { headers: { apikey: MF!, accept: '*/*' } }); const a: any[] = r.ok ? await r.json() : [];
        checked.set(x.id, r.ok ? `${a.filter((o) => o.ff != null).length} mesures de vent / ${a.length}, rafales ${a.some((o) => o.raf10 != null) ? 'oui' : 'non'}` : 'HTTP ' + r.status); } catch (e) { checked.set(x.id, String(e)); } }
    console.log(`  ${d.toFixed(1).padStart(5)} km  ${x.src.padEnd(12)} ${x.id.padEnd(9)} ${x.name} · ${x.ok ?? checked.get(x.id)}`);
  }
}
