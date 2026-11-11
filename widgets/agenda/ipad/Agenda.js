// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: calendar-alt;

// Agenda — widget iPad (et iPhone) pour Scriptable, même charte que les widgets OCEAN
// Lit directement les calendriers de l'iPad (ceux de Réglages → Calendrier → Comptes : Google BO, perso, iCloud…).
// Rien à brancher : au premier lancement, autorise l'accès aux calendriers.
//
// Tailles : petit (date + 2 prochains), moyen (date + 3 prochains), grand (semaine + événements),
//           très grand (semaine + deux colonnes d'événements).
// Réglages : ouvre ce script dans Scriptable (▶︎) → calendriers affichés, ordre, calendrier par défaut, période…
// Parameter du widget (appui long → Modifier le widget), facultatif : « jour », « 3 », « 7 » ou « prochains »
// pour donner une période différente à ce widget-là.
// Toucher un événement : l'ouvre dans Calendrier (ou Google Agenda, au choix) ; « + » : nouvel événement.

// ================================================================ CŒUR (copie de widgets/agenda/core.mjs — ne pas modifier ici)
// Agenda — cœur commun aux widgets Mac (Übersicht) et iPad (Scriptable).
// Recopié tel quel dans les deux widgets par `node widgets/agenda/build.mjs` (entre « CŒUR » et « FIN DU CŒUR ») ;
// ne modifie que ce fichier, puis relance la commande.
//
//  1. Adaptateurs : transforment ce que renvoie la source (script Google, calendriers de l'iPad) en un format unique.
//  2. Préférences : calendriers affichés, ordre, calendrier par défaut, période, format (gardées par chaque widget).
//  3. Modèle d'affichage : en-tête, semaine, événements groupés par jour, état (chargement, vide, erreur…).
// Aucun affichage ici : chaque widget dessine le modèle à sa façon.

const DAY = 86400e3;
const JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const JOURS3 = ["DIM", "LUN", "MAR", "MER", "JEU", "VEN", "SAM"];
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const pad = (n) => String(n).padStart(2, "0");

// ------------------------------------------------------------------ dates (heure locale de l'appareil)
const dayStart = (t) => { const d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); };
const addDays = (t, n) => { const d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n).getTime(); };
const dayKey = (t) => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const fromKey = (k) => { const [y, m, d] = String(k).split("-").map(Number); return new Date(y, m - 1, d).getTime(); };
const hm = (t) => { const d = new Date(t); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const mondayOf = (t) => addDays(dayStart(t), -((new Date(t).getDay() + 6) % 7));
const weekdayName = (t) => JOURS[new Date(t).getDay()];
const monthName = (t) => MOIS[new Date(t).getMonth()];
function duration(ms) {
  const m = Math.round(ms / 60000);
  if (m < 60) return `${m} min`;
  return m % 60 ? `${Math.floor(m / 60)} h ${pad(m % 60)}` : `${m / 60} h`;
}

// ------------------------------------------------------------------ couleurs
function hexColor(c, fallback = "#4C8DF6") {
  let h = String(c == null ? "" : c).trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(h)) h = h.split("").map((x) => x + x).join("");
  if (/^[0-9a-f]{8}$/i.test(h)) h = h.slice(2);
  return /^[0-9a-f]{6}$/i.test(h) ? "#" + h.toUpperCase() : fallback;
}

// ------------------------------------------------------------------ nature d'un événement (libellé à droite de la carte)
const words = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(/[^a-z0-9]+/).filter(Boolean);
const ABSENCE = new Set(["conge", "conges", "absent", "absente", "absence", "absences", "vacances", "rtt", "malade", "recup", "ooo"]);
const CALL_WORDS = new Set(["call", "visio", "visioconference", "appel", "facetime", "zoom", "meet", "teams"]);
const CALL_URL = /meet\.google\.com|zoom\.us|teams\.microsoft\.com|teams\.live\.com|whereby\.com|webex\.com|facetime/i;
const isUrl = (s) => /^\s*(https?:\/\/|www\.)/i.test(String(s || ""));
/** { k: "absence" | "ferie" | "call" | "lieu" | "reunion" | "", label } — devinée : titre, type, lieu, invités. */
function kindOf(e) {
  const t = words(e.title);
  if (e.type === "OUT_OF_OFFICE" || t.some((w) => ABSENCE.has(w)) || (t.length > 1 && t[t.length - 1] === "off")) return { k: "absence", label: "Absence" };   // « Jordan OFF », pas « Kick-off »
  if (/f[ée]ri[ée]|holiday/i.test(e.cal || "")) return { k: "ferie", label: "Férié" };
  if (CALL_URL.test(`${e.location || ""} ${e.notes || ""}`) || t.some((w) => CALL_WORDS.has(w))) return { k: "call", label: "Call" };
  if (e.location && !isUrl(e.location)) {
    const l = String(e.location).split(/[,\n]/)[0].trim();
    return { k: "lieu", label: l.length > 22 ? l.slice(0, 21) + "…" : l };
  }
  if ((e.guests || 0) > 0) return { k: "reunion", label: "Réunion" };
  return { k: "", label: "" };
}

// ------------------------------------------------------------------ 1. adaptateurs
// Format unique : { provider, version, updated (ms), from, to (ms, fin exclue), calendars: [cal], events: [ev] }
//   cal : { id, name, color, selected (coché à la source), main }
//   ev  : { uid, calId, cal, color, title, allDay, s, e (ms ; journée entière : minuit local, fin exclue), tz,
//           location, notes, url, recurring, status ("confirmed" | "tentative"), updated, created, guests, type }

/** Script Google agenda-google.gs (v1 : events seuls ; v2 : agendas, période, lieu, notes, lien…). */
function fromGoogle(json, now) {
  if (!json || typeof json !== "object") throw new Error("réponse vide");
  if (json.error) throw new Error(`le script refuse le lien : ${json.error}`);
  if (!Array.isArray(json.events)) throw new Error("réponse sans événements");
  const updated = Number(json.updated) || now;
  const calendars = [], byName = new Map(), byId = new Map();
  const addCal = (c) => { calendars.push(c); byName.set(c.name, c); if (c.id) byId.set(c.id, c); return c; };
  for (const c of json.calendars || []) {
    if (!c || !c.name || byName.has(String(c.name))) continue;
    addCal({ id: String(c.id || c.name), name: String(c.name), color: hexColor(c.color), selected: c.selected !== false, main: !!c.main, tz: c.tz || null });
  }
  const events = [];
  for (const x of json.events) {
    if (!x) continue;
    const name = String(x.calendar || "Agenda");
    const cal = (x.calendarId && byId.get(x.calendarId)) || byName.get(name) || addCal({ id: String(x.calendarId || name), name, color: hexColor(x.color), selected: true, main: false });
    let s, e;
    if (x.allDay) {
      s = fromKey(x.start); e = x.end ? fromKey(x.end) : addDays(s, 1);
      if (!(e > s)) e = addDays(s, 1);
    } else {
      s = Number(x.start); e = x.end == null ? s : Number(x.end);
      if (!(e >= s)) e = s;
    }
    if (!Number.isFinite(s) || !Number.isFinite(e)) continue;
    events.push({ uid: x.uid ? String(x.uid) : null, calId: cal.id, cal: cal.name, color: hexColor(x.color, cal.color), title: String(x.title || "(Sans titre)"),
      allDay: !!x.allDay, s, e, tz: x.tz || cal.tz || null, location: x.location || "", notes: x.description || "", url: x.url || null,
      recurring: !!x.recurring, status: /INVITED|MAYBE/i.test(x.myStatus || "") ? "tentative" : "confirmed",
      updated: Number(x.updated) || null, created: Number(x.created) || null, guests: Number(x.guests) || 0, type: x.type || "" });
  }
  const from = json.from ? fromKey(json.from) : dayStart(updated);
  const to = json.to ? fromKey(json.to) : addDays(dayStart(updated), 7);
  return { provider: "google", version: Number(json.version) || 1, updated, from, to, calendars, events };
}

/** Calendriers de l'appareil (Scriptable : Calendar.forEvents(), CalendarEvent.between()). */
function fromDevice(cals, evs, from, to, now) {
  const calendars = (cals || []).map((c) => ({ id: String(c.identifier), name: String(c.title), color: hexColor(c.color && c.color.hex), selected: true, main: false, tz: null }));
  const byId = new Map(calendars.map((c) => [c.id, c]));
  const events = [];
  for (const x of evs || []) {
    const cal = x.calendar && byId.get(String(x.calendar.identifier));
    if (!cal) continue;
    let s = new Date(x.startDate).getTime(), e = new Date(x.endDate).getTime();
    if (x.isAllDay) { s = dayStart(s); e = e > s ? addDays(dayStart(e - 1), 1) : addDays(s, 1); }   // fin iOS : 23:59:59 ou minuit suivant
    if (!(e >= s)) e = s;
    const guests = Array.isArray(x.attendees) ? Math.max(0, x.attendees.length - 1) : 0;
    events.push({ uid: `${String(x.title || "").trim().toLowerCase()}|${s}|${e}`, calId: cal.id, cal: cal.name, color: cal.color, title: String(x.title || "(Sans titre)"),
      allDay: !!x.isAllDay, s, e, tz: x.timeZone || null, location: x.location || "", notes: x.notes || "", url: null,
      recurring: false, status: x.availability === "tentative" ? "tentative" : "confirmed", updated: null, created: null, guests, type: "" });
  }
  return { provider: "device", version: 1, updated: now, from, to, calendars, events };
}

// ------------------------------------------------------------------ 2. préférences
const PERIODS = [["jour", "Aujourd'hui"], ["3", "3 jours"], ["7", "7 jours"], ["prochains", "Prochains"]];
const FORMATS = [["compact", "Compact"], ["standard", "Standard"], ["etendu", "Étendu"]];
const LIMITS = { compact: 4, standard: 8, etendu: 14 };
const NEXT_MAX = 12;   // « Prochains événements » : au plus 12
function prefsOf(saved) {
  const p = saved && typeof saved === "object" ? saved : {};
  return {
    visible: p.visible && typeof p.visible === "object" ? { ...p.visible } : {},   // nom → true / false (sinon : comme à la source)
    order: Array.isArray(p.order) ? p.order.map(String) : [],
    def: p.def ? String(p.def) : null,                                            // calendrier par défaut (bouton +)
    period: PERIODS.some((x) => x[0] === p.period) ? p.period : "7",
    format: FORMATS.some((x) => x[0] === p.format) ? p.format : "standard",
    past: p.past === "hidden" ? "hidden" : "faded",
    theme: ["auto", "clair", "sombre"].includes(p.theme) ? p.theme : "auto",
    x: Number.isFinite(p.x) ? p.x : null, y: Number.isFinite(p.y) ? p.y : null,
    w: Number.isFinite(p.w) ? p.w : null, h: Number.isFinite(p.h) ? p.h : null,
  };
}
/** Calendriers dans l'ordre choisi (les nouveaux à la suite, dans l'ordre de la source), avec leur visibilité. */
function calendarsOf(src, prefs) {
  const cals = (src && src.calendars) || [];
  const rank = (c) => { const i = prefs.order.indexOf(c.name); return i < 0 ? 1e6 + cals.indexOf(c) : i; };
  return cals.slice().sort((a, b) => rank(a) - rank(b)).map((c) => ({
    ...c, visible: c.name in prefs.visible ? !!prefs.visible[c.name] : c.selected, isDefault: prefs.def === c.name,
  }));
}
/** Changements de préférences : renvoient de nouvelles préférences (rien n'est déconnecté ni supprimé). */
function toggleCalendar(prefs, cal) {
  const visible = { ...prefs.visible };
  const now = cal.visible;
  if (!now === cal.selected) delete visible[cal.name]; else visible[cal.name] = !now;
  return { ...prefs, visible };
}
function moveCalendar(prefs, cals, name, toIndex) {
  const names = cals.map((c) => c.name).filter((n) => n !== name);
  names.splice(Math.max(0, Math.min(names.length, toIndex)), 0, name);
  return { ...prefs, order: names };
}

// ------------------------------------------------------------------ 3. modèle d'affichage
function onDay(ev, d) {
  const next = addDays(d, 1);
  if (ev.allDay) return ev.s < next && ev.e > d;
  if (ev.s >= d && ev.s < next) return true;
  return ev.s < d && ev.e > d;                     // commencé la veille, encore en cours
}
function timeText(ev, d) {
  const next = addDays(d, 1);
  if (ev.allDay) {
    if (ev.e - ev.s > DAY * 1.5) { const last = addDays(ev.e, -1); return `Toute la journée · jusqu'au ${new Date(last).getDate()} ${MOIS[new Date(last).getMonth()]}`; }
    return "Toute la journée";
  }
  if (ev.s < d) return ev.e < next ? `Jusqu'à ${hm(ev.e)}` : "Toute la journée (suite)";
  if (ev.e <= ev.s) return hm(ev.s);
  if (ev.e > next) return `${hm(ev.s)} – ${hm(ev.e)} (lendemain)`;
  return `${hm(ev.s)} – ${hm(ev.e)}`;
}
const dayTitle = (d, today) => (d === today ? "Aujourd'hui" : d === addDays(today, 1) ? "Demain" : cap(weekdayName(d)));

/**
 * view : { sel (clé du jour choisi, sinon aujourd'hui), expanded, detail (uid) }
 * status : { link (source branchée), loading, error, offline }
 */
function buildModel(src, prefs, view, status, now) {
  const today = dayStart(now);
  const sel = view && view.sel ? fromKey(view.sel) : today;
  const st = status || {};
  const cals = calendarsOf(src, prefs);
  const rank = new Map(cals.map((c, i) => [c.name, i]));
  const vis = new Set(cals.filter((c) => c.visible).map((c) => c.name));

  // en-tête : le jour choisi
  const header = {
    num: new Date(sel).getDate(), month: cap(monthName(sel)), isToday: sel === today,
    sub: sel === today ? `Aujourd'hui, ${weekdayName(sel)}` : sel === addDays(today, 1) ? `Demain, ${weekdayName(sel)}` : sel === addDays(today, -1) ? `Hier, ${weekdayName(sel)}` : cap(weekdayName(sel)) + (new Date(sel).getFullYear() !== new Date(today).getFullYear() ? ` ${new Date(sel).getFullYear()}` : ""),
  };

  // événements affichés : calendriers visibles, une seule fois (réunion présente dans deux calendriers)
  const seen = new Set(), evs = [];
  for (const e of (src && src.events) || []) {
    if (!vis.has(e.cal)) continue;
    if (e.uid) { if (seen.has(e.uid)) continue; seen.add(e.uid); }
    evs.push({ ...e, ended: e.allDay ? e.e <= today : e.e <= now, ongoing: !e.allDay && e.s <= now && e.e > now, kind: kindOf(e),
      modified: !!(e.updated && e.created && e.updated - e.created > 60e3 && now - e.updated < DAY) });
  }
  evs.sort((a, b) => dayStart(a.s) - dayStart(b.s) || (b.allDay - a.allDay) || a.s - b.s || (rank.get(a.cal) - rank.get(b.cal)) || a.title.localeCompare(b.title, "fr"));
  for (const a of evs) {                           // événements simultanés
    if (a.allDay || a.e <= a.s) continue;
    a.overlap = evs.some((b) => b !== a && !b.allDay && b.e > b.s && a.s < b.e && b.s < a.e);
  }
  const colorsOf = (list) => [...new Set(list.slice().sort((a, b) => rank.get(a.cal) - rank.get(b.cal)).map((e) => e.color))];

  // semaine du jour choisi (lundi → dimanche)
  const mon = mondayOf(sel);
  const inRange = (d) => !src || (d >= src.from && d < src.to);
  const week = {
    days: Array.from({ length: 7 }, (_, i) => {
      const d = addDays(mon, i);
      return { key: dayKey(d), dow: JOURS3[new Date(d).getDay()], num: new Date(d).getDate(), today: d === today, sel: d === sel, inRange: inRange(d),
        colors: colorsOf(evs.filter((e) => onDay(e, d))).slice(0, 3) };
    }),
    canPrev: !!src && addDays(mon, -1) >= src.from, canNext: !!src && addDays(mon, 7) < src.to,
    prevKey: dayKey(addDays(sel, -7)), nextKey: dayKey(addDays(sel, 7)), todayKey: dayKey(today), isCurrent: mon === mondayOf(today),
  };

  const base = { header, week, calendars: cals, groups: [], hidden: 0, hiddenColors: [], expanded: !!(view && view.expanded), detail: null,
    period: prefs.period, format: prefs.format, sync: syncText(src, st, now), selKey: dayKey(sel), todayKey: dayKey(today) };

  // états
  if (!st.link && !src) return { ...base, state: "non-connecte" };
  if (!src) return { ...base, state: st.error ? "erreur" : "chargement", error: st.error || null };
  if (cals.length && !vis.size) return { ...base, state: "aucun-calendrier" };
  if (!inRange(sel)) return { ...base, state: "hors-plage" };

  // jours à afficher
  const hidePast = prefs.past === "hidden";
  let groups = [];
  if (prefs.period === "prochains") {
    const shown = new Set(); let n = 0;
    for (let d = sel; d < src.to && n < NEXT_MAX; d = addDays(d, 1)) {
      const items = evs.filter((e) => onDay(e, d) && !e.ended && !shown.has(e)).slice(0, NEXT_MAX - n);
      items.forEach((e) => shown.add(e)); n += items.length;
      if (items.length) groups.push({ d, items });
    }
  } else {
    const nDays = prefs.period === "jour" ? 1 : Number(prefs.period);
    for (let i = 0; i < nDays; i++) {
      const d = addDays(sel, i);
      if (!inRange(d)) break;
      const items = evs.filter((e) => onDay(e, d) && !(hidePast && e.ended));
      if (items.length || i === 0) groups.push({ d, items });
    }
  }
  groups = groups.map((g) => ({
    key: dayKey(g.d), title: `${dayTitle(g.d, today)} ${new Date(g.d).getDate()}`, isToday: g.d === today,
    count: g.items.length, countText: g.items.length === 0 ? "" : g.items.length === 1 ? "1 événement" : `${g.items.length} événements`,
    items: g.items.map((e) => ({ ...e, time: timeText(e, g.d), dur: e.allDay || e.e <= e.s ? "" : duration(e.e - e.s) })),
  }));
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  if (!total) return { ...base, state: "vide", groups };

  // format : nombre de cartes avant « N autres événements »
  const limit = base.expanded ? Infinity : LIMITS[prefs.format] || 8;
  let left = limit; const hiddenItems = [];
  const cut = [];
  for (const g of groups) {
    if (left <= 0) { hiddenItems.push(...g.items); continue; }
    const keep = g.items.slice(0, left); hiddenItems.push(...g.items.slice(left)); left -= keep.length;
    cut.push({ ...g, items: keep });
  }
  const detail = view && view.detail ? evs.find((e) => (e.uid || `${e.cal}|${e.s}|${e.title}`) === view.detail) || null : null;
  return { ...base, state: "ok", groups: cut, hidden: hiddenItems.length, hiddenColors: colorsOf(hiddenItems).slice(0, 3), detail: detail && { ...detail, time: timeText(detail, dayStart(Math.max(detail.s, sel))), dur: detail.allDay || detail.e <= detail.s ? "" : duration(detail.e - detail.s) } };
}
const evKey = (e) => e.uid || `${e.cal}|${e.s}|${e.title}`;

function syncText(src, st, now) {
  if (!src) return "";
  const t = hm(src.updated);
  const day = dayStart(src.updated) === dayStart(now) ? "" : ` (${new Date(src.updated).getDate()}/${pad(new Date(src.updated).getMonth() + 1)})`;
  if (st && st.offline) return `Hors ligne · synchro ${t}${day}`;
  return src.provider === "device" ? `Mis à jour ${t}` : `Synchro ${t}${day}`;
}

/** Lien « nouvel événement » de Google Agenda pour le jour choisi (calendrier par défaut si le script l'a donné). */
function newEventUrl(model, now) {
  const def = model.calendars.find((c) => c.isDefault);
  const sel = fromKey(model.selKey);
  let q = "action=TEMPLATE";
  if (sel !== dayStart(now)) { const k = model.selKey.replace(/-/g, ""); q += `&dates=${k}T090000/${k}T100000`; }
  if (def && def.id && def.id.includes("@")) q += `&src=${encodeURIComponent(def.id)}`;
  return `https://calendar.google.com/calendar/render?${q}`;
}
const dayUrl = (key) => { const [y, m, d] = key.split("-").map(Number); return `https://calendar.google.com/calendar/r/day/${y}/${m}/${d}`; };

/** Textes des états (communs aux deux widgets). */
const STATES = {
  "non-connecte": ["Agenda non connecté", "Branche ton script Google pour afficher tes calendriers."],
  chargement: ["Chargement de l'agenda…", "Première synchronisation en cours."],
  erreur: ["Synchronisation impossible", ""],
  "aucun-calendrier": ["Aucun calendrier affiché", "Ouvre les réglages pour en choisir au moins un."],
  "hors-plage": ["Au-delà de la période reçue", "Le widget reçoit de la semaine dernière à dans quatre semaines."],
  vide: ["Rien de prévu", ""],
};
// ================================================================ FIN DU CŒUR

const PREFS_FILE = "ocean-agenda.json";
const dyn = (light, dark) => Color.dynamic(new Color(light), new Color(dark));
const BG = dyn("#FFFFFF", "#16262C"), S2 = dyn("#F2F3F0", "#1E3138"), LINE = dyn("#E4E8E4", "#25393F");
const INK = dyn("#152B33", "#EAF1EF"), INK2 = dyn("#3E5157", "#B7C8C6"), INK3 = dyn("#5C6E74", "#8EA4A3");
const ACC = dyn("#256D70", "#75CDC5"), ACCINK = dyn("#FFFFFF", "#0D191E"), LIVE = dyn("#17804F", "#4CC38A");
const F = { h: (n) => Font.heavySystemFont(n), b: (n) => Font.boldSystemFont(n), s: (n) => Font.semiboldSystemFont(n), r: (n) => Font.systemFont(n), m: (n) => Font.mediumSystemFont(n) };
const SYMBOL = { absence: "calendar", ferie: "calendar", call: "video", lieu: "mappin.and.ellipse", reunion: "person.2", plus: "plus", repeat: "repeat" };

// ------------------------------------------------------------------ préférences (fichier local de Scriptable)
const fm = FileManager.local();
const prefsPath = fm.joinPath(fm.documentsDirectory(), PREFS_FILE);
function loadPrefs() {
  let saved = null;
  try { if (fm.fileExists(prefsPath)) saved = JSON.parse(fm.readString(prefsPath)); } catch (e) { saved = null; }
  const p = prefsOf(saved);
  p.open = saved && saved.open === "google" ? "google" : "calendrier";
  return p;
}
const savePrefs = (p) => fm.writeString(prefsPath, JSON.stringify(p));

// ------------------------------------------------------------------ données : calendriers de l'iPad
async function loadSource(now) {
  const today = dayStart(now);
  const from = mondayOf(today), to = addDays(today, 22);
  const cals = await Calendar.forEvents();
  const evs = await CalendarEvent.between(new Date(from), new Date(to), cals);
  return fromDevice(cals, evs, from, to, now);
}

// ------------------------------------------------------------------ liens
const scriptUrl = (q) => `scriptable:///run/${encodeURIComponent(Script.name())}?${q}`;
const REF_2001 = Date.UTC(2001, 0, 1);
function eventUrl(e, prefs) {
  if (prefs.open === "google") { const d = new Date(e.s); return `https://calendar.google.com/calendar/r/day/${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`; }
  return `calshow:${Math.round((e.s - REF_2001) / 1000)}`;   // app Calendrier, à la date de l'événement
}

// ------------------------------------------------------------------ dessin
function text(stack, s, font, color, opts = {}) {
  const t = stack.addText(String(s)); t.font = font; t.textColor = color; t.lineLimit = opts.lines || 1;
  if (opts.scale) t.minimumScaleFactor = opts.scale;
  return t;
}
function symbol(stack, name, size, color) {
  const s = SFSymbol.named(name); if (!s) return null;
  s.applyFont(Font.mediumSystemFont(size));
  const i = stack.addImage(s.image); i.imageSize = new Size(size + 2, size + 2); i.tintColor = color;
  return i;
}
const tint = (hex, a) => new Color(hexColor(hex), a);
function dot(stack, hex, n = 5) { const d = stack.addStack(); d.size = new Size(n, n); d.cornerRadius = n / 2; d.backgroundColor = new Color(hexColor(hex)); return d; }

function header(w, m, big, withPlus) {
  const h = w.addStack(); h.centerAlignContent();
  symbol(h, "calendar", big ? 17 : 13, INK3); h.addSpacer(big ? 9 : 6);
  text(h, m.header.num, F.h(big ? 36 : 30), INK); h.addSpacer(big ? 10 : 7);
  const t = h.addStack(); t.layoutVertically();
  text(t, m.header.month, F.s(big ? 16 : 13), INK, { scale: 0.7 });
  text(t, m.header.sub, F.r(big ? 12.5 : 10.5), INK3, { scale: 0.7 });
  h.addSpacer();
  if (withPlus) {
    const b = h.addStack(); b.size = new Size(30, 30); b.cornerRadius = 15; b.borderWidth = 1.5; b.borderColor = LINE; b.centerAlignContent();
    b.url = scriptUrl("action=nouveau"); symbol(b, "plus", 13, INK2);
  }
}
function weekStrip(w, m, wide) {
  const row = w.addStack(); row.centerAlignContent();
  m.week.days.forEach((d, i) => {
    if (i) row.addSpacer();
    const c = row.addStack(); c.layoutVertically(); c.centerAlignContent(); c.size = new Size(wide ? 44 : 36, 50);
    const top = c.addStack(); top.addSpacer(); text(top, d.dow, F.s(9.5), d.today ? ACC : INK3); top.addSpacer();
    c.addSpacer(3);
    const cr = c.addStack(); cr.addSpacer();
    const circ = cr.addStack(); circ.size = new Size(26, 26); circ.cornerRadius = 13; circ.centerAlignContent();
    if (d.today) circ.backgroundColor = ACC;
    text(circ, d.num, F.s(13), d.today ? ACCINK : INK);
    cr.addSpacer();
    c.addSpacer(3);
    const dots = c.addStack(); dots.addSpacer();
    if (d.colors.length) d.colors.forEach((col, k) => { if (k) dots.addSpacer(2); dot(dots, col); });
    else { const e = dots.addStack(); e.size = new Size(5, 5); }
    dots.addSpacer();
  });
}
function line(w) { const l = w.addStack(); l.size = new Size(0, 1); l.backgroundColor = LINE; l.addSpacer(); }

/** Carte d'événement (comme la maquette) : barre de couleur, horaire, titre, nature à droite. */
function card(parent, e, prefs, opts) {
  const c = parent.addStack(); c.centerAlignContent(); c.cornerRadius = 10;
  c.backgroundColor = tint(e.color, e.ongoing ? 0.28 : 0.16); c.url = eventUrl(e, prefs);
  c.setPadding(0, 0, 0, 10);
  const bar = c.addStack(); bar.size = new Size(4, opts.h); bar.backgroundColor = new Color(hexColor(e.color)); bar.cornerRadius = 2;
  c.addSpacer(9);
  const t = c.addStack(); t.layoutVertically();
  const tl = t.addStack(); tl.centerAlignContent();
  text(tl, e.time, F.r(opts.small ? 10 : 11.5), e.ongoing ? LIVE : INK2, { scale: 0.8 });
  if (e.ongoing) { tl.addSpacer(5); text(tl, "en cours", F.b(opts.small ? 9 : 10), LIVE); }
  if (e.status === "tentative") { tl.addSpacer(5); text(tl, "à confirmer", F.s(9.5), INK3); }
  t.addSpacer(1);
  const ti = text(t, e.title, F.s(opts.small ? 12 : 14), INK, { scale: 0.85 });
  if (e.ended) ti.textOpacity = 0.5;
  c.addSpacer();
  if (opts.kind && e.kind.k) {
    symbol(c, SYMBOL[e.kind.k], 11, INK3); c.addSpacer(4);
    text(c, e.kind.label, F.r(11.5), INK3, { scale: 0.8 });
  }
  return c;
}
function groupHeader(w, g) {
  const h = w.addStack(); h.bottomAlignContent();
  text(h, g.title, F.s(13.5), INK); h.addSpacer(); text(h, g.countText, F.r(10.5), INK3);
}
function stateBlock(w, m) {
  const [title, msg] = STATES[m.state] || ["", ""];
  const s = w.addStack(); s.layoutVertically(); s.addSpacer(6);
  text(s, title, F.s(13), INK);
  const more = m.state === "vide" ? (m.period === "jour" ? "Aucun événement aujourd'hui." : "Aucun événement sur la période.")
    : m.state === "aucun-calendrier" ? "Ouvre le script dans Scriptable pour en choisir." : m.state === "erreur" ? (m.error || "") : msg;
  if (more) { s.addSpacer(3); text(s, more, F.r(11), INK3, { lines: 3 }); }
}

/** Liste des cartes, groupées par jour, dans la place disponible (n cartes au plus). */
function eventList(w, m, prefs, max, opts) {
  let left = max, shown = 0;
  const total = m.groups.reduce((n, g) => n + g.items.length, 0);
  for (const g of m.groups) {
    if (left <= 0) break;
    if (shown || opts.dayHeaders) { w.addSpacer(shown ? 8 : 4); groupHeader(w, g); w.addSpacer(5); }
    if (!g.items.length) { text(w, "Rien de prévu", F.r(11.5), INK3); continue; }
    for (const e of g.items.slice(0, left)) { card(w, e, prefs, opts); w.addSpacer(5); left--; shown++; }
  }
  const rest = total - shown + m.hidden;
  if (rest > 0) {
    const r = w.addStack(); r.centerAlignContent();
    const cols = [...new Set(m.groups.flatMap((g) => g.items.slice(0)).slice(shown).map((e) => e.color).concat(m.hiddenColors))].slice(0, 3);
    cols.forEach((c, i) => { if (i) r.addSpacer(3); dot(r, c, 6); }); if (cols.length) r.addSpacer(6);
    text(r, `${rest} autre${rest > 1 ? "s" : ""} événement${rest > 1 ? "s" : ""}`, F.r(11.5), INK2);
  }
}
/** Prochains événements (petit, moyen) : à partir de maintenant, sur la période. */
function upcoming(m) { return m.groups.flatMap((g) => g.items.filter((e) => !e.ended).map((e) => ({ ...e, day: g }))); }

function buildWidget(m, prefs, family) {
  const w = new ListWidget(); w.backgroundColor = BG; w.url = eventUrl({ s: Date.now() }, prefs);
  const small = family === "small", medium = family === "medium", xl = family === "extraLarge";
  w.setPadding(small ? 12 : 14, small ? 12 : 16, small ? 12 : 12, small ? 12 : 16);
  if (m.state !== "ok" && m.state !== "vide" || (m.state === "vide" && (small || medium))) {
    header(w, m, !small, !small); w.addSpacer(10); line(w); stateBlock(w, m); w.addSpacer(); return w;
  }
  if (small) {
    header(w, m, false, false); w.addSpacer();
    const list = upcoming(m).slice(0, 2);
    for (const e of list) { card(w, e, prefs, { h: 30, small: true }); w.addSpacer(4); }
    return w;
  }
  if (medium) {
    const row = w.addStack();
    const left = row.addStack(); left.layoutVertically(); left.size = new Size(92, 0);
    text(left, m.header.sub.split(",").pop().trim().toUpperCase(), F.b(11), ACC);
    text(left, m.header.num, F.h(40), INK);
    text(left, m.header.month, F.r(12), INK3);
    left.addSpacer();
    const n = m.groups.length ? m.groups[0].items.filter((e) => !e.ended).length : 0;
    text(left, n === 0 ? "rien aujourd'hui" : n === 1 ? "1 événement" : `${n} événements`, F.r(10.5), INK3);
    row.addSpacer(10);
    const right = row.addStack(); right.layoutVertically();
    const list = upcoming(m).slice(0, 3);
    let lastDay = null;
    for (const e of list) {
      if (e.day.key !== m.todayKey && e.day.key !== lastDay) { text(right, e.day.title, F.s(10.5), INK2); right.addSpacer(2); }
      lastDay = e.day.key;
      card(right, e, prefs, { h: 30, small: true }); right.addSpacer(4);
    }
    return w;
  }
  header(w, m, true, true); w.addSpacer(10);
  weekStrip(w, m, xl); w.addSpacer(6); line(w);
  if (m.state === "vide") { stateBlock(w, m); w.addSpacer(); return w; }
  if (!xl) { eventList(w, m, prefs, 4, { h: 34, kind: true, dayHeaders: true }); w.addSpacer(); return w; }
  // très grand : deux colonnes (aujourd'hui / la suite)
  const cols = w.addStack(); cols.topAlignContent();
  const a = cols.addStack(); a.layoutVertically(); cols.addSpacer(14);
  const b = cols.addStack(); b.layoutVertically();
  const first = { ...m, groups: m.groups.slice(0, 1), hidden: 0, hiddenColors: [] }, rest = { ...m, groups: m.groups.slice(1) };
  eventList(a, first, prefs, 4, { h: 34, kind: true, dayHeaders: true }); a.addSpacer();
  if (rest.groups.length) eventList(b, rest, prefs, 4, { h: 34, kind: true, dayHeaders: true }); else stateBlock(b, { ...m, state: "vide", period: "prochains" });
  b.addSpacer();
  w.addSpacer();
  return w;
}

// ------------------------------------------------------------------ réglages (dans l'app Scriptable)
async function pick(title, options, message) {
  const a = new Alert(); a.title = title; if (message) a.message = message;
  options.forEach((o) => a.addAction(o)); a.addCancelAction("Terminé");
  return await a.presentSheet();
}
async function settings(src, prefs, now) {
  for (;;) {
    const cals = calendarsOf(src, prefs);
    const nVis = cals.filter((c) => c.visible).length;
    const per = PERIODS.find((p) => p[0] === prefs.period)[1];
    const i = await pick("Agenda", [`Calendriers affichés (${nVis}/${cals.length})…`, "Ordre des calendriers…", `Calendrier par défaut : ${prefs.def || "aucun"}…`,
      `Période : ${per}…`, `Événements passés : ${prefs.past === "hidden" ? "masqués" : "estompés"}`, `Ouvrir les événements dans : ${prefs.open === "google" ? "Google Agenda" : "Calendrier"}`,
      "Aperçu du widget (grand)", "Aperçu du widget (très grand)"]);
    if (i < 0) return;
    if (i === 0) {
      for (;;) {
        const cs = calendarsOf(src, prefs);
        const k = await pick("Calendriers affichés", cs.map((c) => `${c.visible ? "✓ " : "    "}${c.name}`), "Touche un calendrier pour l'afficher ou le masquer. Il reste connecté.");
        if (k < 0) break;
        prefs = { ...prefs, ...toggleCalendar(prefs, cs[k]), open: prefs.open }; savePrefs(prefs);
      }
    } else if (i === 1) {
      for (;;) {
        const cs = calendarsOf(src, prefs);
        const k = await pick("Ordre des calendriers", cs.map((c, j) => `${j + 1}. ${c.name}`), "Touche un calendrier pour le monter d'un rang.");
        if (k < 0) break;
        prefs = { ...prefs, ...moveCalendar(prefs, cs, cs[k].name, Math.max(0, k - 1)), open: prefs.open }; savePrefs(prefs);
      }
    } else if (i === 2) {
      const cs = calendarsOf(src, prefs);
      const k = await pick("Calendrier par défaut (bouton +)", ["Aucun"].concat(cs.map((c) => c.name)));
      if (k >= 0) { prefs = { ...prefs, def: k === 0 ? null : cs[k - 1].name }; savePrefs(prefs); }
    } else if (i === 3) {
      const k = await pick("Période affichée", PERIODS.map((p) => p[1]));
      if (k >= 0) { prefs = { ...prefs, period: PERIODS[k][0] }; savePrefs(prefs); }
    } else if (i === 4) { prefs = { ...prefs, past: prefs.past === "hidden" ? "faded" : "hidden" }; savePrefs(prefs); }
    else if (i === 5) { prefs = { ...prefs, open: prefs.open === "google" ? "calendrier" : "google" }; savePrefs(prefs); }
    else {
      const m = buildModel(src, prefs, { expanded: true }, { link: true }, now);
      const w = buildWidget(m, prefs, i === 6 ? "large" : "extraLarge");
      await (i === 6 ? w.presentLarge() : w.presentExtraLarge ? w.presentExtraLarge() : w.presentLarge());
    }
  }
}
async function newEvent(src, prefs) {
  const ev = new CalendarEvent();
  const def = prefs.def && (await Calendar.forEvents()).find((c) => c.title === prefs.def);
  if (def) ev.calendar = def;
  const start = new Date(); start.setMinutes(0, 0, 0); start.setHours(start.getHours() + 1);
  ev.startDate = start; ev.endDate = new Date(start.getTime() + 3600e3);
  await ev.presentEdit();
}

// ------------------------------------------------------------------ lancement
const now = Date.now();
let prefs = loadPrefs();
const param = String(args.widgetParameter || "").trim().toLowerCase();
const periodParam = { jour: "jour", "aujourd'hui": "jour", "3": "3", "7": "7", prochains: "prochains" }[param];
let src = null, error = null;
try { src = await loadSource(now); } catch (e) { error = "Accès aux calendriers refusé : Réglages → Confidentialité → Calendriers → Scriptable."; }
const action = args.queryParameters && args.queryParameters.action;

if (config.runsInWidget) {
  const p = periodParam ? { ...prefs, period: periodParam } : prefs;
  const m = buildModel(src, p, { expanded: true }, { link: true, error }, now);   // le widget fait tenir lui-même ce qu'il peut
  const w = buildWidget(m, p, config.widgetFamily);
  // mise à jour : au prochain début ou fin d'événement, et au moins toutes les 15 minutes
  const marks = src ? src.events.flatMap((e) => [e.s, e.e]).filter((t) => t > now) : [];
  w.refreshAfterDate = new Date(Math.min(now + 15 * 60e3, ...marks.map((t) => t + 1000)));
  Script.setWidget(w);
} else if (action === "nouveau") {
  await newEvent(src, prefs);
} else if (src) {
  await settings(src, prefs, now);
} else {
  const a = new Alert(); a.title = "Agenda"; a.message = error; a.addAction("OK"); await a.present();
}
Script.complete();
