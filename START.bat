@echo off
title Stream Deck Local
color 0A

echo.
echo  ================================
echo   STREAM DECK LOCAL - STARTING
echo  ================================
echo.

:: Cek Node.js ada ga
node --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Node.js tidak ditemukan!
    echo  Download di: https://nodejs.org
    pause
    exit
)

:: Masuk ke folder project
cd /d "%~dp0"

:: Install dependencies kalau belum ada
if not exist "node_modules" (
    echo  [1/3] Installing dependencies...
    call npm install
    echo.
)

:: Setup — detect IP + update .env + update Streamlabs
echo  [2/3] Setup IP dan Streamlabs...
call node setup.mjs

:: Exit code 1 = .env bermasalah / token salah → buka notepad
if errorlevel 1 (
    echo.
    echo  ================================
    echo   TOKEN STREAMLABS SALAH / KOSONG
    echo.
    echo   Buka file .env, isi token yang
    echo   bener, lalu jalanin START.bat lagi
    echo  ================================
    echo.
    pause
    notepad .env
    exit
)
echo.

:: Ambil IP dan port dari .env
for /f "tokens=2 delims==" %%a in ('findstr "PUBLIC_IP" .env') do set LOCAL_IP=%%a
for /f "tokens=2 delims==" %%a in ('findstr "PUBLIC_ASTRO_PORT" .env') do set ASTRO_PORT=%%a

:: Jalanin server
echo  [3/3] Starting server...
echo  ================================
echo  Alamat HP: http://%LOCAL_IP%:%ASTRO_PORT%
echo  ================================

:: Start server di background
start "" /b cmd /c "npx astro dev --host > server.log 2>&1"

:: Tunggu server siap
echo  Menunggu server...
timeout /t 5 /nobreak >nul

:: Buka browser otomatis
start "" "http://%LOCAL_IP%:%ASTRO_PORT%"

echo  Server berjalan! Tutup window ini untuk stop server.
echo.
pause