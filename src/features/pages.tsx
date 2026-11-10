import { useMemo, useState } from 'preact/hooks';
import { Info, Radio, ShieldCheck, TriangleAlert } from 'lucide-preact';
import type { AllData, Discipline, Level, PublicSpot, Session } from '../services/data';
import { DISC_LABEL, LEVEL_LABEL, LEVELS, spotDiscipline } from '../services/data';
import { ago, compass, dayKey, dayLabel, hh, hourOf, labelOf, msToKn, n0, n1, span } from '../services/format';
import { setPrefs, usePrefs, type Reading } from '../services/prefs';
import { useLive, type Live } from '../services/perso';
import { Badge, DiscIcon, Fav, Section, Seg, SessionRow } from '../components/ui';
import { Strip } from '../components/Strip';
import { Chart } from '../components/Chart';
import { SpotMap } from '../components/SpotMap';
import { seriesFor } from './series';

const DISCS: Discipline[] = ['wing', 'surf', 'downwind'];
const levelFor = (prefs: ReturnType<typeof usePrefs>, d: Discipline): Level => prefs.levels[d];
const matches = (s: Session, prefs: ReturnType<typeof usePrefs>) => s.level === 'tous' || s.level === levelFor(prefs, s.discipline);
const upcoming = (d: AllData, now: number) => d.sessions.sessions.filter((s) => s.end > now);

function bestScoreBySpot(d: AllData, prefs: ReturnType<typeof usePrefs>, now: number): Record<string, number | null> {
  const out: Record<string, number | null> = {};
  for (const s of upcoming(d, now)) if (matches(s, prefs)) out[s.spot] = Math.max(out[s.spot] ?? 0, s.peak);
  return out;
}

function Freshness({ d, now }: { d: AllData; now: number }) {
  const age = (now - d.meta.generatedAt) / 3600e3;
  const failed = d.meta.sources.filter((s) => !s.ok);
  return (
    <div class="row">
      <span class={`chip${age > 3 ? ' warn' : ''}`}>Mis à jour {ago(d.meta.generatedAt, now)}</span>
      {failed.length > 0 && <span class="chip warn"><TriangleAlert size={12} /> {failed.length} source(s) en panne</span>}
    </div>
  );
}

function LiveBox({ live, spot }: { live: Live[] | null; spot?: string }) {
  const rows = (live ?? []).filter((l) => !spot || l.spot === spot);
  if (!rows.length) return null;
  return (
    <div class="card" style={{ borderColor: 'var(--c-accent)' }}>
      <div class="row"><Radio size={16} color="var(--c-accent)" /><strong>En direct</strong><span class="chip accent">mode perso · visible sur cet appareil seulement</span></div>
      <div class="list">
        {rows.map((l) => (
          <div key={l.spot} class="row between">
            <span>{l.name}</span>
            <span class="small">{l.panne ? 'anémomètre en panne' : `${n0(l.kn)} nd ${l.dir ?? ''}${l.t ? ' · ' + ago(l.t) : ''}`}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Accueil
export function Home({ d, now }: { d: AllData; now: number }) {
  const prefs = usePrefs();
  const live = useLive(d.spots.filter((s) => s.disciplines.includes('wing')).map((s) => s.id));
  const favs = d.spots.filter((s) => prefs.favorites.includes(s.id));
  const next = upcoming(d, now).filter((s) => matches(s, prefs) && (!favs.length || prefs.favorites.includes(s.spot))).slice(0, 8);
  return (
    <>
      <header class="page-head">
        <span class="eyebrow">Golfe du Lion · Perpignan → Almanarre</span>
        <h1>Où et quand aller à l’eau ?</h1>
        <Freshness d={d} now={now} />
      </header>
      <LiveBox live={live.live} />
      <div class="grid cols-3">
        {DISCS.map((disc) => {
          const L = levelFor(prefs, disc);
          const best = d.sessions.best[L]?.[disc] ?? null;
          return (
            <a key={disc} class="card link" href={best ? `#/spot/${best.spot}` : `#/sessions?d=${disc}`}>
              <div class="row between"><div class="row"><DiscIcon d={disc} /><strong>{DISC_LABEL[disc]}</strong></div><span class="faint">{disc === 'surf' ? 'tous niveaux' : LEVEL_LABEL[L].toLowerCase()}</span></div>
              {best ? (
                <>
                  <div class="row between"><span class="big">{best.spotName}</span><Badge score={best.peak} size="lg" /></div>
                  <span class="muted">{span(best.start, best.end, now)}</span>
                  <span class="small">{best.text}</span>
                </>
              ) : <span class="muted">Pas de session 2H dans les prochains jours.</span>}
            </a>
          );
        })}
      </div>
      <Section title={favs.length ? 'Prochaines sessions sur tes spots' : 'Prochaines sessions'} aside={<a href="#/sessions" class="small">Tout voir</a>}>
        <div class="card">
          {next.length ? <div class="list">{next.map((s) => <SessionRow key={s.id} s={s} now={now} />)}</div> : <div class="empty">Rien de bon en vue pour l’instant.</div>}
        </div>
      </Section>
      <p class="faint">Une session = au moins 2 h d’affilée à 5/10 ou plus, de jour. Les notes ne se comparent pas d’une discipline à l’autre.</p>
    </>
  );
}

// ------------------------------------------------------------------ Spots
export function Spots({ d, now }: { d: AllData; now: number }) {
  const prefs = usePrefs();
  const [disc, setDisc] = useState<'all' | Discipline>('all');
  const best = useMemo(() => bestScoreBySpot(d, prefs, now), [d, prefs, now]);
  const list = d.spots.filter((s) => disc === 'all' || spotDiscipline(s) === disc);
  return (
    <>
      <header class="page-head"><h1>Spots</h1><span class="muted">{d.spots.length} spots et parcours, du Barcarès à Hyères.</span></header>
      <Seg label="Discipline" value={disc} onChange={setDisc} options={[['all', 'Tous'], ['wing', 'Wing'], ['surf', 'Surf'], ['downwind', 'Downwind']]} />
      <SpotMap spots={list} best={best} />
      <div class="card"><div class="list">
        {list.map((s) => (
          <a key={s.id} class="session" href={`#/spot/${s.id}`}>
            <DiscIcon d={spotDiscipline(s)} />
            <div class="stack" style={{ gap: '2px' }}><strong>{s.name}</strong><span class="faint">{DISC_LABEL[spotDiscipline(s)]}{s.waterBody === 'lagoon' ? ' · étang' : ''}</span></div>
            <div class="row"><Badge score={best[s.id] ?? null} /><Fav id={s.id} name={s.name} /></div>
          </a>
        ))}
      </div></div>
    </>
  );
}

// ------------------------------------------------------------------ Prévisions (un spot)
export function SpotPage({ d, id, now }: { d: AllData; id: string; now: number }) {
  const spot = d.spots.find((s) => s.id === id);
  if (!spot) return <div class="empty">Spot inconnu. <a href="#/spots">Voir la liste</a></div>;
  return <SpotView key={spot.id} d={d} spot={spot} now={now} />;
}

function SpotView({ d, spot, now }: { d: AllData; spot: PublicSpot; now: number }) {
  const prefs = usePrefs();
  const id = spot.id;
  const disc = spotDiscipline(spot);
  const level = levelFor(prefs, disc);
  const s = seriesFor(d, spot, disc, level);
  const live = useLive(disc === 'wing' ? [spot.id] : []);
  const sessions = upcoming(d, now).filter((x) => x.spot === id && (x.level === 'tous' || x.level === level));
  const reading = prefs.reading;
  const future = s ? s.rows.map((r, i) => ({ r, i })).filter(({ i }) => s.times[i] >= now - 3600e3) : [];
  const days = useMemo(() => {
    const m = new Map<string, number[]>();
    future.forEach(({ i }) => { const k = dayKey(s!.times[i]); if (!m.has(k)) m.set(k, []); m.get(k)!.push(i); });
    return [...m.values()].slice(0, 7);
  }, [s, now]);
  return (
    <>
      <header class="page-head">
        <a href="#/spots" class="small">← Spots</a>
        <div class="row between">
          <div class="row"><DiscIcon d={disc} size={20} /><h1>{spot.name}</h1><Fav id={spot.id} name={spot.name} /></div>
          <Freshness d={d} now={now} />
        </div>
        <span class="muted">{DISC_LABEL[disc]}{spot.waterBody === 'lagoon' ? ' · étang' : ''}</span>
      </header>
      <div class="row between">
        <Seg<Reading> label="Niveau de lecture" value={reading} onChange={(v) => setPrefs((p) => ({ ...p, reading: v }))} options={[['synthese', 'Synthèse'], ['detail', 'Détail'], ['expert', 'Expert']]} />
        {s?.levels && <Seg<Level> label="Niveau de pratique" value={level} onChange={(v) => setPrefs((p) => ({ ...p, levels: { ...p.levels, [disc]: v } }))} options={LEVELS.map((l) => [l, LEVEL_LABEL[l]] as [Level, string])} />}
      </div>
      {disc === 'wing' && <LiveBox live={live.live} spot={spot.id} />}
      {!s ? <div class="notice warn">Pas de prévision disponible pour ce spot dans la dernière mise à jour.</div> : (
        <>
          <Section title="Sessions 2H">
            <div class="card">{sessions.length ? <div class="list">{sessions.map((x) => <SessionRow key={x.id} s={x} now={now} showSpot={false} />)}</div> : <div class="empty">Pas de session 2H en vue{s.levels ? ` au niveau ${LEVEL_LABEL[level].toLowerCase()}` : ''}.</div>}</div>
          </Section>
          <Section title="Jour par jour">
            <div class="card days">
              {days.map((idx) => {
                const dayIdx = idx.filter((i) => s.day[i]);
                const top = Math.max(...dayIdx.map((i) => s.score[i] ?? 0), 0);
                return (
                  <div key={idx[0]} class="stack">
                    <div class="day-head"><strong>{dayLabel(s.times[idx[0]], now)}</strong><span class="row small">{dayIdx.length ? <>meilleure heure <Badge score={top} /></> : 'nuit'}</span></div>
                    <Strip label={`Notes heure par heure, ${dayLabel(s.times[idx[0]], now)}`} hours={idx.filter((i) => hourOf(s.times[i]) >= 6 && hourOf(s.times[i]) <= 21).map((i) => ({ t: s.times[i], s: s.score[i], day: s.day[i], title: s.cols.slice(0, 3).map((c) => c.fmt(s.rows[i])).join(' · ') }))} />
                  </div>
                );
              })}
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
                      {future.filter(({ i }) => s.day[i]).map(({ r, i }) => (
                        <tr key={i}>
                          <td>{hourOf(s.times[i]) === 6 || i === future[0].i ? <strong>{dayLabel(s.times[i], now).split(' ').slice(0, 2).join(' ')} </strong> : null}{hh(s.times[i])}</td>
                          {s.cols.map((c) => <td key={c.key} class={c.num ? 'num' : ''} style={c.warn?.(r) ? { color: 'var(--c-warn)', fontWeight: 600 } : undefined}>{c.key === 'score' ? <span style={{ fontWeight: 700 }}>{c.fmt(r)}</span> : c.fmt(r)}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Section>
          )}
          {reading === 'expert' && (
            <Section title="Expert">
              <div class="card">
                <div class="list">
                  <div class="row between"><span class="muted">Source</span><span class="small" style={{ textAlign: 'right', maxWidth: '70%' }}>{s.source}</span></div>
                  {s.extra.map((x) => <div key={x.label} class="row between"><span class="muted">{x.label}</span><span class="small" style={{ textAlign: 'right', maxWidth: '70%' }}>{x.value}</span></div>)}
                  <div class="row between"><span class="muted">Mise à jour</span><span class="small">{new Date(d.meta.generatedAt).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}</span></div>
                </div>
                <a href="#/fiabilite" class="small">Fiabilité des modèles →</a>
              </div>
            </Section>
          )}
          <SpotMap spots={[spot]} best={{ [spot.id]: sessions.length ? Math.max(...sessions.map((x) => x.peak)) : null }} focus={spot.id} height={260} />
        </>
      )}
    </>
  );
}

// ------------------------------------------------------------------ Prévisions (choix du spot)
export function Forecasts({ d, now }: { d: AllData; now: number }) {
  const prefs = usePrefs();
  const best = bestScoreBySpot(d, prefs, now);
  const groups = DISCS.map((disc) => ({ disc, spots: d.spots.filter((s) => spotDiscipline(s) === disc).sort((a, b) => (prefs.favorites.includes(b.id) ? 1 : 0) - (prefs.favorites.includes(a.id) ? 1 : 0)) }));
  return (
    <>
      <header class="page-head"><h1>Prévisions</h1><span class="muted">Choisis un spot : notes heure par heure, conditions, et le détail pour les experts.</span></header>
      <div class="grid cols-3">
        {groups.map((g) => (
          <div key={g.disc} class="card">
            <div class="row"><DiscIcon d={g.disc} /><strong>{DISC_LABEL[g.disc]}</strong></div>
            <div class="list">{g.spots.map((s) => <a key={s.id} href={`#/spot/${s.id}`} class="row between" style={{ textDecoration: 'none', color: 'inherit' }}><span>{s.name}</span><Badge score={best[s.id] ?? null} /></a>)}</div>
          </div>
        ))}
      </div>
    </>
  );
}

// ------------------------------------------------------------------ Sessions
export function Sessions({ d, now, query }: { d: AllData; now: number; query: URLSearchParams }) {
  const prefs = usePrefs();
  const [disc, setDisc] = useState<'all' | Discipline>((query.get('d') as Discipline) ?? 'all');
  const [onlyFav, setOnlyFav] = useState(false);
  const list = upcoming(d, now).filter((s) => matches(s, prefs) && (disc === 'all' || s.discipline === disc) && (!onlyFav || prefs.favorites.includes(s.spot)));
  const byDay = new Map<string, Session[]>();
  list.forEach((s) => { const k = dayKey(s.start); if (!byDay.has(k)) byDay.set(k, []); byDay.get(k)!.push(s); });
  return (
    <>
      <header class="page-head"><h1>Sessions 2H</h1><span class="muted">Au moins 2 h d’affilée à 5/10 ou plus, de jour, à ton niveau (réglable dans Profil).</span></header>
      <div class="row">
        <Seg label="Discipline" value={disc} onChange={setDisc} options={[['all', 'Toutes'], ['wing', 'Wing'], ['surf', 'Surf'], ['downwind', 'Downwind']]} />
        <Seg label="Spots" value={onlyFav ? 'fav' : 'all'} onChange={(v) => setOnlyFav(v === 'fav')} options={[['all', 'Tous les spots'], ['fav', 'Mes favoris']]} />
      </div>
      {byDay.size === 0 && <div class="card empty">Aucune session en vue avec ces filtres.</div>}
      {[...byDay.values()].map((arr) => (
        <Section key={arr[0].id} title={dayLabel(arr[0].start, now)}>
          <div class="card"><div class="list">{arr.map((s) => <SessionRow key={s.id} s={s} now={now} />)}</div></div>
        </Section>
      ))}
    </>
  );
}

// ------------------------------------------------------------------ Profil
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
              <Seg<Level> label={`Niveau ${DISC_LABEL[disc]}`} value={prefs.levels[disc]} onChange={(v) => setPrefs((p) => ({ ...p, levels: { ...p.levels, [disc]: v } }))} options={LEVELS.map((l) => [l, LEVEL_LABEL[l]] as [Level, string])} /></div>
          ))}
          <p class="faint">Surf : la note tient déjà compte du niveau indiqué pour chaque spot.</p>
        </div>
      </Section>
      <Section title="Mes spots favoris">
        <div class="card">
          {prefs.favorites.length ? <div class="list">{prefs.favorites.map((id) => d.spots.find((s) => s.id === id)).filter(Boolean).map((s) => <div key={s!.id} class="row between"><a href={`#/spot/${s!.id}`}>{s!.name}</a><Fav id={s!.id} name={s!.name} /></div>)}</div>
            : <span class="muted">Ajoute des spots avec l’étoile, sur la page Spots.</span>}
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
          <a href="#/fiabilite" class="row"><ShieldCheck size={16} /> Fiabilité des prévisions et sources</a>
          <span class="faint">OCEAN · données : Open-Meteo (Météo-France, ECMWF, DWD, NOAA), bouées Candhis – Cerema (licence Etalab), METAR (NOAA), super prévision vent. Fond de carte © OpenStreetMap.</span>
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
  return (
    <>
      <header class="page-head"><a href="#/profil" class="small">← Profil</a><h1>Fiabilité</h1>
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
            <thead><tr><th>Bouée</th><th>Modèle</th><th class="num">Poids</th><th class="num">Correction</th><th class="num">Erreur (m)</th><th class="num">Mesures</th></tr></thead>
            <tbody>{Object.entries<any>(cal).flatMap(([b, ms]) => Object.entries<any>(ms).map(([m, x]) => <tr key={b + m}><td>{b}</td><td>{m.replace(/_/g, ' ')}</td><td class="num">{n1(x.w)}</td><td class="num">× {x.k ?? '—'}</td><td class="num">{x.mae ?? '—'}</td><td class="num">{x.n}</td></tr>))}</tbody>
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
