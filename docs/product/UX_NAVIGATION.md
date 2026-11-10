# UX et navigation (Phase 2) — v1.0

## Pour qui
Tout le monde (app publique), plus un **mode perso** pour Tom (relevés Winds-Up en direct, lus depuis son appareil seulement).

## Navigation : 3 onglets en haut, un par module (demande de Tom, 10/11)
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
