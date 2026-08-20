# Cyber-Hub Desktop Client (PySide6 + Python)

A native desktop application for **Cyber-Hub Nexus**, powered by **Python 3**, **PySide6 (Qt 6.11)**, and **Chromium WebEngine**.

---

## ⚡ Features

- **Custom Top & Bottom Exposed Edge Rounded Bars**:
  - Translucent frameless window design with cyberpunk cyan drop shadows.
  - Top bar with draggable header, live status indicator (`● ONLINE`), SSL padlock capsule, and navigation controls (Back, Forward, Refresh, Home).
  - Bottom bar with real-time latency ping radar, zoom controls (`- 100% +`), shortcut hints (`Ctrl+K`), and resize gripper.
  - Custom neon window controls (Minimize, Maximize / Restore, and Close).
- **Embedded WebEngine**:
  - Embedded Chromium browser loading the official live Vercel domain: `https://cyber-hub-app.vercel.app`.
  - Full **WebGL**, **Hardware Acceleration**, and **WebAudio API** support for high-performance 60 FPS dynamic backgrounds and UI shaders.
- **Desktop Shortcuts**:
  - `F5` / `Ctrl+R` — Reload Page
  - `F11` — Toggle Fullscreen
  - `Ctrl +` / `Ctrl -` / `Ctrl 0` — Zoom In / Out / Reset
  - `Alt + Left` / `Alt + Right` — History Back / Forward
  - `Ctrl + Q` — Quit Application

---

## 🚀 How to Run

### Quick Start (Windows)
Double-click `run_desktop.bat` or run:
```bash
python cyber_hub_desktop.py
```

### Requirements Installation
```bash
pip install -r requirements.txt
```

---

## 📦 Building Standalone `.exe`
To package the app into a standalone Windows `.exe` application:
```bash
build_exe.bat
```
The compiled application will be generated in `dist/CyberHub/CyberHub.exe`.
