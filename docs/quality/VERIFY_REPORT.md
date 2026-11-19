# Remise en question (③)

Généré le 2026-11-19 18:35 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 60 prévisions archivées sur 234 h ; 5390 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france_hd 2,5 · meteofrance_arpege_europe 2,5 · icon_d2 2,5 · meteofrance_arome_france 2,6 · gfs_seamless 2,6 · icon_eu 2,6 · ecmwf_ifs025 3,6 |
| LFMP | meteofrance_arome_france_hd 3,1 · meteofrance_arome_france 3,1 · icon_eu 3,3 · meteofrance_arpege_europe 3,6 · gfs_seamless 4,1 · ecmwf_ifs025 4,5 |
| LFTH | meteofrance_arpege_europe 2,4 · meteofrance_arome_france_hd 2,5 · meteofrance_arome_france 2,5 · icon_eu 3,3 · gfs_seamless 3,5 · ecmwf_ifs025 3,7 |
| LFML | meteofrance_arome_france 2,2 · meteofrance_arome_france_hd 2,3 · meteofrance_arpege_europe 2,8 · icon_eu 3,0 · ecmwf_ifs025 3,4 · gfs_seamless 4,7 |
| LFMI | meteofrance_arpege_europe 2,2 · meteofrance_arome_france_hd 2,5 · meteofrance_arome_france 2,5 · gfs_seamless 3,1 · ecmwf_ifs025 3,6 · icon_eu 3,8 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.17 · meteofrance_wave 0.19 · ecmwf_wam025 0.31 · gwam 0.36 · ncep_gfswave025 0.91 |
| 03404 | ewam 0.14 · meteofrance_wave 0.17 · ncep_gfswave025 0.21 · gwam 0.24 · ecmwf_wam025 0.25 |
| 01101 | meteofrance_wave 0.17 · ewam 0.17 · ncep_gfswave025 0.19 · ecmwf_wam025 0.21 · gwam 0.30 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 15.32, ×0.87 (MAE 0.2 m, n 182) ; ecmwf_wam025 poids 7.42, ×0.8 (MAE 0.31 m, n 182) ; ewam poids 14.82, ×0.88 (MAE 0.17 m, n 182) ; gwam poids 3.79, ×0.8 (MAE 0.34 m, n 182) ; copernicus poids 14.54, ×0.88 (MAE 0.24 m, n 104)
  - 03404 : meteofrance_wave poids 17.58, ×0.91 (MAE 0.17 m, n 182) ; ecmwf_wam025 poids 10.54, ×0.83 (MAE 0.23 m, n 182) ; ewam poids 18.63, ×0.93 (MAE 0.12 m, n 182) ; gwam poids 6.7, ×0.83 (MAE 0.22 m, n 182) ; ncep_gfswave025 poids 8.24, ×0.89 (MAE 0.18 m, n 182) ; copernicus poids 15.23, ×0.87 (MAE 0.23 m, n 104)
  - 01102 : 
  - 01101 : meteofrance_wave poids 19.08, ×1.25 (MAE 0.15 m, n 157) ; ecmwf_wam025 poids 12.32, ×0.84 (MAE 0.2 m, n 157) ; ewam poids 16.28, ×1.04 (MAE 0.15 m, n 157) ; gwam poids 5.1, ×0.81 (MAE 0.28 m, n 157) ; ncep_gfswave025 poids 7.93, ×0.89 (MAE 0.19 m, n 157) ; copernicus poids 27.38, ×0.99 (MAE 0.11 m, n 79)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.97, Port Camargue × 1.16 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

60 prévisions archivées. Classement à 24 h :

- LFMT : gfs_seamless 1,5 nd (n 10) · icon_d2 2,7 nd (n 10) · icon_eu 2,8 nd (n 10) · meteofrance_arome_france 3,2 nd (n 10) · meteofrance_arome_france_hd 3,4 nd (n 10) · meteofrance_arpege_europe 3,5 nd (n 10) · ecmwf_ifs025 4,4 nd (n 10)
- LFMP : meteofrance_arome_france_hd 2,5 nd (n 10) · meteofrance_arome_france 2,6 nd (n 10) · ecmwf_ifs025 4,0 nd (n 10) · meteofrance_arpege_europe 4,0 nd (n 10) · icon_eu 4,1 nd (n 10) · gfs_seamless 4,3 nd (n 10)
- LFTH : meteofrance_arpege_europe 2,1 nd (n 10) · meteofrance_arome_france_hd 2,3 nd (n 10) · meteofrance_arome_france 2,3 nd (n 10) · gfs_seamless 3,5 nd (n 10) · ecmwf_ifs025 3,8 nd (n 10) · icon_eu 4,1 nd (n 10)
- LFML : meteofrance_arome_france_hd 2,2 nd (n 10) · meteofrance_arome_france 2,3 nd (n 10) · meteofrance_arpege_europe 2,4 nd (n 10) · icon_eu 2,6 nd (n 10) · gfs_seamless 3,7 nd (n 10) · ecmwf_ifs025 3,9 nd (n 10)
- LFMI : gfs_seamless 2,5 nd (n 10) · meteofrance_arome_france_hd 2,5 nd (n 10) · ecmwf_ifs025 2,5 nd (n 10) · meteofrance_arome_france 2,6 nd (n 10) · meteofrance_arpege_europe 2,8 nd (n 10) · icon_eu 2,8 nd (n 10)
