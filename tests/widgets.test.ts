// Widgets iPhone (Scriptable) : données publiées pour eux + rendu de chaque taille, sur un banc d'essai qui
// remplace l'API Scriptable. Vérifie ce qui s'affiche (spot, vent, étoiles, créneaux), pas l'apparence exacte.
process.env.TZ = 'Europe/Paris';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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
    if (family === 'small' || family === 'medium') assert.match(t, /prévision/, family);
    if (family === 'medium') assert.match(t, /Auj\..*Jeu\..*Ven\..*Sam\./, family);
    if (family === 'large') {                                         // grand : aujourd'hui et demain heure par heure (7 h → 21 h)
      assert.match(t, /^La Grande-Motte \| prévision corrigée .*Aujourd'hui \| mercredi 11 .*max 16 nd NO · raf\. 22.*Demain \| jeudi 12/, t);
      assert.doesNotMatch(t, /Créneau :/);
      assert.doesNotMatch(t, /Auj\./);
    }
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
  assert.match(t, /\b23\b/); assert.match(t, /● public · 6 min/); assert.match(t, /max 29/);
  assert.ok(o.requests.some((u: string) => u.endsWith('&action=live')));
  // Le Jaï : mesure de Marignane publiée par OCEAN
  o = await run(VENT, { family: 'small', parameter: 'Le Jaï', data: DATA, now: NOW });
  assert.match(texts(o.widget).join(' | '), /● 25 min/);
  o = await run(VENT, { family: 'large', parameter: 'Le Jaï', data: DATA, now: NOW });
  assert.match(texts(o.widget).join(' | '), /● Marignane · 25 min/);
  // abonnement Winds-Up connecté : « Winds-Up abonné » ; balise trop vieille : prévision, avec l'âge de la balise
  o = await run(VENT, { family: 'large', parameter: 'beauduc', data: DATA, live: { connecte: true, spots: { '61-beauduc': { nom: 'Beauduc', t: NOW - 6 * 60e3, v: 23, o: 'SE' } } }, keychain: { 'ocean.superprevision': 'https://script.google.com/x/exec?key=k' }, now: NOW });
  assert.match(texts(o.widget).join(' | '), /● Winds-Up abonné · 6 min/);
  o = await run(VENT, { family: 'large', parameter: 'beauduc', data: DATA, live: { connecte: true, spots: { '61-beauduc': { nom: 'Beauduc', t: NOW - 3 * 3600e3, v: 30, o: 'SE' } } }, keychain: { 'ocean.superprevision': 'https://script.google.com/x/exec?key=k' }, now: NOW });
  assert.match(texts(o.widget).join(' | '), /prévision · balise il y a 3 h 00/);
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
  // grand (comme le widget Windows) : meilleur créneau en haut, spots en colonnes, jours en lignes
  o = await run(CREN, { family: 'large', data: DATA, now: NOW });
  t = texts(o.widget).join(' | ');
  for (const x of ['G-Motte', 'Beauduc', 'Le Jaï', 'Auj.', 'MEILLEUR CRÉNEAU']) assert.ok(t.includes(x), x);
  assert.match(t, /Vendredi 13 · 9–17 h/);                        // meilleur créneau : jour en toutes lettres
  assert.match(t, /Jeu 12 \|/); assert.match(t, /Ven 13 \|/);     // lignes = jours
  assert.match(t, /Ven 13 \| 4h \| 4h \| 18/);                    // vendredi : 4 h pour G-Motte et Beauduc, Le Jaï sans créneau → vent max
  assert.doesNotMatch(t, /\b0h\b/);
  // la nuit : la ligne du jour, vide, disparaît (comme sur Windows)
  const night = await run(CREN, { family: 'large', data: DATA, now: NOW + 9 * H });
  assert.doesNotMatch(texts(night.widget).join(' | '), /Auj\./);
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

test('widget Vent : la grille heure par heure du grand format va de 9 h à 17 h', async () => {
  // Tom, 12/11 : 15 colonnes étaient illisibles ; la fenêtre se resserre sur 9 h → 17 h, heure par heure.
  // Le reste (bande 4 jours, créneaux, max du jour) garde 7 h → 21 h.
  const o = await run(VENT, { family: 'large', data: DATA, now: NOW });
  const t = texts(o.widget).join(' | ');
  // chaque colonne donne trois nombres : heure, vent, rafales
  const colonnes = (part: string) => part.split(' | ').filter((x) => /^\d+$/.test(x)).filter((_, i) => i % 3 === 0).map(Number);
  assert.deepEqual(colonnes(t.slice(t.indexOf('jeudi 12'))), [9, 10, 11, 12, 13, 14, 15, 16, 17]);
  assert.deepEqual(colonnes(t.slice(t.indexOf('mercredi 11'), t.indexOf('Demain'))), [10, 11, 12, 13, 14, 15, 16, 17]);   // 10 h 20 : 9 h est passée
  for (const f of [VENT, 'widgets/iphone/OCEAN Vague.js']) assert.match(readFileSync(f, 'utf8'), /const GRILLE = \[9, 17\];/, f);
});

test('widgets iPhone : aucune dimension du widget n’est devinée depuis l’écran', () => {
  // 12/11 : estimer la largeur depuis Device.screenSize() a fait déborder la carte sur l’iPhone de Tom.
  // Les grilles partent de la largeur du plus petit grand widget et se détendent avec des espaces souples.
  for (const f of [VENT, CREN, 'widgets/iphone/OCEAN Vague.js']) {
    const src = readFileSync(f, 'utf8');
    assert.doesNotMatch(src.replace(/^\s*\/\/.*$/gm, ''), /screenSize|screenResolution/, f);   // hors commentaires
    assert.match(src, /const UTILE = 264;/, f);
  }
  assert.match(readFileSync(CREN, 'utf8'), /r[.]addSpacer[(][)];\s+\/\/ espace souple/);
});
