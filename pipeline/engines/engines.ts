// ② ANALYSE — moteurs existants (surf, downwind) alimentés par la collecte commune.
// Aucune formule n'est réécrite : on appelle les moteurs de référence (legacy/) avec des entrées reconstruites.
import type { CollectBundle, ForecastBlock, ObservationBlock, Registry } from '../../src/types/contracts.ts';
import { collectPlan, DownwindEngine as D, SurfEngine as E } from '../collect/points.ts';
import { legacyBuoyObs, legacyCopernicusRaw, legacyMarine, legacySuperPrevision, legacyWind } from './adapters.ts';
import { COPERNICUS_MAX_AGE_H } from '../collect/copernicus.ts';

/** = collector/build.js de Super Prévi Surf : extrait Copernicus utilisé s'il a moins de 30 h. */
export function copernicusFor(raw: { generated?: string; points?: unknown } | null, now: number) {
  if (!raw || !raw.points || !raw.generated) return null;
  return (now - Date.parse(raw.generated)) / 3600e3 < COPERNICUS_MAX_AGE_H ? E.parseCopernicus(raw) : null;
}
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const surfDoc = require('../../legacy/super-previ-surf/engine/spots.json');
const runsDoc = require('../../legacy/downwind-foil/engine/runs.json');

export const SURF_DAYS = 7;          // = super-previ-surf collector/build.js
export const DOWNWIND_HOURS = 96;    // = downwind-foil collector/build.js

const fc = (b: CollectBundle, id: string) => b.forecasts.find((f) => f.id === id) as ForecastBlock | undefined;
const ob = (b: CollectBundle, id: string) => b.observations.find((o) => o.id === id) as ObservationBlock | undefined;

export type EngineInputs = { surf: any; downwind: any };

/** Entrées des deux moteurs reconstruites depuis le bundle de collecte (+ relevés privés pour le recalage). */
export function inputsFromBundle(bundle: CollectBundle, registry: Registry, live: unknown, now: number): EngineInputs {
  const plan = collectPlan(registry);
  const marineB = fc(bundle, 'open-meteo-marine'), windB = fc(bundle, 'open-meteo-vent-moteurs');
  if (!marineB || !windB) throw new Error('collecte incomplète : vagues ou vent des moteurs absents');
  const buoyObs = legacyBuoyObs(ob(bundle, 'candhis') ?? { stations: {} } as unknown as ObservationBlock);
  const om = legacyMarine(marineB, plan.marine.map((p) => p.id));
  const models = E.OM_WIND_MODELS as Record<string, string>;
  const dwWindIds = plan.engineWind.map((p) => p.id).filter((id) => !id.startsWith('surf_'));
  return {
    surf: { spots: surfDoc.spots, buoys: surfDoc.buoys, marine: E.mergeMarine(om, copernicusFor(legacyCopernicusRaw(fc(bundle, 'copernicus-medwav')), now)), wind: legacyWind(windB, surfDoc.spots.map((s: { id: string }) => s.id), models, 'surf_'), buoyObs, now, cfg: {}, days: SURF_DAYS },
    downwind: { runs: runsDoc.runs, buoys: runsDoc.buoys, marine: E.mergeMarine(om), wind: legacyWind(windB, dwWindIds, models), buoyObs, now, cfg: {}, hours: DOWNWIND_HOURS,
      superPrev: legacySuperPrevision(fc(bundle, 'super-prevision'), registry, live) },
  };
}

/**
 * Chemin de référence (golden) : exactement ce que font les builds des apps actuelles, à partir des réponses
 * brutes de la même exécution (parseurs des moteurs, pas ceux d'OCEAN), Copernicus compris (même règle des 30 h).
 */
export function inputsLegacy(raw: { marine: unknown; wind: unknown; candhis: Record<string, any[]>; superSpots: unknown; live: unknown; copernicus?: any }, registry: Registry, now: number): EngineInputs {
  const plan = collectPlan(registry);
  const om = E.parseOpenMeteoMarine(raw.marine, plan.marine.map((p) => p.id));
  const windAll = E.parseOpenMeteoWind(raw.wind, plan.engineWind.map((p) => p.id));
  const surfWind: Record<string, unknown> = {};
  for (const s of surfDoc.spots) surfWind[s.id] = windAll['surf_' + s.id];
  const buoyObs: Record<string, unknown[]> = {};
  Object.keys(raw.candhis || {}).forEach((c) => { buoyObs[c] = raw.candhis[c].filter((o) => o.hs != null); });
  const sp = raw.superSpots as { spots?: unknown } | null;
  return {
    surf: { spots: surfDoc.spots, buoys: surfDoc.buoys, marine: E.mergeMarine(om, copernicusFor(raw.copernicus ?? null, now)), wind: surfWind, buoyObs, now, cfg: {}, days: SURF_DAYS },
    downwind: { runs: runsDoc.runs, buoys: runsDoc.buoys, marine: E.mergeMarine(om), wind: windAll, buoyObs, now, cfg: {}, hours: DOWNWIND_HOURS,
      superPrev: sp && sp.spots ? { spots: sp.spots, live: raw.live } : null },
  };
}

export const usesCopernicus = (marine: Record<string, { series: { models: Record<string, unknown> }[] }>) =>
  Object.values(marine ?? {}).some((p) => p.series.some((x) => 'copernicus' in x.models));

export function runEngines(inp: EngineInputs) {
  const surf = E.run(inp.surf);
  const downwind = D.run(inp.downwind);
  return {
    surf, downwind,
    surfJSON: E.toForecastJSON(surf, { sources: { pipeline: 'ocean', copernicus: usesCopernicus(inp.surf.marine) ? { used: true } : null } }),
    downwindJSON: D.toJSON(downwind, { pipeline: 'ocean' }),
  };
}

export type Diff = { n: number; max: number; where: string; windowsSame: boolean; detail: string };

/** Compare les notes heure par heure (surf : score ; downwind : 3 niveaux) et les créneaux. */
export function compareOutputs(a: ReturnType<typeof runEngines>, b: ReturnType<typeof runEngines>): { surf: Diff; downwind: Diff } {
  const cmp = (pairs: [string, (number | null)[], (number | null)[]][]) => {
    let n = 0, max = 0, where = '';
    for (const [w, x, y] of pairs) {
      const len = Math.max(x.length, y.length);
      for (let i = 0; i < len; i++) {
        const u = x[i] ?? null, v = y[i] ?? null;
        if (u === null && v === null) continue;
        n++;
        const d = u === null || v === null ? Infinity : Math.abs(u - v);
        if (d > max) { max = d; where = `${w} [${i}] ${u} / ${v}`; }
      }
    }
    return { n, max, where };
  };
  const sPairs: [string, (number | null)[], (number | null)[]][] = [];
  a.surfJSON.spots.forEach((s: any, k: number) => {
    const o = b.surfJSON.spots[k];
    sPairs.push([s.id + ' note', s.h.score, o?.h.score ?? []], [s.id + ' hauteur', s.h.hb, o?.h.hb ?? []], [s.id + ' vent', s.h.ws, o?.h.ws ?? []]);
  });
  const win = (j: any) => JSON.stringify(j.spots.map((s: any) => s.windows));
  const s = cmp(sPairs);
  const dPairs: [string, (number | null)[], (number | null)[]][] = [];
  a.downwindJSON.runs.forEach((r: any, k: number) => {
    const o = b.downwindJSON.runs[k];
    for (const [col, name] of [[1, 'vent'], [6, 'houle'], [10, 'note débutant'], [11, 'note intermédiaire'], [12, 'note confirmé']] as const) {
      dPairs.push([`${r.id} ${name}`, r.hours.map((h: number[]) => h[col]), (o?.hours ?? []).map((h: number[]) => h[col])]);
    }
  });
  const d = cmp(dPairs);
  const dwin = (j: any) => JSON.stringify(j.runs.map((r: any) => r.windows.map((w: any) => [w.start, w.end, w.mean])));
  const sw = win(a.surfJSON) === win(b.surfJSON), dw = dwin(a.downwindJSON) === dwin(b.downwindJSON);
  const corrA = JSON.stringify(a.downwindJSON.correction), corrB = JSON.stringify(b.downwindJSON.correction);
  return {
    surf: { ...s, windowsSame: sw, detail: `${s.n} valeurs (note, hauteur, vent × ${a.surfJSON.spots.length} spots), écart max ${fmt(s.max)}${s.max ? ' (' + s.where + ')' : ''} ; créneaux ${sw ? 'identiques' : 'DIFFÉRENTS'}` },
    downwind: { ...d, windowsSame: dw && corrA === corrB, detail: `${d.n} valeurs (vent, houle, 3 notes × ${a.downwindJSON.runs.length} parcours), écart max ${fmt(d.max)}${d.max ? ' (' + d.where + ')' : ''} ; créneaux ${dw ? 'identiques' : 'DIFFÉRENTS'} ; correction du vent ${corrA === corrB ? 'identique' : 'DIFFÉRENTE'}` },
  };
}
const fmt = (x: number) => (Number.isFinite(x) ? String(Math.round(x * 1000) / 1000) : 'valeur manquante d’un côté');
