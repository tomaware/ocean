# Remise en question (③)

Généré le 2026-11-11 00:15 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 20 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 9 prévisions archivées sur 24 h ; 687 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 1,7 · meteofrance_arpege_europe 1,8 · gfs_seamless 2,3 · icon_eu 2,3 · meteofrance_arome_france_hd 2,4 · icon_d2 2,9 · ecmwf_ifs025 5,0 |
| LFMP | ecmwf_ifs025 1,4 · icon_eu 1,4 · gfs_seamless 1,4 · meteofrance_arpege_europe 1,5 · meteofrance_arome_france 1,8 · meteofrance_arome_france_hd 1,9 |
| LFTH | icon_eu 2,2 · ecmwf_ifs025 2,4 · meteofrance_arome_france_hd 3,2 · meteofrance_arome_france 3,2 · meteofrance_arpege_europe 3,3 · gfs_seamless 3,6 |
| LFML | meteofrance_arome_france_hd 2,1 · ecmwf_ifs025 2,1 · meteofrance_arome_france 2,1 · icon_eu 2,9 · meteofrance_arpege_europe 3,0 · gfs_seamless 4,0 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.25 · gwam 0.26 · ecmwf_wam025 0.31 · meteofrance_wave 0.35 · ncep_gfswave025 1.43 |
| 03404 | ewam 0.16 · ecmwf_wam025 0.17 · gwam 0.17 · ncep_gfswave025 0.20 · meteofrance_wave 0.23 |
| 01102 | ecmwf_wam025 0.27 · ewam 0.39 · meteofrance_wave 0.48 · gwam 0.56 · ncep_gfswave025 1.10 |
| 01101 | ecmwf_wam025 0.15 · gwam 0.18 · ncep_gfswave025 0.19 · ewam 0.21 · meteofrance_wave 0.31 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 7.48, ×1.18 (MAE 0.35 m, n 142) ; ecmwf_wam025 poids 7.4, ×1.15 (MAE 0.31 m, n 142) ; ewam poids 10.34, ×1.08 (MAE 0.24 m, n 142) ; gwam poids 5.94, ×1.05 (MAE 0.25 m, n 142) ; copernicus poids 17.28, ×1.03 (MAE 0.2 m, n 103)
  - 03404 : meteofrance_wave poids 13.09, ×1.14 (MAE 0.23 m, n 141) ; ecmwf_wam025 poids 14.92, ×1.08 (MAE 0.16 m, n 141) ; ewam poids 15.94, ×1.03 (MAE 0.15 m, n 141) ; gwam poids 9.4, ×1.05 (MAE 0.15 m, n 141) ; ncep_gfswave025 poids 7.88, ×1.08 (MAE 0.19 m, n 141) ; copernicus poids 27.87, ×1 (MAE 0.1 m, n 99)
  - 01102 : meteofrance_wave poids —, ×— (MAE 0.46 m, n 76) ; ecmwf_wam025 poids —, ×— (MAE 0.26 m, n 76) ; ewam poids —, ×— (MAE 0.37 m, n 76) ; gwam poids —, ×— (MAE 0.53 m, n 76) ; copernicus poids —, ×— (MAE 0.14 m, n 35)
  - 01101 : meteofrance_wave poids 8.93, ×1.25 (MAE 0.31 m, n 145) ; ecmwf_wam025 poids 15.92, ×0.98 (MAE 0.15 m, n 145) ; ewam poids 11.76, ×1.08 (MAE 0.21 m, n 145) ; gwam poids 8.34, ×1.1 (MAE 0.18 m, n 145) ; ncep_gfswave025 poids 8.25, ×1.04 (MAE 0.18 m, n 145) ; copernicus poids 24.63, ×0.97 (MAE 0.13 m, n 103)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.12, Port Camargue × 1.12 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

9 prévisions archivées. Pas encore assez de recul pour l'échéance 24 h.
