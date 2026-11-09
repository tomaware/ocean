# EXISTING_APPS_AUDIT — Phase 0

*OCEAN · audit des applications existantes · 10/11/2026 · v0.1*

Légende : **[vérifié]** = lu dans le code et/ou constaté sur des données réelles · **[déclaré]** = documenté mais non revérifié ici · **[non vérifiable]** = impossible à contrôler depuis cet environnement.

## 1. Ce qui a réellement été examiné

| Application | Source examinée | Exécution observée |
|---|---|---|
| Super Prévi Vent | Code Apps Script complet `super-prevision-vent.gs` v3.4 (1 642 lignes) + widgets PC (PowerShell), Mac (Übersicht), iPhone (Scriptable) | Journaux d'exécution réels (Météo-France, METAR, Winds-Up, banc), flux `?action=widget` consommé par le downwind le 09/11 (55 h corrigées par spot) |
| SurfVague (Super Prévi Surf) | Dépôt `tomaware/super-previ-surf` complet : moteur, collecteurs, pages, widgets, tests, workflow | Exécutions GitHub Actions horaires (succès), journal Candhis du 09/11, backtest à l'aveugle du 09/11 |
| Session 2H (surf) | `web/session/session-core.js` + `index.html` + widget + 8 tests | Tests locaux au vert ; pas de session réelle observée |
| SurfHoule (Downwind) | Dépôt `tomaware/downwind-foil` complet (écrit le 09/11) | 16 tests au vert, exécutions horaires réelles, page vérifiée dans le navigateur |
| Banc houle | `banc-houle.gs` v1.6 (Apps Script) | Journaux `testCandhis` / `testSurf` du 09/11 |

Non examiné : le code tel qu'il est réellement collé dans l'éditeur Apps Script (je n'ai que ma dernière version) ; les fiches spots sur le terrain ; le comportement des widgets sur les appareils de Tom (seulement par captures).

## 2. Cartographie

### A. Super Prévi Vent — moteur VENT (privé)

- **Stack** : Google Apps Script (V8), Google Sheet « Super prévision vent – données » (compte `thomas@band-originale.com`), CacheService, déclencheurs horaires + direct toutes les 5 min (6 h–22 h). Web app JSON protégée par clé (`?action=widget|live|banc|debug`). [vérifié]
- **Spots (6)** : La Franqui, La Grande-Motte, Le Ponant, Port Camargue / Espiguette, Beauduc, Almanarre (Hyères). Zone cible OCEAN : Perpignan → Almanarre. [vérifié]
- **Sources** : Open-Meteo multi-modèles (AROME HD, AROME, ICON-D2, ECMWF IFS 0,25, ICON-EU, ARPEGE, GFS) ; prévisions WRF de Winds-Up (secours) ; observations Winds-Up (abonnement, connexion par identifiants), Météo-France DPObs (stations < 30 km, < 80 m), METAR (aéroports). [vérifié]
- **Calcul** : pondération des modèles par erreur mesurée sur 21 jours (heures 8-20 h), facteur de correction par modèle × secteur de vent (N/E/S/O) avec a priori, modèles fins prioritaires (globaux × 0,25), 4 systèmes : A = AROME HD brut, B = moyenne pondérée corrigée, C = médiane lissée, D = C recalé sur le dernier relevé (demi-vie 3 h, ±10 nd max). Champion choisi par spot sur l'erreur relative. Confiance = accord des modèles. [vérifié]
- **Remise en question** : banc d'essai (archive toutes les 3 h des 72 h suivantes, comparaison aux relevés), sessions 2 h « navigables » (≥ 15 nd) et fausses alertes, contrôle croisé des observations (Winds-Up vs Météo-France vs METAR). [vérifié]
- **Sorties** : par spot, heure par heure de 6 h à 21 h sur 7 jours : `{t, v (nd), o (boussole), r (rafale), s, conf, n}` + `live` (relevés Winds-Up 3 h) + `meilleurs` (modèle le plus fiable). Unités : nœuds, direction en texte 16 points. [vérifié]
- **Interfaces** : widgets PC / Mac / iPhone (2 jours), tableau de bord (artifact) du banc.
- **Points d'attention** :
  - Clé d'accès et clé API Météo-France **écrites en dur** dans le code : interdit de publier ce fichier tel quel. [vérifié]
  - Relevés Winds-Up = données d'abonnement : jamais publiques (décision D-03 / D-08).
  - Dépend du compte Google Band Originale (Tom souhaite séparer le perso). [vérifié]
  - Quotas Apps Script (6 min / exécution, UrlFetch), 429 d'Open-Meteo depuis les IP Google (contourné par cache 6 h). [vérifié]
  - Aucun test automatisé : la non-régression repose sur des journaux. [vérifié]

### B. SurfVague — moteur VAGUE (public)

- **Stack** : JavaScript UMD sans dépendance (`engine/surf-engine.js`, 48 Ko) exécuté par Node dans GitHub Actions ; collecteurs Python (Copernicus Marine via `copernicusmarine`, Candhis public + API) ; pages statiques ; GitHub Pages. Tests : 38 JS (node:test, Playwright pour l'UI) + 9 Python. [vérifié]
- **Spots (8)** : Carnon, Palavas, Sète, Vias (La Guillotine), Gruissan, Canet, Paulilles, Perafita — fiches avec orientation, fenêtre de houle, tailles min / idéale / max, bouées de référence, confiance. [vérifié]
- **Sources** : Open-Meteo Marine (5-7 modèles de vagues, partitions houle / mer du vent), Copernicus MEDSEA, Open-Meteo vent (AROME + ECMWF), Candhis (4 bouées en service, API officielle en secours depuis le 09/11). [vérifié]
- **Calcul** : hauteur au déferlement (Komar & Gaillard, angle d'incidence, facteur de fenêtre, abri), facteurs taille / période / vent (offshore → onshore, rafales), ensemble pondéré par erreur aux bouées (3 derniers jours — fenêtre confirmée la meilleure par backtest le 09/11 : 0,216 m contre 0,281 m sur 30 j), recalage « nowcast » sur la dernière mesure, détection de bascule et d'aplatissement, créneaux. [vérifié]
- **Sorties** : `forecast.json` publié sur Pages (spots × heures : score 0-10, hb, intervalle, hs, tp, dir, vent, confiance…, créneaux, vérification par bouée, mesures 48 h). [vérifié]
- **Interfaces** : page principale, page autonome, widget iPhone.
- **Points d'attention** : identifiants Copernicus en secrets GitHub ; historique bouées versionné dans le dépôt (croît chaque heure) ; retards possibles des tâches planifiées GitHub (5-20 min). [vérifié]

### C. Session 2H (surf)

- **Calcul** (`session-core.js`) : lit `forecast.json`, plages de dispo réglables (avant le boulot, midi, soir, week-end), spots Palavas / Carnon, session de 2 h, préférence pour des blocs réguliers plutôt qu'un pic, raccourcissement au lever / coucher. Verdict par jour. [vérifié]
- **Interfaces** : page `/session/`, widget iPhone dédié. Préférences stockées dans le navigateur. [vérifié]
- **Transversalité** : la recherche de créneaux (plages, durée, soleil) est générique ; **la note reste celle du surf**. Réutilisable pour d'autres disciplines à condition de garder une note propre à chacune (règle OCEAN 1.1.C). [vérifié]

### D. SurfHoule — moteur HOULE / downwind (public)

- **Stack** : même modèle que SurfVague (JS UMD + Node + Actions + Pages), réutilise une copie du moteur surf (`lib/surf-engine.js`). Carte Leaflet + OpenStreetMap. 16 tests. [vérifié]
- **Parcours (3)** : Frontignan ↔ Palavas, Palavas ↔ La Grande-Motte, Plage Sud → La Grande-Motte (sens unique, traversée de baie). Tracés à ~1,2 km du bord. [vérifié]
- **Calcul** : note 0-10 par niveau = vent × orientation à la côte (side-shore idéal, vent de terre plafonné à 1) × axe du parcours × régularité × (0,35 + 0,65 × hauteur × période × mer croisée). Seule la mer qui avance avec le vent compte. Vent corrigé par la super prévision autour de La Grande-Motte et Port Camargue (rayon 12 km), recalé sur Winds-Up sans publier les relevés. Champ de vent sur grille 7 × 9. [vérifié]
- **Points d'attention** : critères adaptés à la Méditerranée mais **non validés sur le terrain** ; coordonnées des tracés approximatives ; copie du moteur surf (risque de divergence). [vérifié]

### E. Banc houle (Apps Script)

Doublon de SurfVague, consomme le quota Candhis. Arrêt décidé (D-01) ; déclencheur encore actif sur le compte Band Originale au 09/11. [vérifié]

## 3. Fonctions à conserver (non négociables)

1. Les formules et règles de notation existantes : pondération / correction des modèles de vent, systèmes A-B-C-D et champion ; déferlement, facteurs et ensemble du surf ; note downwind. Toute modification = décision explicite + test de non-régression.
2. La boucle « prévoir → mesurer → corriger » de chaque moteur (bancs, calibration aux bouées, recalage sur le dernier relevé).
3. La traçabilité : modèle, échéance, date de calcul, unités, observé vs prévu.
4. Session 2H (plages de dispo, durée, soleil).
5. Les widgets (PC, Mac, iPhone) tant qu'OCEAN ne les remplace pas avec au moins les mêmes informations.
6. La confidentialité des relevés Winds-Up.

## 4. Composants mutualisables

| Élément | Où il existe | Mutualisation |
|---|---|---|
| Lecture Open-Meteo vent / vagues, fusion des modèles, interpolation temporelle, soleil, angles | `surf-engine.js` (copié dans downwind) | Paquet commun `weather-core` (une seule copie) |
| Calibration contre une mesure (erreur, biais, poids) | Surf (bouées), vent (balises, Apps Script) | Même principe, deux implémentations ; à unifier en un module `verification` |
| Recalage sur le dernier relevé (nowcast) | Surf, downwind, vent (système D) | Fonction commune paramétrée (demi-vie, bornes) |
| Recherche de créneaux | Surf (`findWindows`), downwind (`windows`), Session 2H, vent (sessions 2 h du banc) | Un moteur de créneaux générique + une note propre à chaque discipline |
| Orientation de côte (de terre / de mer / side) | Surf (`windQuality`), downwind (`shoreKind`) | Fonction commune, seuils propres à chaque discipline |
| Registre de spots | 3 fichiers différents (SPOTS Apps Script, `spots.json`, `runs.json`) | Un seul Spot Registry |
| Carte, couleurs de vent, frises horaires | Downwind, surf | Bibliothèque Weather UI |

## 5. Moteurs qui doivent rester indépendants

- **VENT** : prévision corrigée par spot à partir des balises. Reste séparé (sources privées, rythme 5 min, compte Google).
- **VAGUE** : physique du déferlement et notes surf.
- **HOULE** : notes downwind par parcours.
- **WING / KITE par spot** : n'existe pas encore. À concevoir, avec une formule à valider avant tout code (règle OCEAN « pas de score sans formule validée »).

## 6. Dépendances et zones d'incertitude

- **Externes** : Open-Meteo (gratuit, 429 possibles), Copernicus (compte), Candhis (clé, 150 requêtes / jour partagées), Météo-France (clé), METAR, Winds-Up (abonnement + identifiants), OpenStreetMap (tuiles), GitHub Actions / Pages (gratuit, retards), Google Apps Script (quotas).
- **Incertitudes** :
  - Validité terrain des notes surf, downwind et wing : aucune session réelle encore comparée. [non vérifiable ici]
  - Conditions d'utilisation de Winds-Up pour un usage automatisé. [non vérifiable ici]
  - Comparabilité des notes entre disciplines (un 7 surf = un 7 wing ?). [à décider]
  - Version réellement en service dans Apps Script vs fichier local. [non vérifiable ici]
  - Charge et coûts si l'app devient publique et fréquentée : Pages tient la charge pour du statique ; les API ne sont appelées que par les tâches planifiées, pas par les visiteurs. [déclaré par les docs GitHub / Open-Meteo]

## 7. Risques de migration

1. Casser un calcul en le portant (JS → TypeScript, Apps Script → Node) : parade = tests « golden » (mêmes entrées figées, mêmes sorties) avant et après chaque portage.
2. Publier par erreur des clés ou des relevés privés en rapatriant le code vent : parade = secrets GitHub, revue du contenu publié, test automatique « aucune donnée Winds-Up dans les fichiers publics ».
3. Multiplier les appels aux mêmes sources (3 moteurs × Open-Meteo, 2 × Candhis) : parade = collecte mutualisée.
4. Perdre le contexte utilisateur entre modules : parade = contexte partagé dans l'app shell.
5. Dépendance au compte Google Band Originale.
