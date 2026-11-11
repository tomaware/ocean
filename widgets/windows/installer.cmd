@echo off
rem Installe le widget OCEAN (double-clic dans l'Explorateur).
cd /d "%~dp0"
if not exist "%~dp0ocean-widget.ps1" (
  echo Fichier ocean-widget.ps1 introuvable.
  echo Decompresse d'abord le .zip : clic droit sur le .zip, puis "Extraire tout".
  echo.
  pause
  exit /b 1
)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0ocean-widget.ps1" -Install
echo.
echo Tu peux fermer cette fenetre.
pause >nul
