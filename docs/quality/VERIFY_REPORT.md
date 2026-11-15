# Remise en question (③)

Généré le 2026-11-15 14:26 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 34 prévisions archivées sur 132 h ; 3221 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arpege_europe 2,0 · icon_d2 2,2 · icon_eu 2,3 · meteofrance_arome_france_hd 2,7 · meteofrance_arome_france 2,7 · ecmwf_ifs025 2,8 · gfs_seamless 3,1 |
| LFMP | meteofrance_arome_france 1,6 · meteofrance_arome_france_hd 1,7 · gfs_seamless 1,7 · icon_eu 1,7 · ecmwf_ifs025 2,1 · meteofrance_arpege_europe 2,2 |
| LFTH | ecmwf_ifs025 2,3 · icon_eu 2,8 · meteofrance_arpege_europe 3,9 · gfs_seamless 4,0 · meteofrance_arome_france_hd 4,6 · meteofrance_arome_france 4,6 |
| LFML | meteofrance_arome_france 2,2 · meteofrance_arome_france_hd 2,2 · ecmwf_ifs025 2,4 · icon_eu 2,6 · meteofrance_arpege_europe 2,8 · gfs_seamless 5,5 |
| LFMI | meteofrance_arome_france_hd 2,1 · meteofrance_arome_france 2,3 · meteofrance_arpege_europe 2,3 · ecmwf_ifs025 2,8 · icon_eu 3,2 · gfs_seamless 3,6 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.29 · meteofrance_wave 0.33 · ecmwf_wam025 0.41 · gwam 0.57 · ncep_gfswave025 1.10 |
| 03404 | ewam 0.18 · gwam 0.24 · ncep_gfswave025 0.24 · meteofrance_wave 0.26 · ecmwf_wam025 0.33 |
| 01101 | meteofrance_wave 0.16 · ewam 0.20 · ncep_gfswave025 0.27 · ecmwf_wam025 0.28 · gwam 0.36 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 9.85, ×0.94 (MAE 0.29 m, n 171) ; ecmwf_wam025 poids 6.14, ×0.86 (MAE 0.35 m, n 171) ; ewam poids 8.55, ×0.85 (MAE 0.28 m, n 171) ; gwam poids 2.03, ×0.8 (MAE 0.51 m, n 171) ; copernicus poids 9.57, ×0.86 (MAE 0.33 m, n 102)
  - 03404 : meteofrance_wave poids 11.38, ×1.04 (MAE 0.26 m, n 156) ; ecmwf_wam025 poids 7.5, ×0.95 (MAE 0.31 m, n 156) ; ewam poids 13.5, ×0.94 (MAE 0.18 m, n 156) ; gwam poids 6.33, ×0.88 (MAE 0.23 m, n 156) ; ncep_gfswave025 poids 6.56, ×1.04 (MAE 0.23 m, n 156) ; copernicus poids 24.65, ×0.98 (MAE 0.13 m, n 102)
  - 01102 : 
  - 01101 : meteofrance_wave poids 17.13, ×1.12 (MAE 0.17 m, n 173) ; ecmwf_wam025 poids 8.95, ×0.84 (MAE 0.27 m, n 173) ; ewam poids 10.38, ×0.9 (MAE 0.24 m, n 173) ; gwam poids 3.7, ×0.8 (MAE 0.35 m, n 173) ; ncep_gfswave025 poids 5.07, ×0.93 (MAE 0.28 m, n 173) ; copernicus poids 24.87, ×0.96 (MAE 0.13 m, n 102)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.03, Port Camargue × 1.05 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

34 prévisions archivées. Classement à 24 h :

- LFMT : icon_d2 1,4 nd (n 11) · meteofrance_arpege_europe 1,5 nd (n 11) · meteofrance_arome_france 2,0 nd (n 11) · meteofrance_arome_france_hd 2,1 nd (n 11) · icon_eu 2,1 nd (n 11) · gfs_seamless 2,1 nd (n 11) · ecmwf_ifs025 2,3 nd (n 11)
- LFMP : gfs_seamless 1,4 nd (n 11) · meteofrance_arpege_europe 1,4 nd (n 11) · meteofrance_arome_france 1,8 nd (n 11) · ecmwf_ifs025 1,8 nd (n 11) · icon_eu 1,8 nd (n 11) · meteofrance_arome_france_hd 1,8 nd (n 11)
- LFTH : icon_eu 2,4 nd (n 11) · ecmwf_ifs025 3,0 nd (n 11) · meteofrance_arpege_europe 3,3 nd (n 11) · gfs_seamless 5,1 nd (n 11) · meteofrance_arome_france_hd 5,1 nd (n 11) · meteofrance_arome_france 5,1 nd (n 11)
- LFML : icon_eu 2,1 nd (n 11) · meteofrance_arome_france_hd 2,7 nd (n 11) · meteofrance_arome_france 2,8 nd (n 11) · meteofrance_arpege_europe 2,9 nd (n 11) · ecmwf_ifs025 3,1 nd (n 11) · gfs_seamless 5,7 nd (n 11)
- LFMI : 
