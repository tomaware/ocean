// Super prévision vent (Apps Script de Tom) : vent CORRIGÉ par spot (sortie de son moteur, pas une mesure).
// Les relevés Winds-Up (`live`) renvoyés par le même appel sont ignorés ici : ils ne sortent jamais du pipeline.
import type { ForecastBlock, Registry, SourceStatus } from '../../src/types/contracts.ts';
import { getJSON } from './http.ts';

const KN_TO_MS = 1 / 1.94384;
const DIRS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
export function compassToDeg(o: unknown): number | null {
  const i = DIRS.indexOf(String(o ?? '').toUpperCase().replace(/W/g, 'O'));
  return i < 0 ? null : i * 22.5;
}

type SpPoint = { t: number; v: number | null; o?: string; r?: number | null; conf?: number };

/** Réponse ?action=widget → bloc « corrected » (seulement `spots`, jamais `live`). */
export function parseSuperPrevision(json: { spots?: Record<string, SpPoint[]> }, registry: Registry, fetchedAt: number):
  { block: ForecastBlock; stats: Pick<SourceStatus, 'values' | 'missing' | 'rejected' | 'points'> } {
  const byLegacy = new Map<string, string>();
  registry.spots.forEach((s) => { if (s.legacy.superPrevisionVent) byLegacy.set(s.legacy.superPrevisionVent, s.id); });
  const all = new Set<number>();
  Object.values(json.spots ?? {}).forEach((arr) => arr.forEach((p) => { if (Number.isFinite(p.t)) all.add(p.t); }));
  const times = [...all].sort((a, b) => a - b);
  const idx = new Map(times.map((t, i) => [t, i]));
  const values: ForecastBlock['values'] = {};
  let n = 0, missing = 0, rejected = 0;
  for (const [legacyId, arr] of Object.entries(json.spots ?? {})) {
    const id = byLegacy.get(legacyId);
    if (!id) continue;                       // spot inconnu du registre : ignoré
    const speed: (number | null)[] = times.map(() => null), gust = speed.slice(), dir = speed.slice(), conf = speed.slice();
    for (const p of arr) {
      const i = idx.get(p.t);
      if (i === undefined) continue;
      n++;
      if (p.v === null || !Number.isFinite(p.v)) { missing++; continue; }
      if (p.v < 0 || p.v > 120) { rejected++; continue; }
      speed[i] = Math.round(p.v * KN_TO_MS * 1000) / 1000;
      gust[i] = Number.isFinite(p.r) ? Math.round((p.r as number) * KN_TO_MS * 1000) / 1000 : null;
      dir[i] = compassToDeg(p.o);
      conf[i] = Number.isFinite(p.conf) ? (p.conf as number) : null;
    }
    values['spot_' + id] = { 'super-prevision': { wind_speed_10m: speed, wind_gusts_10m: gust, wind_direction_10m: dir, confidence: conf } };
  }
  return {
    block: { id: 'super-prevision', kind: 'corrected', variables: { wind_speed_10m: 'm/s', wind_gusts_10m: 'm/s', wind_direction_10m: 'deg', confidence: '1' },
      models: ['super-prevision'], times, values,
      provenance: { source: 'super-prevision', fetchedAt, note: 'Vent corrigé par la super prévision (Apps Script v3.4) : modèles pondérés par leur erreur aux balises, système champion par spot. Valeurs arrondies au nœud, direction sur 16 points, heures 6-21 h.' } },
    stats: { values: n, missing, rejected, points: Object.keys(values).length },
  };
}

export async function collectSuperPrevision(secretUrl: string, registry: Registry) {
  const fetchedAt = Date.now();
  const json = await getJSON<{ spots?: Record<string, SpPoint[]>; error?: string; live?: { spots?: Record<string, { t?: number; v?: number; o?: string; panne?: boolean }> } }>(secretUrl + (secretUrl.includes('?') ? '&' : '?') + 'action=widget', { timeoutMs: 120_000, tries: 2 });
  if (json && (json as { error?: string }).error) throw new Error('super prévision : ' + (json as { error?: string }).error);
  return { ...parseSuperPrevision(json, registry, fetchedAt), raw: json, live: privateLive(json) };
}

/**
 * Dernier relevé Winds-Up par spot (t, v, o, panne) : PRIVÉ. Sert uniquement au recalage des moteurs dans la
 * même exécution (fichier de travail jamais publié, jamais versionné). Ne doit jamais entrer dans le bundle.
 */
export function privateLive(json: { live?: { spots?: Record<string, { t?: number; v?: number; o?: string; panne?: boolean }> } }) {
  const out: Record<string, { t?: number; v?: number; o?: string; panne?: boolean }> = {};
  for (const [id, x] of Object.entries(json.live?.spots ?? {})) out[id] = x.panne ? { panne: true } : { t: x.t, v: x.v, o: x.o };
  return { spots: out };
}
