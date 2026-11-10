# Remise en question (③)

Généré le 2026-11-10 06:34 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 19 couples station × modèle (vent), 20 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 3 prévisions archivées sur 6 h ; 102 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 1,7 · meteofrance_arpege_europe 1,7 · meteofrance_arome_france_hd 2,2 · icon_eu 2,4 · gfs_seamless 2,4 · icon_d2 2,7 · ecmwf_ifs025 4,3 |
| LFMP | icon_eu 1,4 · gfs_seamless 1,6 · ecmwf_ifs025 1,7 · meteofrance_arome_france 1,7 · meteofrance_arome_france_hd 1,8 · meteofrance_arpege_europe 2,0 |
| LFTH | icon_eu 2,2 · meteofrance_arome_france_hd 2,6 · meteofrance_arome_france 2,6 · ecmwf_ifs025 2,7 · meteofrance_arpege_europe 2,8 · gfs_seamless 2,8 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | gwam 0.24 · ewam 0.26 · ecmwf_wam025 0.30 · meteofrance_wave 0.35 · ncep_gfswave025 1.24 |
| 03404 | gwam 0.15 · ecmwf_wam025 0.16 · ewam 0.16 · ncep_gfswave025 0.19 · meteofrance_wave 0.25 |
| 01102 | ecmwf_wam025 0.21 · ewam 0.29 · meteofrance_wave 0.37 · gwam 0.41 · ncep_gfswave025 0.89 |
| 01101 | ecmwf_wam025 0.14 · gwam 0.17 · ncep_gfswave025 0.18 · ewam 0.21 · meteofrance_wave 0.31 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 6.79, ×1.25 (MAE 0.37 m, n 133) ; ecmwf_wam025 poids 7.25, ×1.2 (MAE 0.31 m, n 133) ; ewam poids 9.53, ×1.09 (MAE 0.25 m, n 133) ; gwam poids 5.97, ×1.09 (MAE 0.25 m, n 133)
  - 03404 : meteofrance_wave poids 11.98, ×1.19 (MAE 0.25 m, n 143) ; ecmwf_wam025 poids 14.73, ×1.09 (MAE 0.17 m, n 143) ; ewam poids 15.69, ×1.04 (MAE 0.15 m, n 143) ; gwam poids 9.48, ×1.07 (MAE 0.15 m, n 143) ; ncep_gfswave025 poids 8.17, ×1.11 (MAE 0.18 m, n 143)
  - 01102 : meteofrance_wave poids —, ×— (MAE 0.33 m, n 124) ; ecmwf_wam025 poids —, ×— (MAE 0.19 m, n 124) ; ewam poids —, ×— (MAE 0.25 m, n 124) ; gwam poids —, ×— (MAE 0.36 m, n 124)
  - 01101 : meteofrance_wave poids 10.1, ×1.25 (MAE 0.28 m, n 158) ; ecmwf_wam025 poids 17.61, ×0.98 (MAE 0.13 m, n 158) ; ewam poids 13.14, ×1.09 (MAE 0.19 m, n 158) ; gwam poids 9.15, ×1.12 (MAE 0.16 m, n 158) ; ncep_gfswave025 poids 8.75, ×1.08 (MAE 0.17 m, n 158)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.08, Port Camargue × 1.01 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

3 prévisions archivées. Pas encore assez de recul pour l'échéance 24 h.
