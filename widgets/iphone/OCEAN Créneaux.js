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
const VERSION = "2026-11-14a";   // affichée dans les réglages : permet de savoir quelle version tourne
// ------------------------------------------------------- mise a jour automatique
// Le widget va chercher sa propre version publiee et reecrit son fichier. La nouvelle version s'applique au
// rafraichissement suivant : une correction n'oblige plus a recopier le script a la main.
// Garde-fous : on n'ecrit que du code visiblement complet (marqueur + taille), jamais une page d'erreur.
const SOURCE = APP + "widgets/ocean-creneaux.js";
const MARQUEUR = "OCEAN_WIDGET_CRENEAUX_FIN";   // derniere ligne du fichier : prouve que le telechargement est complet
async function majAuto() {
  try {
    const chemin = typeof module !== "undefined" && module.filename;
    if (!chemin) return;
    const src = await new Request(SOURCE).loadString();
    if (typeof src !== "string" || src.length < 4000 || !src.trim().endsWith(MARQUEUR)) return;
    let fm;
    try { fm = FileManager.iCloud(); } catch (e) { fm = FileManager.local(); }
    let actuel = null;
    try { actuel = fm.readString(chemin); } catch (e) { actuel = null; }
    if (actuel === src) return;
    fm.writeString(chemin, src);
  } catch (e) { /* hors ligne ou dossier verrouille : on garde la version en place */ }
}

const K_MODE = "ocean.creneaux.mode", K_SPOTS = "ocean.creneaux.spots";
const NEAR = ["la-grande-motte", "le-ponant", "port-camargue"];   // < 55 km de Montpellier (comme les Sessions 2H)
const REFRESH_MIN = 30;

const dyn = (light, dark) => Color.dynamic(new Color(light), new Color(dark));
const BG = dyn("#FFFFFF", "#16262C"), CELL = dyn("#F2F3F0", "#1E3138");
const INK = dyn("#152B33", "#EAF1EF"), INK2 = dyn("#3E5157", "#B7C8C6"), INK3 = dyn("#5C6E74", "#8EA4A3"), LINE = dyn("#E4E8E4", "#25393F");
const OFF = dyn("#D6DCD6", "#33494F");
const STAR = [OFF, dyn("#23A26A", "#4CC38A"), dyn("#EE7F1B", "#F5A04A"), dyn("#8A4FD8", "#B38BF5")];
// « Kite session » (plus de 28 nd, D-49) : jamais dans un créneau wing, signalée en rouge dans la grille
const KITE = dyn("#D6343C", "#FF6B6B");
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
// Tailles réelles des widgets, MESURÉES sur une capture d'écran (jamais estimées). Clé : l'écran que rapporte
// l'iPhone (affiché dans les réglages du script). Écran absent de la table → plus petit iPhone : la carte peut
// garder du vide, elle ne déborde jamais. Pour ajouter un iPhone : lire l'écran dans les réglages, mesurer la
// carte sur une capture, ajouter la ligne.
const MESURES = {
  "402x874": { large: [348, 364], medium: [348, 164] },   // iPhone 16 Pro de Tom, mesuré le 13/11
};
const PLUS_PETIT = { small: [141, 141], medium: [292, 141], large: [292, 311] };
function ecranCle() {
  try { const s = Device.screenSize(); return `${Math.round(Math.min(s.width, s.height))}x${Math.round(Math.max(s.width, s.height))}`; }
  catch (e) { return "?"; }
}
function tailleWidget(famille) {
  const t = (MESURES[ecranCle()] || {})[famille];
  if (t) return { l: t[0], h: t[1], mesure: true };
  const d = PLUS_PETIT[famille] || PLUS_PETIT.large;
  return { l: d[0], h: d[1], mesure: false };
}
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
  // x = [heures 1★, 2★, 3★, heures de jour, heures « Kite session »]
  for (const [k, col] of [[3, "#8A4FD8"], [2, "#EE7F1B"], [1, "#23A26A"], [5, "#D6343C"]]) {
    const wpx = ((x[k - 1] || 0) / tot) * w; if (wpx <= 0) continue;
    c.setFillColor(new Color(col)); c.fillRect(new Rect(at, 0, wpx, h)); at += wpx;
  }
  return c.getImage();
}

/** Case de la grille (comme la Prévision 5 jours de l'app, Tom 14/11) : une colonne par heure de jour, hauteur = note,
 *  couleur des étoiles (rouge : Kite session), sur la moitié basse de la case. Renvoie aussi la note du jour. */
function dayCols(sp, key, level, w, h) {
  const L = level === "offshore" ? 6 : 5;
  const hh = (sp.hours || []).filter((x) => x[4] && dayKey(x[0]) === key);
  if (!hh.length) return null;
  const c = new DrawContext(); c.size = new Size(w, h); c.opaque = false; c.respectScreenScale = true;
  const pad = 3, bw = (w - 2 * pad) / hh.length, top = h * 0.48;
  let best = -1, stars1 = false;
  hh.forEach((x, j) => {
    const kite = !!x[7], v = x[L] == null ? 0 : x[L], k = starsOf(x[L]);
    if (!kite) best = Math.max(best, v);
    if (kite || k > 0) stars1 = true;
    const bh = Math.max(1.5, ((kite ? 10 : v) / 10) * (h - top - pad));
    c.setFillColor(new Color(kite ? "#D6343C" : ["#C9CFC9", "#23A26A", "#EE7F1B", "#8A4FD8"][k]));
    c.fillRect(new Rect(pad + j * bw + 0.5, h - pad - bh, Math.max(1, bw - 1), bh));
  });
  return { img: c.getImage(), best, calm: !stars1 };
}
const note1 = (v) => (Math.round(v * 10) / 10).toFixed(1).replace(".", ",");

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
  text(w, "MEILLEUR CRÉNEAU", F.b(10), INK3, { scale: 0.6 }); w.addSpacer(4);
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
  // Tom, 12/11 : étoiles collées au nom du spot, l'ensemble centré dans le bloc plutôt qu'écartelé haut / bas
  best.addSpacer(); stars(best, k, 16, false); best.addSpacer(5);
  text(best, c.spot.short, F.h(15), INK, { scale: 0.6 });
  text(best, `${dayLabel(dayKey(c.s), now)} ${span(c)}`, F.s(12), INK2, { scale: 0.7 });
  best.addSpacer(4); text(best, `${c.kn ?? "–"} nd ${compass(c.dir)}`, F.b(12), INK); best.addSpacer();
  best.url = link(c);
  // colonne de droite centrée sur la hauteur, comme le bloc du meilleur créneau (Tom, 13/11)
  const right = row.addStack(); right.layoutVertically(); right.spacing = 6;
  right.addSpacer();
  for (const x of list.slice(1, 4)) {
    const r = right.addStack(); r.layoutVertically(); r.url = link(x);
    const a = r.addStack(); a.spacing = 6; a.centerAlignContent();
    text(a, x.spot.short, F.h(13), INK, { scale: 0.7 }); stars(a, starsOf(x.p), 11, false); a.addSpacer();
    const b = r.addStack(); text(b, `${dayLabel(dayKey(x.s), now)} ${span(x)}`, F.r(11), INK2); b.addSpacer(); text(b, `${x.kn ?? "–"} nd ${compass(x.dir)}`, F.b(11), INK);
  }
  if (list.length < 2) text(right, "Pas d'autre créneau en vue", F.r(11), INK3);
  text(right, cfg.label, F.r(9), INK3);
  right.addSpacer();
  w.url = link(c);
}
const HEAD = { "La Franqui": "Franqui", "Espiguette": "Espig.", "Almanarre": "Alman.", "Plage Sud": "P. Sud" };   // en-têtes de colonne courts
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
    text(l1, "MEILLEUR CRÉNEAU", F.b(10), INK3, { scale: 0.6 }); l1.addSpacer();
    const pill = l1.addStack(); pill.backgroundColor = k ? STAR[k] : OFF; pill.cornerRadius = 8; pill.setPadding(1, 7, 1, 7);
    text(pill, `${c.h}h`, F.h(11), Color.white());
    const d = new Date(c.s);
    text(b, `${JOURS[d.getDay()]} ${d.getDate()} · ${span(c)}`, F.h(19), INK, { scale: 0.5 });
    const l3 = b.addStack(); l3.centerAlignContent();
    l3.spacing = 6; text(l3, c.spot.name, F.s(13), INK, { scale: 0.6 }); stars(l3, k, 12, false); l3.addSpacer();
    text(b, `${c.kn ?? "–"} nd ${compass(c.dir)}${c.g ? ` · raf. ${c.g}` : ""}`, F.b(12), INK2, { scale: 0.7 });
  } else text(w, "Pas de créneau dans les 5 jours", F.s(13), INK2);
  w.addSpacer(10);
  // la nuit (plus aucune heure de jour à venir aujourd'hui) : la ligne du jour, vide, est retirée
  const today = dayKey(now);
  let days = data.days.slice(0, 5), off = 0;
  const dayLeft = data.spots.some((sp) => (sp.hours || []).some((h) => h[4] && dayKey(h[0]) === today && h[0] + 3600e3 > now));
  if (days.length > 1 && days[0] === today && !dayLeft) { days = days.slice(1); off = 1; }
  const cols = cfg.spots.slice(0, 8), nameW = 34, gap = 3;
  // un addSpacer() souple réclame au moins 8 pt : il faut les compter, sinon la grille dépasse la carte (12/11)
  const utile = tailleWidget("large").l - 28;   // largeur réelle (mesurée) ou celle du plus petit iPhone
  const cw = Math.max(20, Math.floor((utile - nameW - 8 * Math.max(1, cols.length)) / Math.max(1, cols.length))), ch = 25;
  const hdr = w.addStack();
  const n0 = hdr.addStack(); n0.size = new Size(nameW, 0);
  // pile verticale : le nom du spot est centré sans espace souple (sinon iOS le remplace par « … »)
  for (const sp of cols) { hdr.addSpacer(); const h = hdr.addStack(); h.layoutVertically(); h.spacing = 0; h.size = new Size(cw, 12); h.centerAlignContent(); text(h, colLabel(sp), F.b(9), INK3, { scale: 0.5, center: true }); }
  hdr.addSpacer(0);
  w.addSpacer(3);
  days.forEach((key, i) => {
    const r = w.addStack(); r.centerAlignContent();
    const n = r.addStack(); n.size = new Size(nameW, 0); text(n, rowLabel(key, now), F.h(11), INK, { scale: 0.5 });
    for (const sp of cols) {
      r.addSpacer();   // espace souple : les colonnes remplissent la carte, quelle que soit sa largeur
      const x = (sp.daily[cfg.level] || [])[i + off];
      const ses = (sp.sessions[cfg.level] || []).filter((s) => dayKey(s.s) === key);
      const cell = r.addStack(); cell.layoutVertically(); cell.spacing = 0; cell.size = new Size(cw, ch);
      cell.cornerRadius = 6; cell.backgroundColor = CELL; cell.centerAlignContent();
      // colonnes des heures de jour + note du jour (Tom, 14/11) ; case plus claire sans heure à 1 étoile
      const dc = dayCols(sp, key, cfg.level, cw, ch);
      if (!dc) { cell.addSpacer(); text(cell, "—", F.s(10), INK3, { scale: 0.6, center: true }); cell.addSpacer(); continue; }
      cell.backgroundImage = dc.img;
      if (dc.calm) cell.backgroundColor = BG;
      const pr = cell.addStack(); pr.spacing = 0; pr.setPadding(1, 0, 0, 2); pr.addSpacer();
      if (dc.best > 0) text(pr, note1(dc.best), F.h(9), dc.best >= 5 ? STAR[starsOf(dc.best)] : INK3, { scale: 0.6 });
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
  const a = new Alert(); a.title = "OCEAN · Créneaux vent · " + VERSION;
  a.message = `Écran : ${ecranCle()}${MESURES[ecranCle()] ? " (taille mesurée)" : " (taille par défaut)"}\nMode : ${Keychain.contains(K_MODE) && Keychain.get(K_MODE) === "offshore" ? "OffShore" : "Sécu first"}\nSpots : ${Keychain.contains(K_SPOTS) && Keychain.get(K_SPOTS) ? Keychain.get(K_SPOTS) : "tous"}`;
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

await majAuto();   // avant le rendu : même si l'affichage échoue, la correction suivante arrivera seule
if (config.runsInWidget) Script.setWidget(await build(config.widgetFamily || "medium"));
else {
  let data = null; try { data = (await loadData()).data; } catch (e) { /* hors ligne */ }
  const r = data ? await setup(data) : 2;
  if (r === 2) { const w = await build("large"); await w.presentLarge(); }
}
Script.complete();
// OCEAN_WIDGET_CRENEAUX_FIN

