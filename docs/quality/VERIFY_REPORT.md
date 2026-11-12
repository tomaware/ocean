# Remise en question (③)

Généré le 2026-11-12 22:04 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 16 prévisions archivées sur 69 h ; 1730 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | gfs_seamless 1,4 · meteofrance_arome_france 1,5 · icon_eu 1,5 · meteofrance_arpege_europe 1,6 · icon_d2 1,7 · meteofrance_arome_france_hd 1,9 · ecmwf_ifs025 3,5 |
| LFMP | ecmwf_ifs025 1,1 · icon_eu 1,4 · gfs_seamless 1,4 · meteofrance_arpege_europe 1,5 · meteofrance_arome_france 1,6 · meteofrance_arome_france_hd 1,6 |
| LFTH | icon_eu 2,1 · ecmwf_ifs025 2,5 · meteofrance_arome_france_hd 2,8 · meteofrance_arome_france 2,8 · meteofrance_arpege_europe 3,4 · gfs_seamless 3,5 |
| LFML | meteofrance_arome_france_hd 1,9 · meteofrance_arome_france 2,0 · ecmwf_ifs025 2,1 · icon_eu 2,5 · meteofrance_arpege_europe 3,1 · gfs_seamless 3,6 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | meteofrance_wave 0.14 · ewam 0.14 · ecmwf_wam025 0.15 · gwam 0.19 · ncep_gfswave025 1.09 |
| 03404 | ncep_gfswave025 0.13 · meteofrance_wave 0.15 · ecmwf_wam025 0.15 · gwam 0.17 · ewam 0.19 |
| 01101 | ecmwf_wam025 0.14 · gwam 0.17 · ncep_gfswave025 0.17 · meteofrance_wave 0.18 · ewam 0.19 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 14.17, ×1.08 (MAE 0.21 m, n 187) ; ecmwf_wam025 poids 11.9, ×1.03 (MAE 0.21 m, n 187) ; ewam poids 16.09, ×0.98 (MAE 0.15 m, n 187) ; gwam poids 8.06, ×0.94 (MAE 0.19 m, n 187) ; copernicus poids 25.93, ×0.95 (MAE 0.12 m, n 97)
  - 03404 : meteofrance_wave poids 15.76, ×1.08 (MAE 0.19 m, n 121) ; ecmwf_wam025 poids 15.08, ×1.04 (MAE 0.16 m, n 121) ; ewam poids 16.2, ×0.96 (MAE 0.15 m, n 121) ; gwam poids 10.45, ×0.96 (MAE 0.13 m, n 121) ; ncep_gfswave025 poids 9.89, ×1 (MAE 0.14 m, n 121) ; copernicus poids 19.94, ×0.94 (MAE 0.17 m, n 31)
  - 01102 : meteofrance_wave poids —, ×— (MAE 0.44 m, n 29) ; ecmwf_wam025 poids —, ×— (MAE 0.16 m, n 29) ; ewam poids —, ×— (MAE 0.18 m, n 29) ; gwam poids —, ×— (MAE 0.45 m, n 29)
  - 01101 : meteofrance_wave poids 12.86, ×1.23 (MAE 0.23 m, n 189) ; ecmwf_wam025 poids 15.42, ×0.92 (MAE 0.16 m, n 189) ; ewam poids 12.71, ×0.95 (MAE 0.2 m, n 189) ; gwam poids 9.01, ×0.94 (MAE 0.16 m, n 189) ; ncep_gfswave025 poids 8.9, ×0.92 (MAE 0.17 m, n 189) ; copernicus poids 23.99, ×0.94 (MAE 0.14 m, n 99)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.02, Port Camargue × 0.95 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

16 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 1,8 nd (n 7) · gfs_seamless 1,9 nd (n 7) · ecmwf_ifs025 2,1 nd (n 7) · meteofrance_arome_france 2,2 nd (n 7) · icon_d2 2,2 nd (n 7) · meteofrance_arome_france_hd 2,3 nd (n 7) · icon_eu 2,4 nd (n 7)
- LFMP : ecmwf_ifs025 1,2 nd (n 7) · meteofrance_arome_france 1,3 nd (n 7) · meteofrance_arome_france_hd 1,3 nd (n 7) · icon_eu 1,5 nd (n 7) · gfs_seamless 1,9 nd (n 7) · meteofrance_arpege_europe 2,0 nd (n 7)
- LFTH : icon_eu 1,9 nd (n 7) · meteofrance_arome_france 2,1 nd (n 7) · meteofrance_arome_france_hd 2,1 nd (n 7) · ecmwf_ifs025 2,3 nd (n 7) · meteofrance_arpege_europe 2,7 nd (n 7) · gfs_seamless 3,5 nd (n 7)
- LFML : 
