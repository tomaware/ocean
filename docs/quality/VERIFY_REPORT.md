# Remise en question (③)

Généré le 2026-11-19 14:36 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 58 prévisions archivées sur 228 h ; 5197 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 2,3 · meteofrance_arome_france_hd 2,3 · icon_eu 2,4 · icon_d2 2,4 · meteofrance_arpege_europe 2,5 · gfs_seamless 2,6 · ecmwf_ifs025 3,2 |
| LFMP | meteofrance_arome_france_hd 2,9 · meteofrance_arome_france 2,9 · meteofrance_arpege_europe 3,2 · icon_eu 3,2 · gfs_seamless 4,0 · ecmwf_ifs025 4,6 |
| LFTH | meteofrance_arpege_europe 2,4 · meteofrance_arome_france_hd 2,7 · meteofrance_arome_france 2,7 · icon_eu 3,0 · ecmwf_ifs025 3,3 · gfs_seamless 3,3 |
| LFML | meteofrance_arome_france 2,2 · meteofrance_arome_france_hd 2,3 · icon_eu 2,4 · meteofrance_arpege_europe 2,6 · ecmwf_ifs025 2,9 · gfs_seamless 4,7 |
| LFMI | meteofrance_arpege_europe 2,2 · meteofrance_arome_france_hd 2,5 · meteofrance_arome_france 2,5 · gfs_seamless 3,0 · icon_eu 3,1 · ecmwf_ifs025 3,3 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.16 · meteofrance_wave 0.18 · ecmwf_wam025 0.29 · gwam 0.33 · ncep_gfswave025 0.85 |
| 03404 | ewam 0.13 · meteofrance_wave 0.16 · ncep_gfswave025 0.18 · ecmwf_wam025 0.21 · gwam 0.21 |
| 01101 | ncep_gfswave025 0.14 · ecmwf_wam025 0.16 · ewam 0.16 · meteofrance_wave 0.18 · gwam 0.22 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 15.61, ×0.87 (MAE 0.19 m, n 170) ; ecmwf_wam025 poids 7.93, ×0.8 (MAE 0.29 m, n 170) ; ewam poids 15.34, ×0.89 (MAE 0.16 m, n 170) ; gwam poids 3.98, ×0.8 (MAE 0.33 m, n 170) ; copernicus poids 14.42, ×0.87 (MAE 0.24 m, n 104)
  - 03404 : meteofrance_wave poids 18.24, ×0.93 (MAE 0.16 m, n 170) ; ecmwf_wam025 poids 11.87, ×0.84 (MAE 0.21 m, n 170) ; ewam poids 18.82, ×0.94 (MAE 0.11 m, n 170) ; gwam poids 7.3, ×0.85 (MAE 0.21 m, n 170) ; ncep_gfswave025 poids 9.19, ×0.91 (MAE 0.16 m, n 170) ; copernicus poids 16.5, ×0.88 (MAE 0.21 m, n 104)
  - 01102 : 
  - 01101 : meteofrance_wave poids 18.39, ×1.25 (MAE 0.16 m, n 145) ; ecmwf_wam025 poids 14.34, ×0.87 (MAE 0.17 m, n 145) ; ewam poids 16.23, ×1.06 (MAE 0.15 m, n 145) ; gwam poids 6.09, ×0.85 (MAE 0.24 m, n 145) ; ncep_gfswave025 poids 9.19, ×0.94 (MAE 0.16 m, n 145) ; copernicus poids 27.45, ×0.99 (MAE 0.1 m, n 79)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1, Port Camargue × 1.2 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

58 prévisions archivées. Classement à 24 h :

- LFMT : icon_d2 1,6 nd (n 10) · gfs_seamless 1,7 nd (n 10) · icon_eu 1,7 nd (n 10) · meteofrance_arome_france 2,5 nd (n 10) · meteofrance_arome_france_hd 2,6 nd (n 10) · meteofrance_arpege_europe 3,3 nd (n 10) · ecmwf_ifs025 3,7 nd (n 10)
- LFMP : meteofrance_arome_france_hd 2,4 nd (n 10) · meteofrance_arome_france 2,6 nd (n 10) · meteofrance_arpege_europe 3,8 nd (n 10) · icon_eu 4,3 nd (n 10) · ecmwf_ifs025 4,5 nd (n 10) · gfs_seamless 4,8 nd (n 10)
- LFTH : meteofrance_arome_france_hd 2,7 nd (n 10) · meteofrance_arome_france 2,7 nd (n 10) · meteofrance_arpege_europe 2,7 nd (n 10) · ecmwf_ifs025 3,4 nd (n 10) · icon_eu 3,5 nd (n 10) · gfs_seamless 3,6 nd (n 10)
- LFML : meteofrance_arpege_europe 2,6 nd (n 10) · meteofrance_arome_france_hd 2,7 nd (n 10) · icon_eu 2,7 nd (n 10) · meteofrance_arome_france 2,8 nd (n 10) · gfs_seamless 3,4 nd (n 10) · ecmwf_ifs025 3,5 nd (n 10)
- LFMI : gfs_seamless 2,6 nd (n 10) · meteofrance_arome_france_hd 2,6 nd (n 10) · meteofrance_arome_france 2,6 nd (n 10) · icon_eu 2,7 nd (n 10) · ecmwf_ifs025 2,7 nd (n 10) · meteofrance_arpege_europe 3,3 nd (n 10)
