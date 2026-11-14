# Remise en question (③)

Généré le 2026-11-14 04:32 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 25 prévisions archivées sur 99 h ; 2463 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | meteofrance_arome_france 2,1 · gfs_seamless 2,1 · meteofrance_arome_france_hd 2,4 · icon_d2 2,8 · meteofrance_arpege_europe 2,9 · ecmwf_ifs025 3,0 · icon_eu 3,1 |
| LFMP | meteofrance_arome_france_hd 2,1 · meteofrance_arome_france 2,2 · ecmwf_ifs025 2,8 · meteofrance_arpege_europe 3,1 · icon_eu 3,3 · gfs_seamless 3,4 |
| LFTH | icon_eu 2,1 · meteofrance_arome_france_hd 2,4 · meteofrance_arome_france 2,4 · meteofrance_arpege_europe 2,8 · gfs_seamless 3,1 · ecmwf_ifs025 4,0 |
| LFML | meteofrance_arome_france_hd 2,3 · meteofrance_arome_france 2,6 · icon_eu 3,0 · ecmwf_ifs025 3,4 · gfs_seamless 4,3 · meteofrance_arpege_europe 4,3 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.14 · meteofrance_wave 0.16 · ecmwf_wam025 0.26 · gwam 0.34 · ncep_gfswave025 0.94 |
| 03404 | meteofrance_wave 0.16 · ncep_gfswave025 0.17 · ewam 0.22 · ecmwf_wam025 0.26 · gwam 0.32 |
| 01101 | meteofrance_wave 0.14 · ewam 0.23 · ncep_gfswave025 0.23 · ecmwf_wam025 0.29 · gwam 0.35 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 18.98, ×0.92 (MAE 0.15 m, n 145) ; ecmwf_wam025 poids 9.96, ×0.85 (MAE 0.25 m, n 145) ; ewam poids 17.3, ×0.91 (MAE 0.13 m, n 145) ; gwam poids 4.18, ×0.81 (MAE 0.32 m, n 145) ; copernicus poids 24.48, ×0.97 (MAE 0.13 m, n 97)
  - 03404 : meteofrance_wave poids 18.61, ×0.91 (MAE 0.16 m, n 82) ; ecmwf_wam025 poids 9.25, ×0.86 (MAE 0.26 m, n 82) ; ewam poids 11.46, ×0.92 (MAE 0.22 m, n 82) ; gwam poids 4.29, ×0.83 (MAE 0.32 m, n 82) ; ncep_gfswave025 poids 8.83, ×0.91 (MAE 0.17 m, n 82) ; copernicus poids 25.29, ×0.95 (MAE 0.12 m, n 82)
  - 01102 : 
  - 01101 : meteofrance_wave poids 20.63, ×1.06 (MAE 0.13 m, n 147) ; ecmwf_wam025 poids 8.98, ×0.81 (MAE 0.27 m, n 147) ; ewam poids 11.01, ×0.89 (MAE 0.23 m, n 147) ; gwam poids 4.03, ×0.8 (MAE 0.33 m, n 147) ; ncep_gfswave025 poids 7.04, ×0.83 (MAE 0.21 m, n 147) ; copernicus poids 17.3, ×0.88 (MAE 0.2 m, n 99)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.07, Port Camargue × 1.04 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

25 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 1,9 nd (n 9) · icon_d2 2,9 nd (n 9) · icon_eu 3,0 nd (n 9) · meteofrance_arome_france 3,1 nd (n 9) · meteofrance_arome_france_hd 3,3 nd (n 9) · ecmwf_ifs025 3,3 nd (n 9) · gfs_seamless 3,6 nd (n 9)
- LFMP : meteofrance_arome_france 2,2 nd (n 9) · meteofrance_arome_france_hd 2,2 nd (n 9) · icon_eu 3,4 nd (n 9) · gfs_seamless 3,9 nd (n 9) · ecmwf_ifs025 3,9 nd (n 9) · meteofrance_arpege_europe 5,1 nd (n 9)
- LFTH : icon_eu 2,0 nd (n 9) · meteofrance_arome_france_hd 2,3 nd (n 9) · meteofrance_arome_france 2,3 nd (n 9) · ecmwf_ifs025 2,9 nd (n 9) · meteofrance_arpege_europe 3,4 nd (n 9) · gfs_seamless 3,6 nd (n 9)
- LFML : ecmwf_ifs025 1,9 nd (n 9) · icon_eu 2,4 nd (n 9) · meteofrance_arome_france_hd 3,3 nd (n 9) · meteofrance_arome_france 3,4 nd (n 9) · gfs_seamless 4,8 nd (n 9) · meteofrance_arpege_europe 5,1 nd (n 9)
