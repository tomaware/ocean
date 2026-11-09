# M1 — ① Collecte · journal de mise en service

*10/11/2026 · commit 8c93137 et suivants*

## Ce qui a été construit

- `registry/spots.json` : registre unique (6 spots vent de La Franqui à l'Almanarre, 8 spots surf, 3 parcours downwind, 5 bouées Candhis, 3 stations METAR), repris **sans modification** des apps actuelles (vérifié par test).
- `pipeline/collect/` : un collecteur par source, sortie normalisée (SI, UTC, provenance) dans `data/v1/collect/bundle.json` ; rapport horaire `docs/quality/COLLECT_REPORT.md`.
- Points interrogés = ceux que calculent les moteurs actuels (mêmes fonctions), pour que le branchement des moteurs (M2) donne des résultats identiques.

## Vérification sur données réelles (exécution GitHub Actions du 09/11/2026, 23 h 37 UTC)

| Contrôle | Résultat |
|---|---|
| Fidélité vagues | 128 307 valeurs comparées au parseur du moteur surf : **0 écart** |
| Fidélité vent | 108 309 valeurs comparées au parseur des moteurs surf / downwind : **0 écart** |
| Grilles horaires | 264 h continues (3 jours passés + 8 à venir) pour les 3 blocs Open-Meteo |
| Couverture 48 h | 19 points mer, 79 points vent, 6 spots wing : tous ≥ 90 % |
| Fraîcheur | Candhis 67 min (Sète, Espiguette, Leucate) ; METAR 7 min (Montpellier, Perpignan, Hyères) |
| Confidentialité | aucun relevé Winds-Up, aucune clé, aucune URL privée publiés |
| Valeurs aberrantes rejetées | 0 |

Les valeurs « manquantes » (46 % côté vagues, 13-25 % côté vent) sont structurelles : variables que certains modèles ne fournissent pas (houle secondaire, niveau de la mer…) et heures au-delà de l'horizon de chaque modèle (AROME HD ≈ 2 jours). Le rapport détaille la disponibilité par modèle.

## Reste à faire pour clore M1

- Secret `SUPER_PREVISION_URL` dans le dépôt `ocean` (vent corrigé), puis contrôle `couverture-super-prevision`.
- Météo-France DPObs (clé à mettre en secret) : à brancher avec le module ③ (contrôle croisé des balises).
- Copernicus : reste collecté par Super Prévi Surf jusqu'au portage du moteur surf.
