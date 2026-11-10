// ⑤ PUBLICATION — données publiques lues par l'interface (data/v1/public/), après collecte, analyse et vérification.
// Rien de privé : contrôle de confidentialité bloquant sur l'ensemble des fichiers publiés.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import type { Check } from '../../src/types/contracts.ts';
import { loadRegistry } from '../collect/points.ts';
import { privacyEngines } from '../engines/run.ts';
import { allSessions, bestByDiscipline, LEVELS, publicSpots } from './sessions.ts';

const ROOT = new URL('../../', import.meta.url);
const OUT = new URL('data/v1/public/', ROOT);
const read = (p: string) => JSON.parse(readFileSync(new URL(p, ROOT), 'utf8'));
const opt = (p: string) => (existsSync(new URL(p, ROOT)) ? read(p) : null);

export function publicPrivacy(files: Record<string, string>, live: any, secrets: string[], legacyWindIds: string[]): Check {
  const all = Object.values(files).join('\n');
  const base = privacyEngines(all, live, secrets);
  const extra: string[] = [];
  if (/"live"\s*:\s*\{/.test(all)) extra.push('bloc « live »');
  if (/windsUp/i.test(all)) extra.push('identifiant Winds-Up');
  for (const id of legacyWindIds) if (all.includes(id)) extra.push('identifiant de balise ' + id);
  const ok = base.ok && extra.length === 0;
  return { id: 'confidentialite-publication', ok, detail: ok ? `${Object.keys(files).length} fichiers publiés vérifiés : aucun relevé Winds-Up, aucune clé, aucun identifiant de balise` : 'FUITE : ' + [base.ok ? '' : base.detail, ...extra].filter(Boolean).join(', ') };
}

function main(): void {
  const registry = loadRegistry();
  const collect = read('data/v1/collect/status.json'), engines = read('data/v1/engines/status.json'), verify = opt('data/v1/verify/scores.json');
  const surf = read('data/v1/engines/surf.json'), downwind = read('data/v1/engines/downwind.json'), wing = read('data/v1/engines/wing.json');
  const now = collect.generatedAt as number;
  const sessions = allSessions({ wing, surf, downwind }, now);
  const best = Object.fromEntries(LEVELS.map((L) => [L, bestByDiscipline(sessions, L)]));
  const checks: Check[] = [...collect.checks, ...engines.checks, ...(verify?.checks ?? [])];
  const meta = {
    generatedAt: now, version: 1,
    sources: collect.status.map((s: any) => ({ id: s.id, ok: s.ok, message: s.ok ? 'ok' : s.message, points: s.points, models: s.models, lastObservationAgeMin: s.lastObservationAgeMin ?? null })),
    checks: checks.map((c) => ({ id: c.id, ok: c.ok, detail: c.detail })),
    disciplines: {
      wing: { available: !!wing.available, source: 'Vent corrigé de la super prévision (modèles pondérés par leur erreur aux balises)', note: 'Note wing v' + wing.version },
      surf: { available: true, source: surf.sources?.copernicus ? 'Moteur Super Prévi Surf : 6 modèles de vagues dont Copernicus Med-WAV (4,2 km), recalés sur les bouées Candhis ; vent AROME / ECMWF' : 'Moteur Super Prévi Surf : 5 modèles de vagues recalés sur les bouées Candhis, vent AROME / ECMWF (Copernicus indisponible pour cette mise à jour)', note: surf.sources?.copernicus ? 'Generated using E.U. Copernicus Marine Service Information' : 'Copernicus absent ou trop ancien' },
      downwind: { available: true, source: 'Moteur downwind : vent AROME / ECMWF recalé sur la super prévision, houle au large (5 modèles)', note: '' },
    },
    rules: { session: 'au moins 2 h d’affilée à 5/10 ou plus, de jour', labels: { top: 'Ça envoie (≥ 7)', ok: 'Ça se tente (5 à 7)', no: 'Non (< 5)' } },
  };
  const files: Record<string, string> = {
    'meta.json': JSON.stringify(meta),
    'spots.json': JSON.stringify(publicSpots(registry)),
    'sessions.json': JSON.stringify({ generatedAt: now, sessions, best }),
    'wing.json': JSON.stringify(wing),
    'surf.json': JSON.stringify(surf),
    'downwind.json': JSON.stringify(downwind),
    'verify.json': JSON.stringify(verify ?? { generatedAt: now, unavailable: true }),
  };
  const live = opt('data/private/super-prevision-live.json');
  const legacyIds = registry.spots.map((s) => s.legacy.superPrevisionVent).filter(Boolean) as string[];
  const priv = publicPrivacy(files, live, [(process.env.SUPER_PREVISION_URL ?? '').trim()], legacyIds);
  console.log(`[publication] ${priv.ok ? 'OK ' : 'KO '} ${priv.id} : ${priv.detail}`);
  if (!priv.ok) process.exit(2);
  mkdirSync(OUT, { recursive: true });
  let total = 0;
  for (const [k, v] of Object.entries(files)) { writeFileSync(new URL(k, OUT), v); total += v.length; }
  const n = (d: string) => sessions.filter((s) => s.discipline === d).length;
  console.log(`[publication] ${Object.keys(files).length} fichiers, ${(total / 1e6).toFixed(2)} Mo ; sessions : wing ${n('wing')}, surf ${n('surf')}, downwind ${n('downwind')}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
