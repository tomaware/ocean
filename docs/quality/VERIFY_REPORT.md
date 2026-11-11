# Remise en question (③)

Généré le 2026-11-11 04:37 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 20 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 10 prévisions archivées sur 27 h ; 810 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 1,6 · meteofrance_arpege_europe 1,7 · gfs_seamless 2,0 · icon_eu 2,1 · meteofrance_arome_france_hd 2,3 · icon_d2 2,7 · ecmwf_ifs025 5,1 |
| LFMP | gfs_seamless 1,3 · icon_eu 1,4 · ecmwf_ifs025 1,5 · meteofrance_arpege_europe 1,5 · meteofrance_arome_france 1,7 · meteofrance_arome_france_hd 1,8 |
| LFTH | icon_eu 2,3 · ecmwf_ifs025 2,4 · meteofrance_arome_france_hd 3,2 · meteofrance_arome_france 3,2 · meteofrance_arpege_europe 3,5 · gfs_seamless 3,7 |
| LFML | meteofrance_arome_france_hd 2,0 · ecmwf_ifs025 2,0 · meteofrance_arome_france 2,1 · icon_eu 2,8 · meteofrance_arpege_europe 3,0 · gfs_seamless 3,9 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.25 · gwam 0.26 · ecmwf_wam025 0.32 · meteofrance_wave 0.35 · ncep_gfswave025 1.46 |
| 03404 | ecmwf_wam025 0.17 · ewam 0.17 · gwam 0.17 · ncep_gfswave025 0.20 · meteofrance_wave 0.24 |
| 01102 | ecmwf_wam025 0.25 · ewam 0.38 · meteofrance_wave 0.48 · gwam 0.57 · ncep_gfswave025 1.13 |
| 01101 | ecmwf_wam025 0.14 · gwam 0.17 · ncep_gfswave025 0.17 · ewam 0.21 · meteofrance_wave 0.30 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 8.14, ×1.18 (MAE 0.33 m, n 151) ; ecmwf_wam025 poids 7.9, ×1.14 (MAE 0.29 m, n 151) ; ewam poids 11.02, ×1.08 (MAE 0.23 m, n 151) ; gwam poids 6.24, ×1.05 (MAE 0.24 m, n 151) ; copernicus poids 20.38, ×1.03 (MAE 0.17 m, n 100)
  - 03404 : meteofrance_wave poids 13.09, ×1.14 (MAE 0.23 m, n 141) ; ecmwf_wam025 poids 14.92, ×1.08 (MAE 0.16 m, n 141) ; ewam poids 15.94, ×1.03 (MAE 0.15 m, n 141) ; gwam poids 9.4, ×1.05 (MAE 0.15 m, n 141) ; ncep_gfswave025 poids 7.88, ×1.08 (MAE 0.19 m, n 141) ; copernicus poids 28.77, ×0.99 (MAE 0.09 m, n 87)
  - 01102 : meteofrance_wave poids —, ×— (MAE 0.46 m, n 76) ; ecmwf_wam025 poids —, ×— (MAE 0.26 m, n 76) ; ewam poids —, ×— (MAE 0.37 m, n 76) ; gwam poids —, ×— (MAE 0.53 m, n 76) ; copernicus poids —, ×— (MAE 0.12 m, n 24)
  - 01101 : meteofrance_wave poids 9.33, ×1.25 (MAE 0.3 m, n 154) ; ecmwf_wam025 poids 16.39, ×0.98 (MAE 0.14 m, n 154) ; ewam poids 11.86, ×1.09 (MAE 0.21 m, n 154) ; gwam poids 8.57, ×1.1 (MAE 0.17 m, n 154) ; ncep_gfswave025 poids 8.56, ×1.03 (MAE 0.17 m, n 154) ; copernicus poids 26.01, ×0.98 (MAE 0.12 m, n 100)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.97, Port Camargue × 0.92 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

10 prévisions archivées. Pas encore assez de recul pour l'échéance 24 h.
