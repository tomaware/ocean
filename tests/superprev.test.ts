import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applySuper } from '../src/services/superprev-core.ts';
import { loadRegistry } from '../pipeline/collect/points.ts';
import { publicSpots } from '../pipeline/publish/sessions.ts';

// Super prévision privée (D-66) : calculée sur l'appareil, mêmes notes que le pipeline, seulement pour les spots couverts.
test('super prévision privée : remplace le vent public des spots couverts, garde les autres, recalcule les sessions', () => {
  const reg = loadRegistry();
  const t0 = Date.UTC(2026, 10, 16, 8);           // 9 h à Montpellier
  const times = Array.from({ length: 8 }, (_, k) => t0 + k * 3600e3);
  const pubHour = (t: number) => ({ t, kn: 8, gust: 10, dir: 120, day: true, sector: 'onshore', kite: false, scores: { secu: 1, offshore: 1 }, limit: { secu: null, offshore: null }, f: {} });
  const wing = { version: '2.3.0', provenance: { kind: 'forecast' }, spots: reg.spots.filter((s) => s.disciplines.includes('wing')).map((s) => ({ id: s.id, name: s.name, source: { kind: 'forecast' }, hours: times.map(pubHour), sessions: { secu: [], offshore: [] } })) };
  const d: any = { spots: publicSpots(reg), wing, kite: { ...wing }, surf: { spots: [] }, downwind: { runs: [] }, sessions: { sessions: [], best: {} }, meta: { disciplines: { wing: { source: 'pub' }, kite: { source: 'pub' } } } };
  // 18 nd de SE (de mer) à La Grande-Motte seulement
  const raw = { at: t0, spots: { 'la-grande-motte': times.map((t) => ({ t, v: 18, r: 22, o: 'SE', conf: 0.8 })) } };
  const out = applySuper(d, raw, t0);
  const gm = out.wing.spots.find((x: any) => x.id === 'la-grande-motte');
  assert.equal(gm.source.kind, 'corrected');
  assert.deepEqual(gm.hours.map((h: any) => h.kn).slice(0, 2), [18, 18]);
  assert.ok(gm.hours.every((h: any) => h.scores.secu >= 7));
  assert.equal(out.wing.spots.find((x: any) => x.id === 'la-franqui').source.kind, 'forecast', 'spot non couvert : Prévision vent publique');
  assert.equal(out.superPrev!.spots, 1);
  assert.ok(out.sessions.sessions.some((s: any) => s.discipline === 'wing' && s.spot === 'la-grande-motte'));
  assert.ok(out.sessions.sessions.some((s: any) => s.discipline === 'kite' && s.spot === 'la-grande-motte') === false, '18 nd : pas de session kite (rampe 15 → 20 nd)');
  assert.match(out.meta.disciplines.wing.source, /privée/);
  // sans spot couvert : données inchangées
  assert.equal(applySuper(d, { at: t0, spots: {} }, t0), d);
});
