# Remise en question (③)

Généré le 2026-11-14 17:17 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 28 prévisions archivées sur 111 h ; 2617 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | gfs_seamless 1,9 · meteofrance_arome_france 1,9 · meteofrance_arpege_europe 2,0 · icon_d2 2,1 · meteofrance_arome_france_hd 2,2 · icon_eu 2,5 · ecmwf_ifs025 2,5 |
| LFMP | meteofrance_arome_france_hd 1,7 · meteofrance_arome_france 1,7 · gfs_seamless 1,9 · icon_eu 2,2 · ecmwf_ifs025 2,2 · meteofrance_arpege_europe 2,4 |
| LFTH | icon_eu 2,3 · ecmwf_ifs025 2,5 · gfs_seamless 2,8 · meteofrance_arpege_europe 2,9 · meteofrance_arome_france_hd 3,5 · meteofrance_arome_france 3,5 |
| LFML | meteofrance_arome_france_hd 2,1 · meteofrance_arome_france 2,4 · icon_eu 2,4 · ecmwf_ifs025 3,6 · meteofrance_arpege_europe 4,0 · gfs_seamless 6,0 |
| LFMI | meteofrance_arome_france_hd 2,4 · meteofrance_arome_france 2,4 · meteofrance_arpege_europe 2,7 · icon_eu 2,8 · gfs_seamless 3,8 · ecmwf_ifs025 3,9 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.15 · meteofrance_wave 0.22 · ecmwf_wam025 0.31 · gwam 0.39 · ncep_gfswave025 0.86 |
| 03404 | meteofrance_wave 0.14 · ncep_gfswave025 0.15 · ewam 0.19 · ecmwf_wam025 0.25 · gwam 0.26 |
| 01101 | meteofrance_wave 0.14 · ewam 0.21 · ncep_gfswave025 0.26 · ecmwf_wam025 0.28 · gwam 0.36 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 15.58, ×0.9 (MAE 0.19 m, n 177) ; ecmwf_wam025 poids 8.59, ×0.84 (MAE 0.28 m, n 177) ; ewam poids 17.53, ×0.91 (MAE 0.13 m, n 177) ; gwam poids 3.91, ×0.8 (MAE 0.34 m, n 177) ; copernicus poids 19.94, ×0.93 (MAE 0.17 m, n 102)
  - 03404 : meteofrance_wave poids 20.33, ×0.9 (MAE 0.14 m, n 114) ; ecmwf_wam025 poids 9.94, ×0.84 (MAE 0.25 m, n 114) ; ewam poids 13.57, ×0.95 (MAE 0.18 m, n 114) ; gwam poids 5.77, ×0.83 (MAE 0.25 m, n 114) ; ncep_gfswave025 poids 0.49, ×0.93 (MAE 0.15 m, n 114) ; copernicus poids 25.48, ×0.92 (MAE 0.12 m, n 102)
  - 01102 : 
  - 01101 : meteofrance_wave poids 20.56, ×1.09 (MAE 0.14 m, n 179) ; ecmwf_wam025 poids 10.48, ×0.82 (MAE 0.24 m, n 179) ; ewam poids 12.16, ×0.92 (MAE 0.21 m, n 179) ; gwam poids 4.69, ×0.81 (MAE 0.3 m, n 179) ; ncep_gfswave025 poids 6.85, ×0.89 (MAE 0.22 m, n 179) ; copernicus poids 19.72, ×0.88 (MAE 0.18 m, n 102)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.11, Port Camargue × 1.02 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

28 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 2,1 nd (n 7) · gfs_seamless 2,3 nd (n 7) · icon_eu 2,5 nd (n 7) · icon_d2 2,5 nd (n 7) · ecmwf_ifs025 2,5 nd (n 7) · meteofrance_arome_france_hd 2,6 nd (n 7) · meteofrance_arome_france 2,8 nd (n 7)
- LFMP : gfs_seamless 1,1 nd (n 7) · meteofrance_arome_france_hd 1,4 nd (n 7) · meteofrance_arome_france 1,5 nd (n 7) · icon_eu 2,1 nd (n 7) · meteofrance_arpege_europe 2,1 nd (n 7) · ecmwf_ifs025 2,3 nd (n 7)
- LFTH : icon_eu 2,1 nd (n 7) · meteofrance_arpege_europe 2,2 nd (n 7) · meteofrance_arome_france_hd 2,3 nd (n 7) · meteofrance_arome_france 2,3 nd (n 7) · ecmwf_ifs025 3,1 nd (n 7) · gfs_seamless 4,4 nd (n 7)
- LFML : meteofrance_arome_france_hd 2,3 nd (n 7) · icon_eu 2,4 nd (n 7) · meteofrance_arome_france 2,6 nd (n 7) · ecmwf_ifs025 2,8 nd (n 7) · meteofrance_arpege_europe 5,6 nd (n 7) · gfs_seamless 6,4 nd (n 7)
- LFMI : 
