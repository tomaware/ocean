# Remise en question (③)

Généré le 2026-11-12 19:22 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 15 prévisions archivées sur 66 h ; 1862 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | gfs_seamless 1,5 · meteofrance_arome_france 1,5 · meteofrance_arome_france_hd 1,6 · icon_eu 1,8 · icon_d2 1,9 · meteofrance_arpege_europe 2,3 · ecmwf_ifs025 2,9 |
| LFMP | meteofrance_arome_france_hd 1,8 · meteofrance_arome_france 1,8 · ecmwf_ifs025 1,9 · icon_eu 2,0 · gfs_seamless 2,3 · meteofrance_arpege_europe 2,5 |
| LFTH | icon_eu 1,8 · meteofrance_arome_france_hd 2,7 · meteofrance_arome_france 2,7 · ecmwf_ifs025 2,7 · gfs_seamless 3,0 · meteofrance_arpege_europe 3,5 |
| LFML | ecmwf_ifs025 2,0 · meteofrance_arome_france_hd 2,0 · meteofrance_arome_france 2,1 · icon_eu 2,5 · meteofrance_arpege_europe 3,6 · gfs_seamless 3,7 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.13 · meteofrance_wave 0.15 · ecmwf_wam025 0.16 · gwam 0.17 · ncep_gfswave025 1.15 |
| 03404 | ncep_gfswave025 0.12 · ecmwf_wam025 0.14 · gwam 0.14 · meteofrance_wave 0.15 · ewam 0.17 |
| 01101 | ecmwf_wam025 0.11 · gwam 0.14 · ncep_gfswave025 0.15 · ewam 0.19 · meteofrance_wave 0.20 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 13.93, ×1.08 (MAE 0.21 m, n 181) ; ecmwf_wam025 poids 11.88, ×1.05 (MAE 0.21 m, n 181) ; ewam poids 16.4, ×0.98 (MAE 0.14 m, n 181) ; gwam poids 8.53, ×0.95 (MAE 0.17 m, n 181) ; copernicus poids 26.85, ×0.95 (MAE 0.11 m, n 97)
  - 03404 : meteofrance_wave poids 15.7, ×1.09 (MAE 0.19 m, n 115) ; ecmwf_wam025 poids 15.78, ×1.06 (MAE 0.15 m, n 115) ; ewam poids 16.94, ×0.96 (MAE 0.14 m, n 115) ; gwam poids 11.22, ×0.97 (MAE 0.12 m, n 115) ; ncep_gfswave025 poids 10.26, ×1.01 (MAE 0.14 m, n 115) ; copernicus poids 24.6, ×0.96 (MAE 0.13 m, n 31)
  - 01102 : meteofrance_wave poids —, ×— (MAE 0.44 m, n 29) ; ecmwf_wam025 poids —, ×— (MAE 0.16 m, n 29) ; ewam poids —, ×— (MAE 0.18 m, n 29) ; gwam poids —, ×— (MAE 0.45 m, n 29)
  - 01101 : meteofrance_wave poids 12.52, ×1.23 (MAE 0.24 m, n 183) ; ecmwf_wam025 poids 16.95, ×0.93 (MAE 0.14 m, n 183) ; ewam poids 12.97, ×0.95 (MAE 0.19 m, n 183) ; gwam poids 9.94, ×0.96 (MAE 0.14 m, n 183) ; ncep_gfswave025 poids 9.36, ×0.93 (MAE 0.16 m, n 183) ; copernicus poids 24.99, ×0.94 (MAE 0.13 m, n 99)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.03, Port Camargue × 0.99 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

15 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 1,9 nd (n 13) · icon_d2 2,0 nd (n 13) · icon_eu 2,2 nd (n 13) · meteofrance_arome_france 2,4 nd (n 13) · meteofrance_arome_france_hd 2,5 nd (n 13) · ecmwf_ifs025 2,7 nd (n 13) · gfs_seamless 3,1 nd (n 13)
- LFMP : ecmwf_ifs025 2,0 nd (n 13) · meteofrance_arome_france 2,0 nd (n 13) · meteofrance_arome_france_hd 2,1 nd (n 13) · icon_eu 2,3 nd (n 13) · gfs_seamless 2,3 nd (n 13) · meteofrance_arpege_europe 4,4 nd (n 13)
- LFTH : icon_eu 1,9 nd (n 13) · meteofrance_arome_france 2,3 nd (n 13) · meteofrance_arome_france_hd 2,3 nd (n 13) · ecmwf_ifs025 2,5 nd (n 13) · gfs_seamless 3,2 nd (n 13) · meteofrance_arpege_europe 3,2 nd (n 13)
- LFML : ecmwf_ifs025 1,8 nd (n 7) · icon_eu 2,7 nd (n 7) · meteofrance_arome_france 2,8 nd (n 7) · meteofrance_arome_france_hd 2,8 nd (n 7) · meteofrance_arpege_europe 2,9 nd (n 7) · gfs_seamless 4,9 nd (n 7)
