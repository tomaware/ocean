# Remise en question (③)

Généré le 2026-11-19 23:25 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 61 prévisions archivées sur 237 h ; 5435 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france_hd 2,5 · meteofrance_arome_france 2,6 · meteofrance_arpege_europe 2,7 · gfs_seamless 2,8 · icon_d2 2,9 · icon_eu 3,1 · ecmwf_ifs025 3,7 |
| LFMP | meteofrance_arome_france_hd 3,1 · meteofrance_arome_france 3,1 · icon_eu 3,3 · meteofrance_arpege_europe 3,5 · gfs_seamless 4,1 · ecmwf_ifs025 4,6 |
| LFTH | meteofrance_arome_france_hd 2,4 · meteofrance_arome_france 2,5 · meteofrance_arpege_europe 2,6 · icon_eu 3,6 · gfs_seamless 3,7 · ecmwf_ifs025 3,7 |
| LFML | meteofrance_arome_france_hd 2,5 · meteofrance_arome_france 2,6 · meteofrance_arpege_europe 3,0 · icon_eu 3,5 · ecmwf_ifs025 4,2 · gfs_seamless 5,0 |
| LFMI | meteofrance_arpege_europe 2,7 · meteofrance_arome_france_hd 2,7 · meteofrance_arome_france 2,7 · gfs_seamless 3,6 · ecmwf_ifs025 3,8 · icon_eu 3,8 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.17 · meteofrance_wave 0.20 · ecmwf_wam025 0.32 · gwam 0.37 · ncep_gfswave025 0.94 |
| 03404 | ewam 0.13 · meteofrance_wave 0.18 · ncep_gfswave025 0.23 · ecmwf_wam025 0.25 · gwam 0.26 |
| 01101 | meteofrance_wave 0.15 · ewam 0.16 · ncep_gfswave025 0.21 · ecmwf_wam025 0.24 · gwam 0.32 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 15.26, ×0.87 (MAE 0.2 m, n 192) ; ecmwf_wam025 poids 7.4, ×0.8 (MAE 0.31 m, n 192) ; ewam poids 15.21, ×0.89 (MAE 0.16 m, n 192) ; gwam poids 3.77, ×0.8 (MAE 0.35 m, n 192) ; copernicus poids 11.27, ×0.85 (MAE 0.29 m, n 102)
  - 03404 : meteofrance_wave poids 17.29, ×0.91 (MAE 0.17 m, n 192) ; ecmwf_wam025 poids 10.63, ×0.82 (MAE 0.23 m, n 192) ; ewam poids 18.83, ×0.93 (MAE 0.11 m, n 192) ; gwam poids 6.46, ×0.82 (MAE 0.23 m, n 192) ; ncep_gfswave025 poids 7.73, ×0.87 (MAE 0.19 m, n 192) ; copernicus poids 12.32, ×0.83 (MAE 0.27 m, n 102)
  - 01102 : 
  - 01101 : meteofrance_wave poids 19.73, ×1.25 (MAE 0.14 m, n 167) ; ecmwf_wam025 poids 11.71, ×0.84 (MAE 0.21 m, n 167) ; ewam poids 16.52, ×1.04 (MAE 0.14 m, n 167) ; gwam poids 4.94, ×0.81 (MAE 0.29 m, n 167) ; ncep_gfswave025 poids 7.45, ×0.89 (MAE 0.2 m, n 167) ; copernicus poids 25.74, ×0.97 (MAE 0.12 m, n 77)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1, Port Camargue × 1.14 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

61 prévisions archivées. Classement à 24 h :

- LFMT : gfs_seamless 2,1 nd (n 9) · meteofrance_arome_france 3,3 nd (n 9) · meteofrance_arome_france_hd 3,5 nd (n 9) · icon_d2 3,7 nd (n 9) · icon_eu 3,9 nd (n 9) · meteofrance_arpege_europe 4,0 nd (n 9) · ecmwf_ifs025 4,8 nd (n 9)
- LFMP : meteofrance_arome_france_hd 2,6 nd (n 9) · meteofrance_arome_france 2,8 nd (n 9) · ecmwf_ifs025 3,9 nd (n 9) · meteofrance_arpege_europe 4,3 nd (n 9) · icon_eu 4,4 nd (n 9) · gfs_seamless 4,5 nd (n 9)
- LFTH : meteofrance_arpege_europe 1,9 nd (n 9) · meteofrance_arome_france_hd 2,0 nd (n 9) · meteofrance_arome_france 2,0 nd (n 9) · ecmwf_ifs025 3,4 nd (n 9) · gfs_seamless 3,9 nd (n 9) · icon_eu 4,0 nd (n 9)
- LFML : meteofrance_arome_france 2,4 nd (n 9) · meteofrance_arome_france_hd 2,5 nd (n 9) · meteofrance_arpege_europe 2,8 nd (n 9) · icon_eu 3,1 nd (n 9) · gfs_seamless 4,0 nd (n 9) · ecmwf_ifs025 4,4 nd (n 9)
- LFMI : meteofrance_arome_france_hd 2,9 nd (n 9) · meteofrance_arome_france 2,9 nd (n 9) · ecmwf_ifs025 3,1 nd (n 9) · icon_eu 3,2 nd (n 9) · meteofrance_arpege_europe 3,3 nd (n 9) · gfs_seamless 3,4 nd (n 9)
