// Widgets Agenda (Mac, Windows) — Google Apps Script, version 3
// Renvoie aux widgets les événements de TOUS tes agendas Google (perso, BO, collègues, jours fériés…),
// avec la liste des agendas, leur couleur et le détail de chaque événement (lieu, notes, invités, lien…).
// Les agendas décochés dans Google Agenda sont aussi envoyés (« selected: false ») : les widgets les masquent
// par défaut, et tu peux les afficher depuis leurs réglages. Rien n'est jamais modifié dans ton agenda.

// Clé secrète : le widget doit l'envoyer pour lire l'agenda.
// Si tu remplaces un ancien script, GARDE ta ligne « const KEY = … » : ton lien ne change pas.
const KEY = 'COLLE_ICI_TA_CLE';

const DAYS_DEFAULT = 7;    // jours renvoyés si le widget ne précise pas (paramètre days, 1 à 42)
const DAYS_MAX = 42;
const FROM_MIN = -35;      // le widget peut demander les jours passés (paramètre from, en jours, 0 = aujourd'hui)
const NOTES_MAX = 600;     // longueur maximale des notes envoyées

function doGet(e) {
  if (!e || !e.parameter || e.parameter.key !== KEY || KEY === 'COLLE_ICI_TA_CLE') {
    return json_({ error: 'cle invalide' });
  }
  const days = Math.min(DAYS_MAX, Math.max(1, parseInt(e.parameter.days, 10) || DAYS_DEFAULT));
  const from = Math.min(0, Math.max(FROM_MIN, parseInt(e.parameter.from, 10) || 0));
  return json_(getAgenda_(from, days));
}

function getAgenda_(fromOffset, days) {
  const tz = Session.getScriptTimeZone();
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() + fromOffset);
  const to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + days);

  // Agenda principal d'abord. Une réunion présente dans plusieurs agendas garde le même « uid » :
  // les widgets ne l'affichent qu'une fois (dans le premier agenda affiché).
  const main = CalendarApp.getDefaultCalendar();
  const all = [main].concat(CalendarApp.getAllCalendars().filter((c) => c.getId() !== main.getId() && !c.isHidden()));

  const calendars = [];
  const events = [];
  all.forEach((cal) => {
    const isMain = cal.getId() === main.getId();
    const calTz = safe_(() => cal.getTimeZone(), tz);
    calendars.push({ id: cal.getId(), name: cal.getName(), color: cal.getColor(), selected: isMain || cal.isSelected(), main: isMain, tz: calTz });
    let list;
    try { list = cal.getEvents(from, to); } catch (err) { return; }
    list.forEach((ev) => {
      const myStatus = safe_(() => String(ev.getMyStatus()), '');
      if (myStatus === 'NO') return;                                   // invitations refusées : pas envoyées
      const allDay = ev.isAllDayEvent();
      const start = allDay ? ev.getAllDayStartDate() : ev.getStartTime();
      const end = allDay ? ev.getAllDayEndDate() : ev.getEndTime();
      events.push({
        title: ev.getTitle() || '(Sans titre)',
        calendar: cal.getName(),
        calendarId: cal.getId(),
        color: cal.getColor(),
        allDay: allDay,
        // Journée entière : date (aaaa-mm-jj, fin exclue) ; sinon : millisecondes (instant exact, quel que soit le fuseau)
        start: allDay ? Utilities.formatDate(start, tz, 'yyyy-MM-dd') : start.getTime(),
        end: allDay ? Utilities.formatDate(end, tz, 'yyyy-MM-dd') : end.getTime(),
        tz: calTz,
        uid: ev.getId() + '|' + start.getTime(),
        location: safe_(() => ev.getLocation(), ''),
        description: clean_(safe_(() => ev.getDescription(), '')),
        guests: safe_(() => ev.getGuestList().length, 0),
        recurring: safe_(() => ev.isRecurringEvent(), false),
        myStatus: myStatus,
        type: safe_(() => String(ev.getEventType()), 'DEFAULT'),
        created: safe_(() => ev.getDateCreated().getTime(), null),
        updated: safe_(() => ev.getLastUpdated().getTime(), null),
        url: safe_(() => eventUrl_(ev, cal, allDay, start, tz), null),
      });
    });
  });
  return { updated: Date.now(), version: 3, from: Utilities.formatDate(from, tz, 'yyyy-MM-dd'), to: Utilities.formatDate(to, tz, 'yyyy-MM-dd'), calendars: calendars, events: events };
}

// Lien direct vers l'événement dans Google Agenda (pour une occurrence d'événement récurrent : identifiant + date)
function eventUrl_(ev, cal, allDay, start, tz) {
  let id = ev.getId().split('@')[0];
  if (ev.isRecurringEvent()) id += '_' + (allDay ? Utilities.formatDate(start, tz, 'yyyyMMdd') : Utilities.formatDate(start, 'UTC', "yyyyMMdd'T'HHmmss'Z'"));
  const eid = Utilities.base64EncodeWebSafe(id + ' ' + cal.getId()).replace(/=+$/, '');
  return 'https://calendar.google.com/calendar/event?eid=' + eid;
}

// Notes : texte simple (sans HTML), raccourci
function clean_(s) {
  const t = String(s || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  return t.length > NOTES_MAX ? t.slice(0, NOTES_MAX - 1) + '…' : t;
}
function safe_(f, fallback) { try { const v = f(); return v == null ? fallback : v; } catch (err) { return fallback; } }

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Étape 1 : à exécuter une fois pour autoriser l'accès à l'agenda
function test() {
  const a = getAgenda_(0, DAYS_DEFAULT);
  Logger.log(a.calendars.length + ' agendas, ' + a.events.length + ' événements dans les ' + DAYS_DEFAULT + ' prochains jours :');
  a.calendars.forEach((c) => Logger.log('- ' + c.name + (c.selected ? '' : ' (décoché dans Google Agenda)')));
}

// Étape 2 : après le déploiement, affiche le lien à coller dans le widget
function lien() {
  const url = ScriptApp.getService().getUrl();
  if (!url) {
    Logger.log('Pas encore déployé : Déployer → Nouveau déploiement → Application Web.');
    return;
  }
  Logger.log('Lien à coller dans le widget :\n' + url + '?key=' + KEY);
}
