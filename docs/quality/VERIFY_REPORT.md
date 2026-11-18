# Remise en question (③)

Généré le 2026-11-18 18:29 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 52 prévisions archivées sur 210 h ; 4701 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | icon_eu 2,1 · meteofrance_arome_france 2,2 · icon_d2 2,2 · meteofrance_arome_france_hd 2,2 · gfs_seamless 2,2 · ecmwf_ifs025 2,3 · meteofrance_arpege_europe 2,6 |
| LFMP | meteofrance_arome_france_hd 2,1 · meteofrance_arome_france 2,1 · icon_eu 2,1 · meteofrance_arpege_europe 2,3 · ecmwf_ifs025 2,6 · gfs_seamless 2,8 |
| LFTH | meteofrance_arome_france_hd 2,5 · meteofrance_arome_france 2,5 · icon_eu 2,7 · gfs_seamless 2,7 · ecmwf_ifs025 2,8 · meteofrance_arpege_europe 3,0 |
| LFML | meteofrance_arome_france 2,2 · ecmwf_ifs025 2,3 · meteofrance_arome_france_hd 2,3 · icon_eu 2,7 · meteofrance_arpege_europe 2,7 · gfs_seamless 3,7 |
| LFMI | meteofrance_arome_france 1,7 · meteofrance_arome_france_hd 1,8 · meteofrance_arpege_europe 2,3 · ecmwf_ifs025 2,3 · gfs_seamless 2,4 · icon_eu 2,4 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.17 · meteofrance_wave 0.18 · ecmwf_wam025 0.25 · gwam 0.29 · ncep_gfswave025 0.81 |
| 03404 | ewam 0.11 · ncep_gfswave025 0.12 · meteofrance_wave 0.14 · ecmwf_wam025 0.16 · gwam 0.17 |
| 01101 | ewam 0.13 · ncep_gfswave025 0.13 · ecmwf_wam025 0.14 · meteofrance_wave 0.17 · gwam 0.18 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 15.51, ×0.93 (MAE 0.19 m, n 182) ; ecmwf_wam025 poids 8.34, ×0.85 (MAE 0.28 m, n 182) ; ewam poids 9.13, ×0.88 (MAE 0.26 m, n 182) ; gwam poids 3.26, ×0.8 (MAE 0.38 m, n 182) ; copernicus poids 15.04, ×0.86 (MAE 0.23 m, n 104)
  - 03404 : meteofrance_wave poids 13.96, ×1.07 (MAE 0.21 m, n 182) ; ecmwf_wam025 poids 12.09, ×0.98 (MAE 0.21 m, n 182) ; ewam poids 17.48, ×0.98 (MAE 0.13 m, n 182) ; gwam poids 8.88, ×0.94 (MAE 0.17 m, n 182) ; ncep_gfswave025 poids 8.68, ×1.05 (MAE 0.17 m, n 182) ; copernicus poids 19.25, ×0.9 (MAE 0.18 m, n 104)
  - 01102 : 
  - 01101 : meteofrance_wave poids 16.66, ×1.23 (MAE 0.18 m, n 182) ; ecmwf_wam025 poids 15.87, ×0.92 (MAE 0.15 m, n 182) ; ewam poids 15.97, ×1.02 (MAE 0.15 m, n 182) ; gwam poids 7.77, ×0.9 (MAE 0.19 m, n 182) ; ncep_gfswave025 poids 10.42, ×1 (MAE 0.13 m, n 182) ; copernicus poids 26.87, ×0.99 (MAE 0.11 m, n 104)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.01, Port Camargue × 1.07 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

52 prévisions archivées. Classement à 24 h :

- LFMT : icon_d2 1,6 nd (n 8) · icon_eu 1,7 nd (n 8) · gfs_seamless 1,8 nd (n 8) · meteofrance_arome_france_hd 1,9 nd (n 8) · meteofrance_arome_france 2,2 nd (n 8) · meteofrance_arpege_europe 2,4 nd (n 8) · ecmwf_ifs025 3,0 nd (n 8)
- LFMP : meteofrance_arome_france_hd 2,0 nd (n 8) · meteofrance_arome_france 2,1 nd (n 8) · ecmwf_ifs025 2,4 nd (n 8) · icon_eu 3,3 nd (n 8) · meteofrance_arpege_europe 3,3 nd (n 8) · gfs_seamless 3,5 nd (n 8)
- LFTH : icon_eu 2,4 nd (n 8) · ecmwf_ifs025 2,8 nd (n 8) · gfs_seamless 3,9 nd (n 8) · meteofrance_arome_france_hd 4,0 nd (n 8) · meteofrance_arome_france 4,0 nd (n 8) · meteofrance_arpege_europe 5,1 nd (n 8)
- LFML : meteofrance_arome_france_hd 2,0 nd (n 8) · meteofrance_arome_france 2,1 nd (n 8) · meteofrance_arpege_europe 2,3 nd (n 8) · ecmwf_ifs025 2,8 nd (n 8) · icon_eu 3,2 nd (n 8) · gfs_seamless 3,9 nd (n 8)
- LFMI : meteofrance_arome_france 2,4 nd (n 8) · icon_eu 2,4 nd (n 8) · meteofrance_arome_france_hd 2,4 nd (n 8) · gfs_seamless 2,8 nd (n 8) · ecmwf_ifs025 3,1 nd (n 8) · meteofrance_arpege_europe 3,2 nd (n 8)
