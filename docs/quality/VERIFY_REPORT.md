# Remise en question (③)

Généré le 2026-11-12 18:30 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 15 prévisions archivées sur 66 h ; 1862 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 1,5 · gfs_seamless 1,5 · meteofrance_arome_france_hd 1,6 · icon_eu 1,8 · icon_d2 1,9 · meteofrance_arpege_europe 2,3 · ecmwf_ifs025 2,8 |
| LFMP | meteofrance_arome_france_hd 1,8 · meteofrance_arome_france 1,8 · ecmwf_ifs025 1,8 · icon_eu 1,9 · gfs_seamless 2,2 · meteofrance_arpege_europe 2,4 |
| LFTH | icon_eu 1,7 · meteofrance_arome_france_hd 2,7 · meteofrance_arome_france 2,7 · ecmwf_ifs025 2,7 · gfs_seamless 3,2 · meteofrance_arpege_europe 3,5 |
| LFML | ecmwf_ifs025 2,0 · meteofrance_arome_france_hd 2,1 · meteofrance_arome_france 2,2 · icon_eu 2,5 · meteofrance_arpege_europe 3,6 · gfs_seamless 3,8 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.13 · meteofrance_wave 0.16 · ecmwf_wam025 0.17 · gwam 0.17 · ncep_gfswave025 1.16 |
| 03404 | ncep_gfswave025 0.12 · ecmwf_wam025 0.13 · gwam 0.14 · meteofrance_wave 0.16 · ewam 0.17 |
| 01101 | ecmwf_wam025 0.11 · gwam 0.14 · ncep_gfswave025 0.15 · ewam 0.19 · meteofrance_wave 0.20 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 13.85, ×1.08 (MAE 0.22 m, n 179) ; ecmwf_wam025 poids 11.78, ×1.05 (MAE 0.21 m, n 179) ; ewam poids 16.35, ×0.98 (MAE 0.15 m, n 179) ; gwam poids 8.55, ×0.95 (MAE 0.17 m, n 179) ; copernicus poids 28.01, ×0.97 (MAE 0.1 m, n 101)
  - 03404 : meteofrance_wave poids 15.5, ×1.09 (MAE 0.19 m, n 113) ; ecmwf_wam025 poids 15.79, ×1.06 (MAE 0.15 m, n 113) ; ewam poids 17, ×0.97 (MAE 0.14 m, n 113) ; gwam poids 11.31, ×0.97 (MAE 0.11 m, n 113) ; ncep_gfswave025 poids 10.22, ×1.01 (MAE 0.14 m, n 113) ; copernicus poids 29.78, ×0.97 (MAE 0.08 m, n 35)
  - 01102 : meteofrance_wave poids —, ×— (MAE 0.44 m, n 29) ; ecmwf_wam025 poids —, ×— (MAE 0.16 m, n 29) ; ewam poids —, ×— (MAE 0.18 m, n 29) ; gwam poids —, ×— (MAE 0.45 m, n 29)
  - 01101 : meteofrance_wave poids 12.44, ×1.23 (MAE 0.24 m, n 181) ; ecmwf_wam025 poids 17.01, ×0.93 (MAE 0.14 m, n 181) ; ewam poids 12.99, ×0.95 (MAE 0.19 m, n 181) ; gwam poids 10.11, ×0.96 (MAE 0.14 m, n 181) ; ncep_gfswave025 poids 9.32, ×0.93 (MAE 0.16 m, n 181) ; copernicus poids 29.75, ×1.01 (MAE 0.08 m, n 103)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.01, Port Camargue × 0.98 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

15 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 1,9 nd (n 13) · icon_d2 2,0 nd (n 13) · icon_eu 2,2 nd (n 13) · meteofrance_arome_france 2,4 nd (n 13) · meteofrance_arome_france_hd 2,5 nd (n 13) · ecmwf_ifs025 2,7 nd (n 13) · gfs_seamless 3,1 nd (n 13)
- LFMP : ecmwf_ifs025 2,0 nd (n 13) · meteofrance_arome_france 2,0 nd (n 13) · meteofrance_arome_france_hd 2,1 nd (n 13) · icon_eu 2,3 nd (n 13) · gfs_seamless 2,3 nd (n 13) · meteofrance_arpege_europe 4,4 nd (n 13)
- LFTH : icon_eu 1,9 nd (n 13) · meteofrance_arome_france 2,3 nd (n 13) · meteofrance_arome_france_hd 2,3 nd (n 13) · ecmwf_ifs025 2,5 nd (n 13) · gfs_seamless 3,2 nd (n 13) · meteofrance_arpege_europe 3,2 nd (n 13)
- LFML : ecmwf_ifs025 1,8 nd (n 7) · icon_eu 2,7 nd (n 7) · meteofrance_arome_france 2,8 nd (n 7) · meteofrance_arome_france_hd 2,8 nd (n 7) · meteofrance_arpege_europe 2,9 nd (n 7) · gfs_seamless 4,9 nd (n 7)
