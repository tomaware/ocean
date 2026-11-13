// OCEAN Vague — widget de bureau pour Mac (Übersicht)
// Le surf sur le spot de ton choix : vagues prévues pour l'heure, 4 jours ; en grand, aujourd'hui et demain
// heure par heure et le meilleur créneau surf. Mêmes données et mêmes étoiles que l'app OCEAN et le widget iPhone.
//
//  • Glisser la carte pour la déplacer ; ⚙ (au survol, coin en haut à droite) pour les réglages.
//  • Clic sur la carte : fiche du spot dans OCEAN.
//  • Tout est retenu (spot, taille, thème, position) d'un lancement à l'autre.
import { run } from "uebersicht";

// ================================================================ RÉGLAGES DE DÉPART
// (seulement au tout premier lancement ; ensuite tout se règle avec ⚙ et reste retenu)
const SPOT = "carnon";               // carnon, palavas, sete, vias, saintes-maries, la-couronne
const TAILLE = "moyen";              // "petit", "moyen" ou "grand"
const THEME = "auto";                // "auto" (comme le Mac), "clair" ou "sombre"
// ================================================================

// ================================================================ CŒUR (copie de widgets/mac/src/core.jsx — ne pas modifier ici)
// OCEAN — cœur commun aux trois widgets Mac (Vent, Créneaux, Vague).
// Recopié tel quel dans chaque widget par `node widgets/mac/build.mjs` (entre « CŒUR » et « FIN DU CŒUR ») ;
// ne modifie que ce fichier, puis relance la commande. Les tests vérifient que les widgets livrés sont à jour.
//
//  1. Données : mêmes règles que l'app, les widgets iPhone et le widget Windows (étoiles, créneaux, balise).
//  2. Cartes : petit, moyen, grand.
//  3. Widget : déplacement à la souris, panneau de réglages, réglages et position retenus (localStorage d'Übersicht),
//     dernières données gardées hors ligne, mise à jour automatique du fichier.

const DATA = "https://tomaware.github.io/ocean/data/widget-wind.json";
const SURF = "https://tomaware.github.io/ocean/data/widget-surf.json";
const APP = "https://tomaware.github.io/ocean/";
const NEAR = ["la-grande-motte", "le-ponant", "port-camargue"];
const LIVE_MAX_MIN = 90;
const SEP = "@@OCEAN@@", NOLINK = "@@NOLINK@@";
const WIDGETS_DIR = "$HOME/Library/Application Support/Übersicht/widgets";

// ------------------------------------------------------------------ commandes
const curl = (u) => `curl -sL --max-time 20 "${u}?t=$(date +%s)"`;
// balise en direct : lien de la super prévision lu dans le trousseau du Mac (jamais dans le fichier)
const LIVE_CMD = `L=$(security find-generic-password -s ocean.superprevision -w 2>/dev/null); if [ -z "$L" ]; then echo "${NOLINK}"; else curl -sL --max-time 20 "$L&action=live" || true; fi`;
// Mise à jour automatique : le widget récupère sa version publiée et remplace son fichier (Übersicht le recharge).
// N'écrit que si le fichier téléchargé est complet (taille + marqueur en dernière ligne) et différent.
const majAuto = (fichier, marqueur) =>
  `( F="${WIDGETS_DIR}/${fichier}"; T="$(mktemp)"; if [ -f "$F" ] && curl -sfL --max-time 20 "${APP}widgets/${fichier}" -o "$T" && [ "$(wc -c < "$T")" -gt 4000 ] && tail -c 120 "$T" | grep -q "${marqueur}" && ! cmp -s "$T" "$F"; then cp "$T" "$F"; fi; rm -f "$T" ) >/dev/null 2>&1 || true`;

// ------------------------------------------------------------------ outils (mêmes règles que les autres widgets)
const DIR16 = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];
const compass = (d) => (d == null ? "" : DIR16[Math.round(d / 22.5) % 16]);
const fromText = (o) => { const k = DIR16.indexOf(String(o || "").toUpperCase().replace("W", "O")); return k < 0 ? null : k * 22.5; };
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-");
const starsOf = (s) => (s == null ? 0 : s >= 8.5 ? 3 : s >= 7 ? 2 : s >= 5 ? 1 : 0);
const DAYS = ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."];
const dayKey = (t) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const dayLabel = (key, now) => (key === dayKey(now) ? "Auj." : DAYS[new Date(key + "T12:00:00").getDay()]);
const ago = (t, now) => { const m = Math.max(0, Math.round((now - t) / 60000)); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`; };
const H = (t) => new Date(t).getHours();
const span = (x) => `${H(x.s)}–${H(x.e)} h`;
const r = (x) => (x == null ? "–" : Math.round(x));
const m1 = (x) => (x == null ? "–" : String(Math.round(x * 10) / 10).replace(".", ","));
const longDay = (t) => new Date(t).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric" });
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const when = (x, now) => `${dayKey(x.s) === dayKey(now) ? "Auj." : dayKey(x.s) === dayKey(now + 86400e3) ? "Demain" : DAYS[new Date(x.s).getDay()]} ${span(x)}`;
const link = (id, t) => `${APP}#/spot/${id}${t ? `?day=${encodeURIComponent(new Date(t).toLocaleDateString("fr-FR"))}` : ""}`;
const findSpot = (spots, q, def) => {
  const n = norm(q);
  return spots.find((s) => s.id === n) || spots.find((s) => norm(s.short) === n || norm(s.name) === n || norm(s.name).includes(n)) || spots.find((s) => s.id === def) || spots[0];
};
const rank = (a, b) => starsOf(b.p) - starsOf(a.p) || b.h - a.h || b.p - a.p || a.s - b.s;
const title = (spot) => String(spot.name).split(" / ")[0].replace(/\s*\(.*\)$/, "");

// ------------------------------------------------------------------ ce qui est affiché
function liveFor(spot, data, live, now) {
  for (const x of Object.values((live && live.spots) || {})) {
    const n = norm(x.nom);
    if (!(n === spot.id || n.startsWith(spot.id + "-") || n.includes(spot.id))) continue;
    if (x.panne) return { panne: true };
    const abo = !!live.connecte;
    if (Number.isFinite(x.t) && now - x.t < LIVE_MAX_MIN * 60000) return { t: x.t, kn: x.v, gust: x.max ?? null, dir: fromText(x.o), dirTxt: x.o, src: "balise", abo };
    if (Number.isFinite(x.t)) return { stale: true, t: x.t, kn: x.v, gust: x.max ?? null, dir: fromText(x.o), dirTxt: x.o, src: "balise", abo };
  }
  const o = data.obs && data.obs[spot.id];
  if (o && now - o.t < LIVE_MAX_MIN * 60000) return { t: o.t, kn: o.kn, gust: o.gust, dir: o.dir, dirTxt: compass(o.dir), src: "Marignane" };
  return null;
}
function ventModel(data, spot, level, live, now) {
  const L = level === "offshore" ? 6 : 5;
  // h[7] = « Kite session » (plus de 28 nd, D-49) : 1 étoile rouge, jamais en créneau
  const rows = spot.hours.map((h) => ({ t: h[0], kn: h[1], gust: h[2], dir: h[3], day: !!h[4], score: h[L], kite: !!h[7] && !!h[4] }));
  const near = (t) => { const x = rows.reduce((b, y) => (Math.abs(y.t - t) < Math.abs((b ? b.t : Infinity) - t) ? y : b), null); return x && Math.abs(x.t - t) <= 3600e3 ? x : null; };
  const cur = near(now), sess = spot.sessions[level] || [];
  const days = data.days.slice(0, 4).map((d) => {
    const rr = rows.filter((x) => dayKey(x.t) === d && x.day);
    const best = rr.filter((x) => !x.kite).reduce((b, x) => ((x.score ?? -1) > (b ? b.score ?? -1 : -1) ? x : b), null);
    const max = rr.reduce((b, x) => ((x.kn ?? -1) > (b ? b.kn ?? -1 : -1) ? x : b), null);
    const ss = sess.filter((x) => dayKey(x.s) === d);
    return { label: dayLabel(d, now), stars: starsOf(best ? best.score : null), kite: rr.some((x) => x.kite), kn: max ? max.kn : null, dir: max ? max.dir : null, cr: ss.length ? span(ss[0]) : "—" };
  });
  const k0 = H(now) >= 21 ? 1 : 0;
  const detail = [k0, k0 + 1].map((k) => {
    const d = dayKey(now + k * 86400e3), rr = rows.filter((x) => dayKey(x.t) === d), hours = [];
    for (let h = 7; h <= 21; h++) { const x = rr.find((y) => H(y.t) === h); hours.push({ h, has: !!x && x.t + 3600e3 > now, kn: x ? x.kn : null, gust: x ? x.gust : null, dir: x ? x.dir : null, stars: x && x.day && !x.kite ? starsOf(x.score) : 0, kite: !!x && x.kite }); }
    const up = hours.filter((x) => x.has), max = up.reduce((b, x) => (x.kn != null && (!b || x.kn > b.kn) ? x : b), null);
    const ss = sess.filter((x) => dayKey(x.s) === d && x.e > now);
    return { label: k === 0 ? "Aujourd'hui" : k === 1 ? "Demain" : "Après-demain", date: longDay(now + k * 86400e3), stars: Math.max(0, ...up.map((x) => x.stars)), kite: up.some((x) => x.kite),
      kn: max ? max.kn : null, dir: max ? max.dir : null, gust: up.reduce((g, x) => (x.gust != null && (g == null || x.gust > g) ? x.gust : g), null),
      cr: ss.length ? ss.map(span).join(" · ") : "pas de créneau", hours };
  });
  const nowV = live && !live.panne && !live.stale ? live : cur ? { t: cur.t, kn: cur.kn, gust: cur.gust, dir: cur.dir, dirTxt: compass(cur.dir), src: "prévu" } : live && live.stale ? live : null;
  return { spot, now: nowV, panne: !!(live && live.panne), stale: live && live.stale ? live.t : null, in2: near(now + 2 * 3600e3), days, detail };
}
// spots suivis : "tous", "proches" (moins de 55 km de Montpellier) ou une liste choisie dans les réglages
function spotsSuivis(data, sel) {
  const ids = sel === "proches" ? NEAR : Array.isArray(sel) && sel.length ? sel : null;
  return ids ? data.spots.filter((s) => ids.includes(s.id)) : data.spots;
}
function creneauxModel(data, level, sel, now) {
  const spots = spotsSuivis(data, sel);
  const list = [];
  for (const sp of spots) for (const s of sp.sessions[level] || []) if (s.e > now) list.push({ ...s, spot: sp, stars: starsOf(s.p) });
  list.sort(rank);
  // la nuit (plus aucune heure de jour à venir aujourd'hui) : la ligne du jour, vide, est retirée
  const dayLeft = data.spots.some((sp) => sp.hours.some((h) => h[4] && dayKey(h[0]) === dayKey(now) && h[0] + 3600e3 > now));
  const off = data.days[0] === dayKey(now) && !dayLeft ? 1 : 0, days = data.days.slice(off, 5);
  const grid = spots.slice(0, 8).map((sp) => ({ spot: sp, cells: days.map((d, i) => {
    const x = (sp.daily[level] || [])[i + off], ses = (sp.sessions[level] || []).filter((s) => dayKey(s.s) === d);
    const kns = sp.hours.filter((h) => h[4] && dayKey(h[0]) === d && h[1] != null).map((h) => h[1]);
    const kn = kns.length ? Math.max(...kns) : null;
    // pas de créneau wing mais des heures à plus de 28 nd : « Kite » en rouge (D-49)
    if (!ses.length || !x) return { has: false, kn, kite: x ? x[4] || 0 : 0, n: x, day: d };
    const top = x[2] ? 3 : x[1] ? 2 : 1;
    return { has: true, kite: x[4] || 0, n: x, label: `${x[top - 1] || ses.reduce((a, s) => a + s.h, 0)}h`, kn, day: d };
  }) }));
  const quoi = sel === "proches" ? " · proches" : Array.isArray(sel) && sel.length ? ` · ${spots.length} spot${spots.length > 1 ? "s" : ""}` : "";
  return { level, label: `${level === "offshore" ? "OffShore" : "Sécu first"}${quoi}`, list, grid, days };
}
const WIND_KIND = { offshore: "vent de terre", "side-off": "side-off", side: "vent de côté", "side-on": "side-on", onshore: "vent de mer", "pétole": "pas de vent" };
function vagueModel(surf, spot, now) {
  const rows = spot.hours.map((h) => ({ t: h[0], hb: h[1], lo: h[2], hi: h[3], tp: h[4], sd: h[5], ws: h[6], wd: h[7], wk: h[8], day: !!h[9], score: h[10] }));
  const cur = rows.reduce((b, x) => (Math.abs(x.t - now) < Math.abs((b ? b.t : Infinity) - now) ? x : b), null);
  const days = surf.days.slice(0, 4).map((d) => {
    const rr = rows.filter((x) => dayKey(x.t) === d && x.day), best = rr.reduce((b, x) => ((x.score ?? -1) > (b ? b.score ?? -1 : -1) ? x : b), null);
    const ss = spot.sessions.filter((x) => dayKey(x.s) === d);
    return { label: dayLabel(d, now), stars: starsOf(best ? best.score : null), hb: best ? best.hb : null, tp: best ? best.tp : null, cr: ss.length ? span(ss[0]) : "—" };
  });
  const k0 = H(now) >= 21 ? 1 : 0;
  const detail = [k0, k0 + 1].map((k) => {
    const d = dayKey(now + k * 86400e3), rr = rows.filter((x) => dayKey(x.t) === d), hours = [];
    for (let h = 7; h <= 21; h++) { const x = rr.find((y) => H(y.t) === h); hours.push({ h, has: !!x && x.t + 3600e3 > now, hb: x ? x.hb : null, tp: x ? x.tp : null, ws: x ? x.ws : null, wd: x ? x.wd : null, stars: x && x.day ? starsOf(x.score) : 0 }); }
    const up = hours.filter((x) => x.has), ss = spot.sessions.filter((x) => dayKey(x.s) === d && x.e > now);
    return { label: k === 0 ? "Aujourd'hui" : k === 1 ? "Demain" : "Après-demain", date: longDay(now + k * 86400e3), stars: Math.max(0, ...up.map((x) => x.stars)),
      hbMax: Math.max(0, ...up.map((x) => x.hb ?? 0)), cr: ss.length ? ss.map(span).join(" · ") : "pas de créneau", hours };
  });
  const all = [];
  for (const sp of surf.spots) for (const x of sp.sessions) if (x.e > now) all.push({ ...x, spot: sp, stars: starsOf(x.p) });
  all.sort(rank);
  return { spot, now: cur && Math.abs(cur.t - now) <= 3600e3 ? cur : null, days, detail, best: all[0] || null };
}

// ------------------------------------------------------------------ état du widget : réglages, position, données
const load = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage plein ou interdit */ } };
// réglages : ceux retenus par le Mac, sinon ceux de départ (écrits tout de suite, pour survivre à une mise à jour du fichier)
function prefsOf(key, defauts) {
  const p = load(key + ".reglages");
  if (p && typeof p === "object") return { ...defauts, ...p };
  save(key + ".reglages", defauts);
  return { ...defauts };
}
function reducer(key, defauts) {
  return (event, prev) => {
    const s = { ...prev, prefs: prev.prefs || prefsOf(key, defauts) };
    switch (event.type) {
      case "UB/COMMAND_RAN": case "DATA": return { ...s, output: event.output };
      case "SETTINGS": return { ...s, settings: event.open };
      case "PREFS": save(key + ".reglages", event.prefs); return { ...s, prefs: event.prefs };
      case "POS": return { ...s, pos: { x: event.x, y: event.y } };
      case "END_MOVE": { const p = { ...s.prefs, ...(s.pos || {}) }; save(key + ".reglages", p); return { ...s, prefs: p, pos: null }; }
      default: return s;
    }
  };
}
const jsonOf = (s) => { try { const x = JSON.parse(String(s || "").trim()); return x && typeof x === "object" ? x : null; } catch (e) { return null; } };
// dernières données gardées si hors ligne
function withCache(key, fresh) {
  if (fresh && fresh.spots) { save(key + ".donnees", fresh); return { data: fresh, cached: false }; }
  const old = load(key + ".donnees");
  return old && old.spots ? { data: old, cached: true } : { data: null, cached: false };
}

// ------------------------------------------------------------------ souris : un glisser déplace, un clic ouvre OCEAN
let moved = false;   // le clic qui suit un déplacement n'ouvre rien
const stop = (f) => (e) => { if (e && e.stopPropagation) e.stopPropagation(); f(e); };
const open = (url) => (e) => { if (e && e.stopPropagation) e.stopPropagation(); if (moved) { moved = false; return; } run(`open "${url}"`); };
function startMove(e, dispatch, x, y) {
  if (e.button !== 0 || (e.target && e.target.closest && e.target.closest("[data-btn]"))) return;
  e.preventDefault();
  moved = false;
  const x0 = e.clientX, y0 = e.clientY;
  const mm = (ev) => {
    if (!moved && Math.abs(ev.clientX - x0) + Math.abs(ev.clientY - y0) < 4) return;   // un clic qui tremble n'est pas un déplacement
    moved = true;
    dispatch({ type: "POS", x: Math.max(0, x + ev.clientX - x0), y: Math.max(0, y + ev.clientY - y0) });
  };
  const mu = () => { window.removeEventListener("mousemove", mm); window.removeEventListener("mouseup", mu); if (moved) dispatch({ type: "END_MOVE" }); };
  window.addEventListener("mousemove", mm); window.addEventListener("mouseup", mu);
}
const ecranL = () => (typeof window !== "undefined" && window.innerWidth ? window.innerWidth : 1440);
const LARGEUR = { petit: 170, moyen: 364, grand: 364 };
// position : celle retenue, sinon en haut à droite de l'écran, chaque widget à sa hauteur
function placeOf(state, prefs, yDefaut) {
  const w = LARGEUR[prefs.taille] || 364;
  const x = state.pos ? state.pos.x : prefs.x != null ? prefs.x : Math.max(0, ecranL() - w - 24);
  const y = state.pos ? state.pos.y : prefs.y != null ? prefs.y : yDefaut;
  return { x, y, w, side: x + w / 2 > ecranL() / 2 ? "gauche" : "droite" };
}
const themeOf = (p) => (p.theme === "clair" ? "light" : p.theme === "sombre" ? "dark" : "auto");

// ------------------------------------------------------------------ dessin
const SCALE = [[5, "#FFFFFF", "#3E5157"], [8, "#DDF3FA", "#152B33"], [11, "#A9E3EE", "#152B33"], [14, "#7FDDB0", "#0F3322"], [17, "#B5EA62", "#21360A"],
  [20, "#F2EC4E", "#383300"], [23, "#FFC94D", "#3A2700"], [26, "#FFA04A", "#3A1A00"], [30, "#F66A4B", "#FFFFFF"], [999, "#D9386E", "#FFFFFF"]];
const wc = (kn) => SCALE.find((s) => (kn ?? 0) < s[0]);
const FILL = ["", "#23A26A", "#EE7F1B", "#8A4FD8"], KITE = "#D6343C";
// remplissage d'une case : heures 3★, 2★, 1★ puis « Kite session » en rouge ; n = [1★, 2★, 3★, jour, kite]
const fillOf = (n) => { const t = Math.max(1, n[3]), a = (n[2] / t) * 100, b = a + (n[1] / t) * 100, c = b + (n[0] / t) * 100, e = c + ((n[4] || 0) / t) * 100;
  return `linear-gradient(to right, ${FILL[3]} 0 ${a}%, ${FILL[2]} 0 ${b}%, ${FILL[1]} 0 ${c}%, ${KITE} 0 ${e}%, transparent 0)`; };
const Num = ({ kn, w = 36, h = 20, size = 13 }) => { const c = wc(kn); return <span className="num" style={{ width: w, height: h, fontSize: size, background: c[1], color: c[2] }}>{r(kn)}</span>; };
const Arrow = ({ from, size = 13 }) => (from == null ? <span style={{ width: size, height: size, display: "inline-block" }} /> :
  <svg width={size} height={size} viewBox="-10 -10 20 20" style={{ transform: `rotate(${(from + 180) % 360}deg)` }}><path d="M0,-9 L6,7 L0,3.5 L-6,7 Z" fill="currentColor" /></svg>);
const Stars = ({ k, size = 11, all = true, kite = false }) => (!k && kite
  ? <span className="stars kite" style={{ fontSize: size }}><span className="k">★</span><span className="kt">{size >= 16 ? " Kite session" : " Kite"}</span></span> :
  <span className="stars" style={{ fontSize: size }}>{k > 0 && <span className={`k${k}`}>{"★".repeat(k)}</span>}{all && k < 3 && <span className="off">{"★".repeat(3 - k)}</span>}</span>);
const Card = ({ size, url, children }) => <div className={`card ${size}`} onClick={open(url)}>{children}</div>;
const srcText = (m, now, short) => {
  if (m.panne) return "balise en panne";
  if (!m.now) return "pas de vent";
  if (m.now.src === "balise") { const k = m.now.abo ? "abonné" : "public"; return short ? `● ${k} · ${ago(m.now.t, now)}` : `● Winds-Up ${k} · ${ago(m.now.t, now)}`; }
  if (m.now.src === "Marignane") return short ? `● ${ago(m.now.t, now)}` : `● Marignane · ${ago(m.now.t, now)}`;
  if (m.stale != null) return short ? `prévision (balise ${ago(m.stale, now)})` : `prévision · balise il y a ${ago(m.stale, now)}`;
  return short ? "prévision" : m.spot && m.spot.source === "corrected" ? "prévision corrigée" : "prévision";
};
// chiffre du vent mesuré en direct : vert dès 15 nd, orange dès 20, violet dès 25
const nowColor = (m) => (!m.now || m.now.src === "prévu" || m.now.stale || m.now.kn == null ? undefined : m.now.kn >= 25 ? "var(--k3)" : m.now.kn >= 20 ? "var(--k2)" : m.now.kn >= 15 ? "var(--k1)" : undefined);
const Big = ({ m, size }) => (
  <div className="big"><span style={{ fontSize: size, color: nowColor(m) }}>{m.now ? r(m.now.kn) : "–"}</span>
    <span className="bigside">{m.now && <Arrow from={m.now.dir} size={Math.round(size / 2.2)} />}<b>nd {m.now ? m.now.dirTxt || compass(m.now.dir) : ""}</b></span></div>);
const gustText = (m) => (m.now && m.now.gust != null ? `${m.now.src === "balise" ? "max" : "rafales"} ${r(m.now.gust)} nd` : "");

// heures passées retirées ; colonnes réparties sur toute la largeur de la carte
function HourGrid({ hours, rows }) {
  const cols = hours.filter((x) => x.has);
  if (!cols.length) return null;
  return <div className="hgrid">{cols.map((x) => (
    <div key={x.h} className="hcol"><span className="hh">{x.h}</span>{rows(x)}<span className="sb" style={{ background: x.kite ? KITE : x.stars > 0 ? FILL[x.stars] : undefined }} /></div>))}</div>;
}
function VentCard({ m, size, now }) {
  const live = m.now && m.now.src !== "prévu" && !m.now.stale;
  if (size === "petit") return <Card size={size} url={link(m.spot.id)}>
    <div className="row"><b className="t14">{m.spot.short}</b><span className={`src${live ? " live" : ""}`}>{srcText(m, now, true)}</span></div>
    <Big m={m} size={44} /><div className="ink2">{gustText(m) || " "}</div>
    <div className="row"><span className="ink2 sb12">Dans 2 h {m.in2 ? r(m.in2.kn) : "–"}</span><Stars k={m.days[0] ? m.days[0].stars : 0} size={12} kite={!!m.days[0] && m.days[0].kite} /></div></Card>;
  if (size === "moyen") return <Card size={size} url={link(m.spot.id)}><div className="hrow">
    <div className="left"><b className="t14">{m.spot.short}</b><span className={`src${live ? " live" : ""}`}>{srcText(m, now, true)}</span><Big m={m} size={38} />
      <span className="ink2 s11">{m.now && m.now.gust != null ? `raf. ${r(m.now.gust)} · ` : ""}2 h : {m.in2 ? r(m.in2.kn) : "–"}</span></div>
    {m.days.map((d) => <div key={d.label} className="dcol"><b>{d.label}</b><Stars k={d.stars} size={10} kite={d.kite} /><Num kn={d.kn} /><Arrow from={d.dir} /><span className="s10">{d.cr}</span></div>)}
  </div></Card>;
  return <Card size={size} url={link(m.spot.id)}>
    <div className="row"><b className="t15">{title(m.spot)}</b><span className={`src${live ? " live" : ""}`}>{srcText(m, now)}</span></div>
    <div className="row"><Big m={m} size={34} /><span className="ink2 sb12 right">{gustText(m)}<br />{m.in2 ? `dans 2 h : ${r(m.in2.kn)} nd ${compass(m.in2.dir)}` : ""}</span></div>
    {m.detail.map((d) => <div key={d.label}>
      <div className="row dh"><span><b className="t13">{d.label}</b> <span className="ink3 s11">{d.date}</span> {(d.stars > 0 || d.kite) && <Stars k={d.stars} all={false} kite={d.kite} />}</span>
        {d.kn != null && <span className="s11"><b>max {r(d.kn)} nd {compass(d.dir)}</b><span className="ink2">{d.gust != null ? ` · raf. ${r(d.gust)}` : ""}</span></span>}</div>
      <HourGrid hours={d.hours} rows={(x) => <span className="frag"><Num kn={x.kn} w={19} h={19} size={12} /><span className="ink2 s10">{r(x.gust)}</span><Arrow from={x.dir} size={12} /></span>} /></div>)}</Card>;
}
function CreneauxCard({ cm, size, now }) {
  const c = cm.list[0];
  if (!c && size !== "grand") return <Card size={size} url={`${APP}#/wind/prevision`}><b className="t14">Créneaux vent</b><div className="ink2 sb13 mid">Pas de créneau dans les 5 jours</div><span className="ink3 s10">{cm.label}</span></Card>;
  if (size === "petit") return <Card size={size} url={link(c.spot.id, c.s)}>
    <span className="eyebrow">MEILLEUR CRÉNEAU</span><Stars k={c.stars} size={18} all={false} />
    <div className="mid"><b className="t18">{c.spot.short}</b><div className="ink2 sb13">{when(c, now)}</div></div><b className="s12">{r(c.kn)} nd {compass(c.dir)}{c.g ? ` · raf. ${c.g}` : ""}</b></Card>;
  if (size === "moyen") return <Card size={size} url={`${APP}#/wind/prevision`}><div className="hrow">
    <div className={`best soft${c.stars}`} onClick={open(link(c.spot.id, c.s))}><Stars k={c.stars} size={16} all={false} /><div><b className="t15">{c.spot.short}</b><div className="ink2 sb12">{when(c, now)}</div></div><b className="s12">{r(c.kn)} nd {compass(c.dir)}</b></div>
    <div className="list">{cm.list.slice(1, 4).map((x) => <div key={x.spot.id + x.s} className="item" onClick={open(link(x.spot.id, x.s))}>
      <div className="namestars"><b className="t13">{x.spot.short}</b><Stars k={x.stars} all={false} /></div><div className="row s11"><span className="ink2">{when(x, now)}</span><b>{r(x.kn)} nd {compass(x.dir)}</b></div></div>)}
      {cm.list.length < 2 && <span className="ink3 s11">Pas d'autre créneau en vue</span>}<span className="ink3 s9">{cm.label}</span></div>
  </div></Card>;
  const HEAD = { "La Franqui": "Franqui", Espiguette: "Espig.", Almanarre: "Alman." };
  return <Card size={size} url={`${APP}#/wind/prevision`}>
    {c ? <div className={`bestbig soft${c.stars}`} onClick={open(link(c.spot.id, c.s))}>
      <div className="row"><span className="eyebrow">MEILLEUR CRÉNEAU</span><span className="pill" style={{ background: FILL[c.stars] || "#888" }}>{c.h}h</span></div>
      <b className="t19">{cap(longDay(c.s))} · {H(c.s)} h – {H(c.e)} h</b>
      <div><span className="sb13">{c.spot.name}</span> <Stars k={c.stars} size={13} all={false} /></div><b className="ink2 s12">{r(c.kn)} nd {compass(c.dir)}{c.g ? ` · raf. ${r(c.g)}` : ""}</b></div>
      : <div className="ink2 sb13 mid">Pas de créneau dans les 5 jours</div>}
    <table className="cgrid"><thead><tr><th />{cm.grid.map((g) => <th key={g.spot.id}>{HEAD[g.spot.short] || g.spot.short}</th>)}</tr></thead>
      <tbody>{cm.days.map((d, i) => <tr key={d}><th>{d === dayKey(now) ? "Auj." : cap(new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" }).replace(".", ""))}</th>
        {cm.grid.map((g) => { const x = g.cells[i]; return <td key={g.spot.id}>{x.has
          ? <span className="fill" onClick={open(link(g.spot.id, new Date(d + "T12:00:00").getTime()))} style={{ background: fillOf(x.n) }}><i>{x.label}</i></span>
          : x.kite ? <span className="fill" onClick={open(link(g.spot.id, new Date(d + "T12:00:00").getTime()))} style={{ background: fillOf(x.n) }}><i className="kitepill">★ Kite</i></span>
          : <span className="kn">{x.kn != null ? r(x.kn) : ""}</span>}</td>; })}</tr>)}</tbody></table>
    <span className="ink3 s9 legend">{cm.label}</span></Card>;
}
function VagueNow({ m, size }) {
  const n = m.now;
  return <div className="vnow"><div className="vh"><b style={{ fontSize: size }}>{n ? `${m1(n.lo)}–${m1(n.hi)}` : "–"}</b><b className="ink2 t13"> m</b></div>
    <div className="ink2 sb12">{n ? `${n.tp ?? "–"} s · houle ${compass(n.sd)}` : " "}</div>
    {n && n.ws != null && <div className="wline"><Num kn={n.ws} w={24} h={16} size={10} /><Arrow from={n.wd} size={11} /><span className="ink2 sb11">{WIND_KIND[n.wk] || compass(n.wd)}</span></div>}</div>;
}
// « prévi » et pas « maintenant » : ce sont des prévisions (Tom, 13/11, comme sur l'iPhone)
function VagueCard({ m, size, now }) {
  const url = link(m.spot.id), d0 = m.days[0];
  if (size === "petit") return <Card size={size} url={url}><div className="row"><b className="t14">{m.spot.short}</b><span className="src">prévi</span></div>
    <VagueNow m={m} size={26} /><div className="row"><span className="ink2 sb11">{d0 && d0.cr !== "—" ? d0.cr : "pas de créneau"}</span><Stars k={d0 ? d0.stars : 0} size={12} /></div></Card>;
  if (size === "moyen") return <Card size={size} url={url}><div className="hrow">
    <div className="left"><b className="t14">{m.spot.short}</b><span className="src">prévi</span><VagueNow m={m} size={22} /></div>
    {m.days.map((d) => <div key={d.label} className="dcol"><b>{d.label}</b><Stars k={d.stars} size={9} /><b className="t12">{d.hb == null ? "–" : `${m1(d.hb)} m`}</b><span className="ink2 s10">{d.tp ? `${d.tp} s` : ""}</span><span className="s10">{d.cr}</span></div>)}
  </div></Card>;
  return <Card size={size} url={url}>
    <div className="row"><b className="t15">{title(m.spot)}</b><span className="src">prévi</span></div><VagueNow m={m} size={30} />
    {m.detail.map((d) => { const hMax = Math.max(1.2, ...d.hours.filter((x) => x.has).map((x) => x.hb ?? 0)); return <div key={d.label}>
      <div className="row dh"><span><b className="t13">{d.label}</b> <span className="ink3 s11">{d.date}</span> {d.stars > 0 && <Stars k={d.stars} all={false} />}</span>{d.hbMax > 0 && <b className="s11">jusqu'à {m1(d.hbMax)} m{(() => { const t = [...new Set(d.hours.filter((x) => x.has && x.tp != null).map((x) => x.tp))].sort((a, b) => a - b); return t.length ? ` · ${t[0]}${t.length > 1 ? `–${t[t.length - 1]}` : ""} s` : ""; })()}</b>}</div>
      <HourGrid hours={d.hours} rows={(x) => <span className="frag"><b className="s8">{m1(x.hb)}</b><span className="wbar"><i style={{ height: Math.max(2, Math.round(((x.hb ?? 0) / hMax) * 13)) }} /></span>
        <Num kn={x.ws} w={18} h={15} size={10} /><Arrow from={x.wd} size={10} /></span>} /></div>; })}
    {m.best && <div className="bestline" onClick={open(link(m.best.spot.id, m.best.s))}><span className="eyebrow">MEILLEUR CRÉNEAU SURF</span>
      <div><Stars k={m.best.stars} size={12} all={false} /> <b className="s12">{m.best.spot.short} · {when(m.best, now)} · {m1(m.best.hb)} m · {m.best.tp ?? "–"} s</b></div></div>}</Card>;
}
const Empty = ({ nom }) => <div className="card petit"><b className="t14">OCEAN · {nom}</b><div className="ink2 s12 mid">Pas de données pour le moment (hors ligne ?). Nouvel essai dans quelques minutes.</div></div>;

// ------------------------------------------------------------------ panneau de réglages (⚙ en haut à droite de la carte)
const Seg = ({ value, options, onPick }) => (
  <div className="seg">{options.map(([v, l]) => <span key={v} data-btn="1" className={v === value ? "on" : ""} onClick={stop(() => onPick(v))}>{l}</span>)}</div>);
const Chips = ({ items, isOn, onPick }) => (
  <div className="chips">{items.map(([v, l]) => <span key={v} data-btn="1" className={isOn(v) ? "on" : ""} onClick={stop(() => onPick(v))}>{l}</span>)}</div>);
const TAILLES = [["petit", "Petit"], ["moyen", "Moyen"], ["grand", "Grand"]];
const THEMES = [["auto", "Auto"], ["clair", "Clair"], ["sombre", "Sombre"]];   // « Auto » : clair ou sombre comme le Mac
const MODES = [["secu", "Sécu first"], ["offshore", "OffShore"]];
function Panel({ titre, side, dispatch, refresh, children }) {
  return <div data-btn="1" className={`card settings ${side}`} onClick={(e) => e.stopPropagation()}>
    <div className="row"><b className="t14">{titre}</b><span data-btn="1" className="x" title="Fermer" onClick={stop(() => dispatch({ type: "SETTINGS", open: false }))}>✕</span></div>
    {children}
    <div className="sep" />
    <div className="row"><span className="ink3 s10">Glisse la carte pour la déplacer. Tout est retenu.</span><span data-btn="1" className="pillbtn" onClick={stop(refresh)}>Actualiser</span></div>
  </div>;
}
// la carte, son bouton ⚙ (au survol), l'avis hors ligne et le panneau de réglages
function Shell({ state, dispatch, prefs, place, card, panel, cached }) {
  return <div className={`ocean ${themeOf(prefs)}`} style={{ left: place.x, top: place.y }} onMouseDown={(e) => startMove(e, dispatch, place.x, place.y)}>
    <style>{STYLE}</style>
    <div className="wrap">
      {card}
      <span data-btn="1" className="gearbtn" title="Réglages" onClick={stop(() => dispatch({ type: "SETTINGS", open: !state.settings }))}>⚙</span>
      {cached ? <div className="offline">hors ligne · dernières données</div> : null}
      {state.settings ? panel : null}
    </div>
  </div>;
}

// ------------------------------------------------------------------ styles (couleurs OCEAN ; tout est préfixé .ocean :
// les widgets Übersicht partagent la même page, un style non préfixé déteindrait sur les autres widgets)
const LIGHT = "--bg:#FFFFFF;--cell:#F2F3F0;--ink:#152B33;--ink2:#3E5157;--ink3:#5C6E74;--live:#17804F;--off:#D6DCD6;--line:#E4E8E4;--none:#E6E9E5;--k1:#23A26A;--k2:#EE7F1B;--k3:#8A4FD8;--kite:#D6343C;--s1:#E3F4EC;--s2:#FDEBDC;--s3:#F3ECFC;--wave:#2F8FB0;--acc:#256D70;--accink:#FFFFFF;--shadow:rgba(0,0,0,.22);";
const DARK = "--bg:#16262C;--cell:#1E3138;--ink:#EAF1EF;--ink2:#B7C8C6;--ink3:#8EA4A3;--live:#4CC38A;--off:#33494F;--line:#25393F;--none:#25393F;--k1:#4CC38A;--k2:#F5A04A;--k3:#B38BF5;--kite:#FF6B6B;--s1:#1D3A30;--s2:#3A2A1A;--s3:#2E2440;--wave:#5BB8D6;--acc:#75CDC5;--accink:#0D191E;--shadow:rgba(0,0,0,.45);";
const STYLE = `
.ocean{position:absolute;${LIGHT}font-family:-apple-system,"SF Pro Text","Helvetica Neue",sans-serif;color:var(--ink);font-variant-numeric:tabular-nums;-webkit-font-smoothing:antialiased;user-select:none;-webkit-user-select:none;cursor:default}
@media (prefers-color-scheme: dark){.ocean.auto{${DARK}}}
.ocean.dark{${DARK}}
.ocean .wrap{position:relative}
.ocean .card{box-sizing:border-box;background:var(--bg);border:1px solid var(--line);border-radius:22px;padding:14px 14px 12px;box-shadow:0 6px 22px var(--shadow);cursor:pointer;display:flex;flex-direction:column;justify-content:space-between;gap:4px}
.ocean .card.petit{width:170px;min-height:170px}.ocean .card.moyen{width:364px;min-height:170px}.ocean .card.grand{width:364px;justify-content:flex-start}
/* moyen : les colonnes occupent toute la hauteur de la carte, pas de vide en bas (Tom, 13/11) */
.ocean .card.moyen>.hrow{flex:1;align-items:stretch}
.ocean .gearbtn{position:absolute;top:-9px;right:-9px;width:24px;height:24px;border-radius:12px;background:var(--bg);border:1px solid var(--line);box-shadow:0 2px 8px var(--shadow);display:flex;align-items:center;justify-content:center;font-size:13px;color:var(--ink2);cursor:pointer;opacity:0;transition:opacity .15s}
.ocean .wrap:hover .gearbtn{opacity:1}
.ocean .offline{position:absolute;left:14px;bottom:-18px;font-size:10px;color:rgba(255,255,255,.85);text-shadow:0 1px 2px rgba(0,0,0,.6)}
.ocean .settings{position:absolute;top:0;width:280px;cursor:default;justify-content:flex-start;gap:6px}
.ocean .settings.gauche{right:calc(100% + 12px)}.ocean .settings.droite{left:calc(100% + 12px)}
.ocean .settings .x{cursor:pointer;color:var(--ink3);font-size:13px;padding:2px 4px}
.ocean .lab{font-size:11px;font-weight:700;color:var(--ink3);margin-top:6px}
.ocean .seg{display:flex;background:var(--cell);border-radius:9px;padding:2px;gap:2px}
.ocean .seg span{flex:1;text-align:center;font-size:11px;font-weight:600;padding:5px 4px;border-radius:7px;cursor:pointer;color:var(--ink2)}
.ocean .seg span.on{background:var(--bg);color:var(--ink);box-shadow:0 1px 3px var(--shadow)}
.ocean .chips{display:flex;flex-wrap:wrap;gap:4px}
.ocean .chips span{font-size:11px;font-weight:600;padding:4px 8px;border-radius:12px;background:var(--cell);color:var(--ink2);cursor:pointer}
.ocean .chips span.on{background:var(--acc);color:var(--accink)}
.ocean .sep{height:1px;background:var(--line);margin:6px 0 2px}
.ocean .pillbtn{font-size:11px;font-weight:700;padding:4px 10px;border-radius:12px;background:var(--cell);color:var(--ink);cursor:pointer;white-space:nowrap}
.ocean .linkbtn{font-size:11px;font-weight:600;color:var(--acc);cursor:pointer}
.ocean .row{display:flex;justify-content:space-between;align-items:center;gap:6px}.ocean .hrow{display:flex;gap:4px;height:100%}
.ocean .namestars{display:flex;align-items:center;gap:6px}
.ocean .left{width:112px;margin-right:8px;display:flex;flex-direction:column;justify-content:space-between}
.ocean .t12{font-size:12px;font-weight:800}.ocean .t13{font-size:13px;font-weight:800}.ocean .t14{font-size:14px;font-weight:800}.ocean .t15{font-size:15px;font-weight:800}.ocean .t18{font-size:18px;font-weight:800}.ocean .t19{font-size:19px;font-weight:800}
.ocean .s8{font-size:8px}.ocean .s9{font-size:9px}.ocean .s10{font-size:10px}.ocean .s11{font-size:11px}.ocean .s12{font-size:12px}.ocean .sb11{font-size:11px;font-weight:600}.ocean .sb12{font-size:12px;font-weight:600}.ocean .sb13{font-size:13px;font-weight:600}
.ocean .ink2{color:var(--ink2)}.ocean .ink3{color:var(--ink3)}.ocean .right{text-align:right}
.ocean .src{font-size:10px;font-weight:700;color:var(--ink3);white-space:nowrap}.ocean .src.live{color:var(--live)}
.ocean .eyebrow{font-size:10px;font-weight:700;letter-spacing:.08em;color:var(--ink3)}
.ocean .big{display:flex;align-items:center;gap:6px}.ocean .big>span:first-child{font-weight:900;line-height:1}
.ocean .bigside{display:flex;flex-direction:column;gap:2px;font-size:11px}
.ocean .num{display:inline-flex;align-items:center;justify-content:center;border-radius:5px;font-weight:900}
.ocean .stars{font-weight:700;letter-spacing:1px;white-space:nowrap}.ocean .stars .off{color:var(--off)}.ocean .stars .k1{color:var(--k1)}.ocean .stars .k2{color:var(--k2)}.ocean .stars .k3{color:var(--k3)}.ocean .stars.kite .k,.ocean .stars.kite .kt,.ocean .kitepill{color:var(--kite)}.ocean .stars.kite .kt{font-size:.8em;letter-spacing:0}
.ocean .dcol{width:50px;background:var(--cell);border-radius:10px;padding:6px 2px;display:flex;flex-direction:column;align-items:center;justify-content:space-evenly;gap:4px;font-size:11px}
.ocean .dh{margin:8px 0 3px}
.ocean .hgrid{display:flex;gap:2px;background:var(--cell);border-radius:10px;padding:5px}
.ocean .frag{display:contents}
.ocean .hcol{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:1px}
.ocean .hcol .num,.ocean .hcol .wbar{width:100%;max-width:32px}
.ocean .hh{font-size:9px;font-weight:600;color:var(--ink3)}.ocean .sb{width:100%;max-width:32px;height:5px;border-radius:2px;background:var(--none);margin-top:auto}
.ocean .legend{margin-top:auto;padding-top:6px}
.ocean .mid{margin:auto 0}
.ocean .best{width:120px;flex:none;border-radius:14px;padding:10px;display:flex;flex-direction:column;justify-content:center;gap:6px;margin-right:8px}
.ocean .soft0{background:var(--cell)}.ocean .soft1{background:var(--s1)}.ocean .soft2{background:var(--s2)}.ocean .soft3{background:var(--s3)}
.ocean .list{flex:1;display:flex;flex-direction:column;justify-content:center;gap:6px}
.ocean .bestbig{border-radius:14px;padding:9px 12px 10px;margin:8px 0 10px;display:flex;flex-direction:column;gap:2px}
.ocean .pill{color:#fff;font-size:11px;font-weight:900;border-radius:8px;padding:1px 7px}
.ocean .cgrid{border-collapse:separate;border-spacing:3px;margin:0 -3px;width:calc(100% + 6px);table-layout:fixed}
.ocean .cgrid th{font-size:9px;font-weight:700;color:var(--ink3);text-align:center;white-space:nowrap;overflow:hidden}.ocean .cgrid thead th:first-child,.ocean .cgrid tbody th{width:44px}.ocean .cgrid tbody th{font-size:11px;font-weight:900;color:var(--ink);text-align:left}
.ocean .cgrid td{background:var(--cell);border-radius:6px;height:28px;padding:0;text-align:center;overflow:hidden}
.ocean .cgrid .fill{display:flex;align-items:center;justify-content:center;height:100%}.ocean .cgrid .fill i{font-style:normal;font-size:10px;font-weight:900;background:var(--bg);border-radius:7px;padding:1px 4px}
.ocean .cgrid .kn{font-size:10px;font-weight:600;color:var(--ink3)}
.ocean .vnow{display:flex;flex-direction:column;gap:2px}.ocean .vh{white-space:nowrap}.ocean .vnow b:first-child{font-weight:900}.ocean .wline{display:flex;align-items:center;gap:4px;margin-top:2px}
.ocean .wbar{height:13px;display:flex;align-items:flex-end}.ocean .wbar i{display:block;width:100%;background:var(--wave);border-radius:2px}
.ocean .bestline{background:var(--cell);border-radius:10px;padding:6px 8px;margin-top:8px}
`;
// ================================================================ FIN DU CŒUR

const FICHIER = "ocean-vague.jsx", MARQUEUR = "OCEAN_MAC_VAGUE_FIN", KEY = "ocean.mac.vague";
const DEFAUTS = { spot: SPOT, taille: TAILLE, theme: THEME, x: null, y: null };

export const refreshFrequency = 15 * 60 * 1000;   // les prévisions changent toutes les heures
export const command = [curl(SURF), majAuto(FICHIER, MARQUEUR)].join("; ");
export const className = "top: 0; left: 0;";
export const initialState = { output: undefined, prefs: null, settings: false, pos: null };
export const updateState = reducer(KEY, DEFAUTS);

const refresh = (dispatch) => () => run(command).then((output) => dispatch({ type: "DATA", output })).catch(() => {});

export function parse(output) {
  const { data, cached } = withCache(KEY, jsonOf(output));
  return { surf: data, cached };
}

export function view(state, dispatch = () => {}, now = Date.now()) {
  const prefs = state.prefs || prefsOf(KEY, DEFAUTS);
  const { surf, cached } = parse(state.output);
  const place = placeOf(state, prefs, 420);
  const set = (p) => dispatch({ type: "PREFS", prefs: { ...prefs, ...p } });
  if (!surf) return <Shell state={state} dispatch={dispatch} prefs={prefs} place={place} card={<Empty nom="Vague" />} panel={null} />;
  const sp = findSpot(surf.spots, prefs.spot, "carnon");
  const panel = <Panel titre="Vague" side={place.side} dispatch={dispatch} refresh={refresh(dispatch)}>
    <div className="lab">Spot</div><Chips items={surf.spots.map((s) => [s.id, s.short])} isOn={(v) => v === sp.id} onPick={(v) => set({ spot: v })} />
    <div className="lab">Taille</div><Seg value={prefs.taille} options={TAILLES} onPick={(v) => set({ taille: v })} />
    <div className="lab">Thème</div><Seg value={prefs.theme} options={THEMES} onPick={(v) => set({ theme: v })} />
  </Panel>;
  return <Shell state={state} dispatch={dispatch} prefs={prefs} place={place} cached={cached}
    card={<VagueCard m={vagueModel(surf, sp, now)} size={prefs.taille} now={now} />} panel={panel} />;
}
export const render = (state, dispatch) => view(state, dispatch);
// OCEAN_MAC_VAGUE_FIN
