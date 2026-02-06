@echo off
setlocal
title Uninstalling Hyperion SAST...

echo ===================================================
echo      Hyperion SAST - Uninstaller 🗑️
echo ===================================================
echo.
echo This will remove the virtual environment and desktop shortcut.
echo It will NOT delete the project folder itself (to save your scans).
echo.
set /p CHOICE="Are you sure you want to proceed? (Y/N): "
if /i "%CHOICE%" neq "Y" exit

:: 1. Remove Desktop Shortcut
echo.
echo [1/2] Removing Desktop Shortcut...
if exist "%USERPROFILE%\Desktop\Hyperion SAST.lnk" (
    del "%USERPROFILE%\Desktop\Hyperion SAST.lnk"
    echo     - Shortcut removed.
) else (
    echo     - Shortcut not found.
)

:: 2. Remove Virtual Environment
echo [2/2] Cleaning up dependencies (venv)...
if exist "venv" (
    rmdir /s /q "venv"
    echo     - Virtual environment removed.
) else (
    echo     - Venv not found.
)

:: 3. Cleanup Start Script
if exist "start_hyperion.bat" del "start_hyperion.bat"

echo.
echo ===================================================
echo      ✅ Uninstallation Complete
echo ===================================================
echo.
pause
