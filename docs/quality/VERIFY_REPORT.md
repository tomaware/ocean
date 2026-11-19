# Remise en question (③)

Généré le 2026-11-19 00:33 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 54 prévisions archivées sur 216 h ; 4783 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | icon_eu 2,0 · icon_d2 2,1 · meteofrance_arome_france 2,2 · meteofrance_arome_france_hd 2,2 · gfs_seamless 2,3 · ecmwf_ifs025 2,3 · meteofrance_arpege_europe 2,6 |
| LFMP | icon_eu 2,2 · meteofrance_arome_france 2,2 · meteofrance_arome_france_hd 2,2 · meteofrance_arpege_europe 2,4 · ecmwf_ifs025 2,5 · gfs_seamless 2,9 |
| LFTH | meteofrance_arpege_europe 2,6 · gfs_seamless 2,7 · meteofrance_arome_france_hd 2,8 · meteofrance_arome_france 2,9 · icon_eu 3,1 · ecmwf_ifs025 3,2 |
| LFML | meteofrance_arome_france 2,2 · meteofrance_arome_france_hd 2,4 · meteofrance_arpege_europe 2,5 · ecmwf_ifs025 2,6 · icon_eu 2,6 · gfs_seamless 3,7 |
| LFMI | meteofrance_arpege_europe 1,8 · meteofrance_arome_france_hd 1,9 · meteofrance_arome_france 1,9 · gfs_seamless 2,3 · ecmwf_ifs025 2,5 · icon_eu 2,5 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.15 · meteofrance_wave 0.18 · ecmwf_wam025 0.27 · gwam 0.31 · ncep_gfswave025 0.76 |
| 03404 | ewam 0.10 · ncep_gfswave025 0.11 · meteofrance_wave 0.15 · gwam 0.17 · ecmwf_wam025 0.18 |
| 01101 | ncep_gfswave025 0.13 · ewam 0.14 · meteofrance_wave 0.16 · ecmwf_wam025 0.16 · gwam 0.19 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 16.49, ×0.88 (MAE 0.18 m, n 144) ; ecmwf_wam025 poids 8.78, ×0.81 (MAE 0.27 m, n 144) ; ewam poids 16.17, ×0.89 (MAE 0.15 m, n 144) ; gwam poids 4.61, ×0.8 (MAE 0.3 m, n 144) ; copernicus poids 16.74, ×0.88 (MAE 0.21 m, n 102)
  - 03404 : meteofrance_wave poids 20.22, ×0.95 (MAE 0.14 m, n 144) ; ecmwf_wam025 poids 14.05, ×0.87 (MAE 0.18 m, n 144) ; ewam poids 20.25, ×0.96 (MAE 0.1 m, n 144) ; gwam poids 9.01, ×0.88 (MAE 0.16 m, n 144) ; ncep_gfswave025 poids 11.61, ×0.96 (MAE 0.11 m, n 144) ; copernicus poids 20.48, ×0.92 (MAE 0.17 m, n 102)
  - 01102 : 
  - 01101 : meteofrance_wave poids 18.48, ×1.25 (MAE 0.16 m, n 137) ; ecmwf_wam025 poids 15.56, ×0.9 (MAE 0.16 m, n 137) ; ewam poids 17.42, ×1.12 (MAE 0.13 m, n 137) ; gwam poids 8.07, ×0.92 (MAE 0.19 m, n 137) ; ncep_gfswave025 poids 10.7, ×0.99 (MAE 0.13 m, n 137) ; copernicus poids 27.59, ×1.03 (MAE 0.1 m, n 95)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.12, Port Camargue × 1.09 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

54 prévisions archivées. Classement à 24 h :

- LFMT : icon_d2 1,6 nd (n 8) · gfs_seamless 1,7 nd (n 8) · icon_eu 1,7 nd (n 8) · meteofrance_arome_france_hd 2,0 nd (n 8) · meteofrance_arome_france 2,3 nd (n 8) · meteofrance_arpege_europe 2,3 nd (n 8) · ecmwf_ifs025 2,7 nd (n 8)
- LFMP : meteofrance_arome_france_hd 1,7 nd (n 8) · meteofrance_arome_france 2,0 nd (n 8) · ecmwf_ifs025 2,8 nd (n 8) · gfs_seamless 3,4 nd (n 8) · icon_eu 3,7 nd (n 8) · meteofrance_arpege_europe 3,9 nd (n 8)
- LFTH : icon_eu 2,8 nd (n 8) · ecmwf_ifs025 3,0 nd (n 8) · gfs_seamless 3,8 nd (n 8) · meteofrance_arome_france_hd 4,0 nd (n 8) · meteofrance_arome_france 4,0 nd (n 8) · meteofrance_arpege_europe 4,8 nd (n 8)
- LFML : meteofrance_arome_france_hd 2,2 nd (n 8) · meteofrance_arome_france 2,4 nd (n 8) · meteofrance_arpege_europe 2,7 nd (n 8) · ecmwf_ifs025 3,2 nd (n 8) · icon_eu 3,3 nd (n 8) · gfs_seamless 4,2 nd (n 8)
- LFMI : meteofrance_arome_france 1,7 nd (n 8) · meteofrance_arome_france_hd 1,8 nd (n 8) · meteofrance_arpege_europe 2,4 nd (n 8) · icon_eu 2,5 nd (n 8) · gfs_seamless 2,5 nd (n 8) · ecmwf_ifs025 3,2 nd (n 8)
