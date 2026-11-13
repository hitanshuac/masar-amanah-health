@echo off
setlocal enabledelayedexpansion
title Masar Amanah Health - 1-Click Guided Loop Demo
color 0B
cls

echo ========================================================================
echo       MASAR AMANAH HEALTH (مسار أمانة) — VISIBLE CHROME GUIDED DEMO
echo ========================================================================
echo.
echo  This script launches Chrome in visible GUI mode and automatically
echo  steps through the complete NHS-style 1-Click Guided Loop:
echo.
echo    Step 0: Selects Patient MALAFFI-PT-004
echo    Step 1: Longitudinal Scan & Blind Spots
echo    Step 2: Causal Root-Tree & Differential Diagnosis
echo    Step 3: Close Open Loop #1 (Resolve NULL Discriminator Lab)
echo    Step 3: Close Open Loop #2 (Verify +90d Periodic Follow-Up)
echo    Step 4: Bridge into Converged Care Plan & FHIR Export
echo.
echo ========================================================================
echo.

:: 1. Check if server is running on port 3000
echo [1/3] Checking if local server is active on http://localhost:3000 ...
netstat -ano | findstr :3000 | findstr LISTENING >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [WAIT] Starting local server in a separate window...
    start "Masar Amanah Server" cmd /c "npm start"
    timeout /t 4 /nobreak >nul
) else (
    echo [OK] Server is already active on port 3000.
)

:: 2. Find Chrome or Edge browser executable
set BROWSER_EXE=
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    set "BROWSER_EXE=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
)
if not defined BROWSER_EXE if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    set "BROWSER_EXE=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
)
if not defined BROWSER_EXE if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    set "BROWSER_EXE=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
)
if not defined BROWSER_EXE if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    set "BROWSER_EXE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
)

if not defined BROWSER_EXE (
    echo [ERROR] Neither Google Chrome nor Microsoft Edge was found!
    echo Please install Google Chrome from https://www.google.com/chrome/
    pause
    exit /b 1
)

:: 3. Launch browser directly on desktop with remote debugging
echo [2/3] Launching visible browser on desktop:
echo       !BROWSER_EXE!
start "" "!BROWSER_EXE!" --new-window "http://localhost:3000" --window-size=1440,920 --remote-debugging-port=9222 --user-data-dir="%TEMP%\masar_chrome_demo" --no-first-run --no-default-browser-check
timeout /t 3 /nobreak >nul

:: 4. Run automated CDP script
echo.
echo [3/3] Running automated 1-Click Guided Loop Demo...
node scripts/guidedLoopDemo.js

echo.
echo ========================================================================
echo  Demo finished! The Chrome browser window remains open for inspection.
echo ========================================================================
pause
