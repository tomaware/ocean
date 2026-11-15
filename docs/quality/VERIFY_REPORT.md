# Remise en question (③)

Généré le 2026-11-15 06:33 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 32 prévisions archivées sur 126 h ; 3102 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arpege_europe 1,8 · icon_d2 2,3 · ecmwf_ifs025 2,6 · meteofrance_arome_france 2,6 · icon_eu 2,7 · meteofrance_arome_france_hd 2,7 · gfs_seamless 3,0 |
| LFMP | meteofrance_arome_france_hd 1,5 · meteofrance_arome_france 1,6 · gfs_seamless 1,7 · icon_eu 1,9 · ecmwf_ifs025 2,2 · meteofrance_arpege_europe 2,2 |
| LFTH | ecmwf_ifs025 2,2 · icon_eu 2,7 · meteofrance_arpege_europe 3,8 · gfs_seamless 4,1 · meteofrance_arome_france_hd 4,2 · meteofrance_arome_france 4,2 |
| LFML | meteofrance_arome_france 2,2 · meteofrance_arome_france_hd 2,3 · icon_eu 2,7 · ecmwf_ifs025 3,0 · meteofrance_arpege_europe 3,5 · gfs_seamless 5,5 |
| LFMI | meteofrance_arome_france_hd 2,3 · ecmwf_ifs025 2,4 · meteofrance_arome_france 2,4 · meteofrance_arpege_europe 2,7 · icon_eu 3,1 · gfs_seamless 4,3 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.26 · meteofrance_wave 0.30 · ecmwf_wam025 0.37 · gwam 0.51 · ncep_gfswave025 1.08 |
| 03404 | ewam 0.18 · meteofrance_wave 0.24 · gwam 0.24 · ncep_gfswave025 0.24 · ecmwf_wam025 0.30 |
| 01101 | meteofrance_wave 0.17 · ewam 0.20 · ecmwf_wam025 0.29 · ncep_gfswave025 0.29 · gwam 0.36 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 10.6, ×0.93 (MAE 0.27 m, n 153) ; ecmwf_wam025 poids 6.59, ×0.86 (MAE 0.33 m, n 153) ; ewam poids 9.17, ×0.86 (MAE 0.26 m, n 153) ; gwam poids 2.2, ×0.8 (MAE 0.48 m, n 153) ; copernicus poids 11.35, ×0.87 (MAE 0.29 m, n 102)
  - 03404 : meteofrance_wave poids 12.44, ×1.01 (MAE 0.24 m, n 138) ; ecmwf_wam025 poids 7.72, ×0.93 (MAE 0.3 m, n 138) ; ewam poids 13.47, ×0.94 (MAE 0.19 m, n 138) ; gwam poids 6.12, ×0.87 (MAE 0.24 m, n 138) ; ncep_gfswave025 poids 6.29, ×1.03 (MAE 0.24 m, n 138) ; copernicus poids 22.8, ×0.96 (MAE 0.15 m, n 102)
  - 01102 : 
  - 01101 : meteofrance_wave poids 16.46, ×1.13 (MAE 0.18 m, n 155) ; ecmwf_wam025 poids 8.42, ×0.83 (MAE 0.28 m, n 155) ; ewam poids 10.72, ×0.91 (MAE 0.23 m, n 155) ; gwam poids 3.68, ×0.8 (MAE 0.35 m, n 155) ; ncep_gfswave025 poids 4.7, ×0.93 (MAE 0.3 m, n 155) ; copernicus poids 26.45, ×0.97 (MAE 0.11 m, n 102)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.02, Port Camargue × 1.03 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

32 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 1,8 nd (n 11) · icon_d2 2,3 nd (n 11) · meteofrance_arome_france 2,4 nd (n 11) · ecmwf_ifs025 2,5 nd (n 11) · meteofrance_arome_france_hd 2,5 nd (n 11) · gfs_seamless 2,5 nd (n 11) · icon_eu 3,0 nd (n 11)
- LFMP : gfs_seamless 1,4 nd (n 11) · meteofrance_arome_france_hd 1,8 nd (n 11) · meteofrance_arome_france 1,8 nd (n 11) · meteofrance_arpege_europe 2,0 nd (n 11) · ecmwf_ifs025 2,0 nd (n 11) · icon_eu 2,1 nd (n 11)
- LFTH : icon_eu 2,4 nd (n 11) · ecmwf_ifs025 2,7 nd (n 11) · meteofrance_arpege_europe 3,4 nd (n 11) · gfs_seamless 4,9 nd (n 11) · meteofrance_arome_france_hd 4,9 nd (n 11) · meteofrance_arome_france 4,9 nd (n 11)
- LFML : icon_eu 2,3 nd (n 11) · meteofrance_arome_france_hd 3,2 nd (n 11) · meteofrance_arome_france 3,3 nd (n 11) · ecmwf_ifs025 3,4 nd (n 11) · meteofrance_arpege_europe 4,3 nd (n 11) · gfs_seamless 6,1 nd (n 11)
- LFMI : 
