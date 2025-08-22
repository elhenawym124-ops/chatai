@echo off
echo 🚀 رفع المشروع إلى GitHub...
echo.

echo 📁 التحقق من Git...
git --version
if %errorlevel% neq 0 (
    echo ❌ Git غير مثبت. يرجى تثبيت Git أولاً.
    pause
    exit /b 1
)

echo.
echo 🔧 إعداد Git...
git config --global user.name "Smart Chat Developer"
git config --global user.email "developer@smartchat.com"

echo.
echo 📋 إضافة الملفات المهمة...
git add README.md
git add doc/
git add frontend/src/
git add frontend/public/
git add frontend/package.json
git add frontend/tsconfig.json
git add backend/src/
git add backend/prisma/
git add backend/package.json
git add backend/server.js
git add backend/.env.example
git add .gitignore

echo.
echo 💾 إنشاء Commit...
git commit -m "🚀 Initial commit: Smart Chat System

✨ Features:
- AI-powered chat system with Google Gemini
- Visual message type detection (AI/Manual/Customer)
- Real-time conversation management
- Order management system
- Comprehensive documentation

🔧 Tech Stack:
- Frontend: React + TypeScript
- Backend: Node.js + Express + Prisma
- Database: PostgreSQL
- AI: Google Gemini API"

echo.
echo 🌐 ربط بـ GitHub...
git remote add origin https://github.com/elhenawym124-ops/chatai.git

echo.
echo 📤 رفع إلى GitHub...
git branch -M main
git push -u origin main

echo.
echo ✅ تم رفع المشروع بنجاح!
echo 🔗 رابط المشروع: https://github.com/elhenawym124-ops/chatai
echo.
pause
