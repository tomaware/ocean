# Remise en question (③)

Généré le 2026-11-15 22:55 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 37 prévisions archivées sur 141 h ; 3558 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arpege_europe 2,9 · meteofrance_arome_france_hd 3,0 · meteofrance_arome_france 3,0 · icon_eu 3,0 · icon_d2 3,1 · gfs_seamless 4,0 · ecmwf_ifs025 4,1 |
| LFMP | gfs_seamless 1,7 · icon_eu 1,7 · ecmwf_ifs025 1,7 · meteofrance_arome_france_hd 1,7 · meteofrance_arome_france 1,8 · meteofrance_arpege_europe 2,2 |
| LFTH | ecmwf_ifs025 2,4 · icon_eu 2,8 · meteofrance_arpege_europe 4,2 · gfs_seamless 4,2 · meteofrance_arome_france_hd 4,6 · meteofrance_arome_france 4,7 |
| LFML | meteofrance_arome_france 2,0 · meteofrance_arome_france_hd 2,2 · ecmwf_ifs025 2,5 · icon_eu 2,6 · meteofrance_arpege_europe 3,1 · gfs_seamless 5,6 |
| LFMI | meteofrance_arome_france_hd 2,3 · meteofrance_arome_france 2,4 · ecmwf_ifs025 2,5 · meteofrance_arpege_europe 2,6 · icon_eu 3,1 · gfs_seamless 3,7 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.31 · meteofrance_wave 0.34 · ecmwf_wam025 0.40 · gwam 0.54 · ncep_gfswave025 1.15 |
| 03404 | ewam 0.18 · gwam 0.23 · ncep_gfswave025 0.25 · meteofrance_wave 0.29 · ecmwf_wam025 0.32 |
| 01101 | meteofrance_wave 0.18 · ewam 0.18 · ncep_gfswave025 0.24 · ecmwf_wam025 0.25 · gwam 0.29 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 10.09, ×0.96 (MAE 0.28 m, n 189) ; ecmwf_wam025 poids 6.72, ×0.87 (MAE 0.33 m, n 189) ; ewam poids 8.17, ×0.87 (MAE 0.29 m, n 189) ; gwam poids 2.26, ×0.8 (MAE 0.47 m, n 189) ; copernicus poids 9.91, ×0.96 (MAE 0.32 m, n 102)
  - 03404 : meteofrance_wave poids 10.77, ×1.07 (MAE 0.27 m, n 174) ; ecmwf_wam025 poids 8.09, ×0.97 (MAE 0.29 m, n 174) ; ewam poids 12.78, ×0.97 (MAE 0.2 m, n 174) ; gwam poids 6.3, ×0.9 (MAE 0.24 m, n 174) ; ncep_gfswave025 poids 6.31, ×1.06 (MAE 0.23 m, n 174) ; copernicus poids 17.3, ×1.06 (MAE 0.2 m, n 102)
  - 01102 : 
  - 01101 : meteofrance_wave poids 16.77, ×1.13 (MAE 0.18 m, n 191) ; ecmwf_wam025 poids 9.3, ×0.84 (MAE 0.26 m, n 191) ; ewam poids 11.15, ×0.91 (MAE 0.22 m, n 191) ; gwam poids 4.19, ×0.82 (MAE 0.32 m, n 191) ; ncep_gfswave025 poids 5.58, ×0.94 (MAE 0.26 m, n 191) ; copernicus poids 23.66, ×0.98 (MAE 0.14 m, n 102)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.16, Port Camargue × 1.15 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

37 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arome_france 2,8 nd (n 10) · meteofrance_arpege_europe 3,1 nd (n 10) · icon_d2 3,1 nd (n 10) · meteofrance_arome_france_hd 3,5 nd (n 10) · gfs_seamless 3,6 nd (n 10) · icon_eu 4,0 nd (n 10) · ecmwf_ifs025 4,7 nd (n 10)
- LFMP : gfs_seamless 1,2 nd (n 10) · icon_eu 1,3 nd (n 10) · ecmwf_ifs025 1,4 nd (n 10) · meteofrance_arpege_europe 1,5 nd (n 10) · meteofrance_arome_france 2,0 nd (n 10) · meteofrance_arome_france_hd 2,1 nd (n 10)
- LFTH : icon_eu 2,5 nd (n 10) · ecmwf_ifs025 3,1 nd (n 10) · gfs_seamless 3,8 nd (n 10) · meteofrance_arpege_europe 3,8 nd (n 10) · meteofrance_arome_france_hd 5,8 nd (n 10) · meteofrance_arome_france 5,8 nd (n 10)
- LFML : meteofrance_arpege_europe 2,9 nd (n 10) · icon_eu 3,0 nd (n 10) · meteofrance_arome_france 3,1 nd (n 10) · meteofrance_arome_france_hd 3,2 nd (n 10) · ecmwf_ifs025 3,4 nd (n 10) · gfs_seamless 6,5 nd (n 10)
- LFMI : 
