// Widget Agenda (Windows) — Google Apps Script, version 2
// Renvoie au widget les événements des prochains jours de TOUS tes agendas Google
// (perso, BO, collègues, jours fériés…), avec la liste des agendas et leur couleur.
// Les agendas décochés dans Google Agenda sont aussi envoyés (marqués « selected: false ») :
// le widget les masque par défaut, et tu peux les afficher au clic droit → « Agendas affichés ».
// Installation : voir LISEZ-MOI.txt, section « LE SCRIPT GOOGLE ».

// Clé secrète : le widget doit l'envoyer pour lire l'agenda.
// Si tu remplaces l'ancien script, GARDE ta ligne « const KEY = … » : ton lien ne change pas.
const KEY = 'COLLE_ICI_TA_CLE';

const DAYS_DEFAULT = 7;   // jours renvoyés (le widget en demande 1, 3, 7 ou 14)
const DAYS_MAX = 14;

function doGet(e) {
  if (!e || !e.parameter || e.parameter.key !== KEY || KEY === 'COLLE_ICI_TA_CLE') {
    return json_({ error: 'cle invalide' });
  }
  const days = Math.min(DAYS_MAX, Math.max(1, parseInt(e.parameter.days, 10) || DAYS_DEFAULT));
  return json_(getAgenda_(days));
}

function getAgenda_(days) {
  const tz = Session.getScriptTimeZone();
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from.getTime() + days * 86400000);

  // Agenda principal d'abord : une réunion présente dans plusieurs agendas garde l'identifiant « uid »,
  // le widget ne l'affiche qu'une fois (dans le premier agenda affiché).
  const main = CalendarApp.getDefaultCalendar();
  const all = [main].concat(CalendarApp.getAllCalendars().filter((c) => c.getId() !== main.getId() && !c.isHidden()));

  const calendars = [];
  const events = [];
  all.forEach((cal) => {
    const isMain = cal.getId() === main.getId();
    calendars.push({ id: cal.getId(), name: cal.getName(), color: cal.getColor(), selected: isMain || cal.isSelected(), main: isMain });
    let list;
    try { list = cal.getEvents(from, to); } catch (err) { return; }
    list.forEach((ev) => {
      // Invitations refusées : on ne les envoie pas
      try { if (ev.getMyStatus() === CalendarApp.GuestStatus.NO) return; } catch (err) {}
      const allDay = ev.isAllDayEvent();
      const start = allDay ? ev.getAllDayStartDate() : ev.getStartTime();
      const end = allDay ? ev.getAllDayEndDate() : ev.getEndTime();
      events.push({
        title: ev.getTitle() || '(Sans titre)',
        calendar: cal.getName(),
        calendarId: cal.getId(),
        color: cal.getColor(),
        allDay: allDay,
        // Journée entière : date (aaaa-mm-jj, fin exclue) ; sinon : millisecondes
        start: allDay ? Utilities.formatDate(start, tz, 'yyyy-MM-dd') : start.getTime(),
        end: allDay ? Utilities.formatDate(end, tz, 'yyyy-MM-dd') : end.getTime(),
        uid: ev.getId() + '|' + start.getTime(),
      });
    });
  });
  return { updated: Date.now(), version: 2, calendars: calendars, events: events };
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Étape 1 : à exécuter une fois pour autoriser l'accès à l'agenda
function test() {
  const a = getAgenda_(DAYS_DEFAULT);
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
