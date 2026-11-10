// Préférences de l'utilisateur, gardées sur cet appareil uniquement (navigateur).
import { useEffect, useState } from 'preact/hooks';
import type { Discipline, Level } from './data';

export type Reading = 'synthese' | 'detail' | 'expert';
export type Prefs = { levels: Record<Discipline, Level>; favorites: string[]; reading: Reading; perso: { enabled: boolean; url: string }; theme: 'auto' | 'light' | 'dark' };
const KEY = 'ocean.prefs.v1';
export const DEFAULT_PREFS: Prefs = { levels: { wing: 'intermediaire', surf: 'intermediaire', downwind: 'intermediaire' }, favorites: [], reading: 'synthese', perso: { enabled: false, url: '' }, theme: 'auto' };

function read(): Prefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFS;
    const p = JSON.parse(raw);
    return { ...DEFAULT_PREFS, ...p, levels: { ...DEFAULT_PREFS.levels, ...(p.levels ?? {}) }, perso: { ...DEFAULT_PREFS.perso, ...(p.perso ?? {}) } };
  } catch { return DEFAULT_PREFS; }
}
let current = read();
const subs = new Set<(p: Prefs) => void>();
export function setPrefs(fn: (p: Prefs) => Prefs): void {
  current = fn(current);
  try { localStorage.setItem(KEY, JSON.stringify(current)); } catch { /* stockage indisponible : préférences pour cette visite seulement */ }
  applyTheme(current.theme);
  subs.forEach((s) => s(current));
}
export function usePrefs(): Prefs {
  const [p, setP] = useState(current);
  useEffect(() => { subs.add(setP); return () => { subs.delete(setP); }; }, []);
  return p;
}
export function applyTheme(t: Prefs['theme']): void {
  if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t);
}
export const toggleFavorite = (id: string) => setPrefs((p) => ({ ...p, favorites: p.favorites.includes(id) ? p.favorites.filter((x) => x !== id) : [...p.favorites, id] }));
export const initialPrefs = () => current;
