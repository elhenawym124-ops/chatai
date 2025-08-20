/**
 * Validation Middleware
 *
 * Data validation and sanitization for API requests
 */

const Joi = require('joi');

/**
 * Create error helper function
 */
const createError = (status, message, code, details = null) => {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  error.details = details;
  return error;
};

/**
 * Generic validation middleware
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      // Log validation failure (logger might not be available)
      try {
        const logger = require('../utils/logger');
        logger.warn('Validation failed:', {
          path: req.path,
          method: req.method,
          errors: validationErrors
        });
      } catch (e) {
        console.warn('Validation failed:', validationErrors);
      }

      // Send validation error response directly
      return res.status(422).json({
        error: 'Validation failed',
        message: 'The provided data does not meet the required format',
        code: 'VALIDATION_ERROR',
        details: validationErrors,
        timestamp: new Date().toISOString()
      });
    }

    // Replace the original data with validated and sanitized data
    req[property] = value;
    next();
  };
};

/**
 * Common validation schemas
 */
const schemas = {
  // User schemas
  createUser: Joi.object({
    name: Joi.string().min(2).max(100).required().trim(),
    email: Joi.string().email().required().lowercase().trim(),
    password: Joi.string().min(8).max(128).required(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional().trim(),
    role: Joi.string().valid('admin', 'manager', 'agent', 'user').default('user')
  }),

  updateUser: Joi.object({
    name: Joi.string().min(2).max(100).optional().trim(),
    email: Joi.string().email().optional().lowercase().trim(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional().trim(),
    role: Joi.string().valid('admin', 'manager', 'agent', 'user').optional()
  }),

  // Customer schemas
  createCustomer: Joi.object({
    name: Joi.string().min(2).max(100).required().trim(),
    email: Joi.string().email().optional().lowercase().trim(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional().trim(),
    address: Joi.string().max(500).optional().trim(),
    notes: Joi.string().max(1000).optional().trim(),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
    customFields: Joi.object().optional()
  }),

  updateCustomer: Joi.object({
    name: Joi.string().min(2).max(100).optional().trim(),
    email: Joi.string().email().optional().lowercase().trim(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional().trim(),
    address: Joi.string().max(500).optional().trim(),
    notes: Joi.string().max(1000).optional().trim(),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
    customFields: Joi.object().optional()
  }),

  // Product schemas
  createProduct: Joi.object({
    name: Joi.string().min(2).max(200).required().trim(),
    description: Joi.string().max(2000).optional().trim(),
    price: Joi.number().positive().precision(2).required(),
    category: Joi.string().max(100).optional().trim(),
    sku: Joi.string().max(100).optional().trim(),
    stock: Joi.number().integer().min(0).default(0),
    images: Joi.array().items(Joi.string().uri()).optional(),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
    isActive: Joi.boolean().default(true)
  }),

  updateProduct: Joi.object({
    name: Joi.string().min(2).max(200).optional().trim(),
    description: Joi.string().max(2000).optional().trim(),
    price: Joi.number().positive().precision(2).optional(),
    category: Joi.string().max(100).optional().trim(),
    sku: Joi.string().max(100).optional().trim(),
    stock: Joi.number().integer().min(0).optional(),
    images: Joi.array().items(Joi.string().uri()).optional(),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
    isActive: Joi.boolean().optional()
  }),

  // Order schemas
  createOrder: Joi.object({
    customerId: Joi.number().integer().positive().required(),
    items: Joi.array().items(
      Joi.object({
        productId: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().positive().required(),
        price: Joi.number().positive().precision(2).optional()
      })
    ).min(1).required(),
    shippingAddress: Joi.string().max(500).optional().trim(),
    notes: Joi.string().max(1000).optional().trim()
  }),

  updateOrderStatus: Joi.object({
    status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled').required()
  }),

  // Conversation schemas
  createConversation: Joi.object({
    customerId: Joi.alternatives().try(
      Joi.number().integer().positive(),
      Joi.string().pattern(/^\d+$/).min(1)
    ).required(),
    customerName: Joi.string().min(1).max(100).optional().trim(),
    message: Joi.string().min(1).max(5000).required().trim(),
    type: Joi.string().valid('text', 'image', 'file', 'audio', 'video').default('text'),
    priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
    metadata: Joi.object().optional()
  }),

  sendMessage: Joi.object({
    message: Joi.string().min(1).max(5000).required().trim(),
    type: Joi.string().valid('text', 'image', 'file', 'audio', 'video').default('text'),
    metadata: Joi.object().optional()
  }),

  updateConversationStatus: Joi.object({
    status: Joi.string().valid('active', 'pending', 'resolved', 'closed').required()
  }),

  // Authentication schemas
  login: Joi.object({
    email: Joi.string().email().required().lowercase().trim(),
    password: Joi.string().required()
  }),

  register: Joi.object({
    name: Joi.string().min(2).max(100).required().trim(),
    email: Joi.string().email().required().lowercase().trim(),
    password: Joi.string().min(8).max(128).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional().trim()
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).max(128).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  }),

  // Query parameter schemas
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').default('desc')
  }),

  search: Joi.object({
    q: Joi.string().min(1).max(100).optional().trim(),
    category: Joi.string().max(100).optional().trim(),
    status: Joi.string().optional().trim(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').default('desc')
  }),

  // Product schemas
  createProduct: Joi.object({
    name: Joi.string().min(2).max(200).required().trim(),
    description: Joi.string().max(2000).optional().trim(),
    sku: Joi.string().min(1).max(100).required().trim(),
    price: Joi.number().positive().required(),
    comparePrice: Joi.number().positive().optional(),
    cost: Joi.number().positive().optional(),
    category: Joi.string().max(100).optional().trim(),
    stock: Joi.number().integer().min(0).default(0),
    lowStockThreshold: Joi.number().integer().min(0).default(0),
    weight: Joi.number().positive().optional(),
    dimensions: Joi.alternatives().try(
      Joi.string().optional(),
      Joi.object({
        length: Joi.number().positive().optional(),
        width: Joi.number().positive().optional(),
        height: Joi.number().positive().optional()
      }).optional()
    ),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
    isActive: Joi.boolean().default(true),
    images: Joi.array().items(Joi.string()).optional()
  }),

  updateProduct: Joi.object({
    name: Joi.string().min(2).max(200).optional().trim(),
    description: Joi.string().max(2000).optional().trim(),
    sku: Joi.string().min(1).max(100).optional().trim(),
    price: Joi.number().positive().optional(),
    comparePrice: Joi.number().positive().optional(),
    cost: Joi.number().positive().optional(),
    category: Joi.string().max(100).optional().trim(),
    stock: Joi.number().integer().min(0).optional(),
    lowStockThreshold: Joi.number().integer().min(0).optional(),
    weight: Joi.number().positive().optional(),
    dimensions: Joi.alternatives().try(
      Joi.string().optional(),
      Joi.object({
        length: Joi.number().positive().optional(),
        width: Joi.number().positive().optional(),
        height: Joi.number().positive().optional()
      }).optional()
    ),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
    isActive: Joi.boolean().optional(),
    images: Joi.array().items(Joi.string()).optional()
  }),

  // ID parameter validation
  idParam: Joi.object({
    id: Joi.alternatives().try(
      Joi.number().integer().positive(),
      Joi.string().pattern(/^\d+$/).min(1)
    ).required()
  }),

  // File upload validation
  fileUpload: Joi.object({
    filename: Joi.string().max(255).required(),
    mimetype: Joi.string().valid(
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ).required(),
    size: Joi.number().max(10 * 1024 * 1024).required() // 10MB max
  }),

  // Continuous Learning validation schemas
  learningData: Joi.object({
    type: Joi.string().valid('conversation', 'sentiment', 'recommendation', 'feedback').required(),
    data: Joi.object().required(),
    outcome: Joi.string().valid('purchase', 'resolved', 'abandoned', 'rejected', 'responded', 'unknown').optional(),
    feedback: Joi.object().optional(),
    customerId: Joi.string().optional(),
    conversationId: Joi.string().optional()
  }),

  learningSettings: Joi.object({
    learning: Joi.object().optional(),
    ai: Joi.object().optional(),
    performance: Joi.object().optional()
  }).unknown(true), // السماح بحقول إضافية

  queryParams: Joi.object({
    companyId: Joi.string().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    type: Joi.string().optional(),
    status: Joi.string().optional(),
    outcome: Joi.string().optional(),
    severity: Joi.string().valid('info', 'warning', 'error', 'high', 'medium', 'low').optional(),
    period: Joi.string().valid('day', 'week', 'month').default('week'),
    minConfidence: Joi.number().min(0).max(1).default(0.5),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    search: Joi.string().optional(),
    dateFrom: Joi.date().iso().optional(),
    dateTo: Joi.date().iso().optional()
  })
};

/**
 * Validate required fields middleware
 */
const requireFields = (fields) => {
  return (req, res, next) => {
    const missingFields = [];
    
    for (const field of fields) {
      if (!req.body || req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      const validationError = createError(
        422, 
        'Missing required fields', 
        'MISSING_REQUIRED_FIELDS',
        missingFields.map(field => ({
          field,
          message: `${field} is required`,
          value: null
        }))
      );
      validationError.name = 'ValidationError';
      return next(validationError);
    }
    
    next();
  };
};

/**
 * Validate data types middleware
 */
const validateTypes = (typeMap) => {
  return (req, res, next) => {
    const typeErrors = [];
    
    for (const [field, expectedType] of Object.entries(typeMap)) {
      if (req.body && req.body[field] !== undefined) {
        const value = req.body[field];
        const actualType = typeof value;
        
        if (expectedType === 'number' && (actualType !== 'number' || isNaN(value))) {
          typeErrors.push({
            field,
            message: `${field} must be a valid number`,
            value,
            expectedType,
            actualType
          });
        } else if (expectedType === 'string' && actualType !== 'string') {
          typeErrors.push({
            field,
            message: `${field} must be a string`,
            value,
            expectedType,
            actualType
          });
        } else if (expectedType === 'boolean' && actualType !== 'boolean') {
          typeErrors.push({
            field,
            message: `${field} must be a boolean`,
            value,
            expectedType,
            actualType
          });
        } else if (expectedType === 'array' && !Array.isArray(value)) {
          typeErrors.push({
            field,
            message: `${field} must be an array`,
            value,
            expectedType,
            actualType
          });
        }
      }
    }
    
    if (typeErrors.length > 0) {
      const validationError = createError(
        422, 
        'Invalid data types', 
        'INVALID_DATA_TYPES',
        typeErrors
      );
      validationError.name = 'ValidationError';
      return next(validationError);
    }
    
    next();
  };
};

/**
 * Sanitize string fields
 */
const sanitizeStrings = (req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  };

  const sanitizeObject = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitizeObject(obj[key]);
          } else {
            obj[key] = sanitizeValue(obj[key]);
          }
        }
      }
    }
  };

  if (req.body) {
    sanitizeObject(req.body);
  }
  
  next();
};

/**
 * Validate company access middleware
 */
const validateCompany = async (req, res, next) => {
  try {
    // التحقق من وجود معرف الشركة في المستخدم
    if (!req.user || !req.user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح بالوصول - معرف الشركة مطلوب',
        code: 'COMPANY_ACCESS_DENIED'
      });
    }

    // التحقق من صحة معرف الشركة
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const company = await prisma.company.findUnique({
      where: { id: req.user.companyId },
      select: { id: true, isActive: true }
    });

    await prisma.$disconnect();

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'الشركة غير موجودة',
        code: 'COMPANY_NOT_FOUND'
      });
    }

    if (!company.isActive) {
      return res.status(403).json({
        success: false,
        message: 'الشركة غير نشطة',
        code: 'COMPANY_INACTIVE'
      });
    }

    next();

  } catch (error) {
    console.error('❌ Error in validateCompany middleware:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في التحقق من الشركة',
      code: 'COMPANY_VALIDATION_ERROR'
    });
  }
};

module.exports = {
  validate,
  schemas,
  requireFields,
  validateTypes,
  sanitizeStrings,
  validateCompany
};
