// ② ANALYSE — exécution après la collecte (même job).
// Lit data/v1/collect/bundle.json, fait tourner les moteurs surf et downwind, écrit data/v1/engines/*.json
// et docs/quality/ENGINES_REPORT.md. Test golden : mêmes notes que les apps actuelles à ±0,1 sur les mêmes données.
// Usage : node pipeline/engines/run.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import type { Check, CollectBundle } from '../../src/types/contracts.ts';
import { loadRegistry } from '../collect/points.ts';
import { compareOutputs, inputsFromBundle, inputsLegacy, runEngines, usesCopernicus } from './engines.ts';
import { label, wingForecast, type ModelRanking } from './wing.ts';
import { verifyShortTerm } from '../verify/verify.ts';

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

async function main(): Promise<void> {
  const bundle = JSON.parse(readFileSync(new URL('data/v1/collect/bundle.json', ROOT), 'utf8')) as CollectBundle;
  const registry = loadRegistry();
  const now = bundle.generatedAt;
  const live = readPrivate('super-prevision-live.json');
  const checks: Check[] = [];

  const ocean = runEngines(inputsFromBundle(bundle, registry, live, now));
  const raw = { marine: readPrivate('raw-open-meteo-marine.json'), wind: readPrivate('raw-open-meteo-vent-moteurs.json'), candhis: readPrivate('raw-candhis.json') ?? {}, superSpots: readPrivate('raw-super-prevision-spots.json'), live, copernicus: readPrivate('raw-copernicus.json') };
  let golden: ReturnType<typeof compareOutputs> | null = null;
  if (raw.marine && raw.wind) {
    golden = compareOutputs(ocean, runEngines(inputsLegacy(raw, registry, now)));
    checks.push({ id: 'golden-surf', ok: golden.surf.max <= TOL && golden.surf.windowsSame && golden.surf.n > 0, detail: golden.surf.detail + ` (tolérance ${TOL})` });
    checks.push({ id: 'golden-downwind', ok: golden.downwind.max <= TOL && golden.downwind.windowsSame && golden.downwind.n > 0, detail: golden.downwind.detail + ` (tolérance ${TOL})` });
  } else checks.push({ id: 'golden', ok: false, detail: 'réponses brutes absentes (data/private) : lancer la collecte dans le même job' });

  const sp = bundle.forecasts.find((f) => f.id === 'super-prevision');
  const corr = ocean.downwindJSON.correction as { spot: string; hours: number; live: boolean; ratioMoy: number | null }[];
  checks.push({ id: 'correction-vent-downwind', ok: !sp || corr.length > 0,
    detail: sp ? `${corr.length} spot(s) de recalage : ` + corr.map((c) => `${c.spot} ${c.hours} h (× ${c.ratioMoy} en moyenne)${c.live ? ' + relevé récent' : ''}`).join(', ') : 'super prévision absente → vent AROME / ECMWF brut' });
  const surfN = ocean.surfJSON.spots.filter((s: any) => s.h.score.some((x: number | null) => x !== null)).length;
  checks.push({ id: 'sorties-surf', ok: surfN === ocean.surfJSON.spots.length, detail: `${surfN}/${ocean.surfJSON.spots.length} spots notés ; ${ocean.surfJSON.windows.length} créneaux` });
  const dwN = ocean.downwindJSON.runs.filter((r: any) => r.hours.length > 0).length;
  const swN = ocean.downwindJSON.runs.reduce((a: number, r: any) => a + (r.swellDir ?? []).filter((d: number | null) => d !== null).length, 0);
  const hN = ocean.downwindJSON.runs.reduce((a: number, r: any) => a + r.hours.length, 0);
  checks.push({ id: 'houle-direction-downwind', ok: hN > 0 && swN >= hN * 0.9, detail: `direction de la houle (affichage, carte) : ${swN}/${hN} heures` });
  checks.push({ id: 'sorties-downwind', ok: dwN === ocean.downwindJSON.runs.length, detail: `${dwN}/${ocean.downwindJSON.runs.length} parcours notés ; ${ocean.downwindJSON.best.length} meilleurs créneaux` });

  const copB = bundle.forecasts.find((f) => f.id === 'copernicus-medwav');
  checks.push(...(await vsProduction(ocean, now, copB?.provenance.issuedAt ?? null)));

  // spots hors super prévision (étang de Berre, D-22) : modèle le plus juste aux METAR des 3 derniers jours
  const ranking = verifyShortTerm(bundle).wind as ModelRanking;
  const wing = wingForecast(sp, registry, now, { block: bundle.forecasts.find((f) => f.id === 'open-meteo-vent-spots'), ranking });
  const nSess = wing.spots.reduce((a, x) => a + x.sessions.secu.length, 0);
  const nWing = registry.spots.filter((x) => x.disciplines.includes('wing')).length;
  for (const x of wing.spots.filter((y) => (y.source as { kind: string }).kind === 'forecast')) {
    const src = x.source as { model: string; station: string; ranked: boolean; mae: number | null; n: number };
    checks.push({ id: 'vent-' + x.id, ok: src.ranked && x.hours.length > 0, detail: `${x.name} : ${src.model}${src.ranked ? `, le plus juste à ${src.station} (erreur ${src.mae} m/s sur ${src.n} mesures)` : ` (classement à ${src.station} indisponible)`} ; ${x.hours.length} heures ; vent non corrigé` });
  }
  checks.push({ id: 'sorties-wing', ok: wing.available && wing.spots.length === nWing && wing.spots.every((x) => x.hours.length > 0),
    detail: wing.available ? `${wing.spots.length} spots notés (wing v${wing.version}) ; ${nSess} session(s) 2H en mode Sécu first sur les heures prévues` : String((wing as { reason?: string }).reason) });

  const surfText = JSON.stringify(ocean.surfJSON), dwText = JSON.stringify(ocean.downwindJSON) + JSON.stringify(wing);
  checks.push(privacyEngines(surfText + dwText, live, [(process.env.SUPER_PREVISION_URL ?? '').trim()]));

  mkdirSync(OUT, { recursive: true });
  const copUsed = usesCopernicus(inputsFromBundle(bundle, registry, live, now).surf.marine);
  const prov = { generatedAt: now, collect: 'data/v1/collect/bundle.json', engines: { surf: 'super-previ-surf surf-engine.js (legacy, non modifié)', downwind: 'downwind-foil downwind-engine.js v1.1 (legacy, non modifié)' }, note: copUsed ? 'Prévisions calculées ; vagues surf avec Copernicus Med-WAV (E.U. Copernicus Marine Service).' : 'Prévisions calculées ; Copernicus absent ou trop ancien pour cette exécution.' };
  checks.push({ id: 'copernicus-surf', ok: copUsed, detail: copUsed ? 'Copernicus Med-WAV inclus dans le moteur surf (comme l’app en service)' : 'Copernicus non utilisé (extrait absent ou de plus de 30 h)' });
  writeFileSync(new URL('surf.json', OUT), JSON.stringify({ provenance: prov, ...ocean.surfJSON }));
  writeFileSync(new URL('downwind.json', OUT), JSON.stringify({ provenance: prov, ...ocean.downwindJSON }));
  writeFileSync(new URL('wing.json', OUT), JSON.stringify(wing));
  writeFileSync(new URL('status.json', OUT), JSON.stringify({ generatedAt: now, checks }, null, 1));
  mkdirSync(new URL('./', REPORT), { recursive: true });
  writeFileSync(REPORT, report(now, checks, ocean, wing));

  for (const c of checks) console.log(`[analyse] ${c.ok ? 'OK ' : 'KO '} ${c.id} : ${c.detail}`);
  if (checks.some((c) => c.id === 'confidentialite-moteurs' && !c.ok)) process.exit(2);
  if (checks.some((c) => c.id.startsWith('golden') && !c.ok)) process.exit(3);
}

// Production actuelle (information) : les apps en service tournent à d'autres minutes, avec d'autres horizons
// (downwind : 5 jours) et Copernicus pour le surf. Les écarts attendus sont faibles mais pas nuls.
export const PROD = { surf: 'https://tomaware.github.io/super-previ-surf/data/forecast.json', downwind: 'https://raw.githubusercontent.com/tomaware/downwind-foil/main/data/downwind.json' };
async function vsProduction(o: ReturnType<typeof runEngines>, now: number, copIssued: number | null): Promise<Check[]> {
  const get = async (u: string) => { try { const r = await fetch(u, { headers: { 'User-Agent': 'ocean-pipeline' } }); return r.ok ? await r.json() : null; } catch { return null; } };
  const [ps, pd] = await Promise.all([get(PROD.surf), get(PROD.downwind)]);
  const hm = (t: number) => new Date(t).toLocaleString('fr-FR', { timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit' });
  const stats = (pairs: [number, number, string?][]) => {
    const d = pairs.map(([a, b]) => Math.abs(a - b)).sort((x, y) => x - y);
    const worst = pairs.reduce((w, p) => (Math.abs(p[0] - p[1]) > Math.abs(w[0] - w[1]) ? p : w), pairs[0]);
    return d.length ? `médiane ${d[Math.floor(d.length / 2)].toFixed(2)}, 90 % ≤ ${d[Math.floor(d.length * 0.9)].toFixed(2)}, max ${d[d.length - 1].toFixed(2)} sur ${d.length} heures${worst?.[2] ? ` (max : ${worst[2]}, OCEAN ${worst[0]} / prod ${worst[1]})` : ''}` : 'aucune heure commune';
  };
  const age = (g: string | number | undefined) => (g ? `calcul prod. ${Math.round((now - (typeof g === 'number' ? g : Date.parse(g))) / 60000)} min avant` : 'date inconnue');
  const out: Check[] = [];
  if (ps?.spots) {
    const pairs: [number, number, string][] = [];
    for (const s of o.surfJSON.spots) {
      const p = ps.spots.find((x: any) => x.id === s.id); if (!p) continue;
      const idx = new Map<number, number>(p.h.t.map((t: number, i: number) => [t, i]));
      s.h.t.forEach((t: number, i: number) => { const j = idx.get(t); if (t >= now && j !== undefined && s.h.score[i] !== null && p.h.score[j] !== null) pairs.push([s.h.score[i], p.h.score[j], `${s.id} ${hm(t)}`]); });
    }
    // Les deux calculs ne partent pas forcément des mêmes entrées : l'app tourne à une autre minute et peut utiliser
    // un autre extrait Copernicus (renouvelé toutes les 3 h). On le dit, pour lire l'écart correctement.
    const pc = ps.sources?.copernicus?.generated ? Date.parse(ps.sources.copernicus.generated) : null;
    const copNote = !pc ? 'prod sans Copernicus' : copIssued === pc ? 'même extrait Copernicus' : `extraits Copernicus différents (prod ${hm(pc)}, OCEAN ${copIssued ? hm(copIssued) : 'aucun'}) : écart attendu`;
    out.push({ id: 'ecart-prod-surf', ok: true, detail: `notes surf OCEAN vs app en service (${age(ps.generated)}, ${copNote}) : ` + stats(pairs) });
  } else out.push({ id: 'ecart-prod-surf', ok: true, detail: 'prévision de l’app surf en service illisible' });
  if (pd?.runs) {
    const pairs: [number, number][] = [];
    for (const r of o.downwindJSON.runs) {
      const p = pd.runs.find((x: any) => x.id === r.id); if (!p) continue;
      const idx = new Map<number, number[]>(p.hours.map((h: number[]) => [h[0], h]));
      r.hours.forEach((h: number[]) => { const q = idx.get(h[0]); if (h[0] >= now && q && h[13]) pairs.push([h[11], q[11]]); });
    }
    out.push({ id: 'ecart-prod-downwind', ok: true, detail: `notes downwind (intermédiaire, de jour) OCEAN vs app en service (${age(pd.generated)}) : ` + stats(pairs) });
  } else out.push({ id: 'ecart-prod-downwind', ok: true, detail: 'prévision de l’app downwind en service illisible' });
  return out;
}

function report(now: number, checks: Check[], o: ReturnType<typeof runEngines>, wing: ReturnType<typeof wingForecast>): string {
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
  s += `\n## Wing foil — sessions 2H (mode Sécu first, vent corrigé de la super prévision)\n\n| Spot | Créneaux |\n|---|---|\n`;
  for (const x of wing.spots) s += `| ${x.name} | ${x.sessions.secu.map((w) => `${d(w.start)} → ${d(w.end)} : ${label(w.peak)} (moy. ${w.mean}, pic ${w.peak})`).join(' ; ') || 'aucun'} |\n`;
  s += `\n### Détail (toutes les 2 h de jour, Sécu first)\n\nVent en nœuds (rafales) · d'où il vient · secteur · note · ce qui limite.\n\n`;
  const DIR = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
  for (const x of wing.spots) {
    const rows = x.hours.filter((h) => h.day && h.t >= now && new Date(h.t).getUTCHours() % 2 === 0);
    s += `**${x.name}** — ` + (rows.map((h) => `${d(h.t)} ${Math.round(h.kn ?? 0)} (${h.gust === null ? '—' : Math.round(h.gust)}) ${h.dir === null ? '?' : DIR[Math.round(h.dir / 22.5) % 16]} ${h.sector ?? ''} **${h.scores.secu}**${h.limit.secu ? ' ' + h.limit.secu : ''}`).join(' · ') || 'aucune heure') + `\n\n`;
  }
  s += `\nCopernicus Med-WAV est inclus pour le surf quand l'extrait a moins de 30 h (même règle que l'app en service) ; la note wing (v2.0, modes Sécu first / Offshore) part du vent corrigé de la super prévision ; pas de note kite (décision de Tom).\n`;
  return s;
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error('[analyse] échec :', e); process.exit(1); });
