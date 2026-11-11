// Agenda — widget de bureau pour Mac (Übersicht), même charte que le widget OCEAN
// Tes événements Google Agenda (perso, BO, collègues…) lus par ton script Google « agenda-google.gs ».
// Le lien du script est rangé dans le trousseau du Mac (élément « ocean.agenda »), jamais dans ce fichier.
//
//  • Glisser l'en-tête pour déplacer, tirer le coin en bas à droite pour redimensionner (double-clic : taille par défaut).
//  • ‹ › : semaine précédente / suivante ; clic sur un jour : la liste commence ce jour-là ; « Aujourd'hui » pour revenir.
//  • Clic sur un événement : son détail ; ⚙ : calendriers affichés, ordre, calendrier par défaut, période, format.
//  • + : nouvel événement dans Google Agenda (jour choisi, calendrier par défaut).
// Tout est retenu (position, taille, réglages) d'un lancement à l'autre.
import { run } from "uebersicht";

//@@CORE@@

const PREFS_KEY = "ocean.agenda.prefs", CACHE_KEY = "ocean.agenda.cache";
const WIDTH = { compact: 300, standard: 380, etendu: 520 };
const MAX_BODY = { compact: 300, standard: 520, etendu: 640 };
const NOLINK = "@@NOLINK@@", OFFLINE = "@@OFFLINE@@";

export const refreshFrequency = 5 * 60 * 1000;
// Du lundi de la semaine dernière à 5 semaines plus tard (pour naviguer de semaine en semaine sans attendre)
export const command = `L=$(security find-generic-password -s ocean.agenda -w 2>/dev/null); if [ -z "$L" ]; then echo "${NOLINK}"; else D=$(date +%u); F=$(( 1 - D - 7 )); case "$L" in *\\?*) S="&";; *) S="?";; esac; curl -sL --max-time 40 "$L\${S}from=$F&days=35&t=$(date +%s)" || echo "${OFFLINE}"; fi`;
export const className = "top: 0; left: 0;";

// ------------------------------------------------------------------ état du widget (Übersicht)
const load = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } };

export const initialState = { output: undefined, prefs: null, view: { sel: null, expanded: false, detail: null }, settings: false, pos: null, size: null };

export function parse(output, now) {
  const cached = load(CACHE_KEY);
  const fromCache = () => { try { return cached && cached.raw ? fromGoogle(JSON.parse(cached.raw), now) : null; } catch (e) { return null; } };
  if (output === undefined) { const src = fromCache(); return { src, status: { link: true, loading: !src } }; }
  const out = String(output || "").trim();
  if (out === NOLINK) return { src: null, status: { link: false } };
  if (!out || out.endsWith(OFFLINE)) { const src = fromCache(); return { src, status: { link: true, offline: !!src, error: src ? null : "Pas de réponse du script Google (hors ligne ?)." } }; }
  if (out.startsWith("<")) { const src = fromCache(); return { src, status: { link: true, offline: !!src, error: "Le script Google a renvoyé une page au lieu des événements : vérifie son déploiement (« Qui a accès : Tout le monde »)." } }; }
  try {
    const src = fromGoogle(JSON.parse(out), now);
    save(CACHE_KEY, { raw: out, t: now });
    return { src, status: { link: true } };
  } catch (e) {
    const src = fromCache();
    return { src, status: { link: true, offline: !!src, error: String(e.message || e) } };
  }
}

export function updateState(event, prev) {
  const s = { ...prev, prefs: prev.prefs || prefsOf(load(PREFS_KEY)) };
  switch (event.type) {
    case "UB/COMMAND_RAN": case "DATA": return { ...s, output: event.output };
    case "NAV": return { ...s, view: { sel: event.sel, expanded: false, detail: null } };
    case "EXPAND": return { ...s, view: { ...s.view, expanded: !s.view.expanded } };
    case "DETAIL": return { ...s, view: { ...s.view, detail: event.key } };
    case "SETTINGS": return { ...s, settings: event.open };
    case "PREFS": save(PREFS_KEY, event.prefs); return { ...s, prefs: event.prefs };
    case "POS": return { ...s, pos: { x: event.x, y: event.y } };
    case "SIZE": return { ...s, size: { w: event.w, h: event.h } };
    case "END_MOVE": { const p = { ...s.prefs, ...(s.pos || {}) }; save(PREFS_KEY, p); return { ...s, prefs: p, pos: null }; }
    case "END_SIZE": {
      const w = s.size ? s.size.w : s.prefs.w, h = s.size ? s.size.h : s.prefs.h;
      const p = { ...s.prefs, w, h, format: w == null ? s.prefs.format : w < 340 ? "compact" : w < 460 ? "standard" : "etendu" };
      save(PREFS_KEY, p); return { ...s, prefs: p, size: null };
    }
    case "RESET_SIZE": { const p = { ...s.prefs, w: null, h: null }; save(PREFS_KEY, p); return { ...s, prefs: p, size: null }; }
    default: return s;
  }
}

// ------------------------------------------------------------------ actions
const sh = (s) => `'${String(s).replace(/'/g, `'\\''`)}'`;
const openUrl = (u) => run(`open ${sh(u)}`);
const refresh = (dispatch) => run(command).then((output) => dispatch({ type: "DATA", output })).catch(() => {});
const setLink = (dispatch) => run(`L=$(osascript -e 'text returned of (display dialog "Lien …/exec?key=… de ton script Google « agenda-google.gs » (gardé dans le trousseau du Mac) :" default answer "" with title "Agenda" buttons {"Annuler", "Enregistrer"} default button 2)' 2>/dev/null) && case "$L" in https://script.google.com/*/exec*) security add-generic-password -U -s ocean.agenda -a agenda -w "$L" && echo ok;; *) echo bad;; esac`)
  .then(() => refresh(dispatch)).catch(() => {});
const stop = (f) => (e) => { if (e && e.stopPropagation) e.stopPropagation(); f(e); };

function startMove(e, dispatch, x, y) {
  if (e.button !== 0 || (e.target && e.target.closest && e.target.closest("[data-btn]"))) return;
  e.preventDefault();
  const dx = e.clientX - x, dy = e.clientY - y;
  const mm = (ev) => dispatch({ type: "POS", x: Math.max(0, ev.clientX - dx), y: Math.max(0, ev.clientY - dy) });
  const mu = () => { window.removeEventListener("mousemove", mm); window.removeEventListener("mouseup", mu); dispatch({ type: "END_MOVE" }); };
  window.addEventListener("mousemove", mm); window.addEventListener("mouseup", mu);
}
function startSize(e, dispatch) {
  e.preventDefault(); e.stopPropagation();
  if (e.detail === 2) { dispatch({ type: "RESET_SIZE" }); return; }
  const r = e.currentTarget.parentElement.getBoundingClientRect(), x0 = e.clientX, y0 = e.clientY;
  const mm = (ev) => dispatch({ type: "SIZE", w: Math.round(Math.min(760, Math.max(270, r.width + ev.clientX - x0))), h: Math.round(Math.min(1200, Math.max(240, r.height + ev.clientY - y0))) });
  const mu = () => { window.removeEventListener("mousemove", mm); window.removeEventListener("mouseup", mu); dispatch({ type: "END_SIZE" }); };
  window.addEventListener("mousemove", mm); window.addEventListener("mouseup", mu);
}

// ------------------------------------------------------------------ icônes (traits fins, couleur du texte)
const P = {
  cal: "M4 6.5h16M8 3v4M16 3v4M5.5 5h13A1.5 1.5 0 0 1 20 6.5v12a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-12A1.5 1.5 0 0 1 5.5 5z",
  plus: "M12 5v14M5 12h14", gear: "M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14.2 3h-4.4l-.4 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2l.4 2.6h4.4l.4-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z",
  left: "M15 5l-7 7 7 7", right: "M9 5l7 7-7 7", down: "M5 9l7 7 7-7", up: "M5 15l7-7 7 7", close: "M6 6l12 12M18 6L6 18",
  people: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20c.6-3.4 3.3-5.5 6.5-5.5s5.9 2.1 6.5 5.5M16 4.3a3.5 3.5 0 0 1 0 6.4M18 14.8c2 .7 3.2 2.5 3.5 5.2",
  video: "M3.5 7h11a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 2 15.5v-7A1.5 1.5 0 0 1 3.5 7zM16 10.5l5-3v9l-5-3",
  pin: "M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  repeat: "M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3M20 13v2a4 4 0 0 1-4 4H4",
  check: "M5 12.5l4.5 4.5L19 7.5", grip: "M5 8h14M5 12h14M5 16h14", clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
  star: "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z", refresh: "M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1", alert: "M12 8v5M12 16.5v.5M10.3 3.9L2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
};
const Icon = ({ n, s = 16, fill = false }) => <svg className="ic" width={s} height={s} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={P[n]} /></svg>;
const KIND_ICON = { absence: "cal", ferie: "cal", call: "video", lieu: "pin", reunion: "people" };
const rgba = (hex, a) => { const h = hexColor(hex).slice(1); return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`; };
const Btn = ({ onClick, cls = "", title, children }) => <div data-btn="1" className={`btn ${cls}`} title={title} onClick={stop(onClick)}>{children}</div>;

// ------------------------------------------------------------------ morceaux
function Header({ m, dispatch, now, link }) {
  return <div className="hd">
    <span className="ink3"><Icon n="cal" s={22} /></span>
    <b className="num">{m.header.num}</b>
    <div className="hdt"><div className="month">{m.header.month}</div><div className="sub">{m.header.sub}</div></div>
    <div className="grow" />
    {!m.week.isCurrent || !m.header.isToday ? <Btn cls="pill" title="Revenir à aujourd'hui" onClick={() => dispatch({ type: "NAV", sel: null })}>Aujourd'hui</Btn> : null}
    <Btn cls="round" title="Réglages" onClick={() => dispatch({ type: "SETTINGS", open: true })}><Icon n="gear" s={17} /></Btn>
    <Btn cls="round" title="Nouvel événement" onClick={() => openUrl(newEventUrl(m, now))}><Icon n="plus" s={18} /></Btn>
  </div>;
}
function Week({ m, dispatch, compact }) {
  const w = m.week;
  return <div className="week">
    <Btn cls={`nav${w.canPrev ? "" : " off"}`} title="Semaine précédente" onClick={() => w.canPrev && dispatch({ type: "NAV", sel: w.prevKey })}><Icon n="left" s={14} /></Btn>
    {w.days.map((d) => <div key={d.key} data-btn="1" className={`d${d.sel ? " sel" : ""}${d.today ? " today" : ""}${d.inRange ? "" : " off"}`} onClick={stop(() => dispatch({ type: "NAV", sel: d.key }))}>
      <span className="dow">{compact ? d.dow.charAt(0) : d.dow}</span>
      <span className="circle">{d.num}</span>
      <span className="dots">{d.colors.map((c) => <i key={c} style={{ background: c }} />)}</span>
    </div>)}
    <Btn cls={`nav${w.canNext ? "" : " off"}`} title="Semaine suivante" onClick={() => w.canNext && dispatch({ type: "NAV", sel: w.nextKey })}><Icon n="right" s={14} /></Btn>
  </div>;
}
function EventCard({ e, fmt, dispatch }) {
  const flags = [];
  if (e.recurring) flags.push(<span key="r" className="flag" title="Récurrent"><Icon n="repeat" s={11} /></span>);
  if (e.ongoing) flags.push(<span key="o" className="flag live">en cours</span>);
  if (e.overlap && fmt !== "compact") flags.push(<span key="p" className="flag">en parallèle</span>);
  if (e.status === "tentative") flags.push(<span key="t" className="flag">à confirmer</span>);
  if (e.modified) flags.push(<span key="m" className="flag">modifié</span>);
  return <div data-btn="1" className={`ev${e.ended ? " ended" : ""}${e.ongoing ? " ongoing" : ""}`} style={{ background: rgba(e.color, e.ongoing ? 0.26 : 0.15), "--hov": rgba(e.color, 0.26) }}
    onClick={stop(() => dispatch({ type: "DETAIL", key: evKey(e) }))}>
    <i className="bar" style={{ background: e.color }} />
    <div className="evm">
      <div className="time">{e.time}{fmt === "etendu" && e.dur ? <span className="dur"> · {e.dur}</span> : null}{flags}</div>
      <div className="title">{e.title}</div>
      {fmt === "etendu" ? <div className="calname">{e.cal}{e.location && e.kind.k !== "lieu" && !/^\s*(https?:|www\.)/i.test(e.location) ? ` · ${e.location.split(/[\n,]/)[0]}` : ""}</div> : null}
    </div>
    {e.kind.k && fmt !== "compact" ? <div className="kind"><Icon n={KIND_ICON[e.kind.k]} s={15} /><span>{e.kind.label}</span></div> : null}
    <span className="chev"><Icon n="right" s={13} /></span>
  </div>;
}
function Detail({ e, dispatch }) {
  const tzLocal = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (x) { return null; } })();
  const line = (icon, text, key) => <div className="dl" key={key}><span className="ink3"><Icon n={icon} s={15} /></span><span>{text}</span></div>;
  return <div className="detail">
    <Btn cls="back" onClick={() => dispatch({ type: "DETAIL", key: null })}><Icon n="left" s={13} /> Retour</Btn>
    <div className="dtitle"><i className="bar" style={{ background: e.color }} /><b>{e.title}</b></div>
    {line("clock", `${cap(weekdayName(e.s))} ${new Date(e.s).getDate()} ${monthName(e.s)} · ${e.time}${e.dur ? ` (${e.dur})` : ""}`, "t")}
    {e.tz && tzLocal && e.tz !== tzLocal && !e.allDay ? line("clock", `Créé à l'heure de ${e.tz.split("/").pop().replace(/_/g, " ")} — affiché à l'heure du Mac`, "z") : null}
    <div className="dl"><i className="dot" style={{ background: e.color }} /><span>{e.cal}</span></div>
    {e.location ? line("pin", e.location, "l") : null}
    {e.guests ? line("people", e.guests === 1 ? "1 invité" : `${e.guests} invités`, "g") : null}
    {e.recurring ? line("repeat", "Événement récurrent", "r") : null}
    {e.status === "tentative" ? line("alert", "Pas encore confirmé", "s") : null}
    {e.modified ? line("alert", `Modifié aujourd'hui à ${hm(e.updated)}`, "u") : null}
    {e.notes ? <div className="notes">{e.notes}</div> : null}
    <Btn cls="primary" onClick={() => openUrl(e.url || dayUrl(dayKey(e.s)))}>Ouvrir dans Google Agenda</Btn>
  </div>;
}
function StateView({ m, dispatch }) {
  const [title, msg0] = STATES[m.state] || ["", ""];
  const msg = m.state === "erreur" ? m.error : m.state === "vide" ? (m.period === "jour" ? "Aucun événement ce jour-là." : m.period === "prochains" ? "Aucun événement à venir sur la période reçue." : `Aucun événement sur ${m.period === "3" ? "3" : "7"} jours.`) : msg0;
  const action = { "non-connecte": ["Brancher le lien…", () => setLink(dispatch)], erreur: ["Réessayer", () => refresh(dispatch)],
    "aucun-calendrier": ["Choisir les calendriers", () => dispatch({ type: "SETTINGS", open: true })], "hors-plage": ["Revenir à aujourd'hui", () => dispatch({ type: "NAV", sel: null })] }[m.state];
  if (m.state === "chargement") return <div className="loading"><i /><i /><i /><div className="ink3 small">{title}</div></div>;
  return <div className="state"><span className="ink3"><Icon n={m.state === "erreur" ? "alert" : m.state === "non-connecte" ? "link" : "cal"} s={26} /></span>
    <b>{title}</b>{msg ? <span className="ink3">{msg}</span> : null}{action ? <Btn cls="pill" onClick={action[1]}>{action[0]}</Btn> : null}</div>;
}
function Seg({ value, options, onPick }) {
  return <div className="seg">{options.map(([v, l]) => <div key={v} data-btn="1" className={v === value ? "on" : ""} onClick={stop(() => onPick(v))}>{l}</div>)}</div>;
}
function Settings({ m, prefs, dispatch, status, src }) {
  const set = (p) => dispatch({ type: "PREFS", prefs: p });
  return <div className="card settings">
    <div className="shd"><b>Calendriers</b><Btn cls="round flat" title="Fermer" onClick={() => dispatch({ type: "SETTINGS", open: false })}><Icon n="close" s={16} /></Btn></div>
    <div className="ink3 small">Coche ceux à afficher, glisse ≡ pour l'ordre, ★ pour celui du bouton +. Masquer un calendrier ne le déconnecte pas.</div>
    <div className="cals">
      {m.calendars.length ? m.calendars.map((c, i) => <div key={c.name} className={`cal${c.visible ? "" : " hid"}`} draggable="true"
        onDragStart={(e) => e.dataTransfer.setData("text/plain", c.name)} onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const n = e.dataTransfer.getData("text/plain"); if (n && n !== c.name) set(moveCalendar(prefs, m.calendars, n, i)); }}>
        <div data-btn="1" className={`box${c.visible ? " on" : ""}`} onClick={stop(() => set(toggleCalendar(prefs, c)))}>{c.visible ? <Icon n="check" s={13} /> : null}</div>
        <i className="dot" style={{ background: c.color }} />
        <span className="cname">{c.name}{c.selected ? "" : <em> · masqué dans Google</em>}</span>
        <div data-btn="1" className={`star${c.isDefault ? " on" : ""}`} title="Calendrier par défaut" onClick={stop(() => set({ ...prefs, def: c.isDefault ? null : c.name }))}><Icon n="star" s={14} fill={c.isDefault} /></div>
        <span className="handle" title="Glisser pour réordonner"><Icon n="grip" s={15} /></span>
      </div>) : <div className="ink3 small">Aucun calendrier reçu pour l'instant.</div>}
    </div>
    <div className="sep" />
    <b className="sh2">Affichage</b>
    <div className="lab">Période</div><Seg value={prefs.period} options={PERIODS} onPick={(v) => set({ ...prefs, period: v })} />
    <div className="lab">Format</div><Seg value={prefs.format} options={FORMATS} onPick={(v) => set({ ...prefs, format: v, w: null })} />
    <div className="lab">Événements passés</div><Seg value={prefs.past} options={[["faded", "Estompés"], ["hidden", "Masqués"]]} onPick={(v) => set({ ...prefs, past: v })} />
    <div className="lab">Thème</div><Seg value={prefs.theme} options={[["auto", "Comme le Mac"], ["clair", "Clair"], ["sombre", "Sombre"]]} onPick={(v) => set({ ...prefs, theme: v })} />
    <div className="sep" />
    <div className="sync"><span className="ink3 small">{status.link ? `Google Agenda${src && src.version < 3 ? " (script à mettre à jour)" : ""} · ${m.sync || "pas encore synchronisé"}` : "Google Agenda non connecté"}</span>
      <Btn cls="pill" onClick={() => refresh(dispatch)}><Icon n="refresh" s={13} /> Actualiser</Btn></div>
    <Btn cls="linkbtn" onClick={() => setLink(dispatch)}>{status.link ? "Changer le lien du script…" : "Brancher le lien du script…"}</Btn>
  </div>;
}

// ------------------------------------------------------------------ rendu
export function view(state, dispatch = () => {}, now = Date.now()) {
  const prefs = state.prefs || prefsOf(load(PREFS_KEY));
  const { src, status } = parse(state.output, now);
  const m = buildModel(src, prefs, state.view || {}, status, now);
  const fmt = prefs.format;
  const x = state.pos ? state.pos.x : prefs.x == null ? 24 : prefs.x, y = state.pos ? state.pos.y : prefs.y == null ? 40 : prefs.y;
  const w = state.size ? state.size.w : prefs.w || WIDTH[fmt], h = state.size ? state.size.h : prefs.h;
  const theme = prefs.theme === "clair" ? "light" : prefs.theme === "sombre" ? "dark" : "auto";
  const foot = m.state === "ok" && m.hidden ? <div data-btn="1" className="more" onClick={stop(() => dispatch({ type: "EXPAND" }))}>
    <span className="dots">{m.hiddenColors.map((c) => <i key={c} style={{ background: c }} />)}</span>{m.hidden} autre{m.hidden > 1 ? "s" : ""} événement{m.hidden > 1 ? "s" : ""}<Icon n="down" s={13} /></div>
    : m.state === "ok" && m.expanded ? <div data-btn="1" className="more" onClick={stop(() => dispatch({ type: "EXPAND" }))}>Réduire<Icon n="up" s={13} /></div> : <span />;
  const warn = src && status.error ? status.error : null;
  return <div className={`ag ${theme} f-${fmt}`} style={{ left: x, top: y }}>
    <style>{STYLE}</style>
    <div className="card main" style={{ width: w, height: h || undefined }}>
      <div onMouseDown={(e) => startMove(e, dispatch, x, y)}><Header m={m} dispatch={dispatch} now={now} /></div>
      {m.state !== "non-connecte" ? <Week m={m} dispatch={dispatch} compact={fmt === "compact"} /> : null}
      <div className="sep" />
      <div className="body" style={h ? {} : { maxHeight: MAX_BODY[fmt] }}>
        {m.detail ? <Detail e={m.detail} dispatch={dispatch} />
          : m.state !== "ok" && m.state !== "vide" ? <StateView m={m} dispatch={dispatch} />
          : <div className="list" key={m.selKey + m.period}>
            {m.groups.map((g, i) => <div key={g.key} className="group">
              {i ? <div className="sep" /> : null}
              <div className="gh"><span>{g.title}</span><span className="ink3 small">{g.countText}</span></div>
              {g.items.length ? g.items.map((e) => <EventCard key={evKey(e) + g.key} e={e} fmt={fmt} dispatch={dispatch} />) : <div className="none ink3">Rien de prévu</div>}
            </div>)}
            {m.state === "vide" && m.period !== "jour" ? <StateView m={m} dispatch={dispatch} /> : null}
          </div>}
      </div>
      <div className="foot">{foot}<span className={`sync${status.offline || warn ? " warn" : ""}`} title={warn || ""}>{warn ? `⚠ ${warn.length > 48 ? warn.slice(0, 47) + "…" : warn}` : m.sync}</span></div>
      <div className="grip" title="Redimensionner (double-clic : taille par défaut)" onMouseDown={(e) => startSize(e, dispatch)} />
    </div>
    {state.settings ? <Settings m={m} prefs={prefs} dispatch={dispatch} status={status} src={src} /> : null}
  </div>;
}
export const render = (state, dispatch) => view(state, dispatch);

// ------------------------------------------------------------------ styles (couleurs OCEAN, clair / sombre)
const LIGHT = "--bg:#FFFFFF;--s2:#F2F3F0;--ink:#152B33;--ink2:#3E5157;--ink3:#5C6E74;--line:#E4E8E4;--acc:#256D70;--accink:#FFFFFF;--live:#17804F;--warn:#A3392B;--shadow:rgba(21,43,51,.16);";
const DARK = "--bg:#16262C;--s2:#1E3138;--ink:#EAF1EF;--ink2:#B7C8C6;--ink3:#8EA4A3;--line:#25393F;--acc:#75CDC5;--accink:#0D191E;--live:#4CC38A;--warn:#F29B8C;--shadow:rgba(0,0,0,.45);";
const STYLE = `
.ag{position:absolute;display:flex;align-items:flex-start;gap:12px;font-family:-apple-system,"SF Pro Text","Helvetica Neue",sans-serif;-webkit-font-smoothing:antialiased;color:var(--ink);font-size:13px;line-height:1.25;user-select:none;-webkit-user-select:none;cursor:default}
.ag.light,.ag.auto{${LIGHT}} .ag.dark{${DARK}} @media (prefers-color-scheme: dark){.ag.auto{${DARK}}}
.ag .card{background:var(--bg);border:1px solid var(--line);border-radius:22px;box-shadow:0 6px 24px var(--shadow);padding:16px 16px 10px;box-sizing:border-box;position:relative;display:flex;flex-direction:column}
.ag .settings{width:290px;padding-bottom:16px;animation:ag-in .18s ease-out}
@keyframes ag-in{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}
.ag .ink3{color:var(--ink3)} .ag .small{font-size:11.5px} .ag .grow{flex:1} .ag .ic{display:block;flex:none}
.ag .hd{display:flex;align-items:center;gap:10px;cursor:grab;padding-bottom:12px}
.ag .num{font-size:40px;font-weight:800;letter-spacing:-1.5px;line-height:1}
.ag.f-compact .num{font-size:32px}
.ag .month{font-size:17px;font-weight:600} .ag .sub{font-size:13px;color:var(--ink3);margin-top:1px}
.ag .btn{display:flex;align-items:center;justify-content:center;gap:5px;cursor:pointer;transition:background .16s,color .16s,opacity .16s}
.ag .round{width:34px;height:34px;border-radius:17px;border:1.5px solid var(--line);color:var(--ink2);flex:none}
.ag .round:hover{background:var(--s2);color:var(--ink)} .ag .round.flat{border:none;width:28px;height:28px}
.ag .pill{height:26px;padding:0 10px;border-radius:13px;background:var(--s2);color:var(--ink2);font-size:12px;font-weight:600;white-space:nowrap}
.ag .pill:hover{color:var(--ink)}
.ag .week{display:flex;align-items:flex-start;gap:2px;padding:2px 0 10px}
.ag .nav{width:22px;height:46px;border-radius:8px;color:var(--ink3);flex:none} .ag .nav:hover{background:var(--s2)} .ag .nav.off{opacity:.25;cursor:default;background:none}
.ag .d{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;border-radius:10px;padding:2px 0}
.ag .d .dow{font-size:10.5px;font-weight:600;color:var(--ink3);letter-spacing:.3px}
.ag .d .circle{width:30px;height:30px;border-radius:15px;display:flex;align-items:center;justify-content:center;font-size:14.5px;font-weight:600;transition:background .16s}
.ag .d:hover .circle{background:var(--s2)}
.ag .d.today .circle{box-shadow:inset 0 0 0 1.5px var(--acc)} .ag .d.today .dow{color:var(--acc)}
.ag .d.sel .circle{background:var(--acc);color:var(--accink);box-shadow:none} .ag .d.sel .dow{color:var(--acc)}
.ag .d.off{opacity:.35}
.ag.f-compact .d .circle{width:26px;height:26px;font-size:13px}
.ag .dots{display:flex;gap:3px;height:5px;align-items:center} .ag .dots i{width:5px;height:5px;border-radius:3px;display:block}
.ag .sep{height:1px;background:var(--line);margin:4px 0;flex:none}
.ag .body{overflow-y:auto;overflow-x:hidden;flex:1;min-height:0;margin:0 -4px;padding:0 4px}
.ag .body::-webkit-scrollbar{width:0}
.ag .list{animation:ag-fade .16s ease-out} @keyframes ag-fade{from{opacity:0}to{opacity:1}}
.ag .gh{display:flex;justify-content:space-between;align-items:baseline;font-size:15px;font-weight:600;padding:10px 0 6px}
.ag .group .sep{margin-top:8px}
.ag .ev{display:flex;align-items:center;gap:10px;border-radius:12px;padding:9px 12px 9px 0;margin-bottom:6px;cursor:pointer;position:relative;overflow:hidden;transition:background .16s,opacity .16s}
.ag .ev:hover{background:var(--hov) !important}
.ag .ev .bar{width:4px;align-self:stretch;border-radius:0 3px 3px 0;flex:none}
.ag .ev.ended{opacity:.5} .ag .ev.ended .title{text-decoration:line-through}
.ag .evm{flex:1;min-width:0;padding-left:2px}
.ag .time{font-size:12.5px;color:var(--ink2);display:flex;align-items:center;gap:6px;white-space:nowrap;overflow:hidden}
.ag .dur{color:var(--ink3)}
.ag .flag{font-size:10.5px;font-weight:600;color:var(--ink3);display:inline-flex} .ag .flag.live{color:var(--live)}
.ag .title{font-size:15px;font-weight:600;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ag.f-compact .title{font-size:13.5px}
.ag .calname{font-size:11.5px;color:var(--ink3);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ag .kind{display:flex;align-items:center;gap:6px;color:var(--ink3);font-size:12.5px;flex:none;max-width:40%;white-space:nowrap}
.ag .kind span{overflow:hidden;text-overflow:ellipsis}
.ag .chev{color:var(--ink3);flex:none}
.ag .none{padding:2px 0 8px;font-size:12.5px}
.ag .foot{display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:8px;min-height:20px}
.ag .more{display:flex;align-items:center;gap:7px;color:var(--ink2);font-size:13px;cursor:pointer} .ag .more:hover{color:var(--ink)}
.ag .sync{font-size:10.5px;color:var(--ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:60%} .ag .sync.warn{color:var(--warn)}
.ag .grip{position:absolute;right:4px;bottom:4px;width:14px;height:14px;cursor:nwse-resize;opacity:.45;background:linear-gradient(135deg,transparent 0 55%,var(--ink3) 55% 62%,transparent 62% 72%,var(--ink3) 72% 79%,transparent 79%)}
.ag .grip:hover{opacity:.9}
.ag .state{display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px;padding:26px 12px}
.ag .state b{font-size:14px} .ag .state .ink3{font-size:12.5px;max-width:260px}
.ag .loading{padding:14px 0;display:flex;flex-direction:column;gap:8px}
.ag .loading i{display:block;height:46px;border-radius:12px;background:var(--s2);animation:ag-pulse 1.2s ease-in-out infinite}
.ag .loading i:nth-child(2){animation-delay:.15s;opacity:.8} .ag .loading i:nth-child(3){animation-delay:.3s;opacity:.6}
@keyframes ag-pulse{50%{opacity:.45}}
.ag .detail{padding:8px 0 4px;display:flex;flex-direction:column;gap:8px;animation:ag-fade .16s ease-out}
.ag .back{align-self:flex-start;color:var(--ink3);font-size:12.5px;padding:3px 0} .ag .back:hover{color:var(--ink)}
.ag .dtitle{display:flex;gap:10px;align-items:stretch;margin:2px 0 4px} .ag .dtitle .bar{width:4px;border-radius:2px;flex:none} .ag .dtitle b{font-size:18px;line-height:1.25}
.ag .dl{display:flex;gap:9px;align-items:center;font-size:13px;color:var(--ink2)}
.ag .dot{width:10px;height:10px;border-radius:5px;display:block;flex:none;margin:0 2.5px}
.ag .notes{font-size:12.5px;color:var(--ink2);white-space:pre-wrap;background:var(--s2);border-radius:10px;padding:9px 11px;max-height:150px;overflow:auto;user-select:text;-webkit-user-select:text}
.ag .primary{background:var(--acc);color:var(--accink);border-radius:10px;height:34px;font-weight:600;margin-top:4px} .ag .primary:hover{opacity:.9}
.ag .shd{display:flex;align-items:center;justify-content:space-between;font-size:17px;margin-bottom:6px}
.ag .cals{margin:10px 0 6px;display:flex;flex-direction:column;gap:2px}
.ag .cal{display:flex;align-items:center;gap:9px;height:36px;border-radius:8px;padding:0 4px;transition:background .16s}
.ag .cal:hover{background:var(--s2)} .ag .cal.hid .cname{color:var(--ink3)}
.ag .box{width:20px;height:20px;border-radius:6px;box-shadow:inset 0 0 0 1.5px var(--line);display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none;transition:background .16s}
.ag .box.on{background:var(--acc);color:var(--accink);box-shadow:none}
.ag .cname{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:13.5px} .ag .cname em{font-style:normal;color:var(--ink3);font-size:11px}
.ag .star{color:var(--ink3);cursor:pointer;opacity:.5;transition:opacity .16s} .ag .star:hover,.ag .star.on{opacity:1} .ag .star.on{color:var(--acc)}
.ag .handle{color:var(--ink3);cursor:grab}
.ag .sh2{font-size:14px;margin:6px 0 2px} .ag .lab{font-size:11.5px;color:var(--ink3);margin:8px 0 4px}
.ag .seg{display:flex;background:var(--s2);border-radius:9px;padding:2px;gap:2px}
.ag .seg div{flex:1;text-align:center;font-size:11.5px;padding:5px 2px;border-radius:7px;color:var(--ink3);cursor:pointer;transition:background .16s,color .16s;white-space:nowrap}
.ag .seg div.on{background:var(--bg);color:var(--ink);font-weight:600;box-shadow:0 1px 3px var(--shadow)}
.ag .settings .sync{display:flex;align-items:center;justify-content:space-between;gap:8px;max-width:none;margin-top:6px}
.ag .linkbtn{color:var(--acc);font-size:12px;justify-content:flex-start;margin-top:10px}
`;
