# Remise en question (③)

Généré le 2026-11-13 21:29 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 23 prévisions archivées sur 93 h ; 2305 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 2,0 · gfs_seamless 2,1 · meteofrance_arome_france_hd 2,3 · icon_d2 2,9 · meteofrance_arpege_europe 2,9 · icon_eu 3,0 · ecmwf_ifs025 3,4 |
| LFMP | meteofrance_arome_france_hd 2,3 · meteofrance_arome_france 2,3 · ecmwf_ifs025 2,7 · icon_eu 3,1 · gfs_seamless 3,4 · meteofrance_arpege_europe 3,5 |
| LFTH | icon_eu 2,1 · meteofrance_arome_france 2,8 · meteofrance_arome_france_hd 2,8 · gfs_seamless 3,1 · meteofrance_arpege_europe 3,1 · ecmwf_ifs025 3,9 |
| LFML | meteofrance_arome_france_hd 2,4 · meteofrance_arome_france 2,6 · icon_eu 3,0 · ecmwf_ifs025 3,3 · meteofrance_arpege_europe 4,7 · gfs_seamless 5,0 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.10 · ewam 0.13 · ecmwf_wam025 0.21 · gwam 0.28 · ncep_gfswave025 0.95 |
| 03404 | meteofrance_wave 0.15 · ncep_gfswave025 0.20 · ewam 0.23 · ecmwf_wam025 0.27 · gwam 0.37 |
| 01101 | meteofrance_wave 0.13 · ncep_gfswave025 0.22 · ewam 0.23 · ecmwf_wam025 0.27 · gwam 0.35 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 21.22, ×0.97 (MAE 0.13 m, n 181) ; ecmwf_wam025 poids 11.93, ×0.9 (MAE 0.21 m, n 181) ; ewam poids 16.95, ×0.92 (MAE 0.14 m, n 181) ; gwam poids 5.57, ×0.85 (MAE 0.26 m, n 181) ; copernicus poids 25.88, ×0.99 (MAE 0.12 m, n 97)
  - 03404 : meteofrance_wave poids 18.6, ×0.99 (MAE 0.16 m, n 115) ; ecmwf_wam025 poids 11.32, ×0.93 (MAE 0.22 m, n 115) ; ewam poids 13.25, ×0.91 (MAE 0.19 m, n 115) ; gwam poids 5.82, ×0.87 (MAE 0.25 m, n 115) ; ncep_gfswave025 poids 9.57, ×0.93 (MAE 0.15 m, n 115) ; copernicus poids 23.71, ×0.95 (MAE 0.14 m, n 70)
  - 01102 : 
  - 01101 : meteofrance_wave poids 18.55, ×1.12 (MAE 0.16 m, n 183) ; ecmwf_wam025 poids 11.38, ×0.85 (MAE 0.22 m, n 183) ; ewam poids 12.99, ×0.93 (MAE 0.19 m, n 183) ; gwam poids 5.07, ×0.82 (MAE 0.28 m, n 183) ; ncep_gfswave025 poids 7.6, ×0.85 (MAE 0.2 m, n 183) ; copernicus poids 18.31, ×0.87 (MAE 0.19 m, n 99)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1, Port Camargue × 1.09 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

23 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 2,0 nd (n 9) · icon_d2 2,5 nd (n 9) · icon_eu 2,7 nd (n 9) · meteofrance_arome_france 2,9 nd (n 9) · ecmwf_ifs025 3,3 nd (n 9) · meteofrance_arome_france_hd 3,4 nd (n 9) · gfs_seamless 3,8 nd (n 9)
- LFMP : meteofrance_arome_france_hd 2,3 nd (n 9) · meteofrance_arome_france 2,4 nd (n 9) · icon_eu 3,3 nd (n 9) · ecmwf_ifs025 3,7 nd (n 9) · gfs_seamless 3,8 nd (n 9) · meteofrance_arpege_europe 6,5 nd (n 9)
- LFTH : icon_eu 1,8 nd (n 9) · meteofrance_arome_france 2,4 nd (n 9) · meteofrance_arome_france_hd 2,4 nd (n 9) · gfs_seamless 2,4 nd (n 9) · ecmwf_ifs025 2,9 nd (n 9) · meteofrance_arpege_europe 3,6 nd (n 9)
- LFML : ecmwf_ifs025 1,7 nd (n 9) · icon_eu 2,7 nd (n 9) · meteofrance_arome_france 3,5 nd (n 9) · meteofrance_arome_france_hd 3,7 nd (n 9) · meteofrance_arpege_europe 5,3 nd (n 9) · gfs_seamless 5,7 nd (n 9)
