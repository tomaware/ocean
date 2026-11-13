# Remise en question (③)

Généré le 2026-11-13 22:10 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 23 prévisions archivées sur 93 h ; 2380 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 2,1 · gfs_seamless 2,2 · meteofrance_arome_france_hd 2,4 · icon_d2 2,9 · meteofrance_arpege_europe 3,0 · icon_eu 3,1 · ecmwf_ifs025 3,4 |
| LFMP | meteofrance_arome_france_hd 2,2 · meteofrance_arome_france 2,3 · ecmwf_ifs025 2,8 · icon_eu 3,2 · gfs_seamless 3,4 · meteofrance_arpege_europe 3,5 |
| LFTH | icon_eu 2,1 · meteofrance_arome_france_hd 2,8 · meteofrance_arome_france 2,8 · gfs_seamless 3,1 · meteofrance_arpege_europe 3,1 · ecmwf_ifs025 4,0 |
| LFML | meteofrance_arome_france_hd 2,4 · meteofrance_arome_france 2,6 · icon_eu 3,0 · ecmwf_ifs025 3,3 · meteofrance_arpege_europe 4,7 · gfs_seamless 4,9 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.11 · ewam 0.13 · ecmwf_wam025 0.23 · gwam 0.30 · ncep_gfswave025 0.94 |
| 03404 | meteofrance_wave 0.14 · ncep_gfswave025 0.18 · ewam 0.22 · ecmwf_wam025 0.26 · gwam 0.34 |
| 01101 | meteofrance_wave 0.13 · ncep_gfswave025 0.22 · ewam 0.23 · ecmwf_wam025 0.27 · gwam 0.34 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 21.08, ×0.97 (MAE 0.13 m, n 187) ; ecmwf_wam025 poids 11.26, ×0.89 (MAE 0.22 m, n 187) ; ewam poids 16.81, ×0.92 (MAE 0.14 m, n 187) ; gwam poids 5.18, ×0.84 (MAE 0.28 m, n 187) ; copernicus poids 25.3, ×0.98 (MAE 0.12 m, n 97)
  - 03404 : meteofrance_wave poids 18.81, ×0.99 (MAE 0.15 m, n 121) ; ecmwf_wam025 poids 11.56, ×0.92 (MAE 0.22 m, n 121) ; ewam poids 13.43, ×0.92 (MAE 0.19 m, n 121) ; gwam poids 6.1, ×0.87 (MAE 0.24 m, n 121) ; ncep_gfswave025 poids 9.91, ×0.93 (MAE 0.14 m, n 121) ; copernicus poids 24.81, ×0.95 (MAE 0.13 m, n 76)
  - 01102 : 
  - 01101 : meteofrance_wave poids 18.5, ×1.12 (MAE 0.16 m, n 189) ; ecmwf_wam025 poids 11.47, ×0.85 (MAE 0.22 m, n 189) ; ewam poids 13.03, ×0.93 (MAE 0.19 m, n 189) ; gwam poids 5.22, ×0.82 (MAE 0.27 m, n 189) ; ncep_gfswave025 poids 7.81, ×0.85 (MAE 0.19 m, n 189) ; copernicus poids 17.96, ×0.87 (MAE 0.19 m, n 99)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.99, Port Camargue × 1.09 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

23 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 2,0 nd (n 9) · icon_d2 2,5 nd (n 9) · icon_eu 2,7 nd (n 9) · meteofrance_arome_france 2,9 nd (n 9) · ecmwf_ifs025 3,3 nd (n 9) · meteofrance_arome_france_hd 3,4 nd (n 9) · gfs_seamless 3,8 nd (n 9)
- LFMP : meteofrance_arome_france_hd 2,3 nd (n 9) · meteofrance_arome_france 2,4 nd (n 9) · icon_eu 3,3 nd (n 9) · ecmwf_ifs025 3,7 nd (n 9) · gfs_seamless 3,8 nd (n 9) · meteofrance_arpege_europe 6,5 nd (n 9)
- LFTH : icon_eu 1,8 nd (n 9) · meteofrance_arome_france 2,4 nd (n 9) · meteofrance_arome_france_hd 2,4 nd (n 9) · gfs_seamless 2,4 nd (n 9) · ecmwf_ifs025 2,9 nd (n 9) · meteofrance_arpege_europe 3,6 nd (n 9)
- LFML : ecmwf_ifs025 1,7 nd (n 9) · icon_eu 2,7 nd (n 9) · meteofrance_arome_france 3,5 nd (n 9) · meteofrance_arome_france_hd 3,7 nd (n 9) · meteofrance_arpege_europe 5,3 nd (n 9) · gfs_seamless 5,7 nd (n 9)
