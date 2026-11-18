# Remise en question (③)

Généré le 2026-11-18 09:38 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 49 prévisions archivées sur 201 h ; 4605 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | icon_eu 1,8 · meteofrance_arome_france_hd 1,8 · meteofrance_arome_france 1,8 · icon_d2 2,0 · gfs_seamless 2,2 · meteofrance_arpege_europe 2,3 · ecmwf_ifs025 2,4 |
| LFMP | meteofrance_arpege_europe 1,8 · icon_eu 1,9 · meteofrance_arome_france_hd 2,1 · ecmwf_ifs025 2,2 · meteofrance_arome_france 2,2 · gfs_seamless 2,3 |
| LFTH | meteofrance_arome_france_hd 2,2 · meteofrance_arome_france 2,2 · icon_eu 2,3 · gfs_seamless 2,7 · ecmwf_ifs025 2,7 · meteofrance_arpege_europe 3,0 |
| LFML | meteofrance_arome_france 1,9 · meteofrance_arome_france_hd 2,0 · ecmwf_ifs025 2,2 · meteofrance_arpege_europe 2,6 · icon_eu 2,7 · gfs_seamless 3,0 |
| LFMI | meteofrance_arome_france 1,5 · meteofrance_arome_france_hd 1,6 · meteofrance_arpege_europe 2,1 · ecmwf_ifs025 2,1 · icon_eu 2,6 · gfs_seamless 2,7 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.18 · ewam 0.19 · ecmwf_wam025 0.26 · gwam 0.29 · ncep_gfswave025 0.87 |
| 03404 | ewam 0.12 · meteofrance_wave 0.13 · ncep_gfswave025 0.13 · ecmwf_wam025 0.15 · gwam 0.15 |
| 01101 | ncep_gfswave025 0.12 · meteofrance_wave 0.14 · ewam 0.14 · ecmwf_wam025 0.16 · gwam 0.16 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 15.69, ×0.93 (MAE 0.19 m, n 164) ; ecmwf_wam025 poids 8.25, ×0.85 (MAE 0.28 m, n 164) ; ewam poids 8.68, ×0.88 (MAE 0.27 m, n 164) ; gwam poids 3.24, ×0.81 (MAE 0.38 m, n 164) ; copernicus poids 17.42, ×0.87 (MAE 0.2 m, n 98)
  - 03404 : meteofrance_wave poids 14.05, ×1.09 (MAE 0.21 m, n 164) ; ecmwf_wam025 poids 12.34, ×0.99 (MAE 0.2 m, n 164) ; ewam poids 17.83, ×0.99 (MAE 0.13 m, n 164) ; gwam poids 9.71, ×0.96 (MAE 0.15 m, n 164) ; ncep_gfswave025 poids 8.66, ×1.06 (MAE 0.17 m, n 164) ; copernicus poids 23.89, ×0.94 (MAE 0.14 m, n 98)
  - 01102 : 
  - 01101 : meteofrance_wave poids 17.35, ×1.21 (MAE 0.17 m, n 164) ; ecmwf_wam025 poids 15.76, ×0.92 (MAE 0.15 m, n 164) ; ewam poids 15.7, ×1.02 (MAE 0.15 m, n 164) ; gwam poids 8.55, ×0.92 (MAE 0.17 m, n 164) ; ncep_gfswave025 poids 10.35, ×1 (MAE 0.13 m, n 164) ; copernicus poids 27.26, ×0.98 (MAE 0.11 m, n 98)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.98, Port Camargue × 1.01 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

49 prévisions archivées. Classement à 24 h :

- LFMT : icon_d2 1,3 nd (n 10) · icon_eu 1,4 nd (n 10) · meteofrance_arome_france_hd 1,5 nd (n 10) · meteofrance_arome_france 1,6 nd (n 10) · gfs_seamless 1,7 nd (n 10) · meteofrance_arpege_europe 2,2 nd (n 10) · ecmwf_ifs025 2,5 nd (n 10)
- LFMP : meteofrance_arome_france 2,3 nd (n 10) · ecmwf_ifs025 2,5 nd (n 10) · meteofrance_arome_france_hd 2,6 nd (n 10) · gfs_seamless 3,0 nd (n 10) · icon_eu 3,1 nd (n 10) · meteofrance_arpege_europe 3,3 nd (n 10)
- LFTH : icon_eu 2,1 nd (n 10) · ecmwf_ifs025 2,4 nd (n 10) · gfs_seamless 3,3 nd (n 10) · meteofrance_arome_france_hd 3,4 nd (n 10) · meteofrance_arome_france 3,5 nd (n 10) · meteofrance_arpege_europe 4,7 nd (n 10)
- LFML : meteofrance_arome_france_hd 1,8 nd (n 10) · meteofrance_arome_france 2,0 nd (n 10) · meteofrance_arpege_europe 2,2 nd (n 10) · ecmwf_ifs025 2,6 nd (n 10) · gfs_seamless 2,9 nd (n 10) · icon_eu 3,3 nd (n 10)
- LFMI : gfs_seamless 2,3 nd (n 10) · ecmwf_ifs025 2,4 nd (n 10) · icon_eu 2,4 nd (n 10) · meteofrance_arome_france_hd 2,5 nd (n 10) · meteofrance_arome_france 2,7 nd (n 10) · meteofrance_arpege_europe 3,2 nd (n 10)
