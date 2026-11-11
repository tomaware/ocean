# Remise en question (③)

Généré le 2026-11-11 21:11 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 20 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 14 prévisions archivées sur 45 h ; 1514 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | gfs_seamless 1,2 · icon_eu 1,3 · meteofrance_arome_france 1,4 · icon_d2 1,5 · meteofrance_arpege_europe 1,5 · meteofrance_arome_france_hd 1,6 · ecmwf_ifs025 3,0 |
| LFMP | ecmwf_ifs025 1,1 · meteofrance_arome_france 1,3 · meteofrance_arome_france_hd 1,3 · meteofrance_arpege_europe 1,3 · icon_eu 1,4 · gfs_seamless 1,4 |
| LFTH | icon_eu 2,0 · ecmwf_ifs025 2,3 · meteofrance_arome_france_hd 2,7 · meteofrance_arome_france 2,7 · meteofrance_arpege_europe 3,4 · gfs_seamless 3,4 |
| LFML | meteofrance_arome_france_hd 1,9 · ecmwf_ifs025 2,0 · meteofrance_arome_france 2,0 · icon_eu 2,3 · meteofrance_arpege_europe 3,1 · gfs_seamless 3,8 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.16 · gwam 0.19 · meteofrance_wave 0.26 · ecmwf_wam025 0.26 · ncep_gfswave025 1.38 |
| 03404 | gwam 0.11 · ewam 0.14 · ncep_gfswave025 0.16 · ecmwf_wam025 0.18 · meteofrance_wave 0.23 |
| 01102 | ecmwf_wam025 0.16 · ewam 0.18 · meteofrance_wave 0.41 · gwam 0.44 · ncep_gfswave025 1.27 |
| 01101 | gwam 0.08 · ecmwf_wam025 0.12 · ncep_gfswave025 0.12 · ewam 0.14 · meteofrance_wave 0.25 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 9.72, ×1.15 (MAE 0.29 m, n 183) ; ecmwf_wam025 poids 8.85, ×1.11 (MAE 0.27 m, n 183) ; ewam poids 12.56, ×1.07 (MAE 0.2 m, n 183) ; gwam poids 6.78, ×1.03 (MAE 0.22 m, n 183) ; copernicus poids 21.53, ×1 (MAE 0.16 m, n 102)
  - 03404 : meteofrance_wave poids 13.1, ×1.14 (MAE 0.23 m, n 141) ; ecmwf_wam025 poids 14.92, ×1.08 (MAE 0.16 m, n 141) ; ewam poids 15.94, ×1.03 (MAE 0.15 m, n 141) ; gwam poids 9.4, ×1.05 (MAE 0.15 m, n 141) ; ncep_gfswave025 poids 7.88, ×1.08 (MAE 0.19 m, n 141) ; copernicus poids 29.06, ×1 (MAE 0.09 m, n 57)
  - 01102 : meteofrance_wave poids —, ×— (MAE 0.46 m, n 76) ; ecmwf_wam025 poids —, ×— (MAE 0.26 m, n 76) ; ewam poids —, ×— (MAE 0.37 m, n 76) ; gwam poids —, ×— (MAE 0.53 m, n 76)
  - 01101 : meteofrance_wave poids 10.73, ×1.25 (MAE 0.27 m, n 186) ; ecmwf_wam025 poids 17.61, ×0.98 (MAE 0.13 m, n 186) ; ewam poids 12.44, ×1.11 (MAE 0.2 m, n 186) ; gwam poids 9.42, ×1.11 (MAE 0.15 m, n 186) ; ncep_gfswave025 poids 9.45, ×1.04 (MAE 0.15 m, n 186) ; copernicus poids 29.4, ×1.02 (MAE 0.09 m, n 102)
  - 06601 : 
- Vent downwind : La Grande-Motte × 0.98, Port Camargue × 0.92 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

14 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 1,8 nd (n 8) · gfs_seamless 1,8 nd (n 8) · icon_d2 2,0 nd (n 8) · ecmwf_ifs025 2,1 nd (n 8) · meteofrance_arome_france 2,1 nd (n 8) · icon_eu 2,2 nd (n 8) · meteofrance_arome_france_hd 2,2 nd (n 8)
- LFMP : ecmwf_ifs025 1,1 nd (n 8) · meteofrance_arome_france 1,1 nd (n 8) · meteofrance_arome_france_hd 1,2 nd (n 8) · icon_eu 1,5 nd (n 8) · gfs_seamless 1,7 nd (n 8) · meteofrance_arpege_europe 2,3 nd (n 8)
- LFTH : icon_eu 1,7 nd (n 8) · meteofrance_arome_france 2,1 nd (n 8) · meteofrance_arome_france_hd 2,1 nd (n 8) · ecmwf_ifs025 2,3 nd (n 8) · meteofrance_arpege_europe 2,7 nd (n 8) · gfs_seamless 3,1 nd (n 8)
- LFML : 
