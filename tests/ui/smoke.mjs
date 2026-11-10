// Test de l'interface sur les données réellement publiées (dist/data) : chaque écran s'affiche, sans erreur,
// sans défilement horizontal, mobile et ordinateur. Usage : node tests/ui/smoke.mjs http://localhost:4173
import { createRequire } from 'node:module';
const { chromium, devices } = createRequire(import.meta.url)('playwright');   // installé à part (CI : npm i --no-save playwright)
const base = process.argv[2] ?? 'http://localhost:4173';
const routes = [['', 'Où naviguer en wing'], ['wind/meilleure', 'Meilleure session à venir'], ['wind/sessions', 'Sessions de 2H (Localisation Montpellier)'], ['wind/prevision', 'Prévision 5 jours'], ['wind/spots', 'Spots'],
  ['vague/meilleure', 'Meilleure session à venir'], ['vague/prevision', 'Prévision 5 jours'], ['vague/sessions', 'Sessions de 2H'], ['houle/prevision', 'Prévision 5 jours'], ['houle/sessions', 'Sessions de 2H'],
  ['spot/port-camargue', 'Jour par jour'], ['spot/carnon', 'Jour par jour'], ['spot/plagesud-grandemotte', 'Jour par jour'], ['sessions', 'Où naviguer en wing'], ['profil', 'Mode perso'], ['fiabilite', 'Fiabilité']];
const errs = [];
const b = await chromium.launch();
// langue fixée (fr-FR) ; un 3e passage sans langue fixée vérifie que l'app survit à une langue système invalide
for (const [name, opt] of [['mobile', { ...devices['iPhone 13'], locale: 'fr-FR' }], ['ordinateur', { viewport: { width: 1280, height: 900 }, locale: 'fr-FR' }], ['langue-système', { viewport: { width: 1280, height: 900 } }], ['sombre', { ...devices['iPhone 13'], locale: 'fr-FR', colorScheme: 'dark' }]]) {
  const ctx = await b.newContext(opt);
  const p = await ctx.newPage();
  let shown = false;
  p.on('pageerror', (e) => { if (name === 'langue-système' && /language tag/.test(e.message)) { if (!shown) console.log('[interface] langue système invalide (attendu, graphique seul touché) :', (e.stack ?? '').split('\n').slice(0, 3).join(' | ')); shown = true; } else errs.push(`${name} : ${e.message}`); });
  p.on('console', (m) => { if (m.type() === 'error' && !/openstreetmap|fonts\.g|net::/.test(m.text())) errs.push(`${name} console : ${m.text()}`); });
  for (const reading of ['synthese', 'expert']) {
    await p.goto(base + '/#/');
    await p.evaluate((r) => localStorage.setItem('ocean.prefs.v1', JSON.stringify({ reading: r })), reading);
    if (name === 'sombre') { await p.reload(); const bg = await p.evaluate(() => getComputedStyle(document.body).backgroundColor); if (bg !== 'rgb(13, 25, 30)') errs.push(`sombre : fond ${bg} (thème sombre non appliqué)`); }
    for (const [r, text] of routes) {
      await p.goto(`${base}/#/${r}`); await p.reload();
      try { await p.getByRole('heading', { name: text }).first().waitFor({ timeout: 8000 }); } catch { errs.push(`${name} #/${r} : « ${text} » absent`); }
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
      if (/^(wind|vague|houle)\/(meilleure|sessions)$/.test(r) && (await p.locator('.daychart').count()) === 0 && !(await p.getByText('Pas de session 2H').count()) && !(await p.getByText('Aucune session').count())) errs.push(`${name} #/${r} : graphiques absents sous les sessions`);
      // chaque onglet a son affichage : WIND / HOULE = tableau façon Windguru, VAGUE = barres façon surf-forecast
      if (r === 'spot/port-camargue' && !(await p.locator('table.wg .wg-v').count())) errs.push(`${name} #/${r} : tableau du vent absent`);
      if (r === 'spot/plagesud-grandemotte' && !(await p.locator('table.wg .wg-bars').count())) errs.push(`${name} #/${r} : houle absente du tableau`);
      if (r === 'spot/carnon' && (await p.locator('.sf .sf-col').count()) < 10) errs.push(`${name} #/${r} : barres de vagues absentes`);
      if (r.startsWith('spot/') && !(await p.locator('.stars').count())) errs.push(`${name} #/${r} : étoiles absentes`);
      // fiche spot au style validé le 10/11 : note du jour (24 barres), 2 cartes de conditions, boussole, critères
      if (r.startsWith('spot/')) {
        if ((await p.locator('.notecard .scorebars rect[class^="b-"]').count()) !== 24) errs.push(`${name} #/${r} : barres horaires de la note ≠ 24`);
        if ((await p.locator('.today .cond').count()) !== 2) errs.push(`${name} #/${r} : cartes de conditions ≠ 2`);
        if (!(await p.locator('.daytabs button').count())) errs.push(`${name} #/${r} : choix du jour absent`);
        if (!(await p.locator('.mapbox .compass').count())) errs.push(`${name} #/${r} : boussole absente`);
        if (r === 'spot/port-camargue' && (await p.locator('.crit .gauge').count()) !== 4) errs.push(`${name} #/${r} : 4 critères wing attendus`);
        // changer de jour met à jour la note du jour
        const tabsN = await p.locator('.daytabs button').count();
        if (tabsN > 1) { await p.locator('.daytabs button').nth(1).click(); if ((await p.locator('.daytabs button[aria-pressed="true"]').innerText()) !== (await p.locator('.daytabs button').nth(1).innerText())) errs.push(`${name} #/${r} : choix du jour sans effet`); }
      }
      const tabs = await p.locator('.tabs a').allInnerTexts();
      if (tabs.map((x) => x.trim()).join(',') !== 'WIND,VAGUE,HOULE') errs.push(`${name} #/${r} : onglets ${tabs.join(',')}`);
    }
  }
  // retour arrière : grille → case → fiche spot → « Retour » ramène à la grille avec la même case ouverte
  await p.goto(`${base}/#/wind/prevision`); await p.reload();
  await p.locator('table.grid5 .cell').nth(3).click();
  const before = await p.evaluate(() => location.hash);
  await p.getByText('Fiche complète').click();
  await p.getByText('Jour par jour').first().waitFor({ timeout: 8000 });
  await p.locator('button.back').click();
  await p.locator('table.grid5').waitFor({ timeout: 8000 });
  const after = await p.evaluate(() => location.hash);
  if (after !== before || !(await p.locator('.daychart').count())) errs.push(`${name} : retour arrière ${before} → ${after}`);
  // l'onglet se rouvre sur le dernier module consulté
  await p.locator('.tabs a').nth(1).click(); await p.waitForTimeout(300);
  await p.locator('.tabs a').nth(0).click(); await p.waitForTimeout(300);
  if (!(await p.evaluate(() => location.hash)).startsWith('#/wind/prevision')) errs.push(`${name} : WIND ne rouvre pas le dernier module (${await p.evaluate(() => location.hash)})`);
  if (name === 'ordinateur' && (await p.locator('.side a').count()) < 6) errs.push(`${name} : colonne de gauche absente`);
  await ctx.close();
}
await b.close();
console.log(errs.length ? 'ÉCHEC\n' + errs.join('\n') : `[interface] OK : ${routes.length} écrans × 2 niveaux de lecture × mobile / ordinateur / langue système / sombre, aucune erreur`);
process.exit(errs.length ? 1 : 0);
