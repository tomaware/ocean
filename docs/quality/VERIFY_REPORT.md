# Remise en question (③)

Généré le 2026-11-17 05:40 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 43 prévisions archivées sur 171 h ; 4232 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 1,9 · meteofrance_arome_france_hd 2,0 · icon_eu 2,9 · meteofrance_arpege_europe 3,2 · gfs_seamless 3,3 · icon_d2 3,3 · ecmwf_ifs025 3,6 |
| LFMP | gfs_seamless 1,9 · ecmwf_ifs025 1,9 · meteofrance_arome_france_hd 2,0 · meteofrance_arome_france 2,0 · icon_eu 2,0 · meteofrance_arpege_europe 2,2 |
| LFTH | meteofrance_arome_france_hd 1,7 · meteofrance_arome_france 1,7 · gfs_seamless 1,9 · ecmwf_ifs025 2,0 · icon_eu 2,0 · meteofrance_arpege_europe 2,1 |
| LFML | ecmwf_ifs025 1,9 · meteofrance_arome_france 1,9 · meteofrance_arome_france_hd 2,1 · icon_eu 2,2 · meteofrance_arpege_europe 3,2 · gfs_seamless 4,1 |
| LFMI | meteofrance_arome_france 1,7 · meteofrance_arome_france_hd 1,8 · ecmwf_ifs025 2,0 · icon_eu 2,1 · meteofrance_arpege_europe 2,7 · gfs_seamless 2,8 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.25 · ecmwf_wam025 0.29 · ewam 0.31 · gwam 0.41 · ncep_gfswave025 1.06 |
| 03404 | ewam 0.13 · gwam 0.15 · ncep_gfswave025 0.23 · ecmwf_wam025 0.25 · meteofrance_wave 0.27 |
| 01101 | meteofrance_wave 0.16 · ecmwf_wam025 0.16 · ewam 0.16 · gwam 0.18 · ncep_gfswave025 0.21 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 10.73, ×0.98 (MAE 0.27 m, n 154) ; ecmwf_wam025 poids 7.19, ×0.88 (MAE 0.31 m, n 154) ; ewam poids 7.76, ×0.88 (MAE 0.3 m, n 154) ; gwam poids 2.63, ×0.82 (MAE 0.43 m, n 154) ; copernicus poids 19.66, ×0.95 (MAE 0.18 m, n 100)
  - 03404 : meteofrance_wave poids 11.82, ×1.12 (MAE 0.25 m, n 154) ; ecmwf_wam025 poids 9.7, ×1.03 (MAE 0.25 m, n 154) ; ewam poids 16.89, ×1.02 (MAE 0.14 m, n 154) ; gwam poids 9.71, ×0.98 (MAE 0.15 m, n 154) ; ncep_gfswave025 poids 7.13, ×1.15 (MAE 0.21 m, n 154) ; copernicus poids 21.45, ×1.01 (MAE 0.16 m, n 100)
  - 01102 : 
  - 01101 : meteofrance_wave poids 17.29, ×1.19 (MAE 0.17 m, n 154) ; ecmwf_wam025 poids 16.23, ×0.94 (MAE 0.15 m, n 154) ; ewam poids 15.49, ×1.01 (MAE 0.16 m, n 154) ; gwam poids 8.26, ×0.95 (MAE 0.18 m, n 154) ; ncep_gfswave025 poids 7.42, ×1.1 (MAE 0.2 m, n 154) ; copernicus poids 29.62, ×0.99 (MAE 0.09 m, n 100)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.91, Port Camargue × 0.97 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

43 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arome_france 2,4 nd (n 12) · meteofrance_arome_france_hd 2,6 nd (n 12) · icon_eu 3,0 nd (n 12) · icon_d2 3,1 nd (n 12) · gfs_seamless 3,2 nd (n 12) · meteofrance_arpege_europe 3,6 nd (n 12) · ecmwf_ifs025 4,2 nd (n 12)
- LFMP : meteofrance_arome_france 1,8 nd (n 12) · meteofrance_arome_france_hd 2,2 nd (n 12) · icon_eu 2,4 nd (n 12) · gfs_seamless 2,6 nd (n 12) · ecmwf_ifs025 2,7 nd (n 12) · meteofrance_arpege_europe 3,1 nd (n 12)
- LFTH : meteofrance_arome_france_hd 1,9 nd (n 12) · meteofrance_arome_france 2,0 nd (n 12) · gfs_seamless 2,0 nd (n 12) · ecmwf_ifs025 2,1 nd (n 12) · icon_eu 2,2 nd (n 12) · meteofrance_arpege_europe 2,5 nd (n 12)
- LFML : meteofrance_arome_france 1,7 nd (n 12) · meteofrance_arome_france_hd 1,9 nd (n 12) · ecmwf_ifs025 2,0 nd (n 12) · icon_eu 2,7 nd (n 12) · meteofrance_arpege_europe 3,3 nd (n 12) · gfs_seamless 4,5 nd (n 12)
- LFMI : icon_eu 2,1 nd (n 12) · ecmwf_ifs025 2,7 nd (n 12) · meteofrance_arome_france_hd 3,1 nd (n 12) · meteofrance_arpege_europe 3,2 nd (n 12) · meteofrance_arome_france 3,3 nd (n 12) · gfs_seamless 3,5 nd (n 12)
