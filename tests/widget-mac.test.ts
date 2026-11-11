// Widget Mac (Übersicht) : compilé et rendu hors Mac sur les mêmes jeux d'essai que les widgets iPhone et Windows.
process.env.TZ = 'Europe/Paris';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { widgetSurf, widgetWind } from '../pipeline/publish/widgets.ts';
import { surfSessions } from '../pipeline/publish/sessions.ts';
import { load, textOf, toHtml } from './widgets/mac.mjs';
import { NOW, surfFixture, wingFixture } from './widgets/fixture.ts';

const JSX = 'widgets/mac/ocean.jsx';
const WIND = widgetWind(wingFixture(), { 'le-jai': { t: NOW - 25 * 60e3, kn: 14, gust: 18, dir: 310, station: 'LFML', source: 'METAR Marseille-Marignane' } }, NOW);
const S = surfFixture(), SURF = widgetSurf(S, surfSessions(S, NOW), NOW);
const out = (live: object | null = null, wind: object | null = WIND, surf: object | null = SURF) =>
  `${wind ? JSON.stringify(wind) : ''}\n@@OCEAN@@\n${surf ? JSON.stringify(surf) : ''}\n@@OCEAN@@\n${live ? JSON.stringify(live) : ''}`;
const show = async (settings: Record<string, string>, o = out()) => { const m = await load(JSX, settings); return { ...m, t: textOf(toHtml(m.mod.view(o, NOW))) }; };

test('widget Mac : aucun secret ni lien privé dans le fichier ; lien de la super prévision lu dans le trousseau', () => {
  const src = readFileSync(JSX, 'utf8');
  assert.doesNotMatch(src, /script\.google\.com\/macros\/s\/|key=[A-Za-z0-9]{8,}/);
  assert.match(src, /security find-generic-password -s ocean\.superprevision -w/);
  assert.doesNotMatch(src, /<>|<\/>/);                                     // pas de fragments (Übersicht)
});

test('widget Mac : mêmes vents, étoiles et créneaux que les widgets iPhone et Windows', async () => {
  let { t } = await show({ CARTE_VENT: '"moyen"', CARTE_CRENEAUX: '"moyen"' });
  assert.match(t, /G-Motte \| prévision \| 12 \| nd NO/);
  assert.match(t, /Auj\. .*Jeu\. .*Ven\. .*Sam\./);
  assert.match(t, /Beauduc \| Ven\. 9–17 h \| 24 nd SE .*G-Motte .*Ven\. 9–17 h .*G-Motte .*Auj\. 13–16 h/);
  ({ t } = await show({ CARTE_VENT: '"grand"', CARTE_CRENEAUX: '"grand"' }));
  assert.match(t, /^ \| La Grande-Motte \| prévision corrigée .*Aujourd'hui \| mercredi 11 .*max 16 nd NO .*raf\. 22.*Demain \| jeudi 12/);
  assert.doesNotMatch(t, /Créneau :|Créneaux vent/);                       // ni ligne « Créneau », ni titre de la carte Créneaux
  assert.match(t, /MEILLEUR CRÉNEAU \| 8h \| Vendredi 13 · 9 h – 17 h \| Beauduc/);
  assert.match(t, /Ven 13 .*4h/);                                           // grille : Beauduc vendredi, 4 h à 3 étoiles
  ({ t } = await show({ CARTE_VENT: '"petit"', CARTE_CRENEAUX: '"masque"', SPOT: '"beauduc"' }, out({ spots: { '61-beauduc': { nom: 'Beauduc', t: NOW - 6 * 60e3, v: 23, o: 'SE', max: 29 } } })));
  assert.match(t, /Beauduc \| ● public · 6 min \| 23 \| nd SE \| max 29 nd/);
  ({ t } = await show({ CARTE_VENT: '"petit"', CARTE_CRENEAUX: '"masque"', SPOT: '"le-jai"' }));
  assert.match(t, /● 25 min \| 14/);
  ({ t } = await show({ CARTE_VENT: '"grand"', CARTE_CRENEAUX: '"masque"', SPOT: '"beauduc"' }, out({ connecte: true, spots: { '61-beauduc': { nom: 'Beauduc', t: NOW - 6 * 60e3, v: 23, o: 'SE' } } })));
  assert.match(t, /● Winds-Up abonné · 6 min/); assert.doesNotMatch(t, /nœuds · rafales/);   // plus de légende
  ({ t } = await show({ CARTE_VENT: '"masque"', CARTE_CRENEAUX: '"petit"', CRENEAUX_SPOTS: '"proches"', MODE: '"offshore"' }));
  assert.doesNotMatch(t, /Beauduc/);
});

test('widget Mac : carte Vague (même modèle que « OCEAN Vague »), hors ligne, réglages', async () => {
  let { t } = await show({ CARTE_VENT: '"masque"', CARTE_CRENEAUX: '"masque"', CARTE_VAGUE: '"grand"' });
  assert.match(t, /Carnon \| maintenant \| 0,4–0,9 \| m \| 6 s · houle SSO/);
  assert.match(t, /MEILLEUR CRÉNEAU SURF \| ★★★ \| (Carnon|Sète) · Ven\. 8–16 h · 1,[26] m · 9 s/);
  ({ t } = await show({ CARTE_VAGUE: '"moyen"', SPOT_VAGUE: '"sete"', CARTE_VENT: '"masque"', CARTE_CRENEAUX: '"masque"' }));
  assert.match(t, /Sète .*Ven\. \| ★★★ .*1,6 m \| 9 s \| 8–16 h/);
  // hors ligne : dernières données gardées (localStorage) ; jamais de données → message clair
  const w = await load(JSX, {});
  w.mod.view(out(), NOW);
  t = textOf(toHtml(w.mod.view(out(null, null, null), NOW)));
  assert.match(t, /hors ligne : dernières données/);
  const fresh = await load(JSX, {});
  assert.match(textOf(toHtml(fresh.mod.view('', NOW))), /Pas de données/);
  assert.match(fresh.mod.command, /widget-wind\.json.*@@OCEAN@@/);
});
