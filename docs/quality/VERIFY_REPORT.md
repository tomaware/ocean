# Remise en question (③)

Généré le 2026-11-11 07:57 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 20 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 11 prévisions archivées sur 30 h ; 1008 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arpege_europe 1,5 · gfs_seamless 1,6 · meteofrance_arome_france 1,6 · icon_eu 2,0 · meteofrance_arome_france_hd 2,2 · icon_d2 2,5 · ecmwf_ifs025 4,8 |
| LFMP | gfs_seamless 1,4 · ecmwf_ifs025 1,4 · icon_eu 1,4 · meteofrance_arpege_europe 1,4 · meteofrance_arome_france 1,7 · meteofrance_arome_france_hd 1,8 |
| LFTH | icon_eu 2,4 · ecmwf_ifs025 2,6 · meteofrance_arome_france_hd 3,4 · meteofrance_arome_france 3,4 · gfs_seamless 3,6 · meteofrance_arpege_europe 3,7 |
| LFML | ecmwf_ifs025 2,0 · meteofrance_arome_france_hd 2,1 · meteofrance_arome_france 2,1 · icon_eu 2,7 · meteofrance_arpege_europe 3,1 · gfs_seamless 3,8 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.24 · gwam 0.25 · ecmwf_wam025 0.31 · meteofrance_wave 0.34 · ncep_gfswave025 1.46 |
| 03404 | gwam 0.16 · ewam 0.17 · ecmwf_wam025 0.18 · ncep_gfswave025 0.20 · meteofrance_wave 0.24 |
| 01102 | ecmwf_wam025 0.26 · ewam 0.37 · meteofrance_wave 0.48 · gwam 0.56 · ncep_gfswave025 1.15 |
| 01101 | ecmwf_wam025 0.13 · gwam 0.15 · ncep_gfswave025 0.16 · ewam 0.19 · meteofrance_wave 0.28 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 8.6, ×1.17 (MAE 0.32 m, n 158) ; ecmwf_wam025 poids 8.23, ×1.13 (MAE 0.29 m, n 158) ; ewam poids 11.5, ×1.08 (MAE 0.22 m, n 158) ; gwam poids 6.45, ×1.05 (MAE 0.23 m, n 158) ; copernicus poids 20.78, ×1.03 (MAE 0.17 m, n 107)
  - 03404 : meteofrance_wave poids 13.09, ×1.14 (MAE 0.23 m, n 141) ; ecmwf_wam025 poids 14.92, ×1.08 (MAE 0.16 m, n 141) ; ewam poids 15.94, ×1.03 (MAE 0.15 m, n 141) ; gwam poids 9.4, ×1.05 (MAE 0.15 m, n 141) ; ncep_gfswave025 poids 7.88, ×1.08 (MAE 0.19 m, n 141) ; copernicus poids 28.77, ×0.99 (MAE 0.09 m, n 87)
  - 01102 : meteofrance_wave poids —, ×— (MAE 0.46 m, n 76) ; ecmwf_wam025 poids —, ×— (MAE 0.26 m, n 76) ; ewam poids —, ×— (MAE 0.37 m, n 76) ; gwam poids —, ×— (MAE 0.53 m, n 76) ; copernicus poids —, ×— (MAE 0.12 m, n 24)
  - 01101 : meteofrance_wave poids 9.49, ×1.25 (MAE 0.29 m, n 161) ; ecmwf_wam025 poids 16.73, ×0.98 (MAE 0.14 m, n 161) ; ewam poids 11.75, ×1.1 (MAE 0.21 m, n 161) ; gwam poids 8.65, ×1.1 (MAE 0.17 m, n 161) ; ncep_gfswave025 poids 8.76, ×1.04 (MAE 0.17 m, n 161) ; copernicus poids 26.21, ×0.98 (MAE 0.12 m, n 107)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.02, Port Camargue × 1 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

11 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 0,5 nd (n 3) · meteofrance_arome_france 0,6 nd (n 3) · meteofrance_arome_france_hd 0,9 nd (n 3) · icon_eu 1,2 nd (n 3) · icon_d2 1,3 nd (n 3) · ecmwf_ifs025 1,8 nd (n 3) · gfs_seamless 2,0 nd (n 3)
- LFMP : ecmwf_ifs025 1,5 nd (n 3) · meteofrance_arome_france_hd 2,0 nd (n 3) · meteofrance_arome_france 2,0 nd (n 3) · gfs_seamless 2,0 nd (n 3) · icon_eu 2,1 nd (n 3) · meteofrance_arpege_europe 2,9 nd (n 3)
- LFTH : ecmwf_ifs025 0,7 nd (n 3) · meteofrance_arome_france_hd 1,6 nd (n 3) · meteofrance_arome_france 1,6 nd (n 3) · meteofrance_arpege_europe 2,3 nd (n 3) · icon_eu 2,3 nd (n 3) · gfs_seamless 3,8 nd (n 3)
- LFML : 
