// Cas écrits à la main à partir de la formule validée (docs/product/WING_SCORE.md, v2.0). Ne pas « corriger » un cas
// pour faire passer le code : un écart = changement de formule = décision documentée.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadRegistry } from '../pipeline/collect/points.ts';
import { parseSuperPrevision } from '../pipeline/collect/superprevision.ts';
import { scoreHour, sessions, wingForecast, gustFactor, windFactor, label, type WingHour, type WingLevel } from '../pipeline/engines/wing.ts';

const registry = loadRegistry();
const spot = (id: string) => registry.spots.find((s) => s.id === id)!;
const sc = (id: string, kn: number, gust: number | null, dir: number, L: WingLevel, day = true) => scoreHour(kn, gust, dir, day, spot(id), L);

test('wing v2 : cas de référence, modes Sécu first / Offshore', () => {
  // Almanarre (large 245°), 22 nd d'ONO (290° : side-on), rafales 28 (× 1,27)
  assert.equal(sc('almanarre', 22, 28, 290, 'secu').score, 10);
  assert.equal(sc('almanarre', 22, 28, 290, 'offshore').score, 10);
  // v1.1 (D-18) : pas de pénalité avant 35 nd ; au-delà : 0
  assert.equal(sc('almanarre', 35, 40, 290, 'secu').score, 10);
  assert.equal(sc('almanarre', 36, 40, 290, 'offshore').score, 0);
  assert.equal(sc('almanarre', 36, 40, 290, 'offshore').limit, 'trop de vent (plus de 35 nd)');
  assert.equal(sc('almanarre', 30, 45, 290, 'offshore').score, 0);                 // (30 + 45) / 2 = 37,5
  // La Franqui (large 100°) en tramontane (315°) : vent de terre → 0 en Sécu first, noté en Offshore mais signalé
  assert.equal(sc('la-franqui', 20, 26, 315, 'secu').score, 0);
  assert.match(String(sc('la-franqui', 20, 26, 315, 'secu').limit), /vent de terre/);
  assert.equal(sc('la-franqui', 20, 26, 315, 'offshore').score, 10);
  assert.match(String(sc('la-franqui', 20, 26, 315, 'offshore').limit), /vent de terre/);
  // Side-off (Espiguette, large 200°, vent de 315° = 115°)
  assert.equal(sc('port-camargue', 18, 22, 315, 'secu').score, 0);
  assert.equal(sc('port-camargue', 18, 22, 315, 'offshore').score, 10);
  assert.match(String(sc('port-camargue', 18, 22, 315, 'offshore').limit), /side-off/);
  // La Grande-Motte (large 160°), 16 nd plein onshore : 0,8
  assert.equal(sc('la-grande-motte', 16, 19, 160, 'secu').score, 8);
  // Rafaleux : 18 nd, rafales 27 (× 1,5) → R = 0,733
  assert.equal(sc('la-grande-motte', 18, 27, 110, 'secu').score, 7.3);
  assert.equal(sc('la-grande-motte', 18, 27, 110, 'secu').limit, 'vent rafaleux');
  // Le Ponant (étang), vent du nord déconseillé : × 0,6
  assert.equal(sc('le-ponant', 18, 22, 0, 'secu').score, 6);
  assert.equal(sc('le-ponant', 18, 22, 135, 'secu').score, 10);
  // Pas assez de vent, nuit
  assert.equal(sc('almanarre', 10, 13, 290, 'secu').score, 0);
  assert.equal(sc('almanarre', 12, 15, 290, 'offshore').score, 3.3);               // (12 - 11) / 3
  assert.equal(sc('almanarre', 10, 13, 290, 'secu').limit, 'pas assez de vent');
  assert.equal(sc('almanarre', 22, 26, 290, 'offshore', false).score, 0);
});

test('wing : facteurs et libellés', () => {
  assert.equal(windFactor(12, 'secu'), 0); assert.equal(windFactor(15, 'secu'), 1); assert.equal(windFactor(26, 'secu'), 1);
  assert.equal(windFactor(35, 'offshore'), 1); assert.equal(windFactor(35.1, 'offshore'), 0);
  assert.equal(gustFactor(1.3), 1); assert.equal(gustFactor(1.6), 0.6); assert.equal(gustFactor(2.2), 0.4);
  assert.deepEqual([label(7), label(6.9), label(5), label(4.9), label(null)], ['Ça envoie', 'Ça se tente', 'Ça se tente', 'Non', '—']);
});

test('wing : sessions 2H = au moins 2 h d’affilée à 5/10', () => {
  const H = 3600e3, t0 = Date.UTC(2026, 10, 10, 9);
  const mk = (s: (number | null)[]) => s.map((x, i) => ({ t: t0 + i * H, scores: { secu: x, offshore: x } }) as unknown as WingHour);
  const w = sessions(mk([5, 6, 4, 7, null, 8, 9, 7, 2, 6]), 'secu');
  assert.deepEqual(w.map((x) => [x.hours, x.mean, x.peak]), [[2, 5.5, 6], [3, 8, 9]]);
  const gap = mk([6, 6, 6]); gap[2].t += H;
  assert.deepEqual(sessions(gap, 'secu').map((x) => x.hours), [2]);
});

test('wing : à partir de la super prévision collectée, 6 spots, provenance gardée, pas de repli', () => {
  const t0 = Date.UTC(2026, 10, 10, 11);
  const spots: Record<string, { t: number; v: number; o: string; r: number }[]> = {};
  for (const s of registry.spots.filter((x) => x.legacy.superPrevisionVent)) spots[s.legacy.superPrevisionVent!] = [0, 1, 2].map((k) => ({ t: t0 + k * 3600e3, v: 18, o: 'ONO', r: 22 }));
  const { block } = parseSuperPrevision({ spots }, registry, t0);
  const w = wingForecast(block, registry, t0);
  assert.equal(w.spots.length, 6);
  const alm = w.spots.find((x) => x.id === 'almanarre')!;
  assert.deepEqual(alm.hours.map((h) => h.scores.secu), [10, 10, 10]);
  assert.equal(alm.sessions.secu.length, 1);
  assert.equal(w.provenance?.kind, 'corrected');
  assert.equal(wingForecast(undefined, registry, t0).available, false);
});
