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
- WIND : **Le Jaï** (étang de Berre, balise Winds-Up 26-le-jai) ajouté ; dès que la super prévision le couvre (ligne à ajouter par Tom dans son script), son vent corrigé remplace le repli ci-dessous. La super prévision ne le couvre pas : vent = modèle le plus juste aux mesures METAR de Marignane (LFML, ajoutée aux stations) sur les 3 derniers jours, non corrigé, provenance affichée (« forecast ») ; jamais mélangé avec la super prévision. Formule wing inchangée. Secteur SE à S (vent qui pousse vers le large de l'étang) déconseillé, comme le nord au Ponant. Orientation à confirmer.
- Code couleur des étoiles : 1 ★ vert, 2 ★ orange, 3 ★ violet (« légendaire ») ; les barres horaires et les cases de la Prévision 5 jours suivent le même code (gris = pas d'étoile).

### D-23 (11/11/2026, Tom) — affichage
- Bouton clair / sombre dans la barre du haut. « En direct » devient un module du menu de gauche (WIND). Fiabilité : mode perso seulement. Synthèse / Détail / Expert placé à côté de « Jour par jour » ; pas d'Expert pour VAGUE et HOULE ; formule retirée de l'affichage (fiche et Expert).
- Note du jour : commentaire au survol seulement. Carte : vent en légère couleur (échelle façon Windy) et traits dans le sens du vent, légende 0–60 nd.
- Prévision 5 jours : chaque case se remplit selon les heures de jour à 1 ★ (vert), 2 ★ (orange), 3 ★ (violet) ; le chiffre = heures au meilleur niveau. « Fiche complète » ouvre le jour cliqué.
- HOULE : Tom garde les niveaux Débutant / Intermédiaire / Confirmé (11/11) ; pas de modes Sécu first / OffShore ni de règle des 35 nd. Note downwind inchangée.

### D-24 (11/11/2026, Tom) — carte façon Windy, Sessions 2H
- Carte de la fiche spot : champ de vent coloré (échelle Windy) et particules dans le sens du vent, à l'heure affichée (survol compris). Données : grille Open-Meteo 16 × 8 points (0,25°) de Leucate à Hyères, modèle Météo-France brut (AROME puis ARPEGE), interpolée ; affichage seul, la pastille du spot et la note gardent le vent corrigé. Pas d'API Windy / Windguru utilisable ici.
- Sessions 2H retirées de la fiche spot, et du menu HOULE (2 h ne font pas un downwind).

### D-25 (11/11/2026, Tom) — widgets WIND
- Deux widgets iPhone (Scriptable), toutes les tailles laissées au choix : « OCEAN Vent » (un spot, La Grande-Motte par défaut, changeable dans l'app Scriptable ou par Parameter) et « OCEAN Créneaux » (remplace « Créneau Vent »). Données : `widget-wind.json` (vent corrigé, notes, créneaux, heures par étoiles), publié chaque heure ; balise en direct via le lien de la super prévision gardé dans le trousseau de l'iPhone. Mac et PC ensuite ; VAGUE ensuite.
- Classement des créneaux du widget : étoiles, puis durée, puis note max.


### D-26 (11/11/2026, Tom) — onglets « Avis » et « Widgets »
- **Avis** (`#/avis`) : type (Avis, Idée, Bug, Prévision ratée), message, prénom et e-mail facultatifs, champ piège anti-robot. Joint : l'écran d'où l'on vient, le type d'appareil (sans identifiant) et l'heure des données. Envoi vers un script Google de Tom (`retours/ocean-retours.gs`, application Web « exécuter en tant que moi ») qui transfère sur la boîte du compte qui le déploie : l'adresse de Tom n'est jamais dans le site ni dans le dépôt. Plafond 40 messages par jour. Tant que l'adresse /exec n'est pas renseignée (`src/services/feedback.ts`), le formulaire le dit et n'envoie rien.
- **Widgets** (`#/widgets`) : tutoriel iPhone (Scriptable, scripts publiés avec le site dans `widgets/` pour les copier ou télécharger, réglages Parameter), Mac (widgets de l'iPhone sur le bureau, macOS 14 + iOS 17 ; OCEAN dans le Dock via Safari), Windows (OCEAN installé comme application via Edge ou Chrome). Widgets autonomes Mac et Windows : en préparation, annoncés comme tels.
- Accès : menu de gauche sur ordinateur ; sur téléphone, bouton menu en haut à droite (Profil, Widgets, Avis), en bas de chaque écran et dans Profil.

### D-27 (11/11/2026, Tom) — widget Windows
- `widgets/windows/` : PowerShell 5.1 + WPF (inclus dans Windows 10/11), installé comme l'ancien widget Winds-Up (`installer.cmd`, lancement au démarrage, `desinstaller.cmd`), dans `%LOCALAPPDATA%\OCEAN`. Publié avec le site en `.zip` (onglet Widgets → Windows).
- Deux cartes, chacune petit / moyen / grand / masquée : **Vent** (spot choisi, maintenant, dans 2 h, 4 jours) et **Créneaux** (meilleurs créneaux ; en grand, grille spots × 5 jours). Mêmes données (`widget-wind.json`), mêmes règles et même ordre que les widgets iPhone : vérifié par le même jeu d'essai (`tests/widgets-windows.test.ts`) et sur les données réelles.
- Réglages au clic droit (spot, mode, tailles, spots des créneaux, disposition, thème, écran), position par glisser. Clic : fiche du spot dans OCEAN (au bon jour pour un créneau).
- Vent mesuré : balise Winds-Up via la super prévision (mode perso, lien chiffré DPAPI pour le compte Windows, ou repris de l'ancien widget) ; sinon mesure publique publiée par OCEAN (Le Jaï) ; sinon « prévu ». Aucune lecture directe de Winds-Up.
- Vérifié sur un vrai Windows (GitHub Actions `windows-latest`, Windows PowerShell 5.1, fuseau de Paris) : tests, images de chaque carte (branche `captures`), installation / lancement / désinstallation. L'ancien widget Winds-Up (avec l'agenda) reste en service.

### D-28 (11/11/2026, Tom) — affichage 7 h → 21 h partout
- « Personne n'ira naviguer la nuit » : graphique de la note (15 barres au lieu de 24), tableaux heure par heure (WIND, VAGUE, HOULE) et bandes horaires des widgets iPhone et Windows affichent 7 h → 21 h. Affichage seul : notes, créneaux et heures de jour inchangés.

### D-29 (11/11/2026) — contrôle de confidentialité : relevé à la même minute qu'un METAR
- Le contrôle bloquant de publication signalait « horodatage du relevé » pour La Grande-Motte et Beauduc : leurs relevés Winds-Up tombaient à la même minute (hh:30) qu'un METAR de Marignane, publié pour Le Jaï (`obs`, NOAA, public). L'instant publié est celui du METAR, il ne révèle rien du relevé.
- Règle : un horodatage de relevé présent dans les fichiers publics n'est ignoré que s'il est identique à l'heure d'un METAR collecté ; le journal l'indique (« n relevé(s) à la même minute qu'un METAR publié, ignoré(s) »). Toute autre minute reste bloquante (tests).

### D-30 (11/11/2026, Tom) — widget Windows, carte Vent en grand : aujourd'hui et demain en détail
- « Ne me fais pas tous les jours, juste le jour même et le lendemain, avec plus de détail » : la grande carte Vent remplace « prochaines heures » + 4 jours par deux blocs (aujourd'hui, demain ; après 21 h : demain, après-demain), heure par heure de 7 h à 21 h : vent (échelle de couleurs), rafales, direction, étoiles ; en tête vent max, rafale max et étoiles des heures à venir, puis le créneau. Heures passées estompées. Petit et moyen formats inchangés (4 jours).

### D-31 (11/11/2026, Tom) — widget Windows, carte Créneaux en grand : disposition de l'ancien widget
- Meilleur créneau en haut, en grand (jour et heures, spot, étoiles, vent et rafales, durée), puis la grille avec les spots en colonnes et les jours en lignes. Cases avec créneau : remplissage par étoiles et heures au meilleur niveau ; cases sans créneau : vent max du jour (heures de jour), comme l'ancien widget.

### D-32 (11/11/2026, Tom) — étoiles plus visibles, note surf expliquée
- Tableaux heure par heure : les colonnes notées prennent une teinte de la couleur des étoiles (vert ★, orange ★★, violet ★★★) au lieu du gris clair ; ligne Étoiles plus grande et plus colorée.
- VAGUE : au survol d'une heure, la note est expliquée en mots (« bonne taille de vague, vent de terre : vent et houle opposés… mais … ») avec les facteurs taille, période, vent / houle sur 10. Le pipeline publie les facteurs que le moteur surf calcule déjà (`h.f` = taille, période, vent, clapot, sens de l'écart de taille) ; moteur et note inchangés (golden).

### D-33 (11/11/2026, Tom) — orientations confirmées
- Tom confirme les orientations de Saintes-Maries-de-la-Mer, La Couronne, Le Jaï, Beauduc et l'Almanarre : `orientation.confidence` passe à `high` (registre). Les notes ne changent pas (la confiance d'orientation n'entre dans aucun calcul) ; l'app n'affiche plus « orientation à confirmer » pour ces spots. Taille et niveau des deux spots surf restent ceux des guides de spots.

### D-34 (11/11/2026, Tom) — widget VAGUE
- Données : `widget-surf.json` (≈ 45 Ko) : pour chaque spot surf, heures sur 5 jours [heure, vagues au bord, mini, maxi, période, houle de, vent nd, vent de, type de vent, jour, note], créneaux surf de l'app (mêmes que `sessions.json`) et comptes d'heures par étoiles. Rien n'est recalculé.
- iPhone : script Scriptable « OCEAN Vague » (Carnon par défaut, Parameter ou ▶︎ → Choisir le spot) : petit (vagues maintenant, période, houle, vent), moyen (+ 4 jours), grand (aujourd'hui et demain heure par heure 7 h → 21 h + meilleur créneau surf tous spots), écran verrouillé.
- Windows : carte « Vague » (petit / moyen / grand), masquée par défaut, à afficher au clic droit ; spot au clic droit.
- Vérifié : banc d'essai Scriptable et PowerShell sur un jeu d'essai commun et sur les données réelles ; rendu Windows en CI.

### D-35 (11/11/2026, Tom) — widget Mac autonome
- `widgets/mac/ocean.jsx` pour Übersicht (comme les widgets Mac actuels de Tom) : cartes Vent, Créneaux (meilleur créneau en haut, spots en colonnes) et Vague, chacune petit / moyen / grand / masquée ; clair / sombre suivant macOS ; clic = fiche du spot dans OCEAN. Réglages : bloc « TES RÉGLAGES » du fichier (bouton ⚙), gardés à la réinstallation.
- `installer.command` : installe Übersicht si besoin (site officiel, signature Apple vérifiée), copie le widget, lancement au démarrage ; mode perso : lien de la super prévision rangé dans le trousseau du Mac (`ocean.superprevision`), jamais dans le fichier. Publié en `.zip` (droits d'exécution gardés) dans l'onglet Widgets → Mac.
- Vérifié hors Mac : le widget est compilé et rendu (tests `widget-mac.test.ts`, mêmes jeux d'essai que iPhone et Windows), installateur testé sous zsh avec des commandes macOS simulées. Pas encore vu sur un vrai Mac.

### D-36 (11/11/2026, Tom) — widgets : source du vent explicite, sans légende
- « Pourquoi prévu ? » : l'étiquette en haut des cartes Vent dit d'où vient le chiffre en grand : « ● Winds-Up abonné · 6 min » (relevé de l'abonnement, via la super prévision), « ● Winds-Up public · … » (connexion Winds-Up en échec : pages publiques, 2 h de retard), « ● Marignane · … » (Le Jaï), « prévision corrigée » (pas de balise : vent prévu pour l'heure, corrigé par la super prévision), « prévision · balise il y a 2 h 10 » (balise de plus de 1 h 30). Formats étroits : « ● abonné · 6 min », « prévision ».
- Légendes en petit retirées des cartes (iPhone, Windows, Mac) ; grande carte un peu moins haute (330 au lieu de 382) sur Windows et Mac.

### D-37 (11/11/2026) — widget Windows : corrections après essai chez Tom
- Lien de la super prévision illisible (« format de la chaîne d'entrée incorrect », journal du widget) : le fichier chiffré était relu avec son retour à la ligne final. Corrigé (Trim) ; la CI Windows enregistre puis relit un lien d'essai (`-TestLien`). Le lien déjà enregistré par Tom redevient lisible sans le recoller.
- Menu Écran avec un seul écran : la liste était aplatie par PowerShell (choix « É ») ; corrigé, et un réglage abîmé retombe sur l'écran principal.
- La nuit, sans prévision pour l'heure, la carte Vent montre le dernier relevé de la balise avec son âge (en gris) au lieu de « pas de vent ». Même règle sur iPhone et Mac.

### D-38 (11/11/2026, Tom) — widgets, retouches après essai
- Grandes cartes Vent et Vague : plus de ligne « Créneau : … » sous les heures ; titre au nom court du spot (« Port Camargue », « Almanarre ») ; source alignée sur la même ligne.
- Chiffre du vent mesuré en direct : vert dès 15 nd, orange dès 20, violet dès 25 (couleurs des étoiles) ; prévision et relevé ancien gardent la couleur normale.
- Grande carte Créneaux : sans titre « Créneaux vent » ni « Sécu first » ; la nuit, la ligne du jour (vide) disparaît.
- Écarts avec l'ancien widget Créneaux (seuil « 15 nd et + » de la super prévision) : acceptés par Tom ; OCEAN suit la note wing (Sécu first écarte le vent de terre).
- Windows, Mac, iPhone (Vent et Vague).

### D-39 (12/11/2026, Tom) — lisibilité des grandes cartes (iPhone, Mac, Windows)
- Sur l'iPhone de Tom, la grille horaire débordait du widget (15 colonnes × 20 pt pour 264 à 336 pt disponibles) : iOS écrasait les colonnes et coupait tous les nombres à un chiffre. Corrigé : heures passées retirées, largeur de colonne calculée d'après leur nombre, espaces souples entre colonnes (la grille remplit le widget sans jamais déborder), et `minimumScaleFactor` sur chaque texte de la grille (un texte rétrécit au lieu d'être coupé).
- Carte Vague en grand : elle dépassait aussi en hauteur (le bloc « meilleur créneau » était coupé). Période et vent passent dans l'en-tête du jour, barre de vague plus basse, flèche par heure seulement quand les colonnes sont assez larges.
- Vérifié en rejouant la géométrie exacte aux vraies tailles d'un grand widget (364×382, 338×354, 329×345, 292×311) : plus rien n'est coupé à partir de 338×354 ; sur un iPhone mini (292×311) la carte Vague reste serrée.
- Mêmes règles sur le widget Mac et le widget Windows (cartes de 364 pt).

### D-40 (12/11/2026) — publication horaire réparée
- Depuis le 11/11 à 23 h 40, toutes les publications automatiques échouaient au contrôle des types : les modules `.mjs` des widgets Agenda (ajoutés dans la journée) et des bancs d'essai n'avaient pas de déclarations. L'app et les widgets sont restés sur les données de la veille pendant environ 19 h. Corrigé par des déclarations `.d.mts` permissives pour ces modules ; les tests et la logique ne changent pas.

### D-41 (12/11/2026) — grand widget Créneaux iPhone : disposition du widget Windows, et largeur tirée de l'écran
- Validé par Tom : le grand widget « OCEAN Créneaux » de l'iPhone reprend la disposition du widget Windows (elle-même reprise de l'ancien widget) — meilleur créneau en haut dans un bloc teinté (jour en toutes lettres, heures, spot, étoiles, vent, pastille de durée), puis **spots en colonnes et jours en lignes**. L'ancienne disposition (spots en lignes) est abandonnée.
- Mêmes règles que Windows : case remplie par la part d'heures à 3, 2 et 1 étoiles ; heures au meilleur niveau posées dessus ; case sans créneau = vent max du jour ; la nuit, la ligne du jour (vide) disparaît ; lien vers la fiche du spot au bon jour.
- Les trois widgets iPhone estiment désormais la largeur utile du grand widget à partir de `Device.screenSize()` (`usable()`), au lieu de la constante du plus petit iPhone. Le facteur (0,82 en largeur, 0,86 en hauteur, bornes 264–336 et 283–354 pt) est volontairement sous les vraies dimensions de tous les iPhone connus : une grille un peu étroite reste lisible, une grille plus large que le widget est écrasée par iOS (c'était la cause des chiffres coupés, D-39). Écran illisible → repli sur le plus petit format.
- La hauteur des lignes de la grille Créneaux suit la place disponible (25 à 34 pt) : plus de blanc perdu en bas sur les grands iPhone.
- Vérifié : banc d'essai Scriptable (meilleur créneau, lignes = jours, colonnes = spots, ligne du jour retirée la nuit), test de garde sur `usable()` / `usableH()` pour neuf tailles d'écran du SE 1 au 16 Pro Max, et géométrie rejouée aux vraies tailles de grand widget avec 3 et 8 spots. **Pas vérifié sur un iPhone réel.**

### D-42 (12/11/2026) — widgets iPhone : plus aucune dimension devinée, et grille horaire resserrée sur 9 h → 17 h
- **Annule la partie « largeur estimée » de D-41.** Estimer la taille du grand widget à partir de `Device.screenSize()` a fait déborder la carte des deux côtés sur l'iPhone de Tom (capture du 12/11) : `screenSize()` ne donne pas la largeur du widget. Les trois widgets repartent de `UTILE = 264` (largeur du plus petit grand widget) et détendent la grille avec des espaces souples : sur un grand iPhone elle remplit la carte, elle ne peut jamais la dépasser. Un test interdit désormais toute référence à `screenSize` / `screenResolution` dans les widgets.
- La hauteur des lignes de la grille Créneaux redevient fixe (25 pt), pour la même raison.
- **Densité de la grille heure par heure du grand format : 9 h → 17 h, heure par heure** (choix de Tom après comparaison des trois densités rendues à la vraie taille). 9 colonnes de 27 pt, chiffre de vent à 14 pt au lieu de 10. La bande 4 jours, les créneaux, les max du jour et les widgets Windows / Mac gardent 7 h → 21 h.
- Vérifié : 79 tests (dont la fenêtre 9 h → 17 h et l'absence d'estimation d'écran), contrôle des types, géométrie rejouée à 292 / 338 / 364 pt. **Pas vérifié sur un iPhone réel.**

### D-43 (12/11/2026) — widgets iPhone : un addSpacer() souple coûte 8 pt, et un contrôle de mise en page au banc d'essai
- **Cause des deux régressions successives.** Dans Scriptable (SwiftUI), un `addSpacer()` souple réclame au moins ~8 pt **avant** que le texte voisin n'ait sa place. Je ne les comptais nulle part : la grille du grand format demandait 317 pt là où le plus petit grand widget en offre 264, iOS écrasait les colonnes, et dans chaque case les deux espaces souples laissaient 8 pt à un nombre qui en demande 20 → affiché « … ». Les rendus HTML ne pouvaient pas le montrer : c'est une règle de Scriptable, pas de géométrie.
- **Corrigé partout** : écarts explicites (3 pt) entre les colonnes au lieu d'espaces souples, grille centrée dans la carte, et contenu des colonnes centré par `centerAlignContent()` sur une pile verticale — plus aucun espace souple en concurrence avec un texte. Les largeurs des cartes moyennes sont recalées sur le plus petit widget moyen (305 pt). La grille Créneaux garde ses espaces souples mais les budgète (8 pt par espace).
- **Nouveau contrôle `tests/widgets/layout.mjs`** : il parcourt l'arbre rendu par le banc, modélise la largeur des textes en SF Pro et la règle des 8 pt, et signale tout texte coupé ou tout bloc qui dépasse. Un test le fait tourner sur les trois widgets × trois tailles (+ le réglage « proches »), et un test unitaire vérifie qu'il attrape bien le piège d'origine. C'est ce qui manquait : le banc enregistrait ce qui est affiché, pas la place que ça prend.
- Carte Créneaux : étoiles collées au nom du spot (bloc du meilleur créneau centré, liste de droite resserrée), demandé par Tom.
- Vérifié : 81 tests, contrôle des types. **Pas vérifié sur un iPhone réel.**

### D-44 (12/11/2026) — widgets iPhone auto-actualisables, et fin des cases de largeur fixe
- **Fin de la boucle de recopie.** Chaque widget iPhone va chercher sa propre version publiée (`…/widgets/ocean-*.js`) et réécrit son fichier Scriptable ; la nouvelle version s'applique au rafraîchissement suivant. L'appel se fait **avant** le rendu, pour qu'une version cassée se répare toute seule. Garde-fous testés : la source doit faire plus de 4 000 caractères **et** se terminer par son marqueur `// OCEAN_WIDGET_<NOM>_FIN` — sinon rien n'est écrit (page d'erreur, téléchargement coupé, hors ligne). Décidé avec Tom le 12/11 après quatre copies manuelles pour rien.
- **Modèle de largeur recalé sur la réalité.** La capture de Tom prouve qu'un chiffre en gras lourd fait ~0,80 × la taille de la police, pas 0,65 : le contrôle de mise en page sous-estimait donc tout. Facteurs corrigés dans `tests/widgets/layout.mjs`, tolérance de 1,5 pt assumée.
- **Plus de case plus étroite que sa colonne.** Le nombre de vent occupe désormais toute la largeur de la colonne, calé à gauche avec 2 pt, et sa police est déduite de la largeur disponible (`(cw - 2) / 1,6`). Le centrage horizontal dans une pile n'est pas fiable sous Scriptable : on ne s'y fie plus. L'heure et la rafale passent en second plan (3 pt de moins que le vent), pour que le vent redevienne l'élément le plus lisible de la colonne.
- Vérifié : 82 tests, dont le contrôle de mise en page sur 3 widgets × 3 tailles et les garde-fous de la mise à jour automatique ; contrôle des types ; fichiers publiés terminés par leur marqueur. **Pas vérifié sur un iPhone réel.**

### D-45 (13/11/2026) — tailles de widget MESURÉES, cartes remplies en largeur et en hauteur, contrôle de hauteur
- **Mesure plutôt qu'estimation.** Le repère temporaire a donné l'écran que rapporte l'iPhone de Tom (402 × 874, iPhone 16 Pro) ; sa capture donne la taille réelle des cartes : grand 348 × 364 pt, moyen 348 × 164 pt. Ces valeurs sont dans une table `MESURES` indexée par l'écran exact, commune aux trois widgets. Écran absent de la table → plus petit iPhone (292 × 311) : la carte peut garder du vide, elle ne déborde jamais. L'écran mesuré s'affiche dans les réglages de chaque script, pour ajouter d'autres iPhone par la même méthode.
- **Correction de D-42.** J'y accusais `Device.screenSize()` d'avoir fait déborder la carte. C'était faux : il renvoie bien l'écran. La vraie cause était la règle des 8 pt par espace souple (D-43), que je ne connaissais pas encore. Le problème de D-41 n'était pas la lecture de l'écran mais la FORMULE qui en déduisait une largeur.
- **Carte Vent** : la grille prend toute la largeur (colonnes de 30 à 34 pt au lieu de 23, chiffre du vent 17–18 pt au lieu de 13), et quand la taille est mesurée les blocs se répartissent du haut en bas (espaces souples entre les blocs) au lieu de laisser du vide.
- **Carte Vague** : mêmes règles, et « maintenant » devient « prévi » (c'est une prévision). La carte a un budget de hauteur : si tout ne tient pas, elle renonce dans l'ordre à la barre de vague (qui répète le chiffre), réduit les polices d'un cran, retire le bloc « meilleur créneau surf », et en dernier recours le 2ᵉ jour. Avant ce changement, elle demandait 373 pt pour 364 : son bas était rogné.
- **Carte Créneaux (moyen)** : la colonne de droite est centrée sur la hauteur, comme le bloc du meilleur créneau.
- **Contrôle de hauteur** ajouté à `tests/widgets/layout.mjs` (ligne = 1,2 × police, espace souple = 8 pt). Calibré sur la capture du 13/11 : 267 pt prédits pour 263 mesurés (1,5 %). Le contrôle tourne désormais à deux tailles : iPhone inconnu et iPhone de Tom.
- Vérifié : 82 tests, contrôle des types. **Pas encore vu sur l'iPhone** — la version 2026-11-13a arrivera seule par la mise à jour automatique.

### D-46 (13/11/2026) — webcams des spots : collecte (étape 1, sans interface)
- Demande de Tom : ajouter les webcams des spots sur leur fiche détaillée. Collecte faite spot par spot, enregistrée dans `registry/webcams.json` avec, pour chaque webcam : éditeur, type (vidéo / images), position (filme le spot / commune voisine), niveau de vérification (page consultée / trouvée via annuaire) et source.
- **Couverture** : sur le spot — La Franqui (4 Viewsurf), Palavas (2 Viewsurf), La Grande-Motte (Roundshot 360°), Almanarre (images addicted-sports) ; à proximité — Port Camargue et Le Ponant (Viewsurf du Grau-du-Roi), Carnon (Palavas), Sète (port, SkylineWebcams), downwinds (Frontignan, Palavas, La Grande-Motte) ; **aucune trouvée** — Beauduc (Windfinder confirme « aucune webcam à proximité »), Le Jaï, La Guillotine (Vias), Saintes-Maries, La Couronne.
- **Droits** : l'essentiel de la côte est filmé par Viewsurf, dont les mentions légales interdisent toute diffusion des vidéos sans autorisation préalable. Roundshot (caméras des communes) et addicted-sports ne publient pas de licence d'intégration. Windy Webcams exige une clé d'API à chaque appel et ses liens d'images expirent en 10 min : inutilisable proprement sur une app statique sans exposer une clé. **Conséquence : dans l'app publique, on ne peut aujourd'hui que renvoyer vers la page de l'éditeur, pas intégrer la vidéo.** Décision d'intégration laissée à Tom (lien seul, demande d'autorisation, ou intégration réservée au mode perso).

### D-47 (13/11/2026) — webcams sur la fiche spot : un lien vers l'éditeur, pas de vidéo rediffusée
- Décision de Tom (13/11) après le constat de D-46 : la fiche spot affiche une carte « Webcams » juste sous le direct. Chaque webcam ouvre sa page chez l'éditeur dans un nouvel onglet (vidéo en direct ou images selon la caméra), avec l'éditeur nommé et la mention « à côté du spot » quand la caméra filme une commune voisine. Spot sans webcam connue : « Pas de webcam publique connue sur ce spot ».
- **Aucun flux n'est intégré ni copié** (pas d'iframe, pas de vidéo, pas d'image de webcam) : Viewsurf l'interdit sans autorisation préalable, et les autres éditeurs ne publient pas de licence. Un test bloque toute balise `<iframe>` ou `<video>` dans la fiche, et le test d'interface vérifie qu'aucun lecteur n'apparaît.
- Données : `registry/webcams.json`, importé dans l'app au moment de la construction (`src/services/webcams.ts`, `resolveJsonModule` activé dans `tsconfig.app.json`).
- Vérifié sur les données réellement publiées : test d'interface (20 écrans, mobile / ordinateur / sombre) dont La Franqui (4 webcams, toutes en nouvel onglet) et Beauduc (mention « pas de webcam »), 86 tests, contrôle des types. Les liens eux-mêmes n'ont pas pu être ouverts depuis l'environnement de travail (sites hors liste autorisée) : 3 pages consultées directement, les autres relevées sur l'annuaire de l'office de tourisme ou de Webcam Galore (champ `verif`).
- Pour aller plus loin : demander à Viewsurf l'autorisation d'intégrer le lecteur (décision et démarche à Tom).

### D-48 (13/11/2026) — widgets Mac : trois widgets indépendants, déplaçables et réglables dans le widget
- Demande de Tom : « fais 3 widgets comme sur l'iPhone, avec les mêmes options, choix des spots, déplacement ». L'ancien `ocean.jsx` (trois cartes dans un seul widget, réglé en éditant le fichier) est remplacé par `ocean-vent.jsx`, `ocean-creneaux.jsx` et `ocean-vague.jsx`.
- **Même méthode que le widget Agenda Mac, déjà en service chez Tom** : un cœur commun (`widgets/mac/src/core.jsx`) recopié dans chaque widget par `node widgets/mac/build.mjs` ; un test vérifie que les fichiers livrés sont à jour.
- **Déplacement** : glisser la carte ; la position est retenue (localStorage d'Übersicht). Un clic ouvre OCEAN ; le clic qui termine un glisser n'ouvre rien, et un tremblement de moins de 4 px n'est pas un déplacement (testé).
- **Réglages dans le widget** (⚙ au survol, coin en haut à droite), retenus d'un démarrage à l'autre : Vent — spot, mode, taille, thème, balise en direct (brancher / changer / retirer le lien, saisi dans une fenêtre du Mac et rangé directement dans le trousseau) ; Créneaux — mode, spots suivis (tous, proches, ou au choix spot par spot), taille, thème ; Vague — spot, taille, thème. Les réglages de départ du fichier sont écrits au premier lancement, pour qu'une mise à jour du fichier ne les efface pas.
- **Mise à jour automatique**, comme sur l'iPhone : chaque widget relit sa version publiée (`/widgets/ocean-*.jsx`) et remplace son fichier seulement s'il est complet (plus de 4 000 caractères, marqueur en dernière ligne) et différent. Testé contre un serveur local : version complète → remplacée ; téléchargement coupé, page d'erreur, 404 → refusés ; déjà à jour → fichier non réécrit.
- **Installateur** : installe les trois widgets ; si l'ancien `ocean.jsx` est présent, reprend ses réglages (spot, mode, tailles, spot surf, spots suivis ; une carte masquée repart en taille moyenne) puis le range hors du dossier des widgets (`Übersicht/ocean.jsx.ancien`). Testé avec zsh sur un faux dossier.
- **Correctif** : les styles de l'ancien widget n'étaient pas préfixés (`.card`, `.row`…) alors que tous les widgets Übersicht partagent la même page ; ils pouvaient déteindre sur le widget Agenda. Tout est maintenant sous `.ocean`, et un test le vérifie sur la feuille de style réellement produite.
- Cartes moyennes : les colonnes occupent toute la hauteur (pas de vide en bas) ; cartes grandes ajustées à leur contenu ; carte Vague : « prévi » comme sur l'iPhone.
- Vérifié : 91 tests, contrôle des types, test d'interface du site, rendu des trois widgets (Chromium en local ; WebKit, le moteur d'Übersicht, en CI : `widget-mac.yml`, branche `captures-mac`). **Pas vérifié sur un vrai Mac.**

### D-49 (13/11/2026) — note wing v2.1 : « Kite session » au-delà de 28 nd, 0 à 30 nd
- Demande de Tom : « quand il y a plus de 28 nds, passe à 1 étoile rouge et mets Kite session. Ajuste la note : 30 nds en wing c'est 0 ». Choix validés par Tom (13/11) : seuil sur **le vent de la note** (moyenne, ou moyenne vent + rafales si rafales > vent × 1,3) ; heures « Kite session » **exclues des créneaux wing** ; même règle en Sécu first et Offshore.
- **Formule** (`pipeline/engines/wing.ts`, v2.1.0) : force V = 1 jusqu'à 28 nd, puis ligne droite jusqu'à 0 à 30 nd (avant : 1 jusqu'à 35 nd, 0 au-delà). Chaque heure publiée porte `kite` (de jour, vent de la note > 28 nd) ; le commentaire devient « Kite session (plus de 28 nd) ».
- **Affichage** : 1 étoile rouge + « Kite session » (« Kite » en petit) partout — fiche spot (étoiles du jour, barres heure par heure, tableau, survol), Prévision 5 jours, widgets iPhone, Mac et Windows. Les étoiles d'un jour viennent de la meilleure heure hors kite ; sans étoile mais avec du kite, le jour prend l'étoile rouge. Rouge : #D6343C (clair) / #FF6B6B (sombre).
- **Données des widgets** : 8ᵉ valeur de chaque heure = kite (1/0), 5ᵉ valeur des comptes du jour = heures kite (ajoutées en fin de tableau : les anciens widgets continuent de fonctionner, sans l'étoile rouge, jusqu'à leur mise à jour automatique).
- Cas de référence avant / après dans `docs/product/WING_SCORE.md` (v2.1) et `tests/wing.test.ts` : 26 et 28 nd 10 → 10 ; 29 nd 10 → 5 + kite ; 30 à 35 nd 10 → 0 + kite. Rendu des quatre surfaces vérifié dans `tests/kite.test.ts` (jeudi fictif à 31 nd à Beauduc).

### D-50 (13/11/2026) — note wing v2.2 : pleine note dès 13 nd
- Demande de Tom : « dès 13 nœuds tu peux commencer à partir en session ». Choix validé : note pleine dès 13 nd (monte de 10 à 13 nd), même seuil en Sécu first et Offshore. Avant : 12 → 15 nd (Sécu first), 11 → 14 nd (Offshore).
- Cas avant / après dans `WING_SCORE.md` (v2.2) et `tests/wing.test.ts` : 12 nd 0 → 6,7 ; 13 nd 3,3 → 10 ; 14 nd 6,7 → 10.

### D-51 (13/11/2026) — kitesurf dans l'onglet WIND : bascule Wing | Kite
- Demande de Tom : séparer le vent en deux catégories complémentaires — wing pour le petit vent, kite pour le vent fort — avec le même affichage et une note propre à chaque sport.
- **Note kite v1.0** (validée par Tom) : même formule et mêmes modes Sécu first / Offshore que le wing ; force 0 jusqu'à 15 nd, 1 de 20 à 35 nd, 0 à 40 nd. Détail : `docs/product/KITE_SCORE.md`.
- **Pipeline** : le moteur wing calcule aussi le kite (`wingForecast(…, 'kite')`), publié dans `kite.json` ; les créneaux kite sont dans `sessions.json` avec la discipline « kite » (« Ça envoie » réservé au wing). Contrôle `sorties-kite` dans l'analyse.
- **App** : bascule Wing | Kite en haut de WIND et de la fiche spot, gardée sur l'appareil. L'app ne recalcule rien : elle affiche `kite.json` et les créneaux kite à la place des données wing (`src/services/sport.ts`). Sans `kite.json` (ancienne publication), l'app reste en wing.
- **Vérifié** : 104 tests, contrôle des types, test d'interface (20 écrans en wing synthèse, wing expert et kite, sur 4 affichages) sur les données réellement publiées rejouées avec les nouvelles notes. **Widgets** : toujours en wing.

### D-52 (13/11/2026) — modules affichés et leur ordre, réglés par chacun
- Demande de Tom : pouvoir choisir dans les préférences quels modules (Meilleure session, Sessions 2H, Prévision, Spots, En direct) s'affichent dans chaque onglet, et dans quel ordre, pour que chacun règle son affichage.
- Choix de Tom : un réglage **par onglet** (WIND, VAGUE, HOULE) ; un module reste toujours affiché (le dernier ne peut pas être décoché ; un réglage vide ou abîmé revient à Meilleure session).
- Profil → « Modules affichés » : case à cocher et flèches ↑ ↓ par module. Le premier module affiché s'ouvre quand on touche l'onglet ; la colonne de gauche et le menu de l'onglet suivent l'ordre choisi. Une adresse vers un module masqué ouvre le premier module affiché. Réglage gardé sur l'appareil (`src/services/layout.ts`, préférences).
- Vérifié : tests unitaires (`tests/layout.test.ts`) et test d'interface (masquer Sessions 2H en WIND, monter Prévision en tête, HOULE inchangé, dernier module non masquable), sur mobile, ordinateur et sombre.

### D-53 (13/11/2026) — En direct : relevés en gras, couleurs des étoiles
- Demande de Tom : relevés en gras, et même code couleur que les étoiles pour repérer les spots où ça souffle bien. Couleur selon le vent mesuré, mêmes seuils que les widgets : vert dès 15 nd, orange dès 20, violet dès 25 ; en wing, rouge « Kite » au-delà de 28 nd (D-49). Repère de lecture, pas une note.
- Retiré du bas des onglets (demande de Tom) : la phrase « Session 2H = … Source : … ».

### D-54 (13/11/2026) — module Favoris, Carte façon Windy, texte des Sessions 2H
- **Favoris** (nouveau module, dans chaque onglet) : meilleure session à venir sur les spots favoris de l'onglet (même classement que Meilleure session), puis les suivantes. Sans favori : invitation à mettre l'étoile sur une fiche. Réglable comme les autres modules (Profil → Modules affichés).
- **Spots devient Carte** : plus de liste de spots sous la carte. Carte de la fiche spot (vent Météo-France brut + particules) avec frise des 5 prochains jours, curseur 7 h → 21 h et lecture heure par heure (de 21 h on passe à 7 h le lendemain ; arrêt à la fin du 5e jour). Les repères des spots prennent la couleur des étoiles selon la note publiée de l'heure affichée (gris : pas de session, nuit, ou Kite session en wing). L'adresse `#/…/spots` est gardée.
- **Sessions 2H** : texte « Spots à moins de 30 min du taf. Si ça rentre, mets-toi en TT. » La liste des spots retenus ne change pas (moins de 55 km de Montpellier).
- Vérifié : 109 tests (dont la frise : départ à l'heure en cours, 21 h → 7 h le lendemain, fin au 5e jour), test d'interface 21 écrans, lecture et choix du jour sur les données publiées.

### D-55 (13/11/2026) — carte plus grande, vent sur une zone plus large
- Demande de Tom : agrandir la carte dans l'app et la zone couverte par le vent (« la simulation »).
- **Carte** : 74 % de la hauteur de l'écran (jusqu'à 760 px) dans le module Carte, 340 px sur la fiche spot (avant 460 et 260) ; bouton plein écran sur les deux cartes (Échap ou le même bouton pour revenir), la frise et la lecture restent visibles en plein écran.
- **Vent sur la carte** : grille Open-Meteo de 20 × 10 points tous les 0,3° (1,8° E → 7,5° E, 41,7° N → 44,4° N) au lieu de 16 × 8 tous les 0,25° (2,75° E → 6,5° E, 42,25° N → 44° N) : du Roussillon à la Côte d'Azur, au large et à terre. Toujours le modèle Météo-France brut, pour l'affichage seulement (D-24). 200 points au lieu de 128 à chaque collecte horaire.

### D-56 (13/11/2026) — molette sur les cartes ; moins d'alertes pour rien
- Demande de Tom : zoomer à la molette sur les cartes (module Carte et fiche spot).
- Mails d'échec : aujourd'hui, la plupart venaient de coupures d'Open-Meteo (« fetch failed ») et un d'un vrai bug de carte (corrigé, cc901a0). Désormais : 4 essais espacés de 10 s, 30 s et 60 s pour chaque demande Open-Meteo ; si la collecte reste incomplète, l'heure n'est pas publiée (les données de l'heure d'avant restent en ligne, avec leur âge affiché) et le workflow ne passe pas en échec. Il échoue — donc mail — seulement si les données en ligne ont plus de 3 h, ou pour toute autre erreur (tests, notes, interface, confidentialité).

### D-57 (13/11/2026) — réglage de base des modules, carte moins haute
- Réglage de base de l'app (capture de Tom) — WIND : En direct, Carte, Favoris, Sessions 2H, Prévision ; VAGUE : Sessions 2H, Prévision, Carte, Favoris ; HOULE : Carte, Prévision. Meilleure session (et Favoris en HOULE) masqués d'office, réaffichables dans le Profil. Un onglet déjà réglé sur un appareil garde son réglage.
- Carte : hauteur ramenée à 52 % de l'écran (540 px au plus ; 46 % sur téléphone), plein écran toujours possible ; phrase d'explication sous la carte retirée.

### D-58 (13/11/2026) — noms de spots, Hyères à deux plages, textes des modules
- Noms : « Port Camargue / Espiguette » devient **Plage Sud** ; « Almanarre (Hyères) » devient **Hyères** (identifiants inchangés : adresses, favoris et réglages gardés).
- **Hyères** : deux côtés navigables (ouest 245°, est ~110°, confirmé par Tom le 13/11) ; la direction est jugée sur le meilleur côté (`orientation.seawardAlt`). Avant / après et vérification sur la prévision réelle : `WING_SCORE.md`, `tests/wing.test.ts`.
- Textes (WIND, VAGUE, HOULE) — Prévision : « Chaque case se remplit selon les heures de jour à 1 ★ (vert), 2 ★ (orange) et 3 ★ (violet) ; touche une case pour le détail. Si ça rentre, appelle ton boss… » ; Sessions 2H : « Spots à moins de 30 min du taf. Si ça rentre, mets-toi en TT. » (liste des spots éloignés et définition de « Ça envoie » retirées). La phrase sous la carte était déjà retirée (D-57).

### D-59 (13/11/2026) — En direct : noms de l'app, relevés du jour, stats des spots (mode perso)
- Les relevés en direct prennent les noms de l'app (Plage Sud, Hyères…) au lieu de ceux de Winds-Up.
- Toucher une balise (mode perso) ouvre ses relevés du jour : moyennes horaires (direction, rafale max), puis les relevés des 3 dernières heures, aux couleurs des étoiles (D-53).
- **Stats des spots** sous le direct : pour chaque spot, jours du mois en cours et du mois précédent avec au moins une heure de jour (8 h → 19 h) à 15 nd de moyenne ou plus, « sur N jours relevés ».
- Source : la feuille « Observations » que le script de la super prévision remplit déjà toutes les heures (~3 mois). Nouvel appel `?action=histo` à **ajouter par Tom** au script (`widgets/super-prevision/historique.gs` : aucune clé, aucun identifiant) ; même lien secret que le direct. Rien n'est publié : relevés Winds-Up visibles seulement sur l'appareil qui a le lien. Sans l'ajout, l'app l'indique et le reste marche comme avant.
- Vérifié : ajout du script exécuté sur une fausse feuille (heures du jour, jours à 15 nd, lignes « écart » ignorées) ; tests des stats ; écran contrôlé sur iPhone avec un faux lien perso (aucune vraie donnée Winds-Up utilisée).

### D-60 (13/11/2026) — note wing v2.3 : les rafales ne font plus monter la note
- Retour de Tom (Plage Sud, lundi) : 11 nd rafales 15 notée 7,3, « devrait donner genre 4 » ; 15/21 à 8,7 jugé juste. Cause : la moyenne vent + rafales (rafales > 1,3 × vent) combinée à la note pleine dès 13 nd (D-50).
- Choix validé par Tom : montée de la force sur le **vent moyen seul, de 9 à 13 nd** ; rafales seulement en pénalité (R). Haut de la plage (28 → 30 nd) et « Kite session » inchangés (vent de la note, D-49). Kite inchangé.
- Avant / après et rejeu sur la prévision réelle : `WING_SCORE.md` (v2.3), `tests/wing.test.ts`.

### D-61 (13/11/2026) — Favoris en prévision du jour, cases de la Prévision 5 jours en colonnes
- **Favoris** : plus de « meilleure session » ; pour chaque spot favori, les barres de note heure par heure d'aujourd'hui et de demain (le soir, quand il n'y a plus d'heure de jour : demain et après-demain).
- **Prévision 5 jours** : chaque case montre une colonne par heure de jour (hauteur = note, couleur des étoiles, rouge pour la Kite session) et la note du jour (meilleure heure hors Kite session) en haut à droite. La Grande-Motte et Le Ponant sont retirés de la grille WIND (toujours dans Carte et Sessions 2H). Phrase d'aide sur deux lignes.

### D-62 (14/11/2026) — réglage de base des modules (2), grille des 3 onglets
- Réglage de base (capture de Tom) — WIND : En direct, Favoris, Sessions 2H, Prévision, Carte ; VAGUE : Favoris, Sessions 2H, Prévision, Carte ; HOULE : Prévision, Carte. Meilleure session masquée partout, Favoris aussi en HOULE.
- Prévision 5 jours, mêmes cases dans WIND, VAGUE et HOULE : colonne des jours étroite (64 px, 50 px sur téléphone), colonnes de spots de même largeur, colonnes par heure + note du jour, case plus claire sans heure à 1 étoile.

### D-63 (14/11/2026) — Favoris jour par jour, cartes lisibles
- **Favoris** (3 onglets) : un jour à la fois par spot ; la flèche en gras passe au jour suivant, puis revient au premier quand la prévision s'arrête. Le nom du spot ouvre sa fiche.
- **Cartes** : repères des spots « S » (spot) dans tous les onglets ; parcours de downwind en trait blanc bordé de sombre, rond « 1 » au départ et « 2 » à l'arrivée (couleur de la note).
- **Vent sur les cartes** : particules ralenties (0,035 px par image et par nœud au lieu de 0,08) et densité selon la force du vent (probabilité vent / 40 nd : aucun trait sans vent, densité maximale à 40 nd et plus).
