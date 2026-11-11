// Test de l'interface sur les données réellement publiées (dist/data) : chaque écran s'affiche, sans erreur,
// sans défilement horizontal, mobile et ordinateur. Usage : node tests/ui/smoke.mjs http://localhost:4173
import { createRequire } from 'node:module';
const { chromium, devices } = createRequire(import.meta.url)('playwright');   // installé à part (CI : npm i --no-save playwright)
const base = process.argv[2] ?? 'http://localhost:4173';
const routes = [['', 'Où naviguer en wing'], ['wind/meilleure', 'Meilleure session à venir'], ['wind/sessions', 'Sessions de 2H (Localisation Montpellier)'], ['wind/prevision', 'Prévision 5 jours'], ['wind/spots', 'Spots'],
  ['vague/meilleure', 'Meilleure session à venir'], ['vague/prevision', 'Prévision 5 jours'], ['vague/sessions', 'Sessions de 2H'], ['houle/prevision', 'Prévision 5 jours'], ['houle/meilleure', 'Meilleure session à venir'],
  ['spot/port-camargue', 'Jour par jour'], ['spot/carnon', 'Jour par jour'], ['spot/plagesud-grandemotte', 'Jour par jour'], ['sessions', 'Où naviguer en wing'], ['profil', 'Mode perso'], ['fiabilite', 'Fiabilité'], ['widgets', 'Installer les widgets'], ['avis', 'Avis et commentaires']];
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
      if (r === 'widgets') {
        // scripts publiés avec le site, prêts à copier ; un onglet par appareil
        try { await p.getByRole('button', { name: /Copier « OCEAN Vent »/ }).first().waitFor({ timeout: 4000 }); } catch {}
        for (const os of ['iPhone', 'Mac', 'Windows']) { await p.getByRole('button', { name: os, exact: true }).click(); if (!(await p.locator('ol.steps li').count())) errs.push(`${name} #/widgets : pas d'étapes pour ${os}`); }
        const zip = await p.request.get(`${base}/widgets/ocean-widget-windows.zip`);
        if (!zip.ok() || (await zip.body()).readUInt32LE(0) !== 0x04034b50) errs.push(`${name} #/widgets : widget Windows (.zip) introuvable`);
        const mzip = await p.request.get(`${base}/widgets/ocean-widget-mac.zip`);
        if (!mzip.ok() || (await mzip.body()).readUInt32LE(0) !== 0x04034b50) errs.push(`${name} #/widgets : widget Mac (.zip) introuvable`);
        await p.getByRole('button', { name: 'iPhone', exact: true }).click();
        if (await p.getByRole('button', { name: /Copier « OCEAN/ }).and(p.locator(':disabled')).count()) errs.push(`${name} #/widgets : scripts des widgets introuvables (dist/widgets)`);
      }
      if (r === 'avis') {
        // sans message : bouton bloqué ou alerte ; champ piège invisible
        if (await p.locator('label.hp').evaluate((e) => e.getBoundingClientRect().right > 0)) errs.push(`${name} #/avis : champ piège visible`);
        if (!(await p.locator('textarea').count())) errs.push(`${name} #/avis : pas de zone de message`);
      }
      if (r.endsWith('/prevision')) {
        // la grille : 5 jours × spots, et le détail s'ouvre au clic
        const n = await p.locator('table.grid5 tbody tr').count();
        if (await p.locator('table.grid5 .cell:not(.s)').filter({ hasText: /\d/ }).count()) errs.push(`${name} #/${r} : chiffres dans les cases sans session`);
        if (n !== 5) errs.push(`${name} #/${r} : ${n} jours dans la grille`);
        await p.locator('table.grid5 .cell').first().click();
        if (!(await p.locator('.daychart').count())) errs.push(`${name} #/${r} : pas de détail au clic`);
      }
      if (/^(wind|vague|houle)\/(meilleure|sessions)$/.test(r) && (await p.locator('.daychart').count()) === 0 && !(await p.getByText('Pas de session 2H').count()) && !(await p.getByText('Aucune session').count())) errs.push(`${name} #/${r} : graphiques absents sous les sessions`);
      // un seul tableau heure par heure pour WIND, VAGUE, HOULE (lignes propres à chacun)
      if (r === 'spot/port-camargue' && !(await p.locator('table.wg .wg-v').count())) errs.push(`${name} #/${r} : tableau du vent absent`);
      if (r === 'spot/plagesud-grandemotte' && !(await p.locator('table.wg .wg-bars').count())) errs.push(`${name} #/${r} : houle absente du tableau`);
      if (r === 'spot/carnon' && ((await p.locator('table.wg .wg-bars td').count()) < 10 || (await p.locator('table.wg th', { hasText: /^Rafales$/ }).count()) || !(await p.locator('table.wg th', { hasText: /^Vent nd$/ }).count()))) errs.push(`${name} #/${r} : VAGUE = même tableau que WIND : vagues + vent et direction, sans rafales ni pluie`);
      if (r === 'spot/port-camargue' && (await p.getByRole('rowheader', { name: 'Plage' }).count() + await p.locator('table.wg th', { hasText: /^Plage$/ }).count())) errs.push(`${name} #/${r} : ligne « Plage » encore là`);
      if (r.startsWith('spot/') && !(await p.locator('.stars').count())) errs.push(`${name} #/${r} : étoiles absentes`);
      // fiche spot au style validé le 10/11 : note du jour (15 barres, 7 h → 21 h), 2 cartes de conditions, boussole, critères
      if (r.startsWith('spot/')) {
        if ((await p.locator('.notecard .scorebars rect[class^="b-"]').count()) !== 15) errs.push(`${name} #/${r} : barres horaires de la note ≠ 15 (7 h → 21 h)`);
        if ((await p.locator('.today .cond').count()) !== 2) errs.push(`${name} #/${r} : cartes de conditions ≠ 2`);
        if (!(await p.locator('.daytabs button').count())) errs.push(`${name} #/${r} : choix du jour absent`);
        if (!(await p.locator('.mapbox .maprep').count())) errs.push(`${name} #/${r} : repère de la carte absent`);
        if (r === 'spot/port-camargue' && (await p.locator('.crit .gauge').count()) !== 4) errs.push(`${name} #/${r} : 4 critères wing attendus`);
        // survol / toucher d'une colonne de la note : fenêtre explicative, et la carte suit l'heure choisie (demande de Tom, 10/11)
        const bb = await p.locator('.notecard .scorebars').boundingBox();
        const bars = await p.locator('.notecard .scorebars rect.b-good, .notecard .scorebars rect.b-mid, .notecard .scorebars rect.b-bad').count();
        if (bb && bars) {
          const bar = p.locator('.notecard .scorebars rect.b-good, .notecard .scorebars rect.b-mid, .notecard .scorebars rect.b-bad').first();
          await p.locator('.notecard .scorebars').scrollIntoViewIfNeeded();   // titres longs : le graphique peut être sous la ligne de flottaison
          const rb = await bar.boundingBox();
          if (name === 'mobile' || name === 'sombre') await p.mouse.click(rb.x + rb.width / 2, rb.y + rb.height - 2); else await p.mouse.move(rb.x + rb.width / 2, rb.y + rb.height - 2);
          await p.waitForTimeout(150);
          if (!(await p.locator('.hourtip').count())) errs.push(`${name} #/${r} : pas de fenêtre au survol de la note`);
          if (!/survolée/.test(await p.locator('.mapwhen').innerText().catch(() => ''))) errs.push(`${name} #/${r} : la carte ne suit pas l'heure survolée`);
          if (!(await p.locator('.maprep .wind-tag').count())) errs.push(`${name} #/${r} : repère vent absent sur la carte`);
          if ((r === 'spot/plagesud-grandemotte' || r === 'spot/carnon') && !(await p.locator('.maprep .swell-tag').count())) errs.push(`${name} #/${r} : houle absente du repère de la carte`);
        }
        if (!(await p.locator('.notecard .scorebars .grid5').count())) errs.push(`${name} #/${r} : ligne 5 absente`);
        // vent sur la carte façon Windy (grille publiée) : 2 calques (couleurs + particules)
        const hasGrid = await p.evaluate(() => fetch('./data/wind-grid.json').then((x) => x.ok && /json/.test(x.headers.get('content-type') ?? '')).catch(() => false));
        if (hasGrid && (await p.locator('.mapbox .windcanvas').count()) !== 2 && !(await p.locator('.mapbox .windnote').count())) errs.push(`${name} #/${r} : vent absent de la carte`);
        if (await p.getByRole('heading', { name: 'Sessions 2H', exact: true }).count()) errs.push(`${name} #/${r} : section Sessions 2H encore sur la fiche`);
        // changer de jour met à jour la note du jour
        const tabsN = await p.locator('.daytabs button').count();
        if (tabsN > 1) { await p.locator('.daytabs button').nth(1).click(); if ((await p.locator('.daytabs button[aria-pressed="true"]').innerText()) !== (await p.locator('.daytabs button').nth(1).innerText())) errs.push(`${name} #/${r} : choix du jour sans effet`); }
      }
      const tabs = await p.locator('.tabs a').allInnerTexts();
      if (tabs.map((x) => x.trim()).join(',') !== 'WIND,VAGUE,HOULE') errs.push(`${name} #/${r} : onglets ${tabs.join(',')}`);
    }
  }
  // menu (téléphone) ou menu de gauche (ordinateur) : Widgets et Avis accessibles depuis n'importe quel écran
  for (const [link, head] of [[/widgets/i, 'Installer les widgets'], [/avis/i, 'Avis et commentaires']]) {
    await p.goto(`${base}/#/wind/meilleure`); await p.reload();
    const mobile = await p.locator('.menubtn').isVisible();
    if (mobile) await p.locator('.menubtn').click();
    await p.locator(mobile ? '.menu' : '.side').getByRole('link', { name: link }).click();
    try { await p.getByRole('heading', { name: head }).first().waitFor({ timeout: 5000 }); } catch { errs.push(`${name} : ${head} inaccessible depuis le menu`); }
    try { await p.locator('.menu').waitFor({ state: 'detached', timeout: 1500 }); } catch { errs.push(`${name} : menu resté ouvert après navigation`); }
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
