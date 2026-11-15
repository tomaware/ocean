// Relevés en sources libres (D-67) : historique publié sur la branche « releves » (collecte GitHub, en pratique toutes les
// 40–50 min), complété par la dernière mesure Pioupiou lue directement par l'app toutes les 2 min.
import { useEffect, useState } from 'preact/hooks';
import { RELEVES_URL, pioupiouPt, withLive, type Releves } from './releves-core';
export { openLive, compare, buoysLive, type Releves, type BuoyPt } from './releves-core';

let last: Releves | null = null;
export function useReleves(): Releves | null {
  const [base, setBase] = useState<Releves | null>(last);
  const [live, setLive] = useState<Record<string, any>>({});
  useEffect(() => {
    let stop = false;
    const go = () => fetch(RELEVES_URL + '?t=' + Math.floor(Date.now() / 300e3), { cache: 'no-cache' })
      .then((x) => (x.ok ? x.json() : null), () => null).then((j) => { if (!stop && j?.spots) { last = j; setBase(j); } });
    go();
    const iv = setInterval(go, 5 * 60e3);
    return () => { stop = true; clearInterval(iv); };
  }, []);
  const ids = base ? [...new Set(Object.values(base.spots).flat().filter((s) => s.src === 'pioupiou').map((s) => s.id))] : [];
  useEffect(() => {
    if (!ids.length) return;
    let stop = false;
    const go = () => Promise.all(ids.map((id) => fetch(`https://api.pioupiou.fr/v1/live/${id}`).then((x) => (x.ok ? x.json() : null), () => null).then((j) => [id, pioupiouPt(j)] as const)))
      .then((rs) => { if (!stop) setLive((o) => { const n = { ...o }; for (const [id, p] of rs) if (p) n['pioupiou:' + id] = p; return n; }); });
    go();
    const iv = setInterval(go, 2 * 60e3);
    return () => { stop = true; clearInterval(iv); };
  }, [ids.join(',')]);
  return base && Object.keys(live).length ? withLive(base, live) : base;
}
