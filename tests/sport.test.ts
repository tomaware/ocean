// WIND : bascule Wing | Kite (D-51). Le pipeline publie les créneaux kite (discipline « kite ») à côté des créneaux
// wing ; l'app présente l'un ou l'autre dans l'onglet WIND sans rien recalculer.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadRegistry } from '../pipeline/collect/points.ts';
import { parseSuperPrevision } from '../pipeline/collect/superprevision.ts';
import { wingForecast } from '../pipeline/engines/wing.ts';
import { allSessions, bestByDiscipline } from '../pipeline/publish/sessions.ts';
import { forSport } from '../src/services/sport.ts';

const registry = loadRegistry();
const t0 = Date.UTC(2026, 10, 10, 10);
// 3 h de jour à 14 nd (wing seulement) puis 3 h à 32 nd (kite seulement), vent d'ONO
const spots: Record<string, { t: number; v: number; o: string; r: number }[]> = {};
for (const s of registry.spots.filter((x) => x.legacy.superPrevisionVent)) spots[s.legacy.superPrevisionVent!] = [14, 14, 14, 32, 32, 32].map((v, k) => ({ t: t0 + k * 3600e3, v, o: 'ONO', r: v + 3 }));
const { block } = parseSuperPrevision({ spots }, registry, t0);
const wing = wingForecast(block, registry, t0), kite = wingForecast(block, registry, t0, undefined, 'kite');
const sessions = allSessions({ wing, kite, surf: { spots: [] }, downwind: { runs: [], hourFields: [] } }, t0);

test('sessions publiées : wing le matin (14 nd), kite l’après-midi (32 nd), jamais l’inverse', () => {
  const w = sessions.filter((s: any) => s.discipline === 'wing' && s.spot === 'almanarre' && s.level === 'secu');
  const k = sessions.filter((s: any) => s.discipline === 'kite' && s.spot === 'almanarre' && s.level === 'secu');
  assert.deepEqual(w.map((s) => [s.start, s.hours]), [[t0, 3]]);
  assert.deepEqual(k.map((s) => [s.start, s.hours]), [[t0 + 3 * 3600e3, 3]]);
  assert.ok(k.every((s) => s.envoie === false && s.windyHours === null));   // « Ça envoie » : wing seulement
  assert.ok(new Set(sessions.map((s) => s.id)).size === sessions.length);
  assert.equal(bestByDiscipline(sessions, 'secu').kite?.discipline, 'kite');
});

test('app : forSport présente les données kite dans l’onglet WIND, sans mélange', () => {
  const best = { secu: bestByDiscipline(sessions, 'secu'), offshore: bestByDiscipline(sessions, 'offshore') };
  const d: any = { meta: { disciplines: { wing: { source: 'w' }, kite: { source: 'k' } } }, sessions: { generatedAt: t0, sessions, best }, wing, kite };
  const k = forSport(d, 'kite');
  assert.equal(k.wing.sport, 'kite');
  assert.ok(k.sessions.sessions.every((s: any) => s.discipline !== "kite"));
  assert.deepEqual(k.sessions.sessions.filter((s: any) => s.spot === "almanarre" && s.level === "secu").map((s: any) => s.start), [t0 + 3 * 3600e3]);
  assert.equal(k.sessions.best.secu.wing?.id, best.secu.kite?.id);
  assert.equal(k.meta.disciplines.wing.source, 'k');
  const w = forSport(d, 'wing');
  assert.equal(w.wing.sport, 'wing');
  assert.deepEqual(w.sessions.sessions.filter((s: any) => s.spot === "almanarre" && s.level === "secu").map((s: any) => s.start), [t0]);
  // ancienne publication sans kite.json : l'app reste en wing
  assert.equal(forSport({ ...d, kite: null }, 'kite').wing.sport, 'wing');
});
