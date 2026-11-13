# Remise en question (③)

Généré le 2026-11-13 09:38 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 20 prévisions archivées sur 81 h ; 2079 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 1,7 · gfs_seamless 1,8 · meteofrance_arome_france_hd 1,9 · icon_eu 2,4 · icon_d2 2,5 · meteofrance_arpege_europe 2,7 · ecmwf_ifs025 3,0 |
| LFMP | meteofrance_arome_france_hd 2,1 · meteofrance_arome_france 2,1 · ecmwf_ifs025 2,4 · icon_eu 2,9 · meteofrance_arpege_europe 3,1 · gfs_seamless 3,1 |
| LFTH | icon_eu 2,0 · meteofrance_arome_france_hd 2,9 · meteofrance_arome_france 2,9 · meteofrance_arpege_europe 3,1 · gfs_seamless 3,2 · ecmwf_ifs025 4,2 |
| LFML | meteofrance_arome_france_hd 2,2 · meteofrance_arome_france 2,4 · icon_eu 2,5 · ecmwf_ifs025 2,8 · meteofrance_arpege_europe 3,9 · gfs_seamless 5,0 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.10 · ewam 0.11 · ecmwf_wam025 0.16 · gwam 0.21 · ncep_gfswave025 0.97 |
| 03404 | meteofrance_wave 0.15 · ncep_gfswave025 0.20 · ewam 0.21 · ecmwf_wam025 0.22 · gwam 0.30 |
| 01101 | meteofrance_wave 0.17 · ecmwf_wam025 0.21 · ewam 0.22 · ncep_gfswave025 0.22 · gwam 0.29 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 21.3, ×0.98 (MAE 0.13 m, n 158) ; ecmwf_wam025 poids 14.8, ×0.94 (MAE 0.17 m, n 158) ; ewam poids 17.1, ×0.93 (MAE 0.14 m, n 158) ; gwam poids 6.61, ×0.87 (MAE 0.23 m, n 158) ; copernicus poids 26.74, ×0.99 (MAE 0.11 m, n 104)
  - 03404 : meteofrance_wave poids 16.3, ×0.98 (MAE 0.18 m, n 92) ; ecmwf_wam025 poids 11.53, ×0.95 (MAE 0.22 m, n 92) ; ewam poids 12.07, ×0.91 (MAE 0.21 m, n 92) ; gwam poids 5.73, ×0.89 (MAE 0.25 m, n 92) ; ncep_gfswave025 poids 8.83, ×0.92 (MAE 0.17 m, n 92) ; copernicus poids 21.38, ×0.95 (MAE 0.16 m, n 47)
  - 01102 : 
  - 01101 : meteofrance_wave poids 16.03, ×1.11 (MAE 0.19 m, n 160) ; ecmwf_wam025 poids 12.72, ×0.88 (MAE 0.2 m, n 160) ; ewam poids 11.99, ×0.92 (MAE 0.21 m, n 160) ; gwam poids 5.39, ×0.84 (MAE 0.27 m, n 160) ; ncep_gfswave025 poids 7.3, ×0.86 (MAE 0.21 m, n 160) ; copernicus poids 20.83, ×0.91 (MAE 0.16 m, n 106)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1, Port Camargue × 1 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

20 prévisions archivées. Classement à 24 h :

- LFMT : icon_d2 2,2 nd (n 11) · meteofrance_arpege_europe 2,3 nd (n 11) · icon_eu 2,4 nd (n 11) · meteofrance_arome_france 2,9 nd (n 11) · ecmwf_ifs025 3,0 nd (n 11) · meteofrance_arome_france_hd 3,1 nd (n 11) · gfs_seamless 3,3 nd (n 11)
- LFMP : meteofrance_arome_france_hd 2,1 nd (n 11) · meteofrance_arome_france 2,1 nd (n 11) · icon_eu 2,7 nd (n 11) · ecmwf_ifs025 3,0 nd (n 11) · gfs_seamless 3,7 nd (n 11) · meteofrance_arpege_europe 5,0 nd (n 11)
- LFTH : icon_eu 1,8 nd (n 11) · meteofrance_arome_france 2,7 nd (n 11) · meteofrance_arome_france_hd 2,8 nd (n 11) · gfs_seamless 2,9 nd (n 11) · ecmwf_ifs025 3,3 nd (n 11) · meteofrance_arpege_europe 3,6 nd (n 11)
- LFML : ecmwf_ifs025 1,8 nd (n 8) · icon_eu 2,5 nd (n 8) · meteofrance_arpege_europe 3,3 nd (n 8) · meteofrance_arome_france 3,4 nd (n 8) · meteofrance_arome_france_hd 3,4 nd (n 8) · gfs_seamless 5,4 nd (n 8)
