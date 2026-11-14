// SUPER PRÉVISION VENT (PRIVÉE, D-66) — calculée sur cet appareil, en mode perso, à partir du lien de la super prévision.
// Le site public n'a que la « Prévision vent » (meilleur modèle aux METAR). Ici, pour les personnes qui ont le lien,
// les spots couverts par la super prévision prennent son vent corrigé, avec la MÊME formule de note (wing v2.3,
// kite v1.0 : le moteur du pipeline lui-même, pas une copie). Rien n'est envoyé ailleurs, rien n'est publié.
// Les relevés Winds-Up que renvoie le même appel (`live`) sont ignorés ici.
import type { AllData } from './data.ts';

import { parseSuperPrevision } from '../../pipeline/collect/superprevision.ts';
import { wingForecast } from '../../pipeline/engines/wing.ts';
import { wingSessions, bestByDiscipline, ALL_LEVELS } from '../../pipeline/publish/sessions.ts';
import type { Registry } from '../types/contracts.ts';

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
/** = perso.matchSpot : « 1554-la-franqui-… » → la-franqui */
const matchSpot = (name: string, ids: string[]) => { const n = norm(name); return ids.find((id) => n === id || n.startsWith(id + '-') || n.includes(id)) ?? null; };
type SpPoint = { t: number; v: number | null; o?: string; r?: number | null; conf?: number };
export type SuperRaw = { at: number; spots: Record<string, SpPoint[]> };

export async function fetchSuper(url: string, ids: string[]): Promise<SuperRaw> {
  const r = await fetch(url.trim() + (url.includes('?') ? '&' : '?') + 'action=widget', { redirect: 'follow' });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  const spots: Record<string, SpPoint[]> = {};
  // clés du script = identifiants de ses spots ; rattachées aux spots OCEAN par leur nom (comme les relevés perso)
  for (const [k, arr] of Object.entries<any>(j.spots ?? {})) { const id = matchSpot(k, ids); if (id && Array.isArray(arr)) spots[id] = arr; }
  return { at: Date.now(), spots };
}

/** Données de l'app avec la super prévision à la place de la Prévision vent, pour les spots qu'elle couvre. */
export function applySuper(d: AllData, raw: SuperRaw, now = Date.now()): AllData {
  const reg = { spots: d.spots.filter((s) => s.disciplines.includes('wing')).map((s) => ({ ...s, legacy: { superPrevisionVent: s.id } })), runs: [], buoys: [], stations: [] } as unknown as Registry;
  const block = parseSuperPrevision({ spots: raw.spots }, reg, raw.at).block;
  const merge = (pub: any, sport: 'wing' | 'kite') => {
    if (!pub?.spots) return pub;
    const sp = wingForecast(block, reg, now, undefined, sport);
    const byId = new Map((sp.spots ?? []).filter((x) => x.hours.length > 0).map((x) => [x.id, x]));
    if (!byId.size) return pub;
    return { ...pub, provenance: sp.provenance, superCount: byId.size, spots: pub.spots.map((x: any) => (byId.has(x.id) ? { ...byId.get(x.id), source: { kind: 'corrected', source: 'super-prevision', fetchedAt: raw.at } } : x)) };
  };
  const wing = merge(d.wing, 'wing'), kite = merge(d.kite, 'kite');
  if (wing === d.wing) return d;
  // surf et downwind : sessions publiées telles quelles ; wing et kite : recalculées comme dans le pipeline (allSessions)
  const others = (d.sessions.sessions as any[]).filter((s) => s.discipline !== 'wing' && s.discipline !== 'kite');
  const sessions = [...wingSessions(wing, now), ...(kite ? wingSessions(kite, now, 'kite') : []), ...others].sort((a, b) => a.start - b.start || b.peak - a.peak);
  const best = Object.fromEntries(ALL_LEVELS.map((L) => [L, bestByDiscipline(sessions, L)])) as unknown as AllData['sessions']['best'];
  const src = 'Super prévision vent (privée) : vent corrigé, calculé sur cet appareil';
  const disciplines = { ...d.meta.disciplines, wing: { ...d.meta.disciplines.wing, source: src }, ...((d.meta.disciplines as any).kite ? { kite: { ...(d.meta.disciplines as any).kite, source: src } } : {}) };
  return { ...d, wing, kite, sessions: { ...d.sessions, sessions: sessions as any, best }, meta: { ...d.meta, disciplines }, superPrev: { at: raw.at, spots: wing.superCount } } as AllData;
}

