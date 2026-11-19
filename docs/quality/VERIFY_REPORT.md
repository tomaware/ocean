# Remise en question (③)

Généré le 2026-11-19 03:34 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 55 prévisions archivées sur 219 h ; 4873 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | icon_d2 2,1 · icon_eu 2,1 · meteofrance_arome_france_hd 2,2 · meteofrance_arome_france 2,3 · gfs_seamless 2,3 · ecmwf_ifs025 2,3 · meteofrance_arpege_europe 2,6 |
| LFMP | meteofrance_arome_france 2,4 · meteofrance_arome_france_hd 2,4 · icon_eu 2,4 · meteofrance_arpege_europe 2,6 · ecmwf_ifs025 2,7 · gfs_seamless 3,1 |
| LFTH | meteofrance_arpege_europe 2,2 · ecmwf_ifs025 2,6 · meteofrance_arome_france_hd 2,7 · meteofrance_arome_france 2,7 · gfs_seamless 2,7 · icon_eu 2,8 |
| LFML | meteofrance_arome_france 2,1 · meteofrance_arome_france_hd 2,2 · icon_eu 2,5 · meteofrance_arpege_europe 2,6 · ecmwf_ifs025 2,7 · gfs_seamless 4,0 |
| LFMI | meteofrance_arome_france_hd 1,8 · meteofrance_arome_france 1,8 · meteofrance_arpege_europe 1,8 · gfs_seamless 2,3 · ecmwf_ifs025 2,5 · icon_eu 2,5 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.15 · meteofrance_wave 0.19 · ecmwf_wam025 0.28 · gwam 0.31 · ncep_gfswave025 0.75 |
| 03404 | ewam 0.10 · ncep_gfswave025 0.11 · meteofrance_wave 0.15 · gwam 0.17 · ecmwf_wam025 0.18 |
| 01101 | ncep_gfswave025 0.12 · ewam 0.13 · ecmwf_wam025 0.15 · meteofrance_wave 0.17 · gwam 0.18 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 16.23, ×0.87 (MAE 0.18 m, n 152) ; ecmwf_wam025 poids 8.55, ×0.81 (MAE 0.28 m, n 152) ; ewam poids 16.47, ×0.9 (MAE 0.14 m, n 152) ; gwam poids 4.69, ×0.8 (MAE 0.3 m, n 152) ; copernicus poids 15.35, ×0.87 (MAE 0.23 m, n 110)
  - 03404 : meteofrance_wave poids 20.2, ×0.94 (MAE 0.14 m, n 152) ; ecmwf_wam025 poids 13.63, ×0.86 (MAE 0.18 m, n 152) ; ewam poids 19.94, ×0.97 (MAE 0.1 m, n 152) ; gwam poids 9.2, ×0.88 (MAE 0.16 m, n 152) ; ncep_gfswave025 poids 11.62, ×0.96 (MAE 0.11 m, n 152) ; copernicus poids 18.41, ×0.9 (MAE 0.19 m, n 110)
  - 01102 : 
  - 01101 : meteofrance_wave poids 18.48, ×1.25 (MAE 0.16 m, n 137) ; ecmwf_wam025 poids 15.65, ×0.9 (MAE 0.15 m, n 137) ; ewam poids 17.42, ×1.12 (MAE 0.13 m, n 137) ; gwam poids 8.07, ×0.92 (MAE 0.19 m, n 137) ; ncep_gfswave025 poids 10.7, ×0.99 (MAE 0.13 m, n 137) ; copernicus poids 27.59, ×1.03 (MAE 0.1 m, n 95)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.97, Port Camargue × 1.05 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

55 prévisions archivées. Classement à 24 h :

- LFMT : icon_d2 1,1 nd (n 8) · icon_eu 1,4 nd (n 8) · gfs_seamless 1,8 nd (n 8) · meteofrance_arome_france_hd 2,1 nd (n 8) · meteofrance_arome_france 2,5 nd (n 8) · ecmwf_ifs025 2,6 nd (n 8) · meteofrance_arpege_europe 2,9 nd (n 8)
- LFMP : meteofrance_arome_france_hd 2,1 nd (n 8) · meteofrance_arome_france 2,4 nd (n 8) · ecmwf_ifs025 2,9 nd (n 8) · gfs_seamless 3,2 nd (n 8) · meteofrance_arpege_europe 3,2 nd (n 8) · icon_eu 3,5 nd (n 8)
- LFTH : ecmwf_ifs025 2,9 nd (n 8) · icon_eu 3,1 nd (n 8) · meteofrance_arome_france_hd 3,1 nd (n 8) · meteofrance_arome_france 3,2 nd (n 8) · meteofrance_arpege_europe 3,7 nd (n 8) · gfs_seamless 4,0 nd (n 8)
- LFML : meteofrance_arome_france_hd 2,4 nd (n 8) · meteofrance_arome_france 2,5 nd (n 8) · meteofrance_arpege_europe 2,8 nd (n 8) · ecmwf_ifs025 3,5 nd (n 8) · icon_eu 3,5 nd (n 8) · gfs_seamless 4,1 nd (n 8)
- LFMI : meteofrance_arome_france_hd 1,8 nd (n 8) · meteofrance_arome_france 1,9 nd (n 8) · gfs_seamless 2,5 nd (n 8) · icon_eu 2,6 nd (n 8) · ecmwf_ifs025 2,7 nd (n 8) · meteofrance_arpege_europe 2,9 nd (n 8)
