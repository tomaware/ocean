# Remise en question (③)

Généré le 2026-11-16 00:30 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 38 prévisions archivées sur 144 h ; 3785 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 2,7 · meteofrance_arome_france_hd 2,8 · meteofrance_arpege_europe 2,9 · icon_eu 3,0 · icon_d2 3,2 · ecmwf_ifs025 4,0 · gfs_seamless 4,0 |
| LFMP | meteofrance_arome_france_hd 1,7 · meteofrance_arome_france 1,8 · gfs_seamless 1,8 · ecmwf_ifs025 1,8 · icon_eu 1,9 · meteofrance_arpege_europe 2,4 |
| LFTH | ecmwf_ifs025 2,4 · icon_eu 2,8 · gfs_seamless 4,1 · meteofrance_arpege_europe 4,1 · meteofrance_arome_france_hd 4,7 · meteofrance_arome_france 4,7 |
| LFML | meteofrance_arome_france 2,2 · meteofrance_arome_france_hd 2,4 · ecmwf_ifs025 2,5 · icon_eu 2,7 · meteofrance_arpege_europe 3,1 · gfs_seamless 5,5 |
| LFMI | ecmwf_ifs025 2,4 · meteofrance_arome_france_hd 2,5 · meteofrance_arome_france 2,5 · meteofrance_arpege_europe 2,7 · icon_eu 3,0 · gfs_seamless 3,8 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.31 · meteofrance_wave 0.33 · ecmwf_wam025 0.40 · gwam 0.53 · ncep_gfswave025 1.14 |
| 03404 | ewam 0.18 · gwam 0.21 · ncep_gfswave025 0.24 · meteofrance_wave 0.28 · ecmwf_wam025 0.31 |
| 01101 | meteofrance_wave 0.16 · ewam 0.16 · ncep_gfswave025 0.22 · ecmwf_wam025 0.23 · gwam 0.26 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 8.62, ×0.96 (MAE 0.32 m, n 146) ; ecmwf_wam025 poids 5.2, ×0.86 (MAE 0.39 m, n 146) ; ewam poids 7.41, ×0.88 (MAE 0.31 m, n 146) ; gwam poids 1.86, ×0.8 (MAE 0.53 m, n 146) ; copernicus poids 10.05, ×0.96 (MAE 0.32 m, n 104)
  - 03404 : meteofrance_wave poids 10.55, ×1.08 (MAE 0.27 m, n 146) ; ecmwf_wam025 poids 7.35, ×0.98 (MAE 0.31 m, n 146) ; ewam poids 13.65, ×1 (MAE 0.18 m, n 146) ; gwam poids 6.76, ×0.92 (MAE 0.22 m, n 146) ; ncep_gfswave025 poids 6.1, ×1.1 (MAE 0.24 m, n 146) ; copernicus poids 17.5, ×1.06 (MAE 0.2 m, n 104)
  - 01102 : 
  - 01101 : meteofrance_wave poids 18.64, ×1.12 (MAE 0.16 m, n 146) ; ecmwf_wam025 poids 10.14, ×0.87 (MAE 0.24 m, n 146) ; ewam poids 14.7, ×0.98 (MAE 0.17 m, n 146) ; gwam poids 5.03, ×0.86 (MAE 0.28 m, n 146) ; ncep_gfswave025 poids 6.54, ×1.02 (MAE 0.23 m, n 146) ; copernicus poids 23.85, ×0.98 (MAE 0.14 m, n 104)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.02, Port Camargue × 1.03 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

38 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arome_france 2,7 nd (n 11) · meteofrance_arpege_europe 3,0 nd (n 11) · icon_d2 3,1 nd (n 11) · meteofrance_arome_france_hd 3,2 nd (n 11) · gfs_seamless 3,6 nd (n 11) · icon_eu 3,7 nd (n 11) · ecmwf_ifs025 4,3 nd (n 11)
- LFMP : meteofrance_arome_france_hd 2,0 nd (n 11) · meteofrance_arome_france 2,1 nd (n 11) · meteofrance_arpege_europe 2,2 nd (n 11) · icon_eu 2,3 nd (n 11) · gfs_seamless 2,3 nd (n 11) · ecmwf_ifs025 2,5 nd (n 11)
- LFTH : icon_eu 2,4 nd (n 11) · ecmwf_ifs025 2,9 nd (n 11) · gfs_seamless 3,5 nd (n 11) · meteofrance_arpege_europe 3,5 nd (n 11) · meteofrance_arome_france_hd 5,4 nd (n 11) · meteofrance_arome_france 5,4 nd (n 11)
- LFML : meteofrance_arpege_europe 2,7 nd (n 11) · icon_eu 2,9 nd (n 11) · meteofrance_arome_france 3,1 nd (n 11) · meteofrance_arome_france_hd 3,1 nd (n 11) · ecmwf_ifs025 3,2 nd (n 11) · gfs_seamless 5,9 nd (n 11)
- LFMI : icon_eu 2,4 nd (n 3) · meteofrance_arpege_europe 2,7 nd (n 3) · ecmwf_ifs025 3,0 nd (n 3) · meteofrance_arome_france_hd 3,3 nd (n 3) · meteofrance_arome_france 3,3 nd (n 3) · gfs_seamless 4,2 nd (n 3)
