@echo off
title Cyber-Hub Desktop Launcher
echo [CYBER-HUB] Initializing PySide6 Native Desktop Shell...
echo [CYBER-HUB] Connecting to live host: https://cyber-hub-app.vercel.app

python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python was not found on PATH. Please install Python 3.10+ and add it to PATH.
    pause
    exit /b 1
)

python cyber_hub_desktop.py
if errorlevel 1 (
    echo [INFO] Missing dependencies? Installing requirements...
    pip install -r requirements.txt
    python cyber_hub_desktop.py
)
