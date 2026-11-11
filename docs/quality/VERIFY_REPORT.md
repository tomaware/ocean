# Remise en question (③)

Généré le 2026-11-11 05:38 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 20 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 10 prévisions archivées sur 27 h ; 923 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 1,6 · meteofrance_arpege_europe 1,7 · gfs_seamless 1,9 · icon_eu 2,1 · meteofrance_arome_france_hd 2,3 · icon_d2 2,7 · ecmwf_ifs025 5,1 |
| LFMP | gfs_seamless 1,4 · icon_eu 1,4 · meteofrance_arpege_europe 1,4 · ecmwf_ifs025 1,5 · meteofrance_arome_france 1,7 · meteofrance_arome_france_hd 1,8 |
| LFTH | icon_eu 2,3 · ecmwf_ifs025 2,4 · meteofrance_arome_france_hd 3,3 · meteofrance_arome_france 3,3 · meteofrance_arpege_europe 3,6 · gfs_seamless 3,6 |
| LFML | ecmwf_ifs025 2,0 · meteofrance_arome_france_hd 2,0 · meteofrance_arome_france 2,0 · icon_eu 2,8 · meteofrance_arpege_europe 3,0 · gfs_seamless 3,8 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.25 · gwam 0.26 · ecmwf_wam025 0.32 · meteofrance_wave 0.35 · ncep_gfswave025 1.47 |
| 03404 | ecmwf_wam025 0.17 · ewam 0.17 · gwam 0.17 · ncep_gfswave025 0.20 · meteofrance_wave 0.24 |
| 01102 | ecmwf_wam025 0.25 · ewam 0.38 · meteofrance_wave 0.48 · gwam 0.57 · ncep_gfswave025 1.14 |
| 01101 | ecmwf_wam025 0.14 · gwam 0.16 · ncep_gfswave025 0.16 · ewam 0.20 · meteofrance_wave 0.29 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 8.28, ×1.18 (MAE 0.32 m, n 153) ; ecmwf_wam025 poids 8.01, ×1.14 (MAE 0.29 m, n 153) ; ewam poids 11.17, ×1.08 (MAE 0.22 m, n 153) ; gwam poids 6.3, ×1.05 (MAE 0.24 m, n 153) ; copernicus poids 20.48, ×1.03 (MAE 0.17 m, n 102)
  - 03404 : meteofrance_wave poids 13.09, ×1.14 (MAE 0.23 m, n 141) ; ecmwf_wam025 poids 14.92, ×1.08 (MAE 0.16 m, n 141) ; ewam poids 15.94, ×1.03 (MAE 0.15 m, n 141) ; gwam poids 9.4, ×1.05 (MAE 0.15 m, n 141) ; ncep_gfswave025 poids 7.88, ×1.08 (MAE 0.19 m, n 141) ; copernicus poids 28.77, ×0.99 (MAE 0.09 m, n 87)
  - 01102 : meteofrance_wave poids —, ×— (MAE 0.46 m, n 76) ; ecmwf_wam025 poids —, ×— (MAE 0.26 m, n 76) ; ewam poids —, ×— (MAE 0.37 m, n 76) ; gwam poids —, ×— (MAE 0.53 m, n 76) ; copernicus poids —, ×— (MAE 0.12 m, n 24)
  - 01101 : meteofrance_wave poids 9.35, ×1.25 (MAE 0.3 m, n 156) ; ecmwf_wam025 poids 16.45, ×0.98 (MAE 0.14 m, n 156) ; ewam poids 11.8, ×1.09 (MAE 0.21 m, n 156) ; gwam poids 8.57, ×1.1 (MAE 0.17 m, n 156) ; ncep_gfswave025 poids 8.6, ×1.04 (MAE 0.17 m, n 156) ; copernicus poids 25.95, ×0.98 (MAE 0.12 m, n 102)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.97, Port Camargue × 0.92 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

10 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 0,5 nd (n 3) · meteofrance_arome_france 0,6 nd (n 3) · meteofrance_arome_france_hd 0,9 nd (n 3) · icon_eu 1,2 nd (n 3) · icon_d2 1,3 nd (n 3) · ecmwf_ifs025 1,8 nd (n 3) · gfs_seamless 2,0 nd (n 3)
- LFMP : meteofrance_arome_france_hd 1,1 nd (n 3) · meteofrance_arome_france 1,3 nd (n 3) · ecmwf_ifs025 1,6 nd (n 3) · gfs_seamless 1,7 nd (n 3) · meteofrance_arpege_europe 1,9 nd (n 3) · icon_eu 2,2 nd (n 3)
- LFTH : ecmwf_ifs025 0,7 nd (n 3) · meteofrance_arome_france_hd 1,9 nd (n 3) · meteofrance_arome_france 1,9 nd (n 3) · meteofrance_arpege_europe 1,9 nd (n 3) · icon_eu 1,9 nd (n 3) · gfs_seamless 3,5 nd (n 3)
- LFML : 
