// RELEVÉS EN SOURCES LIBRES (D-67) — balises de vent publiques près des spots, en parallèle du lien Winds-Up.
// Sources : OpenWindMap / Pioupiou (sans clé ; données ouvertes « attribution + partage à l'identique »),
// Météo-France API Observations 6 min (clé METEOFRANCE_KEY, Licence Ouverte), FFVL (clé FFVL_KEY, format à valider).
// Les balises retenues pour un spot sont listées à la main dans le registre (`openStations`) : une balise n'est gardée que
// si elle représente le spot (distance, exposition). Unités publiées : nœuds, degrés, heure de mesure (ms).
// Aucune donnée Winds-Up ici.
import type { Registry } from '../../src/types/contracts.ts';

export const KMH_TO_KN = 1 / 1.852, MS_TO_KN = 1.94384;
export const KEEP_H = 24;            // relevés fins gardés
export const KEEP_DAYS = 120;        // bilan par jour gardé (comparaison avec Winds-Up sur plusieurs semaines)
export const MAX_AGE_MIN = 90;       // une mesure plus vieille n'est pas « en direct »
export const DAY_HOURS: [number, number] = [8, 19];   // = historique.gs (HISTO_HEURES)
export const SEUIL_KN = 15;                           // = historique.gs (HISTO_SEUIL_ND)

export type Src = 'pioupiou' | 'meteo-france' | 'ffvl';
export type OpenStation = { src: Src; id: string; name?: string };
/** Un relevé : [heure, vent moyen nd, rafale nd | null, direction ° | null] */
export type Pt = [number, number, number | null, number | null];
export type StationOut = { src: Src; id: string; name: string; lat: number | null; lon: number | null; km: number | null; pts: Pt[]; status: string };
/** Bilan par jour, même format que l'historique Winds-Up : [jour AAAA-MM-JJ, moyenne horaire max, heures à 15 nd ou plus] */
export type Day = [string, number, number];
export type Releves = {
  version: 1; generatedAt: number;
  sources: Record<Src, { ok: boolean; message: string; licence: string; attribution: string; url: string }>;
  spots: Record<string, StationOut[]>;
  days: Record<string, Day[]>;          // clé : src:id
};

export const LICENCE: Record<Src, { licence: string; attribution: string; url: string }> = {
  pioupiou: { licence: 'données ouvertes, attribution + partage à l’identique', attribution: 'OpenWindMap / Pioupiou', url: 'https://www.openwindmap.org' },
  'meteo-france': { licence: 'Licence Ouverte Etalab 2.0', attribution: 'Météo-France', url: 'https://portail-api.meteofrance.fr' },
  ffvl: { licence: 'à confirmer avec la FFVL', attribution: 'FFVL – balisemeteo.com', url: 'https://www.balisemeteo.com' },
};

const r1 = (x: number) => Math.round(x * 10) / 10;
const num = (x: unknown) => (typeof x === 'number' && Number.isFinite(x) ? x : typeof x === 'string' && x.trim() !== '' && Number.isFinite(Number(x)) ? Number(x) : null);
export const km = (a: number, b: number, c: number, d: number) => { const r = Math.PI / 180, x = Math.sin(((c - a) * r) / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(((d - b) * r) / 2) ** 2; return 2 * 6371 * Math.asin(Math.sqrt(x)); };

/** Pioupiou /v1/live/all : vitesses en km/h, cap en degrés. */
export function parsePioupiou(json: any, ids: string[]): Record<string, { name: string; lat: number | null; lon: number | null; pt: Pt | null; state: string }> {
  const out: Record<string, { name: string; lat: number | null; lon: number | null; pt: Pt | null; state: string }> = {};
  for (const s of json?.data ?? []) {
    const id = String(s.id); if (!ids.includes(id)) continue;
    const t = Date.parse(s.measurements?.date ?? ''), avg = num(s.measurements?.wind_speed_avg), max = num(s.measurements?.wind_speed_max), dir = num(s.measurements?.wind_heading);
    const ok = Number.isFinite(t) && avg !== null && avg >= 0 && avg < 250;
    out[id] = { name: String(s.meta?.name ?? id), lat: num(s.location?.latitude), lon: num(s.location?.longitude), state: String(s.status?.state ?? '?'),
      pt: ok ? [t, r1(avg! * KMH_TO_KN), max === null ? null : r1(max * KMH_TO_KN), dir === null ? null : Math.round(dir) % 360] : null };
  }
  return out;
}

/** Météo-France DPObs station/infrahoraire-6m (format json) : ff et fxi10 en m/s, dd en degrés, validity_time ISO.
 *  Format lu sur l'exemple de la documentation ; à valider sur une vraie réponse dès que la clé est en place. */
export function parseMeteoFrance(json: any): { lat: number | null; lon: number | null; pts: Pt[] } {
  const rows: any[] = Array.isArray(json) ? json : json ? [json] : [];
  let lat: number | null = null, lon: number | null = null;
  const pts: Pt[] = [];
  for (const o of rows) {
    lat ??= num(o.lat); lon ??= num(o.lon);
    const t = Date.parse(o.validity_time ?? ''), ff = num(o.ff), fx = num(o.fxi10 ?? o.fxi), dd = num(o.dd);
    if (Number.isFinite(t) && ff !== null && ff >= 0 && ff < 80) pts.push([t, r1(ff * MS_TO_KN), fx === null ? null : r1(fx * MS_TO_KN), dd === null ? null : Math.round(dd) % 360]);
  }
  return { lat, lon, pts };
}

/** Ajoute les nouveaux relevés, sans doublon, et ne garde que les 24 dernières heures. */
export function mergePts(prev: Pt[], add: Pt[], now: number): Pt[] {
  const m = new Map<number, Pt>(); for (const p of [...prev, ...add]) if (p[0] <= now + 10 * 60e3) m.set(p[0], p);
  return [...m.values()].filter((p) => p[0] >= now - KEEP_H * 3600e3).sort((a, b) => a[0] - b[0]);
}

const fDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' });
const fHour = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: 'numeric' });
const hourParis = (t: number) => Number(fHour.format(t).replace(/\D/g, ''));
/** Moyennes horaires (heure ronde ± 30 min, comme l'historique Winds-Up). */
export function hourly(pts: Pt[]): { t: number; v: number; g: number | null; n: number }[] {
  const H = 3600e3, g = new Map<number, Pt[]>();
  for (const p of pts) { const h = Math.round(p[0] / H) * H; (g.get(h) ?? g.set(h, []).get(h)!).push(p); }
  return [...g.entries()].sort((a, b) => a[0] - b[0]).map(([t, a]) => ({ t, v: r1(a.reduce((s, p) => s + p[1], 0) / a.length), g: a.some((p) => p[2] !== null) ? Math.max(...a.map((p) => p[2] ?? 0)) : null, n: a.length }));
}
/** Bilan du jour (heure de Paris), même règle que historique.gs : heures de jour 8 → 19 h, seuil 15 nd. */
export function updateDays(prev: Day[], pts: Pt[], now: number): Day[] {
  const by = new Map<string, Day>(prev.map((d) => [d[0], d]));
  const hs = hourly(pts).filter((h) => { const k = hourParis(h.t); return k >= DAY_HOURS[0] && k <= DAY_HOURS[1]; });
  const days = new Map<string, number[]>();
  for (const h of hs) { const d = fDay.format(h.t); (days.get(d) ?? days.set(d, []).get(d)!).push(h.v); }
  for (const [d, vs] of days) {
    const old = by.get(d);
    // les 24 h glissantes ne couvrent pas toujours toute la journée : on garde le meilleur des deux bilans
    by.set(d, [d, Math.max(old?.[1] ?? 0, ...vs), Math.max(old?.[2] ?? 0, vs.filter((v) => v >= SEUIL_KN).length)]);
  }
  const cut = fDay.format(now - KEEP_DAYS * 86400e3);
  return [...by.values()].filter((d) => d[0] >= cut).sort((a, b) => a[0].localeCompare(b[0]));
}

type Fetch = (url: string, headers?: Record<string, string>) => Promise<{ ok: boolean; status: number; json: () => Promise<any> }>;
const defaultFetch: Fetch = (u, h) => fetch(u, { headers: { 'User-Agent': 'OCEAN (prévisions sports nautiques, usage non commercial ; github.com/tomaware/ocean)', ...h } });

/** Collecte complète : lit les sources, fusionne avec la publication précédente. Une source en panne garde ses anciens relevés. */
export async function collectReleves(reg: Registry, prev: Releves | null, now: number, env: { METEOFRANCE_KEY?: string; FFVL_KEY?: string }, f: Fetch = defaultFetch): Promise<Releves> {
  const wanted: { spot: string; lat: number; lon: number; st: OpenStation }[] = [];
  for (const s of reg.spots) for (const st of ((s as any).openStations ?? []) as OpenStation[]) { const g = s.geometry as { lat: number; lon: number }; wanted.push({ spot: s.id, lat: g.lat, lon: g.lon, st }); }
  const key = (st: OpenStation) => st.src + ':' + st.id;
  const old = new Map<string, StationOut>(); for (const arr of Object.values(prev?.spots ?? {})) for (const x of arr) old.set(key(x), x);
  const got = new Map<string, { name?: string; lat: number | null; lon: number | null; pts: Pt[]; status: string }>();
  const sources = {} as Releves['sources'];
  const mark = (src: Src, ok: boolean, message: string) => { sources[src] = { ok, message, ...LICENCE[src] }; };

  // Pioupiou : un seul appel pour toutes les balises
  const pp = wanted.filter((w) => w.st.src === 'pioupiou').map((w) => w.st.id);
  if (pp.length) {
    try {
      const r = await f('https://api.pioupiou.fr/v1/live/all');
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const p = parsePioupiou(await r.json(), pp);
      for (const id of pp) { const x = p[id]; got.set('pioupiou:' + id, x ? { name: x.name, lat: x.lat, lon: x.lon, pts: x.pt ? [x.pt] : [], status: x.pt ? `ok (${x.state})` : 'pas de mesure' } : { lat: null, lon: null, pts: [], status: 'balise absente du réseau' }); }
      mark('pioupiou', true, `${Object.values(p).filter((x) => x.pt).length}/${pp.length} balise(s) avec mesure`);
    } catch (e) { mark('pioupiou', false, String((e as Error).message ?? e)); }
  } else mark('pioupiou', true, 'aucune balise retenue');

  // Météo-France : un appel par station (dernière mesure 6 min)
  const mf = wanted.filter((w) => w.st.src === 'meteo-france').map((w) => w.st.id);
  if (!env.METEOFRANCE_KEY) mark('meteo-france', false, 'clé METEOFRANCE_KEY absente');
  else if (!mf.length) mark('meteo-france', true, 'aucune station retenue');
  else {
    let n = 0, err = '';
    for (const id of [...new Set(mf)]) {
      try {
        const r = await f(`https://public-api.meteofrance.fr/public/DPObs/v1/station/infrahoraire-6m?id_station=${id}&format=json`, { apikey: env.METEOFRANCE_KEY, accept: '*/*' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const x = parseMeteoFrance(await r.json()); got.set('meteo-france:' + id, { ...x, status: x.pts.length ? 'ok' : 'pas de vent mesuré' }); if (x.pts.length) n++;
      } catch (e) { err = String((e as Error).message ?? e); got.set('meteo-france:' + id, { lat: null, lon: null, pts: [], status: err }); }
    }
    mark('meteo-france', n > 0, `${n}/${new Set(mf).size} station(s) avec mesure${err ? ' ; dernière erreur : ' + err : ''}`);
  }

  // FFVL : clé demandée le 14/11 ; lecture branchée dès qu'on connaît le format de leur réponse
  mark('ffvl', false, env.FFVL_KEY ? 'clé présente : format des relevés FFVL à brancher' : 'clé FFVL_KEY absente (demandée)');

  const spots: Releves['spots'] = {}, days: Releves['days'] = { ...(prev?.days ?? {}) };
  for (const w of wanted) {
    const k = key(w.st), o = old.get(k), g = got.get(k);
    const lat = g?.lat ?? o?.lat ?? null, lon = g?.lon ?? o?.lon ?? null;
    const pts = mergePts(o?.pts ?? [], g?.pts ?? [], now);
    (spots[w.spot] ??= []).push({ src: w.st.src, id: w.st.id, name: g?.name ?? o?.name ?? w.st.name ?? w.st.id, lat, lon, km: lat !== null && lon !== null ? r1(km(w.lat, w.lon, lat, lon)) : null, pts, status: g?.status ?? (sources[w.st.src].ok ? 'non lue' : sources[w.st.src].message) });
    days[k] = updateDays(days[k] ?? [], pts, now);
  }
  return { version: 1, generatedAt: now, sources, spots, days };
}
