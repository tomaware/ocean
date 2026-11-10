// Copernicus Marine Med-WAV (MEDSEA_ANALYSISFORECAST_WAV_006_017, ~4,2 km, horaire) : le modèle de vagues régional
// le plus fin de la zone. Extraction unique : celle de Super Prévi Surf (identifiants Copernicus dans SES secrets),
// publiée sur son site toutes les 3 h ; OCEAN la relit au lieu d'extraire une seconde fois.
import type { ForecastBlock, SourceStatus } from '../../src/types/contracts.ts';
import { getJSON } from './http.ts';

export const COPERNICUS_URL = 'https://tomaware.github.io/super-previ-surf/data/copernicus.json';
export const COPERNICUS_MAX_AGE_H = 30;   // = règle de collector/build.js (au-delà : extrait ignoré)
export const CMEMS_VARS = ['VHM0', 'VTPK', 'VTM10', 'VTM02', 'VMDR', 'VHM0_SW1', 'VTM01_SW1', 'VMDR_SW1', 'VHM0_SW2', 'VTM01_SW2', 'VMDR_SW2', 'VHM0_WW', 'VTM01_WW', 'VMDR_WW'];
const unit = (v: string) => (/^VMDR/.test(v) ? 'deg' : /^VT/.test(v) ? 's' : 'm') as 'deg' | 's' | 'm';
const LIM: Record<string, [number, number]> = { deg: [0, 360], s: [0, 30], m: [0, 15] };

export type CopernicusRaw = { source?: string; generated: string; points: Record<string, Record<string, unknown>> };

/** Normalisation : temps en ms UTC, grille horaire commune, valeurs hors bornes → null. Variables CMEMS gardées telles quelles. */
export function parseCopernicus(raw: CopernicusRaw, fetchedAt: number): { block: ForecastBlock; stats: Partial<SourceStatus>; ageH: number } {
  const ids = Object.keys(raw.points ?? {});
  if (!ids.length) throw new Error('extrait Copernicus vide');
  const toT = (x: unknown) => (typeof x === 'number' ? x : Date.parse(String(x).endsWith('Z') || /[+-]\d\d:?\d\d$/.test(String(x)) ? String(x) : String(x) + 'Z'));
  const times = (raw.points[ids[0]].time as unknown[]).map(toT);
  const values: ForecastBlock['values'] = {};
  let n = 0, missing = 0, rejected = 0;
  for (const id of ids) {
    const p = raw.points[id];
    const t = (p.time as unknown[]).map(toT);
    if (t.length !== times.length || t.some((x, i) => x !== times[i])) throw new Error(`heures différentes au point ${id}`);
    const byVar: Record<string, (number | null)[]> = {};
    for (const v of CMEMS_VARS) {
      const a = p[v] as (number | null)[] | undefined;
      if (!a) continue;
      const [lo, hi] = LIM[unit(v)];
      byVar[v] = a.map((x) => {
        n++;
        if (x === null || x === undefined || !Number.isFinite(x)) { missing++; return null; }
        if (x < lo || x > hi) { rejected++; return null; }
        return x;
      });
    }
    values[id] = { copernicus: byVar };
  }
  const generated = Date.parse(raw.generated);
  return {
    block: { id: 'copernicus-medwav', kind: 'forecast', variables: Object.fromEntries(CMEMS_VARS.map((v) => [v, unit(v)])), models: ['copernicus'], times, values,
      provenance: { source: 'copernicus-marine', url: 'https://data.marine.copernicus.eu/product/MEDSEA_ANALYSISFORECAST_WAV_006_017', fetchedAt, issuedAt: generated,
        note: 'Generated using E.U. Copernicus Marine Service Information — Med-WAV 4,2 km ; extrait par Super Prévi Surf' } as ForecastBlock['provenance'],
    },
    stats: { values: n, missing, rejected, points: ids.length, models: ['copernicus'], first: times[0], last: times[times.length - 1] },
    ageH: (fetchedAt - generated) / 3600e3,
  };
}

export async function collectCopernicus() {
  const fetchedAt = Date.now();
  const raw = await getJSON<CopernicusRaw>(COPERNICUS_URL, { timeoutMs: 60_000 });
  return { ...parseCopernicus(raw, fetchedAt), raw };
}
