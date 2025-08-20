# 💻 دليل إعداد بيئة التطوير
## Development Environment Setup Guide

## 🎯 **نظرة عامة**

هذا الدليل مخصص للمطورين الذين يريدون المساهمة في تطوير النظام أو تخصيصه. سنغطي إعداد بيئة تطوير متكاملة مع جميع الأدوات المطلوبة.

## 🛠️ **الأدوات المطلوبة**

### **البرامج الأساسية:**
```bash
# Node.js (v18 أو أحدث)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Git
sudo apt-get install git

# MySQL
sudo apt-get install mysql-server

# VS Code (محرر مُوصى به)
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
sudo apt update
sudo apt install code
```

### **أدوات التطوير الإضافية:**
```bash
# Postman (لاختبار API)
sudo snap install postman

# Docker (للنشر)
sudo apt-get install docker.io docker-compose

# ngrok (للتطوير مع Facebook)
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok
```

## 📁 **هيكل المشروع**

```
chatbot-system/
├── frontend/                 # تطبيق React
│   ├── src/
│   │   ├── components/      # مكونات React
│   │   ├── pages/          # صفحات التطبيق
│   │   ├── hooks/          # Custom Hooks
│   │   ├── services/       # خدمات API
│   │   ├── store/          # إدارة الحالة
│   │   ├── types/          # تعريفات TypeScript
│   │   └── utils/          # وظائف مساعدة
│   ├── public/             # ملفات عامة
│   ├── package.json
│   └── tsconfig.json
├── backend/                 # خادم Node.js
│   ├── src/
│   │   ├── routes/         # مسارات API
│   │   ├── services/       # خدمات الأعمال
│   │   ├── middleware/     # وسطاء Express
│   │   ├── utils/          # وظائف مساعدة
│   │   └── config/         # إعدادات النظام
│   ├── prisma/             # مخططات قاعدة البيانات
│   ├── tests/              # اختبارات الوحدة
│   ├── scripts/            # سكريبتات مساعدة
│   ├── package.json
│   └── tsconfig.json
├── docs/                   # التوثيق
├── docker-compose.yml      # إعداد Docker
└── README.md
```

## ⚙️ **إعداد بيئة التطوير**

### **الخطوة 1: استنساخ المشروع**
```bash
# استنساخ المشروع
git clone <repository-url>
cd chatbot-system

# إنشاء فرع للتطوير
git checkout -b feature/your-feature-name
```

### **الخطوة 2: إعداد قاعدة البيانات**
```bash
# تشغيل MySQL
sudo systemctl start mysql

# إنشاء قاعدة بيانات التطوير
mysql -u root -p
CREATE DATABASE chatbot_dev;
CREATE DATABASE chatbot_test;  # للاختبارات
CREATE USER 'dev_user'@'localhost' IDENTIFIED BY 'dev_password';
GRANT ALL PRIVILEGES ON chatbot_dev.* TO 'dev_user'@'localhost';
GRANT ALL PRIVILEGES ON chatbot_test.* TO 'dev_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### **الخطوة 3: إعداد Backend**
```bash
cd backend

# تثبيت المكتبات
npm install

# إعداد ملف البيئة للتطوير
cp .env.example .env.development
```

#### **ملف .env.development:**
```env
# بيئة التطوير
NODE_ENV=development
PORT=3001

# قاعدة البيانات
DATABASE_URL="mysql://dev_user:dev_password@localhost:3306/chatbot_dev"
TEST_DATABASE_URL="mysql://dev_user:dev_password@localhost:3306/chatbot_test"

# Gemini AI (استخدم مفتاح تطوير)
GEMINI_API_KEY="your_development_gemini_key"

# Facebook (للتطوير المحلي)
FACEBOOK_PAGE_ACCESS_TOKEN="test_token"
FACEBOOK_VERIFY_TOKEN="test_verify_token"
FACEBOOK_APP_SECRET="test_app_secret"

# JWT
JWT_SECRET="development_jwt_secret_change_in_production"

# تسجيل مفصل للتطوير
LOG_LEVEL=debug
ENABLE_QUERY_LOGGING=true

# إعدادات التطوير
ENABLE_CORS=true
ENABLE_SWAGGER=true
```

#### **تشغيل Migration والبذر:**
```bash
# تطبيق المخططات
npx prisma migrate dev

# إنشاء Prisma Client
npx prisma generate

# إضافة بيانات تجريبية
npm run seed:dev
```

### **الخطوة 4: إعداد Frontend**
```bash
cd ../frontend

# تثبيت المكتبات
npm install

# إعداد ملف البيئة
cp .env.example .env.local
```

#### **ملف .env.local:**
```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3001

# إعدادات التطبيق
NEXT_PUBLIC_APP_NAME="Chatbot Dev"
NEXT_PUBLIC_COMPANY_NAME="Development Company"

# إعدادات التطوير
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_SHOW_DEV_TOOLS=true
```

## 🔧 **إعداد VS Code**

### **الإضافات المُوصى بها:**
```json
// .vscode/extensions.json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "prisma.prisma",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-thunder-client"
  ]
}
```

### **إعدادات VS Code:**
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

### **مهام VS Code:**
```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Backend Dev",
      "type": "shell",
      "command": "npm run dev",
      "group": "build",
      "options": {
        "cwd": "${workspaceFolder}/backend"
      }
    },
    {
      "label": "Start Frontend Dev",
      "type": "shell",
      "command": "npm run dev",
      "group": "build",
      "options": {
        "cwd": "${workspaceFolder}/frontend"
      }
    },
    {
      "label": "Run Tests",
      "type": "shell",
      "command": "npm test",
      "group": "test",
      "options": {
        "cwd": "${workspaceFolder}/backend"
      }
    }
  ]
}
```

## 🧪 **إعداد الاختبارات**

### **اختبارات Backend:**
```bash
cd backend

# تثبيت مكتبات الاختبار
npm install --save-dev jest supertest @types/jest

# إنشاء ملف إعداد الاختبارات
touch jest.config.js
```

#### **إعداد Jest:**
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/config/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
};
```

#### **مثال اختبار:**
```javascript
// tests/services/aiAgent.test.js
const { AIAgentService } = require('../../src/services/aiAgentService');

describe('AI Agent Service', () => {
  let aiService;

  beforeEach(() => {
    aiService = new AIAgentService();
  });

  test('should analyze intent correctly', () => {
    const intent = aiService.analyzeIntent('أريد شراء منتج');
    expect(intent).toBe('product_inquiry');
  });

  test('should build prompt with customer data', async () => {
    const customerData = { name: 'أحمد', phone: '01234567890' };
    const prompt = await aiService.buildAdvancedPrompt(
      'مرحبا', customerData, {}, [], []
    );
    expect(prompt).toContain('أحمد');
  });
});
```

### **اختبارات Frontend:**
```bash
cd frontend

# تثبيت مكتبات الاختبار
npm install --save-dev @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

## 🔄 **سير العمل التطويري**

### **1. بدء التطوير:**
```bash
# تشغيل Backend
cd backend && npm run dev

# تشغيل Frontend (في terminal آخر)
cd frontend && npm run dev

# تشغيل قاعدة البيانات UI (اختياري)
cd backend && npx prisma studio
```

### **2. تطوير ميزة جديدة:**
```bash
# إنشاء فرع جديد
git checkout -b feature/new-feature

# تطوير الميزة...

# تشغيل الاختبارات
npm test

# التأكد من جودة الكود
npm run lint
npm run format

# إضافة التغييرات
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

### **3. مراجعة الكود:**
```bash
# إنشاء Pull Request
# مراجعة الكود من قبل فريق التطوير
# دمج الكود بعد الموافقة
```

## 🐛 **تصحيح الأخطاء (Debugging)**

### **Backend Debugging:**
```javascript
// استخدام debugger في VS Code
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/src/server.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "restart": true,
      "runtimeExecutable": "nodemon"
    }
  ]
}
```

### **Frontend Debugging:**
```javascript
// استخدام React Developer Tools
// إضافة console.log للتصحيح
console.log('Debug info:', data);

// استخدام debugger
debugger;
```

### **Database Debugging:**
```bash
# تفعيل query logging
# في .env.development
ENABLE_QUERY_LOGGING=true

# مراقبة الاستعلامات
tail -f logs/database.log
```

## 📊 **أدوات المراقبة**

### **مراقبة الأداء:**
```javascript
// إضافة middleware للمراقبة
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});
```

### **مراقبة الذاكرة:**
```javascript
// مراقبة استخدام الذاكرة
setInterval(() => {
  const memUsage = process.memoryUsage();
  console.log('Memory Usage:', {
    rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB'
  });
}, 30000);
```

## 🔧 **أدوات مساعدة**

### **Scripts مفيدة:**
```json
// package.json scripts
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write src/",
    "db:reset": "npx prisma migrate reset",
    "db:seed": "node scripts/seed.js",
    "db:studio": "npx prisma studio"
  }
}
```

### **Git Hooks:**
```bash
# إعداد pre-commit hook
npm install --save-dev husky lint-staged

# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm run test
```

---

## 📚 **المراجع المفيدة**

- [React Documentation](https://reactjs.org/docs)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## 📞 **الدعم التطويري**

للحصول على مساعدة في التطوير:
- راجع [أمثلة الكود](../examples/)
- اطلع على [أفضل الممارسات](BEST_PRACTICES.md)
- تواصل مع فريق التطوير
