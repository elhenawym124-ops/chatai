@echo off
echo 🚀 تشغيل الخادم الأمامي بشكل مستقر...
echo.

cd /d "e:\new chat bot\test-chat\test-chat - Copy (7)\frontend"

echo 📁 المجلد الحالي: %cd%
echo.

echo 🔍 فحص المنفذ 3000...
netstat -ano | findstr :3000 > nul
if %errorlevel% == 0 (
    echo ⚠️ المنفذ 3000 مُستخدم، سيتم إيقاف العمليات...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        taskkill /f /pid %%a 2>nul
    )
    timeout /t 2 /nobreak > nul
)

echo ✅ المنفذ 3000 متاح الآن
echo.

echo 🧹 تنظيف cache...
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist dist rmdir /s /q dist

echo.
echo 🚀 بدء تشغيل الخادم الأمامي...
echo ⚠️ لا تغلق هذه النافذة!
echo 🌐 الرابط: http://localhost:3000
echo.

npm run dev

echo.
echo ❌ الخادم توقف! اضغط أي مفتاح للخروج...
pause > nul
