@echo off
setlocal enabledelayedexpansion
title Masar Amanah Health - Local Dev Server (Port 3000)
color 0A
cls

echo ========================================================================
echo         MASAR AMANAH HEALTH (مسار أمانة) — LOCAL SERVER LAUNCHER
echo ========================================================================
echo.
echo  Target:  http://localhost:3000
echo  Stack:   Node.js + Express + React 19 + Vite HMR + Zero-PII
echo.
echo ========================================================================
echo.

:: Check if Node is available
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js was not found in PATH!
    echo Please install Node.js 20+ from https://nodejs.org
    pause
    exit /b 1
)

:: Check if port 3000 is already in use
netstat -ano | findstr :3000 | findstr LISTENING >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [INFO] Port 3000 is already active and listening!
    echo [INFO] Opening http://localhost:3000 in your browser...
    start http://localhost:3000
    echo.
    echo Server is already up. You can close this window anytime.
    pause
    exit /b 0
)

:: Launch browser after 2 seconds
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"

echo [INFO] Starting Express + Vite server on http://localhost:3000 ...
echo [INFO] Press Ctrl+C in this window anytime to stop the server.
echo.

npm start
if %ERRORLEVEL% neq 0 (
    echo.
    echo [FALLBACK] Attempting direct launch with npx tsx server.ts ...
    npx tsx server.ts
)

pause
