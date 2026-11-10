import type { ComponentChildren } from 'preact';
import { Route, Star, Waves, Wind } from 'lucide-preact';
import type { Discipline, Session } from '../services/data';
import { DISC_LABEL, LEVEL_LABEL } from '../services/data';
import { labelOf, n1, span, toneOf } from '../services/format';
import { toggleFavorite, usePrefs } from '../services/prefs';

export function Badge({ score, size }: { score: number | null | undefined; size?: 'lg' }) {
  const t = toneOf(score);
  if (score === null || score === undefined) return <span class="badge no">pas de session</span>;
  return (
    <span class={`badge ${t}`} style={size === 'lg' ? { fontSize: 'var(--fs-md)', padding: '5px 12px' } : undefined}>
      {labelOf(score)}{score !== null && score !== undefined && <span class="n" aria-label={`note ${n1(score)} sur 10`}>{n1(score)}</span>}
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

export function SessionRow({ s, now, showSpot = true }: { s: Session; now: number; showSpot?: boolean }) {
  return (
    <a class="session" href={`#/spot/${s.spot}`}>
      <DiscIcon d={s.discipline} />
      <div class="stack" style={{ gap: '2px', minWidth: 0 }}>
        <div class="row" style={{ gap: '6px' }}>
          {showSpot && <strong>{s.spotName}</strong>}
          <span class="faint">{span(s.start, s.end, now)}</span>
        </div>
        <span class="small muted">{s.text}{s.level !== 'tous' ? ` · ${LEVEL_LABEL[s.level].toLowerCase()}` : ''}</span>
        {s.why && <span class="faint">Limite : {s.why}</span>}
      </div>
      <Badge score={s.peak} />
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
