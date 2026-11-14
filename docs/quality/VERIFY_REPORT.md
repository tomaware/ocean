# Remise en question (③)

Généré le 2026-11-14 23:15 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 29 prévisions archivées sur 114 h ; 2750 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arpege_europe 2,0 · meteofrance_arome_france 2,1 · icon_d2 2,2 · gfs_seamless 2,4 · meteofrance_arome_france_hd 2,5 · ecmwf_ifs025 2,7 · icon_eu 2,7 |
| LFMP | meteofrance_arome_france_hd 1,6 · meteofrance_arome_france 1,7 · gfs_seamless 1,9 · icon_eu 2,1 · ecmwf_ifs025 2,3 · meteofrance_arpege_europe 2,4 |
| LFTH | ecmwf_ifs025 2,2 · icon_eu 2,4 · meteofrance_arpege_europe 3,4 · gfs_seamless 3,6 · meteofrance_arome_france_hd 4,0 · meteofrance_arome_france 4,0 |
| LFML | meteofrance_arome_france_hd 2,1 · meteofrance_arome_france 2,2 · icon_eu 2,4 · ecmwf_ifs025 3,4 · meteofrance_arpege_europe 3,7 · gfs_seamless 5,5 |
| LFMI | meteofrance_arome_france_hd 2,3 · meteofrance_arome_france 2,4 · meteofrance_arpege_europe 2,5 · icon_eu 3,0 · ecmwf_ifs025 3,6 · gfs_seamless 4,0 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.18 · meteofrance_wave 0.26 · ecmwf_wam025 0.33 · gwam 0.43 · ncep_gfswave025 0.97 |
| 03404 | meteofrance_wave 0.17 · ewam 0.18 · ncep_gfswave025 0.20 · ecmwf_wam025 0.26 · gwam 0.26 |
| 01101 | meteofrance_wave 0.15 · ewam 0.23 · ecmwf_wam025 0.29 · ncep_gfswave025 0.29 · gwam 0.36 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 14.16, ×0.92 (MAE 0.21 m, n 189) ; ecmwf_wam025 poids 8.78, ×0.86 (MAE 0.27 m, n 189) ; ewam poids 15.15, ×0.89 (MAE 0.16 m, n 189) ; gwam poids 3.63, ×0.8 (MAE 0.35 m, n 189) ; copernicus poids 13.25, ×0.89 (MAE 0.26 m, n 102)
  - 03404 : meteofrance_wave poids 17.5, ×0.93 (MAE 0.17 m, n 126) ; ecmwf_wam025 poids 9.22, ×0.86 (MAE 0.26 m, n 126) ; ewam poids 13.17, ×0.93 (MAE 0.19 m, n 126) ; gwam poids 5.72, ×0.84 (MAE 0.25 m, n 126) ; ncep_gfswave025 poids 7.74, ×0.99 (MAE 0.19 m, n 126) ; copernicus poids 21.52, ×0.9 (MAE 0.16 m, n 102)
  - 01102 : 
  - 01101 : meteofrance_wave poids 20.08, ×1.11 (MAE 0.14 m, n 191) ; ecmwf_wam025 poids 10.68, ×0.82 (MAE 0.23 m, n 191) ; ewam poids 12.09, ×0.94 (MAE 0.21 m, n 191) ; gwam poids 4.94, ×0.81 (MAE 0.29 m, n 191) ; ncep_gfswave025 poids 6.38, ×0.92 (MAE 0.23 m, n 191) ; copernicus poids 24.05, ×0.9 (MAE 0.13 m, n 102)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1, Port Camargue × 1.07 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

29 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 1,7 nd (n 9) · gfs_seamless 2,0 nd (n 9) · icon_d2 2,2 nd (n 9) · ecmwf_ifs025 2,4 nd (n 9) · meteofrance_arome_france 2,5 nd (n 9) · meteofrance_arome_france_hd 2,6 nd (n 9) · icon_eu 3,3 nd (n 9)
- LFMP : gfs_seamless 1,1 nd (n 9) · meteofrance_arome_france 1,8 nd (n 9) · meteofrance_arome_france_hd 1,8 nd (n 9) · meteofrance_arpege_europe 1,8 nd (n 9) · icon_eu 2,0 nd (n 9) · ecmwf_ifs025 2,1 nd (n 9)
- LFTH : icon_eu 2,3 nd (n 9) · ecmwf_ifs025 2,9 nd (n 9) · meteofrance_arpege_europe 3,4 nd (n 9) · meteofrance_arome_france_hd 4,4 nd (n 9) · meteofrance_arome_france 4,4 nd (n 9) · gfs_seamless 4,9 nd (n 9)
- LFML : meteofrance_arome_france_hd 2,3 nd (n 9) · icon_eu 2,4 nd (n 9) · meteofrance_arome_france 2,7 nd (n 9) · ecmwf_ifs025 2,9 nd (n 9) · meteofrance_arpege_europe 4,8 nd (n 9) · gfs_seamless 6,1 nd (n 9)
- LFMI : 
