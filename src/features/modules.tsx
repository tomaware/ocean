// Onglets WIND / VAGUE / HOULE : menu des modules à droite (Meilleure session, Sessions 2H, Prévision, Spots).
import { useMemo, useState } from 'preact/hooks';
import type { AllData, Discipline, Level, PublicSpot, Session } from '../services/data';
import { DISC_LABEL, distanceKm, HOME, LEVEL_LABEL, LEVELS_FOR, spotDiscipline } from '../services/data';
import { compass, dayKey, dayLabel, dayShort, hh, hourOf, n0, n1, span } from '../services/format';
import { setPrefs, usePrefs } from '../services/prefs';
import { useLive } from '../services/perso';
import { Badge, Fav, Section, Seg } from '../components/ui';
import { SpotMap } from '../components/SpotMap';
import { seriesFor, type Series } from './series';
import { bestScoreBySpot, Freshness, levelFor, LiveBox, matches, moduleOf, upcoming } from './pages';

export const SUBS = [
  { id: 'meilleure', label: 'Meilleure session' },
  { id: 'sessions', label: 'Sessions 2H' },
  { id: 'prevision', label: 'Prévision' },
  { id: 'spots', label: 'Spots' },
] as const;
export type Sub = (typeof SUBS)[number]['id'];

// ------------------------------------------------------------ graphique d'une journée (pastilles horaires)
type Cell = { t: number; main: string; sub: string; dir: number | null; score: number | null };

/** Valeurs horaires d'un spot pour un jour, selon la discipline : vent (WIND), vagues (VAGUE), vent + houle (HOULE). */
function dayCells(s: Series, key: string): { cells: Cell[]; head: string } {
  const idx = s.times.map((t, i) => i).filter((i) => dayKey(s.times[i]) === key && hourOf(s.times[i]) >= 7 && hourOf(s.times[i]) <= 20);
  const r = (i: number) => s.rows[i];
  let cells: Cell[] = [], head = '';
  if (s.discipline === 'wing') {
    cells = idx.map((i) => ({ t: s.times[i], main: n0(r(i).kn), sub: compass(r(i).dir), dir: r(i).dir, score: s.score[i] }));
    const mx = idx.reduce((a, i) => ((r(i).kn ?? -1) > (r(a)?.kn ?? -1) ? i : a), idx[0]);
    const g = Math.max(...idx.map((i) => r(i).gust ?? 0));
    if (mx !== undefined) head = `max ${n0(r(mx).kn)} nd ${compass(r(mx).dir)} · raf. ${n0(g)}`;
  } else if (s.discipline === 'surf') {
    cells = idx.map((i) => ({ t: s.times[i], main: n1(r(i).hb), sub: n0(r(i).tp), dir: r(i).dir, score: s.score[i] }));
    const mx = idx.reduce((a, i) => ((r(i).hb ?? -1) > (r(a)?.hb ?? -1) ? i : a), idx[0]);
    if (mx !== undefined) head = `max ${n1(r(mx).hb)} m · ${n0(r(mx).tp)} s · houle de ${compass(r(mx).dir)}`;
  } else {
    cells = idx.map((i) => ({ t: s.times[i], main: n0(r(i).kn), sub: r(i).bumpH === null ? '—' : n1(r(i).bumpH), dir: r(i).from, score: s.score[i] }));
    const mx = idx.reduce((a, i) => ((r(i).kn ?? -1) > (r(a)?.kn ?? -1) ? i : a), idx[0]);
    const hb = Math.max(...idx.map((i) => r(i).bumpH ?? 0)), tb = Math.max(...idx.map((i) => r(i).bumpT ?? 0));
    if (mx !== undefined) head = `max ${n0(r(mx).kn)} nd ${compass(r(mx).from)} · houle ${n1(hb)} m · ${n0(tb)} s`;
  }
  return { cells, head };
}

const chipColors = (sc: number | null) =>
  sc === null ? { background: 'var(--c-surface-2)', color: 'var(--c-ink-3)' }
  : sc >= 8.5 ? { background: '#1D6B46', color: '#fff' } : sc >= 7 ? { background: '#3E9A6B', color: '#fff' }
  : sc >= 5 ? { background: '#E3B65A', color: '#2A1E00' } : { background: 'var(--c-surface-2)', color: 'var(--c-ink-2)' };

function Arrow({ from }: { from: number | null }) {
  if (from === null) return <span class="arrow" />;
  // flèche dans le sens où va le vent / la houle (direction d'origine + 180°)
  return <svg class="arrow" viewBox="0 0 12 12" aria-hidden="true" style={{ transform: `rotate(${from + 180}deg)` }}><path d="M6 1 L9.5 9 L6 7.2 L2.5 9 Z" fill="currentColor" /></svg>;
}

export function DayChart({ d, spot, dayT, level, window, title }: { d: AllData; spot: PublicSpot; dayT: number; level: Level; window?: [number, number]; title?: string }) {
  const s = useMemo(() => seriesFor(d, spot, spotDiscipline(spot), level), [d, spot, level]);
  if (!s) return null;
  const { cells, head } = dayCells(s, dayKey(dayT));
  if (!cells.length) return <span class="faint">Pas de prévision ce jour-là.</span>;
  const unit = s.discipline === 'surf' ? 'm' : 'nd';
  const legend = s.discipline === 'wing' ? 'vent (nd) · flèche : sens du vent · heure'
    : s.discipline === 'surf' ? 'vagues (m) · flèche : sens de la houle · période (s) · heure' : 'vent (nd) · flèche : sens du vent · houle (m) · heure';
  return (
    <div class="daychart" role="img" aria-label={`${title ?? spot.name}, ${dayLabel(dayT)} : ${head}`}>
      <div class="row between"><span class="small"><strong>{title ?? dayLabel(dayT)}</strong></span><span class="faint">{head}</span></div>
      <div class="chips">
        {cells.map((c) => {
          const inWin = window && c.t >= window[0] && c.t < window[1];
          return (
            <div key={c.t} class={`chipcol${inWin ? ' on' : ''}`} title={`${hh(c.t)} : ${c.main} ${unit} · ${c.sub} · note ${n1(c.score)}`}>
              <span class="chip-v" style={chipColors(c.score)}>{c.main}</span>
              <Arrow from={c.dir} />
              <span class="chip-s">{s.discipline === 'wing' ? '' : c.sub}</span>
              <span class="chip-h">{hourOf(c.t)}</span>
            </div>
          );
        })}
      </div>
      <span class="chip-legend">{legend}</span>
    </div>
  );
}

// ------------------------------------------------------------ PRÉVISION : grille spots × 5 jours
const shortName = (s: PublicSpot) => s.name.replace(/\s*\(.*\)/, '').replace('Port Camargue / Espiguette', 'Espiguette').replace('La Grande-Motte', 'G-Motte').replace(/^Plage Sud/, 'P. Sud').replace(/→ La Grande-Motte$/, '→ G-Motte');

function Prevision({ d, now, disc, spots, L, query }: { d: AllData; now: number; disc: Discipline; spots: PublicSpot[]; L: Level; query: URLSearchParams }) {
  const prefs = usePrefs();
  const days = useMemo(() => [0, 1, 2, 3, 4].map((k) => now + k * 86400e3), [Math.floor(now / 3600e3)]);
  const series = useMemo(() => Object.fromEntries(spots.map((s) => [s.id, seriesFor(d, s, disc, L)])), [d, spots, disc, L]);
  // case ouverte gardée dans l'adresse : en revenant d'une fiche spot, on retrouve la grille telle qu'on l'a laissée
  const initial = (() => { const [sp, dt] = (query.get('sel') ?? '').split(','); return sp && Number(dt) ? { spot: sp, day: Number(dt) } : null; })();
  const [sel, setSelState] = useState<{ spot: string; day: number } | null>(initial);
  const setSel = (v: { spot: string; day: number } | null) => {
    setSelState(v);
    const base = location.hash.split('?')[0];
    history.replaceState(history.state, '', v ? `${base}?sel=${v.spot},${v.day}` : base);
  };
  const sess = upcoming(d, now).filter((s) => s.discipline === disc && matches(s, prefs));
  const cell = (sp: PublicSpot, dayT: number) => {
    const k = dayKey(dayT);
    const ss = sess.filter((s) => s.spot === sp.id && dayKey(s.start) === k);
    if (ss.length) return { session: true, hours: ss.reduce((a, s) => a + s.hours, 0), peak: Math.max(...ss.map((s) => s.peak)), text: '' };
    const s = series[sp.id];
    if (!s) return { session: false, hours: 0, peak: null, text: '—' };
    const idx = s.times.map((_, i) => i).filter((i) => dayKey(s.times[i]) === k && s.day[i]);
    const v = (i: number) => (disc === 'surf' ? s.rows[i].hb : s.rows[i].kn) ?? 0;
    return { session: false, hours: 0, peak: null, text: idx.length ? (disc === 'surf' ? n1(Math.max(...idx.map(v))) : n0(Math.max(...idx.map(v)))) : '—' };
  };
  const selSpot = sel ? spots.find((s) => s.id === sel.spot) : null;
  return (
    <Section title="Prévision 5 jours">
      <p class="faint">Case colorée = session 2H (nombre d’heures, couleur = note) ; sinon {disc === 'surf' ? 'hauteur max des vagues (m)' : 'vent max de la journée (nd)'}. Touche une case pour le détail.</p>
      <div class="card table-wrap">
        <table class="grid5">
          <thead><tr><th />{spots.map((s) => <th key={s.id} title={s.name}><strong>{shortName(s)}</strong></th>)}</tr></thead>
          <tbody>
            {days.map((dayT, k) => (
              <tr key={dayT}>
                <th scope="row">{k === 0 ? 'Auj.' : dayShort(dayT).replace('.', '')}</th>
                {spots.map((sp) => {
                  const c = cell(sp, dayT);
                  const on = sel?.spot === sp.id && sel?.day === dayT;
                  return (
                    <td key={sp.id}>
                      <button type="button" class={`cell${c.session ? ' s' : ''}${on ? ' sel' : ''}`} style={c.session ? chipColors(c.peak) : undefined}
                        aria-pressed={on} aria-label={`${sp.name}, ${dayLabel(dayT, now)} : ${c.session ? `session de ${c.hours} h, note max ${n1(c.peak)}` : c.text}`}
                        onClick={() => setSel(on ? null : { spot: sp.id, day: dayT })}>
                        {c.session ? `${c.hours}h` : c.text}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sel && selSpot && (
        <div class="card stack">
          <div class="row between"><strong>{selSpot.name}</strong><a href={`#/spot/${selSpot.id}`} class="small">Fiche complète →</a></div>
          <DayChart d={d} spot={selSpot} dayT={sel.day} level={L} title={dayLabel(sel.day, now)}
            window={(() => { const s = sess.find((x) => x.spot === sel.spot && dayKey(x.start) === dayKey(sel.day)); return s ? [s.start, s.end] as [number, number] : undefined; })()} />
          {sess.filter((x) => x.spot === sel.spot && dayKey(x.start) === dayKey(sel.day)).map((x) => (
            <div key={x.id} class="row between"><span class="small">{hh(x.start)} – {hh(x.end)} · {x.text}{x.why ? ` · Commentaire : ${x.why}` : ''}</span><Badge score={x.peak} envoie={x.envoie} /></div>
          ))}
        </div>
      )}
    </Section>
  );
}

// ------------------------------------------------------------ sessions avec leur graphique
function SessionCard({ d, s, now, L, big }: { d: AllData; s: Session; now: number; L: Level; big?: boolean }) {
  const spot = d.spots.find((x) => x.id === s.spot)!;
  return (
    <div class="stack" style={{ gap: 'var(--s-2)' }}>
      <a href={`#/spot/${s.spot}`} class="row between" style={{ textDecoration: 'none', color: 'inherit' }}>
        <span class={big ? 'big' : ''}><strong>{s.spotName}</strong></span><Badge score={s.peak} envoie={s.envoie} size={big ? 'lg' : undefined} />
      </a>
      <span class="muted small">{big ? span(s.start, s.end, now) : `${hh(s.start)} – ${hh(s.end)}`} · {s.hours} h · {s.text}</span>
      <DayChart d={d} spot={spot} dayT={s.start} level={L} window={[s.start, s.end]} title={big ? undefined : ' '} />
      {s.why && <span class="faint">Commentaire : {s.why}</span>}
    </div>
  );
}

// ------------------------------------------------------------ module
export function Module({ d, now, disc, sub, query }: { d: AllData; now: number; disc: Discipline; sub: Sub; query: URLSearchParams }) {
  const prefs = usePrefs();
  const m = moduleOf(disc);
  const L = levelFor(prefs, disc);
  const [onlyFav, setOnlyFav] = useState(false);
  const spots = d.spots.filter((s) => spotDiscipline(s) === disc);
  const live = useLive(disc === 'wing' ? spots.map((s) => s.id) : []);
  const best = useMemo(() => bestScoreBySpot(d, prefs, now), [d, prefs, now]);
  const all = upcoming(d, now).filter((s) => s.discipline === disc && matches(s, prefs));
  const top = d.sessions.best[L]?.[disc] ?? null;
  const others = all.filter((s) => s.id !== top?.id).sort((a, b) => b.mean - a.mean).slice(0, 3);
  const near = new Set(spots.filter((s) => distanceKm(s) <= HOME.radiusKm).map((s) => s.id));
  const far = spots.filter((s) => !near.has(s.id));
  const list = all.filter((s) => near.has(s.spot) && (!onlyFav || prefs.favorites.includes(s.spot)));
  const byDay = new Map<string, Session[]>();
  list.forEach((s) => { const k = dayKey(s.start); if (!byDay.has(k)) byDay.set(k, []); byDay.get(k)!.push(s); });
  const meta = d.meta.disciplines[disc];

  let body;
  if (sub === 'sessions') body = (
    <Section title={`Sessions de 2H (Localisation ${HOME.name})`} aside={<Seg label="Spots" value={onlyFav ? 'fav' : 'all'} onChange={(v) => setOnlyFav(v === 'fav')} options={[['all', 'Tous'], ['fav', 'Favoris']]} />}>
      <p class="faint">Spots à moins de {HOME.radiusKm} km de {HOME.name}{far.length ? ` (hors ${far.map((s) => s.name.replace(/\s*\(.*\)/, '')).join(', ')} : trop loin pour 2 h ; voir Prévision)` : ''}.{disc === 'wing' ? ' « Ça envoie » = au moins 4 h à plus de 20 nd.' : ''}</p>
      {byDay.size === 0 && <div class="card empty">Aucune session en vue{onlyFav ? ' sur tes favoris' : ''}.</div>}
      {[...byDay.values()].map((arr) => (
        <div key={arr[0].id} class="stack">
          <h3>{dayLabel(arr[0].start, now)}</h3>
          <div class="card"><div class="list">{arr.map((s) => <SessionCard key={s.id} d={d} s={s} now={now} L={L} />)}</div></div>
        </div>
      ))}
    </Section>
  );
  else if (sub === 'prevision') body = <Prevision d={d} now={now} disc={disc} spots={spots} L={L} query={query} />;
  else if (sub === 'spots') body = (
    <Section title="Spots">
      <SpotMap spots={spots} best={best} />
      <div class="card"><div class="list">
        {spots.map((s) => (
          <a key={s.id} class="session compact" href={`#/spot/${s.id}`}>
            <div class="stack" style={{ gap: '2px' }}><strong>{s.name}</strong><span class="faint">{s.waterBody === 'lagoon' ? 'étang' : DISC_LABEL[disc]}{s.orientation?.confidence === 'low' ? ' · orientation à confirmer' : ''}</span></div>
            <div class="row"><Badge score={best[s.id] ?? null} /><Fav id={s.id} name={s.name} /></div>
          </a>
        ))}
      </div></div>
    </Section>
  );
  else body = (
    <Section title="Meilleure session à venir">
      <div class="card">{top ? <SessionCard d={d} s={top} now={now} L={L} big /> : <span class="muted">Pas de session 2H dans les prochains jours.</span>}</div>
      {others.length > 0 && <>
        <h3>Autres bonnes sessions</h3>
        <div class="card"><div class="list">{others.map((s) => <div key={s.id} class="stack"><span class="faint">{dayLabel(s.start, now)}</span><SessionCard d={d} s={s} now={now} L={L} /></div>)}</div></div>
      </>}
    </Section>
  );

  return (
    <>
      <header class="page-head">
        <span class="eyebrow">{m.tab} · {DISC_LABEL[disc]}</span>
        <h1>{m.title}</h1>
        <span class="muted">{m.sub}</span>
        <div class="row between"><Freshness d={d} now={now} />
          {disc !== 'surf' && <Seg<Level> label={disc === 'wing' ? 'Mode' : `Niveau ${DISC_LABEL[disc]}`} value={L} onChange={(v) => setPrefs((p) => ({ ...p, levels: { ...p.levels, [disc]: v } }))} options={LEVELS_FOR[disc].map((l) => [l, LEVEL_LABEL[l]] as [Level, string])} />}
        </div>
      </header>
      <div class="module">
        <nav class="subnav" aria-label={`Modules ${m.tab}`}>
          {SUBS.map((x) => <a key={x.id} href={`#/${m.slug}/${x.id}`} aria-current={sub === x.id ? 'page' : undefined}>{x.label}</a>)}
        </nav>
        <div class="module-body">
          {!meta.available && <div class="notice warn">Prévision indisponible pour cette mise à jour : {meta.note || meta.source}</div>}
          <LiveBox live={live.live} />
          {body}
          <p class="faint">Session 2H = au moins 2 h d’affilée à 5/10 ou plus, de jour. Source : {meta.source}.</p>
        </div>
      </div>
    </>
  );
}
