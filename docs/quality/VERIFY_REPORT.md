# Remise en question (③)

Généré le 2026-11-10 04:31 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 19 couples station × modèle (vent), 20 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 2 prévisions archivées sur 3 h ; 0 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 1,6 · meteofrance_arpege_europe 1,8 · meteofrance_arome_france_hd 2,2 · icon_eu 2,3 · gfs_seamless 2,4 · icon_d2 2,6 · ecmwf_ifs025 4,3 |
| LFMP | icon_eu 1,4 · gfs_seamless 1,6 · ecmwf_ifs025 1,7 · meteofrance_arome_france 1,7 · meteofrance_arome_france_hd 1,8 · meteofrance_arpege_europe 2,0 |
| LFTH | icon_eu 2,1 · meteofrance_arome_france_hd 2,6 · meteofrance_arome_france 2,6 · ecmwf_ifs025 2,7 · meteofrance_arpege_europe 2,7 · gfs_seamless 2,7 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | gwam 0.23 · ewam 0.26 · ecmwf_wam025 0.30 · meteofrance_wave 0.35 · ncep_gfswave025 1.19 |
| 03404 | gwam 0.15 · ecmwf_wam025 0.16 · ewam 0.16 · ncep_gfswave025 0.19 · meteofrance_wave 0.24 |
| 01102 | ecmwf_wam025 0.21 · ewam 0.28 · meteofrance_wave 0.36 · gwam 0.40 · ncep_gfswave025 0.86 |
| 01101 | ecmwf_wam025 0.14 · gwam 0.17 · ncep_gfswave025 0.17 · ewam 0.21 · meteofrance_wave 0.30 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 6.81, ×1.25 (MAE 0.37 m, n 129) ; ecmwf_wam025 poids 7.21, ×1.2 (MAE 0.31 m, n 129) ; ewam poids 9.37, ×1.1 (MAE 0.26 m, n 129) ; gwam poids 5.91, ×1.09 (MAE 0.25 m, n 129)
  - 03404 : meteofrance_wave poids 12.33, ×1.18 (MAE 0.24 m, n 139) ; ecmwf_wam025 poids 15.06, ×1.09 (MAE 0.16 m, n 139) ; ewam poids 15.88, ×1.05 (MAE 0.15 m, n 139) ; gwam poids 9.42, ×1.07 (MAE 0.15 m, n 139) ; ncep_gfswave025 poids 7.95, ×1.13 (MAE 0.19 m, n 139)
  - 01102 : meteofrance_wave poids —, ×— (MAE 0.33 m, n 124) ; ecmwf_wam025 poids —, ×— (MAE 0.19 m, n 124) ; ewam poids —, ×— (MAE 0.25 m, n 124) ; gwam poids —, ×— (MAE 0.36 m, n 124)
  - 01101 : meteofrance_wave poids 10.3, ×1.25 (MAE 0.28 m, n 154) ; ecmwf_wam025 poids 17.51, ×0.98 (MAE 0.13 m, n 154) ; ewam poids 12.99, ×1.09 (MAE 0.19 m, n 154) ; gwam poids 9.08, ×1.13 (MAE 0.16 m, n 154) ; ncep_gfswave025 poids 8.76, ×1.09 (MAE 0.17 m, n 154)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.08, Port Camargue × 1.03 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

2 prévisions archivées. Pas encore assez de recul pour l'échéance 24 h.
