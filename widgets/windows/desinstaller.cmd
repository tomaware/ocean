@echo off
rem Arrete et supprime le widget OCEAN.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0ocean-widget.ps1" -Uninstall
echo.
echo Tu peux fermer cette fenetre.
pause >nul
