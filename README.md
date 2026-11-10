# OCEAN

Plateforme unifiée de prévisions et de sessions pour les sports nautiques du Golfe du Lion (Perpignan → Almanarre) : **vent** (wing, kite), **vague** (surf), **houle** (downwind).

**Statut : Phase 0 — audit et proposition d'architecture.** Aucun développement avant validation des décisions structurantes.

| Document | Contenu |
|---|---|
| [EXISTING_APPS_AUDIT](docs/architecture/EXISTING_APPS_AUDIT.md) | Ce qui existe, ce qu'on garde, ce qu'on mutualise, les risques |
| [PRODUCT_ARCHITECTURE](docs/architecture/PRODUCT_ARCHITECTURE.md) | La chaîne en 5 modules (collecte → analyse → remise en question → vulgarisation → interface), contrats de données, stack, migration, décisions à valider |
| [MODULE_MAP](docs/architecture/MODULE_MAP.md) | Arborescence, dépendances, correspondance avec l'existant |

Applications actuelles (restent en service jusqu'à la bascule) :
- Vent — super prévision (Apps Script, privé)
- SurfVague — https://tomaware.github.io/super-previ-surf/ · Session 2H — https://tomaware.github.io/super-previ-surf/session/
- SurfHoule (downwind) — https://tomaware.github.io/downwind-foil/


## État (10/11)
Chaîne complète en service chaque heure : ① collecte → ② analyse (moteurs surf / downwind identiques aux apps actuelles, note wing v1.0) → ③ remise en question → ④ sessions 2H → ⑤ interface.
- Site : https://tomaware.github.io/ocean/ (après activation de GitHub Pages)
- Données publiques : branche `data` (`public/*.json`)
- Rapports : `docs/quality/` ; journaux : `docs/migration/`
- Développement : `npm run dev` (copier les données de la branche `data` dans `public/data/`)
