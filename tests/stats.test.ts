// Stats des spots (mode perso, Tom 13/11) : jours du mois avec au moins une heure de jour à 15 nd ou plus.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { monthStats, type HistoDay } from '../src/services/stats.ts';

test('stats : mois en cours et mois précédent, jours relevés à part', () => {
  const days: HistoDay[] = [['2026-10-30', 18, 3], ['2026-10-31', 9, 0], ['2026-11-01', 22, 6], ['2026-11-02', 14.9, 0], ['2026-11-13', 15, 1]];
  const [cur, prev] = monthStats(days, new Date(2026, 10, 13, 20).getTime());
  assert.deepEqual(cur, { label: 'novembre', days: 2, measured: 3, best: 22 });
  assert.deepEqual(prev, { label: 'octobre', days: 1, measured: 2, best: 18 });
  // janvier : le mois précédent est décembre de l'année d'avant
  assert.equal(monthStats([['2025-12-05', 20, 2]], new Date(2026, 0, 3).getTime())[1].days, 1);
  assert.deepEqual(monthStats([], Date.now())[0].measured, 0);
});
