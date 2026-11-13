// Affichage heure par heure (demandes de Tom, 10/11) : un seul tableau pour les trois onglets, lignes propres à chacun :
//  - WIND : tableau façon Windguru (temps, air, pluie, vent et rafales colorés par force, direction) ;
//  - VAGUE : barres de vagues façon surf-forecast (vent coloré selon offshore/onshore, houle, période, étoiles) ;
//  - HOULE : le mélange des deux (vent + rafales + houle).
// Aucune note n'est recalculée ici : étoiles = note du moteur traduite en 0 à 3 étoiles.
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudMoon, CloudRain, CloudSnow, CloudSun, Moon, Sun } from 'lucide-preact';
import type { AllData, PublicSpot } from '../services/data';
import { compass, dayKey, dayShort, hourOf, kmhToKn, n0, n1 } from '../services/format';
import type { Series } from '../features/series';

// ------------------------------------------------------------------ étoiles
/** 0 à 3 étoiles : ≥ 5 → ★, ≥ 7 → ★★, ≥ 8,5 → ★★★ (mêmes seuils que les couleurs). */
export const starsOf = (s: number | null | undefined) => (s === null || s === undefined ? 0 : s >= 8.5 ? 3 : s >= 7 ? 2 : s >= 5 ? 1 : 0);
/** « Kite session » (wing, plus de 28 nd, D-49) : 1 étoile rouge, quelle que soit la note. */
export const KITE_TEXT = 'Kite session';
export const isKiteAt = (s: Series, i: number) => !!s.kite?.[i];
/** Meilleure note d'un ensemble d'heures hors « Kite session », et s'il y a des heures « Kite session ». */
export function bestOf(s: Series, idx: number[]): { best: number; bestI: number | null; kite: boolean } {
  let best = -1, bestI: number | null = null;
  for (const i of idx) if (!isKiteAt(s, i) && (s.score[i] ?? -1) > best) { best = s.score[i] ?? -1; bestI = i; }
  return { best, bestI, kite: idx.some((i) => isKiteAt(s, i)) };
}
export function Stars({ score, size = 'md', kite, label = true }: { score: number | null | undefined; size?: 'sm' | 'md' | 'lg' | 'xl'; kite?: boolean; label?: boolean }) {
  if (kite) return (
    <span class={`stars ${size} kite`} role="img" aria-label={`${KITE_TEXT} : plus de 28 nœuds, trop pour le wing`} title={`${KITE_TEXT} : plus de 28 nd${score == null ? '' : ` (note wing ${n1(score)}/10)`}`}>
      <span class="on">★</span>{label && <span class="kt">{size === 'sm' ? 'Kite' : KITE_TEXT}</span>}
    </span>
  );
  const k = starsOf(score);
  return (
    <span class={`stars ${size} k${k}`} role="img" aria-label={`${k} étoile${k > 1 ? 's' : ''} sur 3${score == null ? '' : ` (note ${n1(score)}/10)`}`} title={score == null ? '' : `note ${n1(score)}/10`}>
      {[0, 1, 2].map((i) => <span key={i} class={i < k ? 'on' : 'off'}>★</span>)}
    </span>
  );
}

// ------------------------------------------------------------------ couleurs
/** Échelle de vent façon Windguru (nœuds). */
export function windColor(kn: number | null | undefined): { background: string; color: string } {
  if (kn === null || kn === undefined) return { background: 'var(--c-surface-2)', color: 'var(--c-ink-3)' };
  const steps: [number, string, string][] = [[5, '#FFFFFF', '#41535A'], [8, '#D7F4FF', '#1B3640'], [11, '#9FE7F2', '#10343A'], [14, '#6FE0A0', '#0E3A23'], [17, '#A6EE4F', '#233A08'],
    [20, '#F5F23D', '#3B3600'], [23, '#FFC93C', '#3D2A00'], [26, '#FF9C33', '#3D1B00'], [30, '#FF5A3C', '#FFFFFF'], [35, '#E8336F', '#FFFFFF'], [99, '#B32DB8', '#FFFFFF']];
  const s = steps.find(([lim]) => kn < lim)!;
  return { background: s[1], color: s[2] };
}
/** Surf : le vent qui vient de la terre lisse les vagues (foncé = bon), le vent de mer les abîme (clair). */
export const SURF_WIND: Record<string, { background: string; color: string }> = {
  'pétole': { background: '#1F5F86', color: '#fff' }, offshore: { background: '#1F5F86', color: '#fff' }, 'side-off': { background: '#2F86A6', color: '#fff' },
  side: { background: '#7CC3D6', color: '#10343A' }, 'side-on': { background: '#BFE5EE', color: '#10343A' }, onshore: { background: '#E4F3F7', color: '#41535A' },
};
const WK_LABEL: Record<string, string> = { 'pétole': 'pétole', offshore: 'offshore', 'side-off': 'side-off', side: 'side', 'side-on': 'side-on', onshore: 'onshore' };

// ------------------------------------------------------------------ météo
type Meteo = { temp: (number | null)[]; rain: (number | null)[]; cloud: (number | null)[]; code: (number | null)[] };
export function meteoAt(d: AllData, spot: string, t: number): { temp: number | null; rain: number | null; code: number | null } | null {
  const m = d.meteo;
  if (!m?.available || !m.spots?.[spot]) return null;
  const i = (m.times as number[]).indexOf(t);
  if (i < 0) return null;
  const s = m.spots[spot] as Meteo;
  return { temp: s.temp[i], rain: s.rain[i], code: s.code[i] };
}
export function WeatherIcon({ code, day, size = 18 }: { code: number | null; day: boolean; size?: number }) {
  const p = { size, strokeWidth: 1.8, 'aria-hidden': true } as const;
  if (code === null) return <span style={{ width: size, height: size, display: 'inline-block' }} />;
  if (code >= 95) return <CloudLightning {...p} />;
  if (code >= 71 && code <= 77) return <CloudSnow {...p} />;
  if (code >= 61 || (code >= 80 && code <= 82)) return <CloudRain {...p} />;
  if (code >= 51) return <CloudDrizzle {...p} />;
  if (code >= 45) return <CloudFog {...p} />;
  if (code === 3) return <Cloud {...p} />;
  if (code >= 1) return day ? <CloudSun {...p} /> : <CloudMoon {...p} />;
  return day ? <Sun {...p} /> : <Moon {...p} />;
}
export const WMO: Record<number, string> = { 0: 'ciel clair', 1: 'peu nuageux', 2: 'partiellement nuageux', 3: 'couvert', 45: 'brouillard', 48: 'brouillard givrant', 51: 'bruine', 53: 'bruine', 55: 'bruine forte', 61: 'pluie faible', 63: 'pluie', 65: 'forte pluie', 80: 'averses', 81: 'averses', 82: 'fortes averses', 95: 'orage', 96: 'orage', 99: 'orage' };

export function Arrow({ from, size = 12 }: { from: number | null; size?: number }) {
  if (from === null || from === undefined) return <span class="arrow" style={{ width: size, height: size }} />;
  return <svg class="arrow" style={{ width: size, height: size, transform: `rotate(${from + 180}deg)` }} viewBox="0 0 12 12" aria-hidden="true"><path d="M6 1 L9.5 9 L6 7.2 L2.5 9 Z" fill="currentColor" /></svg>;
}

// ------------------------------------------------------------------ sélection des heures
export type Pick = { i: number; t: number };
export function pickHours(s: Series, opts: { day?: number; from?: number; days?: number; step?: number; hours?: [number, number] }): Pick[] {
  const [h0, h1] = opts.hours ?? [7, 21];   // 7 h → 21 h partout (Tom, 11/11)
  const step = opts.step ?? 1;
  const keys = opts.day !== undefined ? [dayKey(opts.day)] : null;
  const end = opts.from !== undefined && opts.days ? opts.from + opts.days * 86400e3 : Infinity;
  return s.times.map((t, i) => ({ i, t })).filter(({ t }) => {
    const h = hourOf(t);
    if (h < h0 || h > h1 || (h - h0) % step !== 0) return false;
    if (keys) return keys.includes(dayKey(t));
    return t >= (opts.from ?? 0) - 3600e3 && t < end;
  });
}

// ------------------------------------------------------------------ WIND : tableau façon Windguru
/** Survol / toucher d'une colonne (heure) : la fiche spot met à jour la carte, les cartes et les critères. */
export type HourPick = { picked?: number | null; onPick?: (t: number | null) => void };
const pickHandlers = (picks: Pick[], onPick: HourPick['onPick'], colOf: (el: Element) => number | null) => (onPick ? {
  onPointerOver: (e: PointerEvent) => { const k = colOf(e.target as Element); if (k !== null && picks[k]) onPick(picks[k].t); },
  onPointerDown: (e: PointerEvent) => { const k = colOf(e.target as Element); if (k !== null && picks[k]) onPick(picks[k].t); },
  onPointerLeave: (e: PointerEvent) => { if (e.pointerType === 'mouse') onPick(null); },
} : {});

export function WindTable({ d, spot, s, picks, showDays, picked, onPick }: { d: AllData; spot: PublicSpot; s: Series; picks: Pick[]; window?: [number, number]; showDays?: boolean } & HourPick) {
  const row = (i: number) => s.rows[i];
  const surf = s.discipline === 'surf', isWing = s.discipline === 'wing';
  const dir = (i: number) => (isWing ? row(i).dir : row(i).from);
  const met = picks.map((p) => meteoAt(d, spot.id, p.t));
  // colonnes qui ont au moins une étoile : teinte verte, orange ou violette selon les étoiles (Tom, 11/11 ; gris clair avant)
  const starred = (i: number) => starsOf(s.score[i]) > 0;
  const kite = (i: number) => isKiteAt(s, i);
  const dayStarts = new Set(picks.filter((p, k) => k === 0 || dayKey(picks[k - 1].t) !== dayKey(p.t)).map((p) => p.t));
  const sep = (t: number) => (showDays && dayStarts.has(t) ? 'sep' : undefined);
  // VAGUE et HOULE : même tableau que WIND ; barres de vagues (VAGUE) ou de houle portante (HOULE)
  const waveH = (i: number) => (surf ? row(i).hb : row(i).bumpH) as number | null;
  const waveT = (i: number) => (surf ? row(i).tp : row(i).bumpT) as number | null;
  const hMax = Math.max(1.5, ...picks.map((p) => waveH(p.i) ?? 0));
  return (
    <div class="wg-wrap">
      <table class="wg" aria-label={`${surf ? 'Vagues' : 'Vent'} heure par heure, ${spot.name}`}
        {...pickHandlers(picks, onPick, (el) => { const td = el.closest('td'); return td ? (td as HTMLTableCellElement).cellIndex - 1 : null; })}>
        <colgroup><col />{picks.map((p) => <col key={p.t} class={picked === p.t ? 'pk' : kite(p.i) ? 'st kite' : starred(p.i) ? `st k${starsOf(s.score[p.i])}` : ''} />)}</colgroup>
        <tbody>
          {showDays && <tr class="wg-days"><th />{picks.map((p) => <td key={p.t} class={sep(p.t)}>{dayStarts.has(p.t) ? dayShort(p.t) : ''}</td>)}</tr>}
          <tr class="wg-h"><th>Heure</th>{picks.map((p) => <td key={p.t} class={sep(p.t)}>{hourOf(p.t)}</td>)}</tr>
          <tr><th>Temps</th>{picks.map((p, k) => <td key={p.t} class={sep(p.t)} title={met[k]?.code != null ? WMO[met[k]!.code!] ?? '' : ''}><WeatherIcon code={met[k]?.code ?? null} day={s.day[p.i]} /></td>)}</tr>
          <tr><th>Air °C</th>{picks.map((p, k) => <td key={p.t} class={sep(p.t)}>{n0(met[k]?.temp)}</td>)}</tr>
          {!surf && <tr class="wg-rain"><th>Pluie mm</th>{picks.map((p, k) => <td key={p.t} class={sep(p.t)}>{met[k]?.rain ? n1(met[k]!.rain) : ''}</td>)}</tr>}
          {!surf && <tr class="wg-v"><th>Vent nd</th>{picks.map((p) => <td key={p.t} class={sep(p.t)} style={windColor(row(p.i).kn)}>{n0(row(p.i).kn)}</td>)}</tr>}
          {!surf && <tr class="wg-v"><th>Rafales</th>{picks.map((p) => <td key={p.t} class={sep(p.t)} style={windColor(row(p.i).gust)}>{n0(row(p.i).gust)}</td>)}</tr>}
          {!surf && <tr><th>Direction</th>{picks.map((p) => <td key={p.t} class={sep(p.t)} title={compass(dir(p.i))}><Arrow from={dir(p.i)} size={14} /></td>)}</tr>}
          {surf && <tr class="wg-v"><th>Vent nd</th>{picks.map((p) => <td key={p.t} class={sep(p.t)} style={windColor(row(p.i).ws)} title={row(p.i).wk ?? ''}>{n0(row(p.i).ws)}</td>)}</tr>}
          {surf && <tr><th>Direction</th>{picks.map((p) => <td key={p.t} class={sep(p.t)} title={`${compass(row(p.i).wd)}${row(p.i).wk ? ` · ${row(p.i).wk}` : ''}`}><Arrow from={row(p.i).wd} size={14} /></td>)}</tr>}
          {s.discipline !== 'wing' && <tr class="wg-bars"><th>{surf ? 'Vagues m' : 'Houle m'}</th>{picks.map((p) => { const h = waveH(p.i); return <td key={p.t} class={sep(p.t)} title={surf ? `${n1(row(p.i).lo)} à ${n1(row(p.i).hi)} m` : undefined}><span>{n1(h)}</span><div class="bar" style={{ height: `${Math.max(2, Math.round(((h ?? 0) / hMax) * 44))}px` }} /></td>; })}</tr>}
          {s.discipline !== 'wing' && <tr><th>Période s</th>{picks.map((p) => <td key={p.t} class={sep(p.t)}>{n0(waveT(p.i))}</td>)}</tr>}
          {surf && <tr><th>Houle de</th>{picks.map((p) => <td key={p.t} class={sep(p.t)} title={compass(row(p.i).dir)}><Arrow from={row(p.i).dir} size={14} /></td>)}</tr>}
          <tr class="wg-stars"><th>Étoiles</th>{picks.map((p) => <td key={p.t} class={`${sep(p.t) ?? ''} ${kite(p.i) ? 'kite' : `k${starsOf(s.score[p.i])}`}`}><Stars score={s.score[p.i]} size="md" kite={kite(p.i)} label={false} /></td>)}</tr>
        </tbody>
      </table>
    </div>
  );
}

/** Résumé façon surf-forecast : « 0,9 m » 1,4 m · Houle SE 1,1 m 4 s · Vent NNE 11 nd · Eau 16 °C ». */
export function surfHead(s: Series, picks: Pick[]): string {
  if (!picks.length) return '';
  const r = (i: number) => s.rows[i];
  const lo = Math.min(...picks.map((p) => r(p.i).lo ?? 99)), hi = Math.max(...picks.map((p) => r(p.i).hi ?? 0));
  const best = picks.reduce((a, p) => ((s.score[p.i] ?? -1) > (s.score[a.i] ?? -1) ? p : a), picks[0]);
  const x = r(best.i);
  const sst = picks.map((p) => r(p.i).sst).find((v) => v !== null && v !== undefined);
  return `${n1(lo)} m » ${n1(hi)} m · houle ${compass(x.dir)} ${n1(x.hs)} m ${n0(x.tp)} s · vent ${compass(x.wd)} ${n0(x.ws)} nd${sst != null ? ` · eau ${n0(sst)} °C` : ''}`;
}
export function windHead(s: Series, picks: Pick[]): string {
  if (!picks.length) return '';
  const r = (i: number) => s.rows[i];
  const mx = picks.reduce((a, p) => ((r(p.i).kn ?? -1) > (r(a.i).kn ?? -1) ? p : a), picks[0]);
  const g = Math.max(...picks.map((p) => r(p.i).gust ?? 0));
  const dir = s.discipline === 'wing' ? r(mx.i).dir : r(mx.i).from;
  const sw = s.discipline === 'downwind' ? ` · houle ${n1(Math.max(...picks.map((p) => r(p.i).bumpH ?? 0)))} m` : '';
  return `max ${n0(r(mx.i).kn)} nd ${compass(dir)} · raf. ${n0(g)}${sw}`;
}

/** Vue d'une journée (ou d'une période) selon l'onglet. */
export function ModuleView({ d, spot, s, picks, window, showDays, compact, picked, onPick }: { d: AllData; spot: PublicSpot; s: Series; picks: Pick[]; window?: [number, number]; showDays?: boolean; compact?: boolean } & HourPick) {
  if (!picks.length) return <span class="faint">Pas de prévision sur cette période.</span>;
  void compact;
  return <WindTable d={d} spot={spot} s={s} picks={picks} window={window} showDays={showDays} picked={picked} onPick={onPick} />;
}
export const headFor = (s: Series, picks: Pick[]) => (s.discipline === 'surf' ? surfHead(s, picks) : windHead(s, picks));

// ------------------------------------------------------------------ WIND expert : les 7 modèles bruts (façon Windguru multi-modèles)
const MODEL_NAME: Record<string, string> = { meteofrance_arome_france_hd: 'AROME HD', meteofrance_arome_france: 'AROME', meteofrance_seamless: 'Météo-France', ecmwf_ifs025: 'ECMWF', icon_d2: 'ICON-D2', icon_eu: 'ICON-EU', icon_seamless: 'ICON', gfs_seamless: 'GFS', ukmo_seamless: 'UKMO', meteofrance_arpege_europe: 'ARPEGE' };
export function ModelsTable({ d, spot, s, from }: { d: AllData; spot: PublicSpot; s: Series; from: number }) {
  const wm = d.meteo?.windModels;
  const models = wm?.spots?.[spot.id] as Record<string, { kn: (number | null)[]; gust: (number | null)[]; dir: (number | null)[] }> | undefined;
  if (!wm || !models) return null;
  const idx = (wm.times as number[]).map((t, i) => ({ t, i })).filter(({ t }) => t >= from && hourOf(t) >= 7 && hourOf(t) <= 20 && hourOf(t) % 3 === 1).slice(0, 15);
  const corrected = (t: number) => { const k = s.times.indexOf(t); return k < 0 ? null : s.rows[k].kn; };
  return (
    <div class="wg-wrap">
      <table class="wg models" aria-label="Vent par modèle">
        <tbody>
          <tr class="wg-days"><th />{idx.map(({ t }, k) => <td key={t} class={k === 0 || dayKey(idx[k - 1].t) !== dayKey(t) ? 'sep' : ''}>{k === 0 || dayKey(idx[k - 1].t) !== dayKey(t) ? dayShort(t) : ''}</td>)}</tr>
          <tr class="wg-h"><th>Heure</th>{idx.map(({ t }) => <td key={t}>{hourOf(t)}</td>)}</tr>
          <tr class="wg-v"><th><strong>Corrigé</strong></th>{idx.map(({ t }) => <td key={t} style={windColor(corrected(t))}><strong>{n0(corrected(t))}</strong></td>)}</tr>
          {Object.entries(models).map(([m, v]) => (
            <tr key={m} class="wg-v"><th>{MODEL_NAME[m] ?? m}</th>{idx.map(({ t, i }) => <td key={t} style={windColor(v.kn[i])} title={`rafales ${n0(v.gust[i])} · ${compass(v.dir[i])}`}>{n0(v.kn[i])}</td>)}</tr>
          ))}
        </tbody>
      </table>
      <span class="chip-legend">Vent moyen (nd) de chaque modèle avant correction ; « Corrigé » = super prévision (modèles pondérés par leur erreur aux balises).</span>
    </div>
  );
}

export { kmhToKn };
