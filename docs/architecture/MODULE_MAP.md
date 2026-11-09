# MODULE_MAP — Phase 1

*OCEAN · carte des modules et dépendances · 10/11/2026 · v0.1 (proposition)*

## Arborescence cible

```
/docs
  /architecture    EXISTING_APPS_AUDIT.md · PRODUCT_ARCHITECTURE.md · MODULE_MAP.md
  /product         (Phase 2) UX_NAVIGATION.md
  /design          (Phase 3) DESIGN_TOKENS.md · UI_FOUNDATIONS.md
  /migration       journal de chaque portage (avant / après, écarts)
  /quality         tests golden, audits
/registry          spots.json — Spot Registry unique (spots vent, surf, parcours downwind)
/pipeline          tâches planifiées (GitHub Actions)
  /collect         ① collecteurs par source
  /engines         ② vent · vague · houle · wing
  /verify          ③ calibration, recalage, bancs
  /sessions        ④ créneaux + notes par discipline + explications
  /publish         écrit data/v1/*.json
/src               ⑤ application (PWA)
  /app             shell, navigation, contexte partagé
  /features        wind · surf · downwind · sessions · spots · reliability · perso
  /components      ui · weather · navigation
  /design-system   tokens · styles · assets (SVG métier)
  /services        lecture data/v1, cache, mode perso
  /types           contrats partagés avec /pipeline
/tests             golden (entrées figées → sorties attendues), unitaires, UI (Playwright)
/data/v1           sorties publiées (spots, séries, créneaux, fiabilité)
```

## Dépendances (sens unique)

```
registry ──► collect ──► engines ──► verify ──► sessions ──► publish ──► data/v1 ──► src (app, widgets)
                ▲                        │
                └──── observations ◄─────┘   (les relevés nourrissent la vérification, jamais l'inverse)
apps-script (VENT + Winds-Up, privé) ──► engines/wind (vent corrigé, sans relevés)
apps-script (live) ──────────────────────────────────────────────► src/features/perso (clé sur l'appareil)
```

Règles : pas de dépendance circulaire ; `src` ne calcule pas de note (il affiche) ; `/types` est partagé par `pipeline` et `src`.

## Interfaces entre modules

| De → vers | Contrat | Fréquence |
|---|---|---|
| collect → engines | `ForecastSeries[]`, `Observation[]` (UTC, unités SI, provenance) | horaire |
| engines → verify | prévisions par spot / modèle / échéance | horaire, archive toutes les 3 h |
| verify → engines | poids, biais, facteurs, recalage | horaire |
| engines + verify → sessions | séries corrigées + confiance | horaire |
| sessions → publish | `SessionWindow[]` par discipline, résumé du jour | horaire |
| publish → app | `data/v1/{spots,series,sessions,reliability}.json` | horaire |
| Apps Script → app (perso) | `?action=live` avec clé | à la demande (toutes les 5 min max) |

## Correspondance avec l'existant

| Module OCEAN | Code existant repris | Statut |
|---|---|---|
| collect/open-meteo | `surf-engine.js` (URL, parse), `super-prevision-vent.gs` (multi-modèles) | à fusionner |
| collect/candhis, copernicus | `collector/candhis.py`, `copernicus.py` | à reprendre tel quel |
| collect/meteo-france, metar | `super-prevision-vent.gs` | à porter (M3+) |
| engines/wind | Apps Script v3.4 | enveloppé (lu via JSON) en M2 |
| engines/surf | `surf-engine.js` | enveloppé puis typé |
| engines/downwind | `downwind-engine.js` | enveloppé puis typé |
| engines/wing | — | à concevoir (D-14) |
| verify | `verifyAgainstBuoy`, `modelCalibration`, bancs Apps Script | à unifier (M3) |
| sessions | `findWindows`, `session-core.js`, `windows` (downwind) | moteur générique + notes par discipline (M4) |
| src | pages surf / session / downwind | remplacées en M5 |
