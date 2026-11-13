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

test('relevés du jour par tranche d’une heure : moyenne horaire, sinon moyenne des relevés en direct', async () => {
  process.env.TZ = 'Europe/Paris';
  const { hourSlots } = await import('../src/features/hourslots.ts');
  const d = (h: number, m = 0) => new Date(2026, 10, 13, h, m).getTime();
  const s = hourSlots([[d(18), 15, 19, 'NE'], [d(19), 18, 24, 'NE']], [[d(19, 50), 17, 'NE'], [d(20, 5), 19, 'NE'], [d(20, 20), 20, 'N'], [d(20, 45), 22, 'NE'], [d(21, 5), 23, 'NE']], d(21, 10));
  assert.deepEqual(s.map((x) => [new Date(x.t).getHours(), x.v, x.live]), [[18, 15, false], [19, 18, false], [20, 18.7, true], [21, 22.5, true]]);
});
