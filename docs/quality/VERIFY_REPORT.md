# Remise en question (③)

Généré le 2026-11-15 17:10 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 35 prévisions archivées sur 135 h ; 3355 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | icon_d2 2,5 · meteofrance_arpege_europe 2,6 · icon_eu 2,6 · meteofrance_arome_france_hd 2,8 · meteofrance_arome_france 2,8 · gfs_seamless 3,5 · ecmwf_ifs025 3,6 |
| LFMP | icon_eu 1,5 · gfs_seamless 1,6 · meteofrance_arome_france 1,7 · meteofrance_arome_france_hd 1,7 · ecmwf_ifs025 1,8 · meteofrance_arpege_europe 2,1 |
| LFTH | ecmwf_ifs025 2,2 · icon_eu 2,8 · meteofrance_arpege_europe 4,1 · gfs_seamless 4,1 · meteofrance_arome_france_hd 4,8 · meteofrance_arome_france 4,8 |
| LFML | meteofrance_arome_france 2,1 · meteofrance_arome_france_hd 2,2 · ecmwf_ifs025 2,5 · icon_eu 2,6 · meteofrance_arpege_europe 2,8 · gfs_seamless 5,6 |
| LFMI | meteofrance_arome_france_hd 2,4 · meteofrance_arome_france 2,4 · meteofrance_arpege_europe 2,6 · ecmwf_ifs025 2,9 · icon_eu 3,2 · gfs_seamless 3,5 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.30 · meteofrance_wave 0.33 · ecmwf_wam025 0.42 · gwam 0.56 · ncep_gfswave025 1.12 |
| 03404 | ewam 0.17 · gwam 0.24 · ncep_gfswave025 0.25 · meteofrance_wave 0.27 · ecmwf_wam025 0.33 |
| 01101 | meteofrance_wave 0.16 · ewam 0.19 · ncep_gfswave025 0.26 · ecmwf_wam025 0.27 · gwam 0.34 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 10.15, ×0.94 (MAE 0.28 m, n 177) ; ecmwf_wam025 poids 6.17, ×0.86 (MAE 0.35 m, n 177) ; ewam poids 8.53, ×0.85 (MAE 0.28 m, n 177) ; gwam poids 2.12, ×0.8 (MAE 0.49 m, n 177) ; copernicus poids 9.08, ×0.86 (MAE 0.34 m, n 102)
  - 03404 : meteofrance_wave poids 11.13, ×1.05 (MAE 0.26 m, n 162) ; ecmwf_wam025 poids 7.79, ×0.95 (MAE 0.3 m, n 162) ; ewam poids 13.5, ×0.95 (MAE 0.18 m, n 162) ; gwam poids 6.33, ×0.89 (MAE 0.23 m, n 162) ; ncep_gfswave025 poids 6.4, ×1.05 (MAE 0.23 m, n 162) ; copernicus poids 25.17, ×0.99 (MAE 0.13 m, n 102)
  - 01102 : 
  - 01101 : meteofrance_wave poids 17.23, ×1.12 (MAE 0.17 m, n 179) ; ecmwf_wam025 poids 9.03, ×0.84 (MAE 0.27 m, n 179) ; ewam poids 10.6, ×0.9 (MAE 0.23 m, n 179) ; gwam poids 3.86, ×0.81 (MAE 0.34 m, n 179) ; ncep_gfswave025 poids 5.27, ×0.93 (MAE 0.27 m, n 179) ; copernicus poids 24.52, ×0.96 (MAE 0.13 m, n 102)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.11, Port Camargue × 1.09 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

35 prévisions archivées. Classement à 24 h :

- LFMT : icon_d2 2,0 nd (n 11) · meteofrance_arome_france 2,1 nd (n 11) · meteofrance_arpege_europe 2,4 nd (n 11) · meteofrance_arome_france_hd 2,4 nd (n 11) · gfs_seamless 2,7 nd (n 11) · icon_eu 2,7 nd (n 11) · ecmwf_ifs025 3,6 nd (n 11)
- LFMP : gfs_seamless 1,3 nd (n 11) · meteofrance_arpege_europe 1,3 nd (n 11) · icon_eu 1,5 nd (n 11) · ecmwf_ifs025 1,7 nd (n 11) · meteofrance_arome_france 1,7 nd (n 11) · meteofrance_arome_france_hd 1,8 nd (n 11)
- LFTH : icon_eu 2,4 nd (n 11) · ecmwf_ifs025 3,1 nd (n 11) · meteofrance_arpege_europe 3,4 nd (n 11) · gfs_seamless 4,7 nd (n 11) · meteofrance_arome_france_hd 5,3 nd (n 11) · meteofrance_arome_france 5,3 nd (n 11)
- LFML : icon_eu 2,6 nd (n 11) · meteofrance_arome_france 2,8 nd (n 11) · meteofrance_arome_france_hd 3,0 nd (n 11) · meteofrance_arpege_europe 3,0 nd (n 11) · ecmwf_ifs025 3,2 nd (n 11) · gfs_seamless 6,1 nd (n 11)
- LFMI : 
