# Remise en question (③)

Généré le 2026-11-15 00:13 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 30 prévisions archivées sur 120 h ; 2884 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arpege_europe 1,9 · meteofrance_arome_france 2,2 · icon_d2 2,3 · meteofrance_arome_france_hd 2,5 · ecmwf_ifs025 2,7 · gfs_seamless 2,7 · icon_eu 2,7 |
| LFMP | meteofrance_arome_france_hd 1,6 · meteofrance_arome_france 1,7 · gfs_seamless 1,9 · icon_eu 2,1 · ecmwf_ifs025 2,3 · meteofrance_arpege_europe 2,4 |
| LFTH | ecmwf_ifs025 2,2 · icon_eu 2,4 · meteofrance_arpege_europe 3,3 · gfs_seamless 3,6 · meteofrance_arome_france_hd 4,1 · meteofrance_arome_france 4,1 |
| LFML | meteofrance_arome_france_hd 2,2 · meteofrance_arome_france 2,3 · icon_eu 2,3 · ecmwf_ifs025 3,4 · meteofrance_arpege_europe 3,7 · gfs_seamless 5,6 |
| LFMI | meteofrance_arome_france_hd 2,3 · meteofrance_arome_france 2,4 · meteofrance_arpege_europe 2,5 · icon_eu 2,9 · ecmwf_ifs025 3,5 · gfs_seamless 4,0 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.18 · meteofrance_wave 0.28 · ecmwf_wam025 0.33 · gwam 0.43 · ncep_gfswave025 0.97 |
| 03404 | meteofrance_wave 0.18 · ewam 0.18 · ncep_gfswave025 0.20 · ecmwf_wam025 0.26 · gwam 0.26 |
| 01101 | meteofrance_wave 0.15 · ewam 0.23 · ecmwf_wam025 0.29 · ncep_gfswave025 0.30 · gwam 0.36 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 10.65, ×0.93 (MAE 0.27 m, n 141) ; ecmwf_wam025 poids 6.88, ×0.86 (MAE 0.32 m, n 141) ; ewam poids 12.87, ×0.89 (MAE 0.19 m, n 141) ; gwam poids 2.63, ×0.8 (MAE 0.43 m, n 141) ; copernicus poids 13.25, ×0.89 (MAE 0.26 m, n 102)
  - 03404 : meteofrance_wave poids 17.06, ×0.94 (MAE 0.17 m, n 126) ; ecmwf_wam025 poids 9.22, ×0.86 (MAE 0.26 m, n 126) ; ewam poids 13.17, ×0.93 (MAE 0.19 m, n 126) ; gwam poids 5.72, ×0.84 (MAE 0.25 m, n 126) ; ncep_gfswave025 poids 7.74, ×0.99 (MAE 0.19 m, n 126) ; copernicus poids 21.52, ×0.9 (MAE 0.16 m, n 102)
  - 01102 : 
  - 01101 : meteofrance_wave poids 19.58, ×1.08 (MAE 0.15 m, n 143) ; ecmwf_wam025 poids 7.99, ×0.8 (MAE 0.29 m, n 143) ; ewam poids 10.9, ×0.9 (MAE 0.23 m, n 143) ; gwam poids 3.53, ×0.8 (MAE 0.36 m, n 143) ; ncep_gfswave025 poids 4.7, ×0.91 (MAE 0.3 m, n 143) ; copernicus poids 24.05, ×0.9 (MAE 0.13 m, n 102)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1, Port Camargue × 1.07 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

30 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 1,7 nd (n 10) · ecmwf_ifs025 2,3 nd (n 10) · gfs_seamless 2,3 nd (n 10) · icon_d2 2,3 nd (n 10) · meteofrance_arome_france 2,5 nd (n 10) · meteofrance_arome_france_hd 2,6 nd (n 10) · icon_eu 3,3 nd (n 10)
- LFMP : gfs_seamless 1,1 nd (n 10) · meteofrance_arpege_europe 1,7 nd (n 10) · meteofrance_arome_france_hd 1,8 nd (n 10) · meteofrance_arome_france 1,8 nd (n 10) · icon_eu 1,9 nd (n 10) · ecmwf_ifs025 1,9 nd (n 10)
- LFTH : icon_eu 2,2 nd (n 10) · ecmwf_ifs025 2,9 nd (n 10) · meteofrance_arpege_europe 3,3 nd (n 10) · meteofrance_arome_france_hd 4,4 nd (n 10) · meteofrance_arome_france 4,4 nd (n 10) · gfs_seamless 4,8 nd (n 10)
- LFML : icon_eu 2,5 nd (n 10) · meteofrance_arome_france_hd 3,2 nd (n 10) · meteofrance_arome_france 3,3 nd (n 10) · ecmwf_ifs025 3,3 nd (n 10) · meteofrance_arpege_europe 4,7 nd (n 10) · gfs_seamless 6,2 nd (n 10)
- LFMI : 
