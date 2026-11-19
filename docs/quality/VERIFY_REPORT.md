# Remise en question (③)

Généré le 2026-11-19 06:38 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 56 prévisions archivées sur 222 h ; 4943 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france_hd 2,2 · meteofrance_arome_france 2,2 · icon_d2 2,2 · icon_eu 2,4 · ecmwf_ifs025 2,4 · gfs_seamless 2,5 · meteofrance_arpege_europe 2,6 |
| LFMP | meteofrance_arome_france 2,3 · meteofrance_arome_france_hd 2,4 · icon_eu 2,4 · meteofrance_arpege_europe 2,7 · ecmwf_ifs025 2,8 · gfs_seamless 3,1 |
| LFTH | meteofrance_arpege_europe 2,4 · ecmwf_ifs025 2,7 · meteofrance_arome_france_hd 2,8 · meteofrance_arome_france 2,8 · gfs_seamless 2,8 · icon_eu 3,3 |
| LFML | meteofrance_arome_france 2,3 · meteofrance_arome_france_hd 2,3 · icon_eu 2,8 · ecmwf_ifs025 2,9 · meteofrance_arpege_europe 3,1 · gfs_seamless 4,0 |
| LFMI | meteofrance_arpege_europe 1,9 · meteofrance_arome_france_hd 2,0 · meteofrance_arome_france 2,0 · gfs_seamless 2,4 · ecmwf_ifs025 2,6 · icon_eu 2,9 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.15 · meteofrance_wave 0.18 · ecmwf_wam025 0.29 · gwam 0.31 · ncep_gfswave025 0.77 |
| 03404 | ewam 0.10 · ncep_gfswave025 0.11 · meteofrance_wave 0.14 · gwam 0.17 · ecmwf_wam025 0.18 |
| 01101 | ncep_gfswave025 0.10 · ewam 0.13 · ecmwf_wam025 0.14 · gwam 0.16 · meteofrance_wave 0.17 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 16.49, ×0.87 (MAE 0.18 m, n 158) ; ecmwf_wam025 poids 8.25, ×0.8 (MAE 0.28 m, n 158) ; ewam poids 16.2, ×0.89 (MAE 0.15 m, n 158) ; gwam poids 4.44, ×0.8 (MAE 0.31 m, n 158) ; copernicus poids 16.77, ×0.88 (MAE 0.21 m, n 98)
  - 03404 : meteofrance_wave poids 20.09, ×0.95 (MAE 0.14 m, n 158) ; ecmwf_wam025 poids 13.27, ×0.86 (MAE 0.19 m, n 158) ; ewam poids 20.19, ×0.96 (MAE 0.1 m, n 158) ; gwam poids 8.78, ×0.87 (MAE 0.17 m, n 158) ; ncep_gfswave025 poids 11.53, ×0.96 (MAE 0.11 m, n 158) ; copernicus poids 20.71, ×0.9 (MAE 0.17 m, n 98)
  - 01102 : 
  - 01101 : meteofrance_wave poids 18.48, ×1.25 (MAE 0.16 m, n 137) ; ecmwf_wam025 poids 15.65, ×0.9 (MAE 0.15 m, n 137) ; ewam poids 17.42, ×1.12 (MAE 0.13 m, n 137) ; gwam poids 8.07, ×0.92 (MAE 0.19 m, n 137) ; ncep_gfswave025 poids 10.7, ×0.99 (MAE 0.13 m, n 137) ; copernicus poids 28.75, ×1 (MAE 0.09 m, n 77)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.97, Port Camargue × 1.05 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

56 prévisions archivées. Classement à 24 h :

- LFMT : icon_d2 1,1 nd (n 8) · icon_eu 1,4 nd (n 8) · gfs_seamless 1,8 nd (n 8) · meteofrance_arome_france_hd 2,1 nd (n 8) · meteofrance_arome_france 2,5 nd (n 8) · ecmwf_ifs025 2,6 nd (n 8) · meteofrance_arpege_europe 2,9 nd (n 8)
- LFMP : meteofrance_arome_france_hd 2,1 nd (n 8) · meteofrance_arome_france 2,4 nd (n 8) · ecmwf_ifs025 2,9 nd (n 8) · gfs_seamless 3,2 nd (n 8) · meteofrance_arpege_europe 3,2 nd (n 8) · icon_eu 3,5 nd (n 8)
- LFTH : ecmwf_ifs025 2,9 nd (n 8) · icon_eu 3,1 nd (n 8) · meteofrance_arome_france_hd 3,1 nd (n 8) · meteofrance_arome_france 3,2 nd (n 8) · meteofrance_arpege_europe 3,7 nd (n 8) · gfs_seamless 4,0 nd (n 8)
- LFML : meteofrance_arome_france_hd 2,4 nd (n 8) · meteofrance_arome_france 2,5 nd (n 8) · meteofrance_arpege_europe 2,8 nd (n 8) · ecmwf_ifs025 3,5 nd (n 8) · icon_eu 3,5 nd (n 8) · gfs_seamless 4,1 nd (n 8)
- LFMI : meteofrance_arome_france_hd 1,8 nd (n 8) · meteofrance_arome_france 1,9 nd (n 8) · gfs_seamless 2,5 nd (n 8) · icon_eu 2,6 nd (n 8) · ecmwf_ifs025 2,7 nd (n 8) · meteofrance_arpege_europe 2,9 nd (n 8)
