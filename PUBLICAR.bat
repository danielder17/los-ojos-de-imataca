@echo off
REM ============================================================================
REM  Publicar "Los Ojos de Imataca" en GitHub + Vercel
REM  Doble clic sobre este archivo, o ejecutalo desde CMD.
REM  Primero pide las dos autorizaciones (abren el navegador una sola vez).
REM ============================================================================
setlocal
cd /d "%~dp0"

set GH="C:\Users\IGVSB\.zcode\workspace\default\herramientas\gh.exe"
set REPO=los-ojos-de-imataca
set VISIBILIDAD=--public

echo.
echo ============================================================
echo   LOS OJOS DE IMATACA  ·  publicacion
echo ============================================================
echo.

REM ---------- 1) GitHub: autenticacion ----------
%GH% auth status >nul 2>&1
if errorlevel 1 (
  echo [1/4] Autorizando GitHub ^(se abrira el navegador^)...
  %GH% auth login --hostname github.com --git-protocol https --web
  if errorlevel 1 (echo ERROR: no se pudo autorizar GitHub & pause & exit /b 1)
) else (
  echo [1/4] GitHub ya autorizado.
)

REM ---------- 2) GitHub: crear repo y subir ----------
echo.
echo [2/4] Subiendo el atlas a GitHub...
%GH% repo view %REPO% >nul 2>&1
if errorlevel 1 (
  %GH% repo create %REPO% %VISIBILIDAD% --source=. --push --description "Atlas inmersivo de la Reserva Forestal de Imataca (Sentinel-2 2017-2026 + RFI-Landsat 1985-2024)"
  if errorlevel 1 (echo ERROR al crear el repositorio & pause & exit /b 1)
) else (
  git push -u origin main
  if errorlevel 1 (echo ERROR al subir & pause & exit /b 1)
)
echo Repositorio listo.

REM ---------- 3) Vercel: autenticacion ----------
echo.
echo [3/4] Verificando Vercel...
call vercel whoami >nul 2>&1
if errorlevel 1 (
  echo Autorizando Vercel ^(se abrira el navegador^)...
  call vercel login
  if errorlevel 1 (echo ERROR: no se pudo autorizar Vercel & pause & exit /b 1)
) else (
  echo Vercel ya autorizado.
)

REM ---------- 4) Vercel: publicar ----------
echo.
echo [4/4] Publicando en produccion...
call vercel --prod --yes

echo.
echo ============================================================
echo   LISTO. La URL de produccion aparece arriba (Production).
echo ============================================================
pause
