@echo off
rem Arrete et supprime le widget Agenda.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0agenda-widget.ps1" -Uninstall
echo.
echo Tu peux fermer cette fenetre.
pause >nul
