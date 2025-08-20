// Company Isolation Security Middleware
// تم إنشاؤه تلقائياً لضمان العزل الآمن

const companyIsolationMiddleware = (req, res, next) => {
  // التأكد من وجود المستخدم والشركة
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }
  
  if (!req.user.companyId) {
    return res.status(403).json({ 
      error: 'User must be associated with a company',
      code: 'COMPANY_REQUIRED'
    });
  }
  
  // إضافة companyId إلى جميع query parameters
  req.companyId = req.user.companyId;
  
  // تسجيل محاولة الوصول للمراقبة
  console.log(`[SECURITY] Company access: ${req.user.companyId} - ${req.method} ${req.path}`);
  
  next();
};

// Middleware للتحقق من عزل البيانات في الاستعلامات
const ensureCompanyIsolation = (tableName) => {
  return (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      // التحقق من أن البيانات المُرجعة تحتوي على companyId صحيح
      if (data && Array.isArray(data)) {
        const invalidData = data.filter(item => 
          item.companyId && item.companyId !== req.user.companyId
        );
        
        if (invalidData.length > 0) {
          console.error(`[SECURITY BREACH] Data leak detected in ${tableName}:`, invalidData);
          return originalJson.call(this, { 
            error: 'Security violation detected',
            code: 'DATA_ISOLATION_BREACH'
          });
        }
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

module.exports = {
  companyIsolationMiddleware,
  ensureCompanyIsolation
};