# Rapport de collecte (① COLLECTE)

Généré le 2026-11-13 00:23 UTC par `pipeline/collect/run.ts` (GitHub Actions, toutes les heures).

## Sources

| Source | État | Points | Modèles | Valeurs | Manquantes | Rejetées | Période | Durée |
|---|---|---|---|---|---|---|---|---|
| open-meteo-marine | ✅ | 17 | meteofrance_wave, ecmwf_wam025, ewam, gwam, ncep_gfswave025 | 381480 | 185810 | 0 | 2026-11-10 00:00 UTC → 2026-11-20 23:00 UTC | 1.5 s |
| copernicus-medwav | ✅ | 15 | copernicus | 56070 | 0 | 0 | 2026-11-10 21:00 UTC → 2026-11-21 23:00 UTC | 0.2 s |
| open-meteo-vent-moteurs | ❌ fetch failed | 0 | — | 0 | 0 | 0 | — | 40.2 s |
| open-meteo-meteo | ❌ fetch failed | 0 | — | 0 | 0 | 0 | — | 40.5 s |
| open-meteo-vent-spots | ❌ fetch failed | 0 | — | 0 | 0 | 0 | — | 40.5 s |
| open-meteo-vent-carte | ❌ fetch failed | 0 | — | 0 | 0 | 0 | — | 40.5 s |
| super-prevision | ✅ | 7 | super-prevision | 784 | 0 | 0 | 2026-11-13 05:00 UTC → 2026-11-19 20:00 UTC | 1.4 s |
| candhis | ✅ | 5 | — | 33438 | 3516 | 0 | — | 0.2 s |
| metar | ✅ | 4 | — | 1200 | 456 | 0 | — | 0.5 s |

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| fidelite-vagues | ✅ | 109905 valeurs comparées au parseur du moteur surf, 0 écart(s) |
| grille-open-meteo-marine | ✅ | 264 heures, 2026-11-10T00h → 2026-11-20T23h UTC |
| couverture-open-meteo-marine | ✅ | 17 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| modeles-open-meteo-marine | ✅ | wave_height sur 48 h : meteofrance_wave 100 % · ecmwf_wam025 100 % · ewam 100 % · gwam 100 % · ncep_gfswave025 100 % |
| fraicheur-copernicus | ✅ | extrait de 2.6 h (15 points, 267 h) (seuil 30 h) |
| points-copernicus | ✅ | 11 points surf couverts par Copernicus ; ignorés : gruissan, canet, paulilles, perafita |
| couverture-super-prevision | ✅ | 7 spots sur 7 ; 32 heures de jour dans les 48 h à venir |
| fraicheur-candhis | ✅ | 03001 56 min · 03404 56 min · 01101 56 min (seuil 180 min) |
| fraicheur-metar | ✅ | LFMT 26 min · LFMP 26 min · LFTH 26 min · LFML 26 min (seuil 120 min) |
| confidentialite | ✅ | aucun relevé Winds-Up, aucune clé, aucune URL privée dans les données publiées |

Unités stockées : m/s, m, s, degrés, °C ; heures UTC. Les relevés Winds-Up ne sont jamais collectés ici (mode perso uniquement).
