// Images des widgets Agenda sur l'agenda FICTIF (CI : npm i --no-save playwright && npx playwright install webkit).
//  • Mac : le vrai rendu HTML/CSS du widget Übersicht, affiché par WebKit (le moteur d'Übersicht).
//  • iPad : SIMULATION de la mise en page Scriptable (piles, textes, couleurs) en HTML — proche, pas identique à iOS.
// Usage : node tests/ui/agenda-previews.mjs <dossier>
process.env.TZ = 'Europe/Paris';
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { load, toHtml } from '../widgets/mac.mjs';
import { run } from '../widgets/scriptable.mjs';
import { NOW, googleV2, device } from '../widgets/agenda-data.ts';

const { webkit } = createRequire(import.meta.url)('playwright');
const OUT = process.argv[2] || 'captures';
mkdirSync(OUT, { recursive: true });
const browser = await webkit.launch();

async function shot(name, html, dark, w = 1100, h = 1000) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, colorScheme: dark ? 'dark' : 'light' });
  await page.setContent(`<!doctype html><meta charset="utf-8"><body style="margin:0;background:${dark ? '#0B1418' : '#D9DED9'};font-family:-apple-system,'Helvetica Neue',Arial,sans-serif">${html}</body>`);
  await page.waitForTimeout(400);
  const box = await page.evaluate(() => { const r = [...document.body.querySelectorAll('.ag .card, .sim')].map((e) => e.getBoundingClientRect());
    return r.length ? { x: Math.min(...r.map((b) => b.left)) - 14, y: Math.min(...r.map((b) => b.top)) - 14, w: Math.max(...r.map((b) => b.right)) - Math.min(...r.map((b) => b.left)) + 28, h: Math.max(...r.map((b) => b.bottom)) - Math.min(...r.map((b) => b.top)) + 28 } : null; });
  await page.screenshot({ path: join(OUT, `${name}.png`), clip: box ? { x: Math.max(0, box.x), y: Math.max(0, box.y), width: box.w, height: box.h } : undefined });
  await page.close();
  console.log(`[image] ${name}.png`);
}

// ------------------------------------------------------------------ Mac
const MAC = 'widgets/agenda/mac/Agenda.jsx';
const macCases = [
  ['mac-standard-sombre', { theme: 'sombre' }, {}],
  ['mac-standard-sombre-reglages', { theme: 'sombre' }, { settings: true }],
  ['mac-etendu-sombre', { theme: 'sombre', format: 'etendu' }, {}],
  ['mac-compact-clair', { theme: 'clair', format: 'compact' }, {}],
  ['mac-standard-clair-vendredi', { theme: 'clair' }, { view: { sel: '2026-11-13', expanded: false, detail: null } }],
  ['mac-detail-sombre', { theme: 'sombre' }, { view: { sel: null, expanded: false, detail: 'manon' } }],
  ['mac-non-connecte-sombre', { theme: 'sombre' }, { output: '@@NOLINK@@' }],
  ['mac-chargement-clair', { theme: 'clair' }, { output: undefined }],
];
for (const [name, prefs, state] of macCases) {
  const m = await load(MAC);
  m.store['ocean.agenda.prefs'] = JSON.stringify({ ...prefs, x: 20, y: 20 });
  const st = { ...m.mod.initialState, output: JSON.stringify(googleV2()), ...state };
  const html = toHtml(m.mod.view(st, () => {}, NOW)).replace(/strokeWidth=/g, 'stroke-width=').replace(/strokeLinecap=/g, 'stroke-linecap=').replace(/strokeLinejoin=/g, 'stroke-linejoin=');   // noms SVG (React les convertit)
  await shot(name, html, prefs.theme === 'sombre');
}

// ------------------------------------------------------------------ iPad (simulation)
const SIZE = { small: [170, 170], medium: [364, 170], large: [364, 382], extraLarge: [764, 382] };
const WEIGHT = { heavySystemFont: 800, boldSystemFont: 700, semiboldSystemFont: 600, mediumSystemFont: 500, systemFont: 400 };
const col = (c, dark) => { if (!c) return null; const hex = (dark && c.dark ? c.dark : c.hex).replace('#', ''); const a = c.a ?? 1;
  const n = parseInt(hex, 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };
const SYM = { calendar: '▦', video: '▶', 'mappin.and.ellipse': '⌖', 'person.2': '⚇', plus: '+', repeat: '↻' };
// une pile qui contient un espaceur souple prend toute la place disponible (comme dans Scriptable)
const grows = (n) => (n.children || []).some((c) => (c.kind === 'spacer' && c.n == null && n.layout === 'h') || (c.kind === 'stack' && grows(c)));
function node(n, dark, parentLayout) {
  if (n.kind === 'text') {
    const f = n.font || { k: 'systemFont', n: 14 };
    return `<span style="font-size:${f.n}px;font-weight:${WEIGHT[f.k] || 400};color:${col(n.textColor, dark)};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;opacity:${n.textOpacity ?? 1};line-height:1.2">${String(n.text).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>`;
  }
  if (n.kind === 'spacer') return n.n == null ? '<span style="flex:1"></span>' : `<span style="flex:none;${parentLayout === 'v' ? 'height' : 'width'}:${n.n}px"></span>`;
  if (n.kind === 'image') { const s = n.img.symbol; return `<span style="flex:none;font-size:${(n.imageSize?.w || 14) - 1}px;color:${col(n.tintColor, dark)};width:${n.imageSize?.w || 14}px;text-align:center">${SYM[s] || '•'}</span>`; }
  const v = n.layout === 'v', p = n.padding;
  const st = [`display:flex;flex-direction:${v ? 'column' : 'row'};align-items:${v ? 'stretch' : 'center'};min-width:0${parentLayout === 'h' && grows(n) ? ';flex:1 1 0' : ''}${n._size ? ';justify-content:center' : ''}`,
    n._size ? `${n._size.w ? `width:${n._size.w}px;flex:none;` : ''}${n._size.h ? `height:${n._size.h}px;` : ''}` : '',
    p ? `padding:${p[0]}px ${p[3]}px ${p[2]}px ${p[1]}px` : '', n.backgroundColor ? `background:${col(n.backgroundColor, dark)}` : '',
    n.cornerRadius ? `border-radius:${n.cornerRadius}px;overflow:hidden` : '', n.borderWidth ? `box-shadow:inset 0 0 0 ${n.borderWidth}px ${col(n.borderColor, dark)}` : ''].join(';');
  return `<div style="${st}">${n.children.map((c) => node(c, dark, n.layout)).join('')}</div>`;
}
for (const family of ['small', 'medium', 'large', 'extraLarge']) {
  for (const dark of [true, false]) {
    if (!dark && family !== 'large') continue;
    const o = await run('widgets/agenda/ipad/Agenda.js', { ...device(), now: NOW, family });
    const w = o.widget, [W, H] = SIZE[family], p = w.padding || [16, 16, 16, 16];
    const html = `<div class="sim" style="position:absolute;left:20px;top:20px;width:${W}px;height:${H}px;box-sizing:border-box;border-radius:22px;overflow:hidden;background:${col(w.backgroundColor, dark)};padding:${p[0]}px ${p[3]}px ${p[2]}px ${p[1]}px;display:flex;flex-direction:column;font-family:-apple-system,'Helvetica Neue',Arial,sans-serif">${w.children.map((c) => node(c, dark, 'v')).join('')}</div>`;
    await shot(`ipad-${family}-${dark ? 'sombre' : 'clair'}-simulation`, html, dark);
  }
}
await browser.close();
writeFileSync(join(OUT, 'LISEZ-MOI.txt'), 'Agenda fictif. Mac : rendu réel du widget (WebKit). iPad : simulation de la mise en page Scriptable.\n');
