# 🏗️ بنية النظام المعمارية
## System Architecture Documentation

## 📐 **نظرة عامة على البنية**

النظام مبني على بنية **ثلاثية الطبقات (3-Tier Architecture)** مع إضافة طبقة الذكاء الاصطناعي، مما يوفر فصل واضح بين المكونات وسهولة في الصيانة والتطوير.

```mermaid
graph TB
    subgraph "Presentation Layer"
        A[React Frontend]
        B[Admin Dashboard]
        C[User Interface]
    end
    
    subgraph "Application Layer"
        D[Express.js API]
        E[AI Agent Service]
        F[RAG Service]
        G[Memory Service]
        H[Facebook Integration]
    end
    
    subgraph "Data Layer"
        I[MySQL Database]
        J[Prisma ORM]
        K[File Storage]
    end
    
    subgraph "External Services"
        L[Google Gemini AI]
        M[Facebook Graph API]
        N[Webhook Services]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    E --> G
    E --> L
    D --> H
    H --> M
    H --> N
    D --> J
    J --> I
    D --> K
```

## 🎯 **الطبقات الأساسية**

### **1. طبقة العرض (Presentation Layer)**

#### **Frontend Application**
```typescript
src/
├── components/          # مكونات React قابلة للإعادة
│   ├── ui/             # مكونات واجهة المستخدم الأساسية
│   ├── forms/          # نماذج الإدخال
│   ├── charts/         # مخططات وإحصائيات
│   └── layout/         # مكونات التخطيط
├── pages/              # صفحات التطبيق
│   ├── Dashboard/      # لوحة التحكم
│   ├── Conversations/ # إدارة المحادثات
│   ├── Customers/     # إدارة العملاء
│   ├── Products/      # إدارة المنتجات
│   └── Settings/      # الإعدادات
├── hooks/              # React Hooks مخصصة
├── services/           # خدمات API
├── store/              # إدارة الحالة (Zustand)
├── types/              # تعريفات TypeScript
└── utils/              # وظائف مساعدة
```

#### **المسؤوليات:**
- عرض البيانات للمستخدم
- التفاعل مع المستخدم
- إرسال الطلبات للـ API
- إدارة حالة التطبيق

### **2. طبقة التطبيق (Application Layer)**

#### **API Server Structure**
```javascript
backend/src/
├── routes/             # مسارات API
│   ├── auth.js        # المصادقة والترخيص
│   ├── conversations.js # إدارة المحادثات
│   ├── customers.js   # إدارة العملاء
│   ├── products.js    # إدارة المنتجات
│   ├── ai.js          # إعدادات الذكاء الاصطناعي
│   └── webhooks.js    # معالجة Webhooks
├── services/          # خدمات الأعمال
│   ├── aiAgentService.js      # خدمة الذكاء الاصطناعي
│   ├── ragService.js          # خدمة RAG
│   ├── memoryService.js       # خدمة الذاكرة
│   ├── facebookService.js     # تكامل فيسبوك
│   └── orderService.js        # إدارة الطلبات
├── middleware/        # وسطاء Express
│   ├── auth.js       # التحقق من المصادقة
│   ├── validation.js # التحقق من البيانات
│   └── logging.js    # تسجيل العمليات
├── utils/            # وظائف مساعدة
└── config/           # إعدادات النظام
```

#### **المسؤوليات:**
- معالجة منطق الأعمال
- التحقق من صحة البيانات
- إدارة المصادقة والترخيص
- التكامل مع الخدمات الخارجية

### **3. طبقة البيانات (Data Layer)**

#### **Database Schema**
```sql
-- الجداول الأساسية
Users                   # المستخدمين
Companies              # الشركات
Customers              # العملاء
Conversations          # المحادثات
Messages               # الرسائل
Products               # المنتجات
Orders                 # الطلبات

-- جداول الذكاء الاصطناعي
SystemPrompts          # البرومبتات المخصصة
AISettings             # إعدادات الذكاء الاصطناعي
GeminiKeys            # مفاتيح Gemini API
ConversationMemory    # ذاكرة المحادثات
FAQs                  # الأسئلة الشائعة

-- جداول النظام
FacebookPages         # صفحات فيسبوك
Webhooks             # إعدادات Webhooks
AuditLogs            # سجل العمليات
```

## 🤖 **نظام الذكاء الاصطناعي**

### **AI Agent Service Architecture**

```mermaid
graph TD
    A[Customer Message] --> B[AI Agent Service]
    B --> C[Get Company Prompts]
    C --> D{Check System Prompts}
    D -->|Found| E[Use Custom Prompt]
    D -->|Not Found| F[Use Default Prompt]
    E --> G[Build Advanced Prompt]
    F --> G
    G --> H[Memory Service]
    G --> I[RAG Service]
    H --> J[Conversation Memory]
    I --> K[Relevant Data]
    J --> L[Combine All Data]
    K --> L
    L --> M[Send to Gemini AI]
    M --> N[Process Response]
    N --> O[Save to Memory]
    O --> P[Return to User]
```

### **مكونات نظام الذكاء الاصطناعي:**

#### **1. AI Agent Service**
```javascript
class AIAgentService {
  // الوظائف الأساسية
  async processCustomerMessage(messageData)
  async getCompanyPrompts(companyId)
  async buildAdvancedPrompt(...)
  async generateResponse(...)
  
  // تحليل الرسائل
  analyzeIntent(message)
  analyzeSentiment(message)
  
  // إدارة الذاكرة
  async saveInteraction(...)
  async getConversationMemory(...)
}
```

#### **2. RAG Service (Retrieval-Augmented Generation)**
```javascript
class RAGService {
  // البحث والاسترجاع
  async retrieveRelevantData(query, intent, customerId)
  async searchProducts(query)
  async searchFAQs(query)
  async searchPolicies(query)
  
  // إدارة قاعدة المعرفة
  async initializeKnowledgeBase()
  async updateKnowledgeBase()
}
```

#### **3. Memory Service**
```javascript
class MemoryService {
  // إدارة الذاكرة
  async saveInteraction(interactionData)
  async getConversationMemory(conversationId, senderId, limit)
  async clearOldMemories()
  
  // تحليل السياق
  async analyzeConversationContext(...)
  async getCustomerHistory(customerId)
}
```

## 🔄 **تدفق البيانات**

### **1. تدفق الرسائل الواردة**

```mermaid
sequenceDiagram
    participant FB as Facebook
    participant WH as Webhook
    participant API as API Server
    participant AI as AI Service
    participant DB as Database
    participant GM as Gemini AI

    FB->>WH: رسالة جديدة
    WH->>API: معالجة Webhook
    API->>DB: حفظ الرسالة
    API->>AI: معالجة بالذكاء الاصطناعي
    AI->>DB: جلب البرومبت المخصص
    AI->>DB: جلب ذاكرة المحادثة
    AI->>DB: جلب بيانات RAG
    AI->>GM: إرسال البرومبت المتقدم
    GM->>AI: الرد المولد
    AI->>DB: حفظ التفاعل
    AI->>API: إرجاع الرد
    API->>FB: إرسال الرد للعميل
```

### **2. تدفق إدارة البرومبت**

```mermaid
sequenceDiagram
    participant Admin as المدير
    participant UI as واجهة الإدارة
    participant API as API Server
    participant DB as Database
    participant AI as AI Service

    Admin->>UI: إنشاء برومبت جديد
    UI->>API: POST /api/ai/prompts
    API->>DB: حفظ البرومبت
    API->>UI: تأكيد الحفظ
    UI->>Admin: عرض النجاح
    
    Note over AI: عند الرسالة التالية
    AI->>DB: جلب البرومبت النشط
    DB->>AI: إرجاع البرومبت المخصص
```

## 🔐 **الأمان والحماية**

### **طبقات الأمان**

```mermaid
graph TD
    A[Client Request] --> B[Rate Limiting]
    B --> C[CORS Protection]
    C --> D[Input Validation]
    D --> E[Authentication]
    E --> F[Authorization]
    F --> G[Business Logic]
    G --> H[Data Access]
    H --> I[Database]
```

### **آليات الحماية:**

#### **1. المصادقة والترخيص**
- **JWT Tokens**: مصادقة آمنة
- **Role-based Access Control**: صلاحيات حسب الدور
- **Session Management**: إدارة الجلسات

#### **2. حماية البيانات**
- **Input Sanitization**: تنظيف المدخلات
- **SQL Injection Prevention**: منع هجمات SQL
- **XSS Protection**: حماية من XSS

#### **3. مراقبة النظام**
- **Audit Logging**: تسجيل العمليات
- **Error Tracking**: تتبع الأخطاء
- **Performance Monitoring**: مراقبة الأداء

## 📊 **إدارة الأداء**

### **استراتيجيات التحسين:**

#### **1. Database Optimization**
```sql
-- فهرسة الجداول المهمة
CREATE INDEX idx_conversations_customer ON conversations(customerId);
CREATE INDEX idx_messages_conversation ON messages(conversationId);
CREATE INDEX idx_system_prompts_active ON system_prompts(isActive);
```

#### **2. Caching Strategy**
```javascript
// تخزين مؤقت للبيانات المتكررة
const cache = {
  prompts: new Map(),
  customerData: new Map(),
  ragData: new Map()
};
```

#### **3. Connection Pooling**
```javascript
// تجميع اتصالات قاعدة البيانات
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'info', 'warn', 'error'],
});
```

## 🔧 **إعدادات النشر**

### **بيئات النشر:**

#### **Development Environment**
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
  
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=mysql://...
  
  database:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
```

#### **Production Environment**
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  frontend:
    build: 
      context: ./frontend
      dockerfile: Dockerfile.production
    environment:
      - NODE_ENV=production
  
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.production
    environment:
      - NODE_ENV=production
```

## 📈 **قابلية التوسع**

### **استراتيجيات التوسع:**

#### **1. Horizontal Scaling**
- **Load Balancers**: توزيع الأحمال
- **Multiple Instances**: عدة نسخ من الخادم
- **Database Clustering**: تجميع قواعد البيانات

#### **2. Microservices Migration**
```mermaid
graph TD
    A[Monolithic App] --> B[API Gateway]
    B --> C[Auth Service]
    B --> D[AI Service]
    B --> E[Chat Service]
    B --> F[Customer Service]
    B --> G[Product Service]
```

---

## 📞 **المراجع والدعم**

- [دليل التطوير](../development/DEVELOPMENT_SETUP.md)
- [توثيق API](../api/README.md)
- [دليل النشر](../deployment/DEPLOYMENT_GUIDE.md)
- [حل المشاكل](../troubleshooting/COMMON_ISSUES.md)
