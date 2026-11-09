# M2 — Analyse : journal de vérification

## Ce qui est fait

- `pipeline/engines/adapters.ts` : reconstruit, depuis la collecte commune, les entrées exactes des moteurs surf et downwind (copies non modifiées dans `legacy/`). Vent ramené en km/h à 0,1 près (résolution d'Open-Meteo) pour retrouver les valeurs lues par les apps actuelles.
- `pipeline/engines/engines.ts` : deux chemins sur les mêmes réponses brutes : OCEAN (via la collecte) et référence (parseurs des apps actuelles, comme leurs `collector/build.js`). Comparaison note par note.
- `pipeline/engines/run.ts` : tourne juste après la collecte (même job GitHub Actions), écrit `data/v1/engines/{surf,downwind}.json` (archivés 7 jours, pas versionnés), `status.json` et `docs/quality/ENGINES_REPORT.md`. Le job échoue si le golden dépasse ±0,1 ou si une donnée privée apparaît.
- Collecte : Candhis sur 30 jours (= fenêtre de vérification des moteurs) ; réponses brutes et relevés Winds-Up dans `data/private/` (ignoré par git, jamais archivé, supprimé en fin de job).

## Vérification sur données réelles (run 42723700944, 10/11 00 h 50)

| Contrôle | Résultat |
|---|---|
| Golden surf | 4 152 valeurs (note, hauteur, vent × 8 spots) : **écart 0**, créneaux identiques |
| Golden downwind | 1 440 valeurs (vent, houle, 3 notes × 3 parcours) : **écart 0**, créneaux et correction du vent identiques |
| Correction du vent downwind | La Grande-Motte × 1,17, Port Camargue × 1,08 (super prévision) |
| Écart avec l'app downwind en service | médiane 0, max 0,3 sur 120 h (calculs à 50 min d'écart) |
| Écart avec l'app surf en service | médiane 0,2, 90 % ≤ 1, **max 3** sur 1 336 h |
| Confidentialité | aucun relevé Winds-Up ni clé dans les sorties |

## Ce qui reste avant de remplacer l'app surf

L'app surf en service ajoute Copernicus (modèle de vagues européen) quand il est frais ; OCEAN pas encore. C'est la cause la plus probable des écarts jusqu'à 3 points (l'autre : 11 min d'écart sur la dernière mesure de bouée). À faire : collecter Copernicus dans OCEAN (identifiants dans un secret GitHub), puis refaire cette comparaison. Tant que ce n'est pas fait, l'app surf actuelle reste la référence.

## Wing / kite

Pas de note codée : proposition dans `docs/product/WING_SCORE_PROPOSAL.md`, en attente de validation (D-14).
