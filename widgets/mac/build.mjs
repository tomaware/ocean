// Assemble les trois widgets Mac OCEAN : recopie le cœur commun (src/core.jsx) dans Vent, Créneaux et Vague.
// Usage : node widgets/mac/build.mjs      (les tests vérifient que les fichiers livrés sont à jour)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DIR = dirname(fileURLToPath(import.meta.url));
export const OUTPUTS = [['src/vent.jsx', 'ocean-vent.jsx'], ['src/creneaux.jsx', 'ocean-creneaux.jsx'], ['src/vague.jsx', 'ocean-vague.jsx']];

export function assemble(srcFile) {
  const core = readFileSync(join(DIR, 'src/core.jsx'), 'utf8').trim();
  const block = `// ================================================================ CŒUR (copie de widgets/mac/src/core.jsx — ne pas modifier ici)\n${core}\n// ================================================================ FIN DU CŒUR`;
  const src = readFileSync(join(DIR, srcFile), 'utf8');
  if (!src.includes('//@@CORE@@')) throw new Error(`${srcFile} : marqueur //@@CORE@@ absent`);
  return src.replace('//@@CORE@@', () => block);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const [s, o] of OUTPUTS) { writeFileSync(join(DIR, o), assemble(s)); console.log(`✓ ${o}`); }
}
