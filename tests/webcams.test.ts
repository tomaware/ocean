// Webcams des spots (registry/webcams.json, D-46 / D-47) : registre complet, provenance, et aucun flux intégré
// chez un éditeur qui ne l'autorise pas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const W = JSON.parse(readFileSync('registry/webcams.json', 'utf8'));
const S = JSON.parse(readFileSync('registry/spots.json', 'utf8'));
const spots: { id: string }[] = Array.isArray(S) ? S : S.spots;

test('webcams : chaque spot a été recherché, et rien d’autre', () => {
  assert.deepEqual(Object.keys(W.webcams).sort(), spots.map((s) => s.id).sort());
});

test('webcams : chaque entrée a un éditeur connu, une URL https et sa provenance', () => {
  for (const [id, cams] of Object.entries<any[]>(W.webcams))
    for (const c of cams) {
      assert.ok(W.editeurs[c.editeur], `${id} : éditeur ${c.editeur}`);
      assert.match(c.url, /^https:\/\//, `${id} : ${c.url}`);
      assert.match(c.source, /^https:\/\//, `${id} : source`);
      assert.ok(['video', 'images'].includes(c.type), `${id} : type`);
      assert.ok(['spot', 'proche'].includes(c.position), `${id} : position`);
      assert.ok(['page', 'annuaire'].includes(c.verif), `${id} : verif`);
      assert.ok(c.titre?.length > 3, `${id} : titre`);
    }
});

test('webcams : aucun lecteur intégré chez un éditeur qui ne l’autorise pas', () => {
  // Viewsurf : « toute diffusion sans autorisation préalable » interdite (mentions légales, 13/11/2026).
  assert.equal(W.editeurs.viewsurf.integration, 'lien');
  const ui = readFileSync('src/features/pages.tsx', 'utf8') + readFileSync('src/services/webcams.ts', 'utf8');
  assert.doesNotMatch(ui, /<iframe|<video|joada/i);                     // la fiche renvoie chez l'éditeur, rien n'est rediffusé
  assert.match(ui, /target="_blank" rel="noopener noreferrer"/);
});

test('webcams : couverture de la collecte du 13/11 (les spots filmés restent filmés)', () => {
  const n = (id: string) => W.webcams[id].length;
  for (const id of ['la-franqui', 'palavas', 'la-grande-motte', 'almanarre']) assert.ok(W.webcams[id].some((c: any) => c.position === 'spot'), id);
  assert.equal(n('la-franqui'), 4);
  for (const id of ['beauduc', 'le-jai']) assert.equal(n(id), 0, `${id} : aucune webcam trouvée`);
});
