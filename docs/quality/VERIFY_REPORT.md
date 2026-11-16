# Remise en question (③)

Généré le 2026-11-16 05:55 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 39 prévisions archivées sur 147 h ; 3967 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 2,8 · meteofrance_arome_france_hd 2,9 · meteofrance_arpege_europe 3,1 · icon_eu 3,2 · icon_d2 3,4 · ecmwf_ifs025 4,0 · gfs_seamless 4,5 |
| LFMP | ecmwf_ifs025 1,9 · gfs_seamless 1,9 · icon_eu 2,0 · meteofrance_arome_france_hd 2,1 · meteofrance_arome_france 2,1 · meteofrance_arpege_europe 2,5 |
| LFTH | ecmwf_ifs025 2,1 · icon_eu 2,7 · gfs_seamless 3,6 · meteofrance_arome_france_hd 3,6 · meteofrance_arpege_europe 3,6 · meteofrance_arome_france 3,7 |
| LFML | meteofrance_arome_france 2,3 · ecmwf_ifs025 2,4 · meteofrance_arome_france_hd 2,6 · icon_eu 2,6 · meteofrance_arpege_europe 3,2 · gfs_seamless 5,7 |
| LFMI | meteofrance_arome_france_hd 2,4 · meteofrance_arome_france 2,4 · ecmwf_ifs025 2,4 · meteofrance_arpege_europe 2,8 · icon_eu 3,1 · gfs_seamless 4,3 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.31 · meteofrance_wave 0.33 · ecmwf_wam025 0.39 · gwam 0.52 · ncep_gfswave025 1.12 |
| 03404 | ewam 0.15 · gwam 0.17 · ncep_gfswave025 0.23 · meteofrance_wave 0.27 · ecmwf_wam025 0.28 |
| 01101 | meteofrance_wave 0.16 · ewam 0.17 · ecmwf_wam025 0.22 · ncep_gfswave025 0.22 · gwam 0.23 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 9.17, ×0.96 (MAE 0.3 m, n 155) ; ecmwf_wam025 poids 5.51, ×0.86 (MAE 0.38 m, n 155) ; ewam poids 7.92, ×0.89 (MAE 0.29 m, n 155) ; gwam poids 1.98, ×0.8 (MAE 0.51 m, n 155) ; copernicus poids 11.05, ×0.97 (MAE 0.29 m, n 113)
  - 03404 : meteofrance_wave poids 11.09, ×1.08 (MAE 0.26 m, n 155) ; ecmwf_wam025 poids 7.68, ×0.97 (MAE 0.3 m, n 155) ; ewam poids 14.07, ×1 (MAE 0.18 m, n 155) ; gwam poids 6.97, ×0.92 (MAE 0.21 m, n 155) ; ncep_gfswave025 poids 6.36, ×1.09 (MAE 0.23 m, n 155) ; copernicus poids 18.41, ×1.06 (MAE 0.19 m, n 113)
  - 01102 : 
  - 01101 : meteofrance_wave poids 19.15, ×1.12 (MAE 0.15 m, n 155) ; ecmwf_wam025 poids 9.5, ×0.85 (MAE 0.26 m, n 155) ; ewam poids 14.55, ×0.97 (MAE 0.17 m, n 155) ; gwam poids 4.83, ×0.85 (MAE 0.29 m, n 155) ; ncep_gfswave025 poids 6.23, ×1 (MAE 0.24 m, n 155) ; copernicus poids 24.05, ×0.97 (MAE 0.13 m, n 113)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.96, Port Camargue × 0.97 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

39 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arome_france 2,7 nd (n 12) · meteofrance_arpege_europe 3,2 nd (n 12) · icon_d2 3,3 nd (n 12) · meteofrance_arome_france_hd 3,3 nd (n 12) · icon_eu 3,8 nd (n 12) · gfs_seamless 3,8 nd (n 12) · ecmwf_ifs025 4,5 nd (n 12)
- LFMP : meteofrance_arome_france 1,6 nd (n 12) · meteofrance_arome_france_hd 1,7 nd (n 12) · icon_eu 2,3 nd (n 12) · gfs_seamless 2,4 nd (n 12) · meteofrance_arpege_europe 2,4 nd (n 12) · ecmwf_ifs025 2,5 nd (n 12)
- LFTH : ecmwf_ifs025 2,5 nd (n 12) · icon_eu 2,6 nd (n 12) · gfs_seamless 3,1 nd (n 12) · meteofrance_arpege_europe 3,3 nd (n 12) · meteofrance_arome_france_hd 4,1 nd (n 12) · meteofrance_arome_france 4,1 nd (n 12)
- LFML : meteofrance_arpege_europe 2,8 nd (n 12) · icon_eu 2,9 nd (n 12) · ecmwf_ifs025 2,9 nd (n 12) · meteofrance_arome_france 2,9 nd (n 12) · meteofrance_arome_france_hd 3,1 nd (n 12) · gfs_seamless 5,8 nd (n 12)
- LFMI : meteofrance_arpege_europe 2,3 nd (n 5) · icon_eu 2,4 nd (n 5) · meteofrance_arome_france 2,6 nd (n 5) · meteofrance_arome_france_hd 2,6 nd (n 5) · ecmwf_ifs025 3,1 nd (n 5) · gfs_seamless 3,8 nd (n 5)
