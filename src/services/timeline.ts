// Frise de la carte (Tom, 13/11) : 5 prochains jours, 7 h → 21 h, lecture heure par heure.
import { hourOf } from './format.ts';

export const H0 = 7, H1 = 21;
/** Les 5 prochains jours (minuit, heure locale). */
export function nextDays(now: number, n = 5): number[] {
  const d = new Date(now); d.setHours(0, 0, 0, 0);
  return Array.from({ length: n }, (_, k) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + k).getTime());
}
export const at = (day: number, h: number) => { const d = new Date(day); return new Date(d.getFullYear(), d.getMonth(), d.getDate(), h).getTime(); };
/** Heure de départ : l'heure en cours si on est entre 7 h et 21 h, sinon 7 h le lendemain (ou ce matin). */
export function startOf(now: number): { day: number; h: number } {
  const days = nextDays(now), h = hourOf(now);
  if (h < H0) return { day: days[0], h: H0 };
  if (h > H1) return { day: days[1], h: H0 };
  return { day: days[0], h };
}
/** Pas suivant de la lecture : +1 h ; après 21 h, 7 h le jour suivant ; null à la fin du 5e jour. */
export function nextStep(days: number[], cur: { day: number; h: number }): { day: number; h: number } | null {
  if (cur.h < H1) return { day: cur.day, h: cur.h + 1 };
  const k = days.indexOf(cur.day);
  return k >= 0 && k < days.length - 1 ? { day: days[k + 1], h: H0 } : null;
}

