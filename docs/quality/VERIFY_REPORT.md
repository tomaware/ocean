# Remise en question (③)

Généré le 2026-11-13 06:43 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 19 prévisions archivées sur 78 h ; 2082 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 1,7 · gfs_seamless 1,7 · meteofrance_arome_france_hd 1,8 · icon_eu 2,3 · icon_d2 2,5 · meteofrance_arpege_europe 2,6 · ecmwf_ifs025 3,0 |
| LFMP | meteofrance_arome_france_hd 2,1 · meteofrance_arome_france 2,1 · ecmwf_ifs025 2,4 · icon_eu 2,8 · meteofrance_arpege_europe 3,1 · gfs_seamless 3,1 |
| LFTH | icon_eu 2,1 · meteofrance_arome_france 3,0 · meteofrance_arome_france_hd 3,0 · gfs_seamless 3,1 · meteofrance_arpege_europe 3,4 · ecmwf_ifs025 4,2 |
| LFML | meteofrance_arome_france_hd 2,3 · meteofrance_arome_france 2,3 · icon_eu 2,5 · ecmwf_ifs025 2,5 · meteofrance_arpege_europe 3,9 · gfs_seamless 4,7 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.10 · ewam 0.12 · ecmwf_wam025 0.15 · gwam 0.21 · ncep_gfswave025 0.98 |
| 03404 | meteofrance_wave 0.14 · ncep_gfswave025 0.19 · ecmwf_wam025 0.20 · ewam 0.21 · gwam 0.28 |
| 01101 | meteofrance_wave 0.17 · ecmwf_wam025 0.20 · ncep_gfswave025 0.21 · ewam 0.22 · gwam 0.27 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 21.18, ×0.98 (MAE 0.13 m, n 155) ; ecmwf_wam025 poids 15.2, ×0.94 (MAE 0.16 m, n 155) ; ewam poids 16.95, ×0.93 (MAE 0.14 m, n 155) ; gwam poids 6.74, ×0.87 (MAE 0.22 m, n 155) ; copernicus poids 26.48, ×0.99 (MAE 0.11 m, n 101)
  - 03404 : meteofrance_wave poids 16.36, ×0.99 (MAE 0.18 m, n 89) ; ecmwf_wam025 poids 11.7, ×0.95 (MAE 0.21 m, n 89) ; ewam poids 12.07, ×0.91 (MAE 0.21 m, n 89) ; gwam poids 5.99, ×0.89 (MAE 0.25 m, n 89) ; ncep_gfswave025 poids 9.05, ×0.93 (MAE 0.16 m, n 89) ; copernicus poids 22.02, ×0.95 (MAE 0.15 m, n 44)
  - 01102 : 
  - 01101 : meteofrance_wave poids 16, ×1.11 (MAE 0.19 m, n 157) ; ecmwf_wam025 poids 12.93, ×0.88 (MAE 0.19 m, n 157) ; ewam poids 11.94, ×0.92 (MAE 0.21 m, n 157) ; gwam poids 5.64, ×0.85 (MAE 0.26 m, n 157) ; ncep_gfswave025 poids 7.46, ×0.86 (MAE 0.2 m, n 157) ; copernicus poids 21.12, ×0.91 (MAE 0.16 m, n 103)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.01, Port Camargue × 0.92 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

19 prévisions archivées. Classement à 24 h :

- LFMT : icon_d2 2,1 nd (n 12) · meteofrance_arpege_europe 2,2 nd (n 12) · icon_eu 2,3 nd (n 12) · meteofrance_arome_france 2,8 nd (n 12) · ecmwf_ifs025 2,9 nd (n 12) · meteofrance_arome_france_hd 3,0 nd (n 12) · gfs_seamless 3,2 nd (n 12)
- LFMP : meteofrance_arome_france 2,1 nd (n 12) · meteofrance_arome_france_hd 2,2 nd (n 12) · icon_eu 2,6 nd (n 12) · ecmwf_ifs025 2,9 nd (n 12) · gfs_seamless 3,6 nd (n 12) · meteofrance_arpege_europe 4,9 nd (n 12)
- LFTH : icon_eu 1,8 nd (n 12) · meteofrance_arome_france 2,6 nd (n 12) · meteofrance_arome_france_hd 2,6 nd (n 12) · gfs_seamless 3,0 nd (n 12) · ecmwf_ifs025 3,1 nd (n 12) · meteofrance_arpege_europe 3,5 nd (n 12)
- LFML : ecmwf_ifs025 1,8 nd (n 8) · icon_eu 2,5 nd (n 8) · meteofrance_arpege_europe 3,3 nd (n 8) · meteofrance_arome_france 3,4 nd (n 8) · meteofrance_arome_france_hd 3,4 nd (n 8) · gfs_seamless 5,4 nd (n 8)
