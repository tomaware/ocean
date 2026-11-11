// Infobulle des notes VAGUE : la note surf expliquée en mots, à partir des facteurs publiés par le moteur surf.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { surfWhy } from '../src/services/surfwhy.ts';
import { addSurfFactors } from '../pipeline/engines/engines.ts';

test('note surf expliquée : vent de terre + bonne taille (Saintes-Maries vendredi 9 h)', () => {
  const w = surfWhy({ f: [1, 1, 0.98, 1, 0], wk: 'offshore', tp: 9, bas: 0, flat: 0 })!;
  assert.match(w, /^Bonne taille de vague, vent de terre : vent et houle opposés/);
  assert.match(w, /bonne période \(9 s\)/);
  assert.doesNotMatch(w, /Mais/);
  // 11 h : même chose mais vent de terre plus fort (16 nd) → 7,7 au lieu de 9,5
  assert.match(surfWhy({ f: [1, 1, 0.8, 1, 0], wk: 'offshore', tp: 9, ws: 16 })!, /Mais vent de terre un peu fort \(16 nd\)/);
});

test('note surf expliquée : ce qui fait baisser la note', () => {
  const w = surfWhy({ f: [0.4, 0.6, 0.5, 0.85, -1], wk: 'onshore', tp: 5, bas: 0, flat: 0 })!;
  assert.match(w, /^Trop petit, vent de mer : vagues hachées, mer du vent : clapot, période courte \(5 s\)/);
  assert.equal(surfWhy({ f: null }), null);
  assert.match(surfWhy({ f: [0.7, 1, 1, 1, 1], wk: 'pétole', tp: 10, bas: 1 })!, /Pas de vent.*bonus bascule.*Mais vagues un peu grosses/);
});

test('facteurs surf ajoutés aux heures publiées (mêmes heures que la note), moteur inchangé', () => {
  const json = { spots: [{ id: 'sete', h: { t: [2, 3] } as Record<string, unknown> }] };
  const rows = [{ leadH: -7, hb: 1 }, { leadH: -6, hb: 0.5, factors: { size: 0.5, period: 1.1, wind: 0.987, chop: 1 } }, { leadH: 0, hb: 1.2, factors: { size: 1, period: 0.8, wind: 0.4, chop: 0.9 } }];
  addSurfFactors(json, { spots: [{ spot: { id: 'sete', size: { min: 0.6, ideal: 1, max: 2 } }, rows }] });
  assert.deepEqual(json.spots[0].h.f, [[0.5, 1, 0.99, 1, -1], [1, 0.8, 0.4, 0.9, 0]]);
});
