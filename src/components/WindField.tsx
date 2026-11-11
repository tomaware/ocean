// Vent sur la carte, façon Windy (demande de Tom, 11/11) : champ coloré par la force du vent et particules qui
// filent dans le sens du vent, à l'heure affichée. Données : grille Open-Meteo (modèle Météo-France brut, D-24),
// interpolée entre les points ; affichage seulement, la note et la pastille du spot gardent le vent corrigé.
import { useEffect, useState } from 'preact/hooks';
import type L from 'leaflet';
import { windColor } from './Today';

export type WindGrid = { available: boolean; lat0: number; lon0: number; dLat: number; dLon: number; nLat: number; nLon: number; times: number[];
  kn: (number | null)[][]; dir: (number | null)[][]; provenance?: { note?: string } };

let cache: Promise<WindGrid | null> | null = null;
export function useWindGrid(): WindGrid | null {
  const [g, setG] = useState<WindGrid | null>(null);
  useEffect(() => {
    if (!cache) cache = fetch('./data/wind-grid.json', { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : null)).then((x) => (x?.available ? x : null)).catch(() => null);
    let on = true; cache.then((x) => { if (on) setG(x); });
    return () => { on = false; };
  }, []);
  return g;
}

/** Index de l'heure de la grille la plus proche (null si l'heure est hors de la grille). */
export function gridIndex(g: WindGrid, t: number): number | null {
  let best = -1, d = Infinity;
  g.times.forEach((x, i) => { const e = Math.abs(x - t); if (e < d) { d = e; best = i; } });
  return best >= 0 && d <= 90 * 60e3 ? best : null;
}

/** Vent (u vers l'est, v vers le nord, en nœuds) interpolé au point (bilinéaire), null hors de la grille. */
export function sample(g: WindGrid, k: number, lat: number, lon: number): { u: number; v: number; kn: number } | null {
  const y = (lat - g.lat0) / g.dLat, x = (lon - g.lon0) / g.dLon;
  if (y < 0 || x < 0 || y > g.nLat - 1 || x > g.nLon - 1) return null;
  const i = Math.min(Math.floor(y), g.nLat - 2), j = Math.min(Math.floor(x), g.nLon - 2), fy = y - i, fx = x - j;
  let u = 0, v = 0, w = 0;
  for (const [di, dj, wt] of [[0, 0, (1 - fy) * (1 - fx)], [0, 1, (1 - fy) * fx], [1, 0, fy * (1 - fx)], [1, 1, fy * fx]] as const) {
    const p = (i + di) * g.nLon + (j + dj), s = g.kn[k]?.[p], d = g.dir[k]?.[p];
    if (s == null || d == null || wt === 0) continue;
    const a = ((d + 180) * Math.PI) / 180;          // direction vers laquelle va le vent
    u += wt * s * Math.sin(a); v += wt * s * Math.cos(a); w += wt;
  }
  if (w === 0) return null;
  u /= w; v /= w;
  return { u, v, kn: Math.hypot(u, v) };
}

/** Couche dessinée au-dessus du fond de carte : couleurs + particules. */
export function useWindField(map: L.Map | null, g: WindGrid | null, k: number | null) {
  useEffect(() => {
    if (!map || !g || k === null) return;
    const box = map.getContainer();
    // couche Leaflet dédiée, entre le fond de carte (200) et les spots (400+) : les repères restent visibles
    const pane = map.getPane('wind') ?? map.createPane('wind');
    pane.style.zIndex = '350'; pane.style.pointerEvents = 'none';
    const color = document.createElement('canvas'), flow = document.createElement('canvas');
    for (const c of [color, flow]) { c.className = 'windcanvas'; c.setAttribute('aria-hidden', 'true'); pane.appendChild(c); }
    const place = () => { const p = map.containerPointToLayerPoint([0, 0]); for (const c of [color, flow]) c.style.transform = `translate(${p.x}px, ${p.y}px)`; };
    const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = 0, H = 0, raf = 0, parts: { x: number; y: number; age: number }[] = [];
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const at = (x: number, y: number) => { const ll = map.containerPointToLatLng([x, y]); return sample(g, k, ll.lat, ll.lng); };

    const paint = () => {
      W = box.clientWidth; H = box.clientHeight; place();
      // champ coloré calculé tous les 8 px puis agrandi avec lissage : dégradé continu comme sur Windy
      const step = 8, cw = Math.ceil(W / step), ch = Math.ceil(H / step);
      const small = document.createElement('canvas'); small.width = cw; small.height = ch;
      const sctx = small.getContext('2d')!, img = sctx.createImageData(cw, ch);
      for (let yy = 0; yy < ch; yy++) for (let xx = 0; xx < cw; xx++) {
        const s = at(xx * step + step / 2, yy * step + step / 2);
        const o = (yy * cw + xx) * 4;
        if (!s) { img.data[o + 3] = 0; continue; }
        const m = windColor(s.kn).match(/\d+/g)!.map(Number);
        img.data[o] = m[0]; img.data[o + 1] = m[1]; img.data[o + 2] = m[2]; img.data[o + 3] = 150;
      }
      sctx.putImageData(img, 0, 0);
      color.width = W * dpr; color.height = H * dpr; color.style.width = W + 'px'; color.style.height = H + 'px';
      const ctx = color.getContext('2d')!; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(small, 0, 0, W * dpr, H * dpr);
      flow.width = W * dpr; flow.height = H * dpr; flow.style.width = W + 'px'; flow.style.height = H + 'px';
      const n = Math.round((W * H) / 900);
      parts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, age: Math.floor(Math.random() * 80) }));
      if (reduce) still();
    };
    // sans animation (réglage « réduire les animations ») : traits fixes dans le sens du vent
    const still = () => {
      const ctx = flow.getContext('2d')!; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.2;
      for (let y = 12; y < H; y += 28) for (let x = 12; x < W; x += 28) {
        const s = at(x, y); if (!s || s.kn < 0.5) continue;
        const l = Math.min(14, 4 + s.kn * 0.5), ux = s.u / s.kn, uy = -s.v / s.kn;
        ctx.beginPath(); ctx.moveTo(x - ux * l / 2, y - uy * l / 2); ctx.lineTo(x + ux * l / 2, y + uy * l / 2); ctx.stroke();
      }
    };
    const tick = () => {
      const ctx = flow.getContext('2d')!; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // traînées : on estompe l'image précédente plutôt que de l'effacer
      ctx.globalCompositeOperation = 'destination-in'; ctx.fillStyle = 'rgba(0,0,0,0.86)'; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.1;
      ctx.beginPath();
      for (const p of parts) {
        const s = at(p.x, p.y);
        if (!s || p.age++ > 70) { p.x = Math.random() * W; p.y = Math.random() * H; p.age = 0; continue; }
        const f = 0.08;                                   // px par image et par nœud
        const nx = p.x + s.u * f, ny = p.y - s.v * f;
        ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny); p.x = nx; p.y = ny;
        if (nx < 0 || ny < 0 || nx > W || ny > H) { p.x = Math.random() * W; p.y = Math.random() * H; p.age = 0; }
      }
      ctx.stroke();
      raf = requestAnimationFrame(tick);
    };
    const hide = () => { cancelAnimationFrame(raf); color.style.opacity = '0'; flow.style.opacity = '0'; };
    const show = () => { paint(); color.style.opacity = ''; flow.style.opacity = ''; if (!reduce) { cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); } };
    map.on('zoomstart', hide); map.on('moveend zoomend resize', show);
    show();
    return () => { cancelAnimationFrame(raf); map.off('zoomstart', hide); map.off('moveend zoomend resize', show); color.remove(); flow.remove(); };
  }, [map, g, k]);
}
