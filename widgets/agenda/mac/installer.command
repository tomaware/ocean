#!/bin/zsh
# Installe Übersicht (si besoin) et le widget Agenda (Google Agenda, même charte que le widget OCEAN).
# Double-clic dans le Finder (clic droit → Ouvrir la première fois), ou dans le Terminal : zsh installer.command

set -e

HERE="$(cd "$(dirname "$0")" && pwd)"
APP="/Applications/Übersicht.app"
WIDGETS="$HOME/Library/Application Support/Übersicht/widgets"
WIDGET="Agenda.jsx"
OLD="agenda-google.jsx"           # ancien widget agenda (avec le lien écrit dedans)
SITE="https://tracesof.net/uebersicht"
FALLBACK_ZIP="releases/Uebersicht-1.6.82.app.zip"

echo "=== Installation du widget Agenda ==="
echo

# 1. Übersicht (app gratuite qui affiche des widgets sur le bureau du Mac)
if [ -d "$APP" ]; then
  echo "✓ Übersicht est déjà installé."
else
  echo "→ Téléchargement d'Übersicht depuis son site officiel…"
  TMP="$(mktemp -d)"
  ZIP_PATH="$(curl -sL "$SITE/" | grep -oE 'releases/[^"]+\.zip' | head -1)"
  [ -z "$ZIP_PATH" ] && ZIP_PATH="$FALLBACK_ZIP"
  curl -fL --progress-bar -o "$TMP/uebersicht.zip" "$SITE/$ZIP_PATH"
  ditto -x -k "$TMP/uebersicht.zip" "$TMP/app"
  echo "→ Vérification de la signature Apple…"
  if ! spctl -a "$TMP/app/Übersicht.app" 2>/dev/null; then
    echo "✗ L'app téléchargée n'est pas validée par Apple. Installation annulée."
    rm -rf "$TMP"; exit 1
  fi
  ditto "$TMP/app/Übersicht.app" "$APP"
  rm -rf "$TMP"
  echo "✓ Übersicht installé dans Applications."
fi

# 2. Widget (tes réglages, ta position et ta taille sont gardés par Übersicht, pas dans le fichier)
mkdir -p "$WIDGETS"
cp "$HERE/$WIDGET" "$WIDGETS/$WIDGET"
echo "✓ Widget Agenda copié."

# 3. Lien du script Google : dans le trousseau du Mac, jamais dans le widget
if security find-generic-password -s ocean.agenda >/dev/null 2>&1; then
  echo "✓ Lien de ton script Google déjà dans le trousseau."
else
  LIEN=""
  if [ -f "$WIDGETS/$OLD" ]; then
    LIEN="$(grep -oE 'https://script\.google\.com/macros/s/[A-Za-z0-9_-]+/exec\?key=[A-Za-z0-9]+' "$WIDGETS/$OLD" | head -1 || true)"
    [ -n "$LIEN" ] && echo "✓ Lien repris de ton ancien widget agenda."
  fi
  if [ -z "$LIEN" ]; then
    echo
    echo "Colle le lien de ton script Google « agenda-google.gs » (…/exec?key=…) puis Entrée."
    echo "(Entrée sans rien : tu pourras le brancher plus tard depuis le widget.)"
    read -r "LIEN?Lien : "
    LIEN="$(echo "$LIEN" | tr -d '[:space:]')"
  fi
  if [[ "$LIEN" == https://script.google.com/*/exec* ]]; then
    security add-generic-password -U -a "$USER" -s ocean.agenda -w "$LIEN"
    echo "✓ Lien enregistré dans le trousseau."
  elif [ -n "$LIEN" ]; then
    echo "! Ce lien ne ressemble pas à un lien …/exec de script Google : ignoré."
  fi
fi

# 4. L'ancien widget agenda fait doublon : on propose de le mettre à la Corbeille
if [ -f "$WIDGETS/$OLD" ]; then
  read -r "R?Mettre l'ancien widget agenda (agenda-google.jsx) à la Corbeille ? (o/N) "
  if [[ "$R" == [oO]* ]]; then mv "$WIDGETS/$OLD" "$HOME/.Trash/" && echo "✓ Ancien widget mis à la Corbeille."; fi
fi

# 5. Lancement automatique d'Übersicht à l'ouverture de session
if osascript -e 'tell application "System Events" to get the name of every login item' 2>/dev/null | grep -q "Übersicht"; then
  echo "✓ Übersicht se lance déjà au démarrage."
elif osascript -e "tell application \"System Events\" to make login item at end with properties {path:\"$APP\", hidden:false}" >/dev/null 2>&1; then
  echo "✓ Übersicht se lancera automatiquement au démarrage."
else
  echo "! Lancement auto non configuré : active-le dans le menu Übersicht → Preferences."
fi

# 6. (Re)lancement d'Übersicht pour charger le widget
pkill -x "Übersicht" 2>/dev/null && sleep 2 || true
open -a "$APP"

echo
echo "=== Terminé ! L'agenda apparaît en haut à gauche du bureau. ==="
echo "Glisse son en-tête pour le déplacer, tire son coin bas-droit pour l'agrandir, ⚙ pour les calendriers."
echo "Tu peux fermer cette fenêtre."
