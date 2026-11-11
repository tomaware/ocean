// ⑤ PUBLICATION — données publiques lues par l'interface (data/v1/public/), après collecte, analyse et vérification.
// Rien de privé : contrôle de confidentialité bloquant sur l'ensemble des fichiers publiés.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import type { Check } from '../../src/types/contracts.ts';
import { loadRegistry } from '../collect/points.ts';
import { WIND_GRID } from '../collect/openmeteo.ts';
import { privacyEngines } from '../engines/run.ts';
import type { CollectBundle, ForecastBlock, Registry } from '../../src/types/contracts.ts';
import { allSessions, bestByDiscipline, ALL_LEVELS, publicSpots } from './sessions.ts';
import { widgetSurf, widgetWind } from './widgets.ts';

const ROOT = new URL('../../', import.meta.url);
const OUT = new URL('data/v1/public/', ROOT);
const read = (p: string) => JSON.parse(readFileSync(new URL(p, ROOT), 'utf8'));
const opt = (p: string) => (existsSync(new URL(p, ROOT)) ? read(p) : null);

export function publicPrivacy(files: Record<string, string>, live: any, secrets: string[], legacyWindIds: string[], publicTimes: ReadonlySet<number> = new Set()): Check {
  const all = Object.values(files).join('\n');
  const base = privacyEngines(all, live, secrets, publicTimes);
  const extra: string[] = [];
  if (/"live"\s*:\s*\{/.test(all)) extra.push('bloc « live »');
  if (/windsUp/i.test(all)) extra.push('identifiant Winds-Up');
  for (const id of legacyWindIds) if (all.includes(id)) extra.push('identifiant de balise ' + id);
  const ok = base.ok && extra.length === 0;
  return { id: 'confidentialite-publication', ok, detail: ok ? `${Object.keys(files).length} fichiers publiés vérifiés : aucun relevé Winds-Up, aucune clé, aucun identifiant de balise${/ignoré/.test(base.detail) ? ` (${base.detail.split(' ; ')[1]})` : ''}` : 'FUITE : ' + [base.ok ? '' : base.detail, ...extra].filter(Boolean).join(', ') };
}

/** Météo des spots (air, pluie, nuages, code temps) et vent des 7 modèles aux spots wing : affichage seulement. */
export function meteoPublic(bundle: CollectBundle | null, now: number) {
  if (!bundle) return { generatedAt: now, available: false };
  const fc = (id: string) => bundle.forecasts.find((f) => f.id === id) as ForecastBlock | undefined;
  const cut = (b: ForecastBlock, hours: number) => b.times.map((t, i) => [t, i] as const).filter(([t]) => t >= now - 3 * 3600e3 && t <= now + hours * 3600e3);
  const r = (x: number | null | undefined, k = 1) => (x === null || x === undefined ? null : Math.round(x * k) / k);
  const m = fc('open-meteo-meteo');
  const out: Record<string, unknown> = { generatedAt: now, available: !!m };
  if (m) {
    const idx = cut(m, 7 * 24);
    out.times = idx.map(([t]) => t);
    out.provenance = { source: 'open-meteo (best_match)', fetchedAt: m.provenance.fetchedAt, kind: 'forecast' };
    out.spots = Object.fromEntries(Object.entries(m.values).map(([pid, byM]) => {
      const v = byM.best_match ?? Object.values(byM)[0] ?? {};
      return [pid.replace(/^meteo_/, ''), { temp: idx.map(([, i]) => r(v.temperature_2m?.[i])), rain: idx.map(([, i]) => r(v.precipitation?.[i], 10)), cloud: idx.map(([, i]) => r(v.cloud_cover?.[i])), code: idx.map(([, i]) => r(v.weather_code?.[i])) }];
    }));
  }
  const w = fc('open-meteo-vent-spots');
  if (w) {
    const idx = cut(w, 3 * 24);
    const kn = (x: number | null | undefined) => (x === null || x === undefined ? null : Math.round(x * 1.94384));
    out.windModels = { times: idx.map(([t]) => t), provenance: { source: 'open-meteo', fetchedAt: w.provenance.fetchedAt, kind: 'forecast', note: 'modèles bruts, avant correction' },
      spots: Object.fromEntries(Object.entries(w.values).filter(([pid]) => pid.startsWith('spot_')).map(([pid, byM]) => [pid.slice(5),
        Object.fromEntries(Object.entries(byM).map(([model, v]) => [model, { kn: idx.map(([, i]) => kn(v.wind_speed_10m?.[i])), gust: idx.map(([, i]) => kn(v.wind_gusts_10m?.[i])), dir: idx.map(([, i]) => r(v.wind_direction_10m?.[i])) }]))])) };
  }
  return out;
}

/** Grille de vent pour la carte : nœuds et direction (entiers), heure par heure sur 5 jours. Affichage seul (D-24). */
export function windGridPublic(bundle: CollectBundle | null, now: number) {
  const b = bundle?.forecasts.find((f) => f.id === 'open-meteo-vent-carte');
  if (!b) return { available: false };
  const idx = b.times.map((t, i) => [t, i] as const).filter(([t]) => t >= now - 3 * 3600e3);
  const g = WIND_GRID, pts: string[] = [];
  for (let i = 0; i < g.nLat; i++) for (let j = 0; j < g.nLon; j++) pts.push(`grid_${i}_${j}`);
  const col = (pid: string, v: string) => b.values[pid]?.[g.model]?.[v] ?? [];
  return {
    available: true, lat0: g.lat0, lon0: g.lon0, dLat: g.dLat, dLon: g.dLon, nLat: g.nLat, nLon: g.nLon,
    provenance: { source: 'open-meteo', model: g.model, kind: 'forecast', fetchedAt: b.provenance.fetchedAt, note: 'modèle Météo-France brut (AROME puis ARPEGE), non corrigé ; affichage de la carte seulement' },
    times: idx.map(([t]) => t),
    kn: idx.map(([, i]) => pts.map((p) => { const x = col(p, 'wind_speed_10m')[i]; return x == null ? null : Math.round(x * 1.94384); })),
    dir: idx.map(([, i]) => pts.map((p) => { const x = col(p, 'wind_direction_10m')[i]; return x == null ? null : Math.round(x); })),
  };
}

/**
 * Mesure publique « en direct » des spots sans balise Winds-Up (étang de Berre : METAR de Marignane, à ~3 km du Jaï).
 * Données METAR (NOAA, domaine public) : publiables. Dernière mesure de moins de 3 h, vent en nœuds.
 */
export function liveObsPublic(bundle: CollectBundle | null, registry: Registry, now: number) {
  const metar = bundle?.observations.find((o) => o.id === 'metar');
  const out: Record<string, { t: number; kn: number | null; gust: number | null; dir: number | null; station: string; source: string }> = {};
  if (!metar) return out;
  for (const s of registry.spots) {
    const st = (s.windSource as { station?: string } | undefined)?.station;
    const o = st ? metar.stations[st] : undefined;
    if (!st || !o) continue;
    const k = o.t.map((t, i) => i).filter((i) => o.t[i] <= now && o.wind_speed_10m[i] !== null).pop();
    if (k === undefined || now - o.t[k] > 3 * 3600e3) continue;
    const kn = (x: number | null | undefined) => (x === null || x === undefined ? null : Math.round(x * 1.94384));
    const name = registry.stations.find((x) => x.icao === st)?.name ?? st;
    out[s.id] = { t: o.t[k], kn: kn(o.wind_speed_10m[k]), gust: kn(o.wind_gusts_10m?.[k]), dir: o.wind_direction_10m?.[k] ?? null, station: st, source: `METAR ${name} (${st}), mesure publique` };
  }
  return out;
}

function main(): void {
  const registry = loadRegistry();
  const collect = read('data/v1/collect/status.json'), engines = read('data/v1/engines/status.json'), verify = opt('data/v1/verify/scores.json');
  const surf = read('data/v1/engines/surf.json'), downwind = read('data/v1/engines/downwind.json'), wing = read('data/v1/engines/wing.json');
  const now = collect.generatedAt as number;
  const sessions = allSessions({ wing, surf, downwind }, now);
  const best = Object.fromEntries(ALL_LEVELS.map((L) => [L, bestByDiscipline(sessions, L)]));
  const checks: Check[] = [...collect.checks, ...engines.checks, ...(verify?.checks ?? [])];
  const meta = {
    generatedAt: now, version: 1,
    sources: collect.status.map((s: any) => ({ id: s.id, ok: s.ok, message: s.ok ? 'ok' : s.message, points: s.points, models: s.models, lastObservationAgeMin: s.lastObservationAgeMin ?? null })),
    checks: checks.map((c) => ({ id: c.id, ok: c.ok, detail: c.detail })),
    disciplines: {
      wing: { available: !!wing.available, source: 'Vent corrigé de la super prévision (modèles pondérés par leur erreur aux balises)', note: 'Note wing v' + wing.version },
      surf: { available: true, source: surf.sources?.copernicus ? 'Moteur Super Prévi Surf : 6 modèles de vagues dont Copernicus Med-WAV (4,2 km), recalés sur les bouées Candhis ; vent AROME / ECMWF' : 'Moteur Super Prévi Surf : 5 modèles de vagues recalés sur les bouées Candhis, vent AROME / ECMWF (Copernicus indisponible pour cette mise à jour)', note: surf.sources?.copernicus ? 'Generated using E.U. Copernicus Marine Service Information' : 'Copernicus absent ou trop ancien' },
      downwind: { available: true, source: 'Moteur downwind : vent AROME / ECMWF recalé sur la super prévision, houle au large (5 modèles)', note: '' },
    },
    rules: { session: 'au moins 2 h d’affilée à 5/10 ou plus, de jour', envoie: 'wing : au moins 4 h à plus de 20 nd dans la session', sessionsRadiusKm: 55, home: 'Montpellier' },
  };
  const files: Record<string, string> = {
    'meta.json': JSON.stringify(meta),
    'spots.json': JSON.stringify(publicSpots(registry)),
    'sessions.json': JSON.stringify({ generatedAt: now, sessions, best }),
    'wing.json': JSON.stringify(wing),
    'surf.json': JSON.stringify(surf),
    'downwind.json': JSON.stringify(downwind),
    'verify.json': JSON.stringify(verify ?? { generatedAt: now, unavailable: true }),
    'wind-grid.json': JSON.stringify(windGridPublic(opt('data/v1/collect/bundle.json') as CollectBundle | null, now)),
    'meteo.json': JSON.stringify({ ...meteoPublic(opt('data/v1/collect/bundle.json') as CollectBundle | null, now), obs: liveObsPublic(opt('data/v1/collect/bundle.json') as CollectBundle | null, registry, now) }),
    'widget-wind.json': JSON.stringify(widgetWind(wing, liveObsPublic(opt('data/v1/collect/bundle.json') as CollectBundle | null, registry, now), now)),
    'widget-surf.json': JSON.stringify(widgetSurf(surf, sessions, now)),
  };
  const live = opt('data/private/super-prevision-live.json');
  const legacyIds = registry.spots.map((s) => s.legacy.superPrevisionVent).filter(Boolean) as string[];
  // heures des METAR (NOAA, publiques) : un relevé Winds-Up à la même minute n'est pas une fuite
  const bundle = opt('data/v1/collect/bundle.json') as CollectBundle | null;
  const metarTimes = new Set(Object.values(bundle?.observations.find((o) => o.id === 'metar')?.stations ?? {}).flatMap((st: any) => st.t as number[]));
  const priv = publicPrivacy(files, live, [(process.env.SUPER_PREVISION_URL ?? '').trim()], legacyIds, metarTimes);
  console.log(`[publication] ${priv.ok ? 'OK ' : 'KO '} ${priv.id} : ${priv.detail}`);
  if (!priv.ok) process.exit(2);
  mkdirSync(OUT, { recursive: true });
  let total = 0;
  for (const [k, v] of Object.entries(files)) { writeFileSync(new URL(k, OUT), v); total += v.length; }
  const n = (d: string) => sessions.filter((s) => s.discipline === d).length;
  console.log(`[publication] ${Object.keys(files).length} fichiers, ${(total / 1e6).toFixed(2)} Mo ; sessions : wing ${n('wing')}, surf ${n('surf')}, downwind ${n('downwind')}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
