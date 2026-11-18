# Remise en question (③)

Généré le 2026-11-18 10:40 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 49 prévisions archivées sur 201 h ; 4554 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france_hd 1,8 · icon_eu 1,8 · meteofrance_arome_france 1,8 · icon_d2 2,1 · gfs_seamless 2,3 · meteofrance_arpege_europe 2,3 · ecmwf_ifs025 2,4 |
| LFMP | icon_eu 2,1 · meteofrance_arpege_europe 2,2 · meteofrance_arome_france_hd 2,2 · meteofrance_arome_france 2,2 · ecmwf_ifs025 2,3 · gfs_seamless 2,6 |
| LFTH | meteofrance_arome_france_hd 2,3 · meteofrance_arome_france 2,3 · icon_eu 2,5 · gfs_seamless 2,7 · ecmwf_ifs025 2,8 · meteofrance_arpege_europe 2,9 |
| LFML | meteofrance_arome_france 2,1 · meteofrance_arome_france_hd 2,1 · ecmwf_ifs025 2,2 · meteofrance_arpege_europe 2,6 · icon_eu 2,7 · gfs_seamless 3,3 |
| LFMI | meteofrance_arome_france 1,5 · meteofrance_arome_france_hd 1,6 · ecmwf_ifs025 2,1 · meteofrance_arpege_europe 2,1 · icon_eu 2,5 · gfs_seamless 2,6 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.18 · ewam 0.18 · ecmwf_wam025 0.26 · gwam 0.28 · ncep_gfswave025 0.87 |
| 03404 | ewam 0.11 · ncep_gfswave025 0.13 · meteofrance_wave 0.14 · gwam 0.15 · ecmwf_wam025 0.16 |
| 01101 | ncep_gfswave025 0.12 · ewam 0.14 · meteofrance_wave 0.15 · gwam 0.15 · ecmwf_wam025 0.16 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 15.63, ×0.93 (MAE 0.19 m, n 166) ; ecmwf_wam025 poids 8.2, ×0.85 (MAE 0.29 m, n 166) ; ewam poids 8.73, ×0.88 (MAE 0.27 m, n 166) ; gwam poids 3.25, ×0.81 (MAE 0.38 m, n 166) ; copernicus poids 16.89, ×0.87 (MAE 0.21 m, n 100)
  - 03404 : meteofrance_wave poids 14.09, ×1.09 (MAE 0.21 m, n 166) ; ecmwf_wam025 poids 12.2, ×0.99 (MAE 0.2 m, n 166) ; ewam poids 17.86, ×0.99 (MAE 0.13 m, n 166) ; gwam poids 9.65, ×0.96 (MAE 0.15 m, n 166) ; ncep_gfswave025 poids 8.68, ×1.06 (MAE 0.17 m, n 166) ; copernicus poids 23.35, ×0.93 (MAE 0.14 m, n 100)
  - 01102 : 
  - 01101 : meteofrance_wave poids 17.1, ×1.21 (MAE 0.17 m, n 166) ; ecmwf_wam025 poids 15.84, ×0.92 (MAE 0.15 m, n 166) ; ewam poids 15.7, ×1.02 (MAE 0.15 m, n 166) ; gwam poids 8.59, ×0.92 (MAE 0.17 m, n 166) ; ncep_gfswave025 poids 10.38, ×1 (MAE 0.13 m, n 166) ; copernicus poids 27.14, ×0.99 (MAE 0.11 m, n 100)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.97, Port Camargue × 1.01 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

49 prévisions archivées. Classement à 24 h :

- LFMT : icon_d2 1,3 nd (n 9) · icon_eu 1,3 nd (n 9) · meteofrance_arome_france_hd 1,4 nd (n 9) · meteofrance_arome_france 1,6 nd (n 9) · gfs_seamless 1,9 nd (n 9) · meteofrance_arpege_europe 2,1 nd (n 9) · ecmwf_ifs025 2,8 nd (n 9)
- LFMP : ecmwf_ifs025 2,3 nd (n 9) · meteofrance_arome_france_hd 2,5 nd (n 9) · meteofrance_arome_france 2,5 nd (n 9) · gfs_seamless 3,0 nd (n 9) · icon_eu 3,1 nd (n 9) · meteofrance_arpege_europe 3,2 nd (n 9)
- LFTH : icon_eu 2,2 nd (n 9) · ecmwf_ifs025 2,5 nd (n 9) · gfs_seamless 3,1 nd (n 9) · meteofrance_arome_france_hd 3,4 nd (n 9) · meteofrance_arome_france 3,4 nd (n 9) · meteofrance_arpege_europe 4,7 nd (n 9)
- LFML : meteofrance_arome_france_hd 2,0 nd (n 9) · meteofrance_arome_france 2,1 nd (n 9) · meteofrance_arpege_europe 2,3 nd (n 9) · ecmwf_ifs025 2,8 nd (n 9) · gfs_seamless 3,1 nd (n 9) · icon_eu 3,5 nd (n 9)
- LFMI : icon_eu 2,3 nd (n 9) · gfs_seamless 2,4 nd (n 9) · ecmwf_ifs025 2,5 nd (n 9) · meteofrance_arome_france_hd 2,8 nd (n 9) · meteofrance_arome_france 2,8 nd (n 9) · meteofrance_arpege_europe 3,4 nd (n 9)
