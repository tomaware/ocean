// Relevés en sources libres (D-67) : publiés toutes les 10 min sur la branche « releves », lus directement par l'app.
import { useEffect, useState } from 'preact/hooks';
import { RELEVES_URL, type Releves } from './releves-core';
export { openLive, compare, type Releves } from './releves-core';

let last: Releves | null = null;
export function useReleves(): Releves | null {
  const [r, setR] = useState<Releves | null>(last);
  useEffect(() => {
    let stop = false;
    const go = () => fetch(RELEVES_URL + '?t=' + Math.floor(Date.now() / 300e3), { cache: 'no-cache' })
      .then((x) => (x.ok ? x.json() : null), () => null).then((j) => { if (!stop && j?.spots) { last = j; setR(j); } });
    go();
    const iv = setInterval(go, 5 * 60e3);
    return () => { stop = true; clearInterval(iv); };
  }, []);
  return r;
}
