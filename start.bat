@echo off
echo Starting CodeCrew-Ajrasakha- Project...

:: Start Backend
start "Backend" cmd /k "cd backend && npm install && npm start"

:: Start Frontend
start "Frontend" cmd /k "cd frontend && npm install && npm start"

echo Backend and Frontend are starting in separate windows.
