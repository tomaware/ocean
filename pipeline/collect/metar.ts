// METAR (aviationweather.gov, domaine public) : vent mesuré aux aéroports proches des spots
// (Montpellier, Perpignan, Toulon-Hyères). Observations publiques : elles peuvent être affichées.
import type { ObservationBlock, Registry, SourceStatus } from '../../src/types/contracts.ts';
import { getJSON } from './http.ts';

const KT_TO_MS = 1 / 1.94384;
export function metarUrl(icaos: string[], hours = 72): string {
  return `https://aviationweather.gov/api/data/metar?ids=${icaos.join(',')}&format=json&hours=${hours}`;
}

type Metar = { icaoId?: string; obsTime?: number; wdir?: number | string; wspd?: number; wgst?: number | null };

export function parseMetar(json: Metar[], registry: Registry, fetchedAt: number):
  { block: ObservationBlock; stats: Pick<SourceStatus, 'values' | 'missing' | 'rejected' | 'lastObservationAgeMin'> } {
  const stations: ObservationBlock['stations'] = {};
  let n = 0, missing = 0, rejected = 0;
  const age: Record<string, number> = {};
  for (const st of registry.stations) {
    const rows = (json ?? []).filter((m) => m.icaoId === st.icao && Number.isFinite(m.obsTime))
      .map((m) => ({ t: (m.obsTime as number) * 1000, m })).sort((a, b) => a.t - b.t)
      .filter((x, i, a) => i === 0 || a[i - 1].t !== x.t);
    const s: { t: number[]; [k: string]: (number | null)[] } = { t: [], wind_speed_10m: [], wind_gusts_10m: [], wind_direction_10m: [] };
    for (const { t, m } of rows) {
      s.t.push(t);
      n += 3;
      const spd = Number.isFinite(m.wspd) ? (m.wspd as number) * KT_TO_MS : null;
      if (spd === null) missing++;
      else if (spd > 70) { rejected++; }
      s.wind_speed_10m.push(spd !== null && spd <= 70 ? Math.round(spd * 1000) / 1000 : null);
      const g = Number.isFinite(m.wgst) ? (m.wgst as number) * KT_TO_MS : null;
      if (g === null) missing++;
      s.wind_gusts_10m.push(g !== null && g <= 90 ? Math.round(g * 1000) / 1000 : null);
      const d = typeof m.wdir === 'number' && m.wdir >= 0 && m.wdir <= 360 ? m.wdir : null;   // 'VRB' = variable → null
      if (d === null) missing++;
      s.wind_direction_10m.push(d);
    }
    stations[st.icao] = s;
    if (s.t.length) age[st.icao] = Math.round((fetchedAt - s.t[s.t.length - 1]) / 60000);
  }
  return {
    block: { id: 'metar', kind: 'observed', variables: { wind_speed_10m: 'm/s', wind_gusts_10m: 'm/s', wind_direction_10m: 'deg' }, stations,
      provenance: { source: 'metar', url: 'https://aviationweather.gov/data/api/', fetchedAt, note: 'METAR via NOAA Aviation Weather Center (domaine public) ; vent moyen 10 min, nœuds convertis en m/s ; direction variable (VRB) = null' } },
    stats: { values: n, missing, rejected, lastObservationAgeMin: age },
  };
}

export async function collectMetar(registry: Registry) {
  const fetchedAt = Date.now();
  const json = await getJSON<Metar[]>(metarUrl(registry.stations.map((s) => s.icao)), { timeoutMs: 60_000 });
  return parseMetar(json, registry, fetchedAt);
}
