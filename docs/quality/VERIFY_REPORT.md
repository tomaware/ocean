# Remise en question (③)

Généré le 2026-11-19 16:44 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 59 prévisions archivées sur 231 h ; 5206 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | icon_d2 2,4 · icon_eu 2,5 · meteofrance_arome_france_hd 2,5 · meteofrance_arome_france 2,5 · meteofrance_arpege_europe 2,5 · gfs_seamless 2,6 · ecmwf_ifs025 3,4 |
| LFMP | meteofrance_arome_france_hd 3,0 · meteofrance_arome_france 3,0 · icon_eu 3,2 · meteofrance_arpege_europe 3,3 · gfs_seamless 3,9 · ecmwf_ifs025 4,5 |
| LFTH | meteofrance_arpege_europe 2,4 · meteofrance_arome_france_hd 2,7 · meteofrance_arome_france 2,7 · icon_eu 3,2 · ecmwf_ifs025 3,4 · gfs_seamless 3,5 |
| LFML | meteofrance_arome_france 2,3 · meteofrance_arome_france_hd 2,3 · meteofrance_arpege_europe 2,7 · icon_eu 2,7 · ecmwf_ifs025 3,2 · gfs_seamless 4,8 |
| LFMI | meteofrance_arpege_europe 2,2 · meteofrance_arome_france_hd 2,4 · meteofrance_arome_france 2,4 · gfs_seamless 3,1 · icon_eu 3,4 · ecmwf_ifs025 3,5 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.17 · meteofrance_wave 0.19 · ecmwf_wam025 0.31 · gwam 0.35 · ncep_gfswave025 0.88 |
| 03404 | ewam 0.14 · meteofrance_wave 0.17 · ncep_gfswave025 0.20 · ecmwf_wam025 0.24 · gwam 0.24 |
| 01101 | ewam 0.17 · meteofrance_wave 0.18 · ncep_gfswave025 0.18 · ecmwf_wam025 0.19 · gwam 0.27 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 15.19, ×0.87 (MAE 0.2 m, n 178) ; ecmwf_wam025 poids 7.44, ×0.8 (MAE 0.31 m, n 178) ; ewam poids 14.73, ×0.88 (MAE 0.17 m, n 178) ; gwam poids 3.79, ×0.8 (MAE 0.34 m, n 178) ; copernicus poids 14.17, ×0.87 (MAE 0.24 m, n 100)
  - 03404 : meteofrance_wave poids 17.55, ×0.92 (MAE 0.17 m, n 178) ; ecmwf_wam025 poids 10.71, ×0.83 (MAE 0.23 m, n 178) ; ewam poids 18.47, ×0.93 (MAE 0.12 m, n 178) ; gwam poids 6.83, ×0.84 (MAE 0.22 m, n 178) ; ncep_gfswave025 poids 8.41, ×0.89 (MAE 0.18 m, n 178) ; copernicus poids 15.03, ×0.87 (MAE 0.23 m, n 100)
  - 01102 : 
  - 01101 : meteofrance_wave poids 18.79, ×1.25 (MAE 0.15 m, n 153) ; ecmwf_wam025 poids 12.89, ×0.85 (MAE 0.19 m, n 153) ; ewam poids 16.04, ×1.04 (MAE 0.15 m, n 153) ; gwam poids 5.29, ×0.82 (MAE 0.27 m, n 153) ; ncep_gfswave025 poids 8.05, ×0.89 (MAE 0.19 m, n 153) ; copernicus poids 27.68, ×0.99 (MAE 0.1 m, n 75)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.98, Port Camargue × 1.17 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

59 prévisions archivées. Classement à 24 h :

- LFMT : gfs_seamless 1,6 nd (n 9) · icon_eu 1,7 nd (n 9) · icon_d2 1,7 nd (n 9) · meteofrance_arome_france 2,7 nd (n 9) · meteofrance_arome_france_hd 2,8 nd (n 9) · meteofrance_arpege_europe 3,1 nd (n 9) · ecmwf_ifs025 3,8 nd (n 9)
- LFMP : meteofrance_arome_france_hd 2,6 nd (n 9) · meteofrance_arome_france 2,8 nd (n 9) · icon_eu 4,2 nd (n 9) · meteofrance_arpege_europe 4,2 nd (n 9) · ecmwf_ifs025 4,3 nd (n 9) · gfs_seamless 4,6 nd (n 9)
- LFTH : meteofrance_arome_france_hd 2,1 nd (n 9) · meteofrance_arome_france 2,2 nd (n 9) · meteofrance_arpege_europe 2,2 nd (n 9) · ecmwf_ifs025 3,3 nd (n 9) · icon_eu 3,7 nd (n 9) · gfs_seamless 3,8 nd (n 9)
- LFML : meteofrance_arome_france_hd 2,3 nd (n 9) · meteofrance_arpege_europe 2,4 nd (n 9) · meteofrance_arome_france 2,5 nd (n 9) · icon_eu 2,5 nd (n 9) · ecmwf_ifs025 3,5 nd (n 9) · gfs_seamless 3,9 nd (n 9)
- LFMI : gfs_seamless 2,4 nd (n 9) · meteofrance_arome_france_hd 2,5 nd (n 9) · meteofrance_arome_france 2,5 nd (n 9) · ecmwf_ifs025 2,6 nd (n 9) · meteofrance_arpege_europe 2,7 nd (n 9) · icon_eu 2,8 nd (n 9)
