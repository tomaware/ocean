# Remise en question (③)

Généré le 2026-11-20 13:58 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 64 prévisions archivées sur 252 h ; 5847 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 4 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arpege_europe 2,5 · meteofrance_arome_france 2,7 · meteofrance_arome_france_hd 2,8 · icon_d2 3,2 · icon_eu 3,3 · gfs_seamless 3,4 · ecmwf_ifs025 3,5 |
| LFMP | meteofrance_arome_france_hd 3,2 · meteofrance_arome_france 3,3 · icon_eu 3,3 · meteofrance_arpege_europe 3,8 · gfs_seamless 4,1 · ecmwf_ifs025 4,9 |
| LFTH | meteofrance_arome_france_hd 2,3 · meteofrance_arome_france 2,3 · meteofrance_arpege_europe 2,7 · icon_eu 3,4 · ecmwf_ifs025 3,6 · gfs_seamless 4,2 |
| LFML | meteofrance_arome_france_hd 2,6 · meteofrance_arome_france 2,8 · meteofrance_arpege_europe 3,3 · gfs_seamless 3,8 · icon_eu 4,2 · ecmwf_ifs025 5,1 |
| LFMI | meteofrance_arpege_europe 2,6 · meteofrance_arome_france_hd 2,6 · meteofrance_arome_france 2,6 · gfs_seamless 3,4 · ecmwf_ifs025 3,8 · icon_eu 4,3 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.16 · meteofrance_wave 0.20 · gwam 0.36 · ecmwf_wam025 0.38 · ncep_gfswave025 1.00 |
| 03404 | ewam 0.11 · meteofrance_wave 0.15 · gwam 0.25 · ncep_gfswave025 0.25 · ecmwf_wam025 0.30 |
| 01101 | meteofrance_wave 0.12 · ewam 0.15 · ncep_gfswave025 0.29 · ecmwf_wam025 0.31 · gwam 0.37 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 16.05, ×0.89 (MAE 0.19 m, n 170) ; ecmwf_wam025 poids 5.96, ×0.8 (MAE 0.36 m, n 170) ; ewam poids 15.4, ×0.9 (MAE 0.16 m, n 170) ; gwam poids 3.66, ×0.8 (MAE 0.35 m, n 170) ; copernicus poids 15.49, ×0.89 (MAE 0.22 m, n 104)
  - 03404 : meteofrance_wave poids 20.16, ×0.93 (MAE 0.14 m, n 170) ; ecmwf_wam025 poids 8.4, ×0.8 (MAE 0.28 m, n 170) ; ewam poids 18.47, ×0.93 (MAE 0.12 m, n 170) ; gwam poids 6.22, ×0.82 (MAE 0.24 m, n 170) ; ncep_gfswave025 poids 6.38, ×0.85 (MAE 0.23 m, n 170) ; copernicus poids 18.06, ×0.87 (MAE 0.19 m, n 104)
  - 01102 : 
  - 01101 : meteofrance_wave poids 20.12, ×1.25 (MAE 0.14 m, n 140) ; ecmwf_wam025 poids 9.78, ×0.84 (MAE 0.25 m, n 140) ; ewam poids 16.27, ×1.05 (MAE 0.15 m, n 140) ; gwam poids 4.49, ×0.81 (MAE 0.31 m, n 140) ; ncep_gfswave025 poids 6.35, ×0.91 (MAE 0.23 m, n 140) ; copernicus poids 28.1, ×1.01 (MAE 0.1 m, n 74)
- Vent downwind : La Grande-Motte × 1.02, Port Camargue × 1.09 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

64 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arome_france 3,1 nd (n 11) · meteofrance_arpege_europe 3,3 nd (n 11) · gfs_seamless 3,3 nd (n 11) · meteofrance_arome_france_hd 3,5 nd (n 11) · icon_d2 4,2 nd (n 11) · icon_eu 4,3 nd (n 11) · ecmwf_ifs025 4,6 nd (n 11)
- LFMP : meteofrance_arpege_europe 2,9 nd (n 11) · meteofrance_arome_france 3,1 nd (n 11) · meteofrance_arome_france_hd 3,2 nd (n 11) · icon_eu 3,2 nd (n 11) · ecmwf_ifs025 3,5 nd (n 11) · gfs_seamless 4,1 nd (n 11)
- LFTH : meteofrance_arpege_europe 2,1 nd (n 11) · meteofrance_arome_france_hd 2,4 nd (n 11) · meteofrance_arome_france 2,4 nd (n 11) · ecmwf_ifs025 3,2 nd (n 11) · icon_eu 3,5 nd (n 11) · gfs_seamless 5,0 nd (n 11)
- LFML : meteofrance_arpege_europe 2,8 nd (n 11) · meteofrance_arome_france 3,2 nd (n 11) · meteofrance_arome_france_hd 3,3 nd (n 11) · gfs_seamless 3,5 nd (n 11) · icon_eu 3,6 nd (n 11) · ecmwf_ifs025 5,3 nd (n 11)
- LFMI : ecmwf_ifs025 3,1 nd (n 11) · gfs_seamless 3,1 nd (n 11) · meteofrance_arpege_europe 3,2 nd (n 11) · meteofrance_arome_france_hd 3,5 nd (n 11) · meteofrance_arome_france 3,7 nd (n 11) · icon_eu 3,7 nd (n 11)
