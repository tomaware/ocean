# Remise en question (③)

Généré le 2026-11-14 14:31 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 31 couples station × modèle (vent), 15 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 27 prévisions archivées sur 108 h ; 2523 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | gfs_seamless 1,8 · meteofrance_arome_france 2,0 · meteofrance_arpege_europe 2,1 · icon_d2 2,2 · meteofrance_arome_france_hd 2,3 · ecmwf_ifs025 2,5 · icon_eu 2,6 |
| LFMP | meteofrance_arome_france_hd 1,7 · meteofrance_arome_france 1,8 · gfs_seamless 2,3 · icon_eu 2,4 · ecmwf_ifs025 2,4 · meteofrance_arpege_europe 2,6 |
| LFTH | icon_eu 2,3 · meteofrance_arome_france 2,6 · meteofrance_arome_france_hd 2,6 · meteofrance_arpege_europe 2,6 · ecmwf_ifs025 3,0 · gfs_seamless 3,0 |
| LFML | meteofrance_arome_france_hd 2,1 · icon_eu 2,4 · meteofrance_arome_france 2,6 · ecmwf_ifs025 3,3 · meteofrance_arpege_europe 4,0 · gfs_seamless 5,2 |
| LFMI | meteofrance_arome_france_hd 2,2 · meteofrance_arome_france 2,3 · meteofrance_arpege_europe 2,5 · icon_eu 2,7 · gfs_seamless 3,3 · ecmwf_ifs025 3,5 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.14 · meteofrance_wave 0.22 · ecmwf_wam025 0.30 · gwam 0.37 · ncep_gfswave025 0.87 |
| 03404 | ncep_gfswave025 0.14 · meteofrance_wave 0.15 · ewam 0.19 · ecmwf_wam025 0.25 · gwam 0.26 |
| 01101 | meteofrance_wave 0.14 · ewam 0.21 · ncep_gfswave025 0.25 · ecmwf_wam025 0.28 · gwam 0.35 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 15.8, ×0.9 (MAE 0.19 m, n 171) ; ecmwf_wam025 poids 8.89, ×0.84 (MAE 0.27 m, n 171) ; ewam poids 17.68, ×0.91 (MAE 0.13 m, n 171) ; gwam poids 4.03, ×0.8 (MAE 0.33 m, n 171) ; copernicus poids 21.04, ×0.94 (MAE 0.16 m, n 102)
  - 03404 : meteofrance_wave poids 19.97, ×0.9 (MAE 0.14 m, n 108) ; ecmwf_wam025 poids 9.72, ×0.84 (MAE 0.25 m, n 108) ; ewam poids 13.11, ×0.94 (MAE 0.19 m, n 108) ; gwam poids 5.55, ×0.83 (MAE 0.26 m, n 108) ; ncep_gfswave025 poids 0.5, ×0.92 (MAE 0.14 m, n 108) ; copernicus poids 24.53, ×0.92 (MAE 0.13 m, n 102)
  - 01102 : 
  - 01101 : meteofrance_wave poids 20.48, ×1.09 (MAE 0.14 m, n 173) ; ecmwf_wam025 poids 10.16, ×0.82 (MAE 0.24 m, n 173) ; ewam poids 12.01, ×0.91 (MAE 0.21 m, n 173) ; gwam poids 4.56, ×0.8 (MAE 0.3 m, n 173) ; ncep_gfswave025 poids 6.94, ×0.88 (MAE 0.22 m, n 173) ; copernicus poids 19.23, ×0.87 (MAE 0.18 m, n 102)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.08, Port Camargue × 1.03 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

27 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 2,1 nd (n 6) · gfs_seamless 2,2 nd (n 6) · meteofrance_arome_france_hd 2,4 nd (n 6) · ecmwf_ifs025 2,6 nd (n 6) · icon_eu 2,6 nd (n 6) · meteofrance_arome_france 2,7 nd (n 6) · icon_d2 2,7 nd (n 6)
- LFMP : gfs_seamless 1,0 nd (n 6) · meteofrance_arome_france_hd 1,6 nd (n 6) · meteofrance_arome_france 1,6 nd (n 6) · ecmwf_ifs025 2,2 nd (n 6) · meteofrance_arpege_europe 2,3 nd (n 6) · icon_eu 2,4 nd (n 6)
- LFTH : icon_eu 1,9 nd (n 6) · meteofrance_arpege_europe 2,0 nd (n 6) · ecmwf_ifs025 2,4 nd (n 6) · meteofrance_arome_france_hd 2,7 nd (n 6) · meteofrance_arome_france 2,7 nd (n 6) · gfs_seamless 4,4 nd (n 6)
- LFML : icon_eu 1,6 nd (n 6) · meteofrance_arome_france_hd 1,7 nd (n 6) · meteofrance_arome_france 2,0 nd (n 6) · ecmwf_ifs025 2,0 nd (n 6) · gfs_seamless 4,8 nd (n 6) · meteofrance_arpege_europe 6,5 nd (n 6)
