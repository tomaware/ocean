# Remise en question (③)

Généré le 2026-11-11 13:31 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 20 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 12 prévisions archivées sur 33 h ; 1247 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | gfs_seamless 1,4 · meteofrance_arome_france 1,5 · meteofrance_arpege_europe 1,5 · icon_eu 1,8 · meteofrance_arome_france_hd 2,1 · icon_d2 2,1 · ecmwf_ifs025 4,1 |
| LFMP | ecmwf_ifs025 1,3 · gfs_seamless 1,4 · meteofrance_arpege_europe 1,4 · icon_eu 1,5 · meteofrance_arome_france 1,7 · meteofrance_arome_france_hd 1,9 |
| LFTH | icon_eu 2,2 · ecmwf_ifs025 2,8 · meteofrance_arome_france_hd 2,9 · meteofrance_arome_france 2,9 · gfs_seamless 3,4 · meteofrance_arpege_europe 3,5 |
| LFML | ecmwf_ifs025 2,0 · meteofrance_arome_france_hd 2,0 · meteofrance_arome_france 2,1 · icon_eu 2,5 · meteofrance_arpege_europe 3,1 · gfs_seamless 3,8 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.21 · gwam 0.23 · ecmwf_wam025 0.30 · meteofrance_wave 0.31 · ncep_gfswave025 1.43 |
| 03404 | gwam 0.14 · ewam 0.17 · ecmwf_wam025 0.19 · ncep_gfswave025 0.20 · meteofrance_wave 0.24 |
| 01102 | ecmwf_wam025 0.23 · ewam 0.29 · meteofrance_wave 0.45 · gwam 0.49 · ncep_gfswave025 1.16 |
| 01101 | gwam 0.11 · ecmwf_wam025 0.13 · ncep_gfswave025 0.14 · ewam 0.16 · meteofrance_wave 0.27 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 9.04, ×1.17 (MAE 0.3 m, n 169) ; ecmwf_wam025 poids 8.36, ×1.12 (MAE 0.28 m, n 169) ; ewam poids 11.79, ×1.07 (MAE 0.21 m, n 169) ; gwam poids 6.5, ×1.04 (MAE 0.23 m, n 169) ; copernicus poids 19.37, ×1.01 (MAE 0.18 m, n 106)
  - 03404 : meteofrance_wave poids 13.1, ×1.14 (MAE 0.23 m, n 141) ; ecmwf_wam025 poids 14.92, ×1.08 (MAE 0.16 m, n 141) ; ewam poids 15.94, ×1.03 (MAE 0.15 m, n 141) ; gwam poids 9.4, ×1.05 (MAE 0.15 m, n 141) ; ncep_gfswave025 poids 7.88, ×1.08 (MAE 0.19 m, n 141) ; copernicus poids 28.26, ×0.99 (MAE 0.1 m, n 75)
  - 01102 : meteofrance_wave poids —, ×— (MAE 0.46 m, n 76) ; ecmwf_wam025 poids —, ×— (MAE 0.26 m, n 76) ; ewam poids —, ×— (MAE 0.37 m, n 76) ; gwam poids —, ×— (MAE 0.53 m, n 76) ; copernicus poids —, ×— (MAE 0.14 m, n 12)
  - 01101 : meteofrance_wave poids 9.92, ×1.25 (MAE 0.28 m, n 172) ; ecmwf_wam025 poids 17.03, ×0.98 (MAE 0.14 m, n 172) ; ewam poids 11.86, ×1.11 (MAE 0.21 m, n 172) ; gwam poids 8.96, ×1.11 (MAE 0.16 m, n 172) ; ncep_gfswave025 poids 9.08, ×1.04 (MAE 0.16 m, n 172) ; copernicus poids 26.83, ×0.99 (MAE 0.11 m, n 106)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.1, Port Camargue × 1.09 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

12 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 1,5 nd (n 5) · icon_d2 1,6 nd (n 5) · icon_eu 1,7 nd (n 5) · ecmwf_ifs025 2,0 nd (n 5) · gfs_seamless 2,1 nd (n 5) · meteofrance_arome_france 2,1 nd (n 5) · meteofrance_arome_france_hd 2,2 nd (n 5)
- LFMP : ecmwf_ifs025 1,5 nd (n 5) · meteofrance_arome_france_hd 1,6 nd (n 5) · meteofrance_arome_france 1,6 nd (n 5) · icon_eu 1,7 nd (n 5) · meteofrance_arpege_europe 2,2 nd (n 5) · gfs_seamless 2,3 nd (n 5)
- LFTH : icon_eu 2,3 nd (n 5) · meteofrance_arome_france 2,7 nd (n 5) · ecmwf_ifs025 2,7 nd (n 5) · meteofrance_arome_france_hd 2,7 nd (n 5) · meteofrance_arpege_europe 3,0 nd (n 5) · gfs_seamless 3,8 nd (n 5)
- LFML : 
