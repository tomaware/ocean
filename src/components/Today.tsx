// Fiche spot, style validé par Tom le 10/11 (maquette « OCEAN Flow Light ») : note du jour en étoiles + barres horaires,
// cartes de conditions, boussole sur la carte, détail de la note. Aucune note n'est recalculée ici : on affiche ce que
// les moteurs ont publié (pour le wing, les facteurs V × R × D publiés avec chaque heure).
import type { Ref } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { AllData, Level, PublicSpot, Session } from '../services/data';
import { LEVEL_LABEL } from '../services/data';
import { compass, dayKey, dayShort, hh, hourOf, n0, n1 } from '../services/format';
import type { Series } from '../features/series';
import { meteoAt, Stars, starsOf, SURF_WIND, WMO } from './Views';
import { SpotMap } from './SpotMap';

/** Heures d'une journée dans la série. */
export const dayIdx = (s: Series, dayT: number) => { const k = dayKey(dayT); return s.times.map((_, i) => i).filter((i) => dayKey(s.times[i]) === k); };
/** Jours proposés : ceux qui ont encore au moins une heure de jour à venir. */
export function daysOf(s: Series, now: number, max = 7): number[] {
  const out: number[] = []; const seen = new Set<string>();
  s.times.forEach((t, i) => { const k = dayKey(t); if (t >= now - 3600e3 && s.day[i] && !seen.has(k)) { seen.add(k); out.push(t); } });
  return out.slice(0, max);
}
/** Heure de référence des cartes : l'heure en cours si on regarde aujourd'hui en journée, sinon la meilleure heure du jour. */
export function refIndex(s: Series, dayT: number, now: number): number | null {
  const idx = dayIdx(s, dayT).filter((i) => s.day[i]);
  if (!idx.length) return null;
  const cur = idx.find((i) => s.times[i] <= now && now < s.times[i] + 3600e3);
  if (cur !== undefined) return cur;
  return idx.reduce((a, i) => ((s.score[i] ?? -1) > (s.score[a] ?? -1) ? i : a), idx[0]);
}
/** 10 → « 10 », 7,25 → « 7,3 » */
const sc1 = (x: number | null | undefined) => (x == null ? '—' : Number.isInteger(Math.round(x * 10) / 10) ? String(Math.round(x)) : n1(x));
const dec = (x: number) => String(Math.round(x * 100) / 100).replace('.', ',');

export function DayTabs({ s, days, value, now, onChange }: { s: Series; days: number[]; value: number; now: number; onChange: (t: number) => void }) {
  return (
    <div class="daytabs" role="group" aria-label="Jour">
      {days.map((t, k) => {
        const best = Math.max(-1, ...dayIdx(s, t).map((i) => s.score[i] ?? -1));
        return (
          <button key={t} type="button" aria-pressed={dayKey(t) === dayKey(value)} onClick={() => onChange(t)}>
            {k === 0 && dayKey(t) === dayKey(now) ? 'Auj.' : dayShort(t).replace('.', '')}
            {starsOf(best) > 0 && <Stars score={best} size="sm" />}
          </button>
        );
      })}
    </div>
  );
}

/** 24 barres (0 h → 23 h) : couleur = note, nuit grisée, trait « Maintenant » si c'est aujourd'hui. */
/** Largeur réelle du conteneur : le graphique se dessine en pixels réels (textes lisibles du téléphone au grand écran). */
function useWidth(initial: number): [Ref<HTMLDivElement>, number] {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(initial);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(() => { const x = ref.current?.clientWidth; if (x) setW(Math.round(x)); });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

/** Une heure choisie au survol (souris) ou au toucher : cartes, critères et carte suivent cette heure. */
export type PickProps = { picked?: number | null; onPick?: (i: number | null) => void; level?: Level };

export function ScoreBars({ s, dayT, now, picked = null, onPick, level }: { s: Series; dayT: number; now: number } & PickProps) {
  const [ref, width] = useWidth(340);
  const W = Math.max(240, width), H = W > 600 ? 130 : 104, top = 24, P = H - top, x0 = 20, bw = (W - x0) / 24;
  const y = (v: number) => H - (v / 10) * P;
  const byH = new Map(dayIdx(s, dayT).map((i) => [hourOf(s.times[i]), i]));
  const today = dayKey(dayT) === dayKey(now);
  const nowH = today ? hourOf(now) + new Date(now).getMinutes() / 60 : null;
  // heures sans prévision avant le lever / après le coucher (déduits des heures publiées) : nuit
  const dayHours = [...byH.entries()].filter(([, i]) => s.day[i]).map(([h]) => h);
  const isNight = (h: number) => { const i = byH.get(h); return i !== undefined ? !s.day[i] : dayHours.length > 0 && (h < Math.min(...dayHours) || h > Math.max(...dayHours)); };
  const best = [...byH.values()].filter((i) => s.day[i]).sort((a, b) => (s.score[b] ?? -1) - (s.score[a] ?? -1))[0];
  const label = `Note heure par heure, ${today ? 'aujourd’hui' : dayShort(dayT)}${best !== undefined ? ` ; meilleure à ${hourOf(s.times[best])} h (${n1(s.score[best])}/10)` : ''}. Survole ou touche une colonne pour le détail.`;
  const wide = bw >= 22;
  const pickedH = picked !== null && dayKey(s.times[picked]) === dayKey(dayT) ? hourOf(s.times[picked]) : null;
  const at = (e: PointerEvent) => {
    const r = (e.currentTarget as SVGElement).getBoundingClientRect();
    const h = Math.floor(((e.clientX - r.left) * (W / r.width) - x0) / bw);
    return h >= 0 && h < 24 ? byH.get(h) ?? null : null;
  };
  return (
    <div class="scorebars-w" ref={ref}>
    <svg class="scorebars" viewBox={`0 0 ${W} ${H + 22}`} width={W} height={H + 22} role="img" aria-label={label}
      onPointerMove={onPick ? (e) => { if (e.pointerType === 'mouse') { const i = at(e as unknown as PointerEvent); if (i !== null) onPick(i); } } : undefined}
      onPointerDown={onPick ? (e) => { const i = at(e as unknown as PointerEvent); if (i !== null) onPick(i === picked && (e as PointerEvent).pointerType !== 'mouse' ? null : i); } : undefined}
      onPointerLeave={onPick ? (e) => { if ((e as PointerEvent).pointerType === 'mouse') onPick(null); } : undefined}>
      {Array.from({ length: 24 }, (_, h) => (isNight(h) ? <rect key={`z${h}`} class="z" x={x0 + h * bw} y={top} width={bw + 0.5} height={P} /> : null))}
      {/* quadrillage : 0, 2,5, 7,5, 10 en fin ; 5 = seuil d'une session 2H, en gras */}
      {[0, 2.5, 7.5, 10].map((v) => <line key={v} class="grid" x1={x0} x2={W} y1={y(v)} y2={y(v)} />)}
      {[3, 6, 9, 12, 15, 18, 21].map((h) => <line key={`v${h}`} class="grid" x1={x0 + h * bw} x2={x0 + h * bw} y1={top} y2={H} />)}
      <line class="grid5" x1={x0} x2={W} y1={y(5)} y2={y(5)} />
      {pickedH !== null && <rect class="pk" x={x0 + pickedH * bw} y={top - 4} width={bw} height={P + 4} rx={3} />}
      {Array.from({ length: 24 }, (_, h) => {
        const i = byH.get(h);
        const night = isNight(h), sc = i === undefined ? null : s.score[i];
        const v = i === undefined || night || sc === null ? 0.4 : Math.max(0.4, sc);
        const cls = night ? 'b-night' : i === undefined || sc === null ? 'b-none' : sc >= 7 ? 'b-good' : sc >= 5 ? 'b-mid' : 'b-bad';
        return (
          <g key={h}>
            <rect class={cls} x={x0 + h * bw + 1.5} y={y(v)} width={bw - 3} height={H - y(v)} rx={2} />
            {!night && sc !== null && <text class="val" x={x0 + h * bw + bw / 2} y={y(v) - 3} text-anchor="middle">{wide ? sc1(sc) : n0(sc)}</text>}
          </g>
        );
      })}
      <text x={0} y={y(0) + 4}>0</text><text class="lbl5" x={0} y={y(5) + 4}>5</text><text x={0} y={y(10) + 4}>10</text>
      {nowH !== null && <><line class="now" x1={x0 + nowH * bw} x2={x0 + nowH * bw} y1={top - 6} y2={H} /><text class="now-l" x={Math.min(W - 30, Math.max(x0 + 26, x0 + nowH * bw))} y={10} text-anchor="middle">Maintenant</text></>}
      {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => <text key={h} x={x0 + h * bw + bw / 2} y={H + 15} text-anchor="middle">{h} h</text>)}
    </svg>
    {pickedH !== null && picked !== null && <HourTip s={s} i={picked} level={level} left={Math.min(Math.max(0, x0 + pickedH * bw + bw / 2 - 130), W - 260)} top={H + 24} />}
    </div>
  );
}

/** Fenêtre au survol d'une colonne : pourquoi cette note (mêmes critères que le panneau à côté). */
function HourTip({ s, i, level, left, top }: { s: Series; i: number; level?: Level; left: number; top: number }) {
  const x = s.rows[i], sc = s.score[i];
  let lines: [string, string][] = [];
  let why: string | null = null;
  if (s.discipline === 'wing') {
    const f = level ? (x.f?.[level] as [number, number, number] | null | undefined) : null;
    lines = [['Vent', `${n0(x.kn)} nd de ${compass(x.dir)} · raf. ${n0(x.gust)}`]];
    if (f) lines.push(['Force', `${sc1(f[0] * 10)}/10`], ['Régularité', `${sc1(f[1] * 10)}/10`], ['Direction / plage', `${sc1(f[2] * 10)}/10${x.sector ? ` (${(SECTOR_TAG[x.sector] ?? x.sector).toLowerCase()})` : ''}`]);
    why = level ? (x.limit?.[level] as string | null) : null;
  } else if (s.discipline === 'surf') {
    lines = [['Vagues', `${n1(x.lo)}–${n1(x.hi)} m`], ['Houle', `${compass(x.dir)} ${n1(x.hs)} m · ${n0(x.tp)} s`], ['Vent', `${n0(x.ws)} nd ${compass(x.wd)}${x.wk ? ` (${x.wk})` : ''}`]];
  } else {
    lines = [['Vent', `${n0(x.kn)} nd de ${compass(x.from)} · raf. ${n0(x.gust)}`], ['Côte', SHORE_TAG[x.shore] ?? '—'], ['Houle', x.bumpH == null ? '—' : `${n1(x.bumpH)} m · ${n0(x.bumpT)} s`]];
  }
  return (
    <div class="hourtip" role="status" style={{ left: `${left}px`, top: `${top}px` }}>
      <div class="row between"><strong>{hh(s.times[i])}</strong><span class="row" style={{ gap: '6px' }}><Stars score={sc} size="sm" /><strong>{s.day[i] ? `${sc1(sc)}/10` : 'nuit : 0'}</strong></span></div>
      {lines.map(([k, v]) => <div key={k} class="row between"><span class="muted">{k}</span><span>{v}</span></div>)}
      {why && <span class="comment">{why}</span>}
    </div>
  );
}

const SECTOR_TAG: Record<string, string> = { onshore: 'Vent de mer', 'side-on': 'Side-on', side: 'Side-shore', 'side-off': 'Side-off', offshore: 'Vent de terre', closed: 'Plan d’eau', avoid: 'Déconseillé' };
const SHORE_TAG: Record<string, string> = { on: 'Vent de mer', sideon: 'Side-on', side: 'Side-shore', sideoff: 'Side-off', off: 'Vent de terre' };

export function NoteCard({ s, dayT, now, sessions, level, picked, onPick }: { s: Series; dayT: number; now: number; sessions: Session[]; level: Level } & PickProps) {
  const idx = dayIdx(s, dayT).filter((i) => s.day[i]);
  const best = Math.max(-1, ...idx.map((i) => s.score[i] ?? -1));
  const ss = sessions.filter((x) => dayKey(x.start) === dayKey(dayT)).sort((a, b) => a.start - b.start);
  const envoie = ss.find((x) => x.envoie);
  const r = refIndex(s, dayT, now);
  const why = ss.find((x) => x.why)?.why ?? (s.discipline === 'wing' && r !== null ? (s.rows[r].limit?.[level] as string | null) : null);
  const today = dayKey(dayT) === dayKey(now);
  return (
    <section class="card notecard t-note" aria-label="Note du jour">
      <div class="head">
        <span class="eyebrow">Note du jour · {today ? 'aujourd’hui' : dayShort(dayT)}</span>
        <span class="small muted">{ss.length ? <>Créneau{ss.length > 1 ? 'x' : ''} <strong style={{ color: 'var(--c-ink)' }}>{ss.map((x) => `${hh(x.start)} – ${hh(x.end)}`).join(' · ')}</strong></> : 'pas de session 2H'}</span>
      </div>
      <div class="mid">
        <Stars score={best < 0 ? null : best} size="xl" />
        <span class="row" style={{ gap: '6px' }}>
          {envoie && <span class="envoie">Ça envoie · {envoie.windyHours} h à plus de 20 nd</span>}
          {s.levels && <span class="tag">{LEVEL_LABEL[level]}</span>}
        </span>
      </div>
      <ScoreBars s={s} dayT={dayT} now={now} picked={picked} onPick={onPick} level={level} />
      {why && <span class="comment"><strong>Commentaire :</strong> {why}</span>}
    </section>
  );
}

/** Deux cartes : WIND = Vent + Météo ; VAGUE = Vagues + Vent ; HOULE = Vent + Houle. */
export function CondCards({ d, spot, s, dayT, now, picked }: { d: AllData; spot: PublicSpot; s: Series; dayT: number; now: number; picked?: number | null }) {
  const i = picked ?? refIndex(s, dayT, now);
  if (i === null) return null;
  const x = s.rows[i], at = `${hourOf(s.times[i])} h`;
  if (s.discipline === 'surf') {
    const wk = SURF_WIND[x.wk ?? ''];
    return <>
      <div class="card cond t-a"><span class="eyebrow">Vagues à {at}</span><span class="v">{n1(x.lo)}–{n1(x.hi)}<small> m</small></span><span class="d">houle {compass(x.dir)} {n1(x.hs)} m · {n0(x.tp)} s</span>{x.sst != null && <span class="faint">Eau {n0(x.sst)}°</span>}</div>
      <div class="card cond t-b"><span class="eyebrow">Vent à {at}</span><span class="v">{n0(x.ws)}<small> nd</small></span><span class="d">{compass(x.wd)} · raf. {n0(x.wg)}</span>{x.wk && <span class="tag" style={wk}>{x.wk}</span>}</div>
    </>;
  }
  const wind = (
    <div class="card cond t-a"><span class="eyebrow">Vent à {at}</span><span class="v">{n0(x.kn)}<small> nd</small></span>
      <span class="d">{compass(s.discipline === 'wing' ? x.dir : x.from)} {n0(s.discipline === 'wing' ? x.dir : x.from)}° · raf. {n0(x.gust)}</span>
      {s.discipline === 'wing' && x.sector && <span class={`tag${x.sector === 'offshore' || x.sector === 'side-off' ? ' warn' : ''}`}>{SECTOR_TAG[x.sector] ?? x.sector}</span>}
      {s.discipline === 'downwind' && x.shore && <span class={`tag${x.shore === 'off' || x.shore === 'sideoff' ? ' warn' : ''}`}>{SHORE_TAG[x.shore] ?? x.shore}</span>}
    </div>
  );
  if (s.discipline === 'downwind') return <>{wind}
    <div class="card cond t-b"><span class="eyebrow">Houle au large</span><span class="v">{n1(x.bumpH)}<small> m</small></span><span class="d">{n0(x.bumpT)} s{x.rt ? ' · aller-retour possible' : ''}</span></div></>;
  const m = meteoAt(d, spot.id, s.times[i]);
  const night = dayIdx(s, dayT).find((k) => k > i && !s.day[k]);
  return <>{wind}
    <div class="card cond t-b"><span class="eyebrow">Météo à {at}</span><span class="v">{m ? n0(m.temp) : '—'}<small>°</small></span>
      <span class="d">{m?.code != null ? (WMO[m.code] ?? '') : ''}{m ? ` · ${m.rain ? n1(m.rain) : '0'} mm` : 'météo indisponible'}</span>
      {night !== undefined && <span class="faint">Nuit à partir de {hh(s.times[night])}</span>}</div>
  </>;
}

/** Carte du spot : repère centré sur le spot (cercle, N/E/S/O, axe de la plage), flèche du vent avec sa force,
 *  et pour VAGUE la flèche de la houle. Suit l'heure survolée dans la note du jour ou les tableaux. */
export function MapCompass({ d, spot, s, dayT, now, best, picked }: { d: AllData; spot: PublicSpot; s: Series; dayT: number; now: number; best: number | null; picked?: number | null }) {
  const i = picked ?? refIndex(s, dayT, now);
  // la carte Leaflet n'est recréée que si le spot change (pas à chaque heure survolée)
  const spots = useMemo(() => [spot], [spot]);
  const bestMap = useMemo(() => ({ [spot.id]: best }), [spot.id, best]);
  const x = i === null ? null : s.rows[i];
  const from = x === null ? null : s.discipline === 'surf' ? x.wd : s.discipline === 'wing' ? x.dir : x.from;
  const kn = x === null ? null : s.discipline === 'surf' ? x.ws : x.kn;
  const gust = x === null ? null : s.discipline === 'surf' ? x.wg : x.gust;
  const seaward = s.discipline === 'surf' ? d.surf.spots?.find((y: any) => y.id === spot.id)?.normal ?? null : spot.orientation?.seaward ?? null;
  const swell = x !== null && s.discipline === 'surf' && x.dir != null ? { from: x.dir as number, txt: `HOULE ${n1(x.hs)} m · ${n0(x.tp)} s` } : null;
  const R = 74;
  const ray = (deg: number, r: number) => { const a = (deg * Math.PI) / 180; return [Math.sin(a) * r, -Math.cos(a) * r]; };
  const tag = (deg: number, text: string, cls: string, r = R + 30) => {
    const [lx, ly] = ray(deg, r), w = text.length * 7.2 + 16;
    return <g class={cls}><rect x={lx - w / 2} y={ly - 12} width={w} height={24} rx={12} /><text x={lx} y={ly + 4.5} text-anchor="middle">{text}</text></g>;
  };
  const arrow = (deg: number, cls: string) => {
    const [ox, oy] = ray(deg, R + 10), [ix, iy] = ray(deg, 16);
    return <g class={cls}><line x1={ox} y1={oy} x2={ix} y2={iy} /><path d="M0 0 L-6 -12 L6 -12 Z" transform={`translate(${ix} ${iy}) rotate(${deg})`} /></g>;
  };
  return (
    <div class="mapbox t-map">
      <SpotMap spots={spots} best={bestMap} focus={spot.id} />
      {from != null && i !== null && (
        <svg class="maprep" viewBox="-180 -140 360 280" role="img" aria-label={`${hh(s.times[i])} : vent de ${compass(from)} (${n0(from)}°), ${n0(kn)} nœuds, rafales ${n0(gust)}${swell ? `, houle de ${compass(swell.from)}` : ''}${seaward !== null ? `, plage ouverte vers ${compass(seaward)}` : ''}`}>
          <circle class="ring" r={R} />
          {[['N', 0], ['E', 90], ['S', 180], ['O', 270]].map(([l, a]) => { const [tx, ty] = ray(a as number, R - 10); return <text key={l} class="cardinal" x={tx} y={ty + 4} text-anchor="middle">{l}</text>; })}
          {seaward !== null && (() => { const [bx, by] = ray(seaward, R); const [cx, cy] = ray(seaward, R - 9); return <line class="beach" x1={cx} y1={cy} x2={bx} y2={by} />; })()}
          {swell && arrow(swell.from, 'swell')}
          {arrow(from, 'wind')}
          {swell && tag(swell.from, swell.txt, 'swell-tag', R + 60)}
          {tag(from, `VENT ${n0(kn)} nd · ${compass(from)}${gust != null ? ` · raf. ${n0(gust)}` : ''}`, 'wind-tag')}
        </svg>
      )}
      {i !== null && <span class="mapwhen">{picked != null ? 'Heure survolée' : 'Heure affichée'} : {dayShort(s.times[i])} · {hh(s.times[i])}</span>}
    </div>
  );
}

function Gauge({ v, name }: { v: number; name: string }) {
  const c = 2 * Math.PI * 16, cls = v >= 8.5 ? 'g-good' : v >= 5 ? 'g-mid' : 'g-bad';
  return (
    <svg class="gauge" width={42} height={42} viewBox="0 0 40 40" role="img" aria-label={`${name} : ${n1(v)} sur 10`}>
      <circle class="tr" cx={20} cy={20} r={16} fill="none" stroke-width={3.5} />
      <circle class={cls} cx={20} cy={20} r={16} fill="none" stroke-width={3.5} stroke-linecap="round" stroke-dasharray={`${((v / 10) * c).toFixed(1)} ${c.toFixed(1)}`} transform="rotate(-90 20 20)" />
      <text x={20} y={24.5} text-anchor="middle">{v === 10 || v === 0 ? String(v) : n1(v)}</text>
    </svg>
  );
}

/** Détail de la note à l'heure de référence. WIND : les 4 critères publiés par le moteur wing ; VAGUE / HOULE : les conditions. */
export function Criteria({ d, spot, s, dayT, now, level, sessions, picked }: { d: AllData; spot: PublicSpot; s: Series; dayT: number; now: number; level: Level; sessions: Session[]; picked?: number | null }) {
  const i = picked ?? refIndex(s, dayT, now);
  if (i === null) return null;
  const x = s.rows[i], at = `${hourOf(s.times[i])} h`;
  if (s.discipline === 'wing') {
    const f = x.f?.[level] as [number, number, number] | null | undefined;
    if (!f) return null;
    const lo = d.wing.levels?.[level]?.lo ?? 15;
    const ratio = x.gust && x.kn ? x.gust / x.kn : null;
    const sess = sessions.find((y) => dayKey(y.start) === dayKey(dayT) && y.windyHours != null);
    const rows: [string, string, number][] = [
      ['Force du vent', `${n0(x.kn)} nd · idéal de ${lo} à 35 nd`, f[0] * 10],
      ['Régularité', ratio ? `rafales ${n0(x.gust)} nd (× ${dec(ratio)})${f[1] < 1 ? ' : vent irrégulier' : ''}` : 'rafales inconnues', f[1] * 10],
      ['Direction / plage', x.dir == null ? 'direction inconnue' : `vent de ${compass(x.dir)}${x.sector ? `, ${(SECTOR_TAG[x.sector] ?? x.sector).toLowerCase()}` : ''}`, f[2] * 10],
      ['Lumière du jour', s.day[i] ? 'de jour' : 'nuit : note 0', s.day[i] ? 10 : 0],
    ];
    return (
      <section class="card crit t-crit" aria-label={`Critères de la note à ${at}`}>
        <div class="row between"><span class="eyebrow">Critères à {at}</span><span class="eyebrow">sur 10</span></div>
        {rows.map(([name, detail, v]) => <div key={name} class="crit-row"><div class="txt"><strong>{name}</strong><span>{detail}</span></div><Gauge v={Math.round(v * 10) / 10} name={name} /></div>)}
        <div class="formula">
          <span>Note = 10 × force ({dec(f[0])}) × régularité ({dec(f[1])}) × direction ({dec(f[2])}) = <strong>{n1(s.score[i])}</strong></span>
          <span>« Ça envoie » s’affiche quand une session compte au moins 4 h à plus de 20 nd{sess ? ` : ici ${sess.windyHours} h` : ''}.</span>
        </div>
      </section>
    );
  }
  const kv: [string, string][] = s.discipline === 'surf'
    ? (() => { const sp = d.surf.spots?.find((y: any) => y.id === spot.id); return [
        ['Vagues', `${n1(x.hb)} m (${n1(x.lo)}–${n1(x.hi)}) · idéal ${n1(sp?.size?.ideal)} m, de ${n1(sp?.size?.min)} à ${n1(sp?.size?.max)} m`],
        ['Houle', `de ${compass(x.dir)}, ${n1(x.hs)} m, ${n0(x.tp)} s · utile du ${compass(sp?.swell?.min)} au ${compass(sp?.swell?.max)}`],
        ['Vent', `${n0(x.ws)} nd de ${compass(x.wd)}${x.wk ? ` (${x.wk})` : ''}`],
        ['Confiance', x.conf == null ? '—' : `${Math.round(x.conf * 100)} %`],
      ] as [string, string][]; })()
    : [
        ['Vent', `${n0(x.kn)} nd, rafales ${n0(x.gust)}, de ${compass(x.from)}`],
        ['Côte', SHORE_TAG[x.shore] ?? '—'],
        ['Houle', x.bumpH == null ? '—' : `${n1(x.bumpH)} m · ${n0(x.bumpT)} s`],
        ['Aller-retour', x.rt ? 'possible' : 'non'],
      ];
  return (
    <section class="card crit t-crit" aria-label={`Conditions à ${at}`}>
      <div class="row between"><span class="eyebrow">Conditions à {at}</span><Stars score={s.score[i]} /></div>
      <div class="list">{kv.map(([k, v]) => <div key={k} class="kv"><span class="muted small">{k}</span><span class="small">{v}</span></div>)}</div>
      <span class="faint">Note {n1(s.score[i])}/10, calculée par le moteur {s.discipline === 'surf' ? 'surf' : 'downwind'} d’origine ; le détail critère par critère n’est pas encore publié pour {s.discipline === 'surf' ? 'VAGUE' : 'HOULE'}.</span>
    </section>
  );
}

