// Carte d'un onglet, façon Windy (Tom, 13/11) : vent sur la carte et repères des spots colorés par leur note à l'heure
// choisie (mêmes couleurs que les étoiles). Frise des 5 prochains jours, 7 h → 21 h, et lecture heure par heure.
// Aucune note n'est calculée ici : on lit la note horaire publiée par le moteur pour chaque spot.
import { useEffect, useMemo, useState } from 'preact/hooks';
import type { Map as LMap } from 'leaflet';
import type { AllData, Discipline, Level, PublicSpot } from '../services/data';
import { dayKey, dayShort, hh, hourOf } from '../services/format';
import { seriesFor } from '../features/series';
import { SpotMap } from './SpotMap';
import { gridIndex, useWindField, useWindGrid } from './WindField';
import { WindLegend } from './Today';
import { FullBtn, useFull } from './FullScreen';

import { at, H0, H1, nextDays, nextStep, startOf } from '../services/timeline';

export function MapPlayer({ d, spots, disc, L, now }: { d: AllData; spots: PublicSpot[]; disc: Discipline; L: Level; now: number }) {
  const days = useMemo(() => nextDays(now), [dayKey(now)]);
  const [cur, setCur] = useState(() => startOf(now));
  const [playing, setPlaying] = useState(false);
  const t = at(cur.day, cur.h);
  // note publiée de chaque spot à l'heure affichée (la nuit ou sans prévision : gris)
  const series = useMemo(() => Object.fromEntries(spots.map((s) => [s.id, seriesFor(d, s, disc, L)])), [d, spots, disc, L]);
  const best = useMemo(() => Object.fromEntries(spots.map((s) => {
    const x = series[s.id]; const i = x ? x.times.findIndex((tt) => Math.abs(tt - t) < 30 * 60e3) : -1;
    return [s.id, i >= 0 && x!.day[i] && !x!.kite?.[i] ? x!.score[i] : null];
  })), [series, t]);
  const [map, setMap] = useState<LMap | null>(null);
  const grid = useWindGrid();
  const gk = grid ? gridIndex(grid, t) : null;
  useWindField(map, grid, gk);
  const [full, toggleFull] = useFull(map);
  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => { const n = nextStep(days, cur); if (n) setCur(n); else setPlaying(false); }, 900);
    return () => clearTimeout(id);
  }, [playing, cur, days]);
  return (
    <div class={`stack mapplayer${full ? ' full' : ''}`}>
      <div class="mapbox">
        <SpotMap spots={spots} best={best} onMap={setMap} />
        <FullBtn full={full} onClick={toggleFull} />
        {grid && gk !== null && <WindLegend />}
        <span class="mapwhen">{dayShort(t)} · {hh(t)}</span>
      </div>
      <div class="player" role="group" aria-label="Heure affichée sur la carte">
        <button type="button" class="play" aria-label={playing ? 'Pause' : 'Lecture heure par heure'} aria-pressed={playing}
          onClick={() => { if (!playing && !nextStep(days, cur)) setCur({ day: days[0], h: H0 }); setPlaying(!playing); }}>{playing ? '❚❚' : '▶'}</button>
        <div class="stack" style={{ gap: '6px', flex: 1, minWidth: 0 }}>
          <div class="pdays">
            {days.map((x, k) => (
              <button key={x} type="button" aria-pressed={x === cur.day} onClick={() => { setPlaying(false); setCur({ day: x, h: x === days[0] ? Math.max(H0, Math.min(H1, hourOf(now))) : H0 }); }}>
                {k === 0 ? 'Auj.' : dayShort(x).replace('.', '')}
              </button>
            ))}
          </div>
          <input type="range" min={H0} max={H1} step={1} value={cur.h} aria-label="Heure" aria-valuetext={hh(t)}
            onInput={(e) => { setPlaying(false); setCur({ day: cur.day, h: Number((e.target as HTMLInputElement).value) }); }} />
          <div class="pticks" aria-hidden="true">{[7, 9, 12, 15, 18, 21].map((h) => <span key={h}>{h} h</span>)}</div>
        </div>
      </div>
      <p class="faint">Repères colorés comme les étoiles selon la note de l’heure affichée{disc === 'wing' ? ' (gris : pas de session, nuit ou Kite session)' : ' (gris : pas de session ou nuit)'}. Vent sur la carte : modèle Météo-France brut. Touche un spot pour sa fiche.</p>
    </div>
  );
}
