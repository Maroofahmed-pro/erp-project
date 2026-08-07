@echo off
setlocal

rem Keep this file in: C:\Users\HP\Pictures\erp_project_full_end_to_end
set "PROJECT_DIR=%~dp0"
set "BACKEND_DIR=%PROJECT_DIR%backend"
set "FRONTEND_DIR=%PROJECT_DIR%frontend"

if not exist "%BACKEND_DIR%\manage.py" (
    echo ERROR: backend\manage.py was not found.
    echo Put this BAT file inside the erp_project_full_end_to_end folder.
    pause
    exit /b 1
)

if not exist "%BACKEND_DIR%\.venv\Scripts\activate.bat" (
    echo ERROR: backend\.venv\Scripts\activate.bat was not found.
    pause
    exit /b 1
)

if not exist "%FRONTEND_DIR%\package.json" (
    echo ERROR: frontend\package.json was not found.
    pause
    exit /b 1
)

echo Starting Django backend at http://127.0.0.1:8000 ...
start "ERP Backend" /D "%BACKEND_DIR%" cmd /k "call .venv\Scripts\activate.bat && python manage.py runserver 0.0.0.0:8000"

echo Starting frontend at http://localhost:5173 ...
start "ERP Frontend" /D "%FRONTEND_DIR%" cmd /k "npm run dev -- --host 0.0.0.0"

timeout /t 5 /nobreak >nul
start "" "http://localhost:5173"

echo ERP servers started in separate windows.
exit /b 0
