# Rapport de collecte (① COLLECTE)

Généré le 2026-11-10 18:00 UTC par `pipeline/collect/run.ts` (GitHub Actions, toutes les heures).

## Sources

| Source | État | Points | Modèles | Valeurs | Manquantes | Rejetées | Période | Durée |
|---|---|---|---|---|---|---|---|---|
| open-meteo-marine | ✅ | 17 | meteofrance_wave, ecmwf_wam025, ewam, gwam, ncep_gfswave025 | 381480 | 176834 | 0 | 2026-11-07 00:00 UTC → 2026-11-17 23:00 UTC | 0.9 s |
| copernicus-medwav | ✅ | 15 | copernicus | 54390 | 0 | 0 | 2026-11-08 17:00 UTC → 2026-11-19 11:00 UTC | 0.2 s |
| open-meteo-vent-moteurs | ✅ | 77 | meteofrance_seamless, ecmwf_ifs025 | 121968 | 17787 | 0 | 2026-11-07 00:00 UTC → 2026-11-17 23:00 UTC | 5.8 s |
| open-meteo-meteo | ✅ | 16 | best_match | 13824 | 0 | 0 | 2026-11-09 00:00 UTC → 2026-11-17 23:00 UTC | 1.6 s |
| open-meteo-vent-spots | ✅ | 11 | meteofrance_arome_france_hd, meteofrance_arome_france, icon_d2, ecmwf_ifs025, icon_eu, meteofrance_arpege_europe, gfs_seamless | 55440 | 14472 | 0 | 2026-11-07 00:00 UTC → 2026-11-17 23:00 UTC | 1.1 s |
| super-prevision | ✅ | 6 | super-prevision | 372 | 0 | 0 | 2026-11-10 17:00 UTC → 2026-11-14 18:00 UTC | 1.5 s |
| candhis | ✅ | 5 | — | 34338 | 3648 | 0 | — | 0.2 s |
| metar | ✅ | 4 | — | 1200 | 447 | 0 | — | 5.7 s |

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| fidelite-vagues | ✅ | 114801 valeurs comparées au parseur du moteur surf, 0 écart(s) |
| grille-open-meteo-marine | ✅ | 264 heures, 2026-11-07T00h → 2026-11-17T23h UTC |
| couverture-open-meteo-marine | ✅ | 17 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| modeles-open-meteo-marine | ✅ | wave_height sur 48 h : meteofrance_wave 100 % · ecmwf_wam025 100 % · ewam 100 % · gwam 100 % · ncep_gfswave025 100 % |
| fraicheur-copernicus | ✅ | extrait de 0.4 h (15 points, 259 h) (seuil 30 h) |
| points-copernicus | ✅ | 11 points surf couverts par Copernicus ; ignorés : gruissan, canet, paulilles, perafita |
| fidelite-vent | ✅ | 104181 valeurs comparées au parseur des moteurs surf / downwind, 0 écart(s) |
| grille-open-meteo-vent-moteurs | ✅ | 264 heures, 2026-11-07T00h → 2026-11-17T23h UTC |
| couverture-open-meteo-vent-moteurs | ✅ | 77 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| modeles-open-meteo-vent-moteurs | ✅ | wind_speed_10m sur 48 h : meteofrance_seamless 100 % · ecmwf_ifs025 100 % |
| couverture-open-meteo-meteo | ✅ | 16 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| grille-open-meteo-vent-spots | ✅ | 264 heures, 2026-11-07T00h → 2026-11-17T23h UTC |
| couverture-open-meteo-vent-spots | ✅ | 11 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| modeles-open-meteo-vent-spots | ✅ | wind_speed_10m sur 48 h : meteofrance_arome_france_hd 94 % · meteofrance_arome_france 94 % · icon_d2 34 % · ecmwf_ifs025 100 % · icon_eu 100 % · meteofrance_arpege_europe 100 % · gfs_seamless 100 % |
| couverture-super-prevision | ✅ | 6 spots sur 6 ; 32 heures de jour dans les 48 h à venir |
| fraicheur-candhis | ✅ | 03001 30 min · 03404 30 min · 01101 30 min (seuil 180 min) |
| fraicheur-metar | ✅ | LFMT 30 min · LFMP 30 min · LFTH 30 min · LFML 30 min (seuil 120 min) |
| confidentialite | ✅ | aucun relevé Winds-Up, aucune clé, aucune URL privée dans les données publiées |

Unités stockées : m/s, m, s, degrés, °C ; heures UTC. Les relevés Winds-Up ne sont jamais collectés ici (mode perso uniquement).
