// Contrôle de mise en page des widgets Scriptable, hors iPhone.
//
// Pourquoi : deux bugs de suite sont passés à travers les tests parce que le banc enregistre ce que le widget
// AFFICHE, pas la place que ça prend. Sur l'iPhone de Tom (12/11), la grille débordait de la carte, puis les
// nombres à deux chiffres sont devenus « … ».
//
// La règle qui manquait : dans Scriptable (SwiftUI), un addSpacer() souple réclame au moins ESPACE pt AVANT que
// le texte n'ait sa place. Dans une pile de largeur fixe, deux espaces souples mangent donc 16 pt, et le texte
// qui ne tient plus dans ce qui reste est coupé — remplacé par « … » — même avec minimumScaleFactor.
//
// Le modèle de largeur de texte est une approximation de SF Pro : il sert à repérer ce qui ne tient visiblement
// pas, pas à prédire le rendu au point près. Il reste donc volontairement prudent (il surestime un peu).

const ESPACE = 8;                     // longueur minimale d'un addSpacer() souple
const MARGE = 1.5;                    // tolérance : le modèle de largeur est approché à ~5 % près
// Facteurs recalés sur la capture de l'iPhone de Tom (12/11) : « 10 » en gras lourd 14 pt ne tenait pas dans une
// case de 21 pt, donc un chiffre fait au moins 0,78 × la taille de la police — pas 0,65 comme je l'estimais.
const LARGEUR = { heavySystemFont: 0.80, boldSystemFont: 0.74, semiboldSystemFont: 0.70, systemFont: 0.66 };
// largeur totale (pt) d'un widget sur le plus petit iPhone ; la marge du widget est retirée par son setPadding
export const UTILE = { small: 141, medium: 305, large: 292, extraLarge: 292 };

function largeurTexte(n) {
  const f = n.font ?? { k: 'systemFont', n: 12 };
  const par = LARGEUR[f.k] ?? 0.58;
  let w = 0;
  for (const c of String(n.text)) w += /[0-9]/.test(c) ? par : /[A-ZÀ-ÞŒ★➤]/.test(c) ? par * 1.02 : /[iljtr.,:·'’ ]/.test(c) ? par * 0.5 : par * 0.92;
  return w * f.n;
}

/** Largeur naturelle d'un enfant : ce qu'il demande si on ne le contraint pas. */
function naturelle(n) { return taille(n, false); }
/** Largeur minimale : ce en dessous de quoi il est coupé (un texte peut se réduire, pas un espace souple). */
function minimale(n) { return taille(n, true); }
function taille(n, min) {
  if (n.kind === 'text') return largeurTexte(n) * (min ? (n.minimumScaleFactor ?? 1) : 1);
  if (n.kind === 'image') return n.imageSize?.w ?? 0;
  if (n.kind === 'spacer') return n.n ?? ESPACE;
  if (n._size?.w > 0) return n._size.w;
  const pad = (n.padding?.[1] ?? 0) + (n.padding?.[3] ?? 0);
  const e = n.children.filter((c) => !(c.kind === 'spacer' && n.layout === 'v'));
  if (!e.length) return pad;
  if (n.layout === 'v') return pad + Math.max(...e.map((c) => taille(c, min)));
  return pad + e.reduce((a, c) => a + taille(c, min), 0) + (n.spacing ?? 0) * (e.length - 1);
}

/**
 * Parcourt l'arbre et signale ce qui ne tient pas.
 * @returns {{coupe: string[], reduit: string[], deborde: string[]}}
 */
export function verifierMiseEnPage(racine, famille = 'large', chemin = 'widget') {
  const r = { coupe: [], reduit: [], deborde: [] };
  const voir = (n, dispo, ou) => {
    if (n.kind !== 'stack' && n.kind !== 'widget') return;
    const pad = (n.padding?.[1] ?? 0) + (n.padding?.[3] ?? 0);
    const large = n._size?.w > 0 ? n._size.w : dispo;
    const dedans = large - pad;
    const e = n.children.filter((c) => !(c.kind === 'spacer' && n.layout === 'v'));
    if (!e.length) return;

    if (n.layout === 'v') {
      for (const c of e) {
        if (minimale(c) > dedans + MARGE) {
          if (c.kind === 'text') r.coupe.push(`${ou} › « ${c.text} » : ${naturelle(c).toFixed(0)} pt pour ${dedans.toFixed(0)} pt`);
          else r.deborde.push(`${ou} › bloc ${minimale(c).toFixed(0)} pt pour ${dedans.toFixed(0)} pt`);
        } else if (naturelle(c) > dedans + 0.5 && c.kind === 'text') r.reduit.push(`${ou} › « ${c.text} »`);
        voir(c, dedans, `${ou}/v`);
      }
      return;
    }
    // pile horizontale : les espaces souples se servent les premiers
    const fixe = e.reduce((a, c) => a + (c.kind === 'spacer' ? (c.n ?? ESPACE) : 0), 0);
    const ecarts = (n.spacing ?? 0) * (e.length - 1);
    const autres = e.filter((c) => c.kind !== 'spacer');
    const reste = dedans - fixe - ecarts;
    const demande = autres.reduce((a, c) => a + naturelle(c), 0);
    // part réellement laissée à chaque enfant une fois les espaces servis (elle peut être inférieure au minimum)
    const part = (c) => (demande ? (Math.max(0, reste) * naturelle(c)) / demande : 0);
    if (demande > reste + 0.5) {
      for (const c of autres) {
        const nat = naturelle(c), p = part(c);
        if (nat <= p + 0.5) continue;
        if (c.kind === 'text') { const mini = nat * (c.minimumScaleFactor ?? 1);
          (mini > p + 0.5 ? r.coupe : r.reduit).push(`${ou} › « ${c.text} » : ${nat.toFixed(0)} pt pour ${p.toFixed(0)} pt`);
        } else if (minimale(c) > p + MARGE) r.deborde.push(`${ou} › bloc ${minimale(c).toFixed(0)} pt pour ${p.toFixed(0)} pt`);
      }
    }
    for (const c of autres) voir(c, Math.max(minimale(c), Math.min(naturelle(c), part(c))) || naturelle(c), `${ou}/h`);
  };
  voir(racine, UTILE[famille] ?? 264, chemin);
  return r;
}

/** Message prêt à afficher dans un test, ou '' si tout tient. */
export function problemes(racine, famille) {
  const r = verifierMiseEnPage(racine, famille);
  const l = [...r.coupe.map((x) => `COUPÉ ${x}`), ...r.deborde.map((x) => `DÉBORDE ${x}`)];
  return l.join('\n');
}
