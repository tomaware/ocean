// Carte Leaflet (fond OpenStreetMap) : spots wing, surf et parcours downwind, colorés par leur meilleure note à venir.
import { useEffect, useRef } from 'preact/hooks';
import L from 'leaflet';
import type { Discipline, PublicSpot } from '../services/data';
import { spotDiscipline, spotPos } from '../services/data';
import { labelOf, n1 } from '../services/format';

const COLORS = (s: number | null) => (s === null ? '#7A898E' : s >= 8.5 ? '#8A4FD8' : s >= 7 ? '#EE7F1B' : s >= 5 ? '#23A26A' : '#7A898E');
// « S » comme spot, dans tous les onglets (Tom, 14/11)
const LETTER: Record<Discipline, string> = { wing: 'S', surf: 'S', downwind: 'S' };

export function SpotMap({ spots, best, focus, height, onMap }: { spots: PublicSpot[]; best: Record<string, number | null>; focus?: string; height?: number; onMap?: (m: L.Map | null) => void }) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null), layer = useRef<L.LayerGroup | null>(null);
  // la carte n'est recréée que si les spots changent ; les repères suivent la note (heure de l'animation) sans la recréer
  useEffect(() => {
    if (!el.current) return;
    const map = L.map(el.current, { zoomControl: true, attributionControl: true, scrollWheelZoom: true, wheelPxPerZoomLevel: 90 });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 17, attribution: '© contributeurs OpenStreetMap' }).addTo(map);
    layer.current = L.layerGroup().addTo(map); mapRef.current = map;
    const bounds: [number, number][] = spots.flatMap((s) => (s.kind === 'run' ? s.geometry.path : [spotPos(s)]));
    const f = focus ? spots.find((s) => s.id === focus) : null;
    if (f) map.setView(spotPos(f), 10);   // vue régionale : on voit le champ de vent autour du spot
    else if (bounds.length) map.fitBounds(bounds, { padding: [20, 20] });
    onMap?.(map);
    return () => { onMap?.(null); mapRef.current = null; layer.current = null; map.remove(); };
    // dépend de la liste des identifiants, pas du tableau : un nouveau tableau aux mêmes spots ne recrée pas la carte
  }, [spots.map((s) => s.id).join(','), focus]);
  useEffect(() => {
    const g = layer.current;
    if (!g) return;
    g.clearLayers();
    for (const s of spots) {
      const d = spotDiscipline(s), sc = best[s.id] ?? null, color = COLORS(sc);
      const tip = `<strong>${s.name}</strong><br>${labelOf(sc)}${sc === null ? '' : ' · ' + n1(sc)}`;
      if (s.kind === 'run') {
        // parcours de downwind (Tom, 14/11) : trait blanc bordé de sombre (lisible sur le vent coloré),
        // rond « 1 » au départ et « 2 » à l'arrivée, couleur de la note
        const path = s.geometry.path, go = () => { location.hash = `#/spot/${s.id}`; }, w = focus === s.id ? 6 : 4;
        L.polyline(path, { color: '#10272D', weight: w + 4, opacity: 0.55 }).addTo(g);
        L.polyline(path, { color: '#FFFFFF', weight: w, opacity: 1 }).addTo(g).bindTooltip(tip).on('click', go);
        [[path[0], '1', 'départ'], [path[path.length - 1], '2', 'arrivée']].forEach(([pt, n, what]) => {
          const icon = L.divIcon({ className: '', html: `<div class="pin run" style="background:${color}">${n}</div>`, iconSize: [26, 26], iconAnchor: [13, 13] });
          L.marker(pt as [number, number], { icon, keyboard: true, title: `${s.name} : ${what}` }).addTo(g).bindTooltip(`${tip}<br>${what}`).on('click', go);
        });
      } else {
        const icon = L.divIcon({ className: '', html: `<div class="pin" style="background:${color}${focus === s.id ? ';outline:3px solid #256D70' : ''}">${LETTER[d]}</div>`, iconSize: [28, 28], iconAnchor: [14, 14] });
        L.marker(spotPos(s), { icon, keyboard: true, title: s.name }).addTo(g).bindTooltip(tip).on('click', () => { location.hash = `#/spot/${s.id}`; });
      }
    }
  }, [spots, best, focus]);
  return <div class="map" ref={el} style={height ? { height: `${height}px` } : undefined} aria-label="Carte des spots" />;
}
