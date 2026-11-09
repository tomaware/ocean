# Rapport d'analyse (② ANALYSE)

Généré le 2026-11-09 23:49 UTC par `pipeline/engines/run.ts`, juste après la collecte.

Les moteurs des apps actuelles (copies non modifiées dans `legacy/`) sont alimentés par la collecte commune. Le test golden refait le calcul comme les apps actuelles, avec leurs propres parseurs sur les mêmes réponses brutes, et exige les mêmes notes à ±0.1.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| golden-surf | ✅ | 4152 valeurs (note, hauteur, vent × 8 spots), écart max 0 ; créneaux identiques (tolérance 0.1) |
| golden-downwind | ✅ | 1440 valeurs (vent, houle, 3 notes × 3 parcours), écart max 0 ; créneaux identiques ; correction du vent identique (tolérance 0.1) |
| correction-vent-downwind | ✅ | 2 spot(s) de recalage : undefined 53 h, undefined 55 h |
| sorties-surf | ✅ | 8/8 spots notés ; 12 créneaux |
| sorties-downwind | ✅ | 3/3 parcours notés ; 0 meilleurs créneaux |
| confidentialite-moteurs | ✅ | aucun relevé Winds-Up ni clé dans les sorties (seuls les facteurs de correction dérivés y figurent, comme dans l’app downwind actuelle) |

## Meilleurs créneaux surf (7 jours)

| Quand | Spot | Note moyenne | Pic |
|---|---|---|---|
| ven. 13 08:00 → ven. 13 18:00 | Carnon | 9.42 | 9.58 |
| ven. 13 08:00 → ven. 13 18:00 | Palavas-les-Flots | 8.59 | 9.57 |
| dim. 15 08:00 → dim. 15 18:00 | Platja de Perafita | 7.74 | 8.45 |
| dim. 15 08:00 → dim. 15 18:00 | Paulilles | 7.42 | 8.46 |
| lun. 16 08:00 → lun. 16 18:00 | Sète (Lazaret / Fontaine) | 6.83 | 7.49 |

## Meilleurs créneaux downwind (4 jours)

| Quand | Parcours | Note moyenne | Pic |
|---|---|---|---|

À ce stade (M2) : Copernicus n'est pas inclus (les apps actuelles l'utilisent quand il est frais) ; le vent wing/kite reste celui de la super prévision (Apps Script), en attendant la formule de note validée (D-14).
