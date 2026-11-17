# Remise en question (③)

Généré le 2026-11-17 00:25 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 42 prévisions archivées sur 168 h ; 4160 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 2,0 · meteofrance_arome_france_hd 2,2 · icon_eu 3,0 · meteofrance_arpege_europe 3,2 · icon_d2 3,3 · gfs_seamless 3,4 · ecmwf_ifs025 3,7 |
| LFMP | ecmwf_ifs025 1,9 · meteofrance_arome_france_hd 2,0 · icon_eu 2,0 · gfs_seamless 2,0 · meteofrance_arome_france 2,0 · meteofrance_arpege_europe 2,4 |
| LFTH | meteofrance_arome_france_hd 1,9 · meteofrance_arome_france 2,0 · meteofrance_arpege_europe 2,0 · gfs_seamless 2,0 · ecmwf_ifs025 2,2 · icon_eu 2,3 |
| LFML | meteofrance_arome_france 1,8 · ecmwf_ifs025 1,9 · meteofrance_arome_france_hd 2,0 · icon_eu 2,1 · meteofrance_arpege_europe 3,1 · gfs_seamless 4,2 |
| LFMI | meteofrance_arome_france 1,7 · meteofrance_arome_france_hd 1,7 · icon_eu 2,1 · ecmwf_ifs025 2,2 · meteofrance_arpege_europe 2,4 · gfs_seamless 2,6 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.28 · ewam 0.31 · ecmwf_wam025 0.33 · gwam 0.44 · ncep_gfswave025 1.05 |
| 03404 | ewam 0.13 · gwam 0.16 · ncep_gfswave025 0.22 · meteofrance_wave 0.26 · ecmwf_wam025 0.26 |
| 01101 | ecmwf_wam025 0.16 · ewam 0.16 · meteofrance_wave 0.18 · gwam 0.19 · ncep_gfswave025 0.22 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 10.28, ×0.98 (MAE 0.28 m, n 144) ; ecmwf_wam025 poids 6.8, ×0.89 (MAE 0.33 m, n 144) ; ewam poids 7.32, ×0.88 (MAE 0.31 m, n 144) ; gwam poids 2.49, ×0.82 (MAE 0.45 m, n 144) ; copernicus poids 19.16, ×0.99 (MAE 0.18 m, n 102)
  - 03404 : meteofrance_wave poids 11.26, ×1.13 (MAE 0.26 m, n 144) ; ecmwf_wam025 poids 9.31, ×1.03 (MAE 0.26 m, n 144) ; ewam poids 16.84, ×1.01 (MAE 0.14 m, n 144) ; gwam poids 9.53, ×0.98 (MAE 0.15 m, n 144) ; ncep_gfswave025 poids 6.87, ×1.15 (MAE 0.22 m, n 144) ; copernicus poids 15.47, ×1.07 (MAE 0.22 m, n 102)
  - 01102 : 
  - 01101 : meteofrance_wave poids 17.42, ×1.18 (MAE 0.17 m, n 144) ; ecmwf_wam025 poids 15.82, ×0.94 (MAE 0.15 m, n 144) ; ewam poids 15.77, ×1 (MAE 0.15 m, n 144) ; gwam poids 7.98, ×0.95 (MAE 0.19 m, n 144) ; ncep_gfswave025 poids 7.16, ×1.09 (MAE 0.21 m, n 144) ; copernicus poids 24.66, ×1 (MAE 0.13 m, n 102)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.92, Port Camargue × 0.97 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

42 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arome_france 2,4 nd (n 13) · meteofrance_arome_france_hd 2,7 nd (n 13) · icon_eu 2,8 nd (n 13) · gfs_seamless 2,9 nd (n 13) · icon_d2 3,0 nd (n 13) · meteofrance_arpege_europe 3,3 nd (n 13) · ecmwf_ifs025 4,1 nd (n 13)
- LFMP : meteofrance_arome_france 1,7 nd (n 13) · meteofrance_arome_france_hd 2,0 nd (n 13) · icon_eu 2,1 nd (n 13) · gfs_seamless 2,4 nd (n 13) · ecmwf_ifs025 2,6 nd (n 13) · meteofrance_arpege_europe 2,7 nd (n 13)
- LFTH : meteofrance_arome_france_hd 2,0 nd (n 13) · meteofrance_arome_france 2,0 nd (n 13) · gfs_seamless 2,1 nd (n 13) · icon_eu 2,3 nd (n 13) · meteofrance_arpege_europe 2,4 nd (n 13) · ecmwf_ifs025 2,4 nd (n 13)
- LFML : meteofrance_arome_france 1,7 nd (n 13) · meteofrance_arome_france_hd 1,8 nd (n 13) · ecmwf_ifs025 1,8 nd (n 13) · icon_eu 2,6 nd (n 13) · meteofrance_arpege_europe 3,5 nd (n 13) · gfs_seamless 4,4 nd (n 13)
- LFMI : icon_eu 2,2 nd (n 11) · meteofrance_arpege_europe 2,8 nd (n 11) · ecmwf_ifs025 2,8 nd (n 11) · meteofrance_arome_france_hd 2,9 nd (n 11) · meteofrance_arome_france 3,1 nd (n 11) · gfs_seamless 3,6 nd (n 11)
