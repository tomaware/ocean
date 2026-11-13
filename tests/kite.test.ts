// « Kite session » (D-49) : au-delà de 28 nd (vent de la note), 1 étoile rouge et « Kite » partout, jamais de créneau
// wing. Données publiées pour les widgets + rendu iPhone, Mac et Windows sur un jeudi 31 nd à Beauduc.
process.env.TZ = 'Europe/Paris';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync, execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { widgetWind } from '../pipeline/publish/widgets.ts';
import { wingSessions } from '../pipeline/publish/sessions.ts';
import { run, texts } from './widgets/scriptable.mjs';
import { load, textOf, toHtml } from './widgets/mac.mjs';
import { NOW, kiteFixture } from './widgets/fixture.ts';

const W = kiteFixture();
const DATA = widgetWind(W, {}, NOW);
const bd = DATA.spots.find((s: any) => s.id === 'beauduc')!;

test('kite : données des widgets — drapeau par heure, heures « Kite » comptées à part, jamais en étoiles', () => {
  const thu = bd.hours.filter((h: any[]) => new Date(h[0]).getDate() === 12 && h[4]);
  assert.ok(thu.length >= 10);
  assert.ok(thu.every((h: any[]) => h[7] === 1));
  // jeudi (2e jour) : 0 heure à 1, 2 ou 3 étoiles, 11 heures de jour, 11 heures « Kite session »
  assert.deepEqual(bd.daily.secu[1], [0, 0, 0, 11, 11]);
  // une heure à 10/10 mais au-delà de 28 nd (samedi midi, 29 nd) ne compte pas en étoiles
  const sat = bd.daily.secu[3];
  assert.equal(sat[4], 4);
  assert.equal(sat[0] + sat[1] + sat[2] + sat[4], sat[3]);
});

test('kite : jamais dans un créneau wing, même à 5/10', () => {
  const hours = (W.spots.find((s) => s.id === 'beauduc')!.hours as any[]).map((h) => ({ ...h, scores: { secu: h.kite ? 6 : h.scores.secu, offshore: h.kite ? 6 : h.scores.offshore }, limit: { secu: null, offshore: null }, conf: null }));
  const out = wingSessions({ spots: [{ id: 'beauduc', name: 'Beauduc', hours, sessions: {} }] }, NOW - 86400e3);
  assert.ok(out.length > 0);
  for (const s of out) for (const h of hours) if (h.kite) assert.ok(!(h.t >= s.start && h.t < s.end), `créneau ${new Date(s.start).toISOString()} contient une heure Kite`);
});

test('kite : widget iPhone Vent et Créneaux — 1 étoile rouge « Kite »', async () => {
  let o = await run('widgets/iphone/OCEAN Vent.js', { family: 'medium', parameter: 'beauduc', data: DATA, now: NOW });
  let t = texts(o.widget).join(' | ');
  assert.match(t, /Jeu\. \| ★ \|  Kite/, t);
  o = await run('widgets/iphone/OCEAN Vent.js', { family: 'large', parameter: 'beauduc', data: DATA, now: NOW });
  t = texts(o.widget).join(' | ');
  assert.match(t, /Demain \| jeudi 12 \| ★ Kite session/, t);
  // grille Créneaux (Tom, 14/11) : colonnes rouges et pas de note les jours tout en Kite session
  o = await run('widgets/iphone/OCEAN Créneaux.js', { family: 'large', data: DATA, now: NOW });
  t = texts(o.widget).join(' | ');
  assert.match(t, /Jeu 12 \| 5,6 \| 3,1 \| Ven 13/, t);   // Beauduc jeudi tout en Kite session : pas de note
});

test('kite : widgets Mac Vent et Créneaux — 1 étoile rouge « Kite »', async () => {
  const out = `${JSON.stringify(DATA)}\n@@OCEAN@@\n@@NOLINK@@`;
  let m = await load('widgets/mac/ocean-vent.jsx', { TAILLE: '"moyen"', SPOT: '"beauduc"' });
  let html = toHtml(m.mod.view({ output: out }, () => {}, NOW));
  assert.match(textOf(html), /Jeu\. \| ★ \| Kite \| 31/);
  assert.match(html, /stars kite/);
  m = await load('widgets/mac/ocean-creneaux.jsx', { TAILLE: '"grand"' });
  html = toHtml(m.mod.view({ output: JSON.stringify(DATA) }, () => {}, NOW));
  assert.match(html, /fill="#D6343C"/);   // colonnes rouges (Kite session) dans la grille
});

const PWSH = process.env.OCEAN_PS ?? 'pwsh';
const hasPwsh = spawnSync(PWSH, ['-NoProfile', '-Command', '1'], { encoding: 'utf8' }).status === 0;
test('kite : widget Windows — jour « Kite », case « Kite » dans la grille', { skip: !hasPwsh && 'pwsh absent' }, () => {
  const dir = mkdtempSync(join(tmpdir(), 'ocean-kite-')), data = join(dir, 'd.json'), out = join(dir, 'm.json');
  writeFileSync(data, JSON.stringify(DATA));
  execFileSync(PWSH, ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'widgets/windows/ocean-widget.ps1', '-Model', out, '-DataFile', data, '-Now', String(NOW), '-Reglages', JSON.stringify({ spot: 'beauduc' })],
    { env: { ...process.env, TZ: 'Europe/Paris', LOCALAPPDATA: dir }, encoding: 'utf8' });
  const m = JSON.parse(readFileSync(out, 'utf8'));
  const thu = m.vent.days.find((d: any) => d.label === 'Jeu.');
  assert.equal(thu.stars, 0); assert.equal(thu.kite, true);
  const g = m.creneaux.grid.find((x: any) => x.spot === 'Beauduc');
  assert.match(g.cells, /Kite/);
});
