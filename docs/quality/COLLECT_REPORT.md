# Rapport de collecte (① COLLECTE)

Généré le 2026-11-17 04:38 UTC par `pipeline/collect/run.ts` (GitHub Actions, toutes les heures).

## Sources

| Source | État | Points | Modèles | Valeurs | Manquantes | Rejetées | Période | Durée |
|---|---|---|---|---|---|---|---|---|
| open-meteo-marine | ✅ | 17 | meteofrance_wave, ecmwf_wam025, ewam, gwam, ncep_gfswave025 | 381480 | 181322 | 0 | 2026-11-14 00:00 UTC → 2026-11-24 23:00 UTC | 1.5 s |
| copernicus-medwav | ✅ | 15 | copernicus | 57330 | 0 | 0 | 2026-11-15 03:00 UTC → 2026-11-26 11:00 UTC | 0.4 s |
| open-meteo-vent-moteurs | ❌ fetch failed | 0 | — | 0 | 0 | 0 | — | 141.6 s |
| open-meteo-meteo | ❌ fetch failed | 0 | — | 0 | 0 | 0 | — | 142.0 s |
| open-meteo-vent-spots | ❌ fetch failed | 0 | — | 0 | 0 | 0 | — | 142.1 s |
| open-meteo-vent-carte | ✅ | 200 | meteofrance_seamless | 48000 | 6800 | 0 | 2026-11-17 00:00 UTC → 2026-11-21 23:00 UTC | 21.1 s |
| super-prevision | ✅ | 7 | super-prevision | 784 | 0 | 0 | 2026-11-17 05:00 UTC → 2026-11-23 20:00 UTC | 1.6 s |
| candhis | ✅ | 5 | — | 32232 | 3190 | 0 | — | 0.3 s |
| metar | ✅ | 5 | — | 1200 | 433 | 0 | — | 0.5 s |

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| fidelite-vagues | ✅ | 112353 valeurs comparées au parseur du moteur surf, 0 écart(s) |
| grille-open-meteo-marine | ✅ | 264 heures, 2026-11-14T00h → 2026-11-24T23h UTC |
| couverture-open-meteo-marine | ✅ | 17 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| modeles-open-meteo-marine | ✅ | wave_height sur 48 h : meteofrance_wave 100 % · ecmwf_wam025 100 % · ewam 100 % · gwam 100 % · ncep_gfswave025 100 % |
| fraicheur-copernicus | ✅ | extrait de 0.7 h (15 points, 273 h) (seuil 30 h) |
| points-copernicus | ✅ | 11 points surf couverts par Copernicus ; ignorés : gruissan, canet, paulilles, perafita |
| couverture-open-meteo-vent-carte | ✅ | 200 points, 48 h à venir dans la grille ; tous complets (≥ 90 % sur 48 h) |
| couverture-super-prevision | ✅ | 7 spots sur 7 ; 32 heures de jour dans les 48 h à venir |
| fraicheur-candhis | ✅ | 03001 76 min · 03404 76 min · 01101 76 min (seuil 180 min) |
| fraicheur-metar | ✅ | LFMT 16 min · LFMP 16 min · LFTH 16 min · LFML 16 min · LFMI 16 min (seuil 120 min) |
| confidentialite | ✅ | aucun relevé Winds-Up, aucune clé, aucune URL privée dans les données publiées |

Unités stockées : m/s, m, s, degrés, °C ; heures UTC. Les relevés Winds-Up ne sont jamais collectés ici (mode perso uniquement).
