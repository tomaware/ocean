# Remise en question (③)

Généré le 2026-11-18 11:39 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 49 prévisions archivées sur 201 h ; 4585 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | icon_eu 1,8 · meteofrance_arome_france 1,9 · meteofrance_arome_france_hd 1,9 · icon_d2 2,1 · gfs_seamless 2,2 · meteofrance_arpege_europe 2,3 · ecmwf_ifs025 2,4 |
| LFMP | meteofrance_arome_france_hd 2,0 · meteofrance_arome_france 2,1 · icon_eu 2,2 · meteofrance_arpege_europe 2,2 · ecmwf_ifs025 2,4 · gfs_seamless 2,7 |
| LFTH | meteofrance_arome_france_hd 2,3 · meteofrance_arome_france 2,3 · icon_eu 2,4 · gfs_seamless 2,6 · ecmwf_ifs025 2,7 · meteofrance_arpege_europe 2,8 |
| LFML | ecmwf_ifs025 2,3 · meteofrance_arome_france 2,4 · meteofrance_arome_france_hd 2,5 · meteofrance_arpege_europe 2,7 · icon_eu 2,9 · gfs_seamless 3,4 |
| LFMI | meteofrance_arome_france 1,7 · meteofrance_arome_france_hd 1,8 · ecmwf_ifs025 2,0 · meteofrance_arpege_europe 2,2 · gfs_seamless 2,4 · icon_eu 2,4 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.18 · ewam 0.18 · ecmwf_wam025 0.26 · gwam 0.28 · ncep_gfswave025 0.86 |
| 03404 | ewam 0.12 · ncep_gfswave025 0.13 · meteofrance_wave 0.14 · gwam 0.15 · ecmwf_wam025 0.16 |
| 01101 | ncep_gfswave025 0.12 · ewam 0.14 · meteofrance_wave 0.15 · ecmwf_wam025 0.15 · gwam 0.15 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 15.49, ×0.93 (MAE 0.19 m, n 168) ; ecmwf_wam025 poids 8.09, ×0.85 (MAE 0.29 m, n 168) ; ewam poids 8.7, ×0.88 (MAE 0.27 m, n 168) ; gwam poids 3.22, ×0.8 (MAE 0.38 m, n 168) ; copernicus poids 16.28, ×0.86 (MAE 0.21 m, n 102)
  - 03404 : meteofrance_wave poids 14.12, ×1.09 (MAE 0.21 m, n 168) ; ecmwf_wam025 poids 12.07, ×0.99 (MAE 0.21 m, n 168) ; ewam poids 17.74, ×0.99 (MAE 0.13 m, n 168) ; gwam poids 9.5, ×0.96 (MAE 0.15 m, n 168) ; ncep_gfswave025 poids 8.74, ×1.06 (MAE 0.17 m, n 168) ; copernicus poids 22.85, ×0.93 (MAE 0.15 m, n 102)
  - 01102 : 
  - 01101 : meteofrance_wave poids 16.92, ×1.22 (MAE 0.18 m, n 168) ; ecmwf_wam025 poids 15.95, ×0.92 (MAE 0.15 m, n 168) ; ewam poids 15.6, ×1.02 (MAE 0.16 m, n 168) ; gwam poids 8.49, ×0.91 (MAE 0.18 m, n 168) ; ncep_gfswave025 poids 10.4, ×1.01 (MAE 0.13 m, n 168) ; copernicus poids 27.18, ×0.99 (MAE 0.11 m, n 102)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.98, Port Camargue × 1.02 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

49 prévisions archivées. Classement à 24 h :

- LFMT : icon_d2 1,3 nd (n 10) · icon_eu 1,4 nd (n 10) · meteofrance_arome_france_hd 1,6 nd (n 10) · meteofrance_arome_france 1,7 nd (n 10) · gfs_seamless 1,8 nd (n 10) · meteofrance_arpege_europe 2,1 nd (n 10) · ecmwf_ifs025 3,1 nd (n 10)
- LFMP : ecmwf_ifs025 2,2 nd (n 10) · meteofrance_arome_france_hd 2,4 nd (n 10) · meteofrance_arome_france 2,4 nd (n 10) · icon_eu 2,9 nd (n 10) · gfs_seamless 3,1 nd (n 10) · meteofrance_arpege_europe 3,2 nd (n 10)
- LFTH : icon_eu 2,4 nd (n 10) · ecmwf_ifs025 2,6 nd (n 10) · meteofrance_arome_france_hd 3,1 nd (n 10) · meteofrance_arome_france 3,1 nd (n 10) · gfs_seamless 3,1 nd (n 10) · meteofrance_arpege_europe 4,3 nd (n 10)
- LFML : meteofrance_arome_france_hd 2,2 nd (n 10) · meteofrance_arome_france 2,3 nd (n 10) · meteofrance_arpege_europe 2,6 nd (n 10) · ecmwf_ifs025 2,7 nd (n 10) · icon_eu 3,4 nd (n 10) · gfs_seamless 4,0 nd (n 10)
- LFMI : icon_eu 2,2 nd (n 10) · meteofrance_arome_france_hd 2,5 nd (n 10) · meteofrance_arome_france 2,5 nd (n 10) · ecmwf_ifs025 2,6 nd (n 10) · gfs_seamless 2,6 nd (n 10) · meteofrance_arpege_europe 3,1 nd (n 10)
