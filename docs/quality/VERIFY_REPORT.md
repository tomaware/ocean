# Remise en question (③)

Généré le 2026-11-15 20:17 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 36 prévisions archivées sur 138 h ; 3464 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arpege_europe 2,8 · meteofrance_arome_france_hd 3,0 · meteofrance_arome_france 3,0 · icon_d2 3,1 · icon_eu 3,1 · gfs_seamless 4,0 · ecmwf_ifs025 4,1 |
| LFMP | icon_eu 1,5 · gfs_seamless 1,6 · meteofrance_arome_france_hd 1,6 · meteofrance_arome_france 1,6 · ecmwf_ifs025 1,7 · meteofrance_arpege_europe 2,1 |
| LFTH | ecmwf_ifs025 2,2 · icon_eu 2,8 · meteofrance_arpege_europe 4,2 · gfs_seamless 4,2 · meteofrance_arome_france_hd 4,7 · meteofrance_arome_france 4,8 |
| LFML | meteofrance_arome_france 2,0 · meteofrance_arome_france_hd 2,2 · ecmwf_ifs025 2,4 · icon_eu 2,6 · meteofrance_arpege_europe 3,1 · gfs_seamless 5,6 |
| LFMI | meteofrance_arome_france_hd 2,4 · meteofrance_arome_france 2,4 · meteofrance_arpege_europe 2,8 · ecmwf_ifs025 2,8 · icon_eu 3,2 · gfs_seamless 3,7 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.31 · meteofrance_wave 0.34 · ecmwf_wam025 0.41 · gwam 0.56 · ncep_gfswave025 1.13 |
| 03404 | ewam 0.18 · gwam 0.24 · ncep_gfswave025 0.26 · meteofrance_wave 0.29 · ecmwf_wam025 0.33 |
| 01101 | meteofrance_wave 0.17 · ewam 0.19 · ncep_gfswave025 0.26 · ecmwf_wam025 0.27 · gwam 0.32 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 10.05, ×0.95 (MAE 0.28 m, n 183) ; ecmwf_wam025 poids 6.53, ×0.87 (MAE 0.34 m, n 183) ; ewam poids 8.37, ×0.86 (MAE 0.28 m, n 183) ; gwam poids 2.18, ×0.8 (MAE 0.49 m, n 183) ; copernicus poids 10, ×0.94 (MAE 0.32 m, n 102)
  - 03404 : meteofrance_wave poids 10.69, ×1.06 (MAE 0.27 m, n 168) ; ecmwf_wam025 poids 7.78, ×0.96 (MAE 0.3 m, n 168) ; ewam poids 12.9, ×0.96 (MAE 0.19 m, n 168) ; gwam poids 6.17, ×0.9 (MAE 0.24 m, n 168) ; ncep_gfswave025 poids 6.18, ×1.06 (MAE 0.24 m, n 168) ; copernicus poids 18.09, ×1.05 (MAE 0.19 m, n 102)
  - 01102 : 
  - 01101 : meteofrance_wave poids 17.04, ×1.12 (MAE 0.17 m, n 185) ; ecmwf_wam025 poids 8.99, ×0.84 (MAE 0.27 m, n 185) ; ewam poids 10.89, ×0.9 (MAE 0.23 m, n 185) ; gwam poids 4.03, ×0.81 (MAE 0.33 m, n 185) ; ncep_gfswave025 poids 5.42, ×0.94 (MAE 0.27 m, n 185) ; copernicus poids 24.13, ×0.97 (MAE 0.13 m, n 102)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.12, Port Camargue × 1.08 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

36 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arome_france 2,8 nd (n 11) · icon_d2 2,9 nd (n 11) · meteofrance_arpege_europe 3,2 nd (n 11) · meteofrance_arome_france_hd 3,4 nd (n 11) · gfs_seamless 3,5 nd (n 11) · icon_eu 3,6 nd (n 11) · ecmwf_ifs025 4,6 nd (n 11)
- LFMP : gfs_seamless 1,1 nd (n 11) · meteofrance_arpege_europe 1,4 nd (n 11) · icon_eu 1,5 nd (n 11) · ecmwf_ifs025 1,5 nd (n 11) · meteofrance_arome_france 2,0 nd (n 11) · meteofrance_arome_france_hd 2,0 nd (n 11)
- LFTH : icon_eu 2,3 nd (n 11) · ecmwf_ifs025 2,9 nd (n 11) · meteofrance_arpege_europe 3,5 nd (n 11) · gfs_seamless 4,2 nd (n 11) · meteofrance_arome_france_hd 5,3 nd (n 11) · meteofrance_arome_france 5,3 nd (n 11)
- LFML : icon_eu 2,8 nd (n 11) · meteofrance_arome_france 2,8 nd (n 11) · meteofrance_arome_france_hd 3,0 nd (n 11) · meteofrance_arpege_europe 3,0 nd (n 11) · ecmwf_ifs025 3,2 nd (n 11) · gfs_seamless 6,4 nd (n 11)
- LFMI : 
