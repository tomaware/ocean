# UX et navigation (Phase 2) — v1.0

## Pour qui
Tout le monde (app publique), plus un **mode perso** pour Tom (relevés Winds-Up en direct, lus depuis son appareil seulement).

## Navigation (5 onglets)
| Onglet | Rôle | Écran |
|---|---|---|
| Accueil | « Où et quand aller à l'eau ? » : la meilleure session à venir par discipline (wing, surf, downwind, pas de classement entre elles, D-15), puis les prochaines sessions (sur les favoris s'il y en a) | `#/` |
| Spots | Carte + liste des 17 spots et parcours, filtre par discipline, étoile favori | `#/spots` |
| Prévisions | Choix du spot, puis fiche spot | `#/previsions`, `#/spot/<id>` |
| Sessions | Toutes les sessions 2H à venir, par jour, filtres discipline / favoris | `#/sessions` |
| Profil | Niveau par discipline, favoris, thème, mode perso, lien vers Fiabilité | `#/profil`, `#/fiabilite` |

Mobile : barre d'onglets en bas. Ordinateur : barre latérale.

## Trois niveaux de lecture (fiche spot)
1. **Synthèse** : sessions 2H du spot + frise jour par jour (une barre par heure, couleur = note).
2. **Détail** : graphique (note + vent / vagues), tableau heure par heure avec « ce qui limite » et les directions dangereuses en rouge.
3. **Expert** : source et méthode, orientation, bouée et mesure récente, correction appliquée, lien vers la fiabilité des modèles.

## Vocabulaire commun
- Note 0-10 ; **Ça envoie** (≥ 7), **Ça se tente** (5 à 7), **Non** (< 5).
- **Session 2H** : au moins 2 h d'affilée à 5/10 ou plus, de jour (D-17).
- Vent en nœuds, vagues en mètres, heures de Paris.
