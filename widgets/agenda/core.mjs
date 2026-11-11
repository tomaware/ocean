// Agenda — cœur commun aux widgets Mac (Übersicht) et iPad (Scriptable).
// Recopié tel quel dans les deux widgets par `node widgets/agenda/build.mjs` (entre « CŒUR » et « FIN DU CŒUR ») ;
// ne modifie que ce fichier, puis relance la commande.
//
//  1. Adaptateurs : transforment ce que renvoie la source (script Google, calendriers de l'iPad) en un format unique.
//  2. Préférences : calendriers affichés, ordre, calendrier par défaut, période, format (gardées par chaque widget).
//  3. Modèle d'affichage : en-tête, semaine, événements groupés par jour, état (chargement, vide, erreur…).
// Aucun affichage ici : chaque widget dessine le modèle à sa façon.

export const DAY = 86400e3;
const JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const JOURS3 = ["DIM", "LUN", "MAR", "MER", "JEU", "VEN", "SAM"];
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
export const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const pad = (n) => String(n).padStart(2, "0");

// ------------------------------------------------------------------ dates (heure locale de l'appareil)
export const dayStart = (t) => { const d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); };
export const addDays = (t, n) => { const d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n).getTime(); };
export const dayKey = (t) => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
export const fromKey = (k) => { const [y, m, d] = String(k).split("-").map(Number); return new Date(y, m - 1, d).getTime(); };
export const hm = (t) => { const d = new Date(t); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
export const mondayOf = (t) => addDays(dayStart(t), -((new Date(t).getDay() + 6) % 7));
export const weekdayName = (t) => JOURS[new Date(t).getDay()];
export const monthName = (t) => MOIS[new Date(t).getMonth()];
export function duration(ms) {
  const m = Math.round(ms / 60000);
  if (m < 60) return `${m} min`;
  return m % 60 ? `${Math.floor(m / 60)} h ${pad(m % 60)}` : `${m / 60} h`;
}

// ------------------------------------------------------------------ couleurs
export function hexColor(c, fallback = "#4C8DF6") {
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
export function kindOf(e) {
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
export function fromGoogle(json, now) {
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
export function fromDevice(cals, evs, from, to, now) {
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
export const PERIODS = [["jour", "Aujourd'hui"], ["3", "3 jours"], ["7", "7 jours"], ["prochains", "Prochains"]];
export const FORMATS = [["compact", "Compact"], ["standard", "Standard"], ["etendu", "Étendu"]];
export const LIMITS = { compact: 4, standard: 8, etendu: 14 };
export const NEXT_MAX = 12;   // « Prochains événements » : au plus 12
export function prefsOf(saved) {
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
export function calendarsOf(src, prefs) {
  const cals = (src && src.calendars) || [];
  const rank = (c) => { const i = prefs.order.indexOf(c.name); return i < 0 ? 1e6 + cals.indexOf(c) : i; };
  return cals.slice().sort((a, b) => rank(a) - rank(b)).map((c) => ({
    ...c, visible: c.name in prefs.visible ? !!prefs.visible[c.name] : c.selected, isDefault: prefs.def === c.name,
  }));
}
/** Changements de préférences : renvoient de nouvelles préférences (rien n'est déconnecté ni supprimé). */
export function toggleCalendar(prefs, cal) {
  const visible = { ...prefs.visible };
  const now = cal.visible;
  if (!now === cal.selected) delete visible[cal.name]; else visible[cal.name] = !now;
  return { ...prefs, visible };
}
export function moveCalendar(prefs, cals, name, toIndex) {
  const names = cals.map((c) => c.name).filter((n) => n !== name);
  names.splice(Math.max(0, Math.min(names.length, toIndex)), 0, name);
  return { ...prefs, order: names };
}

// ------------------------------------------------------------------ 3. modèle d'affichage
export function onDay(ev, d) {
  const next = addDays(d, 1);
  if (ev.allDay) return ev.s < next && ev.e > d;
  if (ev.s >= d && ev.s < next) return true;
  return ev.s < d && ev.e > d;                     // commencé la veille, encore en cours
}
export function timeText(ev, d) {
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
export function buildModel(src, prefs, view, status, now) {
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
export const evKey = (e) => e.uid || `${e.cal}|${e.s}|${e.title}`;

export function syncText(src, st, now) {
  if (!src) return "";
  const t = hm(src.updated);
  const day = dayStart(src.updated) === dayStart(now) ? "" : ` (${new Date(src.updated).getDate()}/${pad(new Date(src.updated).getMonth() + 1)})`;
  if (st && st.offline) return `Hors ligne · synchro ${t}${day}`;
  return src.provider === "device" ? `Mis à jour ${t}` : `Synchro ${t}${day}`;
}

/** Lien « nouvel événement » de Google Agenda pour le jour choisi (calendrier par défaut si le script l'a donné). */
export function newEventUrl(model, now) {
  const def = model.calendars.find((c) => c.isDefault);
  const sel = fromKey(model.selKey);
  let q = "action=TEMPLATE";
  if (sel !== dayStart(now)) { const k = model.selKey.replace(/-/g, ""); q += `&dates=${k}T090000/${k}T100000`; }
  if (def && def.id && def.id.includes("@")) q += `&src=${encodeURIComponent(def.id)}`;
  return `https://calendar.google.com/calendar/render?${q}`;
}
export const dayUrl = (key) => { const [y, m, d] = key.split("-").map(Number); return `https://calendar.google.com/calendar/r/day/${y}/${m}/${d}`; };

/** Textes des états (communs aux deux widgets). */
export const STATES = {
  "non-connecte": ["Agenda non connecté", "Branche ton script Google pour afficher tes calendriers."],
  chargement: ["Chargement de l'agenda…", "Première synchronisation en cours."],
  erreur: ["Synchronisation impossible", ""],
  "aucun-calendrier": ["Aucun calendrier affiché", "Ouvre les réglages pour en choisir au moins un."],
  "hors-plage": ["Au-delà de la période reçue", "Le widget reçoit de la semaine dernière à dans quatre semaines."],
  vide: ["Rien de prévu", ""],
};
