import test from 'node:test';
import assert from 'node:assert/strict';
import { snapshot, updateArchive, verifyArchive, verifyShortTerm, type Archive } from '../pipeline/verify/verify.ts';
import type { CollectBundle } from '../src/types/contracts.ts';

const H = 3600e3, T0 = Date.UTC(2026, 10, 7, 0), N = 24 * 8;
const times = Array.from({ length: N }, (_, k) => T0 + k * H);
function bundle(now: number, bias = 1): CollectBundle {
  const wind = { st_LFMT: { arome: { wind_speed_10m: times.map((t) => 5 + bias + ((t / H) % 3)) }, gfs: { wind_speed_10m: times.map((t) => 5 + 3 + ((t / H) % 3)) } } };
  const sea = { buoy_03001: { meteofrance_wave: { wave_height: times.map((t) => 1 + 0.1 + ((t / H) % 2) * 0.1) } } };
  const obsT = times.filter((t) => t <= now);
  return {
    version: 1, generatedAt: now, points: [], status: [], checks: [],
    forecasts: [
      { id: 'open-meteo-vent-spots', kind: 'forecast', models: ['arome', 'gfs'], times, values: wind, variables: {}, provenance: { source: 'x', fetchedAt: now } },
      { id: 'open-meteo-marine', kind: 'forecast', models: ['meteofrance_wave'], times, values: sea, variables: {}, provenance: { source: 'x', fetchedAt: now } },
    ],
    observations: [
      { id: 'metar', kind: 'observed', variables: {}, provenance: { source: 'x', fetchedAt: now }, stations: { LFMT: { t: obsT.map((t) => t + 10 * 60e3), wind_speed_10m: obsT.map((t) => 5 + ((t / H) % 3)) } } },
      { id: 'candhis', kind: 'observed', variables: {}, provenance: { source: 'x', fetchedAt: now }, stations: { '03001': { t: obsT, hs: obsT.map((t) => 1 + ((t / H) % 2) * 0.1) } } },
    ],
  } as unknown as CollectBundle;
}

test('archive : un instantané toutes les 3 h, 5 échéances, 30 jours au plus', () => {
  const now = T0 + 3 * 24 * H + 41 * 60e3;
  const s = snapshot(bundle(now));
  assert.equal(s.run, T0 + 3 * 24 * H);
  assert.deepEqual(Object.keys(s.wind.LFMT.arome).map(Number), [0, 6, 12, 24, 48]);
  assert.equal(s.hs['03001'].meteofrance_wave[24], 1.1);
  let a: Archive | null = null;
  for (let h = 0; h < 7; h++) a = updateArchive(a, { ...s, run: s.run + h * H });
  assert.equal(a!.snapshots.length, 3);                       // h = 0, 3, 6
  a = updateArchive(a, { ...s, run: s.run + 31 * 86400e3 });
  assert.equal(a.snapshots.length, 1);
});

test('vérification à échéance : retrouve le biais connu de chaque modèle', () => {
  const a: Archive = { version: 1, snapshots: [] };
  for (let d = 0; d < 3; d++) a.snapshots.push(snapshot(bundle(T0 + d * 24 * H)));
  const v = verifyArchive(a, bundle(T0 + 7 * 24 * H).observations[0], bundle(T0 + 7 * 24 * H).observations[1]);
  assert.equal(v.wind.LFMT['arome|24'].bias, 1);
  assert.equal(v.wind.LFMT['gfs|24'].mae, 3);
  assert.equal(v.hs['03001']['meteofrance_wave|6'].bias, 0.1);
  assert.equal(v.runs, 3);
});

test('court terme : modèles classés par erreur sur les 3 derniers jours', () => {
  const v = verifyShortTerm(bundle(T0 + 4 * 24 * H));
  assert.equal(v.wind.LFMT.arome.bias, 1);
  assert.equal(v.wind.LFMT.gfs.bias, 3);
  assert.ok(v.wind.LFMT.arome.mae < v.wind.LFMT.gfs.mae);
  assert.equal(v.hs['03001'].meteofrance_wave.mae, 0.1);
});
