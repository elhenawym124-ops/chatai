/**
 * Companies Routes
 *
 * API endpoints for company management
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/v1/companies
 * جلب جميع الشركات مع pagination
 */
router.get('/', async (req, res) => {
  try {
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
    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (plan) where.plan = plan;
    if (isActive !== '') where.isActive = isActive === 'true';

    // حساب التصفح
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(parseInt(limit), 100);
    const skip = (pageNum - 1) * limitNum;

    // ترتيب النتائج
    const orderBy = {};
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

  } catch (error) {
    console.error('❌ Error fetching companies:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب الشركات',
      error: error.message
    });
  }
});

/**
 * GET /api/v1/companies/:id
 * جلب تفاصيل شركة محددة
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

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

  } catch (error) {
    console.error('❌ Error fetching company:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب تفاصيل الشركة',
      error: error.message
    });
  }
});

/**
 * GET /api/v1/companies/plans
 * جلب خطط الاشتراك المتاحة
 */
router.get('/plans', async (req, res) => {
  try {
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
        ],
        limits: {
          users: 5,
          customers: 1000,
          conversations: 5000,
          products: 500,
          storage: 1000 // MB
        }
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
        ],
        limits: {
          users: 25,
          customers: 10000,
          conversations: 25000,
          products: 2500,
          storage: 5000 // MB
        }
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
          'دعم فني مخصص',
          'تكامل API كامل'
        ],
        limits: {
          users: -1, // unlimited
          customers: -1,
          conversations: -1,
          products: -1,
          storage: -1
        }
      }
    };

    res.json({
      success: true,
      message: 'تم جلب خطط الاشتراك بنجاح',
      data: plans
    });

  } catch (error) {
    console.error('❌ Error fetching plans:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب خطط الاشتراك',
      error: error.message
    });
  }
});

/**
 * GET /api/v1/companies/:id/usage
 * جلب إحصائيات استخدام الشركة
 */
router.get('/:id/usage', async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '30' } = req.query; // days

    const company = await prisma.company.findUnique({
      where: { id }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'الشركة غير موجودة'
      });
    }

    // حساب تاريخ البداية
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // جلب إحصائيات الاستخدام
    const [
      usersCount,
      customersCount,
      productsCount,
      ordersCount,
      conversationsCount,
      recentConversations,
      recentOrders
    ] = await Promise.all([
      prisma.user.count({ where: { companyId: id, isActive: true } }),
      prisma.customer.count({ where: { companyId: id } }),
      prisma.product.count({ where: { companyId: id, isActive: true } }),
      prisma.order.count({ 
        where: { 
          companyId: id,
          createdAt: { gte: startDate }
        }
      }),
      prisma.conversation.count({ 
        where: { 
          companyId: id,
          createdAt: { gte: startDate }
        }
      }),
      prisma.conversation.count({ 
        where: { 
          companyId: id,
          createdAt: { gte: startDate }
        }
      }),
      prisma.order.count({ 
        where: { 
          companyId: id,
          createdAt: { gte: startDate }
        }
      })
    ]);

    const usage = {
      current: {
        users: usersCount,
        customers: customersCount,
        products: productsCount,
        orders: ordersCount,
        conversations: conversationsCount
      },
      period: {
        days: parseInt(period),
        conversations: recentConversations,
        orders: recentOrders
      },
      plan: company.plan
    };

    res.json({
      success: true,
      message: 'تم جلب إحصائيات الاستخدام بنجاح',
      data: usage
    });

  } catch (error) {
    console.error('❌ Error fetching company usage:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب إحصائيات الاستخدام',
      error: error.message
    });
  }
});

export default router;
