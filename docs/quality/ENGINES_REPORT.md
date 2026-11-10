# Rapport d'analyse (② ANALYSE)

Généré le 2026-11-10 18:08 UTC par `pipeline/engines/run.ts`, juste après la collecte.

Les moteurs des apps actuelles (copies non modifiées dans `legacy/`) sont alimentés par la collecte commune. Le test golden refait le calcul comme les apps actuelles, avec leurs propres parseurs sur les mêmes réponses brutes, et exige les mêmes notes à ±0.1.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| golden-surf | ✅ | 3114 valeurs (note, hauteur, vent × 6 spots), écart max 0 ; créneaux identiques (tolérance 0.1) |
| golden-downwind | ✅ | 1440 valeurs (vent, houle, 3 notes × 3 parcours), écart max 0 ; créneaux identiques ; correction du vent identique (tolérance 0.1) |
| correction-vent-downwind | ✅ | 2 spot(s) de recalage : La Grande-Motte 53 h (× 0.98 en moyenne) + relevé récent, Port Camargue 52 h (× 0.93 en moyenne) + relevé récent |
| sorties-surf | ✅ | 6/6 spots notés ; 12 créneaux |
| houle-direction-downwind | ✅ | direction de la houle (affichage, carte) : 288/288 heures |
| sorties-downwind | ✅ | 3/3 parcours notés ; 1 meilleurs créneaux |
| ecart-prod-surf | ✅ | notes surf OCEAN vs app en service (calcul prod. 21 min avant, même extrait Copernicus) : médiane 0.00, 90 % ≤ 0.00, max 0.10 sur 664 heures (max : carnon ven. 16:00, OCEAN 8.7 / prod 8.8) |
| ecart-prod-downwind | ✅ | notes downwind (intermédiaire, de jour) OCEAN vs app en service (calcul prod. 8 min avant) : médiane 0.00, 90 % ≤ 0.00, max 0.00 sur 120 heures |
| vent-le-jai | ✅ | Le Jaï : meteofrance_arome_france_hd, le plus juste à LFML (erreur 1.14 m/s sur 100 mesures) ; 176 heures ; vent non corrigé |
| sorties-wing | ✅ | 7 spots notés (wing v2.0.0) ; 5 session(s) 2H en mode Sécu first sur les heures prévues |
| confidentialite-moteurs | ✅ | aucun relevé Winds-Up ni clé dans les sorties (seuls les facteurs de correction dérivés y figurent, comme dans l’app downwind actuelle) |
| copernicus-surf | ✅ | Copernicus Med-WAV inclus dans le moteur surf (comme l’app en service) |

## Meilleurs créneaux surf (7 jours)

| Quand | Spot | Note moyenne | Pic |
|---|---|---|---|
| ven. 13 08:00 → ven. 13 18:00 | Carnon | 9.31 | 9.68 |
| ven. 13 08:00 → ven. 13 18:00 | Palavas-les-Flots | 8.39 | 9.69 |
| ven. 13 08:00 → ven. 13 18:00 | Saintes-Maries-de-la-Mer | 8.39 | 9.08 |
| dim. 15 09:00 → dim. 15 18:00 | La Couronne (Martigues) | 7.82 | 8.44 |
| dim. 15 08:00 → dim. 15 18:00 | La Guillotine | 7.38 | 8.37 |

## Meilleurs créneaux downwind (4 jours)

| Quand | Parcours | Note moyenne | Pic |
|---|---|---|---|
| jeu. 12 11:00 → jeu. 12 13:00 | Plage Sud (Port Camargue) → La Grande-Motte | 6.2 | 6.2 |

## Wing foil — sessions 2H (mode Sécu first, vent corrigé de la super prévision)

| Spot | Créneaux |
|---|---|
| La Franqui | jeu. 12 08:00 → jeu. 12 10:00 : Ça envoie (moy. 6.9, pic 7.3) |
| La Grande-Motte | aucun |
| Le Ponant | jeu. 12 08:00 → jeu. 12 11:00 : Ça envoie (moy. 6.8, pic 7.8) |
| Port Camargue / Espiguette | jeu. 12 08:00 → jeu. 12 10:00 : Ça se tente (moy. 6.3, pic 6.8) |
| Beauduc | ven. 13 10:00 → ven. 13 18:00 : Ça envoie (moy. 8.2, pic 8.9) |
| Le Jaï | jeu. 12 09:00 → jeu. 12 12:00 : Ça se tente (moy. 5.3, pic 5.6) |
| Almanarre (Hyères) | aucun |

### Détail (toutes les 2 h de jour, Sécu first)

Vent en nœuds (rafales) · d'où il vient · secteur · note · ce qui limite.

**La Franqui** — mer. 11 09:00 4 (6) NO offshore **0** vent de terre : dérive au large · mer. 11 11:00 3 (5) NNE side **0** pas assez de vent · mer. 11 13:00 3 (6) E onshore **0** pas assez de vent · mer. 11 15:00 4 (7) ESE onshore **0** pas assez de vent · mer. 11 17:00 4 (6) E onshore **0** pas assez de vent · jeu. 12 09:00 16 (25) SSE side-on **6.5** vent rafaleux · jeu. 12 11:00 17 (23) NO offshore **0** vent de terre : dérive au large · jeu. 12 13:00 17 (26) NO offshore **0** vent de terre : dérive au large · jeu. 12 15:00 24 (44) ONO offshore **0** vent de terre : dérive au large · jeu. 12 17:00 23 (43) ONO offshore **0** vent de terre : dérive au large · ven. 13 09:00 18 (30) ONO offshore **0** vent de terre : dérive au large · ven. 13 11:00 17 (28) NO offshore **0** vent de terre : dérive au large · ven. 13 13:00 16 (28) NO offshore **0** vent de terre : dérive au large · ven. 13 15:00 13 (25) NO offshore **0** vent de terre : dérive au large · ven. 13 17:00 11 (20) NO offshore **0** vent de terre : dérive au large · sam. 14 09:00 2 (4) NO offshore **0** vent de terre : dérive au large · sam. 14 11:00 2 (4) NE side-on **0** pas assez de vent · sam. 14 13:00 5 (10) E onshore **0** pas assez de vent

**La Grande-Motte** — mer. 11 09:00 6 (9) N offshore **0** vent de terre : dérive au large · mer. 11 11:00 5 (11) NNE offshore **0** vent de terre : dérive au large · mer. 11 13:00 4 (7) NNO offshore **0** vent de terre : dérive au large · mer. 11 15:00 2 (8) NNO offshore **0** vent de terre : dérive au large · mer. 11 17:00 2 (5) OSO side **0** pas assez de vent · jeu. 12 09:00 27 (44) SE onshore **0** trop de vent (plus de 35 nd) · jeu. 12 11:00 26 (46) SE onshore **0** trop de vent (plus de 35 nd) · jeu. 12 13:00 15 (37) SSE onshore **3.2** vent rafaleux · jeu. 12 15:00 6 (11) O side-off **0** side-off (dérive vers le large) · jeu. 12 17:00 9 (15) OSO side **0** pas assez de vent · ven. 13 09:00 10 (14) N offshore **0** vent de terre : dérive au large · ven. 13 11:00 12 (19) N offshore **0** vent de terre : dérive au large · ven. 13 13:00 10 (15) N offshore **0** vent de terre : dérive au large · ven. 13 15:00 12 (19) N offshore **0** vent de terre : dérive au large · ven. 13 17:00 10 (17) NNE offshore **0** vent de terre : dérive au large · sam. 14 09:00 10 (13) NNE offshore **0** vent de terre : dérive au large · sam. 14 11:00 7 (13) NNE offshore **0** vent de terre : dérive au large · sam. 14 13:00 5 (10) NE side-off **0** side-off (dérive vers le large)

**Le Ponant** — mer. 11 09:00 3 (6) N  **0** pas assez de vent · mer. 11 11:00 3 (6) N  **0** pas assez de vent · mer. 11 13:00 3 (7) NNE  **0** pas assez de vent · mer. 11 15:00 2 (5) NNE  **0** pas assez de vent · mer. 11 17:00 2 (3) ESE  **0** pas assez de vent · jeu. 12 09:00 14 (22) SE  **6.4** vent rafaleux · jeu. 12 11:00 13 (23) SE  **4.9** vent rafaleux · jeu. 12 13:00 7 (21) SSE  **2.7** vent rafaleux · jeu. 12 15:00 4 (9) O  **0** pas assez de vent · jeu. 12 17:00 7 (12) O  **0** pas assez de vent · ven. 13 09:00 6 (10) NNE  **0** pas assez de vent · ven. 13 11:00 8 (12) N  **0** pas assez de vent · ven. 13 13:00 7 (12) N  **0** pas assez de vent · ven. 13 15:00 8 (13) N  **0** pas assez de vent · ven. 13 17:00 7 (12) NNE  **0** pas assez de vent · sam. 14 09:00 7 (11) NNE  **0** pas assez de vent · sam. 14 11:00 6 (12) NNE  **0** pas assez de vent · sam. 14 13:00 5 (10) NNE  **0** pas assez de vent · sam. 14 15:00 6 (10) NE  **0** pas assez de vent · sam. 14 17:00 6 (8) NE  **0** pas assez de vent

**Port Camargue / Espiguette** — mer. 11 09:00 4 (9) N offshore **0** vent de terre : dérive au large · mer. 11 11:00 4 (9) NNE offshore **0** vent de terre : dérive au large · mer. 11 13:00 3 (7) ONO side **0** pas assez de vent · mer. 11 15:00 3 (8) O side-on **0** pas assez de vent · mer. 11 17:00 3 (4) SSO onshore **0** pas assez de vent · jeu. 12 09:00 25 (41) SE side-on **5.7** vent rafaleux · jeu. 12 11:00 25 (44) SE side-on **4.9** vent rafaleux · jeu. 12 13:00 14 (34) SSE side-on **4** vent rafaleux · jeu. 12 15:00 5 (9) O side-on **0** pas assez de vent · jeu. 12 17:00 18 (23) O side-on **10** · ven. 13 09:00 8 (12) N offshore **0** vent de terre : dérive au large · ven. 13 11:00 14 (21) N offshore **0** vent de terre : dérive au large · ven. 13 13:00 12 (19) NNO offshore **0** vent de terre : dérive au large · ven. 13 15:00 13 (20) N offshore **0** vent de terre : dérive au large · ven. 13 17:00 11 (17) N offshore **0** vent de terre : dérive au large · sam. 14 09:00 11 (14) NNE offshore **0** vent de terre : dérive au large · sam. 14 11:00 10 (14) NE offshore **0** vent de terre : dérive au large · sam. 14 13:00 6 (12) ENE side-off **0** side-off (dérive vers le large)

**Beauduc** — mer. 11 09:00 4 (5) SSO side-on **0** pas assez de vent · mer. 11 11:00 4 (4) SE side-off **0** side-off (dérive vers le large) · mer. 11 13:00 5 (6) O onshore **0** pas assez de vent · mer. 11 15:00 5 (6) ONO side-on **0** pas assez de vent · mer. 11 17:00 4 (7) OSO onshore **0** pas assez de vent · jeu. 12 09:00 25 (33) SE side-off **0** side-off (dérive vers le large) · jeu. 12 11:00 27 (36) SE side-off **0** side-off (dérive vers le large) · jeu. 12 13:00 21 (30) SE side-off **0** side-off (dérive vers le large) · jeu. 12 15:00 8 (20) OSO onshore **2.1** vent rafaleux · jeu. 12 17:00 10 (14) O onshore **0** pas assez de vent · ven. 13 09:00 18 (26) N side-off **0** side-off (dérive vers le large) · ven. 13 11:00 18 (26) NNO side **8.1** vent rafaleux · ven. 13 13:00 21 (29) NNO side **8.9** vent rafaleux · ven. 13 15:00 21 (29) NNO side **8.9** vent rafaleux · ven. 13 17:00 19 (29) NNO side **7** vent rafaleux · sam. 14 09:00 14 (22) NNE side-off **0** side-off (dérive vers le large) · sam. 14 11:00 11 (19) NNE side-off **0** side-off (dérive vers le large) · sam. 14 13:00 12 (18) NNE side-off **0** side-off (dérive vers le large) · sam. 14 15:00 11 (16) NNE side-off **0** side-off (dérive vers le large) · sam. 14 17:00 10 (15) ESE offshore **0** vent de terre : dérive au large

**Le Jaï** — mer. 11 09:00 6 (8) S  **0** pas assez de vent · mer. 11 11:00 8 (10) SE  **0** pas assez de vent · mer. 11 13:00 3 (11) SE  **0** pas assez de vent · mer. 11 15:00 3 (6) SSE  **0** pas assez de vent · mer. 11 17:00 3 (6) S  **0** pas assez de vent · jeu. 12 09:00 19 (26) SE  **5.1** direction déconseillée sur ce plan d’eau · jeu. 12 11:00 21 (29) SE  **5.1** direction déconseillée sur ce plan d’eau · jeu. 12 13:00 20 (26) SE  **5.9** direction déconseillée sur ce plan d’eau · jeu. 12 15:00 12 (22) SSE  **2.6** vent rafaleux · jeu. 12 17:00 10 (27) SO  **4** vent rafaleux · ven. 13 09:00 20 (39) NO  **4** vent rafaleux · ven. 13 11:00 19 (38) NO  **4** vent rafaleux · ven. 13 13:00 18 (35) NO  **4** vent rafaleux · ven. 13 15:00 16 (33) NO  **4** vent rafaleux · ven. 13 17:00 14 (29) NO  **4** vent rafaleux · sam. 14 09:00 6 (18) E  **0** pas assez de vent · sam. 14 11:00 8 (15) SE  **0** pas assez de vent · sam. 14 13:00 13 (10) SE  **1.4** pas assez de vent · sam. 14 15:00 9 (9) SE  **0** pas assez de vent · sam. 14 17:00 7 (9) SE  **0** pas assez de vent · dim. 15 09:00 11 (22) E  **4** vent rafaleux · dim. 15 11:00 8 (22) E  **4** vent rafaleux · dim. 15 13:00 7 (18) ENE  **1** pas assez de vent · dim. 15 15:00 2 (15) NE  **0** pas assez de vent · dim. 15 17:00 1 (18) ONO  **0** pas assez de vent · lun. 16 09:00 2 (16) ENE  **0** pas assez de vent · lun. 16 11:00 4 (19) NO  **0** pas assez de vent · lun. 16 13:00 5 (11) ONO  **0** pas assez de vent · lun. 16 15:00 5 (12) ONO  **0** pas assez de vent · lun. 16 17:00 4 (12) NO  **0** pas assez de vent · mar. 17 09:00 5 (11) E  **0** pas assez de vent · mar. 17 11:00 5 (13) SE  **0** pas assez de vent · mar. 17 13:00 6 (14) SSE  **0** pas assez de vent · mar. 17 15:00 6 (14) SSE  **0** pas assez de vent · mar. 17 17:00 6 (14) SE  **0** pas assez de vent

**Almanarre (Hyères)** — mer. 11 09:00 6 (8) SSO side-on **0** pas assez de vent · mer. 11 11:00 9 (12) SSO side-on **0** pas assez de vent · mer. 11 13:00 5 (8) OSO onshore **0** pas assez de vent · mer. 11 15:00 3 (6) SO onshore **0** pas assez de vent · mer. 11 17:00 1 (3) SO onshore **0** pas assez de vent · jeu. 12 09:00 11 (14) E offshore **0** vent de terre : dérive au large · jeu. 12 11:00 11 (15) E offshore **0** vent de terre : dérive au large · jeu. 12 13:00 12 (17) E offshore **0** vent de terre : dérive au large · jeu. 12 15:00 6 (8) ESE side-off **0** side-off (dérive vers le large) · jeu. 12 17:00 3 (6) ENE offshore **0** vent de terre : dérive au large · ven. 13 09:00 7 (10) O onshore **0** pas assez de vent · ven. 13 11:00 8 (12) O onshore **0** pas assez de vent · ven. 13 13:00 6 (10) O onshore **0** pas assez de vent · ven. 13 15:00 5 (7) OSO onshore **0** pas assez de vent · ven. 13 17:00 4 (7) O onshore **0** pas assez de vent · sam. 14 09:00 4 (6) SE side-off **0** side-off (dérive vers le large) · sam. 14 11:00 9 (14) E offshore **0** vent de terre : dérive au large · sam. 14 13:00 10 (15) E offshore **0** vent de terre : dérive au large


Copernicus Med-WAV est inclus pour le surf quand l'extrait a moins de 30 h (même règle que l'app en service) ; la note wing (v2.0, modes Sécu first / Offshore) part du vent corrigé de la super prévision ; pas de note kite (décision de Tom).
