import { useMemo, useState } from 'preact/hooks';
import { ChevronLeft, Info, Radio, ShieldCheck, TriangleAlert } from 'lucide-preact';
import type { AllData, Discipline, Level, PublicSpot, Session } from '../services/data';
import { DISC_LABEL, LEVEL_LABEL, LEVELS_FOR, spotDiscipline } from '../services/data';
import { ago, compass, dayKey, dayLabel, hh, hourOf, labelOf, msToKn, n0, n1, span } from '../services/format';
import { setPrefs, usePrefs, type Reading } from '../services/prefs';
import { useLive, type Live } from '../services/perso';
import { goBack } from '../services/nav';
import { Badge, DiscIcon, Fav, Section, Seg, SessionRow } from '../components/ui';
import { Chart } from '../components/Chart';
import { CondCards, Criteria, DayTabs, daysOf, MapCompass, NoteCard } from '../components/Today';
import { seriesFor } from './series';
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

export function LiveBox({ live, spot }: { live: Live[] | null; spot?: string }) {
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

// ------------------------------------------------------------------ Modules WIND / VAGUE / HOULE
export const MODULES: { slug: string; disc: Discipline; tab: string; title: string; sub: string }[] = [
  { slug: 'wind', disc: 'wing', tab: 'WIND', title: 'Où naviguer en wing ?', sub: 'Wing foil · vent corrigé par la super prévision, du Barcarès à Hyères' },
  { slug: 'vague', disc: 'surf', tab: 'VAGUE', title: 'Où surfer ?', sub: 'Surf · vagues à la côte, recalées sur les bouées, de Perafita à Carnon' },
  { slug: 'houle', disc: 'downwind', tab: 'HOULE', title: 'Quel downwind ?', sub: 'Downwind wing foil · vent + houle au large, Frontignan → Espiguette' },
];
export const moduleOf = (disc: Discipline) => MODULES.find((m) => m.disc === disc)!;

// ------------------------------------------------------------------ Prévisions (un spot)
export function SpotPage({ d, id, now }: { d: AllData; id: string; now: number }) {
  const spot = d.spots.find((s) => s.id === id);
  if (!spot) return <div class="empty">Spot inconnu. <a href="#/wind">Retour</a></div>;
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
  const days = useMemo(() => (s ? daysOf(s, now) : []), [s, Math.floor(now / 3600e3)]);
  const [dayT, setDay] = useState<number | null>(null);
  const day = dayT !== null && days.some((t) => dayKey(t) === dayKey(dayT)) ? dayT : days[0] ?? now;
  const best = sessions.length ? Math.max(...sessions.map((x) => x.peak)) : null;
  return (
    <>
      <header class="page-head">
        <button type="button" class="back" onClick={() => goBack(`#/${moduleOf(disc).slug}`)}><ChevronLeft size={22} strokeWidth={2.8} aria-hidden="true" />Retour</button>
        <div class="row between">
          <div class="row"><h1>{spot.name}</h1><Fav id={spot.id} name={spot.name} /></div>
          <Freshness d={d} now={now} />
        </div>
        <span class="muted">{DISC_LABEL[disc]}{spot.waterBody === 'lagoon' ? ' · étang' : ''}</span>
      </header>
      <div class="row between">
        {s?.levels && <Seg<Level> label={disc === 'wing' ? 'Mode' : 'Niveau de pratique'} value={level} onChange={(v) => setPrefs((p) => ({ ...p, levels: { ...p.levels, [disc]: v } }))} options={LEVELS_FOR[disc].map((l) => [l, LEVEL_LABEL[l]] as [Level, string])} />}
        <Seg<Reading> label="Niveau de lecture" value={reading} onChange={(v) => setPrefs((p) => ({ ...p, reading: v }))} options={[['synthese', 'Synthèse'], ['detail', 'Détail'], ['expert', 'Expert']]} />
      </div>
      {disc === 'wing' && <LiveBox live={live.live} spot={spot.id} />}
      {!s ? <div class="notice warn">Pas de prévision disponible pour ce spot dans la dernière mise à jour.</div> : (
        <>
          {days.length > 0 && <DayTabs s={s} days={days} value={day} now={now} onChange={setDay} />}
          <div class="today">
            <NoteCard s={s} dayT={day} now={now} sessions={sessions} level={level} />
            <CondCards d={d} spot={spot} s={s} dayT={day} now={now} />
            <MapCompass d={d} spot={spot} s={s} dayT={day} now={now} best={best} />
            <Criteria d={d} spot={spot} s={s} dayT={day} now={now} level={level} sessions={sessions} />
          </div>
          <Section title={disc === 'surf' ? 'Vagues heure par heure' : disc === 'wing' ? 'Vent heure par heure' : 'Vent et houle heure par heure'}>
            <div class="card stack">
              {(() => {
                const picks = disc === 'surf' ? pickHours(s, { day, hours: [7, 19], step: 2 }) : pickHours(s, { day });
                const ss = sessions.find((x) => dayKey(x.start) === dayKey(day));
                return <>
                  <span class="faint">{dayLabel(day, now)} : {headFor(s, picks)}</span>
                  <ModuleView d={d} spot={spot} s={s} picks={picks} window={ss ? [ss.start, ss.end] : undefined} />
                </>;
              })()}
            </div>
          </Section>
          <Section title="Sessions 2H">
            <div class="card">{sessions.length ? <div class="list">{sessions.map((x) => <SessionRow key={x.id} s={x} now={now} showSpot={false} />)}</div> : <div class="empty">Pas de session 2H en vue{s.levels ? ` en ${LEVEL_LABEL[level]}` : ''}.</div>}</div>
          </Section>
          <Section title="Jour par jour">
            <div class="card stack">
              {(() => {
                // WIND / HOULE : toutes les 3 h sur 5 jours (façon Windguru) ; VAGUE : 8 h, 13 h, 18 h sur 7 jours (façon surf-forecast)
                const picks = disc === 'surf' ? pickHours(s, { from: now, days: 7, hours: [8, 18], step: 5 }) : pickHours(s, { from: now, days: 5, hours: [7, 19], step: 3 });
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
