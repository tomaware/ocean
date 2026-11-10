# Remise en question (③)

Généré le 2026-11-10 09:24 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 19 couples station × modèle (vent), 20 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 4 prévisions archivées sur 9 h ; 121 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 1,8 · meteofrance_arpege_europe 1,8 · meteofrance_arome_france_hd 2,3 · gfs_seamless 2,3 · icon_eu 2,4 · icon_d2 2,7 · ecmwf_ifs025 4,3 |
| LFMP | icon_eu 1,4 · gfs_seamless 1,5 · ecmwf_ifs025 1,7 · meteofrance_arome_france 1,7 · meteofrance_arome_france_hd 1,8 · meteofrance_arpege_europe 1,9 |
| LFTH | icon_eu 2,0 · ecmwf_ifs025 2,6 · meteofrance_arome_france_hd 2,6 · meteofrance_arome_france 2,6 · meteofrance_arpege_europe 2,6 · gfs_seamless 2,8 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | gwam 0.24 · ewam 0.26 · ecmwf_wam025 0.30 · meteofrance_wave 0.35 · ncep_gfswave025 1.28 |
| 03404 | ecmwf_wam025 0.16 · gwam 0.16 · ewam 0.17 · ncep_gfswave025 0.19 · meteofrance_wave 0.26 |
| 01102 | ecmwf_wam025 0.22 · ewam 0.30 · meteofrance_wave 0.39 · gwam 0.43 · ncep_gfswave025 0.91 |
| 01101 | ecmwf_wam025 0.15 · gwam 0.18 · ncep_gfswave025 0.18 · ewam 0.21 · meteofrance_wave 0.31 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 7.01, ×1.25 (MAE 0.36 m, n 138) ; ecmwf_wam025 poids 7.3, ×1.19 (MAE 0.31 m, n 138) ; ewam poids 9.81, ×1.09 (MAE 0.25 m, n 138) ; gwam poids 5.95, ×1.08 (MAE 0.25 m, n 138)
  - 03404 : meteofrance_wave poids 11.84, ×1.19 (MAE 0.25 m, n 148) ; ecmwf_wam025 poids 14.87, ×1.09 (MAE 0.17 m, n 148) ; ewam poids 15.77, ×1.03 (MAE 0.15 m, n 148) ; gwam poids 9.61, ×1.06 (MAE 0.15 m, n 148) ; ncep_gfswave025 poids 8.34, ×1.11 (MAE 0.18 m, n 148)
  - 01102 : meteofrance_wave poids —, ×— (MAE 0.33 m, n 124) ; ecmwf_wam025 poids —, ×— (MAE 0.19 m, n 124) ; ewam poids —, ×— (MAE 0.25 m, n 124) ; gwam poids —, ×— (MAE 0.36 m, n 124)
  - 01101 : meteofrance_wave poids 10.06, ×1.25 (MAE 0.28 m, n 163) ; ecmwf_wam025 poids 17.37, ×0.97 (MAE 0.13 m, n 163) ; ewam poids 13.24, ×1.08 (MAE 0.19 m, n 163) ; gwam poids 9.13, ×1.11 (MAE 0.16 m, n 163) ; ncep_gfswave025 poids 8.68, ×1.07 (MAE 0.17 m, n 163)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.07, Port Camargue × 1.01 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

4 prévisions archivées. Pas encore assez de recul pour l'échéance 24 h.
