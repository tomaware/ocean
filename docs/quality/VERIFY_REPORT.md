# Remise en question (③)

Généré le 2026-11-20 05:43 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 63 prévisions archivées sur 243 h ; 5755 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 2,4 · meteofrance_arome_france_hd 2,4 · meteofrance_arpege_europe 2,5 · icon_d2 2,9 · icon_eu 2,9 · gfs_seamless 3,0 · ecmwf_ifs025 3,3 |
| LFMP | icon_eu 2,8 · meteofrance_arome_france 2,9 · meteofrance_arome_france_hd 3,0 · meteofrance_arpege_europe 3,1 · gfs_seamless 3,1 · ecmwf_ifs025 4,4 |
| LFTH | meteofrance_arome_france_hd 2,4 · meteofrance_arome_france 2,4 · meteofrance_arpege_europe 2,7 · ecmwf_ifs025 3,7 · icon_eu 3,7 · gfs_seamless 4,2 |
| LFML | meteofrance_arome_france_hd 2,2 · meteofrance_arome_france 2,3 · meteofrance_arpege_europe 2,9 · icon_eu 3,8 · gfs_seamless 4,1 · ecmwf_ifs025 4,6 |
| LFMI | meteofrance_arpege_europe 2,6 · meteofrance_arome_france_hd 2,7 · meteofrance_arome_france 2,8 · gfs_seamless 3,4 · ecmwf_ifs025 3,6 · icon_eu 4,0 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.17 · meteofrance_wave 0.18 · ecmwf_wam025 0.36 · gwam 0.37 · ncep_gfswave025 0.97 |
| 03404 | meteofrance_wave 0.13 · ewam 0.13 · ncep_gfswave025 0.24 · gwam 0.26 · ecmwf_wam025 0.28 |
| 01101 | meteofrance_wave 0.13 · ewam 0.15 · ncep_gfswave025 0.24 · ecmwf_wam025 0.28 · gwam 0.33 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 16.89, ×0.9 (MAE 0.18 m, n 154) ; ecmwf_wam025 poids 6.49, ×0.8 (MAE 0.34 m, n 154) ; ewam poids 14.57, ×0.89 (MAE 0.17 m, n 154) ; gwam poids 3.53, ×0.8 (MAE 0.36 m, n 154) ; copernicus poids 15.65, ×0.89 (MAE 0.22 m, n 100)
  - 03404 : meteofrance_wave poids 20.68, ×0.94 (MAE 0.13 m, n 154) ; ecmwf_wam025 poids 9.15, ×0.81 (MAE 0.26 m, n 154) ; ewam poids 17.77, ×0.92 (MAE 0.13 m, n 154) ; gwam poids 5.92, ×0.82 (MAE 0.25 m, n 154) ; ncep_gfswave025 poids 6.54, ×0.86 (MAE 0.23 m, n 154) ; copernicus poids 19.75, ×0.88 (MAE 0.18 m, n 100)
  - 01102 : 
  - 01101 : meteofrance_wave poids 19.96, ×1.25 (MAE 0.14 m, n 129) ; ecmwf_wam025 poids 9.97, ×0.84 (MAE 0.25 m, n 129) ; ewam poids 15.92, ×1.05 (MAE 0.15 m, n 129) ; gwam poids 4.58, ×0.81 (MAE 0.3 m, n 129) ; ncep_gfswave025 poids 6.84, ×0.91 (MAE 0.22 m, n 129) ; copernicus poids 28.53, ×1.01 (MAE 0.1 m, n 75)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.96, Port Camargue × 1.04 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

63 prévisions archivées. Classement à 24 h :

- LFMT : gfs_seamless 2,6 nd (n 10) · meteofrance_arome_france 2,8 nd (n 10) · meteofrance_arome_france_hd 3,0 nd (n 10) · meteofrance_arpege_europe 3,1 nd (n 10) · icon_d2 3,8 nd (n 10) · icon_eu 4,0 nd (n 10) · ecmwf_ifs025 4,1 nd (n 10)
- LFMP : meteofrance_arome_france_hd 2,8 nd (n 10) · meteofrance_arome_france 2,9 nd (n 10) · gfs_seamless 2,9 nd (n 10) · meteofrance_arpege_europe 3,3 nd (n 10) · icon_eu 3,4 nd (n 10) · ecmwf_ifs025 3,6 nd (n 10)
- LFTH : meteofrance_arome_france_hd 2,1 nd (n 10) · meteofrance_arpege_europe 2,1 nd (n 10) · meteofrance_arome_france 2,2 nd (n 10) · ecmwf_ifs025 3,2 nd (n 10) · icon_eu 3,8 nd (n 10) · gfs_seamless 4,7 nd (n 10)
- LFML : meteofrance_arpege_europe 2,6 nd (n 10) · meteofrance_arome_france 2,7 nd (n 10) · meteofrance_arome_france_hd 2,8 nd (n 10) · icon_eu 3,1 nd (n 10) · gfs_seamless 4,1 nd (n 10) · ecmwf_ifs025 4,4 nd (n 10)
- LFMI : ecmwf_ifs025 2,4 nd (n 10) · meteofrance_arome_france_hd 3,2 nd (n 10) · icon_eu 3,2 nd (n 10) · meteofrance_arome_france 3,3 nd (n 10) · meteofrance_arpege_europe 3,3 nd (n 10) · gfs_seamless 3,4 nd (n 10)
