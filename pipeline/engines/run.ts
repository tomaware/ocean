// ② ANALYSE — exécution après la collecte (même job).
// Lit data/v1/collect/bundle.json, fait tourner les moteurs surf et downwind, écrit data/v1/engines/*.json
// et docs/quality/ENGINES_REPORT.md. Test golden : mêmes notes que les apps actuelles à ±0,1 sur les mêmes données.
// Usage : node pipeline/engines/run.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import type { Check, CollectBundle } from '../../src/types/contracts.ts';
import { loadRegistry } from '../collect/points.ts';
import { compareOutputs, inputsFromBundle, inputsLegacy, runEngines } from './engines.ts';

const ROOT = new URL('../../', import.meta.url);
const OUT = new URL('data/v1/engines/', ROOT);
const PRIVATE = new URL('data/private/', ROOT);
const REPORT = new URL('docs/quality/ENGINES_REPORT.md', ROOT);
const TOL = 0.1;

const readPrivate = (name: string) => { const u = new URL(name, PRIVATE); return existsSync(u) ? JSON.parse(readFileSync(u, 'utf8')) : null; };

/** Aucune valeur privée dans les sorties : ni horodatage d'un relevé Winds-Up, ni clé, ni URL privée. */
export function privacyEngines(text: string, live: { spots?: Record<string, { t?: number }> } | null, secrets: string[]): Check {
  const leaks: string[] = [];
  for (const [id, x] of Object.entries(live?.spots ?? {})) if (x.t && x.t % 3600e3 !== 0 && text.includes(String(x.t))) leaks.push('horodatage du relevé ' + id);
  if (/script\.google(usercontent)?\.com/.test(text)) leaks.push('URL Apps Script');
  if (/winds-up\.com/i.test(text)) leaks.push('URL Winds-Up');
  if (/[?&](key|apikey|token)=/i.test(text)) leaks.push('paramètre de clé');
  for (const s of secrets) if (s && s.length > 8 && text.includes(s)) leaks.push('un secret');
  return { id: 'confidentialite-moteurs', ok: leaks.length === 0, detail: leaks.length ? 'FUITE : ' + leaks.join(', ') : 'aucun relevé Winds-Up ni clé dans les sorties (seuls les facteurs de correction dérivés y figurent, comme dans l’app downwind actuelle)' };
}

function main(): void {
  const bundle = JSON.parse(readFileSync(new URL('data/v1/collect/bundle.json', ROOT), 'utf8')) as CollectBundle;
  const registry = loadRegistry();
  const now = bundle.generatedAt;
  const live = readPrivate('super-prevision-live.json');
  const checks: Check[] = [];

  const ocean = runEngines(inputsFromBundle(bundle, registry, live, now));
  const raw = { marine: readPrivate('raw-open-meteo-marine.json'), wind: readPrivate('raw-open-meteo-vent-moteurs.json'), candhis: readPrivate('raw-candhis.json') ?? {}, superSpots: readPrivate('raw-super-prevision-spots.json'), live };
  let golden: ReturnType<typeof compareOutputs> | null = null;
  if (raw.marine && raw.wind) {
    golden = compareOutputs(ocean, runEngines(inputsLegacy(raw, registry, now)));
    checks.push({ id: 'golden-surf', ok: golden.surf.max <= TOL && golden.surf.windowsSame && golden.surf.n > 0, detail: golden.surf.detail + ` (tolérance ${TOL})` });
    checks.push({ id: 'golden-downwind', ok: golden.downwind.max <= TOL && golden.downwind.windowsSame && golden.downwind.n > 0, detail: golden.downwind.detail + ` (tolérance ${TOL})` });
  } else checks.push({ id: 'golden', ok: false, detail: 'réponses brutes absentes (data/private) : lancer la collecte dans le même job' });

  const sp = bundle.forecasts.find((f) => f.id === 'super-prevision');
  const corr = ocean.downwindJSON.correction as { name: string; hours: number; live: boolean }[];
  checks.push({ id: 'correction-vent-downwind', ok: !sp || corr.length > 0,
    detail: sp ? `${corr.length} spot(s) de recalage : ` + corr.map((c) => `${c.name} ${c.hours} h${c.live ? ' + relevé' : ''}`).join(', ') : 'super prévision absente → vent AROME / ECMWF brut' });
  const surfN = ocean.surfJSON.spots.filter((s: any) => s.h.score.some((x: number | null) => x !== null)).length;
  checks.push({ id: 'sorties-surf', ok: surfN === ocean.surfJSON.spots.length, detail: `${surfN}/${ocean.surfJSON.spots.length} spots notés ; ${ocean.surfJSON.windows.length} créneaux` });
  const dwN = ocean.downwindJSON.runs.filter((r: any) => r.hours.length > 0).length;
  checks.push({ id: 'sorties-downwind', ok: dwN === ocean.downwindJSON.runs.length, detail: `${dwN}/${ocean.downwindJSON.runs.length} parcours notés ; ${ocean.downwindJSON.best.length} meilleurs créneaux` });

  const surfText = JSON.stringify(ocean.surfJSON), dwText = JSON.stringify(ocean.downwindJSON);
  checks.push(privacyEngines(surfText + dwText, live, [(process.env.SUPER_PREVISION_URL ?? '').trim()]));

  mkdirSync(OUT, { recursive: true });
  const prov = { generatedAt: now, collect: 'data/v1/collect/bundle.json', engines: { surf: 'super-previ-surf surf-engine.js (legacy, non modifié)', downwind: 'downwind-foil downwind-engine.js v1.1 (legacy, non modifié)' }, note: 'Prévisions calculées ; Copernicus non inclus à ce stade (M2).' };
  writeFileSync(new URL('surf.json', OUT), JSON.stringify({ provenance: prov, ...ocean.surfJSON }));
  writeFileSync(new URL('downwind.json', OUT), JSON.stringify({ provenance: prov, ...ocean.downwindJSON }));
  writeFileSync(new URL('status.json', OUT), JSON.stringify({ generatedAt: now, checks }, null, 1));
  mkdirSync(new URL('./', REPORT), { recursive: true });
  writeFileSync(REPORT, report(now, checks, ocean));

  for (const c of checks) console.log(`[analyse] ${c.ok ? 'OK ' : 'KO '} ${c.id} : ${c.detail}`);
  if (checks.some((c) => c.id === 'confidentialite-moteurs' && !c.ok)) process.exit(2);
  if (checks.some((c) => c.id.startsWith('golden') && !c.ok)) process.exit(3);
}

function report(now: number, checks: Check[], o: ReturnType<typeof runEngines>): string {
  const d = (t: number) => new Date(t).toLocaleString('fr-FR', { timeZone: 'Europe/Paris', weekday: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  let s = `# Rapport d'analyse (② ANALYSE)\n\nGénéré le ${new Date(now).toISOString().replace('T', ' ').slice(0, 16)} UTC par \`pipeline/engines/run.ts\`, juste après la collecte.\n\n`;
  s += `Les moteurs des apps actuelles (copies non modifiées dans \`legacy/\`) sont alimentés par la collecte commune. Le test golden refait le calcul comme les apps actuelles, avec leurs propres parseurs sur les mêmes réponses brutes, et exige les mêmes notes à ±${TOL}.\n\n`;
  s += `## Contrôles\n\n| Contrôle | Résultat | Détail |\n|---|---|---|\n`;
  for (const c of checks) s += `| ${c.id} | ${c.ok ? '✅' : '⚠️'} | ${c.detail.replace(/\|/g, '/')} |\n`;
  s += `\n## Meilleurs créneaux surf (7 jours)\n\n| Quand | Spot | Note moyenne | Pic |\n|---|---|---|---|\n`;
  const name = Object.fromEntries(o.surfJSON.spots.map((x: any) => [x.id, x.name]));
  for (const w of o.surfJSON.windows.slice(0, 5)) s += `| ${d(w.start)} → ${d(w.end)} | ${name[w.spot] ?? w.spot} | ${w.mean} | ${w.peak} |\n`;
  s += `\n## Meilleurs créneaux downwind (4 jours)\n\n| Quand | Parcours | Note moyenne | Pic |\n|---|---|---|---|\n`;
  for (const w of o.downwindJSON.best.slice(0, 5)) s += `| ${d(w.start)} → ${d(w.end)} | ${w.from} → ${w.to} | ${w.mean} | ${w.peak} |\n`;
  s += `\nÀ ce stade (M2) : Copernicus n'est pas inclus (les apps actuelles l'utilisent quand il est frais) ; le vent wing/kite reste celui de la super prévision (Apps Script), en attendant la formule de note validée (D-14).\n`;
  return s;
}

if (import.meta.url === `file://${process.argv[1]}`) main();
