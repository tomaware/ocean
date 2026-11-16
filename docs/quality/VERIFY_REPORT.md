# Remise en question (③)

Généré le 2026-11-16 19:39 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 40 prévisions archivées sur 153 h ; 4011 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 2,2 · meteofrance_arome_france_hd 2,3 · icon_eu 2,9 · icon_d2 3,3 · ecmwf_ifs025 3,4 · meteofrance_arpege_europe 3,4 · gfs_seamless 3,5 |
| LFMP | gfs_seamless 1,9 · ecmwf_ifs025 1,9 · icon_eu 1,9 · meteofrance_arome_france_hd 2,0 · meteofrance_arome_france 2,0 · meteofrance_arpege_europe 2,4 |
| LFTH | ecmwf_ifs025 2,2 · meteofrance_arome_france_hd 2,4 · meteofrance_arpege_europe 2,4 · gfs_seamless 2,4 · meteofrance_arome_france 2,5 · icon_eu 2,6 |
| LFML | ecmwf_ifs025 2,0 · meteofrance_arome_france 2,0 · meteofrance_arome_france_hd 2,2 · icon_eu 2,4 · meteofrance_arpege_europe 3,3 · gfs_seamless 4,5 |
| LFMI | meteofrance_arome_france 1,9 · meteofrance_arome_france_hd 2,0 · icon_eu 2,3 · ecmwf_ifs025 2,5 · meteofrance_arpege_europe 2,7 · gfs_seamless 3,0 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.29 · ewam 0.33 · ecmwf_wam025 0.36 · gwam 0.50 · ncep_gfswave025 1.09 |
| 03404 | ewam 0.14 · gwam 0.15 · ncep_gfswave025 0.22 · meteofrance_wave 0.26 · ecmwf_wam025 0.28 |
| 01101 | meteofrance_wave 0.17 · ecmwf_wam025 0.17 · ewam 0.17 · gwam 0.20 · ncep_gfswave025 0.22 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 9.97, ×0.95 (MAE 0.28 m, n 177) ; ecmwf_wam025 poids 5.62, ×0.84 (MAE 0.37 m, n 177) ; ewam poids 8.39, ×0.88 (MAE 0.28 m, n 177) ; gwam poids 2.09, ×0.8 (MAE 0.5 m, n 177) ; copernicus poids 15.73, ×1 (MAE 0.22 m, n 99)
  - 03404 : meteofrance_wave poids 12.31, ×1.07 (MAE 0.24 m, n 177) ; ecmwf_wam025 poids 8.06, ×0.96 (MAE 0.29 m, n 177) ; ewam poids 15.27, ×0.99 (MAE 0.16 m, n 177) ; gwam poids 7.14, ×0.92 (MAE 0.21 m, n 177) ; ncep_gfswave025 poids 7.06, ×1.08 (MAE 0.21 m, n 177) ; copernicus poids 16.21, ×1.08 (MAE 0.22 m, n 99)
  - 01102 : 
  - 01101 : meteofrance_wave poids 19.8, ×1.12 (MAE 0.14 m, n 177) ; ecmwf_wam025 poids 10.19, ×0.86 (MAE 0.24 m, n 177) ; ewam poids 15.29, ×0.97 (MAE 0.16 m, n 177) ; gwam poids 4.9, ×0.85 (MAE 0.29 m, n 177) ; ncep_gfswave025 poids 6.39, ×1 (MAE 0.23 m, n 177) ; copernicus poids 24.9, ×0.98 (MAE 0.13 m, n 99)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.98, Port Camargue × 1 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

40 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arome_france 2,8 nd (n 11) · gfs_seamless 3,1 nd (n 11) · meteofrance_arome_france_hd 3,1 nd (n 11) · icon_eu 3,2 nd (n 11) · icon_d2 3,3 nd (n 11) · meteofrance_arpege_europe 3,6 nd (n 11) · ecmwf_ifs025 4,1 nd (n 11)
- LFMP : meteofrance_arome_france 1,4 nd (n 11) · meteofrance_arome_france_hd 1,8 nd (n 11) · icon_eu 2,2 nd (n 11) · gfs_seamless 2,7 nd (n 11) · meteofrance_arpege_europe 2,8 nd (n 11) · ecmwf_ifs025 2,9 nd (n 11)
- LFTH : gfs_seamless 2,1 nd (n 11) · meteofrance_arome_france_hd 2,2 nd (n 11) · meteofrance_arome_france 2,3 nd (n 11) · meteofrance_arpege_europe 2,4 nd (n 11) · icon_eu 2,5 nd (n 11) · ecmwf_ifs025 2,7 nd (n 11)
- LFML : meteofrance_arome_france 1,7 nd (n 11) · ecmwf_ifs025 1,8 nd (n 11) · meteofrance_arome_france_hd 2,0 nd (n 11) · icon_eu 2,5 nd (n 11) · meteofrance_arpege_europe 3,8 nd (n 11) · gfs_seamless 4,8 nd (n 11)
- LFMI : icon_eu 2,3 nd (n 9) · meteofrance_arome_france_hd 2,8 nd (n 9) · meteofrance_arpege_europe 2,8 nd (n 9) · meteofrance_arome_france 3,0 nd (n 9) · ecmwf_ifs025 3,2 nd (n 9) · gfs_seamless 4,0 nd (n 9)
