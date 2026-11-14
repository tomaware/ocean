# Rapport de collecte (① COLLECTE)

Généré le 2026-11-14 21:17 UTC par `pipeline/collect/run.ts` (GitHub Actions, toutes les heures).

## Sources

| Source | État | Points | Modèles | Valeurs | Manquantes | Rejetées | Période | Durée |
|---|---|---|---|---|---|---|---|---|
| open-meteo-marine | ✅ | 17 | meteofrance_wave, ecmwf_wam025, ewam, gwam, ncep_gfswave025 | 381480 | 176834 | 0 | 2026-11-11 00:00 UTC → 2026-11-21 23:00 UTC | 0.9 s |
| copernicus-medwav | ✅ | 15 | copernicus | 56700 | 0 | 0 | 2026-11-12 18:00 UTC → 2026-11-23 23:00 UTC | 0.1 s |
| open-meteo-vent-moteurs | ❌ HTTP 429 {"reason":"Daily API request limit exceeded. Please try again tomorrow.","error":true} | 0 | — | 0 | 0 | 0 | — | 100.3 s |
| open-meteo-meteo | ❌ HTTP 429 {"reason":"Daily API request limit exceeded. Please try again tomorrow.","error":true} | 0 | — | 0 | 0 | 0 | — | 100.2 s |
| open-meteo-vent-spots | ❌ HTTP 429 {"error":true,"reason":"Daily API request limit exceeded. Please try again tomorrow."} | 0 | — | 0 | 0 | 0 | — | 100.3 s |
| open-meteo-vent-carte | ❌ HTTP 429 {"error":true,"reason":"Daily API request limit exceeded. Please try again tomorrow."} | 0 | — | 0 | 0 | 0 | — | 100.3 s |
| super-prevision | ✅ | 7 | super-prevision | 509 | 0 | 0 | 2026-11-14 20:00 UTC → 2026-11-20 20:00 UTC | 1.6 s |
| candhis | ✅ | 5 | — | 32880 | 3364 | 0 | — | 0.1 s |
| metar | ✅ | 5 | — | 1200 | 412 | 0 | — | 0.1 s |

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| fidelite-vagues | ✅ | 114801 valeurs comparées au parseur du moteur surf, 0 écart(s) |
| grille-open-meteo-marine | ✅ | 264 heures, 2026-11-11T00h → 2026-11-21T23h UTC |
| couverture-open-meteo-marine | ✅ | 17 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| modeles-open-meteo-marine | ✅ | wave_height sur 48 h : meteofrance_wave 100 % · ecmwf_wam025 100 % · ewam 100 % · gwam 100 % · ncep_gfswave025 100 % |
| fraicheur-copernicus | ✅ | extrait de 2.6 h (15 points, 270 h) (seuil 30 h) |
| points-copernicus | ✅ | 11 points surf couverts par Copernicus ; ignorés : gruissan, canet, paulilles, perafita |
| couverture-super-prevision | ✅ | 7 spots sur 7 ; 32 heures de jour dans les 48 h à venir |
| fraicheur-candhis | ✅ | 03001 114 min · 03404 114 min · 01101 114 min (seuil 180 min) |
| fraicheur-metar | ✅ | LFMT 24 min · LFMP 24 min · LFTH 24 min · LFML 24 min · LFMI 24 min (seuil 120 min) |
| confidentialite | ✅ | aucun relevé Winds-Up, aucune clé, aucune URL privée dans les données publiées |

Unités stockées : m/s, m, s, degrés, °C ; heures UTC. Les relevés Winds-Up ne sont jamais collectés ici (mode perso uniquement).
