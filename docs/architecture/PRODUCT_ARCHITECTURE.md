# PRODUCT_ARCHITECTURE — Phase 0 / 1

*OCEAN · architecture cible · 10/11/2026 · v0.2 — décisions §8 validées par Tom le 10/11 ; M1 (collecte) en service, voir docs/migration/M1-collecte.md*

## 1. Cadre validé par Tom (10/11/2026)

- App **publique, pour tout le monde**, + **mode perso** réservé à Tom (relevés Winds-Up, réglages perso).
- Zone : **de Perpignan à l'Almanarre** (Hyères) pour le vent ; spots surf et parcours downwind actuels.
- Travail **par module**, dans l'ordre : récupération des données → analyse → remise en question (les modèles s'affinent grâce aux relevés en temps réel) → vulgarisation du résultat → interface client.
- Direction UI : **OCEAN Studio + Forecast Lab** (sobre, précis, dense quand il faut).

## 2. Principe : une chaîne en 5 modules, une seule source de vérité par étape

```
 ① COLLECTE          ② ANALYSE            ③ REMISE EN QUESTION       ④ VULGARISATION        ⑤ INTERFACE
 sources brutes  →   moteurs métier   →   vérification & affinage →  créneaux, notes,   →   app OCEAN (PWA)
 (normalisées,       VENT · VAGUE ·       (bancs, calibration,        explications,          + widgets
  horodatées,        HOULE · WING         recalage temps réel)        vigilance              + mode perso
  provenance)
       ↑______________________________ relevés (balises, bouées) ______________________________|
```

Chaque module lit les sorties du précédent via un **contrat de données typé** et publie les siennes. Aucun module ne réécrit les données d'un autre.

### ① Collecte (Weather Data Layer)

- Un collecteur par source : Open-Meteo vent (multi-modèles), Open-Meteo Marine, Copernicus, Candhis, Météo-France, METAR, Winds-Up (privé).
- **Mutualisée** : une seule requête par source et par heure pour tous les moteurs (aujourd'hui 3 moteurs interrogent Open-Meteo séparément).
- Sortie : séries normalisées `ForecastSeries` et `Observation` (unités SI + nœuds en affichage, UTC, provenance : source, modèle, date d'émission, échéance).
- Validation à l'entrée : valeurs manquantes, aberrantes (ex. Candhis 999.9999), unités, fuseaux.

### ② Analyse (Domain Engines)

Moteurs indépendants, chacun avec ses règles et ses tests :

| Moteur | Base existante | Sortie |
|---|---|---|
| VENT | super prévision (Apps Script) : pondération, facteurs par secteur, A-B-C-D, champion | vent corrigé par spot, par heure, avec confiance |
| VAGUE | `surf-engine.js` | hauteur au déferlement, note surf, bascule |
| HOULE | `downwind-engine.js` | note downwind par parcours et par sens |
| WING | **nouveau** — formule validée v1.0 (§8, D-14, D-16) | note par spot selon vent corrigé, orientation, rafales, niveau |

### ③ Remise en question (Verification & Learning)

C'est ce qui distingue OCEAN : **les prévisions s'affinent avec les relevés en temps réel**, et on le prouve.

- **Calibration** : erreur et biais de chaque modèle à chaque balise / bouée (vent : 21 jours, par secteur ; vagues : 3 jours — fenêtre validée par backtest).
- **Recalage temps réel** : dernier relevé → correction des premières heures, qui s'efface (demi-vie paramétrée).
- **Bancs d'essai** : archive des prévisions, comparaison « prévu la veille / mesuré », choix du meilleur système par spot.
- **Sessions vérifiées** (plus tard) : retour de Tom après une session → recalage des notes.
- Sortie publique : indicateurs de fiabilité (erreur moyenne par spot et échéance) ; les relevés privés n'en sortent jamais.

### ④ Vulgarisation (Session & Explanation)

- Moteur de **créneaux générique** (durée, plages de dispo, lever / coucher, sens) + **note propre à chaque discipline** (pas de formule universelle).
- Pour chaque créneau : note 0-10 par niveau, confiance, **pourquoi** en une phrase (« SE 16 nd régulier, side-shore, houle 1,5 m à 5 s »), **vigilance** (vent de terre, rafales, mer croisée, données incertaines).
- Résumé du jour : meilleure option + plan B.

### ⑤ Interface (App Shell + Design System + Weather UI)

- Navigation : Accueil · Explorer / Spots · Prévisions · Sessions · Profil (proposition OCEAN, à confirmer en Phase 2). Downwind accessible comme discipline **et** comme outil de parcours.
- Contexte partagé : spot / parcours, date, heure, discipline, niveau, unités.
- 3 niveaux de lecture : synthèse → analyse → expert (modèles, bancs).
- Mode perso : déverrouillé par une clé stockée sur l'appareil ; affiche les relevés Winds-Up lus directement auprès du moteur VENT (jamais via les fichiers publics).

## 3. Contrats de données principaux (TypeScript, provisoires)

```ts
type Discipline = 'wing' | 'kite' | 'surf' | 'downwind';
type Level = 'debutant' | 'intermediaire' | 'confirme';

interface Provenance { source: string; model?: string; issuedAt: string; fetchedAt: string; units: Record<string, string>; }

interface Spot {                       // Spot Registry : identifiant stable, jamais le nom
  id: string; name: string; kind: 'spot' | 'run';
  geometry: { lat: number; lon: number } | { path: [number, number][] };
  disciplines: Discipline[];
  orientation?: { seaward: number };   // direction du large (°)
  swellWindow?: [number, number]; buoys?: string[]; windStations?: string[];
  safety?: string[]; sources: string[]; confidence: 'low' | 'medium' | 'high';
}

interface ForecastPoint { t: string; value: number; lo?: number; hi?: number; }
interface ForecastSeries { spotId: string; variable: 'wind' | 'gust' | 'windDir' | 'hs' | 'tp' | 'swellDir' | 'hb'; points: ForecastPoint[]; provenance: Provenance; kind: 'forecast' | 'corrected' | 'observed'; }

interface Verification { spotId: string; model: string; leadHours: [number, number]; n: number; mae: number; bias: number; window: string; }

interface SessionWindow {              // le « créneau »
  spotId: string; discipline: Discipline; start: string; end: string; direction?: 'ab' | 'ba';
  score: Record<Level, number>; confidence: number;
  why: string; warnings: string[]; engineVersion: string;
}
```

## 4. Choix techniques (justifiés, à valider en §8)

| Sujet | Existant | Proposition | Pourquoi |
|---|---|---|---|
| Langage | JS sans types, Python, Apps Script | **TypeScript strict** pour le nouveau code ; les moteurs existants sont d'abord **enveloppés** (pas réécrits), puis portés un par un avec tests golden | Sécurise les contrats ; aucun calcul réécrit sans preuve d'équivalence |
| Interface | Pages statiques en JS pur | **Vite + Preact** (≈ 4 Ko) ou Svelte, site statique | Composants réutilisables et états sans le poids de React / Next ; pas de serveur |
| Graphiques | Canvas maison, Leaflet | **uPlot** (séries temporelles, ≈ 45 Ko) + **Leaflet** (carte) | Rapides sur mobile, précis, sans dépendance lourde |
| Typo / icônes | — | Inter (chiffres tabulaires) ; Lucide + SVG métier (flèche de vent, houle, rose) | Conforme à la direction OCEAN |
| Calculs | Actions (surf, downwind), Apps Script (vent) | **GitHub Actions** horaire pour ①②③④ public ; Apps Script conservé pour le vent tant que le portage n'est pas prouvé, puis seulement pour Winds-Up | Gratuit, versionné, testé ; Winds-Up reste hors du dépôt public |
| Hébergement | GitHub Pages | **GitHub Pages** (statique) | Gratuit, rapide ; les visiteurs ne déclenchent aucun appel d'API |
| Données publiées | `forecast.json`, `downwind.json` | `data/v1/*.json` versionnés par contrat (spots, séries, créneaux, fiabilité) | Une seule forme pour l'app et les widgets |
| Mode perso | — | Clé sur l'appareil → appel direct au moteur VENT (Apps Script) pour le direct Winds-Up | Rien de privé dans le dépôt ni sur Pages |

## 5. Où l'on travaille : Claude Code et GitHub, les deux

- **GitHub** = la maison du projet : le code, l'historique de chaque changement, les tâches automatiques horaires (Actions) et l'hébergement de l'app (Pages). Tout ce qui tourne tout seul y vit.
- **Claude Code** (cette session) = l'atelier : j'y lis, j'écris, je teste et je vérifie sur des données réelles avant de pousser sur GitHub.
- **Apps Script** reste temporairement pour le moteur VENT et définitivement pour la connexion Winds-Up (identifiants privés).
- Tom n'a rien à coder : il valide les décisions, renseigne les secrets (clés) et teste l'app.

## 6. Stratégie de migration progressive

Les apps actuelles restent en ligne jusqu'à ce que leur remplaçante soit vérifiée.

| Étape | Contenu | Vérification avant de passer à la suite |
|---|---|---|
| M0 | Dépôt `ocean`, docs Phase 0-1, Spot Registry unique (vent + surf + downwind) | Validation des décisions §8 |
| M1 — Collecte | Collecteurs mutualisés + contrat `ForecastSeries` / `Observation` ; l'app actuelle lit encore ses propres données | Mêmes valeurs que les collecteurs actuels sur 48 h (diff automatique) |
| M2 — Analyse | Moteurs VAGUE et HOULE branchés sur la collecte commune ; VENT lu depuis Apps Script (vent corrigé, sans relevés) | Tests golden : notes identiques à ±0,1 sur des entrées figées |
| M3 — Remise en question | Module de vérification commun, page Fiabilité ; bancs vent + vagues + downwind | Chiffres identiques aux bancs existants |
| M4 — Vulgarisation | Moteur de créneaux générique + notes par discipline ; formule WING validée et testée | Créneaux identiques à Session 2H / downwind sur les mêmes données |
| M5 — Interface | Design system, écran Prévisions (pilote), puis Accueil, Spots, Sessions ; mobile + desktop | Audit UX / accessibilité (Phase 5), captures de contrôle |
| M6 — Bascule | Widgets sur les données OCEAN ; anciennes pages redirigées | 2 semaines en parallèle sans écart non expliqué |

## 7. Risques

| Risque | Gravité | Parade |
|---|---|---|
| Altérer un calcul pendant le portage | Haute | Tests golden, diff ancien / nouveau, pas de bascule sans équivalence |
| Fuite de clés ou de relevés Winds-Up (app publique) | Haute | Secrets GitHub, Apps Script sans clé dans le code, test « aucun relevé privé publié » |
| Notes surf / downwind / wing non validées sur le terrain | Moyenne | Afficher la confiance ; retours de session ; formules documentées et versionnées |
| Quotas (Open-Meteo, Candhis, Apps Script) | Moyenne | Collecte mutualisée, cache, budget Candhis |
| Retards des tâches GitHub | Faible | Horodatage visible (« prévision d'il y a 23 min »), état « données anciennes » |
| Compte Google Band Originale | Moyenne | Migrer Apps Script et Sheet vers le compte perso (D-12) |
| Ampleur du projet | Moyenne | Livraison par modules, chaque étape utile seule |

## 8. Décisions structurantes à valider

| ID | Décision proposée | Statut |
|---|---|---|
| D-08 | App publique + mode perso par clé sur l'appareil | **Validée (10/11)** |
| D-10 | Nouveau dépôt `tomaware/ocean` (public) ; les dépôts actuels restent en service jusqu'à la bascule | **Validée (10/11)** |
| D-11 | Chaîne en 5 modules avec contrats typés (§2-3) | **Validée (10/11)** |
| D-12 | Moteur VENT : rester sur Apps Script en M2, porter le calcul dans `ocean` en M3+ après preuve d'équivalence ; Winds-Up reste sur Apps Script. Migrer Apps Script vers le compte Google perso | **Validée (10/11)** |
| D-13 | Stack : TypeScript strict + Vite + Preact + uPlot + Leaflet, statique sur GitHub Pages | **Validée (10/11)** |
| D-14 | Note WING / KITE : formule rédigée et validée par Tom avant le code ; spots = les 6 de la super prévision (La Franqui → Almanarre) | **Validée (10/11)** |
| D-16 | **Wing seul**, pas de kite (plages de vent différentes) ; plages de vent recalées sur des guides wing ; formule v1.0 (`docs/product/WING_SCORE.md`) | **Validée (10/11)** |
| D-19 | Wing v2.0 : modes **Sécu first / Offshore** à la place des 3 niveaux ; note seule, « Ça envoie » = ≥ 4 h à plus de 20 nd ; Sessions de 2H limitées à 55 km de Montpellier ; menu des modules à gauche sous OCEAN ; « Retour » ramène à l'écran précédent | **Validée par Tom (10/11)** |
| D-18 | Note wing v1.1 : « trop de vent » seulement au-delà de 35 nd (tous niveaux) ; « Limite » renommé « Commentaire » ; navigation : modules à droite (Meilleure session, Sessions 2H, Prévision, Spots) | **Validée par Tom (10/11)** |
| D-17 | **Session 2H** commune aux 3 disciplines : au moins 2 h d'affilée à 5/10 ou plus, de jour, calculée sur les notes horaires des moteurs (règle d'affichage, aucune note modifiée) | **Appliquée (10/11)** — à valider |
| D-15 | Notes comparables entre disciplines : même échelle 0-10 mais **pas de classement croisé** tant que les retours terrain ne l'ont pas calibré (l'accueil affiche la meilleure option par discipline) | **Validée (10/11)** |

### D-20 (10/11/2026, Tom) — direction graphique et explication de la note
- Direction retenue : style de la référence de Tom (note horaire en barres, cartes, boussole, détail de la note en jauges), clair + sombre, navigation et mots de l'app actuelle, nœuds. Détails : docs/design/CREATIVE_DIRECTION.md §0.
- Le moteur wing publie les facteurs V, R, D de chaque heure (affichage seul, note inchangée, test + recalcul sur données réelles : 0 écart). Surf et downwind : pas de facteurs publiés pour l'instant, l'app montre les conditions de l'heure.

### D-21 (10/11/2026, Tom) — houle sur la carte, HOULE
- Repère de la carte : flèche de la houle en plus du vent (« mets la houle aussi »). Pour les parcours downwind, OCEAN publie `swellDir` (direction d'où vient la mer au large, moyenne circulaire pondérée par Hs² des modèles lus par le moteur, mêmes points). Affichage seul : le moteur downwind et ses notes ne changent pas (golden inchangé). WIND : pas de données de houle collectées aux spots wing pour l'instant.

### D-22 (10/11/2026, Tom) — spots, sessions VAGUE, code couleur
- VAGUE : Gruissan, Canet, Paulilles et Perafita retirés ; **Saintes-Maries-de-la-Mer** et **La Couronne** ajoutés (réglages tirés de guides de spots, confiance faible, à confirmer ; recalage sur la bouée d'Espiguette, à ~25 km et ~75 km). Les spots surf sont désormais lus dans le registre ; pour les spots communs, réglages identiques à l'app surf en service (test). Formule du moteur surf inchangée, golden inchangé.
- VAGUE, Sessions de 2H : demain seulement, Carnon / Palavas / Sète.
- VAGUE, tableau heure par heure : lignes Vent (nd) et Direction rétablies entre Air et Vagues.
- WIND : **étang de Berre (Le Jaï)** ajouté. La super prévision ne le couvre pas : vent = modèle le plus juste aux mesures METAR de Marignane (LFML, ajoutée aux stations) sur les 3 derniers jours, non corrigé, provenance affichée (« forecast ») ; jamais mélangé avec la super prévision. Formule wing inchangée. Secteur SE à S (vent qui pousse vers le large de l'étang) déconseillé, comme le nord au Ponant. Orientation à confirmer.
- Code couleur des étoiles : 1 ★ vert, 2 ★ orange, 3 ★ violet (« légendaire ») ; les barres horaires et les cases de la Prévision 5 jours suivent le même code (gris = pas d'étoile).

