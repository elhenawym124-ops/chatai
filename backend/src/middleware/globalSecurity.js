/**
 * Global Security Middleware
 * نظام حماية شامل لجميع routes في التطبيق
 */

const jwt = require('jsonwebtoken');

/**
 * قائمة Routes العامة التي لا تحتاج مصادقة
 */
const PUBLIC_ROUTES = [
  // Authentication routes
  'POST /api/v1/auth/register',
  'POST /api/v1/auth/login',
  'GET /api/v1/auth/verify-email',
  
  // Health and system routes
  'GET /health',
  'GET /',
  'OPTIONS *',
  
  // Webhook routes (تحتاج مصادقة خاصة)
  'GET /webhook',
  'POST /webhook',
  
  // Public invitation routes
  'GET /api/v1/invitations/verify/*',
  'POST /api/v1/invitations/accept/*',
  
  // Development routes (في بيئة التطوير فقط)
  'POST /api/v1/dev/create-test-user'
];

/**
 * قائمة Routes الإدارية التي تحتاج صلاحيات خاصة
 */
const ADMIN_ROUTES = [
  'GET /api/v1/admin/*',
  'POST /api/v1/admin/*',
  'PUT /api/v1/admin/*',
  'DELETE /api/v1/admin/*'
];

/**
 * قائمة Routes التي تحتاج عزل شركات
 */
const COMPANY_ISOLATED_ROUTES = [
  '/api/v1/products/*',
  '/api/v1/customers/*',
  '/api/v1/conversations/*',
  '/api/v1/orders/*',
  '/api/v1/companies/*',
  '/api/v1/users/*',
  '/api/v1/ai/*',
  '/api/v1/integrations/*',
  '/api/v1/settings/*'
];

/**
 * فحص ما إذا كان route عام
 */
function isPublicRoute(method, path) {
  return PUBLIC_ROUTES.some(route => {
    const [routeMethod, routePath] = route.split(' ');
    
    if (routeMethod === '*' || routeMethod === method) {
      if (routePath === '*') return true;
      if (routePath.endsWith('*')) {
        return path.startsWith(routePath.slice(0, -1));
      }
      return routePath === path;
    }
    
    return false;
  });
}

/**
 * فحص ما إذا كان route إداري
 */
function isAdminRoute(method, path) {
  return ADMIN_ROUTES.some(route => {
    const [routeMethod, routePath] = route.split(' ');
    
    if (routeMethod === '*' || routeMethod === method) {
      if (routePath.endsWith('*')) {
        return path.startsWith(routePath.slice(0, -1));
      }
      return routePath === path;
    }
    
    return false;
  });
}

/**
 * فحص ما إذا كان route يحتاج عزل شركات
 */
function needsCompanyIsolation(path) {
  return COMPANY_ISOLATED_ROUTES.some(route => {
    if (route.endsWith('*')) {
      return path.startsWith(route.slice(0, -1));
    }
    return route === path;
  });
}

/**
 * Middleware المصادقة العامة
 */
const globalAuthentication = async (req, res, next) => {
  try {
    const method = req.method;
    const path = req.path;

    // تسجيل الوصول
    console.log(`🔍 [GLOBAL-AUTH] ${method} ${path}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent')?.substring(0, 50)
    });

    // السماح للـ routes العامة
    if (isPublicRoute(method, path)) {
      console.log(`✅ [GLOBAL-AUTH] Public route allowed: ${method} ${path}`);
      return next();
    }

    // التحقق من وجود token
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      console.log(`❌ [GLOBAL-AUTH] No token provided for: ${method} ${path}`);
      return res.status(401).json({
        success: false,
        message: 'مطلوب تسجيل الدخول للوصول لهذا المورد',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    // التحقق من صحة token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    } catch (error) {
      console.log(`❌ [GLOBAL-AUTH] Invalid token for: ${method} ${path}`, error.message);
      return res.status(401).json({
        success: false,
        message: 'رمز المصادقة غير صحيح',
        code: 'INVALID_TOKEN'
      });
    }

    // إضافة معلومات المستخدم للطلب
    req.user = decoded;

    // التحقق من صلاحيات الإدارة
    if (isAdminRoute(method, path)) {
      if (decoded.role !== 'SUPER_ADMIN') {
        console.log(`❌ [GLOBAL-AUTH] Admin access denied for user: ${decoded.id}`);
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية إدارية للوصول لهذا المورد',
          code: 'ADMIN_ACCESS_REQUIRED'
        });
      }
    }

    console.log(`✅ [GLOBAL-AUTH] Authenticated: ${decoded.email} (${decoded.role})`);
    next();

  } catch (error) {
    console.error('❌ [GLOBAL-AUTH] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'خطأ في التحقق من المصادقة',
      code: 'AUTHENTICATION_ERROR'
    });
  }
};

/**
 * Middleware عزل الشركات العام
 */
const globalCompanyIsolation = async (req, res, next) => {
  try {
    const path = req.path;

    // تطبيق عزل الشركات فقط على routes المحددة
    if (!needsCompanyIsolation(path)) {
      return next();
    }

    // التأكد من وجود معلومات المستخدم
    if (!req.user || !req.user.companyId) {
      console.log(`❌ [COMPANY-ISOLATION] No company info for: ${req.method} ${path}`);
      return res.status(403).json({
        success: false,
        message: 'معرف الشركة مطلوب للوصول لهذا المورد',
        code: 'COMPANY_ID_REQUIRED'
      });
    }

    // إضافة companyId للطلب
    req.companyId = req.user.companyId;

    // التحقق من محاولة الوصول لشركة أخرى
    const requestedCompanyId = req.params.companyId || req.body.companyId || req.query.companyId;
    
    if (requestedCompanyId && req.user.role !== 'SUPER_ADMIN') {
      if (requestedCompanyId !== req.user.companyId) {
        console.log(`🚨 [COMPANY-ISOLATION] Unauthorized company access:`, {
          userId: req.user.id,
          userCompanyId: req.user.companyId,
          requestedCompanyId,
          path: req.path,
          method: req.method
        });
        
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية للوصول لبيانات هذه الشركة',
          code: 'COMPANY_ACCESS_DENIED'
        });
      }
    }

    console.log(`✅ [COMPANY-ISOLATION] Company access granted: ${req.user.companyId}`);
    next();

  } catch (error) {
    console.error('❌ [COMPANY-ISOLATION] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'خطأ في التحقق من صلاحية الوصول للشركة',
      code: 'COMPANY_ISOLATION_ERROR'
    });
  }
};

/**
 * Middleware الأمان الشامل
 */
const globalSecurity = [
  globalAuthentication,
  globalCompanyIsolation
];

module.exports = {
  globalSecurity,
  globalAuthentication,
  globalCompanyIsolation,
  isPublicRoute,
  isAdminRoute,
  needsCompanyIsolation
};
