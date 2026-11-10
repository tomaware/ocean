# Rapport d'analyse (② ANALYSE)

Généré le 2026-11-10 13:59 UTC par `pipeline/engines/run.ts`, juste après la collecte.

Les moteurs des apps actuelles (copies non modifiées dans `legacy/`) sont alimentés par la collecte commune. Le test golden refait le calcul comme les apps actuelles, avec leurs propres parseurs sur les mêmes réponses brutes, et exige les mêmes notes à ±0.1.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| golden-surf | ✅ | 4152 valeurs (note, hauteur, vent × 8 spots), écart max 0 ; créneaux identiques (tolérance 0.1) |
| golden-downwind | ✅ | 1440 valeurs (vent, houle, 3 notes × 3 parcours), écart max 0 ; créneaux identiques ; correction du vent identique (tolérance 0.1) |
| correction-vent-downwind | ✅ | 2 spot(s) de recalage : La Grande-Motte 47 h (× 1.14 en moyenne) + relevé récent, Port Camargue 51 h (× 1.03 en moyenne) + relevé récent |
| sorties-surf | ✅ | 8/8 spots notés ; 12 créneaux |
| sorties-downwind | ✅ | 3/3 parcours notés ; 1 meilleurs créneaux |
| ecart-prod-surf | ✅ | notes surf OCEAN vs app en service (calcul prod. 59 min avant, même extrait Copernicus) : médiane 0.10, 90 % ≤ 1.00, max 2.50 sur 1336 heures (max : canet sam. 08:00, OCEAN 2.5 / prod 0) |
| ecart-prod-downwind | ✅ | notes downwind (intermédiaire, de jour) OCEAN vs app en service (calcul prod. 31 min avant) : médiane 0.00, 90 % ≤ 0.00, max 0.00 sur 117 heures |
| sorties-wing | ✅ | 6 spots notés (wing v2.0.0) ; 3 session(s) 2H en mode Sécu first sur les heures prévues |
| confidentialite-moteurs | ✅ | aucun relevé Winds-Up ni clé dans les sorties (seuls les facteurs de correction dérivés y figurent, comme dans l’app downwind actuelle) |
| copernicus-surf | ✅ | Copernicus Med-WAV inclus dans le moteur surf (comme l’app en service) |

## Meilleurs créneaux surf (7 jours)

| Quand | Spot | Note moyenne | Pic |
|---|---|---|---|
| ven. 13 08:00 → ven. 13 18:00 | Carnon | 9.49 | 9.74 |
| ven. 13 08:00 → ven. 13 18:00 | Palavas-les-Flots | 8.82 | 9.7 |
| dim. 15 08:00 → dim. 15 18:00 | Platja de Perafita | 7.92 | 8.34 |
| dim. 15 08:00 → dim. 15 18:00 | Paulilles | 7.73 | 8.6 |
| lun. 16 08:00 → lun. 16 18:00 | Carnon | 7.75 | 8.01 |

## Meilleurs créneaux downwind (4 jours)

| Quand | Parcours | Note moyenne | Pic |
|---|---|---|---|
| jeu. 12 08:00 → jeu. 12 12:00 | Plage Sud (Port Camargue) → La Grande-Motte | 7.4 | 7.8 |

## Wing foil — sessions 2H (mode Sécu first, vent corrigé de la super prévision)

| Spot | Créneaux |
|---|---|
| La Franqui | aucun |
| La Grande-Motte | aucun |
| Le Ponant | jeu. 12 08:00 → jeu. 12 12:00 : Ça envoie (moy. 6.3, pic 7.3) |
| Port Camargue / Espiguette | jeu. 12 08:00 → jeu. 12 12:00 : Ça envoie (moy. 7.1, pic 8.1) |
| Beauduc | ven. 13 10:00 → ven. 13 18:00 : Ça envoie (moy. 8.7, pic 9.3) |
| Almanarre (Hyères) | aucun |

### Détail (toutes les 2 h de jour, Sécu first)

Vent en nœuds (rafales) · d'où il vient · secteur · note · ce qui limite.

**La Franqui** — mar. 10 15:00 3 (6) NE side-on **0** pas assez de vent · mar. 10 17:00 0 (3) S side **0** pas assez de vent · mer. 11 09:00 4 (6) NO offshore **0** vent de terre : dérive au large · mer. 11 11:00 1 (5) NNE side **0** pas assez de vent · mer. 11 13:00 4 (6) ESE onshore **0** pas assez de vent · mer. 11 15:00 4 (7) E onshore **0** pas assez de vent · mer. 11 17:00 4 (5) ENE side-on **0** pas assez de vent · jeu. 12 09:00 11 (17) ONO offshore **0** vent de terre : dérive au large · jeu. 12 11:00 16 (28) ONO offshore **0** vent de terre : dérive au large · jeu. 12 13:00 21 (38) ONO offshore **0** vent de terre : dérive au large · jeu. 12 15:00 23 (38) ONO offshore **0** vent de terre : dérive au large · jeu. 12 17:00 23 (44) ONO offshore **0** vent de terre : dérive au large · ven. 13 09:00 17 (26) ONO offshore **0** vent de terre : dérive au large · ven. 13 11:00 16 (26) ONO offshore **0** vent de terre : dérive au large · ven. 13 13:00 17 (27) NO offshore **0** vent de terre : dérive au large · ven. 13 15:00 15 (26) NO offshore **0** vent de terre : dérive au large · ven. 13 17:00 13 (23) NO offshore **0** vent de terre : dérive au large

**La Grande-Motte** — mar. 10 15:00 7 (16) NNE offshore **0** vent de terre : dérive au large · mar. 10 17:00 6 (12) NNE offshore **0** vent de terre : dérive au large · mer. 11 09:00 6 (12) NNE offshore **0** vent de terre : dérive au large · mer. 11 11:00 7 (13) N offshore **0** vent de terre : dérive au large · mer. 11 13:00 5 (11) N offshore **0** vent de terre : dérive au large · mer. 11 15:00 4 (8) N offshore **0** vent de terre : dérive au large · mer. 11 17:00 4 (6) ENE side **0** pas assez de vent · jeu. 12 09:00 19 (31) SE onshore **4.6** vent rafaleux · jeu. 12 11:00 13 (23) SE onshore **3.9** vent rafaleux · jeu. 12 13:00 10 (16) NO offshore **0** vent de terre : dérive au large · jeu. 12 15:00 10 (16) O side-off **0** side-off (dérive vers le large) · jeu. 12 17:00 16 (22) OSO side **9** vent rafaleux · ven. 13 09:00 12 (17) N offshore **0** vent de terre : dérive au large · ven. 13 11:00 13 (21) N offshore **0** vent de terre : dérive au large · ven. 13 13:00 12 (19) N offshore **0** vent de terre : dérive au large · ven. 13 15:00 12 (19) N offshore **0** vent de terre : dérive au large · ven. 13 17:00 9 (16) N offshore **0** vent de terre : dérive au large

**Le Ponant** — mar. 10 15:00 4 (7) NE  **0** pas assez de vent · mar. 10 17:00 3 (6) NNE  **0** pas assez de vent · mer. 11 09:00 3 (5) NNE  **0** pas assez de vent · mer. 11 11:00 4 (7) N  **0** pas assez de vent · mer. 11 13:00 3 (6) N  **0** pas assez de vent · mer. 11 15:00 2 (5) NNE  **0** pas assez de vent · mer. 11 17:00 2 (3) ENE  **0** pas assez de vent · jeu. 12 09:00 15 (23) SE  **6.9** vent rafaleux · jeu. 12 11:00 15 (26) SE  **5.1** vent rafaleux · jeu. 12 13:00 8 (20) SE  **2.7** vent rafaleux · jeu. 12 15:00 4 (6) O  **0** pas assez de vent · jeu. 12 17:00 5 (9) OSO  **0** pas assez de vent · ven. 13 09:00 6 (8) N  **0** pas assez de vent · ven. 13 11:00 7 (11) N  **0** pas assez de vent · ven. 13 13:00 6 (9) N  **0** pas assez de vent · ven. 13 15:00 7 (11) N  **0** pas assez de vent · ven. 13 17:00 6 (10) NNE  **0** pas assez de vent · sam. 14 09:00 6 (8) NNE  **0** pas assez de vent · sam. 14 11:00 4 (8) NNE  **0** pas assez de vent · sam. 14 13:00 3 (6) NE  **0** pas assez de vent

**Port Camargue / Espiguette** — mar. 10 15:00 6 (13) NE offshore **0** vent de terre : dérive au large · mar. 10 17:00 5 (10) NE offshore **0** vent de terre : dérive au large · mer. 11 09:00 6 (10) NNE offshore **0** vent de terre : dérive au large · mer. 11 11:00 7 (11) N offshore **0** vent de terre : dérive au large · mer. 11 13:00 4 (11) N offshore **0** vent de terre : dérive au large · mer. 11 15:00 2 (6) NO side-off **0** side-off (dérive vers le large) · mer. 11 17:00 3 (4) NE offshore **0** vent de terre : dérive au large · jeu. 12 09:00 22 (34) SE side-on **6.7** vent rafaleux · jeu. 12 11:00 15 (23) SSE side-on **6.9** vent rafaleux · jeu. 12 13:00 10 (15) NO side-off **0** side-off (dérive vers le large) · jeu. 12 15:00 9 (16) ONO side **0.8** pas assez de vent · jeu. 12 17:00 14 (23) OSO side-on **5.7** vent rafaleux · ven. 13 09:00 10 (15) N offshore **0** vent de terre : dérive au large · ven. 13 11:00 14 (20) N offshore **0** vent de terre : dérive au large · ven. 13 13:00 14 (21) N offshore **0** vent de terre : dérive au large · ven. 13 15:00 13 (20) N offshore **0** vent de terre : dérive au large · ven. 13 17:00 12 (17) N offshore **0** vent de terre : dérive au large

**Beauduc** — mar. 10 15:00 12 (17) ESE offshore **0** vent de terre : dérive au large · mar. 10 17:00 13 (18) SE side-off **0** side-off (dérive vers le large) · mer. 11 09:00 8 (11) NE offshore **0** vent de terre : dérive au large · mer. 11 11:00 7 (10) N side-off **0** side-off (dérive vers le large) · mer. 11 13:00 7 (11) NNO side **0** pas assez de vent · mer. 11 15:00 6 (8) NO side-on **0** pas assez de vent · mer. 11 17:00 3 (7) O onshore **0** pas assez de vent · jeu. 12 09:00 26 (35) SE side-off **0** side-off (dérive vers le large) · jeu. 12 11:00 28 (41) SE side-off **0** side-off (dérive vers le large) · jeu. 12 13:00 21 (33) SE side-off **0** side-off (dérive vers le large) · jeu. 12 15:00 7 (16) SSE side **0** pas assez de vent · jeu. 12 17:00 10 (13) O onshore **0** pas assez de vent · ven. 13 09:00 16 (25) N side-off **0** side-off (dérive vers le large) · ven. 13 11:00 17 (24) NNO side **8.5** vent rafaleux · ven. 13 13:00 20 (27) NNO side **9.3** vent rafaleux · ven. 13 15:00 20 (27) NNO side **9.3** vent rafaleux · ven. 13 17:00 18 (26) NNO side **8.1** vent rafaleux · sam. 14 09:00 13 (19) NNE side-off **0** side-off (dérive vers le large) · sam. 14 11:00 8 (14) NNE side-off **0** side-off (dérive vers le large) · sam. 14 13:00 11 (16) SSE side **4** pas assez de vent

**Almanarre (Hyères)** — mar. 10 15:00 10 (13) E offshore **0** vent de terre : dérive au large · mar. 10 17:00 8 (11) E offshore **0** vent de terre : dérive au large · mer. 11 09:00 4 (5) SSO side-on **0** pas assez de vent · mer. 11 11:00 7 (12) SO onshore **0** pas assez de vent · mer. 11 13:00 6 (9) SO onshore **0** pas assez de vent · mer. 11 15:00 3 (6) SO onshore **0** pas assez de vent · mer. 11 17:00 2 (3) O onshore **0** pas assez de vent · jeu. 12 09:00 8 (15) E offshore **0** vent de terre : dérive au large · jeu. 12 11:00 7 (12) E offshore **0** vent de terre : dérive au large · jeu. 12 13:00 8 (12) S side-on **0** pas assez de vent · jeu. 12 15:00 5 (11) S side-on **0** pas assez de vent · jeu. 12 17:00 3 (4) NO side-on **0** pas assez de vent · ven. 13 09:00 7 (9) O onshore **0** pas assez de vent · ven. 13 11:00 6 (8) O onshore **0** pas assez de vent · ven. 13 13:00 7 (11) O onshore **0** pas assez de vent · ven. 13 15:00 6 (9) O onshore **0** pas assez de vent · ven. 13 17:00 5 (7) O onshore **0** pas assez de vent


Copernicus Med-WAV est inclus pour le surf quand l'extrait a moins de 30 h (même règle que l'app en service) ; la note wing (v2.0, modes Sécu first / Offshore) part du vent corrigé de la super prévision ; pas de note kite (décision de Tom).
