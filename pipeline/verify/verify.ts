// ③ REMISE EN QUESTION — les prévisions sont comparées aux mesures, modèle par modèle et par échéance.
// Deux lectures, jamais mélangées :
//  - « prévision archivée » : ce que le modèle annonçait vraiment N heures avant (archive de nos propres runs) ;
//  - « court terme » : valeurs des modèles sur les 3 derniers jours (analyse/très courte échéance) vs mesures.
import type { CollectBundle, ForecastBlock, ObservationBlock } from '../../src/types/contracts.ts';

export const LEADS = [0, 6, 12, 24, 48];
export const ARCHIVE_DAYS = 30;
export const ARCHIVE_EVERY_H = 3;
const H = 3600e3;

export type Snapshot = { run: number; wind: Record<string, Record<string, Record<number, number>>>; hs: Record<string, Record<string, Record<number, number>>> };
export type Archive = { version: 1; snapshots: Snapshot[] };
export type Stat = { n: number; mae: number; bias: number; rmse: number };
export type Scores = Record<string, Record<string, Record<string, Stat>>>;   // kind → station → "modèle|échéance" → stat

const r2 = (x: number) => Math.round(x * 100) / 100;
const fc = (b: CollectBundle, id: string) => b.forecasts.find((f) => f.id === id) as ForecastBlock | undefined;
const ob = (b: CollectBundle, id: string) => b.observations.find((o) => o.id === id) as ObservationBlock | undefined;

function at(block: ForecastBlock, pid: string, model: string, v: string, t: number): number | null {
  const i = block.times.indexOf(t);
  const x = i < 0 ? null : block.values[pid]?.[model]?.[v]?.[i];
  return x === null || x === undefined ? null : x;
}

/** Instantané de ce que les modèles annoncent maintenant, aux stations METAR et aux bouées, pour 5 échéances. */
export function snapshot(bundle: CollectBundle): Snapshot {
  const run = Math.floor(bundle.generatedAt / H) * H;
  const snap: Snapshot = { run, wind: {}, hs: {} };
  const spots = fc(bundle, 'open-meteo-vent-spots'), marine = fc(bundle, 'open-meteo-marine');
  if (spots) for (const pid of Object.keys(spots.values).filter((p) => p.startsWith('st_'))) {
    const code = pid.slice(3);
    for (const m of spots.models) for (const L of LEADS) {
      const x = at(spots, pid, m, 'wind_speed_10m', run + L * H);
      if (x !== null) ((snap.wind[code] ??= {})[m] ??= {})[L] = r2(x);
    }
  }
  if (marine) for (const pid of Object.keys(marine.values).filter((p) => p.startsWith('buoy_'))) {
    const code = pid.slice(5);
    for (const m of marine.models) for (const L of LEADS) {
      const x = at(marine, pid, m, 'wave_height', run + L * H);
      if (x !== null) ((snap.hs[code] ??= {})[m] ??= {})[L] = r2(x);
    }
  }
  return snap;
}

/** Ajoute l'instantané (un toutes les 3 h), garde 30 jours. */
export function updateArchive(a: Archive | null, snap: Snapshot): Archive {
  const keep = (a?.snapshots ?? []).filter((s) => s.run !== snap.run && s.run > snap.run - ARCHIVE_DAYS * 86400e3);
  if (Math.round(snap.run / H) % ARCHIVE_EVERY_H === 0) keep.push(snap);
  return { version: 1, snapshots: keep.sort((x, y) => x.run - y.run) };
}

function nearest(t: number[], target: number, tolMs: number): number {
  let best = -1, bd = Infinity;
  for (let i = 0; i < t.length; i++) { const d = Math.abs(t[i] - target); if (d < bd) { bd = d; best = i; } }
  return bd <= tolMs ? best : -1;
}
class Acc { n = 0; s = 0; a = 0; q = 0; add(e: number) { this.n++; this.s += e; this.a += Math.abs(e); this.q += e * e; }
  stat(): Stat { return { n: this.n, mae: r2(this.a / this.n), bias: r2(this.s / this.n), rmse: r2(Math.sqrt(this.q / this.n)) }; } }
function collect(into: Map<string, Acc>, key: string, err: number) { let a = into.get(key); if (!a) into.set(key, (a = new Acc())); a.add(err); }
function finish(by: Record<string, Map<string, Acc>>, minN: number): Record<string, Record<string, Stat>> {
  const out: Record<string, Record<string, Stat>> = {};
  for (const [st, m] of Object.entries(by)) { out[st] = {}; for (const [k, a] of m) if (a.n >= minN) out[st][k] = a.stat(); }
  return out;
}

/** Prévision archivée vs mesure : erreur = prévu − mesuré (positif = le modèle surestime). */
export function verifyArchive(arch: Archive, metar: ObservationBlock | undefined, candhis: ObservationBlock | undefined): { wind: Scores[string]; hs: Scores[string]; runs: number } {
  const w: Record<string, Map<string, Acc>> = {}, h: Record<string, Map<string, Acc>> = {};
  for (const s of arch.snapshots) {
    for (const [code, byM] of Object.entries(s.wind)) {
      const o = metar?.stations[code]; if (!o) continue;
      for (const [m, byL] of Object.entries(byM)) for (const [L, f] of Object.entries(byL)) {
        const i = nearest(o.t, s.run + Number(L) * H, 30 * 60e3), x = i < 0 ? null : o.wind_speed_10m[i];
        if (x !== null && x !== undefined) collect((w[code] ??= new Map()), `${m}|${L}`, f - x);
      }
    }
    for (const [code, byM] of Object.entries(s.hs)) {
      const o = candhis?.stations[code]; if (!o) continue;
      for (const [m, byL] of Object.entries(byM)) for (const [L, f] of Object.entries(byL)) {
        const i = nearest(o.t, s.run + Number(L) * H, 30 * 60e3), x = i < 0 ? null : o.hs[i];
        if (x !== null && x !== undefined) collect((h[code] ??= new Map()), `${m}|${L}`, f - x);
      }
    }
  }
  return { wind: finish(w, 3), hs: finish(h, 3), runs: arch.snapshots.length };
}

/** Court terme : valeurs des modèles sur les 3 derniers jours (pas une vraie prévision) vs mesures. Disponible dès la 1re exécution. */
export function verifyShortTerm(bundle: CollectBundle): { wind: Scores[string]; hs: Scores[string] } {
  const metar = ob(bundle, 'metar'), candhis = ob(bundle, 'candhis');
  const spots = fc(bundle, 'open-meteo-vent-spots'), marine = fc(bundle, 'open-meteo-marine');
  const now = bundle.generatedAt;
  const w: Record<string, Map<string, Acc>> = {}, h: Record<string, Map<string, Acc>> = {};
  if (spots && metar) for (const [code, o] of Object.entries(metar.stations)) {
    for (const m of spots.models) o.t.forEach((t, k) => {
      const x = o.wind_speed_10m[k]; if (x === null || t > now) return;
      const i = nearest(spots.times, t, 30 * 60e3); if (i < 0) return;
      const f = spots.values['st_' + code]?.[m]?.wind_speed_10m?.[i]; if (f === null || f === undefined) return;
      collect((w[code] ??= new Map()), m, f - x);
    });
  }
  if (marine && candhis) for (const [code, o] of Object.entries(candhis.stations)) {
    for (const m of marine.models) o.t.forEach((t, k) => {
      const x = o.hs[k]; if (x === null || t > now || t < now - 3 * 86400e3) return;
      const i = nearest(marine.times, t, 30 * 60e3); if (i < 0) return;
      const f = marine.values['buoy_' + code]?.[m]?.wave_height?.[i]; if (f === null || f === undefined) return;
      collect((h[code] ??= new Map()), m, f - x);
    });
  }
  return { wind: finish(w, 10), hs: finish(h, 10) };
}
