@echo off
echo Starting both Frontend and Backend servers...
echo.

REM Start Backend Server
echo Starting Backend Server on port 3001...
start "Backend Server" cmd /k "cd backend && node server.js"

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start Frontend Server  
echo Starting Frontend Server on port 3000...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window (servers will continue running)
pause >nul
