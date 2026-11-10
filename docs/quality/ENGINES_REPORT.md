# Rapport d'analyse (② ANALYSE)

Généré le 2026-11-10 15:00 UTC par `pipeline/engines/run.ts`, juste après la collecte.

Les moteurs des apps actuelles (copies non modifiées dans `legacy/`) sont alimentés par la collecte commune. Le test golden refait le calcul comme les apps actuelles, avec leurs propres parseurs sur les mêmes réponses brutes, et exige les mêmes notes à ±0.1.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| golden-surf | ✅ | 4152 valeurs (note, hauteur, vent × 8 spots), écart max 0 ; créneaux identiques (tolérance 0.1) |
| golden-downwind | ✅ | 1440 valeurs (vent, houle, 3 notes × 3 parcours), écart max 0 ; créneaux identiques ; correction du vent identique (tolérance 0.1) |
| correction-vent-downwind | ✅ | 2 spot(s) de recalage : La Grande-Motte 53 h (× 1.05 en moyenne) + relevé récent, Port Camargue 54 h (× 1 en moyenne) + relevé récent |
| sorties-surf | ✅ | 8/8 spots notés ; 12 créneaux |
| sorties-downwind | ✅ | 3/3 parcours notés ; 1 meilleurs créneaux |
| ecart-prod-surf | ✅ | notes surf OCEAN vs app en service (calcul prod. 49 min avant, même extrait Copernicus) : médiane 0.00, 90 % ≤ 1.00, max 5.60 sur 1328 heures (max : gruissan dim. 22:00, OCEAN 3 / prod 8.6) |
| ecart-prod-downwind | ✅ | notes downwind (intermédiaire, de jour) OCEAN vs app en service (calcul prod. 93 min avant) : médiane 0.00, 90 % ≤ 0.00, max 2.50 sur 111 heures |
| sorties-wing | ✅ | 6 spots notés (wing v2.0.0) ; 3 session(s) 2H en mode Sécu first sur les heures prévues |
| confidentialite-moteurs | ✅ | aucun relevé Winds-Up ni clé dans les sorties (seuls les facteurs de correction dérivés y figurent, comme dans l’app downwind actuelle) |
| copernicus-surf | ✅ | Copernicus Med-WAV inclus dans le moteur surf (comme l’app en service) |

## Meilleurs créneaux surf (7 jours)

| Quand | Spot | Note moyenne | Pic |
|---|---|---|---|
| ven. 13 08:00 → ven. 13 18:00 | Carnon | 9.46 | 9.74 |
| ven. 13 08:00 → ven. 13 18:00 | Palavas-les-Flots | 8.76 | 9.68 |
| lun. 16 08:00 → lun. 16 18:00 | Carnon | 7.74 | 7.99 |
| dim. 15 08:00 → dim. 15 18:00 | La Guillotine | 7.43 | 8.42 |
| lun. 16 08:00 → lun. 16 18:00 | La Guillotine | 7.4 | 7.71 |

## Meilleurs créneaux downwind (4 jours)

| Quand | Parcours | Note moyenne | Pic |
|---|---|---|---|
| jeu. 12 08:00 → jeu. 12 13:00 | Plage Sud (Port Camargue) → La Grande-Motte | 6.8 | 7.7 |

## Wing foil — sessions 2H (mode Sécu first, vent corrigé de la super prévision)

| Spot | Créneaux |
|---|---|
| La Franqui | aucun |
| La Grande-Motte | aucun |
| Le Ponant | jeu. 12 08:00 → jeu. 12 12:00 : Ça envoie (moy. 6.9, pic 8.2) |
| Port Camargue / Espiguette | jeu. 12 08:00 → jeu. 12 10:00 : Ça se tente (moy. 5.7, pic 6) |
| Beauduc | ven. 13 10:00 → ven. 13 18:00 : Ça envoie (moy. 8.7, pic 9.3) |
| Almanarre (Hyères) | aucun |

### Détail (toutes les 2 h de jour, Sécu first)

Vent en nœuds (rafales) · d'où il vient · secteur · note · ce qui limite.

**La Franqui** — mar. 10 17:00 6 (13) NE side-on **0** pas assez de vent · mer. 11 09:00 4 (6) NO offshore **0** vent de terre : dérive au large · mer. 11 11:00 2 (5) NNE side **0** pas assez de vent · mer. 11 13:00 3 (6) E onshore **0** pas assez de vent · mer. 11 15:00 4 (7) ESE onshore **0** pas assez de vent · mer. 11 17:00 4 (6) E onshore **0** pas assez de vent · jeu. 12 09:00 14 (25) SSE side-on **4.8** vent rafaleux · jeu. 12 11:00 17 (23) NO offshore **0** vent de terre : dérive au large · jeu. 12 13:00 19 (26) NO offshore **0** vent de terre : dérive au large · jeu. 12 15:00 24 (43) ONO offshore **0** vent de terre : dérive au large · jeu. 12 17:00 23 (42) ONO offshore **0** vent de terre : dérive au large · ven. 13 09:00 18 (29) ONO offshore **0** vent de terre : dérive au large · ven. 13 11:00 17 (28) NO offshore **0** vent de terre : dérive au large · ven. 13 13:00 17 (28) NO offshore **0** vent de terre : dérive au large · ven. 13 15:00 14 (25) NO offshore **0** vent de terre : dérive au large · ven. 13 17:00 12 (20) NO offshore **0** vent de terre : dérive au large · sam. 14 09:00 2 (4) NO offshore **0** vent de terre : dérive au large · sam. 14 11:00 2 (4) NE side-on **0** pas assez de vent · sam. 14 13:00 5 (10) E onshore **0** pas assez de vent

**La Grande-Motte** — mar. 10 17:00 6 (11) NNE offshore **0** vent de terre : dérive au large · mer. 11 09:00 6 (10) N offshore **0** vent de terre : dérive au large · mer. 11 11:00 6 (11) NNE offshore **0** vent de terre : dérive au large · mer. 11 13:00 4 (7) NNO offshore **0** vent de terre : dérive au large · mer. 11 15:00 3 (8) NNO offshore **0** vent de terre : dérive au large · mer. 11 17:00 3 (5) OSO side **0** pas assez de vent · jeu. 12 09:00 24 (45) SE onshore **3.3** vent rafaleux · jeu. 12 11:00 21 (47) SE onshore **3.2** vent rafaleux · jeu. 12 13:00 13 (38) SSE onshore **3.2** vent rafaleux · jeu. 12 15:00 8 (11) O side-off **0** side-off (dérive vers le large) · jeu. 12 17:00 12 (16) OSO side **6.4** pas assez de vent · ven. 13 09:00 10 (15) N offshore **0** vent de terre : dérive au large · ven. 13 11:00 13 (19) N offshore **0** vent de terre : dérive au large · ven. 13 13:00 11 (16) N offshore **0** vent de terre : dérive au large · ven. 13 15:00 12 (19) N offshore **0** vent de terre : dérive au large · ven. 13 17:00 9 (17) NNE offshore **0** vent de terre : dérive au large · sam. 14 09:00 10 (13) NNE offshore **0** vent de terre : dérive au large · sam. 14 11:00 7 (13) NNE offshore **0** vent de terre : dérive au large · sam. 14 13:00 5 (10) NE side-off **0** side-off (dérive vers le large)

**Le Ponant** — mar. 10 17:00 3 (6) NNE  **0** pas assez de vent · mer. 11 09:00 3 (5) NNE  **0** pas assez de vent · mer. 11 11:00 4 (7) N  **0** pas assez de vent · mer. 11 13:00 3 (6) N  **0** pas assez de vent · mer. 11 15:00 2 (5) NNE  **0** pas assez de vent · mer. 11 17:00 2 (3) ENE  **0** pas assez de vent · jeu. 12 09:00 16 (23) SE  **8.2** vent rafaleux · jeu. 12 11:00 15 (26) SE  **5.1** vent rafaleux · jeu. 12 13:00 8 (20) SE  **2.7** vent rafaleux · jeu. 12 15:00 4 (6) O  **0** pas assez de vent · jeu. 12 17:00 5 (9) OSO  **0** pas assez de vent · ven. 13 09:00 6 (8) N  **0** pas assez de vent · ven. 13 11:00 7 (11) N  **0** pas assez de vent · ven. 13 13:00 6 (9) N  **0** pas assez de vent · ven. 13 15:00 7 (11) N  **0** pas assez de vent · ven. 13 17:00 6 (10) NNE  **0** pas assez de vent · sam. 14 09:00 6 (8) NNE  **0** pas assez de vent · sam. 14 11:00 4 (8) NNE  **0** pas assez de vent · sam. 14 13:00 3 (6) NE  **0** pas assez de vent

**Port Camargue / Espiguette** — mar. 10 17:00 6 (12) NE offshore **0** vent de terre : dérive au large · mer. 11 09:00 5 (9) N offshore **0** vent de terre : dérive au large · mer. 11 11:00 5 (9) NNE offshore **0** vent de terre : dérive au large · mer. 11 13:00 4 (7) ONO side **0** pas assez de vent · mer. 11 15:00 3 (8) O side-on **0** pas assez de vent · mer. 11 17:00 3 (4) SSO onshore **0** pas assez de vent · jeu. 12 09:00 24 (41) SE side-on **5.3** vent rafaleux · jeu. 12 11:00 22 (45) SE side-on **4** vent rafaleux · jeu. 12 13:00 13 (35) SSE side-on **4** vent rafaleux · jeu. 12 15:00 6 (9) O side-on **0** pas assez de vent · jeu. 12 17:00 16 (23) O side-on **8.2** vent rafaleux · ven. 13 09:00 9 (12) N offshore **0** vent de terre : dérive au large · ven. 13 11:00 14 (21) N offshore **0** vent de terre : dérive au large · ven. 13 13:00 13 (19) NNO offshore **0** vent de terre : dérive au large · ven. 13 15:00 13 (20) N offshore **0** vent de terre : dérive au large · ven. 13 17:00 11 (17) N offshore **0** vent de terre : dérive au large · sam. 14 09:00 11 (15) NNE offshore **0** vent de terre : dérive au large · sam. 14 11:00 10 (15) NE offshore **0** vent de terre : dérive au large · sam. 14 13:00 6 (12) ENE side-off **0** side-off (dérive vers le large)

**Beauduc** — mar. 10 17:00 11 (16) SE side-off **0** side-off (dérive vers le large) · mer. 11 09:00 8 (11) NE offshore **0** vent de terre : dérive au large · mer. 11 11:00 7 (10) N side-off **0** side-off (dérive vers le large) · mer. 11 13:00 7 (11) NNO side **0** pas assez de vent · mer. 11 15:00 6 (8) NO side-on **0** pas assez de vent · mer. 11 17:00 3 (7) O onshore **0** pas assez de vent · jeu. 12 09:00 26 (35) SE side-off **0** side-off (dérive vers le large) · jeu. 12 11:00 30 (41) SE side-off **0** side-off (dérive vers le large) · jeu. 12 13:00 22 (33) SE side-off **0** side-off (dérive vers le large) · jeu. 12 15:00 6 (16) SSE side **0** pas assez de vent · jeu. 12 17:00 10 (13) O onshore **0** pas assez de vent · ven. 13 09:00 16 (25) N side-off **0** side-off (dérive vers le large) · ven. 13 11:00 17 (24) NNO side **8.5** vent rafaleux · ven. 13 13:00 20 (27) NNO side **9.3** vent rafaleux · ven. 13 15:00 20 (27) NNO side **9.3** vent rafaleux · ven. 13 17:00 18 (26) NNO side **8.1** vent rafaleux · sam. 14 09:00 13 (19) NNE side-off **0** side-off (dérive vers le large) · sam. 14 11:00 8 (14) NNE side-off **0** side-off (dérive vers le large) · sam. 14 13:00 11 (16) SSE side **4** pas assez de vent

**Almanarre (Hyères)** — mar. 10 17:00 9 (12) E offshore **0** vent de terre : dérive au large · mer. 11 09:00 5 (7) SSO side-on **0** pas assez de vent · mer. 11 11:00 8 (11) SSO side-on **0** pas assez de vent · mer. 11 13:00 5 (8) OSO onshore **0** pas assez de vent · mer. 11 15:00 3 (6) SO onshore **0** pas assez de vent · mer. 11 17:00 2 (3) SO onshore **0** pas assez de vent · jeu. 12 09:00 9 (13) E offshore **0** vent de terre : dérive au large · jeu. 12 11:00 9 (15) E offshore **0** vent de terre : dérive au large · jeu. 12 13:00 10 (16) E offshore **0** vent de terre : dérive au large · jeu. 12 15:00 5 (8) ESE side-off **0** side-off (dérive vers le large) · jeu. 12 17:00 3 (6) ENE offshore **0** vent de terre : dérive au large · ven. 13 09:00 7 (9) O onshore **0** pas assez de vent · ven. 13 11:00 7 (11) O onshore **0** pas assez de vent · ven. 13 13:00 6 (9) O onshore **0** pas assez de vent · ven. 13 15:00 5 (7) OSO onshore **0** pas assez de vent · ven. 13 17:00 4 (7) O onshore **0** pas assez de vent · sam. 14 09:00 4 (6) SE side-off **0** side-off (dérive vers le large) · sam. 14 11:00 9 (13) E offshore **0** vent de terre : dérive au large · sam. 14 13:00 9 (15) E offshore **0** vent de terre : dérive au large


Copernicus Med-WAV est inclus pour le surf quand l'extrait a moins de 30 h (même règle que l'app en service) ; la note wing (v2.0, modes Sécu first / Offshore) part du vent corrigé de la super prévision ; pas de note kite (décision de Tom).
