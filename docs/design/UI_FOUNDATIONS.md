# Fondations UI — v1.0

- **Stack** (D-13) : Vite + Preact + TypeScript, uPlot (graphiques), Leaflet + OpenStreetMap (cartes), Lucide (icônes). Site statique sur GitHub Pages, données `data/*.json` publiées chaque heure par le pipeline.
- **L'interface ne calcule aucune note** : elle affiche ce que produisent les moteurs (`src/features/series.ts` ne fait que mettre en forme).
- **Accessibilité** : contrastes AA, focus visible, cibles ≥ 32 px, `aria-pressed` sur les sélecteurs, libellés sur les icônes et graphiques, mouvement réduit respecté.
- **Responsive** : testé à 390 px (iPhone 13) et 1 280 px ; aucun défilement horizontal de page (contrôle automatique dans les captures).
- **Préférences** : sur l'appareil (localStorage) : niveaux, favoris, niveau de lecture, thème, lien du mode perso. Rien n'est envoyé.
- **Mode perso** : l'appareil interroge directement la super prévision (`?action=live`) avec le lien privé saisi par Tom ; les relevés Winds-Up ne sont jamais publiés ni envoyés à OCEAN.
- **Composants** : Badge (note + mot), SessionRow, Strip (frise horaire), Chart (uPlot, nuits non reliées), SpotMap, Seg (sélecteur), Fav.
