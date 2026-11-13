// Widgets Mac (Übersicht) : trois widgets indépendants (Vent, Créneaux, Vague), compilés et rendus hors Mac sur les
// mêmes jeux d'essai que les widgets iPhone et Windows. Réglages, position, clic / glisser, mise à jour automatique.
process.env.TZ = 'Europe/Paris';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { widgetSurf, widgetWind } from '../pipeline/publish/widgets.ts';
import { surfSessions } from '../pipeline/publish/sessions.ts';
import { load, textOf, toHtml } from './widgets/mac.mjs';
import { NOW, surfFixture, wingFixture } from './widgets/fixture.ts';
import { OUTPUTS, assemble } from '../widgets/mac/build.mjs';

const VENT = 'widgets/mac/ocean-vent.jsx', CREN = 'widgets/mac/ocean-creneaux.jsx', VAGUE = 'widgets/mac/ocean-vague.jsx';
const WIND = widgetWind(wingFixture(), { 'le-jai': { t: NOW - 25 * 60e3, kn: 14, gust: 18, dir: 310, station: 'LFML', source: 'METAR Marseille-Marignane' } }, NOW);
const S = surfFixture(), SURF = widgetSurf(S, surfSessions(S, NOW), NOW);
const ventOut = (live: object | string | null = '@@NOLINK@@', wind: object | null = WIND) =>
  `${wind ? JSON.stringify(wind) : ''}\n@@OCEAN@@\n${typeof live === 'string' ? live : live ? JSON.stringify(live) : ''}`;
const show = async (file: string, settings: Record<string, string>, output: string, state: object = {}) => {
  const m = await load(file, settings);
  return { ...m, t: textOf(toHtml(m.mod.view({ output, ...state }, () => {}, NOW))) };
};

// parcourt l'arbre Preact (en déroulant les composants) pour retrouver un élément et ses gestionnaires
function find(n: any, pred: (n: any) => boolean): any {
  if (n == null || typeof n !== 'object') return null;
  if (Array.isArray(n)) { for (const x of n) { const r = find(x, pred); if (r) return r; } return null; }
  if (typeof n.type === 'function') return find(n.type(n.props), pred);
  if (pred(n)) return n;
  return find(n.props?.children, pred);
}
const cls = (c: string) => (n: any) => typeof n.props?.className === 'string' && n.props.className.split(' ').includes(c);

test('widgets Mac : trois fichiers assemblés à partir du même cœur, à jour', () => {
  for (const [src, out] of OUTPUTS) assert.equal(readFileSync(`widgets/mac/${out}`, 'utf8'), assemble(src), `${out} pas à jour : node widgets/mac/build.mjs`);
  assert.ok(!existsSync('widgets/mac/ocean.jsx'), 'l’ancien widget unique est remplacé');
});

test('widgets Mac : aucun secret ni lien privé ; lien de la super prévision lu dans le trousseau, par le widget Vent seulement', async () => {
  for (const [f, out] of [[VENT, ventOut()], [CREN, JSON.stringify(WIND)], [VAGUE, JSON.stringify(SURF)]]) {
    const src = readFileSync(f, 'utf8');
    assert.doesNotMatch(src, /script\.google\.com\/macros\/s\/|key=[A-Za-z0-9]{8,}/, f);
    assert.doesNotMatch(src, /<>|<\/>/, f);                                  // pas de fragments (Übersicht)
    // tous les styles sont préfixés .ocean : les widgets Übersicht partagent la même page (ex. widget Agenda)
    const { mod } = await load(f, {});
    const css = toHtml(mod.view({ output: out }, () => {}, NOW)).match(/<style>([\s\S]*?)<\/style>/)![1].replace(/\/\*[\s\S]*?\*\//g, '').replace(/@media[^{]*\{/g, '');
    const selecteurs = [...css.matchAll(/(^|\})\s*([^{}]+)\{/g)].map((m) => m[2].trim()).filter(Boolean);
    assert.ok(selecteurs.length > 50, f);
    for (const sel of selecteurs) for (const one of sel.split(',')) assert.match(one.trim(), /^\.ocean\b/, `${f} : style non préfixé « ${one.trim()} »`);
  }
  assert.match(readFileSync(VENT, 'utf8'), /security find-generic-password -s ocean\.superprevision -w/);
  for (const f of [CREN, VAGUE]) assert.doesNotMatch(readFileSync(f, 'utf8').split('// ================================================================ FIN DU CŒUR')[1], /security /, f);
});

test('widget Mac Vent : mêmes vents, étoiles et sources que les widgets iPhone et Windows', async () => {
  let { t } = await show(VENT, { TAILLE: '"moyen"' }, ventOut());
  assert.match(t, /G-Motte \| prévision \| 12 \| nd NO/);
  assert.match(t, /Auj\. .*Jeu\. .*Ven\. .*Sam\./);
  ({ t } = await show(VENT, { TAILLE: '"grand"' }, ventOut()));
  assert.match(t, /^ \| La Grande-Motte \| prévision corrigée .*Aujourd'hui \| mercredi 11 .*max 16 nd NO .*raf\. 22.*Demain \| jeudi 12/);
  assert.doesNotMatch(t, /Créneau :/);
  ({ t } = await show(VENT, { TAILLE: '"petit"', SPOT: '"beauduc"' }, ventOut({ spots: { '61-beauduc': { nom: 'Beauduc', t: NOW - 6 * 60e3, v: 23, o: 'SE', max: 29 } } })));
  assert.match(t, /Beauduc \| ● public · 6 min \| 23 \| nd SE \| max 29 nd/);
  ({ t } = await show(VENT, { TAILLE: '"petit"', SPOT: '"le-jai"' }, ventOut()));
  assert.match(t, /● 25 min \| 14/);
  ({ t } = await show(VENT, { TAILLE: '"grand"', SPOT: '"beauduc"' }, ventOut({ connecte: true, spots: { '61-beauduc': { nom: 'Beauduc', t: NOW - 6 * 60e3, v: 23, o: 'SE' } } })));
  assert.match(t, /● Winds-Up abonné · 6 min/);
});

test('widget Mac Créneaux : même classement et même grille que les widgets iPhone et Windows', async () => {
  let { t } = await show(CREN, { TAILLE: '"moyen"' }, JSON.stringify(WIND));
  assert.match(t, /Beauduc \| Ven\. 9–17 h \| 24 nd SE .*G-Motte .*Ven\. 9–17 h .*G-Motte .*Auj\. 13–16 h/);
  ({ t } = await show(CREN, { TAILLE: '"grand"' }, JSON.stringify(WIND)));
  assert.match(t, /MEILLEUR CRÉNEAU \| 8h \| Vendredi 13 · 9 h – 17 h \| Beauduc/);
  assert.match(t, /Ven 13 .*7,5 .*10,0 .*5,0/);                              // grille (Tom, 14/11) : note du jour par case
  ({ t } = await show(CREN, { TAILLE: '"petit"', SPOTS: '"proches"', MODE: '"offshore"' }, JSON.stringify(WIND)));
  assert.doesNotMatch(t, /Beauduc/);
});

test('widget Mac Vague : même modèle que « OCEAN Vague », et « prévi » au lieu de « maintenant »', async () => {
  let { t } = await show(VAGUE, { TAILLE: '"grand"' }, JSON.stringify(SURF));
  assert.match(t, /Carnon \| prévi \| 0,4–0,9 \| m \| 6 s · houle SSO/);
  assert.doesNotMatch(t, /maintenant/);
  assert.match(t, /MEILLEUR CRÉNEAU SURF \| ★★★ \| (Carnon|Sète) · Ven\. 8–16 h · 1,[26] m · 9 s/);
  ({ t } = await show(VAGUE, { TAILLE: '"moyen"', SPOT: '"sete"' }, JSON.stringify(SURF)));
  assert.match(t, /Sète .*Ven\. \| ★★★ .*1,6 m \| 9 s \| 8–16 h/);
});

test('widgets Mac : réglages dans le widget (⚙), retenus, et appliqués', async () => {
  // panneau de chaque widget : les mêmes choix que sur l'iPhone, plus taille et thème
  let { t } = await show(VENT, {}, ventOut(), { settings: true });
  assert.match(t, /Spot \| G-Motte \| Beauduc \| Le Jaï \| Mode \| Sécu first \| OffShore \| Taille \| Petit \| Moyen \| Grand \| Thème \| Auto \| Clair \| Sombre \| Balise en direct/);
  assert.match(t, /Non branchée : vent prévu\. \| Brancher…/);
  ({ t } = await show(VENT, {}, ventOut({ spots: {} }), { settings: true }));
  assert.match(t, /Super prévision branchée\. \| Changer… \| Retirer/);
  ({ t } = await show(CREN, {}, JSON.stringify(WIND), { settings: true }));
  assert.match(t, /Spots suivis \| Tous \| Proches \| Au choix \| G-Motte \| Beauduc \| Le Jaï/);
  ({ t } = await show(VAGUE, {}, JSON.stringify(SURF), { settings: true }));
  assert.match(t, /Spot \| Carnon \| .*Taille \| Petit \| Moyen \| Grand/);

  // un réglage choisi est retenu (localStorage d'Übersicht) et appliqué au rendu suivant
  const w = await load(VENT, {});
  let s = w.mod.updateState({ type: 'UB/COMMAND_RAN', output: ventOut() }, w.mod.initialState);
  s = w.mod.updateState({ type: 'PREFS', prefs: { ...s.prefs, spot: 'beauduc', taille: 'petit' } }, s);
  assert.equal(JSON.parse(w.store['ocean.mac.vent.reglages']).spot, 'beauduc');
  assert.match(textOf(toHtml(w.mod.view({ ...s, prefs: null }, () => {}, NOW))), /^ \| Beauduc \|/);   // relu depuis le stockage

  // Créneaux « au choix » : la liste choisie filtre les créneaux
  const c = await load(CREN, {});
  const st = c.mod.updateState({ type: 'PREFS', prefs: { mode: 'secu', spots: ['le-jai'], taille: 'moyen', theme: 'auto' } }, c.mod.initialState);
  const tc = textOf(toHtml(c.mod.view({ ...st, output: JSON.stringify(WIND) }, () => {}, NOW)));
  assert.doesNotMatch(tc, /Beauduc|G-Motte/); assert.match(tc, /Sécu first · 1 spot/);

  // les réglages de départ du fichier sont écrits tout de suite : une mise à jour du fichier ne les efface pas
  const v = await load(VAGUE, { SPOT: '"sete"' });
  v.mod.view({ output: JSON.stringify(SURF) }, () => {}, NOW);
  assert.equal(JSON.parse(v.store['ocean.mac.vague.reglages']).spot, 'sete');
});

test('widgets Mac : glisser déplace et retient la place, un clic ouvre OCEAN, le clic qui suit un glisser n’ouvre rien', async () => {
  const w = await load(CREN, {});
  const handlers: Record<string, Function> = {};
  (globalThis as any).window = { innerWidth: 1440, addEventListener: (k: string, f: Function) => { handlers[k] = f; }, removeEventListener: () => {} };
  let state = w.mod.updateState({ type: 'DATA', output: JSON.stringify(WIND) }, w.mod.initialState);
  const dispatch = (e: any) => { state = w.mod.updateState(e, state); };
  const tree = () => w.mod.view(state, dispatch, NOW);
  const root = find(tree(), cls('ocean'));
  assert.equal(root.props.style.left, 1440 - 364 - 24);                    // en haut à droite de l'écran au départ
  assert.equal(root.props.style.top, 230);
  // glisser de (100, 100) à (60, 180)
  root.props.onMouseDown({ button: 0, clientX: 100, clientY: 100, preventDefault() {}, target: { closest: () => null } });
  handlers.mousemove({ clientX: 60, clientY: 180 });
  handlers.mouseup();
  assert.deepEqual([state.prefs.x, state.prefs.y], [1440 - 364 - 24 - 40, 310]);
  assert.deepEqual(JSON.parse(w.store['ocean.mac.creneaux.reglages']).x, 1440 - 364 - 24 - 40);
  // le clic qui termine le glisser n'ouvre rien ; le clic suivant (nouvel appui) ouvre OCEAN
  const card = () => find(tree(), cls('card'));
  card().props.onClick({ stopPropagation() {} });
  assert.equal(w.ran.length, 0);
  find(tree(), cls('ocean')).props.onMouseDown({ button: 0, clientX: 10, clientY: 10, preventDefault() {}, target: { closest: () => null } });
  handlers.mouseup();
  card().props.onClick({ stopPropagation() {} });
  assert.equal(w.ran.length, 1); assert.match(w.ran[0], /^open "https:\/\/tomaware\.github\.io\/ocean\/#\/wind\/prevision"/);
  // un clic qui tremble de 2 px n'est pas un déplacement
  const before = [state.prefs.x, state.prefs.y];
  find(tree(), cls('ocean')).props.onMouseDown({ button: 0, clientX: 10, clientY: 10, preventDefault() {}, target: { closest: () => null } });
  handlers.mousemove({ clientX: 11, clientY: 11 }); handlers.mouseup();
  assert.deepEqual([state.prefs.x, state.prefs.y], before);
  delete (globalThis as any).window;
});

test('widgets Mac : hors ligne (dernières données), et mise à jour automatique avec garde-fous', async () => {
  const w = await load(VENT, {});
  w.mod.view({ output: ventOut() }, () => {}, NOW);
  let t = textOf(toHtml(w.mod.view({ output: ventOut(null, null) }, () => {}, NOW)));
  assert.match(t, /hors ligne · dernières données/);
  const fresh = await load(VENT, {});
  assert.match(textOf(toHtml(fresh.mod.view({ output: '' }, () => {}, NOW))), /Pas de données/);
  for (const [f, nom, marq] of [[VENT, 'ocean-vent.jsx', 'OCEAN_MAC_VENT_FIN'], [CREN, 'ocean-creneaux.jsx', 'OCEAN_MAC_CRENEAUX_FIN'], [VAGUE, 'ocean-vague.jsx', 'OCEAN_MAC_VAGUE_FIN']]) {
    const src = readFileSync(f, 'utf8');
    assert.ok(src.trim().endsWith(`// ${marq}`), `${f} : marqueur de fin`);
    const { mod } = await load(f, {});
    // il ne remplace que SON fichier, depuis le site, seulement s'il est complet (taille + marqueur) et différent
    assert.match(mod.command, new RegExp(`F="\\$HOME/Library/Application Support/Übersicht/widgets/${nom}".*curl -sfL --max-time 20 "https://tomaware\\.github\\.io/ocean/widgets/${nom}".*-gt 4000.*grep -q "${marq}".*! cmp -s.*cp "\\$T" "\\$F"`));
  }
});
