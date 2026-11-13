// Carte en grand (Tom, 13/11) : bouton plein écran sur les cartes, Échap ou le même bouton pour revenir.
import { useEffect, useState } from 'preact/hooks';
import type { Map as LMap } from 'leaflet';
import { Maximize2, Minimize2 } from 'lucide-preact';

export function useFull(map: LMap | null): [boolean, () => void] {
  const [full, setFull] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle('mapfull', full);
    // la carte change de taille : Leaflet doit le savoir (puis le vent se redessine sur « resize »)
    const id = setTimeout(() => map?.invalidateSize(), 60);
    if (!full) return () => clearTimeout(id);
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setFull(false); };
    addEventListener('keydown', esc);
    return () => { clearTimeout(id); removeEventListener('keydown', esc); document.documentElement.classList.remove('mapfull'); };
  }, [full, map]);
  return [full, () => setFull(!full)];
}
export function FullBtn({ full, onClick }: { full: boolean; onClick: () => void }) {
  return <button type="button" class="fullbtn" aria-pressed={full} aria-label={full ? 'Réduire la carte' : 'Agrandir la carte'} title={full ? 'Réduire (Échap)' : 'Agrandir'} onClick={onClick}>
    {full ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</button>;
}
