# Rapport d'analyse (② ANALYSE)

Généré le 2026-11-14 10:34 UTC par `pipeline/engines/run.ts`, juste après la collecte.

Les moteurs des apps actuelles (copies non modifiées dans `legacy/`) sont alimentés par la collecte commune. Le test golden refait le calcul comme les apps actuelles, avec leurs propres parseurs sur les mêmes réponses brutes, et exige les mêmes notes à ±0.1.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| golden-surf | ✅ | 3114 valeurs (note, hauteur, vent × 6 spots), écart max 0 ; créneaux identiques (tolérance 0.1) |
| golden-downwind | ✅ | 1440 valeurs (vent, houle, 3 notes × 3 parcours), écart max 0 ; créneaux identiques ; correction du vent identique (tolérance 0.1) |
| correction-vent-downwind | ✅ | 2 spot(s) de recalage : La Grande-Motte 55 h (× 1.01 en moyenne) + relevé récent, Port Camargue 59 h (× 0.93 en moyenne) + relevé récent |
| sorties-surf | ✅ | 6/6 spots notés ; 12 créneaux |
| houle-direction-downwind | ✅ | direction de la houle (affichage, carte) : 288/288 heures |
| sorties-downwind | ✅ | 3/3 parcours notés ; 0 meilleurs créneaux |
| ecart-prod-surf | ✅ | notes surf OCEAN vs app en service (calcul prod. 104 min avant, même extrait Copernicus) : médiane 0.00, 90 % ≤ 0.40, max 2.30 sur 660 heures (max : carnon mer. 00:00, OCEAN 6.4 / prod 4.1) |
| ecart-prod-downwind | ✅ | notes downwind (intermédiaire, de jour) OCEAN vs app en service (calcul prod. 88 min avant) : médiane 0.00, 90 % ≤ 0.00, max 4.10 sur 114 heures |
| sorties-wing | ✅ | 7 spots notés (wing v2.3.0) ; 4 session(s) 2H en mode Sécu first sur les heures prévues |
| sorties-kite | ✅ | 7 spots notés (kite v1.0.0) ; 1 session(s) 2H en mode Sécu first |
| confidentialite-moteurs | ✅ | aucun relevé Winds-Up ni clé dans les sorties (seuls les facteurs de correction dérivés y figurent, comme dans l’app downwind actuelle) |
| copernicus-surf | ✅ | Copernicus Med-WAV inclus dans le moteur surf (comme l’app en service) |

## Meilleurs créneaux surf (7 jours)

| Quand | Spot | Note moyenne | Pic |
|---|---|---|---|
| dim. 15 08:00 → dim. 15 18:00 | La Guillotine | 7.72 | 8.79 |
| mer. 18 08:00 → mer. 18 18:00 | La Couronne (Martigues) | 6.92 | 9.08 |
| mar. 17 12:00 → mar. 17 18:00 | La Couronne (Martigues) | 6.96 | 8.41 |
| mar. 17 08:00 → mar. 17 16:00 | Carnon | 7.15 | 7.9 |
| dim. 15 08:00 → dim. 15 18:00 | Carnon | 6.98 | 8.16 |

## Meilleurs créneaux downwind (4 jours)

| Quand | Parcours | Note moyenne | Pic |
|---|---|---|---|

## Wing foil — sessions 2H (mode Sécu first, vent corrigé de la super prévision)

| Spot | Créneaux |
|---|---|
| La Franqui | aucun |
| La Grande-Motte | aucun |
| Le Ponant | aucun |
| Plage Sud | mar. 17 16:00 → mar. 17 18:00 : Ça envoie (moy. 7.3, pic 8.3) |
| Beauduc | aucun |
| Le Jaï | aucun |
| Hyères | sam. 14 11:00 → sam. 14 15:00 : Ça envoie (moy. 7.3, pic 8.7) ; sam. 14 16:00 → sam. 14 18:00 : Ça envoie (moy. 7.2, pic 7.8) ; dim. 15 09:00 → dim. 15 13:00 : Ça envoie (moy. 6.7, pic 8.3) |

### Détail (toutes les 2 h de jour, Sécu first)

Vent en nœuds (rafales) · d'où il vient · secteur · note · ce qui limite.

**La Franqui** — sam. 14 13:00 8 (12) ENE side-on **0** pas assez de vent · sam. 14 15:00 9 (15) ENE side-on **0** pas assez de vent · sam. 14 17:00 7 (11) NE side-on **0** pas assez de vent · dim. 15 09:00 2 (2) OSO offshore **0** vent de terre : dérive au large · dim. 15 11:00 2 (5) E onshore **0** pas assez de vent · dim. 15 13:00 1 (8) E onshore **0** pas assez de vent · dim. 15 15:00 10 (15) E onshore **1.5** pas assez de vent · dim. 15 17:00 8 (15) ENE side-on **0** pas assez de vent · lun. 16 09:00 2 (3) OSO offshore **0** vent de terre : dérive au large · lun. 16 11:00 2 (3) NNE side **0** pas assez de vent · lun. 16 13:00 4 (8) NNE side **0** pas assez de vent · lun. 16 15:00 4 (8) ENE side-on **0** pas assez de vent · lun. 16 17:00 5 (9) ENE side-on **0** pas assez de vent · mar. 17 09:00 6 (10) ONO offshore **0** vent de terre : dérive au large · mar. 17 11:00 4 (8) OSO offshore **0** vent de terre : dérive au large · mar. 17 13:00 4 (7) S side **0** pas assez de vent · mar. 17 15:00 7 (15) SSO side-off **0** side-off (dérive vers le large) · mar. 17 17:00 4 (8) ONO offshore **0** vent de terre : dérive au large

**La Grande-Motte** — sam. 14 13:00 6 (12) NNE offshore **0** vent de terre : dérive au large · sam. 14 15:00 5 (9) NNE offshore **0** vent de terre : dérive au large · sam. 14 17:00 6 (12) NNE offshore **0** vent de terre : dérive au large · dim. 15 09:00 5 (10) NNE offshore **0** vent de terre : dérive au large · dim. 15 11:00 4 (8) NNE offshore **0** vent de terre : dérive au large · dim. 15 13:00 5 (9) NE side-off **0** side-off (dérive vers le large) · dim. 15 15:00 7 (10) NE side-off **0** side-off (dérive vers le large) · dim. 15 17:00 10 (16) N offshore **0** vent de terre : dérive au large · lun. 16 09:00 5 (5) NE side-off **0** side-off (dérive vers le large) · lun. 16 11:00 2 (5) NE side-off **0** side-off (dérive vers le large) · lun. 16 13:00 6 (7) NNE offshore **0** vent de terre : dérive au large · lun. 16 15:00 5 (7) SSE onshore **0** pas assez de vent · lun. 16 17:00 5 (7) S onshore **0** pas assez de vent · mar. 17 09:00 11 (22) NO offshore **0** vent de terre : dérive au large · mar. 17 11:00 5 (12) NNO offshore **0** vent de terre : dérive au large · mar. 17 13:00 4 (5) O side-off **0** side-off (dérive vers le large) · mar. 17 15:00 7 (10) SO side-on **0** pas assez de vent · mar. 17 17:00 11 (19) OSO side **2.6** pas assez de vent

**Le Ponant** — sam. 14 13:00 2 (6) NNE  **0** pas assez de vent · sam. 14 15:00 2 (4) N  **0** pas assez de vent · sam. 14 17:00 2 (5) NE  **0** pas assez de vent · dim. 15 09:00 3 (5) NNE  **0** pas assez de vent · dim. 15 11:00 3 (5) NNE  **0** pas assez de vent · dim. 15 13:00 4 (7) ENE  **0** pas assez de vent · dim. 15 15:00 8 (13) SE  **0** pas assez de vent · dim. 15 17:00 9 (15) SE  **0** pas assez de vent · lun. 16 09:00 3 (3) NE  **0** pas assez de vent · lun. 16 11:00 1 (3) NE  **0** pas assez de vent · lun. 16 13:00 3 (4) NNE  **0** pas assez de vent · lun. 16 15:00 3 (4) SSE  **0** pas assez de vent · lun. 16 17:00 3 (4) S  **0** pas assez de vent · mar. 17 09:00 7 (13) NO  **0** pas assez de vent · mar. 17 11:00 3 (7) NNO  **0** pas assez de vent · mar. 17 13:00 3 (3) O  **0** pas assez de vent · mar. 17 15:00 5 (6) SO  **0** pas assez de vent · mar. 17 17:00 7 (11) OSO  **0** pas assez de vent

**Plage Sud** — sam. 14 13:00 5 (10) NNE offshore **0** vent de terre : dérive au large · sam. 14 15:00 5 (7) NNE offshore **0** vent de terre : dérive au large · sam. 14 17:00 5 (11) NNE offshore **0** vent de terre : dérive au large · dim. 15 09:00 5 (9) N offshore **0** vent de terre : dérive au large · dim. 15 11:00 4 (8) N offshore **0** vent de terre : dérive au large · dim. 15 13:00 5 (9) NE offshore **0** vent de terre : dérive au large · dim. 15 15:00 6 (10) ENE side-off **0** side-off (dérive vers le large) · dim. 15 17:00 17 (32) SE side-on **4.1** vent rafaleux · lun. 16 09:00 4 (11) NNO offshore **0** vent de terre : dérive au large · lun. 16 11:00 3 (5) N offshore **0** vent de terre : dérive au large · lun. 16 13:00 6 (9) NNE offshore **0** vent de terre : dérive au large · lun. 16 15:00 4 (5) SSO onshore **0** pas assez de vent · lun. 16 17:00 7 (8) S onshore **0** pas assez de vent · mar. 17 09:00 3 (16) ONO side **0** pas assez de vent · mar. 17 11:00 6 (13) NNO offshore **0** vent de terre : dérive au large · mar. 17 13:00 5 (6) O side-on **0** pas assez de vent · mar. 17 15:00 10 (17) SO onshore **1.1** pas assez de vent · mar. 17 17:00 14 (20) OSO side-on **8.3** vent rafaleux

**Beauduc** — sam. 14 13:00 4 (5) NNE side-off **0** side-off (dérive vers le large) · sam. 14 15:00 4 (9) O onshore **0** pas assez de vent · sam. 14 17:00 6 (9) N side-off **0** side-off (dérive vers le large) · dim. 15 09:00 8 (10) NE offshore **0** vent de terre : dérive au large · dim. 15 11:00 7 (10) ESE offshore **0** vent de terre : dérive au large · dim. 15 13:00 14 (16) ESE offshore **0** vent de terre : dérive au large · dim. 15 15:00 17 (21) SE side-off **0** side-off (dérive vers le large) · dim. 15 17:00 19 (23) SE side-off **0** side-off (dérive vers le large) · lun. 16 09:00 6 (8) N side-off **0** side-off (dérive vers le large) · lun. 16 11:00 5 (6) N side-off **0** side-off (dérive vers le large) · lun. 16 13:00 6 (7) NNO side **0** pas assez de vent · lun. 16 15:00 6 (7) OSO onshore **0** pas assez de vent · lun. 16 17:00 5 (10) SSO side-on **0** pas assez de vent · mar. 17 09:00 12 (15) SSE side **7.5** pas assez de vent · mar. 17 11:00 2 (8) SSO side-on **0** pas assez de vent · mar. 17 13:00 5 (7) SO onshore **0** pas assez de vent · mar. 17 15:00 6 (12) OSO onshore **0** pas assez de vent · mar. 17 17:00 12 (17) OSO onshore **5.1** pas assez de vent

**Le Jaï** — sam. 14 13:00 10 (15) SE  **1.1** pas assez de vent · sam. 14 15:00 11 (19) SE  **1.5** pas assez de vent · sam. 14 17:00 10 (14) ESE  **1.3** pas assez de vent · dim. 15 09:00 9 (14) E  **0** pas assez de vent · dim. 15 11:00 1 (9) ESE  **0** pas assez de vent · dim. 15 13:00 2 (4) NO  **0** pas assez de vent · dim. 15 15:00 6 (8) SSE  **0** pas assez de vent · dim. 15 17:00 6 (7) ESE  **0** pas assez de vent · lun. 16 09:00 6 (8) NO  **0** pas assez de vent · lun. 16 11:00 3 (7) NO  **0** pas assez de vent · lun. 16 13:00 5 (8) ONO  **0** pas assez de vent · lun. 16 15:00 3 (8) NO  **0** pas assez de vent · lun. 16 17:00 4 (4) SE  **0** pas assez de vent · mar. 17 09:00 11 (21) SSE  **1.2** vent rafaleux · mar. 17 11:00 6 (15) S  **0** pas assez de vent · mar. 17 13:00 3 (6) SO  **0** pas assez de vent · mar. 17 15:00 3 (4) SO  **0** pas assez de vent · mar. 17 17:00 5 (7) O  **0** pas assez de vent

**Hyères** — sam. 14 13:00 23 (32) E onshore **7** vent de mer (face à la plage) (côté est du tombolo) · sam. 14 15:00 14 (25) ESE onshore **3.8** vent rafaleux · sam. 14 17:00 22 (29) E onshore **7.8** vent de mer (face à la plage) (côté est du tombolo) · dim. 15 09:00 12 (18) ENE side-on **5.5** vent rafaleux · dim. 15 11:00 14 (20) ENE side-on **8.3** vent rafaleux · dim. 15 13:00 12 (19) ENE side-on **4.7** vent rafaleux · dim. 15 15:00 11 (16) ENE side-on **4** pas assez de vent · dim. 15 17:00 11 (15) ENE side-on **4.6** pas assez de vent · lun. 16 09:00 8 (10) ONO side-on **0** pas assez de vent · lun. 16 11:00 9 (12) O onshore **0** pas assez de vent · lun. 16 13:00 10 (16) O onshore **1.2** pas assez de vent · lun. 16 15:00 11 (18) O onshore **2.3** pas assez de vent · lun. 16 17:00 8 (12) OSO onshore **0** pas assez de vent · mar. 17 09:00 10 (13) S side-on **2.5** pas assez de vent · mar. 17 11:00 12 (20) SO onshore **3.3** vent rafaleux · mar. 17 13:00 10 (15) OSO onshore **1.5** pas assez de vent · mar. 17 15:00 9 (15) OSO onshore **0** pas assez de vent · mar. 17 17:00 10 (16) O onshore **1.2** pas assez de vent


Copernicus Med-WAV est inclus pour le surf quand l'extrait a moins de 30 h (même règle que l'app en service) ; la note wing (v2.0, modes Sécu first / Offshore) part du vent corrigé de la super prévision ; pas de note kite (décision de Tom).
