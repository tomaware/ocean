# Remise en question (③)

Généré le 2026-11-10 18:22 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 20 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 7 prévisions archivées sur 18 h ; 510 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 1,9 · meteofrance_arpege_europe 1,9 · gfs_seamless 2,3 · icon_eu 2,5 · meteofrance_arome_france_hd 2,6 · icon_d2 3,0 · ecmwf_ifs025 5,1 |
| LFMP | icon_eu 1,4 · gfs_seamless 1,5 · ecmwf_ifs025 1,6 · meteofrance_arpege_europe 1,6 · meteofrance_arome_france 1,7 · meteofrance_arome_france_hd 1,9 |
| LFTH | icon_eu 2,2 · ecmwf_ifs025 2,5 · meteofrance_arome_france_hd 3,1 · meteofrance_arome_france 3,1 · meteofrance_arpege_europe 3,3 · gfs_seamless 3,3 |
| LFML | meteofrance_arome_france_hd 2,2 · meteofrance_arome_france 2,2 · ecmwf_ifs025 2,3 · meteofrance_arpege_europe 3,1 · icon_eu 3,2 · gfs_seamless 3,9 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.25 · gwam 0.25 · ecmwf_wam025 0.32 · meteofrance_wave 0.35 · ncep_gfswave025 1.38 |
| 03404 | ewam 0.16 · gwam 0.16 · ecmwf_wam025 0.17 · ncep_gfswave025 0.20 · meteofrance_wave 0.23 |
| 01102 | ecmwf_wam025 0.24 · ewam 0.34 · meteofrance_wave 0.44 · gwam 0.49 · ncep_gfswave025 1.00 |
| 01101 | ecmwf_wam025 0.15 · gwam 0.18 · ncep_gfswave025 0.19 · ewam 0.21 · meteofrance_wave 0.31 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 8.23, ×1.19 (MAE 0.33 m, n 157) ; ecmwf_wam025 poids 7.73, ×1.15 (MAE 0.3 m, n 157) ; ewam poids 10.98, ×1.08 (MAE 0.23 m, n 157) ; gwam poids 6.43, ×1.06 (MAE 0.23 m, n 157) ; copernicus poids 15.34, ×1.03 (MAE 0.23 m, n 100)
  - 03404 : meteofrance_wave poids 14.75, ×1.14 (MAE 0.2 m, n 167) ; ecmwf_wam025 poids 15.69, ×1.08 (MAE 0.15 m, n 167) ; ewam poids 16.58, ×1.03 (MAE 0.14 m, n 167) ; gwam poids 10.12, ×1.05 (MAE 0.14 m, n 167) ; ncep_gfswave025 poids 8.66, ×1.09 (MAE 0.17 m, n 167) ; copernicus poids 24.96, ×1 (MAE 0.13 m, n 100)
  - 01102 : meteofrance_wave poids —, ×— (MAE 0.33 m, n 124) ; ecmwf_wam025 poids —, ×— (MAE 0.19 m, n 124) ; ewam poids —, ×— (MAE 0.25 m, n 124) ; gwam poids —, ×— (MAE 0.36 m, n 124) ; copernicus poids —, ×— (MAE 0.19 m, n 43)
  - 01101 : meteofrance_wave poids 11.18, ×1.25 (MAE 0.26 m, n 182) ; ecmwf_wam025 poids 17.91, ×0.98 (MAE 0.13 m, n 182) ; ewam poids 14.07, ×1.08 (MAE 0.18 m, n 182) ; gwam poids 9.59, ×1.1 (MAE 0.15 m, n 182) ; ncep_gfswave025 poids 8.83, ×1.05 (MAE 0.17 m, n 182) ; copernicus poids 18.33, ×0.98 (MAE 0.19 m, n 100)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.01, Port Camargue × 0.93 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

7 prévisions archivées. Pas encore assez de recul pour l'échéance 24 h.
