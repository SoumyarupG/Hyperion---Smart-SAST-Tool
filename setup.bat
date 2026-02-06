@echo off
title Building Hyperion SAST Single EXE...

echo ===================================================
echo      Hyperion SAST - Build System 🏗️
echo ===================================================
echo.

:: 1. Install PyInstaller
echo [1/3] Installing PyInstaller...
pip install pyinstaller
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install PyInstaller.
    pause
    exit /b 1
)

:: 2. Clean previous builds
echo.
echo [2/3] Cleaning up workspace...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
if exist HyperionSAST.spec del /q HyperionSAST.spec

:: 3. Run PyInstaller
echo.
echo [3/3] Compiling to Single EXE (this may take a minute)...
echo.
pyinstaller --noconfirm --onefile --console --name "HyperionSAST" ^
    --add-data "templates;templates" ^
    --add-data "static;static" ^
    --hidden-import "uvicorn.logging" ^
    --hidden-import "uvicorn.loops" ^
    --hidden-import "uvicorn.loops.auto" ^
    --hidden-import "uvicorn.protocols" ^
    --hidden-import "uvicorn.protocols.http" ^
    --hidden-import "uvicorn.protocols.http.auto" ^
    --hidden-import "uvicorn.lifespan" ^
    --hidden-import "uvicorn.lifespan.on" ^
    --hidden-import "python-multipart" ^
    main.py

if %errorlevel% neq 0 (
    echo [ERROR] Build failed.
    pause
    exit /b 1
)

echo.
echo ===================================================
echo      ✅ Build Success!
echo ===================================================
echo.
echo Your standalone executable is ready:
echo  - Location: %CD%\dist\HyperionSAST.exe
echo.
echo You can define a shortcut to this .exe or share it directly.
echo.
echo Build Finished.
