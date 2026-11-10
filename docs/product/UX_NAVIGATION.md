# UX et navigation (Phase 2) — v1.0

## Pour qui
Tout le monde (app publique), plus un **mode perso** pour Tom (relevés Winds-Up en direct, lus depuis son appareil seulement).

## Navigation : 3 onglets en haut, modules à droite (demandes de Tom, 10/11)

Dans chaque onglet, menu des modules à droite (ordinateur) ou en pastilles sous le titre (mobile) :
1. **Meilleure session** : la meilleure session 2H à venir + 3 autres bonnes, chacune avec son graphique horaire.
2. **Sessions 2H** : toutes les sessions par jour, graphique horaire sous chaque nom (créneau surligné), commentaire.
3. **Prévision** : grille spots × 5 jours (case colorée = session, nombre d'heures, couleur = note ; sinon vent max ou hauteur max), détail horaire au clic.
4. **Spots** : carte + liste, favoris.

Graphique horaire (7 h – 20 h) : WIND = vent en nœuds + flèche ; VAGUE = hauteur (m) + flèche de houle + période (s) ; HOULE = vent + flèche + houle (m). Couleur = note.
Adresses : `#/wind/meilleure`, `#/wind/sessions`, `#/wind/prevision`, `#/wind/spots` (idem `vague`, `houle`).

### Affichage propre à chaque onglet (10/11, d'après les captures de Tom)
- **WIND** : tableau façon Windguru, heure par heure (session) ou toutes les 3 h sur 5 jours (fiche) : temps (icône), air °C, pluie mm, vent et rafales colorés selon la force (échelle Windguru), direction, orientation de la plage, étoiles. En lecture Expert : les 7 modèles bruts à côté du vent corrigé.
- **VAGUE** : barres façon surf-forecast : case du vent colorée selon offshore / onshore, hauteur des vagues, flèche de houle, période, étoiles ; résumé « 0,9 m » 1,4 m · houle SE 1,1 m 4 s · vent NNE 11 nd · eau 16 °C » ; fiche : 7 jours × 8 h / 13 h / 18 h. (Pas de marées : quelques centimètres en Méditerranée.)
- **HOULE** : le mélange : tableau du vent (Windguru) + barres de houle et période.
- **Note** : en étoiles sur 3 (★ ≥ 5, ★★ ≥ 7, ★★★ ≥ 8,5), la note /10 reste en info-bulle.

### Onglets
| Onglet | Module | Contenu |
|---|---|---|
| **WIND** | Wing foil (vent corrigé par la super prévision) | niveau, meilleure session à venir, sessions 2H par jour, carte + liste des 6 spots, relevés en direct (mode perso) |
| **VAGUE** | Surf (vagues à la côte, Copernicus + 5 modèles recalés aux bouées) | meilleure session, sessions 2H par jour, carte + liste des 8 spots |
| **HOULE** | Downwind (vent + houle au large) | niveau, meilleure session, sessions 2H par jour, carte + 3 parcours |

Adresses : `#/wind`, `#/vague`, `#/houle`, fiche `#/spot/<id>` (l'onglet de son module reste actif), `#/profil` (icône en haut à droite), `#/fiabilite`. Les anciennes adresses (`#/`, `#/spots`, `#/sessions`, `#/previsions`) mènent à WIND.

Mobile : barre du haut collante, icône + nom pour chaque onglet. Ordinateur : même barre, onglets centrés.

## Trois niveaux de lecture (fiche spot)
1. **Synthèse** : sessions 2H du spot + frise jour par jour (une barre par heure, couleur = note).
2. **Détail** : graphique (note + vent / vagues), tableau heure par heure avec « ce qui limite » et les directions dangereuses en rouge.
3. **Expert** : source et méthode, orientation, bouée et mesure récente, correction appliquée, lien vers la fiabilité des modèles.

## Vocabulaire commun
- Note 0-10 ; **Ça envoie** (≥ 7), **Ça se tente** (5 à 7), **Non** (< 5).
- **Session 2H** : au moins 2 h d'affilée à 5/10 ou plus, de jour (D-17).
- Vent en nœuds, vagues en mètres, heures de Paris.
