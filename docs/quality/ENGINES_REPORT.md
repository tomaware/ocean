# Rapport d'analyse (② ANALYSE)

Généré le 2026-11-11 16:04 UTC par `pipeline/engines/run.ts`, juste après la collecte.

Les moteurs des apps actuelles (copies non modifiées dans `legacy/`) sont alimentés par la collecte commune. Le test golden refait le calcul comme les apps actuelles, avec leurs propres parseurs sur les mêmes réponses brutes, et exige les mêmes notes à ±0.1.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| golden-surf | ✅ | 3114 valeurs (note, hauteur, vent × 6 spots), écart max 0 ; créneaux identiques (tolérance 0.1) |
| golden-downwind | ✅ | 1440 valeurs (vent, houle, 3 notes × 3 parcours), écart max 0 ; créneaux identiques ; correction du vent identique (tolérance 0.1) |
| correction-vent-downwind | ✅ | 2 spot(s) de recalage : La Grande-Motte 53 h (× 1.02 en moyenne) + relevé récent, Port Camargue 61 h (× 1.06 en moyenne) + relevé récent |
| sorties-surf | ✅ | 6/6 spots notés ; 12 créneaux |
| houle-direction-downwind | ✅ | direction de la houle (affichage, carte) : 288/288 heures |
| sorties-downwind | ✅ | 3/3 parcours notés ; 1 meilleurs créneaux |
| ecart-prod-surf | ✅ | notes surf OCEAN vs app en service (calcul prod. 12 min avant, même extrait Copernicus) : médiane 0.00, 90 % ≤ 0.90, max 7.20 sur 664 heures (max : palavas jeu. 10:00, OCEAN 0 / prod 7.2) |
| ecart-prod-downwind | ✅ | notes downwind (intermédiaire, de jour) OCEAN vs app en service (calcul prod. 54 min avant) : médiane 0.00, 90 % ≤ 0.00, max 4.60 sur 114 heures |
| sorties-wing | ✅ | 7 spots notés (wing v2.0.0) ; 3 session(s) 2H en mode Sécu first sur les heures prévues |
| confidentialite-moteurs | ✅ | aucun relevé Winds-Up ni clé dans les sorties (seuls les facteurs de correction dérivés y figurent, comme dans l’app downwind actuelle) |
| copernicus-surf | ✅ | Copernicus Med-WAV inclus dans le moteur surf (comme l’app en service) |

## Meilleurs créneaux surf (7 jours)

| Quand | Spot | Note moyenne | Pic |
|---|---|---|---|
| ven. 13 08:00 → ven. 13 18:00 | Saintes-Maries-de-la-Mer | 8.13 | 9.5 |
| ven. 13 08:00 → ven. 13 18:00 | Carnon | 8.33 | 9.06 |
| lun. 16 08:00 → lun. 16 18:00 | Saintes-Maries-de-la-Mer | 7.25 | 8.52 |
| lun. 16 08:00 → lun. 16 18:00 | Carnon | 7.23 | 8.28 |
| lun. 16 08:00 → lun. 16 18:00 | La Couronne (Martigues) | 7.2 | 8.12 |

## Meilleurs créneaux downwind (4 jours)

| Quand | Parcours | Note moyenne | Pic |
|---|---|---|---|
| dim. 15 14:00 → dim. 15 17:00 | Plage Sud (Port Camargue) → La Grande-Motte | 7.5 | 7.8 |

## Wing foil — sessions 2H (mode Sécu first, vent corrigé de la super prévision)

| Spot | Créneaux |
|---|---|
| La Franqui | aucun |
| La Grande-Motte | aucun |
| Le Ponant | aucun |
| Port Camargue / Espiguette | aucun |
| Beauduc | ven. 13 08:00 → ven. 13 18:00 : Ça envoie (moy. 8.4, pic 9.6) |
| Le Jaï | ven. 13 08:00 → ven. 13 18:00 : Ça envoie (moy. 8.2, pic 9.6) |
| Almanarre (Hyères) | ven. 13 12:00 → ven. 13 14:00 : Ça envoie (moy. 6.4, pic 7.1) |

### Détail (toutes les 2 h de jour, Sécu first)

Vent en nœuds (rafales) · d'où il vient · secteur · note · ce qui limite.

**La Franqui** — jeu. 12 09:00 11 (24) SSE side-on **4** vent rafaleux · jeu. 12 11:00 13 (18) NO offshore **0** vent de terre : dérive au large · jeu. 12 13:00 16 (23) NO offshore **0** vent de terre : dérive au large · jeu. 12 15:00 22 (33) NO offshore **0** vent de terre : dérive au large · jeu. 12 17:00 14 (23) NO offshore **0** vent de terre : dérive au large · ven. 13 09:00 23 (33) ONO offshore **0** vent de terre : dérive au large · ven. 13 11:00 24 (33) ONO offshore **0** vent de terre : dérive au large · ven. 13 13:00 25 (34) ONO offshore **0** vent de terre : dérive au large · ven. 13 15:00 26 (44) NO offshore **0** vent de terre : dérive au large · ven. 13 17:00 24 (43) NO offshore **0** vent de terre : dérive au large · sam. 14 09:00 1 (2) NE side-on **0** pas assez de vent · sam. 14 11:00 5 (8) ENE side-on **0** pas assez de vent · sam. 14 13:00 9 (15) E onshore **0** pas assez de vent · sam. 14 15:00 8 (16) ENE side-on **0** pas assez de vent · sam. 14 17:00 10 (17) ENE side-on **2.7** pas assez de vent · dim. 15 09:00 9 (15) ONO offshore **0** vent de terre : dérive au large · dim. 15 11:00 7 (15) O offshore **0** vent de terre : dérive au large · dim. 15 13:00 2 (7) NO offshore **0** vent de terre : dérive au large

**La Grande-Motte** — jeu. 12 09:00 11 (21) SE onshore **3.2** vent rafaleux · jeu. 12 11:00 10 (18) S onshore **2.5** vent rafaleux · jeu. 12 13:00 9 (16) N offshore **0** vent de terre : dérive au large · jeu. 12 15:00 3 (11) NNO offshore **0** vent de terre : dérive au large · jeu. 12 17:00 11 (20) O side-off **0** side-off (dérive vers le large) · ven. 13 09:00 9 (16) N offshore **0** vent de terre : dérive au large · ven. 13 11:00 10 (20) NNO offshore **0** vent de terre : dérive au large · ven. 13 13:00 10 (17) N offshore **0** vent de terre : dérive au large · ven. 13 15:00 14 (22) N offshore **0** vent de terre : dérive au large · ven. 13 17:00 12 (19) NNE offshore **0** vent de terre : dérive au large · sam. 14 09:00 4 (4) N offshore **0** vent de terre : dérive au large · sam. 14 11:00 4 (6) ENE side **0** pas assez de vent · sam. 14 13:00 5 (10) NO offshore **0** vent de terre : dérive au large · sam. 14 15:00 6 (10) NNE offshore **0** vent de terre : dérive au large · sam. 14 17:00 6 (8) NE side-off **0** side-off (dérive vers le large) · dim. 15 09:00 7 (12) NNE offshore **0** vent de terre : dérive au large · dim. 15 11:00 8 (12) NE side-off **0** side-off (dérive vers le large) · dim. 15 13:00 10 (13) NE side-off **0** side-off (dérive vers le large)

**Le Ponant** — jeu. 12 09:00 11 (18) SSE  **4.8** vent rafaleux · jeu. 12 11:00 12 (20) SSE  **5.6** vent rafaleux · jeu. 12 13:00 5 (12) SSO  **0** pas assez de vent · jeu. 12 15:00 4 (12) NNO  **0** pas assez de vent · jeu. 12 17:00 8 (14) ONO  **0** pas assez de vent · ven. 13 09:00 5 (8) N  **0** pas assez de vent · ven. 13 11:00 6 (11) N  **0** pas assez de vent · ven. 13 13:00 7 (12) N  **0** pas assez de vent · ven. 13 15:00 8 (12) N  **0** pas assez de vent · ven. 13 17:00 7 (11) NNE  **0** pas assez de vent · sam. 14 09:00 1 (2) N  **0** pas assez de vent · sam. 14 11:00 1 (3) ENE  **0** pas assez de vent · sam. 14 13:00 3 (5) NO  **0** pas assez de vent · sam. 14 15:00 3 (5) NNE  **0** pas assez de vent · sam. 14 17:00 3 (5) NE  **0** pas assez de vent · dim. 15 09:00 4 (7) NNE  **0** pas assez de vent · dim. 15 11:00 5 (7) NE  **0** pas assez de vent · dim. 15 13:00 5 (7) NE  **0** pas assez de vent

**Port Camargue / Espiguette** — jeu. 12 09:00 6 (21) SE side-on **2** vent rafaleux · jeu. 12 11:00 8 (23) SSO onshore **3.2** vent rafaleux · jeu. 12 13:00 8 (16) NNO offshore **0** vent de terre : dérive au large · jeu. 12 15:00 3 (11) NO side-off **0** side-off (dérive vers le large) · jeu. 12 17:00 14 (21) O side-on **7.3** vent rafaleux · ven. 13 09:00 10 (18) N offshore **0** vent de terre : dérive au large · ven. 13 11:00 14 (23) NNO offshore **0** vent de terre : dérive au large · ven. 13 13:00 12 (18) NNO offshore **0** vent de terre : dérive au large · ven. 13 15:00 15 (22) N offshore **0** vent de terre : dérive au large · ven. 13 17:00 13 (19) N offshore **0** vent de terre : dérive au large · sam. 14 09:00 9 (13) NE offshore **0** vent de terre : dérive au large · sam. 14 11:00 7 (11) NNE offshore **0** vent de terre : dérive au large · sam. 14 13:00 6 (10) NNO offshore **0** vent de terre : dérive au large · sam. 14 15:00 7 (9) NNE offshore **0** vent de terre : dérive au large · sam. 14 17:00 9 (14) NE offshore **0** vent de terre : dérive au large · dim. 15 09:00 9 (14) NE offshore **0** vent de terre : dérive au large · dim. 15 11:00 11 (15) ENE side-off **0** side-off (dérive vers le large) · dim. 15 13:00 15 (21) ESE side **8.7** vent rafaleux

**Beauduc** — jeu. 12 09:00 20 (27) SE side-off **0** side-off (dérive vers le large) · jeu. 12 11:00 22 (31) SE side-off **0** side-off (dérive vers le large) · jeu. 12 13:00 15 (25) SSE side **5.6** vent rafaleux · jeu. 12 15:00 8 (13) ONO side-on **0** pas assez de vent · jeu. 12 17:00 9 (12) NO side-on **0** pas assez de vent · ven. 13 09:00 15 (23) NNO side **6.9** vent rafaleux · ven. 13 11:00 18 (26) NNO side **8.1** vent rafaleux · ven. 13 13:00 20 (28) NNO side **8.7** vent rafaleux · ven. 13 15:00 22 (30) NNO side **9.2** vent rafaleux · ven. 13 17:00 20 (28) NNO side **8.7** vent rafaleux · sam. 14 09:00 4 (10) ENE offshore **0** vent de terre : dérive au large · sam. 14 11:00 2 (5) NNO side **0** pas assez de vent · sam. 14 13:00 4 (6) NO side-on **0** pas assez de vent · sam. 14 15:00 6 (11) N side-off **0** side-off (dérive vers le large) · sam. 14 17:00 7 (9) NE offshore **0** vent de terre : dérive au large · dim. 15 09:00 8 (11) NNE side-off **0** side-off (dérive vers le large) · dim. 15 11:00 9 (12) NE offshore **0** vent de terre : dérive au large · dim. 15 13:00 8 (12) E offshore **0** vent de terre : dérive au large

**Le Jaï** — jeu. 12 09:00 23 (31) SSE  **5.6** direction déconseillée sur ce plan d’eau · jeu. 12 11:00 12 (21) SSE  **3** vent rafaleux · jeu. 12 13:00 7 (9) E  **0** pas assez de vent · jeu. 12 15:00 4 (8) N  **0** pas assez de vent · jeu. 12 17:00 5 (6) ONO  **0** pas assez de vent · ven. 13 09:00 22 (31) NNO  **8.5** vent rafaleux · ven. 13 11:00 25 (36) NNO  **8.1** vent rafaleux · ven. 13 13:00 24 (32) NNO  **9.6** vent rafaleux · ven. 13 15:00 23 (35) NNO  **7** vent rafaleux · ven. 13 17:00 21 (31) NO  **7.7** vent rafaleux · sam. 14 09:00 5 (5) SE  **0** pas assez de vent · sam. 14 11:00 4 (6) SSE  **0** pas assez de vent · sam. 14 13:00 10 (18) SE  **1.9** vent rafaleux · sam. 14 15:00 10 (16) SSE  **1.2** pas assez de vent · sam. 14 17:00 8 (14) ESE  **0** pas assez de vent · dim. 15 09:00 9 (15) ESE  **0** pas assez de vent · dim. 15 11:00 5 (10) SE  **0** pas assez de vent · dim. 15 13:00 7 (12) SE  **0** pas assez de vent

**Almanarre (Hyères)** — jeu. 12 09:00 10 (14) ESE side-off **0** side-off (dérive vers le large) · jeu. 12 11:00 10 (14) E offshore **0** vent de terre : dérive au large · jeu. 12 13:00 5 (13) NE offshore **0** vent de terre : dérive au large · jeu. 12 15:00 3 (3) N side-off **0** side-off (dérive vers le large) · jeu. 12 17:00 3 (3) OSO onshore **0** pas assez de vent · ven. 13 09:00 11 (15) O onshore **2.4** pas assez de vent · ven. 13 11:00 10 (15) O onshore **1** pas assez de vent · ven. 13 13:00 12 (17) O onshore **5.6** vent de mer (face à la plage) · ven. 13 15:00 4 (8) O onshore **0** pas assez de vent · ven. 13 17:00 2 (3) O onshore **0** pas assez de vent · sam. 14 09:00 10 (16) ESE side-off **0** side-off (dérive vers le large) · sam. 14 11:00 10 (17) E offshore **0** vent de terre : dérive au large · sam. 14 13:00 10 (16) E offshore **0** vent de terre : dérive au large · sam. 14 15:00 10 (16) E offshore **0** vent de terre : dérive au large · sam. 14 17:00 10 (16) E offshore **0** vent de terre : dérive au large · dim. 15 09:00 10 (17) ENE offshore **0** vent de terre : dérive au large · dim. 15 11:00 10 (17) E offshore **0** vent de terre : dérive au large · dim. 15 13:00 10 (17) E offshore **0** vent de terre : dérive au large


Copernicus Med-WAV est inclus pour le surf quand l'extrait a moins de 30 h (même règle que l'app en service) ; la note wing (v2.0, modes Sécu first / Offshore) part du vent corrigé de la super prévision ; pas de note kite (décision de Tom).
