// Agenda FICTIF pour les tests du widget Agenda (aucune donnée réelle de Tom ici : le dépôt est public).
// Format : réponse du script Google agenda-google.gs (v1 : events seulement ; v2 : + calendars, calendarId, uid).
export const NOW = Date.UTC(2026, 10, 11, 9, 20);            // mercredi 11 novembre, 10 h 20 à Paris

/** Heure de Paris (UTC+1 en novembre) → millisecondes. */
const at = (day: number, h: number, m = 0) => Date.UTC(2026, 10, day, h - 1, m);

type Ev = { title: string; calendar: string; color: string; allDay: boolean; start: number | string; end: number | string; calendarId?: string; uid?: string };
const PERSO = { calendar: 'Tom Perso', color: '#9FE1E7', calendarId: 'perso@exemple' };
const BO = { calendar: 'BO Prod', color: 'f83a22', calendarId: 'c_bo@group.calendar.google.com' };
const FERIES = { calendar: 'Jours fériés en France', color: '#16A765', calendarId: 'fr.french#holiday@group.v.calendar.google.com' };
const LOIC = { calendar: 'Agenda Loïc', color: '#7BD148', calendarId: 'loic@exemple' };

const timed = (cal: object, title: string, s: number, e: number, uid?: string): Ev => ({ ...(cal as any), title, allDay: false, start: s, end: e, ...(uid ? { uid } : {}) });
const day = (cal: object, title: string, s: string, e: string): Ev => ({ ...(cal as any), title, allDay: true, start: s, end: e });

function base(): Ev[] {
  return [
    timed(PERSO, 'Dîner Marine', at(11, 20), at(11, 22, 30)),
    timed(PERSO, 'Kite G-Motte', at(12, 9, 30), at(12, 12)),
    timed(PERSO, 'Déjeuner', at(17, 12, 30), at(17, 14)),
    timed(BO, 'Point prod Honda', at(11, 9), at(11, 9, 45)),
    timed(BO, 'Call Enedis', at(11, 10), at(11, 11), 'enedis-1'),
    timed(BO, 'Étalonnage Klorane', at(11, 14, 30), at(11, 17)),
    timed(BO, 'Rendu nuit', at(11, 23), at(12, 1)),
    day(BO, 'Tournage Decathlon', '2026-11-13', '2026-11-16'),
    day(FERIES, 'Armistice', '2026-11-11', '2026-11-12'),
  ];
}

/** Script v1 : seulement les agendas cochés, sans liste d'agendas ni identifiants. */
export function agendaV1() {
  return { updated: NOW, events: base().map(({ calendarId, uid, ...e }) => e) };
}

/** Script v2 : tous les agendas (cochés ou non dans Google Agenda), une réunion présente dans deux agendas. */
export function agendaV2() {
  const evs = base();
  const i = evs.findIndex((e) => e.title === 'Étalonnage Klorane');
  evs.splice(i, 0, timed(LOIC, 'Call Enedis', at(11, 10), at(11, 11), 'enedis-1'), timed(LOIC, 'RDV banque', at(12, 11), at(12, 12)));
  return {
    updated: NOW, version: 2,
    calendars: [
      { id: PERSO.calendarId, name: PERSO.calendar, color: PERSO.color, selected: true, main: true },
      { id: BO.calendarId, name: BO.calendar, color: BO.color, selected: true },
      { id: LOIC.calendarId, name: LOIC.calendar, color: LOIC.color, selected: false },
      { id: FERIES.calendarId, name: FERIES.calendar, color: FERIES.color, selected: true },
    ],
    events: evs,
  };
}
