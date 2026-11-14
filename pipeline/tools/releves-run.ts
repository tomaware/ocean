// Relevés en sources libres (D-67) : lancé toutes les 10 min par .github/workflows/releves.yml.
// Usage : node pipeline/tools/releves-run.ts <précédent.json|-> <sortie.json>
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { loadRegistry } from '../collect/points.ts';
import { collectReleves, type Releves } from '../collect/releves.ts';

const [prevPath, outPath] = process.argv.slice(2);
const prev: Releves | null = prevPath && prevPath !== '-' && existsSync(prevPath) ? JSON.parse(readFileSync(prevPath, 'utf8')) : null;
const out = await collectReleves(loadRegistry(), prev, Date.now(), { METEOFRANCE_KEY: process.env.METEOFRANCE_KEY?.trim(), FFVL_KEY: process.env.FFVL_KEY?.trim() });
const text = JSON.stringify(out);
// confidentialité : rien de Winds-Up, aucune clé
const leaks = [/winds-up/i.test(text) && 'Winds-Up', /script\.google/.test(text) && 'Apps Script', ...[process.env.METEOFRANCE_KEY, process.env.FFVL_KEY].filter((k) => k && k.length > 8 && text.includes(k)).map(() => 'une clé')].filter(Boolean);
if (leaks.length) { console.log('FUITE : ' + leaks.join(', ')); process.exit(2); }
writeFileSync(outPath, text);
for (const [s, x] of Object.entries(out.sources)) console.log(`[relevés] ${x.ok ? 'OK ' : 'KO '} ${s} : ${x.message}`);
for (const [spot, arr] of Object.entries(out.spots)) for (const x of arr) console.log(`[relevés]     ${spot} ← ${x.src} ${x.id} (${x.km ?? '?'} km) : ${x.pts.length} relevé(s) sur 24 h, ${x.status}`);
for (const b of Object.values(out.buoys ?? {})) console.log(`[relevés]     bouée ${b.name} (${b.code}) : ${b.pts.length} mesure(s) sur 24 h, ${b.status}`);
const n = Object.values(out.spots).flat().filter((x) => x.pts.length).length + Object.values(out.buoys ?? {}).filter((b) => b.pts.length).length;
if (!n) { console.log('aucun relevé : publication précédente gardée'); process.exit(3); }
