# Rapport de collecte (① COLLECTE)

Généré le 2026-11-09 23:59 UTC par `pipeline/collect/run.ts` (GitHub Actions, toutes les heures).

## Sources

| Source | État | Points | Modèles | Valeurs | Manquantes | Rejetées | Période | Durée |
|---|---|---|---|---|---|---|---|---|
| open-meteo-marine | ✅ | 19 | meteofrance_wave, ecmwf_wam025, ewam, gwam, ncep_gfswave025 | 426360 | 197638 | 0 | 2026-11-06 00:00 UTC → 2026-11-16 23:00 UTC | 0.9 s |
| open-meteo-vent-moteurs | ✅ | 79 | meteofrance_seamless, ecmwf_ifs025 | 125136 | 16827 | 0 | 2026-11-06 00:00 UTC → 2026-11-16 23:00 UTC | 0.9 s |
| open-meteo-vent-spots | ✅ | 6 | meteofrance_arome_france_hd, meteofrance_arome_france, icon_d2, ecmwf_ifs025, icon_eu, meteofrance_arpege_europe, gfs_seamless | 30888 | 7722 | 0 | 2026-11-06 00:00 UTC → 2026-11-16 23:00 UTC | 0.1 s |
| super-prevision | ✅ | 6 | super-prevision | 376 | 0 | 0 | 2026-11-10 05:00 UTC → 2026-11-13 20:00 UTC | 1.3 s |
| candhis | ✅ | 5 | — | 34344 | 3664 | 0 | — | 0.1 s |
| metar | ✅ | 3 | — | 1200 | 457 | 0 | — | 0.2 s |

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| fidelite-vagues | ✅ | 128307 valeurs comparées au parseur du moteur surf, 0 écart(s) |
| grille-open-meteo-marine | ✅ | 264 heures, 2026-11-06T00h → 2026-11-16T23h UTC |
| couverture-open-meteo-marine | ✅ | 19 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| modeles-open-meteo-marine | ✅ | wave_height sur 48 h : meteofrance_wave 100 % · ecmwf_wam025 100 % · ewam 100 % · gwam 100 % · ncep_gfswave025 100 % |
| fidelite-vent | ✅ | 108309 valeurs comparées au parseur des moteurs surf / downwind, 0 écart(s) |
| grille-open-meteo-vent-moteurs | ✅ | 264 heures, 2026-11-06T00h → 2026-11-16T23h UTC |
| couverture-open-meteo-vent-moteurs | ✅ | 79 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| modeles-open-meteo-vent-moteurs | ✅ | wind_speed_10m sur 48 h : meteofrance_seamless 100 % · ecmwf_ifs025 100 % |
| grille-open-meteo-vent-spots | ✅ | 264 heures, 2026-11-06T00h → 2026-11-16T23h UTC |
| couverture-open-meteo-vent-spots | ✅ | 6 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| modeles-open-meteo-vent-spots | ✅ | wind_speed_10m sur 48 h : meteofrance_arome_france_hd 96 % · meteofrance_arome_france 96 % · icon_d2 48 % · ecmwf_ifs025 100 % · icon_eu 100 % · meteofrance_arpege_europe 100 % · gfs_seamless 100 % |
| couverture-super-prevision | ✅ | 6 spots sur 6 ; 32 heures de jour dans les 48 h à venir |
| fraicheur-candhis | ✅ | 03001 30 min · 03404 30 min · 01101 30 min (seuil 180 min) |
| fraicheur-metar | ✅ | LFMT 30 min · LFMP 30 min · LFTH 30 min (seuil 120 min) |
| confidentialite | ✅ | aucun relevé Winds-Up, aucune clé, aucune URL privée dans les données publiées |

Unités stockées : m/s, m, s, degrés, °C ; heures UTC. Les relevés Winds-Up ne sont jamais collectés ici (mode perso uniquement).
