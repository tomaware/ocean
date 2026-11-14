# Remise en question (③)

Généré le 2026-11-14 07:43 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 25 prévisions archivées sur 99 h ; 2575 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 2,1 · gfs_seamless 2,1 · meteofrance_arome_france_hd 2,4 · icon_d2 2,7 · ecmwf_ifs025 2,7 · meteofrance_arpege_europe 2,8 · icon_eu 3,0 |
| LFMP | meteofrance_arome_france_hd 2,0 · meteofrance_arome_france 2,1 · ecmwf_ifs025 2,7 · meteofrance_arpege_europe 3,1 · icon_eu 3,1 · gfs_seamless 3,2 |
| LFTH | icon_eu 2,0 · meteofrance_arome_france_hd 2,6 · meteofrance_arome_france 2,6 · meteofrance_arpege_europe 2,7 · gfs_seamless 3,0 · ecmwf_ifs025 3,9 |
| LFML | meteofrance_arome_france_hd 2,2 · meteofrance_arome_france 2,4 · icon_eu 2,8 · ecmwf_ifs025 3,5 · meteofrance_arpege_europe 4,1 · gfs_seamless 4,1 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.15 · meteofrance_wave 0.18 · ecmwf_wam025 0.30 · gwam 0.38 · ncep_gfswave025 0.91 |
| 03404 | meteofrance_wave 0.15 · ncep_gfswave025 0.16 · ewam 0.21 · ecmwf_wam025 0.27 · gwam 0.30 |
| 01101 | meteofrance_wave 0.15 · ewam 0.22 · ncep_gfswave025 0.24 · ecmwf_wam025 0.28 · gwam 0.35 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 17.8, ×0.91 (MAE 0.17 m, n 155) ; ecmwf_wam025 poids 8.79, ×0.84 (MAE 0.27 m, n 155) ; ewam poids 17.1, ×0.91 (MAE 0.14 m, n 155) ; gwam poids 3.82, ×0.8 (MAE 0.34 m, n 155) ; copernicus poids 20.07, ×0.95 (MAE 0.17 m, n 102)
  - 03404 : meteofrance_wave poids 19.47, ×0.92 (MAE 0.15 m, n 92) ; ecmwf_wam025 poids 9.1, ×0.85 (MAE 0.26 m, n 92) ; ewam poids 11.95, ×0.93 (MAE 0.21 m, n 92) ; gwam poids 4.71, ×0.83 (MAE 0.3 m, n 92) ; ncep_gfswave025 poids 0.47, ×0.91 (MAE 0.16 m, n 92) ; copernicus poids 24.05, ×0.94 (MAE 0.13 m, n 92)
  - 01102 : 
  - 01101 : meteofrance_wave poids 19.27, ×1.09 (MAE 0.15 m, n 157) ; ecmwf_wam025 poids 9.57, ×0.82 (MAE 0.25 m, n 157) ; ewam poids 11.1, ×0.91 (MAE 0.22 m, n 157) ; gwam poids 4.15, ×0.8 (MAE 0.32 m, n 157) ; ncep_gfswave025 poids 6.85, ×0.85 (MAE 0.22 m, n 157) ; copernicus poids 19.41, ×0.9 (MAE 0.18 m, n 103)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.07, Port Camargue × 1.08 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

25 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 2,3 nd (n 9) · icon_d2 2,9 nd (n 9) · icon_eu 2,9 nd (n 9) · ecmwf_ifs025 3,2 nd (n 9) · meteofrance_arome_france_hd 3,3 nd (n 9) · gfs_seamless 3,3 nd (n 9) · meteofrance_arome_france 3,3 nd (n 9)
- LFMP : meteofrance_arome_france 1,5 nd (n 9) · meteofrance_arome_france_hd 1,5 nd (n 9) · icon_eu 3,2 nd (n 9) · meteofrance_arpege_europe 3,6 nd (n 9) · ecmwf_ifs025 3,7 nd (n 9) · gfs_seamless 3,7 nd (n 9)
- LFTH : meteofrance_arome_france 1,9 nd (n 9) · meteofrance_arome_france_hd 2,0 nd (n 9) · icon_eu 2,0 nd (n 9) · ecmwf_ifs025 2,7 nd (n 9) · meteofrance_arpege_europe 3,3 nd (n 9) · gfs_seamless 4,5 nd (n 9)
- LFML : ecmwf_ifs025 1,9 nd (n 9) · icon_eu 2,2 nd (n 9) · meteofrance_arome_france_hd 3,4 nd (n 9) · meteofrance_arome_france 3,4 nd (n 9) · meteofrance_arpege_europe 5,4 nd (n 9) · gfs_seamless 5,4 nd (n 9)
