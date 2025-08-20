import Joi from 'joi';
import { logger } from '@/utils/logger';

/**
 * Environment Variables Validation
 * 
 * Validates all required environment variables at startup
 * to ensure the application has all necessary configuration.
 */

/**
 * Environment validation schema
 */
const envSchema = Joi.object({
  // Node environment
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),

  // Server configuration
  PORT: Joi.number()
    .port()
    .default(3001),

  // Database configuration
  DATABASE_URL: Joi.string()
    .uri()
    .required()
    .messages({
      'any.required': 'DATABASE_URL is required',
      'string.uri': 'DATABASE_URL must be a valid URI',
    }),

  // Redis configuration
  REDIS_URL: Joi.string()
    .uri()
    .default('redis://localhost:6379'),

  // JWT configuration
  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .messages({
      'any.required': 'JWT_SECRET is required',
      'string.min': 'JWT_SECRET must be at least 32 characters long',
    }),

  JWT_EXPIRES_IN: Joi.string()
    .default('7d'),

  JWT_REFRESH_EXPIRES_IN: Joi.string()
    .default('30d'),

  // Session configuration
  SESSION_SECRET: Joi.string()
    .min(32)
    .required()
    .messages({
      'any.required': 'SESSION_SECRET is required',
      'string.min': 'SESSION_SECRET must be at least 32 characters long',
    }),

  SESSION_MAX_AGE: Joi.number()
    .positive()
    .default(86400000), // 24 hours

  // CORS configuration
  CORS_ORIGIN: Joi.string()
    .default('http://localhost:3000'),

  // Facebook configuration
  FACEBOOK_APP_ID: Joi.string()
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),

  FACEBOOK_APP_SECRET: Joi.string()
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),

  FACEBOOK_VERIFY_TOKEN: Joi.string()
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),

  // Google Gemini configuration
  // مفاتيح Gemini يتم إدارتها من قاعدة البيانات - لا حاجة للتحقق من متغير البيئة
  // GOOGLE_GEMINI_API_KEY: تم إزالته لتجنب التضارب

  AI_MAX_TOKENS: Joi.number()
    .positive()
    .default(1000),

  AI_TEMPERATURE: Joi.number()
    .min(0)
    .max(2)
    .default(0.7),

  AI_RESPONSE_TIMEOUT: Joi.number()
    .positive()
    .default(30000),

  // Email configuration
  SMTP_HOST: Joi.string()
    .hostname()
    .default('smtp.gmail.com'),

  SMTP_PORT: Joi.number()
    .port()
    .default(587),

  SMTP_USER: Joi.string()
    .email()
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),

  SMTP_PASS: Joi.string()
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),

  FROM_EMAIL: Joi.string()
    .email()
    .default('noreply@example.com'),

  FROM_NAME: Joi.string()
    .default('Communication Platform'),

  // SMS configuration (Twilio)
  TWILIO_ACCOUNT_SID: Joi.string()
    .optional(),

  TWILIO_AUTH_TOKEN: Joi.string()
    .optional(),

  TWILIO_PHONE_NUMBER: Joi.string()
    .optional(),

  // Payment configuration
  STRIPE_SECRET_KEY: Joi.string()
    .optional(),

  STRIPE_PUBLISHABLE_KEY: Joi.string()
    .optional(),

  STRIPE_WEBHOOK_SECRET: Joi.string()
    .optional(),

  PAYPAL_CLIENT_ID: Joi.string()
    .optional(),

  PAYPAL_CLIENT_SECRET: Joi.string()
    .optional(),

  PAYPAL_MODE: Joi.string()
    .valid('sandbox', 'live')
    .default('sandbox'),

  // File upload configuration
  MAX_FILE_SIZE: Joi.number()
    .positive()
    .default(10485760), // 10MB

  UPLOAD_PATH: Joi.string()
    .default('./uploads'),

  ALLOWED_FILE_TYPES: Joi.string()
    .default('image/jpeg,image/png,image/gif,application/pdf'),

  // Rate limiting configuration
  RATE_LIMIT_WINDOW_MS: Joi.number()
    .positive()
    .default(900000), // 15 minutes

  RATE_LIMIT_MAX_REQUESTS: Joi.number()
    .positive()
    .default(100),

  // Logging configuration
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'http', 'debug')
    .default('info'),

  LOG_FILE: Joi.string()
    .default('./logs/app.log'),

  // Monitoring configuration
  SENTRY_DSN: Joi.string()
    .uri()
    .optional(),

  // Webhook configuration
  WEBHOOK_BASE_URL: Joi.string()
    .uri()
    .default('http://localhost:3001/webhooks'),

  // Company settings
  DEFAULT_COMPANY_PLAN: Joi.string()
    .valid('basic', 'pro', 'enterprise')
    .default('basic'),

  MAX_USERS_PER_COMPANY: Joi.number()
    .positive()
    .default(10),

  MAX_CONVERSATIONS_PER_MONTH: Joi.number()
    .positive()
    .default(1000),

  // Feature flags
  ENABLE_AI_FEATURES: Joi.boolean()
    .default(true),

  ENABLE_ECOMMERCE: Joi.boolean()
    .default(true),

  ENABLE_ANALYTICS: Joi.boolean()
    .default(true),

  ENABLE_NOTIFICATIONS: Joi.boolean()
    .default(true),

}).unknown(); // Allow unknown environment variables

/**
 * Validate environment variables
 */
export const validateEnv = (): void => {
  const { error, value } = envSchema.validate(process.env, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    
    logger.error('Environment validation failed:', {
      errors: errorMessages,
      details: error.details,
    });

    console.error('❌ Environment validation failed:');
    errorMessages.forEach(message => {
      console.error(`  - ${message}`);
    });

    process.exit(1);
  }

  // Update process.env with validated and default values
  Object.assign(process.env, value);

  logger.info('✅ Environment variables validated successfully');

  // Log configuration summary (without sensitive data)
  const configSummary = {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    logLevel: process.env.LOG_LEVEL,
    corsOrigin: process.env.CORS_ORIGIN,
    features: {
      ai: process.env.ENABLE_AI_FEATURES === 'true',
      ecommerce: process.env.ENABLE_ECOMMERCE === 'true',
      analytics: process.env.ENABLE_ANALYTICS === 'true',
      notifications: process.env.ENABLE_NOTIFICATIONS === 'true',
    },
    integrations: {
      facebook: !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET),
      gemini: !!process.env.GOOGLE_GEMINI_API_KEY,
      stripe: !!process.env.STRIPE_SECRET_KEY,
      paypal: !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
      twilio: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
      email: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
    },
  };

  logger.info('Configuration summary:', configSummary);
};

/**
 * Get environment variable with type safety
 */
export const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not defined`);
  }
  
  return value;
};

/**
 * Get boolean environment variable
 */
export const getBooleanEnvVar = (key: string, defaultValue = false): boolean => {
  const value = process.env[key];
  
  if (value === undefined) {
    return defaultValue;
  }
  
  return value.toLowerCase() === 'true';
};

/**
 * Get number environment variable
 */
export const getNumberEnvVar = (key: string, defaultValue?: number): number => {
  const value = process.env[key];
  
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not defined`);
  }
  
  const numValue = parseInt(value, 10);
  
  if (isNaN(numValue)) {
    throw new Error(`Environment variable ${key} is not a valid number`);
  }
  
  return numValue;
};
