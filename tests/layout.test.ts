// Modules affichés par onglet et leur ordre (Profil, Tom 13/11) : un réglage par onglet, au moins un module.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { availableSubs, moveSub, orderedSubs, shownSubIds, toggleSub } from '../src/services/layout.ts';

const wind = availableSubs('wing'), houle = availableSubs('downwind');
test('modules disponibles : En direct en WIND seulement, pas de Sessions 2H en HOULE', () => {
  assert.deepEqual(wind, ['meilleure', 'sessions', 'prevision', 'spots', 'direct']);
  assert.deepEqual(availableSubs('surf'), ['meilleure', 'sessions', 'prevision', 'spots']);
  assert.deepEqual(houle, ['meilleure', 'prevision', 'spots']);
});
test('par défaut tout est affiché dans l’ordre habituel', () => {
  assert.deepEqual(shownSubIds(wind, undefined), wind);
});
test('masquer, ranger, réafficher', () => {
  let l = toggleSub(wind, undefined, 'sessions');
  assert.deepEqual(shownSubIds(wind, l), ['meilleure', 'prevision', 'spots', 'direct']);
  l = moveSub(wind, l, 'prevision', -1);   // Prévision en premier
  assert.deepEqual(shownSubIds(wind, l)[0], 'prevision');
  l = toggleSub(wind, l, 'sessions');
  assert.ok(shownSubIds(wind, l).includes('sessions'));
  assert.deepEqual(moveSub(wind, l, orderedSubs(wind, l)[0], -1).order, orderedSubs(wind, l));   // déjà premier : rien ne bouge
});
test('jamais vide : le dernier module affiché ne se masque pas ; réglage vide ou abîmé → Meilleure session', () => {
  let l = { order: houle, hidden: [] as any[] };
  for (const id of houle) l = toggleSub(houle, l, id);
  assert.equal(shownSubIds(houle, l).length, 1);
  assert.deepEqual(shownSubIds(houle, { order: [], hidden: ['meilleure', 'prevision', 'spots'] }), ['meilleure']);
  // module inconnu ou indisponible dans l'ordre enregistré : ignoré
  assert.deepEqual(shownSubIds(houle, { order: ['direct', 'spots', 'xx' as any], hidden: [] }), ['spots', 'meilleure', 'prevision']);
});
