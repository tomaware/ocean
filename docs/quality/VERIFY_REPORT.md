# Remise en question (③)

Généré le 2026-11-11 18:51 UTC par `pipeline/verify/run.ts`.

Erreur = prévu − mesuré. Vent en m/s aux stations METAR (aéroports), vagues : hauteur significative en m aux bouées Candhis. « courtTerme » = modèles sur les 3 derniers jours (pas une vraie prévision) ; « archive » = prévisions réellement émises N h avant.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| court-terme | ✅ | 25 couples station × modèle (vent), 20 couples bouée × modèle (vagues) comparés aux mesures des 3 derniers jours |
| archive | ✅ | 13 prévisions archivées sur 42 h ; 1445 comparaisons prévu / mesuré à échéance (l'archive se remplit : 30 jours pour un bilan complet) |
| calibration-moteurs | ✅ | moteur vagues recalé sur 5 bouée(s) ; vent downwind recalé sur 2 spot(s) de la super prévision |

## Vent : modèles classés par erreur moyenne (3 derniers jours, en nœuds)

| Station | Classement |
|---|---|
| LFMT | gfs_seamless 1,3 · meteofrance_arome_france 1,5 · icon_eu 1,5 · meteofrance_arpege_europe 1,6 · icon_d2 1,7 · meteofrance_arome_france_hd 1,8 · ecmwf_ifs025 3,4 |
| LFMP | ecmwf_ifs025 1,2 · icon_eu 1,4 · gfs_seamless 1,4 · meteofrance_arpege_europe 1,4 · meteofrance_arome_france 1,5 · meteofrance_arome_france_hd 1,5 |
| LFTH | icon_eu 2,1 · ecmwf_ifs025 2,4 · meteofrance_arome_france_hd 2,9 · meteofrance_arome_france 2,9 · meteofrance_arpege_europe 3,4 · gfs_seamless 3,5 |
| LFML | meteofrance_arome_france_hd 1,9 · meteofrance_arome_france 2,0 · ecmwf_ifs025 2,0 · icon_eu 2,4 · meteofrance_arpege_europe 3,0 · gfs_seamless 3,6 |

## Vagues : modèles classés par erreur moyenne (3 derniers jours, en m)

| Bouée | Classement |
|---|---|
| 03001 | ewam 0.18 · gwam 0.21 · meteofrance_wave 0.28 · ecmwf_wam025 0.28 · ncep_gfswave025 1.40 |
| 03404 | gwam 0.13 · ewam 0.16 · ncep_gfswave025 0.18 · ecmwf_wam025 0.19 · meteofrance_wave 0.24 |
| 01102 | ecmwf_wam025 0.18 · ewam 0.21 · meteofrance_wave 0.42 · gwam 0.46 · ncep_gfswave025 1.22 |
| 01101 | gwam 0.09 · ecmwf_wam025 0.13 · ncep_gfswave025 0.13 · ewam 0.15 · meteofrance_wave 0.25 |

## Ce que les moteurs en font

- Vagues : chaque modèle reçoit un poids et un facteur de biais appris aux bouées (moteur surf, inchangé).
  - 03001 : meteofrance_wave poids 9.45, ×1.16 (MAE 0.29 m, n 179) ; ecmwf_wam025 poids 8.6, ×1.11 (MAE 0.28 m, n 179) ; ewam poids 12.34, ×1.07 (MAE 0.2 m, n 179) ; gwam poids 6.65, ×1.03 (MAE 0.22 m, n 179) ; copernicus poids 19.84, ×1 (MAE 0.17 m, n 104)
  - 03404 : meteofrance_wave poids 13.1, ×1.14 (MAE 0.23 m, n 141) ; ecmwf_wam025 poids 14.92, ×1.08 (MAE 0.16 m, n 141) ; ewam poids 15.94, ×1.03 (MAE 0.15 m, n 141) ; gwam poids 9.4, ×1.05 (MAE 0.15 m, n 141) ; ncep_gfswave025 poids 7.88, ×1.08 (MAE 0.19 m, n 141) ; copernicus poids 28.93, ×1 (MAE 0.09 m, n 63)
  - 01102 : meteofrance_wave poids —, ×— (MAE 0.46 m, n 76) ; ecmwf_wam025 poids —, ×— (MAE 0.26 m, n 76) ; ewam poids —, ×— (MAE 0.37 m, n 76) ; gwam poids —, ×— (MAE 0.53 m, n 76) ; copernicus poids —, ×— (MAE 0.4 m, n 1)
  - 01101 : meteofrance_wave poids 10.51, ×1.25 (MAE 0.27 m, n 182) ; ecmwf_wam025 poids 17.29, ×0.98 (MAE 0.13 m, n 182) ; ewam poids 12.29, ×1.11 (MAE 0.2 m, n 182) ; gwam poids 9.28, ×1.11 (MAE 0.16 m, n 182) ; ncep_gfswave025 poids 9.33, ×1.04 (MAE 0.16 m, n 182) ; copernicus poids 29.95, ×1.01 (MAE 0.08 m, n 104)
  - 06601 : 
- Vent downwind : La Grande-Motte × 1.03, Port Camargue × 0.97 (super prévision + relevé récent).

## Prévisions archivées (vraie échéance)

13 prévisions archivées. Classement à 24 h :

- LFMT : meteofrance_arpege_europe 1,8 nd (n 7) · gfs_seamless 1,9 nd (n 7) · ecmwf_ifs025 2,1 nd (n 7) · meteofrance_arome_france 2,2 nd (n 7) · icon_d2 2,2 nd (n 7) · meteofrance_arome_france_hd 2,3 nd (n 7) · icon_eu 2,4 nd (n 7)
- LFMP : ecmwf_ifs025 1,2 nd (n 7) · meteofrance_arome_france 1,3 nd (n 7) · meteofrance_arome_france_hd 1,3 nd (n 7) · icon_eu 1,5 nd (n 7) · gfs_seamless 1,9 nd (n 7) · meteofrance_arpege_europe 2,0 nd (n 7)
- LFTH : icon_eu 1,9 nd (n 7) · meteofrance_arome_france 2,1 nd (n 7) · meteofrance_arome_france_hd 2,1 nd (n 7) · ecmwf_ifs025 2,3 nd (n 7) · meteofrance_arpege_europe 2,7 nd (n 7) · gfs_seamless 3,5 nd (n 7)
- LFML : 
