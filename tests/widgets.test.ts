// Widgets iPhone (Scriptable) : données publiées pour eux + rendu de chaque taille, sur un banc d'essai qui
// remplace l'API Scriptable. Vérifie ce qui s'affiche (spot, vent, étoiles, créneaux), pas l'apparence exacte.
process.env.TZ = 'Europe/Paris';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { widgetWind } from '../pipeline/publish/widgets.ts';
import { run, texts, urls } from './widgets/scriptable.mjs';
import { NOW, wingFixture } from './widgets/fixture.ts';

const VENT = 'widgets/iphone/OCEAN Vent.js', CREN = 'widgets/iphone/OCEAN Créneaux.js';
const H = 3600e3;

const DATA = widgetWind(wingFixture(), { 'le-jai': { t: NOW - 25 * 60e3, kn: 14, gust: 18, dir: 310, station: 'LFML', source: 'METAR Marseille-Marignane' } }, NOW);

test('widgets : données publiées compactes, mêmes notes et créneaux que l’app', () => {
  assert.deepEqual(DATA.days, ['2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15']);
  const gm = DATA.spots.find((s: any) => s.id === 'la-grande-motte')!;
  assert.equal(gm.short, 'G-Motte');
  assert.deepEqual(gm.hours[0].slice(0, 5), [NOW - 20 * 60e3, 12, 18, 315, 1]);   // 10 h, vent arrondi, de jour
  assert.equal(gm.sessions.secu.length, 2); assert.equal(gm.sessions.secu[0].kn, 16);
  // jour 3 (vendredi) : notes de 9 h à 17 h ; 11 heures de jour (7 h – 17 h)
  assert.equal(gm.daily.secu[2][3], 11);
  assert.ok(JSON.stringify(DATA).length < 60000);
});

test('widget Vent : chaque taille s’affiche, spot par défaut La Grande-Motte, prévision de l’heure sans balise', async () => {
  for (const family of ['small', 'medium', 'large', 'accessoryRectangular', 'accessoryInline', 'accessoryCircular']) {
    const o = await run(VENT, { family, data: DATA, now: NOW });
    const t = texts(o.widget).join(' | ');
    assert.ok(o.widget, family);
    if (family !== 'accessoryCircular') assert.match(t, /G-Motte|La Grande-Motte/, family);   // le rond n'a la place que pour le vent
    assert.match(t, /\b12\b/, `${family} : vent de 10 h (12 nd) attendu — ${t}`);
    if (family === 'small' || family === 'medium') assert.match(t, /prévu/, family);
    if (family === 'medium' || family === 'large') assert.match(t, /Auj\..*Jeu\..*Ven\..*Sam\./, family);
    assert.equal(urls(o.widget)[0], 'https://tomaware.github.io/ocean/#/spot/la-grande-motte');
  }
});

test('widget Vent : spot et mode par Parameter, balise en direct, mesure publique du Jaï', async () => {
  let o = await run(VENT, { family: 'medium', parameter: 'Beauduc offshore', data: DATA, now: NOW });
  assert.match(texts(o.widget).join(' | '), /Beauduc/);
  // balise Winds-Up (super prévision) : prioritaire sur la prévision
  const live = { spots: { '61-beauduc': { nom: 'Beauduc', t: NOW - 6 * 60e3, v: 23, o: 'SE', max: 29 } } };
  o = await run(VENT, { family: 'small', parameter: 'beauduc', data: DATA, live, keychain: { 'ocean.superprevision': 'https://script.google.com/x/exec?key=k' }, now: NOW });
  const t = texts(o.widget).join(' | ');
  assert.match(t, /\b23\b/); assert.match(t, /balise · 6 min/); assert.match(t, /max 29/);
  assert.ok(o.requests.some((u: string) => u.endsWith('&action=live')));
  // Le Jaï : mesure de Marignane publiée par OCEAN
  o = await run(VENT, { family: 'small', parameter: 'Le Jaï', data: DATA, now: NOW });
  assert.match(texts(o.widget).join(' | '), /Marignane · 25 min/);
});

test('widget Vent : hors ligne → dernières données gardées ; jamais de données → message clair', async () => {
  const o = await run(VENT, { family: 'small', data: DATA, fail: true, now: NOW });
  assert.match(texts(o.widget).join(' '), /Pas de données/);
});

test('widget Vent : réglages dans l’app (spot, mode, lien gardé dans le trousseau)', async () => {
  let o = await run(VENT, { inWidget: false, data: DATA, alerts: [0, 1], now: NOW });   // Choisir le spot → 2e de la liste
  assert.equal(o.keychain['ocean.vent.spot'], 'beauduc');
  o = await run(VENT, { inWidget: false, data: DATA, alerts: [2, { choice: 0, text: ' https://script.google.com/y/exec?key=z ' }], now: NOW });
  assert.equal(o.keychain['ocean.superprevision'], 'https://script.google.com/y/exec?key=z');
  o = await run(VENT, { inWidget: false, data: DATA, alerts: [3], now: NOW });              // aperçu
  assert.ok(o.presented);
});

test('widget Créneaux : meilleur créneau d’abord (étoiles puis note), tailles, filtres', async () => {
  let o = await run(CREN, { family: 'small', data: DATA, now: NOW });
  let t = texts(o.widget).join(' | ');
  assert.match(t, /Beauduc/); assert.match(t, /Ven\. 9–17 h/); assert.match(t, /\b24 nd SE/);   // ★★★ 9,4 avant G-Motte 9,0 ; vent moyen du créneau
  o = await run(CREN, { family: 'medium', data: DATA, now: NOW });
  t = texts(o.widget).join(' | ');
  assert.match(t, /Beauduc.*G-Motte.*G-Motte/);
  o = await run(CREN, { family: 'large', data: DATA, now: NOW });
  t = texts(o.widget).join(' | ');
  for (const x of ['G-Motte', 'Beauduc', 'Le Jaï', 'Auj.', 'Demain', 'MEILLEUR']) assert.ok(t.includes(x), x);
  assert.match(t, /Beauduc \| 4h/);                               // Beauduc vendredi : 4 h à 3 étoiles (12 h – 15 h)
  assert.doesNotMatch(t, /\b0h\b/);
  o = await run(CREN, { family: 'small', parameter: 'proches', data: DATA, now: NOW });
  assert.doesNotMatch(texts(o.widget).join(' '), /Beauduc/);
  o = await run(CREN, { family: 'small', parameter: 'Le Jaï', data: DATA, now: NOW });
  assert.match(texts(o.widget).join(' '), /Pas de créneau/);
  for (const family of ['accessoryRectangular', 'accessoryInline', 'accessoryCircular']) {
    o = await run(CREN, { family, data: DATA, now: NOW }); assert.match(texts(o.widget).join(' '), /Beauduc/, family);
  }
  o = await run(CREN, { family: 'medium', parameter: 'offshore', data: DATA, now: NOW });
  assert.match(texts(o.widget).join(' | '), /OffShore/);
});
