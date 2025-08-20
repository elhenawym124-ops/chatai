@echo off
echo ========================================
echo    تشغيل نظام المحادثات المحسن
echo    Enhanced Chat System Startup
echo ========================================
echo.

echo [1/4] التحقق من المجلدات...
if not exist "backend" (
    echo ❌ مجلد backend غير موجود
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ❌ مجلد frontend غير موجود  
    pause
    exit /b 1
)

echo ✅ المجلدات موجودة

echo.
echo [2/4] تثبيت تبعيات Socket.IO...
cd backend
echo تثبيت socket.io في الخادم الخلفي...
call npm install socket.io
if errorlevel 1 (
    echo ⚠️ تحذير: قد تحتاج لتثبيت socket.io يدوياً
)

cd ..\frontend
echo تثبيت socket.io-client في الواجهة الأمامية...
call npm install socket.io-client
if errorlevel 1 (
    echo ⚠️ تحذير: قد تحتاج لتثبيت socket.io-client يدوياً
)

cd ..

echo.
echo [3/4] بدء تشغيل الخادم الخلفي...
echo فتح نافذة جديدة للخادم الخلفي...
start "Backend Server" cmd /k "cd backend && npm start"

echo انتظار 5 ثوانٍ لتشغيل الخادم...
timeout /t 5 /nobreak > nul

echo.
echo [4/4] بدء تشغيل الواجهة الأمامية...
echo فتح نافذة جديدة للواجهة الأمامية...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo ✅ تم تشغيل النظام بنجاح!
echo.
echo 🌐 الواجهة الأمامية: http://localhost:3000
echo 🔧 الخادم الخلفي: http://localhost:3001  
echo 💬 صفحة المحادثات: http://localhost:3000/conversations
echo.
echo للوصول للصفحة المحسنة:
echo استبدل Conversations بـ ConversationsImproved في الـ routing
echo.
echo اضغط أي مفتاح للإغلاق...
echo ========================================
pause > nul
