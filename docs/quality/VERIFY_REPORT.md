# Remise en question (③)

Généré le 2026-11-17 12:34 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 46 prévisions archivées sur 180 h ; 4420 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 1,3 · meteofrance_arome_france_hd 1,4 · icon_eu 1,9 · icon_d2 2,2 · ecmwf_ifs025 2,2 · meteofrance_arpege_europe 2,2 · gfs_seamless 2,3 |
| LFMP | ecmwf_ifs025 2,1 · icon_eu 2,1 · gfs_seamless 2,2 · meteofrance_arome_france_hd 2,2 · meteofrance_arome_france 2,3 · meteofrance_arpege_europe 2,4 |
| LFTH | meteofrance_arome_france_hd 1,9 · meteofrance_arome_france 1,9 · gfs_seamless 2,0 · icon_eu 2,3 · meteofrance_arpege_europe 2,6 · ecmwf_ifs025 2,7 |
| LFML | ecmwf_ifs025 1,9 · meteofrance_arome_france 2,0 · meteofrance_arome_france_hd 2,2 · icon_eu 2,4 · meteofrance_arpege_europe 3,1 · gfs_seamless 4,1 |
| LFMI | meteofrance_arome_france 1,5 · meteofrance_arome_france_hd 1,6 · ecmwf_ifs025 2,2 · icon_eu 2,4 · meteofrance_arpege_europe 2,4 · gfs_seamless 2,6 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.24 · ecmwf_wam025 0.29 · ewam 0.31 · gwam 0.41 · ncep_gfswave025 1.09 |
| 03404 | ewam 0.14 · gwam 0.16 · ncep_gfswave025 0.24 · ecmwf_wam025 0.25 · meteofrance_wave 0.27 |
| 01101 | ecmwf_wam025 0.16 · ewam 0.17 · gwam 0.18 · meteofrance_wave 0.19 · ncep_gfswave025 0.19 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 11.61, ×0.98 (MAE 0.25 m, n 170) ; ecmwf_wam025 poids 7.32, ×0.87 (MAE 0.31 m, n 170) ; ewam poids 8.38, ×0.88 (MAE 0.28 m, n 170) ; gwam poids 2.77, ×0.81 (MAE 0.42 m, n 170) ; copernicus poids 19.46, ×0.93 (MAE 0.18 m, n 116)
  - 03404 : meteofrance_wave poids 12.57, ×1.13 (MAE 0.24 m, n 170) ; ecmwf_wam025 poids 9.91, ×1.01 (MAE 0.25 m, n 170) ; ewam poids 17.1, ×1.01 (MAE 0.14 m, n 170) ; gwam poids 9.57, ×0.97 (MAE 0.15 m, n 170) ; ncep_gfswave025 poids 7.29, ×1.12 (MAE 0.21 m, n 170) ; copernicus poids 21.04, ×1 (MAE 0.16 m, n 116)
  - 01102 : 
  - 01101 : meteofrance_wave poids 16.27, ×1.22 (MAE 0.18 m, n 170) ; ecmwf_wam025 poids 16.5, ×0.93 (MAE 0.14 m, n 170) ; ewam poids 15.68, ×1.03 (MAE 0.15 m, n 170) ; gwam poids 8.69, ×0.96 (MAE 0.17 m, n 170) ; ncep_gfswave025 poids 7.95, ×1.09 (MAE 0.19 m, n 170) ; copernicus poids 30.33, ×0.99 (MAE 0.08 m, n 116)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.96, Port Camargue × 0.97 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

46 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arome_france 1,4 nd (n 11) · meteofrance_arome_france_hd 1,4 nd (n 11) · gfs_seamless 1,8 nd (n 11) · icon_eu 1,9 nd (n 11) · icon_d2 2,0 nd (n 11) · meteofrance_arpege_europe 2,1 nd (n 11) · ecmwf_ifs025 2,3 nd (n 11)
- LFMP : meteofrance_arome_france 2,0 nd (n 11) · meteofrance_arome_france_hd 2,4 nd (n 11) · icon_eu 3,2 nd (n 11) · gfs_seamless 3,2 nd (n 11) · ecmwf_ifs025 3,3 nd (n 11) · meteofrance_arpege_europe 3,6 nd (n 11)
- LFTH : gfs_seamless 2,1 nd (n 11) · icon_eu 2,3 nd (n 11) · meteofrance_arome_france_hd 2,3 nd (n 11) · meteofrance_arome_france 2,4 nd (n 11) · ecmwf_ifs025 2,4 nd (n 11) · meteofrance_arpege_europe 3,0 nd (n 11)
- LFML : meteofrance_arome_france 1,5 nd (n 11) · meteofrance_arome_france_hd 1,7 nd (n 11) · ecmwf_ifs025 1,8 nd (n 11) · icon_eu 2,4 nd (n 11) · meteofrance_arpege_europe 3,0 nd (n 11) · gfs_seamless 4,0 nd (n 11)
- LFMI : icon_eu 2,2 nd (n 11) · ecmwf_ifs025 2,8 nd (n 11) · meteofrance_arpege_europe 2,9 nd (n 11) · gfs_seamless 3,1 nd (n 11) · meteofrance_arome_france_hd 3,2 nd (n 11) · meteofrance_arome_france 3,3 nd (n 11)
