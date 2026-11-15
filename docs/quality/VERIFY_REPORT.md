# Remise en question (③)

Généré le 2026-11-15 12:18 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 34 prévisions archivées sur 132 h ; 3337 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arpege_europe 1,9 · icon_d2 2,2 · icon_eu 2,4 · meteofrance_arome_france_hd 2,5 · ecmwf_ifs025 2,5 · meteofrance_arome_france 2,5 · gfs_seamless 3,0 |
| LFMP | gfs_seamless 1,6 · meteofrance_arome_france_hd 1,6 · meteofrance_arome_france 1,6 · icon_eu 1,7 · ecmwf_ifs025 2,1 · meteofrance_arpege_europe 2,2 |
| LFTH | ecmwf_ifs025 2,4 · icon_eu 2,9 · meteofrance_arpege_europe 4,0 · gfs_seamless 4,1 · meteofrance_arome_france_hd 4,4 · meteofrance_arome_france 4,4 |
| LFML | meteofrance_arome_france 2,4 · meteofrance_arome_france_hd 2,4 · ecmwf_ifs025 2,5 · icon_eu 2,6 · meteofrance_arpege_europe 3,1 · gfs_seamless 5,7 |
| LFMI | meteofrance_arome_france_hd 2,2 · meteofrance_arpege_europe 2,3 · meteofrance_arome_france 2,3 · ecmwf_ifs025 3,0 · icon_eu 3,2 · gfs_seamless 3,8 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.29 · meteofrance_wave 0.33 · ecmwf_wam025 0.41 · gwam 0.56 · ncep_gfswave025 1.11 |
| 03404 | ewam 0.18 · ncep_gfswave025 0.23 · gwam 0.24 · meteofrance_wave 0.26 · ecmwf_wam025 0.32 |
| 01101 | meteofrance_wave 0.16 · ewam 0.20 · ecmwf_wam025 0.28 · ncep_gfswave025 0.28 · gwam 0.36 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 9.75, ×0.94 (MAE 0.29 m, n 167) ; ecmwf_wam025 poids 5.93, ×0.86 (MAE 0.36 m, n 167) ; ewam poids 8.43, ×0.85 (MAE 0.28 m, n 167) ; gwam poids 2.01, ×0.8 (MAE 0.51 m, n 167) ; copernicus poids 9.94, ×0.86 (MAE 0.32 m, n 104)
  - 03404 : meteofrance_wave poids 11.35, ×1.04 (MAE 0.26 m, n 152) ; ecmwf_wam025 poids 7.55, ×0.95 (MAE 0.3 m, n 152) ; ewam poids 13.38, ×0.94 (MAE 0.19 m, n 152) ; gwam poids 6.19, ×0.87 (MAE 0.24 m, n 152) ; ncep_gfswave025 poids 6.58, ×1.04 (MAE 0.23 m, n 152) ; copernicus poids 24.88, ×0.97 (MAE 0.13 m, n 104)
  - 01102 : 
  - 01101 : meteofrance_wave poids 16.96, ×1.12 (MAE 0.18 m, n 169) ; ecmwf_wam025 poids 8.83, ×0.84 (MAE 0.27 m, n 169) ; ewam poids 10.42, ×0.9 (MAE 0.24 m, n 169) ; gwam poids 3.67, ×0.8 (MAE 0.35 m, n 169) ; ncep_gfswave025 poids 4.95, ×0.93 (MAE 0.29 m, n 169) ; copernicus poids 25.69, ×0.97 (MAE 0.12 m, n 104)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1, Port Camargue × 1.05 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

34 prévisions archivées. Classement à 24 h :

- LFMT : icon_d2 1,7 nd (n 12) · meteofrance_arpege_europe 1,7 nd (n 12) · meteofrance_arome_france 2,1 nd (n 12) · gfs_seamless 2,2 nd (n 12) · meteofrance_arome_france_hd 2,3 nd (n 12) · icon_eu 2,4 nd (n 12) · ecmwf_ifs025 2,4 nd (n 12)
- LFMP : gfs_seamless 1,3 nd (n 12) · meteofrance_arpege_europe 1,5 nd (n 12) · meteofrance_arome_france_hd 1,7 nd (n 12) · meteofrance_arome_france 1,7 nd (n 12) · icon_eu 1,8 nd (n 12) · ecmwf_ifs025 1,9 nd (n 12)
- LFTH : icon_eu 2,4 nd (n 12) · ecmwf_ifs025 3,1 nd (n 12) · meteofrance_arpege_europe 3,3 nd (n 12) · gfs_seamless 4,7 nd (n 12) · meteofrance_arome_france_hd 4,8 nd (n 12) · meteofrance_arome_france 4,8 nd (n 12)
- LFML : icon_eu 2,2 nd (n 12) · meteofrance_arome_france_hd 3,0 nd (n 12) · meteofrance_arome_france 3,0 nd (n 12) · ecmwf_ifs025 3,1 nd (n 12) · meteofrance_arpege_europe 3,8 nd (n 12) · gfs_seamless 5,9 nd (n 12)
- LFMI : 
