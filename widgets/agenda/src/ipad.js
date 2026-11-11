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

//@@CORE@@

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
