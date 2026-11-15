# Remise en question (③)

Généré le 2026-11-15 01:49 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 30 prévisions archivées sur 120 h ; 2868 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arpege_europe 2,0 · meteofrance_arome_france 2,4 · icon_d2 2,5 · meteofrance_arome_france_hd 2,7 · ecmwf_ifs025 2,8 · gfs_seamless 2,9 · icon_eu 3,1 |
| LFMP | meteofrance_arome_france_hd 1,6 · meteofrance_arome_france 1,7 · gfs_seamless 1,8 · icon_eu 2,0 · ecmwf_ifs025 2,3 · meteofrance_arpege_europe 2,4 |
| LFTH | ecmwf_ifs025 2,2 · icon_eu 2,4 · meteofrance_arpege_europe 3,3 · gfs_seamless 3,6 · meteofrance_arome_france_hd 3,7 · meteofrance_arome_france 3,7 |
| LFML | meteofrance_arome_france_hd 2,2 · meteofrance_arome_france 2,3 · icon_eu 2,4 · ecmwf_ifs025 3,1 · meteofrance_arpege_europe 3,6 · gfs_seamless 5,5 |
| LFMI | meteofrance_arome_france_hd 2,2 · meteofrance_arome_france 2,3 · meteofrance_arpege_europe 2,6 · ecmwf_ifs025 2,9 · icon_eu 3,1 · gfs_seamless 3,9 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.20 · meteofrance_wave 0.28 · ecmwf_wam025 0.33 · gwam 0.45 · ncep_gfswave025 1.02 |
| 03404 | ewam 0.18 · meteofrance_wave 0.21 · ncep_gfswave025 0.22 · gwam 0.25 · ecmwf_wam025 0.29 |
| 01101 | meteofrance_wave 0.17 · ewam 0.23 · ecmwf_wam025 0.30 · ncep_gfswave025 0.30 · gwam 0.36 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 10.63, ×0.93 (MAE 0.27 m, n 145) ; ecmwf_wam025 poids 7.1, ×0.87 (MAE 0.32 m, n 145) ; ewam poids 11.91, ×0.88 (MAE 0.21 m, n 145) ; gwam poids 2.5, ×0.8 (MAE 0.45 m, n 145) ; copernicus poids 11.74, ×0.88 (MAE 0.28 m, n 106)
  - 03404 : meteofrance_wave poids 14.73, ×0.97 (MAE 0.2 m, n 130) ; ecmwf_wam025 poids 8.17, ×0.9 (MAE 0.29 m, n 130) ; ewam poids 13.23, ×0.94 (MAE 0.19 m, n 130) ; gwam poids 5.9, ×0.85 (MAE 0.25 m, n 130) ; ncep_gfswave025 poids 6.9, ×1.01 (MAE 0.22 m, n 130) ; copernicus poids 21.56, ×0.92 (MAE 0.16 m, n 106)
  - 01102 : 
  - 01101 : meteofrance_wave poids 18.03, ×1.1 (MAE 0.16 m, n 147) ; ecmwf_wam025 poids 8.03, ×0.82 (MAE 0.29 m, n 147) ; ewam poids 10.78, ×0.91 (MAE 0.23 m, n 147) ; gwam poids 3.64, ×0.8 (MAE 0.35 m, n 147) ; ncep_gfswave025 poids 4.53, ×0.92 (MAE 0.3 m, n 147) ; copernicus poids 24.04, ×0.91 (MAE 0.14 m, n 106)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.02, Port Camargue × 1.05 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

30 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 1,7 nd (n 10) · ecmwf_ifs025 2,3 nd (n 10) · gfs_seamless 2,3 nd (n 10) · icon_d2 2,3 nd (n 10) · meteofrance_arome_france 2,5 nd (n 10) · meteofrance_arome_france_hd 2,6 nd (n 10) · icon_eu 3,3 nd (n 10)
- LFMP : gfs_seamless 1,1 nd (n 10) · meteofrance_arpege_europe 1,7 nd (n 10) · meteofrance_arome_france_hd 1,8 nd (n 10) · meteofrance_arome_france 1,8 nd (n 10) · icon_eu 1,9 nd (n 10) · ecmwf_ifs025 1,9 nd (n 10)
- LFTH : icon_eu 2,2 nd (n 10) · ecmwf_ifs025 2,9 nd (n 10) · meteofrance_arpege_europe 3,3 nd (n 10) · meteofrance_arome_france_hd 4,4 nd (n 10) · meteofrance_arome_france 4,4 nd (n 10) · gfs_seamless 4,8 nd (n 10)
- LFML : icon_eu 2,5 nd (n 10) · meteofrance_arome_france_hd 3,2 nd (n 10) · meteofrance_arome_france 3,3 nd (n 10) · ecmwf_ifs025 3,3 nd (n 10) · meteofrance_arpege_europe 4,7 nd (n 10) · gfs_seamless 6,2 nd (n 10)
- LFMI : 
