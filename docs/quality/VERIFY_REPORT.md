# Remise en question (③)

Généré le 2026-11-10 10:35 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 19 couples station × modèle (vent), 20 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 4 prévisions archivées sur 9 h ; 136 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arpege_europe 1,7 · meteofrance_arome_france 1,8 · gfs_seamless 2,2 · meteofrance_arome_france_hd 2,3 · icon_eu 2,4 · icon_d2 2,7 · ecmwf_ifs025 4,3 |
| LFMP | icon_eu 1,5 · gfs_seamless 1,6 · meteofrance_arome_france 1,8 · ecmwf_ifs025 1,8 · meteofrance_arome_france_hd 1,9 · meteofrance_arpege_europe 2,0 |
| LFTH | icon_eu 2,0 · ecmwf_ifs025 2,6 · meteofrance_arome_france_hd 2,7 · meteofrance_arome_france 2,7 · meteofrance_arpege_europe 2,7 · gfs_seamless 2,9 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | gwam 0.25 · ewam 0.26 · ecmwf_wam025 0.30 · meteofrance_wave 0.36 · ncep_gfswave025 1.30 |
| 03404 | ecmwf_wam025 0.16 · gwam 0.16 · ewam 0.17 · ncep_gfswave025 0.19 · meteofrance_wave 0.26 |
| 01102 | ecmwf_wam025 0.22 · ewam 0.30 · meteofrance_wave 0.40 · gwam 0.44 · ncep_gfswave025 0.93 |
| 01101 | ecmwf_wam025 0.15 · gwam 0.18 · ncep_gfswave025 0.18 · ewam 0.21 · meteofrance_wave 0.32 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 7.12, ×1.24 (MAE 0.36 m, n 141) ; ecmwf_wam025 poids 7.37, ×1.18 (MAE 0.31 m, n 141) ; ewam poids 10.03, ×1.09 (MAE 0.24 m, n 141) ; gwam poids 5.96, ×1.07 (MAE 0.25 m, n 141) ; copernicus poids 14.51, ×1.08 (MAE 0.24 m, n 100)
  - 03404 : meteofrance_wave poids 12.05, ×1.19 (MAE 0.24 m, n 151) ; ecmwf_wam025 poids 15.06, ×1.09 (MAE 0.16 m, n 151) ; ewam poids 15.8, ×1.03 (MAE 0.15 m, n 151) ; gwam poids 9.64, ×1.06 (MAE 0.15 m, n 151) ; ncep_gfswave025 poids 8.41, ×1.1 (MAE 0.18 m, n 151) ; copernicus poids 25.24, ×1.02 (MAE 0.12 m, n 100)
  - 01102 : meteofrance_wave poids —, ×— (MAE 0.33 m, n 124) ; ecmwf_wam025 poids —, ×— (MAE 0.19 m, n 124) ; ewam poids —, ×— (MAE 0.25 m, n 124) ; gwam poids —, ×— (MAE 0.36 m, n 124) ; copernicus poids —, ×— (MAE 0.27 m, n 59)
  - 01101 : meteofrance_wave poids 9.89, ×1.25 (MAE 0.29 m, n 166) ; ecmwf_wam025 poids 17.38, ×0.98 (MAE 0.13 m, n 166) ; ewam poids 13.41, ×1.08 (MAE 0.19 m, n 166) ; gwam poids 9.22, ×1.11 (MAE 0.16 m, n 166) ; ncep_gfswave025 poids 8.74, ×1.07 (MAE 0.17 m, n 166) ; copernicus poids 18.15, ×0.98 (MAE 0.19 m, n 100)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.08, Port Camargue × 1.01 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

4 prévisions archivées. Pas encore assez de recul pour l'échéance 24 h.
