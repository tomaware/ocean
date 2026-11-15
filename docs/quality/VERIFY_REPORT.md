# Remise en question (③)

Généré le 2026-11-15 18:15 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 36 prévisions archivées sur 138 h ; 3489 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arpege_europe 2,6 · icon_d2 2,7 · icon_eu 2,7 · meteofrance_arome_france_hd 2,9 · meteofrance_arome_france 2,9 · gfs_seamless 3,7 · ecmwf_ifs025 3,9 |
| LFMP | icon_eu 1,4 · gfs_seamless 1,6 · meteofrance_arome_france_hd 1,6 · meteofrance_arome_france 1,7 · ecmwf_ifs025 1,7 · meteofrance_arpege_europe 2,1 |
| LFTH | ecmwf_ifs025 2,2 · icon_eu 2,8 · gfs_seamless 4,2 · meteofrance_arpege_europe 4,2 · meteofrance_arome_france_hd 4,8 · meteofrance_arome_france 4,9 |
| LFML | meteofrance_arome_france 2,1 · meteofrance_arome_france_hd 2,3 · ecmwf_ifs025 2,4 · icon_eu 2,5 · meteofrance_arpege_europe 2,9 · gfs_seamless 5,5 |
| LFMI | meteofrance_arome_france_hd 2,4 · meteofrance_arome_france 2,4 · meteofrance_arpege_europe 2,7 · ecmwf_ifs025 2,9 · icon_eu 3,3 · gfs_seamless 3,5 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.30 · meteofrance_wave 0.33 · ecmwf_wam025 0.42 · gwam 0.56 · ncep_gfswave025 1.12 |
| 03404 | ewam 0.17 · gwam 0.24 · ncep_gfswave025 0.25 · meteofrance_wave 0.28 · ecmwf_wam025 0.33 |
| 01101 | meteofrance_wave 0.16 · ewam 0.19 · ncep_gfswave025 0.26 · ecmwf_wam025 0.27 · gwam 0.34 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 10.15, ×0.94 (MAE 0.28 m, n 178) ; ecmwf_wam025 poids 6.21, ×0.86 (MAE 0.35 m, n 178) ; ewam poids 8.54, ×0.85 (MAE 0.28 m, n 178) ; gwam poids 2.13, ×0.8 (MAE 0.49 m, n 178) ; copernicus poids 9.13, ×0.87 (MAE 0.34 m, n 103)
  - 03404 : meteofrance_wave poids 11.07, ×1.05 (MAE 0.26 m, n 163) ; ecmwf_wam025 poids 7.82, ×0.95 (MAE 0.3 m, n 163) ; ewam poids 13.44, ×0.95 (MAE 0.19 m, n 163) ; gwam poids 6.32, ×0.89 (MAE 0.23 m, n 163) ; ncep_gfswave025 poids 6.34, ×1.05 (MAE 0.23 m, n 163) ; copernicus poids 25.09, ×0.99 (MAE 0.13 m, n 103)
  - 01102 : 
  - 01101 : meteofrance_wave poids 17.2, ×1.12 (MAE 0.17 m, n 180) ; ecmwf_wam025 poids 9.07, ×0.84 (MAE 0.27 m, n 180) ; ewam poids 10.64, ×0.9 (MAE 0.23 m, n 180) ; gwam poids 3.89, ×0.81 (MAE 0.34 m, n 180) ; ncep_gfswave025 poids 5.29, ×0.93 (MAE 0.27 m, n 180) ; copernicus poids 24.66, ×0.96 (MAE 0.13 m, n 103)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.15, Port Camargue × 1.11 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

36 prévisions archivées. Classement à 24 h :

- LFMT : icon_d2 2,7 nd (n 12) · meteofrance_arome_france 2,9 nd (n 12) · meteofrance_arpege_europe 3,0 nd (n 12) · meteofrance_arome_france_hd 3,3 nd (n 12) · icon_eu 3,4 nd (n 12) · gfs_seamless 3,5 nd (n 12) · ecmwf_ifs025 4,5 nd (n 12)
- LFMP : gfs_seamless 1,2 nd (n 12) · icon_eu 1,4 nd (n 12) · meteofrance_arpege_europe 1,4 nd (n 12) · ecmwf_ifs025 1,6 nd (n 12) · meteofrance_arome_france 1,8 nd (n 12) · meteofrance_arome_france_hd 1,9 nd (n 12)
- LFTH : icon_eu 2,2 nd (n 12) · ecmwf_ifs025 2,8 nd (n 12) · meteofrance_arpege_europe 3,3 nd (n 12) · gfs_seamless 4,6 nd (n 12) · meteofrance_arome_france_hd 5,0 nd (n 12) · meteofrance_arome_france 5,0 nd (n 12)
- LFML : icon_eu 2,6 nd (n 12) · meteofrance_arome_france 2,7 nd (n 12) · meteofrance_arome_france_hd 2,8 nd (n 12) · meteofrance_arpege_europe 2,9 nd (n 12) · ecmwf_ifs025 3,1 nd (n 12) · gfs_seamless 6,0 nd (n 12)
- LFMI : 
