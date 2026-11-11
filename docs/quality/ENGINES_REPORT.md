# Rapport d'analyse (② ANALYSE)

Généré le 2026-11-11 15:23 UTC par `pipeline/engines/run.ts`, juste après la collecte.

Les moteurs des apps actuelles (copies non modifiées dans `legacy/`) sont alimentés par la collecte commune. Le test golden refait le calcul comme les apps actuelles, avec leurs propres parseurs sur les mêmes réponses brutes, et exige les mêmes notes à ±0.1.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| golden-surf | ✅ | 3114 valeurs (note, hauteur, vent × 6 spots), écart max 0 ; créneaux identiques (tolérance 0.1) |
| golden-downwind | ✅ | 1440 valeurs (vent, houle, 3 notes × 3 parcours), écart max 0 ; créneaux identiques ; correction du vent identique (tolérance 0.1) |
| correction-vent-downwind | ✅ | 2 spot(s) de recalage : La Grande-Motte 53 h (× 1.04 en moyenne) + relevé récent, Port Camargue 58 h (× 1.06 en moyenne) + relevé récent |
| sorties-surf | ✅ | 6/6 spots notés ; 12 créneaux |
| houle-direction-downwind | ✅ | direction de la houle (affichage, carte) : 288/288 heures |
| sorties-downwind | ✅ | 3/3 parcours notés ; 1 meilleurs créneaux |
| ecart-prod-surf | ✅ | notes surf OCEAN vs app en service (calcul prod. 64 min avant, même extrait Copernicus) : médiane 0.00, 90 % ≤ 0.00, max 0.40 sur 664 heures (max : carnon mer. 17:00, OCEAN 4.3 / prod 4.7) |
| ecart-prod-downwind | ✅ | notes downwind (intermédiaire, de jour) OCEAN vs app en service (calcul prod. 13 min avant) : médiane 0.00, 90 % ≤ 0.00, max 2.60 sur 117 heures |
| sorties-wing | ✅ | 7 spots notés (wing v2.0.0) ; 3 session(s) 2H en mode Sécu first sur les heures prévues |
| confidentialite-moteurs | ✅ | aucun relevé Winds-Up ni clé dans les sorties (seuls les facteurs de correction dérivés y figurent, comme dans l’app downwind actuelle) |
| copernicus-surf | ✅ | Copernicus Med-WAV inclus dans le moteur surf (comme l’app en service) |

## Meilleurs créneaux surf (7 jours)

| Quand | Spot | Note moyenne | Pic |
|---|---|---|---|
| ven. 13 08:00 → ven. 13 18:00 | Carnon | 8.46 | 9.66 |
| ven. 13 08:00 → ven. 13 18:00 | Saintes-Maries-de-la-Mer | 8.47 | 9.59 |
| lun. 16 08:00 → lun. 16 18:00 | Saintes-Maries-de-la-Mer | 7.25 | 8.52 |
| ven. 13 08:00 → ven. 13 18:00 | Palavas-les-Flots | 7.1 | 8.54 |
| lun. 16 08:00 → lun. 16 18:00 | Carnon | 7.24 | 8.27 |

## Meilleurs créneaux downwind (4 jours)

| Quand | Parcours | Note moyenne | Pic |
|---|---|---|---|
| dim. 15 14:00 → dim. 15 16:00 | Plage Sud (Port Camargue) → La Grande-Motte | 8 | 8.6 |

## Wing foil — sessions 2H (mode Sécu first, vent corrigé de la super prévision)

| Spot | Créneaux |
|---|---|
| La Franqui | aucun |
| La Grande-Motte | jeu. 12 08:00 → jeu. 12 12:00 : Ça envoie (moy. 6.5, pic 7.9) |
| Le Ponant | aucun |
| Port Camargue / Espiguette | aucun |
| Beauduc | ven. 13 08:00 → ven. 13 18:00 : Ça envoie (moy. 8.8, pic 9.6) |
| Le Jaï | ven. 13 08:00 → ven. 13 18:00 : Ça envoie (moy. 6.4, pic 8.4) |
| Almanarre (Hyères) | aucun |

### Détail (toutes les 2 h de jour, Sécu first)

Vent en nœuds (rafales) · d'où il vient · secteur · note · ce qui limite.

**La Franqui** — mer. 11 17:00 5 (7) E onshore **0** pas assez de vent · jeu. 12 09:00 10 (24) SSE side-on **4** vent rafaleux · jeu. 12 11:00 13 (18) NO offshore **0** vent de terre : dérive au large · jeu. 12 13:00 18 (23) NO offshore **0** vent de terre : dérive au large · jeu. 12 15:00 20 (33) NO offshore **0** vent de terre : dérive au large · jeu. 12 17:00 14 (23) NO offshore **0** vent de terre : dérive au large · ven. 13 09:00 24 (33) ONO offshore **0** vent de terre : dérive au large · ven. 13 11:00 24 (33) ONO offshore **0** vent de terre : dérive au large · ven. 13 13:00 24 (34) ONO offshore **0** vent de terre : dérive au large · ven. 13 15:00 25 (44) NO offshore **0** vent de terre : dérive au large · ven. 13 17:00 24 (43) NO offshore **0** vent de terre : dérive au large · sam. 14 09:00 1 (2) NE side-on **0** pas assez de vent · sam. 14 11:00 4 (8) ENE side-on **0** pas assez de vent · sam. 14 13:00 8 (15) E onshore **0** pas assez de vent · sam. 14 15:00 7 (16) ENE side-on **0** pas assez de vent · sam. 14 17:00 9 (17) ENE side-on **1.4** pas assez de vent · dim. 15 09:00 9 (15) ONO offshore **0** vent de terre : dérive au large · dim. 15 11:00 7 (15) O offshore **0** vent de terre : dérive au large · dim. 15 13:00 2 (7) NO offshore **0** vent de terre : dérive au large

**La Grande-Motte** — mer. 11 17:00 5 (12) NE side-off **0** side-off (dérive vers le large) · jeu. 12 09:00 14 (21) SE onshore **5.9** vent rafaleux · jeu. 12 11:00 13 (18) S onshore **7.1** vent de mer (face à la plage) · jeu. 12 13:00 9 (15) N offshore **0** vent de terre : dérive au large · jeu. 12 15:00 4 (11) NNO offshore **0** vent de terre : dérive au large · jeu. 12 17:00 12 (20) O side-off **0** side-off (dérive vers le large) · ven. 13 09:00 8 (15) N offshore **0** vent de terre : dérive au large · ven. 13 11:00 9 (20) NNO offshore **0** vent de terre : dérive au large · ven. 13 13:00 10 (17) N offshore **0** vent de terre : dérive au large · ven. 13 15:00 14 (21) N offshore **0** vent de terre : dérive au large · ven. 13 17:00 12 (19) NNE offshore **0** vent de terre : dérive au large · sam. 14 09:00 7 (7) N offshore **0** vent de terre : dérive au large · sam. 14 11:00 6 (6) ENE side **0** pas assez de vent · sam. 14 13:00 6 (9) NO offshore **0** vent de terre : dérive au large · sam. 14 15:00 7 (9) NNE offshore **0** vent de terre : dérive au large · sam. 14 17:00 6 (8) NE side-off **0** side-off (dérive vers le large) · dim. 15 09:00 7 (12) NNE offshore **0** vent de terre : dérive au large · dim. 15 11:00 8 (12) NE side-off **0** side-off (dérive vers le large) · dim. 15 13:00 9 (13) NE side-off **0** side-off (dérive vers le large)

**Le Ponant** — mer. 11 17:00 1 (4) N  **0** pas assez de vent · jeu. 12 09:00 11 (18) SSE  **4.8** vent rafaleux · jeu. 12 11:00 12 (20) SSE  **5.6** vent rafaleux · jeu. 12 13:00 5 (12) SSO  **0** pas assez de vent · jeu. 12 15:00 4 (12) NNO  **0** pas assez de vent · jeu. 12 17:00 8 (14) ONO  **0** pas assez de vent · ven. 13 09:00 5 (8) N  **0** pas assez de vent · ven. 13 11:00 6 (11) N  **0** pas assez de vent · ven. 13 13:00 7 (12) N  **0** pas assez de vent · ven. 13 15:00 8 (12) N  **0** pas assez de vent · ven. 13 17:00 7 (11) NNE  **0** pas assez de vent · sam. 14 09:00 1 (2) N  **0** pas assez de vent · sam. 14 11:00 1 (3) ENE  **0** pas assez de vent · sam. 14 13:00 3 (5) NO  **0** pas assez de vent · sam. 14 15:00 3 (5) NNE  **0** pas assez de vent · sam. 14 17:00 3 (5) NE  **0** pas assez de vent · dim. 15 09:00 4 (7) NNE  **0** pas assez de vent · dim. 15 11:00 5 (7) NE  **0** pas assez de vent · dim. 15 13:00 5 (8) NE  **0** pas assez de vent

**Port Camargue / Espiguette** — mer. 11 17:00 4 (10) NE offshore **0** vent de terre : dérive au large · jeu. 12 09:00 10 (20) SE side-on **4** vent rafaleux · jeu. 12 11:00 11 (23) SSO onshore **3.2** vent rafaleux · jeu. 12 13:00 8 (16) NNO offshore **0** vent de terre : dérive au large · jeu. 12 15:00 5 (11) NO side-off **0** side-off (dérive vers le large) · jeu. 12 17:00 14 (20) O side-on **8.3** vent rafaleux · ven. 13 09:00 10 (18) N offshore **0** vent de terre : dérive au large · ven. 13 11:00 13 (23) NNO offshore **0** vent de terre : dérive au large · ven. 13 13:00 12 (18) NNO offshore **0** vent de terre : dérive au large · ven. 13 15:00 14 (21) N offshore **0** vent de terre : dérive au large · ven. 13 17:00 14 (19) N offshore **0** vent de terre : dérive au large · sam. 14 09:00 12 (12) NE offshore **0** vent de terre : dérive au large · sam. 14 11:00 9 (11) NNE offshore **0** vent de terre : dérive au large · sam. 14 13:00 7 (10) NNO offshore **0** vent de terre : dérive au large · sam. 14 15:00 8 (9) NNE offshore **0** vent de terre : dérive au large · sam. 14 17:00 8 (14) NE offshore **0** vent de terre : dérive au large · dim. 15 09:00 9 (14) NE offshore **0** vent de terre : dérive au large · dim. 15 11:00 11 (15) ENE side-off **0** side-off (dérive vers le large) · dim. 15 13:00 15 (20) ESE side **9.6** vent rafaleux

**Beauduc** — mer. 11 17:00 4 (7) OSO onshore **0** pas assez de vent · jeu. 12 09:00 20 (27) SE side-off **0** side-off (dérive vers le large) · jeu. 12 11:00 22 (31) SE side-off **0** side-off (dérive vers le large) · jeu. 12 13:00 15 (25) SSE side **5.6** vent rafaleux · jeu. 12 15:00 8 (13) ONO side-on **0** pas assez de vent · jeu. 12 17:00 9 (12) NO side-on **0** pas assez de vent · ven. 13 09:00 15 (23) NNO side **6.9** vent rafaleux · ven. 13 11:00 19 (26) NNO side **9.1** vent rafaleux · ven. 13 13:00 21 (28) NNO side **9.6** vent rafaleux · ven. 13 15:00 22 (30) NNO side **9.2** vent rafaleux · ven. 13 17:00 21 (28) NNO side **9.6** vent rafaleux · sam. 14 09:00 4 (10) ENE offshore **0** vent de terre : dérive au large · sam. 14 11:00 2 (5) NNO side **0** pas assez de vent · sam. 14 13:00 5 (6) NO side-on **0** pas assez de vent · sam. 14 15:00 7 (11) N side-off **0** side-off (dérive vers le large) · sam. 14 17:00 8 (9) NE offshore **0** vent de terre : dérive au large · dim. 15 09:00 8 (11) NNE side-off **0** side-off (dérive vers le large) · dim. 15 11:00 8 (12) NE offshore **0** vent de terre : dérive au large · dim. 15 13:00 7 (12) E offshore **0** vent de terre : dérive au large

**Le Jaï** — mer. 11 17:00 3 (7) SE  **0** pas assez de vent · jeu. 12 09:00 22 (33) SSE  **4.4** direction déconseillée sur ce plan d’eau · jeu. 12 11:00 14 (22) SSE  **3.8** direction déconseillée sur ce plan d’eau · jeu. 12 13:00 10 (10) E  **0** pas assez de vent · jeu. 12 15:00 6 (9) N  **0** pas assez de vent · jeu. 12 17:00 6 (7) ONO  **0** pas assez de vent · ven. 13 09:00 19 (33) NNO  **5.1** vent rafaleux · ven. 13 11:00 23 (38) NNO  **5.7** vent rafaleux · ven. 13 13:00 24 (34) NNO  **8.4** vent rafaleux · ven. 13 15:00 24 (37) NNO  **6.8** vent rafaleux · ven. 13 17:00 21 (33) NO  **6.4** vent rafaleux · sam. 14 09:00 5 (5) SE  **0** pas assez de vent · sam. 14 11:00 4 (6) SSE  **0** pas assez de vent · sam. 14 13:00 11 (19) SE  **3.1** vent rafaleux · sam. 14 15:00 10 (16) SSE  **1.2** pas assez de vent · sam. 14 17:00 8 (14) ESE  **0** pas assez de vent · dim. 15 09:00 10 (15) ESE  **0.7** pas assez de vent · dim. 15 11:00 5 (11) SE  **0** pas assez de vent · dim. 15 13:00 7 (13) SE  **0** pas assez de vent

**Almanarre (Hyères)** — mer. 11 17:00 3 (10) SSO side-on **0** pas assez de vent · jeu. 12 09:00 9 (14) ESE side-off **0** side-off (dérive vers le large) · jeu. 12 11:00 10 (14) E offshore **0** vent de terre : dérive au large · jeu. 12 13:00 6 (13) NE offshore **0** vent de terre : dérive au large · jeu. 12 15:00 5 (5) N side-off **0** side-off (dérive vers le large) · jeu. 12 17:00 5 (5) OSO onshore **0** pas assez de vent · ven. 13 09:00 10 (15) O onshore **1** pas assez de vent · ven. 13 11:00 9 (14) O onshore **0** pas assez de vent · ven. 13 13:00 11 (17) O onshore **3.6** pas assez de vent · ven. 13 15:00 5 (7) O onshore **0** pas assez de vent · ven. 13 17:00 3 (3) O onshore **0** pas assez de vent · sam. 14 09:00 10 (16) ESE side-off **0** side-off (dérive vers le large) · sam. 14 11:00 10 (16) E offshore **0** vent de terre : dérive au large · sam. 14 13:00 10 (16) E offshore **0** vent de terre : dérive au large · sam. 14 15:00 10 (16) E offshore **0** vent de terre : dérive au large · sam. 14 17:00 10 (16) E offshore **0** vent de terre : dérive au large · dim. 15 09:00 10 (17) ENE offshore **0** vent de terre : dérive au large · dim. 15 11:00 10 (17) E offshore **0** vent de terre : dérive au large · dim. 15 13:00 10 (17) E offshore **0** vent de terre : dérive au large


Copernicus Med-WAV est inclus pour le surf quand l'extrait a moins de 30 h (même règle que l'app en service) ; la note wing (v2.0, modes Sécu first / Offshore) part du vent corrigé de la super prévision ; pas de note kite (décision de Tom).
