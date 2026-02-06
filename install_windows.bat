@echo off
setlocal
title Installing Hyperion SAST Client...

echo ===================================================
echo      Hyperion SAST - Client Installation 📦
echo ===================================================
echo.

:: 1. Check for Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python 3.10+ from python.org and try again.
    pause
    exit /b 1
)

:: 2. Create Virtual Environment
echo [1/4] Creating secure virtual environment...
if not exist "venv" (
    python -m venv venv
) else (
    echo     Warning: venv already exists, checking integrity...
)

:: 3. Install Dependencies
echo [2/4] Installing dependencies...
call venv\Scripts\activate
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies. Check internet connection.
    pause
    exit /b 1
)

:: 4. Create Desktop Shortcut
echo [3/4] Creating Desktop Shortcut...
set SHORTCUT_PATH="%USERPROFILE%\Desktop\Hyperion SAST.lnk"
set ICON_PATH="%CD%\static\favicon.ico"
set TARGET="%CD%\start_hyperion.bat"

:: Use PowerShell to create secure shortcut
powershell "$s=(New-Object -COM WScript.Shell).CreateShortcut('%SHORTCUT_PATH%');$s.TargetPath='%TARGET%';$s.WorkingDirectory='%CD%';$s.IconLocation='%ICON_PATH%';$s.Save()"

:: 5. Create Start Script
echo [4/4] Finalizing setup...
(
echo @echo off
echo cd /d "%%~dp0"
echo call venv\Scripts\activate
echo start http://127.0.0.1:8000
echo python -m uvicorn main:app --host 127.0.0.1 --port 8000
echo pause
) > start_hyperion.bat

echo.
echo ===================================================
echo      ✅ Installation Complete!
echo ===================================================
echo.
echo You can now run "Hyperion SAST" from your Desktop.
echo.
pause
