# Remise en question (③)

Généré le 2026-11-18 07:56 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 48 prévisions archivées sur 195 h ; 4386 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france_hd 1,7 · meteofrance_arome_france 1,7 · icon_eu 1,7 · icon_d2 2,0 · gfs_seamless 2,1 · meteofrance_arpege_europe 2,3 · ecmwf_ifs025 2,4 |
| LFMP | meteofrance_arpege_europe 1,7 · icon_eu 1,7 · gfs_seamless 1,9 · meteofrance_arome_france_hd 1,9 · meteofrance_arome_france 2,0 · ecmwf_ifs025 2,1 |
| LFTH | meteofrance_arome_france_hd 2,1 · meteofrance_arome_france 2,1 · icon_eu 2,3 · gfs_seamless 2,4 · ecmwf_ifs025 2,6 · meteofrance_arpege_europe 2,8 |
| LFML | meteofrance_arome_france 1,9 · meteofrance_arome_france_hd 2,0 · ecmwf_ifs025 2,1 · icon_eu 2,5 · meteofrance_arpege_europe 2,5 · gfs_seamless 2,6 |
| LFMI | meteofrance_arome_france 1,5 · meteofrance_arome_france_hd 1,5 · meteofrance_arpege_europe 2,0 · ecmwf_ifs025 2,1 · gfs_seamless 2,3 · icon_eu 2,5 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.18 · ewam 0.19 · ecmwf_wam025 0.27 · gwam 0.30 · ncep_gfswave025 0.89 |
| 03404 | ewam 0.12 · meteofrance_wave 0.13 · ncep_gfswave025 0.13 · ecmwf_wam025 0.15 · gwam 0.15 |
| 01101 | ncep_gfswave025 0.13 · meteofrance_wave 0.14 · ewam 0.14 · ecmwf_wam025 0.16 · gwam 0.16 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 15.82, ×0.94 (MAE 0.19 m, n 161) ; ecmwf_wam025 poids 8.32, ×0.86 (MAE 0.28 m, n 161) ; ewam poids 8.57, ×0.88 (MAE 0.28 m, n 161) ; gwam poids 3.21, ×0.81 (MAE 0.38 m, n 161) ; copernicus poids 17.12, ×0.87 (MAE 0.2 m, n 101)
  - 03404 : meteofrance_wave poids 14.02, ×1.1 (MAE 0.21 m, n 161) ; ecmwf_wam025 poids 12.56, ×1 (MAE 0.2 m, n 161) ; ewam poids 17.73, ×0.99 (MAE 0.13 m, n 161) ; gwam poids 9.76, ×0.97 (MAE 0.15 m, n 161) ; ncep_gfswave025 poids 8.62, ×1.07 (MAE 0.17 m, n 161) ; copernicus poids 23.61, ×0.93 (MAE 0.14 m, n 101)
  - 01102 : 
  - 01101 : meteofrance_wave poids 17.3, ×1.2 (MAE 0.17 m, n 161) ; ecmwf_wam025 poids 15.76, ×0.92 (MAE 0.15 m, n 161) ; ewam poids 15.73, ×1.02 (MAE 0.15 m, n 161) ; gwam poids 8.58, ×0.92 (MAE 0.17 m, n 161) ; ncep_gfswave025 poids 10.3, ×1 (MAE 0.14 m, n 161) ; copernicus poids 27.32, ×0.99 (MAE 0.11 m, n 101)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1, Port Camargue × 1.05 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

48 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arome_france 1,4 nd (n 9) · icon_d2 1,4 nd (n 9) · meteofrance_arome_france_hd 1,4 nd (n 9) · gfs_seamless 1,4 nd (n 9) · icon_eu 1,5 nd (n 9) · meteofrance_arpege_europe 2,0 nd (n 9) · ecmwf_ifs025 2,8 nd (n 9)
- LFMP : gfs_seamless 2,3 nd (n 9) · ecmwf_ifs025 2,4 nd (n 9) · meteofrance_arome_france 2,4 nd (n 9) · icon_eu 2,6 nd (n 9) · meteofrance_arpege_europe 2,8 nd (n 9) · meteofrance_arome_france_hd 2,8 nd (n 9)
- LFTH : icon_eu 1,9 nd (n 9) · ecmwf_ifs025 2,5 nd (n 9) · gfs_seamless 3,5 nd (n 9) · meteofrance_arome_france_hd 3,7 nd (n 9) · meteofrance_arome_france 3,8 nd (n 9) · meteofrance_arpege_europe 5,1 nd (n 9)
- LFML : meteofrance_arome_france_hd 1,9 nd (n 9) · meteofrance_arpege_europe 2,0 nd (n 9) · meteofrance_arome_france 2,0 nd (n 9) · ecmwf_ifs025 2,1 nd (n 9) · gfs_seamless 2,6 nd (n 9) · icon_eu 3,1 nd (n 9)
- LFMI : ecmwf_ifs025 2,0 nd (n 9) · icon_eu 2,2 nd (n 9) · gfs_seamless 2,4 nd (n 9) · meteofrance_arome_france_hd 2,6 nd (n 9) · meteofrance_arome_france 2,8 nd (n 9) · meteofrance_arpege_europe 3,6 nd (n 9)
