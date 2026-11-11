# Remise en question (③)

Généré le 2026-11-11 03:30 UTC par `pipeline/verify/run.ts`.

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
| LFMT | meteofrance_arome_france 1,6 · meteofrance_arpege_europe 1,8 · gfs_seamless 2,1 · icon_eu 2,2 · meteofrance_arome_france_hd 2,4 · icon_d2 2,8 · ecmwf_ifs025 5,2 |
| LFMP | gfs_seamless 1,3 · icon_eu 1,4 · ecmwf_ifs025 1,4 · meteofrance_arpege_europe 1,5 · meteofrance_arome_france 1,7 · meteofrance_arome_france_hd 1,8 |
| LFTH | icon_eu 2,3 · ecmwf_ifs025 2,4 · meteofrance_arome_france_hd 3,2 · meteofrance_arome_france 3,2 · meteofrance_arpege_europe 3,4 · gfs_seamless 3,7 |
| LFML | meteofrance_arome_france_hd 2,1 · ecmwf_ifs025 2,1 · meteofrance_arome_france 2,1 · icon_eu 2,8 · meteofrance_arpege_europe 3,1 · gfs_seamless 4,0 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.25 · gwam 0.26 · ecmwf_wam025 0.32 · meteofrance_wave 0.35 · ncep_gfswave025 1.46 |
| 03404 | ecmwf_wam025 0.17 · ewam 0.17 · gwam 0.17 · ncep_gfswave025 0.20 · meteofrance_wave 0.23 |
| 01102 | ecmwf_wam025 0.25 · ewam 0.39 · meteofrance_wave 0.48 · gwam 0.57 · ncep_gfswave025 1.12 |
| 01101 | ecmwf_wam025 0.14 · gwam 0.17 · ncep_gfswave025 0.17 · ewam 0.21 · meteofrance_wave 0.30 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 8.02, ×1.18 (MAE 0.33 m, n 149) ; ecmwf_wam025 poids 7.8, ×1.14 (MAE 0.3 m, n 149) ; ewam poids 10.77, ×1.08 (MAE 0.23 m, n 149) ; gwam poids 6.08, ×1.05 (MAE 0.24 m, n 149) ; copernicus poids 19.44, ×1.02 (MAE 0.18 m, n 104)
  - 03404 : meteofrance_wave poids 13.09, ×1.14 (MAE 0.23 m, n 141) ; ecmwf_wam025 poids 14.92, ×1.08 (MAE 0.16 m, n 141) ; ewam poids 15.94, ×1.03 (MAE 0.15 m, n 141) ; gwam poids 9.4, ×1.05 (MAE 0.15 m, n 141) ; ncep_gfswave025 poids 7.88, ×1.08 (MAE 0.19 m, n 141) ; copernicus poids 28.76, ×0.99 (MAE 0.09 m, n 93)
  - 01102 : meteofrance_wave poids —, ×— (MAE 0.46 m, n 76) ; ecmwf_wam025 poids —, ×— (MAE 0.26 m, n 76) ; ewam poids —, ×— (MAE 0.37 m, n 76) ; gwam poids —, ×— (MAE 0.53 m, n 76) ; copernicus poids —, ×— (MAE 0.15 m, n 29)
  - 01101 : meteofrance_wave poids 9.28, ×1.25 (MAE 0.3 m, n 152) ; ecmwf_wam025 poids 16.33, ×0.98 (MAE 0.15 m, n 152) ; ewam poids 11.91, ×1.09 (MAE 0.21 m, n 152) ; gwam poids 8.58, ×1.1 (MAE 0.17 m, n 152) ; ncep_gfswave025 poids 8.5, ×1.03 (MAE 0.17 m, n 152) ; copernicus poids 25, ×0.97 (MAE 0.13 m, n 104)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.97, Port Camargue × 0.96 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

10 prévisions archivées. Pas encore assez de recul pour l'échéance 24 h.
