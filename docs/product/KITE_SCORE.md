# Note kitesurf — v1.0

> **Statut : validée par Tom le 13/11/2026 (D-51).** Code : `pipeline/engines/wing.ts` (`sport = 'kite'`), cas de référence : `tests/wing.test.ts` (partie KITESURF) et `tests/sport.test.ts`.

## Idée

Demande de Tom : wing et kite sont complémentaires. Petit vent → wing (dès 13 nd, jusqu'à 28 nd) ; vent fort → kite (dès 18-20 nd, jusqu'à 40 nd). L'affichage de l'onglet WIND est le même ; seules la note, les étoiles et les créneaux changent selon la bascule **Wing | Kite**.

## Formule

Même formule que le wing : `note = 10 × V(vent) × R(rafales / moyenne) × D(direction / plage)`, 0 la nuit.

- **Vent de la note** : vent moyen, ou moyenne vent + rafales quand les rafales dépassent le vent de plus de 30 % (comme le wing).
- **V (kite)** : 0 jusqu'à 15 nd, ligne droite jusqu'à 1 à 20 nd, **1 de 20 à 35 nd**, ligne droite jusqu'à 0 à 40 nd, 0 au-delà. Mêmes valeurs dans les deux modes.
- **R** (rafales) et **D** (direction) : identiques au wing ; deux modes **Sécu first** (side-off et vent de terre = 0) et **Offshore** (notés, toujours signalés en commentaire). Choix de Tom : mêmes modes qu'en wing.
- Pas de « Kite session » en kite (c'est la règle wing au-delà de 28 nd). Commentaire « trop de vent (plus de 35 nd) » au-delà de 35 nd.
- **Créneaux** : au moins 2 h d'affilée à 5/10 ou plus, de jour (même règle que le wing). « Ça envoie » (4 h à plus de 20 nd) : wing seulement — à 20 nd le kite ne fait que commencer.

## Cas de référence (vent régulier side-shore, Almanarre, rafales × 1,1)

| Vent | Wing v2.2 | Kite v1.0 |
|---|---|---|
| 14 nd | 10 | 0 |
| 16 nd | 10 | 2 |
| 18 nd | 10 | 6 |
| 20 – 28 nd | 10 | 10 |
| 29 nd | 5 · ★ rouge « Kite session » | 10 |
| 32 nd | 0 · ★ rouge « Kite session » | 10 |
| 37,5 nd | 0 | 5 |
| 40 nd et plus | 0 | 0 |

Rafaleux : 24 nd rafales 36 (× 1,5) → vent de la note 30 nd, R = 0,73 → **7,3**. La Franqui en tramontane 25 nd : 0 en Sécu first, 10 en Offshore (signalé « vent de terre »).

## Vérifié sur les données réelles (13/11)

Vent réellement publié (super prévision, 721 heures, 7 spots) rejoué avec la note kite : 4 créneaux kite en Sécu first contre 9 en wing (Le Jaï aujourd'hui, Espiguette dimanche, Beauduc et Almanarre mercredi). Les rafales comptent : Espiguette dimanche, 16 nd rafales 23 donne un vent de la note de 19,5 nd, donc 7,4/10 en kite.

## Pas encore fait

Widgets iPhone, Mac et Windows : toujours en wing (prochaine étape si Tom le demande).
