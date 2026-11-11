// Agenda FICTIF pour les tests des widgets Agenda Mac et iPad (aucune donnée réelle : le dépôt est public).
// Inspiré de la maquette : calendriers Personnel, BO, Loïc, Alexandre (affichés), Nadège (décoché dans Google), jours fériés.
export const NOW = Date.UTC(2026, 10, 11, 9, 20);            // mercredi 11 novembre 2026, 10 h 20 à Paris

/** Heure de Paris (UTC+1 en novembre) → millisecondes. */
export const at = (day: number, h: number, m = 0, month = 10) => Date.UTC(2026, month, day, h - 1, m);

export const CALS = [
  { id: 'tom@exemple.fr', name: 'Personnel', color: '#4285F4', selected: true, main: true, tz: 'Europe/Paris' },
  { id: 'c_bo@group.calendar.google.com', name: 'BO', color: '33b679', selected: true, tz: 'Europe/Paris' },
  { id: 'loic@exemple.fr', name: 'Loïc', color: '#8E24AA', selected: true, tz: 'Europe/Paris' },
  { id: 'alex@exemple.fr', name: 'Alexandre', color: '#F09300', selected: true, tz: 'Europe/Paris' },
  { id: 'nadege@exemple.fr', name: 'Nadège', color: '#D06B64', selected: false, tz: 'Europe/Paris' },
  { id: 'fr.french#holiday@group.v.calendar.google.com', name: 'Jours fériés en France', color: '#0B8043', selected: true, tz: 'Europe/Paris' },
];
const C = Object.fromEntries(CALS.map((c) => [c.name, c]));
type E = Record<string, unknown>;
const ev = (cal: string, title: string, start: number | string, end: number | string, extra: E = {}): E => ({
  title, calendar: cal, calendarId: C[cal].id, color: C[cal].color, allDay: typeof start === 'string', start, end, tz: C[cal].tz,
  uid: `${title}|${start}`, location: '', description: '', guests: 0, recurring: false, myStatus: 'OWNER', type: 'DEFAULT', ...extra,
});

/** Réponse du script Google v3 (agenda-google.gs), du lundi 2 novembre au lundi 7 décembre. */
export function googleV2(): any {
  return {
    updated: NOW - 3 * 60e3, version: 3, from: '2026-11-02', to: '2026-12-07', calendars: CALS,
    events: [
      ev('Personnel', 'Footing', at(4, 7), at(4, 8)),                                                     // semaine dernière
      ev('Jours fériés en France', 'Armistice', '2026-11-11', '2026-11-12'),
      ev('BO', 'Point prod', at(11, 9), at(11, 9, 45)),
      ev('BO', 'Manon x BO', at(11, 10), at(11, 11), { guests: 2, uid: 'manon' }),
      ev('Loïc', 'Manon x BO', at(11, 10), at(11, 11), { guests: 2, uid: 'manon' }),                     // même réunion, autre calendrier
      ev('BO', 'Kick-off Monster x Honda @chili', at(11, 11), at(11, 12), { location: 'https://meet.google.com/abc-defg-hij', guests: 5 }),
      ev('BO', 'Batch 650s ADV', at(11, 14), at(11, 15), { location: 'BO, 12 rue de la Gare, Montpellier', created: NOW - 3 * 86400e3, updated: NOW - 2 * 3600e3 }),
      ev('Loïc', 'Point Enedis', at(11, 14, 30), at(11, 15, 30), { description: 'Lien : https://zoom.us/j/123' }),
      ev('BO', 'Rendu nuit', at(11, 23), at(12, 1)),
      ev('Personnel', 'Déj Pierre', at(12, 12, 30), at(12, 14), { myStatus: 'INVITED', guests: 1 }),
      ev('Nadège', 'RDV Nadège', at(12, 15), at(12, 16)),
      ev('Personnel', 'Call Sydney', Date.UTC(2026, 10, 12, 21, 0), Date.UTC(2026, 10, 12, 21, 30), { tz: 'Australia/Sydney' }),   // 8 h à Sydney = 22 h à Paris
      ev('Alexandre', 'Tiphaine off', '2026-11-13', '2026-11-14'),
      ev('Loïc', 'Weekly Loic X Tancrede', at(13, 11), at(13, 12), { guests: 3, recurring: true }),
      ev('Alexandre', 'Jordan OFF', '2026-11-16', '2026-11-17'),
      ev('Alexandre', 'Alex OFF', at(16, 8, 30), at(16, 13)),
      ev('BO', 'WEEKLY - BAND ORIGINALE', at(16, 10, 30), at(16, 11, 30), { guests: 8, recurring: true }),
      ev('BO', 'Salon Paris', '2026-11-23', '2026-11-26'),
    ],
  };
}

/** Calendriers de l'iPad (Scriptable) : mêmes événements, au format de l'appareil. */
export function device() {
  const g = googleV2();
  const calendars = CALS.map((c) => ({ identifier: c.id, title: c.name, color: c.color.startsWith('#') ? c.color : '#' + c.color }));
  const day = (k: string) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d).getTime(); };
  const events = g.events.map((e: any, i: number) => ({
    identifier: `ev${i}`, title: e.title, location: e.location, notes: e.description, isAllDay: e.allDay, timeZone: e.tz,
    startDate: e.allDay ? day(e.start) : e.start, endDate: e.allDay ? day(e.end) - 1000 : e.end,          // iOS : fin à 23:59:59
    attendees: e.guests ? Array.from({ length: e.guests + 1 }, () => ({})) : null,
    availability: e.myStatus === 'INVITED' ? 'tentative' : 'busy', calendar: e.calendarId,
  }));
  return { calendars, events };
}
