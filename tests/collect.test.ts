import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { collectPlan, loadRegistry, SurfEngine, DownwindEngine } from '../pipeline/collect/points.ts';
import { parseOpenMeteo, MARINE_VARS, WAVE_MODELS, WIND_VARS, ENGINE_WIND_MODELS, SPOT_WIND_MODELS, windUrl, marineUrl } from '../pipeline/collect/openmeteo.ts';
import { parseCandhisHistory } from '../pipeline/collect/candhis.ts';
import { parseSuperPrevision, compassToDeg } from '../pipeline/collect/superprevision.ts';
import { parseMetar } from '../pipeline/collect/metar.ts';
import { coverage, fidelityMarine, fidelityWind, freshness, hourlyGrid, privacy } from '../pipeline/collect/checks.ts';
import type { CollectBundle, CollectPoint } from '../src/types/contracts.ts';

const require = createRequire(import.meta.url);
const registry = loadRegistry();
const H = 3600e3;
const T0 = Date.UTC(2026, 10, 7, 0);
const N = 24 * 11;   // 3 jours passés + 8 à venir
const iso = (t: number) => new Date(t).toISOString().slice(0, 16);

// --------------------------------------------------------------- registre
test('registre : identifiants uniques, géométrie et disciplines présentes', () => {
  const ids = registry.spots.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const s of registry.spots) {
    assert.ok(s.disciplines.length > 0, s.id);
    assert.ok('lat' in s.geometry || ('path' in s.geometry && s.geometry.path.length >= 2), s.id);
    assert.ok(Object.keys(s.legacy).length > 0, s.id + ' : lien avec l’app actuelle');
  }
});

test('registre : reprend exactement les spots, parcours et bouées des apps actuelles', () => {
  const surf = require('../legacy/super-previ-surf/engine/spots.json');
  const runs = require('../legacy/downwind-foil/engine/runs.json');
  const bySurf = new Map(registry.spots.filter((s) => s.legacy.superPreviSurf).map((s) => [s.legacy.superPreviSurf, s]));
  for (const s of surf.spots) {
    const r = bySurf.get(s.id);
    assert.ok(r, 'surf ' + s.id);
    assert.deepEqual([(r!.geometry as { lat: number }).lat, (r!.geometry as { lon: number }).lon, r!.orientation?.seaward], [s.lat, s.lon, s.normal]);
  }
  for (const r of runs.runs) {
    const x = registry.spots.find((s) => s.legacy.downwindFoil === r.id);
    assert.ok(x && 'path' in x.geometry, 'parcours ' + r.id);
    assert.deepEqual((x!.geometry as { path: unknown }).path, r.path);
  }
  assert.deepEqual(registry.buoys.map((b) => b.code).sort(), surf.buoys.map((b: { code: string }) => b.code).sort());
  const wind = registry.spots.filter((s) => s.disciplines.includes('wing')).map((s) => s.legacy.superPrevisionVent);
  assert.deepEqual(wind, ['1554-la-franqui-poste-des-coussoules', '135-la-grande-motte', '81-le-ponant', '22-port-camargue', '61-beauduc', '2-almanarre-salin-des-pesquiers']);
});

// --------------------------------------------------------------- points de collecte
test('points de collecte = exactement ceux des moteurs actuels', () => {
  const plan = collectPlan(registry);
  const surf = require('../legacy/super-previ-surf/engine/spots.json');
  const runs = require('../legacy/downwind-foil/engine/runs.json');
  const surfPts = SurfEngine.queryPoints(surf.spots, surf.buoys, SurfEngine.mergeCfg(SurfEngine.DEFAULT_CONFIG, {}));
  const dwPts = DownwindEngine.queryPoints(runs.runs, runs.buoys, {});
  for (const p of [...surfPts, ...dwPts]) {
    const q = plan.marine.find((x) => x.id === p.id);
    assert.ok(q && q.lat === p.lat && q.lon === p.lon, 'mer ' + p.id);
  }
  assert.equal(plan.marine.length, new Set([...surfPts, ...dwPts].map((p: CollectPoint) => p.id)).size);
  assert.equal(plan.windSpots.filter((p) => p.id.startsWith('spot_')).length, 6);
  assert.deepEqual(plan.windSpots.filter((p) => p.id.startsWith('st_')).map((p) => p.id), ['st_LFMT', 'st_LFMP', 'st_LFTH']);
  assert.ok(plan.engineWind.length >= 8 + 6 + 63 + 2);
  assert.ok(marineUrl(plan.marine).includes('past_days=3') && windUrl(plan.windSpots, SPOT_WIND_MODELS).includes('meteofrance_arome_france_hd'));
});

// --------------------------------------------------------------- Open-Meteo
function fakeMarine(points: CollectPoint[], tweak?: (h: Record<string, unknown>, i: number) => void) {
  return points.map((_, i) => {
    const h: Record<string, unknown> = { time: Array.from({ length: N }, (_, k) => iso(T0 + k * H)) };
    WAVE_MODELS.forEach((m, j) => MARINE_VARS.forEach((v) => {
      h[v + '_' + m] = Array.from({ length: N }, (_, k) => (/direction/.test(v) ? (100 + k + j) % 360 : /period/.test(v) ? 4 + (k % 5) : /temperature/.test(v) ? 17 : /sea_level/.test(v) ? 0.1 : 0.5 + 0.01 * k));
    }));
    tweak?.(h, i);
    return { hourly: h };
  });
}
function fakeWind(points: CollectPoint[], models: string[]) {
  return points.map(() => {
    const h: Record<string, unknown> = { time: Array.from({ length: N }, (_, k) => iso(T0 + k * H)) };
    models.forEach((m) => {
      h['wind_speed_10m_' + m] = Array.from({ length: N }, (_, k) => 10 + (k % 30));   // km/h
      h['wind_gusts_10m_' + m] = Array.from({ length: N }, (_, k) => 15 + (k % 30));
      h['wind_direction_10m_' + m] = Array.from({ length: N }, (_, k) => (k * 7) % 360);
    });
    return { hourly: h };
  });
}

test('Open-Meteo vagues : unités, valeurs manquantes, rejets, modèle vide retiré', () => {
  const pts = collectPlan(registry).marine.slice(0, 3);
  const raw = fakeMarine(pts, (h, i) => {
    if (i === 0) { (h['wave_height_ewam'] as (number | null)[])[5] = null; (h['wave_height_ewam'] as number[])[6] = 99; }
    if (i === 1) MARINE_VARS.forEach((v) => { h[v + '_gwam'] = Array(N).fill(null); });
  });
  const { block, stats } = parseOpenMeteo(raw, pts, MARINE_VARS, WAVE_MODELS, 'om', 'https://x', 0);
  assert.equal(block.times[0], T0); assert.equal(block.times.length, N);
  assert.equal(block.values[pts[0].id].ewam.wave_height[5], null);
  assert.equal(block.values[pts[0].id].ewam.wave_height[6], null);
  assert.ok(stats.missing >= 1 && stats.rejected === 1);
  assert.ok(!('gwam' in block.values[pts[1].id]), 'modèle sans donnée retiré du point');
  assert.equal(block.variables.wave_height, 'm'); assert.equal(block.variables.wave_direction, 'deg');
  assert.throws(() => parseOpenMeteo(raw.slice(0, 2), pts, MARINE_VARS, WAVE_MODELS, 'om', '', 0), /localisations/);
  const bad = fakeMarine(pts); (bad[2].hourly as { time: string[] }).time[3] = iso(T0 + 99 * H);
  assert.throws(() => parseOpenMeteo(bad, pts, MARINE_VARS, WAVE_MODELS, 'om', '', 0), /grille horaire/);
});

test('Open-Meteo vent : km/h → m/s', () => {
  const pts = collectPlan(registry).windSpots;
  const { block } = parseOpenMeteo(fakeWind(pts, SPOT_WIND_MODELS), pts, WIND_VARS, SPOT_WIND_MODELS, 'om', '', 0);
  assert.equal(block.values[pts[0].id].icon_d2.wind_speed_10m[0], Math.round(10 / 3.6 * 1000) / 1000);
  assert.equal(block.variables.wind_speed_10m, 'm/s');
  assert.deepEqual(block.models, SPOT_WIND_MODELS);
});

test('fidélité : OCEAN lit le même JSON que les moteurs actuels, à l’identique, et détecte un écart', () => {
  const plan = collectPlan(registry);
  const mraw = fakeMarine(plan.marine);
  const m = parseOpenMeteo(mraw, plan.marine, MARINE_VARS, WAVE_MODELS, 'om', '', 0);
  const ok = fidelityMarine(mraw, plan.marine, m.block);
  assert.ok(ok.ok, ok.detail);
  const wraw = fakeWind(plan.engineWind, ENGINE_WIND_MODELS);
  const w = parseOpenMeteo(wraw, plan.engineWind, WIND_VARS, ENGINE_WIND_MODELS, 'om', '', 0);
  const okw = fidelityWind(wraw, plan.engineWind, w.block);
  assert.ok(okw.ok, okw.detail);
  w.block.values[plan.engineWind[0].id][ENGINE_WIND_MODELS[0]].wind_speed_10m[10] = 42;
  assert.equal(fidelityWind(wraw, plan.engineWind, w.block).ok, false);
});

test('contrôles de grille et de couverture', () => {
  const pts = collectPlan(registry).windSpots;
  const { block } = parseOpenMeteo(fakeWind(pts, SPOT_WIND_MODELS), pts, WIND_VARS, SPOT_WIND_MODELS, 'om', '', 0);
  const now = T0 + 3 * 86400e3;
  assert.ok(hourlyGrid(block, now).ok, hourlyGrid(block, now).detail);
  assert.ok(coverage(block, 'wind_speed_10m', now).ok);
  SPOT_WIND_MODELS.forEach((m) => { block.values[pts[0].id][m].wind_speed_10m.fill(null, 72, 120); });
  assert.equal(coverage(block, 'wind_speed_10m', now).ok, false);
});

// --------------------------------------------------------------- observations
test('Candhis : doublons, valeurs absentes 999.9999, âge de la dernière mesure', () => {
  const t = T0 + 5 * H;
  const raw = { '01101': [{ t, hs: 1.2, tm: 5, dir: 130 }, { t, hs: 1.2, tm: 5, dir: 130 }, { t: t + 1800e3, hs: 999.9999, tm: 99.9, dir: 999.9999 }, { t: t + 3600e3, hs: 1.4, tm: 5.2, dir: null }] };
  const { block, stats } = parseCandhisHistory(raw, registry, t + 2 * 3600e3, 0);
  const st = block.stations['01101'];
  assert.deepEqual(st.t, [t, t + 1800e3, t + 3600e3]);
  assert.deepEqual(st.hs, [1.2, null, 1.4]);
  assert.equal(st.dir[2], null);
  assert.ok(stats.rejected >= 3);
  assert.equal(stats.lastObservationAgeMin!['01101'], 60);
  assert.deepEqual(block.stations['03404'].t, []);
});

test('METAR : nœuds → m/s, vent variable (VRB) = direction inconnue', () => {
  const json = [{ icaoId: 'LFMT', obsTime: T0 / 1000, wdir: 'VRB', wspd: 4 }, { icaoId: 'LFMT', obsTime: T0 / 1000 + 1800, wdir: 140, wspd: 20, wgst: 30 }, { icaoId: 'LFMT', obsTime: T0 / 1000 + 1800, wdir: 140, wspd: 20 }];
  const { block } = parseMetar(json, registry, T0 + 2 * H);
  const s = block.stations.LFMT;
  assert.equal(s.t.length, 2);
  assert.equal(s.wind_direction_10m[0], null);
  assert.equal(s.wind_speed_10m[1], Math.round(20 / 1.94384 * 1000) / 1000);
  assert.ok(freshness(block, 120, ['LFMT']).ok);
  assert.equal(freshness(block, 60, ['LFMT']).ok, false);
});

// --------------------------------------------------------------- super prévision et confidentialité
test('super prévision : vent corrigé repris, relevés Winds-Up jamais repris', () => {
  const json = {
    spots: { '135-la-grande-motte': [{ t: T0, v: 20, o: 'SE', r: 26, conf: 0.8 }, { t: T0 + H, v: null, o: '' }], 'inconnu': [{ t: T0, v: 5, o: 'N' }] },
    live: { spots: { '135-la-grande-motte': { t: T0, v: 23, o: 'SE', pts: [[T0, 23, 'SE']] } } },
  };
  const { block } = parseSuperPrevision(json, registry, T0);
  const s = block.values['spot_la-grande-motte']['super-prevision'];
  assert.equal(s.wind_speed_10m[0], Math.round(20 / 1.94384 * 1000) / 1000);
  assert.equal(s.wind_direction_10m[0], 135);
  assert.equal(s.wind_speed_10m[1], null);
  assert.equal(Object.keys(block.values).length, 1, 'spot inconnu ignoré');
  assert.equal(block.kind, 'corrected');
  const bundle: CollectBundle = { version: 1, generatedAt: 0, points: [], forecasts: [block], observations: [], status: [], checks: [] };
  assert.ok(privacy(bundle, ['https://script.google.com/macros/s/SECRET/exec?key=abc']).ok);
  assert.equal(compassToDeg('OSO'), 247.5); assert.equal(compassToDeg('WSW'), 247.5); assert.equal(compassToDeg('?'), null);
});

test('confidentialité : une fuite est détectée', () => {
  const leak = { version: 1, generatedAt: 0, points: [], forecasts: [], observations: [], status: [], checks: [], live: { x: 1 } } as unknown as CollectBundle;
  assert.equal(privacy(leak, []).ok, false);
  const url = { version: 1, generatedAt: 0, points: [], forecasts: [], observations: [], status: [{ message: 'GET https://script.google.com/macros/s/X/exec?key=zz' }], checks: [] } as unknown as CollectBundle;
  assert.equal(privacy(url, []).ok, false);
});
