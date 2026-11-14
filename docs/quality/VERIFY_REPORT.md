# Remise en question (③)

Généré le 2026-11-14 19:25 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 29 prévisions archivées sur 114 h ; 2768 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 1,8 · meteofrance_arpege_europe 1,8 · icon_d2 1,9 · gfs_seamless 2,0 · meteofrance_arome_france_hd 2,1 · ecmwf_ifs025 2,4 · icon_eu 2,4 |
| LFMP | meteofrance_arome_france_hd 1,7 · meteofrance_arome_france 1,7 · gfs_seamless 1,8 · ecmwf_ifs025 2,1 · icon_eu 2,2 · meteofrance_arpege_europe 2,4 |
| LFTH | icon_eu 2,4 · ecmwf_ifs025 2,5 · meteofrance_arpege_europe 3,1 · gfs_seamless 3,1 · meteofrance_arome_france_hd 3,6 · meteofrance_arome_france 3,6 |
| LFML | meteofrance_arome_france_hd 1,9 · meteofrance_arome_france 2,3 · icon_eu 2,4 · ecmwf_ifs025 3,6 · meteofrance_arpege_europe 3,9 · gfs_seamless 5,8 |
| LFMI | meteofrance_arome_france_hd 2,4 · meteofrance_arome_france 2,5 · meteofrance_arpege_europe 2,6 · icon_eu 2,8 · gfs_seamless 3,8 · ecmwf_ifs025 3,8 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.16 · meteofrance_wave 0.23 · ecmwf_wam025 0.33 · gwam 0.40 · ncep_gfswave025 0.87 |
| 03404 | meteofrance_wave 0.14 · ncep_gfswave025 0.15 · ewam 0.18 · ecmwf_wam025 0.25 · gwam 0.26 |
| 01101 | meteofrance_wave 0.14 · ewam 0.22 · ncep_gfswave025 0.27 · ecmwf_wam025 0.28 · gwam 0.36 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 15.11, ×0.89 (MAE 0.2 m, n 181) ; ecmwf_wam025 poids 8.17, ×0.84 (MAE 0.29 m, n 181) ; ewam poids 16.49, ×0.9 (MAE 0.14 m, n 181) ; gwam poids 3.75, ×0.8 (MAE 0.35 m, n 181) ; copernicus poids 14.56, ×0.89 (MAE 0.24 m, n 100)
  - 03404 : meteofrance_wave poids 20.04, ×0.9 (MAE 0.14 m, n 118) ; ecmwf_wam025 poids 9.8, ×0.83 (MAE 0.25 m, n 118) ; ewam poids 13.67, ×0.94 (MAE 0.18 m, n 118) ; gwam poids 5.7, ×0.82 (MAE 0.26 m, n 118) ; ncep_gfswave025 poids 0.48, ×0.94 (MAE 0.15 m, n 118) ; copernicus poids 23.82, ×0.9 (MAE 0.14 m, n 100)
  - 01102 : 
  - 01101 : meteofrance_wave poids 20.55, ×1.1 (MAE 0.14 m, n 183) ; ecmwf_wam025 poids 10.59, ×0.82 (MAE 0.23 m, n 183) ; ewam poids 12.21, ×0.92 (MAE 0.2 m, n 183) ; gwam poids 4.8, ×0.81 (MAE 0.29 m, n 183) ; ncep_gfswave025 poids 6.75, ×0.89 (MAE 0.22 m, n 183) ; copernicus poids 23.03, ×0.89 (MAE 0.14 m, n 100)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.07, Port Camargue × 0.97 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

29 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 1,9 nd (n 8) · gfs_seamless 2,2 nd (n 8) · icon_d2 2,4 nd (n 8) · ecmwf_ifs025 2,4 nd (n 8) · icon_eu 2,5 nd (n 8) · meteofrance_arome_france 2,6 nd (n 8) · meteofrance_arome_france_hd 2,8 nd (n 8)
- LFMP : gfs_seamless 1,0 nd (n 8) · meteofrance_arome_france 1,7 nd (n 8) · meteofrance_arome_france_hd 1,7 nd (n 8) · meteofrance_arpege_europe 2,0 nd (n 8) · icon_eu 2,1 nd (n 8) · ecmwf_ifs025 2,1 nd (n 8)
- LFTH : icon_eu 2,2 nd (n 8) · meteofrance_arpege_europe 2,5 nd (n 8) · ecmwf_ifs025 2,9 nd (n 8) · meteofrance_arome_france_hd 3,3 nd (n 8) · meteofrance_arome_france 3,3 nd (n 8) · gfs_seamless 4,3 nd (n 8)
- LFML : meteofrance_arome_france_hd 2,2 nd (n 8) · icon_eu 2,4 nd (n 8) · ecmwf_ifs025 2,6 nd (n 8) · meteofrance_arome_france 2,7 nd (n 8) · meteofrance_arpege_europe 5,2 nd (n 8) · gfs_seamless 6,3 nd (n 8)
- LFMI : 
