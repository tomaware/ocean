# Remise en question (③)

Généré le 2026-11-13 16:18 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 21 prévisions archivées sur 87 h ; 2176 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 1,8 · gfs_seamless 2,0 · meteofrance_arome_france_hd 2,1 · icon_d2 2,7 · icon_eu 2,8 · meteofrance_arpege_europe 2,9 · ecmwf_ifs025 3,4 |
| LFMP | meteofrance_arome_france_hd 2,2 · meteofrance_arome_france 2,3 · ecmwf_ifs025 2,6 · icon_eu 3,0 · meteofrance_arpege_europe 3,4 · gfs_seamless 3,4 |
| LFTH | icon_eu 2,0 · meteofrance_arome_france 2,8 · meteofrance_arome_france_hd 2,9 · meteofrance_arpege_europe 3,1 · gfs_seamless 3,1 · ecmwf_ifs025 3,8 |
| LFML | meteofrance_arome_france_hd 2,3 · meteofrance_arome_france 2,5 · icon_eu 2,8 · ecmwf_ifs025 3,1 · meteofrance_arpege_europe 4,1 · gfs_seamless 5,1 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.09 · ewam 0.12 · ecmwf_wam025 0.18 · gwam 0.25 · ncep_gfswave025 0.95 |
| 03404 | meteofrance_wave 0.14 · ncep_gfswave025 0.19 · ewam 0.21 · ecmwf_wam025 0.25 · gwam 0.35 |
| 01101 | meteofrance_wave 0.13 · ewam 0.22 · ncep_gfswave025 0.22 · ecmwf_wam025 0.25 · gwam 0.33 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 21.67, ×0.98 (MAE 0.12 m, n 175) ; ecmwf_wam025 poids 13.27, ×0.92 (MAE 0.19 m, n 175) ; ewam poids 17.33, ×0.93 (MAE 0.13 m, n 175) ; gwam poids 5.98, ×0.86 (MAE 0.25 m, n 175) ; copernicus poids 26.46, ×0.99 (MAE 0.11 m, n 97)
  - 03404 : meteofrance_wave poids 18.14, ×0.99 (MAE 0.16 m, n 109) ; ecmwf_wam025 poids 11.14, ×0.93 (MAE 0.22 m, n 109) ; ewam poids 13.23, ×0.91 (MAE 0.19 m, n 109) ; gwam poids 5.58, ×0.87 (MAE 0.26 m, n 109) ; ncep_gfswave025 poids 9.33, ×0.92 (MAE 0.16 m, n 109) ; copernicus poids 22.65, ×0.94 (MAE 0.15 m, n 64)
  - 01102 : 
  - 01101 : meteofrance_wave poids 18.23, ×1.12 (MAE 0.16 m, n 177) ; ecmwf_wam025 poids 11.59, ×0.86 (MAE 0.22 m, n 177) ; ewam poids 12.82, ×0.92 (MAE 0.19 m, n 177) ; gwam poids 4.98, ×0.82 (MAE 0.28 m, n 177) ; ncep_gfswave025 poids 7.48, ×0.85 (MAE 0.2 m, n 177) ; copernicus poids 19.91, ×0.88 (MAE 0.17 m, n 99)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.99, Port Camargue × 0.99 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

21 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 2,2 nd (n 9) · icon_d2 2,3 nd (n 9) · icon_eu 2,4 nd (n 9) · meteofrance_arome_france 2,6 nd (n 9) · meteofrance_arome_france_hd 2,9 nd (n 9) · ecmwf_ifs025 3,1 nd (n 9) · gfs_seamless 3,6 nd (n 9)
- LFMP : meteofrance_arome_france_hd 2,4 nd (n 9) · meteofrance_arome_france 2,4 nd (n 9) · icon_eu 3,1 nd (n 9) · ecmwf_ifs025 3,3 nd (n 9) · gfs_seamless 3,9 nd (n 9) · meteofrance_arpege_europe 5,9 nd (n 9)
- LFTH : icon_eu 1,7 nd (n 9) · meteofrance_arome_france_hd 2,4 nd (n 9) · meteofrance_arome_france 2,4 nd (n 9) · gfs_seamless 2,7 nd (n 9) · ecmwf_ifs025 2,7 nd (n 9) · meteofrance_arpege_europe 3,5 nd (n 9)
- LFML : ecmwf_ifs025 1,8 nd (n 8) · icon_eu 2,5 nd (n 8) · meteofrance_arpege_europe 3,3 nd (n 8) · meteofrance_arome_france 3,4 nd (n 8) · meteofrance_arome_france_hd 3,4 nd (n 8) · gfs_seamless 5,4 nd (n 8)
