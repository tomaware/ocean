// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: wind;

// OCEAN — widget « Vent » (iPhone, Scriptable)
// Un spot au choix : le vent maintenant (balise) et dans 2 h, puis la prévision sur 4 jours.
// Tailles : petit, moyen, grand, et écran verrouillé (rectangulaire, en ligne, rond).
//
// CHANGER DE SPOT
//  • une fois pour toutes : ouvre ce script dans Scriptable (▶︎) → « Choisir le spot »
//  • pour un widget précis : appui long → Modifier le widget → Parameter, ex. « Beauduc », « Le Jaï offshore »
// Mode : « Sécu first » par défaut ; ajoute « offshore » dans Parameter pour le mode OffShore.
//
// BALISE EN DIRECT (mode perso) : ▶︎ → « Brancher ma super prévision » et colle le lien de ton script Google.
// Le lien est rangé dans le trousseau de l'iPhone, jamais dans ce fichier.

const DATA = "https://tomaware.github.io/ocean/data/widget-wind.json";
const APP = "https://tomaware.github.io/ocean/";
const VERSION = "2026-11-12c";   // affichée dans les réglages : permet de savoir quelle version tourne
// ------------------------------------------------------- mise a jour automatique
// Le widget va chercher sa propre version publiee et reecrit son fichier. La nouvelle version s'applique au
// rafraichissement suivant : une correction n'oblige plus a recopier le script a la main.
// Garde-fous : on n'ecrit que du code visiblement complet (marqueur + taille), jamais une page d'erreur.
const SOURCE = APP + "widgets/ocean-vent.js";
const MARQUEUR = "OCEAN_WIDGET_VENT_FIN";   // derniere ligne du fichier : prouve que le telechargement est complet
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

const DEFAULT_SPOT = "la-grande-motte";
const K_SPOT = "ocean.vent.spot", K_MODE = "ocean.vent.mode", K_SP = "ocean.superprevision";
const LIVE_MAX_MIN = 90;          // au-delà, la balise est trop vieille : on affiche la prévision de l'heure
const REFRESH_MIN = 15;

// ------------------------------------------------------------------ couleurs (clair / sombre automatiques)
const dyn = (light, dark) => Color.dynamic(new Color(light), new Color(dark));
const BG = dyn("#FFFFFF", "#16262C"), CELL = dyn("#F2F3F0", "#1E3138");
const INK = dyn("#152B33", "#EAF1EF"), INK2 = dyn("#3E5157", "#B7C8C6"), INK3 = dyn("#5C6E74", "#8EA4A3");
const LIVE = dyn("#17804F", "#4CC38A"), OFF = dyn("#D6DCD6", "#33494F"), LINE = dyn("#E4E8E4", "#25393F");
const STAR = [OFF, dyn("#23A26A", "#4CC38A"), dyn("#EE7F1B", "#F5A04A"), dyn("#8A4FD8", "#B38BF5")];
const NONE = dyn("#E6E9E5", "#25393F");
// échelle de vent façon Windguru (comme les tableaux de l'app)
const SCALE = [[5, "#FFFFFF", "#3E5157"], [8, "#DDF3FA", "#152B33"], [11, "#A9E3EE", "#152B33"], [14, "#7FDDB0", "#0F3322"], [17, "#B5EA62", "#21360A"],
  [20, "#F2EC4E", "#383300"], [23, "#FFC94D", "#3A2700"], [26, "#FFA04A", "#3A1A00"], [30, "#F66A4B", "#FFFFFF"], [999, "#D9386E", "#FFFFFF"]];
const windCell = (kn) => { const c = SCALE.find((s) => (kn ?? 0) < s[0]); return [new Color(c[1]), new Color(c[2])]; };

// ------------------------------------------------------------------ outils
const DIR16 = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];
const compass = (d) => (d == null ? "" : DIR16[Math.round(d / 22.5) % 16]);
const fromText = (o) => { const k = DIR16.indexOf(String(o || "").toUpperCase().replace("W", "O")); return k < 0 ? null : k * 22.5; };
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-");
const GRILLE = [9, 17];   // heures de la grille heure par heure du grand format
const starsOf = (s) => (s == null ? 0 : s >= 8.5 ? 3 : s >= 7 ? 2 : s >= 5 ? 1 : 0);
const hh = (t) => `${new Date(t).getHours()} h`;
const DAYS = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];
const dayKey = (t) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const dayLabel = (key, now) => (key === dayKey(now) ? "Auj." : DAYS[new Date(key + "T12:00:00").getDay()]);
const ago = (t, now) => { const m = Math.max(0, Math.round((now - t) / 60000)); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`; };

function arrow(from, size) {
  // flèche dans le sens où va le vent (vent « de » from) ; image modèle, teinte par tintColor
  const c = new DrawContext(); c.size = new Size(size * 3, size * 3); c.opaque = false; c.respectScreenScale = true;
  const r = size * 1.5, a = ((from + 180) * Math.PI) / 180;
  const pt = (dx, dy) => new Point(r + dx * Math.cos(a) - dy * Math.sin(a), r + dx * Math.sin(a) + dy * Math.cos(a));
  const p = new Path();
  p.move(pt(0, -r * 0.9)); p.addLine(pt(r * 0.6, r * 0.7)); p.addLine(pt(0, r * 0.35)); p.addLine(pt(-r * 0.6, r * 0.7)); p.closeSubpath();
  c.addPath(p); c.setFillColor(Color.black()); c.fillPath();
  return c.getImage();
}
function addArrow(stack, from, size, color) {
  if (from == null) return;
  const i = stack.addImage(arrow(from, size)); i.imageSize = new Size(size, size); i.tintColor = color;
}
// Largeur de référence : celle du plus petit grand widget (iPhone SE/mini). Elle n'est JAMAIS estimée depuis
// l'écran — Device.screenSize() ne donne pas la largeur du widget, et une grille trop large est écrasée par iOS
// (chiffres coupés, carte débordant des deux côtés : constaté sur l'iPhone de Tom le 12/11). Les colonnes sont
// séparées par des espaces souples : sur un grand iPhone, la grille remplit la carte sans jamais la dépasser.
const UTILE = 264;
function text(stack, s, font, color, opts = {}) {
  const t = stack.addText(String(s)); t.font = font; t.textColor = color; t.lineLimit = opts.lines ?? 1;
  if (opts.scale) t.minimumScaleFactor = opts.scale;
  if (opts.center) t.centerAlignText(); if (opts.right) t.rightAlignText();
  return t;
}
const F = { h: (n) => Font.heavySystemFont(n), b: (n) => Font.boldSystemFont(n), s: (n) => Font.semiboldSystemFont(n), r: (n) => Font.systemFont(n) };
function cellNum(stack, kn, w, h, size) {
  const [bg, fg] = windCell(kn);
  // La case prend TOUTE la largeur de la colonne et le chiffre est calé à gauche avec 2 pt : aucun espace souple
  // ne vient lui prendre la place (c'est ce qui le remplaçait par « … » puis le réduisait, 12/11). Le centrage
  // horizontal dans une pile n'est pas fiable sous Scriptable, on ne s'y fie plus.
  const s = stack.addStack(); s.spacing = 0; s.size = new Size(w, h);
  s.backgroundColor = bg; s.cornerRadius = 5; s.setPadding(0, 2, 0, 0); s.centerAlignContent();
  text(s, kn == null ? "–" : String(Math.round(kn)), F.h(size), fg, { scale: 0.8 });
  return s;
}
function starsText(stack, k, size) {
  const s = stack.addStack(); s.spacing = 0; s.centerAlignContent();
  if (k) text(s, "★".repeat(k), F.b(size), STAR[k]);
  if (k < 3) text(s, "★".repeat(3 - k), F.b(size), OFF);
}

// ------------------------------------------------------------------ données
async function loadData() {
  const fm = FileManager.local(), path = fm.joinPath(fm.documentsDirectory(), "ocean-widget-wind.json");
  try {
    const r = new Request(DATA); r.timeoutInterval = 15;
    const j = await r.loadJSON();
    if (!j || !j.spots) throw new Error("données vides");
    fm.writeString(path, JSON.stringify(j));
    return { data: j, cached: false };
  } catch (e) {
    if (fm.fileExists(path)) return { data: JSON.parse(fm.readString(path)), cached: true };
    throw e;
  }
}
async function loadLive(spot, data, now) {
  // 1) balise Winds-Up via ta super prévision (mode perso) ; 2) mesure publique publiée par OCEAN (Le Jaï : Marignane)
  if (Keychain.contains(K_SP)) {
    try {
      const url = Keychain.get(K_SP); const r = new Request(url + (url.includes("?") ? "&" : "?") + "action=live"); r.timeoutInterval = 10;
      const j = await r.loadJSON();
      for (const x of Object.values((j && j.spots) || {})) {
        const n = norm(x.nom);
        if (!(n === spot.id || n.startsWith(spot.id + "-") || n.includes(spot.id))) continue;
        const abo = !!j.connecte;   // relevés de ton abonnement Winds-Up (sinon pages publiques, 2 h de retard)
        if (x.panne) return { panne: true, src: "balise", abo };
        if (Number.isFinite(x.t) && now - x.t < LIVE_MAX_MIN * 60000) return { t: x.t, kn: x.v, gust: x.max ?? null, dir: fromText(x.o), dirTxt: x.o, src: "balise", abo };
        if (Number.isFinite(x.t)) return { stale: true, t: x.t, kn: x.v, gust: x.max ?? null, dir: fromText(x.o), dirTxt: x.o, src: "balise", abo };   // balise trop vieille : prévision affichée (la nuit, à défaut, ce relevé)
      }
    } catch (e) { /* hors ligne : on passe à la suite */ }
  }
  const o = data.obs && data.obs[spot.id];
  if (o && now - o.t < LIVE_MAX_MIN * 60000) return { t: o.t, kn: o.kn, gust: o.gust, dir: o.dir, dirTxt: compass(o.dir), src: "Marignane" };
  return null;
}
function settings() {
  const p = String(args.widgetParameter || "").trim();
  const offshore = /off\s*shore/i.test(p) || (!p && Keychain.contains(K_MODE) && Keychain.get(K_MODE) === "offshore");
  const name = p.replace(/off\s*shore|s[ée]cu(\s*first)?/gi, "").trim();
  return { spotQuery: name || (Keychain.contains(K_SPOT) ? Keychain.get(K_SPOT) : DEFAULT_SPOT), level: offshore ? "offshore" : "secu" };
}
function findSpot(data, q) {
  const n = norm(q);
  return data.spots.find((s) => s.id === n) || data.spots.find((s) => norm(s.short) === n || norm(s.name) === n)
    || data.spots.find((s) => norm(s.name).includes(n) || norm(s.short).includes(n) || s.id.includes(n)) || data.spots.find((s) => s.id === DEFAULT_SPOT) || data.spots[0];
}

// ------------------------------------------------------------------ modèle de ce qui est affiché
function model(data, spot, level, live, now) {
  const L = level === "offshore" ? 6 : 5;
  const rows = spot.hours.map((h) => ({ t: h[0], kn: h[1], gust: h[2], dir: h[3], day: !!h[4], score: h[L] }));
  const near = (t) => rows.reduce((b, r) => (Math.abs(r.t - t) < Math.abs((b ? b.t : Infinity) - t) ? r : b), null);
  const cur = near(now), in2 = near(now + 2 * 3600e3);
  const nowRow = cur && Math.abs(cur.t - now) <= 3600e3 ? cur : null;
  const twoRow = in2 && Math.abs(in2.t - (now + 2 * 3600e3)) <= 3600e3 ? in2 : null;
  const days = data.days.slice(0, 4).map((d, k) => {
    const rr = rows.filter((r) => dayKey(r.t) === d && r.day);
    const best = rr.reduce((b, r) => ((r.score ?? -1) > (b ? b.score ?? -1 : -1) ? r : b), null);
    const max = rr.reduce((b, r) => ((r.kn ?? -1) > (b ? b.kn ?? -1 : -1) ? r : b), null);
    const ss = (spot.sessions[level] || []).filter((s) => dayKey(s.s) === d);
    const strip = [];
    for (let h = 7; h <= 21; h++) { const r = rr.find((x) => new Date(x.t).getHours() === h); strip.push(r ? starsOf(r.score) : -1); }
    return { key: d, label: dayLabel(d, now), stars: starsOf(best ? best.score : null), kn: max ? max.kn : null, dir: max ? max.dir : null,
      cr: ss.length ? `${new Date(ss[0].s).getHours()}–${new Date(ss[0].e).getHours()} h` : "—", strip };
  });
  const next = rows.filter((r) => r.t >= now - 3600e3).slice(0, 12);
  // grand format : aujourd'hui et demain heure par heure, 7 h → 21 h (après 21 h : demain et après-demain), comme le widget Windows
  const k0 = new Date(now).getHours() >= 21 ? 1 : 0;
  const detail = [k0, k0 + 1].map((k) => {
    const d = dayKey(now + k * 86400e3);
    const rr = rows.filter((r) => dayKey(r.t) === d);
    const hours = [];
  // Fenêtre de la grille heure par heure : 9 h → 17 h (Tom, 12/11, après comparaison des densités à la vraie
  // taille). La bande 4 jours, les créneaux et les max du jour gardent 7 h → 21 h.
    for (let h = GRILLE[0]; h <= GRILLE[1]; h++) {
      const r = rr.find((x) => new Date(x.t).getHours() === h);
      hours.push({ h, has: !!r, kn: r ? r.kn : null, gust: r ? r.gust : null, dir: r ? r.dir : null, stars: r && r.day ? starsOf(r.score) : 0, past: !!r && r.t + 3600e3 <= now });
    }
    const up = hours.filter((x) => x.has && !x.past);
    const max = up.reduce((b, x) => (x.kn != null && (!b || x.kn > b.kn) ? x : b), null);
    const gmax = up.reduce((g, x) => (x.gust != null && (g == null || x.gust > g) ? x.gust : g), null);
    const ss = (spot.sessions[level] || []).filter((x) => dayKey(x.s) === d && x.e > now);
    return { key: d, label: k === 0 ? "Aujourd'hui" : k === 1 ? "Demain" : "Après-demain",
      date: new Date(now + k * 86400e3).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric" }),
      stars: up.reduce((b, x) => Math.max(b, x.stars), 0), kn: max ? max.kn : null, dir: max ? max.dir : null, gust: gmax,
      cr: ss.length ? ss.map((x) => `${new Date(x.s).getHours()}–${new Date(x.e).getHours()} h`).join(" · ") : "pas de créneau", hours };
  });
  return { spot, stale: live && live.stale ? live.t : null, detail, rows, now: live && !live.panne && !live.stale ? live : nowRow ? { t: nowRow.t, kn: nowRow.kn, gust: nowRow.gust, dir: nowRow.dir, dirTxt: compass(nowRow.dir), src: "prévu" } : live && live.stale ? live : null,
    panne: live && live.panne, in2: twoRow, days, next };
}

// ------------------------------------------------------------------ mises en page
/** D'où vient le vent affiché en grand : balise Winds-Up (abonnement ou pages publiques), Marignane, ou prévision (Tom, 11/11). */
const srcText = (m, now, short) => {
  if (m.panne) return "balise en panne";
  if (!m.now) return "pas de vent";
  if (m.now.src === "balise") { const k = m.now.abo ? "abonné" : "public"; return short ? `● ${k} · ${ago(m.now.t, now)}` : `● Winds-Up ${k} · ${ago(m.now.t, now)}`; }
  if (m.now.src === "Marignane") return short ? `● ${ago(m.now.t, now)}` : `● Marignane · ${ago(m.now.t, now)}`;
  if (m.stale != null) return short ? `prévision (balise ${ago(m.stale, now)})` : `prévision · balise il y a ${ago(m.stale, now)}`;
  return short ? "prévision" : m.spot && m.spot.source === "corrected" ? "prévision corrigée" : "prévision";
};

function header(w, spot, m, now, big) {
  const top = w.addStack(); top.centerAlignContent();
  text(top, big ? String(spot.name).split(" / ")[0].replace(/\s*\(.*\)$/, "") : spot.short, F.h(big ? 15 : 14), INK, { scale: 0.7 });
  top.addSpacer();
  const src = srcText(m, now, !big);
  text(top, src, F.b(10), m.now && m.now.src !== "prévu" && !m.now.stale ? LIVE : INK3, { scale: 0.6 });
}
function bigNow(stack, m, size) {
  const s = stack.addStack(); s.centerAlignContent(); s.spacing = 6;
  // vent mesuré en direct : vert dès 15 nd, orange dès 20, violet dès 25
  const live = m.now && m.now.src !== "prévu" && !m.now.stale && m.now.kn != null;
  text(s, m.now ? String(Math.round(m.now.kn)) : "–", F.h(size), live && m.now.kn >= 25 ? STAR[3] : live && m.now.kn >= 20 ? STAR[2] : live && m.now.kn >= 15 ? STAR[1] : INK, { scale: 0.7 });
  const c = s.addStack(); c.layoutVertically(); c.spacing = 1;
  if (m.now) addArrow(c, m.now.dir, Math.round(size / 2.2), INK);
  text(c, `nd ${m.now ? m.now.dirTxt || compass(m.now.dir) : ""}`, F.b(Math.max(10, Math.round(size / 3.7))), INK);
}
function small(w, data, spot, m, now) {
  header(w, spot, m, now, false); w.addSpacer();
  bigNow(w, m, 44);
  text(w, m.now && m.now.gust != null ? `${m.now.src === "balise" ? "max" : "rafales"} ${Math.round(m.now.gust)} nd` : " ", F.r(12), INK2);
  w.addSpacer(6);
  const b = w.addStack(); b.centerAlignContent();
  text(b, m.in2 ? `Dans 2 h ${Math.round(m.in2.kn)}` : "Dans 2 h –", F.s(12), INK2); b.addSpacer();
  starsText(b, m.days[0] ? m.days[0].stars : 0, 12);
}
function dayCols(stack, m, cellW) {
  for (const d of m.days) {
    // contenu centré par centerAlignContent() : aucun espace souple ne vient prendre la place des textes
    const c = stack.addStack(); c.layoutVertically(); c.size = new Size(cellW, 0); c.backgroundColor = CELL;
    c.cornerRadius = 10; c.setPadding(6, 2, 6, 2); c.spacing = 4; c.centerAlignContent();
    text(c, d.label, F.h(11), INK, { scale: 0.6, center: true });
    starsText(c, d.stars, 10);
    cellNum(c, d.kn, cellW - 8, 20, 13);
    addArrow(c, d.dir, 13, INK2);
    text(c, d.cr, F.s(10), INK2, { scale: 0.6, center: true });
  }
}
function medium(w, data, spot, m, now) {
  // largeurs calées sur le plus petit widget moyen (305 pt) : 96 + 8 d'écart + 4 colonnes de 40 + 3 écarts = 273
  const row = w.addStack();
  const left = row.addStack(); left.layoutVertically(); left.size = new Size(96, 0);
  text(left, spot.short, F.h(14), INK, { scale: 0.7 });
  text(left, srcText(m, now, true), F.b(10), m.now && m.now.src !== "prévu" && !m.now.stale ? LIVE : INK3, { scale: 0.7 });
  left.addSpacer(); bigNow(left, m, 38); left.addSpacer();
  text(left, `${m.now && m.now.gust != null ? `raf. ${Math.round(m.now.gust)} · ` : ""}2 h : ${m.in2 ? Math.round(m.in2.kn) : "–"}`, F.r(11), INK2, { scale: 0.7 });
  row.addSpacer();
  const right = row.addStack(); right.spacing = 3; dayCols(right, m, 40);
}
function large(w, data, spot, m, now) {
  header(w, spot, m, now, true); w.addSpacer(4);
  const r = w.addStack(); r.centerAlignContent(); bigNow(r, m, 34); r.addSpacer();
  const rr = r.addStack(); rr.layoutVertically();
  text(rr, m.now && m.now.gust != null ? `${m.now.src === "balise" ? "max" : "rafales"} ${Math.round(m.now.gust)} nd` : "", F.s(12), INK2);
  text(rr, m.in2 ? `dans 2 h : ${Math.round(m.in2.kn)} nd ${compass(m.in2.dir)}` : "", F.s(12), INK2);
  // aujourd'hui et demain heure par heure : vent, rafales, direction, étoiles.
  // Les heures passées sont retirées, et la largeur des colonnes vient de leur nombre : la grille ne déborde jamais
  // du widget (sinon iOS écrase les colonnes et coupe les chiffres à un caractère).
  for (const d of m.detail) {
    const cols = d.hours.filter((x) => x.has && !x.past);
    if (!cols.length) continue;
    const cw = Math.max(15, Math.min(40, Math.floor((UTILE - 26 - 3 * (cols.length - 1)) / cols.length)));   // 26 = marge du bloc + centrage
    // Tailles déduites de la largeur de colonne : un chiffre fait ~0,80 × la taille de la police (mesuré sur la
    // capture du 12/11), donc deux chiffres tiennent si la police reste sous (cw - 2) / 1,6. Le vent est le plus
    // gros élément de la colonne, l'heure et la rafale restent secondaires.
    const fn = Math.max(9, Math.min(15, Math.floor((cw - 2) / 1.6)));
    const fh = Math.min(9, fn - 4), fg = Math.min(9, fn - 4), fa = Math.min(15, cw - 6);
    w.addSpacer(7);
    const hd = w.addStack(); hd.centerAlignContent(); hd.spacing = 4;
    text(hd, d.label, F.h(13), INK, { scale: 0.7 }); text(hd, d.date, F.r(11), INK3, { scale: 0.6 });
    if (d.stars) text(hd, "★".repeat(d.stars), F.b(11), STAR[d.stars]);
    hd.addSpacer();
    if (d.kn != null) text(hd, `max ${Math.round(d.kn)} nd ${compass(d.dir)}${d.gust != null ? ` · raf. ${Math.round(d.gust)}` : ""}`, F.b(11), INK, { scale: 0.6 });
    w.addSpacer(3);
    // La grille est centrée dans la carte : sa largeur est calculée sur le plus petit grand widget, espaces
    // compris. Un addSpacer() souple coûte au moins 8 pt — ne pas les compter faisait dépasser la grille, qui
    // écrasait alors les colonnes (12/11). Ici les écarts sont explicites (3 pt) et le contenu des colonnes est
    // centré par centerAlignContent(), sans aucun espace souple qui prendrait la place des chiffres.
    const wrap = w.addStack(); wrap.addSpacer();
    const box = wrap.addStack(); box.backgroundColor = CELL; box.cornerRadius = 10; box.setPadding(5, 5, 5, 5); box.spacing = 3;
    cols.forEach((x) => {
      const c = box.addStack(); c.layoutVertically(); c.size = new Size(cw, 0); c.spacing = 1;
      text(c, x.h, F.s(fh), INK3, { scale: 0.7 });
      cellNum(c, x.kn, cw, fn + 6, fn);                                      // la case occupe toute la colonne
      text(c, x.gust != null ? String(Math.round(x.gust)) : " ", F.r(fg), INK2, { scale: 0.7 });
      addArrow(c, x.dir, fa, INK2);
      const sb = c.addStack(); sb.size = new Size(cw - 3, 5); sb.cornerRadius = 2; sb.backgroundColor = x.stars > 0 ? STAR[x.stars] : NONE;
    });
    wrap.addSpacer();
  }
}
function lock(w, family, spot, m) {
  const k = m.now ? Math.round(m.now.kn) : "–", dir = m.now ? m.now.dirTxt || compass(m.now.dir) : "";
  if (family === "accessoryInline") { text(w, `${spot.short} ${k} nd ${dir}`, F.s(12), Color.white()); return; }
  if (family === "accessoryCircular") {
    const s = w.addStack(); s.layoutVertically(); s.centerAlignContent();
    const a = s.addStack(); a.addSpacer(); text(a, k, F.h(20), Color.white()); a.addSpacer();
    const b = s.addStack(); b.addSpacer(); text(b, dir, F.b(10), Color.white()); b.addSpacer();
    return;
  }
  text(w, `${spot.short} · ${k} nd ${dir}`, F.h(13), Color.white(), { scale: 0.7 });
  text(w, `${m.now && m.now.gust != null ? `raf. ${Math.round(m.now.gust)} · ` : ""}2 h : ${m.in2 ? Math.round(m.in2.kn) : "–"}`, F.r(12), Color.white());
  const d = m.days[0];
  text(w, d ? `${"★".repeat(d.stars) || "pas d'étoile"} ${d.cr !== "—" ? d.cr : ""}` : "", F.r(12), Color.white());
}

// ------------------------------------------------------------------ réglages dans l'app
async function setup(data) {
  const a = new Alert(); a.title = "OCEAN · widget Vent · " + VERSION;
  a.message = `Spot par défaut : ${Keychain.contains(K_SPOT) ? Keychain.get(K_SPOT) : DEFAULT_SPOT}\nMode : ${Keychain.contains(K_MODE) && Keychain.get(K_MODE) === "offshore" ? "OffShore" : "Sécu first"}\nBalise en direct : ${Keychain.contains(K_SP) ? "branchée" : "non"}`;
  a.addAction("Choisir le spot"); a.addAction("Mode Sécu first / OffShore"); a.addAction("Brancher ma super prévision"); a.addAction("Aperçu du widget"); a.addCancelAction("Fermer");
  const r = await a.presentSheet();
  if (r === 0) {
    const b = new Alert(); b.title = "Spot du widget"; data.spots.forEach((s) => b.addAction(s.name)); b.addCancelAction("Annuler");
    const k = await b.presentSheet(); if (k >= 0) Keychain.set(K_SPOT, data.spots[k].id);
  } else if (r === 1) {
    const b = new Alert(); b.title = "Mode"; b.addAction("Sécu first"); b.addAction("OffShore"); b.addCancelAction("Annuler");
    const k = await b.presentSheet(); if (k >= 0) Keychain.set(K_MODE, k === 1 ? "offshore" : "secu");
  } else if (r === 2) {
    const b = new Alert(); b.title = "Lien de ta super prévision"; b.message = "Le lien …/exec?key=… de ton script Google. Il reste dans le trousseau de l'iPhone.";
    b.addTextField("https://script.google.com/…", ""); b.addAction("Enregistrer"); b.addDestructiveAction("Retirer"); b.addCancelAction("Annuler");
    const k = await b.present();
    if (k === 0 && b.textFieldValue(0).trim()) Keychain.set(K_SP, b.textFieldValue(0).trim());
    if (k === 1 && Keychain.contains(K_SP)) Keychain.remove(K_SP);
  }
  return r;
}

// ------------------------------------------------------------------ programme
async function build(family) {
  const now = Date.now();
  const w = new ListWidget();
  const lockScreen = String(family).startsWith("accessory");
  if (!lockScreen) { w.backgroundColor = BG; w.setPadding(14, 14, 14, 14); }
  w.refreshAfterDate = new Date(now + REFRESH_MIN * 60000);
  let loaded;
  try { loaded = await loadData(); } catch (e) { text(w, "OCEAN", F.h(14), INK); text(w, "Pas de données (hors ligne ?)", F.r(12), INK2, { lines: 2 }); return w; }
  const { data } = loaded, st = settings(), spot = findSpot(data, st.spotQuery);
  const live = await loadLive(spot, data, now);
  const m = model(data, spot, st.level, live, now);
  w.url = `${APP}#/spot/${spot.id}`;
  if (lockScreen) lock(w, family, spot, m);
  else if (family === "small") small(w, data, spot, m, now);
  else if (family === "medium") medium(w, data, spot, m, now);
  else large(w, data, spot, m, now);
  if (loaded.cached && !lockScreen) { w.addSpacer(2); text(w, "hors ligne : dernières données", F.r(9), INK3); }
  return w;
}

await majAuto();   // avant le rendu : même si l'affichage échoue, la correction suivante arrivera seule
if (config.runsInWidget) {
  Script.setWidget(await build(config.widgetFamily || "small"));
} else {
  let data = null; try { data = (await loadData()).data; } catch (e) { /* hors ligne */ }
  const r = data ? await setup(data) : 3;
  if (r === 3) { const w = await build("large"); await w.presentLarge(); }
}
Script.complete();
// OCEAN_WIDGET_VENT_FIN

