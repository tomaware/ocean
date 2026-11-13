# Note wing foil — v2.2

> **Statut : validée par Tom le 10/11 (D-14, D-16) ; v1.1 le 10/11 à 12 h 41 (D-18 : « trop de vent c'est plus de 35 nœuds, sinon c'est OK ») ; v2.0 le 10/11 à 13 h 45 (D-19 : deux modes « Secu first – OffShore » au lieu des trois niveaux ; « ça envoie » quand il y a plus de 4 h de vent à plus de 20 nd) ; v2.1 le 13/11 (D-49 : « au-delà de 28 nd, 1 étoile rouge et Kite session ; 30 nd en wing c'est 0 »).**

## Hyères : deux plages (13/11, D-58)

Demande de Tom : « Almanarre devient Hyères ; il est plutôt offshore, il y a un bon spot de chaque côté donc toujours un choix en sécu ». Le spot a maintenant deux côtés : la plage ouest (Almanarre, ouverte vers 245°) et le côté est du tombolo (La Capte / La Bergerie, ouvert vers ~110°, confirmé par Tom le 13/11). Pour chaque heure, la direction est jugée sur le côté le mieux orienté ; le commentaire précise « côté est du tombolo » quand c'est lui. Le reste de la formule ne change pas (ce n'est pas une nouvelle version de la note).

Avant / après, 20 nd rafales 24, Sécu first : vent de 45° 0 → 10 ; 90° 0 → 8 (face à la plage est) ; 135° 0 → 8 ; 290° 10 → 10 ; 0° (nord) 0 → 0 (side-off des deux côtés). Sur la prévision publiée du 13/11 : 9 heures de jour sur 60 changent (vent d'est faible samedi et dimanche, 0 → 0,5 à 5,3).

## v2.2 — pleine note dès 13 nd (13/11, D-50)

Demande de Tom : « dès 13 nœuds tu peux commencer à partir en session ». La force V vaut 0 jusqu'à 10 nd, monte en ligne droite jusqu'à **1 à 13 nd**, même seuil en Sécu first et en Offshore (avant : 12 → 15 nd en Sécu first, 11 → 14 nd en Offshore). Le haut ne change pas (plein jusqu'à 28 nd, 0 à 30 nd).

| Vent (régulier, side-shore) | v2.1 Sécu first | v2.2 |
|---|---|---|
| 10 nd | 0 | 0 |
| 12 nd | 0 | 6,7 |
| 13 nd | 3,3 | 10 |
| 14 nd | 6,7 | 10 |
| 15 nd et plus | 10 | 10 |

Le kitesurf a sa propre note (même formule, autre plage de vent) : voir `KITE_SCORE.md` (D-51).

## v2.1 — « Kite session » au-delà de 28 nd (13/11, D-49)

Demande de Tom : « quand il y a plus de 28 nds, passe à 1 étoile rouge et mets Kite session. Ajuste la note en fonction : 30 nds en wing c'est 0 ». Choix validés par Tom : le seuil se lit sur **le vent de la note** (vent moyen, ou moyenne vent + rafales quand les rafales dépassent le vent de plus de 30 %), et les heures « Kite session » **ne comptent pas** dans les créneaux wing.

- **Force V** : 1 jusqu'à 28 nd inclus, puis baisse en ligne droite jusqu'à **0 à 30 nd** (0,5 à 29 nd) ; 0 au-delà. Mêmes valeurs en Sécu first et en Offshore.
- **Kite session** : de jour, vent de la note > 28 nd. Partout (app, iPhone, Mac, Windows) l'heure s'affiche avec **1 étoile rouge** et « Kite session » (« Kite » quand la place manque), quelle que soit la note. Le commentaire commence par « Kite session (plus de 28 nd) ».
- **Créneaux** : une heure « Kite session » coupe le créneau, même si sa note atteint 5/10. Les étoiles d'un jour viennent de sa meilleure heure hors « Kite session » ; si aucune n'a d'étoile et qu'il y a du kite, le jour prend l'étoile rouge. Dans les grilles 5 jours, les heures « Kite » remplissent la case en rouge.
- Données des widgets : 8ᵉ valeur de chaque heure = « Kite session » (1/0) ; 5ᵉ valeur des comptes du jour = heures « Kite session ».

Cas de référence avant / après (vent régulier side-shore, Almanarre, rafales × 1,1) :

| Vent | v2.0 | v2.1 |
|---|---|---|
| 26 nd | 10 ★★★ | 10 ★★★ |
| 28 nd | 10 ★★★ | 10 ★★★ |
| 28,5 nd | 10 ★★★ | 7,5 · ★ rouge « Kite session » |
| 29 nd | 10 ★★★ | 5 · ★ rouge « Kite session » |
| 30 nd à 35 nd | 10 ★★★ | 0 · ★ rouge « Kite session » |
| 36 nd | 0 | 0 · ★ rouge « Kite session » |

24 nd rafales 34 (× 1,42) : vent de la note (24 + 34) / 2 = 29 nd → 5 et « Kite session » ; 26 nd rafales 33 (× 1,27) : vent de la note 26 → 10, pas kite.

## v2.0 en bref (remplace les niveaux des §§ 3 et 5)

| | Sécu first | Offshore |
|---|---|---|
| Vent : 0 → 1 | 12 → 15 nd | 11 → 14 nd |
| Vent : 1 jusqu'à | ~~35 nd inclus~~ 28 nd inclus, 0 à 30 nd (v2.1) | ~~35 nd inclus~~ 28 nd inclus, 0 à 30 nd (v2.1) |
| Vent de mer (0-30°) | 0,8 | 0,8 |
| Side-on / side-shore | 1 | 1 |
| Side-off (100-135°) | 0 | 1 (commentaire « side-off ») |
| Vent de terre (> 135°) | 0 | 1 (commentaire « vent de terre ») |

Rafales (R), plan d'eau fermé, nuit : inchangés. Affichage : la note seule (/10) ; **« Ça envoie »** seulement si la session compte au moins 4 h à plus de 20 nd (vent moyen corrigé). Sessions de 2H : spots à moins de 55 km de Montpellier (La Franqui, Beauduc, Almanarre restent dans Prévision et Meilleure session).
Cas de référence avant / après : La Franqui, tramontane 20 nd (vent de terre) : 0 → 0 en Sécu first, 10 en Offshore ; Espiguette, 18 nd de NO (side-off) : intermédiaire 3 → Sécu first 0, Offshore 10.

Le reste de ce document décrit la v1 (historique). Wing seulement, pas de kite (plages de vent différentes). Code : `pipeline/engines/wing.ts`, cas de référence : `tests/wing.test.ts`. Toute modification = décision documentée + cas de référence mis à jour.

## Facteurs publiés (10/11, D-20)
Chaque heure publiée porte aussi `f[mode] = [V, R, D]` (arrondis au centième) pour expliquer la note dans l'app (jauges « Force du vent », « Régularité », « Direction / plage »). **La formule et les notes ne changent pas** : vérifié sur les données réelles (720 notes recalculées, 0 écart) et par un test (10 × V × R × D à ± 0,1 de la note). La nuit, la note reste 0 et les facteurs restent lisibles.

## 1. Ce que la note dit

Une note de 0 à 10 par spot, par heure et par niveau (débutant, intermédiaire, confirmé), qui répond à « est-ce que je sors, et c'est bien ? ». Elle ne se compare pas aux notes surf ou downwind (D-15).

Lecture en trois niveaux :
1. **Coup d'œil** : « Ça envoie » (≥ 7) · « Ça se tente » (5 à 7) · « Non » (< 5), plus le meilleur créneau du jour.
2. **Détail** : vent moyen et rafales en nœuds, direction, secteur par rapport à la plage, note heure par heure, ce qui limite la note.
3. **Expert** : modèles, correction appliquée, confiance, écart prévu / mesuré des jours passés.

## 2. Données

| Donnée | Source |
|---|---|
| Vent moyen, rafales, direction, heure par heure (6 h–21 h) | Super prévision v3.4 : vent **corrigé** (modèles pondérés par leur erreur aux balises, système champion par spot) |
| Confiance | Super prévision (`conf`), **affichée à côté** de la note, pas mélangée dedans |
| Jour / nuit | élévation du soleil > −2° (comme le moteur downwind) |
| Orientation de la plage | registre, `orientation.seaward` (§ 5) |

Sans super prévision, pas de note : pas de repli silencieux sur un vent brut. Les relevés Winds-Up ne servent qu'à corriger la prévision ; ils ne sont jamais affichés dans l'app publique.

## 3. Formule

```
note = 10 × V(vent, niveau) × R(rafales / moyenne) × D(angle vent / plage, niveau)
```

arrondie à 0,1, mise à 0 la nuit. Chaque facteur est entre 0 et 1, et le plus bas est donné comme explication (« pas assez de vent », « vent rafaleux », « vent de terre »…).

### V — force du vent (nœuds)

Trapèze : 0 au minimum, monte jusqu'à l'idéal, 1 dans l'idéal, redescend jusqu'à 0 au maximum. Quand les rafales dépassent 1,3 × la moyenne, V est calculé sur `(moyenne + rafale) / 2`.

| Niveau | Minimum (0) | Idéal (1) | Trop fort (0) |
|---|---|---|---|
| Débutant | 12 | 15 – 35 | au-delà de 35 |
| Intermédiaire | 11 | 14 – 35 | au-delà de 35 |
| Confirmé | 9 | 14 – 35 | au-delà de 35 |

**v1.1 (D-18, Tom)** : plus de pénalité pour vent fort jusqu'à 35 nœuds inclus, à tous les niveaux ; au-delà, note 0 et commentaire « trop de vent (plus de 35 nd) ». En v1.0, la note baissait dès 20 nd (débutant), 24 nd (intermédiaire) ou 28 nd (confirmé). Cas de référence avant / après : Almanarre, 22 nd d'ONO, débutant : 6,7 → 10.

D'où viennent ces chiffres :
- Débutant 15–20 nd idéal : [Poole Harbour](https://pooleharbour.co.uk/blogs/foiling-blogs/how-much-wind-for-wing-foiling) (« 15-20 knots », matériel débutant 15–24 nd) et [Windance](https://www.windance.com/blogs/wing-foiling/wing-size-by-wind-chart) (12–20 nd, la plage où les débutants progressent le mieux ; 25 nd et + déconseillé aux débutants).
- Intermédiaire jusqu'à 24–25 nd : Windance, la tranche 20–25 nd est « mieux une fois qu'on vole dans les deux sens ».
- Confirmé dès 9 nd : Windance classe 8–12 nd « avancé » (grande aile, pumping) ; 25 nd et + = petites ailes, réservé aux riders à l'aise.
- Repère maison : le seuil « navigable » de la super prévision est 15 nd (`SEUIL_NAV`), pile dans l'idéal débutant.

### R — vent rafaleux

| Rafale / moyenne | R |
|---|---|
| ≤ 1,30 | 1 |
| 1,30 → 1,60 | de 1 à 0,6 |
| 1,60 → 1,90 | de 0,6 à 0,4 |
| > 1,90 | 0,4 |

### D — direction par rapport à la plage

Angle entre la direction d'où vient le vent et la direction du large (0° = plein onshore, 180° = plein offshore) :

| Secteur | Angle | Débutant | Intermédiaire | Confirmé |
|---|---|---|---|---|
| Vent de mer (onshore) | 0 – 30° | 0,7 | 0,8 | 0,8 |
| Side-on | 30 – 70° | 1 | 1 | 1 |
| Side-shore | 70 – 100° | 1 | 1 | 1 |
| Side-off | 100 – 135° | 0 | 0,3 | 0,6 |
| Vent de terre (offshore) | > 135° | 0 | 0 | 0 |

Changements depuis la proposition, d'après [Gong](https://www.gong-galaxy.com/en/blogs/how-to/find-the-right-spot) : le side-shore est la meilleure orientation (D = 1 à tous les niveaux) ; l'onshore gêne les départs et pousse vers le bord (0,7–0,8) ; le vent de terre est dangereux (au-delà d'environ 20 nd, impossible de revenir) : 0 même pour un confirmé, au lieu de 0,3. Le side-off reste noté pour les confirmés (0,6), avec l'avertissement affiché.

Plan d'eau fermé (Le Ponant) : D = 1, sauf secteurs déconseillés (× 0,6).

### Session 2H

Un créneau = au moins **2 h d'affilée** à 5/10 ou plus, de jour, hors « Kite session » (v2.1) (même durée que `SESSION_HEURES` de la super prévision). Une heure manquante coupe le créneau.

## 4. Ce que la note ne fait pas (volontairement)

- Elle ne baisse pas avec la confiance : une prévision incertaine affiche « incertain » à côté.
- Pas d'état de mer (clapot, shore-break) pour l'instant.
- Pas de marée, de courant ni de règles locales (zones interdites l'été, écoles) : dans la fiche spot.

## 5. Orientation des 6 spots

Proposées à partir de guides de spots, **à confirmer par Tom** (surtout Beauduc et Almanarre).

| Spot | Large vers | Ce que disent les guides | Confiance |
|---|---|---|---|
| La Franqui | 100° (ESE) | Bons vents NE, E, SE, S ; tramontane = vent de terre, réservée aux très bons kiters ([Ultimate France](https://www.ultimatefrance.com/kitesurfing/south-france)) | moyenne |
| La Grande-Motte | 160° (SSE) | S, SE (le SE donne des vagues) ([Sroka](https://srokacompany.com/en/blogs/actualites/spots-de-wing-foil-autour-de-montpellier), Ultimate France) | moyenne |
| Le Ponant | étang | SE, SO, NO ; vent du nord déconseillé (secteur 340°–30°, × 0,6) (Sroka) | moyenne |
| Port Camargue / Espiguette | 200° (SSO) | S, SO, NO ; attention au vent qui tourne au large (Sroka, Ultimate France) | moyenne |
| Beauduc | 250° (OSO) | Guide : « tous vents, toute l'année », sans orientation ; 250° = golfe de Beauduc, à confirmer | faible |
| Almanarre | 245° (OSO) | E, SE, SO, O cités ; plage ouest du tombolo, donc l'E y serait un vent de terre : à confirmer | faible |

## 6. Vérification

1. Cas de référence écrits à la main (`tests/wing.test.ts`), passés à chaque exécution.
2. À faire : rejeu sur 30 jours d'archive de la super prévision (mode perso, relevés Winds-Up jamais publiés). Objectif : les jours notés ≥ 5 la veille sont réellement navigables (≥ 15 nd pendant 2 h) au moins 8 fois sur 10.
3. À faire : ton avis sur 5 à 10 journées dont tu te souviens.
