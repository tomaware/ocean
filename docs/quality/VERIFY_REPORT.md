# Remise en question (③)

Généré le 2026-11-14 12:17 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 27 prévisions archivées sur 108 h ; 2679 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | gfs_seamless 2,0 · meteofrance_arome_france 2,1 · meteofrance_arome_france_hd 2,3 · icon_d2 2,4 · ecmwf_ifs025 2,5 · meteofrance_arpege_europe 2,5 · icon_eu 2,8 |
| LFMP | meteofrance_arome_france_hd 2,0 · meteofrance_arome_france 2,1 · ecmwf_ifs025 2,8 · gfs_seamless 3,1 · icon_eu 3,1 · meteofrance_arpege_europe 3,1 |
| LFTH | icon_eu 2,2 · meteofrance_arome_france_hd 2,6 · meteofrance_arome_france 2,6 · meteofrance_arpege_europe 2,7 · gfs_seamless 3,0 · ecmwf_ifs025 3,6 |
| LFML | meteofrance_arome_france_hd 2,1 · meteofrance_arome_france 2,3 · icon_eu 2,5 · ecmwf_ifs025 3,4 · meteofrance_arpege_europe 3,8 · gfs_seamless 4,5 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.14 · meteofrance_wave 0.22 · ecmwf_wam025 0.30 · gwam 0.37 · ncep_gfswave025 0.88 |
| 03404 | meteofrance_wave 0.15 · ncep_gfswave025 0.15 · ewam 0.20 · ecmwf_wam025 0.26 · gwam 0.27 |
| 01101 | meteofrance_wave 0.14 · ewam 0.21 · ncep_gfswave025 0.25 · ecmwf_wam025 0.28 · gwam 0.35 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 15.62, ×0.9 (MAE 0.19 m, n 167) ; ecmwf_wam025 poids 8.8, ×0.84 (MAE 0.27 m, n 167) ; ewam poids 17.57, ×0.91 (MAE 0.13 m, n 167) ; gwam poids 3.97, ×0.8 (MAE 0.33 m, n 167) ; copernicus poids 19.66, ×0.95 (MAE 0.18 m, n 102)
  - 03404 : meteofrance_wave poids 19.65, ×0.9 (MAE 0.15 m, n 104) ; ecmwf_wam025 poids 9.55, ×0.84 (MAE 0.25 m, n 104) ; ewam poids 12.9, ×0.94 (MAE 0.19 m, n 104) ; gwam poids 5.32, ×0.83 (MAE 0.27 m, n 104) ; ncep_gfswave025 poids 0.49, ×0.92 (MAE 0.14 m, n 104) ; copernicus poids 24.16, ×0.93 (MAE 0.13 m, n 104)
  - 01102 : 
  - 01101 : meteofrance_wave poids 20.2, ×1.09 (MAE 0.14 m, n 169) ; ecmwf_wam025 poids 9.97, ×0.81 (MAE 0.25 m, n 169) ; ewam poids 11.73, ×0.91 (MAE 0.21 m, n 169) ; gwam poids 4.43, ×0.8 (MAE 0.31 m, n 169) ; ncep_gfswave025 poids 6.85, ×0.87 (MAE 0.22 m, n 169) ; copernicus poids 19.87, ×0.88 (MAE 0.17 m, n 103)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.06, Port Camargue × 0.98 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

27 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 2,3 nd (n 8) · icon_eu 2,3 nd (n 8) · icon_d2 2,4 nd (n 8) · ecmwf_ifs025 2,6 nd (n 8) · meteofrance_arome_france 2,7 nd (n 8) · gfs_seamless 2,8 nd (n 8) · meteofrance_arome_france_hd 2,9 nd (n 8)
- LFMP : meteofrance_arome_france 1,7 nd (n 8) · meteofrance_arome_france_hd 1,7 nd (n 8) · icon_eu 3,3 nd (n 8) · ecmwf_ifs025 3,4 nd (n 8) · meteofrance_arpege_europe 3,5 nd (n 8) · gfs_seamless 3,6 nd (n 8)
- LFTH : icon_eu 2,1 nd (n 8) · ecmwf_ifs025 2,6 nd (n 8) · meteofrance_arpege_europe 2,6 nd (n 8) · meteofrance_arome_france_hd 2,7 nd (n 8) · meteofrance_arome_france 2,7 nd (n 8) · gfs_seamless 3,8 nd (n 8)
- LFML : icon_eu 1,6 nd (n 8) · ecmwf_ifs025 1,8 nd (n 8) · meteofrance_arome_france_hd 2,6 nd (n 8) · meteofrance_arome_france 2,7 nd (n 8) · gfs_seamless 5,2 nd (n 8) · meteofrance_arpege_europe 6,1 nd (n 8)
