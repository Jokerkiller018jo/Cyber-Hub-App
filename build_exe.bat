@echo off
title Cyber-Hub Desktop Packager
echo ===================================================
echo [CYBER-HUB] Packaging Native Desktop Executable...
echo ===================================================

python -m pip install --upgrade pyinstaller PySide6

pyinstaller --noconfirm --onedir --windowed --name "CyberHub" --add-data "public;public" cyber_hub_desktop.py

echo.
echo ===================================================
echo [CYBER-HUB] Build Complete! 
echo Executable located in: dist\CyberHub\CyberHub.exe
echo ===================================================
pause
