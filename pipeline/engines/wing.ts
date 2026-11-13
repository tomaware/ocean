// Notes WING et KITE (même formule, plages de vent différentes), wing validée par Tom le 10/11 (D-14), kite le 13/11 (D-51) :
//   note = 10 × V(vent, niveau) × R(rafales / moyenne) × D(angle vent / plage, niveau), 0 la nuit.
// Plages de vent recalées sur des guides wing (docs/product/WING_SCORE.md). Toute modification = décision + test golden.
import type { ForecastBlock, Registry, Spot } from '../../src/types/contracts.ts';
import { SurfEngine as E } from '../collect/points.ts';

export const WING_VERSION = '2.3.0';
export const KITE_VERSION = '1.0.0';
// 1.1 (10/11, D-18, Tom) : « trop de vent » seulement au-delà de 35 nd.
// 2.0 (10/11, D-19, Tom) : deux modes au lieu de trois niveaux : « Sécu first » (aucun vent de terre ni side-off)
//     et « Offshore » (side-off et vent de terre acceptés, toujours signalés en commentaire).
// 2.1 (13/11, D-49, Tom) : « 30 nd en wing c'est 0 » — la force compte à 100 % jusqu'à 28 nd, puis baisse en ligne
//     droite jusqu'à 0 à 30 nd. Au-delà de 28 nd (même vent que la note), l'heure est une « Kite session » :
//     1 étoile rouge à l'affichage, et elle ne compte plus dans les créneaux wing.
// 2.2 (13/11, D-50, Tom) : « dès 13 nd tu peux partir » — note pleine dès 13 nd (monte de 10 à 13 nd), même seuil
//     en Sécu first et en Offshore (avant : 12 → 15 nd et 11 → 14 nd).
// 2.3 (13/11, D-60, Tom : « très optimiste, 11 nd rafales 15 devrait donner genre 4 ») : en wing, le bas de la force se
//     lit sur le VENT MOYEN seul (les rafales ne font plus monter la note, elles ne font que la baisser via R) et monte
//     de 9 à 13 nd. Le haut (28 → 30 nd) et la « Kite session » restent sur le vent de la note (D-49).
// KITE 1.0 (13/11, D-51, Tom) : même formule, vent 15 → 20 nd, plein de 20 à 35 nd, 0 à 40 nd ; mêmes modes
//     Sécu first / Offshore et mêmes facteurs rafales et direction qu'en wing. Pas de « Kite session » en kite.
export const MS_TO_KN = 1.94384;
export type WingLevel = 'secu' | 'offshore';
export const WING_LEVELS: WingLevel[] = ['secu', 'offshore'];
export type Sport = 'wing' | 'kite';

/** Vent (nœuds) : 0 sous `min`, monte jusqu'à `lo`, 1 jusqu'à `hi` (28 nd), baisse jusqu'à 0 à `max` (30 nd). */
export const WIND: Record<WingLevel, { min: number; lo: number; hi: number; max: number }> = {
  secu: { min: 9, lo: 13, hi: 28, max: 30 },
  offshore: { min: 9, lo: 13, hi: 28, max: 30 },
};
/** Kite (D-51) : 0 jusqu'à 15 nd, monte jusqu'à 20 nd, 1 jusqu'à 35 nd, baisse jusqu'à 0 à 40 nd. */
export const KITE_WIND: Record<WingLevel, { min: number; lo: number; hi: number; max: number }> = {
  secu: { min: 15, lo: 20, hi: 35, max: 40 },
  offshore: { min: 15, lo: 20, hi: 35, max: 40 },
};
export const WIND_OF: Record<Sport, typeof WIND> = { wing: WIND, kite: KITE_WIND };
/** Au-delà (vent de la note, rafales comprises), l'heure est une « Kite session » (D-49). */
export const KITE_KN = 28;
export const KITE_LABEL = 'Kite session (plus de 28 nd)';
/** Direction : facteur par secteur (angle entre le vent et la direction du large). */
export const SECTORS = [
  { id: 'onshore', label: 'vent de mer (face à la plage)', upTo: 30, f: { secu: 0.8, offshore: 0.8 } },
  { id: 'side-on', label: 'side-on', upTo: 70, f: { secu: 1, offshore: 1 } },
  { id: 'side', label: 'side-shore', upTo: 100, f: { secu: 1, offshore: 1 } },
  { id: 'side-off', label: 'side-off (dérive vers le large)', upTo: 135, f: { secu: 0, offshore: 1 } },
  { id: 'offshore', label: 'vent de terre : dérive au large', upTo: 180, f: { secu: 0, offshore: 1 } },
] as const;
export const AVOID_FACTOR = 0.6;       // plan d'eau fermé, secteur déconseillé
export const DAYLIGHT_ELEVATION = -2;  // comme le moteur downwind
export const SESSION_MIN_H = 2;        // = SESSION_HEURES de la super prévision
export const SESSION_SCORE = 5;

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const lerp = (x: number, x0: number, x1: number, y0: number, y1: number) => y0 + (y1 - y0) * clamp01((x - x0) / (x1 - x0));

export function windFactor(kn: number, L: WingLevel, sport: Sport = 'wing'): number {
  const w = WIND_OF[sport][L];
  if (kn <= w.min || kn > w.max) return 0;   // au-delà de max (wing 30 nd, kite 40 nd) : 0
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
  const { s, a } = sectorOf(windFrom, o.seaward);
  // spot à deux plages (Hyères, D-58) : on prend le côté le mieux orienté pour le vent du moment
  if (o.seawardAlt != null) {
    const b = sectorOf(windFrom, o.seawardAlt);
    if (b.s.f[L] > s.f[L] || (b.s.f[L] === s.f[L] && b.a < a)) return { f: b.s.f[L], sector: b.s.id, label: `${b.s.label} (${o.altName ?? 'autre côté'})` };
  }
  return { f: s.f[L], sector: s.id, label: s.label };
}

export type WingHour = { t: number; kn: number | null; gust: number | null; dir: number | null; conf: number | null; day: boolean; sector: string | null; kite: boolean;
  scores: Record<WingLevel, number | null>; limit: Record<WingLevel, string | null>; f: Record<WingLevel, WingFactors | null> };

/** Une heure, un niveau. Renvoie la note et le facteur qui la limite le plus (pour l'expliquer). */
/** Facteurs publiés pour expliquer la note : [force V, régularité R, direction D], arrondis au centième (affichage seulement). */
export type WingFactors = [number, number, number];
const r2 = (x: number) => Math.round(x * 100) / 100;
/** Vent retenu par la note : la moyenne, ou la moyenne entre vent et rafales quand elles la dépassent de plus de 30 %. */
export function effWind(kn: number, gust: number | null): number {
  const g = gust !== null && kn > 0 ? gust / kn : 1;
  return g > 1.3 && gust !== null ? (kn + gust) / 2 : kn;
}
/** « Kite session » : de jour, plus de 28 nd sur le vent de la note (D-49). */
export const isKite = (kn: number, gust: number | null, day: boolean) => day && effWind(kn, gust) > KITE_KN;
export function scoreHour(kn: number, gust: number | null, dir: number | null, day: boolean, spot: Pick<Spot, 'orientation' | 'waterBody'>, L: WingLevel, sport: Sport = 'wing'): { score: number; limit: string | null; f: WingFactors; kite: boolean } {
  const g = gust !== null && kn > 0 ? gust / kn : 1;
  const eff = effWind(kn, gust);
  // wing (D-60) : montée sur le vent moyen, descente au-delà de 28 nd sur le vent de la note ; kite : vent de la note
  const low = sport === 'wing' ? kn : eff;
  const V = Math.min(windFactor(Math.min(low, WIND_OF[sport][L].lo), L, sport), windFactor(Math.max(eff, WIND_OF[sport][L].lo), L, sport)), R = gustFactor(g);
  const D = dir === null ? { f: 1, label: 'direction inconnue' } : dirFactor(dir, spot, L);
  const f: WingFactors = [r2(V), r2(R), r2(D.f)];
  if (!day) return { score: 0, limit: 'nuit', f, kite: false };
  const score = Math.round(10 * V * R * D.f * 10) / 10;
  const w = WIND_OF[sport][L];
  // à égalité, la direction passe en premier : « vent de terre » est plus important à lire que « trop de vent »
  const why = [
    [D.f, D.label],
    [V, low < w.lo ? 'pas assez de vent' : sport === 'kite' ? `trop de vent (plus de ${w.hi} nd)` : KITE_LABEL],
    [R, 'vent rafaleux'],
  ] as [number, string][];
  const worst = why.reduce((a, b) => (b[0] < a[0] ? b : a));
  // mode Offshore : le vent de terre ne baisse pas la note mais reste toujours signalé
  const risky = 'sector' in D && (D.sector === 'offshore' || D.sector === 'side-off') ? D.label : null;
  // Kite session : toujours dit en premier (c'est ce qui compte ce jour-là), avec la direction si elle pose aussi problème
  if (sport === 'wing' && eff > KITE_KN) return { score, limit: D.f < 1 || risky ? `${KITE_LABEL} · ${D.label}` : KITE_LABEL, f, kite: true };
  return { score, limit: worst[0] < 1 ? worst[1] : risky, f, kite: false };
}

export type WingWindow = { level: WingLevel; start: number; end: number; hours: number; mean: number; peak: number };

/** Créneaux « Session 2H » : au moins 2 h d'affilée à 5/10 ou plus, de jour, hors « Kite session » (D-49). */
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
    const ok = s !== null && s >= SESSION_SCORE && !h.kite;
    if (ok && (!run.length || h.t - run[run.length - 1].t === 3600e3)) run.push(h);
    else { flush(); if (ok) run.push(h); }
  }
  flush();
  return out;
}

export const label = (s: number | null) => (s === null ? '—' : s >= 7 ? 'Ça envoie' : s >= 5 ? 'Ça se tente' : 'Non');

/** Modèle de vent retenu pour un spot hors super prévision : le plus juste aux mesures METAR de la station (3 derniers jours). */
export const BEST_MODEL_FALLBACK = 'meteofrance_arome_france_hd';
/** Ordre de repli quand aucun classement n'existe, du plus fin au plus large. */
export const MODEL_ORDER = ['meteofrance_arome_france_hd', 'meteofrance_arome_france', 'icon_d2', 'icon_eu', 'ecmwf_ifs025', 'meteofrance_arpege_europe', 'gfs_seamless'];
export type ModelRanking = Record<string, Record<string, { n: number; mae: number }>>;   // station → modèle → erreur
export function bestModel(station: string, ranking: ModelRanking | undefined, available: string[]): { model: string; mae: number | null; n: number; ranked: boolean } {
  const r = Object.entries(ranking?.[station] ?? {}).filter(([m]) => available.includes(m)).sort((a, b) => a[1].mae - b[1].mae);
  if (r.length) return { model: r[0][0], mae: r[0][1].mae, n: r[0][1].n, ranked: true };
  return { model: available.includes(BEST_MODEL_FALLBACK) ? BEST_MODEL_FALLBACK : available[0], mae: null, n: 0, ranked: false };
}
/** Modèles dans l'ordre de préférence : classés (erreur croissante), puis les autres ; chaque heure prend le premier qui a une valeur. */
export function modelOrder(station: string, ranking: ModelRanking | undefined, available: string[]): string[] {
  const ranked = Object.entries(ranking?.[station] ?? {}).filter(([m]) => available.includes(m)).sort((a, b) => a[1].mae - b[1].mae).map(([m]) => m);
  const rest = [...MODEL_ORDER, ...available].filter((m, i, a) => available.includes(m) && !ranked.includes(m) && a.indexOf(m) === i);
  return [...ranked, ...rest];
}
type Series = { wind_speed_10m: (number | null)[]; wind_gusts_10m: (number | null)[]; wind_direction_10m: (number | null)[]; confidence?: (number | null)[] };

/**
 * Toutes les heures notées pour les spots wing du registre.
 * Vent : la super prévision (corrigée) ; pour un spot qu'elle ne couvre pas (`windSource.kind = 'best-model'`, ex. étang de Berre,
 * D-22), le modèle le plus juste aux mesures de la station METAR indiquée, non corrigé, avec sa provenance. Jamais de mélange.
 */
export function wingForecast(block: ForecastBlock | undefined, registry: Registry, now: number, alt?: { block: ForecastBlock | undefined; ranking?: ModelRanking }, sport: Sport = 'wing') {
  const version = sport === 'kite' ? KITE_VERSION : WING_VERSION;
  const all = registry.spots.filter((s) => s.disciplines.includes('wing'));
  // repli « meilleur modèle » seulement si la super prévision ne couvre pas (encore) ce spot (Le Jaï, D-22) : dès qu'elle le couvre, on la prend
  const inSuper = (s: Spot) => !!block?.values['spot_' + s.id]?.['super-prevision']?.wind_speed_10m?.some((x) => x !== null);
  const isAlt = (s: Spot) => (s.windSource as { kind?: string } | undefined)?.kind === 'best-model' && !inSuper(s);
  const spots = all.filter((s) => (isAlt(s) ? !!alt?.block : !!block));
  if (!spots.length) return { version, sport, generatedAt: now, available: false, reason: `super prévision absente : pas de note ${sport} (pas de repli sur un vent brut)`, spots: [] };
  const res = spots.map((s) => {
    let times: number[], v: Series | undefined, source: Record<string, unknown>;
    if (isAlt(s)) {
      const st = String((s.windSource as { station: string }).station);
      const vals = alt!.block!.values['spot_' + s.id] ?? {};
      const avail = Object.keys(vals).filter((m) => (vals[m]?.wind_speed_10m ?? []).some((x) => x !== null));
      const b = bestModel(st, alt!.ranking, avail);
      // relais : au-delà de l'horizon du meilleur modèle (AROME HD ~ 2 jours), le suivant du classement prend le relais
      const order = modelOrder(st, alt!.ranking, avail);
      times = alt!.block!.times;
      const pickM = times.map((_, i) => order.find((m) => vals[m]?.wind_speed_10m?.[i] != null) ?? null);
      const col = (k: keyof Series) => times.map((_, i) => (pickM[i] ? (vals[pickM[i]!] as unknown as Series)[k]?.[i] ?? null : null));
      v = { wind_speed_10m: col('wind_speed_10m'), wind_gusts_10m: col('wind_gusts_10m'), wind_direction_10m: col('wind_direction_10m') };
      const relays: { model: string; from: number }[] = [];
      pickM.forEach((m, i) => { if (m && times[i] >= now - 3 * 3600e3 && (!relays.length || relays[relays.length - 1].model !== m)) relays.push({ model: m, from: times[i] }); });
      source = { kind: 'forecast', source: 'open-meteo', model: b.model, station: st, mae: b.mae, n: b.n, ranked: b.ranked, relays, fetchedAt: alt!.block!.provenance.fetchedAt,
        note: (b.ranked ? `Vent prévu par ${b.model}, le modèle le plus juste aux mesures de ${st} sur les 3 derniers jours (erreur moyenne ${b.mae} m/s, ${b.n} mesures)`
          : `Vent prévu par ${b.model} (classement aux mesures de ${st} indisponible)`) + (relays.length > 1 ? `, puis ${relays.slice(1).map((r) => r.model).join(', ')} au-delà de son horizon` : '') + ' ; non corrigé par la super prévision.' };
    } else {
      times = block!.times; v = block!.values['spot_' + s.id]?.['super-prevision'] as unknown as Series | undefined;
      source = { kind: 'corrected', source: 'super-prevision', fetchedAt: block!.provenance.fetchedAt };
    }
    const geo = s.geometry as { lat: number; lon: number };
    const hours: WingHour[] = times.map((t, i) => {
      const ms = v?.wind_speed_10m[i] ?? null, gs = v?.wind_gusts_10m[i] ?? null, dir = v?.wind_direction_10m[i] ?? null;
      const day = E.solarElevation(t, geo.lat, geo.lon) > DAYLIGHT_ELEVATION;
      const kn = ms === null ? null : Math.round(ms * MS_TO_KN * 10) / 10, gust = gs === null ? null : Math.round(gs * MS_TO_KN * 10) / 10;
      const scores = {} as Record<WingLevel, number | null>, limit = {} as Record<WingLevel, string | null>, f = {} as Record<WingLevel, WingFactors | null>;
      for (const L of WING_LEVELS) {
        if (kn === null) { scores[L] = null; limit[L] = null; f[L] = null; continue; }
        const r = scoreHour(kn, gust, dir, day, s, L, sport); scores[L] = r.score; limit[L] = r.limit; f[L] = r.f;
      }
      const o = s.orientation;
      return { t, kn, gust, dir, conf: v?.confidence?.[i] ?? null, day, sector: dir === null || !o || o.seaward == null ? null : dirFactor(dir, s, 'secu').sector,
        kite: sport === 'wing' && kn !== null && isKite(kn, gust, day), scores, limit, f };
    }).filter((h) => h.kn !== null && h.t >= now - 3 * 3600e3);
    return {
      id: s.id, name: s.name, orientation: s.orientation, waterBody: s.waterBody, source, hours,
      sessions: Object.fromEntries(WING_LEVELS.map((L) => [L, sessions(hours, L)])) as Record<WingLevel, WingWindow[]>,
    };
  });
  return {
    version, sport, generatedAt: now, available: true,
    provenance: { source: 'super-prevision', kind: 'corrected', fetchedAt: block?.provenance.fetchedAt ?? null, note: 'Vent corrigé par la super prévision, converti en nœuds ; note calculée par OCEAN (formule ' + sport + ' v' + version + '). Spots hors super prévision : voir « source » de chaque spot.' },
    levels: WIND_OF[sport], kiteKn: sport === 'wing' ? KITE_KN : null, sectors: SECTORS.map((x) => ({ id: x.id, label: x.label, upTo: x.upTo, f: x.f })),
    spots: res,
  };
}
