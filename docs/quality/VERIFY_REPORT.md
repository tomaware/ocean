# Remise en question (③)

Généré le 2026-11-18 19:41 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 52 prévisions archivées sur 210 h ; 4558 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | icon_eu 2,1 · meteofrance_arome_france 2,2 · icon_d2 2,2 · meteofrance_arome_france_hd 2,2 · ecmwf_ifs025 2,2 · gfs_seamless 2,2 · meteofrance_arpege_europe 2,7 |
| LFMP | icon_eu 2,1 · meteofrance_arome_france_hd 2,1 · meteofrance_arome_france 2,1 · meteofrance_arpege_europe 2,3 · ecmwf_ifs025 2,6 · gfs_seamless 2,8 |
| LFTH | meteofrance_arome_france_hd 2,7 · meteofrance_arome_france 2,7 · icon_eu 2,9 · gfs_seamless 2,9 · meteofrance_arpege_europe 3,0 · ecmwf_ifs025 3,0 |
| LFML | meteofrance_arome_france 2,2 · meteofrance_arome_france_hd 2,3 · ecmwf_ifs025 2,3 · meteofrance_arpege_europe 2,7 · icon_eu 2,7 · gfs_seamless 3,7 |
| LFMI | meteofrance_arome_france 1,9 · meteofrance_arome_france_hd 2,0 · meteofrance_arpege_europe 2,2 · ecmwf_ifs025 2,4 · gfs_seamless 2,4 · icon_eu 2,5 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.17 · meteofrance_wave 0.18 · ecmwf_wam025 0.26 · gwam 0.29 · ncep_gfswave025 0.80 |
| 03404 | ewam 0.11 · ncep_gfswave025 0.11 · meteofrance_wave 0.14 · gwam 0.16 · ecmwf_wam025 0.17 |
| 01101 | ncep_gfswave025 0.13 · ewam 0.14 · meteofrance_wave 0.16 · ecmwf_wam025 0.16 · gwam 0.18 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 15.59, ×0.93 (MAE 0.19 m, n 184) ; ecmwf_wam025 poids 8.23, ×0.85 (MAE 0.29 m, n 184) ; ewam poids 9.24, ×0.88 (MAE 0.26 m, n 184) ; gwam poids 3.28, ×0.8 (MAE 0.38 m, n 184) ; copernicus poids 17.54, ×0.89 (MAE 0.2 m, n 100)
  - 03404 : meteofrance_wave poids 13.99, ×1.07 (MAE 0.21 m, n 184) ; ecmwf_wam025 poids 11.7, ×0.97 (MAE 0.21 m, n 184) ; ewam poids 17.54, ×0.98 (MAE 0.13 m, n 184) ; gwam poids 8.84, ×0.94 (MAE 0.17 m, n 184) ; ncep_gfswave025 poids 8.73, ×1.05 (MAE 0.17 m, n 184) ; copernicus poids 21.17, ×0.93 (MAE 0.16 m, n 100)
  - 01102 : 
  - 01101 : meteofrance_wave poids 16.76, ×1.23 (MAE 0.18 m, n 184) ; ecmwf_wam025 poids 15.24, ×0.92 (MAE 0.16 m, n 184) ; ewam poids 15.98, ×1.02 (MAE 0.15 m, n 184) ; gwam poids 7.77, ×0.9 (MAE 0.19 m, n 184) ; ncep_gfswave025 poids 10.47, ×1 (MAE 0.13 m, n 184) ; copernicus poids 27.23, ×1.04 (MAE 0.11 m, n 100)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.02, Port Camargue × 1.08 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

52 prévisions archivées. Classement à 24 h :

- LFMT : icon_d2 1,8 nd (n 7) · gfs_seamless 1,8 nd (n 7) · icon_eu 2,0 nd (n 7) · meteofrance_arome_france_hd 2,2 nd (n 7) · meteofrance_arome_france 2,4 nd (n 7) · meteofrance_arpege_europe 2,5 nd (n 7) · ecmwf_ifs025 3,1 nd (n 7)
- LFMP : meteofrance_arome_france_hd 2,0 nd (n 7) · meteofrance_arome_france 2,2 nd (n 7) · ecmwf_ifs025 2,7 nd (n 7) · meteofrance_arpege_europe 3,2 nd (n 7) · icon_eu 3,4 nd (n 7) · gfs_seamless 3,8 nd (n 7)
- LFTH : icon_eu 2,6 nd (n 7) · ecmwf_ifs025 3,0 nd (n 7) · gfs_seamless 4,1 nd (n 7) · meteofrance_arome_france_hd 4,5 nd (n 7) · meteofrance_arome_france 4,5 nd (n 7) · meteofrance_arpege_europe 5,4 nd (n 7)
- LFML : meteofrance_arome_france_hd 2,2 nd (n 7) · meteofrance_arome_france 2,4 nd (n 7) · meteofrance_arpege_europe 2,5 nd (n 7) · ecmwf_ifs025 3,0 nd (n 7) · icon_eu 3,2 nd (n 7) · gfs_seamless 4,4 nd (n 7)
- LFMI : meteofrance_arome_france_hd 2,0 nd (n 7) · meteofrance_arome_france 2,0 nd (n 7) · meteofrance_arpege_europe 2,6 nd (n 7) · icon_eu 2,6 nd (n 7) · gfs_seamless 2,8 nd (n 7) · ecmwf_ifs025 3,2 nd (n 7)
