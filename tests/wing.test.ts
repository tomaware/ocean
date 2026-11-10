// Cas écrits à la main à partir du tableau validé (docs/product/WING_SCORE.md). Ne pas « corriger » un cas
// pour faire passer le code : un écart = changement de formule = décision documentée.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadRegistry } from '../pipeline/collect/points.ts';
import { parseSuperPrevision } from '../pipeline/collect/superprevision.ts';
import { scoreHour, sessions, wingForecast, gustFactor, windFactor, label, type WingHour } from '../pipeline/engines/wing.ts';

const registry = loadRegistry();
const spot = (id: string) => registry.spots.find((s) => s.id === id)!;
const sc = (id: string, kn: number, gust: number | null, dir: number, L: 'debutant' | 'intermediaire' | 'confirme', day = true) => scoreHour(kn, gust, dir, day, spot(id), L);

test('wing : cas de référence', () => {
  // Almanarre (large 245°), 22 nd d'ONO (290° : side-on), rafales 28 (×1,27, pas rafaleux)
  assert.equal(sc('almanarre', 22, 28, 290, 'intermediaire').score, 10);
  assert.equal(sc('almanarre', 22, 28, 290, 'confirme').score, 10);
  // v1.1 (D-18) : plus de pénalité « trop de vent » avant 35 nd (v1.0 donnait 6,7 en débutant)
  assert.equal(sc('almanarre', 22, 28, 290, 'debutant').score, 10);
  assert.equal(sc('almanarre', 35, 40, 290, 'debutant').score, 10);
  assert.equal(sc('almanarre', 36, 40, 290, 'confirme').score, 0);
  assert.equal(sc('almanarre', 36, 40, 290, 'confirme').limit, 'trop de vent (plus de 35 nd)');
  // rafales fortes : vent effectif (30 + 45) / 2 = 37,5 > 35 → 0
  assert.equal(sc('almanarre', 30, 45, 290, 'confirme').score, 0);
  // La Franqui (large 100°) en tramontane (315°) : vent de terre → 0 pour tous
  for (const L of ['debutant', 'intermediaire', 'confirme'] as const) {
    const r = sc('la-franqui', 20, 26, 315, L);
    assert.equal(r.score, 0); assert.match(String(r.limit), /vent de terre/);
  }
  // La Grande-Motte (large 160°), 16 nd plein onshore : débutant 0,7
  assert.equal(sc('la-grande-motte', 16, 19, 160, 'debutant').score, 7);
  // Vent rafaleux : 18 nd, rafales 27 (×1,5) → vent effectif 22,5 ; R = 0,733
  assert.equal(sc('la-grande-motte', 18, 27, 110, 'intermediaire').score, 7.3);
  assert.equal(sc('la-grande-motte', 18, 27, 110, 'intermediaire').limit, 'vent rafaleux');
  // Le Ponant (étang), vent du nord déconseillé : × 0,6
  assert.equal(sc('le-ponant', 18, 22, 0, 'debutant').score, 6);
  assert.equal(sc('le-ponant', 18, 22, 135, 'debutant').score, 10);
  // Side-off (Espiguette, large 200°, vent de 315° = 115°)
  assert.deepEqual(['debutant', 'intermediaire', 'confirme'].map((L) => sc('port-camargue', 18, 22, 315, L as 'debutant').score), [0, 3, 6]);
  // Pas assez de vent, nuit
  assert.equal(sc('almanarre', 10, 13, 290, 'debutant').score, 0);
  assert.equal(sc('almanarre', 10, 13, 290, 'confirme').score, 2);
  assert.equal(sc('almanarre', 10, 13, 290, 'debutant').limit, 'pas assez de vent');
  assert.equal(sc('almanarre', 22, 26, 290, 'confirme', false).score, 0);
});

test('wing : facteurs et libellés', () => {
  assert.equal(windFactor(12, 'debutant'), 0); assert.equal(windFactor(15, 'debutant'), 1); assert.equal(windFactor(26, 'debutant'), 1);
  assert.equal(windFactor(35, 'intermediaire'), 1); assert.equal(windFactor(35.1, 'intermediaire'), 0);
  assert.equal(gustFactor(1.3), 1); assert.equal(gustFactor(1.6), 0.6); assert.equal(gustFactor(2.2), 0.4);
  assert.deepEqual([label(7), label(6.9), label(5), label(4.9), label(null)], ['Ça envoie', 'Ça se tente', 'Ça se tente', 'Non', '—']);
});

test('wing : sessions 2H = au moins 2 h d’affilée à 5/10', () => {
  const H = 3600e3, t0 = Date.UTC(2026, 10, 10, 9);
  const mk = (s: (number | null)[]) => s.map((x, i) => ({ t: t0 + i * H, scores: { debutant: x, intermediaire: x, confirme: x } }) as unknown as WingHour);
  const w = sessions(mk([5, 6, 4, 7, null, 8, 9, 7, 2, 6]), 'debutant');
  assert.deepEqual(w.map((x) => [x.hours, x.mean, x.peak]), [[2, 5.5, 6], [3, 8, 9]]);
  assert.equal(w[1].start, t0 + 5 * H); assert.equal(w[1].end, t0 + 8 * H);
  // une heure manquante dans la super prévision coupe la session
  const gap = mk([6, 6, 6]); gap[2].t += H;
  assert.deepEqual(sessions(gap, 'debutant').map((x) => x.hours), [2]);
});

test('wing : à partir de la super prévision collectée, 6 spots, provenance gardée, pas de repli', () => {
  const t0 = Date.UTC(2026, 10, 10, 11);
  const spots: Record<string, { t: number; v: number; o: string; r: number }[]> = {};
  for (const s of registry.spots.filter((x) => x.legacy.superPrevisionVent)) spots[s.legacy.superPrevisionVent!] = [0, 1, 2].map((k) => ({ t: t0 + k * 3600e3, v: 18, o: 'ONO', r: 22 }));
  const { block } = parseSuperPrevision({ spots }, registry, t0);
  const w = wingForecast(block, registry, t0);
  assert.equal(w.spots.length, 6);
  const alm = w.spots.find((x) => x.id === 'almanarre')!;
  assert.deepEqual(alm.hours.map((h) => h.scores.intermediaire), [10, 10, 10]);
  assert.equal(alm.sessions.intermediaire.length, 1);
  assert.equal(w.provenance?.kind, 'corrected');
  assert.equal(wingForecast(undefined, registry, t0).available, false);
});
