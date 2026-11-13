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
import { widgetSurf, widgetWind } from '../pipeline/publish/widgets.ts';
import { surfSessions } from '../pipeline/publish/sessions.ts';
import { NOW, surfFixture, wingFixture } from './widgets/fixture.ts';

const PS = 'widgets/windows/ocean-widget.ps1';
const PWSH = process.env.OCEAN_PS ?? 'pwsh';   // en CI Windows : powershell (Windows PowerShell 5.1, celui des PC)
const hasPwsh = spawnSync(PWSH, ['-NoProfile', '-Command', '1'], { encoding: 'utf8' }).status === 0;
const DIR = mkdtempSync(join(tmpdir(), 'ocean-win-'));
const DATA = widgetWind(wingFixture(), { 'le-jai': { t: NOW - 25 * 60e3, kn: 14, gust: 18, dir: 310, station: 'LFML', source: 'METAR Marseille-Marignane' } }, NOW);
const DATA_FILE = join(DIR, 'data.json');
writeFileSync(DATA_FILE, JSON.stringify(DATA));
const SURF = surfFixture(), SURF_FILE = join(DIR, 'surf.json');
writeFileSync(SURF_FILE, JSON.stringify(widgetSurf(SURF, surfSessions(SURF, NOW), NOW)));

function model(reg: object = {}, live?: object, now = NOW): any {
  const out = join(DIR, `m-${Math.random().toString(36).slice(2)}.json`);
  const args = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', PS, '-Model', out, '-DataFile', DATA_FILE, '-Now', String(now), '-Reglages', JSON.stringify(reg), '-SurfFile', SURF_FILE];
  if (live) { const f = join(DIR, 'live.json'); writeFileSync(f, JSON.stringify(live)); args.push('-LiveFile', f); }
  execFileSync(PWSH, args, { env: { ...process.env, TZ: 'Europe/Paris', LOCALAPPDATA: DIR }, encoding: 'utf8' });
  return JSON.parse(readFileSync(out, 'utf8'));
}

test('widget Windows : script enregistré en UTF-8 avec BOM (sinon accents cassés sous Windows PowerShell 5.1)', () => {
  const b = readFileSync(PS);
  assert.deepEqual([...b.subarray(0, 3)], [0xef, 0xbb, 0xbf]);
  assert.doesNotMatch(b.toString('utf8'), /\?\?|\?\.|\bclass\s+\w+\s*\{/);   // syntaxe absente de PowerShell 5.1
});

test('widget Windows : carte Vent par défaut (La Grande-Motte), prévision de l’heure, 4 jours ; en grand, aujourd’hui et demain heure par heure', { skip: !hasPwsh && 'pwsh absent' }, () => {
  const m = model();
  assert.equal(m.vent.spot, 'la-grande-motte'); assert.equal(m.vent.short, 'G-Motte'); assert.equal(m.vent.level, 'secu');
  assert.deepEqual(m.vent.now, { kn: 12, gust: 18, dir: 'NO', src: 'prévu' });
  assert.equal(m.vent.label, 'prévision corrigée');                        // vent corrigé par la super prévision, pas de balise
  assert.equal(m.vent.in2, 16);                                             // 12 h : renfort de midi
  assert.deepEqual(m.vent.days.map((d: any) => d.label), ['Auj.', 'Jeu.', 'Ven.', 'Sam.']);
  assert.deepEqual(m.vent.days.map((d: any) => d.cr), ['13–16 h', '—', '9–17 h', '—']);
  assert.equal(m.vent.days[2].stars, 2);                                   // vendredi : 22 nd à midi → note 7,5
  assert.equal(m.vent.days[0].strip.split(',').length, 15);                 // 7 h → 21 h
  assert.deepEqual(m.vent.next.slice(0, 3), [10, 11, 12]);
  // grand format : aujourd'hui et demain heure par heure, 7 h → 21 h, heures passées marquées
  assert.deepEqual(m.vent.detail.map((d: any) => d.label), ['Aujourd\'hui', 'Demain']);
  assert.equal(m.vent.detail[0].date, 'mercredi 11'); assert.equal(m.vent.detail[1].date, 'jeudi 12');
  const today = m.vent.detail[0], tomorrow = m.vent.detail[1];
  assert.equal(today.kns.split(',').length, 15);
  assert.equal(today.kns.split(',').slice(0, 4).join(','), ',,,12');         // 10 h 20 : 7, 8, 9 h passées (plus publiées), vides
  assert.equal(today.kn, 16); assert.equal(today.gust, 22); assert.equal(today.cr, '13–16 h');   // max sur les heures à venir
  assert.equal(tomorrow.kns.split(',').slice(0, 11).join(','), '15,15,15,15,15,19,19,19,19,15,15');   // 7 h → 17 h
  assert.equal(tomorrow.cr, 'pas de créneau'); assert.equal(tomorrow.past, '');
  const late = model({}, undefined, NOW + 11 * 3600e3);                      // 21 h 20 : demain et après-demain
  assert.deepEqual(late.vent.detail.map((d: any) => `${d.label} ${d.date}`), ['Demain jeudi 12', 'Après-demain vendredi 13']);
});

test('widget Windows : mêmes créneaux et même ordre que le widget iPhone', { skip: !hasPwsh && 'pwsh absent' }, () => {
  const m = model();
  assert.equal(m.creneaux.label, 'Sécu first');
  assert.deepEqual(m.creneaux.days, ['Auj.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.']);
  // la nuit : plus d'heure de jour aujourd'hui → la ligne du jour (vide) disparaît, la grille reste alignée
  const night = model({}, undefined, NOW + 9 * 3600e3);                      // 19 h 20
  assert.deepEqual(night.creneaux.days, ['Jeu.', 'Ven.', 'Sam.', 'Dim.']);
  // cases (Tom, 14/11) : note du jour, comme la Prévision 5 jours de l'app
  assert.equal(night.creneaux.grid.find((g: any) => g.spot === 'Beauduc').cells, '8,1 | 10,0 | 10,0 | 10,0');
  assert.deepEqual(m.creneaux.list.map((c: any) => `${c.spot} ${c.when}`), ['Beauduc Ven. 9–17 h', 'G-Motte Ven. 9–17 h', 'G-Motte Auj. 13–16 h']);
  assert.equal(m.creneaux.list[0].kn, 24); assert.equal(m.creneaux.list[0].dir, 'SE'); assert.equal(m.creneaux.list[0].stars, 3);
  assert.equal(m.creneaux.list[0].link, 'https://tomaware.github.io/ocean/#/spot/beauduc?day=13%2F11%2F2026');
  const bd = m.creneaux.grid.find((g: any) => g.spot === 'Beauduc');
  assert.equal(bd.cells, '6,3 | 8,1 | 10,0 | 10,0 | 10,0');
  assert.equal(bd.kn, '20,23,26,29,32');                                     // cases sans créneau : vent max du jour

});

test('widget Windows : réglages (spot, OffShore, proches) et vent en direct', { skip: !hasPwsh && 'pwsh absent' }, () => {
  let m = model({ spot: 'Beauduc', mode: 'offshore' });
  assert.equal(m.vent.spot, 'beauduc'); assert.equal(m.creneaux.label, 'OffShore');
  m = model({ creneauxSpots: 'proches' });
  assert.ok(!m.creneaux.list.some((c: any) => c.spot === 'Beauduc')); assert.equal(m.creneaux.label, 'Sécu first · proches');
  m = model({ spot: 'le-jai' });                                             // mesure publique de Marignane publiée par OCEAN
  assert.deepEqual(m.vent.now, { kn: 14, gust: 18, dir: 'NO', src: 'Marignane' });
  assert.equal(m.vent.label, '● Marignane · 25 min');
  m = model({ spot: 'beauduc' }, { spots: { '61-beauduc': { nom: 'Beauduc', t: NOW - 6 * 60e3, v: 23, o: 'SE', max: 29 } } });
  assert.deepEqual(m.vent.now, { kn: 23, gust: 29, dir: 'SE', src: 'balise' });
  assert.equal(m.vent.label, '● Winds-Up public · 6 min'); assert.equal(m.vent.labelShort, '● public · 6 min');
  m = model({ spot: 'beauduc' }, { connecte: true, spots: { '61-beauduc': { nom: 'Beauduc', t: NOW - 6 * 60e3, v: 23, o: 'SE', max: 29 } } });
  assert.equal(m.vent.label, '● Winds-Up abonné · 6 min');
  m = model({ spot: 'beauduc' }, { spots: { '61-beauduc': { nom: 'Beauduc', panne: true } } });
  assert.equal(m.vent.panne, true); assert.equal(m.vent.now.src, 'prévu');
  m = model({ spot: 'beauduc' }, { spots: { '61-beauduc': { nom: 'Beauduc', t: NOW - 3 * 3600e3, v: 30, o: 'SE' } } });
  assert.equal(m.vent.now.src, 'prévu');                                     // balise trop vieille
  assert.equal(m.vent.label, 'prévision · balise il y a 3 h 00'); assert.equal(m.vent.labelShort, 'prévision (balise 3 h 00)');
  // la nuit (pas de prévision de l'heure) : dernier relevé de la balise, avec son âge
  m = model({ spot: 'beauduc' }, { connecte: true, spots: { '61-beauduc': { nom: 'Beauduc', t: NOW + 10 * 3600e3, v: 14, o: 'SE' } } }, NOW + 12 * 3600e3);
  assert.deepEqual(m.vent.now, { kn: 14, gust: null, dir: 'SE', src: 'balise' }); assert.equal(m.vent.label, '● Winds-Up abonné · 2 h 00');
});

test('widget Windows : carte Vague, mêmes règles que le widget iPhone « OCEAN Vague »', { skip: !hasPwsh && 'pwsh absent' }, () => {
  let m = model();
  assert.equal(m.vague.spot, 'carnon');
  assert.equal(m.vague.now, '0,4–0,9 m · 6 s · vent de mer 10 nd');
  assert.deepEqual(m.vague.days, ['Auj. 0 0,6 —', 'Jeu. 0 0,6 —', 'Ven. 3 1,2 8–16 h', 'Sam. 0 0,6 —']);
  assert.deepEqual(m.vague.detail.map((d: any) => `${d.label} ${d.date}`), ['Aujourd\'hui mercredi 11', 'Demain jeudi 12']);
  assert.equal(m.vague.best, 'Carnon Ven. 8–16 h 3 1,2 m 9 s');
  m = model({ vagueSpot: 'Sète' });
  assert.equal(m.vague.spot, 'sete');
});
