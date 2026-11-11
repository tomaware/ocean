# Remise en question (③)

Généré le 2026-11-11 11:37 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 20 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 12 prévisions archivées sur 33 h ; 1217 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | gfs_seamless 1,4 · meteofrance_arome_france 1,5 · meteofrance_arpege_europe 1,5 · icon_eu 1,8 · meteofrance_arome_france_hd 2,1 · icon_d2 2,2 · ecmwf_ifs025 4,3 |
| LFMP | gfs_seamless 1,4 · icon_eu 1,4 · ecmwf_ifs025 1,4 · meteofrance_arpege_europe 1,5 · meteofrance_arome_france 1,7 · meteofrance_arome_france_hd 1,9 |
| LFTH | icon_eu 2,3 · ecmwf_ifs025 2,8 · meteofrance_arome_france_hd 3,1 · meteofrance_arome_france 3,1 · gfs_seamless 3,5 · meteofrance_arpege_europe 3,6 |
| LFML | ecmwf_ifs025 1,9 · meteofrance_arome_france_hd 2,0 · meteofrance_arome_france 2,1 · icon_eu 2,5 · meteofrance_arpege_europe 3,2 · gfs_seamless 3,6 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.22 · gwam 0.24 · ecmwf_wam025 0.30 · meteofrance_wave 0.32 · ncep_gfswave025 1.45 |
| 03404 | gwam 0.15 · ewam 0.17 · ecmwf_wam025 0.18 · ncep_gfswave025 0.20 · meteofrance_wave 0.24 |
| 01102 | ecmwf_wam025 0.25 · ewam 0.33 · meteofrance_wave 0.46 · gwam 0.52 · ncep_gfswave025 1.16 |
| 01101 | gwam 0.12 · ecmwf_wam025 0.13 · ncep_gfswave025 0.14 · ewam 0.17 · meteofrance_wave 0.27 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 8.8, ×1.16 (MAE 0.31 m, n 165) ; ecmwf_wam025 poids 8.32, ×1.12 (MAE 0.28 m, n 165) ; ewam poids 11.67, ×1.07 (MAE 0.21 m, n 165) ; gwam poids 6.49, ×1.04 (MAE 0.23 m, n 165) ; copernicus poids 19.63, ×1.02 (MAE 0.18 m, n 102)
  - 03404 : meteofrance_wave poids 13.09, ×1.14 (MAE 0.23 m, n 141) ; ecmwf_wam025 poids 14.92, ×1.08 (MAE 0.16 m, n 141) ; ewam poids 15.94, ×1.03 (MAE 0.15 m, n 141) ; gwam poids 9.4, ×1.05 (MAE 0.15 m, n 141) ; ncep_gfswave025 poids 7.88, ×1.08 (MAE 0.19 m, n 141) ; copernicus poids 28.26, ×0.99 (MAE 0.1 m, n 75)
  - 01102 : meteofrance_wave poids —, ×— (MAE 0.46 m, n 76) ; ecmwf_wam025 poids —, ×— (MAE 0.26 m, n 76) ; ewam poids —, ×— (MAE 0.37 m, n 76) ; gwam poids —, ×— (MAE 0.53 m, n 76) ; copernicus poids —, ×— (MAE 0.14 m, n 12)
  - 01101 : meteofrance_wave poids 9.77, ×1.25 (MAE 0.29 m, n 168) ; ecmwf_wam025 poids 17.05, ×0.98 (MAE 0.14 m, n 168) ; ewam poids 11.74, ×1.11 (MAE 0.21 m, n 168) ; gwam poids 8.84, ×1.11 (MAE 0.17 m, n 168) ; ncep_gfswave025 poids 8.98, ×1.04 (MAE 0.16 m, n 168) ; copernicus poids 26.57, ×0.99 (MAE 0.11 m, n 102)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.19, Port Camargue × 1.12 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

12 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 1,7 nd (n 5) · icon_d2 1,8 nd (n 5) · icon_eu 1,9 nd (n 5) · ecmwf_ifs025 2,2 nd (n 5) · gfs_seamless 2,3 nd (n 5) · meteofrance_arome_france 2,3 nd (n 5) · meteofrance_arome_france_hd 2,4 nd (n 5)
- LFMP : meteofrance_arome_france_hd 1,4 nd (n 5) · meteofrance_arome_france 1,4 nd (n 5) · ecmwf_ifs025 1,5 nd (n 5) · icon_eu 1,7 nd (n 5) · meteofrance_arpege_europe 2,0 nd (n 5) · gfs_seamless 2,1 nd (n 5)
- LFTH : icon_eu 1,9 nd (n 5) · meteofrance_arome_france 2,3 nd (n 5) · ecmwf_ifs025 2,3 nd (n 5) · meteofrance_arome_france_hd 2,3 nd (n 5) · meteofrance_arpege_europe 2,6 nd (n 5) · gfs_seamless 3,4 nd (n 5)
- LFML : 
