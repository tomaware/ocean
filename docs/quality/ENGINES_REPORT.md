# Rapport d'analyse (② ANALYSE)

Généré le 2026-11-10 00:00 UTC par `pipeline/engines/run.ts`, juste après la collecte.

Les moteurs des apps actuelles (copies non modifiées dans `legacy/`) sont alimentés par la collecte commune. Le test golden refait le calcul comme les apps actuelles, avec leurs propres parseurs sur les mêmes réponses brutes, et exige les mêmes notes à ±0.1.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| golden-surf | ✅ | 4152 valeurs (note, hauteur, vent × 8 spots), écart max 0 ; créneaux identiques (tolérance 0.1) |
| golden-downwind | ✅ | 1440 valeurs (vent, houle, 3 notes × 3 parcours), écart max 0 ; créneaux identiques ; correction du vent identique (tolérance 0.1) |
| correction-vent-downwind | ✅ | 2 spot(s) de recalage : La Grande-Motte 53 h (× 1.17 en moyenne), Port Camargue 55 h (× 1.07 en moyenne) + relevé récent |
| sorties-surf | ✅ | 8/8 spots notés ; 12 créneaux |
| sorties-downwind | ✅ | 3/3 parcours notés ; 0 meilleurs créneaux |
| ecart-prod-surf | ✅ | notes surf OCEAN vs app en service (calcul prod. 20 min avant, prod avec Copernicus) : médiane 0.20, 90 % ≤ 1.10, max 3.50 sur 1328 heures |
| ecart-prod-downwind | ✅ | notes downwind (intermédiaire, de jour) OCEAN vs app en service (calcul prod. 6 min avant) : médiane 0.00, 90 % ≤ 0.00, max 0.00 sur 120 heures |
| sorties-wing | ✅ | 6 spots notés (wing v1.0.0) ; 4 session(s) 2H en intermédiaire sur les heures prévues |
| confidentialite-moteurs | ✅ | aucun relevé Winds-Up ni clé dans les sorties (seuls les facteurs de correction dérivés y figurent, comme dans l’app downwind actuelle) |

## Meilleurs créneaux surf (7 jours)

| Quand | Spot | Note moyenne | Pic |
|---|---|---|---|
| ven. 13 08:00 → ven. 13 18:00 | Carnon | 9.44 | 9.58 |
| ven. 13 08:00 → ven. 13 18:00 | Palavas-les-Flots | 8.84 | 9.59 |
| dim. 15 08:00 → dim. 15 18:00 | Platja de Perafita | 7.74 | 8.46 |
| dim. 15 08:00 → dim. 15 18:00 | Paulilles | 7.43 | 8.47 |
| lun. 16 08:00 → lun. 16 18:00 | Palavas-les-Flots | 6.91 | 7.57 |

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

### Détail (toutes les 2 h de jour, intermédiaire)

Vent en nœuds (rafales) · d'où il vient · secteur · note · ce qui limite.

**La Franqui** — mar. 10 09:00 8 (13) NO offshore **0** pas assez de vent · mar. 10 11:00 9 (12) NNE side **0** pas assez de vent · mar. 10 13:00 6 (10) NE side-on **0** pas assez de vent · mar. 10 15:00 5 (9) ENE side-on **0** pas assez de vent · mar. 10 17:00 5 (9) ENE side-on **0** pas assez de vent · mer. 11 09:00 3 (4) ONO offshore **0** pas assez de vent · mer. 11 11:00 1 (5) NNE side **0** pas assez de vent · mer. 11 13:00 2 (4) NE side-on **0** pas assez de vent · mer. 11 15:00 6 (8) ENE side-on **0** pas assez de vent · mer. 11 17:00 3 (6) ESE onshore **0** pas assez de vent · jeu. 12 09:00 9 (13) ONO offshore **0** pas assez de vent · jeu. 12 11:00 18 (31) ONO offshore **0** vent de terre : danger, dérive au large · jeu. 12 13:00 22 (37) ONO offshore **0** vent de terre : danger, dérive au large · jeu. 12 15:00 19 (34) ONO offshore **0** vent de terre : danger, dérive au large · jeu. 12 17:00 22 (39) ONO offshore **0** trop de vent · ven. 13 09:00 20 (33) ONO offshore **0** vent de terre : danger, dérive au large · ven. 13 11:00 18 (31) ONO offshore **0** vent de terre : danger, dérive au large · ven. 13 13:00 20 (33) NO offshore **0** vent de terre : danger, dérive au large · ven. 13 15:00 21 (35) NO offshore **0** vent de terre : danger, dérive au large · ven. 13 17:00 19 (33) NO offshore **0** vent de terre : danger, dérive au large

**La Grande-Motte** — mar. 10 09:00 11 (17) NNE offshore **0** vent de terre : danger, dérive au large · mar. 10 11:00 10 (16) NNE offshore **0** vent de terre : danger, dérive au large · mar. 10 13:00 9 (17) NE side-off **0.8** side-off (dérive vers le large) · mar. 10 15:00 7 (12) NNE offshore **0** pas assez de vent · mar. 10 17:00 6 (11) NNE offshore **0** pas assez de vent · mer. 11 09:00 7 (14) NNE offshore **0** pas assez de vent · mer. 11 11:00 6 (11) N offshore **0** pas assez de vent · mer. 11 13:00 6 (11) NNO offshore **0** pas assez de vent · mer. 11 15:00 5 (10) NNE offshore **0** pas assez de vent · mer. 11 17:00 3 (7) N offshore **0** pas assez de vent · jeu. 12 09:00 13 (22) SSE onshore **4.3** vent rafaleux · jeu. 12 11:00 11 (18) SSE onshore **4.6** vent rafaleux · jeu. 12 13:00 13 (17) NO offshore **0** vent de terre : danger, dérive au large · jeu. 12 15:00 18 (28) ONO side-off **2** side-off (dérive vers le large) · jeu. 12 17:00 15 (21) O side-off **2.6** side-off (dérive vers le large) · ven. 13 09:00 15 (22) N offshore **0** vent de terre : danger, dérive au large · ven. 13 11:00 17 (26) N offshore **0** vent de terre : danger, dérive au large · ven. 13 13:00 15 (23) N offshore **0** vent de terre : danger, dérive au large · ven. 13 15:00 12 (22) N offshore **0** vent de terre : danger, dérive au large · ven. 13 17:00 11 (18) N offshore **0** vent de terre : danger, dérive au large

**Le Ponant** — mar. 10 09:00 6 (10) NNE  **0** pas assez de vent · mar. 10 11:00 6 (9) NNE  **0** pas assez de vent · mar. 10 13:00 5 (9) NE  **0** pas assez de vent · mar. 10 15:00 3 (8) NE  **0** pas assez de vent · mar. 10 17:00 3 (6) NNE  **0** pas assez de vent · mer. 11 09:00 4 (7) N  **0** pas assez de vent · mer. 11 11:00 4 (7) N  **0** pas assez de vent · mer. 11 13:00 3 (7) N  **0** pas assez de vent · mer. 11 15:00 3 (5) NNE  **0** pas assez de vent · mer. 11 17:00 2 (3) NNE  **0** pas assez de vent · jeu. 12 09:00 8 (13) SSE  **0** pas assez de vent · jeu. 12 11:00 4 (9) SE  **0** pas assez de vent · jeu. 12 13:00 6 (9) ONO  **0** pas assez de vent · jeu. 12 15:00 9 (12) NO  **0** pas assez de vent · jeu. 12 17:00 9 (14) ONO  **1.1** pas assez de vent · ven. 13 09:00 5 (5) NNE  **0** pas assez de vent · ven. 13 11:00 10 (14) N  **1.7** pas assez de vent · ven. 13 13:00 10 (16) N  **2.4** vent rafaleux · ven. 13 15:00 9 (15) N  **1.1** pas assez de vent · ven. 13 17:00 8 (14) NNE  **0** pas assez de vent

**Port Camargue / Espiguette** — mar. 10 09:00 9 (16) NNE offshore **0** vent de terre : danger, dérive au large · mar. 10 11:00 10 (16) NNE offshore **0** vent de terre : danger, dérive au large · mar. 10 13:00 8 (16) NE offshore **0** vent de terre : danger, dérive au large · mar. 10 15:00 7 (12) NE offshore **0** pas assez de vent · mar. 10 17:00 6 (10) NNE offshore **0** pas assez de vent · mer. 11 09:00 7 (11) NNE offshore **0** pas assez de vent · mer. 11 11:00 6 (11) N offshore **0** pas assez de vent · mer. 11 13:00 5 (9) NNO offshore **0** pas assez de vent · mer. 11 15:00 5 (8) NNE offshore **0** pas assez de vent · mer. 11 17:00 1 (5) N offshore **0** pas assez de vent · jeu. 12 09:00 17 (24) SSE side-on **8.5** vent rafaleux · jeu. 12 11:00 15 (23) SSE side-on **6.9** vent rafaleux · jeu. 12 13:00 13 (18) NO side-off **2.7** side-off (dérive vers le large) · jeu. 12 15:00 16 (25) ONO side **6.5** vent rafaleux · jeu. 12 17:00 10 (15) ONO side **3.7** pas assez de vent · ven. 13 09:00 15 (20) N offshore **0** vent de terre : danger, dérive au large · ven. 13 11:00 19 (27) N offshore **0** vent de terre : danger, dérive au large · ven. 13 13:00 18 (29) N offshore **0** vent de terre : danger, dérive au large · ven. 13 15:00 15 (23) N offshore **0** vent de terre : danger, dérive au large · ven. 13 17:00 14 (19) N offshore **0** vent de terre : danger, dérive au large

**Beauduc** — mar. 10 09:00 9 (13) E offshore **0** pas assez de vent · mar. 10 11:00 8 (11) NE offshore **0** pas assez de vent · mar. 10 13:00 10 (15) E offshore **0** vent de terre : danger, dérive au large · mar. 10 15:00 9 (13) ESE offshore **0** pas assez de vent · mar. 10 17:00 7 (11) ESE offshore **0** pas assez de vent · mer. 11 09:00 9 (12) ENE offshore **0** pas assez de vent · mer. 11 11:00 4 (8) N side-off **0** pas assez de vent · mer. 11 13:00 6 (8) NNO side **0** pas assez de vent · mer. 11 15:00 6 (7) NO side-on **0** pas assez de vent · mer. 11 17:00 4 (4) OSO onshore **0** pas assez de vent · jeu. 12 09:00 19 (28) S side-on **7.7** vent rafaleux · jeu. 12 11:00 18 (24) S side-on **9.6** vent rafaleux · jeu. 12 13:00 11 (17) S side-on **6.7** vent rafaleux · jeu. 12 15:00 7 (7) O onshore **0** pas assez de vent · jeu. 12 17:00 10 (16) ONO side-on **4** vent rafaleux · ven. 13 09:00 19 (28) NNO side **7.7** vent rafaleux · ven. 13 11:00 22 (30) NNO side **6.1** trop de vent · ven. 13 13:00 24 (34) NNO side **1.4** trop de vent · ven. 13 15:00 24 (35) NNO side **0.7** trop de vent · ven. 13 17:00 23 (34) NNO side **1.9** trop de vent

**Almanarre (Hyères)** — mar. 10 09:00 4 (6) N side-off **0** pas assez de vent · mar. 10 11:00 4 (5) N side-off **0** pas assez de vent · mar. 10 13:00 4 (7) NE offshore **0** pas assez de vent · mar. 10 15:00 6 (8) E offshore **0** pas assez de vent · mar. 10 17:00 7 (9) E offshore **0** pas assez de vent · mer. 11 09:00 4 (6) S side-on **0** pas assez de vent · mer. 11 11:00 7 (9) SSO side-on **0** pas assez de vent · mer. 11 13:00 6 (11) SO onshore **0** pas assez de vent · mer. 11 15:00 4 (7) OSO onshore **0** pas assez de vent · mer. 11 17:00 2 (3) OSO onshore **0** pas assez de vent · jeu. 12 09:00 7 (11) S side-on **0** pas assez de vent · jeu. 12 11:00 7 (14) SSE side **0** pas assez de vent · jeu. 12 13:00 8 (13) S side-on **0** pas assez de vent · jeu. 12 15:00 5 (12) SSO side-on **0** pas assez de vent · jeu. 12 17:00 3 (4) OSO onshore **0** pas assez de vent · ven. 13 09:00 7 (12) O onshore **0** pas assez de vent · ven. 13 11:00 6 (9) OSO onshore **0** pas assez de vent · ven. 13 13:00 6 (9) O onshore **0** pas assez de vent · ven. 13 15:00 5 (9) O onshore **0** pas assez de vent · ven. 13 17:00 2 (4) ONO side-on **0** pas assez de vent


À ce stade (M2) : Copernicus n'est pas inclus (les apps actuelles l'utilisent quand il est frais) ; la note wing (v1.0, validée le 10/11) part du vent corrigé de la super prévision ; pas de note kite (décision de Tom).
