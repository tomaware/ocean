# Remise en question (③)

Généré le 2026-11-14 00:17 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 24 prévisions archivées sur 96 h ; 2425 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | gfs_seamless 2,1 · meteofrance_arome_france 2,1 · meteofrance_arome_france_hd 2,4 · icon_d2 3,0 · meteofrance_arpege_europe 3,0 · icon_eu 3,2 · ecmwf_ifs025 3,4 |
| LFMP | meteofrance_arome_france_hd 2,2 · meteofrance_arome_france 2,3 · ecmwf_ifs025 2,9 · icon_eu 3,3 · meteofrance_arpege_europe 3,5 · gfs_seamless 3,5 |
| LFTH | icon_eu 2,2 · meteofrance_arome_france_hd 2,7 · meteofrance_arome_france 2,7 · meteofrance_arpege_europe 3,1 · gfs_seamless 3,1 · ecmwf_ifs025 4,0 |
| LFML | meteofrance_arome_france_hd 2,4 · meteofrance_arome_france 2,6 · icon_eu 3,0 · ecmwf_ifs025 3,4 · meteofrance_arpege_europe 4,5 · gfs_seamless 4,6 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.14 · meteofrance_wave 0.15 · ecmwf_wam025 0.24 · gwam 0.32 · ncep_gfswave025 0.94 |
| 03404 | meteofrance_wave 0.16 · ncep_gfswave025 0.17 · ewam 0.22 · ecmwf_wam025 0.25 · gwam 0.33 |
| 01101 | meteofrance_wave 0.14 · ncep_gfswave025 0.22 · ewam 0.23 · ecmwf_wam025 0.27 · gwam 0.34 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 19.32, ×0.92 (MAE 0.15 m, n 143) ; ecmwf_wam025 poids 10.33, ×0.86 (MAE 0.24 m, n 143) ; ewam poids 17.33, ×0.91 (MAE 0.13 m, n 143) ; gwam poids 4.33, ×0.81 (MAE 0.31 m, n 143) ; copernicus poids 25.48, ×0.98 (MAE 0.12 m, n 101)
  - 03404 : meteofrance_wave poids 18.54, ×0.91 (MAE 0.16 m, n 80) ; ecmwf_wam025 poids 9.77, ×0.86 (MAE 0.25 m, n 80) ; ewam poids 11.43, ×0.92 (MAE 0.22 m, n 80) ; gwam poids 4.19, ×0.83 (MAE 0.32 m, n 80) ; ncep_gfswave025 poids 8.7, ×0.91 (MAE 0.17 m, n 80) ; copernicus poids 25.16, ×0.95 (MAE 0.13 m, n 80)
  - 01102 : 
  - 01101 : meteofrance_wave poids 20.81, ×1.05 (MAE 0.13 m, n 145) ; ecmwf_wam025 poids 9.16, ×0.81 (MAE 0.26 m, n 145) ; ewam poids 10.91, ×0.89 (MAE 0.23 m, n 145) ; gwam poids 3.97, ×0.8 (MAE 0.33 m, n 145) ; ncep_gfswave025 poids 6.98, ×0.83 (MAE 0.21 m, n 145) ; copernicus poids 18.09, ×0.88 (MAE 0.19 m, n 103)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.08, Port Camargue × 1.11 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

24 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 2,0 nd (n 9) · icon_d2 2,9 nd (n 9) · meteofrance_arome_france 2,9 nd (n 9) · icon_eu 3,0 nd (n 9) · ecmwf_ifs025 3,2 nd (n 9) · meteofrance_arome_france_hd 3,3 nd (n 9) · gfs_seamless 3,7 nd (n 9)
- LFMP : meteofrance_arome_france_hd 2,5 nd (n 9) · meteofrance_arome_france 2,6 nd (n 9) · icon_eu 3,5 nd (n 9) · ecmwf_ifs025 4,0 nd (n 9) · gfs_seamless 4,0 nd (n 9) · meteofrance_arpege_europe 6,2 nd (n 9)
- LFTH : icon_eu 1,9 nd (n 9) · meteofrance_arome_france_hd 2,3 nd (n 9) · meteofrance_arome_france 2,3 nd (n 9) · ecmwf_ifs025 2,8 nd (n 9) · gfs_seamless 2,8 nd (n 9) · meteofrance_arpege_europe 3,6 nd (n 9)
- LFML : ecmwf_ifs025 1,7 nd (n 9) · icon_eu 2,4 nd (n 9) · meteofrance_arome_france_hd 3,4 nd (n 9) · meteofrance_arome_france 3,6 nd (n 9) · gfs_seamless 4,9 nd (n 9) · meteofrance_arpege_europe 5,1 nd (n 9)
