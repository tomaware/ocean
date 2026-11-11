# Rapport d'analyse (② ANALYSE)

Généré le 2026-11-11 13:25 UTC par `pipeline/engines/run.ts`, juste après la collecte.

Les moteurs des apps actuelles (copies non modifiées dans `legacy/`) sont alimentés par la collecte commune. Le test golden refait le calcul comme les apps actuelles, avec leurs propres parseurs sur les mêmes réponses brutes, et exige les mêmes notes à ±0.1.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| golden-surf | ✅ | 3114 valeurs (note, hauteur, vent × 6 spots), écart max 0 ; créneaux identiques (tolérance 0.1) |
| golden-downwind | ✅ | 1440 valeurs (vent, houle, 3 notes × 3 parcours), écart max 0 ; créneaux identiques ; correction du vent identique (tolérance 0.1) |
| correction-vent-downwind | ✅ | 2 spot(s) de recalage : La Grande-Motte 47 h (× 1.09 en moyenne) + relevé récent, Port Camargue 55 h (× 1.1 en moyenne) + relevé récent |
| sorties-surf | ✅ | 6/6 spots notés ; 12 créneaux |
| houle-direction-downwind | ✅ | direction de la houle (affichage, carte) : 288/288 heures |
| sorties-downwind | ✅ | 3/3 parcours notés ; 1 meilleurs créneaux |
| ecart-prod-surf | ✅ | notes surf OCEAN vs app en service (calcul prod. 21 min avant, même extrait Copernicus) : médiane 0.10, 90 % ≤ 1.40, max 7.40 sur 668 heures (max : carnon dim. 16:00, OCEAN 0.3 / prod 7.7) |
| ecart-prod-downwind | ✅ | notes downwind (intermédiaire, de jour) OCEAN vs app en service (calcul prod. 74 min avant) : médiane 0.00, 90 % ≤ 0.30, max 7.40 sur 114 heures |
| sorties-wing | ✅ | 7 spots notés (wing v2.0.0) ; 4 session(s) 2H en mode Sécu first sur les heures prévues |
| confidentialite-moteurs | ✅ | aucun relevé Winds-Up ni clé dans les sorties (seuls les facteurs de correction dérivés y figurent, comme dans l’app downwind actuelle) |
| copernicus-surf | ✅ | Copernicus Med-WAV inclus dans le moteur surf (comme l’app en service) |

## Meilleurs créneaux surf (7 jours)

| Quand | Spot | Note moyenne | Pic |
|---|---|---|---|
| ven. 13 08:00 → ven. 13 18:00 | Carnon | 8.47 | 9.66 |
| ven. 13 08:00 → ven. 13 18:00 | Saintes-Maries-de-la-Mer | 8.48 | 9.59 |
| lun. 16 08:00 → lun. 16 18:00 | Saintes-Maries-de-la-Mer | 7.25 | 8.52 |
| ven. 13 08:00 → ven. 13 18:00 | Palavas-les-Flots | 7.11 | 8.54 |
| lun. 16 08:00 → lun. 16 18:00 | Carnon | 7.24 | 8.28 |

## Meilleurs créneaux downwind (4 jours)

| Quand | Parcours | Note moyenne | Pic |
|---|---|---|---|
| dim. 15 08:00 → dim. 15 14:00 | Plage Sud (Port Camargue) → La Grande-Motte | 6.5 | 7.5 |

## Wing foil — sessions 2H (mode Sécu first, vent corrigé de la super prévision)

| Spot | Créneaux |
|---|---|
| La Franqui | aucun |
| La Grande-Motte | aucun |
| Le Ponant | aucun |
| Port Camargue / Espiguette | jeu. 12 08:00 → jeu. 12 11:00 : Ça se tente (moy. 6.2, pic 6.5) |
| Beauduc | ven. 13 08:00 → ven. 13 18:00 : Ça envoie (moy. 8.8, pic 10) |
| Le Jaï | jeu. 12 12:00 → jeu. 12 14:00 : Ça se tente (moy. 5.4, pic 5.6) ; ven. 13 10:00 → ven. 13 18:00 : Ça envoie (moy. 8.4, pic 8.9) |
| Almanarre (Hyères) | aucun |

### Détail (toutes les 2 h de jour, Sécu first)

Vent en nœuds (rafales) · d'où il vient · secteur · note · ce qui limite.

**La Franqui** — mer. 11 15:00 8 (11) ESE onshore **0** pas assez de vent · mer. 11 17:00 6 (9) ESE onshore **0** pas assez de vent · jeu. 12 09:00 9 (25) SSO side-off **0** side-off (dérive vers le large) · jeu. 12 11:00 13 (18) NO offshore **0** vent de terre : dérive au large · jeu. 12 13:00 22 (30) ONO offshore **0** vent de terre : dérive au large · jeu. 12 15:00 16 (30) NO offshore **0** vent de terre : dérive au large · jeu. 12 17:00 14 (23) NO offshore **0** vent de terre : dérive au large · ven. 13 09:00 27 (46) ONO offshore **0** vent de terre : dérive au large · ven. 13 11:00 24 (43) ONO offshore **0** vent de terre : dérive au large · ven. 13 13:00 23 (40) ONO offshore **0** vent de terre : dérive au large · ven. 13 15:00 24 (41) ONO offshore **0** vent de terre : dérive au large · ven. 13 17:00 24 (40) ONO offshore **0** vent de terre : dérive au large · sam. 14 09:00 1 (2) NO offshore **0** vent de terre : dérive au large · sam. 14 11:00 3 (6) NE side-on **0** pas assez de vent · sam. 14 13:00 5 (11) ENE side-on **0** pas assez de vent · sam. 14 15:00 5 (10) ENE side-on **0** pas assez de vent · sam. 14 17:00 6 (11) NE side-on **0** pas assez de vent

**La Grande-Motte** — mer. 11 15:00 6 (11) N offshore **0** vent de terre : dérive au large · mer. 11 17:00 3 (7) NO offshore **0** vent de terre : dérive au large · jeu. 12 09:00 20 (32) SSE onshore **4.8** vent rafaleux · jeu. 12 11:00 21 (33) SSE onshore **5.1** vent rafaleux · jeu. 12 13:00 8 (14) SO side-on **0** pas assez de vent · jeu. 12 15:00 6 (18) NNO offshore **0** vent de terre : dérive au large · jeu. 12 17:00 14 (26) ONO side-off **0** side-off (dérive vers le large) · ven. 13 09:00 6 (12) NNO offshore **0** vent de terre : dérive au large · ven. 13 11:00 9 (15) NNO offshore **0** vent de terre : dérive au large · ven. 13 13:00 11 (17) NNO offshore **0** vent de terre : dérive au large · ven. 13 15:00 13 (20) N offshore **0** vent de terre : dérive au large · ven. 13 17:00 13 (20) NNE offshore **0** vent de terre : dérive au large · sam. 14 09:00 15 (21) NNE offshore **0** vent de terre : dérive au large · sam. 14 11:00 10 (20) NE side-off **0** side-off (dérive vers le large) · sam. 14 13:00 8 (14) NE side-off **0** side-off (dérive vers le large) · sam. 14 15:00 8 (14) NNE offshore **0** vent de terre : dérive au large · sam. 14 17:00 7 (12) NNE offshore **0** vent de terre : dérive au large

**Le Ponant** — mer. 11 15:00 4 (6) NNE  **0** pas assez de vent · mer. 11 17:00 1 (4) N  **0** pas assez de vent · jeu. 12 09:00 11 (18) SSE  **4.8** vent rafaleux · jeu. 12 11:00 12 (20) SSE  **5.6** vent rafaleux · jeu. 12 13:00 5 (12) SSO  **0** pas assez de vent · jeu. 12 15:00 4 (12) NNO  **0** pas assez de vent · jeu. 12 17:00 8 (14) ONO  **0** pas assez de vent · ven. 13 09:00 5 (8) N  **0** pas assez de vent · ven. 13 11:00 6 (11) N  **0** pas assez de vent · ven. 13 13:00 7 (12) N  **0** pas assez de vent · ven. 13 15:00 8 (12) N  **0** pas assez de vent · ven. 13 17:00 7 (11) NNE  **0** pas assez de vent · sam. 14 09:00 2 (2) N  **0** pas assez de vent · sam. 14 11:00 2 (3) ENE  **0** pas assez de vent · sam. 14 13:00 3 (5) NO  **0** pas assez de vent · sam. 14 15:00 3 (5) NNE  **0** pas assez de vent · sam. 14 17:00 3 (5) NE  **0** pas assez de vent · dim. 15 09:00 4 (7) NNE  **0** pas assez de vent · dim. 15 11:00 5 (7) NE  **0** pas assez de vent · dim. 15 13:00 5 (8) NE  **0** pas assez de vent

**Port Camargue / Espiguette** — mer. 11 15:00 6 (11) N offshore **0** vent de terre : dérive au large · mer. 11 17:00 3 (5) O side-on **0** pas assez de vent · jeu. 12 09:00 19 (31) SSE side-on **5.8** vent rafaleux · jeu. 12 11:00 17 (34) SE side-on **4** vent rafaleux · jeu. 12 13:00 8 (25) SSO onshore **3.2** vent rafaleux · jeu. 12 15:00 8 (19) NNO offshore **0** vent de terre : dérive au large · jeu. 12 17:00 15 (23) ONO side **6.9** vent rafaleux · ven. 13 09:00 9 (17) N offshore **0** vent de terre : dérive au large · ven. 13 11:00 13 (18) NNO offshore **0** vent de terre : dérive au large · ven. 13 13:00 12 (19) NNO offshore **0** vent de terre : dérive au large · ven. 13 15:00 13 (20) NNO offshore **0** vent de terre : dérive au large · ven. 13 17:00 15 (20) NNE offshore **0** vent de terre : dérive au large · sam. 14 09:00 17 (24) NE offshore **0** vent de terre : dérive au large · sam. 14 11:00 15 (24) NE offshore **0** vent de terre : dérive au large · sam. 14 13:00 10 (17) NE offshore **0** vent de terre : dérive au large · sam. 14 15:00 9 (14) NE offshore **0** vent de terre : dérive au large · sam. 14 17:00 4 (9) ESE side **0** pas assez de vent

**Beauduc** — mer. 11 15:00 2 (3) OSO onshore **0** pas assez de vent · mer. 11 17:00 3 (5) OSO onshore **0** pas assez de vent · jeu. 12 09:00 21 (27) SE side-off **0** side-off (dérive vers le large) · jeu. 12 11:00 23 (31) SE side-off **0** side-off (dérive vers le large) · jeu. 12 13:00 15 (25) SSE side **5.6** vent rafaleux · jeu. 12 15:00 9 (13) ONO side-on **0** pas assez de vent · jeu. 12 17:00 9 (12) NO side-on **0** pas assez de vent · ven. 13 09:00 15 (23) NNO side **6.9** vent rafaleux · ven. 13 11:00 19 (26) NNO side **9.1** vent rafaleux · ven. 13 13:00 21 (28) NNO side **9.6** vent rafaleux · ven. 13 15:00 22 (30) NNO side **9.2** vent rafaleux · ven. 13 17:00 21 (28) NNO side **9.6** vent rafaleux · sam. 14 09:00 4 (10) ENE offshore **0** vent de terre : dérive au large · sam. 14 11:00 3 (5) NNO side **0** pas assez de vent · sam. 14 13:00 7 (7) NO side-on **0** pas assez de vent · sam. 14 15:00 9 (11) N side-off **0** side-off (dérive vers le large) · sam. 14 17:00 11 (11) NE offshore **0** vent de terre : dérive au large · dim. 15 09:00 10 (11) NNE side-off **0** side-off (dérive vers le large) · dim. 15 11:00 8 (12) NE offshore **0** vent de terre : dérive au large · dim. 15 13:00 7 (12) E offshore **0** vent de terre : dérive au large

**Le Jaï** — mer. 11 15:00 4 (6) SSE  **0** pas assez de vent · mer. 11 17:00 2 (5) S  **0** pas assez de vent · jeu. 12 09:00 17 (26) SSE  **4.2** direction déconseillée sur ce plan d’eau · jeu. 12 11:00 19 (29) SE  **4.2** direction déconseillée sur ce plan d’eau · jeu. 12 13:00 17 (23) SE  **5.6** direction déconseillée sur ce plan d’eau · jeu. 12 15:00 11 (16) SSE  **2.4** pas assez de vent · jeu. 12 17:00 9 (10) O  **0** pas assez de vent · ven. 13 09:00 11 (15) NNO  **3.1** pas assez de vent · ven. 13 11:00 16 (23) NNO  **8.2** vent rafaleux · ven. 13 13:00 22 (31) NO  **8.5** vent rafaleux · ven. 13 15:00 24 (34) NO  **8.4** vent rafaleux · ven. 13 17:00 22 (33) NO  **7.3** vent rafaleux · sam. 14 09:00 5 (6) ESE  **0** pas assez de vent · sam. 14 11:00 4 (7) ESE  **0** pas assez de vent · sam. 14 13:00 11 (17) SE  **2.7** direction déconseillée sur ce plan d’eau · sam. 14 15:00 11 (17) SE  **2.7** direction déconseillée sur ce plan d’eau · sam. 14 17:00 9 (15) ESE  **0** pas assez de vent

**Almanarre (Hyères)** — mer. 11 15:00 9 (13) SO onshore **0** pas assez de vent · mer. 11 17:00 4 (7) SSO side-on **0** pas assez de vent · jeu. 12 09:00 8 (13) SSE side **0** pas assez de vent · jeu. 12 11:00 11 (14) ESE side-off **0** side-off (dérive vers le large) · jeu. 12 13:00 11 (16) E offshore **0** vent de terre : dérive au large · jeu. 12 15:00 10 (14) E offshore **0** vent de terre : dérive au large · jeu. 12 17:00 11 (16) E offshore **0** vent de terre : dérive au large · ven. 13 09:00 7 (17) O onshore **0** pas assez de vent · ven. 13 11:00 5 (9) OSO onshore **0** pas assez de vent · ven. 13 13:00 9 (14) OSO onshore **0** pas assez de vent · ven. 13 15:00 5 (11) O onshore **0** pas assez de vent · ven. 13 17:00 3 (6) O onshore **0** pas assez de vent · sam. 14 09:00 10 (16) E offshore **0** vent de terre : dérive au large · sam. 14 11:00 11 (16) E offshore **0** vent de terre : dérive au large · sam. 14 13:00 12 (18) E offshore **0** vent de terre : dérive au large · sam. 14 15:00 11 (18) E offshore **0** vent de terre : dérive au large · sam. 14 17:00 10 (16) E offshore **0** vent de terre : dérive au large


Copernicus Med-WAV est inclus pour le surf quand l'extrait a moins de 30 h (même règle que l'app en service) ; la note wing (v2.0, modes Sécu first / Offshore) part du vent corrigé de la super prévision ; pas de note kite (décision de Tom).
