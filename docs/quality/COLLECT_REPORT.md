# Rapport de collecte (① COLLECTE)

Généré le 2026-11-18 01:57 UTC par `pipeline/collect/run.ts` (GitHub Actions, toutes les heures).

## Sources

| Source | État | Points | Modèles | Valeurs | Manquantes | Rejetées | Période | Durée |
|---|---|---|---|---|---|---|---|---|
| open-meteo-marine | ✅ | 17 | meteofrance_wave, ecmwf_wam025, ewam, gwam, ncep_gfswave025 | 381480 | 185810 | 0 | 2026-11-15 00:00 UTC → 2026-11-25 23:00 UTC | 1.5 s |
| copernicus-medwav | ✅ | 15 | copernicus | 56070 | 0 | 0 | 2026-11-15 21:00 UTC → 2026-11-26 23:00 UTC | 0.3 s |
| open-meteo-vent-moteurs | ❌ fetch failed | 0 | — | 0 | 0 | 0 | — | 141.7 s |
| open-meteo-meteo | ❌ fetch failed | 0 | — | 0 | 0 | 0 | — | 142.0 s |
| open-meteo-vent-spots | ✅ | 14 | meteofrance_arome_france_hd, meteofrance_arome_france, icon_d2, ecmwf_ifs025, icon_eu, meteofrance_arpege_europe, gfs_seamless | 69696 | 20952 | 0 | 2026-11-15 00:00 UTC → 2026-11-25 23:00 UTC | 131.6 s |
| open-meteo-vent-carte | ✅ | 200 | meteofrance_seamless | 48000 | 9200 | 0 | 2026-11-18 00:00 UTC → 2026-11-22 23:00 UTC | 1.3 s |
| super-prevision | ✅ | 7 | super-prevision | 768 | 0 | 0 | 2026-11-18 05:00 UTC → 2026-11-24 20:00 UTC | 1.8 s |
| candhis | ✅ | 5 | — | 31944 | 3118 | 0 | — | 0.2 s |
| metar | ✅ | 5 | — | 1200 | 459 | 0 | — | 0.7 s |

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| fidelite-vagues | ✅ | 109905 valeurs comparées au parseur du moteur surf, 0 écart(s) |
| grille-open-meteo-marine | ✅ | 264 heures, 2026-11-15T00h → 2026-11-25T23h UTC |
| couverture-open-meteo-marine | ✅ | 17 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| modeles-open-meteo-marine | ✅ | wave_height sur 48 h : meteofrance_wave 100 % · ecmwf_wam025 100 % · ewam 100 % · gwam 100 % · ncep_gfswave025 100 % |
| fraicheur-copernicus | ✅ | extrait de 4.1 h (15 points, 267 h) (seuil 30 h) |
| points-copernicus | ✅ | 11 points surf couverts par Copernicus ; ignorés : gruissan, canet, paulilles, perafita |
| grille-open-meteo-vent-spots | ✅ | 264 heures, 2026-11-15T00h → 2026-11-25T23h UTC |
| couverture-open-meteo-vent-spots | ✅ | 14 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| modeles-open-meteo-vent-spots | ✅ | wind_speed_10m sur 48 h : meteofrance_arome_france_hd 98 % · meteofrance_arome_france 98 % · icon_d2 28 % · ecmwf_ifs025 100 % · icon_eu 100 % · meteofrance_arpege_europe 100 % · gfs_seamless 100 % |
| couverture-open-meteo-vent-carte | ✅ | 200 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| couverture-super-prevision | ✅ | 7 spots sur 7 ; 32 heures de jour dans les 48 h à venir |
| fraicheur-candhis | ✅ | 03001 155 min · 03404 155 min · 01101 155 min (seuil 180 min) |
| fraicheur-metar | ✅ | LFMT 5 min · LFMP 5 min · LFTH 5 min · LFML 5 min · LFMI 5 min (seuil 120 min) |
| confidentialite | ✅ | aucun relevé Winds-Up, aucune clé, aucune URL privée dans les données publiées |

Unités stockées : m/s, m, s, degrés, °C ; heures UTC. Les relevés Winds-Up ne sont jamais collectés ici (mode perso uniquement).
