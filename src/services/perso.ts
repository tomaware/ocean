// MODE PERSO — relevés en direct de la super prévision, lus directement depuis cet appareil.
// Le lien (privé) reste dans ce navigateur : il n'est jamais envoyé ailleurs, jamais publié. Les relevés Winds-Up
// ne s'affichent que pour la personne qui a ce lien.
import { useEffect, useState } from 'preact/hooks';
import { usePrefs } from './prefs';

export type Live = { spot: string; name: string; t: number | null; kn: number | null; dir: string | null; panne: boolean; gust?: number | null; src?: string };

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
    out.push({ spot: id, name: x.nom, t: Number.isFinite(x.t) ? x.t : null, kn: Number.isFinite(x.v) ? x.v : null, dir: x.o ?? null, panne: !!x.panne });
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
