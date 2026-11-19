# Remise en question (③)

Généré le 2026-11-19 19:44 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 60 prévisions archivées sur 234 h ; 5247 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france_hd 2,5 · meteofrance_arpege_europe 2,5 · meteofrance_arome_france 2,6 · icon_d2 2,6 · gfs_seamless 2,6 · icon_eu 2,7 · ecmwf_ifs025 3,6 |
| LFMP | meteofrance_arome_france_hd 3,1 · meteofrance_arome_france 3,1 · icon_eu 3,3 · meteofrance_arpege_europe 3,8 · gfs_seamless 4,0 · ecmwf_ifs025 4,4 |
| LFTH | meteofrance_arpege_europe 2,4 · meteofrance_arome_france_hd 2,6 · meteofrance_arome_france 2,6 · gfs_seamless 3,4 · icon_eu 3,5 · ecmwf_ifs025 3,8 |
| LFML | meteofrance_arome_france_hd 2,4 · meteofrance_arome_france 2,4 · meteofrance_arpege_europe 2,8 · icon_eu 3,3 · ecmwf_ifs025 3,7 · gfs_seamless 4,7 |
| LFMI | meteofrance_arpege_europe 2,3 · meteofrance_arome_france_hd 2,6 · meteofrance_arome_france 2,6 · gfs_seamless 3,2 · ecmwf_ifs025 3,6 · icon_eu 3,8 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.17 · meteofrance_wave 0.19 · ecmwf_wam025 0.31 · gwam 0.36 · ncep_gfswave025 0.92 |
| 03404 | ewam 0.14 · meteofrance_wave 0.18 · ncep_gfswave025 0.22 · ecmwf_wam025 0.25 · gwam 0.25 |
| 01101 | meteofrance_wave 0.17 · ewam 0.17 · ncep_gfswave025 0.20 · ecmwf_wam025 0.22 · gwam 0.30 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 15.42, ×0.87 (MAE 0.19 m, n 184) ; ecmwf_wam025 poids 7.42, ×0.8 (MAE 0.31 m, n 184) ; ewam poids 14.92, ×0.89 (MAE 0.16 m, n 184) ; gwam poids 3.8, ×0.8 (MAE 0.34 m, n 184) ; copernicus poids 11.75, ×0.86 (MAE 0.28 m, n 100)
  - 03404 : meteofrance_wave poids 17.5, ×0.91 (MAE 0.17 m, n 184) ; ecmwf_wam025 poids 10.45, ×0.82 (MAE 0.24 m, n 184) ; ewam poids 18.67, ×0.93 (MAE 0.12 m, n 184) ; gwam poids 6.62, ×0.83 (MAE 0.22 m, n 184) ; ncep_gfswave025 poids 8.04, ×0.88 (MAE 0.19 m, n 184) ; copernicus poids 12.55, ×0.85 (MAE 0.27 m, n 100)
  - 01102 : 
  - 01101 : meteofrance_wave poids 19.23, ×1.25 (MAE 0.15 m, n 159) ; ecmwf_wam025 poids 12.09, ×0.84 (MAE 0.21 m, n 159) ; ewam poids 16.37, ×1.04 (MAE 0.15 m, n 159) ; gwam poids 5.04, ×0.81 (MAE 0.28 m, n 159) ; ncep_gfswave025 poids 7.73, ×0.89 (MAE 0.19 m, n 159) ; copernicus poids 25.72, ×0.98 (MAE 0.12 m, n 75)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.97, Port Camargue × 1.18 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

60 prévisions archivées. Classement à 24 h :

- LFMT : gfs_seamless 1,6 nd (n 9) · icon_d2 2,8 nd (n 9) · icon_eu 3,1 nd (n 9) · meteofrance_arome_france 3,4 nd (n 9) · meteofrance_arome_france_hd 3,5 nd (n 9) · meteofrance_arpege_europe 3,9 nd (n 9) · ecmwf_ifs025 4,6 nd (n 9)
- LFMP : meteofrance_arome_france_hd 2,6 nd (n 9) · meteofrance_arome_france 2,7 nd (n 9) · ecmwf_ifs025 3,9 nd (n 9) · icon_eu 4,2 nd (n 9) · meteofrance_arpege_europe 4,2 nd (n 9) · gfs_seamless 4,4 nd (n 9)
- LFTH : meteofrance_arpege_europe 1,5 nd (n 9) · meteofrance_arome_france_hd 1,8 nd (n 9) · meteofrance_arome_france 1,8 nd (n 9) · gfs_seamless 3,0 nd (n 9) · ecmwf_ifs025 3,8 nd (n 9) · icon_eu 4,1 nd (n 9)
- LFML : meteofrance_arome_france_hd 2,3 nd (n 9) · meteofrance_arome_france 2,4 nd (n 9) · meteofrance_arpege_europe 2,4 nd (n 9) · icon_eu 2,9 nd (n 9) · gfs_seamless 3,8 nd (n 9) · ecmwf_ifs025 4,2 nd (n 9)
- LFMI : ecmwf_ifs025 2,6 nd (n 9) · meteofrance_arome_france 2,7 nd (n 9) · gfs_seamless 2,7 nd (n 9) · meteofrance_arome_france_hd 2,7 nd (n 9) · meteofrance_arpege_europe 2,7 nd (n 9) · icon_eu 3,1 nd (n 9)
