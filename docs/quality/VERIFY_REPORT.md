# Remise en question (③)

Généré le 2026-11-10 17:28 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 19 couples station × modèle (vent), 20 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 6 prévisions archivées sur 15 h ; 340 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 1,8 · meteofrance_arpege_europe 1,8 · gfs_seamless 2,2 · meteofrance_arome_france_hd 2,2 · icon_eu 2,3 · icon_d2 2,6 · ecmwf_ifs025 4,2 |
| LFMP | icon_eu 1,5 · gfs_seamless 1,6 · ecmwf_ifs025 1,7 · meteofrance_arome_france 1,8 · meteofrance_arome_france_hd 1,9 · meteofrance_arpege_europe 1,9 |
| LFTH | icon_eu 2,1 · meteofrance_arome_france_hd 2,6 · meteofrance_arome_france 2,6 · ecmwf_ifs025 2,7 · meteofrance_arpege_europe 2,9 · gfs_seamless 2,9 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.25 · gwam 0.25 · ecmwf_wam025 0.32 · meteofrance_wave 0.35 · ncep_gfswave025 1.37 |
| 03404 | ewam 0.16 · gwam 0.16 · ecmwf_wam025 0.17 · ncep_gfswave025 0.20 · meteofrance_wave 0.23 |
| 01102 | ecmwf_wam025 0.24 · ewam 0.34 · meteofrance_wave 0.43 · gwam 0.49 · ncep_gfswave025 0.99 |
| 01101 | ecmwf_wam025 0.15 · gwam 0.18 · ncep_gfswave025 0.19 · ewam 0.21 · meteofrance_wave 0.31 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 8.15, ×1.19 (MAE 0.33 m, n 155) ; ecmwf_wam025 poids 7.65, ×1.15 (MAE 0.3 m, n 155) ; ewam poids 10.87, ×1.08 (MAE 0.23 m, n 155) ; gwam poids 6.34, ×1.06 (MAE 0.23 m, n 155) ; copernicus poids 14.85, ×1.04 (MAE 0.23 m, n 102)
  - 03404 : meteofrance_wave poids 14.6, ×1.15 (MAE 0.21 m, n 165) ; ecmwf_wam025 poids 15.59, ×1.08 (MAE 0.16 m, n 165) ; ewam poids 16.47, ×1.03 (MAE 0.14 m, n 165) ; gwam poids 10.05, ×1.05 (MAE 0.14 m, n 165) ; ncep_gfswave025 poids 8.6, ×1.09 (MAE 0.17 m, n 165) ; copernicus poids 24.97, ×1 (MAE 0.13 m, n 102)
  - 01102 : meteofrance_wave poids —, ×— (MAE 0.33 m, n 124) ; ecmwf_wam025 poids —, ×— (MAE 0.19 m, n 124) ; ewam poids —, ×— (MAE 0.25 m, n 124) ; gwam poids —, ×— (MAE 0.36 m, n 124) ; copernicus poids —, ×— (MAE 0.21 m, n 47)
  - 01101 : meteofrance_wave poids 11.13, ×1.25 (MAE 0.26 m, n 180) ; ecmwf_wam025 poids 17.83, ×0.98 (MAE 0.13 m, n 180) ; ewam poids 13.98, ×1.08 (MAE 0.18 m, n 180) ; gwam poids 9.53, ×1.1 (MAE 0.15 m, n 180) ; ncep_gfswave025 poids 8.79, ×1.05 (MAE 0.17 m, n 180) ; copernicus poids 18.64, ×0.98 (MAE 0.19 m, n 102)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.97, Port Camargue × 0.93 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

6 prévisions archivées. Pas encore assez de recul pour l'échéance 24 h.
