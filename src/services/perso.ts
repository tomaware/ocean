// MODE PERSO — relevés en direct de la super prévision, lus directement depuis cet appareil.
// Le lien (privé) reste dans ce navigateur : il n'est jamais envoyé ailleurs, jamais publié. Les relevés Winds-Up
// ne s'affichent que pour la personne qui a ce lien.
import { useEffect, useState } from 'preact/hooks';
import { usePrefs } from './prefs';

/** pts : relevés des 3 dernières heures (toutes les 5 min) [heure, nd, direction] */
export type Live = { spot: string; name: string; t: number | null; kn: number | null; dir: string | null; panne: boolean; gust?: number | null; src?: string; pts?: [number, number, string][] };
/** Historique (mode perso, ?action=histo du script) : relevés horaires du jour et bilan par jour (~3 mois). */
export type Histo = { seuil: number; heures: [number, number]; spots: Record<string, { jour: [number, number, number | null, string | null][]; jours: [string, number, number][] }> };

const DIR16 = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
/** Mesures publiques publiées avec les données (METAR), pour les spots sans balise Winds-Up : visibles par tous. */
export function publicLive(obs: Record<string, any> | undefined, spots: { id: string; name: string }[]): Live[] {
  return spots.filter((s) => obs?.[s.id]).map((s) => { const o = obs![s.id];
    return { spot: s.id, name: s.name, t: o.t, kn: o.kn, gust: o.gust, dir: o.dir == null ? null : DIR16[Math.round(o.dir / 22.5) % 16], panne: false, src: o.source }; });
}
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-');

/** Rattache un spot de la super prévision au registre OCEAN par son nom (« La Franqui (Perpignan) » → la-franqui). */
export function matchSpot(name: string, ids: string[]): string | null {
  const n = norm(name);
  return ids.find((id) => n === id || n.startsWith(id + '-') || n.includes(id)) ?? null;
}

export async function fetchLive(url: string, ids: string[]): Promise<{ at: number; spots: Live[] }> {
  const u = url.trim() + (url.includes('?') ? '&' : '?') + 'action=live';
  const r = await fetch(u, { redirect: 'follow' });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  const out: Live[] = [];
  for (const x of Object.values<any>(j.spots ?? {})) {
    const id = matchSpot(String(x.nom ?? ''), ids);
    if (!id) continue;
    out.push({ spot: id, name: x.nom, t: Number.isFinite(x.t) ? x.t : null, kn: Number.isFinite(x.v) ? x.v : null, dir: x.o ?? null, panne: !!x.panne,
      pts: Array.isArray(x.pts) ? x.pts.filter((p: any) => Number.isFinite(p?.[0]) && Number.isFinite(p?.[1])).map((p: any) => [p[0], p[1], p[2] ?? '']) : [] });
  }
  return { at: Date.now(), spots: out };
}

export function useLive(ids: string[]): { live: Live[] | null; error: string | null; at: number | null } {
  const prefs = usePrefs();
  const [state, setState] = useState<{ live: Live[] | null; error: string | null; at: number | null }>({ live: null, error: null, at: null });
  useEffect(() => {
    if (!prefs.perso.enabled || !prefs.perso.url) { setState({ live: null, error: null, at: null }); return; }
    let stop = false;
    const go = () => fetchLive(prefs.perso.url, ids).then((r) => !stop && setState({ live: r.spots, error: null, at: r.at }), (e) => !stop && setState({ live: null, error: String(e.message ?? e), at: null }));
    go();
    const iv = setInterval(go, 5 * 60e3);
    return () => { stop = true; clearInterval(iv); };
  }, [prefs.perso.enabled, prefs.perso.url, ids.join(',')]);
  return state;
}

/** Historique des relevés (mode perso). « absent » : le script n'a pas encore l'ajout ?action=histo (voir widgets/super-prevision). */
export async function fetchHisto(url: string, ids: string[]): Promise<Histo | 'absent'> {
  const r = await fetch(url.trim() + (url.includes('?') ? '&' : '?') + 'action=histo', { redirect: 'follow' });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  if (!j || typeof j !== 'object' || !j.spots || j.seuil == null) return 'absent';   // ancien script : renvoie la prévision
  const spots: Histo['spots'] = {};
  for (const x of Object.values<any>(j.spots)) {
    const id = matchSpot(String(x.nom ?? ''), ids);
    if (id) spots[id] = { jour: Array.isArray(x.jour) ? x.jour : [], jours: Array.isArray(x.jours) ? x.jours : [] };
  }
  return { seuil: j.seuil, heures: j.heures ?? [8, 19], spots };
}
export function useHisto(ids: string[]): { histo: Histo | null; absent: boolean } {
  const prefs = usePrefs();
  const [st, setSt] = useState<{ histo: Histo | null; absent: boolean }>({ histo: null, absent: false });
  useEffect(() => {
    if (!prefs.perso.enabled || !prefs.perso.url || !ids.length) { setSt({ histo: null, absent: false }); return; }
    let stop = false;
    const go = () => fetchHisto(prefs.perso.url, ids).then((h) => !stop && setSt(h === 'absent' ? { histo: null, absent: true } : { histo: h, absent: false }), () => {});
    go();
    const iv = setInterval(go, 15 * 60e3);
    return () => { stop = true; clearInterval(iv); };
  }, [prefs.perso.enabled, prefs.perso.url, ids.join(',')]);
  return st;
}
