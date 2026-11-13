#!/bin/zsh
# Retire les widgets OCEAN (Übersicht et tes autres widgets restent en place).
WIDGETS="$HOME/Library/Application Support/Übersicht/widgets"
rm -f "$WIDGETS/ocean-vent.jsx" "$WIDGETS/ocean-creneaux.jsx" "$WIDGETS/ocean-vague.jsx" "$WIDGETS/ocean.jsx" && echo "✓ Widgets OCEAN retirés."
if security find-generic-password -s ocean.superprevision >/dev/null 2>&1; then
  read -r "R?Retirer aussi le lien de la super prévision du trousseau ? (o/N) "
  [[ "$R" == [oO]* ]] && security delete-generic-password -s ocean.superprevision >/dev/null && echo "✓ Lien retiré du trousseau."
fi
echo "Tu peux fermer cette fenêtre."
