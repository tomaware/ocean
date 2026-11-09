# Règles du dépôt OCEAN (pour Claude Code)

- Ne jamais modifier silencieusement une formule météo, un traitement scientifique ou une règle de notation existante. Toute modification = décision documentée + test golden avant / après.
- Pas de score sans formule validée par Tom (docs/architecture/PRODUCT_ARCHITECTURE.md §8).
- Les prévisions gardent leur provenance (source, modèle, date d'émission, échéance), leurs unités et la distinction observé / prévu / corrigé.
- Données privées : aucun relevé Winds-Up, aucune clé (Winds-Up, Météo-France, Candhis, Copernicus, super prévision) dans le dépôt ni dans `data/`. Secrets GitHub uniquement.
- Ne jamais présenter une donnée de démonstration comme une prévision réelle.
- Avant de dire qu'un module marche : le vérifier sur des données réelles (Tom le demande explicitement).
- Ordre de travail par module : collecte → analyse → remise en question → vulgarisation → interface. Une étape n'est pas déclarée finie sans sa vérification (MODULE_MAP / PRODUCT_ARCHITECTURE §6).
- Les apps existantes (super-previ-surf, downwind-foil, Apps Script vent) restent en service jusqu'à ce que leur remplaçante soit vérifiée.
- Langue : français pour la doc et les textes de l'interface.
