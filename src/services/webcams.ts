// Webcams des spots (registry/webcams.json, collecte du 13/11/2026, D-46).
// OCEAN ne copie ni n'héberge aucun flux : chaque webcam s'ouvre chez son éditeur, qui en détient les droits
// (Viewsurf interdit toute rediffusion sans autorisation préalable ; D-47).
import data from '../../registry/webcams.json';

export type Webcam = {
  titre: string;
  editeur: string;
  type: 'video' | 'images';
  url: string;
  position: 'spot' | 'proche';
  verif: 'page' | 'annuaire';
  source: string;
};
export type Editeur = { nom: string; integration: 'lien' | 'lecteur'; droits: string };

export const EDITEURS = data.editeurs as Record<string, Editeur>;
const PAR_SPOT = data.webcams as Record<string, Webcam[]>;

/** Webcams d'un spot : celles qui filment le spot d'abord, puis celles d'une commune voisine. */
export function webcamsOf(id: string): Webcam[] {
  return [...(PAR_SPOT[id] ?? [])].sort((a, b) => (a.position === b.position ? 0 : a.position === 'spot' ? -1 : 1));
}
/** Le spot a-t-il été recherché ? (une entrée vide = cherché, rien trouvé) */
export const webcamsCherchees = (id: string) => id in PAR_SPOT;
