# Rapport de collecte (① COLLECTE)

Généré le 2026-11-14 01:45 UTC par `pipeline/collect/run.ts` (GitHub Actions, toutes les heures).

## Sources

| Source | État | Points | Modèles | Valeurs | Manquantes | Rejetées | Période | Durée |
|---|---|---|---|---|---|---|---|---|
| open-meteo-marine | ✅ | 17 | meteofrance_wave, ecmwf_wam025, ewam, gwam, ncep_gfswave025 | 381480 | 185810 | 0 | 2026-11-11 00:00 UTC → 2026-11-21 23:00 UTC | 1.2 s |
| copernicus-medwav | ✅ | 15 | copernicus | 55440 | 0 | 0 | 2026-11-12 00:00 UTC → 2026-11-22 23:00 UTC | 0.2 s |
| open-meteo-vent-moteurs | ✅ | 77 | meteofrance_seamless, ecmwf_ifs025 | 121968 | 21945 | 0 | 2026-11-11 00:00 UTC → 2026-11-21 23:00 UTC | 131.6 s |
| open-meteo-meteo | ✅ | 16 | best_match | 13824 | 0 | 0 | 2026-11-13 00:00 UTC → 2026-11-21 23:00 UTC | 0.1 s |
| open-meteo-vent-spots | ✅ | 11 | meteofrance_arome_france_hd, meteofrance_arome_france, icon_d2, ecmwf_ifs025, icon_eu, meteofrance_arpege_europe, gfs_seamless | 55440 | 16830 | 0 | 2026-11-11 00:00 UTC → 2026-11-21 23:00 UTC | 0.2 s |
| open-meteo-vent-carte | ✅ | 200 | meteofrance_seamless | 48000 | 9200 | 0 | 2026-11-14 00:00 UTC → 2026-11-18 23:00 UTC | 2.5 s |
| super-prevision | ✅ | 7 | super-prevision | 686 | 0 | 0 | 2026-11-14 05:00 UTC → 2026-11-20 20:00 UTC | 1.5 s |
| candhis | ✅ | 5 | — | 33126 | 3440 | 0 | — | 0.3 s |
| metar | ✅ | 4 | — | 1200 | 412 | 0 | — | 0.4 s |

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| fidelite-vagues | ✅ | 109905 valeurs comparées au parseur du moteur surf, 0 écart(s) |
| grille-open-meteo-marine | ✅ | 264 heures, 2026-11-11T00h → 2026-11-21T23h UTC |
| couverture-open-meteo-marine | ✅ | 17 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| modeles-open-meteo-marine | ✅ | wave_height sur 48 h : meteofrance_wave 100 % · ecmwf_wam025 100 % · ewam 100 % · gwam 100 % · ncep_gfswave025 100 % |
| fraicheur-copernicus | ✅ | extrait de 0.8 h (15 points, 264 h) (seuil 30 h) |
| points-copernicus | ✅ | 11 points surf couverts par Copernicus ; ignorés : gruissan, canet, paulilles, perafita |
| fidelite-vent | ✅ | 100023 valeurs comparées au parseur des moteurs surf / downwind, 0 écart(s) |
| grille-open-meteo-vent-moteurs | ✅ | 264 heures, 2026-11-11T00h → 2026-11-21T23h UTC |
| couverture-open-meteo-vent-moteurs | ✅ | 77 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| modeles-open-meteo-vent-moteurs | ✅ | wind_speed_10m sur 48 h : meteofrance_seamless 100 % · ecmwf_ifs025 100 % |
| couverture-open-meteo-meteo | ✅ | 16 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| grille-open-meteo-vent-spots | ✅ | 264 heures, 2026-11-11T00h → 2026-11-21T23h UTC |
| couverture-open-meteo-vent-spots | ✅ | 11 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| modeles-open-meteo-vent-spots | ✅ | wind_speed_10m sur 48 h : meteofrance_arome_france_hd 98 % · meteofrance_arome_france 98 % · icon_d2 36 % · ecmwf_ifs025 100 % · icon_eu 100 % · meteofrance_arpege_europe 100 % · gfs_seamless 100 % |
| couverture-open-meteo-vent-carte | ✅ | 200 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| couverture-super-prevision | ✅ | 7 spots sur 7 ; 32 heures de jour dans les 48 h à venir |
| fraicheur-candhis | ✅ | 03001 78 min · 03404 78 min · 01101 78 min (seuil 180 min) |
| fraicheur-metar | ✅ | LFMT 18 min · LFMP 18 min · LFTH 18 min · LFML 18 min (seuil 120 min) |
| confidentialite | ✅ | aucun relevé Winds-Up, aucune clé, aucune URL privée dans les données publiées |

Unités stockées : m/s, m, s, degrés, °C ; heures UTC. Les relevés Winds-Up ne sont jamais collectés ici (mode perso uniquement).
