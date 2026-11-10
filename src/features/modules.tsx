// Onglets WIND / VAGUE / HOULE : menu des modules à droite (Meilleure session, Sessions 2H, Prévision, Spots).
import { useMemo, useState } from 'preact/hooks';
import type { AllData, Discipline, Level, PublicSpot, Session } from '../services/data';
import { DISC_LABEL, distanceKm, HOME, LEVEL_LABEL, LEVELS_FOR, SESSION_SPOTS, SESSION_TOMORROW_ONLY, spotDiscipline } from '../services/data';
import { compass, dayKey, dayLabel, dayShort, hh, hourOf, n0, n1, span } from '../services/format';
import { setPrefs, usePrefs } from '../services/prefs';
import { publicLive, useLive } from '../services/perso';
import { Badge, Fav, Section, Seg } from '../components/ui';
import { SpotMap } from '../components/SpotMap';
import { headFor, ModuleView, pickHours } from '../components/Views';
import { ScoreBars } from '../components/Today';
import { seriesFor, type Series } from './series';
import { bestScoreBySpot, Freshness, levelFor, LiveBox, matches, moduleOf, upcoming } from './pages';

export const SUBS = [
  { id: 'meilleure', label: 'Meilleure session' },
  { id: 'sessions', label: 'Sessions 2H' },
  { id: 'prevision', label: 'Prévision' },
  { id: 'spots', label: 'Spots' },
] as const;
export type Sub = (typeof SUBS)[number]['id'];

// ------------------------------------------------------------ vue d'une journée, propre à chaque onglet
export const chipColors = (sc: number | null) =>
  sc === null ? { background: 'var(--c-surface-2)', color: 'var(--c-ink-3)' }
  : sc >= 8.5 ? { background: 'var(--c-k3)', color: '#fff' } : sc >= 7 ? { background: 'var(--c-k2)', color: '#2A1400' }
  : sc >= 5 ? { background: 'var(--c-k1)', color: '#06281A' } : { background: 'var(--c-surface-2)', color: 'var(--c-ink-2)' };

export function DayChart({ d, spot, dayT, level, window, title }: { d: AllData; spot: PublicSpot; dayT: number; level: Level; window?: [number, number]; title?: string }) {
  const s = useMemo(() => seriesFor(d, spot, spotDiscipline(spot), level), [d, spot, level]);
  if (!s) return null;
  // WIND, VAGUE, HOULE : le même tableau, toutes les heures de 7 h à 20 h (harmonie demandée par Tom, 10/11)
  const picks = pickHours(s, { day: dayT });
  return (
    <div class="daychart">
      <div class="row between"><span class="small"><strong>{title ?? dayLabel(dayT)}</strong></span><span class="faint">{headFor(s, picks)}</span></div>
      <ModuleView d={d} spot={spot} s={s} picks={picks} window={window} />
    </div>
  );
}

// ------------------------------------------------------------ PRÉVISION : grille spots × 5 jours
const shortName = (s: PublicSpot) => s.name.replace(/\s*\(.*\)/, '').replace('Port Camargue / Espiguette', 'Espiguette').replace('Saintes-Maries-de-la-Mer', 'Stes-Maries').replace('La Grande-Motte', 'G-Motte').replace(/^Plage Sud/, 'P. Sud').replace(/→ La Grande-Motte$/, '→ G-Motte');

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
    // pas de session : case vide (demande de Tom, 10/11 : « autant rien mettre ») ; « — » seulement sans prévision
    const s = series[sp.id];
    const has = !!s && s.times.some((t) => dayKey(t) === k);   // nuit déjà tombée : case vide, pas « — »
    return { session: false, hours: 0, peak: null, text: has ? '' : '—' };
  };
  const selSpot = sel ? spots.find((s) => s.id === sel.spot) : null;
  return (
    <Section title="Prévision 5 jours">
      <p class="faint">Case colorée = session 2H (nombre d’heures ; couleur = étoiles : vert ★, orange ★★, violet ★★★). Case vide = pas de session ce jour-là. Touche une case pour le détail.</p>
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
                        aria-pressed={on} aria-label={`${sp.name}, ${dayLabel(dayT, now)} : ${c.session ? `session de ${c.hours} h, note max ${n1(c.peak)}` : c.text === '—' ? 'pas de prévision' : 'pas de session'}`}
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
      {big && (() => { const ser = seriesFor(d, spot, s.discipline, L); return ser ? <ScoreBars s={ser} dayT={s.start} now={now} /> : null; })()}
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
  const near = new Set(spots.filter((s) => (SESSION_SPOTS[disc] ? SESSION_SPOTS[disc]!.includes(s.id) : distanceKm(s) <= HOME.radiusKm)).map((s) => s.id));
  const far = spots.filter((s) => !near.has(s.id));
  const tomorrowOnly = SESSION_TOMORROW_ONLY.includes(disc);
  const list = all.filter((s) => near.has(s.spot) && (!onlyFav || prefs.favorites.includes(s.spot)) && (!tomorrowOnly || dayKey(s.start) === dayKey(now + 86400e3)));
  const byDay = new Map<string, Session[]>();
  list.forEach((s) => { const k = dayKey(s.start); if (!byDay.has(k)) byDay.set(k, []); byDay.get(k)!.push(s); });
  const meta = d.meta.disciplines[disc];

  let body;
  if (sub === 'sessions') body = (
    <Section title={`Sessions de 2H${tomorrowOnly ? ' demain' : ''} (Localisation ${HOME.name})`} aside={<Seg label="Spots" value={onlyFav ? 'fav' : 'all'} onChange={(v) => setOnlyFav(v === 'fav')} options={[['all', 'Tous'], ['fav', 'Favoris']]} />}>
      <p class="faint">{tomorrowOnly ? `Demain seulement, à ${spots.filter((s) => near.has(s.id)).map((s) => s.name.replace(/\s*\(.*\)/, '')).join(', ')} ; les autres jours et spots sont dans Prévision.` : <>Spots à moins de {HOME.radiusKm} km de {HOME.name}{far.length ? ` (hors ${far.map((s) => s.name.replace(/\s*\(.*\)/, '')).join(', ')} : trop loin pour 2 h ; voir Prévision)` : ''}.{disc === 'wing' ? ' « Ça envoie » = au moins 4 h à plus de 20 nd.' : ''}</>}</p>
      {byDay.size === 0 && <div class="card empty">Aucune session {tomorrowOnly ? 'demain' : 'en vue'}{onlyFav ? ' sur tes favoris' : ''}.</div>}
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
          <LiveBox live={disc === 'wing' ? [...(live.live ?? []), ...publicLive(d.meteo?.obs, spots)].sort((a, b) => spots.findIndex((s) => s.id === a.spot) - spots.findIndex((s) => s.id === b.spot)) : live.live} />
          {body}
          <p class="faint">Session 2H = au moins 2 h d’affilée à 5/10 ou plus, de jour. Source : {meta.source}.</p>
        </div>
      </div>
    </>
  );
}
