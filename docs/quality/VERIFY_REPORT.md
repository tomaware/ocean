# Remise en question (③)

Généré le 2026-11-16 09:25 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 40 prévisions archivées sur 153 h ; 4121 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 2,9 · meteofrance_arome_france_hd 3,0 · meteofrance_arpege_europe 3,3 · icon_eu 3,4 · icon_d2 3,5 · ecmwf_ifs025 3,9 · gfs_seamless 4,4 |
| LFMP | ecmwf_ifs025 2,0 · gfs_seamless 2,0 · icon_eu 2,0 · meteofrance_arome_france_hd 2,2 · meteofrance_arome_france 2,2 · meteofrance_arpege_europe 2,5 |
| LFTH | ecmwf_ifs025 1,8 · icon_eu 2,7 · meteofrance_arome_france_hd 3,1 · meteofrance_arome_france 3,1 · meteofrance_arpege_europe 3,5 · gfs_seamless 3,5 |
| LFML | meteofrance_arome_france 2,3 · ecmwf_ifs025 2,4 · icon_eu 2,6 · meteofrance_arome_france_hd 2,6 · meteofrance_arpege_europe 3,4 · gfs_seamless 5,1 |
| LFMI | meteofrance_arome_france_hd 2,3 · meteofrance_arome_france 2,3 · ecmwf_ifs025 2,7 · meteofrance_arpege_europe 2,9 · icon_eu 3,0 · gfs_seamless 3,9 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.32 · ewam 0.32 · ecmwf_wam025 0.39 · gwam 0.52 · ncep_gfswave025 1.10 |
| 03404 | ewam 0.15 · gwam 0.16 · ncep_gfswave025 0.22 · meteofrance_wave 0.26 · ecmwf_wam025 0.28 |
| 01101 | meteofrance_wave 0.16 · ewam 0.16 · ecmwf_wam025 0.21 · gwam 0.22 · ncep_gfswave025 0.22 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 9.52, ×0.95 (MAE 0.29 m, n 164) ; ecmwf_wam025 poids 5.53, ×0.85 (MAE 0.38 m, n 164) ; ewam poids 8.06, ×0.88 (MAE 0.29 m, n 164) ; gwam poids 2, ×0.8 (MAE 0.51 m, n 164) ; copernicus poids 16.56, ×1.01 (MAE 0.21 m, n 104)
  - 03404 : meteofrance_wave poids 11.58, ×1.08 (MAE 0.25 m, n 164) ; ecmwf_wam025 poids 7.77, ×0.96 (MAE 0.3 m, n 164) ; ewam poids 14.53, ×0.99 (MAE 0.17 m, n 164) ; gwam poids 6.96, ×0.92 (MAE 0.21 m, n 164) ; ncep_gfswave025 poids 6.58, ×1.09 (MAE 0.23 m, n 164) ; copernicus poids 17.99, ×1.08 (MAE 0.19 m, n 104)
  - 01102 : 
  - 01101 : meteofrance_wave poids 19.33, ×1.12 (MAE 0.15 m, n 164) ; ecmwf_wam025 poids 9.28, ×0.86 (MAE 0.26 m, n 164) ; ewam poids 14.9, ×0.97 (MAE 0.16 m, n 164) ; gwam poids 4.64, ×0.85 (MAE 0.3 m, n 164) ; ncep_gfswave025 poids 5.98, ×1 (MAE 0.25 m, n 164) ; copernicus poids 24.22, ×0.97 (MAE 0.13 m, n 104)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.05, Port Camargue × 1.06 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

40 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arome_france 2,2 nd (n 12) · meteofrance_arome_france_hd 2,7 nd (n 12) · meteofrance_arpege_europe 2,8 nd (n 12) · icon_d2 3,0 nd (n 12) · gfs_seamless 3,4 nd (n 12) · icon_eu 3,5 nd (n 12) · ecmwf_ifs025 4,2 nd (n 12)
- LFMP : meteofrance_arome_france 1,8 nd (n 12) · meteofrance_arome_france_hd 1,9 nd (n 12) · icon_eu 2,4 nd (n 12) · ecmwf_ifs025 2,4 nd (n 12) · gfs_seamless 2,5 nd (n 12) · meteofrance_arpege_europe 2,6 nd (n 12)
- LFTH : ecmwf_ifs025 2,0 nd (n 12) · icon_eu 2,5 nd (n 12) · gfs_seamless 3,2 nd (n 12) · meteofrance_arpege_europe 3,4 nd (n 12) · meteofrance_arome_france_hd 4,3 nd (n 12) · meteofrance_arome_france 4,3 nd (n 12)
- LFML : icon_eu 2,3 nd (n 12) · ecmwf_ifs025 2,5 nd (n 12) · meteofrance_arome_france 2,5 nd (n 12) · meteofrance_arome_france_hd 2,8 nd (n 12) · meteofrance_arpege_europe 3,3 nd (n 12) · gfs_seamless 5,0 nd (n 12)
- LFMI : icon_eu 1,9 nd (n 6) · meteofrance_arpege_europe 2,4 nd (n 6) · meteofrance_arome_france_hd 2,8 nd (n 6) · meteofrance_arome_france 2,8 nd (n 6) · ecmwf_ifs025 3,5 nd (n 6) · gfs_seamless 4,5 nd (n 6)
