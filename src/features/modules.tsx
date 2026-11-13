// Onglets WIND / VAGUE / HOULE : menu des modules à droite (Meilleure session, Sessions 2H, Prévision, Spots).
import { useMemo, useState } from 'preact/hooks';
import type { AllData, Discipline, Level, PublicSpot, Session } from '../services/data';
import { DISC_LABEL, distanceKm, HOME, LEVEL_LABEL, LEVELS_FOR, SESSION_SPOTS, SESSION_TOMORROW_ONLY, spotDiscipline } from '../services/data';
import { compass, dayKey, dayLabel, dayShort, hh, hourOf, n0, n1, span } from '../services/format';
import { setPrefs, usePrefs } from '../services/prefs';
import { publicLive, useHisto, useLive } from '../services/perso';
import { Badge, Fav, Section, Seg, SportSeg } from '../components/ui';
import { SpotMap } from '../components/SpotMap';
import { headFor, isKiteAt, ModuleView, pickHours, starsOf } from '../components/Views';
import { ScoreBars } from '../components/Today';
import { MapPlayer } from '../components/MapPlayer';
import { discName } from '../services/sport';
import { availableSubs, shownSubIds, SUB_IDS, SUB_LABEL, type SubId, type TabLayout } from '../services/layout';
import { seriesFor, type Series } from './series';
import { bestScoreBySpot, Freshness, levelFor, LiveBox, matches, SpotStats, moduleOf, upcoming } from './pages';

export const SUBS = SUB_IDS.map((id) => ({ id, label: SUB_LABEL[id] }));
export type Sub = SubId;
export const subsFor = (disc: Discipline) => availableSubs(disc).map((id) => SUBS.find((x) => x.id === id)!);
/** Modules affichés dans l'onglet, dans l'ordre choisi dans le Profil (Tom, 13/11) ; au moins un. */
export const shownSubs = (disc: Discipline, layout?: TabLayout | null) => shownSubIds(subsFor(disc).map((x) => x.id), layout).map((id) => SUBS.find((x) => x.id === id)!);

// ------------------------------------------------------------ vue d'une journée, propre à chaque onglet
export const chipColors = (sc: number | null) =>
  sc === null ? { background: 'var(--c-surface-2)', color: 'var(--c-ink-3)' }
  : sc >= 8.5 ? { background: 'var(--c-k3)', color: '#fff' } : sc >= 7 ? { background: 'var(--c-k2)', color: '#2A1400' }
  : sc >= 5 ? { background: 'var(--c-k1)', color: '#06281A' } : { background: 'var(--c-surface-2)', color: 'var(--c-ink-2)' };

export function DayChart({ d, spot, dayT, level, window, title }: { d: AllData; spot: PublicSpot; dayT: number; level: Level; window?: [number, number]; title?: string }) {
  const s = useMemo(() => seriesFor(d, spot, spotDiscipline(spot), level), [d, spot, level]);
  if (!s) return null;
  // WIND, VAGUE, HOULE : le même tableau, toutes les heures de 7 h à 21 h (harmonie demandée par Tom, 10/11 ; 21 h ajouté le 11/11)
  const picks = pickHours(s, { day: dayT });
  return (
    <div class="daychart">
      <div class="row between"><span class="small"><strong>{title ?? dayLabel(dayT)}</strong></span><span class="faint">{headFor(s, picks)}</span></div>
      <ModuleView d={d} spot={spot} s={s} picks={picks} window={window} />
    </div>
  );
}

// ------------------------------------------------------------ PRÉVISION : grille spots × 5 jours
/** Remplissage d'une case : violet (3 ★), orange (2 ★), vert (1 ★) en proportion des heures de jour, le reste vide. */
const fillOf = (n: number[], day: number, kh = 0) => {
  const p = (x: number) => Math.round((x / day) * 1000) / 10;
  const a = p(n[2]), b = a + p(n[1]), c = b + p(n[0]), e = c + p(kh);
  return `linear-gradient(to right, var(--c-k3) 0 ${a}%, var(--c-k2) ${a}% ${b}%, var(--c-k1) ${b}% ${c}%, var(--c-kite) ${c}% ${e}%, var(--c-surface-2) ${e}% 100%)`;
};
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
    // wing : heures « Kite session » (plus de 28 nd, D-49), jamais en étoiles, en rouge à part
    const sk = series[sp.id];
    const kh = sk ? sk.times.filter((t, i) => dayKey(t) === k && sk.day[i] && isKiteAt(sk, i)).length : 0;
    const dayN = sk ? sk.times.filter((t, i) => dayKey(t) === k && sk.day[i]).length : 1;
    if (ss.length) {
      // heures de jour à 1, 2, 3 étoiles (demande de Tom, 11/11 : la case se remplit selon les heures à chaque niveau)
      const s = series[sp.id];
      const idx = s ? s.times.map((_, i) => i).filter((i) => dayKey(s.times[i]) === k && s.day[i]) : [];
      const n = [1, 2, 3].map((st) => idx.filter((i) => !isKiteAt(s!, i) && starsOf(s!.score[i]) === st).length);
      const peak = Math.max(...ss.map((x) => x.peak)), top = starsOf(peak);
      return { session: true, hours: ss.reduce((a, x) => a + x.hours, 0), peak, text: '', n, day: Math.max(1, idx.length), top, kh };
    }
    // pas de session : case vide (demande de Tom, 10/11 : « autant rien mettre ») ; « — » seulement sans prévision
    const s = series[sp.id];
    const has = !!s && s.times.some((t) => dayKey(t) === k);   // nuit déjà tombée : case vide, pas « — »
    if (kh) return { session: false, hours: 0, peak: null, text: '', n: [0, 0, 0], day: Math.max(1, dayN), top: 0, kh };
    return { session: false, hours: 0, peak: null, text: has ? '' : '—', n: [0, 0, 0], day: 1, top: 0, kh: 0 };
  };
  const selSpot = sel ? spots.find((s) => s.id === sel.spot) : null;
  return (
    <Section title="Prévision 5 jours">
      <p class="faint">Chaque case se remplit selon les heures de jour à 1 ★ (vert), 2 ★ (orange) et 3 ★ (violet) ; touche une case pour le détail. Si ça rentre, appelle ton boss…</p>
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
                      <button type="button" class={`cell${c.session ? ' s' : c.kh ? ' kite' : ''}${on ? ' sel' : ''}`} style={c.session || c.kh ? { background: fillOf(c.n, c.day, c.kh) } : undefined}
                        aria-pressed={on} aria-label={`${sp.name}, ${dayLabel(dayT, now)} : ${c.session ? `${c.n[2] ? `${c.n[2]} h à 3 étoiles, ` : ''}${c.n[1] ? `${c.n[1]} h à 2 étoiles, ` : ''}${c.n[0]} h à 1 étoile${c.kh ? `, ${c.kh} h Kite session` : ''}` : c.kh ? `pas de session wing, ${c.kh} h Kite session (plus de 28 nœuds)` : c.text === '—' ? 'pas de prévision' : 'pas de session'}`}
                        onClick={() => setSel(on ? null : { spot: sp.id, day: dayT })}>
                        {c.session ? <span class="cell-l">{c.n[c.top - 1] || c.hours}h <span class={`stars sm k${c.top}`}><span class="on">{'★'.repeat(c.top)}</span></span></span> : c.kh ? <span class="cell-l">{c.kh}h <span class="stars sm kite"><span class="on">★</span><span class="kt">Kite</span></span></span> : c.text}
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
          <div class="row between"><strong>{selSpot.name}</strong><a href={`#/spot/${selSpot.id}?day=${dayKey(sel.day)}`} class="small">Fiche complète →</a></div>
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
  const kite = disc === 'wing' && prefs.sport === 'kite';
  const m = moduleOf(disc);
  const L = levelFor(prefs, disc);
  const [onlyFav, setOnlyFav] = useState(false);
  const spots = d.spots.filter((s) => spotDiscipline(s) === disc);
  const live = useLive(disc === 'wing' ? spots.map((s) => s.id) : []);
  const histo = useHisto(disc === 'wing' && live.live?.length ? spots.map((s) => s.id) : []);
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
      <p class="faint">{tomorrowOnly ? `Demain seulement, à ${spots.filter((s) => near.has(s.id)).map((s) => s.name.replace(/\s*\(.*\)/, '')).join(', ')} ; les autres jours et spots sont dans Prévision.` : 'Spots à moins de 30 min du taf. Si ça rentre, mets-toi en TT.'}</p>
      {byDay.size === 0 && <div class="card empty">Aucune session {tomorrowOnly ? 'demain' : 'en vue'}{onlyFav ? ' sur tes favoris' : ''}.</div>}
      {[...byDay.values()].map((arr) => (
        <div key={arr[0].id} class="stack">
          <h3>{dayLabel(arr[0].start, now)}</h3>
          <div class="card"><div class="list">{arr.map((s) => <SessionCard key={s.id} d={d} s={s} now={now} L={L} />)}</div></div>
        </div>
      ))}
    </Section>
  );
  else if (sub === 'direct' && disc === 'wing') body = (
    <div class="stack">
      <LiveBox live={[...(live.live ?? []), ...publicLive(d.meteo?.obs, spots)].sort((a, b) => spots.findIndex((s) => s.id === a.spot) - spots.findIndex((s) => s.id === b.spot))} names={Object.fromEntries(spots.map((s) => [s.id, s.name]))} histo={histo.histo} />
      <SpotStats histo={histo.histo} absent={histo.absent} spots={spots} />
      {!prefs.perso.enabled && <p class="faint">Les balises Winds-Up s’affichent en mode perso (Profil). Le Jaï : mesure publique de l’aéroport de Marignane, pour tous.</p>}
    </div>
  );
  else if (sub === 'prevision') body = <Prevision d={d} now={now} disc={disc} spots={spots} L={L} query={query} />;
  // Carte (Tom, 13/11) : vent et spots heure par heure sur 5 jours, façon Windy ; plus de liste de spots dessous
  else if (sub === 'spots') body = (
    <Section title="Carte">
      <MapPlayer d={d} spots={spots} disc={disc} L={L} now={now} />
    </Section>
  );
  // Favoris (Tom, 13/11) : meilleure session à venir sur les spots favoris de l'onglet
  else if (sub === 'favoris') {
    const favs = spots.filter((s) => prefs.favorites.includes(s.id));
    const fl = all.filter((s) => prefs.favorites.includes(s.spot));
    const rank = (s: Session) => s.peak * 0.4 + s.mean * 0.6 + Math.min(s.hours, 5) * 0.1;   // même classement que Meilleure session
    const ft = [...fl].sort((a, b) => rank(b) - rank(a));
    body = (
      <Section title="Meilleure session de tes favoris">
        {!favs.length ? <div class="card empty">Pas encore de favori dans cet onglet. Ajoute des spots avec l’étoile, sur leur fiche.</div> : <>
          <div class="card">{ft[0] ? <SessionCard d={d} s={ft[0]} now={now} L={L} big /> : <span class="muted">Pas de session 2H en vue sur {favs.map((s) => s.name.replace(/\s*\(.*\)/, '')).join(', ')}.</span>}</div>
          {ft.length > 1 && <>
            <h3>Autres sessions sur tes favoris</h3>
            <div class="card"><div class="list">{ft.slice(1, 5).map((s) => <div key={s.id} class="stack"><span class="faint">{dayLabel(s.start, now)}</span><SessionCard d={d} s={s} now={now} L={L} /></div>)}</div></div>
          </>}
          <p class="faint">Favoris : {favs.map((s) => s.name.replace(/\s*\(.*\)/, '')).join(', ')}.</p>
        </>}
      </Section>
    );
  }
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
        <span class="eyebrow">{m.tab} · {discName(disc, prefs.sport, DISC_LABEL[disc])}</span>
        <h1>{kite ? 'Où naviguer en kite ?' : m.title}</h1>
        <span class="muted">{kite ? m.sub.replace('Wing foil', 'Kitesurf') : m.sub}</span>
        <div class="row between"><Freshness d={d} now={now} />
          <div class="row" style={{ gap: '8px', flexWrap: 'wrap' }}>{disc === 'wing' && <SportSeg />}
          {disc !== 'surf' && <Seg<Level> label={disc === 'wing' ? 'Mode' : `Niveau ${DISC_LABEL[disc]}`} value={L} onChange={(v) => setPrefs((p) => ({ ...p, levels: { ...p.levels, [disc]: v } }))} options={LEVELS_FOR[disc].map((l) => [l, LEVEL_LABEL[l]] as [Level, string])} />}</div>
        </div>
      </header>
      <div class="module">
        <nav class="subnav" aria-label={`Modules ${m.tab}`}>
          {shownSubs(disc, prefs.modules[m.slug]).map((x) => <a key={x.id} href={`#/${m.slug}/${x.id}`} aria-current={sub === x.id ? 'page' : undefined}>{x.label}</a>)}
        </nav>
        <div class="module-body">
          {!meta.available && <div class="notice warn">Prévision indisponible pour cette mise à jour : {meta.note || meta.source}</div>}
          {body}
          {/* définition des sessions et source : retirées à la demande de Tom (13/11) */}
        </div>
      </div>
    </>
  );
}
