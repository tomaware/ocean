// Assemble les widgets Agenda : recopie le cœur commun (core.mjs) dans le widget Mac et le widget iPad.
// Usage : node widgets/agenda/build.mjs      (les tests vérifient que les fichiers livrés sont à jour)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DIR = dirname(fileURLToPath(import.meta.url));
export const OUTPUTS = [['src/mac.jsx', 'mac/Agenda.jsx'], ['src/ipad.js', 'ipad/Agenda.js']];

export function assemble(srcFile) {
  const core = readFileSync(join(DIR, 'core.mjs'), 'utf8')
    .replace(/^export (const|function|async function) /gm, '$1 ')
    .trim();
  const block = `// ================================================================ CŒUR (copie de widgets/agenda/core.mjs — ne pas modifier ici)\n${core}\n// ================================================================ FIN DU CŒUR`;
  const src = readFileSync(join(DIR, srcFile), 'utf8');
  if (!src.includes('//@@CORE@@')) throw new Error(`${srcFile} : marqueur //@@CORE@@ absent`);
  return src.replace('//@@CORE@@', () => block);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const [s, o] of OUTPUTS) { writeFileSync(join(DIR, o), assemble(s)); console.log(`✓ ${o}`); }
}
