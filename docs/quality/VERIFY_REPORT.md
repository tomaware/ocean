# Remise en question (③)

Généré le 2026-11-21 06:39 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 70 prévisions archivées sur 270 h ; 5929 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 4 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 2,4 · meteofrance_arpege_europe 2,5 · meteofrance_arome_france_hd 2,5 · icon_d2 3,0 · ecmwf_ifs025 3,1 · icon_eu 3,1 · gfs_seamless 3,2 |
| LFMP | icon_eu 1,9 · ecmwf_ifs025 2,1 · meteofrance_arome_france 2,1 · meteofrance_arome_france_hd 2,3 · gfs_seamless 2,7 · meteofrance_arpege_europe 3,0 |
| LFTH | meteofrance_arome_france_hd 2,4 · meteofrance_arome_france 2,4 · ecmwf_ifs025 3,1 · meteofrance_arpege_europe 3,1 · icon_eu 3,2 · gfs_seamless 3,9 |
| LFML | meteofrance_arome_france_hd 2,4 · meteofrance_arome_france 2,5 · meteofrance_arpege_europe 2,6 · gfs_seamless 3,1 · icon_eu 4,0 · ecmwf_ifs025 4,8 |
| LFMI | meteofrance_arome_france 2,2 · meteofrance_arome_france_hd 2,2 · gfs_seamless 2,4 · ecmwf_ifs025 2,7 · meteofrance_arpege_europe 2,7 · icon_eu 3,2 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.15 · meteofrance_wave 0.22 · gwam 0.38 · ecmwf_wam025 0.42 · ncep_gfswave025 1.02 |
| 03404 | ewam 0.13 · meteofrance_wave 0.18 · gwam 0.30 · ncep_gfswave025 0.31 · ecmwf_wam025 0.38 |
| 01101 | meteofrance_wave 0.10 · ewam 0.15 · ecmwf_wam025 0.37 · ncep_gfswave025 0.38 · gwam 0.48 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 12.9, ×0.88 (MAE 0.23 m, n 122) ; ecmwf_wam025 poids 4.85, ×0.8 (MAE 0.41 m, n 122) ; ewam poids 16.14, ×0.92 (MAE 0.15 m, n 122) ; gwam poids 3.46, ×0.81 (MAE 0.36 m, n 122) ; copernicus poids 14.73, ×0.92 (MAE 0.23 m, n 68)
  - 03404 : meteofrance_wave poids 17.66, ×0.88 (MAE 0.17 m, n 122) ; ecmwf_wam025 poids 6.36, ×0.8 (MAE 0.34 m, n 122) ; ewam poids 18.62, ×0.94 (MAE 0.12 m, n 122) ; gwam poids 5.28, ×0.82 (MAE 0.27 m, n 122) ; ncep_gfswave025 poids 5.1, ×0.84 (MAE 0.28 m, n 122) ; copernicus poids 22.05, ×0.92 (MAE 0.15 m, n 68)
  - 01102 : 
  - 01101 : meteofrance_wave poids 24.64, ×1.1 (MAE 0.09 m, n 92) ; ecmwf_wam025 poids 6.87, ×0.84 (MAE 0.32 m, n 92) ; ewam poids 16.41, ×0.96 (MAE 0.14 m, n 92) ; gwam poids 2.89, ×0.8 (MAE 0.41 m, n 92) ; ncep_gfswave025 poids 4.52, ×0.87 (MAE 0.3 m, n 92) ; copernicus poids 31.38, ×0.98 (MAE 0.07 m, n 51)
- Vent downwind : La Grande-Motte × 1.07, Port Camargue × 1.12 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

70 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 2,7 nd (n 13) · meteofrance_arome_france 2,8 nd (n 13) · meteofrance_arome_france_hd 2,9 nd (n 13) · ecmwf_ifs025 3,3 nd (n 13) · gfs_seamless 3,5 nd (n 13) · icon_d2 3,6 nd (n 13) · icon_eu 3,8 nd (n 13)
- LFMP : ecmwf_ifs025 1,6 nd (n 13) · meteofrance_arome_france 1,7 nd (n 13) · meteofrance_arome_france_hd 1,9 nd (n 13) · icon_eu 2,0 nd (n 13) · gfs_seamless 2,7 nd (n 13) · meteofrance_arpege_europe 2,9 nd (n 13)
- LFTH : meteofrance_arpege_europe 2,5 nd (n 13) · meteofrance_arome_france_hd 2,7 nd (n 13) · meteofrance_arome_france 2,7 nd (n 13) · ecmwf_ifs025 2,8 nd (n 13) · icon_eu 3,3 nd (n 13) · gfs_seamless 5,1 nd (n 13)
- LFML : meteofrance_arpege_europe 2,6 nd (n 13) · meteofrance_arome_france_hd 3,0 nd (n 13) · meteofrance_arome_france 3,0 nd (n 13) · gfs_seamless 3,6 nd (n 13) · icon_eu 3,8 nd (n 13) · ecmwf_ifs025 4,8 nd (n 13)
- LFMI : meteofrance_arome_france_hd 2,4 nd (n 13) · gfs_seamless 2,4 nd (n 13) · meteofrance_arome_france 2,6 nd (n 13) · meteofrance_arpege_europe 2,7 nd (n 13) · ecmwf_ifs025 3,4 nd (n 13) · icon_eu 3,7 nd (n 13)
