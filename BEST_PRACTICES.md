# 📋 أفضل الممارسات للصيانة السهلة

## 🎯 مبادئ التطوير

### 1. **Clean Code Principles**

#### تسمية واضحة ومعبرة
```typescript
// ❌ سيء
const d = new Date();
const u = users.filter(x => x.a);

// ✅ جيد
const currentDate = new Date();
const activeUsers = users.filter(user => user.isActive);
```

#### دوال صغيرة ومحددة المسؤولية
```typescript
// ❌ سيء - دالة تفعل أشياء كثيرة
function processUser(user: User) {
  // validate user
  // save to database
  // send email
  // update cache
  // log activity
}

// ✅ جيد - دوال منفصلة
function validateUser(user: User): ValidationResult { }
function saveUser(user: User): Promise<User> { }
function sendWelcomeEmail(user: User): Promise<void> { }
function updateUserCache(user: User): void { }
function logUserActivity(user: User, action: string): void { }
```

### 2. **Error Handling Strategy**

#### استخدام أنواع أخطاء محددة
```typescript
// ❌ سيء
throw new Error('Something went wrong');

// ✅ جيد
throw new ValidationError('Email format is invalid', { field: 'email', value: email });
throw new NotFoundError('User', userId);
throw new ConflictError('Email already exists', { email });
```

#### معالجة الأخطاء في طبقات مختلفة
```typescript
// Controller Layer - معالجة HTTP errors
try {
  const result = await userService.createUser(userData);
  this.success(res, result, 'User created successfully', 201);
} catch (error) {
  if (error instanceof ValidationError) {
    this.error(res, error, 400);
  } else if (error instanceof ConflictError) {
    this.error(res, error, 409);
  } else {
    this.error(res, 'Internal server error', 500);
  }
}

// Service Layer - معالجة business logic errors
async createUser(userData: CreateUserData): Promise<User> {
  if (!this.validateEmail(userData.email)) {
    throw new ValidationError('Invalid email format');
  }
  
  const existingUser = await this.userRepository.findByEmail(userData.email);
  if (existingUser) {
    throw new ConflictError('Email already exists');
  }
  
  return await this.userRepository.create(userData);
}
```

### 3. **Database Best Practices**

#### استخدام Transactions للعمليات المترابطة
```typescript
async createOrderWithItems(orderData: CreateOrderData): Promise<Order> {
  return await this.withTransaction(async (tx) => {
    // إنشاء الطلب
    const order = await tx.order.create({ data: orderData });
    
    // إنشاء عناصر الطلب
    const orderItems = await tx.orderItem.createMany({
      data: orderData.items.map(item => ({
        ...item,
        orderId: order.id
      }))
    });
    
    // تحديث المخزون
    for (const item of orderData.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });
    }
    
    return order;
  });
}
```

#### استخدام Indexes للاستعلامات السريعة
```prisma
model User {
  id       String @id @default(cuid())
  email    String @unique
  phone    String?
  companyId String
  
  // Indexes للبحث السريع
  @@index([email])
  @@index([companyId])
  @@index([createdAt])
}
```

### 4. **API Design Principles**

#### RESTful URLs واضحة
```typescript
// ✅ جيد
GET    /api/v1/users              // قائمة المستخدمين
GET    /api/v1/users/:id          // مستخدم محدد
POST   /api/v1/users              // إنشاء مستخدم
PUT    /api/v1/users/:id          // تحديث مستخدم
DELETE /api/v1/users/:id          // حذف مستخدم

// العلاقات
GET    /api/v1/users/:id/orders   // طلبات المستخدم
POST   /api/v1/users/:id/orders   // إنشاء طلب للمستخدم
```

#### استجابات API موحدة
```typescript
// نجاح
{
  "success": true,
  "message": "User created successfully",
  "data": { ... },
  "timestamp": "2024-01-01T12:00:00.000Z"
}

// خطأ
{
  "success": false,
  "message": "Validation failed",
  "error": "VALIDATION_ERROR",
  "details": {
    "field": "email",
    "value": "invalid-email",
    "rule": "email_format"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}

// مع pagination
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 5. **Testing Strategy**

#### Unit Tests للدوال المهمة
```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      const userData = { email: 'test@example.com', name: 'Test User' };
      const result = await userService.createUser(userData);
      
      expect(result.success).toBe(true);
      expect(result.data.email).toBe(userData.email);
    });
    
    it('should throw ValidationError for invalid email', async () => {
      const userData = { email: 'invalid-email', name: 'Test User' };
      
      await expect(userService.createUser(userData))
        .rejects.toThrow(ValidationError);
    });
  });
});
```

#### Integration Tests للـ APIs
```typescript
describe('POST /api/v1/users', () => {
  it('should create user and return 201', async () => {
    const userData = { email: 'test@example.com', name: 'Test User' };
    
    const response = await request(app)
      .post('/api/v1/users')
      .send(userData)
      .expect(201);
      
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(userData.email);
  });
});
```

### 6. **Performance Optimization**

#### Caching Strategy
```typescript
// Cache للبيانات التي لا تتغير كثيراً
async getCompanySettings(companyId: string): Promise<CompanySettings> {
  const cacheKey = `company:settings:${companyId}`;
  
  // محاولة الحصول من Cache
  const cached = await this.cache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // الحصول من قاعدة البيانات
  const settings = await this.companyRepository.getSettings(companyId);
  
  // حفظ في Cache لمدة ساعة
  await this.cache.set(cacheKey, JSON.stringify(settings), 3600);
  
  return settings;
}
```

#### Database Query Optimization
```typescript
// ❌ سيء - N+1 Query Problem
const users = await prisma.user.findMany();
for (const user of users) {
  user.orders = await prisma.order.findMany({ where: { userId: user.id } });
}

// ✅ جيد - استخدام include
const users = await prisma.user.findMany({
  include: {
    orders: true
  }
});
```

### 7. **Security Best Practices**

#### Input Validation
```typescript
// استخدام validation libraries
import Joi from 'joi';

const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
  name: Joi.string().min(2).max(50).required(),
});

// في Controller
const { error, value } = createUserSchema.validate(req.body);
if (error) {
  throw new ValidationError(error.details[0].message);
}
```

#### Rate Limiting
```typescript
// تحديد عدد الطلبات لكل IP
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // 100 طلب كحد أقصى
  message: 'Too many requests from this IP',
});

app.use('/api/', rateLimiter);
```

### 8. **Monitoring & Logging**

#### Structured Logging
```typescript
// استخدام correlation IDs
app.use((req, res, next) => {
  req.correlationId = uuidv4();
  enhancedLogger.setCorrelationId(req.correlationId);
  next();
});

// Log business events
enhancedLogger.business('user_created', {
  userId: user.id,
  email: user.email,
  companyId: user.companyId
});

// Log performance
enhancedLogger.startTimer();
const result = await heavyOperation();
enhancedLogger.endTimer('heavy_operation', { resultCount: result.length });
```

### 9. **Code Organization**

#### Feature-based Structure
```
src/domains/users/
├── entities/User.ts
├── repositories/UserRepository.ts
├── services/UserService.ts
├── controllers/UserController.ts
├── routes/userRoutes.ts
├── validators/userValidators.ts
└── tests/
    ├── UserService.test.ts
    └── UserController.test.ts
```

#### Dependency Injection
```typescript
// استخدام DI container
class UserService {
  constructor(
    private userRepository: IUserRepository,
    private emailService: IEmailService,
    private logger: ILogger
  ) {}
}

// في main.ts
const container = new Container();
container.bind<IUserRepository>('UserRepository').to(UserRepository);
container.bind<IEmailService>('EmailService').to(EmailService);
```

### 10. **Documentation Standards**

#### API Documentation
```typescript
/**
 * Create a new user
 * @route POST /api/v1/users
 * @param {CreateUserRequest} req.body - User data
 * @returns {ApiResponse<User>} Created user
 * @throws {ValidationError} When input data is invalid
 * @throws {ConflictError} When email already exists
 */
async createUser(req: Request, res: Response): Promise<void> {
  // implementation
}
```

#### README Documentation
- وصف المشروع والهدف منه
- متطلبات التشغيل
- خطوات التثبيت
- أمثلة على الاستخدام
- دليل المساهمة
- معلومات الاتصال

هذه الممارسات تضمن:
✅ كود قابل للقراءة والفهم
✅ سهولة إضافة ميزات جديدة
✅ اختبارات شاملة
✅ أداء محسن
✅ أمان عالي
✅ مراقبة فعالة
