# Rapport d'analyse (② ANALYSE)

Généré le 2026-11-12 18:06 UTC par `pipeline/engines/run.ts`, juste après la collecte.

Les moteurs des apps actuelles (copies non modifiées dans `legacy/`) sont alimentés par la collecte commune. Le test golden refait le calcul comme les apps actuelles, avec leurs propres parseurs sur les mêmes réponses brutes, et exige les mêmes notes à ±0.1.

## Contrôles

| Contrôle | Résultat | Détail |
|---|---|---|
| golden-surf | ✅ | 3114 valeurs (note, hauteur, vent × 6 spots), écart max 0 ; créneaux identiques (tolérance 0.1) |
| golden-downwind | ✅ | 1440 valeurs (vent, houle, 3 notes × 3 parcours), écart max 0 ; créneaux identiques ; correction du vent identique (tolérance 0.1) |
| correction-vent-downwind | ✅ | 2 spot(s) de recalage : La Grande-Motte 48 h (× 1.04 en moyenne) + relevé récent, Port Camargue 55 h (× 1.03 en moyenne) + relevé récent |
| sorties-surf | ✅ | 6/6 spots notés ; 12 créneaux |
| houle-direction-downwind | ✅ | direction de la houle (affichage, carte) : 288/288 heures |
| sorties-downwind | ✅ | 3/3 parcours notés ; 0 meilleurs créneaux |
| ecart-prod-surf | ✅ | notes surf OCEAN vs app en service (calcul prod. 14 min avant, même extrait Copernicus) : médiane 0.00, 90 % ≤ 0.00, max 0.20 sur 664 heures (max : sete dim. 11:00, OCEAN 2.8 / prod 2.6) |
| ecart-prod-downwind | ✅ | notes downwind (intermédiaire, de jour) OCEAN vs app en service (calcul prod. 46 min avant) : médiane 0.00, 90 % ≤ 0.00, max 0.00 sur 120 heures |
| sorties-wing | ✅ | 7 spots notés (wing v2.0.0) ; 6 session(s) 2H en mode Sécu first sur les heures prévues |
| confidentialite-moteurs | ✅ | aucun relevé Winds-Up ni clé dans les sorties (seuls les facteurs de correction dérivés y figurent, comme dans l’app downwind actuelle) |
| copernicus-surf | ✅ | Copernicus Med-WAV inclus dans le moteur surf (comme l’app en service) |

## Meilleurs créneaux surf (7 jours)

| Quand | Spot | Note moyenne | Pic |
|---|---|---|---|
| ven. 13 08:00 → ven. 13 18:00 | Carnon | 8.34 | 9.64 |
| ven. 13 08:00 → ven. 13 18:00 | Saintes-Maries-de-la-Mer | 8.04 | 9.52 |
| lun. 16 08:00 → lun. 16 18:00 | La Couronne (Martigues) | 8.03 | 8.76 |
| lun. 16 08:00 → lun. 16 18:00 | Carnon | 7.6 | 8.04 |
| lun. 16 08:00 → lun. 16 18:00 | Saintes-Maries-de-la-Mer | 7.14 | 8.54 |

## Meilleurs créneaux downwind (4 jours)

| Quand | Parcours | Note moyenne | Pic |
|---|---|---|---|

## Wing foil — sessions 2H (mode Sécu first, vent corrigé de la super prévision)

| Spot | Créneaux |
|---|---|
| La Franqui | aucun |
| La Grande-Motte | dim. 15 15:00 → dim. 15 18:00 : Ça envoie (moy. 8.4, pic 9.9) |
| Le Ponant | aucun |
| Port Camargue / Espiguette | dim. 15 14:00 → dim. 15 18:00 : Ça envoie (moy. 9.9, pic 10) |
| Beauduc | ven. 13 08:00 → ven. 13 18:00 : Ça envoie (moy. 9.2, pic 10) ; sam. 14 12:00 → sam. 14 14:00 : Ça se tente (moy. 5.9, pic 6.8) |
| Le Jaï | ven. 13 08:00 → ven. 13 17:00 : Ça envoie (moy. 8.6, pic 10) |
| Almanarre (Hyères) | ven. 13 08:00 → ven. 13 13:00 : Ça envoie (moy. 6.5, pic 7.4) |

### Détail (toutes les 2 h de jour, Sécu first)

Vent en nœuds (rafales) · d'où il vient · secteur · note · ce qui limite.

**La Franqui** — ven. 13 09:00 27 (38) ONO offshore **0** vent de terre : dérive au large · ven. 13 11:00 24 (32) NO offshore **0** vent de terre : dérive au large · ven. 13 13:00 20 (32) NO offshore **0** vent de terre : dérive au large · ven. 13 15:00 24 (33) NO offshore **0** vent de terre : dérive au large · ven. 13 17:00 23 (33) NO offshore **0** vent de terre : dérive au large · sam. 14 09:00 3 (4) NNE side **0** pas assez de vent · sam. 14 11:00 10 (14) ENE side-on **0** pas assez de vent · sam. 14 13:00 8 (13) E onshore **0** pas assez de vent · sam. 14 15:00 8 (14) E onshore **0** pas assez de vent · sam. 14 17:00 8 (14) ENE side-on **0** pas assez de vent · dim. 15 09:00 5 (8) NO offshore **0** vent de terre : dérive au large · dim. 15 11:00 3 (7) NNO side-off **0** side-off (dérive vers le large) · dim. 15 13:00 3 (7) N side **0** pas assez de vent · dim. 15 15:00 5 (8) NE side-on **0** pas assez de vent · dim. 15 17:00 6 (13) ESE onshore **0** pas assez de vent · lun. 16 09:00 2 (3) O offshore **0** vent de terre : dérive au large · lun. 16 11:00 3 (5) N side **0** pas assez de vent · lun. 16 13:00 5 (10) NNE side **0** pas assez de vent

**La Grande-Motte** — ven. 13 09:00 15 (24) N offshore **0** vent de terre : dérive au large · ven. 13 11:00 12 (21) N offshore **0** vent de terre : dérive au large · ven. 13 13:00 10 (18) N offshore **0** vent de terre : dérive au large · ven. 13 15:00 12 (20) N offshore **0** vent de terre : dérive au large · ven. 13 17:00 8 (15) N offshore **0** vent de terre : dérive au large · sam. 14 09:00 6 (10) N offshore **0** vent de terre : dérive au large · sam. 14 11:00 5 (10) NE side-off **0** side-off (dérive vers le large) · sam. 14 13:00 1 (8) SE onshore **0** pas assez de vent · sam. 14 15:00 4 (8) NNE offshore **0** vent de terre : dérive au large · sam. 14 17:00 6 (9) NNE offshore **0** vent de terre : dérive au large · dim. 15 09:00 8 (11) NNE offshore **0** vent de terre : dérive au large · dim. 15 11:00 7 (11) NE side-off **0** side-off (dérive vers le large) · dim. 15 13:00 8 (12) NE side-off **0** side-off (dérive vers le large) · dim. 15 15:00 13 (17) ESE side-on **9.9** vent rafaleux · dim. 15 17:00 18 (27) ESE side-on **7.3** vent rafaleux · lun. 16 09:00 2 (2) NNO offshore **0** vent de terre : dérive au large · lun. 16 11:00 5 (7) NE side-off **0** side-off (dérive vers le large) · lun. 16 13:00 7 (10) NNE offshore **0** vent de terre : dérive au large

**Le Ponant** — ven. 13 09:00 7 (10) N  **0** pas assez de vent · ven. 13 11:00 7 (11) N  **0** pas assez de vent · ven. 13 13:00 7 (12) N  **0** pas assez de vent · ven. 13 15:00 6 (11) N  **0** pas assez de vent · ven. 13 17:00 5 (10) NNE  **0** pas assez de vent · sam. 14 09:00 5 (9) NNE  **0** pas assez de vent · sam. 14 11:00 5 (11) NNE  **0** pas assez de vent · sam. 14 13:00 2 (9) NE  **0** pas assez de vent · sam. 14 15:00 3 (6) S  **0** pas assez de vent · sam. 14 17:00 3 (3) SE  **0** pas assez de vent · dim. 15 09:00 5 (7) NNE  **0** pas assez de vent · dim. 15 11:00 5 (7) ENE  **0** pas assez de vent · dim. 15 13:00 5 (7) NE  **0** pas assez de vent · dim. 15 15:00 6 (10) E  **0** pas assez de vent · dim. 15 17:00 7 (8) NNO  **0** pas assez de vent · lun. 16 09:00 1 (3) O  **0** pas assez de vent · lun. 16 11:00 3 (5) E  **0** pas assez de vent · lun. 16 13:00 3 (4) SSO  **0** pas assez de vent · lun. 16 15:00 1 (2) E  **0** pas assez de vent · lun. 16 17:00 5 (6) SE  **0** pas assez de vent

**Port Camargue / Espiguette** — ven. 13 09:00 11 (18) N offshore **0** vent de terre : dérive au large · ven. 13 11:00 11 (20) N offshore **0** vent de terre : dérive au large · ven. 13 13:00 11 (20) N offshore **0** vent de terre : dérive au large · ven. 13 15:00 11 (17) N offshore **0** vent de terre : dérive au large · ven. 13 17:00 9 (15) N offshore **0** vent de terre : dérive au large · sam. 14 09:00 7 (11) N offshore **0** vent de terre : dérive au large · sam. 14 11:00 3 (9) ENE side-off **0** side-off (dérive vers le large) · sam. 14 13:00 1 (7) S onshore **0** pas assez de vent · sam. 14 15:00 4 (8) N offshore **0** vent de terre : dérive au large · sam. 14 17:00 6 (9) N offshore **0** vent de terre : dérive au large · dim. 15 09:00 10 (14) ENE side-off **0** side-off (dérive vers le large) · dim. 15 11:00 11 (15) ENE side-off **0** side-off (dérive vers le large) · dim. 15 13:00 11 (15) E side-off **0** side-off (dérive vers le large) · dim. 15 15:00 22 (28) ESE side **10** · dim. 15 17:00 24 (32) SE side-on **9.6** vent rafaleux · lun. 16 09:00 4 (7) SSO onshore **0** pas assez de vent · lun. 16 11:00 5 (7) NNE offshore **0** vent de terre : dérive au large · lun. 16 13:00 9 (12) NNE offshore **0** vent de terre : dérive au large

**Beauduc** — ven. 13 09:00 20 (26) NNO side **10** · ven. 13 11:00 22 (30) NNO side **9.2** vent rafaleux · ven. 13 13:00 24 (30) NNO side **10** · ven. 13 15:00 22 (30) NNO side **9.2** vent rafaleux · ven. 13 17:00 18 (26) NNO side **8.1** vent rafaleux · sam. 14 09:00 13 (20) NNE side-off **0** side-off (dérive vers le large) · sam. 14 11:00 8 (19) NE offshore **0** vent de terre : dérive au large · sam. 14 13:00 12 (21) S side-on **5** vent rafaleux · sam. 14 15:00 7 (17) S side-on **0** pas assez de vent · sam. 14 17:00 6 (11) SSE side **0** pas assez de vent · dim. 15 09:00 9 (12) ENE offshore **0** vent de terre : dérive au large · dim. 15 11:00 10 (13) E offshore **0** vent de terre : dérive au large · dim. 15 13:00 12 (18) ESE offshore **0** vent de terre : dérive au large · dim. 15 15:00 17 (27) SE side-off **0** side-off (dérive vers le large) · dim. 15 17:00 20 (30) SE side-off **0** side-off (dérive vers le large) · lun. 16 09:00 5 (6) ENE offshore **0** vent de terre : dérive au large · lun. 16 11:00 4 (6) ESE offshore **0** vent de terre : dérive au large · lun. 16 13:00 4 (6) S side-on **0** pas assez de vent · lun. 16 15:00 5 (8) SSE side **0** pas assez de vent · lun. 16 17:00 9 (10) ESE offshore **0** vent de terre : dérive au large

**Le Jaï** — ven. 13 09:00 19 (24) NO  **10** · ven. 13 11:00 15 (21) NNO  **8.7** vent rafaleux · ven. 13 13:00 13 (18) NNO  **8.9** vent rafaleux · ven. 13 15:00 12 (16) NNO  **6.4** pas assez de vent · ven. 13 17:00 11 (17) NNO  **4.5** pas assez de vent · sam. 14 09:00 4 (5) ESE  **0** pas assez de vent · sam. 14 11:00 6 (9) SSE  **0** pas assez de vent · sam. 14 13:00 4 (7) S  **0** pas assez de vent · sam. 14 15:00 6 (9) SSE  **0** pas assez de vent · sam. 14 17:00 2 (7) ESE  **0** pas assez de vent · dim. 15 09:00 2 (5) SE  **0** pas assez de vent · dim. 15 11:00 2 (4) ESE  **0** pas assez de vent · dim. 15 13:00 3 (7) ESE  **0** pas assez de vent · dim. 15 15:00 4 (8) ESE  **0** pas assez de vent · dim. 15 17:00 6 (9) ESE  **0** pas assez de vent · lun. 16 09:00 3 (5) SE  **0** pas assez de vent · lun. 16 11:00 4 (7) SE  **0** pas assez de vent · lun. 16 13:00 4 (7) ESE  **0** pas assez de vent

**Almanarre (Hyères)** — ven. 13 09:00 14 (19) O onshore **7.4** vent de mer (face à la plage) · ven. 13 11:00 12 (17) O onshore **5.6** vent de mer (face à la plage) · ven. 13 13:00 11 (16) O onshore **3.2** pas assez de vent · ven. 13 15:00 8 (12) ONO side-on **0** pas assez de vent · ven. 13 17:00 7 (11) ONO side-on **0** pas assez de vent · sam. 14 09:00 11 (14) ESE side-off **0** side-off (dérive vers le large) · sam. 14 11:00 12 (18) ESE side-off **0** side-off (dérive vers le large) · sam. 14 13:00 13 (16) ESE side-off **0** side-off (dérive vers le large) · sam. 14 15:00 11 (18) E offshore **0** vent de terre : dérive au large · sam. 14 17:00 11 (17) ENE offshore **0** vent de terre : dérive au large · dim. 15 09:00 9 (15) ENE offshore **0** vent de terre : dérive au large · dim. 15 11:00 9 (14) ENE offshore **0** vent de terre : dérive au large · dim. 15 13:00 8 (14) ENE offshore **0** vent de terre : dérive au large · dim. 15 15:00 10 (16) E offshore **0** vent de terre : dérive au large · dim. 15 17:00 11 (18) E offshore **0** vent de terre : dérive au large · lun. 16 09:00 3 (5) N side-off **0** side-off (dérive vers le large) · lun. 16 11:00 2 (3) N side-off **0** side-off (dérive vers le large) · lun. 16 13:00 1 (2) S side-on **0** pas assez de vent


Copernicus Med-WAV est inclus pour le surf quand l'extrait a moins de 30 h (même règle que l'app en service) ; la note wing (v2.0, modes Sécu first / Offshore) part du vent corrigé de la super prévision ; pas de note kite (décision de Tom).
