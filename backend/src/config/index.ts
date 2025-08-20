import { config as dotenvConfig } from 'dotenv';

// Load environment variables
dotenvConfig();

/**
 * Application Configuration
 * 
 * Centralized configuration management for the application.
 * All environment variables are validated and typed here.
 */

export const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),

  // Database
  database: {
    url: process.env.DATABASE_URL || '',
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET || 'your-session-secret-key',
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000', 10), // 24 hours
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  // Facebook Configuration
  facebook: {
    appId: process.env.FACEBOOK_APP_ID || '',
    appSecret: process.env.FACEBOOK_APP_SECRET || '',
    verifyToken: process.env.FACEBOOK_VERIFY_TOKEN || '',
  },

  // Google Gemini Configuration
  // مفاتيح Gemini يتم إدارتها من قاعدة البيانات فقط
  gemini: {
    apiKey: '', // لا يُستخدم - يتم الحصول على المفتاح من قاعدة البيانات
    model: 'gemini-pro',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '1000', 10),
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
    timeout: parseInt(process.env.AI_RESPONSE_TIMEOUT || '30000', 10),
  },

  // Email Configuration
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
    from: {
      email: process.env.FROM_EMAIL || 'noreply@example.com',
      name: process.env.FROM_NAME || 'Communication Platform',
    },
  },

  // SMS Configuration (Twilio)
  sms: {
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
    },
  },

  // Payment Configuration
  payment: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    },
    paypal: {
      clientId: process.env.PAYPAL_CLIENT_ID || '',
      clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
      mode: process.env.PAYPAL_MODE || 'sandbox', // sandbox or live
    },
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,application/pdf').split(','),
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000', 10), // زيادة من 100 إلى 1000
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log',
  },

  // Monitoring Configuration
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN || '',
  },

  // Webhook Configuration
  webhooks: {
    baseUrl: process.env.WEBHOOK_BASE_URL || 'http://localhost:3001/webhooks',
  },

  // Company Settings
  company: {
    defaultPlan: process.env.DEFAULT_COMPANY_PLAN || 'basic',
    maxUsersPerCompany: parseInt(process.env.MAX_USERS_PER_COMPANY || '10', 10),
    maxConversationsPerMonth: parseInt(process.env.MAX_CONVERSATIONS_PER_MONTH || '1000', 10),
  },

  // Feature Flags
  features: {
    enableAI: process.env.ENABLE_AI_FEATURES === 'true',
    enableEcommerce: process.env.ENABLE_ECOMMERCE === 'true',
    enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
    enableNotifications: process.env.ENABLE_NOTIFICATIONS === 'true',
  },
} as const;

/**
 * Validate required environment variables
 */
export const validateConfig = (): void => {
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'SESSION_SECRET',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Validate specific configurations
  if (config.env === 'production') {
    const productionRequiredVars = [
      'FACEBOOK_APP_ID',
      'FACEBOOK_APP_SECRET',
      'GOOGLE_GEMINI_API_KEY',
      'SMTP_USER',
      'SMTP_PASS',
    ];

    const missingProductionVars = productionRequiredVars.filter(varName => !process.env[varName]);

    if (missingProductionVars.length > 0) {
      console.warn(`Warning: Missing production environment variables: ${missingProductionVars.join(', ')}`);
    }
  }
};

export default config;
