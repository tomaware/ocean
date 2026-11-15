# Remise en question (③)

Généré le 2026-11-15 11:20 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 33 prévisions archivées sur 129 h ; 3147 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arpege_europe 1,9 · icon_d2 2,2 · ecmwf_ifs025 2,4 · icon_eu 2,4 · meteofrance_arome_france_hd 2,5 · meteofrance_arome_france 2,5 · gfs_seamless 3,0 |
| LFMP | meteofrance_arome_france 1,6 · meteofrance_arome_france_hd 1,6 · gfs_seamless 1,6 · icon_eu 1,8 · ecmwf_ifs025 2,1 · meteofrance_arpege_europe 2,1 |
| LFTH | ecmwf_ifs025 2,3 · icon_eu 2,8 · meteofrance_arpege_europe 4,0 · gfs_seamless 4,1 · meteofrance_arome_france_hd 4,4 · meteofrance_arome_france 4,4 |
| LFML | meteofrance_arome_france 2,3 · meteofrance_arome_france_hd 2,4 · ecmwf_ifs025 2,5 · icon_eu 2,6 · meteofrance_arpege_europe 3,2 · gfs_seamless 5,8 |
| LFMI | meteofrance_arome_france_hd 2,1 · meteofrance_arome_france 2,3 · meteofrance_arpege_europe 2,3 · ecmwf_ifs025 3,0 · icon_eu 3,2 · gfs_seamless 3,9 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.29 · meteofrance_wave 0.31 · ecmwf_wam025 0.41 · gwam 0.55 · ncep_gfswave025 1.11 |
| 03404 | ewam 0.19 · gwam 0.24 · ncep_gfswave025 0.24 · meteofrance_wave 0.25 · ecmwf_wam025 0.32 |
| 01101 | meteofrance_wave 0.18 · ewam 0.20 · ecmwf_wam025 0.28 · ncep_gfswave025 0.28 · gwam 0.36 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 10.5, ×0.93 (MAE 0.27 m, n 165) ; ecmwf_wam025 poids 6.04, ×0.86 (MAE 0.35 m, n 165) ; ewam poids 8.41, ×0.85 (MAE 0.28 m, n 165) ; gwam poids 2.02, ×0.8 (MAE 0.51 m, n 165) ; copernicus poids 9.77, ×0.86 (MAE 0.32 m, n 102)
  - 03404 : meteofrance_wave poids 12.24, ×1.02 (MAE 0.24 m, n 150) ; ecmwf_wam025 poids 7.47, ×0.95 (MAE 0.31 m, n 150) ; ewam poids 13.37, ×0.94 (MAE 0.19 m, n 150) ; gwam poids 6.16, ×0.87 (MAE 0.24 m, n 150) ; ncep_gfswave025 poids 6.54, ×1.04 (MAE 0.23 m, n 150) ; copernicus poids 24.76, ×0.97 (MAE 0.13 m, n 102)
  - 01102 : 
  - 01101 : meteofrance_wave poids 16.2, ×1.13 (MAE 0.18 m, n 167) ; ecmwf_wam025 poids 8.79, ×0.84 (MAE 0.27 m, n 167) ; ewam poids 10.45, ×0.9 (MAE 0.24 m, n 167) ; gwam poids 3.66, ×0.8 (MAE 0.35 m, n 167) ; ncep_gfswave025 poids 4.89, ×0.93 (MAE 0.29 m, n 167) ; copernicus poids 25.95, ×0.97 (MAE 0.12 m, n 102)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.99, Port Camargue × 0.99 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

33 prévisions archivées. Classement à 24 h :

- LFMT : icon_d2 1,7 nd (n 11) · meteofrance_arpege_europe 1,7 nd (n 11) · meteofrance_arome_france 2,1 nd (n 11) · meteofrance_arome_france_hd 2,2 nd (n 11) · gfs_seamless 2,3 nd (n 11) · ecmwf_ifs025 2,4 nd (n 11) · icon_eu 2,5 nd (n 11)
- LFMP : gfs_seamless 1,4 nd (n 11) · meteofrance_arpege_europe 1,5 nd (n 11) · meteofrance_arome_france_hd 1,8 nd (n 11) · meteofrance_arome_france 1,8 nd (n 11) · icon_eu 1,9 nd (n 11) · ecmwf_ifs025 2,1 nd (n 11)
- LFTH : icon_eu 2,5 nd (n 11) · ecmwf_ifs025 2,9 nd (n 11) · meteofrance_arpege_europe 3,6 nd (n 11) · gfs_seamless 4,6 nd (n 11) · meteofrance_arome_france_hd 5,2 nd (n 11) · meteofrance_arome_france 5,2 nd (n 11)
- LFML : icon_eu 2,2 nd (n 11) · meteofrance_arome_france 3,2 nd (n 11) · meteofrance_arome_france_hd 3,2 nd (n 11) · ecmwf_ifs025 3,3 nd (n 11) · meteofrance_arpege_europe 3,9 nd (n 11) · gfs_seamless 6,4 nd (n 11)
- LFMI : 
