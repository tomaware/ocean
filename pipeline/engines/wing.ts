// Note WING (wing foil seulement), formule validée par Tom le 10/11 (D-14) :
//   note = 10 × V(vent, niveau) × R(rafales / moyenne) × D(angle vent / plage, niveau), 0 la nuit.
// Plages de vent recalées sur des guides wing (docs/product/WING_SCORE.md). Toute modification = décision + test golden.
import type { ForecastBlock, Registry, Spot } from '../../src/types/contracts.ts';
import { SurfEngine as E } from '../collect/points.ts';

export const WING_VERSION = '1.1.0';   // 1.1 (10/11, D-18, Tom) : « trop de vent » seulement au-delà de 35 nd, tous niveaux
export const MS_TO_KN = 1.94384;
export type WingLevel = 'debutant' | 'intermediaire' | 'confirme';
export const WING_LEVELS: WingLevel[] = ['debutant', 'intermediaire', 'confirme'];

/** Vent (nœuds) : 0 sous `min`, 1 entre `lo` et `hi`, 0 à partir de `max`. */
export const WIND: Record<WingLevel, { min: number; lo: number; hi: number; max: number }> = {
  debutant: { min: 12, lo: 15, hi: 35, max: 35 },
  intermediaire: { min: 11, lo: 14, hi: 35, max: 35 },
  confirme: { min: 9, lo: 14, hi: 35, max: 35 },
};
/** Direction : facteur par secteur (angle entre le vent et la direction du large). */
export const SECTORS = [
  { id: 'onshore', label: 'vent de mer (face à la plage)', upTo: 30, f: { debutant: 0.7, intermediaire: 0.8, confirme: 0.8 } },
  { id: 'side-on', label: 'side-on', upTo: 70, f: { debutant: 1, intermediaire: 1, confirme: 1 } },
  { id: 'side', label: 'side-shore', upTo: 100, f: { debutant: 1, intermediaire: 1, confirme: 1 } },
  { id: 'side-off', label: 'side-off (dérive vers le large)', upTo: 135, f: { debutant: 0, intermediaire: 0.3, confirme: 0.6 } },
  { id: 'offshore', label: 'vent de terre : danger, dérive au large', upTo: 180, f: { debutant: 0, intermediaire: 0, confirme: 0 } },
] as const;
export const AVOID_FACTOR = 0.6;       // plan d'eau fermé, secteur déconseillé
export const DAYLIGHT_ELEVATION = -2;  // comme le moteur downwind
export const SESSION_MIN_H = 2;        // = SESSION_HEURES de la super prévision
export const SESSION_SCORE = 5;

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const lerp = (x: number, x0: number, x1: number, y0: number, y1: number) => y0 + (y1 - y0) * clamp01((x - x0) / (x1 - x0));

export function windFactor(kn: number, L: WingLevel): number {
  const w = WIND[L];
  if (kn <= w.min || kn > w.max) return 0;   // 35 nd encore OK, au-delà : trop de vent
  if (kn < w.lo) return (kn - w.min) / (w.lo - w.min);
  if (kn <= w.hi) return 1;
  return w.max > w.hi ? (w.max - kn) / (w.max - w.hi) : 0;
}
export function gustFactor(g: number): number {
  if (!(g > 1.3)) return 1;
  if (g <= 1.6) return lerp(g, 1.3, 1.6, 1, 0.6);
  if (g <= 1.9) return lerp(g, 1.6, 1.9, 0.6, 0.4);
  return 0.4;
}
const angDiff = (a: number, b: number) => { const d = Math.abs(((a - b) % 360 + 540) % 360 - 180); return d; };
export function sectorOf(windFrom: number, seaward: number) {
  const a = angDiff(windFrom, seaward);
  return { a, s: SECTORS.find((x) => a <= x.upTo) ?? SECTORS[SECTORS.length - 1] };
}
export function inSector(dir: number, [from, to]: [number, number]): boolean {
  return from <= to ? dir >= from && dir <= to : dir >= from || dir <= to;
}
export function dirFactor(windFrom: number, spot: Pick<Spot, 'orientation' | 'waterBody'>, L: WingLevel): { f: number; sector: string; label: string } {
  const o = spot.orientation;
  if (!o || o.seaward === null || o.seaward === undefined) {
    const bad = (o?.avoid ?? []).some((r) => inSector(windFrom, r));
    return bad ? { f: AVOID_FACTOR, sector: 'avoid', label: 'direction déconseillée sur ce plan d’eau' } : { f: 1, sector: 'closed', label: 'plan d’eau fermé' };
  }
  const { s } = sectorOf(windFrom, o.seaward);
  return { f: s.f[L], sector: s.id, label: s.label };
}

export type WingHour = { t: number; kn: number | null; gust: number | null; dir: number | null; conf: number | null; day: boolean; sector: string | null;
  scores: Record<WingLevel, number | null>; limit: Record<WingLevel, string | null> };

/** Une heure, un niveau. Renvoie la note et le facteur qui la limite le plus (pour l'expliquer). */
export function scoreHour(kn: number, gust: number | null, dir: number | null, day: boolean, spot: Pick<Spot, 'orientation' | 'waterBody'>, L: WingLevel) {
  if (!day) return { score: 0, limit: 'nuit' };
  const g = gust !== null && kn > 0 ? gust / kn : 1;
  const eff = g > 1.3 && gust !== null ? (kn + gust) / 2 : kn;
  const V = windFactor(eff, L), R = gustFactor(g);
  const D = dir === null ? { f: 1, label: 'direction inconnue' } : dirFactor(dir, spot, L);
  const score = Math.round(10 * V * R * D.f * 10) / 10;
  const w = WIND[L];
  // à égalité, la direction passe en premier : « vent de terre » est plus important à lire que « trop de vent »
  const why = [
    [D.f, D.label],
    [V, eff <= w.lo ? 'pas assez de vent' : 'trop de vent (plus de 35 nd)'],
    [R, 'vent rafaleux'],
  ] as [number, string][];
  const worst = why.reduce((a, b) => (b[0] < a[0] ? b : a));
  return { score, limit: worst[0] < 1 ? worst[1] : null };
}

export type WingWindow = { level: WingLevel; start: number; end: number; hours: number; mean: number; peak: number };

/** Créneaux « Session 2H » : au moins 2 h d'affilée à 5/10 ou plus, de jour. */
export function sessions(hours: WingHour[], L: WingLevel): WingWindow[] {
  const out: WingWindow[] = [];
  let run: WingHour[] = [];
  const flush = () => {
    if (run.length >= SESSION_MIN_H) {
      const sc = run.map((h) => h.scores[L] as number);
      out.push({ level: L, start: run[0].t, end: run[run.length - 1].t + 3600e3, hours: run.length, mean: Math.round(sc.reduce((a, b) => a + b, 0) / sc.length * 10) / 10, peak: Math.max(...sc) });
    }
    run = [];
  };
  for (const h of hours) {
    const s = h.scores[L];
    if (s !== null && s >= SESSION_SCORE && (!run.length || h.t - run[run.length - 1].t === 3600e3)) run.push(h);
    else { flush(); if (s !== null && s >= SESSION_SCORE) run.push(h); }
  }
  flush();
  return out;
}

export const label = (s: number | null) => (s === null ? '—' : s >= 7 ? 'Ça envoie' : s >= 5 ? 'Ça se tente' : 'Non');

/** Toutes les heures de la super prévision (vent corrigé), pour les spots wing du registre. */
export function wingForecast(block: ForecastBlock | undefined, registry: Registry, now: number) {
  const spots = registry.spots.filter((s) => s.disciplines.includes('wing'));
  if (!block) return { version: WING_VERSION, generatedAt: now, available: false, reason: 'super prévision absente : pas de note wing (pas de repli sur un vent brut)', spots: [] };
  const res = spots.map((s) => {
    const v = block.values['spot_' + s.id]?.['super-prevision'];
    const geo = s.geometry as { lat: number; lon: number };
    const hours: WingHour[] = block.times.map((t, i) => {
      const ms = v?.wind_speed_10m[i] ?? null, gs = v?.wind_gusts_10m[i] ?? null, dir = v?.wind_direction_10m[i] ?? null;
      const day = E.solarElevation(t, geo.lat, geo.lon) > DAYLIGHT_ELEVATION;
      const kn = ms === null ? null : Math.round(ms * MS_TO_KN * 10) / 10, gust = gs === null ? null : Math.round(gs * MS_TO_KN * 10) / 10;
      const scores = {} as Record<WingLevel, number | null>, limit = {} as Record<WingLevel, string | null>;
      for (const L of WING_LEVELS) {
        if (kn === null) { scores[L] = null; limit[L] = null; continue; }
        const r = scoreHour(kn, gust, dir, day, s, L); scores[L] = r.score; limit[L] = r.limit;
      }
      const o = s.orientation;
      return { t, kn, gust, dir, conf: v?.confidence?.[i] ?? null, day, sector: dir === null || !o || o.seaward == null ? null : sectorOf(dir, o.seaward).s.id, scores, limit };
    }).filter((h) => h.kn !== null && h.t >= now - 3 * 3600e3);
    return {
      id: s.id, name: s.name, orientation: s.orientation, waterBody: s.waterBody, hours,
      sessions: Object.fromEntries(WING_LEVELS.map((L) => [L, sessions(hours, L)])) as Record<WingLevel, WingWindow[]>,
    };
  });
  return {
    version: WING_VERSION, generatedAt: now, available: true,
    provenance: { source: 'super-prevision', kind: 'corrected', fetchedAt: block.provenance.fetchedAt, note: 'Vent corrigé par la super prévision, converti en nœuds ; note calculée par OCEAN (formule wing v' + WING_VERSION + ').' },
    levels: WIND, sectors: SECTORS.map((x) => ({ id: x.id, label: x.label, upTo: x.upTo, f: x.f })),
    spots: res,
  };
}
