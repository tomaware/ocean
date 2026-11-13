// Stats des spots à partir des relevés horaires de la super prévision (mode perso, Tom 13/11) : jours du mois avec
// au moins une heure de jour à 15 nd de moyenne ou plus. Les jours sans relevé ne comptent pas (« sur N jours relevés »).
export type HistoDay = [string, number, number];   // [aaaa-mm-jj, moyenne horaire max de jour, heures ≥ seuil]
export type MonthStat = { label: string; days: number; measured: number; best: number | null };

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const key = (y: number, m: number) => `${y}-${String(m + 1).padStart(2, '0')}`;

/** Mois en cours puis mois précédent. */
export function monthStats(days: HistoDay[], now: number): MonthStat[] {
  const d = new Date(now), y = d.getFullYear(), m = d.getMonth();
  return [[y, m], m ? [y, m - 1] : [y - 1, 11]].map(([yy, mm]) => {
    const k = key(yy, mm), ds = days.filter((x) => x[0].startsWith(k));
    return { label: MOIS[mm], days: ds.filter((x) => x[2] > 0).length, measured: ds.length, best: ds.length ? Math.max(...ds.map((x) => x[1])) : null };
  });
}
