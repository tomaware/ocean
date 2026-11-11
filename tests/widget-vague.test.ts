// Widget Vague (surf) : données publiées pour lui (widget-surf.json) et rendu de chaque taille sur le banc d'essai Scriptable.
process.env.TZ = 'Europe/Paris';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { widgetSurf } from '../pipeline/publish/widgets.ts';
import { surfSessions } from '../pipeline/publish/sessions.ts';
import { run, texts, urls } from './widgets/scriptable.mjs';
import { NOW, surfFixture } from './widgets/fixture.ts';

const VAGUE = 'widgets/iphone/OCEAN Vague.js';
const SURF = surfFixture();
const DATA = widgetSurf(SURF, surfSessions(SURF, NOW), NOW);

test('widget Vague : données publiées (vagues, période, vent en nœuds, créneaux du moteur surf)', () => {
  const c = DATA.spots.find((s: any) => s.id === 'carnon')!;
  assert.equal(c.short, 'Carnon');
  assert.deepEqual(c.hours[0], [Date.UTC(2026, 10, 11, 9), 0.6, 0.4, 0.9, 6, 200, 10, 160, 'onshore', 1, 3]);
  assert.equal(c.sessions.length, 1);
  assert.deepEqual({ ...c.sessions[0], s: 0, e: 0 }, { s: 0, e: 0, h: 8, p: 9.2, hb: 1.2, tp: 9, ws: 12, wd: 0, sd: 200 });
  assert.deepEqual(c.daily[2], [0, 5, 3, 12]);                   // vendredi : 3 h à 3 étoiles, 5 h à 2 étoiles, 12 h de jour
  assert.ok(JSON.stringify(DATA).length < 60000);
});

test('widget Vague : chaque taille s’affiche, Carnon par défaut, maintenant + jours + meilleur créneau', async () => {
  for (const family of ['small', 'medium', 'large', 'accessoryRectangular', 'accessoryInline', 'accessoryCircular']) {
    const o = await run(VAGUE, { family, data: DATA, now: NOW });
    const t = texts(o.widget).join(' | ');
    if (family !== 'accessoryCircular') assert.match(t, /Carnon/, family);
    assert.match(t, /0,6|0,4–0,9/, `${family} : vagues de 10 h attendues — ${t}`);
    assert.equal(urls(o.widget)[0], 'https://tomaware.github.io/ocean/#/spot/carnon');
    if (family === 'small') assert.match(t, /0,4–0,9 \| m .*6 s · houle SSO.*vent de mer/);
    if (family === 'medium') assert.match(t, /Auj\..*Jeu\..*Ven\. \| ★★★ \| ☆?.*1,2 m \| 9 s \| 8–16 h/);
    if (family === 'large') {
      assert.match(t, /Aujourd'hui \| mercredi 11.*Créneau : pas de créneau.*Demain \| jeudi 12/);
      assert.match(t, /MEILLEUR CRÉNEAU SURF \| ★★★ \| (Carnon|Sète) · Ven\. 8–16 h · 1,[26] m · 9 s/);
    }
  }
  const o = await run(VAGUE, { family: 'small', parameter: 'Sète', data: DATA, now: NOW });
  assert.match(texts(o.widget).join(' '), /Sète/);
  const off = await run(VAGUE, { family: 'small', data: DATA, fail: true, now: NOW });
  assert.match(texts(off.widget).join(' '), /Pas de données/);
  const set = await run(VAGUE, { inWidget: false, data: DATA, alerts: [0, 1], now: NOW });
  assert.equal(set.keychain['ocean.vague.spot'], 'sete');
});
