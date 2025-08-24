import { Application, Router } from 'express';
import { logger } from '@/utils/logger';
import authRoutes from './authRoutes';

/**
 * Routes Configuration
 *
 * Central routing setup that organizes all API endpoints
 * and provides a consistent structure for the application.
 */

/**
 * Setup all application routes
 */
export const setupRoutes = (app: Application): void => {
  const apiRouter = Router();

  // API version prefix
  const API_PREFIX = '/api/v1';

  // Health check endpoint (outside API versioning)
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
    });
  });

  // API documentation endpoint (development only)
  if (process.env.NODE_ENV === 'development') {
    app.get('/api/docs', (req, res) => {
      res.json({
        message: 'API Documentation',
        version: '1.0.0',
        endpoints: {
          auth: `${API_PREFIX}/auth`,
          users: `${API_PREFIX}/users`,
          companies: `${API_PREFIX}/companies`,
          customers: `${API_PREFIX}/customers`,
          conversations: `${API_PREFIX}/conversations`,
          messages: `${API_PREFIX}/messages`,
          products: `${API_PREFIX}/products`,
          orders: `${API_PREFIX}/orders`,
          reports: `${API_PREFIX}/reports`,
          notifications: `${API_PREFIX}/notifications`,
          webhooks: '/webhooks',
        },
        documentation: 'https://your-docs-url.com',
      });
    });
  }

  // Authentication routes
  apiRouter.use('/auth', authRoutes);

  // User management routes
  // apiRouter.use('/users', userRoutes);

  // Company management routes
  // apiRouter.use('/companies', companyRoutes);

  // Customer management routes (CRM)
  // apiRouter.use('/customers', customerRoutes);

  // Conversation management routes
  // apiRouter.use('/conversations', conversationRoutes);

  // Message management routes
  // apiRouter.use('/messages', messageRoutes);

  // Product management routes (E-commerce)
  // apiRouter.use('/products', productRoutes);

  // Order management routes
  // apiRouter.use('/orders', orderRoutes);

  // Category management routes
  // apiRouter.use('/categories', categoryRoutes);

  // Report and analytics routes
  // apiRouter.use('/reports', reportRoutes);

  // Notification routes
  // apiRouter.use('/notifications', notificationRoutes);

  // Settings routes
  // apiRouter.use('/settings', settingsRoutes);

  // File upload routes
  // apiRouter.use('/uploads', uploadRoutes);

  // AI integration routes
  // apiRouter.use('/ai', aiRoutes);

  // Webhook routes (outside API versioning)
  // app.use('/webhooks', webhookRoutes);

  // Mount API router with version prefix
  app.use(API_PREFIX, apiRouter);

  // Temporary placeholder routes for development
  setupPlaceholderRoutes(apiRouter);

  logger.info('Routes configured successfully');
};

/**
 * Setup placeholder routes for development
 * These will be replaced with actual route implementations
 */
const setupPlaceholderRoutes = (router: Router): void => {
  // Authentication placeholder
  router.get('/auth/status', (req, res) => {
    res.json({
      message: 'Authentication service is ready',
      endpoints: [
        'POST /auth/register',
        'POST /auth/login',
        'POST /auth/logout',
        'POST /auth/refresh',
        'POST /auth/forgot-password',
        'POST /auth/reset-password',
      ],
    });
  });

  // Users placeholder
  router.get('/users', (req, res) => {
    res.json({
      message: 'User management service is ready',
      endpoints: [
        'GET /users',
        'GET /users/:id',
        'POST /users',
        'PUT /users/:id',
        'DELETE /users/:id',
      ],
    });
  });

  // Companies routes
  router.get('/companies', async (req, res) => {
    try {
      const { getSharedPrismaClient } = require('../services/sharedDatabase');
      const prisma = getSharedPrismaClient();

      const {
        page = 1,
        limit = 25,
        search = '',
        plan = '',
        isActive = '',
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // بناء شروط البحث
      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      if (plan) where.plan = plan;
      if (isActive !== '') where.isActive = isActive === 'true';

      // حساب التصفح
      const pageNum = Math.max(1, parseInt(page as string));
      const limitNum = Math.min(parseInt(limit as string), 100);
      const skip = (pageNum - 1) * limitNum;

      // ترتيب النتائج
      const orderBy: any = {};
      if (sortBy === 'name') {
        orderBy.name = sortOrder;
      } else if (sortBy === 'plan') {
        orderBy.plan = sortOrder;
      } else if (sortBy === 'createdAt') {
        orderBy.createdAt = sortOrder;
      } else {
        orderBy.createdAt = 'desc';
      }

      // جلب الشركات مع التصفح
      const [companies, totalCount] = await Promise.all([
        prisma.company.findMany({
          where,
          orderBy,
          skip,
          take: limitNum,
          include: {
            _count: {
              select: {
                users: true,
                customers: true,
                products: true,
                orders: true,
                conversations: true
              }
            }
          }
        }),
        prisma.company.count({ where })
      ]);

      // حساب معلومات التصفح
      const totalPages = Math.ceil(totalCount / limitNum);
      const hasNext = pageNum < totalPages;
      const hasPrev = pageNum > 1;

      res.json({
        success: true,
        message: 'تم جلب الشركات بنجاح',
        data: {
          companies,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalCount,
            totalPages,
            hasNext,
            hasPrev
          }
        }
      });

      await prisma.$disconnect();

    } catch (error) {
      console.error('❌ Error fetching companies:', error);
      res.status(500).json({
        success: false,
        message: 'فشل في جلب الشركات',
        error: (error as Error).message
      });
    }
  });

  // Company plans
  router.get('/companies/plans', (req, res) => {
    const plans = {
      BASIC: {
        name: 'أساسي',
        price: 99,
        currency: 'SAR',
        features: [
          'حتى 5 مستخدمين',
          '1000 عميل',
          '5000 محادثة شهرياً',
          'تقارير أساسية',
          'دعم فني عادي'
        ]
      },
      PRO: {
        name: 'احترافي',
        price: 299,
        currency: 'SAR',
        features: [
          'حتى 25 مستخدم',
          '10000 عميل',
          '25000 محادثة شهرياً',
          'تقارير متقدمة',
          'ذكاء اصطناعي',
          'دعم فني أولوية'
        ]
      },
      ENTERPRISE: {
        name: 'مؤسسي',
        price: 999,
        currency: 'SAR',
        features: [
          'مستخدمين غير محدود',
          'عملاء غير محدود',
          'محادثات غير محدودة',
          'تقارير مخصصة',
          'ذكاء اصطناعي متقدم',
          'دعم فني مخصص'
        ]
      }
    };

    res.json({
      success: true,
      message: 'تم جلب خطط الاشتراك بنجاح',
      data: plans
    });
  });

  // Company details
  router.get('/companies/:id', async (req, res) => {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      const { id } = req.params;

      // التحقق من الصلاحية - المستخدم يمكنه فقط الوصول لشركته أو إذا كان super admin
      const userCompanyId = (req as any).user?.companyId;
      const userRole = (req as any).user?.role;

      if (!userCompanyId) {
        return res.status(403).json({
          success: false,
          message: 'غير مصرح بالوصول'
        });
      }

      // السماح للـ super admin بالوصول لجميع الشركات
      if (userRole !== 'SUPER_ADMIN' && id !== userCompanyId) {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية للوصول لهذه الشركة'
        });
      }

      const company = await prisma.company.findUnique({
        where: { id },
        include: {
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
              isActive: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              users: true,
              customers: true,
              products: true,
              orders: true,
              conversations: true,
              successPatterns: true
            }
          }
        }
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'الشركة غير موجودة'
        });
      }

      res.json({
        success: true,
        message: 'تم جلب تفاصيل الشركة بنجاح',
        data: company
      });

      await prisma.$disconnect();

    } catch (error) {
      console.error('❌ Error fetching company:', error);
      res.status(500).json({
        success: false,
        message: 'فشل في جلب تفاصيل الشركة',
        error: (error as Error).message
      });
    }
  });

  // Customers endpoint with proper company isolation
  router.get('/customers', async (req, res) => {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      // التحقق من المصادقة والشركة
      const companyId = (req as any).user?.companyId;
      if (!companyId) {
        return res.status(403).json({
          success: false,
          message: 'غير مصرح بالوصول - معرف الشركة مطلوب'
        });
      }

      console.log('👥 Fetching customers for company:', companyId);

      // Get customers with company filter
      const customers = await prisma.customer.findMany({
        where: { companyId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      });

      await prisma.$disconnect();

      res.json({
        success: true,
        data: customers,
        message: `تم جلب ${customers.length} عميل للشركة`,
        pagination: {
          page: 1,
          limit: 50,
          total: customers.length
        }
      });
    } catch (error) {
      console.error('❌ Error fetching customers:', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب العملاء',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Conversations endpoint with proper company isolation
  router.get('/conversations', async (req, res) => {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      // التحقق من المصادقة والشركة
      const companyId = (req as any).user?.companyId;
      if (!companyId) {
        return res.status(403).json({
          success: false,
          message: 'غير مصرح بالوصول - معرف الشركة مطلوب'
        });
      }

      console.log('💬 Fetching conversations for company:', companyId);

      // Get conversations with company filter
      const conversations = await prisma.conversation.findMany({
        where: { companyId },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          assignedUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          _count: {
            select: {
              messages: true
            }
          }
        },
        orderBy: { lastMessageAt: 'desc' },
        take: 50
      });

      await prisma.$disconnect();

      // تحويل البيانات لتشمل customerName مُجمع
      const conversationsWithCustomerName = conversations.map(conversation => ({
        ...conversation,
        customerName: conversation.customer
          ? `${conversation.customer.firstName || ''} ${conversation.customer.lastName || ''}`.trim() ||
            conversation.customer.firstName ||
            `عميل ${conversation.customer.id.slice(-6)}`
          : 'عميل غير محدد',
        customerAvatar: conversation.customer?.firstName
          ? `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.customer.firstName)}&background=random`
          : null
      }));

      res.json({
        success: true,
        data: conversationsWithCustomerName,
        message: `تم جلب ${conversations.length} محادثة للشركة`,
        pagination: {
          page: 1,
          limit: 50,
          total: conversations.length
        }
      });
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب المحادثات',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Products placeholder
  router.get('/products', (req, res) => {
    res.json({
      message: 'Product management service is ready',
      endpoints: [
        'GET /products',
        'GET /products/:id',
        'POST /products',
        'PUT /products/:id',
        'DELETE /products/:id',
        'GET /products/categories',
      ],
    });
  });

  // Orders placeholder
  router.get('/orders', (req, res) => {
    res.json({
      message: 'Order management service is ready',
      endpoints: [
        'GET /orders',
        'GET /orders/:id',
        'POST /orders',
        'PUT /orders/:id',
        'DELETE /orders/:id',
        'PUT /orders/:id/status',
      ],
    });
  });

  // Reports placeholder
  router.get('/reports', (req, res) => {
    res.json({
      message: 'Reports and analytics service is ready',
      endpoints: [
        'GET /reports/dashboard',
        'GET /reports/conversations',
        'GET /reports/sales',
        'GET /reports/customers',
        'GET /reports/performance',
      ],
    });
  });

  // Notifications placeholder
  router.get('/notifications', (req, res) => {
    res.json({
      message: 'Notification service is ready',
      endpoints: [
        'GET /notifications',
        'POST /notifications',
        'PUT /notifications/:id/read',
        'DELETE /notifications/:id',
      ],
    });
  });

  logger.info('Placeholder routes configured for development');
};
