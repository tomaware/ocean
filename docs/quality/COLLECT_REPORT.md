# Rapport de collecte (① COLLECTE)

Généré le 2026-11-15 06:33 UTC par `pipeline/collect/run.ts` (GitHub Actions, toutes les heures).

## Sources

| Source | État | Points | Modèles | Valeurs | Manquantes | Rejetées | Période | Durée |
|---|---|---|---|---|---|---|---|---|
| open-meteo-marine | ✅ | 17 | meteofrance_wave, ecmwf_wam025, ewam, gwam, ncep_gfswave025 | 381480 | 181322 | 0 | 2026-11-12 00:00 UTC → 2026-11-22 23:00 UTC | 1.1 s |
| copernicus-medwav | ✅ | 15 | copernicus | 57330 | 0 | 0 | 2026-11-13 03:00 UTC → 2026-11-24 11:00 UTC | 0.2 s |
| open-meteo-vent-moteurs | ✅ | 77 | meteofrance_seamless, ecmwf_ifs025 | 121968 | 20559 | 0 | 2026-11-12 00:00 UTC → 2026-11-22 23:00 UTC | 0.3 s |
| open-meteo-meteo | ✅ | 16 | best_match | 13824 | 0 | 0 | 2026-11-14 00:00 UTC → 2026-11-22 23:00 UTC | 0.1 s |
| open-meteo-vent-spots | ✅ | 12 | meteofrance_arome_france_hd, meteofrance_arome_france, icon_d2, ecmwf_ifs025, icon_eu, meteofrance_arpege_europe, gfs_seamless | 60192 | 17304 | 0 | 2026-11-12 00:00 UTC → 2026-11-22 23:00 UTC | 0.1 s |
| open-meteo-vent-carte | ✅ | 200 | meteofrance_seamless | 48000 | 6800 | 0 | 2026-11-15 00:00 UTC → 2026-11-19 23:00 UTC | 0.4 s |
| super-prevision | ✅ | 7 | super-prevision | 777 | 0 | 0 | 2026-11-15 06:00 UTC → 2026-11-21 20:00 UTC | 1.4 s |
| candhis | ✅ | 5 | — | 32748 | 3344 | 0 | — | 0.1 s |
| metar | ✅ | 5 | — | 1200 | 421 | 0 | — | 0.3 s |

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| fidelite-vagues | ✅ | 112353 valeurs comparées au parseur du moteur surf, 0 écart(s) |
| grille-open-meteo-marine | ✅ | 264 heures, 2026-11-12T00h → 2026-11-22T23h UTC |
| couverture-open-meteo-marine | ✅ | 17 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| modeles-open-meteo-marine | ✅ | wave_height sur 48 h : meteofrance_wave 100 % · ecmwf_wam025 100 % · ewam 100 % · gwam 100 % · ncep_gfswave025 100 % |
| fraicheur-copernicus | ✅ | extrait de 2.7 h (15 points, 273 h) (seuil 30 h) |
| points-copernicus | ✅ | 11 points surf couverts par Copernicus ; ignorés : gruissan, canet, paulilles, perafita |
| fidelite-vent | ✅ | 101409 valeurs comparées au parseur des moteurs surf / downwind, 0 écart(s) |
| grille-open-meteo-vent-moteurs | ✅ | 264 heures, 2026-11-12T00h → 2026-11-22T23h UTC |
| couverture-open-meteo-vent-moteurs | ✅ | 77 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| modeles-open-meteo-vent-moteurs | ✅ | wind_speed_10m sur 48 h : meteofrance_seamless 100 % · ecmwf_ifs025 100 % |
| couverture-open-meteo-meteo | ✅ | 16 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| grille-open-meteo-vent-spots | ✅ | 264 heures, 2026-11-12T00h → 2026-11-22T23h UTC |
| couverture-open-meteo-vent-spots | ✅ | 12 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| modeles-open-meteo-vent-spots | ✅ | wind_speed_10m sur 48 h : meteofrance_arome_france_hd 100 % · meteofrance_arome_france 100 % · icon_d2 31 % · ecmwf_ifs025 100 % · icon_eu 100 % · meteofrance_arpege_europe 100 % · gfs_seamless 100 % |
| couverture-open-meteo-vent-carte | ✅ | 200 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| couverture-super-prevision | ✅ | 7 spots sur 7 ; 32 heures de jour dans les 48 h à venir |
| fraicheur-candhis | ✅ | 03001 123 min · 03404 123 min · 01101 123 min (seuil 180 min) |
| fraicheur-metar | ✅ | LFMT 3 min · LFMP 3 min · LFTH 3 min · LFML 3 min · LFMI 3 min (seuil 120 min) |
| confidentialite | ✅ | aucun relevé Winds-Up, aucune clé, aucune URL privée dans les données publiées |

Unités stockées : m/s, m, s, degrés, °C ; heures UTC. Les relevés Winds-Up ne sont jamais collectés ici (mode perso uniquement).
