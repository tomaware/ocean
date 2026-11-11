# Remise en question (③)

Généré le 2026-11-11 10:39 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 20 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 12 prévisions archivées sur 33 h ; 1136 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | gfs_seamless 1,5 · meteofrance_arome_france 1,5 · meteofrance_arpege_europe 1,5 · icon_eu 1,9 · meteofrance_arome_france_hd 2,1 · icon_d2 2,3 · ecmwf_ifs025 4,5 |
| LFMP | icon_eu 1,4 · gfs_seamless 1,4 · ecmwf_ifs025 1,4 · meteofrance_arpege_europe 1,4 · meteofrance_arome_france 1,7 · meteofrance_arome_france_hd 1,8 |
| LFTH | icon_eu 2,4 · ecmwf_ifs025 2,7 · meteofrance_arome_france_hd 3,3 · meteofrance_arome_france 3,3 · gfs_seamless 3,6 · meteofrance_arpege_europe 3,6 |
| LFML | ecmwf_ifs025 1,9 · meteofrance_arome_france_hd 2,1 · meteofrance_arome_france 2,1 · icon_eu 2,6 · meteofrance_arpege_europe 3,2 · gfs_seamless 3,8 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.22 · gwam 0.24 · ecmwf_wam025 0.30 · meteofrance_wave 0.33 · ncep_gfswave025 1.45 |
| 03404 | gwam 0.15 · ewam 0.17 · ecmwf_wam025 0.18 · ncep_gfswave025 0.20 · meteofrance_wave 0.24 |
| 01102 | ecmwf_wam025 0.25 · ewam 0.34 · meteofrance_wave 0.46 · gwam 0.52 · ncep_gfswave025 1.15 |
| 01101 | gwam 0.12 · ecmwf_wam025 0.13 · ncep_gfswave025 0.15 · ewam 0.18 · meteofrance_wave 0.27 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 8.79, ×1.17 (MAE 0.31 m, n 163) ; ecmwf_wam025 poids 8.34, ×1.13 (MAE 0.28 m, n 163) ; ewam poids 11.67, ×1.07 (MAE 0.21 m, n 163) ; gwam poids 6.51, ×1.04 (MAE 0.23 m, n 163) ; copernicus poids 19.94, ×1.02 (MAE 0.17 m, n 100)
  - 03404 : meteofrance_wave poids 13.09, ×1.14 (MAE 0.23 m, n 141) ; ecmwf_wam025 poids 14.92, ×1.08 (MAE 0.16 m, n 141) ; ewam poids 15.94, ×1.03 (MAE 0.15 m, n 141) ; gwam poids 9.4, ×1.05 (MAE 0.15 m, n 141) ; ncep_gfswave025 poids 7.88, ×1.08 (MAE 0.19 m, n 141) ; copernicus poids 28.26, ×0.99 (MAE 0.1 m, n 75)
  - 01102 : meteofrance_wave poids —, ×— (MAE 0.46 m, n 76) ; ecmwf_wam025 poids —, ×— (MAE 0.26 m, n 76) ; ewam poids —, ×— (MAE 0.37 m, n 76) ; gwam poids —, ×— (MAE 0.53 m, n 76) ; copernicus poids —, ×— (MAE 0.14 m, n 12)
  - 01101 : meteofrance_wave poids 9.68, ×1.25 (MAE 0.29 m, n 166) ; ecmwf_wam025 poids 16.97, ×0.98 (MAE 0.14 m, n 166) ; ewam poids 11.72, ×1.11 (MAE 0.21 m, n 166) ; gwam poids 8.77, ×1.11 (MAE 0.17 m, n 166) ; ncep_gfswave025 poids 8.91, ×1.04 (MAE 0.17 m, n 166) ; copernicus poids 26.37, ×0.99 (MAE 0.11 m, n 100)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.06, Port Camargue × 1.03 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

12 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 1,0 nd (n 4) · meteofrance_arome_france 1,1 nd (n 4) · meteofrance_arome_france_hd 1,4 nd (n 4) · icon_eu 1,5 nd (n 4) · icon_d2 1,6 nd (n 4) · ecmwf_ifs025 1,6 nd (n 4) · gfs_seamless 2,0 nd (n 4)
- LFMP : meteofrance_arome_france_hd 1,6 nd (n 4) · meteofrance_arome_france 1,6 nd (n 4) · ecmwf_ifs025 1,8 nd (n 4) · icon_eu 2,0 nd (n 4) · gfs_seamless 2,2 nd (n 4) · meteofrance_arpege_europe 2,3 nd (n 4)
- LFTH : ecmwf_ifs025 1,5 nd (n 4) · meteofrance_arome_france_hd 1,8 nd (n 4) · meteofrance_arome_france 1,8 nd (n 4) · meteofrance_arpege_europe 2,2 nd (n 4) · icon_eu 2,3 nd (n 4) · gfs_seamless 3,4 nd (n 4)
- LFML : 
