// WIND : deux sports sur le même vent (D-51). Wing pour le petit vent, kitesurf pour le vent fort ; l'affichage est le
// même, seules la note, les étoiles et les créneaux changent. Le choix est gardé sur l'appareil (préférences).
// Aucune note n'est recalculée ici : on remplace simplement, pour tout l'onglet WIND, les données wing par les
// données kite publiées par le moteur (kite.json et les sessions « kite » de sessions.json).
import type { AllData, Session } from './data.ts';

export type Sport = 'wing' | 'kite';
export const SPORT_LABEL: Record<Sport, string> = { wing: 'Wing', kite: 'Kite' };
export const SPORT_NAME: Record<Sport, string> = { wing: 'Wing foil', kite: 'Kitesurf' };

/** Données vues par l'onglet WIND pour le sport choisi. Sessions « kite » présentées comme celles de l'onglet WIND. */
export function forSport(d: AllData, sport: Sport): AllData {
  const all = d.sessions.sessions as unknown as (Omit<Session, 'discipline'> & { discipline: string })[];
  if (sport !== 'kite' || !d.kite) {
    return { ...d, sessions: { ...d.sessions, sessions: all.filter((s) => s.discipline !== 'kite') as Session[] } };
  }
  const sessions = all.filter((s) => s.discipline !== 'wing').map((s) => (s.discipline === 'kite' ? { ...s, discipline: 'wing' } : s)) as Session[];
  const best = Object.fromEntries(Object.entries(d.sessions.best).map(([L, b]) => {
    const k = (b as any).kite as Session | null | undefined;
    return [L, { ...(b as object), wing: k ? { ...k, discipline: 'wing' as const } : null }];
  })) as AllData['sessions']['best'];
  const disciplines = { ...d.meta.disciplines, wing: (d.meta.disciplines as any).kite ?? d.meta.disciplines.wing };
  return { ...d, wing: d.kite, sessions: { ...d.sessions, sessions, best }, meta: { ...d.meta, disciplines } };
}

/** Nom affiché d'une discipline : l'onglet WIND prend le nom du sport choisi. */
export const discName = (disc: string, sport: Sport, fallback: string) => (disc === 'wing' ? SPORT_NAME[sport] : fallback);
