# OCEAN / Flow Light — direction créative

> **Décision de Tom (10/11/2026)** : direction retenue = le style de sa référence (note horaire + cartes + boussole + détail de la note en jauges), **avec un mode sombre**, en gardant la navigation et les mots de l'app actuelle (WIND / VAGUE / HOULE, Meilleure session, Sessions 2H, Prévision, Spots, étoiles sur 3, « Ça envoie », « Commentaire », Sécu first / Offshore) et les **nœuds (nd)**. Maquettes validées (« oui c'est top ») sur le canevas « OCEAN Flow Light — écran Vent » : WIND (prévision, détail de la note, vent heure par heure), VAGUE, HOULE, ordinateur, mini design system, en clair et en sombre. Les variantes A / B ci-dessous sont l'exploration qui a précédé ; elles ne sont plus suivies.

## 0. Ce qui est appliqué dans l'app
- **Thèmes** : clair (fond #F2F3F0, cartes blanches) et sombre (fond #0D191E, cartes #16262C) ; automatique selon le téléphone, ou choisi dans Profil. Carte OpenStreetMap assombrie en mode sombre.
- **Navigation** : WIND / VAGUE / HOULE en pilule en haut ; modules soulignés sous l'en-tête (mobile) ou colonne de gauche (ordinateur) ; flèche Retour en gras.
- **Fiche spot** : choix du jour (avec étoiles) → **Note du jour** (étoiles, créneau(x) de session 2H, « Ça envoie », 24 barres horaires rouge / jaune / vert, nuit grisée, trait « Maintenant ») → deux cartes (WIND : Vent + Météo ; VAGUE : Vagues + Vent ; HOULE : Vent + Houle) → carte avec boussole (vent de l'heure, axe de la plage) → **critères** : WIND = 4 jauges (force, régularité, direction / plage, lumière du jour) et la formule ; VAGUE / HOULE = conditions de l'heure (le détail par critère de ces moteurs n'est pas publié) → tableaux heure par heure et jour par jour (Windguru / surf-forecast) inchangés.
- **Heure de référence des cartes** : l'heure en cours si l'on regarde aujourd'hui en journée, sinon la meilleure heure du jour choisi.
- **Aucune note recalculée par l'interface** : les jauges WIND lisent les facteurs V × R × D publiés par le moteur wing (D-20).

## 1. Audit de l'existant (ce qui compte pour le design)
- **Données disponibles et fiables** (chaîne vérifiée) : vent corrigé (super prévision) + 7 modèles bruts, rafales, direction ; vagues à la côte (fourchette), houle (hauteur, période, direction), vent au spot et son orientation (offshore / onshore), température de l'eau ; houle + vent sur les parcours downwind ; météo du spot (air, pluie, nuages) ; notes des moteurs, sessions 2H, fiabilité des modèles.
- **Pas de marées** : quelques centimètres en Méditerranée ; le niveau d'eau est collecté mais non affiché (à décider).
- **Interface actuelle** (Vite + Preact + uPlot + Leaflet) : fonctionne et est testée à chaque mise à jour ; elle reste en ligne pendant l'exploration. Le design validé remplacera la couche visuelle, pas les moteurs ni les données.
- **Ce que disent les usages** (retours de Tom du 10/11) : WIND = lecture façon Windguru (densité, couleurs de force), VAGUE = barres façon surf-forecast, HOULE = le mélange ; note en étoiles sur 3 ; sessions limitées autour de Montpellier ; « Ça envoie » seulement si ≥ 4 h à plus de 20 nd.

## 2. Synthèse de la direction
Outil précis d'abord, envie d'aller à l'eau ensuite. Une seule couleur d'accent de marque (Sea), la couleur forte réservée aux données (échelle de vent séparée de la marque), une typographie franche pour les chiffres, des courbes fines, des blocs neutres, très peu d'ombres. Pas de carte pour chaque mesure : un résumé, une courbe, un tableau.

## 3. Deux variantes
| | A « Calme » | B « Courant » |
|---|---|---|
| Fond | clair partout (#F7F7F3) | bandeau encre (#152B33) en tête, contenu clair |
| Typo | Inter seule, chiffre héros 72 px | Manrope pour titres et chiffres (112 px), Inter pour les données |
| Vent du jour | courbe fine vent + rafales, créneau surligné | histogramme horaire, rafales en trait corail |
| Tableau | façon Windguru (cases colorées par force) | barres + flèches (plus graphique, moins dense) |
| Modèles | barres par modèle | « ruban » de dispersion (accord des modèles en un coup d'œil) |
| Énergie | corail réservé à la vigilance | corail pour la sélection et la ligne de houle aqua |
| Risque | un peu sage | moins dense ; le bandeau prend de la hauteur sur mobile |

## 4. Navigation proposée
Garder la décision de Tom (D-18/D-19) : **disciplines en haut (WIND / VAGUE / HOULE)**, **modules en second niveau** (Meilleure session, Sessions 2H, Prévision, Spots) : pastilles sous l'en-tête sur mobile, colonne de gauche sur ordinateur (avec « Mes spots »). Réglages par l'icône profil. Contexte gardé d'un écran à l'autre : spot, jour, discipline, unités (nd / km/h). Une seule navigation de premier niveau : pas de seconde barre « Accueil / Spots / Prévisions » concurrente.

## 5. Composants communs (inventaire)
DisciplineTabs · ModuleNav · SpotPicker · DayPicker (jour + vent max + étoiles) · ConditionsHero (chiffre héros, rafales, rose de direction, étoiles, créneau) · VigilanceNote · ForecastTimeline (courbe vent/rafales ou vagues, créneaux) · HourlyTable (colonne des paramètres fixe, défilement horizontal) · WindCell (échelle de force) · DirectionArrow · WaveBar · Stars · ModelComparison · SessionWindow · SpotList / SpotMap · DataBadge (fictif / prévu / mesuré / corrigé) · SourceLine.

## 6. Questions vraiment bloquantes
1. **Variante** : A, B, ou A avec des éléments de B (lesquels) ?
2. **Navigation** : le brief propose « Accueil / Spots / Prévisions / Sessions / Réglages » ; aujourd'hui tu as demandé WIND / VAGUE / HOULE + modules. On garde WIND / VAGUE / HOULE ?
3. **Kite** : le brief le cite, mais la note est « wing seulement » (D-16). On reste wing seul ?
4. **Unités** : nœuds par défaut partout, km/h en option (proposé) ?
