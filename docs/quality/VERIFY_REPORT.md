# Remise en question (③)

Généré le 2026-11-18 23:30 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 53 prévisions archivées sur 213 h ; 4670 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | icon_eu 2,0 · icon_d2 2,1 · meteofrance_arome_france 2,2 · gfs_seamless 2,2 · meteofrance_arome_france_hd 2,2 · ecmwf_ifs025 2,3 · meteofrance_arpege_europe 2,6 |
| LFMP | icon_eu 2,1 · meteofrance_arome_france_hd 2,2 · meteofrance_arome_france 2,2 · meteofrance_arpege_europe 2,4 · ecmwf_ifs025 2,5 · gfs_seamless 2,8 |
| LFTH | meteofrance_arpege_europe 2,8 · meteofrance_arome_france_hd 2,8 · meteofrance_arome_france 2,8 · gfs_seamless 2,8 · icon_eu 3,1 · ecmwf_ifs025 3,2 |
| LFML | meteofrance_arome_france 2,2 · meteofrance_arome_france_hd 2,4 · meteofrance_arpege_europe 2,6 · ecmwf_ifs025 2,6 · icon_eu 2,7 · gfs_seamless 3,8 |
| LFMI | meteofrance_arome_france 1,9 · meteofrance_arome_france_hd 1,9 · meteofrance_arpege_europe 2,0 · gfs_seamless 2,4 · ecmwf_ifs025 2,5 · icon_eu 2,6 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.15 · meteofrance_wave 0.19 · ecmwf_wam025 0.27 · gwam 0.30 · ncep_gfswave025 0.76 |
| 03404 | ewam 0.10 · ncep_gfswave025 0.11 · meteofrance_wave 0.14 · gwam 0.17 · ecmwf_wam025 0.18 |
| 01101 | ncep_gfswave025 0.13 · ewam 0.14 · meteofrance_wave 0.16 · ecmwf_wam025 0.16 · gwam 0.19 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 15.44, ×0.92 (MAE 0.19 m, n 192) ; ecmwf_wam025 poids 8.08, ×0.84 (MAE 0.29 m, n 192) ; ewam poids 9.6, ×0.88 (MAE 0.25 m, n 192) ; gwam poids 3.32, ×0.8 (MAE 0.38 m, n 192) ; copernicus poids 16.74, ×0.88 (MAE 0.21 m, n 102)
  - 03404 : meteofrance_wave poids 14.11, ×1.06 (MAE 0.21 m, n 192) ; ecmwf_wam025 poids 11.72, ×0.96 (MAE 0.21 m, n 192) ; ewam poids 17.78, ×0.98 (MAE 0.13 m, n 192) ; gwam poids 8.85, ×0.94 (MAE 0.17 m, n 192) ; ncep_gfswave025 poids 8.95, ×1.05 (MAE 0.16 m, n 192) ; copernicus poids 20.48, ×0.92 (MAE 0.17 m, n 102)
  - 01102 : 
  - 01101 : meteofrance_wave poids 16.83, ×1.23 (MAE 0.18 m, n 185) ; ecmwf_wam025 poids 15.24, ×0.92 (MAE 0.16 m, n 185) ; ewam poids 15.98, ×1.02 (MAE 0.15 m, n 185) ; gwam poids 7.78, ×0.9 (MAE 0.19 m, n 185) ; ncep_gfswave025 poids 10.51, ×1 (MAE 0.13 m, n 185) ; copernicus poids 27.59, ×1.03 (MAE 0.1 m, n 95)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.13, Port Camargue × 1.13 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

53 prévisions archivées. Classement à 24 h :

- LFMT : icon_d2 1,6 nd (n 8) · gfs_seamless 1,7 nd (n 8) · icon_eu 1,7 nd (n 8) · meteofrance_arome_france_hd 2,0 nd (n 8) · meteofrance_arome_france 2,3 nd (n 8) · meteofrance_arpege_europe 2,3 nd (n 8) · ecmwf_ifs025 2,7 nd (n 8)
- LFMP : meteofrance_arome_france_hd 1,7 nd (n 8) · meteofrance_arome_france 2,0 nd (n 8) · ecmwf_ifs025 2,8 nd (n 8) · gfs_seamless 3,4 nd (n 8) · icon_eu 3,7 nd (n 8) · meteofrance_arpege_europe 3,9 nd (n 8)
- LFTH : icon_eu 2,8 nd (n 8) · ecmwf_ifs025 3,0 nd (n 8) · gfs_seamless 3,8 nd (n 8) · meteofrance_arome_france_hd 4,0 nd (n 8) · meteofrance_arome_france 4,0 nd (n 8) · meteofrance_arpege_europe 4,8 nd (n 8)
- LFML : meteofrance_arome_france_hd 2,2 nd (n 8) · meteofrance_arome_france 2,4 nd (n 8) · meteofrance_arpege_europe 2,7 nd (n 8) · ecmwf_ifs025 3,2 nd (n 8) · icon_eu 3,3 nd (n 8) · gfs_seamless 4,2 nd (n 8)
- LFMI : meteofrance_arome_france 1,7 nd (n 8) · meteofrance_arome_france_hd 1,8 nd (n 8) · meteofrance_arpege_europe 2,4 nd (n 8) · icon_eu 2,5 nd (n 8) · gfs_seamless 2,5 nd (n 8) · ecmwf_ifs025 3,2 nd (n 8)
