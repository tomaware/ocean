// Explication en mots de la note surf d'une heure (infobulle des notes VAGUE).
import { n0 } from './format.ts';

/** Pourquoi cette note surf, en mots (facteurs du moteur surf : taille, période, vent, clapot ; bonus bascule). */
export function surfWhy(x: Record<string, any>): string | null {
  const f = x.f as [number, number, number, number, number] | null;
  if (!f) return null;
  const [size, per, wind, chop, side] = f;
  const plus: string[] = [], minus: string[] = [];
  if (size >= 0.9) plus.push('bonne taille de vague');
  else if (size >= 0.5) minus.push(side > 0 ? 'vagues un peu grosses pour le spot' : 'vagues un peu petites');
  else minus.push(side > 0 ? 'trop gros pour le spot' : 'trop petit');
  const wk = x.wk as string | null;
  if (wk === 'offshore') plus.push('vent de terre : vent et houle opposés, vagues creusées et propres');
  else if (wk === 'side-off') plus.push('vent side-off : vagues propres');
  else if (wk === 'pétole') plus.push('pas de vent : mer lisse');
  else if (wind >= 0.8) plus.push('vent faible, peu gênant');
  else if (wk === 'side') minus.push('vent de côté');
  else if (wk === 'side-on' || wk === 'onshore') minus.push('vent de mer : vagues hachées');
  if (wind < 0.95 && (wk === 'offshore' || wk === 'side-off')) minus.push(`vent de terre un peu fort${x.ws != null ? ` (${n0(x.ws)} nd)` : ''} : vagues moins faciles à prendre`);
  if (chop < 1) minus.push('mer du vent : clapot');
  if (per >= 0.9) plus.push(`bonne période (${n0(x.tp)} s)`);
  else if (per < 0.7) minus.push(`période courte (${n0(x.tp)} s) : vagues molles`);
  if (x.bas) plus.push('bonus bascule (le vent retombe après un coup de mer)');
  if (x.flat) minus.push('la mer s’aplatit après plusieurs heures de vent de terre');
  const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
  return [plus.length ? cap(plus.join(', ')) : '', minus.length ? (plus.length ? `Mais ${minus.join(', ')}` : cap(minus.join(', '))) : ''].filter(Boolean).join('. ') + '.';
}

