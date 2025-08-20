/**
 * Data Isolation Middleware
 * يضمن عزل البيانات بين الشركات
 */

/**
 * Middleware لضمان فلترة جميع الاستعلامات بـ companyId
 */
const enforceCompanyIsolation = (req, res, next) => {
  try {
    // التأكد من وجود المستخدم المصادق عليه
    if (!req.user || !req.user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح بالوصول - معرف الشركة مطلوب',
        code: 'COMPANY_ID_REQUIRED'
      });
    }

    // إضافة companyId إلى req للاستخدام في الـ routes
    req.companyId = req.user.companyId;
    
    // منع الوصول لشركات أخرى (إلا للـ super admin)
    const requestedCompanyId = req.params.companyId || req.body.companyId || req.query.companyId;
    
    if (requestedCompanyId && req.user.role !== 'SUPER_ADMIN') {
      if (requestedCompanyId !== req.user.companyId) {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية للوصول لهذه الشركة',
          code: 'COMPANY_ACCESS_DENIED'
        });
      }
    }

    next();
  } catch (error) {
    console.error('❌ خطأ في middleware عزل البيانات:', error);
    return res.status(500).json({
      success: false,
      message: 'خطأ في التحقق من صلاحية الوصول',
      code: 'ISOLATION_ERROR'
    });
  }
};

/**
 * Middleware للتحقق من ملكية المورد
 */
const requireResourceOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const resourceId = req.params.id;
      const userCompanyId = req.user.companyId;
      
      if (!resourceId) {
        return next();
      }

      let resource;
      
      // جلب المورد حسب النوع
      switch (resourceType) {
        case 'order':
          resource = await prisma.order.findUnique({
            where: { id: resourceId },
            select: { companyId: true }
          });
          break;
          
        case 'product':
          resource = await prisma.product.findUnique({
            where: { id: resourceId },
            select: { companyId: true }
          });
          break;
          
        case 'customer':
          resource = await prisma.customer.findUnique({
            where: { id: resourceId },
            select: { companyId: true }
          });
          break;
          
        case 'conversation':
          resource = await prisma.conversation.findUnique({
            where: { id: resourceId },
            select: { companyId: true }
          });
          break;
          
        default:
          return next();
      }

      await prisma.$disconnect();

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'المورد غير موجود',
          code: 'RESOURCE_NOT_FOUND'
        });
      }

      // التحقق من الملكية
      if (resource.companyId !== userCompanyId && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية للوصول لهذا المورد',
          code: 'RESOURCE_ACCESS_DENIED'
        });
      }

      next();
    } catch (error) {
      console.error('❌ خطأ في التحقق من ملكية المورد:', error);
      return res.status(500).json({
        success: false,
        message: 'خطأ في التحقق من صلاحية الوصول',
        code: 'OWNERSHIP_CHECK_ERROR'
      });
    }
  };
};

/**
 * Helper function لإضافة companyId filter لجميع الاستعلامات
 */
const addCompanyFilter = (req, baseWhere = {}) => {
  const companyId = req.user?.companyId;
  
  if (!companyId) {
    throw new Error('معرف الشركة مطلوب');
  }
  
  return {
    ...baseWhere,
    companyId
  };
};

/**
 * Middleware للتسجيل والمراقبة
 */
const logDataAccess = (req, res, next) => {
  const startTime = Date.now();
  
  // تسجيل محاولة الوصول
  console.log(`🔍 [DATA-ACCESS] ${req.method} ${req.path}`, {
    userId: req.user?.id,
    companyId: req.user?.companyId,
    role: req.user?.role,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // تسجيل وقت الاستجابة
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`📊 [DATA-ACCESS] Response: ${res.statusCode} in ${duration}ms`);
  });

  next();
};

/**
 * Middleware شامل لحماية البيانات
 */
const protectCompanyData = [
  logDataAccess,
  enforceCompanyIsolation
];

module.exports = {
  enforceCompanyIsolation,
  requireResourceOwnership,
  addCompanyFilter,
  logDataAccess,
  protectCompanyData
};
