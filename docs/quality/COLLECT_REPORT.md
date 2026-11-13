# Rapport de collecte (① COLLECTE)

Généré le 2026-11-13 14:58 UTC par `pipeline/collect/run.ts` (GitHub Actions, toutes les heures).

## Sources

| Source | État | Points | Modèles | Valeurs | Manquantes | Rejetées | Période | Durée |
|---|---|---|---|---|---|---|---|---|
| open-meteo-marine | ✅ | 17 | meteofrance_wave, ecmwf_wam025, ewam, gwam, ncep_gfswave025 | 381480 | 181322 | 0 | 2026-11-10 00:00 UTC → 2026-11-20 23:00 UTC | 1.3 s |
| copernicus-medwav | ✅ | 15 | copernicus | 56070 | 0 | 0 | 2026-11-11 09:00 UTC → 2026-11-22 11:00 UTC | 0.3 s |
| open-meteo-vent-moteurs | ✅ | 77 | meteofrance_seamless, ecmwf_ifs025 | 121968 | 19173 | 0 | 2026-11-10 00:00 UTC → 2026-11-20 23:00 UTC | 0.3 s |
| open-meteo-meteo | ✅ | 16 | best_match | 13824 | 0 | 0 | 2026-11-12 00:00 UTC → 2026-11-20 23:00 UTC | 0.1 s |
| open-meteo-vent-spots | ✅ | 11 | meteofrance_arome_france_hd, meteofrance_arome_france, icon_d2, ecmwf_ifs025, icon_eu, meteofrance_arpege_europe, gfs_seamless | 55440 | 15102 | 0 | 2026-11-10 00:00 UTC → 2026-11-20 23:00 UTC | 0.1 s |
| open-meteo-vent-carte | ✅ | 128 | meteofrance_seamless | 30720 | 2816 | 0 | 2026-11-13 00:00 UTC → 2026-11-17 23:00 UTC | 0.1 s |
| super-prevision | ✅ | 7 | super-prevision | 721 | 0 | 0 | 2026-11-13 14:00 UTC → 2026-11-19 20:00 UTC | 1.5 s |
| candhis | ✅ | 5 | — | 33276 | 3484 | 0 | — | 0.2 s |
| metar | ✅ | 4 | — | 1200 | 420 | 0 | — | 8.1 s |

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| fidelite-vagues | ✅ | 112353 valeurs comparées au parseur du moteur surf, 0 écart(s) |
| grille-open-meteo-marine | ✅ | 264 heures, 2026-11-10T00h → 2026-11-20T23h UTC |
| couverture-open-meteo-marine | ✅ | 17 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| modeles-open-meteo-marine | ✅ | wave_height sur 48 h : meteofrance_wave 100 % · ecmwf_wam025 100 % · ewam 100 % · gwam 100 % · ncep_gfswave025 100 % |
| fraicheur-copernicus | ✅ | extrait de 5.0 h (15 points, 267 h) (seuil 30 h) |
| points-copernicus | ✅ | 11 points surf couverts par Copernicus ; ignorés : gruissan, canet, paulilles, perafita |
| fidelite-vent | ✅ | 102795 valeurs comparées au parseur des moteurs surf / downwind, 0 écart(s) |
| grille-open-meteo-vent-moteurs | ✅ | 264 heures, 2026-11-10T00h → 2026-11-20T23h UTC |
| couverture-open-meteo-vent-moteurs | ✅ | 77 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| modeles-open-meteo-vent-moteurs | ✅ | wind_speed_10m sur 48 h : meteofrance_seamless 100 % · ecmwf_ifs025 100 % |
| couverture-open-meteo-meteo | ✅ | 16 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| grille-open-meteo-vent-spots | ✅ | 264 heures, 2026-11-10T00h → 2026-11-20T23h UTC |
| couverture-open-meteo-vent-spots | ✅ | 11 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| modeles-open-meteo-vent-spots | ✅ | wind_speed_10m sur 48 h : meteofrance_arome_france_hd 96 % · meteofrance_arome_france 96 % · icon_d2 35 % · ecmwf_ifs025 100 % · icon_eu 100 % · meteofrance_arpege_europe 100 % · gfs_seamless 100 % |
| couverture-open-meteo-vent-carte | ✅ | 128 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| couverture-super-prevision | ✅ | 7 spots sur 7 ; 32 heures de jour dans les 48 h à venir |
| fraicheur-candhis | ✅ | 03001 59 min · 03404 59 min · 01101 59 min (seuil 180 min) |
| fraicheur-metar | ✅ | LFMT 29 min · LFMP 29 min · LFTH 29 min · LFML 29 min (seuil 120 min) |
| confidentialite | ✅ | aucun relevé Winds-Up, aucune clé, aucune URL privée dans les données publiées |

Unités stockées : m/s, m, s, degrés, °C ; heures UTC. Les relevés Winds-Up ne sont jamais collectés ici (mode perso uniquement).
