# Remise en question (③)

Généré le 2026-11-20 03:32 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 63 prévisions archivées sur 243 h ; 5649 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france_hd 2,4 · meteofrance_arome_france 2,4 · meteofrance_arpege_europe 2,7 · gfs_seamless 2,9 · icon_d2 2,9 · icon_eu 3,0 · ecmwf_ifs025 3,6 |
| LFMP | meteofrance_arome_france_hd 2,9 · meteofrance_arome_france 2,9 · icon_eu 2,9 · meteofrance_arpege_europe 3,1 · gfs_seamless 3,2 · ecmwf_ifs025 4,2 |
| LFTH | meteofrance_arome_france_hd 2,5 · meteofrance_arome_france 2,5 · meteofrance_arpege_europe 2,7 · ecmwf_ifs025 3,7 · icon_eu 3,7 · gfs_seamless 3,9 |
| LFML | meteofrance_arome_france_hd 2,3 · meteofrance_arome_france 2,5 · meteofrance_arpege_europe 3,0 · icon_eu 3,8 · gfs_seamless 4,3 · ecmwf_ifs025 4,4 |
| LFMI | meteofrance_arpege_europe 2,6 · meteofrance_arome_france_hd 2,6 · meteofrance_arome_france 2,6 · gfs_seamless 3,3 · ecmwf_ifs025 3,7 · icon_eu 4,1 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.18 · ewam 0.18 · ecmwf_wam025 0.35 · gwam 0.39 · ncep_gfswave025 0.96 |
| 03404 | meteofrance_wave 0.13 · ewam 0.14 · ncep_gfswave025 0.24 · ecmwf_wam025 0.27 · gwam 0.27 |
| 01101 | meteofrance_wave 0.14 · ewam 0.16 · ncep_gfswave025 0.23 · ecmwf_wam025 0.26 · gwam 0.34 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 16.66, ×0.9 (MAE 0.18 m, n 151) ; ecmwf_wam025 poids 6.41, ×0.8 (MAE 0.34 m, n 151) ; ewam poids 13.74, ×0.88 (MAE 0.18 m, n 151) ; gwam poids 3.23, ×0.8 (MAE 0.38 m, n 151) ; copernicus poids 10.97, ×0.84 (MAE 0.3 m, n 109)
  - 03404 : meteofrance_wave poids 20.63, ×0.94 (MAE 0.13 m, n 151) ; ecmwf_wam025 poids 9.21, ×0.82 (MAE 0.26 m, n 151) ; ewam poids 17.09, ×0.91 (MAE 0.14 m, n 151) ; gwam poids 5.51, ×0.82 (MAE 0.26 m, n 151) ; ncep_gfswave025 poids 6.56, ×0.86 (MAE 0.23 m, n 151) ; copernicus poids 12.43, ×0.83 (MAE 0.27 m, n 109)
  - 01102 : 
  - 01101 : meteofrance_wave poids 19.67, ×1.25 (MAE 0.14 m, n 126) ; ecmwf_wam025 poids 10.27, ×0.84 (MAE 0.24 m, n 126) ; ewam poids 15.8, ×1.05 (MAE 0.15 m, n 126) ; gwam poids 4.36, ×0.81 (MAE 0.31 m, n 126) ; ncep_gfswave025 poids 6.94, ×0.91 (MAE 0.22 m, n 126) ; copernicus poids 25.06, ×0.97 (MAE 0.13 m, n 84)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.96, Port Camargue × 1.05 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

63 prévisions archivées. Classement à 24 h :

- LFMT : gfs_seamless 2,3 nd (n 10) · meteofrance_arome_france 3,1 nd (n 10) · meteofrance_arome_france_hd 3,2 nd (n 10) · meteofrance_arpege_europe 3,4 nd (n 10) · icon_d2 4,0 nd (n 10) · icon_eu 4,1 nd (n 10) · ecmwf_ifs025 4,7 nd (n 10)
- LFMP : meteofrance_arome_france_hd 2,6 nd (n 10) · meteofrance_arome_france 2,7 nd (n 10) · gfs_seamless 3,2 nd (n 10) · meteofrance_arpege_europe 3,3 nd (n 10) · ecmwf_ifs025 3,4 nd (n 10) · icon_eu 3,4 nd (n 10)
- LFTH : meteofrance_arome_france_hd 2,2 nd (n 10) · meteofrance_arome_france 2,2 nd (n 10) · meteofrance_arpege_europe 2,4 nd (n 10) · ecmwf_ifs025 3,1 nd (n 10) · icon_eu 3,8 nd (n 10) · gfs_seamless 4,9 nd (n 10)
- LFML : meteofrance_arome_france 2,5 nd (n 10) · meteofrance_arpege_europe 2,6 nd (n 10) · meteofrance_arome_france_hd 2,7 nd (n 10) · icon_eu 2,9 nd (n 10) · ecmwf_ifs025 3,9 nd (n 10) · gfs_seamless 4,4 nd (n 10)
- LFMI : ecmwf_ifs025 2,4 nd (n 10) · meteofrance_arome_france_hd 3,0 nd (n 10) · meteofrance_arome_france 3,1 nd (n 10) · icon_eu 3,2 nd (n 10) · meteofrance_arpege_europe 3,3 nd (n 10) · gfs_seamless 3,6 nd (n 10)
