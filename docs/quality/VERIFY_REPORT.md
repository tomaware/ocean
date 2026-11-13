# Remise en question (③)

Généré le 2026-11-13 03:32 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 18 prévisions archivées sur 75 h ; 2013 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 1,7 · gfs_seamless 1,7 · meteofrance_arome_france_hd 1,9 · icon_eu 2,2 · icon_d2 2,4 · meteofrance_arpege_europe 2,5 · ecmwf_ifs025 3,0 |
| LFMP | meteofrance_arome_france_hd 2,1 · meteofrance_arome_france 2,1 · ecmwf_ifs025 2,4 · icon_eu 2,8 · meteofrance_arpege_europe 3,0 · gfs_seamless 3,1 |
| LFTH | icon_eu 2,0 · meteofrance_arome_france 2,9 · meteofrance_arome_france_hd 2,9 · gfs_seamless 3,2 · meteofrance_arpege_europe 3,5 · ecmwf_ifs025 4,0 |
| LFML | meteofrance_arome_france_hd 2,1 · meteofrance_arome_france 2,1 · ecmwf_ifs025 2,3 · icon_eu 2,4 · meteofrance_arpege_europe 3,6 · gfs_seamless 4,2 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.11 · ewam 0.12 · ecmwf_wam025 0.15 · gwam 0.19 · ncep_gfswave025 1.01 |
| 03404 | meteofrance_wave 0.15 · ncep_gfswave025 0.16 · ecmwf_wam025 0.18 · ewam 0.19 · gwam 0.22 |
| 01101 | meteofrance_wave 0.18 · ecmwf_wam025 0.18 · ncep_gfswave025 0.20 · ewam 0.22 · gwam 0.25 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 21.09, ×0.99 (MAE 0.13 m, n 149) ; ecmwf_wam025 poids 15.63, ×0.95 (MAE 0.15 m, n 149) ; ewam poids 17, ×0.93 (MAE 0.14 m, n 149) ; gwam poids 7.23, ×0.88 (MAE 0.21 m, n 149) ; copernicus poids 25.22, ×0.94 (MAE 0.12 m, n 107)
  - 03404 : meteofrance_wave poids 16.84, ×1 (MAE 0.18 m, n 83) ; ecmwf_wam025 poids 13.05, ×0.97 (MAE 0.19 m, n 83) ; ewam poids 13.13, ×0.92 (MAE 0.19 m, n 83) ; gwam poids 7.45, ×0.91 (MAE 0.2 m, n 83) ; ncep_gfswave025 poids 9.57, ×0.94 (MAE 0.15 m, n 83) ; copernicus poids 14.72, ×0.91 (MAE 0.23 m, n 41)
  - 01102 : 
  - 01101 : meteofrance_wave poids 15.73, ×1.12 (MAE 0.19 m, n 151) ; ecmwf_wam025 poids 14.14, ×0.9 (MAE 0.18 m, n 151) ; ewam poids 11.48, ×0.92 (MAE 0.22 m, n 151) ; gwam poids 6.17, ×0.86 (MAE 0.24 m, n 151) ; ncep_gfswave025 poids 7.76, ×0.87 (MAE 0.19 m, n 151) ; copernicus poids 22.66, ×0.92 (MAE 0.15 m, n 109)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.01, Port Camargue × 0.92 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

18 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 2,0 nd (n 13) · icon_d2 2,1 nd (n 13) · icon_eu 2,3 nd (n 13) · meteofrance_arome_france 2,6 nd (n 13) · meteofrance_arome_france_hd 2,9 nd (n 13) · ecmwf_ifs025 2,9 nd (n 13) · gfs_seamless 3,1 nd (n 13)
- LFMP : meteofrance_arome_france 2,1 nd (n 13) · meteofrance_arome_france_hd 2,1 nd (n 13) · icon_eu 2,5 nd (n 13) · ecmwf_ifs025 2,8 nd (n 13) · gfs_seamless 3,5 nd (n 13) · meteofrance_arpege_europe 4,8 nd (n 13)
- LFTH : icon_eu 1,8 nd (n 13) · meteofrance_arome_france 2,6 nd (n 13) · meteofrance_arome_france_hd 2,6 nd (n 13) · ecmwf_ifs025 2,9 nd (n 13) · gfs_seamless 3,0 nd (n 13) · meteofrance_arpege_europe 3,4 nd (n 13)
- LFML : ecmwf_ifs025 1,8 nd (n 8) · icon_eu 2,5 nd (n 8) · meteofrance_arpege_europe 3,3 nd (n 8) · meteofrance_arome_france 3,4 nd (n 8) · meteofrance_arome_france_hd 3,4 nd (n 8) · gfs_seamless 5,4 nd (n 8)
