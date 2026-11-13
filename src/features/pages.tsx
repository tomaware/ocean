import { useMemo, useState } from 'preact/hooks';
import { Camera, ChevronLeft, ExternalLink, Info, LayoutGrid, MessageSquare, Radio, ShieldCheck, TriangleAlert } from 'lucide-preact';
import type { AllData, Discipline, Level, PublicSpot, Session } from '../services/data';
import { DISC_LABEL, LEVEL_LABEL, LEVELS_FOR, spotDiscipline } from '../services/data';
import { ago, compass, dayKey, dayLabel, hh, hourOf, labelOf, msToKn, n0, n1, span } from '../services/format';
import { setPrefs, usePrefs, type Reading } from '../services/prefs';
import { publicLive, useHisto, useLive, type Histo, type Live } from '../services/perso';
import { monthStats } from '../services/stats';
import { hourSlots } from './hourslots';
import { goBack } from '../services/nav';
import { EDITEURS, webcamsCherchees, webcamsOf } from '../services/webcams';
import { Badge, DiscIcon, Fav, Section, Seg, SessionRow, SportSeg } from '../components/ui';
import { discName } from '../services/sport';
import { Chart } from '../components/Chart';
import { CondCards, Criteria, DayTabs, daysOf, MapCompass, NoteCard } from '../components/Today';
import { seriesFor } from './series';
import { availableSubs, moveSub, shownSubIds, SUB_LABEL, toggleSub, type SubId } from '../services/layout';
import { headFor, ModelsTable, ModuleView, pickHours } from '../components/Views';

export const levelFor = (prefs: ReturnType<typeof usePrefs>, d: Discipline): Level => prefs.levels[d];
export const matches = (s: Session, prefs: ReturnType<typeof usePrefs>) => s.level === 'tous' || s.level === levelFor(prefs, s.discipline);
export const upcoming = (d: AllData, now: number) => d.sessions.sessions.filter((s) => s.end > now);

export function bestScoreBySpot(d: AllData, prefs: ReturnType<typeof usePrefs>, now: number): Record<string, number | null> {
  const out: Record<string, number | null> = {};
  for (const s of upcoming(d, now)) if (matches(s, prefs)) out[s.spot] = Math.max(out[s.spot] ?? 0, s.peak);
  return out;
}

export function Freshness({ d, now }: { d: AllData; now: number }) {
  const age = (now - d.meta.generatedAt) / 3600e3;
  const failed = d.meta.sources.filter((s) => !s.ok);
  return (
    <div class="row">
      <span class={`chip${age > 3 ? ' warn' : ''}`}>Mis à jour {ago(d.meta.generatedAt, now)}</span>
      {failed.length > 0 && <span class="chip warn"><TriangleAlert size={12} /> {failed.length} source(s) en panne</span>}
    </div>
  );
}

/** Couleur du vent mesuré, mêmes couleurs que les étoiles et que les widgets : vert dès 15 nd, orange dès 20, violet dès 25 ;
 *  en wing, rouge « Kite » au-delà de 28 nd (D-49). Repère de lecture seulement : ce n'est pas une note. */
export function liveTone(kn: number | null | undefined, sport: 'wing' | 'kite'): string {
  if (kn == null) return '';
  if (sport === 'wing' && kn > 28) return 'kite';
  return kn >= 25 ? 'k3' : kn >= 20 ? 'k2' : kn >= 15 ? 'k1' : '';
}
export function LiveBox({ live, spot, names, histo }: { live: Live[] | null; spot?: string; names?: Record<string, string>; histo?: Histo | null }) {
  const prefs = usePrefs();
  const [open, setOpen] = useState<string | null>(spot ?? null);
  // la balise Winds-Up (mode perso) passe avant la mesure publique du même spot (Le Jaï : METAR de Marignane)
  const all = (live ?? []).filter((l) => !spot || l.spot === spot);
  const rows = all.filter((l) => !l.src || !all.some((x) => !x.src && x.spot === l.spot));
  if (!rows.length) return null;
  const perso = rows.some((l) => !l.src);
  return (
    <div class="card" style={{ borderColor: 'var(--c-accent)' }}>
      <div class="row"><Radio size={16} color="var(--c-accent)" /><strong>En direct</strong>{perso && <span class="chip accent">mode perso · visible sur cet appareil seulement</span>}</div>
      <div class="list">
        {rows.map((l) => {
          // noms de l'app (Plage Sud, Hyères…) plutôt que ceux de Winds-Up
          const name = names?.[l.spot] ?? l.name, can = !l.src && !l.panne, on = can && open === l.spot;
          const line = (
            <>
              <span class="stack" style={{ gap: 0 }}><span>{name}</span>{l.src && <span class="faint">{l.src}</span>}</span>
              {l.panne ? <span class="small">anémomètre en panne</span> : (
                <span class="row small" style={{ gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <strong class={`livekn ${liveTone(l.kn, prefs.sport)}`}>{n0(l.kn)} nd {l.dir ?? ''}{liveTone(l.kn, prefs.sport) === 'kite' ? ' · Kite' : ''}</strong>
                  {l.gust != null && <strong>raf. {n0(l.gust)}</strong>}
                  {l.t && <span class="faint">{ago(l.t)}</span>}
                </span>
              )}
            </>
          );
          return (
            <div key={l.spot + (l.src ?? '')} class="stack" style={{ gap: '8px' }}>
              {can ? <button type="button" class="row between liverow" aria-expanded={on} onClick={() => setOpen(on ? null : l.spot)}>{line}</button>
                : <div class="row between">{line}</div>}
              {on && <DayReadings l={l} h={histo?.spots[l.spot] ?? null} sport={prefs.sport} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DayReadings({ l, h, sport }: { l: Live; h: Histo['spots'][string] | null; sport: 'wing' | 'kite' }) {
  const slots = hourSlots(h?.jour ?? [], l.pts ?? [], Date.now());
  if (!slots.length) return <span class="faint small">Pas encore de relevé aujourd’hui.</span>;
  const max = Math.max(20, ...slots.map((p) => p.g ?? p.v));
  return (
    <div class="dayread" role="table" aria-label={`Relevés d’aujourd’hui à ${l.name}, heure par heure`}>
      <div class="bars" role="row">
        {slots.map((p) => (
          <div key={p.t} class={`bar${p.live ? ' fine' : ''}`} role="cell" title={`${hourOf(p.t)} h : ${n0(p.v)} nd${p.g ? `, rafales ${n0(p.g)}` : ''}${p.d ? ` ${p.d}` : ''}`}>
            <span class="v">{n0(p.v)}</span>
            <span class={`col livekn ${liveTone(p.v, sport)}`} style={{ height: `${Math.max(6, (p.v / max) * 64)}px` }} />
            <span class="d">{p.d ?? ''}</span>
            <span class="d">{p.g ? `raf ${n0(p.g)}` : ''}</span>
            <span class="t">{hourOf(p.t)}h</span>
          </div>
        ))}
      </div>
      <span class="faint small">Moyenne de chaque heure (± 30 min){slots.some((p) => p.live) ? ' ; teinte plus claire : heures récentes calculées sur les relevés en direct' : ''}.</span>
    </div>
  );
}

/** Stats des spots (mode perso) : jours du mois avec au moins une heure de jour à 15 nd ou plus. */
export function SpotStats({ histo, absent, spots }: { histo: Histo | null; absent: boolean; spots: { id: string; name: string }[] }) {
  if (absent) return <div class="card faint small">Stats des spots : ajoute l’historique au script de la super prévision (fichier « historique.gs », une fois) pour les voir ici.</div>;
  if (!histo) return null;
  const rows = spots.filter((s) => histo.spots[s.id]?.jours.length);
  if (!rows.length) return null;
  const now = Date.now(), cols = monthStats(histo.spots[rows[0].id].jours, now).map((m) => m.label);
  return (
    <div class="card stack">
      <div class="row"><strong>Stats des spots</strong><span class="chip accent">mode perso</span></div>
      <table class="stats">
        <thead><tr><th scope="col">Spot</th>{cols.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
        <tbody>{rows.map((s) => (
          <tr key={s.id}><th scope="row">{s.name}</th>{monthStats(histo.spots[s.id].jours, now).map((m) => (
            <td key={m.label}>{m.measured ? <><strong>{m.days} j</strong> <span class="faint">/ {m.measured}</span></> : <span class="faint">—</span>}</td>
          ))}</tr>
        ))}</tbody>
      </table>
      <span class="faint small">Jours avec au moins une heure à {histo.seuil} nd de moyenne ou plus entre {histo.heures[0]} h et {histo.heures[1]} h, sur les jours relevés par la balise (Winds-Up).</span>
    </div>
  );
}

// Webcams du spot (D-47) : on renvoie chez l'éditeur, qui détient les droits — pas de vidéo rediffusée ici.
export function Webcams({ id }: { id: string }) {
  if (!webcamsCherchees(id)) return null;
  const cams = webcamsOf(id);
  return (
    <div class="card">
      <div class="row"><Camera size={16} color="var(--c-accent)" aria-hidden="true" /><h3 style={{ fontSize: 'inherit', fontWeight: 700 }}>Webcams</h3></div>
      {!cams.length ? <span class="faint">Pas de webcam publique connue sur ce spot.</span> : (
        <>
          <div class="list">
            {cams.map((c) => (
              <a key={c.url} class="webcam" href={c.url} target="_blank" rel="noopener noreferrer">
                <span class="stack" style={{ gap: '2px', flex: 1, minWidth: 0 }}>
                  <span>{c.titre}</span>
                  <span class="faint">{c.type === 'video' ? 'vidéo en direct' : 'images'} · {EDITEURS[c.editeur]?.nom ?? c.editeur}{c.position === 'proche' ? ' · à côté du spot' : ''}</span>
                </span>
                <ExternalLink size={18} aria-label="ouvre la page de l’éditeur" />
              </a>
            ))}
          </div>
          <span class="faint small">La webcam s’ouvre chez son éditeur, qui en détient les droits.</span>
        </>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ Modules WIND / VAGUE / HOULE
export const MODULES: { slug: string; disc: Discipline; tab: string; title: string; sub: string }[] = [
  { slug: 'wind', disc: 'wing', tab: 'WIND', title: 'Où naviguer en wing ?', sub: 'Wing foil · vent corrigé par la super prévision, du Barcarès à Hyères' },
  { slug: 'vague', disc: 'surf', tab: 'VAGUE', title: 'Où surfer ?', sub: 'Surf · vagues à la côte, recalées sur les bouées, de Perafita à Carnon' },
  { slug: 'houle', disc: 'downwind', tab: 'HOULE', title: 'Quel downwind ?', sub: 'Downwind wing foil · vent + houle au large, Frontignan → Espiguette' },
];
export const moduleOf = (disc: Discipline) => MODULES.find((m) => m.disc === disc)!;

// ------------------------------------------------------------------ Prévisions (un spot)
export function SpotPage({ d, id, now, day }: { d: AllData; id: string; now: number; day?: string | null }) {
  const spot = d.spots.find((s) => s.id === id);
  if (!spot) return <div class="empty">Spot inconnu. <a href="#/wind">Retour</a></div>;
  return <SpotView key={spot.id + (day ?? '')} d={d} spot={spot} now={now} day={day ?? null} />;
}

function SpotView({ d, spot, now, day: dayParam }: { d: AllData; spot: PublicSpot; now: number; day: string | null }) {
  const prefs = usePrefs();
  const id = spot.id;
  const disc = spotDiscipline(spot);
  const level = levelFor(prefs, disc);
  const s = seriesFor(d, spot, disc, level);
  const live = useLive(disc === 'wing' ? [spot.id] : []);
  const histo = useHisto(disc === 'wing' && live.live?.length ? [spot.id] : []);
  const sessions = upcoming(d, now).filter((x) => x.spot === id && (x.level === 'tous' || x.level === level));
  const reading: Reading = disc !== 'wing' && prefs.reading === 'expert' ? 'detail' : prefs.reading;   // pas d'Expert pour VAGUE et HOULE
  const future = s ? s.rows.map((r, i) => ({ r, i })).filter(({ i }) => s.times[i] >= now - 3600e3) : [];
  const days = useMemo(() => (s ? daysOf(s, now) : []), [s, Math.floor(now / 3600e3)]);
  // « Fiche complète » depuis la Prévision : on ouvre directement le jour cliqué (?day=AAAA-MM-JJ)
  const [dayT, setDay] = useState<number | null>(() => days.find((t) => dayKey(t) === dayParam) ?? null);
  const day = dayT !== null && days.some((t) => dayKey(t) === dayKey(dayT)) ? dayT : days[0] ?? now;
  const best = sessions.length ? Math.max(...sessions.map((x) => x.peak)) : null;
  // heure survolée (souris) ou touchée : la carte, les cartes de conditions et les critères suivent cette heure
  const [picked, setPicked] = useState<number | null>(null);
  const pickT = (t: number | null) => setPicked(t === null || !s ? null : (() => { const k = s.times.indexOf(t); return k < 0 ? null : k; })());
  const pickedOnDay = picked !== null && s && dayKey(s.times[picked]) === dayKey(day) ? picked : null;
  return (
    <>
      <header class="page-head">
        <button type="button" class="back" onClick={() => goBack(`#/${moduleOf(disc).slug}`)}><ChevronLeft size={22} strokeWidth={2.8} aria-hidden="true" />Retour</button>
        <div class="row between">
          <div class="row"><h1>{spot.name}</h1><Fav id={spot.id} name={spot.name} /></div>
          <Freshness d={d} now={now} />
        </div>
        <span class="muted">{discName(disc, prefs.sport, DISC_LABEL[disc])}{spot.waterBody === 'lagoon' ? ' · étang' : ''}</span>
      </header>
      <div class="row between">
        {disc === 'wing' && <SportSeg />}
        {s?.levels && <Seg<Level> label={disc === 'wing' ? 'Mode' : 'Niveau de pratique'} value={level} onChange={(v) => setPrefs((p) => ({ ...p, levels: { ...p.levels, [disc]: v } }))} options={LEVELS_FOR[disc].map((l) => [l, LEVEL_LABEL[l]] as [Level, string])} />}
      </div>
      {disc === 'wing' && <LiveBox live={[...(live.live ?? []), ...publicLive(d.meteo?.obs, [spot])]} spot={spot.id} names={{ [spot.id]: spot.name }} histo={histo.histo} />}
      {disc === 'wing' && <SpotStats histo={histo.histo} absent={histo.absent} spots={[spot]} />}
      <Webcams id={spot.id} />
      {s?.notice && <div class="notice">{s.notice}</div>}
      {!s ? <div class="notice warn">Pas de prévision disponible pour ce spot dans la dernière mise à jour.</div> : (
        <>
          {days.length > 0 && <DayTabs s={s} days={days} value={day} now={now} onChange={(t) => { setDay(t); setPicked(null); }} />}
          <div class="today">
            <NoteCard s={s} dayT={day} now={now} sessions={sessions} level={level} picked={pickedOnDay} onPick={setPicked} />
            <CondCards d={d} spot={spot} s={s} dayT={day} now={now} picked={pickedOnDay} />
            <MapCompass d={d} spot={spot} s={s} dayT={day} now={now} best={best} picked={pickedOnDay} />
            <Criteria d={d} spot={spot} s={s} dayT={day} now={now} level={level} sessions={sessions} picked={pickedOnDay} />
          </div>
          <Section title={disc === 'surf' ? 'Vagues heure par heure' : disc === 'wing' ? 'Vent heure par heure' : 'Vent et houle heure par heure'}>
            <div class="card stack">
              {(() => {
                const picks = pickHours(s, { day });
                const ss = sessions.find((x) => dayKey(x.start) === dayKey(day));
                return <>
                  <span class="faint">{dayLabel(day, now)} : {headFor(s, picks)}</span>
                  <ModuleView d={d} spot={spot} s={s} picks={picks} window={ss ? [ss.start, ss.end] : undefined} picked={pickedOnDay === null ? null : s.times[pickedOnDay]} onPick={pickT} />
                </>;
              })()}
            </div>
          </Section>
          <Section title="Jour par jour" aside={<Seg<Reading> label="Niveau de lecture" value={reading} onChange={(v) => setPrefs((p) => ({ ...p, reading: v }))}
            options={disc === 'wing' ? [['synthese', 'Synthèse'], ['detail', 'Détail'], ['expert', 'Expert']] : [['synthese', 'Synthèse'], ['detail', 'Détail']]} />}>
            <div class="card stack">
              {(() => {
                // WIND, VAGUE, HOULE : le même tableau, toutes les 3 h sur 5 jours
                const picks = pickHours(s, { from: now, days: 5, hours: [7, 19], step: 3 });
                return <ModuleView d={d} spot={spot} s={s} picks={picks} showDays compact={disc === 'surf'} />;
              })()}
            </div>
          </Section>
          {reading !== 'synthese' && (
            <Section title="Détail heure par heure">
              <div class="card">
                <Chart title={`Note et conditions, ${spot.name}`} times={future.map(({ i }) => s.times[i])} score={future.map(({ i }) => s.score[i])} lines={s.lines.map((l) => ({ ...l, values: future.map(({ i }) => l.values[i]) }))} />
                <div class="table-wrap" style={{ maxHeight: '420px' }}>
                  <table>
                    <thead><tr><th>Heure</th>{s.cols.map((c) => <th key={c.key} class={c.num ? 'num' : ''}>{c.label}</th>)}</tr></thead>
                    <tbody>
                      {future.filter(({ i }) => s.day[i]).map(({ r, i }, k, arr) => (
                        <tr key={i} style={k > 0 && dayKey(s.times[arr[k - 1].i]) !== dayKey(s.times[i]) ? { borderTop: '2px solid var(--c-line)' } : undefined}>
                          <td>{k === 0 || dayKey(s.times[arr[k - 1].i]) !== dayKey(s.times[i]) ? <strong>{dayLabel(s.times[i], now).split(' ').slice(0, 2).join(' ')} · </strong> : null}{hh(s.times[i])}</td>
                          {s.cols.map((c) => <td key={c.key} class={c.num ? 'num' : ''} style={c.warn?.(r) ? { color: 'var(--c-warn)', fontWeight: 600 } : undefined}>{c.key === 'score' ? <span style={{ fontWeight: 700 }}>{c.fmt(r)}</span> : c.fmt(r)}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Section>
          )}
          {reading === 'expert' && disc === 'wing' && (
            <Section title="Les 7 modèles, avant correction">
              <div class="card"><ModelsTable d={d} spot={spot} s={s} from={now - 3600e3} /></div>
            </Section>
          )}
          {reading === 'expert' && (
            <Section title="Expert">
              <div class="card">
                <div class="list">
                  <div class="kv"><span class="muted">Source</span><span class="small">{s.source}</span></div>
                  {s.extra.map((x) => <div key={x.label} class="kv"><span class="muted">{x.label}</span><span class="small">{x.value}</span></div>)}
                  <div class="kv"><span class="muted">Mise à jour</span><span class="small">{new Date(d.meta.generatedAt).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}</span></div>
                </div>
                <a href="#/fiabilite" class="small">Fiabilité des modèles →</a>
              </div>
            </Section>
          )}
        </>
      )}
    </>
  );
}

// ------------------------------------------------------------------ Profil
/** Profil : modules d'un onglet, à cocher et à ranger (Tom, 13/11). */
function TabModules({ slug, tab, disc }: { slug: string; tab: string; disc: Discipline }) {
  const prefs = usePrefs();
  const avail = availableSubs(disc), layout = prefs.modules[slug];
  const shown = shownSubIds(avail, layout);
  const order = [...shown, ...avail.filter((x) => !shown.includes(x))];
  const set = (fn: (l: typeof layout) => typeof layout) => setPrefs((p) => ({ ...p, modules: { ...p.modules, [slug]: fn(p.modules[slug])! } }));
  const move = (id: SubId, dir: -1 | 1) => set((l) => moveSub(avail, l, id, dir));
  return (
    <div class="stack" style={{ gap: '6px' }}>
      <div class="row between"><strong>{tab}</strong><span class="faint small">{shown.length} / {avail.length} affichés</span></div>
      <ul class="modlist" aria-label={`Modules ${tab}`}>
        {order.map((id) => {
          const on = shown.includes(id), k = shown.indexOf(id);
          return (
            <li key={id} class={on ? '' : 'off'}>
              <label class="row" style={{ gap: '8px' }}><input type="checkbox" checked={on} disabled={on && shown.length === 1}
                onChange={() => set((l) => toggleSub(avail, l, id))} />{SUB_LABEL[id]}</label>
              {on && <span class="row" style={{ gap: '4px' }}>
                <button type="button" class="mv" aria-label={`Monter ${SUB_LABEL[id]} (${tab})`} disabled={k === 0} onClick={() => move(id, -1)}>↑</button>
                <button type="button" class="mv" aria-label={`Descendre ${SUB_LABEL[id]} (${tab})`} disabled={k === shown.length - 1} onClick={() => move(id, 1)}>↓</button>
              </span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Profile({ d }: { d: AllData }) {
  const prefs = usePrefs();
  const [url, setUrl] = useState(prefs.perso.url);
  const live = useLive(d.spots.filter((s) => s.disciplines.includes('wing')).map((s) => s.id));
  return (
    <>
      <header class="page-head"><h1>Profil</h1><span class="muted">Réglages gardés sur cet appareil (rien n’est envoyé).</span></header>
      <Section title="Mon niveau">
        <div class="card stack" style={{ gap: 'var(--s-4)' }}>
          {(['wing', 'downwind'] as Discipline[]).map((disc) => (
            <div key={disc} class="row between"><div class="row"><DiscIcon d={disc} /><span>{DISC_LABEL[disc]}</span></div>
              <Seg<Level> label={`Niveau ${DISC_LABEL[disc]}`} value={prefs.levels[disc]} onChange={(v) => setPrefs((p) => ({ ...p, levels: { ...p.levels, [disc]: v } }))} options={LEVELS_FOR[disc].map((l) => [l, LEVEL_LABEL[l]] as [Level, string])} /></div>
          ))}
          <p class="faint">Surf : la note tient déjà compte du niveau indiqué pour chaque spot.</p>
        </div>
      </Section>
      <Section title="Mes spots favoris">
        <div class="card">
          {prefs.favorites.length ? <div class="list">{prefs.favorites.map((id) => d.spots.find((s) => s.id === id)).filter(Boolean).map((s) => <div key={s!.id} class="row between"><a href={`#/spot/${s!.id}`}>{s!.name}</a><Fav id={s!.id} name={s!.name} /></div>)}</div>
            : <span class="muted">Ajoute des spots avec l’étoile, dans WIND, VAGUE ou HOULE.</span>}
        </div>
      </Section>
      <Section title="Modules affichés">
        <div class="card stack" style={{ gap: 'var(--s-4)' }}>
          <p class="faint">Pour chaque onglet, coche les modules à afficher et range-les dans l’ordre voulu. Le premier s’ouvre quand tu touches l’onglet. Un module reste toujours affiché.</p>
          {MODULES.map((m) => <TabModules key={m.slug} slug={m.slug} tab={m.tab} disc={m.disc} />)}
        </div>
      </Section>
      <Section title="Affichage">
        <div class="card row between"><span>Thème</span><Seg label="Thème" value={prefs.theme} onChange={(v) => setPrefs((p) => ({ ...p, theme: v }))} options={[['auto', 'Auto'], ['light', 'Clair'], ['dark', 'Sombre']]} /></div>
      </Section>
      <Section title="Mode perso">
        <div class="card stack" style={{ gap: 'var(--s-3)' }}>
          <p class="small">Avec ton lien privé de la super prévision, l’app affiche aussi les relevés Winds-Up en direct. Le lien reste dans ce navigateur ; les relevés ne s’affichent que sur cet appareil.</p>
          <label class="field"><span class="small">Lien de la super prévision (Apps Script)</span>
            <input type="url" inputMode="url" autoComplete="off" spellcheck={false} value={url} placeholder="https://script.google.com/macros/s/…/exec?key=…" onInput={(e) => setUrl((e.target as HTMLInputElement).value)} /></label>
          <div class="row">
            <button class="btn primary" type="button" onClick={() => setPrefs((p) => ({ ...p, perso: { enabled: !!url.trim(), url: url.trim() } }))}>Activer</button>
            {prefs.perso.enabled && <button class="btn" type="button" onClick={() => { setUrl(''); setPrefs((p) => ({ ...p, perso: { enabled: false, url: '' } })); }}>Désactiver et effacer</button>}
          </div>
          {prefs.perso.enabled && <span class={`chip${live.error ? ' warn' : ' accent'}`}>{live.error ? `Lien injoignable : ${live.error}` : live.live ? `${live.live.length} balise(s) en direct` : 'connexion…'}</span>}
        </div>
      </Section>
      <Section title="À propos">
        <div class="card stack">
          <a href="#/widgets" class="row"><LayoutGrid size={16} /> Installer les widgets (iPhone, Mac, Windows)</a>
          <a href="#/avis" class="row"><MessageSquare size={16} /> Donner un avis, signaler un bug</a>
          <a href="#/fiabilite" class="row"><ShieldCheck size={16} /> Fiabilité des prévisions et sources</a>
          <span class="faint">OCEAN · données : Open-Meteo (Météo-France, ECMWF, DWD, NOAA), Copernicus Marine Med-WAV (generated using E.U. Copernicus Marine Service Information), bouées Candhis – Cerema (licence Etalab), METAR (NOAA), super prévision vent. Fond de carte © OpenStreetMap.</span>
        </div>
      </Section>
    </>
  );
}

// ------------------------------------------------------------------ Fiabilité (③ remise en question)
export function Reliability({ d, now }: { d: AllData; now: number }) {
  const v = d.verify;
  const W = v?.meilleurs?.ventCourtTerme ?? {}, H = v?.meilleurs?.vaguesCourtTerme ?? {};
  const cal = v?.calibration?.surf ?? {};
  const prefs = usePrefs();
  if (!prefs.perso.enabled) return (
    <>
      <header class="page-head"><button type="button" class="back" onClick={() => goBack('#/profil')}><ChevronLeft size={22} strokeWidth={2.8} aria-hidden="true" />Retour</button><h1>Fiabilité</h1></header>
      <div class="notice">Page réservée au mode perso (Profil).</div>
    </>
  );
  return (
    <>
      <header class="page-head"><button type="button" class="back" onClick={() => goBack('#/profil')}><ChevronLeft size={22} strokeWidth={2.8} aria-hidden="true" />Retour</button><h1>Fiabilité</h1>
        <span class="muted">Chaque heure, les prévisions sont comparées aux mesures. Les modèles qui se trompent le moins pèsent le plus.</span><Freshness d={d} now={now} /></header>
      <div class="notice"><Info size={14} /> « 3 derniers jours » compare les modèles aux mesures récentes (très courte échéance). Les prévisions réellement émises 6 h, 24 h ou 48 h avant sont archivées et comparées au fil des jours ({v?.archive?.runs ?? 0} prévisions archivées).</div>
      <Section title="Vent : erreur moyenne par modèle (3 derniers jours)">
        <div class="card table-wrap"><table>
          <thead><tr><th>Station</th><th>Du plus juste au moins juste (nœuds d’erreur moyenne)</th></tr></thead>
          <tbody>{Object.entries<any[]>(W).map(([st, arr]) => <tr key={st}><td>{st}</td><td style={{ whiteSpace: 'normal' }}>{arr.map((x) => `${x.model.replace(/_/g, ' ')} ${n1(msToKn(x.mae))}`).join(' · ')}</td></tr>)}</tbody>
        </table></div>
      </Section>
      <Section title="Vagues : erreur moyenne par modèle (3 derniers jours)">
        <div class="card table-wrap"><table>
          <thead><tr><th>Bouée</th><th>Du plus juste au moins juste (m)</th></tr></thead>
          <tbody>{Object.entries<any[]>(H).map(([st, arr]) => <tr key={st}><td>{st}</td><td style={{ whiteSpace: 'normal' }}>{arr.map((x) => `${x.model.replace(/_/g, ' ')} ${n1(x.mae)}`).join(' · ')}</td></tr>)}</tbody>
        </table></div>
      </Section>
      <Section title="Ce que les moteurs en font">
        <div class="card stack">
          <p class="small">Surf et downwind : chaque modèle de vagues reçoit un poids et une correction apprise aux bouées Candhis, puis la dernière mesure recale les premières heures.</p>
          <div class="table-wrap"><table>
            <thead><tr><th>Bouée</th><th>Modèle</th><th class="num">Part dans la prévision</th><th class="num">Correction</th><th class="num">Erreur (m)</th><th class="num">Mesures</th></tr></thead>
            <tbody>{Object.entries<any>(cal).flatMap(([b, ms]) => {
              const tot = Object.values<any>(ms).reduce((a, x) => a + (x.w ?? 0), 0);
              return Object.entries<any>(ms).map(([m, x]) => <tr key={b + m}><td>{b}</td><td>{m.replace(/_/g, ' ')}</td>
                <td class="num">{x.w === null || !tot ? 'bouée côtière : contrôle seul' : `${Math.round((x.w / tot) * 100)} %`}</td><td class="num">{x.k === null ? '—' : `× ${n1(x.k)}`}</td><td class="num">{n1(x.mae)}</td><td class="num">{x.n}</td></tr>);
            })}</tbody>
          </table></div>
          <p class="small">Vent wing : la super prévision pondère 7 modèles par leur erreur aux balises et choisit chaque jour le meilleur système par spot. Downwind : {(v?.calibration?.windCorrection ?? []).map((c: any) => `${c.spot} × ${n1(c.ratioMoy)}`).join(', ') || 'pas de correction en ce moment'}.</p>
        </div>
      </Section>
      <Section title="État des sources">
        <div class="card"><div class="list">{d.meta.sources.map((s) => <div key={s.id} class="row between"><span>{s.id}</span><span class={`chip${s.ok ? '' : ' warn'}`}>{s.ok ? 'ok' : s.message}</span></div>)}</div></div>
      </Section>
      <Section title="Contrôles automatiques">
        <div class="card"><div class="list">{d.meta.checks.map((c) => <div key={c.id} class="stack" style={{ gap: '2px' }}><span class="row"><span class={`chip${c.ok ? ' accent' : ' warn'}`}>{c.ok ? 'ok' : 'à voir'}</span><strong class="small">{c.id}</strong></span><span class="faint">{c.detail}</span></div>)}</div></div>
      </Section>
      <p class="faint">Mesures : METAR (NOAA, domaine public), Candhis – Cerema (licence Etalab). Les relevés Winds-Up servent au recalage et ne sont jamais publiés.</p>
    </>
  );
}

export { labelOf, compass };
