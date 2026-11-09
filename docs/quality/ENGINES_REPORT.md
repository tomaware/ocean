# Rapport d'analyse (② ANALYSE)

Généré le 2026-11-09 23:59 UTC par `pipeline/engines/run.ts`, juste après la collecte.

Les moteurs des apps actuelles (copies non modifiées dans `legacy/`) sont alimentés par la collecte commune. Le test golden refait le calcul comme les apps actuelles, avec leurs propres parseurs sur les mêmes réponses brutes, et exige les mêmes notes à ±0.1.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| golden-surf | ✅ | 4152 valeurs (note, hauteur, vent × 8 spots), écart max 0 ; créneaux identiques (tolérance 0.1) |
| golden-downwind | ✅ | 1440 valeurs (vent, houle, 3 notes × 3 parcours), écart max 0 ; créneaux identiques ; correction du vent identique (tolérance 0.1) |
| correction-vent-downwind | ✅ | 2 spot(s) de recalage : La Grande-Motte 53 h (× 1.17 en moyenne), Port Camargue 55 h (× 1.07 en moyenne) + relevé récent |
| sorties-surf | ✅ | 8/8 spots notés ; 12 créneaux |
| sorties-downwind | ✅ | 3/3 parcours notés ; 0 meilleurs créneaux |
| ecart-prod-surf | ✅ | notes surf OCEAN vs app en service (calcul prod. 19 min avant, prod avec Copernicus) : médiane 0.20, 90 % ≤ 1.00, max 3.00 sur 1336 heures |
| ecart-prod-downwind | ✅ | notes downwind (intermédiaire, de jour) OCEAN vs app en service (calcul prod. 5 min avant) : médiane 0.00, 90 % ≤ 0.00, max 0.00 sur 120 heures |
| sorties-wing | ✅ | 6 spots notés (wing v1.0.0) ; 4 session(s) 2H en intermédiaire sur les heures prévues |
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

## Wing foil — sessions 2H (niveau intermédiaire, vent corrigé de la super prévision)

| Spot | Créneaux |
|---|---|
| La Franqui | aucun |
| La Grande-Motte | aucun |
| Le Ponant | aucun |
| Port Camargue / Espiguette | jeu. 12 09:00 → jeu. 12 12:00 : Ça envoie (moy. 8.2, pic 9.3) ; jeu. 12 14:00 → jeu. 12 16:00 : Ça envoie (moy. 7.9, pic 9.2) |
| Beauduc | jeu. 12 08:00 → jeu. 12 14:00 : Ça envoie (moy. 8.1, pic 9.6) ; ven. 13 09:00 → ven. 13 12:00 : Ça envoie (moy. 7.6, pic 9.1) |
| Almanarre (Hyères) | aucun |

À ce stade (M2) : Copernicus n'est pas inclus (les apps actuelles l'utilisent quand il est frais) ; la note wing (v1.0, validée le 10/11) part du vent corrigé de la super prévision ; pas de note kite (décision de Tom).
