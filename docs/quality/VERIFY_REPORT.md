# Remise en question (③)

Généré le 2026-11-17 23:30 UTC par `pipeline/verify/run.ts`.

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
| LFMT | meteofrance_arome_france_hd 1,8 · meteofrance_arome_france 1,9 · gfs_seamless 2,0 · icon_eu 2,1 · ecmwf_ifs025 2,2 · icon_d2 2,3 · meteofrance_arpege_europe 2,4 |
| LFMP | meteofrance_arpege_europe 1,6 · icon_eu 1,6 · meteofrance_arome_france_hd 1,7 · gfs_seamless 1,7 · meteofrance_arome_france 1,8 · ecmwf_ifs025 1,9 |
| LFTH | meteofrance_arome_france_hd 2,1 · meteofrance_arome_france 2,1 · icon_eu 2,2 · gfs_seamless 2,5 · meteofrance_arpege_europe 2,8 · ecmwf_ifs025 3,0 |
| LFML | meteofrance_arome_france 2,2 · meteofrance_arome_france_hd 2,2 · ecmwf_ifs025 2,4 · icon_eu 2,9 · meteofrance_arpege_europe 3,1 · gfs_seamless 3,2 |
| LFMI | meteofrance_arome_france 1,6 · meteofrance_arome_france_hd 1,6 · gfs_seamless 2,2 · meteofrance_arpege_europe 2,2 · ecmwf_ifs025 2,3 · icon_eu 2,7 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.18 · ecmwf_wam025 0.28 · ewam 0.29 · gwam 0.40 · ncep_gfswave025 1.01 |
| 03404 | ewam 0.14 · gwam 0.16 · ncep_gfswave025 0.17 · ecmwf_wam025 0.20 · meteofrance_wave 0.21 |
| 01101 | ncep_gfswave025 0.15 · ecmwf_wam025 0.16 · ewam 0.16 · meteofrance_wave 0.19 · gwam 0.19 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 12.34, ×0.97 (MAE 0.24 m, n 192) ; ecmwf_wam025 poids 7.56, ×0.86 (MAE 0.3 m, n 192) ; ewam poids 8.5, ×0.87 (MAE 0.28 m, n 192) ; gwam poids 2.8, ×0.8 (MAE 0.42 m, n 192) ; copernicus poids 19.69, ×0.91 (MAE 0.18 m, n 102)
  - 03404 : meteofrance_wave poids 13.7, ×1.12 (MAE 0.22 m, n 192) ; ecmwf_wam025 poids 10.84, ×1 (MAE 0.23 m, n 192) ; ewam poids 17.11, ×0.99 (MAE 0.14 m, n 192) ; gwam poids 9.51, ×0.96 (MAE 0.15 m, n 192) ; ncep_gfswave025 poids 7.8, ×1.11 (MAE 0.19 m, n 192) ; copernicus poids 23.7, ×0.95 (MAE 0.14 m, n 102)
  - 01102 : 
  - 01101 : meteofrance_wave poids 15.83, ×1.25 (MAE 0.19 m, n 192) ; ecmwf_wam025 poids 16.1, ×0.92 (MAE 0.15 m, n 192) ; ewam poids 15.87, ×1.04 (MAE 0.15 m, n 192) ; gwam poids 8.79, ×0.96 (MAE 0.17 m, n 192) ; ncep_gfswave025 poids 8.23, ×1.09 (MAE 0.18 m, n 192) ; copernicus poids 28.01, ×1.05 (MAE 0.1 m, n 102)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.03, Port Camargue × 1.11 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

47 prévisions archivées. Classement à 24 h :

- LFMT : gfs_seamless 1,3 nd (n 9) · meteofrance_arome_france_hd 1,7 nd (n 9) · meteofrance_arome_france 1,7 nd (n 9) · icon_d2 1,9 nd (n 9) · icon_eu 1,9 nd (n 9) · meteofrance_arpege_europe 2,2 nd (n 9) · ecmwf_ifs025 2,4 nd (n 9)
- LFMP : icon_eu 2,0 nd (n 9) · ecmwf_ifs025 2,0 nd (n 9) · gfs_seamless 2,1 nd (n 9) · meteofrance_arome_france 2,3 nd (n 9) · meteofrance_arome_france_hd 2,6 nd (n 9) · meteofrance_arpege_europe 2,7 nd (n 9)
- LFTH : icon_eu 1,9 nd (n 9) · ecmwf_ifs025 2,9 nd (n 9) · gfs_seamless 3,0 nd (n 9) · meteofrance_arome_france_hd 3,1 nd (n 9) · meteofrance_arome_france 3,1 nd (n 9) · meteofrance_arpege_europe 4,1 nd (n 9)
- LFML : meteofrance_arome_france 2,0 nd (n 9) · meteofrance_arome_france_hd 2,2 nd (n 9) · ecmwf_ifs025 2,5 nd (n 9) · meteofrance_arpege_europe 3,1 nd (n 9) · icon_eu 3,6 nd (n 9) · gfs_seamless 3,9 nd (n 9)
- LFMI : ecmwf_ifs025 2,4 nd (n 9) · icon_eu 2,9 nd (n 9) · meteofrance_arome_france_hd 3,1 nd (n 9) · gfs_seamless 3,1 nd (n 9) · meteofrance_arome_france 3,3 nd (n 9) · meteofrance_arpege_europe 3,5 nd (n 9)
