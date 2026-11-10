# Remise en question (③)

Généré le 2026-11-10 13:47 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 19 couples station × modèle (vent), 20 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 5 prévisions archivées sur 12 h ; 272 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 1,7 · meteofrance_arpege_europe 1,7 · gfs_seamless 2,2 · meteofrance_arome_france_hd 2,2 · icon_eu 2,3 · icon_d2 2,7 · ecmwf_ifs025 4,2 |
| LFMP | icon_eu 1,5 · gfs_seamless 1,5 · ecmwf_ifs025 1,7 · meteofrance_arome_france 1,8 · meteofrance_arome_france_hd 1,9 · meteofrance_arpege_europe 1,9 |
| LFTH | icon_eu 2,1 · meteofrance_arome_france_hd 2,6 · meteofrance_arome_france 2,6 · ecmwf_ifs025 2,7 · meteofrance_arpege_europe 2,7 · gfs_seamless 2,9 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | gwam 0.25 · ewam 0.26 · ecmwf_wam025 0.31 · meteofrance_wave 0.35 · ncep_gfswave025 1.34 |
| 03404 | ecmwf_wam025 0.16 · ewam 0.16 · gwam 0.16 · ncep_gfswave025 0.20 · meteofrance_wave 0.23 |
| 01102 | ecmwf_wam025 0.23 · ewam 0.32 · meteofrance_wave 0.42 · gwam 0.46 · ncep_gfswave025 0.96 |
| 01101 | ecmwf_wam025 0.15 · gwam 0.18 · ncep_gfswave025 0.18 · ewam 0.21 · meteofrance_wave 0.30 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 7.87, ×1.21 (MAE 0.34 m, n 147) ; ecmwf_wam025 poids 7.49, ×1.17 (MAE 0.31 m, n 147) ; ewam poids 10.45, ×1.08 (MAE 0.24 m, n 147) ; gwam poids 6.15, ×1.07 (MAE 0.24 m, n 147) ; copernicus poids 15.09, ×1.06 (MAE 0.23 m, n 100)
  - 03404 : meteofrance_wave poids 14.05, ×1.15 (MAE 0.21 m, n 157) ; ecmwf_wam025 poids 15.36, ×1.09 (MAE 0.16 m, n 157) ; ewam poids 16.06, ×1.03 (MAE 0.15 m, n 157) ; gwam poids 9.82, ×1.06 (MAE 0.15 m, n 157) ; ncep_gfswave025 poids 8.48, ×1.09 (MAE 0.18 m, n 157) ; copernicus poids 25.78, ×1.01 (MAE 0.12 m, n 100)
  - 01102 : meteofrance_wave poids —, ×— (MAE 0.33 m, n 124) ; ecmwf_wam025 poids —, ×— (MAE 0.19 m, n 124) ; ewam poids —, ×— (MAE 0.25 m, n 124) ; gwam poids —, ×— (MAE 0.36 m, n 124) ; copernicus poids —, ×— (MAE 0.23 m, n 53)
  - 01101 : meteofrance_wave poids 11.11, ×1.25 (MAE 0.26 m, n 172) ; ecmwf_wam025 poids 17.53, ×0.98 (MAE 0.13 m, n 172) ; ewam poids 13.7, ×1.08 (MAE 0.18 m, n 172) ; gwam poids 9.37, ×1.1 (MAE 0.15 m, n 172) ; ncep_gfswave025 poids 8.69, ×1.06 (MAE 0.17 m, n 172) ; copernicus poids 18.39, ×0.98 (MAE 0.19 m, n 100)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.16, Port Camargue × 1.03 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

5 prévisions archivées. Pas encore assez de recul pour l'échéance 24 h.
