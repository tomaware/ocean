# Remise en question (③)

Généré le 2026-11-18 05:44 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 48 prévisions archivées sur 195 h ; 4484 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france_hd 1,7 · icon_eu 1,7 · meteofrance_arome_france 1,7 · icon_d2 2,0 · gfs_seamless 2,0 · ecmwf_ifs025 2,3 · meteofrance_arpege_europe 2,3 |
| LFMP | meteofrance_arpege_europe 1,6 · icon_eu 1,7 · meteofrance_arome_france_hd 1,7 · meteofrance_arome_france 1,8 · gfs_seamless 1,9 · ecmwf_ifs025 2,1 |
| LFTH | meteofrance_arome_france_hd 2,1 · meteofrance_arome_france 2,1 · icon_eu 2,2 · gfs_seamless 2,3 · meteofrance_arpege_europe 2,7 · ecmwf_ifs025 2,8 |
| LFML | meteofrance_arome_france_hd 2,0 · meteofrance_arome_france 2,0 · ecmwf_ifs025 2,2 · gfs_seamless 2,6 · icon_eu 2,7 · meteofrance_arpege_europe 2,8 |
| LFMI | meteofrance_arome_france 1,5 · meteofrance_arome_france_hd 1,5 · ecmwf_ifs025 2,1 · meteofrance_arpege_europe 2,1 · gfs_seamless 2,1 · icon_eu 2,6 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.17 · ewam 0.21 · ecmwf_wam025 0.26 · gwam 0.32 · ncep_gfswave025 0.91 |
| 03404 | ewam 0.13 · ncep_gfswave025 0.13 · ecmwf_wam025 0.14 · meteofrance_wave 0.15 · gwam 0.16 |
| 01101 | ncep_gfswave025 0.13 · meteofrance_wave 0.15 · ewam 0.15 · ecmwf_wam025 0.16 · gwam 0.17 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 16.27, ×0.94 (MAE 0.18 m, n 154) ; ecmwf_wam025 poids 8.57, ×0.86 (MAE 0.28 m, n 154) ; ewam poids 8.29, ×0.88 (MAE 0.28 m, n 154) ; gwam poids 3.13, ×0.81 (MAE 0.39 m, n 154) ; copernicus poids 18.98, ×0.88 (MAE 0.18 m, n 100)
  - 03404 : meteofrance_wave poids 13.48, ×1.1 (MAE 0.22 m, n 154) ; ecmwf_wam025 poids 12.55, ×1.01 (MAE 0.2 m, n 154) ; ewam poids 17.64, ×0.99 (MAE 0.13 m, n 154) ; gwam poids 9.54, ×0.96 (MAE 0.15 m, n 154) ; ncep_gfswave025 poids 8.56, ×1.06 (MAE 0.17 m, n 154) ; copernicus poids 23.65, ×0.93 (MAE 0.14 m, n 100)
  - 01102 : 
  - 01101 : meteofrance_wave poids 17.03, ×1.2 (MAE 0.17 m, n 154) ; ecmwf_wam025 poids 15.88, ×0.93 (MAE 0.15 m, n 154) ; ewam poids 15.79, ×1.01 (MAE 0.15 m, n 154) ; gwam poids 8.4, ×0.92 (MAE 0.18 m, n 154) ; ncep_gfswave025 poids 10.12, ×1 (MAE 0.14 m, n 154) ; copernicus poids 27.14, ×0.98 (MAE 0.11 m, n 100)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1, Port Camargue × 1.04 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

48 prévisions archivées. Classement à 24 h :

- LFMT : gfs_seamless 1,7 nd (n 10) · meteofrance_arome_france_hd 1,8 nd (n 10) · meteofrance_arome_france 1,9 nd (n 10) · icon_d2 2,0 nd (n 10) · icon_eu 2,1 nd (n 10) · meteofrance_arpege_europe 2,5 nd (n 10) · ecmwf_ifs025 2,9 nd (n 10)
- LFMP : gfs_seamless 2,3 nd (n 10) · ecmwf_ifs025 2,4 nd (n 10) · meteofrance_arome_france 2,4 nd (n 10) · icon_eu 2,4 nd (n 10) · meteofrance_arpege_europe 2,4 nd (n 10) · meteofrance_arome_france_hd 2,7 nd (n 10)
- LFTH : icon_eu 2,1 nd (n 10) · ecmwf_ifs025 3,1 nd (n 10) · gfs_seamless 3,3 nd (n 10) · meteofrance_arome_france_hd 3,9 nd (n 10) · meteofrance_arome_france 4,0 nd (n 10) · meteofrance_arpege_europe 4,7 nd (n 10)
- LFML : ecmwf_ifs025 2,1 nd (n 10) · meteofrance_arome_france_hd 2,3 nd (n 10) · meteofrance_arome_france 2,5 nd (n 10) · meteofrance_arpege_europe 2,6 nd (n 10) · icon_eu 3,2 nd (n 10) · gfs_seamless 3,4 nd (n 10)
- LFMI : ecmwf_ifs025 2,1 nd (n 10) · icon_eu 2,6 nd (n 10) · gfs_seamless 2,8 nd (n 10) · meteofrance_arome_france_hd 3,1 nd (n 10) · meteofrance_arome_france 3,3 nd (n 10) · meteofrance_arpege_europe 3,9 nd (n 10)
