# Remise en question (③)

Généré le 2026-11-17 19:43 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 46 prévisions archivées sur 180 h ; 4261 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france_hd 1,7 · meteofrance_arome_france 1,7 · icon_eu 1,9 · icon_d2 2,2 · gfs_seamless 2,2 · ecmwf_ifs025 2,3 · meteofrance_arpege_europe 2,5 |
| LFMP | meteofrance_arome_france_hd 1,7 · meteofrance_arpege_europe 1,7 · meteofrance_arome_france 1,7 · icon_eu 1,8 · ecmwf_ifs025 1,8 · gfs_seamless 1,9 |
| LFTH | meteofrance_arome_france_hd 2,0 · meteofrance_arome_france 2,0 · gfs_seamless 2,5 · icon_eu 2,6 · meteofrance_arpege_europe 2,7 · ecmwf_ifs025 3,2 |
| LFML | meteofrance_arome_france 2,2 · meteofrance_arome_france_hd 2,2 · ecmwf_ifs025 2,2 · icon_eu 2,7 · meteofrance_arpege_europe 3,3 · gfs_seamless 3,9 |
| LFMI | meteofrance_arome_france 1,6 · meteofrance_arome_france_hd 1,7 · gfs_seamless 2,2 · ecmwf_ifs025 2,4 · meteofrance_arpege_europe 2,4 · icon_eu 2,5 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.22 · ecmwf_wam025 0.28 · ewam 0.32 · gwam 0.41 · ncep_gfswave025 1.11 |
| 03404 | ewam 0.14 · gwam 0.16 · ncep_gfswave025 0.22 · ecmwf_wam025 0.25 · meteofrance_wave 0.27 |
| 01101 | ecmwf_wam025 0.16 · ewam 0.17 · ncep_gfswave025 0.18 · meteofrance_wave 0.19 · gwam 0.19 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 11.99, ×0.97 (MAE 0.25 m, n 184) ; ecmwf_wam025 poids 7.47, ×0.87 (MAE 0.31 m, n 184) ; ewam poids 8.29, ×0.87 (MAE 0.28 m, n 184) ; gwam poids 2.74, ×0.8 (MAE 0.42 m, n 184) ; copernicus poids 19.28, ×0.93 (MAE 0.18 m, n 100)
  - 03404 : meteofrance_wave poids 13.23, ×1.12 (MAE 0.23 m, n 184) ; ecmwf_wam025 poids 10.61, ×1.01 (MAE 0.23 m, n 184) ; ewam poids 16.89, ×1 (MAE 0.14 m, n 184) ; gwam poids 9.41, ×0.96 (MAE 0.15 m, n 184) ; ncep_gfswave025 poids 7.56, ×1.11 (MAE 0.2 m, n 184) ; copernicus poids 22.52, ×0.98 (MAE 0.15 m, n 100)
  - 01102 : 
  - 01101 : meteofrance_wave poids 16.3, ×1.23 (MAE 0.18 m, n 184) ; ecmwf_wam025 poids 16.31, ×0.93 (MAE 0.15 m, n 184) ; ewam poids 15.96, ×1.03 (MAE 0.15 m, n 184) ; gwam poids 8.58, ×0.95 (MAE 0.17 m, n 184) ; ncep_gfswave025 poids 8.02, ×1.09 (MAE 0.19 m, n 184) ; copernicus poids 28.02, ×1.05 (MAE 0.1 m, n 100)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.02, Port Camargue × 1.03 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

46 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arome_france 1,6 nd (n 9) · gfs_seamless 1,6 nd (n 9) · meteofrance_arome_france_hd 1,7 nd (n 9) · icon_d2 2,0 nd (n 9) · icon_eu 2,1 nd (n 9) · meteofrance_arpege_europe 2,3 nd (n 9) · ecmwf_ifs025 2,6 nd (n 9)
- LFMP : meteofrance_arome_france 2,1 nd (n 9) · ecmwf_ifs025 2,2 nd (n 9) · icon_eu 2,3 nd (n 9) · gfs_seamless 2,4 nd (n 9) · meteofrance_arome_france_hd 2,7 nd (n 9) · meteofrance_arpege_europe 3,0 nd (n 9)
- LFTH : icon_eu 2,3 nd (n 9) · gfs_seamless 2,5 nd (n 9) · meteofrance_arome_france_hd 2,6 nd (n 9) · meteofrance_arome_france 2,7 nd (n 9) · ecmwf_ifs025 2,8 nd (n 9) · meteofrance_arpege_europe 3,4 nd (n 9)
- LFML : meteofrance_arome_france 1,4 nd (n 9) · meteofrance_arome_france_hd 1,7 nd (n 9) · ecmwf_ifs025 2,0 nd (n 9) · icon_eu 2,5 nd (n 9) · meteofrance_arpege_europe 3,1 nd (n 9) · gfs_seamless 4,1 nd (n 9)
- LFMI : icon_eu 2,3 nd (n 9) · ecmwf_ifs025 2,7 nd (n 9) · meteofrance_arome_france_hd 2,8 nd (n 9) · meteofrance_arome_france 3,0 nd (n 9) · gfs_seamless 3,1 nd (n 9) · meteofrance_arpege_europe 3,2 nd (n 9)
