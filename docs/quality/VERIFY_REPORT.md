# Remise en question (③)

Généré le 2026-11-19 09:40 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 57 prévisions archivées sur 225 h ; 5080 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 2,2 · meteofrance_arome_france_hd 2,2 · icon_eu 2,4 · icon_d2 2,4 · gfs_seamless 2,6 · meteofrance_arpege_europe 2,7 · ecmwf_ifs025 2,7 |
| LFMP | meteofrance_arome_france 2,3 · meteofrance_arome_france_hd 2,4 · icon_eu 2,4 · meteofrance_arpege_europe 2,7 · gfs_seamless 3,1 · ecmwf_ifs025 3,3 |
| LFTH | meteofrance_arpege_europe 2,5 · meteofrance_arome_france_hd 2,8 · meteofrance_arome_france 2,8 · gfs_seamless 3,0 · ecmwf_ifs025 3,1 · icon_eu 3,2 |
| LFML | meteofrance_arome_france 2,5 · meteofrance_arome_france_hd 2,6 · ecmwf_ifs025 2,6 · icon_eu 2,6 · meteofrance_arpege_europe 3,3 · gfs_seamless 4,6 |
| LFMI | meteofrance_arpege_europe 2,2 · meteofrance_arome_france 2,2 · meteofrance_arome_france_hd 2,2 · ecmwf_ifs025 2,8 · icon_eu 2,9 · gfs_seamless 3,0 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.15 · meteofrance_wave 0.18 · ecmwf_wam025 0.29 · gwam 0.32 · ncep_gfswave025 0.80 |
| 03404 | ewam 0.11 · meteofrance_wave 0.14 · ncep_gfswave025 0.14 · ecmwf_wam025 0.18 · gwam 0.18 |
| 01101 | ncep_gfswave025 0.10 · ecmwf_wam025 0.13 · ewam 0.14 · gwam 0.16 · meteofrance_wave 0.17 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 16.14, ×0.87 (MAE 0.19 m, n 164) ; ecmwf_wam025 poids 7.97, ×0.8 (MAE 0.29 m, n 164) ; ewam poids 15.75, ×0.89 (MAE 0.15 m, n 164) ; gwam poids 4.2, ×0.8 (MAE 0.32 m, n 164) ; copernicus poids 15.07, ×0.87 (MAE 0.23 m, n 98)
  - 03404 : meteofrance_wave poids 19.84, ×0.95 (MAE 0.14 m, n 164) ; ecmwf_wam025 poids 13.07, ×0.86 (MAE 0.19 m, n 164) ; ewam poids 19.65, ×0.95 (MAE 0.1 m, n 164) ; gwam poids 8.16, ×0.86 (MAE 0.18 m, n 164) ; ncep_gfswave025 poids 10.39, ×0.93 (MAE 0.13 m, n 164) ; copernicus poids 19.11, ×0.9 (MAE 0.18 m, n 98)
  - 01102 : 
  - 01101 : meteofrance_wave poids 18.23, ×1.25 (MAE 0.16 m, n 139) ; ecmwf_wam025 poids 15.59, ×0.9 (MAE 0.16 m, n 139) ; ewam poids 17.15, ×1.1 (MAE 0.14 m, n 139) ; gwam poids 7.67, ×0.9 (MAE 0.2 m, n 139) ; ncep_gfswave025 poids 10.33, ×0.98 (MAE 0.13 m, n 139) ; copernicus poids 27.83, ×1 (MAE 0.1 m, n 73)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.89, Port Camargue × 0.97 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

57 prévisions archivées. Classement à 24 h :

- LFMT : icon_d2 1,5 nd (n 9) · icon_eu 1,6 nd (n 9) · gfs_seamless 1,7 nd (n 9) · meteofrance_arome_france_hd 2,3 nd (n 9) · meteofrance_arome_france 2,6 nd (n 9) · ecmwf_ifs025 3,0 nd (n 9) · meteofrance_arpege_europe 3,3 nd (n 9)
- LFMP : meteofrance_arome_france_hd 1,9 nd (n 9) · meteofrance_arome_france 2,2 nd (n 9) · meteofrance_arpege_europe 3,0 nd (n 9) · ecmwf_ifs025 3,3 nd (n 9) · gfs_seamless 3,3 nd (n 9) · icon_eu 3,4 nd (n 9)
- LFTH : meteofrance_arome_france_hd 3,2 nd (n 9) · meteofrance_arome_france 3,2 nd (n 9) · ecmwf_ifs025 3,4 nd (n 9) · icon_eu 3,6 nd (n 9) · meteofrance_arpege_europe 3,6 nd (n 9) · gfs_seamless 4,0 nd (n 9)
- LFML : meteofrance_arome_france_hd 2,5 nd (n 9) · meteofrance_arome_france 2,6 nd (n 9) · meteofrance_arpege_europe 3,2 nd (n 9) · ecmwf_ifs025 3,2 nd (n 9) · icon_eu 3,4 nd (n 9) · gfs_seamless 4,3 nd (n 9)
- LFMI : meteofrance_arome_france_hd 2,1 nd (n 9) · meteofrance_arome_france 2,2 nd (n 9) · gfs_seamless 2,4 nd (n 9) · ecmwf_ifs025 2,5 nd (n 9) · icon_eu 2,6 nd (n 9) · meteofrance_arpege_europe 2,9 nd (n 9)
