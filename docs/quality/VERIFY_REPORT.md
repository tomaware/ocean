# Remise en question (③)

Généré le 2026-11-10 20:26 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 20 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 7 prévisions archivées sur 18 h ; 510 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 1,8 · meteofrance_arpege_europe 1,9 · gfs_seamless 2,4 · icon_eu 2,4 · meteofrance_arome_france_hd 2,5 · icon_d2 3,0 · ecmwf_ifs025 5,0 |
| LFMP | gfs_seamless 1,4 · icon_eu 1,5 · ecmwf_ifs025 1,5 · meteofrance_arpege_europe 1,6 · meteofrance_arome_france 1,8 · meteofrance_arome_france_hd 1,9 |
| LFTH | icon_eu 2,2 · ecmwf_ifs025 2,5 · meteofrance_arpege_europe 3,2 · meteofrance_arome_france_hd 3,2 · meteofrance_arome_france 3,2 · gfs_seamless 3,4 |
| LFML | meteofrance_arome_france_hd 2,2 · meteofrance_arome_france 2,2 · ecmwf_ifs025 2,3 · icon_eu 3,1 · meteofrance_arpege_europe 3,1 · gfs_seamless 4,0 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.25 · gwam 0.25 · ecmwf_wam025 0.32 · meteofrance_wave 0.35 · ncep_gfswave025 1.40 |
| 03404 | ewam 0.16 · gwam 0.16 · ecmwf_wam025 0.17 · ncep_gfswave025 0.20 · meteofrance_wave 0.23 |
| 01102 | ecmwf_wam025 0.25 · ewam 0.36 · meteofrance_wave 0.45 · gwam 0.51 · ncep_gfswave025 1.03 |
| 01101 | ecmwf_wam025 0.15 · gwam 0.18 · ncep_gfswave025 0.19 · ewam 0.21 · meteofrance_wave 0.31 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 8.41, ×1.19 (MAE 0.32 m, n 161) ; ecmwf_wam025 poids 7.97, ×1.15 (MAE 0.29 m, n 161) ; ewam poids 11.17, ×1.08 (MAE 0.22 m, n 161) ; gwam poids 6.57, ×1.06 (MAE 0.23 m, n 161) ; copernicus poids 15.19, ×1.05 (MAE 0.23 m, n 102)
  - 03404 : meteofrance_wave poids 14.97, ×1.14 (MAE 0.2 m, n 171) ; ecmwf_wam025 poids 15.89, ×1.08 (MAE 0.15 m, n 171) ; ewam poids 16.77, ×1.03 (MAE 0.14 m, n 171) ; gwam poids 10.21, ×1.05 (MAE 0.14 m, n 171) ; ncep_gfswave025 poids 8.76, ×1.08 (MAE 0.17 m, n 171) ; copernicus poids 27.36, ×1 (MAE 0.11 m, n 102)
  - 01102 : meteofrance_wave poids —, ×— (MAE 0.33 m, n 124) ; ecmwf_wam025 poids —, ×— (MAE 0.19 m, n 124) ; ewam poids —, ×— (MAE 0.25 m, n 124) ; gwam poids —, ×— (MAE 0.36 m, n 124) ; copernicus poids —, ×— (MAE 0.2 m, n 41)
  - 01101 : meteofrance_wave poids 11.36, ×1.25 (MAE 0.26 m, n 186) ; ecmwf_wam025 poids 17.99, ×0.98 (MAE 0.12 m, n 186) ; ewam poids 14.29, ×1.08 (MAE 0.17 m, n 186) ; gwam poids 9.7, ×1.1 (MAE 0.15 m, n 186) ; ncep_gfswave025 poids 8.88, ×1.04 (MAE 0.17 m, n 186) ; copernicus poids 23.43, ×0.97 (MAE 0.14 m, n 102)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.15, Port Camargue × 1.11 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

7 prévisions archivées. Pas encore assez de recul pour l'échéance 24 h.
