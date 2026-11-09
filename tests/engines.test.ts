import test from 'node:test';
import assert from 'node:assert/strict';
import { collectPlan, loadRegistry } from '../pipeline/collect/points.ts';
import { parseOpenMeteo, MARINE_VARS, WAVE_MODELS, WIND_VARS, ENGINE_WIND_MODELS } from '../pipeline/collect/openmeteo.ts';
import { parseCandhisHistory } from '../pipeline/collect/candhis.ts';
import { parseSuperPrevision, privateLive } from '../pipeline/collect/superprevision.ts';
import { compareOutputs, inputsFromBundle, inputsLegacy, runEngines } from '../pipeline/engines/engines.ts';
import { privacyEngines } from '../pipeline/engines/run.ts';
import type { CollectBundle, CollectPoint } from '../src/types/contracts.ts';

const registry = loadRegistry();
const plan = collectPlan(registry);
const H = 3600e3, T0 = Date.UTC(2026, 10, 7, 0), N = 24 * 11, NOW = T0 + 3 * 24 * H + 17 * 60e3;
const iso = (t: number) => new Date(t).toISOString().slice(0, 16);
const series = (f: (k: number) => number | null) => Array.from({ length: N }, (_, k) => f(k));

// Données synthétiques mais réalistes : houle d'E-SE 0,5 → 1,6 m, 6-10 s ; vent 10 → 45 km/h qui tourne.
function marineRaw(points: CollectPoint[]) {
  return points.map((_, i) => {
    const h: Record<string, unknown> = { time: series((k) => T0 + k * H).map((t) => iso(t as number)) };
    WAVE_MODELS.forEach((m, j) => MARINE_VARS.forEach((v) => {
      // résolution d'Open-Meteo : hauteurs au cm, périodes à 0,05 s, directions au degré
      h[v + '_' + m] = series((k) => j === 3 && k === 40 ? null : /direction/.test(v) ? Math.round(110 + 60 * Math.sin(k / 9) + j * 4 + i) % 360
        : /period/.test(v) ? Math.round((6 + 4 * Math.abs(Math.sin(k / 30)) + j * 0.2) * 20) / 20 : /temperature/.test(v) ? 16.5 : /sea_level/.test(v) ? 0.1
        : Math.round((0.5 + 1.1 * Math.abs(Math.sin(k / 20)) + j * 0.05) * 100) / 100);
    }));
    return { hourly: h };
  });
}
function windRaw(points: CollectPoint[]) {
  return points.map((_, i) => {
    const h: Record<string, unknown> = { time: series((k) => T0 + k * H).map((t) => iso(t as number)) };
    ENGINE_WIND_MODELS.forEach((m, j) => {
      h['wind_speed_10m_' + m] = series((k) => Math.round((10 + 35 * Math.abs(Math.sin(k / 15)) + j + (i % 5)) * 10) / 10);
      h['wind_gusts_10m_' + m] = series((k) => Math.round((16 + 42 * Math.abs(Math.sin(k / 15)) + j) * 10) / 10);
      h['wind_direction_10m_' + m] = series((k) => (90 + k * 2 + j * 5) % 360);
    });
    return { hourly: h };
  });
}

function fixture() {
  const mraw = marineRaw(plan.marine), wraw = windRaw(plan.engineWind);
  const candhis: Record<string, { t: number; hs: number | null; tm: number; dir: number }[]> = {};
  for (const b of registry.buoys) candhis[b.code] = Array.from({ length: 3 * 48 }, (_, k) => ({ t: T0 + k * 1800e3, hs: k % 17 === 0 ? null : 0.6 + 0.9 * Math.abs(Math.sin(k / 40)), tm: 5.5, dir: 120 }));
  const spRaw = { spots: {} as Record<string, { t: number; v: number; o: string; r: number }[]>, live: { spots: {} as Record<string, { t: number; v: number; o: string }>} };
  const DIR = ['E', 'ESE', 'SE', 'SSE', 'S'];
  for (const s of registry.spots.filter((x) => x.legacy.superPrevisionVent)) {
    const id = s.legacy.superPrevisionVent!;
    spRaw.spots[id] = Array.from({ length: 40 }, (_, k) => ({ t: NOW - (NOW % H) + (k - 4) * H, v: 12 + (k % 11), o: DIR[k % 5], r: 18 + (k % 11) }));
    spRaw.live.spots[id] = { t: NOW - 7 * 60e3, v: 19, o: 'SE' };
  }
  const m = parseOpenMeteo(mraw, plan.marine, MARINE_VARS, WAVE_MODELS, 'open-meteo-marine', '', NOW);
  const w = parseOpenMeteo(wraw, plan.engineWind, WIND_VARS, ENGINE_WIND_MODELS, 'open-meteo-vent-moteurs', '', NOW);
  const c = parseCandhisHistory(candhis, registry, NOW, NOW - 30 * 86400e3);
  const sp = parseSuperPrevision(spRaw, registry, NOW);
  const bundle = { version: 1, generatedAt: NOW, points: [], forecasts: [m.block, w.block, sp.block], observations: [c.block], status: [], checks: [] } as unknown as CollectBundle;
  const live = privateLive(spRaw);
  return { bundle, live, raw: { marine: mraw, wind: wraw, candhis, superSpots: { spots: spRaw.spots }, live } };
}

test('golden : moteurs alimentés par la collecte = moteurs alimentés comme aujourd’hui (écart 0)', () => {
  const f = fixture();
  const a = runEngines(inputsFromBundle(f.bundle, registry, f.live, NOW));
  const b = runEngines(inputsLegacy(f.raw, registry, NOW));
  const g = compareOutputs(a, b);
  assert.ok(g.surf.n > 1000 && g.downwind.n > 1000, `assez de valeurs comparées (${g.surf.n} / ${g.downwind.n})`);
  assert.ok(g.surf.max <= 0.1, g.surf.detail);
  assert.ok(g.downwind.max <= 0.1, g.downwind.detail);
  assert.ok(g.surf.windowsSame && g.downwind.windowsSame, g.surf.detail + ' / ' + g.downwind.detail);
  // le recalage par la super prévision et le relevé en direct est bien actif
  assert.ok(a.downwindJSON.correction.length === 2 && a.downwindJSON.correction.every((c: { live: boolean }) => c.live), JSON.stringify(a.downwindJSON.correction.map((c: { id: string }) => c.id)));
});

test('golden : un écart dans les entrées est détecté', () => {
  const f = fixture();
  const a = runEngines(inputsFromBundle(f.bundle, registry, f.live, NOW));
  const wb = f.bundle.forecasts[1];
  for (const byModel of Object.values(wb.values)) for (const v of Object.values(byModel)) v.wind_speed_10m = v.wind_speed_10m.map((x) => (x === null ? null : x * 1.3));
  const b = runEngines(inputsFromBundle(f.bundle, registry, f.live, NOW));
  const g = compareOutputs(a, b);
  assert.ok(g.surf.max > 0.1 && g.downwind.max > 0.1);
});

test('sorties : spots et parcours notés, aucune valeur privée publiée', () => {
  const f = fixture();
  const o = runEngines(inputsFromBundle(f.bundle, registry, f.live, NOW));
  assert.equal(o.surfJSON.spots.length, 8);
  assert.ok(o.surfJSON.spots.every((s: { h: { score: (number | null)[] } }) => s.h.score.some((x) => x !== null)));
  assert.equal(o.downwindJSON.runs.length, 3);
  const txt = JSON.stringify(o.surfJSON) + JSON.stringify(o.downwindJSON);
  assert.ok(privacyEngines(txt, f.live, []).ok);
  assert.ok(!privacyEngines(txt + String(f.live.spots['135-la-grande-motte'].t), f.live, []).ok, 'fuite détectée');
});
