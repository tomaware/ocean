// Relevés en sources libres (D-67), côté app : lecture de releves.json et comparaison avec Winds-Up (mode perso).
import type { Live, Histo } from './perso.ts';

export const RELEVES_URL = 'https://raw.githubusercontent.com/tomaware/ocean/releves/releves.json';
export const MAX_AGE_MIN = 90;
type Pt = [number, number, number | null, number | null];
type St = { src: string; id: string; name: string; km: number | null; pts: Pt[]; status: string };
export type Releves = { generatedAt: number; sources: Record<string, { ok: boolean; message: string; licence: string; attribution: string; url: string }>; spots: Record<string, St[]>; days: Record<string, [string, number, number][]> };

const DIR16 = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
const d16 = (d: number | null) => (d === null ? '' : DIR16[Math.round(d / 22.5) % 16]);
const km = (x: number | null) => (x === null ? '' : ` · ${String(x).replace('.', ',')} km`);

/** Dernière mesure de chaque balise publique retenue (plus de 90 min : pas « en direct »). */
export function openLive(r: Releves | null, spots: { id: string; name: string }[], now = Date.now()): Live[] {
  const out: Live[] = [];
  for (const s of spots) for (const st of r?.spots?.[s.id] ?? []) {
    const p = st.pts[st.pts.length - 1]; if (!p || now - p[0] > MAX_AGE_MIN * 60e3) continue;
    out.push({ spot: s.id, name: s.name, t: p[0], kn: p[1], gust: p[2], dir: d16(p[3]) || null, panne: false, open: true,
      src: `${r!.sources[st.src]?.attribution ?? st.src} · ${st.name}${km(st.km)}`, pts: st.pts.map((q) => [q[0], q[1], d16(q[3])] as [number, number, string]) });
  }
  return out;
}

export type Compare = { spot: string; station: string; days: number; agree: number; bothWindy: number; wuWindy: number; openWindy: number; madMax: number | null; today: { n: number; mean: number; mad: number } | null };
/** Winds-Up (historique perso) vs balise publique : jours « à 15 nd » d'accord, écart de la moyenne horaire max, et aujourd'hui heure par heure. */
export function compare(r: Releves | null, h: Histo | null, spot: string): Compare[] {
  const wu = h?.spots?.[spot]; if (!r || !wu) return [];
  const H = 3600e3;
  return (r.spots[spot] ?? []).map((st) => {
    const od = new Map((r.days[st.src + ':' + st.id] ?? []).map((d) => [d[0], d]));
    const both = (wu.jours ?? []).filter((d) => od.has(d[0]));
    let agree = 0, bw = 0, ww = 0, ow = 0, sum = 0;
    for (const d of both) { const o = od.get(d[0])!; const a = d[2] > 0, b = o[2] > 0; if (a === b) agree++; if (a && b) bw++; if (a) ww++; if (b) ow++; sum += Math.abs(d[1] - o[1]); }
    // aujourd'hui : moyennes horaires de la balise publique (heure ronde ± 30 min) face aux moyennes horaires Winds-Up
    const g = new Map<number, number[]>(); for (const p of st.pts) { const k = Math.round(p[0] / H) * H; (g.get(k) ?? g.set(k, []).get(k)!).push(p[1]); }
    const diffs = (wu.jour ?? []).map((x) => { const v = g.get(Math.round(x[0] / H) * H); return v ? v.reduce((a, b) => a + b, 0) / v.length - x[1] : null; }).filter((x): x is number => x !== null);
    const r1 = (x: number) => Math.round(x * 10) / 10;
    return { spot, station: st.name, days: both.length, agree, bothWindy: bw, wuWindy: ww, openWindy: ow, madMax: both.length ? r1(sum / both.length) : null,
      today: diffs.length ? { n: diffs.length, mean: r1(diffs.reduce((a, b) => a + b, 0) / diffs.length), mad: r1(diffs.reduce((a, b) => a + Math.abs(b), 0) / diffs.length) } : null };
  });
}
