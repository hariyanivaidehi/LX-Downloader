@echo off
title LX-Downloader Launcher
echo ====================================================
echo Starting LX-Downloader (Python Backend + Next.js Frontend)
echo ====================================================

echo.
echo [1/2] Starting Python FastAPI Backend on http://127.0.0.1:8000 ...
start "LX-Downloader Backend" cmd /k "cd /d %~dp0 && python backend/run.py"

echo.
echo [2/2] Starting Next.js Frontend on http://localhost:3000 ...
npm run dev

pause
