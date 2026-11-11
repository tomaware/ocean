# Widgets OCEAN (iPhone)

Deux widgets Scriptable, mêmes données que l'app OCEAN (`data/widget-wind.json`, mis à jour toutes les heures).

| Script | Ce qu'il montre | Tailles |
|---|---|---|
| `iphone/OCEAN Vent.js` | un spot : le vent maintenant (balise) et dans 2 h, puis 4 jours (étoiles, vent max, direction, créneau) ; en grand, les 12 prochaines heures | petit, moyen, grand, écran verrouillé (rectangle, ligne, rond) |
| `iphone/OCEAN Créneaux.js` | les meilleurs créneaux tous spots confondus ; en grand, la grille spots × 5 jours remplie par étoiles | petit, moyen, grand, écran verrouillé |

Il remplace le widget « Créneau Vent ».

## Installer
1. Installer **Scriptable** (App Store, gratuit).
2. Copier chaque fichier `.js` dans le dossier iCloud Drive › Scriptable, ou créer un script dans Scriptable et coller le contenu.
3. Écran d'accueil : appui long → « + » → Scriptable → choisir la taille → Modifier le widget → Script : « OCEAN Vent » ou « OCEAN Créneaux ».

## Régler
- **Changer de spot (Vent)** : ouvrir le script dans Scriptable (▶︎) → « Choisir le spot » ; ou, pour un seul widget, champ **Parameter** : `Beauduc`, `Le Jaï`, `G-Motte`…
- **Mode** : Sécu first par défaut ; `offshore` dans Parameter (ou ▶︎ → « Mode »).
- **Créneaux** : Parameter `proches` (spots à moins de 55 km de Montpellier), ou une liste `G-Motte, Beauduc, Le Jaï`, combinable avec `offshore`.
- **Balise en direct (mode perso)** : ▶︎ → « Brancher ma super prévision » et coller le lien `…/exec?key=…`. Il est gardé dans le trousseau de l'iPhone, jamais dans le script. Sans lui : prévision de l'heure (« prévu ») ; Le Jaï : mesure publique de Marignane.

Toucher le widget ouvre OCEAN sur la fiche du spot.

## Vérification
`tests/widgets.test.ts` exécute les deux scripts sur un banc d'essai qui remplace l'API Scriptable (toutes les tailles, Parameter, balise, hors ligne, réglages). Le rendu exact se vérifie sur l'iPhone.
