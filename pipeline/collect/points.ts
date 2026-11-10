// Points de collecte : exactement ceux qu'utilisent les moteurs actuels (mêmes fonctions, mêmes réglages),
// pour que leur branchement sur la collecte commune (M2) donne des résultats identiques.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import type { CollectPoint, Registry } from '../../src/types/contracts.ts';

const require = createRequire(import.meta.url);
export const SurfEngine = require('../../legacy/super-previ-surf/engine/surf-engine.js');
export const DownwindEngine = require('../../legacy/downwind-foil/engine/downwind-engine.js');
const surfSpots = require('../../legacy/super-previ-surf/engine/spots.json');
const downwindRuns = require('../../legacy/downwind-foil/engine/runs.json');

export function loadRegistry(path = new URL('../../registry/spots.json', import.meta.url)): Registry {
  return JSON.parse(readFileSync(path, 'utf8')) as Registry;
}

type P = { id: string; lat: number; lon: number };

/**
 * Spots surf d'OCEAN, au format du moteur surf (legacy/super-previ-surf/engine/spots.json), lus dans le registre.
 * Le registre est la source (Tom, 10/11 : Gruissan, Canet, Paulilles, Perafita retirés ; Saintes-Maries et La Couronne ajoutés).
 * Pour les spots communs, les réglages sont identiques à ceux de l'app en service (vérifié par un test).
 */
export type SurfSpot = { id: string; name: string; commune: string; lat: number; lon: number; normal: number; swell: { min: number; max: number; ideal?: number };
  size: { min: number; ideal: number; max: number }; periodMin: number; level: string; shelter: number; buoys: string[]; confidence: string; sources: string[] };
export function surfSpotsOf(registry: Registry): SurfSpot[] {
  return registry.spots.filter((s) => s.disciplines.includes('surf')).map((s) => {
    const g = s.geometry as { lat: number; lon: number }, x = s.surf as { size: SurfSpot['size']; periodMin: number; level: string; shelter: number };
    return { id: s.id, name: s.name, commune: String(s.commune ?? ''), lat: g.lat, lon: g.lon, normal: s.orientation!.seaward as number, swell: s.swellWindow!,
      size: x.size, periodMin: x.periodMin, level: x.level, shelter: x.shelter, buoys: s.buoys ?? [], confidence: s.confidence, sources: s.sources };
  });
}
export const SURF_BUOYS = surfSpots.buoys;

function add(map: Map<string, CollectPoint>, p: P, user: string): void {
  const prev = map.get(p.id);
  if (prev) {
    if (Math.abs(prev.lat - p.lat) > 1e-6 || Math.abs(prev.lon - p.lon) > 1e-6) {
      throw new Error(`Point ${p.id} défini à deux endroits différents (${prev.lat},${prev.lon} / ${p.lat},${p.lon})`);
    }
    if (!prev.usedBy.includes(user)) prev.usedBy.push(user);
    return;
  }
  map.set(p.id, { id: p.id, lat: p.lat, lon: p.lon, usedBy: [user] });
}

export interface CollectPlan {
  marine: CollectPoint[];        // Open-Meteo Marine (modèles de vagues)
  engineWind: CollectPoint[];    // Open-Meteo vent, modèles des moteurs surf / downwind
  windSpots: CollectPoint[];     // Open-Meteo vent, 7 modèles de la super prévision
  meteo: CollectPoint[];         // Open-Meteo météo (air, pluie, nuages) : un point par spot / parcours
}

export function collectPlan(registry: Registry): CollectPlan {
  const marine = new Map<string, CollectPoint>();
  const wind = new Map<string, CollectPoint>();
  // Surf : points mer des spots (décalés au large par le moteur) + bouées ; vent aux coordonnées des spots
  const surfCfg = SurfEngine.mergeCfg(SurfEngine.DEFAULT_CONFIG, {});
  const spots = surfSpotsOf(registry);
  (SurfEngine.queryPoints(spots, surfSpots.buoys, surfCfg) as P[]).forEach((p) => add(marine, p, 'surf'));
  spots.forEach((s) => add(wind, { id: 'surf_' + s.id, lat: s.lat, lon: s.lon }, 'surf'));
  // Downwind : 2 points en mer par parcours + bouées ; vent sur ces points + grille de la carte + spots corrigés
  (DownwindEngine.queryPoints(downwindRuns.runs, downwindRuns.buoys, {}) as P[]).forEach((p) => add(marine, p, 'downwind'));
  (DownwindEngine.queryPoints(downwindRuns.runs, [], {}) as P[]).forEach((p) => add(wind, p, 'downwind'));
  (DownwindEngine.windPoints({}) as P[]).forEach((p) => add(wind, p, 'downwind'));
  // Vent : spots wing / kite du registre (modèles de la super prévision)
  const windSpots = registry.spots
    .filter((s) => s.disciplines.includes('wing') && 'lat' in s.geometry)
    .map((s) => ({ id: 'spot_' + s.id, lat: (s.geometry as { lat: number }).lat, lon: (s.geometry as { lon: number }).lon, usedBy: ['wind'] }))
    // ③ Remise en question : mêmes 7 modèles aux stations METAR, pour comparer prévu / mesuré
    .concat(registry.stations.map((st) => ({ id: 'st_' + st.icao, lat: st.lat, lon: st.lon, usedBy: ['verify'] })));
  const meteo = registry.spots.map((s) => {
    const g = s.geometry as { lat?: number; lon?: number; path?: [number, number][] };
    const [lat, lon] = g.path ? g.path[Math.floor(g.path.length / 2)] : [g.lat!, g.lon!];
    return { id: 'meteo_' + s.id, lat, lon, usedBy: ['meteo'] };
  });
  return { marine: [...marine.values()], engineWind: [...wind.values()], windSpots, meteo };
}
