// Test de l'interface sur les données réellement publiées (dist/data) : chaque écran s'affiche, sans erreur,
// sans défilement horizontal, mobile et ordinateur. Usage : node tests/ui/smoke.mjs http://localhost:4173
import { createRequire } from 'node:module';
const { chromium, devices } = createRequire(import.meta.url)('playwright');   // installé à part (CI : npm i --no-save playwright)
const base = process.argv[2] ?? 'http://localhost:4173';
const routes = [['', 'Meilleure session à venir'], ['wind', 'Meilleure session à venir'], ['wind/sessions', 'Sessions 2H'], ['wind/prevision', 'Prévision 5 jours'], ['wind/spots', 'Spots'],
  ['vague', 'Meilleure session à venir'], ['vague/prevision', 'Prévision 5 jours'], ['vague/sessions', 'Sessions 2H'], ['houle/prevision', 'Prévision 5 jours'], ['houle/sessions', 'Sessions 2H'],
  ['spot/port-camargue', 'Jour par jour'], ['spot/carnon', 'Jour par jour'], ['spot/plagesud-grandemotte', 'Jour par jour'], ['sessions', 'Meilleure session à venir'], ['profil', 'Mode perso'], ['fiabilite', 'Fiabilité']];
const errs = [];
const b = await chromium.launch();
// langue fixée (fr-FR) ; un 3e passage sans langue fixée vérifie que l'app survit à une langue système invalide
for (const [name, opt] of [['mobile', { ...devices['iPhone 13'], locale: 'fr-FR' }], ['ordinateur', { viewport: { width: 1280, height: 900 }, locale: 'fr-FR' }], ['langue-système', { viewport: { width: 1280, height: 900 } }]]) {
  const ctx = await b.newContext(opt);
  const p = await ctx.newPage();
  let shown = false;
  p.on('pageerror', (e) => { if (name === 'langue-système' && /language tag/.test(e.message)) { if (!shown) console.log('[interface] langue système invalide (attendu, graphique seul touché) :', (e.stack ?? '').split('\n').slice(0, 3).join(' | ')); shown = true; } else errs.push(`${name} : ${e.message}`); });
  p.on('console', (m) => { if (m.type() === 'error' && !/openstreetmap|fonts\.g|net::/.test(m.text())) errs.push(`${name} console : ${m.text()}`); });
  for (const reading of ['synthese', 'expert']) {
    await p.goto(base + '/#/');
    await p.evaluate((r) => localStorage.setItem('ocean.prefs.v1', JSON.stringify({ reading: r })), reading);
    for (const [r, text] of routes) {
      await p.goto(`${base}/#/${r}`); await p.reload();
      try { await p.getByText(text, { exact: false }).first().waitFor({ timeout: 8000 }); } catch { errs.push(`${name} #/${r} : « ${text} » absent`); }
      const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (over > 1) errs.push(`${name} #/${r} (${reading}) : débordement horizontal de ${over} px`);
      if (await p.locator('.notice.warn').filter({ hasText: 'Données indisponibles' }).count()) errs.push(`${name} #/${r} : données indisponibles`);
      if (r.endsWith('/prevision')) {
        // la grille : 5 jours × spots, et le détail s'ouvre au clic
        const n = await p.locator('table.grid5 tbody tr').count();
        if (n !== 5) errs.push(`${name} #/${r} : ${n} jours dans la grille`);
        await p.locator('table.grid5 .cell').first().click();
        if (!(await p.locator('.daychart').count())) errs.push(`${name} #/${r} : pas de détail au clic`);
      }
      if (/^(wind|vague|houle)(\/sessions)?$/.test(r) && (await p.locator('.daychart').count()) === 0 && !(await p.getByText('Pas de session 2H').count()) && !(await p.getByText('Aucune session').count())) errs.push(`${name} #/${r} : graphiques absents sous les sessions`);
      const tabs = await p.locator('.tabs a').allInnerTexts();
      if (tabs.map((x) => x.trim()).join(',') !== 'WIND,VAGUE,HOULE') errs.push(`${name} #/${r} : onglets ${tabs.join(',')}`);
    }
  }
  await ctx.close();
}
await b.close();
console.log(errs.length ? 'ÉCHEC\n' + errs.join('\n') : `[interface] OK : ${routes.length} écrans × 2 niveaux de lecture × mobile / ordinateur / langue système, aucune erreur`);
process.exit(errs.length ? 1 : 0);
