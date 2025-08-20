@echo off
title Frontend Server - Chat Bot
echo 🚀 Starting Frontend Server...
echo 🌐 URL: http://localhost:3000
echo ⚠️ Do NOT close this window!
echo.

npx vite --port 3000

echo.
echo ❌ Server stopped! Press any key to exit...
pause > nul
