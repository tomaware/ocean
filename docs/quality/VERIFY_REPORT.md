# Remise en question (③)

Généré le 2026-11-19 15:38 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 59 prévisions archivées sur 231 h ; 5288 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | icon_d2 2,4 · meteofrance_arome_france_hd 2,4 · meteofrance_arome_france 2,4 · icon_eu 2,4 · meteofrance_arpege_europe 2,4 · gfs_seamless 2,6 · ecmwf_ifs025 3,3 |
| LFMP | meteofrance_arome_france_hd 2,9 · meteofrance_arome_france 2,9 · icon_eu 3,2 · meteofrance_arpege_europe 3,2 · gfs_seamless 4,0 · ecmwf_ifs025 4,5 |
| LFTH | meteofrance_arpege_europe 2,4 · meteofrance_arome_france_hd 2,7 · meteofrance_arome_france 2,7 · icon_eu 3,1 · ecmwf_ifs025 3,3 · gfs_seamless 3,4 |
| LFML | meteofrance_arome_france 2,2 · meteofrance_arome_france_hd 2,3 · icon_eu 2,6 · meteofrance_arpege_europe 2,6 · ecmwf_ifs025 3,0 · gfs_seamless 4,8 |
| LFMI | meteofrance_arpege_europe 2,1 · meteofrance_arome_france_hd 2,5 · meteofrance_arome_france 2,5 · gfs_seamless 3,0 · icon_eu 3,3 · ecmwf_ifs025 3,4 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.17 · meteofrance_wave 0.19 · ecmwf_wam025 0.30 · gwam 0.35 · ncep_gfswave025 0.87 |
| 03404 | ewam 0.13 · meteofrance_wave 0.17 · ncep_gfswave025 0.20 · ecmwf_wam025 0.23 · gwam 0.24 |
| 01101 | ncep_gfswave025 0.17 · meteofrance_wave 0.18 · ewam 0.18 · ecmwf_wam025 0.19 · gwam 0.28 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 15.32, ×0.87 (MAE 0.2 m, n 176) ; ecmwf_wam025 poids 7.55, ×0.8 (MAE 0.3 m, n 176) ; ewam poids 14.75, ×0.88 (MAE 0.17 m, n 176) ; gwam poids 3.78, ×0.8 (MAE 0.34 m, n 176) ; copernicus poids 13.6, ×0.86 (MAE 0.25 m, n 110)
  - 03404 : meteofrance_wave poids 17.59, ×0.92 (MAE 0.17 m, n 176) ; ecmwf_wam025 poids 10.9, ×0.83 (MAE 0.23 m, n 176) ; ewam poids 18.47, ×0.93 (MAE 0.12 m, n 176) ; gwam poids 6.75, ×0.83 (MAE 0.22 m, n 176) ; ncep_gfswave025 poids 8.56, ×0.89 (MAE 0.17 m, n 176) ; copernicus poids 15, ×0.86 (MAE 0.23 m, n 110)
  - 01102 : 
  - 01101 : meteofrance_wave poids 18.65, ×1.25 (MAE 0.16 m, n 151) ; ecmwf_wam025 poids 13.21, ×0.85 (MAE 0.19 m, n 151) ; ewam poids 15.57, ×1.03 (MAE 0.16 m, n 151) ; gwam poids 5.16, ×0.81 (MAE 0.28 m, n 151) ; ncep_gfswave025 poids 8.26, ×0.9 (MAE 0.18 m, n 151) ; copernicus poids 27.37, ×0.98 (MAE 0.11 m, n 85)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1, Port Camargue × 1.2 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

59 prévisions archivées. Classement à 24 h :

- LFMT : icon_d2 1,7 nd (n 10) · gfs_seamless 1,8 nd (n 10) · icon_eu 1,9 nd (n 10) · meteofrance_arome_france 2,8 nd (n 10) · meteofrance_arome_france_hd 2,8 nd (n 10) · meteofrance_arpege_europe 3,5 nd (n 10) · ecmwf_ifs025 3,9 nd (n 10)
- LFMP : meteofrance_arome_france_hd 2,7 nd (n 10) · meteofrance_arome_france 2,9 nd (n 10) · meteofrance_arpege_europe 4,1 nd (n 10) · icon_eu 4,2 nd (n 10) · ecmwf_ifs025 4,2 nd (n 10) · gfs_seamless 4,5 nd (n 10)
- LFTH : meteofrance_arome_france_hd 2,6 nd (n 10) · meteofrance_arome_france 2,6 nd (n 10) · meteofrance_arpege_europe 2,6 nd (n 10) · ecmwf_ifs025 3,3 nd (n 10) · icon_eu 3,4 nd (n 10) · gfs_seamless 3,7 nd (n 10)
- LFML : meteofrance_arpege_europe 2,4 nd (n 10) · meteofrance_arome_france_hd 2,5 nd (n 10) · icon_eu 2,5 nd (n 10) · meteofrance_arome_france 2,6 nd (n 10) · ecmwf_ifs025 3,3 nd (n 10) · gfs_seamless 3,6 nd (n 10)
- LFMI : gfs_seamless 2,4 nd (n 10) · meteofrance_arome_france_hd 2,4 nd (n 10) · meteofrance_arome_france 2,4 nd (n 10) · icon_eu 2,5 nd (n 10) · ecmwf_ifs025 2,5 nd (n 10) · meteofrance_arpege_europe 3,1 nd (n 10)
