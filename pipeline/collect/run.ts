// ① COLLECTE — exécution horaire.
// Écrit data/v1/collect/bundle.json (toutes les séries normalisées, publiées) et docs/quality/COLLECT_REPORT.md.
// Usage : node pipeline/collect/run.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import type { Check, CollectBundle, ForecastBlock, ObservationBlock, SourceStatus } from '../../src/types/contracts.ts';
import { collectPlan, loadRegistry } from './points.ts';
import { collectOpenMeteo, ENGINE_WIND_MODELS, MARINE_VARS, marineUrl, SPOT_WIND_MODELS, WAVE_MODELS, WIND_VARS, windUrl } from './openmeteo.ts';
import { collectCandhis } from './candhis.ts';
import { collectSuperPrevision } from './superprevision.ts';
import { collectMetar } from './metar.ts';
import { coverage, coverageSuper, fidelityMarine, fidelityWind, freshness, hourlyGrid, modelAvailability, privacy } from './checks.ts';

const OUT = new URL('../../data/v1/collect/', import.meta.url);
const REPORT = new URL('../../docs/quality/COLLECT_REPORT.md', import.meta.url);
// Fichiers de travail PRIVÉS (réponses brutes pour les tests golden, relevés Winds-Up pour le recalage) :
// ignorés par git, jamais archivés ni publiés.
const PRIVATE = new URL('../../data/private/', import.meta.url);
function keepPrivate(name: string, data: unknown): void {
  mkdirSync(PRIVATE, { recursive: true });
  writeFileSync(new URL(name, PRIVATE), JSON.stringify(data));
}

async function step<T>(id: string, fn: () => Promise<T & { stats?: Partial<SourceStatus> }>, status: SourceStatus[], describe: (r: T) => Partial<SourceStatus>): Promise<T | null> {
  const t0 = Date.now();
  try {
    const r = await fn();
    status.push({ id, ok: true, message: 'ok', durationMs: Date.now() - t0, points: 0, models: [], values: 0, missing: 0, rejected: 0, ...(r.stats ?? {}), ...describe(r) });
    return r;
  } catch (e) {
    status.push({ id, ok: false, message: (e as Error).message.slice(0, 300), durationMs: Date.now() - t0, points: 0, models: [], values: 0, missing: 0, rejected: 0 });
    console.error(`[collecte] ${id} : ÉCHEC ${(e as Error).message}`);
    return null;
  }
}

const span = (b: ForecastBlock) => ({ first: b.times[0], last: b.times[b.times.length - 1], points: Object.keys(b.values).length, models: b.models });

async function main(): Promise<void> {
  const now = Date.now();
  const registry = loadRegistry();
  const plan = collectPlan(registry);
  const status: SourceStatus[] = [];
  const checks: Check[] = [];
  const forecasts: ForecastBlock[] = [];
  const observations: ObservationBlock[] = [];
  const secretUrl = (process.env.SUPER_PREVISION_URL ?? '').trim();

  const marine = await step('open-meteo-marine', () => collectOpenMeteo('open-meteo-marine', marineUrl(plan.marine), plan.marine, MARINE_VARS, WAVE_MODELS), status, (r) => span(r.block));
  if (marine) {
    forecasts.push(marine.block);
    keepPrivate('raw-open-meteo-marine.json', marine.json);
    checks.push(fidelityMarine(marine.json, plan.marine, marine.block), hourlyGrid(marine.block, now), coverage(marine.block, 'wave_height', now), modelAvailability(marine.block, 'wave_height', now));
  }
  const wind = await step('open-meteo-vent-moteurs', () => collectOpenMeteo('open-meteo-vent-moteurs', windUrl(plan.engineWind, ENGINE_WIND_MODELS), plan.engineWind, WIND_VARS, ENGINE_WIND_MODELS), status, (r) => span(r.block));
  if (wind) {
    forecasts.push(wind.block);
    keepPrivate('raw-open-meteo-vent-moteurs.json', wind.json);
    checks.push(fidelityWind(wind.json, plan.engineWind, wind.block), hourlyGrid(wind.block, now), coverage(wind.block, 'wind_speed_10m', now), modelAvailability(wind.block, 'wind_speed_10m', now));
  }
  const spots = await step('open-meteo-vent-spots', () => collectOpenMeteo('open-meteo-vent-spots', windUrl(plan.windSpots, SPOT_WIND_MODELS), plan.windSpots, WIND_VARS, SPOT_WIND_MODELS), status, (r) => span(r.block));
  if (spots) { forecasts.push(spots.block); checks.push(hourlyGrid(spots.block, now), coverage(spots.block, 'wind_speed_10m', now), modelAvailability(spots.block, 'wind_speed_10m', now)); }

  if (secretUrl) {
    const sp = await step('super-prevision', () => collectSuperPrevision(secretUrl, registry), status, (r) => ({ ...span(r.block), points: r.stats.points }));
    if (sp) { forecasts.push(sp.block); checks.push(coverageSuper(sp.block, now)); keepPrivate('super-prevision-live.json', sp.live); keepPrivate('raw-super-prevision-spots.json', { spots: sp.raw.spots ?? {} }); }
  } else {
    status.push({ id: 'super-prevision', ok: false, message: 'secret SUPER_PREVISION_URL absent', durationMs: 0, points: 0, models: [], values: 0, missing: 0, rejected: 0 });
  }

  const candhis = await step('candhis', () => collectCandhis(registry, now - 30 * 86400e3 /* = verification.maxAgeDays des moteurs */), status, (r) => ({ points: Object.keys(r.block.stations).length }));
  if (candhis) {
    observations.push(candhis.block);
    keepPrivate('raw-candhis.json', candhis.raw);
    const live = registry.buoys.filter((b) => b.status === 'en service' && !b.nearshore).map((b) => b.code);
    checks.push(freshness(candhis.block, 180, live));
  }
  const metar = await step('metar', () => collectMetar(registry), status, (r) => ({ points: Object.keys(r.block.stations).length }));
  if (metar) { observations.push(metar.block); checks.push(freshness(metar.block, 120)); }

  const bundle: CollectBundle = { version: 1, generatedAt: now, points: [...plan.marine, ...plan.engineWind, ...plan.windSpots], forecasts, observations, status, checks };
  checks.push(privacy(bundle, [secretUrl]));

  mkdirSync(OUT, { recursive: true });
  writeFileSync(new URL('bundle.json', OUT), JSON.stringify(bundle));
  writeFileSync(new URL('status.json', OUT), JSON.stringify({ generatedAt: now, status, checks }, null, 1));
  mkdirSync(new URL('./', REPORT), { recursive: true });
  writeFileSync(REPORT, report(bundle));

  const failed = checks.filter((c) => !c.ok);
  for (const s of status) console.log(`[collecte] ${s.ok ? 'OK ' : 'KO '} ${s.id.padEnd(24)} ${s.points} pts · ${s.models.length} modèles · ${s.values} valeurs (${s.missing} manquantes, ${s.rejected} rejetées) · ${s.durationMs} ms${s.ok ? '' : ' · ' + s.message}`);
  for (const c of checks) console.log(`[contrôle] ${c.ok ? 'OK ' : 'KO '} ${c.id} : ${c.detail}`);
  console.log(`[collecte] bundle ${(JSON.stringify(bundle).length / 1e6).toFixed(2)} Mo ; ${failed.length} contrôle(s) en échec`);
  // Une source en panne n'arrête pas la chaîne ; une fuite de données privées, si.
  if (checks.some((c) => c.id === 'confidentialite' && !c.ok)) process.exit(2);
}

function report(b: CollectBundle): string {
  const d = (t?: number) => (t ? new Date(t).toISOString().replace('T', ' ').slice(0, 16) + ' UTC' : '—');
  let s = `# Rapport de collecte (① COLLECTE)\n\nGénéré le ${d(b.generatedAt)} par \`pipeline/collect/run.ts\` (GitHub Actions, toutes les heures).\n\n## Sources\n\n| Source | État | Points | Modèles | Valeurs | Manquantes | Rejetées | Période | Durée |\n|---|---|---|---|---|---|---|---|---|\n`;
  for (const x of b.status) {
    s += `| ${x.id} | ${x.ok ? '✅' : '❌ ' + x.message.replace(/\|/g, '/')} | ${x.points} | ${x.models.join(', ') || '—'} | ${x.values} | ${x.missing} | ${x.rejected} | ${x.first ? d(x.first) + ' → ' + d(x.last) : '—'} | ${(x.durationMs / 1000).toFixed(1)} s |\n`;
  }
  s += `\n## Contrôles\n\n| Contrôle | Résultat | Détail |\n|---|---|---|\n`;
  for (const c of b.checks) s += `| ${c.id} | ${c.ok ? '✅' : '⚠️'} | ${c.detail.replace(/\|/g, '/')} |\n`;
  s += `\nUnités stockées : m/s, m, s, degrés, °C ; heures UTC. Les relevés Winds-Up ne sont jamais collectés ici (mode perso uniquement).\n`;
  return s;
}

main().catch((e) => { console.error('[collecte] échec global :', e); process.exit(1); });
