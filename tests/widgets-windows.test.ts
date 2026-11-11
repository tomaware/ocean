// Widget Windows (PowerShell) : ce qu'il affiche, calculé par le script lui-même (option -Model) sur la même
// prévision fictive que les widgets iPhone. Mêmes règles attendues : spot, vent de l'heure, étoiles, créneaux.
// Nécessite PowerShell (pwsh) ; ignoré s'il n'est pas installé. Le rendu des cartes est testé sous Windows (CI).
process.env.TZ = 'Europe/Paris';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { widgetWind } from '../pipeline/publish/widgets.ts';
import { NOW, wingFixture } from './widgets/fixture.ts';

const PS = 'widgets/windows/ocean-widget.ps1';
const PWSH = process.env.OCEAN_PS ?? 'pwsh';   // en CI Windows : powershell (Windows PowerShell 5.1, celui des PC)
const hasPwsh = spawnSync(PWSH, ['-NoProfile', '-Command', '1'], { encoding: 'utf8' }).status === 0;
const DIR = mkdtempSync(join(tmpdir(), 'ocean-win-'));
const DATA = widgetWind(wingFixture(), { 'le-jai': { t: NOW - 25 * 60e3, kn: 14, gust: 18, dir: 310, station: 'LFML', source: 'METAR Marseille-Marignane' } }, NOW);
const DATA_FILE = join(DIR, 'data.json');
writeFileSync(DATA_FILE, JSON.stringify(DATA));

function model(reg: object = {}, live?: object): any {
  const out = join(DIR, `m-${Math.random().toString(36).slice(2)}.json`);
  const args = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', PS, '-Model', out, '-DataFile', DATA_FILE, '-Now', String(NOW), '-Reglages', JSON.stringify(reg)];
  if (live) { const f = join(DIR, 'live.json'); writeFileSync(f, JSON.stringify(live)); args.push('-LiveFile', f); }
  execFileSync(PWSH, args, { env: { ...process.env, TZ: 'Europe/Paris', LOCALAPPDATA: DIR }, encoding: 'utf8' });
  return JSON.parse(readFileSync(out, 'utf8'));
}

test('widget Windows : script enregistré en UTF-8 avec BOM (sinon accents cassés sous Windows PowerShell 5.1)', () => {
  const b = readFileSync(PS);
  assert.deepEqual([...b.subarray(0, 3)], [0xef, 0xbb, 0xbf]);
  assert.doesNotMatch(b.toString('utf8'), /\?\?|\?\.|\bclass\s+\w+\s*\{/);   // syntaxe absente de PowerShell 5.1
});

test('widget Windows : carte Vent par défaut (La Grande-Motte), prévision de l’heure, 4 jours', { skip: !hasPwsh && 'pwsh absent' }, () => {
  const m = model();
  assert.equal(m.vent.spot, 'la-grande-motte'); assert.equal(m.vent.short, 'G-Motte'); assert.equal(m.vent.level, 'secu');
  assert.deepEqual(m.vent.now, { kn: 12, gust: 18, dir: 'NO', src: 'prévu' });
  assert.equal(m.vent.in2, 16);                                             // 12 h : renfort de midi
  assert.deepEqual(m.vent.days.map((d: any) => d.label), ['Auj.', 'Jeu.', 'Ven.', 'Sam.']);
  assert.deepEqual(m.vent.days.map((d: any) => d.cr), ['13–16 h', '—', '9–17 h', '—']);
  assert.equal(m.vent.days[2].stars, 2);                                   // vendredi : 22 nd à midi → note 7,5
  assert.equal(m.vent.days[0].strip.split(',').length, 14);                 // 7 h → 20 h
  assert.deepEqual(m.vent.next.slice(0, 3), [10, 11, 12]);
});

test('widget Windows : mêmes créneaux et même ordre que le widget iPhone', { skip: !hasPwsh && 'pwsh absent' }, () => {
  const m = model();
  assert.equal(m.creneaux.label, 'Sécu first');
  assert.deepEqual(m.creneaux.days, ['Auj.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.']);
  assert.deepEqual(m.creneaux.list.map((c: any) => `${c.spot} ${c.when}`), ['Beauduc Ven. 9–17 h', 'G-Motte Ven. 9–17 h', 'G-Motte Auj. 13–16 h']);
  assert.equal(m.creneaux.list[0].kn, 24); assert.equal(m.creneaux.list[0].dir, 'SE'); assert.equal(m.creneaux.list[0].stars, 3);
  assert.equal(m.creneaux.list[0].link, 'https://tomaware.github.io/ocean/#/spot/beauduc?day=13%2F11%2F2026');
  const bd = m.creneaux.grid.find((g: any) => g.spot === 'Beauduc');
  assert.equal(bd.cells, ',,4h,,');                                          // vendredi : 4 h à 3 étoiles
  assert.doesNotMatch(m.creneaux.grid.map((g: any) => g.cells).join(','), /\b0h\b/);
});

test('widget Windows : réglages (spot, OffShore, proches) et vent en direct', { skip: !hasPwsh && 'pwsh absent' }, () => {
  let m = model({ spot: 'Beauduc', mode: 'offshore' });
  assert.equal(m.vent.spot, 'beauduc'); assert.equal(m.creneaux.label, 'OffShore');
  m = model({ creneauxSpots: 'proches' });
  assert.ok(!m.creneaux.list.some((c: any) => c.spot === 'Beauduc')); assert.equal(m.creneaux.label, 'Sécu first · proches');
  m = model({ spot: 'le-jai' });                                             // mesure publique de Marignane publiée par OCEAN
  assert.deepEqual(m.vent.now, { kn: 14, gust: 18, dir: 'NO', src: 'Marignane' });
  m = model({ spot: 'beauduc' }, { spots: { '61-beauduc': { nom: 'Beauduc', t: NOW - 6 * 60e3, v: 23, o: 'SE', max: 29 } } });
  assert.deepEqual(m.vent.now, { kn: 23, gust: 29, dir: 'SE', src: 'balise' });
  m = model({ spot: 'beauduc' }, { spots: { '61-beauduc': { nom: 'Beauduc', panne: true } } });
  assert.equal(m.vent.panne, true); assert.equal(m.vent.now.src, 'prévu');
  m = model({ spot: 'beauduc' }, { spots: { '61-beauduc': { nom: 'Beauduc', t: NOW - 3 * 3600e3, v: 30, o: 'SE' } } });
  assert.equal(m.vent.now.src, 'prévu');                                     // balise trop vieille
});
