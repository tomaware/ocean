// Frise : une barre par heure, hauteur et couleur = note. Lisible au premier coup d'œil, détail au survol / focus.
import { hh, hourOf, labelOf, n1, scoreColor } from '../services/format';

export type StripHour = { t: number; s: number | null; day: boolean; title?: string };
export function Strip({ hours, label }: { hours: StripHour[]; label: string }) {
  return (
    <div>
      <div class="strip" role="img" aria-label={label}>
        {hours.map((h) => (
          <div key={h.t} class={`b${h.day ? '' : ' night'}`} title={`${hh(h.t)} : ${labelOf(h.s)} ${n1(h.s)}${h.title ? ' · ' + h.title : ''}`}
            style={{ height: `${Math.max(6, ((h.s ?? 0) / 10) * 100)}%`, background: scoreColor(h.s) }} />
        ))}
      </div>
      <div class="hours" aria-hidden="true">{hours.map((h) => <span key={h.t}>{hourOf(h.t) % 3 === 0 ? hourOf(h.t) : ''}</span>)}</div>
    </div>
  );
}
