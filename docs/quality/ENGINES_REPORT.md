# Rapport d'analyse (② ANALYSE)

Généré le 2026-11-10 22:20 UTC par `pipeline/engines/run.ts`, juste après la collecte.

Les moteurs des apps actuelles (copies non modifiées dans `legacy/`) sont alimentés par la collecte commune. Le test golden refait le calcul comme les apps actuelles, avec leurs propres parseurs sur les mêmes réponses brutes, et exige les mêmes notes à ±0.1.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| golden-surf | ✅ | 3114 valeurs (note, hauteur, vent × 6 spots), écart max 0 ; créneaux identiques (tolérance 0.1) |
| golden-downwind | ✅ | 1440 valeurs (vent, houle, 3 notes × 3 parcours), écart max 0 ; créneaux identiques ; correction du vent identique (tolérance 0.1) |
| correction-vent-downwind | ✅ | 2 spot(s) de recalage : La Grande-Motte 54 h (× 1.21 en moyenne), Port Camargue 54 h (× 1.11 en moyenne) + relevé récent |
| sorties-surf | ✅ | 6/6 spots notés ; 12 créneaux |
| houle-direction-downwind | ✅ | direction de la houle (affichage, carte) : 288/288 heures |
| sorties-downwind | ✅ | 3/3 parcours notés ; 1 meilleurs créneaux |
| ecart-prod-surf | ✅ | notes surf OCEAN vs app en service (calcul prod. 40 min avant, même extrait Copernicus) : médiane 0.00, 90 % ≤ 0.00, max 0.60 sur 664 heures (max : sete ven. 00:00, OCEAN 5.6 / prod 6.2) |
| ecart-prod-downwind | ✅ | notes downwind (intermédiaire, de jour) OCEAN vs app en service (calcul prod. 23 min avant) : médiane 0.00, 90 % ≤ 0.00, max 0.00 sur 120 heures |
| sorties-wing | ✅ | 7 spots notés (wing v2.0.0) ; 5 session(s) 2H en mode Sécu first sur les heures prévues |
| confidentialite-moteurs | ✅ | aucun relevé Winds-Up ni clé dans les sorties (seuls les facteurs de correction dérivés y figurent, comme dans l’app downwind actuelle) |
| copernicus-surf | ✅ | Copernicus Med-WAV inclus dans le moteur surf (comme l’app en service) |

## Meilleurs créneaux surf (7 jours)

| Quand | Spot | Note moyenne | Pic |
|---|---|---|---|
| ven. 13 08:00 → ven. 13 18:00 | Carnon | 9.11 | 9.37 |
| ven. 13 08:00 → ven. 13 18:00 | Palavas-les-Flots | 8.52 | 9.7 |
| ven. 13 08:00 → ven. 13 18:00 | Saintes-Maries-de-la-Mer | 8.19 | 8.96 |
| lun. 16 08:00 → lun. 16 18:00 | La Couronne (Martigues) | 7.15 | 8.74 |
| lun. 16 08:00 → lun. 16 18:00 | Saintes-Maries-de-la-Mer | 6.66 | 8.56 |

## Meilleurs créneaux downwind (4 jours)

| Quand | Parcours | Note moyenne | Pic |
|---|---|---|---|
| jeu. 12 08:00 → jeu. 12 12:00 | Plage Sud (Port Camargue) → La Grande-Motte | 7 | 7.2 |

## Wing foil — sessions 2H (mode Sécu first, vent corrigé de la super prévision)

| Spot | Créneaux |
|---|---|
| La Franqui | aucun |
| La Grande-Motte | aucun |
| Le Ponant | jeu. 12 09:00 → jeu. 12 11:00 : Ça se tente (moy. 5.4, pic 5.4) |
| Port Camargue / Espiguette | jeu. 12 08:00 → jeu. 12 12:00 : Ça envoie (moy. 6.3, pic 7.3) |
| Beauduc | ven. 13 10:00 → ven. 13 18:00 : Ça envoie (moy. 8.6, pic 9.1) |
| Le Jaï | jeu. 12 10:00 → jeu. 12 14:00 : Ça se tente (moy. 5.5, pic 5.9) ; ven. 13 08:00 → ven. 13 18:00 : Ça envoie (moy. 8, pic 8.7) |
| Almanarre (Hyères) | aucun |

### Détail (toutes les 2 h de jour, Sécu first)

Vent en nœuds (rafales) · d'où il vient · secteur · note · ce qui limite.

**La Franqui** — mer. 11 09:00 4 (6) N side **0** pas assez de vent · mer. 11 11:00 2 (6) N side **0** pas assez de vent · mer. 11 13:00 4 (6) ESE onshore **0** pas assez de vent · mer. 11 15:00 5 (7) E onshore **0** pas assez de vent · mer. 11 17:00 4 (5) NE side-on **0** pas assez de vent · jeu. 12 09:00 15 (28) SSE side-on **4.2** vent rafaleux · jeu. 12 11:00 19 (27) NO offshore **0** vent de terre : dérive au large · jeu. 12 13:00 24 (34) NO offshore **0** vent de terre : dérive au large · jeu. 12 15:00 24 (34) NO offshore **0** vent de terre : dérive au large · jeu. 12 17:00 27 (42) NO offshore **0** vent de terre : dérive au large · ven. 13 09:00 13 (24) NO offshore **0** vent de terre : dérive au large · ven. 13 11:00 14 (23) ONO offshore **0** vent de terre : dérive au large · ven. 13 13:00 12 (20) NO offshore **0** vent de terre : dérive au large · ven. 13 15:00 12 (21) NO offshore **0** vent de terre : dérive au large · ven. 13 17:00 11 (19) NO offshore **0** vent de terre : dérive au large · sam. 14 09:00 3 (5) NNO side-off **0** side-off (dérive vers le large) · sam. 14 11:00 3 (5) NNE side **0** pas assez de vent · sam. 14 13:00 5 (9) ENE side-on **0** pas assez de vent · sam. 14 15:00 5 (10) NE side-on **0** pas assez de vent · sam. 14 17:00 3 (5) NNO side-off **0** side-off (dérive vers le large)

**La Grande-Motte** — mer. 11 09:00 8 (14) N offshore **0** vent de terre : dérive au large · mer. 11 11:00 7 (13) N offshore **0** vent de terre : dérive au large · mer. 11 13:00 5 (12) N offshore **0** vent de terre : dérive au large · mer. 11 15:00 3 (9) N offshore **0** vent de terre : dérive au large · mer. 11 17:00 3 (7) NNO offshore **0** vent de terre : dérive au large · jeu. 12 09:00 24 (39) SE onshore **4.7** vent rafaleux · jeu. 12 11:00 21 (38) SE onshore **3.7** vent rafaleux · jeu. 12 13:00 17 (34) SSE onshore **3.2** vent rafaleux · jeu. 12 15:00 10 (19) O side-off **0** side-off (dérive vers le large) · jeu. 12 17:00 12 (32) O side-off **0** side-off (dérive vers le large) · ven. 13 09:00 10 (17) NNE offshore **0** vent de terre : dérive au large · ven. 13 11:00 14 (21) N offshore **0** vent de terre : dérive au large · ven. 13 13:00 13 (21) N offshore **0** vent de terre : dérive au large · ven. 13 15:00 14 (22) N offshore **0** vent de terre : dérive au large · ven. 13 17:00 13 (20) NNE offshore **0** vent de terre : dérive au large · sam. 14 09:00 12 (19) NNE offshore **0** vent de terre : dérive au large · sam. 14 11:00 12 (20) NNE offshore **0** vent de terre : dérive au large · sam. 14 13:00 11 (18) NNE offshore **0** vent de terre : dérive au large · sam. 14 15:00 11 (18) NE side-off **0** side-off (dérive vers le large) · sam. 14 17:00 11 (13) NE side-off **0** side-off (dérive vers le large)

**Le Ponant** — mer. 11 09:00 3 (6) N  **0** pas assez de vent · mer. 11 11:00 3 (6) N  **0** pas assez de vent · mer. 11 13:00 3 (7) NNE  **0** pas assez de vent · mer. 11 15:00 2 (5) NNE  **0** pas assez de vent · mer. 11 17:00 2 (3) ESE  **0** pas assez de vent · jeu. 12 09:00 13 (22) SE  **5.4** vent rafaleux · jeu. 12 11:00 12 (23) SE  **4** vent rafaleux · jeu. 12 13:00 7 (21) SSE  **2.7** vent rafaleux · jeu. 12 15:00 5 (9) O  **0** pas assez de vent · jeu. 12 17:00 9 (12) O  **0** pas assez de vent · ven. 13 09:00 6 (10) NNE  **0** pas assez de vent · ven. 13 11:00 8 (12) N  **0** pas assez de vent · ven. 13 13:00 8 (12) N  **0** pas assez de vent · ven. 13 15:00 8 (13) N  **0** pas assez de vent · ven. 13 17:00 8 (12) NNE  **0** pas assez de vent · sam. 14 09:00 8 (11) NNE  **0** pas assez de vent · sam. 14 11:00 7 (12) NNE  **0** pas assez de vent · sam. 14 13:00 7 (10) NNE  **0** pas assez de vent · sam. 14 15:00 6 (10) NE  **0** pas assez de vent · sam. 14 17:00 6 (8) NE  **0** pas assez de vent

**Port Camargue / Espiguette** — mer. 11 09:00 6 (12) N offshore **0** vent de terre : dérive au large · mer. 11 11:00 5 (11) N offshore **0** vent de terre : dérive au large · mer. 11 13:00 4 (11) N offshore **0** vent de terre : dérive au large · mer. 11 15:00 2 (8) N offshore **0** vent de terre : dérive au large · mer. 11 17:00 2 (6) N offshore **0** vent de terre : dérive au large · jeu. 12 09:00 22 (38) SE side-on **5.2** vent rafaleux · jeu. 12 11:00 23 (35) SE side-on **7** vent rafaleux · jeu. 12 13:00 13 (30) SSE side-on **4** vent rafaleux · jeu. 12 15:00 7 (14) O side-on **0** pas assez de vent · jeu. 12 17:00 15 (29) O side-on **4** vent rafaleux · ven. 13 09:00 8 (11) NNE offshore **0** vent de terre : dérive au large · ven. 13 11:00 15 (22) N offshore **0** vent de terre : dérive au large · ven. 13 13:00 16 (23) N offshore **0** vent de terre : dérive au large · ven. 13 15:00 15 (23) N offshore **0** vent de terre : dérive au large · ven. 13 17:00 16 (22) NNE offshore **0** vent de terre : dérive au large · sam. 14 09:00 15 (21) NNE offshore **0** vent de terre : dérive au large · sam. 14 11:00 15 (21) NNE offshore **0** vent de terre : dérive au large · sam. 14 13:00 14 (20) NE offshore **0** vent de terre : dérive au large · sam. 14 15:00 14 (21) NE offshore **0** vent de terre : dérive au large · sam. 14 17:00 13 (19) NE offshore **0** vent de terre : dérive au large

**Beauduc** — mer. 11 09:00 1 (5) SSO side-on **0** pas assez de vent · mer. 11 11:00 3 (4) SE side-off **0** side-off (dérive vers le large) · mer. 11 13:00 4 (6) O onshore **0** pas assez de vent · mer. 11 15:00 4 (6) ONO side-on **0** pas assez de vent · mer. 11 17:00 4 (7) OSO onshore **0** pas assez de vent · jeu. 12 09:00 24 (33) SE side-off **0** side-off (dérive vers le large) · jeu. 12 11:00 24 (36) SE side-off **0** side-off (dérive vers le large) · jeu. 12 13:00 20 (30) SE side-off **0** side-off (dérive vers le large) · jeu. 12 15:00 9 (20) OSO onshore **2.7** vent rafaleux · jeu. 12 17:00 11 (14) O onshore **0** pas assez de vent · ven. 13 09:00 19 (26) N side-off **0** side-off (dérive vers le large) · ven. 13 11:00 19 (26) NNO side **9.1** vent rafaleux · ven. 13 13:00 21 (29) NNO side **8.9** vent rafaleux · ven. 13 15:00 21 (29) NNO side **8.9** vent rafaleux · ven. 13 17:00 20 (29) NNO side **8** vent rafaleux · sam. 14 09:00 16 (22) NNE side-off **0** side-off (dérive vers le large) · sam. 14 11:00 14 (19) NNE side-off **0** side-off (dérive vers le large) · sam. 14 13:00 13 (18) NNE side-off **0** side-off (dérive vers le large) · sam. 14 15:00 11 (16) NNE side-off **0** side-off (dérive vers le large) · sam. 14 17:00 10 (15) ESE offshore **0** vent de terre : dérive au large

**Le Jaï** — mer. 11 09:00 10 (15) SSE  **0.7** pas assez de vent · mer. 11 11:00 7 (12) SSE  **0** pas assez de vent · mer. 11 13:00 4 (8) S  **0** pas assez de vent · mer. 11 15:00 2 (3) NO  **0** pas assez de vent · mer. 11 17:00 3 (4) SSO  **0** pas assez de vent · jeu. 12 09:00 18 (26) SE  **4.8** direction déconseillée sur ce plan d’eau · jeu. 12 11:00 22 (29) SE  **5.9** direction déconseillée sur ce plan d’eau · jeu. 12 13:00 19 (26) SE  **5.5** direction déconseillée sur ce plan d’eau · jeu. 12 15:00 12 (22) SSE  **2.7** vent rafaleux · jeu. 12 17:00 10 (14) O  **0** pas assez de vent · ven. 13 09:00 24 (35) NNO  **7.9** vent rafaleux · ven. 13 11:00 25 (36) NO  **8.1** vent rafaleux · ven. 13 13:00 26 (38) NNO  **7.8** vent rafaleux · ven. 13 15:00 25 (36) NNO  **8.1** vent rafaleux · ven. 13 17:00 22 (33) NNO  **7.3** vent rafaleux · sam. 14 09:00 5 (5) E  **0** pas assez de vent · sam. 14 11:00 7 (11) ESE  **0** pas assez de vent · sam. 14 13:00 8 (14) ESE  **0** pas assez de vent · sam. 14 15:00 9 (14) ESE  **0** pas assez de vent · sam. 14 17:00 9 (15) ESE  **0** pas assez de vent

**Almanarre (Hyères)** — mer. 11 09:00 2 (5) NO side-on **0** pas assez de vent · mer. 11 11:00 5 (9) ONO side-on **0** pas assez de vent · mer. 11 13:00 6 (11) SSO side-on **0** pas assez de vent · mer. 11 15:00 3 (7) SO onshore **0** pas assez de vent · mer. 11 17:00 2 (5) SSO side-on **0** pas assez de vent · jeu. 12 09:00 11 (14) ESE side-off **0** side-off (dérive vers le large) · jeu. 12 11:00 13 (16) E offshore **0** vent de terre : dérive au large · jeu. 12 13:00 13 (17) E offshore **0** vent de terre : dérive au large · jeu. 12 15:00 10 (17) ENE offshore **0** vent de terre : dérive au large · jeu. 12 17:00 8 (15) E offshore **0** vent de terre : dérive au large · ven. 13 09:00 7 (11) O onshore **0** pas assez de vent · ven. 13 11:00 5 (9) O onshore **0** pas assez de vent · ven. 13 13:00 5 (9) O onshore **0** pas assez de vent · ven. 13 15:00 5 (7) OSO onshore **0** pas assez de vent · ven. 13 17:00 2 (5) O onshore **0** pas assez de vent · sam. 14 09:00 10 (18) E offshore **0** vent de terre : dérive au large · sam. 14 11:00 11 (17) E offshore **0** vent de terre : dérive au large · sam. 14 13:00 11 (18) E offshore **0** vent de terre : dérive au large · sam. 14 15:00 11 (17) E offshore **0** vent de terre : dérive au large · sam. 14 17:00 10 (17) E offshore **0** vent de terre : dérive au large


Copernicus Med-WAV est inclus pour le surf quand l'extrait a moins de 30 h (même règle que l'app en service) ; la note wing (v2.0, modes Sécu first / Offshore) part du vent corrigé de la super prévision ; pas de note kite (décision de Tom).
