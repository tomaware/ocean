# Remise en question (③)

Généré le 2026-11-17 22:32 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 47 prévisions archivées sur 189 h ; 4341 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france_hd 1,9 · meteofrance_arome_france 1,9 · gfs_seamless 2,0 · icon_eu 2,1 · ecmwf_ifs025 2,2 · icon_d2 2,2 · meteofrance_arpege_europe 2,4 |
| LFMP | meteofrance_arpege_europe 1,5 · meteofrance_arome_france_hd 1,6 · icon_eu 1,6 · meteofrance_arome_france 1,6 · gfs_seamless 1,7 · ecmwf_ifs025 1,9 |
| LFTH | meteofrance_arome_france_hd 2,1 · meteofrance_arome_france 2,1 · icon_eu 2,3 · gfs_seamless 2,5 · meteofrance_arpege_europe 2,8 · ecmwf_ifs025 3,0 |
| LFML | meteofrance_arome_france 2,2 · meteofrance_arome_france_hd 2,2 · ecmwf_ifs025 2,4 · icon_eu 2,9 · meteofrance_arpege_europe 3,2 · gfs_seamless 3,5 |
| LFMI | meteofrance_arome_france_hd 1,6 · meteofrance_arome_france 1,6 · meteofrance_arpege_europe 2,2 · gfs_seamless 2,3 · ecmwf_ifs025 2,3 · icon_eu 2,7 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.19 · ecmwf_wam025 0.28 · ewam 0.30 · gwam 0.40 · ncep_gfswave025 1.04 |
| 03404 | ewam 0.14 · gwam 0.16 · ncep_gfswave025 0.18 · ecmwf_wam025 0.21 · meteofrance_wave 0.24 |
| 01101 | ecmwf_wam025 0.16 · ewam 0.16 · ncep_gfswave025 0.16 · meteofrance_wave 0.19 · gwam 0.19 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 12.22, ×0.97 (MAE 0.24 m, n 188) ; ecmwf_wam025 poids 7.58, ×0.87 (MAE 0.3 m, n 188) ; ewam poids 8.43, ×0.87 (MAE 0.28 m, n 188) ; gwam poids 2.78, ×0.8 (MAE 0.42 m, n 188) ; copernicus poids 19.39, ×0.93 (MAE 0.18 m, n 104)
  - 03404 : meteofrance_wave poids 13.46, ×1.12 (MAE 0.22 m, n 188) ; ecmwf_wam025 poids 10.74, ×1 (MAE 0.23 m, n 188) ; ewam poids 16.98, ×0.99 (MAE 0.14 m, n 188) ; gwam poids 9.45, ×0.96 (MAE 0.15 m, n 188) ; ncep_gfswave025 poids 7.67, ×1.11 (MAE 0.2 m, n 188) ; copernicus poids 22.38, ×0.98 (MAE 0.15 m, n 104)
  - 01102 : 
  - 01101 : meteofrance_wave poids 15.99, ×1.24 (MAE 0.19 m, n 188) ; ecmwf_wam025 poids 16.24, ×0.93 (MAE 0.15 m, n 188) ; ewam poids 15.91, ×1.04 (MAE 0.15 m, n 188) ; gwam poids 8.66, ×0.96 (MAE 0.17 m, n 188) ; ncep_gfswave025 poids 8.07, ×1.09 (MAE 0.19 m, n 188) ; copernicus poids 27.97, ×1.05 (MAE 0.1 m, n 104)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.08, Port Camargue × 1.08 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

47 prévisions archivées. Classement à 24 h :

- LFMT : gfs_seamless 1,3 nd (n 9) · meteofrance_arome_france_hd 1,7 nd (n 9) · meteofrance_arome_france 1,7 nd (n 9) · icon_d2 1,9 nd (n 9) · icon_eu 1,9 nd (n 9) · meteofrance_arpege_europe 2,2 nd (n 9) · ecmwf_ifs025 2,4 nd (n 9)
- LFMP : icon_eu 2,0 nd (n 9) · ecmwf_ifs025 2,0 nd (n 9) · gfs_seamless 2,1 nd (n 9) · meteofrance_arome_france 2,3 nd (n 9) · meteofrance_arome_france_hd 2,6 nd (n 9) · meteofrance_arpege_europe 2,7 nd (n 9)
- LFTH : icon_eu 1,9 nd (n 9) · ecmwf_ifs025 2,9 nd (n 9) · gfs_seamless 3,0 nd (n 9) · meteofrance_arome_france_hd 3,1 nd (n 9) · meteofrance_arome_france 3,1 nd (n 9) · meteofrance_arpege_europe 4,1 nd (n 9)
- LFML : meteofrance_arome_france 2,0 nd (n 9) · meteofrance_arome_france_hd 2,2 nd (n 9) · ecmwf_ifs025 2,5 nd (n 9) · meteofrance_arpege_europe 3,1 nd (n 9) · icon_eu 3,6 nd (n 9) · gfs_seamless 3,9 nd (n 9)
- LFMI : ecmwf_ifs025 2,4 nd (n 9) · icon_eu 2,9 nd (n 9) · meteofrance_arome_france_hd 3,1 nd (n 9) · gfs_seamless 3,1 nd (n 9) · meteofrance_arome_france 3,3 nd (n 9) · meteofrance_arpege_europe 3,5 nd (n 9)
