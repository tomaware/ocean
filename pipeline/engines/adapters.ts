// Adaptateurs : données normalisées de la collecte (SI) → formats d'entrée des moteurs existants.
// Les moteurs ne sont pas modifiés ; seules leurs entrées viennent désormais de la collecte commune.
import type { ForecastBlock, ObservationBlock, Registry } from '../../src/types/contracts.ts';

type Arr = (number | null)[];
// m/s (stockés à 0,001 près) → km/h ramenés à 0,1 km/h : la résolution d'origine d'Open-Meteo. On retrouve ainsi
// exactement les valeurs que lisent les apps actuelles (sinon 35,5 km/h redeviendrait 35,4999… et s'arrondirait à 35).
const toKmh = (a: Arr | undefined): Arr | undefined => (a ? a.map((x) => (x === null ? null : Math.round(x * 3.6 * 10) / 10)) : undefined);

/** = SurfEngine.parseOpenMeteoMarine(raw, ids) (mêmes règles : modèle retenu seulement s'il a une hauteur). */
export function legacyMarine(block: ForecastBlock, ids: string[]) {
  const out: Record<string, unknown> = {};
  for (const id of ids) {
    const byModel = block.values[id] ?? {};
    const models: Record<string, unknown> = {};
    for (const [m, v] of Object.entries(byModel)) {
      const g = (k: string) => v[k];
      const hs = g('wave_height');
      if (!hs || !hs.some((x) => x !== null && Number.isFinite(x))) continue;
      models[m] = {
        hs, tm: g('wave_period'), tp: g('wave_peak_period'), dir: g('wave_direction'),
        sw1: { h: g('swell_wave_height'), t: g('swell_wave_peak_period') || g('swell_wave_period'), tm: g('swell_wave_period'), d: g('swell_wave_direction') },
        sw2: { h: g('secondary_swell_wave_height'), t: g('secondary_swell_wave_period'), d: g('secondary_swell_wave_direction') },
        ww: { h: g('wind_wave_height'), t: g('wind_wave_peak_period') || g('wind_wave_period'), tm: g('wind_wave_period'), d: g('wind_wave_direction') },
        sl: g('sea_level_height_msl'), sst: g('sea_surface_temperature'),
      };
    }
    out[id] = { time: block.times.slice(), models };
  }
  return out;
}

/** = SurfEngine.parseOpenMeteoWind(raw, ids) : vitesses en km/h, modèles nommés meteofrance / ecmwf. */
export function legacyWind(block: ForecastBlock, ids: string[], modelKeys: Record<string, string>, prefix = '') {
  const out: Record<string, unknown> = {};
  for (const id of ids) {
    const byModel = block.values[prefix + id] ?? {};
    const models: Record<string, unknown> = {};
    for (const [k, m] of Object.entries(modelKeys)) {
      const v = byModel[m];
      if (!v || !v.wind_speed_10m) continue;
      models[k] = { spd: toKmh(v.wind_speed_10m), dir: v.wind_direction_10m, gust: toKmh(v.wind_gusts_10m) };
    }
    out[id] = { time: block.times.slice(), models };
  }
  return out;
}

/** Mesures des bouées au format des moteurs : { code: [{ t, hs, hmax, tm, dir, spread, sst }] }, hs connu. */
export function legacyBuoyObs(block: ObservationBlock) {
  const out: Record<string, Record<string, number | null>[]> = {};
  for (const [code, st] of Object.entries(block.stations)) {
    out[code] = st.t.map((t, i) => ({ t, hs: st.hs[i], hmax: st.hmax?.[i] ?? null, tm: st.tm?.[i] ?? null, dir: st.dir?.[i] ?? null, spread: st.spread?.[i] ?? null, sst: st.sst?.[i] ?? null }))
      .filter((o) => o.hs !== null);
  }
  return out;
}

const DIRS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];

/** Super prévision au format attendu par le moteur downwind ({ spots: { idWindsUp: [{ t, v (nd), o, r }] }, live }). */
export function legacySuperPrevision(block: ForecastBlock | undefined, registry: Registry, live: unknown) {
  if (!block) return null;
  const spots: Record<string, { t: number; v: number | null; o: string; r: number | null }[]> = {};
  for (const s of registry.spots) {
    const legacyId = s.legacy.superPrevisionVent;
    const v = block.values['spot_' + s.id]?.['super-prevision'];
    if (!legacyId || !v) continue;
    spots[legacyId] = block.times.map((t, i) => ({
      t,
      v: v.wind_speed_10m[i] === null ? null : Math.round((v.wind_speed_10m[i] as number) * 1.94384 * 100) / 100,
      o: v.wind_direction_10m[i] === null ? '' : DIRS[Math.round((v.wind_direction_10m[i] as number) / 22.5) % 16],
      r: v.wind_gusts_10m[i] === null ? null : Math.round((v.wind_gusts_10m[i] as number) * 1.94384 * 100) / 100,
    })).filter((p) => p.v !== null);
  }
  return { spots, live: live ?? null };
}
