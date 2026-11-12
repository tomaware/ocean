// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: calendar-alt;

// OCEAN — widget « Créneaux vent » (iPhone, Scriptable) — remplace « Créneau Vent »
// Les créneaux et les étoiles de l'app OCEAN (note wing, vent corrigé de la super prévision), sur tous les spots.
// Petit : le meilleur créneau ; moyen : le meilleur + les 3 suivants ; grand : grille spots × 5 jours ;
// écran verrouillé : le meilleur créneau en une ou trois lignes.
//
// RÉGLAGES (appui long → Modifier le widget → Parameter), à combiner :
//  • « offshore » : mode OffShore (Sécu first sinon)
//  • « proches » : seulement les spots à moins de 55 km de Montpellier
//  • une liste de spots : « G-Motte, Beauduc, Le Jaï »
// Ou une fois pour toutes : ouvre ce script dans Scriptable (▶︎).

const DATA = "https://tomaware.github.io/ocean/data/widget-wind.json";
const APP = "https://tomaware.github.io/ocean/";
const K_MODE = "ocean.creneaux.mode", K_SPOTS = "ocean.creneaux.spots";
const NEAR = ["la-grande-motte", "le-ponant", "port-camargue"];   // < 55 km de Montpellier (comme les Sessions 2H)
const REFRESH_MIN = 30;

const dyn = (light, dark) => Color.dynamic(new Color(light), new Color(dark));
const BG = dyn("#FFFFFF", "#16262C"), CELL = dyn("#F2F3F0", "#1E3138");
const INK = dyn("#152B33", "#EAF1EF"), INK2 = dyn("#3E5157", "#B7C8C6"), INK3 = dyn("#5C6E74", "#8EA4A3"), LINE = dyn("#E4E8E4", "#25393F");
const OFF = dyn("#D6DCD6", "#33494F");
const STAR = [OFF, dyn("#23A26A", "#4CC38A"), dyn("#EE7F1B", "#F5A04A"), dyn("#8A4FD8", "#B38BF5")];
const SOFT = [CELL, dyn("#E3F4EC", "#1D3A30"), dyn("#FDEBDC", "#3A2A1A"), dyn("#F3ECFC", "#2E2440")];

const DIR16 = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];
const compass = (d) => (d == null ? "" : DIR16[Math.round(d / 22.5) % 16]);
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-");
const starsOf = (s) => (s == null ? 0 : s >= 8.5 ? 3 : s >= 7 ? 2 : s >= 5 ? 1 : 0);
const DAYS = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];
const JOURS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const dayKey = (t) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const dayLabel = (key, now) => (key === dayKey(now) ? "Auj." : key === dayKey(now + 86400e3) ? "Demain" : DAYS[new Date(key + "T12:00:00").getDay()]);
const span = (s) => `${new Date(s.s).getHours()}–${new Date(s.e).getHours()} h`;
const F = { h: (n) => Font.heavySystemFont(n), b: (n) => Font.boldSystemFont(n), s: (n) => Font.semiboldSystemFont(n), r: (n) => Font.systemFont(n) };
// Largeur de référence : celle du plus petit grand widget (iPhone SE/mini). Elle n'est JAMAIS estimée depuis
// l'écran — Device.screenSize() ne donne pas la largeur du widget, et une grille trop large est écrasée par iOS
// (chiffres coupés, carte débordant des deux côtés : constaté sur l'iPhone de Tom le 12/11). Les colonnes sont
// séparées par des espaces souples : sur un grand iPhone, la grille remplit la carte sans jamais la dépasser.
const UTILE = 264;
function text(stack, s, font, color, opts = {}) {
  const t = stack.addText(String(s)); t.font = font; t.textColor = color; t.lineLimit = opts.lines ?? 1;
  if (opts.scale) t.minimumScaleFactor = opts.scale;
  return t;
}
function stars(stack, k, size, all = true) {
  const s = stack.addStack();
  if (k) text(s, "★".repeat(k), F.b(size), STAR[k]);
  if (all && k < 3) text(s, "★".repeat(3 - k), F.b(size), OFF);
}

/** Remplissage d'une case : violet, orange, vert en proportion des heures de jour (couleurs fixes, lisibles en clair et en sombre). */
function fillImage(x, w, h) {
  const c = new DrawContext(); c.size = new Size(w, h); c.opaque = false; c.respectScreenScale = true;
  const tot = Math.max(1, x[3]); let at = 0;
  for (const [k, col] of [[3, "#8A4FD8"], [2, "#EE7F1B"], [1, "#23A26A"]]) {
    const wpx = (x[k - 1] / tot) * w; if (wpx <= 0) continue;
    c.setFillColor(new Color(col)); c.fillRect(new Rect(at, 0, wpx, h)); at += wpx;
  }
  return c.getImage();
}

async function loadData() {
  const fm = FileManager.local(), path = fm.joinPath(fm.documentsDirectory(), "ocean-widget-wind.json");
  try {
    const r = new Request(DATA); r.timeoutInterval = 15;
    const j = await r.loadJSON(); if (!j || !j.spots) throw new Error("données vides");
    fm.writeString(path, JSON.stringify(j)); return { data: j, cached: false };
  } catch (e) {
    if (fm.fileExists(path)) return { data: JSON.parse(fm.readString(path)), cached: true };
    throw e;
  }
}
function settings(data) {
  let p = String(args.widgetParameter || "").trim();
  if (!p && Keychain.contains(K_SPOTS)) p = Keychain.get(K_SPOTS);
  const offshore = /off\s*shore/i.test(p) || (!/s[ée]cu/i.test(p) && Keychain.contains(K_MODE) && Keychain.get(K_MODE) === "offshore");
  const near = /proche/i.test(p);
  const names = p.replace(/off\s*shore|s[ée]cu(\s*first)?|proches?/gi, "").split(/[,;]/).map((x) => x.trim()).filter(Boolean);
  let spots = data.spots;
  if (near) spots = spots.filter((s) => NEAR.includes(s.id));
  if (names.length) {
    const want = names.map(norm);
    const pick = spots.filter((s) => want.some((n) => s.id === n || norm(s.short) === n || norm(s.name).includes(n) || norm(s.short).includes(n)));
    if (pick.length) spots = pick;
  }
  return { level: offshore ? "offshore" : "secu", spots, label: `${offshore ? "OffShore" : "Sécu first"}${near ? " · proches" : ""}` };
}
/** Créneaux à venir, du meilleur au moins bon : étoiles, puis durée (8 h valent mieux que 2 h), puis note max, puis le plus tôt. */
function ranked(spots, level, now) {
  const out = [];
  for (const sp of spots) for (const s of sp.sessions[level] || []) if (s.e > now) out.push({ ...s, spot: sp });
  return out.sort((a, b) => starsOf(b.p) - starsOf(a.p) || b.h - a.h || b.p - a.p || a.s - b.s);
}
const link = (c) => `${APP}#/spot/${c.spot.id}?day=${encodeURIComponent(new Date(c.s).toLocaleDateString("fr-FR"))}`;

function none(w, cfg) {
  text(w, "Créneaux vent", F.h(14), INK); w.addSpacer();
  text(w, "Pas de créneau dans les 5 jours", F.s(13), INK2, { lines: 2 }); w.addSpacer();
  text(w, cfg.label, F.r(10), INK3);
}
function small(w, list, cfg, now) {
  if (!list.length) return none(w, cfg);
  const c = list[0];
  text(w, "MEILLEUR CRÉNEAU", F.b(10), INK3); w.addSpacer(4);
  stars(w, starsOf(c.p), 18, false); w.addSpacer();
  text(w, c.spot.short, F.h(18), INK, { scale: 0.6 });
  text(w, `${dayLabel(dayKey(c.s), now)} ${span(c)}`, F.s(13), INK2, { scale: 0.7 });
  w.addSpacer(4);
  text(w, `${c.kn ?? "–"} nd ${compass(c.dir)}${c.g ? ` · raf. ${c.g}` : ""}`, F.b(12), INK, { scale: 0.7 });
  w.url = link(c);
}
function medium(w, list, cfg, now) {
  if (!list.length) return none(w, cfg);
  const row = w.addStack(); row.spacing = 12;
  const c = list[0], k = starsOf(c.p);
  const best = row.addStack(); best.layoutVertically(); best.size = new Size(120, 0); best.backgroundColor = SOFT[k]; best.cornerRadius = 14; best.setPadding(10, 10, 10, 10);
  stars(best, k, 16, false); best.addSpacer();
  text(best, c.spot.short, F.h(15), INK, { scale: 0.6 });
  text(best, `${dayLabel(dayKey(c.s), now)} ${span(c)}`, F.s(12), INK2, { scale: 0.7 });
  best.addSpacer(4); text(best, `${c.kn ?? "–"} nd ${compass(c.dir)}`, F.b(12), INK);
  best.url = link(c);
  const right = row.addStack(); right.layoutVertically(); right.spacing = 6;
  for (const x of list.slice(1, 4)) {
    const r = right.addStack(); r.layoutVertically(); r.url = link(x);
    const a = r.addStack(); text(a, x.spot.short, F.h(13), INK); a.addSpacer(); stars(a, starsOf(x.p), 11, false);
    const b = r.addStack(); text(b, `${dayLabel(dayKey(x.s), now)} ${span(x)}`, F.r(11), INK2); b.addSpacer(); text(b, `${x.kn ?? "–"} nd ${compass(x.dir)}`, F.b(11), INK);
  }
  if (list.length < 2) text(right, "Pas d'autre créneau en vue", F.r(11), INK3);
  right.addSpacer();
  text(right, cfg.label, F.r(9), INK3);
  w.url = link(c);
}
const HEAD = { "La Franqui": "Franqui", "Espiguette": "Espig.", "Almanarre": "Alman." };   // en-têtes de colonne courts
const colLabel = (s) => HEAD[s.short] || s.short;
/** Étiquette de ligne : « Auj. » aujourd'hui, sinon « Jeu 12 » (comme le widget Windows validé le 12/11). */
function rowLabel(key, now) {
  if (key === dayKey(now)) return "Auj.";
  const d = new Date(key + "T12:00:00");
  return `${DAYS[d.getDay()].replace(".", "")} ${d.getDate()}`;
}
/** Vent max du jour (heures de jour), affiché dans les cases sans créneau, comme l'ancien widget. */
function dayMax(sp, key) {
  const v = (sp.hours || []).filter((h) => h[4] && dayKey(h[0]) === key && h[1] != null).map((h) => h[1]);
  return v.length ? Math.max(...v) : null;
}
// Grand format (Tom, 11/11 : « comme l'ancien ») : meilleur créneau en haut, puis spots en colonnes et jours en lignes.
// La largeur des colonnes vient de leur nombre, sur la largeur utile du plus petit grand widget (264 pt) : la grille
// ne déborde jamais, et les textes peuvent se réduire au lieu d'être coupés.
function large(w, data, list, cfg, now) {
  if (list.length) {
    const c = list[0], k = starsOf(c.p);
    const b = w.addStack(); b.layoutVertically(); b.backgroundColor = k ? SOFT[k] : CELL; b.cornerRadius = 14; b.setPadding(9, 12, 10, 12); b.url = link(c);
    const l1 = b.addStack(); l1.centerAlignContent();
    text(l1, "MEILLEUR CRÉNEAU", F.b(10), INK3); l1.addSpacer();
    const pill = l1.addStack(); pill.backgroundColor = k ? STAR[k] : OFF; pill.cornerRadius = 8; pill.setPadding(1, 7, 1, 7);
    text(pill, `${c.h}h`, F.h(11), Color.white());
    const d = new Date(c.s);
    text(b, `${JOURS[d.getDay()]} ${d.getDate()} · ${span(c)}`, F.h(19), INK, { scale: 0.5 });
    const l3 = b.addStack(); l3.centerAlignContent();
    text(l3, c.spot.name, F.s(13), INK, { scale: 0.6 }); l3.addSpacer(8); stars(l3, k, 13, false); l3.addSpacer();
    text(b, `${c.kn ?? "–"} nd ${compass(c.dir)}${c.g ? ` · raf. ${c.g}` : ""}`, F.b(12), INK2, { scale: 0.7 });
  } else text(w, "Pas de créneau dans les 5 jours", F.s(13), INK2);
  w.addSpacer(10);
  // la nuit (plus aucune heure de jour à venir aujourd'hui) : la ligne du jour, vide, est retirée
  const today = dayKey(now);
  let days = data.days.slice(0, 5), off = 0;
  const dayLeft = data.spots.some((sp) => (sp.hours || []).some((h) => h[4] && dayKey(h[0]) === today && h[0] + 3600e3 > now));
  if (days.length > 1 && days[0] === today && !dayLeft) { days = days.slice(1); off = 1; }
  const cols = cfg.spots.slice(0, 8), nameW = 34, gap = 3;
  const cw = Math.max(22, Math.floor((UTILE - nameW) / Math.max(1, cols.length)) - gap), ch = 25;
  const hdr = w.addStack();
  const n0 = hdr.addStack(); n0.size = new Size(nameW, 0);
  for (const sp of cols) { hdr.addSpacer(); const h = hdr.addStack(); h.size = new Size(cw, 12); h.addSpacer(); text(h, colLabel(sp), F.b(9), INK3, { scale: 0.5 }); h.addSpacer(); }
  hdr.addSpacer(0);
  w.addSpacer(3);
  days.forEach((key, i) => {
    const r = w.addStack(); r.centerAlignContent();
    const n = r.addStack(); n.size = new Size(nameW, 0); text(n, rowLabel(key, now), F.h(11), INK, { scale: 0.5 });
    for (const sp of cols) {
      r.addSpacer();   // espace souple : les colonnes remplissent la carte, quelle que soit sa largeur
      const x = (sp.daily[cfg.level] || [])[i + off];
      const ses = (sp.sessions[cfg.level] || []).filter((s) => dayKey(s.s) === key);
      const cell = r.addStack(); cell.size = new Size(cw, ch); cell.cornerRadius = 6; cell.backgroundColor = CELL;
      cell.centerAlignContent();
      if (!ses.length || !x) {
        const kn = dayMax(sp, key);
        if (kn != null) { cell.addSpacer(); text(cell, String(kn), F.s(10), INK3, { scale: 0.6 }); cell.addSpacer(); }
        continue;
      }
      // case remplie selon les heures à 3, 2 et 1 étoiles (comme la Prévision 5 jours de l'app), heures posées dessus
      cell.backgroundImage = fillImage(x, cw, ch);
      const top = x[2] ? 3 : x[1] ? 2 : 1;
      cell.addSpacer();
      const pill = cell.addStack(); pill.backgroundColor = BG; pill.cornerRadius = 7; pill.setPadding(1, 4, 1, 4);
      text(pill, `${x[top - 1] || ses.reduce((a, s) => a + s.h, 0)}h`, F.h(10), INK, { scale: 0.6 });   // heures au meilleur niveau
      cell.addSpacer();
      cell.url = `${APP}#/spot/${sp.id}?day=${encodeURIComponent(new Date(key + "T12:00:00").toLocaleDateString("fr-FR"))}`;
    }
    r.addSpacer(0);
    w.addSpacer(3);
  });
  w.addSpacer();
  text(w, cfg.label, F.r(9), INK3);
}
function lock(w, family, list, now) {
  const c = list[0];
  if (family === "accessoryInline") { text(w, c ? `${"★".repeat(starsOf(c.p))} ${c.spot.short} ${dayLabel(dayKey(c.s), now)} ${span(c)}` : "Pas de créneau vent", F.s(12), Color.white()); return; }
  if (family === "accessoryCircular") { text(w, c ? "★".repeat(starsOf(c.p)) : "–", F.h(14), Color.white()); if (c) text(w, c.spot.short, F.b(10), Color.white(), { scale: 0.6 }); return; }
  if (!c) { text(w, "Pas de créneau vent", F.s(13), Color.white()); return; }
  text(w, `${"★".repeat(starsOf(c.p))} ${c.spot.short}`, F.h(13), Color.white(), { scale: 0.7 });
  text(w, `${dayLabel(dayKey(c.s), now)} ${span(c)}`, F.r(12), Color.white());
  text(w, `${c.kn ?? "–"} nd ${compass(c.dir)}${c.g ? ` · raf. ${c.g}` : ""}`, F.r(12), Color.white());
}

async function setup(data) {
  const a = new Alert(); a.title = "OCEAN · Créneaux vent";
  a.message = `Mode : ${Keychain.contains(K_MODE) && Keychain.get(K_MODE) === "offshore" ? "OffShore" : "Sécu first"}\nSpots : ${Keychain.contains(K_SPOTS) && Keychain.get(K_SPOTS) ? Keychain.get(K_SPOTS) : "tous"}`;
  a.addAction("Mode Sécu first / OffShore"); a.addAction("Spots suivis"); a.addAction("Aperçu du widget"); a.addCancelAction("Fermer");
  const r = await a.presentSheet();
  if (r === 0) { const b = new Alert(); b.addAction("Sécu first"); b.addAction("OffShore"); b.addCancelAction("Annuler"); const k = await b.presentSheet(); if (k >= 0) Keychain.set(K_MODE, k ? "offshore" : "secu"); }
  if (r === 1) {
    const b = new Alert(); b.title = "Spots suivis"; b.message = "Noms séparés par des virgules, « proches », ou vide pour tous.\nEx. : G-Motte, Beauduc, Le Jaï";
    b.addTextField(data.spots.map((s) => s.short).join(", "), Keychain.contains(K_SPOTS) ? Keychain.get(K_SPOTS) : ""); b.addAction("Enregistrer"); b.addCancelAction("Annuler");
    if ((await b.present()) === 0) Keychain.set(K_SPOTS, b.textFieldValue(0).trim());
  }
  return r;
}

async function build(family) {
  const now = Date.now(), w = new ListWidget();
  const lockScreen = String(family).startsWith("accessory");
  if (!lockScreen) { w.backgroundColor = BG; w.setPadding(14, 14, 14, 14); }
  w.refreshAfterDate = new Date(now + REFRESH_MIN * 60000);
  w.url = APP + "#/wind/prevision";
  let loaded;
  try { loaded = await loadData(); } catch (e) { text(w, "OCEAN", F.h(14), INK); text(w, "Pas de données (hors ligne ?)", F.r(12), INK2, { lines: 2 }); return w; }
  const cfg = settings(loaded.data), list = ranked(cfg.spots, cfg.level, now);
  if (lockScreen) lock(w, family, list, now);
  else if (family === "small") small(w, list, cfg, now);
  else if (family === "medium") medium(w, list, cfg, now);
  else large(w, loaded.data, list, cfg, now);
  if (loaded.cached && !lockScreen) text(w, "hors ligne : dernières données", F.r(9), INK3);
  return w;
}

if (config.runsInWidget) Script.setWidget(await build(config.widgetFamily || "medium"));
else {
  let data = null; try { data = (await loadData()).data; } catch (e) { /* hors ligne */ }
  const r = data ? await setup(data) : 2;
  if (r === 2) { const w = await build("large"); await w.presentLarge(); }
}
Script.complete();
