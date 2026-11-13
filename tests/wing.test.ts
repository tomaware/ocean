// Cas écrits à la main à partir de la formule validée (docs/product/WING_SCORE.md, v2.1). Ne pas « corriger » un cas
// pour faire passer le code : un écart = changement de formule = décision documentée.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadRegistry } from '../pipeline/collect/points.ts';
import { parseSuperPrevision } from '../pipeline/collect/superprevision.ts';
import { scoreHour, sessions, wingForecast, gustFactor, windFactor, label, effWind, isKite, KITE_LABEL, KITE_VERSION, type WingHour, type WingLevel } from '../pipeline/engines/wing.ts';

const registry = loadRegistry();
const spot = (id: string) => registry.spots.find((s) => s.id === id)!;
const sc = (id: string, kn: number, gust: number | null, dir: number, L: WingLevel, day = true) => scoreHour(kn, gust, dir, day, spot(id), L);

test('wing v2 : cas de référence, modes Sécu first / Offshore', () => {
  // Almanarre (large 245°), 22 nd d'ONO (290° : side-on), rafales 28 (× 1,27)
  assert.equal(sc('almanarre', 22, 28, 290, 'secu').score, 10);
  assert.equal(sc('almanarre', 22, 28, 290, 'offshore').score, 10);
  // v2.1 (D-49, Tom 13/11) : 1 jusqu'à 28 nd, puis 0 à 30 nd ; au-delà de 28 nd = « Kite session »
  //   avant (v2.0) : 35 nd → 10 ; maintenant → 0 (Kite session)
  assert.equal(sc('almanarre', 35, 40, 290, 'secu').score, 0);
  assert.equal(sc('almanarre', 35, 40, 290, 'secu').kite, true);
  assert.equal(sc('almanarre', 36, 40, 290, 'offshore').score, 0);
  assert.equal(sc('almanarre', 36, 40, 290, 'offshore').limit, KITE_LABEL);
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
  // v2.2 (D-50) : avant 3,3 ((12 - 11) / 3) ; maintenant (12 - 10) / 3 = 6,7
  assert.equal(sc('almanarre', 12, 15, 290, 'offshore').score, 6.7);
  assert.equal(sc('almanarre', 12, 15, 290, 'secu').score, 6.7);                  // avant 0 (12 nd = seuil Sécu first)
  assert.equal(sc('almanarre', 13, 16, 290, 'secu').score, 10);                   // avant 3,3 : « dès 13 nd tu peux partir »
  assert.equal(sc('almanarre', 10, 13, 290, 'secu').limit, 'pas assez de vent');
  assert.equal(sc('almanarre', 22, 26, 290, 'offshore', false).score, 0);
});

test('wing : facteurs et libellés', () => {
  // v2.2 (D-50) : avant windFactor(12) = 0 et 1 seulement à 15 nd ; maintenant 0 à 10, 1 dès 13 (deux modes)
  assert.equal(windFactor(10, 'secu'), 0); assert.equal(windFactor(11.5, 'offshore'), 0.5); assert.equal(windFactor(13, 'secu'), 1); assert.equal(windFactor(15, 'secu'), 1); assert.equal(windFactor(26, 'secu'), 1);
  // v2.1 (D-49) : avant, windFactor(35) = 1 et 0 au-delà de 35 ; maintenant 1 jusqu'à 28, 0,5 à 29, 0 dès 30
  assert.equal(windFactor(28, 'offshore'), 1); assert.equal(windFactor(29, 'secu'), 0.5); assert.equal(windFactor(30, 'offshore'), 0); assert.equal(windFactor(35, 'offshore'), 0);
  assert.equal(gustFactor(1.3), 1); assert.equal(gustFactor(1.6), 0.6); assert.equal(gustFactor(2.2), 0.4);
  assert.deepEqual([label(7), label(6.9), label(5), label(4.9), label(null)], ['Ça envoie', 'Ça se tente', 'Ça se tente', 'Non', '—']);
});

test('wing v2.1 : « Kite session » au-delà de 28 nd (D-49), tableau validé par Tom', () => {
  // vent régulier side-shore (Almanarre, 245° de large, vent de 335° = 90° : side) — avant → après
  const row = (kn: number) => { const r = sc('almanarre', kn, kn * 1.1, 335, 'secu'); return [r.score, r.kite]; };
  assert.deepEqual(row(26), [10, false]);   // avant 10 → 10
  assert.deepEqual(row(28), [10, false]);   // avant 10 → 10 (28 nd pile : encore du wing)
  assert.deepEqual(row(29), [5, true]);     // avant 10 → 5, 1 étoile rouge « Kite session »
  assert.deepEqual(row(30), [0, true]);     // avant 10 → 0
  assert.deepEqual(row(34), [0, true]);     // avant 10 → 0
  // le seuil se lit sur le vent de la note : 24 nd rafales 34 (× 1,42) → (24 + 34) / 2 = 29 → Kite
  assert.equal(effWind(24, 34), 29);
  assert.equal(sc('almanarre', 24, 34, 335, 'secu').kite, true);
  // 26 nd rafales 33 (× 1,27, régulier) : vent de la note 26 → pas Kite
  assert.equal(sc('almanarre', 26, 33, 335, 'secu').kite, false);
  // même règle en Offshore ; jamais la nuit
  assert.equal(sc('almanarre', 29, 31, 335, 'offshore').kite, true);
  assert.equal(isKite(32, 35, false), false);
  assert.equal(sc('almanarre', 32, 35, 335, 'secu', false).kite, false);
  // libellé : Kite session d'abord, avec la direction quand elle pose aussi problème
  assert.equal(sc('almanarre', 29, 31, 335, 'secu').limit, KITE_LABEL);
  assert.match(String(sc('la-franqui', 29, 31, 315, 'offshore').limit), /^Kite session.*vent de terre/);
});

test('wing : heures « Kite session » jamais dans un créneau, même à 5/10 (D-49)', () => {
  const H = 3600e3, t0 = Date.UTC(2026, 10, 10, 9);
  const mk = (s: [number, boolean][]) => s.map(([x, k], i) => ({ t: t0 + i * H, kite: k, scores: { secu: x, offshore: x } }) as unknown as WingHour);
  assert.deepEqual(sessions(mk([[10, false], [5, true], [5, true], [10, false]]), 'secu').map((x) => x.hours), []);
  assert.deepEqual(sessions(mk([[10, false], [10, false], [5, true], [9, false], [9, false]]), 'secu').map((x) => x.hours), [2, 2]);
});

test('wing : sessions 2H = au moins 2 h d’affilée à 5/10', () => {
  const H = 3600e3, t0 = Date.UTC(2026, 10, 10, 9);
  const mk = (s: (number | null)[]) => s.map((x, i) => ({ t: t0 + i * H, scores: { secu: x, offshore: x } }) as unknown as WingHour);
  const w = sessions(mk([5, 6, 4, 7, null, 8, 9, 7, 2, 6]), 'secu');
  assert.deepEqual(w.map((x) => [x.hours, x.mean, x.peak]), [[2, 5.5, 6], [3, 8, 9]]);
  const gap = mk([6, 6, 6]); gap[2].t += H;
  assert.deepEqual(sessions(gap, 'secu').map((x) => x.hours), [2]);
});

test('wing : à partir de la super prévision collectée, 7 spots (Le Jaï compris), provenance gardée, pas de repli', () => {
  const t0 = Date.UTC(2026, 10, 10, 11);
  const spots: Record<string, { t: number; v: number; o: string; r: number }[]> = {};
  for (const s of registry.spots.filter((x) => x.legacy.superPrevisionVent)) spots[s.legacy.superPrevisionVent!] = [0, 1, 2].map((k) => ({ t: t0 + k * 3600e3, v: 18, o: 'ONO', r: 22 }));
  const { block } = parseSuperPrevision({ spots }, registry, t0);
  const w = wingForecast(block, registry, t0);
  assert.equal(w.spots.length, 7);
  assert.equal((w.spots.find((x) => x.id === 'le-jai')!.source as any).kind, 'corrected');
  const alm = w.spots.find((x) => x.id === 'almanarre')!;
  assert.deepEqual(alm.hours.map((h) => h.scores.secu), [10, 10, 10]);
  assert.equal(alm.sessions.secu.length, 1);
  assert.equal(w.provenance?.kind, 'corrected');
  assert.equal(wingForecast(undefined, registry, t0).available, false);
});

test('wing : facteurs publiés pour expliquer la note (affichage seul, la note ne change pas)', () => {
  // La Grande-Motte, 18 nd de 110°, rafales 27 (× 1,5) : V 1, R 0,73, D 1 → 7,3
  const r = sc('la-grande-motte', 18, 27, 110, 'secu');
  assert.deepEqual(r.f, [1, 0.73, 1]);
  assert.equal(r.score, 7.3);
  // la nuit, la note reste 0 mais les facteurs restent lisibles
  const n = sc('la-grande-motte', 18, 27, 110, 'secu', false);
  assert.equal(n.score, 0); assert.equal(n.limit, 'nuit'); assert.deepEqual(n.f, [1, 0.73, 1]);
  // sur un balayage, 10 × V × R × D (facteurs arrondis au centième) reste à ±0,1 de la note publiée
  for (const kn of [8, 12, 14, 17, 22, 28, 29, 30, 35, 37]) for (const g of [1, 1.2, 1.45, 1.7, 2.1]) for (const dir of [0, 90, 135, 180, 225, 315]) for (const L of ['secu', 'offshore'] as WingLevel[]) {
    const x = sc('port-camargue', kn, kn * g, dir, L);
    assert.ok(Math.abs(10 * x.f[0] * x.f[1] * x.f[2] - x.score) <= 0.1, `${kn} nd × ${g} de ${dir}° (${L}) : ${x.f} → ${x.score}`);
  }
});

test('wing : étang de Berre hors super prévision → modèle le plus juste à Marignane, provenance « forecast », jamais mélangé (D-22)', () => {
  const t0 = Date.UTC(2026, 10, 10, 11);
  const times = [0, 1, 2].map((k) => t0 + k * 3600e3);
  const ser = (ms: number) => ({ wind_speed_10m: [ms, ms, ms], wind_gusts_10m: [ms * 1.2, ms * 1.2, ms * 1.2], wind_direction_10m: [315, 315, 315] });
  const alt = { id: 'open-meteo-vent-spots', kind: 'forecast', times, models: ['meteofrance_arome_france_hd', 'icon_d2'],
    values: { 'spot_le-jai': { meteofrance_arome_france_hd: ser(5), icon_d2: ser(10) } }, provenance: { source: 'open-meteo', fetchedAt: t0 } } as any;
  // ICON-D2 plus juste à LFML → 10 m/s = 19,4 nd retenus
  const w = wingForecast(undefined, registry, t0, { block: alt, ranking: { LFML: { meteofrance_arome_france_hd: { n: 40, mae: 2.1 }, icon_d2: { n: 40, mae: 1.2 } } } });
  assert.deepEqual(w.spots.map((x) => x.id), ['le-jai']);
  const b = w.spots[0];
  assert.equal((b.source as any).kind, 'forecast'); assert.equal((b.source as any).model, 'icon_d2'); assert.equal((b.source as any).ranked, true);
  assert.deepEqual(b.hours.map((h) => h.kn), [19.4, 19.4, 19.4]);
  assert.ok(b.hours.every((h) => h.scores.secu! > 0), 'mistral sur l’étang : naviguable');
  // relais : ICON-D2 s'arrête après 2 h → AROME HD prend le relais (même spot, jamais la super prévision)
  const alt3 = { ...alt, values: { 'spot_le-jai': { meteofrance_arome_france_hd: ser(5), icon_d2: { ...ser(10), wind_speed_10m: [10, 10, null] } } } };
  const w3 = wingForecast(undefined, registry, t0, { block: alt3, ranking: { LFML: { meteofrance_arome_france_hd: { n: 40, mae: 2.1 }, icon_d2: { n: 40, mae: 1.2 } } } });
  assert.deepEqual(w3.spots[0].hours.map((h) => h.kn), [19.4, 19.4, 9.7]);
  assert.deepEqual((w3.spots[0].source as any).relays.map((r: any) => r.model), ['icon_d2', 'meteofrance_arome_france_hd']);
  // sans classement : AROME HD, signalé
  const w2 = wingForecast(undefined, registry, t0, { block: alt });
  assert.equal((w2.spots[0].source as any).model, 'meteofrance_arome_france_hd'); assert.equal((w2.spots[0].source as any).ranked, false);
  // vent de SE (pousse vers le large de l'étang) : secteur déconseillé
  // dès que la super prévision couvre Le Jaï, elle remplace le repli (jamais de mélange)
  const sp = { id: 'super-prevision', kind: 'corrected', times, models: ['super-prevision'], values: { 'spot_le-jai': { 'super-prevision': ser(8) } }, provenance: { source: 'super-prevision', fetchedAt: t0 } } as any;
  const w4 = wingForecast(sp, registry, t0, { block: alt, ranking: { LFML: { icon_d2: { n: 40, mae: 1.2 } } } });
  const j = w4.spots.find((x) => x.id === 'le-jai')!;
  assert.equal((j.source as any).kind, 'corrected'); assert.deepEqual(j.hours.map((h) => h.kn), [15.6, 15.6, 15.6]);
  const se = scoreHour(18, 20, 150, true, registry.spots.find((s) => s.id === 'le-jai')!, 'secu');
  assert.equal(se.score, 6); assert.match(String(se.limit), /déconseillée/);
});

// ------------------------------------------------------------------ KITESURF v1.0 (D-51, Tom 13/11)
// Même formule que le wing, plage de vent kite : 0 jusqu'à 15 nd, 15 → 20, plein de 20 à 35, 0 à 40 nd.
const kc = (id: string, kn: number, gust: number | null, dir: number, L: WingLevel, day = true) => scoreHour(kn, gust, dir, day, spot(id), L, 'kite');
test('kite v1.0 : force du vent (tableau validé par Tom)', () => {
  assert.equal(KITE_VERSION, '1.0.0');
  const row = (kn: number) => kc('almanarre', kn, kn * 1.1, 335, 'secu').score;   // vent régulier side-shore
  assert.deepEqual([12, 15, 16, 18, 20, 28, 35, 37.5, 40, 42].map(row), [0, 0, 2, 6, 10, 10, 10, 5, 0, 0]);
  assert.equal(windFactor(17.5, 'offshore', 'kite'), 0.5);
  assert.equal(kc('almanarre', 16, 18, 335, 'secu').limit, 'pas assez de vent');
  assert.equal(kc('almanarre', 38, 41, 335, 'secu').limit, 'trop de vent (plus de 35 nd)');
  // jamais de « Kite session » en kite, même à 30 nd
  assert.equal(kc('almanarre', 30, 33, 335, 'secu').kite, false);
});
test('kite v1.0 : rafales et direction comme le wing, modes Sécu first / Offshore', () => {
  // La Franqui en tramontane 25 nd (vent de terre) : 0 en Sécu first, 10 en Offshore, signalé
  assert.equal(kc('la-franqui', 25, 30, 315, 'secu').score, 0);
  assert.equal(kc('la-franqui', 25, 30, 315, 'offshore').score, 10);
  assert.match(String(kc('la-franqui', 25, 30, 315, 'offshore').limit), /vent de terre/);
  // rafaleux : 24 nd rafales 36 (× 1,5) → vent de la note 30, R = 0,73
  assert.equal(kc('almanarre', 24, 36, 335, 'secu').score, 7.3);
  // nuit : 0
  assert.equal(kc('almanarre', 25, 28, 335, 'secu', false).score, 0);
});
test('wing et kite complémentaires : petit vent → wing, vent fort → kite', () => {
  const both = (kn: number) => [sc('almanarre', kn, kn * 1.1, 335, 'secu').score, kc('almanarre', kn, kn * 1.1, 335, 'secu').score];
  assert.deepEqual(both(14), [10, 0]);
  assert.deepEqual(both(22), [10, 10]);
  assert.deepEqual(both(32), [0, 10]);
});
test('kite : prévision publiée sur la super prévision collectée, même provenance que le wing', () => {
  const t0 = Date.UTC(2026, 10, 10, 11);
  const spots: Record<string, { t: number; v: number; o: string; r: number }[]> = {};
  for (const s of registry.spots.filter((x) => x.legacy.superPrevisionVent)) spots[s.legacy.superPrevisionVent!] = [0, 1, 2].map((k) => ({ t: t0 + k * 3600e3, v: 24, o: 'ONO', r: 28 }));
  const { block } = parseSuperPrevision({ spots }, registry, t0);
  const k = wingForecast(block, registry, t0, undefined, 'kite');
  assert.equal(k.sport, 'kite'); assert.equal(k.version, '1.0.0');
  assert.deepEqual((k as any).levels.secu, { min: 15, lo: 20, hi: 35, max: 40 });
  const alm = k.spots.find((x) => x.id === 'almanarre')!;
  assert.ok(alm.hours.every((h) => h.kite === false && h.scores.secu === 10));
  assert.equal(alm.sessions.secu.length, 1);
  assert.equal(k.provenance?.kind, 'corrected');
});
