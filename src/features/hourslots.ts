import { dayKey } from '../services/format.ts';

/** Relevés de la journée d'une balise, par tranche d'une heure (Tom, 13/11) : moyenne horaire de la balise (feuille de
 *  la super prévision, autour de l'heure ronde ± 30 min), sinon moyenne des relevés en direct de cette tranche. */
export function hourSlots(jour: [number, number, number | null, string | null][], pts: [number, number, string][], now: number) {
  const H = 3600e3, today = dayKey(now);
  const byHour = new Map<number, { v: number; g: number | null; d: string | null; live: boolean }>();
  for (const x of jour) if (dayKey(x[0]) === today) byHour.set(Math.round(x[0] / H) * H, { v: x[1], g: x[2], d: x[3], live: false });
  const groups = new Map<number, [number, number, string][]>();
  for (const p of pts) { const h = Math.round(p[0] / H) * H; if (dayKey(h) !== today || byHour.has(h)) continue; (groups.get(h) ?? groups.set(h, []).get(h)!).push(p); }
  for (const [h, g] of groups) {
    const n: Record<string, number> = {}; g.forEach((p) => { n[p[2]] = (n[p[2]] ?? 0) + 1; });
    byHour.set(h, { v: Math.round((g.reduce((a, p) => a + p[1], 0) / g.length) * 10) / 10, g: null, d: Object.keys(n).sort((a, b) => n[b] - n[a])[0] || null, live: true });
  }
  return [...byHour.entries()].sort((a, b) => a[0] - b[0]).map(([t, x]) => ({ t, ...x }));
}
