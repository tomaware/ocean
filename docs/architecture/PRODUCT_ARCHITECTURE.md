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
