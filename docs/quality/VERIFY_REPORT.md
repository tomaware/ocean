# Remise en question (③)

Généré le 2026-11-20 11:38 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 63 prévisions archivées sur 243 h ; 5900 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 4 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arpege_europe 2,4 · meteofrance_arome_france_hd 2,7 · meteofrance_arome_france 2,7 · icon_eu 3,1 · icon_d2 3,1 · gfs_seamless 3,2 · ecmwf_ifs025 3,3 |
| LFMP | icon_eu 3,2 · meteofrance_arome_france_hd 3,3 · meteofrance_arome_france 3,3 · meteofrance_arpege_europe 3,6 · gfs_seamless 3,6 · ecmwf_ifs025 4,7 |
| LFTH | meteofrance_arome_france_hd 2,3 · meteofrance_arome_france 2,3 · meteofrance_arpege_europe 2,7 · icon_eu 3,6 · ecmwf_ifs025 3,8 · gfs_seamless 4,2 |
| LFML | meteofrance_arome_france_hd 2,5 · meteofrance_arome_france 2,7 · meteofrance_arpege_europe 3,3 · gfs_seamless 3,9 · icon_eu 4,2 · ecmwf_ifs025 5,2 |
| LFMI | meteofrance_arpege_europe 2,6 · meteofrance_arome_france_hd 2,7 · meteofrance_arome_france 2,7 · gfs_seamless 3,5 · ecmwf_ifs025 3,8 · icon_eu 4,3 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.16 · meteofrance_wave 0.17 · ecmwf_wam025 0.37 · gwam 0.37 · ncep_gfswave025 1.00 |
| 03404 | ewam 0.12 · meteofrance_wave 0.13 · ncep_gfswave025 0.25 · gwam 0.26 · ecmwf_wam025 0.29 |
| 01101 | meteofrance_wave 0.11 · ewam 0.15 · ncep_gfswave025 0.29 · ecmwf_wam025 0.31 · gwam 0.36 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 17.68, ×0.91 (MAE 0.17 m, n 168) ; ecmwf_wam025 poids 6.36, ×0.8 (MAE 0.34 m, n 168) ; ewam poids 15.35, ×0.9 (MAE 0.16 m, n 168) ; gwam poids 3.65, ×0.8 (MAE 0.35 m, n 168) ; copernicus poids 15.29, ×0.89 (MAE 0.23 m, n 102)
  - 03404 : meteofrance_wave poids 21.24, ×0.94 (MAE 0.13 m, n 168) ; ecmwf_wam025 poids 8.84, ×0.81 (MAE 0.27 m, n 168) ; ewam poids 18.44, ×0.93 (MAE 0.12 m, n 168) ; gwam poids 6.17, ×0.82 (MAE 0.24 m, n 168) ; ncep_gfswave025 poids 6.37, ×0.85 (MAE 0.23 m, n 168) ; copernicus poids 17.87, ×0.86 (MAE 0.2 m, n 102)
  - 01102 : 
  - 01101 : meteofrance_wave poids 20.58, ×1.25 (MAE 0.14 m, n 138) ; ecmwf_wam025 poids 9.61, ×0.84 (MAE 0.25 m, n 138) ; ewam poids 16.19, ×1.05 (MAE 0.15 m, n 138) ; gwam poids 4.54, ×0.81 (MAE 0.3 m, n 138) ; ncep_gfswave025 poids 6.43, ×0.91 (MAE 0.23 m, n 138) ; copernicus poids 28.18, ×1.01 (MAE 0.1 m, n 72)
- Vent downwind : La Grande-Motte × 1.05, Port Camargue × 1.13 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

63 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arome_france 2,8 nd (n 12) · gfs_seamless 2,9 nd (n 12) · meteofrance_arpege_europe 3,0 nd (n 12) · meteofrance_arome_france_hd 3,1 nd (n 12) · icon_d2 3,7 nd (n 12) · icon_eu 3,8 nd (n 12) · ecmwf_ifs025 4,0 nd (n 12)
- LFMP : meteofrance_arome_france 2,6 nd (n 12) · meteofrance_arome_france_hd 2,7 nd (n 12) · icon_eu 3,5 nd (n 12) · meteofrance_arpege_europe 3,8 nd (n 12) · ecmwf_ifs025 3,9 nd (n 12) · gfs_seamless 4,2 nd (n 12)
- LFTH : meteofrance_arpege_europe 1,9 nd (n 12) · meteofrance_arome_france_hd 2,2 nd (n 12) · meteofrance_arome_france 2,2 nd (n 12) · ecmwf_ifs025 3,3 nd (n 12) · icon_eu 3,7 nd (n 12) · gfs_seamless 4,6 nd (n 12)
- LFML : meteofrance_arpege_europe 3,1 nd (n 12) · meteofrance_arome_france 3,2 nd (n 12) · meteofrance_arome_france_hd 3,3 nd (n 12) · gfs_seamless 3,7 nd (n 12) · icon_eu 3,8 nd (n 12) · ecmwf_ifs025 5,0 nd (n 12)
- LFMI : gfs_seamless 2,8 nd (n 12) · meteofrance_arpege_europe 2,9 nd (n 12) · ecmwf_ifs025 3,1 nd (n 12) · meteofrance_arome_france_hd 3,3 nd (n 12) · meteofrance_arome_france 3,4 nd (n 12) · icon_eu 3,6 nd (n 12)
