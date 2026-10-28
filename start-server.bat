@echo off
title Ojol Mengaji - Localhost Server
echo ============================================================
echo   MENJALANKAN SERVER LOCALHOST OJOL MENGAJI
echo ============================================================
echo.
echo   Membuka browser otomatis ke http://localhost:8080 ...
echo   (Biarkan jendela ini tetap terbuka saat menggunakan aplikasi)
echo ============================================================
echo.

timeout /t 1 >nul
start http://localhost:8080

where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [INFO] Menjalankan melalui Node.js...
    node "%~dp0server.js"
) else (
    echo [INFO] Menjalankan melalui Windows PowerShell Native...
    powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0server.ps1"
)

pause
