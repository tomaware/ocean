// Banc d'essai des widgets Scriptable hors iPhone : on remplace l'API de Scriptable par des objets qui
// enregistrent ce que le widget affiche (textes, couleurs, tailles, liens). Sert aux tests, pas à l'iPhone.
import { readFileSync } from 'node:fs';

export function makeEnv({ family = 'small', parameter = '', inWidget = true, data, live = null, keychain = {}, alerts = [], fail = false, now = Date.now() }) {
  const out = { widget: null, presented: null, requests: [], keychain: { ...keychain } };
  class Color { constructor(hex, a = 1) { this.hex = hex; this.a = a; } static dynamic(l, d) { const c = new Color(l.hex); c.dark = d.hex; return c; } static white() { return new Color('#FFFFFF'); } static black() { return new Color('#000000'); } }
  class Size { constructor(w, h) { this.w = w; this.h = h; } }
  class Point { constructor(x, y) { this.x = x; this.y = y; } }
  class Rect { constructor(x, y, w, h) { Object.assign(this, { x, y, w, h }); } }
  class Path { constructor() { this.n = 0; } move() { this.n++; } addLine() { this.n++; } closeSubpath() {} }
  class DrawContext { constructor() { this.ops = []; } addPath(p) { this.ops.push(p); } setFillColor() {} fillPath() {} fillRect(r) { if (!(r.w >= 0)) throw new Error('fillRect largeur invalide'); this.ops.push(r); } getImage() { return { image: true, ops: this.ops.length }; } }
  const Font = new Proxy({}, { get: (_, k) => (n) => { if (!(n > 0)) throw new Error(`police ${String(k)} taille invalide ${n}`); return { k, n }; } });
  class Stack {
    constructor(kind = 'stack') { this.kind = kind; this.children = []; this.layout = 'h'; }
    layoutVertically() { this.layout = 'v'; } layoutHorizontally() { this.layout = 'h'; }
    centerAlignContent() {} topAlignContent() {} bottomAlignContent() {}
    setPadding(...p) { if (p.length !== 4) throw new Error('setPadding attend 4 valeurs'); this.padding = p; }
    addStack() { const s = new Stack(); this.children.push(s); return s; }
    addText(t) { if (typeof t !== 'string') throw new Error('addText attend une chaîne'); const x = { kind: 'text', text: t, centerAlignText() {}, rightAlignText() {}, leftAlignText() {} }; this.children.push(x); return x; }
    addSpacer(n) { this.children.push({ kind: 'spacer', n }); }
    addImage(img) { if (!img?.image) throw new Error('addImage attend une image'); const x = { kind: 'image', img }; this.children.push(x); return x; }
    set size(v) { if (!(v instanceof Size) || v.w < 0 || v.h < 0 || !Number.isFinite(v.w) || !Number.isFinite(v.h)) throw new Error('size invalide'); this._size = v; } get size() { return this._size; }
  }
  class ListWidget extends Stack { constructor() { super('widget'); this.layout = 'v'; } async presentLarge() { out.presented = this; } async presentMedium() { out.presented = this; } async presentSmall() { out.presented = this; } }
  class Request {
    constructor(url) { this.url = url; }
    async loadJSON() {
      out.requests.push(this.url);
      if (fail) throw new Error('hors ligne');
      if (this.url.includes('action=live')) { if (!live) throw new Error('pas de live'); return live; }
      return JSON.parse(JSON.stringify(data));
    }
  }
  const files = {};
  const FileManager = { local: () => ({ documentsDirectory: () => '/docs', joinPath: (a, b) => `${a}/${b}`, writeString: (p, s) => { files[p] = s; }, readString: (p) => files[p], fileExists: (p) => p in files }) };
  const Keychain = { contains: (k) => k in out.keychain, get: (k) => out.keychain[k], set: (k, v) => { out.keychain[k] = v; }, remove: (k) => { delete out.keychain[k]; } };
  let ai = 0;
  class Alert {
    constructor() { this.fields = []; } addAction() {} addCancelAction() {} addDestructiveAction() {} addTextField(p, v) { this.fields.push(v ?? ''); }
    async presentSheet() { const a = alerts[ai++]; return a === undefined ? -1 : typeof a === 'object' ? a.choice : a; }
    async present() { const a = alerts[ai++]; if (a && typeof a === 'object' && 'text' in a) this.fields[0] = a.text; return a === undefined ? -1 : typeof a === 'object' ? a.choice : a; }
    textFieldValue(i) { return this.fields[i]; }
  }
  const globals = { Color, Size, Point, Rect, Path, DrawContext, Font, ListWidget, Request, FileManager, Keychain, Alert,
    args: { widgetParameter: parameter || null }, config: { widgetFamily: family, runsInWidget: inWidget, runsInApp: !inWidget },
    Script: { setWidget: (w) => { out.widget = w; }, complete: () => {} } };
  return { globals, out, now };
}

/** Exécute un script Scriptable avec l'environnement simulé ; renvoie ce qui a été affiché. */
export async function run(file, opts) {
  const env = makeEnv(opts);
  const src = readFileSync(file, 'utf8');
  const names = Object.keys(env.globals);
  const RealDate = Date, now = env.now;
  class FakeDate extends RealDate { constructor(...a) { super(...(a.length ? a : [now])); } static now() { return now; } }
  const fn = new Function(...names, 'Date', `return (async () => {\n${src}\n})();`);
  await fn(...names.map((k) => env.globals[k]), FakeDate);
  return env.out;
}

/** Tous les textes affichés, dans l'ordre. */
export function texts(node) {
  if (!node) return [];
  if (node.kind === 'text') return [node.text];
  return (node.children ?? []).flatMap(texts);
}
/** Tous les liens (url) du widget et de ses piles. */
export function urls(node) {
  if (!node || node.kind === 'text') return [];
  return [node.url, ...(node.children ?? []).flatMap(urls)].filter(Boolean);
}
