import type { ComponentChildren } from 'preact';
import { Route, Star, Waves, Wind } from 'lucide-preact';
import type { Discipline, Session } from '../services/data';
import { DISC_LABEL, LEVEL_LABEL } from '../services/data';
import { hh, span } from '../services/format';
import { setPrefs, toggleFavorite, usePrefs } from '../services/prefs';
import { SPORT_LABEL, type Sport } from '../services/sport';
import { Stars } from './Views';

/** Note en étoiles sur 3 (demande de Tom, 10/11) ; « Ça envoie » quand la session wing a au moins 4 h à plus de 20 nd. */
export function Badge({ score, size, envoie }: { score: number | null | undefined; size?: 'lg'; envoie?: boolean }) {
  if (score === null || score === undefined) return <span class="badge no">pas de session</span>;
  return (
    <span class={`badge star-badge${envoie ? ' top' : ''}`}>
      {envoie && <span>Ça envoie</span>}<Stars score={score} size={size === 'lg' ? 'lg' : 'md'} />
    </span>
  );
}

export function DiscIcon({ d, size = 18 }: { d: Discipline; size?: number }) {
  const I = d === 'wing' ? Wind : d === 'surf' ? Waves : Route;
  return <span class="disc" aria-hidden="true"><I size={size} strokeWidth={2} /></span>;
}

export function Fav({ id, name }: { id: string; name: string }) {
  const p = usePrefs();
  const on = p.favorites.includes(id);
  return (
    <button class="star" aria-pressed={on} aria-label={on ? `Retirer ${name} des favoris` : `Ajouter ${name} aux favoris`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(id); }}>
      <Star size={18} fill={on ? 'currentColor' : 'none'} />
    </button>
  );
}

export function Seg<T extends string>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  return (
    <div class="seg" role="group" aria-label={label}>
      {options.map(([v, l]) => <button key={v} type="button" aria-pressed={v === value} onClick={() => onChange(v)}>{l}</button>)}
    </div>
  );
}

// compact : liste d'un seul module, déjà groupée par jour et filtrée par niveau → heures seules, sans icône ni niveau
export function SessionRow({ s, now, showSpot = true, compact = false }: { s: Session; now: number; showSpot?: boolean; compact?: boolean }) {
  return (
    <a class={`session${compact ? ' compact' : ''}`} href={`#/spot/${s.spot}`}>
      {!compact && <DiscIcon d={s.discipline} />}
      <div class="stack" style={{ gap: '2px', minWidth: 0 }}>
        <div class="row" style={{ gap: '6px' }}>
          {showSpot && <strong>{s.spotName}</strong>}
          <span class="faint">{compact ? `${hh(s.start)} – ${hh(s.end)} · ${s.hours} h` : span(s.start, s.end, now)}</span>
        </div>
        <span class="small muted">{s.text}{!compact && s.level !== 'tous' ? ` · ${LEVEL_LABEL[s.level]}` : ''}</span>
        {s.why && <span class="faint">Commentaire : {s.why}</span>}
      </div>
      <Badge score={s.peak} envoie={s.envoie} />
    </a>
  );
}

export function Section({ title, aside, children }: { title: ComponentChildren; aside?: ComponentChildren; children: ComponentChildren }) {
  return (
    <section class="stack" style={{ gap: 'var(--s-3)' }}>
      <div class="row between"><h2>{title}</h2>{aside}</div>
      {children}
    </section>
  );
}

export const discTitle = (d: Discipline) => DISC_LABEL[d];

/** WIND : bascule Wing | Kite (D-51), gardée dans les préférences de l'appareil. */
export function SportSeg() {
  const prefs = usePrefs();
  return <Seg<Sport> label="Sport" value={prefs.sport} onChange={(v) => setPrefs((p) => ({ ...p, sport: v }))} options={(['wing', 'kite'] as Sport[]).map((x) => [x, SPORT_LABEL[x]] as [Sport, string])} />;
}
