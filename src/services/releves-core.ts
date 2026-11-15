// Relevés en sources libres (D-67), côté app : lecture de releves.json et comparaison avec Winds-Up (mode perso).
// types repris de perso.ts (sans l'importer : perso.ts dépend des préférences du navigateur)
type Live = { spot: string; name: string; t: number | null; kn: number | null; dir: string | null; panne: boolean; gust?: number | null; src?: string; pts?: [number, number, string][]; open?: boolean };
type Histo = { spots: Record<string, { jour: [number, number, number | null, string | null][]; jours: [string, number, number][] }> };

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

export type BuoyPt = [number, number | null, number | null, number | null, number | null, number | null, number | null];
export type Buoy = { code: string; name: string; depthM: number | null; spots: string[]; pts: BuoyPt[]; status: string };
/** Bouées affichées dans VAGUE › En direct (D-68) : toutes celles du registre, mesure récente d'abord ; une bouée hors service
 *  sans aucune mesure sur 24 h n'est montrée que si elle sert un spot surf. */
export function buoysLive(r: Releves | null, now = Date.now()): (Buoy & { last: BuoyPt | null; fresh: boolean })[] {
  const all = Object.values(((r as any)?.buoys ?? {}) as Record<string, Buoy>).filter((b) => b.spots.length || b.pts.length);
  return all.map((b) => { const last = [...b.pts].reverse().find((p) => p[1] !== null) ?? null; return { ...b, last, fresh: !!last && now - last[0] <= 3 * 3600e3 }; })
    .sort((a, b) => Number(b.fresh) - Number(a.fresh));
}

/** Direct navigateur (D-67) : la collecte GitHub ne passe en pratique que toutes les 40–50 min ; l'app lit donc elle-même la
 *  dernière mesure Pioupiou (API ouverte, CORS autorisé) et l'ajoute aux relevés publiés. km/h → nœuds. */
export function pioupiouPt(j: any): Pt | null {
  const m = j?.data?.measurements, t = Date.parse(m?.date ?? ''), v = m?.wind_speed_avg, g = m?.wind_speed_max, d = m?.wind_heading;
  if (!Number.isFinite(t) || typeof v !== 'number' || v < 0 || v >= 250) return null;
  const r1 = (x: number) => Math.round(x * 10) / 10, k = 1 / 1.852;
  return [t, r1(v * k), typeof g === 'number' ? r1(g * k) : null, typeof d === 'number' ? Math.round(d) % 360 : null];
}
export function withLive(r: Releves, live: Record<string, Pt>): Releves {
  const spots: Releves['spots'] = {};
  for (const [s, arr] of Object.entries(r.spots)) spots[s] = arr.map((st) => {
    const p = live[st.src + ':' + st.id]; if (!p || st.pts.some((q) => q[0] === p[0])) return st;
    return { ...st, pts: [...st.pts, p].sort((a, b) => a[0] - b[0]) };
  });
  return { ...r, spots };
}
