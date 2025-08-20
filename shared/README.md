# Shared - كود مشترك بين Frontend و Backend

## نظرة عامة

هذا المجلد يحتوي على الكود والتعريفات المشتركة بين الواجهة الأمامية والخادم الخلفي لضمان التناسق وتجنب التكرار.

## هيكل المجلدات

```
shared/
├── types/           # تعريفات TypeScript المشتركة
│   ├── auth.ts     # أنواع المصادقة والترخيص
│   ├── user.ts     # أنواع المستخدمين والشركات
│   ├── customer.ts # أنواع العملاء والتفاعلات
│   ├── product.ts  # أنواع المنتجات والطلبات
│   ├── message.ts  # أنواع الرسائل والمحادثات
│   ├── api.ts      # أنواع استجابات API
│   └── common.ts   # أنواع عامة مشتركة
└── utils/          # أدوات مساعدة مشتركة
    ├── validation.ts # قواعد التحقق من البيانات
    ├── constants.ts  # الثوابت المشتركة
    ├── helpers.ts    # وظائف مساعدة عامة
    └── formatters.ts # وظائف تنسيق البيانات
```

## التعريفات المشتركة

### أنواع المصادقة
```typescript
// auth.ts
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  userId: string;
  companyId: string;
  role: UserRole;
  permissions: Permission[];
}
```

### أنواع المستخدمين
```typescript
// user.ts
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  MANAGER = 'MANAGER',
  AGENT = 'AGENT'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  logo?: string;
  plan: SubscriptionPlan;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### أنواع العملاء
```typescript
// customer.ts
export enum CustomerStatus {
  LEAD = 'LEAD',
  PROSPECT = 'PROSPECT',
  CUSTOMER = 'CUSTOMER',
  VIP = 'VIP',
  INACTIVE = 'INACTIVE'
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  facebookId?: string;
  status: CustomerStatus;
  tags: string[];
  notes: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerInteraction {
  id: string;
  customerId: string;
  type: InteractionType;
  channel: CommunicationChannel;
  content: string;
  userId: string;
  createdAt: Date;
}
```

### أنواع المنتجات
```typescript
// product.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sku: string;
  categoryId: string;
  images: string[];
  stock: number;
  isActive: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}
```

### أنواع الرسائل
```typescript
// message.ts
export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  FILE = 'FILE',
  LOCATION = 'LOCATION'
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  content: string;
  metadata?: Record<string, any>;
  isFromCustomer: boolean;
  isRead: boolean;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  customerId: string;
  assignedUserId?: string;
  channel: CommunicationChannel;
  status: ConversationStatus;
  lastMessageAt: Date;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### أنواع API
```typescript
// api.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}
```

## الأدوات المشتركة

### قواعد التحقق
```typescript
// validation.ts
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;

export const validateEmail = (email: string): boolean => {
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8 && 
         /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /\d/.test(password);
};

export const validatePhone = (phone: string): boolean => {
  return phoneRegex.test(phone);
};
```

### الثوابت
```typescript
// constants.ts
export const APP_CONFIG = {
  NAME: 'Communication Platform',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@example.com'
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  UPLOAD_PATH: '/uploads'
};

export const SUBSCRIPTION_PLANS = {
  BASIC: {
    name: 'Basic',
    maxUsers: 5,
    maxConversations: 1000,
    features: ['basic_crm', 'messenger_integration']
  },
  PRO: {
    name: 'Pro',
    maxUsers: 20,
    maxConversations: 5000,
    features: ['advanced_crm', 'ai_responses', 'ecommerce']
  },
  ENTERPRISE: {
    name: 'Enterprise',
    maxUsers: -1, // unlimited
    maxConversations: -1,
    features: ['all_features', 'custom_integrations', 'priority_support']
  }
};
```

### وظائف مساعدة
```typescript
// helpers.ts
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
```

### وظائف التنسيق
```typescript
// formatters.ts
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

export const formatDate = (date: Date | string, locale = 'ar-SA'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj);
};

export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return 'الآن';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} دقيقة`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ساعة`;
  return `${Math.floor(diffInSeconds / 86400)} يوم`;
};

export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};
```

## الاستخدام

### في Backend
```typescript
import { User, ApiResponse } from '../shared/types';
import { validateEmail } from '../shared/utils/validation';

export const createUser = async (userData: CreateUserData): Promise<ApiResponse<User>> => {
  if (!validateEmail(userData.email)) {
    return {
      success: false,
      message: 'Invalid email format'
    };
  }
  // Implementation...
};
```

### في Frontend
```typescript
import { User, formatDate } from '../shared';

const UserProfile: React.FC<{ user: User }> = ({ user }) => {
  return (
    <div>
      <h2>{user.firstName} {user.lastName}</h2>
      <p>انضم في: {formatDate(user.createdAt)}</p>
    </div>
  );
};
```

## إرشادات المساهمة

1. **التناسق**: تأكد من أن جميع التعريفات متسقة بين Frontend و Backend
2. **التوثيق**: وثق جميع الأنواع والوظائف الجديدة
3. **التحقق**: أضف قواعد تحقق مناسبة للبيانات الجديدة
4. **الاختبار**: اختبر الوظائف المشتركة في كلا البيئتين
5. **الإصدارات**: حافظ على توافق الإصدارات عند التحديث
