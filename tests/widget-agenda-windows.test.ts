// Widget Agenda (Windows) : ce qu'il affiche, calculé par le script lui-même (option -Model), sur un agenda FICTIF
// au format renvoyé par le script Google agenda-google.gs (version 1 et version 2).
// Nécessite PowerShell (pwsh) ; ignoré s'il n'est pas installé. Le rendu de la carte est testé sous Windows (CI).
process.env.TZ = 'Europe/Paris';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NOW, agendaV1, agendaV2 } from './widgets/agenda-fixture.ts';

const PS = 'widgets/agenda-windows/agenda-widget.ps1';
const PWSH = process.env.OCEAN_PS ?? 'pwsh';
const hasPwsh = spawnSync(PWSH, ['-NoProfile', '-Command', '1'], { encoding: 'utf8' }).status === 0;
const DIR = mkdtempSync(join(tmpdir(), 'ocean-agenda-'));

function model(data: object, reg: object = {}, now = NOW): any {
  const f = join(DIR, `d-${Math.random().toString(36).slice(2)}.json`), out = f.replace('d-', 'm-');
  writeFileSync(f, JSON.stringify(data));
  execFileSync(PWSH, ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', PS, '-Model', out, '-DataFile', f, '-Now', String(now), '-Reglages', JSON.stringify(reg)],
    { env: { ...process.env, TZ: 'Europe/Paris', LOCALAPPDATA: DIR }, encoding: 'utf8' });
  return JSON.parse(readFileSync(out, 'utf8'));
}

test('widget Agenda : script enregistré en UTF-8 avec BOM, sans syntaxe absente de PowerShell 5.1', () => {
  const b = readFileSync(PS);
  assert.deepEqual([...b.subarray(0, 3)], [0xef, 0xbb, 0xbf]);
  assert.doesNotMatch(b.toString('utf8'), /\?\?|\?\.|\bclass\s+\w+\s*\{/);
});

test('widget Agenda : aucun lien ni clé dans le dépôt (le lien reste chiffré sur le PC)', () => {
  for (const f of [PS, 'widgets/agenda-windows/agenda-google.gs']) assert.doesNotMatch(readFileSync(f, 'utf8'), /macros\/s\/AKfy|key=[A-Za-z0-9]{12,}/);
  assert.match(readFileSync('widgets/agenda-windows/agenda-google.gs', 'utf8'), /const KEY = 'COLLE_ICI_TA_CLE'/);
});

test('widget Agenda (script v1) : jours, heures, journée entière, en cours, passé, réunion de la veille au soir', { skip: !hasPwsh && 'pwsh absent' }, () => {
  const m = model(agendaV1());
  assert.deepEqual(m.calendars.map((c: any) => `${c.name} ${c.visible}`), ['Tom Perso true', 'BO Prod true', 'Jours fériés en France true']);
  assert.equal(m.calendars[1].color, '#F83A22');                       // couleur « f83a22 » normalisée
  assert.deepEqual(m.days.map((d: any) => d.label), ['Aujourd\'hui', 'Demain', 'Vendredi', 'Samedi', 'Dimanche', 'Lundi', 'Mardi']);
  assert.equal(m.days[0].date, 'mercredi 11 novembre');
  assert.equal(m.days[0].url, 'https://calendar.google.com/calendar/r/day/2026/11/11');
  assert.deepEqual(m.days[0].items, [
    'Journée Armistice · Jours fériés en France',
    '9:00 Point prod Honda · BO Prod (passé)',
    '10:00 Call Enedis · BO Prod (en cours)',
    '14:30 Étalonnage Klorane · BO Prod',
    '20:00 Dîner Marine · Tom Perso',
    '23:00 Rendu nuit · BO Prod']);
  assert.deepEqual(m.days[1].items, ['→ 1:00 Rendu nuit · BO Prod', '9:30 Kite G-Motte · Tom Perso']);   // commencé la veille à 23 h
  assert.deepEqual(m.days[2].items, ['Journée Tournage Decathlon · BO Prod']);                           // 3 jours d'affilée
  assert.deepEqual(m.days[3].items, ['Journée Tournage Decathlon · BO Prod']);
  assert.deepEqual(m.days[4].items, ['Journée Tournage Decathlon · BO Prod']);
  assert.deepEqual(m.days[5].items, []);
  assert.equal(m.todayLeft, 5);                                                                             // journée + en cours + 3 à venir
  assert.deepEqual(m.next.slice(0, 4), ['Auj. Journée Armistice · Jours fériés en France', 'Auj. 10:00 Call Enedis · BO Prod (en cours)',
    'Auj. 14:30 Étalonnage Klorane · BO Prod', 'Auj. 20:00 Dîner Marine · Tom Perso']);
  assert.deepEqual(m.week, ['M11:3', 'J12:2', 'V13:1', 'S14:1', 'D15:1', 'L16:0', 'M17:1']);
});

test('widget Agenda : agendas choisis dans le widget, passés masqués, nombre de jours', { skip: !hasPwsh && 'pwsh absent' }, () => {
  const m = model(agendaV1(), { agendas: { 'BO Prod': false }, passes: 'masques', jours: 3 });
  assert.deepEqual(m.calendars.map((c: any) => c.visible), [true, false, true]);
  assert.equal(m.days.length, 3);
  assert.deepEqual(m.days[0].items, ['Journée Armistice · Jours fériés en France', '20:00 Dîner Marine · Tom Perso']);
  assert.deepEqual(m.days[1].items, ['9:30 Kite G-Motte · Tom Perso']);
  assert.deepEqual(m.week, ['M11:2', 'J12:1', 'V13:0', 'S14:0', 'D15:0', 'L16:0', 'M17:1']);
});

test('widget Agenda (script v2) : agendas décochés dans Google masqués par défaut, affichables dans le widget, réunion en double une seule fois', { skip: !hasPwsh && 'pwsh absent' }, () => {
  const m = model(agendaV2());
  assert.deepEqual(m.calendars.map((c: any) => `${c.name} ${c.visible}`), ['Tom Perso true', 'BO Prod true', 'Agenda Loïc false', 'Jours fériés en France true']);
  assert.ok(!m.days.flatMap((d: any) => d.items).some((s: string) => s.includes('Agenda Loïc')));
  const shown = model(agendaV2(), { agendas: { 'Agenda Loïc': true } });
  assert.equal(shown.calendars[2].visible, true);
  assert.ok(shown.days[1].items.includes('11:00 RDV banque · Agenda Loïc'));
  // « Call Enedis » est dans BO Prod et dans l'agenda de Loïc : une seule ligne, celle du premier agenda affiché
  assert.equal(shown.days[0].items.filter((s: string) => s.includes('Call Enedis')).length, 1);
  const onlyLoic = model(agendaV2(), { agendas: { 'Agenda Loïc': true, 'BO Prod': false } });
  assert.ok(onlyLoic.days[0].items.includes('10:00 Call Enedis · Agenda Loïc (en cours)'));
});

test('widget Agenda : à minuit passé, le jour change ; agenda vide', { skip: !hasPwsh && 'pwsh absent' }, () => {
  const late = model(agendaV1(), {}, NOW + 14.5 * 3600e3);                // jeudi 0 h 50
  assert.equal(late.days[0].date, 'jeudi 12 novembre');
  assert.deepEqual(late.days[0].items, ['→ 1:00 Rendu nuit · BO Prod (en cours)', '9:30 Kite G-Motte · Tom Perso']);
  const empty = model({ updated: NOW, events: [] });
  assert.deepEqual(empty.calendars, []); assert.equal(empty.todayLeft, 0); assert.deepEqual(empty.days[0].items, []);
});
