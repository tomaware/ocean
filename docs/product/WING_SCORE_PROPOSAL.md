# Note wing / kite — proposition à valider (D-14)

> **Statut : proposition, rien n'est codé.** Règle du dépôt : pas de score sans formule validée par Tom. Chaque chiffre ci-dessous est un réglage proposé, à corriger.

## 1. Ce que la note doit dire

Une note de 0 à 10 par spot, par heure et par niveau, qui répond à « est-ce que je sors, et c'est bien ? ». Elle ne se compare pas aux notes surf ou downwind (D-15).

Lecture en trois niveaux (UX) :
1. **Coup d'œil** : « Ça envoie » (≥ 7) · « Ça se tente » (5 à 7) · « Non » (< 5), plus le meilleur créneau du jour.
2. **Détail** : vent moyen et rafales en nœuds, direction, orientation par rapport à la plage, note heure par heure.
3. **Expert** : modèles, correction appliquée, confiance, écart prévu / mesuré des jours passés.

## 2. Données utilisées

| Donnée | Source | Statut |
|---|---|---|
| Vent moyen, rafales, direction, heure par heure (6 h–21 h) | Super prévision v3.4 (vent **corrigé** : modèles pondérés par leur erreur aux balises, système champion par spot) | déjà collectée (M1) |
| Confiance | Super prévision (`conf`) | collectée, **affichée à côté** de la note, pas mélangée dedans |
| Jour / nuit | élévation du soleil (même calcul que les moteurs surf et downwind) | existe |
| Orientation de la plage | registre (`orientation.seaward`, direction vers le large) | **à remplir, § 5** |

Les relevés Winds-Up ne servent qu'à corriger la prévision (déjà fait dans la super prévision) et, dans le mode perso, à vérifier la note. Ils ne sont jamais affichés dans l'app publique.

## 3. Formule proposée

```
note = 10 × V(vent moyen, niveau) × R(rafales / vent moyen) × D(angle vent / plage, niveau)
```

arrondie à 0,1, mise à 0 la nuit. Trois facteurs entre 0 et 1, chacun lisible seul (« c'est le vent de terre qui fait tomber la note »).

### V — force du vent (nœuds)

Fonction en trapèze : 0 en dessous du minimum, monte jusqu'à la plage idéale, vaut 1 dedans, redescend jusqu'au maximum.

| Discipline · niveau | Minimum (0) | Idéal (1) | Trop fort (0) |
|---|---|---|---|
| Wing · débutant | 12 | 15 – 20 | 26 |
| Wing · intermédiaire | 12 | 16 – 24 | 30 |
| Wing · confirmé | 11 | 17 – 28 | 35 |
| Kite · débutant | 12 | 14 – 20 | 25 |
| Kite · intermédiaire | 12 | 16 – 25 | 32 |
| Kite · confirmé | 11 | 16 – 30 | 38 |

Repère : le seuil « navigable » de la super prévision est déjà **15 nœuds** (`SEUIL_NAV`), avec une session = **2 h** d'affilée au-dessus (`SESSION_HEURES`). La note reprend ces valeurs : un créneau « Session 2H » = au moins 2 h consécutives à 5/10 ou plus.

### R — vent rafaleux

Rapport rafale / moyenne `g` :

| g | R |
|---|---|
| ≤ 1,30 | 1 |
| 1,30 → 1,60 | descend de 1 à 0,6 |
| 1,60 → 1,90 | descend de 0,6 à 0,4 |
| > 1,90 | 0,4 |

Les rafales qui dépassent le maximum du niveau baissent aussi la note via V, appliqué à `(moyenne + rafale) / 2` au lieu de la moyenne seule quand `g > 1,3`.

### D — direction par rapport à la plage

Angle `a` entre la direction d'où vient le vent et la direction du large (0° = plein onshore, 180° = plein offshore) :

| Secteur | a | Débutant | Intermédiaire | Confirmé |
|---|---|---|---|---|
| Onshore | 0 – 30° | 0,8 | 0,85 | 0,85 |
| Side-on | 30 – 70° | 1 | 1 | 1 |
| Side-shore | 70 – 100° | 0,9 | 1 | 1 |
| Side-off | 100 – 135° | 0 | 0,4 | 0,7 |
| Offshore | > 135° | 0 | 0 | 0,3 |

Le vent de terre est signalé en toutes lettres (« vent de terre : risque de dérive au large ») quel que soit le niveau. Sur un plan d'eau fermé (Le Ponant), D = 1 partout sauf exceptions de spot.

## 4. Ce que la note ne fait pas (volontairement)

- Elle ne baisse pas avec la confiance : une prévision incertaine affiche « incertain » à côté de la note, sans la déguiser.
- Pas d'état de mer pour l'instant (clapot, shore-break). Possible plus tard avec les points vagues déjà collectés.
- Pas de marée, de courant ni de règles locales (zones interdites, saisons) : à ajouter dans la fiche spot, pas dans la note.

## 5. Orientation des 6 spots (à corriger)

| Spot | Large vers (proposé) | Vent idéal (side-on) | Vent de terre | Remarque |
|---|---|---|---|---|
| La Franqui (Coussoules) | 100° (ESE) | E, SE (marin) ; NO (tramontane) en side-off | O | Tramontane très pratiquée en side-off par les confirmés : autoriser ? |
| La Grande-Motte | 160° (SSE) | E, SO | N, NO (mistral) | |
| Le Ponant | plan d'eau fermé | toutes | — | Directions à éviter (obstacles, zones) ? |
| Port Camargue / Espiguette | 190° (S) | SE, SO | N, NO | |
| Beauduc | 200° (SSO) | SE, O-NO | N, NE | Mistral side-shore ? |
| Almanarre | 245° (OSO) | O, NO (mistral) | E, NE | |

## 6. Vérification prévue avant mise en service

1. Test « golden » de la formule sur des cas écrits à la main (ex. Almanarre, 22 nd d'ONO, rafales 28 → note attendue que tu fixes).
2. Rejeu sur 30 jours d'archive de la super prévision : pour chaque jour, la note prévue la veille contre le vent mesuré (mode perso uniquement, relevés Winds-Up jamais publiés). Objectif : les jours notés ≥ 5 sont des jours réellement navigables (≥ 15 nd pendant 2 h) au moins 8 fois sur 10.
3. Ton avis sur 5 à 10 journées dont tu te souviens.

## 7. Questions pour toi

1. Les plages de vent du § 3 collent-elles à ton matériel et à tes sorties ? (ton poids, tailles de wing / kite)
2. Side-off à La Franqui en tramontane : note possible pour les confirmés (0,7) ou toujours « non » ?
3. Orientations du § 5 : à corriger spot par spot.
4. Kite et wing dès le départ, ou wing seul d'abord ?
