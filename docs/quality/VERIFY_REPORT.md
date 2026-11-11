# Remise en question (③)

Généré le 2026-11-11 01:44 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 20 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 9 prévisions archivées sur 24 h ; 717 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 1,7 · meteofrance_arpege_europe 1,8 · gfs_seamless 2,2 · icon_eu 2,3 · meteofrance_arome_france_hd 2,4 · icon_d2 2,9 · ecmwf_ifs025 5,2 |
| LFMP | gfs_seamless 1,4 · ecmwf_ifs025 1,4 · icon_eu 1,4 · meteofrance_arpege_europe 1,5 · meteofrance_arome_france 1,7 · meteofrance_arome_france_hd 1,9 |
| LFTH | icon_eu 2,2 · ecmwf_ifs025 2,4 · meteofrance_arome_france_hd 3,3 · meteofrance_arome_france 3,3 · meteofrance_arpege_europe 3,4 · gfs_seamless 3,6 |
| LFML | meteofrance_arome_france_hd 2,0 · ecmwf_ifs025 2,0 · meteofrance_arome_france 2,1 · icon_eu 2,7 · meteofrance_arpege_europe 3,1 · gfs_seamless 4,1 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.25 · gwam 0.26 · ecmwf_wam025 0.32 · meteofrance_wave 0.35 · ncep_gfswave025 1.44 |
| 03404 | ecmwf_wam025 0.17 · ewam 0.17 · gwam 0.17 · ncep_gfswave025 0.20 · meteofrance_wave 0.23 |
| 01102 | ecmwf_wam025 0.26 · ewam 0.39 · meteofrance_wave 0.48 · gwam 0.56 · ncep_gfswave025 1.11 |
| 01101 | ecmwf_wam025 0.15 · gwam 0.18 · ncep_gfswave025 0.18 · ewam 0.21 · meteofrance_wave 0.31 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 7.71, ×1.18 (MAE 0.34 m, n 145) ; ecmwf_wam025 poids 7.53, ×1.14 (MAE 0.3 m, n 145) ; ewam poids 10.55, ×1.08 (MAE 0.23 m, n 145) ; gwam poids 6.01, ×1.05 (MAE 0.24 m, n 145) ; copernicus poids 19.16, ×1.02 (MAE 0.18 m, n 100)
  - 03404 : meteofrance_wave poids 13.09, ×1.14 (MAE 0.23 m, n 141) ; ecmwf_wam025 poids 14.92, ×1.08 (MAE 0.16 m, n 141) ; ewam poids 15.94, ×1.03 (MAE 0.15 m, n 141) ; gwam poids 9.4, ×1.05 (MAE 0.15 m, n 141) ; ncep_gfswave025 poids 7.88, ×1.08 (MAE 0.19 m, n 141) ; copernicus poids 28.76, ×0.99 (MAE 0.09 m, n 93)
  - 01102 : meteofrance_wave poids —, ×— (MAE 0.46 m, n 76) ; ecmwf_wam025 poids —, ×— (MAE 0.26 m, n 76) ; ewam poids —, ×— (MAE 0.37 m, n 76) ; gwam poids —, ×— (MAE 0.53 m, n 76) ; copernicus poids —, ×— (MAE 0.15 m, n 29)
  - 01101 : meteofrance_wave poids 9.13, ×1.25 (MAE 0.3 m, n 148) ; ecmwf_wam025 poids 16.12, ×0.98 (MAE 0.15 m, n 148) ; ewam poids 11.9, ×1.09 (MAE 0.21 m, n 148) ; gwam poids 8.45, ×1.1 (MAE 0.18 m, n 148) ; ncep_gfswave025 poids 8.35, ×1.03 (MAE 0.18 m, n 148) ; copernicus poids 24.73, ×0.97 (MAE 0.13 m, n 100)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.02, Port Camargue × 1.01 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

9 prévisions archivées. Pas encore assez de recul pour l'échéance 24 h.
