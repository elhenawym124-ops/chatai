@echo off
echo 🚀 فتح الخادم الأمامي في نافذة منفصلة...

cd /d "e:\new chat bot\test-chat\test-chat - Copy (7)\frontend"

start "Frontend Server - Chat Bot" cmd /k "echo 🚀 Starting Frontend Server... && echo 🌐 URL: http://localhost:3000 && echo ⚠️ Do NOT close this window! && echo. && npx vite --port 3000 --host"

echo ✅ تم فتح الخادم الأمامي في نافذة منفصلة
echo 🌐 الرابط: http://localhost:3000
echo.
echo انتظر 10 ثوان ثم افتح الرابط في المتصفح
timeout /t 10 /nobreak

start http://localhost:3000

echo.
echo ✅ تم فتح المتصفح
echo ⚠️ لا تغلق نافذة الخادم الأمامي!
pause
