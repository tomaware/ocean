# Rapport d'analyse (② ANALYSE)

Généré le 2026-11-14 00:17 UTC par `pipeline/engines/run.ts`, juste après la collecte.

Les moteurs des apps actuelles (copies non modifiées dans `legacy/`) sont alimentés par la collecte commune. Le test golden refait le calcul comme les apps actuelles, avec leurs propres parseurs sur les mêmes réponses brutes, et exige les mêmes notes à ±0.1.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| golden-surf | ✅ | 3114 valeurs (note, hauteur, vent × 6 spots), écart max 0 ; créneaux identiques (tolérance 0.1) |
| golden-downwind | ✅ | 1440 valeurs (vent, houle, 3 notes × 3 parcours), écart max 0 ; créneaux identiques ; correction du vent identique (tolérance 0.1) |
| correction-vent-downwind | ✅ | 2 spot(s) de recalage : La Grande-Motte 83 h (× 1.08 en moyenne), Port Camargue 58 h (× 1.11 en moyenne) + relevé récent |
| sorties-surf | ✅ | 6/6 spots notés ; 12 créneaux |
| houle-direction-downwind | ✅ | direction de la houle (affichage, carte) : 288/288 heures |
| sorties-downwind | ✅ | 3/3 parcours notés ; 1 meilleurs créneaux |
| ecart-prod-surf | ✅ | notes surf OCEAN vs app en service (calcul prod. 37 min avant, même extrait Copernicus) : médiane 0.10, 90 % ≤ 0.70, max 1.70 sur 664 heures (max : vias mar. 03:00, OCEAN 2.8 / prod 4.5) |
| ecart-prod-downwind | ✅ | notes downwind (intermédiaire, de jour) OCEAN vs app en service (calcul prod. 77 min avant) : médiane 0.00, 90 % ≤ 0.00, max 3.40 sur 120 heures |
| sorties-wing | ✅ | 7 spots notés (wing v2.3.0) ; 7 session(s) 2H en mode Sécu first sur les heures prévues |
| sorties-kite | ✅ | 7 spots notés (kite v1.0.0) ; 4 session(s) 2H en mode Sécu first |
| confidentialite-moteurs | ✅ | aucun relevé Winds-Up ni clé dans les sorties (seuls les facteurs de correction dérivés y figurent, comme dans l’app downwind actuelle) |
| copernicus-surf | ✅ | Copernicus Med-WAV inclus dans le moteur surf (comme l’app en service) |

## Meilleurs créneaux surf (7 jours)

| Quand | Spot | Note moyenne | Pic |
|---|---|---|---|
| mer. 18 08:00 → mer. 18 18:00 | La Couronne (Martigues) | 8.75 | 9.6 |
| mar. 17 08:00 → mar. 17 18:00 | Carnon | 7.23 | 8.44 |
| mar. 17 08:00 → mar. 17 18:00 | Palavas-les-Flots | 7.27 | 8.34 |
| mar. 17 08:00 → mar. 17 18:00 | La Guillotine | 7.35 | 8.12 |
| mar. 17 08:00 → mar. 17 18:00 | Sète (Lazaret / Fontaine) | 7.17 | 8.34 |

## Meilleurs créneaux downwind (4 jours)

| Quand | Parcours | Note moyenne | Pic |
|---|---|---|---|
| dim. 15 14:00 → dim. 15 18:00 | Plage Sud (Port Camargue) → La Grande-Motte | 7.2 | 8.1 |

## Wing foil — sessions 2H (mode Sécu first, vent corrigé de la super prévision)

| Spot | Créneaux |
|---|---|
| La Franqui | sam. 14 09:00 → sam. 14 11:00 : Ça envoie (moy. 7.2, pic 8) |
| La Grande-Motte | aucun |
| Le Ponant | aucun |
| Plage Sud | dim. 15 14:00 → dim. 15 16:00 : Ça se tente (moy. 5.9, pic 6.5) ; lun. 16 08:00 → lun. 16 15:00 : Ça envoie (moy. 7.9, pic 10) |
| Beauduc | aucun |
| Le Jaï | aucun |
| Hyères | sam. 14 08:00 → sam. 14 14:00 : Ça envoie (moy. 7.5, pic 10) ; sam. 14 15:00 → sam. 14 18:00 : Ça envoie (moy. 7.5, pic 8) ; dim. 15 10:00 → dim. 15 13:00 : Ça se tente (moy. 5.5, pic 5.7) ; dim. 15 14:00 → dim. 15 18:00 : Ça envoie (moy. 6.5, pic 7.5) |

### Détail (toutes les 2 h de jour, Sécu first)

Vent en nœuds (rafales) · d'où il vient · secteur · note · ce qui limite.

**La Franqui** — sam. 14 09:00 14 (18) E onshore **8** vent de mer (face à la plage) · sam. 14 11:00 9 (16) E onshore **0** pas assez de vent · sam. 14 13:00 9 (12) E onshore **0** pas assez de vent · sam. 14 15:00 11 (14) ENE side-on **5** pas assez de vent · sam. 14 17:00 9 (14) NE side-on **0** pas assez de vent · dim. 15 09:00 5 (5) NE side-on **0** pas assez de vent · dim. 15 11:00 5 (9) NE side-on **0** pas assez de vent · dim. 15 13:00 9 (12) ENE side-on **0** pas assez de vent · dim. 15 15:00 8 (13) SSE side-on **0** pas assez de vent · dim. 15 17:00 6 (16) SSE side-on **0** pas assez de vent · lun. 16 09:00 13 (23) ONO offshore **0** vent de terre : dérive au large · lun. 16 11:00 10 (21) ONO offshore **0** vent de terre : dérive au large · lun. 16 13:00 6 (15) ONO offshore **0** vent de terre : dérive au large · lun. 16 15:00 2 (11) SSO side-off **0** side-off (dérive vers le large) · lun. 16 17:00 9 (14) SSE side-on **0** pas assez de vent · mar. 17 09:00 6 (11) O offshore **0** vent de terre : dérive au large · mar. 17 11:00 4 (9) SSO side-off **0** side-off (dérive vers le large) · mar. 17 13:00 2 (9) OSO offshore **0** vent de terre : dérive au large · mar. 17 15:00 3 (4) SSO side-off **0** side-off (dérive vers le large) · mar. 17 17:00 2 (6) E onshore **0** pas assez de vent

**La Grande-Motte** — sam. 14 09:00 7 (10) NNE offshore **0** vent de terre : dérive au large · sam. 14 11:00 7 (13) NNE offshore **0** vent de terre : dérive au large · sam. 14 13:00 6 (11) NNE offshore **0** vent de terre : dérive au large · sam. 14 15:00 6 (10) NNE offshore **0** vent de terre : dérive au large · sam. 14 17:00 7 (10) N offshore **0** vent de terre : dérive au large · dim. 15 09:00 6 (11) NE side-off **0** side-off (dérive vers le large) · dim. 15 11:00 6 (12) NE side-off **0** side-off (dérive vers le large) · dim. 15 13:00 7 (12) ENE side **0** pas assez de vent · dim. 15 15:00 17 (27) SE onshore **4.9** vent rafaleux · dim. 15 17:00 18 (33) SE onshore **3.6** vent rafaleux · lun. 16 09:00 9 (13) ONO side-off **0** side-off (dérive vers le large) · lun. 16 11:00 9 (15) O side-off **0** side-off (dérive vers le large) · lun. 16 13:00 8 (14) O side-off **0** side-off (dérive vers le large) · lun. 16 15:00 8 (14) SO side-on **0** pas assez de vent · lun. 16 17:00 8 (12) SO side-on **0** pas assez de vent · mar. 17 09:00 8 (16) N offshore **0** vent de terre : dérive au large · mar. 17 11:00 6 (16) N offshore **0** vent de terre : dérive au large · mar. 17 13:00 4 (12) NO offshore **0** vent de terre : dérive au large · mar. 17 15:00 5 (11) SO side-on **0** pas assez de vent · mar. 17 17:00 5 (16) OSO side **0** pas assez de vent · mer. 18 09:00 7 (16) O side-off **0** side-off (dérive vers le large) · mer. 18 11:00 10 (16) O side-off **0** side-off (dérive vers le large) · mer. 18 13:00 12 (22) OSO side **3.3** vent rafaleux · mer. 18 15:00 10 (24) OSO side **1** pas assez de vent · mer. 18 17:00 9 (27) ONO side-off **0** side-off (dérive vers le large) · jeu. 19 09:00 7 (16) O side-off **0** side-off (dérive vers le large) · jeu. 19 11:00 5 (16) OSO side **0** pas assez de vent · jeu. 19 13:00 7 (12) SSO side-on **0** pas assez de vent · jeu. 19 15:00 7 (11) ONO side-off **0** side-off (dérive vers le large) · jeu. 19 17:00 11 (11) O side-off **0** side-off (dérive vers le large)

**Le Ponant** — sam. 14 09:00 3 (4) N  **0** pas assez de vent · sam. 14 11:00 4 (6) NE  **0** pas assez de vent · sam. 14 13:00 4 (6) NNE  **0** pas assez de vent · sam. 14 15:00 3 (5) NNE  **0** pas assez de vent · sam. 14 17:00 3 (5) NNE  **0** pas assez de vent · dim. 15 09:00 3 (5) NE  **0** pas assez de vent · dim. 15 11:00 4 (7) ENE  **0** pas assez de vent · dim. 15 13:00 5 (7) ENE  **0** pas assez de vent · dim. 15 15:00 11 (18) SE  **2.9** pas assez de vent · dim. 15 17:00 9 (21) SE  **0** pas assez de vent · lun. 16 09:00 6 (10) ONO  **0** pas assez de vent · lun. 16 11:00 6 (12) O  **0** pas assez de vent · lun. 16 13:00 6 (11) O  **0** pas assez de vent · lun. 16 15:00 6 (11) SO  **0** pas assez de vent · lun. 16 17:00 5 (9) SO  **0** pas assez de vent · mar. 17 09:00 5 (9) N  **0** pas assez de vent · mar. 17 11:00 3 (9) NNO  **0** pas assez de vent · mar. 17 13:00 2 (8) NO  **0** pas assez de vent · mar. 17 15:00 4 (7) OSO  **0** pas assez de vent · mar. 17 17:00 3 (11) OSO  **0** pas assez de vent · mer. 18 09:00 5 (14) O  **0** pas assez de vent · mer. 18 11:00 5 (12) O  **0** pas assez de vent · mer. 18 13:00 9 (17) OSO  **0** pas assez de vent · mer. 18 15:00 6 (19) OSO  **0** pas assez de vent · mer. 18 17:00 7 (19) NO  **0** pas assez de vent · jeu. 19 09:00 5 (14) O  **0** pas assez de vent · jeu. 19 11:00 4 (12) NO  **0** pas assez de vent · jeu. 19 13:00 6 (9) ONO  **0** pas assez de vent · jeu. 19 15:00 6 (8) NO  **0** pas assez de vent · jeu. 19 17:00 8 (8) ONO  **0** pas assez de vent

**Plage Sud** — sam. 14 09:00 7 (11) NNE offshore **0** vent de terre : dérive au large · sam. 14 11:00 8 (14) NE offshore **0** vent de terre : dérive au large · sam. 14 13:00 6 (13) NE offshore **0** vent de terre : dérive au large · sam. 14 15:00 6 (10) NNE offshore **0** vent de terre : dérive au large · sam. 14 17:00 7 (13) NNE offshore **0** vent de terre : dérive au large · dim. 15 09:00 6 (13) E side-off **0** side-off (dérive vers le large) · dim. 15 11:00 7 (13) NE offshore **0** vent de terre : dérive au large · dim. 15 13:00 10 (17) E side-off **0** side-off (dérive vers le large) · dim. 15 15:00 17 (29) ESE side **5.3** vent rafaleux · dim. 15 17:00 20 (34) SE side-on **5.3** vent rafaleux · lun. 16 09:00 15 (19) O side-on **10** · lun. 16 11:00 15 (21) O side-on **8.7** vent rafaleux · lun. 16 13:00 12 (18) O side-on **5.5** vent rafaleux · lun. 16 15:00 10 (16) OSO side-on **1.5** pas assez de vent · lun. 16 17:00 11 (16) SO onshore **3.2** pas assez de vent · mar. 17 09:00 10 (21) N offshore **0** vent de terre : dérive au large · mar. 17 11:00 6 (7) NNO offshore **0** vent de terre : dérive au large · mar. 17 13:00 2 (7) ONO side **0** pas assez de vent · mar. 17 15:00 10 (14) OSO side-on **2.2** pas assez de vent · mar. 17 17:00 5 (8) O side-on **0** pas assez de vent

**Beauduc** — sam. 14 09:00 4 (6) NE offshore **0** vent de terre : dérive au large · sam. 14 11:00 3 (7) NE offshore **0** vent de terre : dérive au large · sam. 14 13:00 1 (5) OSO onshore **0** pas assez de vent · sam. 14 15:00 3 (5) N side-off **0** side-off (dérive vers le large) · sam. 14 17:00 4 (7) NO side-on **0** pas assez de vent · dim. 15 09:00 11 (11) ENE offshore **0** vent de terre : dérive au large · dim. 15 11:00 10 (11) E offshore **0** vent de terre : dérive au large · dim. 15 13:00 19 (22) ESE offshore **0** vent de terre : dérive au large · dim. 15 15:00 22 (25) ESE offshore **0** vent de terre : dérive au large · dim. 15 17:00 19 (32) SE side-off **0** side-off (dérive vers le large) · lun. 16 09:00 9 (9) NO side-on **0** pas assez de vent · lun. 16 11:00 7 (7) NNE side-off **0** side-off (dérive vers le large) · lun. 16 13:00 8 (8) NO side-on **0** pas assez de vent · lun. 16 15:00 7 (7) OSO onshore **0** pas assez de vent · lun. 16 17:00 6 (6) S side-on **0** pas assez de vent · mar. 17 09:00 8 (14) SSE side **0** pas assez de vent · mar. 17 11:00 6 (13) SSO side-on **0** pas assez de vent · mar. 17 13:00 4 (7) SSO side-on **0** pas assez de vent · mar. 17 15:00 6 (6) OSO onshore **0** pas assez de vent · mar. 17 17:00 7 (13) OSO onshore **0** pas assez de vent

**Le Jaï** — sam. 14 09:00 1 (3) N  **0** pas assez de vent · sam. 14 11:00 1 (6) NO  **0** pas assez de vent · sam. 14 13:00 10 (16) SSE  **0.9** pas assez de vent · sam. 14 15:00 11 (16) SE  **2.4** pas assez de vent · sam. 14 17:00 13 (18) SE  **5.3** direction déconseillée sur ce plan d’eau · dim. 15 09:00 4 (8) E  **0** pas assez de vent · dim. 15 11:00 3 (5) E  **0** pas assez de vent · dim. 15 13:00 6 (9) SE  **0** pas assez de vent · dim. 15 15:00 8 (11) ESE  **0** pas assez de vent · dim. 15 17:00 8 (11) ESE  **0** pas assez de vent · lun. 16 09:00 7 (12) NO  **0** pas assez de vent · lun. 16 11:00 8 (12) NO  **0** pas assez de vent · lun. 16 13:00 10 (16) NO  **1.5** pas assez de vent · lun. 16 15:00 8 (14) NO  **0** pas assez de vent · lun. 16 17:00 5 (8) ONO  **0** pas assez de vent · mar. 17 09:00 8 (15) S  **0** pas assez de vent · mar. 17 11:00 5 (7) SSE  **0** pas assez de vent · mar. 17 13:00 5 (7) S  **0** pas assez de vent · mar. 17 15:00 5 (6) SSO  **0** pas assez de vent · mar. 17 17:00 4 (5) ONO  **0** pas assez de vent

**Hyères** — sam. 14 09:00 13 (18) E onshore **7.1** vent de mer (face à la plage) (côté est du tombolo) · sam. 14 11:00 19 (24) ENE side-on **10** · sam. 14 13:00 19 (27) E onshore **6.7** vent de mer (face à la plage) (côté est du tombolo) · sam. 14 15:00 19 (25) E onshore **7.8** vent de mer (face à la plage) (côté est du tombolo) · sam. 14 17:00 19 (27) E onshore **6.7** vent de mer (face à la plage) (côté est du tombolo) · dim. 15 09:00 9 (12) NE side-on **0** pas assez de vent · dim. 15 11:00 12 (16) E onshore **5.7** pas assez de vent · dim. 15 13:00 11 (15) E onshore **3.7** pas assez de vent · dim. 15 15:00 12 (16) E onshore **5.7** pas assez de vent · dim. 15 17:00 13 (18) E onshore **7.1** vent de mer (face à la plage) (côté est du tombolo) · lun. 16 09:00 10 (15) O onshore **1.5** pas assez de vent · lun. 16 11:00 10 (17) ONO side-on **1.3** pas assez de vent · lun. 16 13:00 10 (18) ONO side-on **1.2** pas assez de vent · lun. 16 15:00 8 (13) O onshore **0** pas assez de vent · lun. 16 17:00 8 (12) O onshore **0** pas assez de vent · mar. 17 09:00 13 (20) SSO side-on **6.8** vent rafaleux · mar. 17 11:00 8 (17) OSO onshore **0** pas assez de vent · mar. 17 13:00 5 (8) SO onshore **0** pas assez de vent · mar. 17 15:00 6 (11) OSO onshore **0** pas assez de vent · mar. 17 17:00 6 (11) O onshore **0** pas assez de vent


Copernicus Med-WAV est inclus pour le surf quand l'extrait a moins de 30 h (même règle que l'app en service) ; la note wing (v2.0, modes Sécu first / Offshore) part du vent corrigé de la super prévision ; pas de note kite (décision de Tom).
