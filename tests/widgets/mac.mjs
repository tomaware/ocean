// Banc d'essai du widget Mac (Übersicht) hors Mac : on compile ocean.jsx avec esbuild (JSX → Preact), on remplace le
// module « uebersicht » (run = ouvrir un lien) et localStorage, puis on transforme le rendu en HTML. Sert aux tests.
import { build } from 'esbuild';
import { h } from 'preact';

const VOID = new Set(['br', 'img', 'input', 'path']);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const css = (o) => Object.entries(o).map(([k, v]) => `${k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}:${typeof v === 'number' && !/opacity|z-index|font-weight/.test(k) ? v + 'px' : v}`).join(';');
/** Rendu HTML minimal d'un arbre Preact (composants fonctions, éléments, texte). */
export function toHtml(n) {
  if (n == null || n === false || n === true) return '';
  if (Array.isArray(n)) return n.map(toHtml).join('');
  if (typeof n !== 'object') return esc(n);
  if (typeof n.type === 'function') return toHtml(n.type(n.props));
  const { children, ...p } = n.props || {};
  const attrs = Object.entries(p).filter(([k, v]) => v != null && v !== false && !k.startsWith('on') && k !== 'key').map(([k, v]) =>
    ` ${k === 'className' ? 'class' : k === 'viewBox' ? 'viewBox' : k}="${esc(k === 'style' && typeof v === 'object' ? css(v) : v)}"`).join('');
  if (n.type === 'style') return `<style>${[].concat(children).join('')}</style>`;
  return VOID.has(n.type) ? `<${n.type}${attrs}/>` : `<${n.type}${attrs}>${toHtml(children)}</${n.type}>`;
}
export const textOf = (html) => html.replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' | ').replace(/(\s*\|\s*)+/g, ' | ').replace(/&amp;/g, '&');

/** Compile le widget avec des réglages remplacés ({ SPOT: '"beauduc"', … }) ; renvoie le module et les commandes lancées. */
export async function load(file, settings = {}) {
  let src = (await import('node:fs')).readFileSync(file, 'utf8');
  for (const [k, v] of Object.entries(settings)) src = src.replace(new RegExp(`^const ${k} = .*?;`, 'm'), `const ${k} = ${v};`);
  const ran = [];
  globalThis.__ocean_run = (c) => ran.push(c);
  const store = {};
  globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); } };
  const out = await build({
    stdin: { contents: `import { h as __h, Fragment as __F } from 'preact';\n${src}`, loader: 'jsx', resolveDir: process.cwd() },
    bundle: true, write: false, format: 'esm', jsxFactory: '__h', jsxFragment: '__F', platform: 'node',
    plugins: [{ name: 'uebersicht', setup(b) { b.onResolve({ filter: /^uebersicht$/ }, () => ({ path: 'u', namespace: 'u' })); b.onLoad({ filter: /.*/, namespace: 'u' }, () => ({ contents: 'export const run = (c) => globalThis.__ocean_run(c);', loader: 'js' })); } }],
  });
  const code = out.outputFiles[0].text;
  const mod = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
  return { mod, ran, store };
}
export { h };
