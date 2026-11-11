# Remise en question (③)

Généré le 2026-11-11 16:04 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 20 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 12 prévisions archivées sur 33 h ; 1346 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 1,5 · gfs_seamless 1,5 · meteofrance_arpege_europe 1,6 · icon_eu 1,6 · icon_d2 1,9 · meteofrance_arome_france_hd 1,9 · ecmwf_ifs025 3,6 |
| LFMP | ecmwf_ifs025 1,3 · icon_eu 1,4 · gfs_seamless 1,4 · meteofrance_arpege_europe 1,5 · meteofrance_arome_france 1,7 · meteofrance_arome_france_hd 1,8 |
| LFTH | icon_eu 2,2 · ecmwf_ifs025 2,6 · meteofrance_arome_france_hd 3,0 · meteofrance_arome_france 3,0 · meteofrance_arpege_europe 3,4 · gfs_seamless 3,4 |
| LFML | meteofrance_arome_france_hd 2,0 · ecmwf_ifs025 2,0 · meteofrance_arome_france 2,1 · icon_eu 2,5 · meteofrance_arpege_europe 3,1 · gfs_seamless 3,7 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.20 · gwam 0.22 · ecmwf_wam025 0.29 · meteofrance_wave 0.30 · ncep_gfswave025 1.41 |
| 03404 | gwam 0.13 · ewam 0.16 · ecmwf_wam025 0.19 · ncep_gfswave025 0.19 · meteofrance_wave 0.24 |
| 01102 | ecmwf_wam025 0.21 · ewam 0.25 · meteofrance_wave 0.43 · gwam 0.47 · ncep_gfswave025 1.18 |
| 01101 | gwam 0.10 · ecmwf_wam025 0.13 · ncep_gfswave025 0.13 · ewam 0.15 · meteofrance_wave 0.26 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 9.3, ×1.16 (MAE 0.3 m, n 175) ; ecmwf_wam025 poids 8.51, ×1.11 (MAE 0.28 m, n 175) ; ewam poids 12.15, ×1.07 (MAE 0.21 m, n 175) ; gwam poids 6.6, ×1.03 (MAE 0.23 m, n 175) ; copernicus poids 19.73, ×1 (MAE 0.18 m, n 100)
  - 03404 : meteofrance_wave poids 13.1, ×1.14 (MAE 0.23 m, n 141) ; ecmwf_wam025 poids 14.92, ×1.08 (MAE 0.16 m, n 141) ; ewam poids 15.94, ×1.03 (MAE 0.15 m, n 141) ; gwam poids 9.4, ×1.05 (MAE 0.15 m, n 141) ; ncep_gfswave025 poids 7.88, ×1.08 (MAE 0.19 m, n 141) ; copernicus poids 28.93, ×1 (MAE 0.09 m, n 63)
  - 01102 : meteofrance_wave poids —, ×— (MAE 0.46 m, n 76) ; ecmwf_wam025 poids —, ×— (MAE 0.26 m, n 76) ; ewam poids —, ×— (MAE 0.37 m, n 76) ; gwam poids —, ×— (MAE 0.53 m, n 76) ; copernicus poids —, ×— (MAE 0.4 m, n 1)
  - 01101 : meteofrance_wave poids 10.29, ×1.25 (MAE 0.28 m, n 178) ; ecmwf_wam025 poids 17.15, ×0.98 (MAE 0.14 m, n 178) ; ewam poids 12.14, ×1.11 (MAE 0.21 m, n 178) ; gwam poids 9.17, ×1.11 (MAE 0.16 m, n 178) ; ncep_gfswave025 poids 9.2, ×1.04 (MAE 0.16 m, n 178) ; copernicus poids 29.64, ×1.01 (MAE 0.09 m, n 100)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.02, Port Camargue × 1.06 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

12 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 1,7 nd (n 6) · gfs_seamless 1,9 nd (n 6) · icon_d2 2,1 nd (n 6) · icon_eu 2,2 nd (n 6) · meteofrance_arome_france 2,3 nd (n 6) · meteofrance_arome_france_hd 2,3 nd (n 6) · ecmwf_ifs025 2,4 nd (n 6)
- LFMP : ecmwf_ifs025 1,3 nd (n 6) · meteofrance_arome_france_hd 1,4 nd (n 6) · meteofrance_arome_france 1,5 nd (n 6) · icon_eu 1,5 nd (n 6) · meteofrance_arpege_europe 2,0 nd (n 6) · gfs_seamless 2,1 nd (n 6)
- LFTH : icon_eu 1,9 nd (n 6) · meteofrance_arome_france 2,4 nd (n 6) · meteofrance_arome_france_hd 2,4 nd (n 6) · ecmwf_ifs025 2,5 nd (n 6) · meteofrance_arpege_europe 2,9 nd (n 6) · gfs_seamless 3,4 nd (n 6)
- LFML : 
