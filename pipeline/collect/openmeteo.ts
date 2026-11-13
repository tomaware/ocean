// Open-Meteo : vent multi-modèles et vagues (Marine). Mêmes requêtes que les moteurs actuels pour leurs points.
import type { CollectPoint, ForecastBlock, SourceStatus, Unit } from '../../src/types/contracts.ts';
import { SurfEngine } from './points.ts';
import { getJSON, publicUrl } from './http.ts';

export const PAST_DAYS = 3;
export const FORECAST_DAYS = 8;

/** Modèles de vent des moteurs surf et downwind (mélange AROME → ECMWF). */
export const ENGINE_WIND_MODELS: string[] = Object.values(SurfEngine.OM_WIND_MODELS as Record<string, string>);
/** Modèles de vent de la super prévision (Apps Script v3.4, liste MODELES). */
export const SPOT_WIND_MODELS = [
  'meteofrance_arome_france_hd', 'meteofrance_arome_france', 'icon_d2', 'ecmwf_ifs025',
  'icon_eu', 'meteofrance_arpege_europe', 'gfs_seamless',
];
export const WIND_VARS = ['wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m'];
export const MARINE_VARS: string[] = SurfEngine.OM_MARINE_VARS;
export const WAVE_MODELS: string[] = SurfEngine.OM_WAVE_MODELS;

/** Unité stockée par variable Open-Meteo (le vent est demandé en km/h, comme les moteurs, puis converti). */
export function unitOf(variable: string): Unit {
  if (variable === 'precipitation') return 'mm';
  if (variable === 'cloud_cover') return '%';
  if (variable === 'weather_code') return '1';
  if (/direction/.test(variable)) return 'deg';
  if (/speed|gusts/.test(variable)) return 'm/s';
  if (/period/.test(variable)) return 's';
  if (/temperature/.test(variable)) return 'degC';
  return 'm';
}
const KMH_TO_MS = 1 / 3.6;

/** Bornes physiques : au-delà, valeur rejetée (remplacée par null et comptée). */
export function plausible(variable: string, v: number): boolean {
  switch (unitOf(variable)) {
    case 'deg': return v >= 0 && v <= 360;
    case 'm/s': return v >= 0 && v <= 70;
    case 's': return v >= 0 && v <= 30;
    case 'degC': return variable === 'temperature_2m' ? v >= -30 && v <= 50 : v >= -2 && v <= 35;   // air / eau
    case 'mm': return v >= 0 && v <= 300;
    case '%': return v >= 0 && v <= 100;
    case '1': return Number.isInteger(v) && v >= 0 && v <= 99;   // code météo OMM
    default: return /sea_level/.test(variable) ? v >= -3 && v <= 3 : v >= 0 && v <= 15;
  }
}

// Météo du spot (WIND, VAGUE, HOULE) : température de l'air, pluie, nuages, code temps ; meilleur modèle Open-Meteo.
export const METEO_VARS = ['temperature_2m', 'precipitation', 'cloud_cover', 'weather_code'];
export const METEO_MODELS = ['best_match'];
export function meteoUrl(points: CollectPoint[]): string {
  return 'https://api.open-meteo.com/v1/forecast?latitude=' + points.map((p) => p.lat).join(',') +
    '&longitude=' + points.map((p) => p.lon).join(',') + '&hourly=' + METEO_VARS.join(',') + '&models=best_match' +
    `&timezone=GMT&past_days=1&forecast_days=${FORECAST_DAYS}`;
}
export function windUrl(points: CollectPoint[], models: string[]): string {
  return 'https://api.open-meteo.com/v1/forecast?latitude=' + points.map((p) => p.lat).join(',') +
    '&longitude=' + points.map((p) => p.lon).join(',') + '&hourly=' + WIND_VARS.join(',') + '&models=' + models.join(',') +
    `&wind_speed_unit=kmh&timezone=GMT&past_days=${PAST_DAYS}&forecast_days=${FORECAST_DAYS}`;
}
/**
 * Grille de vent pour la carte (façon Windy) : 20 × 10 points tous les 0,3°, de 1,8° E à 7,5° E et de 41,7° N à 44,4° N
 * (Tom, 13/11 : le vent couvre toute la carte affichée, du Roussillon à la Côte d'Azur ; avant 16 × 8 tous les 0,25°).
 * Modèle Météo-France (AROME puis ARPEGE), brut, non corrigé : sert à l'affichage seulement (D-24), jamais aux notes.
 */
export const WIND_GRID = { lat0: 41.7, lon0: 1.8, dLat: 0.3, dLon: 0.3, nLat: 10, nLon: 20, model: 'meteofrance_seamless', days: 5 };
export function windGridPoints(): CollectPoint[] {
  const g = WIND_GRID, out: CollectPoint[] = [];
  for (let i = 0; i < g.nLat; i++) for (let j = 0; j < g.nLon; j++)
    out.push({ id: `grid_${i}_${j}`, lat: Math.round((g.lat0 + i * g.dLat) * 1000) / 1000, lon: Math.round((g.lon0 + j * g.dLon) * 1000) / 1000, usedBy: ['carte'] });
  return out;
}
export function windGridUrl(points: CollectPoint[]): string {
  return 'https://api.open-meteo.com/v1/forecast?latitude=' + points.map((p) => p.lat).join(',') +
    '&longitude=' + points.map((p) => p.lon).join(',') + '&hourly=wind_speed_10m,wind_direction_10m&models=' + WIND_GRID.model +
    `&wind_speed_unit=kmh&timezone=GMT&forecast_days=${WIND_GRID.days}`;
}
export function marineUrl(points: CollectPoint[]): string {
  return SurfEngine.openMeteoMarineURL(points, { pastDays: PAST_DAYS, forecastDays: FORECAST_DAYS });
}

const parseTime = (s: string): number => Date.parse(/Z$|[+-]\d\d:?\d\d$/.test(s) ? s : s + 'Z');

type OMLocation = { hourly?: Record<string, (number | null)[] | string[]> };

/** Réponse Open-Meteo (une ou plusieurs localisations) → bloc normalisé (SI, UTC). */
export function parseOpenMeteo(json: unknown, points: CollectPoint[], vars: string[], models: string[], id: string, url: string, fetchedAt: number):
  { block: ForecastBlock; stats: Pick<SourceStatus, 'values' | 'missing' | 'rejected'> } {
  const locs = (Array.isArray(json) ? json : [json]) as OMLocation[];
  if (locs.length !== points.length) throw new Error(`${id} : ${locs.length} localisations reçues pour ${points.length} demandées`);
  let times: number[] | null = null;
  const values: ForecastBlock['values'] = {};
  let n = 0, missing = 0, rejected = 0;
  const seen = new Set<string>();
  locs.forEach((loc, i) => {
    const h = loc.hourly ?? {};
    const t = ((h.time as string[] | undefined) ?? []).map(parseTime);
    if (!times) times = t;
    else if (t.length !== times.length || t.some((x, k) => x !== times![k])) throw new Error(`${id} : grille horaire différente au point ${points[i].id}`);
    const byModel: Record<string, Record<string, (number | null)[]>> = {};
    for (const m of models) {
      const series: Record<string, (number | null)[]> = {};
      let any = false;
      for (const v of vars) {
        const raw = (h[v + '_' + m] ?? (models.length === 1 ? h[v] : undefined)) as (number | null)[] | undefined;
        if (!raw) continue;
        const conv = /speed|gusts/.test(v) ? KMH_TO_MS : 1;
        series[v] = raw.map((x) => {
          n++;
          if (x === null || x === undefined || !Number.isFinite(x)) { missing++; return null; }
          const y = x * conv;
          if (!plausible(v, y)) { rejected++; return null; }
          any = true;
          return Math.round(y * 1000) / 1000;
        });
      }
      if (any) { byModel[m] = series; seen.add(m); }
    }
    values[points[i].id] = byModel;
  });
  const variables: Record<string, Unit> = {};
  vars.forEach((v) => { variables[v] = unitOf(v); });
  return {
    block: { id, kind: 'forecast', variables, models: models.filter((m) => seen.has(m)), times: times ?? [], values,
      provenance: { source: 'open-meteo', url: publicUrl(url), fetchedAt, note: 'Open-Meteo (CC BY 4.0) ; vent demandé en km/h et converti en m/s' } },
    stats: { values: n, missing, rejected },
  };
}

export async function collectOpenMeteo(id: string, url: string, points: CollectPoint[], vars: string[], models: string[]) {
  const fetchedAt = Date.now();
  // Open-Meteo coupe parfois quelques minutes (« fetch failed », 13/11) : 4 essais espacés de 10 s, 30 s puis 60 s
  const json = await getJSON(url, { timeoutMs: 90_000, tries: 4, backoffMs: [10_000, 30_000, 60_000] });
  return { json, ...parseOpenMeteo(json, points, vars, models, id, url, fetchedAt) };
}
