# Remise en question (③)

Généré le 2026-11-15 10:25 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 33 prévisions archivées sur 129 h ; 3190 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arpege_europe 2,0 · icon_d2 2,3 · ecmwf_ifs025 2,4 · icon_eu 2,5 · meteofrance_arome_france_hd 2,6 · meteofrance_arome_france 2,6 · gfs_seamless 3,0 |
| LFMP | meteofrance_arome_france_hd 1,6 · meteofrance_arome_france 1,6 · gfs_seamless 1,6 · icon_eu 1,7 · meteofrance_arpege_europe 2,1 · ecmwf_ifs025 2,2 |
| LFTH | ecmwf_ifs025 2,2 · icon_eu 2,8 · meteofrance_arpege_europe 3,9 · gfs_seamless 4,0 · meteofrance_arome_france 4,4 · meteofrance_arome_france_hd 4,5 |
| LFML | meteofrance_arome_france 2,2 · meteofrance_arome_france_hd 2,4 · ecmwf_ifs025 2,5 · icon_eu 2,7 · meteofrance_arpege_europe 3,4 · gfs_seamless 5,7 |
| LFMI | meteofrance_arome_france_hd 2,2 · meteofrance_arome_france 2,3 · meteofrance_arpege_europe 2,4 · ecmwf_ifs025 2,9 · icon_eu 3,2 · gfs_seamless 4,0 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.28 · meteofrance_wave 0.31 · ecmwf_wam025 0.39 · gwam 0.54 · ncep_gfswave025 1.09 |
| 03404 | ewam 0.18 · gwam 0.24 · meteofrance_wave 0.25 · ncep_gfswave025 0.25 · ecmwf_wam025 0.33 |
| 01101 | meteofrance_wave 0.18 · ewam 0.20 · ecmwf_wam025 0.29 · ncep_gfswave025 0.29 · gwam 0.36 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 10.51, ×0.93 (MAE 0.27 m, n 157) ; ecmwf_wam025 poids 6.4, ×0.87 (MAE 0.34 m, n 157) ; ewam poids 8.62, ×0.85 (MAE 0.28 m, n 157) ; gwam poids 2.09, ×0.8 (MAE 0.5 m, n 157) ; copernicus poids 10.2, ×0.87 (MAE 0.31 m, n 100)
  - 03404 : meteofrance_wave poids 12.13, ×1.01 (MAE 0.24 m, n 142) ; ecmwf_wam025 poids 7.14, ×0.95 (MAE 0.32 m, n 142) ; ewam poids 13.52, ×0.94 (MAE 0.18 m, n 142) ; gwam poids 6.19, ×0.87 (MAE 0.24 m, n 142) ; ncep_gfswave025 poids 6.31, ×1.04 (MAE 0.23 m, n 142) ; copernicus poids 23.84, ×0.97 (MAE 0.14 m, n 100)
  - 01102 : 
  - 01101 : meteofrance_wave poids 16.19, ×1.13 (MAE 0.18 m, n 159) ; ecmwf_wam025 poids 8.56, ×0.84 (MAE 0.28 m, n 159) ; ewam poids 10.64, ×0.91 (MAE 0.23 m, n 159) ; gwam poids 3.68, ×0.8 (MAE 0.35 m, n 159) ; ncep_gfswave025 poids 4.77, ×0.93 (MAE 0.29 m, n 159) ; copernicus poids 26.49, ×0.97 (MAE 0.11 m, n 100)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.03, Port Camargue × 1.04 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

33 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 1,7 nd (n 12) · icon_d2 2,2 nd (n 12) · meteofrance_arome_france 2,3 nd (n 12) · gfs_seamless 2,4 nd (n 12) · meteofrance_arome_france_hd 2,5 nd (n 12) · ecmwf_ifs025 2,6 nd (n 12) · icon_eu 2,9 nd (n 12)
- LFMP : gfs_seamless 1,5 nd (n 12) · meteofrance_arome_france 1,8 nd (n 12) · icon_eu 1,8 nd (n 12) · meteofrance_arome_france_hd 2,0 nd (n 12) · ecmwf_ifs025 2,1 nd (n 12) · meteofrance_arpege_europe 2,1 nd (n 12)
- LFTH : icon_eu 2,4 nd (n 12) · ecmwf_ifs025 2,8 nd (n 12) · meteofrance_arpege_europe 3,4 nd (n 12) · gfs_seamless 4,6 nd (n 12) · meteofrance_arome_france_hd 4,9 nd (n 12) · meteofrance_arome_france 4,9 nd (n 12)
- LFML : icon_eu 2,4 nd (n 12) · meteofrance_arome_france_hd 3,1 nd (n 12) · meteofrance_arome_france 3,2 nd (n 12) · ecmwf_ifs025 3,3 nd (n 12) · meteofrance_arpege_europe 4,2 nd (n 12) · gfs_seamless 5,9 nd (n 12)
- LFMI : 
