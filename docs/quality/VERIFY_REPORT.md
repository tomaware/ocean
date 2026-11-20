# Remise en question (③)

Généré le 2026-11-20 01:53 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 62 prévisions archivées sur 240 h ; 5475 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france_hd 2,5 · meteofrance_arome_france 2,5 · meteofrance_arpege_europe 2,6 · gfs_seamless 2,7 · icon_d2 3,0 · icon_eu 3,1 · ecmwf_ifs025 3,6 |
| LFMP | meteofrance_arome_france_hd 3,1 · icon_eu 3,1 · meteofrance_arome_france 3,1 · meteofrance_arpege_europe 3,3 · gfs_seamless 3,5 · ecmwf_ifs025 4,4 |
| LFTH | meteofrance_arome_france_hd 2,6 · meteofrance_arpege_europe 2,6 · meteofrance_arome_france 2,6 · gfs_seamless 3,6 · ecmwf_ifs025 3,7 · icon_eu 3,7 |
| LFML | meteofrance_arome_france_hd 2,4 · meteofrance_arome_france 2,6 · meteofrance_arpege_europe 3,1 · icon_eu 3,9 · ecmwf_ifs025 4,3 · gfs_seamless 4,6 |
| LFMI | meteofrance_arpege_europe 2,6 · meteofrance_arome_france_hd 2,7 · meteofrance_arome_france 2,8 · gfs_seamless 3,3 · ecmwf_ifs025 3,8 · icon_eu 4,1 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.18 · ewam 0.18 · ecmwf_wam025 0.35 · gwam 0.39 · ncep_gfswave025 0.95 |
| 03404 | ewam 0.13 · meteofrance_wave 0.14 · ncep_gfswave025 0.23 · ecmwf_wam025 0.27 · gwam 0.27 |
| 01101 | meteofrance_wave 0.14 · ewam 0.16 · ncep_gfswave025 0.22 · ecmwf_wam025 0.25 · gwam 0.33 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 16.41, ×0.9 (MAE 0.18 m, n 148) ; ecmwf_wam025 poids 6.39, ×0.8 (MAE 0.34 m, n 148) ; ewam poids 13.98, ×0.89 (MAE 0.18 m, n 148) ; gwam poids 3.27, ×0.8 (MAE 0.38 m, n 148) ; copernicus poids 11.11, ×0.84 (MAE 0.29 m, n 106)
  - 03404 : meteofrance_wave poids 20.39, ×0.94 (MAE 0.14 m, n 148) ; ecmwf_wam025 poids 9.21, ×0.82 (MAE 0.26 m, n 148) ; ewam poids 17.27, ×0.92 (MAE 0.13 m, n 148) ; gwam poids 5.55, ×0.82 (MAE 0.26 m, n 148) ; ncep_gfswave025 poids 6.62, ×0.87 (MAE 0.23 m, n 148) ; copernicus poids 12.44, ×0.83 (MAE 0.27 m, n 106)
  - 01102 : 
  - 01101 : meteofrance_wave poids 19.49, ×1.25 (MAE 0.15 m, n 123) ; ecmwf_wam025 poids 10.41, ×0.84 (MAE 0.24 m, n 123) ; ewam poids 15.73, ×1.05 (MAE 0.15 m, n 123) ; gwam poids 4.39, ×0.81 (MAE 0.31 m, n 123) ; ncep_gfswave025 poids 7.18, ×0.91 (MAE 0.21 m, n 123) ; copernicus poids 25.36, ×0.97 (MAE 0.12 m, n 81)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.95, Port Camargue × 1.03 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

62 prévisions archivées. Classement à 24 h :

- LFMT : gfs_seamless 1,9 nd (n 9) · meteofrance_arome_france 3,0 nd (n 9) · meteofrance_arome_france_hd 3,4 nd (n 9) · meteofrance_arpege_europe 3,8 nd (n 9) · icon_d2 4,2 nd (n 9) · icon_eu 4,4 nd (n 9) · ecmwf_ifs025 4,9 nd (n 9)
- LFMP : meteofrance_arome_france_hd 2,8 nd (n 9) · meteofrance_arome_france 2,9 nd (n 9) · meteofrance_arpege_europe 3,5 nd (n 9) · gfs_seamless 3,5 nd (n 9) · icon_eu 3,6 nd (n 9) · ecmwf_ifs025 3,7 nd (n 9)
- LFTH : meteofrance_arome_france_hd 2,2 nd (n 9) · meteofrance_arpege_europe 2,2 nd (n 9) · meteofrance_arome_france 2,2 nd (n 9) · ecmwf_ifs025 3,3 nd (n 9) · icon_eu 3,9 nd (n 9) · gfs_seamless 4,7 nd (n 9)
- LFML : meteofrance_arome_france_hd 2,6 nd (n 9) · meteofrance_arome_france 2,6 nd (n 9) · icon_eu 2,8 nd (n 9) · meteofrance_arpege_europe 2,8 nd (n 9) · ecmwf_ifs025 3,8 nd (n 9) · gfs_seamless 4,3 nd (n 9)
- LFMI : ecmwf_ifs025 2,6 nd (n 9) · meteofrance_arome_france_hd 3,1 nd (n 9) · meteofrance_arome_france 3,1 nd (n 9) · icon_eu 3,3 nd (n 9) · gfs_seamless 3,4 nd (n 9) · meteofrance_arpege_europe 3,5 nd (n 9)
