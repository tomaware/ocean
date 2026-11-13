// Modules affichés par onglet et leur ordre (Profil, Tom 13/11) : un réglage par onglet, au moins un module.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { availableSubs, moveSub, orderedSubs, shownSubIds, toggleSub } from '../src/services/layout.ts';

const wind = availableSubs('wing'), houle = availableSubs('downwind');
test('modules disponibles : En direct en WIND seulement, pas de Sessions 2H en HOULE', () => {
  assert.deepEqual(wind, ['meilleure', 'favoris', 'sessions', 'prevision', 'spots', 'direct']);
  assert.deepEqual(availableSubs('surf'), ['meilleure', 'favoris', 'sessions', 'prevision', 'spots']);
  assert.deepEqual(houle, ['meilleure', 'favoris', 'prevision', 'spots']);
});
test('par défaut tout est affiché dans l’ordre habituel', () => {
  assert.deepEqual(shownSubIds(wind, undefined), wind);
});
test('masquer, ranger, réafficher', () => {
  let l = toggleSub(wind, undefined, 'sessions');
  assert.deepEqual(shownSubIds(wind, l), ['meilleure', 'favoris', 'prevision', 'spots', 'direct']);
  l = moveSub(wind, moveSub(wind, l, 'prevision', -1), 'prevision', -1);   // Prévision en premier (2 crans)
  assert.deepEqual(shownSubIds(wind, l)[0], 'prevision');
  l = toggleSub(wind, l, 'sessions');
  assert.ok(shownSubIds(wind, l).includes('sessions'));
  assert.deepEqual(moveSub(wind, l, orderedSubs(wind, l)[0], -1).order, orderedSubs(wind, l));   // déjà premier : rien ne bouge
});
test('jamais vide : le dernier module affiché ne se masque pas ; réglage vide ou abîmé → Meilleure session', () => {
  let l = { order: houle, hidden: [] as any[] };
  for (const id of houle) l = toggleSub(houle, l, id);
  assert.equal(shownSubIds(houle, l).length, 1);
  assert.deepEqual(shownSubIds(houle, { order: [], hidden: ['meilleure', 'favoris', 'prevision', 'spots'] }), ['meilleure']);
  // module inconnu ou indisponible dans l'ordre enregistré : ignoré
  assert.deepEqual(shownSubIds(houle, { order: ['direct', 'spots', 'xx' as any], hidden: [] }), ['spots', 'meilleure', 'favoris', 'prevision']);
});

import { nextDays, nextStep, startOf } from '../src/services/timeline.ts';
test('carte : 5 jours, 7 h → 21 h, lecture heure par heure', () => {
  process.env.TZ = 'Europe/Paris';
  const now = new Date(2026, 10, 13, 17, 30).getTime();
  const days = nextDays(now);
  assert.equal(days.length, 5);
  assert.deepEqual(startOf(now), { day: days[0], h: 17 });
  assert.deepEqual(startOf(new Date(2026, 10, 13, 22).getTime()), { day: days[1], h: 7 });
  assert.deepEqual(startOf(new Date(2026, 10, 13, 5).getTime()), { day: days[0], h: 7 });
  assert.deepEqual(nextStep(days, { day: days[0], h: 20 }), { day: days[0], h: 21 });
  assert.deepEqual(nextStep(days, { day: days[0], h: 21 }), { day: days[1], h: 7 });
  assert.equal(nextStep(days, { day: days[4], h: 21 }), null);
});

import { DEFAULT_LAYOUT } from '../src/services/layout.ts';
test('réglage de base de l’app (capture de Tom, 13/11)', () => {
  assert.deepEqual(shownSubIds(wind, DEFAULT_LAYOUT.wind), ['direct', 'favoris', 'sessions', 'prevision', 'spots']);
  assert.deepEqual(shownSubIds(availableSubs('surf'), DEFAULT_LAYOUT.vague), ['favoris', 'sessions', 'prevision', 'spots']);
  assert.deepEqual(shownSubIds(houle, DEFAULT_LAYOUT.houle), ['prevision', 'spots']);
});
