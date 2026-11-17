# Remise en question (③)

Généré le 2026-11-17 03:30 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 43 prévisions archivées sur 171 h ; 4215 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 2,0 · meteofrance_arome_france_hd 2,1 · icon_eu 3,0 · meteofrance_arpege_europe 3,2 · icon_d2 3,4 · gfs_seamless 3,4 · ecmwf_ifs025 3,7 |
| LFMP | ecmwf_ifs025 1,8 · gfs_seamless 1,9 · icon_eu 2,0 · meteofrance_arome_france_hd 2,0 · meteofrance_arome_france 2,0 · meteofrance_arpege_europe 2,4 |
| LFTH | meteofrance_arome_france_hd 1,8 · meteofrance_arome_france 1,9 · gfs_seamless 2,0 · meteofrance_arpege_europe 2,0 · icon_eu 2,1 · ecmwf_ifs025 2,2 |
| LFML | meteofrance_arome_france 1,9 · ecmwf_ifs025 1,9 · meteofrance_arome_france_hd 2,1 · icon_eu 2,2 · meteofrance_arpege_europe 3,1 · gfs_seamless 4,2 |
| LFMI | meteofrance_arome_france 1,7 · meteofrance_arome_france_hd 1,7 · ecmwf_ifs025 2,0 · icon_eu 2,1 · meteofrance_arpege_europe 2,6 · gfs_seamless 2,7 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.26 · ecmwf_wam025 0.30 · ewam 0.31 · gwam 0.41 · ncep_gfswave025 1.06 |
| 03404 | ewam 0.13 · gwam 0.15 · ncep_gfswave025 0.23 · ecmwf_wam025 0.26 · meteofrance_wave 0.27 |
| 01101 | ecmwf_wam025 0.16 · ewam 0.16 · meteofrance_wave 0.17 · gwam 0.19 · ncep_gfswave025 0.21 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 10.77, ×0.98 (MAE 0.27 m, n 151) ; ecmwf_wam025 poids 7.22, ×0.89 (MAE 0.31 m, n 151) ; ewam poids 7.69, ×0.88 (MAE 0.3 m, n 151) ; gwam poids 2.63, ×0.82 (MAE 0.43 m, n 151) ; copernicus poids 20.11, ×0.99 (MAE 0.17 m, n 109)
  - 03404 : meteofrance_wave poids 11.66, ×1.13 (MAE 0.25 m, n 151) ; ecmwf_wam025 poids 9.66, ×1.03 (MAE 0.25 m, n 151) ; ewam poids 16.88, ×1.02 (MAE 0.14 m, n 151) ; gwam poids 9.69, ×0.98 (MAE 0.15 m, n 151) ; ncep_gfswave025 poids 7.02, ×1.15 (MAE 0.21 m, n 151) ; copernicus poids 16.28, ×1.07 (MAE 0.21 m, n 109)
  - 01102 : 
  - 01101 : meteofrance_wave poids 17.3, ×1.19 (MAE 0.17 m, n 151) ; ecmwf_wam025 poids 16.09, ×0.94 (MAE 0.15 m, n 151) ; ewam poids 15.57, ×1.01 (MAE 0.16 m, n 151) ; gwam poids 8.12, ×0.95 (MAE 0.18 m, n 151) ; ncep_gfswave025 poids 7.29, ×1.1 (MAE 0.21 m, n 151) ; copernicus poids 25.1, ×1 (MAE 0.13 m, n 109)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.94, Port Camargue × 0.98 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

43 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arome_france 2,4 nd (n 13) · meteofrance_arome_france_hd 2,6 nd (n 13) · icon_eu 2,8 nd (n 13) · icon_d2 3,0 nd (n 13) · gfs_seamless 3,0 nd (n 13) · meteofrance_arpege_europe 3,4 nd (n 13) · ecmwf_ifs025 4,1 nd (n 13)
- LFMP : meteofrance_arome_france 1,7 nd (n 13) · meteofrance_arome_france_hd 2,1 nd (n 13) · icon_eu 2,3 nd (n 13) · gfs_seamless 2,5 nd (n 13) · ecmwf_ifs025 2,5 nd (n 13) · meteofrance_arpege_europe 3,0 nd (n 13)
- LFTH : meteofrance_arome_france_hd 1,8 nd (n 13) · meteofrance_arome_france 1,8 nd (n 13) · icon_eu 2,1 nd (n 13) · gfs_seamless 2,3 nd (n 13) · ecmwf_ifs025 2,4 nd (n 13) · meteofrance_arpege_europe 2,4 nd (n 13)
- LFML : meteofrance_arome_france 1,6 nd (n 13) · meteofrance_arome_france_hd 1,8 nd (n 13) · ecmwf_ifs025 1,9 nd (n 13) · icon_eu 2,7 nd (n 13) · meteofrance_arpege_europe 3,2 nd (n 13) · gfs_seamless 4,2 nd (n 13)
- LFMI : icon_eu 2,1 nd (n 12) · ecmwf_ifs025 2,7 nd (n 12) · meteofrance_arome_france_hd 3,1 nd (n 12) · meteofrance_arpege_europe 3,2 nd (n 12) · meteofrance_arome_france 3,3 nd (n 12) · gfs_seamless 3,5 nd (n 12)
