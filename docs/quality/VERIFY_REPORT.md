# Remise en question (③)

Généré le 2026-11-20 10:39 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 63 prévisions archivées sur 243 h ; 5818 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 4 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arpege_europe 2,4 · meteofrance_arome_france_hd 2,6 · meteofrance_arome_france 2,7 · icon_d2 3,0 · icon_eu 3,0 · gfs_seamless 3,1 · ecmwf_ifs025 3,3 |
| LFMP | icon_eu 3,0 · meteofrance_arome_france_hd 3,2 · gfs_seamless 3,2 · meteofrance_arome_france 3,3 · meteofrance_arpege_europe 3,3 · ecmwf_ifs025 4,4 |
| LFTH | meteofrance_arome_france_hd 2,3 · meteofrance_arome_france 2,3 · meteofrance_arpege_europe 2,7 · icon_eu 3,7 · ecmwf_ifs025 3,9 · gfs_seamless 4,2 |
| LFML | meteofrance_arome_france_hd 2,5 · meteofrance_arome_france 2,7 · meteofrance_arpege_europe 3,3 · gfs_seamless 3,9 · icon_eu 4,2 · ecmwf_ifs025 5,2 |
| LFMI | meteofrance_arpege_europe 2,6 · meteofrance_arome_france_hd 2,8 · meteofrance_arome_france 2,8 · gfs_seamless 3,5 · ecmwf_ifs025 3,7 · icon_eu 4,3 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.17 · meteofrance_wave 0.18 · ecmwf_wam025 0.37 · gwam 0.37 · ncep_gfswave025 1.00 |
| 03404 | ewam 0.12 · meteofrance_wave 0.13 · gwam 0.26 · ncep_gfswave025 0.26 · ecmwf_wam025 0.29 |
| 01101 | meteofrance_wave 0.11 · ewam 0.15 · ncep_gfswave025 0.28 · ecmwf_wam025 0.31 · gwam 0.36 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 17.59, ×0.91 (MAE 0.17 m, n 166) ; ecmwf_wam025 poids 6.35, ×0.8 (MAE 0.34 m, n 166) ; ewam poids 15.24, ×0.9 (MAE 0.16 m, n 166) ; gwam poids 3.64, ×0.8 (MAE 0.35 m, n 166) ; copernicus poids 15.01, ×0.89 (MAE 0.23 m, n 100)
  - 03404 : meteofrance_wave poids 21.12, ×0.94 (MAE 0.13 m, n 166) ; ecmwf_wam025 poids 8.82, ×0.81 (MAE 0.27 m, n 166) ; ewam poids 18.33, ×0.93 (MAE 0.12 m, n 166) ; gwam poids 6.15, ×0.82 (MAE 0.24 m, n 166) ; ncep_gfswave025 poids 6.33, ×0.85 (MAE 0.23 m, n 166) ; copernicus poids 17.58, ×0.86 (MAE 0.2 m, n 100)
  - 01102 : 
  - 01101 : meteofrance_wave poids 20.54, ×1.25 (MAE 0.14 m, n 137) ; ecmwf_wam025 poids 9.6, ×0.84 (MAE 0.25 m, n 137) ; ewam poids 16.13, ×1.05 (MAE 0.15 m, n 137) ; gwam poids 4.57, ×0.81 (MAE 0.3 m, n 137) ; ncep_gfswave025 poids 6.46, ×0.91 (MAE 0.23 m, n 137) ; copernicus poids 28.2, ×1.01 (MAE 0.1 m, n 71)
- Vent downwind : La Grande-Motte × 1.05, Port Camargue × 1.14 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

63 prévisions archivées. Classement à 24 h :

- LFMT : gfs_seamless 2,5 nd (n 11) · meteofrance_arome_france 3,0 nd (n 11) · meteofrance_arpege_europe 3,2 nd (n 11) · meteofrance_arome_france_hd 3,3 nd (n 11) · icon_d2 4,0 nd (n 11) · ecmwf_ifs025 4,1 nd (n 11) · icon_eu 4,1 nd (n 11)
- LFMP : meteofrance_arome_france 2,8 nd (n 11) · meteofrance_arome_france_hd 2,9 nd (n 11) · gfs_seamless 3,3 nd (n 11) · ecmwf_ifs025 3,4 nd (n 11) · icon_eu 3,5 nd (n 11) · meteofrance_arpege_europe 3,6 nd (n 11)
- LFTH : meteofrance_arpege_europe 1,9 nd (n 11) · meteofrance_arome_france_hd 2,2 nd (n 11) · meteofrance_arome_france 2,2 nd (n 11) · ecmwf_ifs025 3,3 nd (n 11) · icon_eu 3,8 nd (n 11) · gfs_seamless 4,5 nd (n 11)
- LFML : meteofrance_arpege_europe 3,1 nd (n 11) · meteofrance_arome_france 3,3 nd (n 11) · meteofrance_arome_france_hd 3,4 nd (n 11) · gfs_seamless 3,5 nd (n 11) · icon_eu 3,9 nd (n 11) · ecmwf_ifs025 5,4 nd (n 11)
- LFMI : ecmwf_ifs025 3,0 nd (n 11) · gfs_seamless 3,0 nd (n 11) · meteofrance_arpege_europe 3,2 nd (n 11) · meteofrance_arome_france_hd 3,4 nd (n 11) · meteofrance_arome_france 3,5 nd (n 11) · icon_eu 3,7 nd (n 11)
