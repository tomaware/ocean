# Remise en question (③)

Généré le 2026-11-17 17:44 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 46 prévisions archivées sur 180 h ; 4380 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 1,6 · meteofrance_arome_france_hd 1,6 · icon_eu 1,8 · icon_d2 2,2 · ecmwf_ifs025 2,3 · gfs_seamless 2,4 · meteofrance_arpege_europe 2,5 |
| LFMP | meteofrance_arpege_europe 1,8 · icon_eu 1,8 · meteofrance_arome_france_hd 1,9 · ecmwf_ifs025 2,0 · meteofrance_arome_france 2,0 · gfs_seamless 2,1 |
| LFTH | meteofrance_arome_france_hd 1,8 · meteofrance_arome_france 1,8 · gfs_seamless 2,3 · icon_eu 2,4 · meteofrance_arpege_europe 2,5 · ecmwf_ifs025 2,9 |
| LFML | meteofrance_arome_france 2,3 · ecmwf_ifs025 2,3 · meteofrance_arome_france_hd 2,3 · icon_eu 2,7 · meteofrance_arpege_europe 3,4 · gfs_seamless 4,3 |
| LFMI | meteofrance_arome_france 1,7 · meteofrance_arome_france_hd 1,7 · gfs_seamless 2,4 · ecmwf_ifs025 2,4 · meteofrance_arpege_europe 2,4 · icon_eu 2,6 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.24 · ecmwf_wam025 0.28 · ewam 0.32 · gwam 0.41 · ncep_gfswave025 1.13 |
| 03404 | ewam 0.14 · gwam 0.17 · ncep_gfswave025 0.23 · ecmwf_wam025 0.25 · meteofrance_wave 0.28 |
| 01101 | ecmwf_wam025 0.16 · ewam 0.17 · meteofrance_wave 0.18 · ncep_gfswave025 0.18 · gwam 0.19 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 11.84, ×0.97 (MAE 0.25 m, n 180) ; ecmwf_wam025 poids 7.49, ×0.87 (MAE 0.31 m, n 180) ; ewam poids 8.24, ×0.87 (MAE 0.29 m, n 180) ; gwam poids 2.71, ×0.8 (MAE 0.43 m, n 180) ; copernicus poids 19.35, ×0.92 (MAE 0.18 m, n 102)
  - 03404 : meteofrance_wave poids 13, ×1.12 (MAE 0.23 m, n 180) ; ecmwf_wam025 poids 10.4, ×1.01 (MAE 0.24 m, n 180) ; ewam poids 16.7, ×1 (MAE 0.14 m, n 180) ; gwam poids 9.33, ×0.96 (MAE 0.16 m, n 180) ; ncep_gfswave025 poids 7.44, ×1.11 (MAE 0.2 m, n 180) ; copernicus poids 21.58, ×0.96 (MAE 0.16 m, n 102)
  - 01102 : 
  - 01101 : meteofrance_wave poids 16.68, ×1.22 (MAE 0.18 m, n 180) ; ecmwf_wam025 poids 16.58, ×0.93 (MAE 0.14 m, n 180) ; ewam poids 16.13, ×1.03 (MAE 0.15 m, n 180) ; gwam poids 8.5, ×0.95 (MAE 0.17 m, n 180) ; ncep_gfswave025 poids 7.98, ×1.08 (MAE 0.19 m, n 180) ; copernicus poids 31.08, ×1.01 (MAE 0.07 m, n 102)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.01, Port Camargue × 1.05 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

46 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arome_france 1,5 nd (n 10) · meteofrance_arome_france_hd 1,6 nd (n 10) · gfs_seamless 1,6 nd (n 10) · icon_d2 1,9 nd (n 10) · icon_eu 2,0 nd (n 10) · meteofrance_arpege_europe 2,2 nd (n 10) · ecmwf_ifs025 2,4 nd (n 10)
- LFMP : meteofrance_arome_france 2,0 nd (n 10) · gfs_seamless 2,2 nd (n 10) · ecmwf_ifs025 2,3 nd (n 10) · icon_eu 2,3 nd (n 10) · meteofrance_arome_france_hd 2,5 nd (n 10) · meteofrance_arpege_europe 3,1 nd (n 10)
- LFTH : gfs_seamless 2,3 nd (n 10) · icon_eu 2,4 nd (n 10) · meteofrance_arome_france_hd 2,4 nd (n 10) · meteofrance_arome_france 2,5 nd (n 10) · ecmwf_ifs025 2,6 nd (n 10) · meteofrance_arpege_europe 3,3 nd (n 10)
- LFML : meteofrance_arome_france 1,4 nd (n 10) · meteofrance_arome_france_hd 1,7 nd (n 10) · ecmwf_ifs025 1,9 nd (n 10) · icon_eu 2,4 nd (n 10) · meteofrance_arpege_europe 3,3 nd (n 10) · gfs_seamless 4,3 nd (n 10)
- LFMI : icon_eu 2,2 nd (n 10) · meteofrance_arome_france_hd 2,8 nd (n 10) · ecmwf_ifs025 2,9 nd (n 10) · meteofrance_arome_france 3,0 nd (n 10) · meteofrance_arpege_europe 3,0 nd (n 10) · gfs_seamless 3,2 nd (n 10)
