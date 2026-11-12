# Remise en question (③)

Généré le 2026-11-12 20:55 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 15 prévisions archivées sur 66 h ; 1876 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 1,6 · gfs_seamless 1,6 · meteofrance_arome_france_hd 1,7 · icon_eu 2,0 · icon_d2 2,0 · meteofrance_arpege_europe 2,4 · ecmwf_ifs025 3,1 |
| LFMP | meteofrance_arome_france_hd 1,9 · meteofrance_arome_france 2,0 · ecmwf_ifs025 2,1 · icon_eu 2,2 · gfs_seamless 2,4 · meteofrance_arpege_europe 2,6 |
| LFTH | icon_eu 1,8 · meteofrance_arome_france_hd 2,7 · meteofrance_arome_france 2,7 · ecmwf_ifs025 2,9 · gfs_seamless 3,1 · meteofrance_arpege_europe 3,5 |
| LFML | meteofrance_arome_france_hd 2,0 · meteofrance_arome_france 2,0 · ecmwf_ifs025 2,2 · icon_eu 2,5 · meteofrance_arpege_europe 3,6 · gfs_seamless 3,7 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.13 · meteofrance_wave 0.14 · ecmwf_wam025 0.16 · gwam 0.18 · ncep_gfswave025 1.12 |
| 03404 | ncep_gfswave025 0.12 · meteofrance_wave 0.15 · ecmwf_wam025 0.15 · gwam 0.15 · ewam 0.18 |
| 01101 | ecmwf_wam025 0.13 · gwam 0.16 · ncep_gfswave025 0.16 · meteofrance_wave 0.19 · ewam 0.19 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 14.16, ×1.08 (MAE 0.21 m, n 185) ; ecmwf_wam025 poids 11.98, ×1.04 (MAE 0.21 m, n 185) ; ewam poids 16.32, ×0.98 (MAE 0.15 m, n 185) ; gwam poids 8.28, ×0.95 (MAE 0.18 m, n 185) ; copernicus poids 26.75, ×0.95 (MAE 0.11 m, n 101)
  - 03404 : meteofrance_wave poids 15.79, ×1.09 (MAE 0.19 m, n 119) ; ecmwf_wam025 poids 15.33, ×1.04 (MAE 0.16 m, n 119) ; ewam poids 16.52, ×0.96 (MAE 0.14 m, n 119) ; gwam poids 10.74, ×0.97 (MAE 0.13 m, n 119) ; ncep_gfswave025 poids 10.15, ×1 (MAE 0.14 m, n 119) ; copernicus poids 22.99, ×0.95 (MAE 0.14 m, n 35)
  - 01102 : meteofrance_wave poids —, ×— (MAE 0.44 m, n 29) ; ecmwf_wam025 poids —, ×— (MAE 0.16 m, n 29) ; ewam poids —, ×— (MAE 0.18 m, n 29) ; gwam poids —, ×— (MAE 0.45 m, n 29)
  - 01101 : meteofrance_wave poids 12.73, ×1.23 (MAE 0.23 m, n 187) ; ecmwf_wam025 poids 15.78, ×0.92 (MAE 0.15 m, n 187) ; ewam poids 12.79, ×0.95 (MAE 0.2 m, n 187) ; gwam poids 9.35, ×0.95 (MAE 0.16 m, n 187) ; ncep_gfswave025 poids 9.13, ×0.93 (MAE 0.16 m, n 187) ; copernicus poids 24.88, ×0.94 (MAE 0.13 m, n 103)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.01, Port Camargue × 0.96 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

15 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 2,1 nd (n 14) · icon_d2 2,2 nd (n 14) · icon_eu 2,3 nd (n 14) · meteofrance_arome_france 2,6 nd (n 14) · meteofrance_arome_france_hd 2,8 nd (n 14) · ecmwf_ifs025 2,8 nd (n 14) · gfs_seamless 2,9 nd (n 14)
- LFMP : meteofrance_arome_france_hd 2,2 nd (n 14) · meteofrance_arome_france 2,2 nd (n 14) · icon_eu 2,6 nd (n 14) · ecmwf_ifs025 2,8 nd (n 14) · gfs_seamless 3,4 nd (n 14) · meteofrance_arpege_europe 4,6 nd (n 14)
- LFTH : icon_eu 2,1 nd (n 14) · meteofrance_arome_france 2,3 nd (n 14) · meteofrance_arome_france_hd 2,3 nd (n 14) · ecmwf_ifs025 2,9 nd (n 14) · meteofrance_arpege_europe 3,1 nd (n 14) · gfs_seamless 3,3 nd (n 14)
- LFML : ecmwf_ifs025 1,7 nd (n 8) · icon_eu 2,3 nd (n 8) · meteofrance_arpege_europe 3,2 nd (n 8) · meteofrance_arome_france 3,2 nd (n 8) · meteofrance_arome_france_hd 3,3 nd (n 8) · gfs_seamless 5,3 nd (n 8)
