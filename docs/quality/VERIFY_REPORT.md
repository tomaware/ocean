# Remise en question (③)

Généré le 2026-11-10 12:31 UTC par `pipeline/verify/run.ts`.

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
| LFMT | meteofrance_arome_france 1,7 · meteofrance_arpege_europe 1,7 · meteofrance_arome_france_hd 2,2 · gfs_seamless 2,2 · icon_eu 2,3 · icon_d2 2,7 · ecmwf_ifs025 4,3 |
| LFMP | icon_eu 1,5 · gfs_seamless 1,6 · ecmwf_ifs025 1,7 · meteofrance_arome_france 1,8 · meteofrance_arome_france_hd 1,9 · meteofrance_arpege_europe 1,9 |
| LFTH | icon_eu 2,0 · ecmwf_ifs025 2,6 · meteofrance_arome_france_hd 2,6 · meteofrance_arome_france 2,6 · meteofrance_arpege_europe 2,7 · gfs_seamless 2,9 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | gwam 0.25 · ewam 0.26 · ecmwf_wam025 0.31 · meteofrance_wave 0.34 · ncep_gfswave025 1.33 |
| 03404 | ecmwf_wam025 0.16 · ewam 0.16 · gwam 0.16 · ncep_gfswave025 0.19 · meteofrance_wave 0.23 |
| 01102 | ecmwf_wam025 0.23 · ewam 0.31 · meteofrance_wave 0.41 · gwam 0.46 · ncep_gfswave025 0.95 |
| 01101 | ecmwf_wam025 0.15 · gwam 0.18 · ncep_gfswave025 0.18 · ewam 0.21 · meteofrance_wave 0.30 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 7.8, ×1.21 (MAE 0.34 m, n 145) ; ecmwf_wam025 poids 7.48, ×1.17 (MAE 0.31 m, n 145) ; ewam poids 10.31, ×1.09 (MAE 0.24 m, n 145) ; gwam poids 6.09, ×1.07 (MAE 0.24 m, n 145) ; copernicus poids 14.9, ×1.07 (MAE 0.23 m, n 100)
  - 03404 : meteofrance_wave poids 13.89, ×1.16 (MAE 0.22 m, n 155) ; ecmwf_wam025 poids 15.24, ×1.09 (MAE 0.16 m, n 155) ; ewam poids 16, ×1.03 (MAE 0.15 m, n 155) ; gwam poids 9.76, ×1.06 (MAE 0.15 m, n 155) ; ncep_gfswave025 poids 8.48, ×1.1 (MAE 0.18 m, n 155) ; copernicus poids 25.62, ×1.01 (MAE 0.12 m, n 100)
  - 01102 : meteofrance_wave poids —, ×— (MAE 0.33 m, n 124) ; ecmwf_wam025 poids —, ×— (MAE 0.19 m, n 124) ; ewam poids —, ×— (MAE 0.25 m, n 124) ; gwam poids —, ×— (MAE 0.36 m, n 124) ; copernicus poids —, ×— (MAE 0.25 m, n 55)
  - 01101 : meteofrance_wave poids 11.17, ×1.25 (MAE 0.26 m, n 170) ; ecmwf_wam025 poids 17.5, ×0.98 (MAE 0.13 m, n 170) ; ewam poids 13.61, ×1.08 (MAE 0.18 m, n 170) ; gwam poids 9.33, ×1.1 (MAE 0.16 m, n 170) ; ncep_gfswave025 poids 8.66, ×1.06 (MAE 0.17 m, n 170) ; copernicus poids 18.3, ×0.98 (MAE 0.19 m, n 100)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.1, Port Camargue × 1.01 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

5 prévisions archivées. Pas encore assez de recul pour l'échéance 24 h.
