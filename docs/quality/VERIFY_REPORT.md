# Remise en question (③)

Généré le 2026-11-14 09:26 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 26 prévisions archivées sur 105 h ; 2661 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | gfs_seamless 2,0 · meteofrance_arome_france 2,1 · meteofrance_arome_france_hd 2,3 · icon_d2 2,6 · ecmwf_ifs025 2,6 · meteofrance_arpege_europe 2,7 · icon_eu 2,9 |
| LFMP | meteofrance_arome_france_hd 2,0 · meteofrance_arome_france 2,1 · ecmwf_ifs025 2,8 · icon_eu 3,1 · meteofrance_arpege_europe 3,2 · gfs_seamless 3,2 |
| LFTH | icon_eu 2,1 · meteofrance_arome_france_hd 2,5 · meteofrance_arome_france 2,5 · meteofrance_arpege_europe 2,8 · gfs_seamless 3,0 · ecmwf_ifs025 4,0 |
| LFML | meteofrance_arome_france_hd 2,2 · meteofrance_arome_france 2,4 · icon_eu 2,7 · ecmwf_ifs025 3,4 · meteofrance_arpege_europe 4,0 · gfs_seamless 4,2 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.15 · meteofrance_wave 0.19 · ecmwf_wam025 0.30 · gwam 0.38 · ncep_gfswave025 0.89 |
| 03404 | meteofrance_wave 0.14 · ncep_gfswave025 0.15 · ewam 0.20 · ecmwf_wam025 0.26 · gwam 0.29 |
| 01101 | meteofrance_wave 0.15 · ewam 0.22 · ncep_gfswave025 0.25 · ecmwf_wam025 0.28 · gwam 0.35 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 17.63, ×0.91 (MAE 0.17 m, n 161) ; ecmwf_wam025 poids 8.71, ×0.84 (MAE 0.27 m, n 161) ; ewam poids 17.3, ×0.91 (MAE 0.13 m, n 161) ; gwam poids 3.84, ×0.8 (MAE 0.34 m, n 161) ; copernicus poids 19.89, ×0.96 (MAE 0.17 m, n 102)
  - 03404 : meteofrance_wave poids 19.99, ×0.92 (MAE 0.14 m, n 98) ; ecmwf_wam025 poids 9.26, ×0.84 (MAE 0.26 m, n 98) ; ewam poids 12.42, ×0.94 (MAE 0.2 m, n 98) ; gwam poids 4.97, ×0.82 (MAE 0.28 m, n 98) ; ncep_gfswave025 poids 0.48, ×0.92 (MAE 0.15 m, n 98) ; copernicus poids 24.1, ×0.93 (MAE 0.13 m, n 98)
  - 01102 : 
  - 01101 : meteofrance_wave poids 19.22, ×1.09 (MAE 0.15 m, n 163) ; ecmwf_wam025 poids 9.92, ×0.82 (MAE 0.25 m, n 163) ; ewam poids 11.35, ×0.91 (MAE 0.22 m, n 163) ; gwam poids 4.24, ×0.8 (MAE 0.32 m, n 163) ; ncep_gfswave025 poids 6.73, ×0.87 (MAE 0.22 m, n 163) ; copernicus poids 20.4, ×0.9 (MAE 0.17 m, n 103)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.12, Port Camargue × 1.01 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

26 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 2,4 nd (n 9) · icon_d2 2,6 nd (n 9) · ecmwf_ifs025 2,6 nd (n 9) · icon_eu 2,8 nd (n 9) · meteofrance_arome_france_hd 3,2 nd (n 9) · meteofrance_arome_france 3,3 nd (n 9) · gfs_seamless 3,4 nd (n 9)
- LFMP : meteofrance_arome_france 1,6 nd (n 9) · meteofrance_arome_france_hd 1,7 nd (n 9) · meteofrance_arpege_europe 3,3 nd (n 9) · icon_eu 3,3 nd (n 9) · gfs_seamless 3,4 nd (n 9) · ecmwf_ifs025 3,5 nd (n 9)
- LFTH : icon_eu 2,4 nd (n 9) · meteofrance_arome_france_hd 3,1 nd (n 9) · meteofrance_arome_france 3,1 nd (n 9) · ecmwf_ifs025 3,1 nd (n 9) · meteofrance_arpege_europe 3,3 nd (n 9) · gfs_seamless 4,3 nd (n 9)
- LFML : icon_eu 1,8 nd (n 9) · ecmwf_ifs025 2,0 nd (n 9) · meteofrance_arome_france_hd 2,9 nd (n 9) · meteofrance_arome_france 3,1 nd (n 9) · gfs_seamless 5,4 nd (n 9) · meteofrance_arpege_europe 5,9 nd (n 9)
