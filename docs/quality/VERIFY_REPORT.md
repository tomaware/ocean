# Remise en question (③)

Généré le 2026-11-10 00:16 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 19 couples station × modèle (vent), 20 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 1 prévisions archivées sur 0 h ; 0 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 1,6 · meteofrance_arpege_europe 1,7 · meteofrance_arome_france_hd 2,1 · icon_eu 2,2 · gfs_seamless 2,4 · icon_d2 2,5 · ecmwf_ifs025 4,0 |
| LFMP | icon_eu 1,5 · gfs_seamless 1,6 · meteofrance_arome_france 1,8 · ecmwf_ifs025 1,8 · meteofrance_arome_france_hd 1,9 · meteofrance_arpege_europe 2,0 |
| LFTH | icon_eu 2,0 · meteofrance_arome_france_hd 2,3 · meteofrance_arome_france 2,3 · meteofrance_arpege_europe 2,4 · gfs_seamless 2,4 · ecmwf_ifs025 2,5 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | gwam 0.21 · ewam 0.23 · ecmwf_wam025 0.29 · meteofrance_wave 0.33 · ncep_gfswave025 1.08 |
| 03404 | ewam 0.14 · ecmwf_wam025 0.15 · gwam 0.15 · ncep_gfswave025 0.19 · meteofrance_wave 0.22 |
| 01102 | ecmwf_wam025 0.19 · ewam 0.26 · meteofrance_wave 0.34 · gwam 0.38 · ncep_gfswave025 0.83 |
| 01101 | ecmwf_wam025 0.13 · gwam 0.17 · ncep_gfswave025 0.18 · ewam 0.21 · meteofrance_wave 0.27 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 6.86, ×1.25 (MAE 0.37 m, n 121) ; ecmwf_wam025 poids 7.15, ×1.21 (MAE 0.32 m, n 121) ; ewam poids 10.04, ×1.14 (MAE 0.24 m, n 121) ; gwam poids 6.36, ×1.13 (MAE 0.23 m, n 121)
  - 03404 : meteofrance_wave poids 13.24, ×1.18 (MAE 0.23 m, n 131) ; ecmwf_wam025 poids 15.56, ×1.09 (MAE 0.16 m, n 131) ; ewam poids 16.7, ×1.07 (MAE 0.14 m, n 131) ; gwam poids 9.44, ×1.09 (MAE 0.15 m, n 131) ; ncep_gfswave025 poids 7.77, ×1.14 (MAE 0.19 m, n 131)
  - 01102 : meteofrance_wave poids —, ×— (MAE 0.33 m, n 124) ; ecmwf_wam025 poids —, ×— (MAE 0.19 m, n 124) ; ewam poids —, ×— (MAE 0.25 m, n 124) ; gwam poids —, ×— (MAE 0.36 m, n 124)
  - 01101 : meteofrance_wave poids 10.91, ×1.25 (MAE 0.26 m, n 146) ; ecmwf_wam025 poids 17.61, ×0.98 (MAE 0.13 m, n 146) ; ewam poids 12.52, ×1.1 (MAE 0.2 m, n 146) ; gwam poids 8.82, ×1.14 (MAE 0.17 m, n 146) ; ncep_gfswave025 poids 8.5, ×1.1 (MAE 0.17 m, n 146)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.17, Port Camargue × 1.07 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

1 prévisions archivées. Pas encore assez de recul pour l'échéance 24 h.
