# Remise en question (③)

Généré le 2026-11-16 02:06 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 38 prévisions archivées sur 144 h ; 3685 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 2,8 · meteofrance_arome_france_hd 2,8 · meteofrance_arpege_europe 3,0 · icon_eu 3,1 · icon_d2 3,2 · ecmwf_ifs025 4,0 · gfs_seamless 4,1 |
| LFMP | ecmwf_ifs025 1,8 · gfs_seamless 1,9 · icon_eu 2,0 · meteofrance_arome_france_hd 2,0 · meteofrance_arome_france 2,0 · meteofrance_arpege_europe 2,5 |
| LFTH | ecmwf_ifs025 2,1 · icon_eu 2,5 · gfs_seamless 4,0 · meteofrance_arpege_europe 4,1 · meteofrance_arome_france_hd 4,5 · meteofrance_arome_france 4,6 |
| LFML | meteofrance_arome_france 2,2 · ecmwf_ifs025 2,4 · meteofrance_arome_france_hd 2,4 · icon_eu 2,6 · meteofrance_arpege_europe 3,0 · gfs_seamless 5,4 |
| LFMI | meteofrance_arome_france_hd 2,3 · ecmwf_ifs025 2,4 · meteofrance_arome_france 2,4 · meteofrance_arpege_europe 2,7 · icon_eu 3,1 · gfs_seamless 3,8 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.31 · meteofrance_wave 0.33 · ecmwf_wam025 0.39 · gwam 0.53 · ncep_gfswave025 1.13 |
| 03404 | ewam 0.17 · gwam 0.20 · ncep_gfswave025 0.24 · meteofrance_wave 0.28 · ecmwf_wam025 0.30 |
| 01101 | meteofrance_wave 0.16 · ewam 0.16 · ncep_gfswave025 0.21 · ecmwf_wam025 0.22 · gwam 0.24 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 8.78, ×0.96 (MAE 0.31 m, n 149) ; ecmwf_wam025 poids 5.33, ×0.86 (MAE 0.38 m, n 149) ; ewam poids 7.61, ×0.88 (MAE 0.3 m, n 149) ; gwam poids 1.91, ×0.8 (MAE 0.52 m, n 149) ; copernicus poids 10.42, ×0.96 (MAE 0.31 m, n 107)
  - 03404 : meteofrance_wave poids 10.7, ×1.08 (MAE 0.27 m, n 149) ; ecmwf_wam025 poids 7.59, ×0.98 (MAE 0.3 m, n 149) ; ewam poids 13.72, ×1 (MAE 0.18 m, n 149) ; gwam poids 6.85, ×0.93 (MAE 0.22 m, n 149) ; ncep_gfswave025 poids 6.21, ×1.1 (MAE 0.24 m, n 149) ; copernicus poids 17.72, ×1.06 (MAE 0.2 m, n 107)
  - 01102 : 
  - 01101 : meteofrance_wave poids 18.82, ×1.12 (MAE 0.15 m, n 149) ; ecmwf_wam025 poids 9.95, ×0.86 (MAE 0.25 m, n 149) ; ewam poids 14.79, ×0.98 (MAE 0.17 m, n 149) ; gwam poids 5.07, ×0.86 (MAE 0.28 m, n 149) ; ncep_gfswave025 poids 6.56, ×1.02 (MAE 0.23 m, n 149) ; copernicus poids 24.17, ×0.98 (MAE 0.13 m, n 107)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.99, Port Camargue × 1 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

38 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arome_france 2,9 nd (n 10) · meteofrance_arpege_europe 3,0 nd (n 10) · icon_d2 3,3 nd (n 10) · meteofrance_arome_france_hd 3,6 nd (n 10) · gfs_seamless 3,8 nd (n 10) · icon_eu 3,9 nd (n 10) · ecmwf_ifs025 4,7 nd (n 10)
- LFMP : meteofrance_arome_france_hd 1,8 nd (n 10) · meteofrance_arome_france 1,8 nd (n 10) · icon_eu 2,2 nd (n 10) · meteofrance_arpege_europe 2,2 nd (n 10) · gfs_seamless 2,5 nd (n 10) · ecmwf_ifs025 2,6 nd (n 10)
- LFTH : icon_eu 2,1 nd (n 10) · ecmwf_ifs025 2,6 nd (n 10) · meteofrance_arpege_europe 3,5 nd (n 10) · gfs_seamless 3,7 nd (n 10) · meteofrance_arome_france_hd 4,7 nd (n 10) · meteofrance_arome_france 4,7 nd (n 10)
- LFML : meteofrance_arpege_europe 2,2 nd (n 10) · icon_eu 3,2 nd (n 10) · ecmwf_ifs025 3,2 nd (n 10) · meteofrance_arome_france 3,2 nd (n 10) · meteofrance_arome_france_hd 3,3 nd (n 10) · gfs_seamless 5,5 nd (n 10)
- LFMI : icon_eu 2,4 nd (n 3) · meteofrance_arpege_europe 2,7 nd (n 3) · ecmwf_ifs025 3,0 nd (n 3) · meteofrance_arome_france_hd 3,3 nd (n 3) · meteofrance_arome_france 3,3 nd (n 3) · gfs_seamless 4,2 nd (n 3)
