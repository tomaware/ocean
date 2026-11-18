# Remise en question (③)

Généré le 2026-11-18 15:36 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 51 prévisions archivées sur 207 h ; 4691 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | icon_eu 2,0 · meteofrance_arome_france 2,1 · meteofrance_arome_france_hd 2,1 · icon_d2 2,1 · gfs_seamless 2,3 · ecmwf_ifs025 2,4 · meteofrance_arpege_europe 2,7 |
| LFMP | icon_eu 2,2 · meteofrance_arpege_europe 2,2 · meteofrance_arome_france_hd 2,2 · meteofrance_arome_france 2,2 · ecmwf_ifs025 2,6 · gfs_seamless 2,8 |
| LFTH | meteofrance_arome_france_hd 2,3 · meteofrance_arome_france 2,3 · icon_eu 2,5 · ecmwf_ifs025 2,7 · gfs_seamless 2,8 · meteofrance_arpege_europe 3,0 |
| LFML | ecmwf_ifs025 2,3 · meteofrance_arome_france 2,5 · meteofrance_arome_france_hd 2,6 · icon_eu 2,8 · meteofrance_arpege_europe 3,1 · gfs_seamless 3,8 |
| LFMI | meteofrance_arome_france 1,7 · meteofrance_arome_france_hd 1,9 · meteofrance_arpege_europe 2,2 · ecmwf_ifs025 2,3 · icon_eu 2,4 · gfs_seamless 2,4 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.18 · meteofrance_wave 0.19 · ecmwf_wam025 0.24 · gwam 0.30 · ncep_gfswave025 0.84 |
| 03404 | ncep_gfswave025 0.12 · ewam 0.13 · meteofrance_wave 0.15 · ecmwf_wam025 0.16 · gwam 0.18 |
| 01101 | ncep_gfswave025 0.13 · ewam 0.14 · ecmwf_wam025 0.15 · meteofrance_wave 0.17 · gwam 0.18 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 15.28, ×0.93 (MAE 0.2 m, n 176) ; ecmwf_wam025 poids 8.34, ×0.85 (MAE 0.28 m, n 176) ; ewam poids 8.69, ×0.87 (MAE 0.27 m, n 176) ; gwam poids 3.11, ×0.8 (MAE 0.39 m, n 176) ; copernicus poids 15.69, ×0.86 (MAE 0.22 m, n 110)
  - 03404 : meteofrance_wave poids 13.78, ×1.08 (MAE 0.22 m, n 176) ; ecmwf_wam025 poids 12.13, ×0.98 (MAE 0.21 m, n 176) ; ewam poids 16.74, ×0.97 (MAE 0.14 m, n 176) ; gwam poids 8.48, ×0.94 (MAE 0.18 m, n 176) ; ncep_gfswave025 poids 8.68, ×1.05 (MAE 0.17 m, n 176) ; copernicus poids 20.52, ×0.9 (MAE 0.17 m, n 110)
  - 01102 : 
  - 01101 : meteofrance_wave poids 16.31, ×1.23 (MAE 0.18 m, n 176) ; ecmwf_wam025 poids 15.89, ×0.92 (MAE 0.15 m, n 176) ; ewam poids 15.23, ×1.01 (MAE 0.16 m, n 176) ; gwam poids 7.41, ×0.9 (MAE 0.2 m, n 176) ; ncep_gfswave025 poids 10.32, ×1 (MAE 0.13 m, n 176) ; copernicus poids 27.72, ×0.99 (MAE 0.1 m, n 110)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.05, Port Camargue × 1.15 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

51 prévisions archivées. Classement à 24 h :

- LFMT : icon_d2 1,5 nd (n 9) · icon_eu 1,6 nd (n 9) · meteofrance_arome_france_hd 1,8 nd (n 9) · gfs_seamless 1,8 nd (n 9) · meteofrance_arome_france 2,0 nd (n 9) · meteofrance_arpege_europe 2,2 nd (n 9) · ecmwf_ifs025 3,1 nd (n 9)
- LFMP : meteofrance_arome_france_hd 2,2 nd (n 9) · meteofrance_arome_france 2,3 nd (n 9) · ecmwf_ifs025 2,3 nd (n 9) · icon_eu 3,2 nd (n 9) · meteofrance_arpege_europe 3,2 nd (n 9) · gfs_seamless 3,3 nd (n 9)
- LFTH : icon_eu 2,1 nd (n 9) · ecmwf_ifs025 2,5 nd (n 9) · gfs_seamless 3,6 nd (n 9) · meteofrance_arome_france_hd 3,7 nd (n 9) · meteofrance_arome_france 3,7 nd (n 9) · meteofrance_arpege_europe 4,9 nd (n 9)
- LFML : meteofrance_arome_france_hd 1,9 nd (n 9) · meteofrance_arome_france 2,1 nd (n 9) · meteofrance_arpege_europe 2,3 nd (n 9) · ecmwf_ifs025 2,7 nd (n 9) · icon_eu 3,4 nd (n 9) · gfs_seamless 3,8 nd (n 9)
- LFMI : meteofrance_arome_france_hd 2,3 nd (n 9) · meteofrance_arome_france 2,3 nd (n 9) · icon_eu 2,5 nd (n 9) · gfs_seamless 2,6 nd (n 9) · ecmwf_ifs025 2,9 nd (n 9) · meteofrance_arpege_europe 3,0 nd (n 9)
