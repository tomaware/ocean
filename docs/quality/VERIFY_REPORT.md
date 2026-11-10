# Remise en question (③)

Généré le 2026-11-10 19:33 UTC par `pipeline/verify/run.ts`.

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
| LFMT | meteofrance_arome_france 1,8 · meteofrance_arpege_europe 1,9 · gfs_seamless 2,4 · icon_eu 2,4 · meteofrance_arome_france_hd 2,5 · icon_d2 3,0 · ecmwf_ifs025 5,1 |
| LFMP | icon_eu 1,5 · gfs_seamless 1,5 · ecmwf_ifs025 1,5 · meteofrance_arpege_europe 1,6 · meteofrance_arome_france 1,8 · meteofrance_arome_france_hd 1,9 |
| LFTH | icon_eu 2,2 · ecmwf_ifs025 2,5 · meteofrance_arpege_europe 3,3 · meteofrance_arome_france_hd 3,3 · meteofrance_arome_france 3,3 · gfs_seamless 3,4 |
| LFML | meteofrance_arome_france_hd 2,2 · ecmwf_ifs025 2,2 · meteofrance_arome_france 2,2 · icon_eu 3,1 · meteofrance_arpege_europe 3,2 · gfs_seamless 4,0 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.25 · gwam 0.25 · ecmwf_wam025 0.32 · meteofrance_wave 0.36 · ncep_gfswave025 1.40 |
| 03404 | ewam 0.16 · gwam 0.16 · ecmwf_wam025 0.17 · ncep_gfswave025 0.20 · meteofrance_wave 0.23 |
| 01102 | ecmwf_wam025 0.25 · ewam 0.35 · meteofrance_wave 0.45 · gwam 0.51 · ncep_gfswave025 1.02 |
| 01101 | ecmwf_wam025 0.15 · gwam 0.18 · ncep_gfswave025 0.19 · ewam 0.21 · meteofrance_wave 0.31 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 8.31, ×1.19 (MAE 0.32 m, n 159) ; ecmwf_wam025 poids 7.81, ×1.15 (MAE 0.3 m, n 159) ; ewam poids 11.08, ×1.08 (MAE 0.22 m, n 159) ; gwam poids 6.5, ×1.06 (MAE 0.23 m, n 159) ; copernicus poids 14.97, ×1.05 (MAE 0.23 m, n 100)
  - 03404 : meteofrance_wave poids 14.83, ×1.14 (MAE 0.2 m, n 169) ; ecmwf_wam025 poids 15.73, ×1.08 (MAE 0.15 m, n 169) ; ewam poids 16.69, ×1.03 (MAE 0.14 m, n 169) ; gwam poids 10.16, ×1.05 (MAE 0.14 m, n 169) ; ncep_gfswave025 poids 8.69, ×1.08 (MAE 0.17 m, n 169) ; copernicus poids 27.34, ×1 (MAE 0.11 m, n 100)
  - 01102 : meteofrance_wave poids —, ×— (MAE 0.33 m, n 124) ; ecmwf_wam025 poids —, ×— (MAE 0.19 m, n 124) ; ewam poids —, ×— (MAE 0.25 m, n 124) ; gwam poids —, ×— (MAE 0.36 m, n 124) ; copernicus poids —, ×— (MAE 0.2 m, n 41)
  - 01101 : meteofrance_wave poids 11.25, ×1.25 (MAE 0.26 m, n 184) ; ecmwf_wam025 poids 17.99, ×0.98 (MAE 0.12 m, n 184) ; ewam poids 14.16, ×1.08 (MAE 0.17 m, n 184) ; gwam poids 9.66, ×1.1 (MAE 0.15 m, n 184) ; ncep_gfswave025 poids 8.87, ×1.05 (MAE 0.17 m, n 184) ; copernicus poids 23.27, ×0.97 (MAE 0.14 m, n 100)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.94, Port Camargue × 0.92 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

7 prévisions archivées. Pas encore assez de recul pour l'échéance 24 h.
