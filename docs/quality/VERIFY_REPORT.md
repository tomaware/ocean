# Remise en question (③)

Généré le 2026-11-18 03:33 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 48 prévisions archivées sur 195 h ; 4471 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 1,6 · meteofrance_arome_france_hd 1,6 · icon_eu 1,8 · gfs_seamless 2,0 · icon_d2 2,1 · ecmwf_ifs025 2,1 · meteofrance_arpege_europe 2,3 |
| LFMP | icon_eu 1,7 · meteofrance_arpege_europe 1,7 · meteofrance_arome_france_hd 1,7 · meteofrance_arome_france 1,8 · gfs_seamless 1,9 · ecmwf_ifs025 2,2 |
| LFTH | meteofrance_arome_france_hd 2,0 · meteofrance_arome_france 2,0 · icon_eu 2,1 · gfs_seamless 2,3 · meteofrance_arpege_europe 2,6 · ecmwf_ifs025 2,8 |
| LFML | meteofrance_arome_france 2,1 · meteofrance_arome_france_hd 2,1 · ecmwf_ifs025 2,3 · gfs_seamless 2,8 · icon_eu 2,8 · meteofrance_arpege_europe 2,9 |
| LFMI | meteofrance_arome_france 1,4 · meteofrance_arome_france_hd 1,4 · ecmwf_ifs025 2,1 · gfs_seamless 2,1 · meteofrance_arpege_europe 2,1 · icon_eu 2,6 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.16 · ewam 0.24 · ecmwf_wam025 0.27 · gwam 0.35 · ncep_gfswave025 0.93 |
| 03404 | ewam 0.13 · ncep_gfswave025 0.14 · ecmwf_wam025 0.16 · gwam 0.16 · meteofrance_wave 0.17 |
| 01101 | ncep_gfswave025 0.14 · meteofrance_wave 0.15 · ecmwf_wam025 0.15 · ewam 0.15 · gwam 0.18 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 16.83, ×0.95 (MAE 0.18 m, n 146) ; ecmwf_wam025 poids 8.59, ×0.87 (MAE 0.28 m, n 146) ; ewam poids 8.02, ×0.88 (MAE 0.29 m, n 146) ; gwam poids 3.07, ×0.81 (MAE 0.39 m, n 146) ; copernicus poids 19.74, ×0.91 (MAE 0.18 m, n 104)
  - 03404 : meteofrance_wave poids 13.05, ×1.11 (MAE 0.23 m, n 146) ; ecmwf_wam025 poids 12.25, ×1.01 (MAE 0.2 m, n 146) ; ewam poids 17.26, ×0.99 (MAE 0.13 m, n 146) ; gwam poids 9.42, ×0.97 (MAE 0.15 m, n 146) ; ncep_gfswave025 poids 8.38, ×1.06 (MAE 0.18 m, n 146) ; copernicus poids 23.87, ×0.95 (MAE 0.14 m, n 104)
  - 01102 : 
  - 01101 : meteofrance_wave poids 16.75, ×1.2 (MAE 0.18 m, n 146) ; ecmwf_wam025 poids 15.88, ×0.93 (MAE 0.15 m, n 146) ; ewam poids 15.67, ×1 (MAE 0.15 m, n 146) ; gwam poids 8.22, ×0.92 (MAE 0.18 m, n 146) ; ncep_gfswave025 poids 9.9, ×1 (MAE 0.14 m, n 146) ; copernicus poids 28.12, ×1.05 (MAE 0.1 m, n 104)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.01, Port Camargue × 1.06 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

48 prévisions archivées. Classement à 24 h :

- LFMT : gfs_seamless 1,6 nd (n 10) · icon_d2 1,9 nd (n 10) · meteofrance_arome_france_hd 2,0 nd (n 10) · icon_eu 2,0 nd (n 10) · meteofrance_arome_france 2,1 nd (n 10) · meteofrance_arpege_europe 2,6 nd (n 10) · ecmwf_ifs025 2,7 nd (n 10)
- LFMP : gfs_seamless 2,3 nd (n 10) · icon_eu 2,4 nd (n 10) · meteofrance_arome_france 2,4 nd (n 10) · ecmwf_ifs025 2,5 nd (n 10) · meteofrance_arpege_europe 2,6 nd (n 10) · meteofrance_arome_france_hd 2,7 nd (n 10)
- LFTH : icon_eu 1,9 nd (n 10) · ecmwf_ifs025 3,1 nd (n 10) · gfs_seamless 3,3 nd (n 10) · meteofrance_arome_france_hd 3,9 nd (n 10) · meteofrance_arome_france 3,9 nd (n 10) · meteofrance_arpege_europe 4,8 nd (n 10)
- LFML : meteofrance_arome_france 2,3 nd (n 10) · meteofrance_arome_france_hd 2,4 nd (n 10) · ecmwf_ifs025 2,4 nd (n 10) · meteofrance_arpege_europe 2,7 nd (n 10) · gfs_seamless 3,3 nd (n 10) · icon_eu 3,4 nd (n 10)
- LFMI : ecmwf_ifs025 2,3 nd (n 10) · icon_eu 2,5 nd (n 10) · gfs_seamless 2,7 nd (n 10) · meteofrance_arome_france_hd 3,1 nd (n 10) · meteofrance_arome_france 3,3 nd (n 10) · meteofrance_arpege_europe 3,8 nd (n 10)
