# Remise en question (③)

Généré le 2026-11-10 03:27 UTC par `pipeline/verify/run.ts`.

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
| LFMT | meteofrance_arome_france 1,6 · meteofrance_arpege_europe 1,7 · meteofrance_arome_france_hd 2,1 · icon_eu 2,3 · gfs_seamless 2,4 · icon_d2 2,6 · ecmwf_ifs025 4,3 |
| LFMP | icon_eu 1,5 · gfs_seamless 1,6 · ecmwf_ifs025 1,7 · meteofrance_arome_france 1,7 · meteofrance_arome_france_hd 1,8 · meteofrance_arpege_europe 2,0 |
| LFTH | icon_eu 2,1 · meteofrance_arome_france_hd 2,5 · meteofrance_arome_france 2,5 · gfs_seamless 2,6 · ecmwf_ifs025 2,6 · meteofrance_arpege_europe 2,6 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | gwam 0.22 · ewam 0.24 · ecmwf_wam025 0.29 · meteofrance_wave 0.34 · ncep_gfswave025 1.16 |
| 03404 | ewam 0.14 · gwam 0.15 · ecmwf_wam025 0.16 · ncep_gfswave025 0.19 · meteofrance_wave 0.23 |
| 01102 | ecmwf_wam025 0.20 · ewam 0.27 · meteofrance_wave 0.35 · gwam 0.39 · ncep_gfswave025 0.85 |
| 01101 | ecmwf_wam025 0.14 · gwam 0.17 · ncep_gfswave025 0.17 · ewam 0.21 · meteofrance_wave 0.29 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 6.84, ×1.25 (MAE 0.37 m, n 127) ; ecmwf_wam025 poids 7.16, ×1.2 (MAE 0.32 m, n 127) ; ewam poids 9.72, ×1.11 (MAE 0.25 m, n 127) ; gwam poids 6.31, ×1.11 (MAE 0.23 m, n 127)
  - 03404 : meteofrance_wave poids 12.6, ×1.18 (MAE 0.23 m, n 137) ; ecmwf_wam025 poids 15.25, ×1.09 (MAE 0.16 m, n 137) ; ewam poids 16.93, ×1.06 (MAE 0.14 m, n 137) ; gwam poids 9.58, ×1.08 (MAE 0.15 m, n 137) ; ncep_gfswave025 poids 7.95, ×1.13 (MAE 0.19 m, n 137)
  - 01102 : meteofrance_wave poids —, ×— (MAE 0.33 m, n 124) ; ecmwf_wam025 poids —, ×— (MAE 0.19 m, n 124) ; ewam poids —, ×— (MAE 0.25 m, n 124) ; gwam poids —, ×— (MAE 0.36 m, n 124)
  - 01101 : meteofrance_wave poids 10.4, ×1.25 (MAE 0.27 m, n 152) ; ecmwf_wam025 poids 17.38, ×0.98 (MAE 0.13 m, n 152) ; ewam poids 12.62, ×1.1 (MAE 0.2 m, n 152) ; gwam poids 8.99, ×1.14 (MAE 0.16 m, n 152) ; ncep_gfswave025 poids 8.71, ×1.09 (MAE 0.17 m, n 152)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.07, Port Camargue × 1.02 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

2 prévisions archivées. Pas encore assez de recul pour l'échéance 24 h.
