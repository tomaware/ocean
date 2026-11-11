#!/bin/zsh
# Installe Übersicht (si besoin) et le widget OCEAN (vent, créneaux, vague).
# Double-clic dans le Finder (clic droit → Ouvrir la première fois), ou dans le Terminal : zsh installer.command

set -e

HERE="$(cd "$(dirname "$0")" && pwd)"
APP="/Applications/Übersicht.app"
WIDGETS="$HOME/Library/Application Support/Übersicht/widgets"
WIDGET="ocean.jsx"
SITE="https://tracesof.net/uebersicht"
FALLBACK_ZIP="releases/Uebersicht-1.6.82.app.zip"

echo "=== Installation du widget OCEAN ==="
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

# 2. Widget (les réglages d'un widget OCEAN déjà installé sont gardés)
mkdir -p "$WIDGETS"
if [ -f "$WIDGETS/$WIDGET" ]; then
  OLD="$WIDGETS/$WIDGET"; NEW="$HERE/$WIDGET"; TMPW="$(mktemp)"
  cp "$NEW" "$TMPW"
  for K in SPOT MODE CARTE_VENT CARTE_CRENEAUX CARTE_VAGUE SPOT_VAGUE CRENEAUX_SPOTS DISPOSITION POSITION; do
    LINE="$(grep -E "^const $K = " "$OLD" | head -1)"
    [ -n "$LINE" ] && LINE="$LINE" K="$K" perl -0pi -e 's/^const $ENV{K} = .*$/$ENV{LINE}/m' "$TMPW"
  done
  cp "$TMPW" "$OLD"; rm -f "$TMPW"
  echo "✓ Widget mis à jour (tes réglages sont gardés)."
else
  cp "$HERE/$WIDGET" "$WIDGETS/$WIDGET"
  echo "✓ Widget copié."
fi

# 3. Mode perso (facultatif) : lien de ta super prévision, rangé dans le trousseau du Mac, jamais dans le widget
if security find-generic-password -s ocean.superprevision >/dev/null 2>&1; then
  echo "✓ Balise en direct : lien de la super prévision déjà dans le trousseau."
else
  echo
  echo "Mode perso (facultatif) : si tu as un script Google « super prévision », colle son lien"
  echo "(…/exec?key=…) puis Entrée. Sinon, appuie simplement sur Entrée."
  read -r "LIEN?Lien : "
  LIEN="$(echo "$LIEN" | tr -d '[:space:]')"
  if [[ "$LIEN" == https://script.google.com/*/exec* ]]; then
    security add-generic-password -U -a "$USER" -s ocean.superprevision -w "$LIEN"
    echo "✓ Lien enregistré dans le trousseau (le widget affichera les balises en direct)."
  elif [ -n "$LIEN" ]; then
    echo "! Ce lien ne ressemble pas à un lien …/exec de script Google : ignoré."
  fi
fi

# 4. Lancement automatique d'Übersicht à l'ouverture de session
if osascript -e 'tell application "System Events" to get the name of every login item' 2>/dev/null | grep -q "Übersicht"; then
  echo "✓ Übersicht se lance déjà au démarrage."
elif osascript -e "tell application \"System Events\" to make login item at end with properties {path:\"$APP\", hidden:false}" >/dev/null 2>&1; then
  echo "✓ Übersicht se lancera automatiquement au démarrage."
else
  echo "! Lancement auto non configuré : active-le dans le menu Übersicht → Preferences."
fi

# 5. (Re)lancement d'Übersicht pour charger le widget
pkill -x "Übersicht" 2>/dev/null && sleep 2 || true
open -a "$APP"

echo
echo "=== Terminé ! Le widget OCEAN apparaît en haut à droite du bureau. ==="
echo "Pour le régler : clic sur « ⚙ réglages » sous le widget (ou lis LISEZ-MOI.txt)."
echo "Tu peux fermer cette fenêtre."
