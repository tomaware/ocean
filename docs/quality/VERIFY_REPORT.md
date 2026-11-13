# Remise en question (③)

Généré le 2026-11-13 10:39 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 20 prévisions archivées sur 81 h ; 2139 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 1,7 · gfs_seamless 1,8 · meteofrance_arome_france_hd 1,9 · icon_eu 2,4 · icon_d2 2,5 · meteofrance_arpege_europe 2,7 · ecmwf_ifs025 3,0 |
| LFMP | meteofrance_arome_france_hd 2,1 · meteofrance_arome_france 2,1 · ecmwf_ifs025 2,5 · icon_eu 3,0 · meteofrance_arpege_europe 3,1 · gfs_seamless 3,2 |
| LFTH | icon_eu 2,0 · meteofrance_arome_france_hd 2,9 · meteofrance_arome_france 2,9 · meteofrance_arpege_europe 3,2 · gfs_seamless 3,2 · ecmwf_ifs025 4,2 |
| LFML | meteofrance_arome_france_hd 2,2 · meteofrance_arome_france 2,3 · icon_eu 2,6 · ecmwf_ifs025 2,8 · meteofrance_arpege_europe 3,9 · gfs_seamless 5,1 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.10 · ewam 0.11 · ecmwf_wam025 0.16 · gwam 0.22 · ncep_gfswave025 0.97 |
| 03404 | meteofrance_wave 0.15 · ewam 0.20 · ncep_gfswave025 0.20 · ecmwf_wam025 0.22 · gwam 0.31 |
| 01101 | meteofrance_wave 0.16 · ecmwf_wam025 0.22 · ewam 0.22 · ncep_gfswave025 0.22 · gwam 0.31 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 21.38, ×0.98 (MAE 0.13 m, n 163) ; ecmwf_wam025 poids 14.33, ×0.93 (MAE 0.17 m, n 163) ; ewam poids 17.26, ×0.93 (MAE 0.13 m, n 163) ; gwam poids 6.4, ×0.87 (MAE 0.23 m, n 163) ; copernicus poids 25.8, ×0.99 (MAE 0.12 m, n 97)
  - 03404 : meteofrance_wave poids 16.72, ×0.98 (MAE 0.18 m, n 97) ; ecmwf_wam025 poids 11.61, ×0.95 (MAE 0.21 m, n 97) ; ewam poids 12.44, ×0.91 (MAE 0.2 m, n 97) ; gwam poids 5.72, ×0.88 (MAE 0.25 m, n 97) ; ncep_gfswave025 poids 8.99, ×0.92 (MAE 0.16 m, n 97) ; copernicus poids 22.08, ×0.95 (MAE 0.15 m, n 52)
  - 01102 : 
  - 01101 : meteofrance_wave poids 16.32, ×1.1 (MAE 0.18 m, n 165) ; ecmwf_wam025 poids 12.26, ×0.87 (MAE 0.2 m, n 165) ; ewam poids 12.25, ×0.92 (MAE 0.2 m, n 165) ; gwam poids 5.1, ×0.83 (MAE 0.28 m, n 165) ; ncep_gfswave025 poids 7.23, ×0.85 (MAE 0.21 m, n 165) ; copernicus poids 20.5, ×0.89 (MAE 0.17 m, n 99)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.99, Port Camargue × 0.97 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

20 prévisions archivées. Classement à 24 h :

- LFMT : icon_d2 2,2 nd (n 11) · meteofrance_arpege_europe 2,3 nd (n 11) · icon_eu 2,4 nd (n 11) · meteofrance_arome_france 2,9 nd (n 11) · ecmwf_ifs025 3,0 nd (n 11) · meteofrance_arome_france_hd 3,1 nd (n 11) · gfs_seamless 3,3 nd (n 11)
- LFMP : meteofrance_arome_france_hd 2,1 nd (n 11) · meteofrance_arome_france 2,1 nd (n 11) · icon_eu 2,7 nd (n 11) · ecmwf_ifs025 3,0 nd (n 11) · gfs_seamless 3,7 nd (n 11) · meteofrance_arpege_europe 5,0 nd (n 11)
- LFTH : icon_eu 1,8 nd (n 11) · meteofrance_arome_france 2,7 nd (n 11) · meteofrance_arome_france_hd 2,8 nd (n 11) · gfs_seamless 2,9 nd (n 11) · ecmwf_ifs025 3,3 nd (n 11) · meteofrance_arpege_europe 3,6 nd (n 11)
- LFML : ecmwf_ifs025 1,8 nd (n 8) · icon_eu 2,5 nd (n 8) · meteofrance_arpege_europe 3,3 nd (n 8) · meteofrance_arome_france 3,4 nd (n 8) · meteofrance_arome_france_hd 3,4 nd (n 8) · gfs_seamless 5,4 nd (n 8)
