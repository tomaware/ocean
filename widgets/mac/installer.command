#!/bin/zsh
# Installe Übersicht (si besoin) et les trois widgets OCEAN : Vent, Créneaux, Vague.
# Double-clic dans le Finder (clic droit → Ouvrir la première fois), ou dans le Terminal : zsh installer.command

set -e

HERE="$(cd "$(dirname "$0")" && pwd)"
APP="/Applications/Übersicht.app"
WIDGETS="$HOME/Library/Application Support/Übersicht/widgets"
NOUVEAUX=(ocean-vent.jsx ocean-creneaux.jsx ocean-vague.jsx)
ANCIEN="ocean.jsx"   # l'ancien widget unique (trois cartes dans un seul fichier), remplacé par les trois widgets
SITE="https://tracesof.net/uebersicht"
FALLBACK_ZIP="releases/Uebersicht-1.6.82.app.zip"

echo "=== Installation des widgets OCEAN (Vent, Créneaux, Vague) ==="
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

# 2. Les trois widgets. Leurs réglages et leur position sont retenus par Übersicht : une réinstallation les garde.
mkdir -p "$WIDGETS"
for W in "${NOUVEAUX[@]}"; do cp "$HERE/$W" "$WIDGETS/$W"; done
echo "✓ Widgets Vent, Créneaux et Vague installés."

# Ancien widget unique : on reprend ses réglages comme réglages de départ des trois widgets, puis on le range
# hors du dossier des widgets (sinon les cartes apparaîtraient en double).
if [ -f "$WIDGETS/$ANCIEN" ]; then
  val() { grep -E "^const $1 = \"" "$WIDGETS/$ANCIEN" | head -1 | sed -E 's/^const [A-Z_]+ = "([^"]*)".*/\1/'; }
  put() {   # put <fichier> <CLÉ> <valeur> : seulement des valeurs simples (lettres minuscules et tirets)
    [[ "$3" =~ ^[a-z-]+$ ]] || return 0
    K="$2" V="$3" perl -pi -e 's/^const $ENV{K} = "[^"]*";/const $ENV{K} = "$ENV{V}";/' "$WIDGETS/$1"
  }
  taille() { [[ "$1" == "masque" || -z "$1" ]] && echo "moyen" || echo "$1"; }
  put ocean-vent.jsx SPOT "$(val SPOT)"; put ocean-vent.jsx MODE "$(val MODE)"; put ocean-vent.jsx TAILLE "$(taille "$(val CARTE_VENT)")"
  put ocean-creneaux.jsx MODE "$(val MODE)"; put ocean-creneaux.jsx SPOTS "$(val CRENEAUX_SPOTS)"; put ocean-creneaux.jsx TAILLE "$(taille "$(val CARTE_CRENEAUX)")"
  put ocean-vague.jsx SPOT "$(val SPOT_VAGUE)"; put ocean-vague.jsx TAILLE "$(taille "$(val CARTE_VAGUE)")"
  mv "$WIDGETS/$ANCIEN" "$WIDGETS/../ocean.jsx.ancien"
  echo "✓ Ancien widget remplacé (ses réglages sont repris ; copie gardée dans Übersicht/ocean.jsx.ancien)."
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
    echo "✓ Lien enregistré dans le trousseau (le widget Vent affichera les balises en direct)."
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

# 5. (Re)lancement d'Übersicht pour charger les widgets
pkill -x "Übersicht" 2>/dev/null && sleep 2 || true
open -a "$APP"

echo
echo "=== Terminé ! Les trois widgets apparaissent en haut à droite du bureau. ==="
echo "Glisse une carte pour la déplacer ; ⚙ (au survol, coin en haut à droite) pour la régler."
echo "Tu peux fermer cette fenêtre."
