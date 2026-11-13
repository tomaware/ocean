# Remise en question (③)

Généré le 2026-11-13 18:28 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 22 prévisions archivées sur 90 h ; 2264 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 1,9 · gfs_seamless 2,1 · meteofrance_arome_france_hd 2,1 · icon_d2 2,8 · icon_eu 2,9 · meteofrance_arpege_europe 2,9 · ecmwf_ifs025 3,4 |
| LFMP | meteofrance_arome_france_hd 2,2 · meteofrance_arome_france 2,3 · ecmwf_ifs025 2,7 · icon_eu 3,1 · gfs_seamless 3,4 · meteofrance_arpege_europe 3,4 |
| LFTH | icon_eu 2,0 · meteofrance_arome_france 2,8 · meteofrance_arome_france_hd 2,9 · meteofrance_arpege_europe 3,1 · gfs_seamless 3,2 · ecmwf_ifs025 3,8 |
| LFML | meteofrance_arome_france_hd 2,3 · meteofrance_arome_france 2,5 · icon_eu 2,9 · ecmwf_ifs025 3,2 · meteofrance_arpege_europe 4,3 · gfs_seamless 4,9 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.10 · ewam 0.13 · ecmwf_wam025 0.19 · gwam 0.26 · ncep_gfswave025 0.94 |
| 03404 | meteofrance_wave 0.14 · ncep_gfswave025 0.19 · ewam 0.22 · ecmwf_wam025 0.25 · gwam 0.35 |
| 01101 | meteofrance_wave 0.13 · ewam 0.22 · ncep_gfswave025 0.22 · ecmwf_wam025 0.26 · gwam 0.34 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 21.29, ×0.98 (MAE 0.13 m, n 179) ; ecmwf_wam025 poids 12.69, ×0.91 (MAE 0.2 m, n 179) ; ewam poids 17.04, ×0.92 (MAE 0.14 m, n 179) ; gwam poids 5.7, ×0.85 (MAE 0.26 m, n 179) ; copernicus poids 25.54, ×0.99 (MAE 0.12 m, n 101)
  - 03404 : meteofrance_wave poids 18.48, ×0.99 (MAE 0.16 m, n 113) ; ecmwf_wam025 poids 11.35, ×0.93 (MAE 0.22 m, n 113) ; ewam poids 13.22, ×0.91 (MAE 0.19 m, n 113) ; gwam poids 5.71, ×0.87 (MAE 0.26 m, n 113) ; ncep_gfswave025 poids 9.47, ×0.93 (MAE 0.15 m, n 113) ; copernicus poids 23.08, ×0.94 (MAE 0.14 m, n 68)
  - 01102 : 
  - 01101 : meteofrance_wave poids 18.47, ×1.12 (MAE 0.16 m, n 181) ; ecmwf_wam025 poids 11.55, ×0.86 (MAE 0.22 m, n 181) ; ewam poids 12.93, ×0.93 (MAE 0.19 m, n 181) ; gwam poids 5.04, ×0.82 (MAE 0.28 m, n 181) ; ncep_gfswave025 poids 7.57, ×0.85 (MAE 0.2 m, n 181) ; copernicus poids 20.49, ×0.88 (MAE 0.17 m, n 103)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.01, Port Camargue × 1 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

22 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 1,9 nd (n 9) · icon_d2 2,4 nd (n 9) · icon_eu 2,6 nd (n 9) · meteofrance_arome_france 2,8 nd (n 9) · ecmwf_ifs025 3,0 nd (n 9) · meteofrance_arome_france_hd 3,1 nd (n 9) · gfs_seamless 3,8 nd (n 9)
- LFMP : meteofrance_arome_france 2,4 nd (n 9) · meteofrance_arome_france_hd 2,4 nd (n 9) · icon_eu 3,2 nd (n 9) · ecmwf_ifs025 3,4 nd (n 9) · gfs_seamless 3,9 nd (n 9) · meteofrance_arpege_europe 6,3 nd (n 9)
- LFTH : icon_eu 1,8 nd (n 9) · meteofrance_arome_france 2,3 nd (n 9) · meteofrance_arome_france_hd 2,3 nd (n 9) · ecmwf_ifs025 2,6 nd (n 9) · gfs_seamless 2,8 nd (n 9) · meteofrance_arpege_europe 3,4 nd (n 9)
- LFML : ecmwf_ifs025 1,7 nd (n 9) · icon_eu 2,5 nd (n 9) · meteofrance_arome_france_hd 3,2 nd (n 9) · meteofrance_arome_france 3,2 nd (n 9) · meteofrance_arpege_europe 3,9 nd (n 9) · gfs_seamless 4,9 nd (n 9)
