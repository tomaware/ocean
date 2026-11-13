// Images des trois widgets Mac OCEAN (Vent, Créneaux, Vague) sur les données d'essai (fictives) :
// le vrai rendu HTML/CSS du widget Übersicht, affiché par WebKit (le moteur d'Übersicht) en CI, ou Chromium en local.
// Usage : node tests/ui/mac-previews.mjs <dossier> [webkit|chromium]
process.env.TZ = 'Europe/Paris';
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { load, toHtml } from '../widgets/mac.mjs';
import { widgetSurf, widgetWind } from '../../pipeline/publish/widgets.ts';
import { surfSessions } from '../../pipeline/publish/sessions.ts';
import { NOW, surfFixture, kiteFixture } from '../widgets/fixture.ts';

const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require('/opt/npm-tools/node_modules/playwright'); }
const OUT = process.argv[2] || 'captures-mac';
const ENGINE = process.argv[3] || 'webkit';
mkdirSync(OUT, { recursive: true });
const browser = await pw[ENGINE].launch();

const WIND = JSON.stringify(widgetWind(kiteFixture(), {}, NOW));   // avec un jeudi « Kite session » à Beauduc (D-49)
const S = surfFixture(), SURF = JSON.stringify(widgetSurf(S, surfSessions(S, NOW), NOW));
const LIVE = JSON.stringify({ connecte: true, spots: { '61-beauduc': { nom: 'Beauduc', t: NOW - 6 * 60e3, v: 23, o: 'SE', max: 29 } } });
const W = { vent: ['widgets/mac/ocean-vent.jsx', `${WIND}\n@@OCEAN@@\n@@NOLINK@@`], creneaux: ['widgets/mac/ocean-creneaux.jsx', WIND], vague: ['widgets/mac/ocean-vague.jsx', SURF] };

async function html(kind, settings, state) {
  const [file, output] = W[kind];
  const { mod } = await load(file, settings);
  return toHtml(mod.view({ output, ...state }, () => {}, NOW));
}
async function shot(name, parts, dark, w = 1000, h = 900) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, colorScheme: dark ? 'dark' : 'light' });
  // fond de bureau : un dégradé, pour juger les ombres et le texte « hors ligne »
  await page.setContent(`<!doctype html><meta charset="utf-8"><body style="margin:0;height:${h}px;background:linear-gradient(135deg,#2B5876,#4E4376)">${parts.join('')}</body>`);
  await page.waitForTimeout(300);
  const box = await page.evaluate(() => { const r = [...document.querySelectorAll('.ocean .card')].map((e) => e.getBoundingClientRect());
    return { x: Math.min(...r.map((b) => b.left)) - 24, y: Math.min(...r.map((b) => b.top)) - 24, w: Math.max(...r.map((b) => b.right)) - Math.min(...r.map((b) => b.left)) + 48, h: Math.max(...r.map((b) => b.bottom)) - Math.min(...r.map((b) => b.top)) + 48 }; });
  await page.screenshot({ path: join(OUT, `${name}.png`), clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: box.w, height: box.h } });
  await page.close();
  console.log(`[image] ${name}.png`);
}
const at = (x, y) => ({ pos: { x, y } });

for (const dark of [false, true]) {
  const th = dark ? 'sombre' : 'clair';
  // bureau type : Vent moyen, Créneaux moyen, Vague moyen, l'un sous l'autre
  await shot(`bureau-moyen-${th}`, [
    await html('vent', { TAILLE: '"moyen"' }, at(30, 30)),
    await html('creneaux', { TAILLE: '"moyen"' }, at(30, 220)),
    await html('vague', { TAILLE: '"moyen"' }, at(30, 410)),
  ], dark);
  // les trois en grand, côte à côte
  await shot(`grand-${th}`, [
    await html('vent', { TAILLE: '"grand"' }, at(30, 30)),
    await html('creneaux', { TAILLE: '"grand"' }, at(420, 30)),
    await html('vague', { TAILLE: '"grand"' }, at(810, 30)),
  ], dark, 1220, 640);
  // petits
  await shot(`petit-${th}`, [
    await html('vent', { TAILLE: '"petit"' }, at(30, 30)),
    await html('creneaux', { TAILLE: '"petit"' }, at(225, 30)),
    await html('vague', { TAILLE: '"petit"' }, at(420, 30)),
  ], dark, 640, 260);
}
// panneaux de réglages ouverts (à droite d'une carte placée à gauche de l'écran)
await shot('reglages-vent', [await html('vent', { TAILLE: '"moyen"' }, { ...at(30, 30), settings: true })], false, 760, 520);
await shot('reglages-creneaux-sombre', [await html('creneaux', { TAILLE: '"moyen"' }, { ...at(30, 30), settings: true })], true, 760, 520);
await shot('reglages-vague', [await html('vague', { TAILLE: '"petit"' }, { ...at(30, 30), settings: true })], false, 560, 420);
// balise en direct (Winds-Up abonné) sur Beauduc
const [vf] = W.vent;
const { mod } = await load(vf, { TAILLE: '"grand"', SPOT: '"beauduc"' });
await shot('vent-balise-sombre', [toHtml(mod.view({ output: `${WIND}\n@@OCEAN@@\n${LIVE}`, ...at(30, 30) }, () => {}, NOW))], true, 460, 460);
await browser.close();
