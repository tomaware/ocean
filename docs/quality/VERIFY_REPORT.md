# Remise en question (③)

Généré le 2026-11-15 15:33 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 35 prévisions archivées sur 135 h ; 3430 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arpege_europe 2,3 · icon_d2 2,3 · icon_eu 2,4 · meteofrance_arome_france_hd 2,8 · meteofrance_arome_france 2,8 · ecmwf_ifs025 3,2 · gfs_seamless 3,4 |
| LFMP | icon_eu 1,5 · gfs_seamless 1,6 · meteofrance_arome_france 1,6 · meteofrance_arome_france_hd 1,7 · ecmwf_ifs025 1,9 · meteofrance_arpege_europe 2,1 |
| LFTH | ecmwf_ifs025 2,3 · icon_eu 2,8 · meteofrance_arpege_europe 4,0 · gfs_seamless 4,0 · meteofrance_arome_france_hd 4,7 · meteofrance_arome_france 4,7 |
| LFML | meteofrance_arome_france 2,2 · meteofrance_arome_france_hd 2,2 · ecmwf_ifs025 2,5 · icon_eu 2,6 · meteofrance_arpege_europe 2,9 · gfs_seamless 5,6 |
| LFMI | meteofrance_arome_france_hd 2,1 · meteofrance_arome_france 2,2 · meteofrance_arpege_europe 2,4 · ecmwf_ifs025 2,9 · icon_eu 3,3 · gfs_seamless 3,5 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.29 · meteofrance_wave 0.33 · ecmwf_wam025 0.42 · gwam 0.57 · ncep_gfswave025 1.11 |
| 03404 | ewam 0.17 · gwam 0.24 · ncep_gfswave025 0.24 · meteofrance_wave 0.27 · ecmwf_wam025 0.33 |
| 01101 | meteofrance_wave 0.16 · ewam 0.20 · ncep_gfswave025 0.26 · ecmwf_wam025 0.28 · gwam 0.35 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 9.93, ×0.94 (MAE 0.28 m, n 173) ; ecmwf_wam025 poids 6.1, ×0.86 (MAE 0.35 m, n 173) ; ewam poids 8.63, ×0.85 (MAE 0.28 m, n 173) ; gwam poids 2.05, ×0.8 (MAE 0.5 m, n 173) ; copernicus poids 9.48, ×0.86 (MAE 0.33 m, n 104)
  - 03404 : meteofrance_wave poids 11.3, ×1.04 (MAE 0.26 m, n 158) ; ecmwf_wam025 poids 7.63, ×0.95 (MAE 0.3 m, n 158) ; ewam poids 13.56, ×0.94 (MAE 0.18 m, n 158) ; gwam poids 6.35, ×0.88 (MAE 0.23 m, n 158) ; ncep_gfswave025 poids 6.5, ×1.05 (MAE 0.23 m, n 158) ; copernicus poids 24.64, ×0.98 (MAE 0.13 m, n 104)
  - 01102 : 
  - 01101 : meteofrance_wave poids 17.19, ×1.12 (MAE 0.17 m, n 175) ; ecmwf_wam025 poids 8.96, ×0.84 (MAE 0.27 m, n 175) ; ewam poids 10.4, ×0.9 (MAE 0.24 m, n 175) ; gwam poids 3.72, ×0.8 (MAE 0.35 m, n 175) ; ncep_gfswave025 poids 5.14, ×0.93 (MAE 0.28 m, n 175) ; copernicus poids 24.67, ×0.96 (MAE 0.13 m, n 104)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.08, Port Camargue × 1.07 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

35 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arome_france 2,0 nd (n 12) · icon_d2 2,1 nd (n 12) · meteofrance_arome_france_hd 2,3 nd (n 12) · meteofrance_arpege_europe 2,3 nd (n 12) · gfs_seamless 2,5 nd (n 12) · icon_eu 2,7 nd (n 12) · ecmwf_ifs025 3,4 nd (n 12)
- LFMP : meteofrance_arpege_europe 1,4 nd (n 12) · gfs_seamless 1,4 nd (n 12) · icon_eu 1,7 nd (n 12) · meteofrance_arome_france 1,7 nd (n 12) · meteofrance_arome_france_hd 1,8 nd (n 12) · ecmwf_ifs025 1,8 nd (n 12)
- LFTH : icon_eu 2,3 nd (n 12) · ecmwf_ifs025 2,9 nd (n 12) · meteofrance_arpege_europe 3,3 nd (n 12) · gfs_seamless 4,7 nd (n 12) · meteofrance_arome_france_hd 4,9 nd (n 12) · meteofrance_arome_france 4,9 nd (n 12)
- LFML : icon_eu 2,5 nd (n 12) · meteofrance_arome_france_hd 2,8 nd (n 12) · meteofrance_arome_france 2,8 nd (n 12) · meteofrance_arpege_europe 3,1 nd (n 12) · ecmwf_ifs025 3,2 nd (n 12) · gfs_seamless 5,8 nd (n 12)
- LFMI : 
