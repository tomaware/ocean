# Remise en question (③)

Généré le 2026-11-16 22:28 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 41 prévisions archivées sur 165 h ; 4179 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 2,1 · meteofrance_arome_france_hd 2,2 · icon_eu 3,0 · icon_d2 3,3 · meteofrance_arpege_europe 3,3 · gfs_seamless 3,5 · ecmwf_ifs025 3,6 |
| LFMP | gfs_seamless 1,9 · ecmwf_ifs025 1,9 · icon_eu 1,9 · meteofrance_arome_france_hd 2,0 · meteofrance_arome_france 2,0 · meteofrance_arpege_europe 2,4 |
| LFTH | ecmwf_ifs025 2,2 · meteofrance_arome_france_hd 2,2 · meteofrance_arpege_europe 2,2 · gfs_seamless 2,2 · meteofrance_arome_france 2,3 · icon_eu 2,4 |
| LFML | meteofrance_arome_france 1,8 · ecmwf_ifs025 1,9 · meteofrance_arome_france_hd 2,0 · icon_eu 2,1 · meteofrance_arpege_europe 3,2 · gfs_seamless 4,3 |
| LFMI | meteofrance_arome_france 1,8 · meteofrance_arome_france_hd 1,9 · icon_eu 2,1 · ecmwf_ifs025 2,3 · meteofrance_arpege_europe 2,6 · gfs_seamless 2,8 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.27 · ewam 0.31 · ecmwf_wam025 0.34 · gwam 0.46 · ncep_gfswave025 1.04 |
| 03404 | ewam 0.14 · gwam 0.15 · ncep_gfswave025 0.22 · meteofrance_wave 0.25 · ecmwf_wam025 0.27 |
| 01101 | ecmwf_wam025 0.16 · ewam 0.16 · meteofrance_wave 0.17 · gwam 0.19 · ncep_gfswave025 0.21 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 10.29, ×0.94 (MAE 0.28 m, n 190) ; ecmwf_wam025 poids 5.83, ×0.84 (MAE 0.36 m, n 190) ; ewam poids 8.97, ×0.88 (MAE 0.27 m, n 190) ; gwam poids 2.26, ×0.8 (MAE 0.47 m, n 190) ; copernicus poids 18.86, ×0.99 (MAE 0.19 m, n 100)
  - 03404 : meteofrance_wave poids 12.71, ×1.07 (MAE 0.23 m, n 190) ; ecmwf_wam025 poids 8.54, ×0.96 (MAE 0.28 m, n 190) ; ewam poids 15.73, ×1 (MAE 0.15 m, n 190) ; gwam poids 7.37, ×0.92 (MAE 0.2 m, n 190) ; ncep_gfswave025 poids 7.31, ×1.08 (MAE 0.21 m, n 190) ; copernicus poids 15.15, ×1.07 (MAE 0.23 m, n 100)
  - 01102 : 
  - 01101 : meteofrance_wave poids 20.23, ×1.12 (MAE 0.14 m, n 190) ; ecmwf_wam025 poids 10.8, ×0.86 (MAE 0.23 m, n 190) ; ewam poids 15.6, ×0.98 (MAE 0.16 m, n 190) ; gwam poids 5.28, ×0.85 (MAE 0.27 m, n 190) ; ncep_gfswave025 poids 6.7, ×1 (MAE 0.22 m, n 190) ; copernicus poids 24.52, ×1 (MAE 0.13 m, n 100)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.95, Port Camargue × 0.96 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

41 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arome_france 2,6 nd (n 12) · meteofrance_arome_france_hd 2,9 nd (n 12) · gfs_seamless 3,0 nd (n 12) · icon_eu 3,0 nd (n 12) · icon_d2 3,1 nd (n 12) · meteofrance_arpege_europe 3,5 nd (n 12) · ecmwf_ifs025 4,1 nd (n 12)
- LFMP : meteofrance_arome_france 1,5 nd (n 12) · meteofrance_arome_france_hd 1,9 nd (n 12) · icon_eu 2,1 nd (n 12) · gfs_seamless 2,5 nd (n 12) · ecmwf_ifs025 2,6 nd (n 12) · meteofrance_arpege_europe 2,8 nd (n 12)
- LFTH : meteofrance_arome_france_hd 2,0 nd (n 12) · meteofrance_arome_france 2,1 nd (n 12) · gfs_seamless 2,1 nd (n 12) · meteofrance_arpege_europe 2,3 nd (n 12) · icon_eu 2,4 nd (n 12) · ecmwf_ifs025 2,6 nd (n 12)
- LFML : meteofrance_arome_france 1,7 nd (n 12) · ecmwf_ifs025 1,8 nd (n 12) · meteofrance_arome_france_hd 1,9 nd (n 12) · icon_eu 2,4 nd (n 12) · meteofrance_arpege_europe 3,6 nd (n 12) · gfs_seamless 4,6 nd (n 12)
- LFMI : icon_eu 2,1 nd (n 10) · ecmwf_ifs025 2,9 nd (n 10) · meteofrance_arpege_europe 2,9 nd (n 10) · meteofrance_arome_france_hd 3,0 nd (n 10) · meteofrance_arome_france 3,2 nd (n 10) · gfs_seamless 3,8 nd (n 10)
