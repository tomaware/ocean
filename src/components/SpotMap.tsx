// Carte Leaflet (fond OpenStreetMap) : spots wing, surf et parcours downwind, colorés par leur meilleure note à venir.
import { useEffect, useRef } from 'preact/hooks';
import L from 'leaflet';
import type { Discipline, PublicSpot } from '../services/data';
import { spotDiscipline, spotPos } from '../services/data';
import { labelOf, n1 } from '../services/format';

const COLORS = (s: number | null) => (s === null ? '#7A898E' : s >= 8.5 ? '#8A4FD8' : s >= 7 ? '#EE7F1B' : s >= 5 ? '#23A26A' : '#7A898E');
const LETTER: Record<Discipline, string> = { wing: 'W', surf: 'S', downwind: 'D' };

export function SpotMap({ spots, best, focus, height, onMap }: { spots: PublicSpot[]; best: Record<string, number | null>; focus?: string; height?: number; onMap?: (m: L.Map | null) => void }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!el.current) return;
    const map = L.map(el.current, { zoomControl: true, attributionControl: true, scrollWheelZoom: false });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 17, attribution: '© contributeurs OpenStreetMap' }).addTo(map);
    const bounds: [number, number][] = [];
    for (const s of spots) {
      const d = spotDiscipline(s), sc = best[s.id] ?? null, color = COLORS(sc);
      const tip = `<strong>${s.name}</strong><br>${labelOf(sc)}${sc === null ? '' : ' · ' + n1(sc)}`;
      if (s.kind === 'run') {
        const line = L.polyline(s.geometry.path, { color, weight: focus === s.id ? 6 : 4, opacity: 0.9 }).addTo(map);
        line.bindTooltip(tip).on('click', () => { location.hash = `#/spot/${s.id}`; });
        bounds.push(...s.geometry.path);
      } else {
        const p = spotPos(s);
        const icon = L.divIcon({ className: '', html: `<div class="pin" style="background:${color}${focus === s.id ? ';outline:3px solid #256D70' : ''}">${LETTER[d]}</div>`, iconSize: [28, 28], iconAnchor: [14, 14] });
        L.marker(p, { icon, keyboard: true, title: s.name }).addTo(map).bindTooltip(tip).on('click', () => { location.hash = `#/spot/${s.id}`; });
        bounds.push(p);
      }
    }
    const f = focus ? spots.find((s) => s.id === focus) : null;
    if (f) map.setView(spotPos(f), 10);   // vue régionale : on voit le champ de vent autour du spot
    else if (bounds.length) map.fitBounds(bounds, { padding: [20, 20] });
    onMap?.(map);
    return () => { onMap?.(null); map.remove(); };
  }, [spots, best, focus]);
  return <div class="map" ref={el} style={height ? { height: `${height}px` } : undefined} aria-label="Carte des spots" />;
}
