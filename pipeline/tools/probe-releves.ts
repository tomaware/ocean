// Diagnostic : quelles balises de vent PUBLIQUES existent près de chaque spot wing, et sont-elles vivantes ?
// Sources sondées : OpenWindMap / Pioupiou (sans clé), FFVL (liste publique), Météo-France observations (clé en secret).
// Journal public : on affiche distance, âge de la dernière mesure et pas de temps, jamais les valeurs de vent.
import { loadRegistry } from '../collect/points.ts';

const reg = loadRegistry();
const spots = reg.spots.filter((s) => s.disciplines.includes('wing')).map((s) => ({ id: s.id, name: s.name, ...(s.geometry as { lat: number; lon: number }) }));
const km = (a: number, b: number, c: number, d: number) => { const r = Math.PI / 180, x = Math.sin(((c - a) * r) / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(((d - b) * r) / 2) ** 2; return 2 * 6371 * Math.asin(Math.sqrt(x)); };
const MAX_KM = 25;
type St = { src: string; id: string; name: string; lat: number; lon: number; ageMin?: number | null; note?: string };
const all: St[] = [];
const get = async (u: string, h: Record<string, string> = {}) => { const r = await fetch(u, { headers: { 'User-Agent': 'OCEAN diagnostic', ...h } }); return { ok: r.ok, status: r.status, text: await r.text() }; };
const now = Date.now();

// 1) OpenWindMap / Pioupiou
try {
  const r = await get('https://api.pioupiou.fr/v1/live/all');
  console.log(`Pioupiou /v1/live/all : HTTP ${r.status}`);
  if (r.ok) { const j = JSON.parse(r.text);
    if (j.license || j.attribution) console.log(`  licence annoncée : ${j.license ?? ''} ${j.attribution ?? ''}`);
    for (const s of j.data ?? []) { const lat = s.location?.latitude, lon = s.location?.longitude; if (lat == null) continue;
      const t = Date.parse(s.measurements?.date ?? ''); all.push({ src: 'pioupiou', id: String(s.id), name: s.meta?.name ?? '?', lat, lon, ageMin: Number.isFinite(t) ? Math.round((now - t) / 60000) : null }); } }
} catch (e) { console.log('Pioupiou : ' + e); }

// accès direct depuis le navigateur (CORS) : l'app pourrait lire le direct sans attendre la collecte
for (const u of ['https://api.pioupiou.fr/v1/live/1538', 'https://www.data.gouv.fr/api/1/datasets/reseau-de-balises-meteo-de-la-ffvl-federation-francaise-de-vol-libre/']) {
  try { const r = await fetch(u, { headers: { Origin: 'https://tomaware.github.io' } }); console.log(`CORS ${u.split('/')[2]} : HTTP ${r.status}, Access-Control-Allow-Origin = ${r.headers.get('access-control-allow-origin') ?? 'absent'}`); } catch (e) { console.log('CORS ' + u + ' : ' + e); }
}

// 2) FFVL : open data sur data.gouv.fr (Licence Ouverte 2.0, sans clé) — balises.json + releves.json
try {
  const ds = await get('https://www.data.gouv.fr/api/1/datasets/reseau-de-balises-meteo-de-la-ffvl-federation-francaise-de-vol-libre/');
  console.log(`FFVL data.gouv : HTTP ${ds.status}`);
  if (ds.ok) { const j = JSON.parse(ds.text); console.log(`  licence : ${j.license} · mis à jour ${j.last_modified}`);
    const files: Record<string, any> = {};
    for (const r of j.resources ?? []) { console.log(`  ressource « ${r.title} » ${r.format} ${r.url} (modifiée ${r.last_modified})`);
      if (/json/i.test(r.format ?? r.url)) { const x = await get(r.url); console.log(`    → HTTP ${x.status}, ${x.text.length} octets`); try { files[r.title] = JSON.parse(x.text); } catch { console.log('    pas du JSON'); } } }
    for (const [t, v] of Object.entries(files)) { const arr: any[] = Array.isArray(v) ? v : Object.values(v as object); const o = arr[0];
      console.log(`  « ${t} » : ${arr.length} éléments ; champs : ${o && typeof o === 'object' ? Object.keys(o).join(', ') : typeof o}`);
      if (o) console.log('    exemple : ' + JSON.stringify(o).slice(0, 400)); }
    const bal = Object.values(files).find((v: any) => { const a: any[] = Array.isArray(v) ? v : Object.values(v); return a[0]?.latitude !== undefined || a[0]?.lat !== undefined; }) as any;
    const rel = Object.values(files).find((v) => v !== bal) as any;
    const relArr: any[] = rel ? (Array.isArray(rel) ? rel : Object.values(rel)) : [];
    const relById = new Map(relArr.map((o) => [String(o.idBalise ?? o.idbalise ?? o.id), o]));
    for (const b of (bal ? (Array.isArray(bal) ? bal : Object.values(bal)) : []) as any[]) { const lat = Number(b.latitude ?? b.lat), lon = Number(b.longitude ?? b.lon); if (!Number.isFinite(lat)) continue;
      const id = String(b.idBalise ?? b.idbalise ?? b.id); const r = relById.get(id); const t = Date.parse(r?.date ?? r?.dateRelevé ?? r?.dateReleve ?? '');
      all.push({ src: 'ffvl', id, name: String(b.nom ?? b.name ?? '?'), lat, lon, ageMin: Number.isFinite(t) ? Math.round((now - t) / 60000) : null, note: r ? undefined : 'pas de relevé' }); }
  }
} catch (e) { console.log('FFVL : ' + e); }

// 3) Météo-France — clé dans le secret METEOFRANCE_KEY ; essaie l'API Observations (DPObs) et le paquet (DPPaquetObs)
const MF = process.env.METEOFRANCE_KEY?.trim();
if (!MF) console.log('Météo-France : secret METEOFRANCE_KEY absent → non sondé');
else {
  const H = { apikey: MF, accept: '*/*' };
  let list: string | null = null, base = '';
  for (const b of ['https://public-api.meteofrance.fr/public/DPObs/v1', 'https://public-api.meteofrance.fr/public/DPPaquetObs/v1']) {
    const r = await get(b + '/liste-stations', H);
    console.log(`Météo-France ${b.split('/').slice(-2).join('/')} liste-stations : HTTP ${r.status}, ${r.text.length} octets${r.ok ? '' : ' — ' + r.text.slice(0, 160).replace(/\s+/g, ' ')}`);
    if (r.ok && !list) { list = r.text; base = b; }
  }
  if (list) {
    const rows = list.trim().split('\n'); const sep = rows[0].includes(';') ? ';' : ',';
    const head = rows[0].split(sep).map((x) => x.trim().toLowerCase().replace(/"/g, ''));
    console.log('  colonnes : ' + head.join(' | ') + ` ; ${rows.length - 1} stations`);
    const iId = head.findIndex((h) => h.includes('id')), iNom = head.findIndex((h) => h.includes('nom')), iLat = head.findIndex((h) => h.startsWith('lat')), iLon = head.findIndex((h) => h.startsWith('lon'));
    for (const line of rows.slice(1)) { const c = line.split(sep).map((x) => x.replace(/"/g, '').trim()); const lat = Number(c[iLat]), lon = Number(c[iLon]); if (Number.isFinite(lat)) all.push({ src: 'meteo-france', id: c[iId], name: c[iNom], lat, lon }); }
    const tried = new Set<string>();
    for (const s of spots) {
      const near = all.filter((x) => x.src === 'meteo-france').map((x) => ({ x, d: km(s.lat, s.lon, x.lat, x.lon) })).filter((y) => y.d <= MAX_KM).sort((a, b) => a.d - b.d).slice(0, 4);
      for (const { x } of near) { if (tried.has(x.id)) continue; tried.add(x.id); await new Promise((ok) => setTimeout(ok, 1500));
        const path = base.includes('Paquet') ? `/paquet/infrahoraire-6m?id_station=${x.id}&format=json` : `/station/infrahoraire-6m?id_station=${x.id}&format=json`;
        const q = await get(base + path, H);
        let note = `HTTP ${q.status}`;
        if (q.ok) { try { const a = JSON.parse(q.text); const arr = Array.isArray(a) ? a : [a]; const last = arr.reduce((m: any, o: any) => (!m || Date.parse(o.validity_time) > Date.parse(m.validity_time) ? o : m), null);
            if (tried.size === 1) console.log('  champs : ' + Object.keys(last ?? {}).join(', '));
            const n = arr.filter((o: any) => o.ff != null).length; const t = Date.parse(last?.validity_time ?? '');
            x.ageMin = Number.isFinite(t) ? Math.round((now - t) / 60000) : null;
            note = `${arr.length} lignes sur 24 h, ${n} avec vent ; rafales ${last?.fxi10 != null || last?.fxi != null ? 'oui' : 'non'}, direction ${last?.dd != null ? 'oui' : 'non'}`; } catch { note = 'réponse illisible : ' + q.text.slice(0, 80); } }
        else note += ' — ' + q.text.slice(0, 120).replace(/\s+/g, ' ');
        x.note = note; }
    }
  }
}

console.log(`\nBalises publiques à moins de ${MAX_KM} km de chaque spot (distance, âge de la dernière mesure) :`);
for (const s of spots) {
  const near = all.map((x) => ({ x, d: km(s.lat, s.lon, x.lat, x.lon) })).filter((y) => y.d <= MAX_KM).sort((a, b) => a.d - b.d).slice(0, 8);
  console.log(`\n${s.name}`);
  if (!near.length) console.log('  aucune');
  for (const { x, d } of near) console.log(`  ${d.toFixed(1).padStart(5)} km  ${x.src.padEnd(12)} ${x.id.padEnd(10)} ${x.name}${x.ageMin != null ? ` · dernière mesure il y a ${x.ageMin} min` : ''}${x.note ? ` · ${x.note}` : ''}`);
}
