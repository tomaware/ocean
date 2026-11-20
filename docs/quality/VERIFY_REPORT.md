# Remise en question (③)

Généré le 2026-11-20 23:27 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 67 prévisions archivées sur 261 h ; 5786 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 4 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 2,7 · meteofrance_arpege_europe 2,7 · meteofrance_arome_france_hd 2,8 · icon_d2 3,2 · icon_eu 3,3 · gfs_seamless 3,4 · ecmwf_ifs025 3,8 |
| LFMP | meteofrance_arome_france 2,8 · icon_eu 2,8 · meteofrance_arome_france_hd 2,9 · meteofrance_arpege_europe 3,5 · gfs_seamless 3,8 · ecmwf_ifs025 3,8 |
| LFTH | meteofrance_arome_france_hd 2,3 · meteofrance_arome_france 2,3 · meteofrance_arpege_europe 2,6 · ecmwf_ifs025 3,3 · icon_eu 3,3 · gfs_seamless 4,1 |
| LFML | meteofrance_arome_france_hd 2,3 · meteofrance_arome_france 2,5 · meteofrance_arpege_europe 2,6 · gfs_seamless 3,6 · icon_eu 4,1 · ecmwf_ifs025 5,3 |
| LFMI | meteofrance_arome_france_hd 2,4 · meteofrance_arome_france 2,4 · meteofrance_arpege_europe 2,8 · gfs_seamless 2,9 · ecmwf_ifs025 3,3 · icon_eu 3,7 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.15 · meteofrance_wave 0.20 · gwam 0.36 · ecmwf_wam025 0.41 · ncep_gfswave025 1.01 |
| 03404 | ewam 0.12 · meteofrance_wave 0.15 · gwam 0.27 · ncep_gfswave025 0.28 · ecmwf_wam025 0.34 |
| 01101 | meteofrance_wave 0.10 · ewam 0.15 · ncep_gfswave025 0.33 · ecmwf_wam025 0.34 · gwam 0.42 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 16.05, ×0.89 (MAE 0.19 m, n 170) ; ecmwf_wam025 poids 5.94, ×0.8 (MAE 0.36 m, n 170) ; ewam poids 15.43, ×0.9 (MAE 0.16 m, n 170) ; gwam poids 3.63, ×0.8 (MAE 0.35 m, n 170) ; copernicus poids 15.45, ×0.9 (MAE 0.23 m, n 80)
  - 03404 : meteofrance_wave poids 20.16, ×0.93 (MAE 0.14 m, n 170) ; ecmwf_wam025 poids 8.36, ×0.8 (MAE 0.28 m, n 170) ; ewam poids 18.47, ×0.93 (MAE 0.12 m, n 170) ; gwam poids 6.2, ×0.82 (MAE 0.24 m, n 170) ; ncep_gfswave025 poids 6.38, ×0.85 (MAE 0.23 m, n 170) ; copernicus poids 21.13, ×0.9 (MAE 0.16 m, n 80)
  - 01102 : 
  - 01101 : meteofrance_wave poids 20.12, ×1.25 (MAE 0.14 m, n 140) ; ecmwf_wam025 poids 9.7, ×0.84 (MAE 0.25 m, n 140) ; ewam poids 16.24, ×1.05 (MAE 0.15 m, n 140) ; gwam poids 4.49, ×0.81 (MAE 0.31 m, n 140) ; ncep_gfswave025 poids 6.35, ×0.91 (MAE 0.23 m, n 140) ; copernicus poids 28.86, ×0.98 (MAE 0.09 m, n 51)
- Vent downwind : La Grande-Motte × 1.05, Port Camargue × 1.07 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

67 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arome_france 2,8 nd (n 13) · meteofrance_arpege_europe 3,0 nd (n 13) · meteofrance_arome_france_hd 3,1 nd (n 13) · gfs_seamless 3,4 nd (n 13) · icon_d2 3,9 nd (n 13) · icon_eu 4,0 nd (n 13) · ecmwf_ifs025 4,2 nd (n 13)
- LFMP : meteofrance_arome_france 2,2 nd (n 13) · meteofrance_arome_france_hd 2,3 nd (n 13) · icon_eu 2,8 nd (n 13) · ecmwf_ifs025 2,8 nd (n 13) · meteofrance_arpege_europe 3,5 nd (n 13) · gfs_seamless 3,6 nd (n 13)
- LFTH : meteofrance_arpege_europe 2,2 nd (n 13) · meteofrance_arome_france_hd 2,4 nd (n 13) · meteofrance_arome_france 2,4 nd (n 13) · ecmwf_ifs025 3,6 nd (n 13) · icon_eu 3,8 nd (n 13) · gfs_seamless 4,4 nd (n 13)
- LFML : meteofrance_arpege_europe 2,8 nd (n 13) · meteofrance_arome_france 3,1 nd (n 13) · meteofrance_arome_france_hd 3,3 nd (n 13) · gfs_seamless 3,6 nd (n 13) · icon_eu 3,6 nd (n 13) · ecmwf_ifs025 5,1 nd (n 13)
- LFMI : meteofrance_arpege_europe 2,9 nd (n 13) · gfs_seamless 2,9 nd (n 13) · ecmwf_ifs025 3,1 nd (n 13) · meteofrance_arome_france_hd 3,1 nd (n 13) · meteofrance_arome_france 3,2 nd (n 13) · icon_eu 3,5 nd (n 13)
