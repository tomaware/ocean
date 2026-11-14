# Rapport de collecte (① COLLECTE)

Généré le 2026-11-14 20:16 UTC par `pipeline/collect/run.ts` (GitHub Actions, toutes les heures).

## Sources

| Source | État | Points | Modèles | Valeurs | Manquantes | Rejetées | Période | Durée |
|---|---|---|---|---|---|---|---|---|
| open-meteo-marine | ✅ | 17 | meteofrance_wave, ecmwf_wam025, ewam, gwam, ncep_gfswave025 | 381480 | 176834 | 0 | 2026-11-11 00:00 UTC → 2026-11-21 23:00 UTC | 1.3 s |
| copernicus-medwav | ✅ | 15 | copernicus | 56700 | 0 | 0 | 2026-11-12 18:00 UTC → 2026-11-23 23:00 UTC | 0.2 s |
| open-meteo-vent-moteurs | ❌ fetch failed | 0 | — | 0 | 0 | 0 | — | 141.8 s |
| open-meteo-meteo | ✅ | 16 | best_match | 13824 | 0 | 0 | 2026-11-13 00:00 UTC → 2026-11-21 23:00 UTC | 61.3 s |
| open-meteo-vent-spots | ✅ | 12 | meteofrance_arome_france_hd, meteofrance_arome_france, icon_d2, ecmwf_ifs025, icon_eu, meteofrance_arpege_europe, gfs_seamless | 60192 | 15396 | 0 | 2026-11-11 00:00 UTC → 2026-11-21 23:00 UTC | 0.1 s |
| open-meteo-vent-carte | ✅ | 200 | meteofrance_seamless | 48000 | 2000 | 0 | 2026-11-14 00:00 UTC → 2026-11-18 23:00 UTC | 1.3 s |
| super-prevision | ✅ | 7 | super-prevision | 498 | 0 | 0 | 2026-11-14 19:00 UTC → 2026-11-20 20:00 UTC | 1.3 s |
| candhis | ✅ | 5 | — | 32928 | 3368 | 0 | — | 0.2 s |
| metar | ✅ | 5 | — | 1200 | 412 | 0 | — | 0.3 s |

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| fidelite-vagues | ✅ | 114801 valeurs comparées au parseur du moteur surf, 0 écart(s) |
| grille-open-meteo-marine | ✅ | 264 heures, 2026-11-11T00h → 2026-11-21T23h UTC |
| couverture-open-meteo-marine | ✅ | 17 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| modeles-open-meteo-marine | ✅ | wave_height sur 48 h : meteofrance_wave 100 % · ecmwf_wam025 100 % · ewam 100 % · gwam 100 % · ncep_gfswave025 100 % |
| fraicheur-copernicus | ✅ | extrait de 1.6 h (15 points, 270 h) (seuil 30 h) |
| points-copernicus | ✅ | 11 points surf couverts par Copernicus ; ignorés : gruissan, canet, paulilles, perafita |
| couverture-open-meteo-meteo | ✅ | 16 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| grille-open-meteo-vent-spots | ✅ | 264 heures, 2026-11-11T00h → 2026-11-21T23h UTC |
| couverture-open-meteo-vent-spots | ✅ | 12 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| modeles-open-meteo-vent-spots | ✅ | wind_speed_10m sur 48 h : meteofrance_arome_france_hd 96 % · meteofrance_arome_france 96 % · icon_d2 32 % · ecmwf_ifs025 100 % · icon_eu 100 % · meteofrance_arpege_europe 100 % · gfs_seamless 100 % |
| couverture-open-meteo-vent-carte | ✅ | 200 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| couverture-super-prevision | ✅ | 7 spots sur 7 ; 32 heures de jour dans les 48 h à venir |
| fraicheur-candhis | ✅ | 03001 50 min · 03404 50 min · 01101 50 min (seuil 180 min) |
| fraicheur-metar | ✅ | LFMT 20 min · LFMP 20 min · LFTH 20 min · LFML 20 min · LFMI 20 min (seuil 120 min) |
| confidentialite | ✅ | aucun relevé Winds-Up, aucune clé, aucune URL privée dans les données publiées |

Unités stockées : m/s, m, s, degrés, °C ; heures UTC. Les relevés Winds-Up ne sont jamais collectés ici (mode perso uniquement).
