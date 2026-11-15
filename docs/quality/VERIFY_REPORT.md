# Remise en question (③)

Généré le 2026-11-15 15:20 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 35 prévisions archivées sur 135 h ; 3193 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | gfs_seamless 1,9 · meteofrance_arome_france 2,0 · meteofrance_arpege_europe 2,0 · icon_d2 2,2 · meteofrance_arome_france_hd 2,3 · ecmwf_ifs025 2,5 · icon_eu 2,6 |
| LFMP | meteofrance_arome_france_hd 1,7 · meteofrance_arome_france 1,7 · gfs_seamless 2,1 · icon_eu 2,3 · ecmwf_ifs025 2,3 · meteofrance_arpege_europe 2,5 |
| LFTH | icon_eu 2,2 · meteofrance_arpege_europe 2,7 · ecmwf_ifs025 2,9 · meteofrance_arome_france_hd 3,0 · meteofrance_arome_france 3,0 · gfs_seamless 3,0 |
| LFML | meteofrance_arome_france_hd 2,0 · meteofrance_arome_france 2,4 · icon_eu 2,4 · ecmwf_ifs025 3,3 · meteofrance_arpege_europe 3,9 · gfs_seamless 5,2 |
| LFMI | meteofrance_arome_france_hd 2,3 · meteofrance_arome_france 2,3 · meteofrance_arpege_europe 2,5 · icon_eu 2,7 · gfs_seamless 3,2 · ecmwf_ifs025 3,4 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.29 · meteofrance_wave 0.33 · ecmwf_wam025 0.41 · gwam 0.57 · ncep_gfswave025 1.11 |
| 03404 | ewam 0.18 · gwam 0.24 · ncep_gfswave025 0.24 · meteofrance_wave 0.27 · ecmwf_wam025 0.33 |
| 01101 | meteofrance_wave 0.16 · ewam 0.20 · ncep_gfswave025 0.26 · ecmwf_wam025 0.28 · gwam 0.35 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 9.93, ×0.94 (MAE 0.28 m, n 173) ; ecmwf_wam025 poids 6.1, ×0.86 (MAE 0.35 m, n 173) ; ewam poids 8.63, ×0.85 (MAE 0.28 m, n 173) ; gwam poids 2.05, ×0.8 (MAE 0.5 m, n 173) ; copernicus poids 9.48, ×0.86 (MAE 0.33 m, n 104)
  - 03404 : meteofrance_wave poids 11.3, ×1.04 (MAE 0.26 m, n 158) ; ecmwf_wam025 poids 7.63, ×0.95 (MAE 0.3 m, n 158) ; ewam poids 13.56, ×0.94 (MAE 0.18 m, n 158) ; gwam poids 6.35, ×0.88 (MAE 0.23 m, n 158) ; ncep_gfswave025 poids 6.5, ×1.05 (MAE 0.23 m, n 158) ; copernicus poids 24.64, ×0.98 (MAE 0.13 m, n 104)
  - 01102 : 
  - 01101 : meteofrance_wave poids 17.19, ×1.12 (MAE 0.17 m, n 175) ; ecmwf_wam025 poids 8.96, ×0.84 (MAE 0.27 m, n 175) ; ewam poids 10.4, ×0.9 (MAE 0.24 m, n 175) ; gwam poids 3.72, ×0.8 (MAE 0.35 m, n 175) ; ncep_gfswave025 poids 5.14, ×0.93 (MAE 0.28 m, n 175) ; copernicus poids 24.67, ×0.96 (MAE 0.13 m, n 104)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.02, Port Camargue × 1.05 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

35 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 2,1 nd (n 7) · gfs_seamless 2,3 nd (n 7) · icon_eu 2,5 nd (n 7) · icon_d2 2,5 nd (n 7) · ecmwf_ifs025 2,5 nd (n 7) · meteofrance_arome_france_hd 2,6 nd (n 7) · meteofrance_arome_france 2,8 nd (n 7)
- LFMP : gfs_seamless 1,0 nd (n 7) · meteofrance_arome_france 1,3 nd (n 7) · meteofrance_arome_france_hd 1,4 nd (n 7) · meteofrance_arpege_europe 2,0 nd (n 7) · icon_eu 2,1 nd (n 7) · ecmwf_ifs025 2,2 nd (n 7)
- LFTH : icon_eu 2,1 nd (n 7) · meteofrance_arpege_europe 2,2 nd (n 7) · ecmwf_ifs025 2,3 nd (n 7) · meteofrance_arome_france_hd 3,1 nd (n 7) · meteofrance_arome_france 3,1 nd (n 7) · gfs_seamless 4,0 nd (n 7)
- LFML : meteofrance_arome_france_hd 2,4 nd (n 7) · icon_eu 2,5 nd (n 7) · meteofrance_arome_france 2,8 nd (n 7) · ecmwf_ifs025 2,9 nd (n 7) · meteofrance_arpege_europe 5,7 nd (n 7) · gfs_seamless 6,5 nd (n 7)
- LFMI : 
