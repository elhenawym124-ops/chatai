/**
 * Comprehensive Data Isolation Middleware
 * يضمن عزل البيانات بين الشركات في جميع أنحاء النظام
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Middleware إجباري لعزل البيانات
 */
const enforceDataIsolation = async (req, res, next) => {
  try {
    // التأكد من المصادقة
    if (!req.user || !req.user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح بالوصول - معرف الشركة مطلوب',
        code: 'COMPANY_ID_REQUIRED'
      });
    }

    // إضافة companyId للطلب
    req.companyId = req.user.companyId;
    
    // منع الوصول لشركات أخرى (إلا للـ super admin)
    const requestedCompanyId = req.params.companyId || req.body.companyId || req.query.companyId;
    
    if (requestedCompanyId && req.user.role !== 'SUPER_ADMIN') {
      if (requestedCompanyId !== req.user.companyId) {
        console.log(`🚨 [SECURITY] Unauthorized company access attempt:`, {
          userId: req.user.id,
          userCompanyId: req.user.companyId,
          requestedCompanyId,
          path: req.path,
          method: req.method,
          ip: req.ip
        });
        
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
 * Helper function لإضافة companyId filter
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
 * Middleware للتحقق من ملكية المورد
 */
const verifyResourceOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const userCompanyId = req.user.companyId;
      
      if (!resourceId) {
        return next();
      }

      let resource;
      
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

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'المورد غير موجود',
          code: 'RESOURCE_NOT_FOUND'
        });
      }

      if (resource.companyId !== userCompanyId && req.user.role !== 'SUPER_ADMIN') {
        console.log(`🚨 [SECURITY] Unauthorized resource access attempt:`, {
          userId: req.user.id,
          userCompanyId,
          resourceType,
          resourceId,
          resourceCompanyId: resource.companyId,
          path: req.path
        });
        
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
  enforceDataIsolation
];

/**
 * Middleware للتحقق من صلاحية الوصول للشركة
 */
const requireCompanyAccess = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const userCompanyId = req.user?.companyId;
    const userRole = req.user?.role;

    // Super admin can access all companies
    if (userRole === 'SUPER_ADMIN') {
      return next();
    }

    // Regular users can only access their own company
    if (companyId && companyId !== userCompanyId) {
      console.log(`🚨 [SECURITY] Company access violation:`, {
        userId: req.user?.id,
        userCompanyId,
        requestedCompanyId: companyId,
        path: req.path
      });
      
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول لهذه الشركة'
      });
    }

    // If no companyId in params, use user's company
    if (!companyId) {
      req.params.companyId = userCompanyId;
    }

    next();
  } catch (error) {
    console.error('❌ خطأ في التحقق من صلاحية الوصول للشركة:', error);
    return res.status(500).json({
      success: false,
      message: 'خطأ في التحقق من صلاحية الوصول'
    });
  }
};

/**
 * Middleware للتحقق من أن المستخدم يصل لبياناته فقط
 */
const requireOwnDataAccess = (req, res, next) => {
  try {
    const userCompanyId = req.user?.companyId;
    
    if (!userCompanyId) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح بالوصول'
      });
    }

    // إضافة companyId filter تلقائياً لجميع الاستعلامات
    req.companyFilter = { companyId: userCompanyId };
    
    next();
  } catch (error) {
    console.error('❌ خطأ في middleware الوصول للبيانات:', error);
    return res.status(500).json({
      success: false,
      message: 'خطأ في التحقق من صلاحية الوصول'
    });
  }
};

module.exports = {
  enforceDataIsolation,
  addCompanyFilter,
  verifyResourceOwnership,
  logDataAccess,
  protectCompanyData,
  requireCompanyAccess,
  requireOwnDataAccess
};
