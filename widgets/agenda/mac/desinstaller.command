#!/bin/zsh
# Retire le widget Agenda (Übersicht et tes autres widgets restent en place).
WIDGETS="$HOME/Library/Application Support/Übersicht/widgets"
rm -f "$WIDGETS/Agenda.jsx" && echo "✓ Widget Agenda retiré."
if security find-generic-password -s ocean.agenda >/dev/null 2>&1; then
  read -r "R?Retirer aussi le lien du script Google du trousseau ? (o/N) "
  [[ "$R" == [oO]* ]] && security delete-generic-password -s ocean.agenda >/dev/null && echo "✓ Lien retiré du trousseau."
fi
echo "Tu peux fermer cette fenêtre."
