# Remise en question (③)

Généré le 2026-11-17 08:41 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 44 prévisions archivées sur 174 h ; 4281 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 1,5 · meteofrance_arome_france_hd 1,7 · icon_eu 2,6 · ecmwf_ifs025 2,8 · gfs_seamless 2,8 · meteofrance_arpege_europe 2,9 · icon_d2 3,0 |
| LFMP | meteofrance_arome_france 1,8 · ecmwf_ifs025 1,8 · gfs_seamless 1,8 · meteofrance_arome_france_hd 1,9 · icon_eu 2,0 · meteofrance_arpege_europe 2,2 |
| LFTH | meteofrance_arome_france_hd 1,5 · meteofrance_arome_france 1,5 · gfs_seamless 2,0 · icon_eu 2,0 · ecmwf_ifs025 2,1 · meteofrance_arpege_europe 2,1 |
| LFML | ecmwf_ifs025 1,8 · meteofrance_arome_france 2,0 · meteofrance_arome_france_hd 2,0 · icon_eu 2,2 · meteofrance_arpege_europe 3,1 · gfs_seamless 4,1 |
| LFMI | meteofrance_arome_france 1,6 · meteofrance_arome_france_hd 1,7 · ecmwf_ifs025 1,9 · icon_eu 2,2 · meteofrance_arpege_europe 2,5 · gfs_seamless 2,8 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.24 · ecmwf_wam025 0.28 · ewam 0.31 · gwam 0.40 · ncep_gfswave025 1.08 |
| 03404 | ewam 0.13 · gwam 0.15 · ncep_gfswave025 0.23 · ecmwf_wam025 0.25 · meteofrance_wave 0.27 |
| 01101 | ecmwf_wam025 0.16 · meteofrance_wave 0.17 · ewam 0.17 · gwam 0.18 · ncep_gfswave025 0.19 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 11.11, ×0.98 (MAE 0.26 m, n 161) ; ecmwf_wam025 poids 7.48, ×0.88 (MAE 0.31 m, n 161) ; ewam poids 8.09, ×0.88 (MAE 0.29 m, n 161) ; gwam poids 2.73, ×0.81 (MAE 0.42 m, n 161) ; copernicus poids 19.45, ×0.94 (MAE 0.18 m, n 107)
  - 03404 : meteofrance_wave poids 12.3, ×1.12 (MAE 0.24 m, n 161) ; ecmwf_wam025 poids 9.97, ×1.02 (MAE 0.25 m, n 161) ; ewam poids 17, ×1.01 (MAE 0.14 m, n 161) ; gwam poids 9.78, ×0.97 (MAE 0.15 m, n 161) ; ncep_gfswave025 poids 7.36, ×1.14 (MAE 0.2 m, n 161) ; copernicus poids 21, ×1 (MAE 0.16 m, n 107)
  - 01102 : 
  - 01101 : meteofrance_wave poids 16.83, ×1.21 (MAE 0.18 m, n 161) ; ecmwf_wam025 poids 16.49, ×0.94 (MAE 0.14 m, n 161) ; ewam poids 15.36, ×1.02 (MAE 0.16 m, n 161) ; gwam poids 8.47, ×0.96 (MAE 0.18 m, n 161) ; ncep_gfswave025 poids 7.67, ×1.1 (MAE 0.2 m, n 161) ; copernicus poids 29.9, ×0.99 (MAE 0.08 m, n 107)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.96, Port Camargue × 1.02 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

44 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arome_france 2,2 nd (n 12) · meteofrance_arome_france_hd 2,3 nd (n 12) · icon_eu 2,5 nd (n 12) · icon_d2 2,7 nd (n 12) · gfs_seamless 2,7 nd (n 12) · meteofrance_arpege_europe 2,8 nd (n 12) · ecmwf_ifs025 3,2 nd (n 12)
- LFMP : meteofrance_arome_france 1,8 nd (n 12) · meteofrance_arome_france_hd 2,2 nd (n 12) · icon_eu 2,4 nd (n 12) · ecmwf_ifs025 2,6 nd (n 12) · gfs_seamless 2,6 nd (n 12) · meteofrance_arpege_europe 3,1 nd (n 12)
- LFTH : gfs_seamless 2,1 nd (n 12) · icon_eu 2,1 nd (n 12) · ecmwf_ifs025 2,2 nd (n 12) · meteofrance_arome_france_hd 2,2 nd (n 12) · meteofrance_arome_france 2,2 nd (n 12) · meteofrance_arpege_europe 2,9 nd (n 12)
- LFML : meteofrance_arome_france 1,6 nd (n 12) · ecmwf_ifs025 1,7 nd (n 12) · meteofrance_arome_france_hd 1,7 nd (n 12) · icon_eu 2,3 nd (n 12) · meteofrance_arpege_europe 3,1 nd (n 12) · gfs_seamless 4,0 nd (n 12)
- LFMI : icon_eu 2,1 nd (n 12) · ecmwf_ifs025 2,6 nd (n 12) · meteofrance_arpege_europe 2,9 nd (n 12) · meteofrance_arome_france_hd 2,9 nd (n 12) · meteofrance_arome_france 3,1 nd (n 12) · gfs_seamless 3,1 nd (n 12)
