// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: water;

// OCEAN — widget « Vague » (iPhone, Scriptable)
// Un spot surf au choix : les vagues maintenant (taille au bord, période, houle, vent), puis 4 jours ;
// en grand, aujourd'hui et demain heure par heure et le meilleur créneau surf tous spots confondus.
// Tailles : petit, moyen, grand, et écran verrouillé (rectangulaire, en ligne, rond).
//
// CHANGER DE SPOT
//  • une fois pour toutes : ouvre ce script dans Scriptable (▶︎) → « Choisir le spot »
//  • pour un widget précis : appui long → Modifier le widget → Parameter, ex. « Sète », « Palavas »

const DATA = "https://tomaware.github.io/ocean/data/widget-surf.json";
const APP = "https://tomaware.github.io/ocean/";
const DEFAULT_SPOT = "carnon";
const K_SPOT = "ocean.vague.spot";
const REFRESH_MIN = 30;

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
  // Pile VERTICALE + centerAlignContent : le texte est centré horizontalement sans espace souple. Un addSpacer()
  // horizontal dans une pile de largeur fixe prend la place avant le texte, qui devient « … » — c'est ce qui
  // coupait les nombres à deux chiffres sur l'iPhone de Tom (12/11). Ici les espaces ne jouent que sur la hauteur.
  const s = stack.addStack(); s.layoutVertically(); s.spacing = 0; s.size = new Size(w, h);
  s.backgroundColor = bg; s.cornerRadius = 5; s.centerAlignContent();
  s.addSpacer(); text(s, kn == null ? "–" : Math.round(kn), F.h(size), fg, { scale: 0.5, center: true }); s.addSpacer();
  return s;
}
function starsText(stack, k, size) {
  const s = stack.addStack(); s.spacing = 0; s.centerAlignContent();
  if (k) text(s, "★".repeat(k), F.b(size), STAR[k]);
  if (k < 3) text(s, "★".repeat(3 - k), F.b(size), OFF);
}

const WAVE = dyn("#2F8FB0", "#5BB8D6");   // barres de vagues (comme les tableaux VAGUE de l'app)
const WIND_KIND = { offshore: "vent de terre", "side-off": "side-off", side: "vent de côté", "side-on": "side-on", onshore: "vent de mer", "pétole": "pas de vent" };
const m1 = (x) => (x == null ? "–" : String(Math.round(x * 10) / 10).replace(".", ","));

// ------------------------------------------------------------------ données
async function loadData() {
  const fm = FileManager.local(), path = fm.joinPath(fm.documentsDirectory(), "ocean-widget-surf.json");
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
function findSpot(data, q) {
  const n = norm(q);
  return data.spots.find((s) => s.id === n) || data.spots.find((s) => norm(s.short) === n || norm(s.name) === n)
    || data.spots.find((s) => norm(s.name).includes(n) || norm(s.short).includes(n) || s.id.includes(n)) || data.spots.find((s) => s.id === DEFAULT_SPOT) || data.spots[0];
}
function spotQuery() {
  const p = String(args.widgetParameter || "").trim();
  return p || (Keychain.contains(K_SPOT) ? Keychain.get(K_SPOT) : DEFAULT_SPOT);
}

// ------------------------------------------------------------------ modèle de ce qui est affiché
function model(data, spot, now) {
  const rows = spot.hours.map((h) => ({ t: h[0], hb: h[1], lo: h[2], hi: h[3], tp: h[4], sd: h[5], ws: h[6], wd: h[7], wk: h[8], day: !!h[9], score: h[10] }));
  const near = (t) => { const r = rows.reduce((b, x) => (Math.abs(x.t - t) < Math.abs((b ? b.t : Infinity) - t) ? x : b), null); return r && Math.abs(r.t - t) <= 3600e3 ? r : null; };
  const days = data.days.slice(0, 4).map((d) => {
    const rr = rows.filter((r) => dayKey(r.t) === d && r.day);
    const best = rr.reduce((b, r) => ((r.score ?? -1) > (b ? b.score ?? -1 : -1) ? r : b), null);
    const ss = spot.sessions.filter((s) => dayKey(s.s) === d);
    return { key: d, label: dayLabel(d, now), stars: starsOf(best ? best.score : null), hb: best ? best.hb : null, tp: best ? best.tp : null,
      cr: ss.length ? `${new Date(ss[0].s).getHours()}–${new Date(ss[0].e).getHours()} h` : "—" };
  });
  const k0 = new Date(now).getHours() >= 21 ? 1 : 0;
  const detail = [k0, k0 + 1].map((k) => {
    const d = dayKey(now + k * 86400e3), rr = rows.filter((r) => dayKey(r.t) === d), hours = [];
  // Fenêtre de la grille heure par heure : 9 h → 17 h (Tom, 12/11, après comparaison des densités à la vraie
  // taille). La bande 4 jours, les créneaux et les max du jour gardent 7 h → 21 h.
    for (let h = GRILLE[0]; h <= GRILLE[1]; h++) {
      const r = rr.find((x) => new Date(x.t).getHours() === h);
      hours.push({ h, has: !!r && r.t + 3600e3 > now, hb: r ? r.hb : null, tp: r ? r.tp : null, ws: r ? r.ws : null, wd: r ? r.wd : null, stars: r && r.day ? starsOf(r.score) : 0 });
    }
    const up = hours.filter((x) => x.has);
    const ss = spot.sessions.filter((x) => dayKey(x.s) === d && x.e > now);
    return { label: k === 0 ? "Aujourd'hui" : k === 1 ? "Demain" : "Après-demain", date: new Date(now + k * 86400e3).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric" }),
      stars: up.reduce((b, x) => Math.max(b, x.stars), 0), hbMax: up.reduce((b, x) => (x.hb != null && x.hb > b ? x.hb : b), 0),
      cr: ss.length ? ss.map((x) => `${new Date(x.s).getHours()}–${new Date(x.e).getHours()} h`).join(" · ") : "pas de créneau", hours };
  });
  return { now: near(now), days, detail };
}
/** Meilleur créneau surf à venir, tous spots : étoiles, puis durée, puis note, puis le plus tôt (comme le widget Créneaux). */
function bestSession(data, now) {
  const all = [];
  for (const s of data.spots) for (const x of s.sessions) if (x.e > now) all.push({ ...x, spot: s, stars: starsOf(x.p) });
  all.sort((a, b) => b.stars - a.stars || b.h - a.h || b.p - a.p || a.s - b.s);
  return all[0] || null;
}
const when = (x, now) => `${dayKey(x.s) === dayKey(now) ? "Auj." : dayKey(x.s) === dayKey(now + 86400e3) ? "Demain" : DAYS[new Date(x.s).getDay()]} ${new Date(x.s).getHours()}–${new Date(x.e).getHours()} h`;
const link = (spot, t) => `${APP}#/spot/${spot.id}${t ? `?day=${encodeURIComponent(new Date(t).toLocaleDateString("fr-FR"))}` : ""}`;

// ------------------------------------------------------------------ mises en page
function nowBlock(stack, m, big) {
  const n = m.now;
  const s = stack.addStack(); s.layoutVertically(); s.spacing = 1;
  const a = s.addStack(); a.bottomAlignContent(); a.spacing = 3;
  text(a, n ? `${m1(n.lo)}–${m1(n.hi)}` : "–", F.h(big ? 30 : 26), INK, { scale: 0.5 }); text(a, "m", F.b(13), INK2, { scale: 0.6 });
  text(s, n ? `${n.tp ?? "–"} s · houle ${compass(n.sd)}` : " ", F.s(12), INK2, { scale: 0.7 });
  if (n && n.ws != null) {
    const w = (big ? a : s).addStack(); w.centerAlignContent(); w.spacing = 3;
    if (big) { w.addSpacer(10); }
    cellNum(w, n.ws, 24, 16, 10); addArrow(w, n.wd, 11, INK2); text(w, WIND_KIND[n.wk] || compass(n.wd), F.s(11), INK2, { scale: 0.6 });
  }
}
function small(w, data, spot, m, now) {
  const top = w.addStack(); top.centerAlignContent(); text(top, spot.short, F.h(14), INK, { scale: 0.7 }); top.addSpacer(); text(top, "maintenant", F.b(9), INK3);
  w.addSpacer(); nowBlock(w, m, false); w.addSpacer(6);
  const b = w.addStack(); b.centerAlignContent();
  const d = m.days[0]; text(b, d && d.cr !== "—" ? d.cr : "pas de créneau", F.s(11), INK2, { scale: 0.7 }); b.addSpacer(); starsText(b, d ? d.stars : 0, 12);
}
function medium(w, data, spot, m, now) {
  // largeurs calées sur le plus petit widget moyen (305 pt) : 96 + 8 d'écart + 4 colonnes de 40 + 3 écarts
  const row = w.addStack();
  const left = row.addStack(); left.layoutVertically(); left.size = new Size(96, 0);
  text(left, spot.short, F.h(14), INK, { scale: 0.7 }); text(left, "maintenant", F.b(9), INK3); left.addSpacer(); nowBlock(left, m, false);
  row.addSpacer();
  const right = row.addStack(); right.spacing = 3;
  for (const d of m.days) {
    const c = right.addStack(); c.layoutVertically(); c.size = new Size(40, 0); c.backgroundColor = CELL;
    c.cornerRadius = 10; c.setPadding(6, 2, 6, 2); c.spacing = 4; c.centerAlignContent();
    text(c, d.label, F.h(11), INK, { scale: 0.6, center: true });
    starsText(c, d.stars, 9);
    text(c, d.hb == null ? "–" : `${m1(d.hb)} m`, F.h(12), INK, { scale: 0.6, center: true });
    text(c, d.tp == null ? "" : `${d.tp} s`, F.r(10), INK2, { scale: 0.6, center: true });
    text(c, d.cr, F.s(10), INK2, { scale: 0.6, center: true });
  }
}
function large(w, data, spot, m, now) {
  const top = w.addStack(); top.centerAlignContent(); text(top, String(spot.name).split(" / ")[0].replace(/\s*\(.*\)$/, ""), F.h(15), INK, { scale: 0.7 }); top.addSpacer(); text(top, "maintenant", F.b(9), INK3);
  w.addSpacer(4); nowBlock(w, m, true);
  // heure par heure, heures passées retirées ; largeur des colonnes selon leur nombre (sinon iOS coupe les chiffres)
  for (const d of m.detail) {
    const cols = d.hours.filter((x) => x.has);
    if (!cols.length) continue;
    const cw = Math.max(15, Math.min(40, Math.floor((UTILE - 26 - 3 * (cols.length - 1)) / cols.length)));   // 26 = marge du bloc + centrage
    const fh = Math.min(11, Math.round(cw * 0.6)), fv = Math.min(12, Math.round(cw * 0.55));
    const fn = Math.min(12, Math.round(cw * 0.58)), fa = Math.min(13, Math.round(cw * 0.58));
    w.addSpacer(7);
    const hd = w.addStack(); hd.centerAlignContent(); hd.spacing = 4;
    text(hd, d.label, F.h(13), INK, { scale: 0.7 }); text(hd, d.date, F.r(11), INK3, { scale: 0.6 });
    if (d.stars) text(hd, "★".repeat(d.stars), F.b(11), STAR[d.stars]);
    hd.addSpacer();
    const tps = [...new Set(cols.map((x) => x.tp).filter((x) => x != null))].sort((a, b) => a - b);
    const per = tps.length ? ` · ${tps[0]}${tps.length > 1 ? `–${tps[tps.length - 1]}` : ""} s` : "";
    if (d.hbMax) text(hd, `jusqu'à ${m1(d.hbMax)} m${per}`, F.b(11), INK, { scale: 0.6 });
    w.addSpacer(3);
    // même règle que la carte Vent : écarts explicites (3 pt), grille centrée, contenu des colonnes centré par
    // centerAlignContent() — aucun espace souple ne vient prendre la place des chiffres (12/11).
    const wrap = w.addStack(); wrap.addSpacer();
    const box = wrap.addStack(); box.backgroundColor = CELL; box.cornerRadius = 10; box.setPadding(5, 5, 5, 5); box.spacing = 3;
    const hMax = Math.max(1.2, ...cols.map((x) => x.hb ?? 0));
    cols.forEach((x) => {
      const c = box.addStack(); c.layoutVertically(); c.size = new Size(cw, 0); c.spacing = 1; c.centerAlignContent();
      text(c, x.h, F.s(fh), INK3, { scale: 0.5, center: true });
      text(c, m1(x.hb), F.b(fv), INK, { scale: 0.5, center: true });
      const bar = c.addStack(); bar.layoutVertically(); bar.size = new Size(Math.min(cw - 4, 24), 13); bar.addSpacer();
      const fill = bar.addStack(); fill.size = new Size(Math.min(cw - 4, 24), Math.max(2, Math.round(((x.hb ?? 0) / hMax) * 13))); fill.backgroundColor = WAVE; fill.cornerRadius = 2;
      cellNum(c, x.ws, Math.min(cw - 2, 32), fn + 4, fn);
      if (cw >= 22) addArrow(c, x.wd, fa, INK2);   // colonnes étroites : la flèche serait illisible
      const sb = c.addStack(); sb.size = new Size(cw - 3, 5); sb.cornerRadius = 2; sb.backgroundColor = x.stars > 0 ? STAR[x.stars] : NONE;
    });
    wrap.addSpacer();
  }
  w.addSpacer();
  const b = bestSession(data, now);
  if (b) {
    const box = w.addStack(); box.layoutVertically(); box.backgroundColor = CELL; box.cornerRadius = 10; box.setPadding(6, 8, 6, 8); box.url = link(b.spot, b.s);
    text(box, "MEILLEUR CRÉNEAU SURF", F.b(9), INK3);
    const l = box.addStack(); l.spacing = 4; if (b.stars) text(l, "★".repeat(b.stars), F.b(12), STAR[b.stars]);
    text(l, `${b.spot.short} · ${when(b, now)} · ${m1(b.hb)} m · ${b.tp ?? "–"} s`, F.b(12), INK, { scale: 0.6 });
  }
}
function lock(w, family, spot, m) {
  const n = m.now, h = n ? `${m1(n.lo)}–${m1(n.hi)} m` : "–";
  if (family === "accessoryInline") { text(w, `${spot.short} ${h}${n && n.tp ? ` · ${n.tp} s` : ""}`, F.s(12), Color.white()); return; }
  if (family === "accessoryCircular") {
    const s = w.addStack(); s.layoutVertically(); s.centerAlignContent();
    const a = s.addStack(); a.addSpacer(); text(a, n ? m1(n.hb) : "–", F.h(18), Color.white()); a.addSpacer();
    const b = s.addStack(); b.addSpacer(); text(b, n && n.tp ? `${n.tp} s` : "m", F.b(10), Color.white()); b.addSpacer();
    return;
  }
  text(w, `${spot.short} · ${h}`, F.h(13), Color.white(), { scale: 0.7 });
  text(w, n ? `${n.tp ?? "–"} s · ${WIND_KIND[n.wk] || compass(n.wd)} ${n.ws ?? "–"} nd` : "", F.r(12), Color.white(), { scale: 0.7 });
  const d = m.days[0];
  text(w, d ? `${"★".repeat(d.stars) || "pas d'étoile"} ${d.cr !== "—" ? d.cr : ""}` : "", F.r(12), Color.white());
}

// ------------------------------------------------------------------ réglages dans l'app
async function setup(data) {
  const a = new Alert(); a.title = "OCEAN · widget Vague";
  a.message = `Spot par défaut : ${Keychain.contains(K_SPOT) ? Keychain.get(K_SPOT) : DEFAULT_SPOT}`;
  a.addAction("Choisir le spot"); a.addAction("Aperçu du widget"); a.addCancelAction("Fermer");
  const r = await a.presentSheet();
  if (r === 0) {
    const b = new Alert(); b.title = "Spot du widget"; data.spots.forEach((s) => b.addAction(s.name)); b.addCancelAction("Annuler");
    const k = await b.presentSheet(); if (k >= 0) Keychain.set(K_SPOT, data.spots[k].id);
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
  const { data } = loaded, spot = findSpot(data, spotQuery());
  const m = model(data, spot, now);
  w.url = link(spot, null);
  if (lockScreen) lock(w, family, spot, m);
  else if (family === "small") small(w, data, spot, m, now);
  else if (family === "medium") medium(w, data, spot, m, now);
  else large(w, data, spot, m, now);
  if (loaded.cached && !lockScreen) { w.addSpacer(2); text(w, "hors ligne : dernières données", F.r(9), INK3); }
  return w;
}

if (config.runsInWidget) {
  Script.setWidget(await build(config.widgetFamily || "small"));
} else {
  let data = null; try { data = (await loadData()).data; } catch (e) { /* hors ligne */ }
  const r = data ? await setup(data) : 1;
  if (r === 1) { const w = await build("large"); await w.presentLarge(); }
}
Script.complete();
