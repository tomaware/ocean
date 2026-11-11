// OCEAN — widget de bureau pour Mac (Übersicht)
// Mêmes données, mêmes étoiles et mêmes créneaux que l'app OCEAN (https://tomaware.github.io/ocean/),
// que les widgets iPhone et que le widget Windows. Trois cartes : Vent, Créneaux, Vague (surf).
//
// Réglages : modifie les valeurs ci-dessous et enregistre ; Übersicht recharge le widget tout seul.
// (Menu Übersicht dans la barre des menus → « Open Widgets Folder » → ocean.jsx, ou clic sur ⚙ dans le widget.)
// Clic sur une carte : ouvre OCEAN (fiche du spot, au bon jour pour un créneau).
//
// Mode perso (balise Winds-Up en direct) : le lien de ta super prévision est lu dans le trousseau du Mac
// (élément « ocean.superprevision », enregistré par installer.command), jamais dans ce fichier.
import { run } from "uebersicht";

// ================================================================ TES RÉGLAGES
const SPOT = "la-grande-motte";      // spot de la carte Vent : la-franqui, la-grande-motte, le-ponant, port-camargue, beauduc, le-jai, almanarre
const MODE = "secu";                 // "secu" (Sécu first) ou "offshore"
const CARTE_VENT = "moyen";          // "petit", "moyen", "grand" ou "masque"
const CARTE_CRENEAUX = "moyen";      // idem
const CARTE_VAGUE = "masque";        // idem (surf)
const SPOT_VAGUE = "carnon";         // carnon, palavas, sete, vias, saintes-maries, la-couronne
const CRENEAUX_SPOTS = "tous";       // "tous" ou "proches" (< 55 km de Montpellier)
const DISPOSITION = "colonne";       // "colonne" (les cartes l'une sous l'autre) ou "ligne" (côte à côte)
const POSITION = "top: 40px; right: 24px;";
// ================================================================

const DATA = "https://tomaware.github.io/ocean/data/widget-wind.json";
const SURF = "https://tomaware.github.io/ocean/data/widget-surf.json";
const APP = "https://tomaware.github.io/ocean/";
const NEAR = ["la-grande-motte", "le-ponant", "port-camargue"];
const LIVE_MAX_MIN = 90;
const SEP = "@@OCEAN@@";
const SELF = "ocean.jsx";

export const refreshFrequency = 5 * 60 * 1000;   // balise toutes les 5 min ; les prévisions changent toutes les heures
const curl = (u) => `curl -sL --max-time 20 "${u}?t=$(date +%s)"`;
export const command = [
  curl(DATA), `echo "${SEP}"`, CARTE_VAGUE !== "masque" ? curl(SURF) : "true", `echo "${SEP}"`,
  `L=$(security find-generic-password -s ocean.superprevision -w 2>/dev/null) && [ -n "$L" ] && curl -sL --max-time 20 "$L&action=live" || true`,
].join("; ");

export const className = `${POSITION}`;

// ------------------------------------------------------------------ outils (mêmes règles que les autres widgets)
const DIR16 = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];
export const compass = (d) => (d == null ? "" : DIR16[Math.round(d / 22.5) % 16]);
const fromText = (o) => { const k = DIR16.indexOf(String(o || "").toUpperCase().replace("W", "O")); return k < 0 ? null : k * 22.5; };
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-");
export const starsOf = (s) => (s == null ? 0 : s >= 8.5 ? 3 : s >= 7 ? 2 : s >= 5 ? 1 : 0);
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

// ------------------------------------------------------------------ ce qui est affiché
export function liveFor(spot, data, live, now) {
  for (const x of Object.values((live && live.spots) || {})) {
    const n = norm(x.nom);
    if (!(n === spot.id || n.startsWith(spot.id + "-") || n.includes(spot.id))) continue;
    if (x.panne) return { panne: true };
    const abo = !!live.connecte;
    if (Number.isFinite(x.t) && now - x.t < LIVE_MAX_MIN * 60000) return { t: x.t, kn: x.v, gust: x.max ?? null, dir: fromText(x.o), dirTxt: x.o, src: "balise", abo };
    if (Number.isFinite(x.t)) return { stale: true, t: x.t, abo };
  }
  const o = data.obs && data.obs[spot.id];
  if (o && now - o.t < LIVE_MAX_MIN * 60000) return { t: o.t, kn: o.kn, gust: o.gust, dir: o.dir, dirTxt: compass(o.dir), src: "Marignane" };
  return null;
}
export function ventModel(data, spot, level, live, now) {
  const L = level === "offshore" ? 6 : 5;
  const rows = spot.hours.map((h) => ({ t: h[0], kn: h[1], gust: h[2], dir: h[3], day: !!h[4], score: h[L] }));
  const near = (t) => { const x = rows.reduce((b, y) => (Math.abs(y.t - t) < Math.abs((b ? b.t : Infinity) - t) ? y : b), null); return x && Math.abs(x.t - t) <= 3600e3 ? x : null; };
  const cur = near(now), sess = spot.sessions[level] || [];
  const days = data.days.slice(0, 4).map((d) => {
    const rr = rows.filter((x) => dayKey(x.t) === d && x.day);
    const best = rr.reduce((b, x) => ((x.score ?? -1) > (b ? b.score ?? -1 : -1) ? x : b), null);
    const max = rr.reduce((b, x) => ((x.kn ?? -1) > (b ? b.kn ?? -1 : -1) ? x : b), null);
    const ss = sess.filter((x) => dayKey(x.s) === d);
    return { label: dayLabel(d, now), stars: starsOf(best ? best.score : null), kn: max ? max.kn : null, dir: max ? max.dir : null, cr: ss.length ? span(ss[0]) : "—" };
  });
  const k0 = H(now) >= 21 ? 1 : 0;
  const detail = [k0, k0 + 1].map((k) => {
    const d = dayKey(now + k * 86400e3), rr = rows.filter((x) => dayKey(x.t) === d), hours = [];
    for (let h = 7; h <= 21; h++) { const x = rr.find((y) => H(y.t) === h); hours.push({ h, has: !!x && x.t + 3600e3 > now, kn: x ? x.kn : null, gust: x ? x.gust : null, dir: x ? x.dir : null, stars: x && x.day ? starsOf(x.score) : 0 }); }
    const up = hours.filter((x) => x.has), max = up.reduce((b, x) => (x.kn != null && (!b || x.kn > b.kn) ? x : b), null);
    const ss = sess.filter((x) => dayKey(x.s) === d && x.e > now);
    return { label: k === 0 ? "Aujourd'hui" : k === 1 ? "Demain" : "Après-demain", date: longDay(now + k * 86400e3), stars: Math.max(0, ...up.map((x) => x.stars)),
      kn: max ? max.kn : null, dir: max ? max.dir : null, gust: up.reduce((g, x) => (x.gust != null && (g == null || x.gust > g) ? x.gust : g), null),
      cr: ss.length ? ss.map(span).join(" · ") : "pas de créneau", hours };
  });
  const nowV = live && !live.panne && !live.stale ? live : cur ? { t: cur.t, kn: cur.kn, gust: cur.gust, dir: cur.dir, dirTxt: compass(cur.dir), src: "prévu" } : null;
  return { spot, now: nowV, panne: !!(live && live.panne), stale: live && live.stale ? live.t : null, in2: near(now + 2 * 3600e3), days, detail };
}
export function creneauxModel(data, level, onlyNear, now) {
  const spots = onlyNear ? data.spots.filter((s) => NEAR.includes(s.id)) : data.spots;
  const list = [];
  for (const sp of spots) for (const s of sp.sessions[level] || []) if (s.e > now) list.push({ ...s, spot: sp, stars: starsOf(s.p) });
  list.sort(rank);
  const grid = spots.slice(0, 8).map((sp) => ({ spot: sp, cells: data.days.slice(0, 5).map((d, i) => {
    const x = (sp.daily[level] || [])[i], ses = (sp.sessions[level] || []).filter((s) => dayKey(s.s) === d);
    const kns = sp.hours.filter((h) => h[4] && dayKey(h[0]) === d && h[1] != null).map((h) => h[1]);
    const kn = kns.length ? Math.max(...kns) : null;
    if (!ses.length || !x) return { has: false, kn };
    const top = x[2] ? 3 : x[1] ? 2 : 1;
    return { has: true, n: x, label: `${x[top - 1] || ses.reduce((a, s) => a + s.h, 0)}h`, kn, day: d };
  }) }));
  return { level, label: `${level === "offshore" ? "OffShore" : "Sécu first"}${onlyNear ? " · proches" : ""}`, list, grid, days: data.days.slice(0, 5) };
}
const WIND_KIND = { offshore: "vent de terre", "side-off": "side-off", side: "vent de côté", "side-on": "side-on", onshore: "vent de mer", "pétole": "pas de vent" };
export function vagueModel(surf, spot, now) {
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

// ------------------------------------------------------------------ dessin
const SCALE = [[5, "#FFFFFF", "#3E5157"], [8, "#DDF3FA", "#152B33"], [11, "#A9E3EE", "#152B33"], [14, "#7FDDB0", "#0F3322"], [17, "#B5EA62", "#21360A"],
  [20, "#F2EC4E", "#383300"], [23, "#FFC94D", "#3A2700"], [26, "#FFA04A", "#3A1A00"], [30, "#F66A4B", "#FFFFFF"], [999, "#D9386E", "#FFFFFF"]];
const wc = (kn) => SCALE.find((s) => (kn ?? 0) < s[0]);
const FILL = ["", "#23A26A", "#EE7F1B", "#8A4FD8"];
const open = (url) => (e) => { e.stopPropagation(); run(`open "${url}"`); };
const Num = ({ kn, w = 36, h = 20, size = 13 }) => { const c = wc(kn); return <span className="num" style={{ width: w, height: h, fontSize: size, background: c[1], color: c[2] }}>{r(kn)}</span>; };
const Arrow = ({ from, size = 13 }) => (from == null ? <span style={{ width: size, height: size, display: "inline-block" }} /> :
  <svg width={size} height={size} viewBox="-10 -10 20 20" style={{ transform: `rotate(${(from + 180) % 360}deg)` }}><path d="M0,-9 L6,7 L0,3.5 L-6,7 Z" fill="currentColor" /></svg>);
const Stars = ({ k, size = 11, all = true }) => (
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
const Big = ({ m, size }) => (
  <div className="big"><span style={{ fontSize: size }}>{m.now ? r(m.now.kn) : "–"}</span>
    <span className="bigside">{m.now && <Arrow from={m.now.dir} size={Math.round(size / 2.2)} />}<b>nd {m.now ? m.now.dirTxt || compass(m.now.dir) : ""}</b></span></div>);
const gustText = (m) => (m.now && m.now.gust != null ? `${m.now.src === "balise" ? "max" : "rafales"} ${r(m.now.gust)} nd` : "");

function HourGrid({ hours, rows }) {
  return <div className="hgrid">{hours.map((x) => (
    <div key={x.h} className={`hcol${x.has ? "" : " dim"}`}><span className="hh">{x.h}</span>{rows(x)}<span className="sb" style={{ background: x.stars > 0 && x.has ? FILL[x.stars] : undefined }} /></div>))}</div>;
}
function VentCard({ m, size, now }) {
  const live = m.now && m.now.src !== "prévu";
  if (size === "petit") return <Card size={size} url={link(m.spot.id)}>
    <div className="row"><b className="t14">{m.spot.short}</b><span className={`src${live ? " live" : ""}`}>{srcText(m, now, true)}</span></div>
    <Big m={m} size={44} /><div className="ink2">{gustText(m) || " "}</div>
    <div className="row"><span className="ink2 sb12">Dans 2 h {m.in2 ? r(m.in2.kn) : "–"}</span><Stars k={m.days[0] ? m.days[0].stars : 0} size={12} /></div></Card>;
  if (size === "moyen") return <Card size={size} url={link(m.spot.id)}><div className="hrow">
    <div className="left"><b className="t14">{m.spot.short}</b><span className={`src${live ? " live" : ""}`}>{srcText(m, now, true)}</span><Big m={m} size={38} />
      <span className="ink2 s11">{m.now && m.now.gust != null ? `raf. ${r(m.now.gust)} · ` : ""}2 h : {m.in2 ? r(m.in2.kn) : "–"}</span></div>
    {m.days.map((d) => <div key={d.label} className="dcol"><b>{d.label}</b><Stars k={d.stars} size={10} /><Num kn={d.kn} /><Arrow from={d.dir} /><span className="s10">{d.cr}</span></div>)}
  </div></Card>;
  return <Card size={size} url={link(m.spot.id)}>
    <div className="row"><b className="t15">{m.spot.name}</b><span className={`src${live ? " live" : ""}`}>{srcText(m, now)}</span></div>
    <div className="row"><Big m={m} size={34} /><span className="ink2 sb12 right">{gustText(m)}<br />{m.in2 ? `dans 2 h : ${r(m.in2.kn)} nd ${compass(m.in2.dir)}` : ""}</span></div>
    {m.detail.map((d) => <div key={d.label}>
      <div className="row dh"><span><b className="t13">{d.label}</b> <span className="ink3 s11">{d.date}</span> {d.stars > 0 && <Stars k={d.stars} all={false} />}</span>
        {d.kn != null && <span className="s11"><b>max {r(d.kn)} nd {compass(d.dir)}</b><span className="ink2">{d.gust != null ? ` · raf. ${r(d.gust)}` : ""}</span></span>}</div>
      <HourGrid hours={d.hours} rows={(x) => x.has && <span className="frag"><Num kn={x.kn} w={19} h={18} size={11} /><span className="ink2 s9">{r(x.gust)}</span><Arrow from={x.dir} size={11} /></span>} />
      <div className="ink2 sb11 cr">Créneau : {d.cr}</div></div>)}</Card>;
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
      <div className="row"><b className="t13">{x.spot.short}</b><Stars k={x.stars} all={false} /></div><div className="row s11"><span className="ink2">{when(x, now)}</span><b>{r(x.kn)} nd {compass(x.dir)}</b></div></div>)}
      {cm.list.length < 2 && <span className="ink3 s11">Pas d'autre créneau en vue</span>}<span className="ink3 s9 bottom">{cm.label}</span></div>
  </div></Card>;
  const HEAD = { "La Franqui": "Franqui", Espiguette: "Espig.", Almanarre: "Alman." };
  return <Card size={size} url={`${APP}#/wind/prevision`}>
    <div className="row"><b className="t15">Créneaux vent</b><span className="ink3 s10">{cm.label}</span></div>
    {c ? <div className={`bestbig soft${c.stars}`} onClick={open(link(c.spot.id, c.s))}>
      <div className="row"><span className="eyebrow">MEILLEUR CRÉNEAU</span><span className="pill" style={{ background: FILL[c.stars] || "#888" }}>{c.h}h</span></div>
      <b className="t19">{cap(longDay(c.s))} · {H(c.s)} h – {H(c.e)} h</b>
      <div><span className="sb13">{c.spot.name}</span> <Stars k={c.stars} size={13} all={false} /></div><b className="ink2 s12">{r(c.kn)} nd {compass(c.dir)}{c.g ? ` · raf. ${r(c.g)}` : ""}</b></div>
      : <div className="ink2 sb13 mid">Pas de créneau dans les 5 jours</div>}
    <table className="cgrid"><thead><tr><th />{cm.grid.map((g) => <th key={g.spot.id}>{HEAD[g.spot.short] || g.spot.short}</th>)}</tr></thead>
      <tbody>{cm.days.map((d, i) => <tr key={d}><th>{i === 0 ? "Auj." : cap(new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" }).replace(".", ""))}</th>
        {cm.grid.map((g) => { const x = g.cells[i]; return <td key={g.spot.id}>{x.has
          ? <span className="fill" onClick={open(link(g.spot.id, new Date(d + "T12:00:00").getTime()))} style={{ background: `linear-gradient(to right, ${FILL[3]} 0 ${(x.n[2] / x.n[3]) * 100}%, ${FILL[2]} 0 ${((x.n[2] + x.n[1]) / x.n[3]) * 100}%, ${FILL[1]} 0 ${((x.n[2] + x.n[1] + x.n[0]) / x.n[3]) * 100}%, transparent 0)` }}><i>{x.label}</i></span>
          : <span className="kn">{x.kn != null ? r(x.kn) : ""}</span>}</td>; })}</tr>)}</tbody></table></Card>;
}
function VagueNow({ m, size }) {
  const n = m.now;
  return <div className="vnow"><div><b style={{ fontSize: size }}>{n ? `${m1(n.lo)}–${m1(n.hi)}` : "–"}</b><b className="ink2 t13"> m</b></div>
    <div className="ink2 sb12">{n ? `${n.tp ?? "–"} s · houle ${compass(n.sd)}` : " "}</div>
    {n && n.ws != null && <div className="wline"><Num kn={n.ws} w={24} h={16} size={10} /><Arrow from={n.wd} size={11} /><span className="ink2 sb11">{WIND_KIND[n.wk] || compass(n.wd)}</span></div>}</div>;
}
function VagueCard({ m, size, now }) {
  const url = link(m.spot.id), d0 = m.days[0];
  if (size === "petit") return <Card size={size} url={url}><div className="row"><b className="t14">{m.spot.short}</b><span className="src">maintenant</span></div>
    <VagueNow m={m} size={26} /><div className="row"><span className="ink2 sb11">{d0 && d0.cr !== "—" ? d0.cr : "pas de créneau"}</span><Stars k={d0 ? d0.stars : 0} size={12} /></div></Card>;
  if (size === "moyen") return <Card size={size} url={url}><div className="hrow">
    <div className="left"><b className="t14">{m.spot.short}</b><span className="src">maintenant</span><VagueNow m={m} size={24} /></div>
    {m.days.map((d) => <div key={d.label} className="dcol"><b>{d.label}</b><Stars k={d.stars} size={9} /><b className="t12">{d.hb == null ? "–" : `${m1(d.hb)} m`}</b><span className="ink2 s10">{d.tp ? `${d.tp} s` : ""}</span><span className="s10">{d.cr}</span></div>)}
  </div></Card>;
  return <Card size={size} url={url}>
    <div className="row"><b className="t15">{m.spot.name}</b><span className="src">maintenant</span></div><VagueNow m={m} size={30} />
    {m.detail.map((d) => { const hMax = Math.max(1.2, ...d.hours.filter((x) => x.has).map((x) => x.hb ?? 0)); return <div key={d.label}>
      <div className="row dh"><span><b className="t13">{d.label}</b> <span className="ink3 s11">{d.date}</span> {d.stars > 0 && <Stars k={d.stars} all={false} />}</span>{d.hbMax > 0 && <b className="s11">jusqu'à {m1(d.hbMax)} m</b>}</div>
      <HourGrid hours={d.hours} rows={(x) => x.has && <span className="frag"><b className="s8">{m1(x.hb)}</b><span className="wbar"><i style={{ height: Math.max(2, Math.round(((x.hb ?? 0) / hMax) * 22)) }} /></span>
        <span className="ink2 s8">{x.tp ?? ""}</span><Num kn={x.ws} w={18} h={14} size={9} /><Arrow from={x.wd} size={9} /></span>} />
      <div className="ink2 sb11 cr">Créneau : {d.cr}</div></div>; })}
    {m.best && <div className="bestline" onClick={open(link(m.best.spot.id, m.best.s))}><span className="eyebrow">MEILLEUR CRÉNEAU SURF</span>
      <div><Stars k={m.best.stars} size={12} all={false} /> <b className="s12">{m.best.spot.short} · {when(m.best, now)} · {m1(m.best.hb)} m · {m.best.tp ?? "–"} s</b></div></div>}</Card>;
}

// ------------------------------------------------------------------ données (dernières gardées si hors ligne)
const CACHE = "ocean-widget-mac";
export function parse(output) {
  const [a, b, c] = String(output || "").split(SEP);
  const j = (s) => { try { const x = JSON.parse(String(s || "").trim()); return x && typeof x === "object" ? x : null; } catch (e) { return null; } };
  const wind = j(a), surf = j(b), live = j(c);
  let cached = false, saved = null;
  try { saved = JSON.parse(localStorage.getItem(CACHE) || "null"); } catch (e) { saved = null; }
  const out = { wind: wind && wind.spots ? wind : null, surf: surf && surf.spots ? surf : null, live };
  if (!out.wind && saved && saved.wind) { out.wind = saved.wind; cached = true; }
  if (!out.surf && saved && saved.surf) out.surf = saved.surf;
  try { if (wind && wind.spots) localStorage.setItem(CACHE, JSON.stringify({ wind: out.wind, surf: out.surf })); } catch (e) { /* stockage plein ou interdit */ }
  return { ...out, cached };
}

export function view(output, now = Date.now()) {
  const { wind, surf, live, cached } = parse(output);
  if (!wind) return <div className="ocean"><style>{STYLE}</style><div className="card petit"><b className="t14">OCEAN</b><div className="ink2 s12 mid">Pas de données pour le moment (hors ligne ?). Nouvel essai dans quelques minutes.</div></div></div>;
  const level = MODE === "offshore" ? "offshore" : "secu";
  const cards = [];
  if (CARTE_VENT !== "masque") { const sp = findSpot(wind.spots, SPOT, "la-grande-motte"); cards.push(<VentCard key="v" m={ventModel(wind, sp, level, liveFor(sp, wind, live, now), now)} size={CARTE_VENT} now={now} />); }
  if (CARTE_CRENEAUX !== "masque") cards.push(<CreneauxCard key="c" cm={creneauxModel(wind, level, CRENEAUX_SPOTS === "proches", now)} size={CARTE_CRENEAUX} now={now} />);
  if (CARTE_VAGUE !== "masque" && surf) cards.push(<VagueCard key="s" m={vagueModel(surf, findSpot(surf.spots, SPOT_VAGUE, "carnon"), now)} size={CARTE_VAGUE} now={now} />);
  return <div className={`ocean ${DISPOSITION === "ligne" ? "ligne" : ""}`}><style>{STYLE}</style>{cards}
    <div className="foot">{cached ? "hors ligne : dernières données · " : ""}<span className="gear" onClick={(e) => { e.stopPropagation(); run(`open -e "$HOME/Library/Application Support/Übersicht/widgets/${SELF}"`); }}>⚙ réglages</span></div></div>;
}
export const render = ({ output }) => view(output);

const STYLE = `
.ocean { --bg:#FFFFFF; --cell:#F2F3F0; --ink:#152B33; --ink2:#3E5157; --ink3:#5C6E74; --live:#17804F; --off:#D6DCD6; --line:#E4E8E4; --none:#E6E9E5;
  --k1:#23A26A; --k2:#EE7F1B; --k3:#8A4FD8; --s1:#E3F4EC; --s2:#FDEBDC; --s3:#F3ECFC; --wave:#2F8FB0;
  display:flex; flex-direction:column; gap:12px; align-items:flex-end; font-family:-apple-system,"SF Pro Text","Helvetica Neue",sans-serif; color:var(--ink);
  font-variant-numeric: tabular-nums; -webkit-font-smoothing: antialiased; }
@media (prefers-color-scheme: dark) { .ocean { --bg:#16262C; --cell:#1E3138; --ink:#EAF1EF; --ink2:#B7C8C6; --ink3:#8EA4A3; --live:#4CC38A; --off:#33494F; --line:#25393F; --none:#25393F;
  --k1:#4CC38A; --k2:#F5A04A; --k3:#B38BF5; --s1:#1D3A30; --s2:#3A2A1A; --s3:#2E2440; --wave:#5BB8D6; } }
.ocean.ligne { flex-direction:row; align-items:flex-start; }
.card { box-sizing:border-box; background:var(--bg); border:1px solid var(--line); border-radius:22px; padding:14px 14px 12px; box-shadow:0 6px 22px rgba(0,0,0,.22); cursor:pointer;
  display:flex; flex-direction:column; justify-content:space-between; gap:4px; }
.card.petit { width:170px; min-height:170px; } .card.moyen { width:364px; min-height:170px; } .card.grand { width:364px; min-height:330px; justify-content:flex-start; }
.row { display:flex; justify-content:space-between; align-items:center; gap:6px; } .hrow { display:flex; gap:4px; height:100%; }
.left { width:112px; margin-right:8px; display:flex; flex-direction:column; justify-content:space-between; }
.t12{font-size:12px;font-weight:800} .t13{font-size:13px;font-weight:800} .t14{font-size:14px;font-weight:800} .t15{font-size:15px;font-weight:800} .t18{font-size:18px;font-weight:800} .t19{font-size:19px;font-weight:800}
.s8{font-size:8px} .s9{font-size:9px} .s10{font-size:10px} .s11{font-size:11px} .s12{font-size:12px} .sb11{font-size:11px;font-weight:600} .sb12{font-size:12px;font-weight:600} .sb13{font-size:13px;font-weight:600}
.ink2{color:var(--ink2)} .ink3{color:var(--ink3)} .right{text-align:right}
.src { font-size:10px; font-weight:700; color:var(--ink3); white-space:nowrap; } .src.live { color:var(--live); }
.eyebrow { font-size:10px; font-weight:700; letter-spacing:.08em; color:var(--ink3); }
.big { display:flex; align-items:center; gap:6px; } .big > span:first-child { font-weight:900; line-height:1; }
.bigside { display:flex; flex-direction:column; gap:2px; font-size:11px; }
.num { display:inline-flex; align-items:center; justify-content:center; border-radius:5px; font-weight:900; }
.stars { font-weight:700; letter-spacing:1px; white-space:nowrap; } .stars .off{color:var(--off)} .stars .k1{color:var(--k1)} .stars .k2{color:var(--k2)} .stars .k3{color:var(--k3)}
.dcol { width:50px; background:var(--cell); border-radius:10px; padding:6px 2px; display:flex; flex-direction:column; align-items:center; gap:4px; font-size:11px; }
.dh { margin:8px 0 3px; }
.hgrid { display:flex; gap:1px; background:var(--cell); border-radius:10px; padding:4px 3px; }
.frag { display:contents; }
.hcol { width:21px; display:flex; flex-direction:column; align-items:center; gap:1px; } .hcol.dim { opacity:.35; }
.hh { font-size:9px; font-weight:600; color:var(--ink3); } .sb { width:19px; height:4px; border-radius:2px; background:var(--none); margin-top:auto; }
.cr { margin:3px 0 0 2px; }
.legend { font-size:9px; color:var(--ink3); margin-top:auto; padding-top:6px; }
.mid { margin:auto 0; }
.best { width:120px; flex:none; border-radius:14px; padding:10px; display:flex; flex-direction:column; justify-content:space-between; margin-right:8px; }
.soft0{background:var(--cell)} .soft1{background:var(--s1)} .soft2{background:var(--s2)} .soft3{background:var(--s3)}
.list { flex:1; display:flex; flex-direction:column; gap:6px; } .bottom { margin-top:auto; }
.bestbig { border-radius:14px; padding:9px 12px 10px; margin:8px 0 10px; display:flex; flex-direction:column; gap:2px; }
.pill { color:#fff; font-size:11px; font-weight:900; border-radius:8px; padding:1px 7px; }
.cgrid { border-collapse:separate; border-spacing:3px; margin:0 -3px; width:calc(100% + 6px); table-layout:fixed; }
.cgrid th { font-size:9px; font-weight:700; color:var(--ink3); text-align:center; white-space:nowrap; overflow:hidden; } .cgrid thead th:first-child, .cgrid tbody th { width:44px; } .cgrid tbody th { font-size:11px; font-weight:900; color:var(--ink); text-align:left; }
.cgrid td { background:var(--cell); border-radius:6px; height:28px; padding:0; text-align:center; overflow:hidden; }
.cgrid .fill { display:flex; align-items:center; justify-content:center; height:100%; } .cgrid .fill i { font-style:normal; font-size:10px; font-weight:900; background:var(--bg); border-radius:7px; padding:1px 4px; }
.cgrid .kn { font-size:10px; font-weight:600; color:var(--ink3); }
.vnow { display:flex; flex-direction:column; gap:2px; } .vnow b:first-child { font-weight:900; } .wline { display:flex; align-items:center; gap:4px; margin-top:2px; }
.wbar { width:16px; height:22px; display:flex; align-items:flex-end; } .wbar i { display:block; width:100%; background:var(--wave); border-radius:2px; }
.bestline { background:var(--cell); border-radius:10px; padding:6px 8px; margin-top:8px; }
.foot { font-size:10px; color:rgba(255,255,255,.75); text-shadow:0 1px 2px rgba(0,0,0,.5); } .gear { cursor:pointer; }
`;
