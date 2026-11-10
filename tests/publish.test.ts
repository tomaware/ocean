import test from 'node:test';
import assert from 'node:assert/strict';
import { allSessions, bestByDiscipline, windows, publicSpots, compass, label } from '../pipeline/publish/sessions.ts';
import { publicPrivacy } from '../pipeline/publish/run.ts';
import { loadRegistry } from '../pipeline/collect/points.ts';

const H = 3600e3, T0 = Date.UTC(2026, 10, 12, 7);
const hrs = (sc: (number | null)[], day = (i: number) => true) => sc.map((s, i) => ({ t: T0 + i * H, s, day: day(i), i }));

test('sessions 2H : ≥ 2 h d’affilée à 5, de jour, à venir, coupées par un trou', () => {
  assert.deepEqual(windows(hrs([5, 6, 4, 7, 8, 9, 2]), T0).map((w) => w.idx), [[0, 1], [3, 4, 5]]);
  assert.deepEqual(windows(hrs([6, 6, 6], (i) => i !== 1), T0), []);                 // la nuit coupe
  assert.deepEqual(windows(hrs([6, 6, 6, 6]), T0 + 2 * H + 1).map((w) => w.idx), [[2, 3]]);   // le passé est ignoré
  const gap = hrs([6, 6, 6]); gap[2].t += H;
  assert.deepEqual(windows(gap, T0).map((w) => w.idx), [[0, 1]]);
});

test('sessions des 3 disciplines, textes et meilleure option par discipline', () => {
  const wing = { spots: [{ id: 'almanarre', name: 'Almanarre', hours: [0, 1, 2].map((i) => ({ t: T0 + i * H, kn: 18 + i, gust: 22, dir: 290, day: true, sector: 'side-on', conf: 0.8,
    scores: { secu: 6, offshore: 9 }, limit: { secu: 'vent rafaleux', offshore: null } })) }] };
  const surf = { spots: [{ id: 'carnon', name: 'Carnon', h: { t: [0, 1, 2].map((i) => T0 + i * H), score: [5.5, 7.2, 4], hb: [0.8, 1, 0.7], lo: [0.6, 0.8, 0.5], hi: [1, 1.2, 0.9], tp: [8, 9, 9], ws: [10, 12, 15], wd: [320, 320, 300], day: [true, true, true], conf: [0.7, 0.7, 0.7] } }] };
  const downwind = { hourFields: ['t', 'kn', 'gust', 'windFrom', 'shore', 'dir', 'bumpH', 'bumpT', 'hs', 'cross', 'debutant', 'intermediaire', 'confirme', 'day', 'roundTrip'],
    runs: [{ id: 'plagesud-grandemotte', name: 'Plage Sud → GM', a: 'Plage Sud', b: 'La Grande-Motte', hours: [0, 1].map((i) => [T0 + i * H, 18, 24, 140, 'side', 'ab', 0.9, 8, 1, 10, 4, 6.5, 7, 1, 0]) }] };
  const s = allSessions({ wing, surf, downwind }, T0);
  const w = s.find((x) => x.discipline === 'wing' && x.level === 'offshore')!;
  assert.equal(w.text, '18 nd de ONO (rafales 22) · side-on'); assert.equal(w.hours, 3);
  assert.equal(w.windyHours, 0); assert.equal(w.envoie, false);                 // 18-20 nd : pas « ça envoie » (D-19)
  const strong = allSessions({ wing: { spots: [{ ...wing.spots[0], hours: [0, 1, 2, 3, 4].map((i) => ({ ...wing.spots[0].hours[0], t: T0 + i * H, kn: 21 + i })) }] }, surf: { spots: [] }, downwind: { hourFields: downwind.hourFields, runs: [] } }, T0);
  assert.ok(strong.every((x) => x.envoie && x.windyHours === 5), 'au moins 4 h à plus de 20 nd → ça envoie');
  const su = s.find((x) => x.discipline === 'surf')!;
  assert.equal(su.hours, 2); assert.equal(su.peak, 7.2); assert.equal(su.text, '1,0 m (0,8–1,2) · 9 s · vent 6 nd de NO');
  const d = s.filter((x) => x.discipline === 'downwind');
  assert.deepEqual(d.map((x) => x.level), ['confirme', 'intermediaire']);   // même début : la meilleure d'abord
  assert.match(d[0].text, /^Plage Sud → La Grande-Motte · 18 nd de SE · houle 0,9 m · 8 s$/);
  const b = bestByDiscipline(s, 'secu');
  assert.equal(b.wing?.spot, 'almanarre'); assert.equal(b.surf?.spot, 'carnon'); assert.equal(b.downwind, null);
  assert.deepEqual([compass(0), compass(355), compass(292)], ['N', 'N', 'ONO']); assert.equal(label(5), 'Ça se tente');
});

test('publication : registre public sans identifiant Winds-Up, fuite détectée', () => {
  const reg = loadRegistry();
  const pub = JSON.stringify(publicSpots(reg));
  assert.ok(!/windsUp|1554-la-franqui/.test(pub));
  assert.equal(JSON.parse(pub).filter((s: any) => s.disciplines.includes('kite')).length, 0);
  const ids = reg.spots.map((s) => s.legacy.superPrevisionVent).filter(Boolean) as string[];
  assert.ok(publicPrivacy({ 'a.json': pub }, null, [], ids).ok);
  assert.ok(!publicPrivacy({ 'a.json': '{"live":{"spots":{}}}' }, null, [], ids).ok);
  assert.ok(!publicPrivacy({ 'a.json': '"135-la-grande-motte"' }, null, [], ids).ok);
  assert.ok(!publicPrivacy({ 'a.json': 'https://script.google.com/macros/s/x' }, null, [], ids).ok);
});
