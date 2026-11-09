// Bouées Candhis (Cerema, licence Etalab). Collecte unique : celle de Super Prévi Surf (tableau public + API
// officielle en secours), dont l'historique horaire est publié dans son dépôt. OCEAN le relit au lieu
// d'interroger Candhis une seconde fois (quota de la clé partagé).
import type { ObservationBlock, Registry, SourceStatus } from '../../src/types/contracts.ts';
import { getJSON } from './http.ts';

export const CANDHIS_HISTORY_URL = 'https://raw.githubusercontent.com/tomaware/super-previ-surf/main/data/history/buoys.json';

type RawObs = { t: number; hs: number | null; hmax?: number | null; tm?: number | null; dir?: number | null; spread?: number | null; sst?: number | null };

const LIMITS: Record<string, [number, number]> = { hs: [0, 15], hmax: [0, 30], tm: [0, 30], dir: [0, 360], spread: [0, 180], sst: [-2, 35] };

export function parseCandhisHistory(raw: Record<string, RawObs[]>, registry: Registry, fetchedAt: number, sinceMs: number):
  { block: ObservationBlock; stats: Pick<SourceStatus, 'values' | 'missing' | 'rejected' | 'lastObservationAgeMin'> } {
  const stations: ObservationBlock['stations'] = {};
  let n = 0, missing = 0, rejected = 0;
  const age: Record<string, number> = {};
  for (const b of registry.buoys) {
    const obs = (raw[b.code] ?? []).filter((o) => Number.isFinite(o.t) && o.t >= sinceMs).sort((a, c) => a.t - c.t);
    const st: { t: number[]; [k: string]: (number | null)[] } = { t: [] };
    Object.keys(LIMITS).forEach((k) => { st[k] = []; });
    let lastT: number | null = null;
    for (const o of obs) {
      if (lastT === o.t) continue;   // doublon
      lastT = o.t;
      st.t.push(o.t);
      for (const k of Object.keys(LIMITS)) {
        const v = (o as Record<string, number | null | undefined>)[k];
        n++;
        if (v === null || v === undefined || !Number.isFinite(v)) { missing++; st[k].push(null); continue; }
        const [lo, hi] = LIMITS[k];
        if (v < lo || v > hi) { rejected++; st[k].push(null); continue; }
        st[k].push(v);
      }
    }
    stations[b.code] = st;
    for (let i = st.t.length - 1; i >= 0; i--) {
      if (st.hs[i] !== null) { age[b.code] = Math.round((fetchedAt - st.t[i]) / 60000); break; }
    }
  }
  return {
    block: { id: 'candhis', kind: 'observed', variables: { hs: 'm', hmax: 'm', tm: 's', dir: 'deg', spread: 'deg', sst: 'degC' }, stations,
      provenance: { source: 'candhis', url: 'https://candhis.cerema.fr', fetchedAt, note: 'Candhis – Cerema (licence Etalab) ; collecté par Super Prévi Surf, relu dans son historique' } },
    stats: { values: n, missing, rejected, lastObservationAgeMin: age },
  };
}

export async function collectCandhis(registry: Registry, sinceMs: number) {
  const fetchedAt = Date.now();
  const raw = await getJSON<Record<string, RawObs[]>>(CANDHIS_HISTORY_URL, { timeoutMs: 60_000 });
  return { ...parseCandhisHistory(raw, registry, fetchedAt, sinceMs), raw };
}
