// Widgets Agenda Mac (Übersicht) et iPad (Scriptable) : cœur commun (adaptateurs, préférences, modèle d'affichage),
// rendu de chaque widget sur un agenda FICTIF, réglages, états. Les images sont faites à part (CI, navigateur).
process.env.TZ = 'Europe/Paris';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as core from '../widgets/agenda/core.mjs';
import { assemble, OUTPUTS } from '../widgets/agenda/build.mjs';
import { NOW, googleV2, device, at } from './widgets/agenda-data.ts';
import { agendaV1 } from './widgets/agenda-fixture.ts';
import { load, textOf, toHtml } from './widgets/mac.mjs';
import { run, texts, urls } from './widgets/scriptable.mjs';

const MAC = 'widgets/agenda/mac/Agenda.jsx', IPAD = 'widgets/agenda/ipad/Agenda.js';
const src = () => core.fromGoogle(googleV2(), NOW);
const model = (prefs: object = {}, view: object = {}, status: object = { link: true }, s: any = src()) => core.buildModel(s, core.prefsOf(prefs), view, status, NOW);
const lines = (m: any) => m.groups.map((g: any) => `# ${g.title} (${g.countText})\n` + g.items.map((e: any) => `${e.time} ${e.title} · ${e.cal}${e.kind.label ? ` [${e.kind.label}]` : ''}${e.ongoing ? ' (en cours)' : ''}${e.ended ? ' (passé)' : ''}${e.overlap ? ' (en parallèle)' : ''}${e.status === 'tentative' ? ' (à confirmer)' : ''}${e.modified ? ' (modifié)' : ''}`).join('\n')).join('\n');

// ------------------------------------------------------------------ cœur
test('Agenda : fichiers livrés à jour avec le cœur commun ; aucun lien ni clé', () => {
  for (const [s, o] of OUTPUTS) assert.equal(readFileSync(`widgets/agenda/${o}`, 'utf8'), assemble(s), `${o} : relancer node widgets/agenda/build.mjs`);
  for (const f of [MAC, IPAD]) assert.doesNotMatch(readFileSync(f, 'utf8'), /macros\/s\/AKfy|key=[A-Za-z0-9]{12,}/);
  assert.match(readFileSync(MAC, 'utf8'), /security find-generic-password -s ocean\.agenda -w/);
  assert.doesNotMatch(readFileSync(MAC, 'utf8'), /<>|<\/>/);                               // pas de fragments (Übersicht)
});

test('Agenda : adaptateur Google (v1 et v2) — calendriers, couleurs, journées entières, champs', () => {
  const s = src();
  assert.equal(s.version, 3); assert.equal(core.dayKey(s.from), '2026-11-02'); assert.equal(core.dayKey(s.to), '2026-12-07');
  assert.deepEqual(s.calendars.map((c: any) => `${c.name} ${c.color} ${c.selected}`), ['Personnel #4285F4 true', 'BO #33B679 true', 'Loïc #8E24AA true',
    'Alexandre #F09300 true', 'Nadège #D06B64 false', 'Jours fériés en France #0B8043 true']);
  const arm = s.events.find((e: any) => e.title === 'Armistice');
  assert.equal(arm.s, new Date(2026, 10, 11).getTime()); assert.equal(arm.e, new Date(2026, 10, 12).getTime());
  const dej = s.events.find((e: any) => e.title === 'Déj Pierre'); assert.equal(dej.status, 'tentative');
  const v1 = core.fromGoogle(agendaV1(), NOW);                                                  // ancien script : agendas déduits des événements
  assert.deepEqual(v1.calendars.map((c: any) => c.name), ['Tom Perso', 'BO Prod', 'Jours fériés en France']);
  assert.equal(core.dayKey(v1.to), '2026-11-18');
  assert.throws(() => core.fromGoogle({ error: 'cle invalide' }, NOW), /refuse le lien : cle invalide/);
  assert.throws(() => core.fromGoogle({ updated: 1 }, NOW), /sans événements/);
});

test('Agenda : modèle — aujourd’hui (7 jours), horaires, nature, en cours, passé, simultanés, modifié, doublon', () => {
  const m = model({ format: 'etendu' }, { expanded: true });
  assert.equal(m.state, 'ok');
  assert.deepEqual(m.header, { num: 11, month: 'Novembre', isToday: true, sub: 'Aujourd\'hui, mercredi' });
  assert.equal(m.sync, 'Synchro 10:17');
  assert.deepEqual(m.week.days.map((d: any) => `${d.dow}${d.num}${d.sel ? '*' : ''}${d.today ? '!' : ''}:${d.colors.length}`),
    ['LUN9:0', 'MAR10:0', 'MER11*!:3', 'JEU12:2', 'VEN13:2', 'SAM14:0', 'DIM15:0']);
  assert.deepEqual(m.week.days[2].colors, ['#33B679', '#8E24AA', '#0B8043']);                  // dans l'ordre des calendriers
  assert.equal(lines(m), [
    '# Aujourd\'hui 11 (7 événements)',
    'Toute la journée Armistice · Jours fériés en France [Férié]',
    '09:00 – 09:45 Point prod · BO (passé)',
    '10:00 – 11:00 Manon x BO · BO [Réunion] (en cours)',                                       // une seule fois (aussi dans Loïc)
    '11:00 – 12:00 Kick-off Monster x Honda @chili · BO [Call]',                               // « Kick-off » n'est pas une absence
    '14:00 – 15:00 Batch 650s ADV · BO [BO] (en parallèle) (modifié)',
    '14:30 – 15:30 Point Enedis · Loïc [Call] (en parallèle)',
    '23:00 – 01:00 (lendemain) Rendu nuit · BO',
    '# Demain 12 (3 événements)',
    'Jusqu\'à 01:00 Rendu nuit · BO',
    '12:30 – 14:00 Déj Pierre · Personnel [Réunion] (à confirmer)',
    '22:00 – 22:30 Call Sydney · Personnel [Call]',                                              // créé à 8 h heure de Sydney
    '# Vendredi 13 (2 événements)',
    'Toute la journée Tiphaine off · Alexandre [Absence]',
    '11:00 – 12:00 Weekly Loic X Tancrede · Loïc [Réunion]',
    '# Lundi 16 (3 événements)',
    'Toute la journée Jordan OFF · Alexandre [Absence]',
    '08:30 – 13:00 Alex OFF · Alexandre [Absence] (en parallèle)',
    '10:30 – 11:30 WEEKLY - BAND ORIGINALE · BO [Réunion] (en parallèle)'].join('\n'));
  assert.ok(!lines(m).includes('Nadège'));                                                       // décoché dans Google : masqué par défaut
  assert.equal(m.groups[0].items[2].dur, '1 h'); assert.equal(m.groups[0].items[1].dur, '45 min');
  assert.equal(m.hidden, 0);
});

test('Agenda : formats (nombre de cartes avant « N autres événements »), déplier, périodes', () => {
  let m = model({ format: 'compact' });
  assert.equal(m.groups.reduce((n: number, g: any) => n + g.items.length, 0), 4); assert.equal(m.hidden, 11);   // 15 sur 7 jours
  assert.deepEqual(m.hiddenColors, ['#4285F4', '#33B679', '#8E24AA']);                          // dans l'ordre des calendriers
  m = model({ format: 'standard' }); assert.equal(m.hidden, 7);
  m = model({ format: 'compact' }, { expanded: true }); assert.equal(m.hidden, 0); assert.equal(m.groups.length, 4);
  m = model({ period: 'jour' }); assert.deepEqual(m.groups.map((g: any) => g.title), ['Aujourd\'hui 11']);
  m = model({ period: '3', format: 'etendu' }); assert.deepEqual(m.groups.map((g: any) => g.title), ['Aujourd\'hui 11', 'Demain 12', 'Vendredi 13']);
  m = model({ period: 'prochains', format: 'etendu' });                                         // à venir seulement, 12 au plus
  assert.equal(m.groups.reduce((n: number, g: any) => n + g.items.length, 0), 12);
  assert.ok(!lines(m).includes('Point prod'));
  assert.equal((lines(m).match(/Rendu nuit/g) || []).length, 1);                              // une fois, même s'il déborde sur demain
  m = core.buildModel(src(), core.prefsOf({ period: 'prochains' }), { sel: '2026-11-20' }, { link: true }, NOW);
  assert.equal(lines(m), '# Lundi 23 (1 événement)\nToute la journée · jusqu\'au 25 novembre Salon Paris · BO');
  m = model({ past: 'hidden', format: 'etendu' }); assert.ok(!lines(m).includes('Point prod')); assert.ok(lines(m).includes('Armistice'));
});

test('Agenda : navigation — jour choisi, semaine suivante / précédente, limites, hors période', () => {
  let m = model({}, { sel: '2026-11-13' });
  assert.deepEqual(m.header, { num: 13, month: 'Novembre', isToday: false, sub: 'Vendredi' });
  assert.equal(m.groups[0].title, 'Vendredi 13'); assert.equal(m.week.days[4].sel, true); assert.equal(m.week.days[2].today, true);
  assert.equal(m.week.nextKey, '2026-11-20'); assert.equal(m.week.prevKey, '2026-11-06');
  m = model({}, { sel: '2026-11-04' });                                                         // semaine dernière
  assert.equal(m.groups[0].items[0].title, 'Footing'); assert.equal(m.groups[0].items[0].ended, true); assert.equal(m.week.canPrev, false);
  m = model({}, { sel: '2026-12-02' }); assert.equal(m.week.canNext, false); assert.equal(m.state, 'vide');
  m = model({}, { sel: '2026-12-09' }); assert.equal(m.state, 'hors-plage');
  m = model({}, { sel: '2026-11-12' }); assert.equal(m.header.sub, 'Demain, jeudi');
});

test('Agenda : calendriers — afficher, masquer, ordre, par défaut, aucun affiché', () => {
  let p = core.prefsOf(null);
  let cals = core.calendarsOf(src(), p);
  p = core.toggleCalendar(p, cals.find((c: any) => c.name === 'Nadège'));                       // afficher un calendrier décoché dans Google
  assert.deepEqual(p.visible, { 'Nadège': true });
  assert.match(lines(core.buildModel(src(), p, { sel: '2026-11-12' }, { link: true }, NOW)), /15:00 – 16:00 RDV Nadège · Nadège/);
  cals = core.calendarsOf(src(), p);
  p = core.toggleCalendar(p, cals.find((c: any) => c.name === 'Nadège')); assert.deepEqual(p.visible, {});   // retour au choix de Google
  p = core.toggleCalendar(p, core.calendarsOf(src(), p).find((c: any) => c.name === 'BO'));
  let m = core.buildModel(src(), p, {}, { link: true }, NOW);
  assert.match(lines(m), /10:00 – 11:00 Manon x BO · Loïc/);                                     // BO masqué : la réunion reste via Loïc
  assert.ok(!lines(m).includes('Point prod'));
  p = core.moveCalendar(p, core.calendarsOf(src(), p), 'Alexandre', 0);
  assert.deepEqual(core.calendarsOf(src(), p).map((c: any) => c.name), ['Alexandre', 'Personnel', 'BO', 'Loïc', 'Nadège', 'Jours fériés en France']);
  p = { ...p, def: 'BO' };
  m = core.buildModel(src(), p, { sel: '2026-11-13' }, { link: true }, NOW);
  assert.equal(core.newEventUrl(m, NOW), 'https://calendar.google.com/calendar/render?action=TEMPLATE&dates=20261113T090000/20261113T100000&src=c_bo%40group.calendar.google.com');
  const none = Object.fromEntries(core.calendarsOf(src(), p).map((c: any) => [c.name, false]));
  assert.equal(core.buildModel(src(), { ...p, visible: none }, {}, { link: true }, NOW).state, 'aucun-calendrier');
});

test('Agenda : états — non connecté, chargement, erreur, vide, hors ligne', () => {
  assert.equal(model({}, {}, { link: false }, null).state, 'non-connecte');
  assert.equal(model({}, {}, { link: true, loading: true }, null).state, 'chargement');
  const e = model({}, {}, { link: true, error: 'Pas de réponse' }, null); assert.equal(e.state, 'erreur'); assert.equal(e.error, 'Pas de réponse');
  const empty = core.fromGoogle({ updated: NOW, version: 2, from: '2026-11-09', to: '2026-11-23', calendars: [], events: [] }, NOW);
  assert.equal(model({ period: 'jour' }, {}, { link: true }, empty).state, 'vide');
  assert.equal(model({}, {}, { link: true, offline: true }).sync, 'Hors ligne · synchro 10:17');
});

// ------------------------------------------------------------------ Mac (Übersicht)
const macOut = () => JSON.stringify(googleV2());
async function mac(state: object = {}, prefs: object | null = null) {
  const m = await load(MAC);
  if (prefs) m.store['ocean.agenda.prefs'] = JSON.stringify(prefs);
  const st = { ...m.mod.initialState, output: macOut(), ...state };
  return { ...m, t: textOf(toHtml(m.mod.view(st, () => {}, NOW))) };
}

test('widget Mac : commande — lien lu dans le trousseau, période du lundi de la semaine dernière sur 5 semaines', async () => {
  const { mod } = await load(MAC);
  assert.match(mod.command, /security find-generic-password -s ocean\.agenda -w/);
  assert.match(mod.command, /F=\$\(\( 1 - D - 7 \)\)/); assert.match(mod.command, /from=\$F&days=35/);
  assert.equal(mod.refreshFrequency, 300000);
});

test('widget Mac : rendu standard comme la maquette (en-tête, semaine, cartes, autres événements)', async () => {
  const { t } = await mac();
  assert.match(t, /^ \| 11 \| Novembre \| Aujourd'hui, mercredi \| LUN \| 9 \| MAR \| 10 \| MER \| 11 \| JEU \| 12/);
  assert.match(t, /Aujourd'hui 11 \| 7 événements \| Toute la journée \| Armistice \| Férié \| 09:00 – 09:45 \| Point prod \| 10:00 – 11:00 \| en cours \| Manon x BO \| Réunion/);
  assert.match(t, /11:00 – 12:00 \| Kick-off Monster x Honda @chili \| Call/);
  assert.match(t, /14:00 – 15:00 \| en parallèle \| modifié \| Batch 650s ADV \| BO/);
  assert.match(t, /7 autres événements \| Synchro 10:17/);
  assert.doesNotMatch(t, /Calendriers/);
});

test('widget Mac : formats, détail, réglages, états', async () => {
  let { t } = await mac({}, { format: 'compact' });
  assert.match(t, /L \| 9 \| M \| 10 \| M \| 11/); assert.doesNotMatch(t, /\| Réunion \|/); assert.match(t, /11 autres \| Synchro 10:17/);   // compact : texte court (la synchro est masquée par le style)
  ({ t } = await mac({}, { format: 'etendu' }));
  assert.match(t, /10:00 \| 11:00 \| 1 h \| Manon x BO \| BO \| en cours \| Réunion/);   // étendu : colonne des heures
  assert.match(t, /Journée \| Armistice \| Jours fériés en France \| Férié/);
  ({ t } = await mac({ view: { sel: null, detail: 'manon' } }));
  assert.match(t, /Retour \| Manon x BO \| Mercredi 11 novembre · 10:00 – 11:00 \(1 h\) \| BO \| 2 invités \| Ouvrir dans Google Agenda/);
  ({ t } = await mac({ settings: true }));
  assert.match(t, /Calendriers \| Coche ceux à afficher.* \| Personnel \| BO \| Loïc \| Alexandre \| Nadège \| décoché dans Google Agenda \| Jours fériés en France/);
  assert.match(t, /Période \| Aujourd'hui \| 3 jours \| 7 jours \| Prochains \| Format \| Compact \| Standard \| Étendu/);
  assert.match(t, /Google Agenda · Synchro 10:17 \| Actualiser \| Changer le lien du script…/);
  ({ t } = await mac({ output: '@@NOLINK@@' })); assert.match(t, /Agenda non connecté \| Branche ton script Google.* \| Brancher le lien…/);
  ({ t } = await mac({ output: undefined })); assert.match(t, /Chargement de l'agenda…/);
  ({ t } = await mac({ output: '<html>Erreur</html>' })); assert.match(t, /Synchronisation impossible \| Le script Google a renvoyé une page/);
  ({ t } = await mac({ output: '{"error":"cle invalide"}' })); assert.match(t, /refuse le lien : cle invalide \| Réessayer/);
});

test('widget Mac : hors ligne → dernières données gardées ; préférences, position et taille retenues', async () => {
  const m = await load(MAC);
  const s0 = { ...m.mod.initialState };
  const s1 = m.mod.updateState({ type: 'UB/COMMAND_RAN', output: macOut() }, s0);
  textOf(toHtml(m.mod.view(s1, () => {}, NOW)));                                                // première synchro : mise en cache
  const s2 = m.mod.updateState({ type: 'UB/COMMAND_RAN', output: '@@OFFLINE@@' }, s1);
  const t = textOf(toHtml(m.mod.view(s2, () => {}, NOW)));
  assert.match(t, /Manon x BO/); assert.match(t, /Hors ligne · synchro 10:17/);
  let s = m.mod.updateState({ type: 'NAV', sel: '2026-11-16' }, s2);
  assert.match(textOf(toHtml(m.mod.view(s, () => {}, NOW))), /Lundi 16 \| 3 événements \| Toute la journée \| Jordan OFF \| Absence/);
  s = m.mod.updateState({ type: 'PREFS', prefs: { ...core.prefsOf(null), period: 'jour' } }, s);
  assert.equal(JSON.parse(m.store['ocean.agenda.prefs']).period, 'jour');
  s = m.mod.updateState({ type: 'POS', x: 300, y: 120 }, s); s = m.mod.updateState({ type: 'END_MOVE' }, s);
  s = m.mod.updateState({ type: 'SIZE', w: 520, h: 700 }, s); s = m.mod.updateState({ type: 'END_SIZE' }, s);
  const saved = JSON.parse(m.store['ocean.agenda.prefs']);
  assert.deepEqual([saved.x, saved.y, saved.w, saved.h, saved.format], [300, 120, 520, 700, 'etendu']);   // largeur → format étendu
  s = m.mod.updateState({ type: 'RESET_SIZE' }, s); assert.equal(JSON.parse(m.store['ocean.agenda.prefs']).w, null);
});

// ------------------------------------------------------------------ iPad (Scriptable)
const ipad = (opts: object = {}) => run(IPAD, { ...device(), now: NOW, ...opts });

test('widget iPad : lit les calendriers de l’iPad, chaque taille s’affiche, doublon d’une réunion retiré', async () => {
  for (const family of ['small', 'medium', 'large', 'extraLarge']) {
    const o = await ipad({ family });
    const t = texts(o.widget).join(' | ');
    assert.ok(o.widget, family);
    assert.equal(o.between[2], 6);                                                              // tous les calendriers lus, le filtre est le nôtre
    if (family === 'small') assert.match(t, /^11 \| Novembre \| Aujourd'hui, mercredi \| Toute la journée \| Armistice \| 10:00 – 11:00 \| en cours \| Manon x BO$/, t);
    if (family === 'medium') assert.match(t, /^MERCREDI \| 11 \| Novembre \| 6 événements \| Toute la journée \| Armistice \| 10:00 – 11:00 \| en cours \| Manon x BO \| 11:00 – 12:00 \| Kick-off/, t);
    if (family === 'large') {
      assert.match(t, /^11 \| Novembre \| Aujourd'hui, mercredi \| LUN \| 9 \| MAR \| 10 \| MER \| 11 .* DIM \| 15 \| Aujourd'hui 11 \| 7 événements \| Toute la journée \| Armistice \| Férié/, t);
      assert.match(t, /(\d+) autres événements$/);
      assert.equal((t.match(/Manon x BO/g) || []).length, 1);
    }
    if (family === 'extraLarge') assert.match(t, /Aujourd'hui 11 .*Demain 12 \| 4 événements .*RDV Nadège/, t);   // sur l'iPad, tous les calendriers sont affichés au départ
  }
});

test('widget iPad : liens (Calendrier ou Google), bouton +, période par Parameter, calendriers choisis dans l’app', async () => {
  let o = await ipad({ family: 'large' });
  assert.ok(urls(o.widget).includes('scriptable:///run/Agenda?action=nouveau'));
  const manon = Math.round((at(11, 10) - Date.UTC(2001, 0, 1)) / 1000);
  assert.ok(urls(o.widget).includes(`calshow:${manon}`));
  o = await ipad({ family: 'large', parameter: 'prochains' });
  assert.doesNotMatch(texts(o.widget).join(' | '), /Point prod/);
  // réglages : Calendriers affichés → masquer BO → Terminé → Terminé ; puis le widget ne montre plus BO
  o = await ipad({ inWidget: false, alerts: [0, 1, -1, -1] });
  const files = o.files;
  assert.deepEqual(JSON.parse(files['/docs/ocean-agenda.json']).visible, { BO: false });
  o = await ipad({ family: 'large', files });
  const t = texts(o.widget).join(' | ');
  assert.doesNotMatch(t, /Point prod|Kick-off/); assert.match(t, /Manon x BO/);                 // la réunion reste via Loïc
  // ouvrir dans Google Agenda
  o = await ipad({ inWidget: false, alerts: [5, -1], files });
  o = await ipad({ family: 'large', files: o.files });
  assert.ok(urls(o.widget).includes('https://calendar.google.com/calendar/r/day/2026/11/11'));
  // bouton + : éditeur d'événement de l'iPad, dans le calendrier par défaut
  o = await ipad({ inWidget: false, alerts: [2, 3, -1], files: {} });
  o = await ipad({ inWidget: false, query: { action: 'nouveau' }, files: o.files });
  assert.equal(o.edited.calendar.title, 'Loïc');
});

test('widget iPad : accès aux calendriers refusé → message clair', async () => {
  const o = await ipad({ family: 'medium', calendarDenied: true });
  assert.match(texts(o.widget).join(' | '), /Synchronisation impossible \| Accès aux calendriers refusé/);
});

// ------------------------------------------------------------------ script Google (exécuté ici avec un faux CalendarApp)
test('script Google v3 : clé, période demandée, champs des événements — et le widget sait les lire', () => {
  const gs = readFileSync('widgets/agenda/agenda-google.gs', 'utf8');
  assert.equal(readFileSync('widgets/agenda-windows/agenda-google.gs', 'utf8'), gs);           // même script pour Windows
  const fmt = (d: Date, tz: string, f: string) => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })
      .formatToParts(d).map((x) => [x.type, x.value]));
    return f.replace(/'([^']*)'/g, '§$1§').replace('yyyy', p.year).replace('MM', p.month).replace('dd', p.day).replace('HH', p.hour).replace('mm', p.minute).replace('ss', p.second).replace(/§([^§]*)§/g, '$1');
  };
  const asked: Date[] = [];
  const evt = (o: any) => ({ getTitle: () => o.title, isAllDayEvent: () => !!o.allDay, getStartTime: () => o.s, getEndTime: () => o.e, getAllDayStartDate: () => o.s, getAllDayEndDate: () => o.e,
    getId: () => o.id, getLocation: () => o.loc || '', getDescription: () => o.desc || '', getGuestList: () => new Array(o.guests || 0), isRecurringEvent: () => !!o.rec,
    getMyStatus: () => o.status || 'OWNER', getEventType: () => 'DEFAULT', getDateCreated: () => new Date(NOW - 86400e3), getLastUpdated: () => new Date(NOW - 3600e3) });
  const cal = (id: string, name: string, color: string, sel: boolean, evs: any[]) => ({ getId: () => id, getName: () => name, getColor: () => color, isSelected: () => sel, isHidden: () => false,
    getTimeZone: () => 'Europe/Paris', getEvents: (a: Date, b: Date) => { asked.push(a, b); return evs.map(evt); } });
  const perso = cal('tom@exemple.fr', 'Personnel', '#4285F4', true, [{ title: 'Dentiste', s: new Date(at(12, 9)), e: new Date(at(12, 10)), id: 'abc@google.com', loc: 'Cabinet, Nîmes', desc: '<b>Apporter</b> la carte<br>vitale' }]);
  const bo = cal('c_bo@group.calendar.google.com', 'BO', '#33B679', false, [
    { title: 'Weekly', s: new Date(at(16, 10, 30)), e: new Date(at(16, 11, 30)), id: 'w1@google.com', rec: true, guests: 8 },
    { title: 'Refusé', s: new Date(at(12, 9)), e: new Date(at(12, 10)), id: 'r@google.com', status: 'NO' },
    { title: 'Tournage', s: new Date(2026, 10, 13), e: new Date(2026, 10, 14), id: 't@google.com', allDay: true }]);
  const env = {
    CalendarApp: { getDefaultCalendar: () => perso, getAllCalendars: () => [perso, bo] },
    Session: { getScriptTimeZone: () => 'Europe/Paris' },
    Utilities: { formatDate: fmt, base64EncodeWebSafe: (s: string) => Buffer.from(s).toString('base64url') + '=' },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (t: string) => ({ setMimeType: () => ({ text: t }) }) },
    Logger: { log: () => {} }, ScriptApp: { getService: () => ({ getUrl: () => null }) },
  };
  const RealDate = Date;
  class FakeDate extends RealDate { constructor(...a: any[]) { super(...((a.length ? a : [NOW]) as [])); } static now() { return NOW; } }
  const get = new Function(...Object.keys(env), 'Date', `${gs.replace("const KEY = 'COLLE_ICI_TA_CLE';", "const KEY = 'test123';")}\nreturn doGet;`)(...Object.values(env), FakeDate);
  assert.deepEqual(JSON.parse(get({ parameter: { key: 'faux' } }).text), { error: 'cle invalide' });
  const json = JSON.parse(get({ parameter: { key: 'test123', from: '-9', days: '35' } }).text);
  assert.equal(json.version, 3); assert.equal(json.from, '2026-11-02'); assert.equal(json.to, '2026-12-07');
  assert.equal(asked[0].getTime(), new Date(2026, 10, 2).getTime());
  assert.deepEqual(json.calendars.map((c: any) => `${c.name} ${c.selected} ${c.main}`), ['Personnel true true', 'BO false false']);
  assert.deepEqual(json.events.map((e: any) => e.title), ['Dentiste', 'Weekly', 'Tournage']);           // refusé : pas envoyé
  const d = json.events[0];
  assert.equal(d.description, 'Apporter la carte\nvitale'); assert.equal(d.location, 'Cabinet, Nîmes');
  assert.equal(d.url, 'https://calendar.google.com/calendar/event?eid=' + Buffer.from('abc tom@exemple.fr').toString('base64url'));
  assert.equal(json.events[1].url, 'https://calendar.google.com/calendar/event?eid=' + Buffer.from('w1_20261116T093000Z c_bo@group.calendar.google.com').toString('base64url'));
  assert.deepEqual([json.events[2].start, json.events[2].end], ['2026-11-13', '2026-11-14']);
  // ce que le widget en fait (BO décoché dans Google : masqué par défaut, affichable)
  const s = core.fromGoogle(json, NOW);
  let m = core.buildModel(s, core.prefsOf({ period: '7' }), {}, { link: true }, NOW);
  assert.equal(lines(m), '# Aujourd\'hui 11 ()\n\n# Demain 12 (1 événement)\n09:00 – 10:00 Dentiste · Personnel [Cabinet] (modifié)');   // modifié il y a 1 h
  m = core.buildModel(s, core.prefsOf({ period: '7', visible: { BO: true } }), {}, { link: true }, NOW);
  assert.match(lines(m), /# Lundi 16 \(1 événement\)\n10:30 – 11:30 Weekly · BO \[Réunion\]/);
  assert.equal(m.groups.find((g: any) => g.key === '2026-11-16').items[0].recurring, true);
});
