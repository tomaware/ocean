# Rapport d'analyse (② ANALYSE)

Généré le 2026-11-11 11:37 UTC par `pipeline/engines/run.ts`, juste après la collecte.

Les moteurs des apps actuelles (copies non modifiées dans `legacy/`) sont alimentés par la collecte commune. Le test golden refait le calcul comme les apps actuelles, avec leurs propres parseurs sur les mêmes réponses brutes, et exige les mêmes notes à ±0.1.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| golden-surf | ✅ | 3114 valeurs (note, hauteur, vent × 6 spots), écart max 0 ; créneaux identiques (tolérance 0.1) |
| golden-downwind | ✅ | 1440 valeurs (vent, houle, 3 notes × 3 parcours), écart max 0 ; créneaux identiques ; correction du vent identique (tolérance 0.1) |
| correction-vent-downwind | ✅ | 2 spot(s) de recalage : La Grande-Motte 51 h (× 1.19 en moyenne) + relevé récent, Port Camargue 54 h (× 1.12 en moyenne) + relevé récent |
| sorties-surf | ✅ | 6/6 spots notés ; 12 créneaux |
| houle-direction-downwind | ✅ | direction de la houle (affichage, carte) : 288/288 heures |
| sorties-downwind | ✅ | 3/3 parcours notés ; 1 meilleurs créneaux |
| ecart-prod-surf | ✅ | notes surf OCEAN vs app en service (calcul prod. 39 min avant, même extrait Copernicus) : médiane 0.20, 90 % ≤ 1.10, max 6.20 sur 664 heures (max : carnon jeu. 11:00, OCEAN 6.2 / prod 0) |
| ecart-prod-downwind | ✅ | notes downwind (intermédiaire, de jour) OCEAN vs app en service (calcul prod. 22 min avant) : médiane 0.00, 90 % ≤ 0.00, max 3.40 sur 117 heures |
| sorties-wing | ✅ | 7 spots notés (wing v2.0.0) ; 6 session(s) 2H en mode Sécu first sur les heures prévues |
| confidentialite-moteurs | ✅ | aucun relevé Winds-Up ni clé dans les sorties (seuls les facteurs de correction dérivés y figurent, comme dans l’app downwind actuelle) |
| copernicus-surf | ✅ | Copernicus Med-WAV inclus dans le moteur surf (comme l’app en service) |

## Meilleurs créneaux surf (7 jours)

| Quand | Spot | Note moyenne | Pic |
|---|---|---|---|
| ven. 13 08:00 → ven. 13 18:00 | Carnon | 8.57 | 9.63 |
| ven. 13 08:00 → ven. 13 18:00 | Saintes-Maries-de-la-Mer | 8.38 | 9.5 |
| ven. 13 08:00 → ven. 13 18:00 | Palavas-les-Flots | 7.21 | 8.66 |
| lun. 16 08:00 → lun. 16 18:00 | La Couronne (Martigues) | 7.16 | 8.01 |
| jeu. 12 14:00 → jeu. 12 18:00 | Saintes-Maries-de-la-Mer | 7.49 | 7.81 |

## Meilleurs créneaux downwind (4 jours)

| Quand | Parcours | Note moyenne | Pic |
|---|---|---|---|
| jeu. 12 08:00 → jeu. 12 10:00 | Plage Sud (Port Camargue) → La Grande-Motte | 5.9 | 6 |

## Wing foil — sessions 2H (mode Sécu first, vent corrigé de la super prévision)

| Spot | Créneaux |
|---|---|
| La Franqui | aucun |
| La Grande-Motte | aucun |
| Le Ponant | aucun |
| Port Camargue / Espiguette | jeu. 12 08:00 → jeu. 12 11:00 : Ça se tente (moy. 6.1, pic 6.5) |
| Beauduc | ven. 13 09:00 → ven. 13 14:00 : Ça se tente (moy. 5.5, pic 5.9) ; ven. 13 15:00 → ven. 13 18:00 : Ça se tente (moy. 5.4, pic 5.6) |
| Le Jaï | jeu. 12 09:00 → jeu. 12 11:00 : Ça se tente (moy. 5.3, pic 5.5) ; jeu. 12 12:00 → jeu. 12 14:00 : Ça se tente (moy. 5.2, pic 5.3) ; ven. 13 09:00 → ven. 13 18:00 : Ça envoie (moy. 8, pic 10) |
| Almanarre (Hyères) | aucun |

### Détail (toutes les 2 h de jour, Sécu first)

Vent en nœuds (rafales) · d'où il vient · secteur · note · ce qui limite.

**La Franqui** — mer. 11 13:00 3 (5) ENE side-on **0** pas assez de vent · mer. 11 15:00 6 (10) ESE onshore **0** pas assez de vent · mer. 11 17:00 4 (8) ESE onshore **0** pas assez de vent · jeu. 12 09:00 10 (25) SSO side-off **0** side-off (dérive vers le large) · jeu. 12 11:00 14 (18) NO offshore **0** vent de terre : dérive au large · jeu. 12 13:00 22 (30) ONO offshore **0** vent de terre : dérive au large · jeu. 12 15:00 16 (30) NO offshore **0** vent de terre : dérive au large · jeu. 12 17:00 15 (23) NO offshore **0** vent de terre : dérive au large · ven. 13 09:00 26 (46) ONO offshore **0** vent de terre : dérive au large · ven. 13 11:00 24 (43) ONO offshore **0** vent de terre : dérive au large · ven. 13 13:00 23 (40) ONO offshore **0** vent de terre : dérive au large · ven. 13 15:00 24 (41) ONO offshore **0** vent de terre : dérive au large · ven. 13 17:00 22 (40) ONO offshore **0** vent de terre : dérive au large · sam. 14 09:00 2 (2) NO offshore **0** vent de terre : dérive au large · sam. 14 11:00 5 (6) NE side-on **0** pas assez de vent · sam. 14 13:00 7 (11) ENE side-on **0** pas assez de vent · sam. 14 15:00 6 (10) ENE side-on **0** pas assez de vent · sam. 14 17:00 7 (11) NE side-on **0** pas assez de vent

**La Grande-Motte** — mer. 11 13:00 4 (11) N offshore **0** vent de terre : dérive au large · mer. 11 15:00 4 (9) N offshore **0** vent de terre : dérive au large · mer. 11 17:00 2 (5) NO offshore **0** vent de terre : dérive au large · jeu. 12 09:00 20 (32) SSE onshore **4.8** vent rafaleux · jeu. 12 11:00 20 (33) SSE onshore **4.5** vent rafaleux · jeu. 12 13:00 8 (14) SO side-on **0** pas assez de vent · jeu. 12 15:00 7 (18) NNO offshore **0** vent de terre : dérive au large · jeu. 12 17:00 14 (26) ONO side-off **0** side-off (dérive vers le large) · ven. 13 09:00 6 (12) NNO offshore **0** vent de terre : dérive au large · ven. 13 11:00 9 (15) NNO offshore **0** vent de terre : dérive au large · ven. 13 13:00 10 (17) NNO offshore **0** vent de terre : dérive au large · ven. 13 15:00 12 (20) N offshore **0** vent de terre : dérive au large · ven. 13 17:00 12 (20) NNE offshore **0** vent de terre : dérive au large · sam. 14 09:00 12 (21) NNE offshore **0** vent de terre : dérive au large · sam. 14 11:00 9 (20) NE side-off **0** side-off (dérive vers le large) · sam. 14 13:00 7 (14) NE side-off **0** side-off (dérive vers le large) · sam. 14 15:00 7 (14) NNE offshore **0** vent de terre : dérive au large · sam. 14 17:00 7 (12) NNE offshore **0** vent de terre : dérive au large

**Le Ponant** — mer. 11 13:00 4 (7) N  **0** pas assez de vent · mer. 11 15:00 3 (6) NNE  **0** pas assez de vent · mer. 11 17:00 1 (3) N  **0** pas assez de vent · jeu. 12 09:00 11 (18) SSE  **4.8** vent rafaleux · jeu. 12 11:00 11 (20) SSE  **4.5** vent rafaleux · jeu. 12 13:00 6 (12) SSO  **0** pas assez de vent · jeu. 12 15:00 6 (12) NNO  **0** pas assez de vent · jeu. 12 17:00 8 (14) ONO  **0** pas assez de vent · ven. 13 09:00 5 (8) N  **0** pas assez de vent · ven. 13 11:00 6 (11) N  **0** pas assez de vent · ven. 13 13:00 7 (12) N  **0** pas assez de vent · ven. 13 15:00 8 (12) N  **0** pas assez de vent · ven. 13 17:00 7 (11) NNE  **0** pas assez de vent · sam. 14 09:00 4 (4) N  **0** pas assez de vent · sam. 14 11:00 3 (3) ENE  **0** pas assez de vent · sam. 14 13:00 3 (5) NO  **0** pas assez de vent · sam. 14 15:00 4 (5) NNE  **0** pas assez de vent · sam. 14 17:00 4 (5) NE  **0** pas assez de vent · dim. 15 09:00 4 (7) NNE  **0** pas assez de vent · dim. 15 11:00 5 (7) NE  **0** pas assez de vent · dim. 15 13:00 5 (8) NE  **0** pas assez de vent

**Port Camargue / Espiguette** — mer. 11 13:00 5 (11) N offshore **0** vent de terre : dérive au large · mer. 11 15:00 4 (10) N offshore **0** vent de terre : dérive au large · mer. 11 17:00 2 (4) O side-on **0** pas assez de vent · jeu. 12 09:00 19 (30) SSE side-on **6.3** vent rafaleux · jeu. 12 11:00 17 (34) SE side-on **4** vent rafaleux · jeu. 12 13:00 9 (25) SSO onshore **3.2** vent rafaleux · jeu. 12 15:00 9 (19) NNO offshore **0** vent de terre : dérive au large · jeu. 12 17:00 15 (22) ONO side **7.8** vent rafaleux · ven. 13 09:00 9 (17) N offshore **0** vent de terre : dérive au large · ven. 13 11:00 12 (18) NNO offshore **0** vent de terre : dérive au large · ven. 13 13:00 12 (19) NNO offshore **0** vent de terre : dérive au large · ven. 13 15:00 12 (20) NNO offshore **0** vent de terre : dérive au large · ven. 13 17:00 14 (20) NNE offshore **0** vent de terre : dérive au large · sam. 14 09:00 14 (23) NE offshore **0** vent de terre : dérive au large · sam. 14 11:00 12 (23) NE offshore **0** vent de terre : dérive au large · sam. 14 13:00 8 (17) NE offshore **0** vent de terre : dérive au large · sam. 14 15:00 7 (13) NE offshore **0** vent de terre : dérive au large · sam. 14 17:00 4 (9) ESE side **0** pas assez de vent

**Beauduc** — mer. 11 13:00 7 (8) NO side-on **0** pas assez de vent · mer. 11 15:00 5 (6) OSO onshore **0** pas assez de vent · mer. 11 17:00 5 (6) O onshore **0** pas assez de vent · jeu. 12 09:00 23 (30) SE side-off **0** side-off (dérive vers le large) · jeu. 12 11:00 23 (32) SE side-off **0** side-off (dérive vers le large) · jeu. 12 13:00 15 (26) SSE side **5.1** vent rafaleux · jeu. 12 15:00 11 (13) NO side-on **0** pas assez de vent · jeu. 12 17:00 9 (11) NO side-on **0** pas assez de vent · ven. 13 09:00 16 (27) NNO side **5.4** vent rafaleux · ven. 13 11:00 19 (31) NNO side **5.8** vent rafaleux · ven. 13 13:00 21 (36) NNO side **5.2** vent rafaleux · ven. 13 15:00 20 (35) NNO side **5** vent rafaleux · ven. 13 17:00 21 (35) NNO side **5.6** vent rafaleux · sam. 14 09:00 5 (11) NNE side-off **0** side-off (dérive vers le large) · sam. 14 11:00 5 (10) E offshore **0** vent de terre : dérive au large · sam. 14 13:00 12 (14) SE side-off **0** side-off (dérive vers le large) · sam. 14 15:00 16 (21) SE side-off **0** side-off (dérive vers le large) · sam. 14 17:00 19 (26) SE side-off **0** side-off (dérive vers le large) · dim. 15 09:00 12 (18) E offshore **0** vent de terre : dérive au large · dim. 15 11:00 7 (14) E offshore **0** vent de terre : dérive au large · dim. 15 13:00 5 (11) NNO side **0** pas assez de vent · dim. 15 15:00 4 (9) S side-on **0** pas assez de vent · dim. 15 17:00 8 (11) S side-on **0** pas assez de vent · lun. 16 09:00 8 (16) SSE side **0** pas assez de vent · lun. 16 11:00 10 (18) SSE side **3.1** vent rafaleux · lun. 16 13:00 12 (15) S side-on **0** pas assez de vent · lun. 16 15:00 11 (13) SSE side **0** pas assez de vent · lun. 16 17:00 9 (13) NE offshore **0** vent de terre : dérive au large · mar. 17 09:00 11 (18) ESE offshore **0** vent de terre : dérive au large · mar. 17 11:00 13 (21) ESE offshore **0** vent de terre : dérive au large · mar. 17 13:00 16 (24) E offshore **0** vent de terre : dérive au large · mar. 17 15:00 13 (26) E offshore **0** vent de terre : dérive au large · mar. 17 17:00 8 (24) E offshore **0** vent de terre : dérive au large

**Le Jaï** — mer. 11 13:00 2 (6) SSE  **0** pas assez de vent · mer. 11 15:00 3 (5) SSE  **0** pas assez de vent · mer. 11 17:00 2 (4) S  **0** pas assez de vent · jeu. 12 09:00 19 (27) SSE  **5** direction déconseillée sur ce plan d’eau · jeu. 12 11:00 20 (30) SE  **4.4** direction déconseillée sur ce plan d’eau · jeu. 12 13:00 17 (24) SE  **5.1** direction déconseillée sur ce plan d’eau · jeu. 12 15:00 11 (17) SSE  **2.7** direction déconseillée sur ce plan d’eau · jeu. 12 17:00 9 (10) O  **0** pas assez de vent · ven. 13 09:00 14 (16) NNO  **6.7** pas assez de vent · ven. 13 11:00 18 (24) NNO  **9.6** vent rafaleux · ven. 13 13:00 23 (32) NO  **8.8** vent rafaleux · ven. 13 15:00 24 (35) NO  **7.9** vent rafaleux · ven. 13 17:00 20 (34) NO  **5.3** vent rafaleux · sam. 14 09:00 5 (6) ESE  **0** pas assez de vent · sam. 14 11:00 5 (7) ESE  **0** pas assez de vent · sam. 14 13:00 11 (18) SE  **2.9** vent rafaleux · sam. 14 15:00 11 (18) SE  **2.9** vent rafaleux · sam. 14 17:00 9 (16) ESE  **0.5** pas assez de vent

**Almanarre (Hyères)** — mer. 11 13:00 8 (12) SSO side-on **0** pas assez de vent · mer. 11 15:00 7 (11) SO onshore **0** pas assez de vent · mer. 11 17:00 4 (7) SSO side-on **0** pas assez de vent · jeu. 12 09:00 8 (13) SSE side **0** pas assez de vent · jeu. 12 11:00 10 (14) ESE side-off **0** side-off (dérive vers le large) · jeu. 12 13:00 10 (16) E offshore **0** vent de terre : dérive au large · jeu. 12 15:00 10 (14) E offshore **0** vent de terre : dérive au large · jeu. 12 17:00 10 (16) E offshore **0** vent de terre : dérive au large · ven. 13 09:00 7 (17) O onshore **0** pas assez de vent · ven. 13 11:00 6 (9) OSO onshore **0** pas assez de vent · ven. 13 13:00 9 (14) OSO onshore **0** pas assez de vent · ven. 13 15:00 5 (11) O onshore **0** pas assez de vent · ven. 13 17:00 3 (6) O onshore **0** pas assez de vent · sam. 14 09:00 10 (16) E offshore **0** vent de terre : dérive au large · sam. 14 11:00 11 (16) E offshore **0** vent de terre : dérive au large · sam. 14 13:00 12 (18) E offshore **0** vent de terre : dérive au large · sam. 14 15:00 11 (18) E offshore **0** vent de terre : dérive au large · sam. 14 17:00 10 (16) E offshore **0** vent de terre : dérive au large


Copernicus Med-WAV est inclus pour le surf quand l'extrait a moins de 30 h (même règle que l'app en service) ; la note wing (v2.0, modes Sécu first / Offshore) part du vent corrigé de la super prévision ; pas de note kite (décision de Tom).
