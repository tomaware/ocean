// ③ REMISE EN QUESTION — exécution après l'analyse.
// Lit le bundle, met à jour l'archive des prévisions (data/state/archive.json, conservée sur la branche « data »),
// écrit data/v1/verify/scores.json et docs/quality/VERIFY_REPORT.md.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import type { Check, CollectBundle, ObservationBlock } from '../../src/types/contracts.ts';
import { loadRegistry } from '../collect/points.ts';
import { inputsFromBundle, runEngines } from '../engines/engines.ts';
import { LEADS, snapshot, updateArchive, verifyArchive, verifyShortTerm, type Archive, type Stat } from './verify.ts';

const ROOT = new URL('../../', import.meta.url);
const STATE = new URL('data/state/archive.json', ROOT);
const OUT = new URL('data/v1/verify/', ROOT);
const REPORT = new URL('docs/quality/VERIFY_REPORT.md', ROOT);

/** Calibration des moteurs par les mesures (ce qui « affine » la prévision), extraite du moteur surf. */
export function engineCalibration(bundle: CollectBundle, live: unknown) {
  const o = runEngines(inputsFromBundle(bundle, loadRegistry(), live, bundle.generatedAt));
  const surf = o.surfJSON.verification as Record<string, Record<string, { n: number; mae: number; bias: number; w: number | null; k: number | null; off: number }>>;
  const corr = o.downwindJSON.correction as { spot: string; hours: number; live: boolean; ratioMoy: number | null }[];
  return { surf, windCorrection: corr };
}

export function bestModels(scores: Record<string, Record<string, Stat>>, lead?: number) {
  const out: Record<string, { model: string; mae: number; n: number }[]> = {};
  for (const [st, byK] of Object.entries(scores)) {
    out[st] = Object.entries(byK).filter(([k]) => lead === undefined || k.endsWith('|' + lead))
      .map(([k, s]) => ({ model: k.split('|')[0], mae: s.mae, n: s.n })).sort((a, b) => a.mae - b.mae);
  }
  return out;
}

function main(): void {
  const bundle = JSON.parse(readFileSync(new URL('data/v1/collect/bundle.json', ROOT), 'utf8')) as CollectBundle;
  const prev = existsSync(STATE) ? (JSON.parse(readFileSync(STATE, 'utf8')) as Archive) : null;
  const arch = updateArchive(prev, snapshot(bundle));
  mkdirSync(new URL('./', STATE), { recursive: true });
  writeFileSync(STATE, JSON.stringify(arch));
  const obs = (id: string) => bundle.observations.find((o) => o.id === id) as ObservationBlock | undefined;
  const archived = verifyArchive(arch, obs('metar'), obs('candhis'));
  const short = verifyShortTerm(bundle);
  const livePath = new URL('data/private/super-prevision-live.json', ROOT);
  const cal = engineCalibration(bundle, existsSync(livePath) ? JSON.parse(readFileSync(livePath, 'utf8')) : null);

  const checks: Check[] = [];
  const nShortW = Object.values(short.wind).reduce((a, x) => a + Object.keys(x).length, 0), nShortH = Object.values(short.hs).reduce((a, x) => a + Object.keys(x).length, 0);
  checks.push({ id: 'court-terme', ok: nShortW > 0 && nShortH > 0, detail: `${nShortW} couples station × modèle (vent), ${nShortH} couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours` });
  const nArch = Object.values(archived.wind).reduce((a, x) => a + Object.values(x).reduce((b, s) => b + s.n, 0), 0) + Object.values(archived.hs).reduce((a, x) => a + Object.values(x).reduce((b, s) => b + s.n, 0), 0);
  const span = arch.snapshots.length ? Math.round((arch.snapshots[arch.snapshots.length - 1].run - arch.snapshots[0].run) / 3600e3) : 0;
  checks.push({ id: 'archive', ok: true, detail: `${arch.snapshots.length} prévisions archivées sur ${span} h ; ${nArch} comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet)` });
  const calN = Object.keys(cal.surf).length;
  checks.push({ id: 'calibration-moteurs', ok: calN > 0, detail: `moteur vagues recalé sur ${calN} bouée(s) ; vent downwind recalé sur ${cal.windCorrection.length} spot(s) de la super prévision` });

  const out = {
    generatedAt: bundle.generatedAt, leads: LEADS,
    note: 'Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.',
    courtTerme: short, archive: archived, calibration: cal,
    meilleurs: { ventCourtTerme: bestModels(short.wind), vaguesCourtTerme: bestModels(short.hs), vent24h: bestModels(archived.wind, 24), vagues24h: bestModels(archived.hs, 24) },
    checks,
  };
  mkdirSync(OUT, { recursive: true });
  writeFileSync(new URL('scores.json', OUT), JSON.stringify(out));
  mkdirSync(new URL('./', REPORT), { recursive: true });
  writeFileSync(REPORT, report(out));
  for (const c of checks) console.log(`[verif] ${c.ok ? 'OK ' : 'KO '} ${c.id} : ${c.detail}`);
}

function report(o: any): string {
  const kn = (ms: number) => (ms * 1.94384).toFixed(1).replace('.', ',');
  let s = `# Remise en question (③)\n\nGénéré le ${new Date(o.generatedAt).toISOString().replace('T', ' ').slice(0, 16)} UTC par \`pipeline/verify/run.ts\`.\n\n${o.note}\n\n## Contrôles\n\n| Contrôle | Résultat | Détail |\n|---|---|---|\n`;
  for (const c of o.checks) s += `| ${c.id} | ${c.ok ? '✅' : '⚠️'} | ${c.detail} |\n`;
  s += `\n## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)\n\n| Station | Classement |\n|---|---|\n`;
  for (const [st, arr] of Object.entries(o.meilleurs.ventCourtTerme as Record<string, any[]>)) s += `| ${st} | ${arr.map((x) => `${x.model} ${kn(x.mae)}`).join(' · ')} |\n`;
  s += `\n## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)\n\n| Bouée | Classement |\n|---|---|\n`;
  for (const [st, arr] of Object.entries(o.meilleurs.vaguesCourtTerme as Record<string, any[]>)) s += `| ${st} | ${arr.map((x) => `${x.model} ${x.mae.toFixed(2)}`).join(' · ')} |\n`;
  s += `\n## Ce que les moteurs en font\n\n- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).\n`;
  for (const [b, ms] of Object.entries(o.calibration.surf as Record<string, Record<string, any>>)) s += `  - ${b} : ${Object.entries(ms).map(([m, v]) => `${m} poids ${v.w ?? '—'}, ×${v.k ?? '—'} (MAE ${v.mae} m, n ${v.n})`).join(' ; ')}\n`;
  s += `- Vent downwind : ${o.calibration.windCorrection.map((c: any) => `${c.spot} × ${c.ratioMoy}`).join(', ') || 'pas de correction'} (super prévision + relevé récent).\n`;
  s += `\n## Prévisions archivées (vraie échéance)\n\n${o.archive.runs} prévisions archivées. ` + (Object.keys(o.meilleurs.vent24h).some((k) => o.meilleurs.vent24h[k].length) ? 'Classement à 24 h :\n\n' + Object.entries(o.meilleurs.vent24h as Record<string, any[]>).map(([st, a]) => `- ${st} : ${a.map((x) => `${x.model} ${kn(x.mae)} nd (n ${x.n})`).join(' · ')}`).join('\n') + '\n' : 'Pas encore assez de recul pour l\'échéance 24 h.\n');
  return s;
}

if (import.meta.url === `file://${process.argv[1]}`) main();
