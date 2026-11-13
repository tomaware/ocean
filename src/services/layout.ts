// Modules affichés par onglet (WIND, VAGUE, HOULE) et leur ordre : choisis par chacun dans le Profil, gardés sur
// l'appareil. Un onglet garde toujours au moins un module (Meilleure session, ou le premier disponible).
export const SUB_IDS = ['meilleure', 'favoris', 'sessions', 'prevision', 'spots', 'direct'] as const;
export type SubId = (typeof SUB_IDS)[number];
export type TabLayout = { order: SubId[]; hidden: SubId[] };
/** Réglage de base de l'app (Tom, 13/11) ; chacun peut le changer dans le Profil. */
export const DEFAULT_LAYOUT: Record<string, TabLayout> = {
  wind: { order: ['direct', 'favoris', 'sessions', 'prevision', 'spots', 'meilleure'], hidden: ['meilleure'] },
  vague: { order: ['favoris', 'sessions', 'prevision', 'spots', 'meilleure'], hidden: ['meilleure'] },
  houle: { order: ['prevision', 'spots', 'meilleure', 'favoris'], hidden: ['meilleure', 'favoris'] },
};

/** Tous les modules disponibles de l'onglet, dans l'ordre choisi (les modules ajoutés depuis viennent à la fin). */
export function orderedSubs(available: SubId[], layout?: TabLayout | null): SubId[] {
  const known = (layout?.order ?? []).filter((x, i, a) => available.includes(x) && a.indexOf(x) === i);
  return [...known, ...available.filter((x) => !known.includes(x))];
}
/** Modules affichés, dans l'ordre ; jamais vide. */
export function shownSubIds(available: SubId[], layout?: TabLayout | null): SubId[] {
  const v = orderedSubs(available, layout).filter((x) => !(layout?.hidden ?? []).includes(x));
  return v.length ? v : [available.includes('meilleure') ? 'meilleure' : available[0]];
}
/** Monter (-1) ou descendre (+1) un module ; masquer / afficher (le dernier affiché ne peut pas être masqué). */
export function moveSub(available: SubId[], layout: TabLayout | undefined, id: SubId, dir: -1 | 1): TabLayout {
  const o = orderedSubs(available, layout), hidden = layout?.hidden ?? [];
  // on saute les modules masqués : « monter » passe devant le module affiché juste au-dessus
  const vis = o.filter((x) => !hidden.includes(x)), k = vis.indexOf(id), other = vis[k + dir];
  if (k < 0 || !other) return { order: o, hidden };
  const i = o.indexOf(id), j = o.indexOf(other);
  [o[i], o[j]] = [o[j], o[i]];
  return { order: o, hidden };
}
export function toggleSub(available: SubId[], layout: TabLayout | undefined, id: SubId): TabLayout {
  const hidden = layout?.hidden ?? [], order = orderedSubs(available, layout);
  if (hidden.includes(id)) return { order, hidden: hidden.filter((x) => x !== id) };
  const visible = order.filter((x) => !hidden.includes(x));
  if (visible.length <= 1) return { order, hidden };   // dernier module affiché : on le garde
  return { order, hidden: [...hidden, id] };
}

// « spots » s'affiche « Carte » (Tom, 13/11) ; l'identifiant reste pour les adresses et les réglages déjà enregistrés
export const SUB_LABEL: Record<SubId, string> = { meilleure: 'Meilleure session', favoris: 'Favoris', sessions: 'Sessions 2H', prevision: 'Prévision', spots: 'Carte', direct: 'En direct' };
/** Modules disponibles par onglet : « En direct » en WIND seulement ; pas de Sessions 2H en HOULE (Tom, 11/11). */
export const availableSubs = (disc: string): SubId[] => SUB_IDS.filter((x) => (x !== 'direct' || disc === 'wing') && (x !== 'sessions' || disc !== 'downwind'));
