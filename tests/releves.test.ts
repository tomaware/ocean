import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectReleves, hourly, mergePts, parseMeteoFrance, parsePioupiou, updateDays, type Pt } from '../pipeline/collect/releves.ts';
import { loadRegistry } from '../pipeline/collect/points.ts';

const NOW = Date.UTC(2026, 10, 14, 13, 0);   // 14 h à Paris
const pioupiou = (t: number, avgKmh: number) => ({ data: [
  { id: 1538, meta: { name: 'Aéromodélisme Leucatois' }, location: { latitude: 42.91, longitude: 3.03 }, measurements: { date: new Date(t).toISOString(), wind_heading: 315, wind_speed_avg: avgKmh, wind_speed_max: avgKmh * 1.4 }, status: { state: 'on' } },
  { id: 2133, meta: { name: 'La Capte' }, location: { latitude: 43.06, longitude: 6.15 }, measurements: { date: new Date(t).toISOString(), wind_heading: 90, wind_speed_avg: null }, status: { state: 'on' } },
  { id: 9, meta: { name: 'ailleurs' }, location: { latitude: 45, longitude: 5 }, measurements: { date: new Date(t).toISOString(), wind_speed_avg: 10 } }] });

test('Pioupiou : km/h → nœuds, cap en degrés, balises non retenues ignorées, mesure vide = pas de point', () => {
  const p = parsePioupiou(pioupiou(NOW, 37.04), ['1538', '2133']);
  assert.deepEqual(Object.keys(p), ['1538', '2133']);
  assert.deepEqual(p['1538'].pt, [NOW, 20, 28, 315]);
  assert.equal(p['2133'].pt, null);
});

test('Météo-France 6 min : m/s → nœuds, rafale fxi10, direction', () => {
  const x = parseMeteoFrance([{ lat: 43.4, lon: 3.69, validity_time: '2026-11-14T12:54:00Z', ff: 7.2, fxi10: 9.8, dd: 320 }, { validity_time: 'x', ff: 3 }]);
  assert.deepEqual(x.pts, [[Date.parse('2026-11-14T12:54:00Z'), 14, 19, 320]]);
  assert.equal(x.lat, 43.4);
});

test('fusion : sans doublon, 24 h glissantes ; bilan du jour au format de l’historique Winds-Up', () => {
  const pts: Pt[] = Array.from({ length: 12 }, (_, k) => [NOW - k * 3600e3, 10 + k, null, 300] as Pt);
  const m = mergePts([...pts, [NOW - 30 * 3600e3, 5, null, null]], [pts[0]], NOW);
  assert.equal(m.length, 12); assert.ok(m.every((p, i) => !i || p[0] > m[i - 1][0]));
  assert.equal(hourly(m).length, 12);
  // 14 h → 8 h de Paris aujourd'hui (7 h exclue : avant 8 h) ; 10..16 nd → max 16, heures ≥ 15 : 15 et 16 nd
  const d = updateDays([], m, NOW);
  const today = d.find((x) => x[0] === '2026-11-14')!;
  assert.deepEqual(today, ['2026-11-14', 16, 2]);
  // un bilan précédent plus complet n'est pas écrasé par une fenêtre de 24 h partielle
  assert.deepEqual(updateDays([['2026-11-14', 22, 5]], m, NOW).find((x) => x[0] === '2026-11-14'), ['2026-11-14', 22, 5]);
});

test('collecte : Pioupiou lu, Météo-France sans clé signalé, historique gardé quand une source tombe', async () => {
  const reg = loadRegistry();
  const ok = async (u: string) => ({ ok: true, status: 200, json: async () => (u.includes('pioupiou') ? pioupiou(NOW, 37.04) : []) });
  const a = await collectReleves(reg, null, NOW, {}, ok);
  assert.equal(a.sources.pioupiou.ok, true);
  assert.equal(a.sources['meteo-france'].ok, false); assert.match(a.sources['meteo-france'].message, /clé/);
  const fr = a.spots['la-franqui'][0];
  assert.equal(fr.src, 'pioupiou'); assert.equal(fr.pts.length, 1); assert.ok(fr.km! > 3 && fr.km! < 6, String(fr.km));
  assert.ok(a.days['pioupiou:1538'].length === 1);
  const down = async () => ({ ok: false, status: 503, json: async () => ({}) });
  const b = await collectReleves(reg, a, NOW + 600e3, {}, down);
  assert.equal(b.sources.pioupiou.ok, false);
  assert.equal(b.spots['la-franqui'][0].pts.length, 1, 'les relevés précédents restent');
  assert.ok(!/winds-up/i.test(JSON.stringify(b)));
});

import { compare, openLive } from '../src/services/releves-core.ts';
test('app : balise libre en direct (90 min max) et comparaison avec l’historique Winds-Up', () => {
  const pts: Pt[] = [[NOW - 3600e3, 16, null, 300], [NOW - 20 * 60e3, 18, 24, 315]];
  const r: any = { generatedAt: NOW, sources: { pioupiou: { attribution: 'OpenWindMap / Pioupiou' } }, spots: { 'la-franqui': [{ src: 'pioupiou', id: '1538', name: 'Leucate', km: 4.6, pts, status: 'ok' }] },
    days: { 'pioupiou:1538': [['2026-11-12', 12, 0], ['2026-11-13', 22, 4], ['2026-11-14', 18, 2]] } };
  const l = openLive(r, [{ id: 'la-franqui', name: 'La Franqui' }], NOW);
  assert.equal(l.length, 1); assert.equal(l[0].kn, 18); assert.equal(l[0].dir, 'NO'); assert.match(l[0].src!, /Pioupiou · Leucate · 4,6 km/); assert.equal(l[0].open, true);
  assert.equal(openLive(r, [{ id: 'la-franqui', name: 'La Franqui' }], NOW + 2 * 3600e3).length, 0, 'trop vieux');
  const h: any = { seuil: 15, heures: [8, 19], spots: { 'la-franqui': { jour: [[NOW - 3600e3, 14, 20, 'NO'], [NOW, 20, 26, 'NO']], jours: [['2026-11-12', 16, 1], ['2026-11-13', 24, 6], ['2026-11-14', 20, 3], ['2026-11-01', 30, 8]] } } };
  const [c] = compare(r, h, 'la-franqui');
  assert.equal(c.days, 3); assert.equal(c.agree, 2); assert.equal(c.wuWindy, 3); assert.equal(c.openWindy, 2);
  assert.equal(c.madMax, 2.7);                       // |16−12| + |24−22| + |20−18| = 8 / 3
  assert.deepEqual(c.today, { n: 2, mean: 0, mad: 2 }); // 13 h : 16 − 14 = +2 ; 14 h : 18 − 20 = −2
});

import { parseBuoys } from '../pipeline/collect/releves.ts';
import { buoysLive } from '../src/services/releves-core.ts';
test('bouées Candhis (D-68) : 24 h, valeurs hors bornes rejetées, spots servis, mesure ancienne signalée', () => {
  const reg = loadRegistry();
  const raw = { '03404': [{ t: NOW - 30 * 3600e3, hs: 1 }, { t: NOW - 3600e3, hs: 0.5, hmax: 0.8, tm: 5.1, dir: 168, spread: 30, sst: 17.1 }, { t: NOW - 1800e3, hs: 99, tm: 5 }],
    '01102': [{ t: NOW - 5 * 3600e3, hs: 2.4, tm: 6, dir: 198 }] };
  const b = parseBuoys(raw, reg, NOW);
  assert.deepEqual(b['03404'].pts, [[NOW - 3600e3, 0.5, 0.8, 5.1, 168, 30, 17.1], [NOW - 1800e3, null, null, 5, null, null, null]]);
  assert.ok(b['03404'].spots.some((n) => n.startsWith('Sète')) && b['03404'].spots.length === 4, b['03404'].spots.join());
  assert.equal(b['03404'].status, 'ok'); assert.equal(b['01102'].status, 'mesure ancienne');
  const live = buoysLive({ buoys: b } as any, NOW);
  assert.equal(live[0].code, '03404'); assert.equal(live[0].fresh, true); assert.equal(live[0].last![1], 0.5, 'dernière mesure valide');
  assert.ok(live.every((x) => x.spots.length || x.pts.length), 'une bouée sans mesure ni spot surf est cachée');
});

import { parseFfvl } from '../pipeline/collect/releves.ts';
test('FFVL open data : km/h → nœuds, champs de releves.json (vus le 15/11)', () => {
  const p = parseFfvl([{ idbalise: 10, date: '2026-11-15T16:19:11+01:00', vitesseVentMoy: 12, vitesseVentMax: 20, directVentMoy: 246 }, { idbalise: 11, date: 'x', vitesseVentMoy: 3 }], ['10', '11']);
  assert.deepEqual(p, { '10': [Date.parse('2026-11-15T15:19:11Z'), 6.5, 10.8, 246] });
});

import { pioupiouPt, withLive } from '../src/services/releves-core.ts';
test('direct navigateur Pioupiou : dernière mesure ajoutée une seule fois', () => {
  const p = pioupiouPt({ data: { measurements: { date: new Date(NOW).toISOString(), wind_speed_avg: 37.04, wind_speed_max: 51.86, wind_heading: 315 } } })!;
  assert.deepEqual(p, [NOW, 20, 28, 315]);
  const r: any = { spots: { 'la-franqui': [{ src: 'pioupiou', id: '1538', pts: [[NOW - 3600e3, 10, null, 300]] }] } };
  const a = withLive(r, { 'pioupiou:1538': p });
  assert.equal(a.spots['la-franqui'][0].pts.length, 2);
  assert.equal(withLive(a, { 'pioupiou:1538': p }).spots['la-franqui'][0].pts.length, 2);
  assert.equal(pioupiouPt({ data: { measurements: { date: 'x' } } }), null);
});
