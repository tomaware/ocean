# Remise en question (③)

Généré le 2026-11-10 11:49 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 19 couples station × modèle (vent), 20 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 4 prévisions archivées sur 9 h ; 193 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 1,7 · meteofrance_arpege_europe 1,7 · meteofrance_arome_france_hd 2,2 · gfs_seamless 2,2 · icon_eu 2,4 · icon_d2 2,7 · ecmwf_ifs025 4,3 |
| LFMP | icon_eu 1,5 · gfs_seamless 1,6 · ecmwf_ifs025 1,7 · meteofrance_arome_france 1,8 · meteofrance_arome_france_hd 1,9 · meteofrance_arpege_europe 1,9 |
| LFTH | icon_eu 2,0 · ecmwf_ifs025 2,6 · meteofrance_arome_france_hd 2,6 · meteofrance_arome_france 2,6 · meteofrance_arpege_europe 2,7 · gfs_seamless 2,9 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | gwam 0.25 · ewam 0.26 · ecmwf_wam025 0.31 · meteofrance_wave 0.36 · ncep_gfswave025 1.32 |
| 03404 | ecmwf_wam025 0.16 · gwam 0.16 · ewam 0.17 · ncep_gfswave025 0.19 · meteofrance_wave 0.26 |
| 01102 | ecmwf_wam025 0.23 · ewam 0.31 · meteofrance_wave 0.40 · gwam 0.45 · ncep_gfswave025 0.94 |
| 01101 | ecmwf_wam025 0.15 · gwam 0.18 · ncep_gfswave025 0.18 · ewam 0.21 · meteofrance_wave 0.33 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 7.23, ×1.23 (MAE 0.35 m, n 143) ; ecmwf_wam025 poids 7.44, ×1.18 (MAE 0.31 m, n 143) ; ewam poids 10.16, ×1.09 (MAE 0.24 m, n 143) ; gwam poids 6.02, ×1.07 (MAE 0.24 m, n 143) ; copernicus poids 14.53, ×1.07 (MAE 0.24 m, n 102)
  - 03404 : meteofrance_wave poids 12.11, ×1.18 (MAE 0.24 m, n 153) ; ecmwf_wam025 poids 15.13, ×1.09 (MAE 0.16 m, n 153) ; ewam poids 15.87, ×1.03 (MAE 0.15 m, n 153) ; gwam poids 9.69, ×1.06 (MAE 0.15 m, n 153) ; ncep_gfswave025 poids 8.45, ×1.1 (MAE 0.18 m, n 153) ; copernicus poids 25.33, ×1.01 (MAE 0.12 m, n 102)
  - 01102 : meteofrance_wave poids —, ×— (MAE 0.33 m, n 124) ; ecmwf_wam025 poids —, ×— (MAE 0.19 m, n 124) ; ewam poids —, ×— (MAE 0.25 m, n 124) ; gwam poids —, ×— (MAE 0.36 m, n 124) ; copernicus poids —, ×— (MAE 0.27 m, n 59)
  - 01101 : meteofrance_wave poids 9.83, ×1.25 (MAE 0.29 m, n 168) ; ecmwf_wam025 poids 17.45, ×0.98 (MAE 0.13 m, n 168) ; ewam poids 13.51, ×1.08 (MAE 0.18 m, n 168) ; gwam poids 9.27, ×1.1 (MAE 0.16 m, n 168) ; ncep_gfswave025 poids 8.66, ×1.06 (MAE 0.17 m, n 168) ; copernicus poids 18.15, ×0.98 (MAE 0.19 m, n 102)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.15, Port Camargue × 1.05 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

4 prévisions archivées. Pas encore assez de recul pour l'échéance 24 h.
