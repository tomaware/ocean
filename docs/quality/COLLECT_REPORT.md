# Rapport de collecte (① COLLECTE)

Généré le 2026-11-09 23:37 UTC par `pipeline/collect/run.ts` (GitHub Actions, toutes les heures).

## Sources

| Source | État | Points | Modèles | Valeurs | Manquantes | Rejetées | Période | Durée |
|---|---|---|---|---|---|---|---|---|
| open-meteo-marine | ✅ | 19 | meteofrance_wave, ecmwf_wam025, ewam, gwam, ncep_gfswave025 | 426360 | 197638 | 0 | 2026-11-06 00:00 UTC → 2026-11-16 23:00 UTC | 0.9 s |
| open-meteo-vent-moteurs | ✅ | 79 | meteofrance_seamless, ecmwf_ifs025 | 125136 | 16827 | 0 | 2026-11-06 00:00 UTC → 2026-11-16 23:00 UTC | 0.8 s |
| open-meteo-vent-spots | ✅ | 6 | meteofrance_arome_france_hd, meteofrance_arome_france, icon_d2, ecmwf_ifs025, icon_eu, meteofrance_arpege_europe, gfs_seamless | 30888 | 7722 | 0 | 2026-11-06 00:00 UTC → 2026-11-16 23:00 UTC | 0.1 s |
| super-prevision | ❌ secret SUPER_PREVISION_URL absent | 0 | — | 0 | 0 | 0 | — | 0.0 s |
| candhis | ✅ | 5 | — | 4434 | 556 | 0 | — | 0.1 s |
| metar | ✅ | 3 | — | 1200 | 457 | 0 | — | 0.2 s |

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| fidelite-vagues | ✅ | 128307 valeurs comparées au parseur du moteur surf, 0 écart(s) |
| grille-open-meteo-marine | ✅ | 264 heures, 2026-11-06T00h → 2026-11-16T23h UTC |
| couverture-open-meteo-marine | ✅ | 19 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| fidelite-vent | ✅ | 108309 valeurs comparées au parseur des moteurs surf / downwind, 0 écart(s) |
| grille-open-meteo-vent-moteurs | ✅ | 264 heures, 2026-11-06T00h → 2026-11-16T23h UTC |
| couverture-open-meteo-vent-moteurs | ✅ | 79 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| grille-open-meteo-vent-spots | ✅ | 264 heures, 2026-11-06T00h → 2026-11-16T23h UTC |
| couverture-open-meteo-vent-spots | ✅ | 6 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| fraicheur-candhis | ✅ | 03001 67 min · 03404 67 min · 01101 67 min (seuil 180 min) |
| fraicheur-metar | ✅ | LFMT 7 min · LFMP 7 min · LFTH 7 min (seuil 120 min) |
| confidentialite | ✅ | aucun relevé Winds-Up, aucune clé, aucune URL privée dans les données publiées |

Unités stockées : m/s, m, s, degrés, °C ; heures UTC. Les relevés Winds-Up ne sont jamais collectés ici (mode perso uniquement).
