# Remise en question (③)

Généré le 2026-11-21 01:54 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 68 prévisions archivées sur 264 h ; 5786 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 4 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 2,6 · meteofrance_arome_france_hd 2,7 · meteofrance_arpege_europe 2,7 · icon_d2 3,1 · icon_eu 3,2 · gfs_seamless 3,3 · ecmwf_ifs025 3,6 |
| LFMP | meteofrance_arome_france 2,7 · icon_eu 2,7 · meteofrance_arome_france_hd 2,7 · ecmwf_ifs025 3,3 · meteofrance_arpege_europe 3,4 · gfs_seamless 3,6 |
| LFTH | meteofrance_arome_france_hd 2,3 · meteofrance_arome_france 2,3 · meteofrance_arpege_europe 2,6 · ecmwf_ifs025 3,0 · icon_eu 3,3 · gfs_seamless 4,0 |
| LFML | meteofrance_arome_france_hd 2,4 · meteofrance_arome_france 2,6 · meteofrance_arpege_europe 2,6 · gfs_seamless 3,1 · icon_eu 4,1 · ecmwf_ifs025 5,3 |
| LFMI | meteofrance_arome_france_hd 2,2 · meteofrance_arome_france 2,2 · gfs_seamless 2,5 · meteofrance_arpege_europe 2,7 · ecmwf_ifs025 3,1 · icon_eu 3,6 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.15 · meteofrance_wave 0.22 · gwam 0.37 · ecmwf_wam025 0.41 · ncep_gfswave025 1.02 |
| 03404 | ewam 0.12 · meteofrance_wave 0.17 · gwam 0.28 · ncep_gfswave025 0.29 · ecmwf_wam025 0.35 |
| 01101 | meteofrance_wave 0.10 · ewam 0.15 · ecmwf_wam025 0.35 · ncep_gfswave025 0.35 · gwam 0.44 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 12.9, ×0.88 (MAE 0.23 m, n 122) ; ecmwf_wam025 poids 4.85, ×0.8 (MAE 0.41 m, n 122) ; ewam poids 16.14, ×0.92 (MAE 0.15 m, n 122) ; gwam poids 3.46, ×0.81 (MAE 0.36 m, n 122) ; copernicus poids 15.45, ×0.9 (MAE 0.23 m, n 80)
  - 03404 : meteofrance_wave poids 17.66, ×0.88 (MAE 0.17 m, n 122) ; ecmwf_wam025 poids 6.36, ×0.8 (MAE 0.34 m, n 122) ; ewam poids 18.62, ×0.94 (MAE 0.12 m, n 122) ; gwam poids 5.28, ×0.82 (MAE 0.27 m, n 122) ; ncep_gfswave025 poids 5.1, ×0.84 (MAE 0.28 m, n 122) ; copernicus poids 21.13, ×0.9 (MAE 0.16 m, n 80)
  - 01102 : 
  - 01101 : meteofrance_wave poids 24.64, ×1.1 (MAE 0.09 m, n 92) ; ecmwf_wam025 poids 6.87, ×0.84 (MAE 0.32 m, n 92) ; ewam poids 16.41, ×0.96 (MAE 0.14 m, n 92) ; gwam poids 2.89, ×0.8 (MAE 0.41 m, n 92) ; ncep_gfswave025 poids 4.52, ×0.87 (MAE 0.3 m, n 92) ; copernicus poids 28.86, ×0.98 (MAE 0.09 m, n 51)
- Vent downwind : La Grande-Motte × 1.05, Port Camargue × 1.11 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

68 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arome_france 2,7 nd (n 13) · meteofrance_arpege_europe 2,7 nd (n 13) · meteofrance_arome_france_hd 2,9 nd (n 13) · gfs_seamless 3,4 nd (n 13) · icon_d2 3,7 nd (n 13) · ecmwf_ifs025 3,8 nd (n 13) · icon_eu 3,9 nd (n 13)
- LFMP : meteofrance_arome_france 2,2 nd (n 13) · meteofrance_arome_france_hd 2,4 nd (n 13) · ecmwf_ifs025 2,5 nd (n 13) · icon_eu 2,7 nd (n 13) · gfs_seamless 3,5 nd (n 13) · meteofrance_arpege_europe 3,6 nd (n 13)
- LFTH : meteofrance_arpege_europe 2,3 nd (n 13) · meteofrance_arome_france_hd 2,7 nd (n 13) · meteofrance_arome_france 2,7 nd (n 13) · ecmwf_ifs025 3,0 nd (n 13) · icon_eu 3,4 nd (n 13) · gfs_seamless 4,8 nd (n 13)
- LFML : meteofrance_arpege_europe 2,6 nd (n 13) · meteofrance_arome_france 3,1 nd (n 13) · meteofrance_arome_france_hd 3,3 nd (n 13) · gfs_seamless 3,5 nd (n 13) · icon_eu 3,6 nd (n 13) · ecmwf_ifs025 5,2 nd (n 13)
- LFMI : meteofrance_arpege_europe 2,9 nd (n 13) · meteofrance_arome_france_hd 2,9 nd (n 13) · gfs_seamless 2,9 nd (n 13) · meteofrance_arome_france 3,0 nd (n 13) · ecmwf_ifs025 3,2 nd (n 13) · icon_eu 3,6 nd (n 13)
