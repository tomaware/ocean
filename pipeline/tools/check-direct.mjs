// Vérification sur le site publié, dans un vrai navigateur : la balise Pioupiou de La Franqui est-elle « en direct » (< 5 min) ?
import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage();
const calls = []; p.on('request', (r) => { if (r.url().includes('pioupiou')) calls.push(r.url()); });
await p.goto(process.argv[2] + '#/wind/direct'); await p.waitForTimeout(12000);
const rows = await p.locator('button.liverow').allInnerTexts();
console.log('appels Pioupiou depuis la page :', calls.length);
for (const r of rows) if (/Pioupiou/.test(r)) console.log('ligne :', r.replace(/\d+[,.]?\d*\s*nd/g, '… nd').replace(/\s+/g, ' '));
await b.close();
