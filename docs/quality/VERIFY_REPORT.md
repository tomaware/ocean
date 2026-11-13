# Remise en question (③)

Généré le 2026-11-13 13:39 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 20 prévisions archivées sur 81 h ; 2125 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 1,8 · meteofrance_arome_france_hd 1,9 · gfs_seamless 1,9 · icon_d2 2,6 · icon_eu 2,6 · meteofrance_arpege_europe 2,8 · ecmwf_ifs025 3,1 |
| LFMP | meteofrance_arome_france_hd 2,1 · meteofrance_arome_france 2,2 · ecmwf_ifs025 2,6 · icon_eu 3,1 · meteofrance_arpege_europe 3,2 · gfs_seamless 3,3 |
| LFTH | icon_eu 2,0 · meteofrance_arome_france 3,0 · meteofrance_arome_france_hd 3,0 · gfs_seamless 3,1 · meteofrance_arpege_europe 3,1 · ecmwf_ifs025 4,0 |
| LFML | meteofrance_arome_france_hd 2,3 · meteofrance_arome_france 2,5 · icon_eu 2,7 · ecmwf_ifs025 3,0 · meteofrance_arpege_europe 4,0 · gfs_seamless 5,1 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.09 · ewam 0.12 · ecmwf_wam025 0.17 · gwam 0.23 · ncep_gfswave025 0.96 |
| 03404 | meteofrance_wave 0.14 · ncep_gfswave025 0.19 · ewam 0.21 · ecmwf_wam025 0.24 · gwam 0.33 |
| 01101 | meteofrance_wave 0.14 · ewam 0.22 · ncep_gfswave025 0.22 · ecmwf_wam025 0.24 · gwam 0.33 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 21.76, ×0.98 (MAE 0.12 m, n 169) ; ecmwf_wam025 poids 13.74, ×0.93 (MAE 0.18 m, n 169) ; ewam poids 17.31, ×0.93 (MAE 0.13 m, n 169) ; gwam poids 6.2, ×0.86 (MAE 0.24 m, n 169) ; copernicus poids 26.17, ×0.99 (MAE 0.12 m, n 103)
  - 03404 : meteofrance_wave poids 18.22, ×0.99 (MAE 0.16 m, n 103) ; ecmwf_wam025 poids 11.41, ×0.94 (MAE 0.22 m, n 103) ; ewam poids 12.88, ×0.91 (MAE 0.19 m, n 103) ; gwam poids 5.7, ×0.88 (MAE 0.26 m, n 103) ; ncep_gfswave025 poids 9.25, ×0.93 (MAE 0.16 m, n 103) ; copernicus poids 22.9, ×0.95 (MAE 0.15 m, n 58)
  - 01102 : 
  - 01101 : meteofrance_wave poids 17.92, ×1.12 (MAE 0.16 m, n 171) ; ecmwf_wam025 poids 11.79, ×0.86 (MAE 0.21 m, n 171) ; ewam poids 12.61, ×0.92 (MAE 0.2 m, n 171) ; gwam poids 4.88, ×0.82 (MAE 0.29 m, n 171) ; ncep_gfswave025 poids 7.34, ×0.85 (MAE 0.2 m, n 171) ; copernicus poids 21.15, ×0.89 (MAE 0.16 m, n 105)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.03, Port Camargue × 1 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

20 prévisions archivées. Classement à 24 h :

- LFMT : icon_d2 2,2 nd (n 10) · meteofrance_arpege_europe 2,3 nd (n 10) · icon_eu 2,4 nd (n 10) · meteofrance_arome_france 3,0 nd (n 10) · ecmwf_ifs025 3,1 nd (n 10) · meteofrance_arome_france_hd 3,2 nd (n 10) · gfs_seamless 3,4 nd (n 10)
- LFMP : meteofrance_arome_france 2,3 nd (n 10) · meteofrance_arome_france_hd 2,3 nd (n 10) · icon_eu 2,8 nd (n 10) · ecmwf_ifs025 3,1 nd (n 10) · gfs_seamless 3,8 nd (n 10) · meteofrance_arpege_europe 5,4 nd (n 10)
- LFTH : icon_eu 1,7 nd (n 10) · meteofrance_arome_france 2,8 nd (n 10) · meteofrance_arome_france_hd 2,8 nd (n 10) · gfs_seamless 3,0 nd (n 10) · ecmwf_ifs025 3,2 nd (n 10) · meteofrance_arpege_europe 3,8 nd (n 10)
- LFML : ecmwf_ifs025 1,8 nd (n 8) · icon_eu 2,5 nd (n 8) · meteofrance_arpege_europe 3,3 nd (n 8) · meteofrance_arome_france 3,4 nd (n 8) · meteofrance_arome_france_hd 3,4 nd (n 8) · gfs_seamless 5,4 nd (n 8)
