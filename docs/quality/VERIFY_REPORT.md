# Remise en question (③)

Généré le 2026-11-16 14:07 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 40 prévisions archivées sur 153 h ; 4050 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france_hd 2,7 · meteofrance_arome_france 2,8 · meteofrance_arpege_europe 3,4 · ecmwf_ifs025 3,5 · icon_eu 3,5 · icon_d2 3,5 · gfs_seamless 4,3 |
| LFMP | ecmwf_ifs025 1,9 · gfs_seamless 2,0 · meteofrance_arome_france_hd 2,0 · icon_eu 2,1 · meteofrance_arome_france 2,1 · meteofrance_arpege_europe 2,4 |
| LFTH | ecmwf_ifs025 1,9 · icon_eu 2,6 · meteofrance_arome_france_hd 2,7 · meteofrance_arpege_europe 2,7 · meteofrance_arome_france 2,7 · gfs_seamless 2,8 |
| LFML | meteofrance_arome_france 2,1 · ecmwf_ifs025 2,2 · meteofrance_arome_france_hd 2,5 · icon_eu 2,5 · meteofrance_arpege_europe 3,4 · gfs_seamless 4,7 |
| LFMI | meteofrance_arome_france_hd 2,3 · meteofrance_arome_france 2,4 · meteofrance_arpege_europe 2,5 · icon_eu 2,7 · ecmwf_ifs025 2,8 · gfs_seamless 3,0 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.31 · ewam 0.33 · ecmwf_wam025 0.38 · gwam 0.52 · ncep_gfswave025 1.09 |
| 03404 | ewam 0.15 · gwam 0.15 · ncep_gfswave025 0.22 · meteofrance_wave 0.25 · ecmwf_wam025 0.28 |
| 01101 | meteofrance_wave 0.17 · ewam 0.17 · ecmwf_wam025 0.19 · gwam 0.20 · ncep_gfswave025 0.22 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 9.69, ×0.95 (MAE 0.29 m, n 170) ; ecmwf_wam025 poids 5.57, ×0.85 (MAE 0.37 m, n 170) ; ewam poids 8.25, ×0.88 (MAE 0.28 m, n 170) ; gwam poids 2.04, ×0.8 (MAE 0.5 m, n 170) ; copernicus poids 16.45, ×1 (MAE 0.21 m, n 98)
  - 03404 : meteofrance_wave poids 11.94, ×1.07 (MAE 0.25 m, n 170) ; ecmwf_wam025 poids 7.88, ×0.96 (MAE 0.29 m, n 170) ; ewam poids 14.89, ×0.99 (MAE 0.16 m, n 170) ; gwam poids 7.02, ×0.92 (MAE 0.21 m, n 170) ; ncep_gfswave025 poids 6.8, ×1.08 (MAE 0.22 m, n 170) ; copernicus poids 16.92, ×1.08 (MAE 0.21 m, n 98)
  - 01102 : 
  - 01101 : meteofrance_wave poids 19.53, ×1.12 (MAE 0.15 m, n 170) ; ecmwf_wam025 poids 9.81, ×0.86 (MAE 0.25 m, n 170) ; ewam poids 15.11, ×0.97 (MAE 0.16 m, n 170) ; gwam poids 4.72, ×0.85 (MAE 0.3 m, n 170) ; ncep_gfswave025 poids 6.17, ×1 (MAE 0.24 m, n 170) ; copernicus poids 24.33, ×0.98 (MAE 0.13 m, n 98)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.12, Port Camargue × 1.04 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

40 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arome_france 2,8 nd (n 11) · icon_eu 2,9 nd (n 11) · meteofrance_arome_france_hd 3,1 nd (n 11) · icon_d2 3,4 nd (n 11) · meteofrance_arpege_europe 3,4 nd (n 11) · gfs_seamless 3,8 nd (n 11) · ecmwf_ifs025 4,5 nd (n 11)
- LFMP : meteofrance_arome_france 1,5 nd (n 11) · meteofrance_arome_france_hd 1,6 nd (n 11) · icon_eu 2,4 nd (n 11) · ecmwf_ifs025 2,6 nd (n 11) · gfs_seamless 2,6 nd (n 11) · meteofrance_arpege_europe 2,9 nd (n 11)
- LFTH : ecmwf_ifs025 2,1 nd (n 11) · gfs_seamless 2,4 nd (n 11) · icon_eu 2,4 nd (n 11) · meteofrance_arpege_europe 2,5 nd (n 11) · meteofrance_arome_france_hd 2,7 nd (n 11) · meteofrance_arome_france 2,7 nd (n 11)
- LFML : meteofrance_arome_france 2,3 nd (n 11) · icon_eu 2,4 nd (n 11) · ecmwf_ifs025 2,4 nd (n 11) · meteofrance_arome_france_hd 2,7 nd (n 11) · meteofrance_arpege_europe 3,4 nd (n 11) · gfs_seamless 5,0 nd (n 11)
- LFMI : icon_eu 1,7 nd (n 7) · meteofrance_arpege_europe 2,2 nd (n 7) · meteofrance_arome_france_hd 2,7 nd (n 7) · meteofrance_arome_france 2,8 nd (n 7) · ecmwf_ifs025 3,4 nd (n 7) · gfs_seamless 4,0 nd (n 7)
