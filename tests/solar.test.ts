import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solarElevation } from '../pipeline/engines/solar.ts';
import { SurfEngine as E } from '../pipeline/collect/points.ts';

test('élévation du soleil : copie navigateur identique au moteur surf en service (D-66)', () => {
  let n = 0;
  for (let t = Date.UTC(2026, 0, 1); t < Date.UTC(2027, 0, 1); t += 7 * 3600e3 + 13 * 60e3)
    for (const [lat, lon] of [[42.945, 3.065], [43.42, 5.174], [43.03, 6.15]]) { assert.equal(solarElevation(t, lat, lon), E.solarElevation(t, lat, lon)); n++; }
  assert.ok(n > 3000);
});
