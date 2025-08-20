/**
 * خيارات Rate Limiting المختلفة
 * يمكن تعديل هذه الإعدادات حسب احتياجات المشروع
 */

const rateLimit = require('express-rate-limit');

// ========================================
// 1. الإعدادات الحالية (مشددة للأمان)
// ========================================
const currentAuthLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5, // 5 محاولات فقط
  message: {
    success: false,
    message: 'تم تجاوز الحد المسموح لمحاولات تسجيل الدخول. حاول مرة أخرى بعد 15 دقيقة',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// ========================================
// 2. إعدادات متوسطة (للتطوير)
// ========================================
const developmentAuthLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 دقائق
  max: 10, // 10 محاولات
  message: {
    success: false,
    message: 'تم تجاوز الحد المسموح. حاول مرة أخرى بعد 5 دقائق',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// ========================================
// 3. إعدادات مرنة (للاختبار)
// ========================================
const testingAuthLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // دقيقة واحدة
  max: 20, // 20 محاولة
  message: {
    success: false,
    message: 'تم تجاوز الحد المسموح. حاول مرة أخرى بعد دقيقة',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// ========================================
// 4. إعدادات الإنتاج (موصى بها)
// ========================================
const productionAuthLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 3, // 3 محاولات فقط (أكثر أماناً)
  message: {
    success: false,
    message: 'تم تجاوز الحد المسموح لمحاولات تسجيل الدخول. حاول مرة أخرى بعد 15 دقيقة',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // إضافة تسجيل للمحاولات المشبوهة
  handler: (req, res) => {
    console.log(`🚨 [RATE-LIMIT] ${req.ip} exceeded auth limit`);
    res.status(429).json({
      success: false,
      message: 'تم تجاوز الحد المسموح لمحاولات تسجيل الدخول. حاول مرة أخرى بعد 15 دقيقة',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

// ========================================
// 5. إعدادات متقدمة (مع IP Whitelist)
// ========================================
const advancedAuthLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req) => {
    // IPs موثوقة (مثل مكاتب الشركة)
    const trustedIPs = ['192.168.1.100', '10.0.0.50'];
    if (trustedIPs.includes(req.ip)) {
      return 50; // حد أعلى للـ IPs الموثوقة
    }
    return 5; // الحد العادي
  },
  message: {
    success: false,
    message: 'تم تجاوز الحد المسموح لمحاولات تسجيل الدخول. حاول مرة أخرى بعد 15 دقيقة',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// ========================================
// 6. إعدادات ديناميكية (حسب البيئة)
// ========================================
const createDynamicAuthLimit = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isDevelopment) {
    return {
      windowMs: 2 * 60 * 1000, // دقيقتان
      max: 15, // 15 محاولة
      message: 'Rate limit (Development): حاول بعد دقيقتين'
    };
  } else if (isProduction) {
    return {
      windowMs: 30 * 60 * 1000, // 30 دقيقة
      max: 3, // 3 محاولات فقط
      message: 'تم تجاوز الحد المسموح. حاول مرة أخرى بعد 30 دقيقة'
    };
  } else {
    return {
      windowMs: 15 * 60 * 1000, // 15 دقيقة
      max: 5, // 5 محاولات
      message: 'تم تجاوز الحد المسموح. حاول مرة أخرى بعد 15 دقيقة'
    };
  }
};

// ========================================
// 7. إعدادات مختلفة لـ endpoints مختلفة
// ========================================
const rateLimitConfigs = {
  // تسجيل الدخول - مشدد
  login: {
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'تم تجاوز محاولات تسجيل الدخول'
  },
  
  // التسجيل - أقل تشدداً
  register: {
    windowMs: 60 * 60 * 1000, // ساعة
    max: 3, // 3 حسابات جديدة فقط في الساعة
    message: 'تم تجاوز محاولات إنشاء الحسابات'
  },
  
  // إعادة تعيين كلمة المرور - متوسط
  resetPassword: {
    windowMs: 60 * 60 * 1000, // ساعة
    max: 5, // 5 محاولات في الساعة
    message: 'تم تجاوز محاولات إعادة تعيين كلمة المرور'
  },
  
  // APIs العامة - مرن
  general: {
    windowMs: 15 * 60 * 1000,
    max: 100, // 100 طلب في 15 دقيقة
    message: 'تم تجاوز الحد المسموح للطلبات'
  }
};

// ========================================
// مثال على الاستخدام
// ========================================
console.log('🔧 خيارات Rate Limiting المتاحة:');
console.log('1. الحالي (مشدد): 5 محاولات / 15 دقيقة');
console.log('2. التطوير (متوسط): 10 محاولات / 5 دقائق');
console.log('3. الاختبار (مرن): 20 محاولة / دقيقة');
console.log('4. الإنتاج (آمن): 3 محاولات / 15 دقيقة');
console.log('5. متقدم (مع IP Whitelist)');
console.log('6. ديناميكي (حسب البيئة)');

module.exports = {
  currentAuthLimit,
  developmentAuthLimit,
  testingAuthLimit,
  productionAuthLimit,
  advancedAuthLimit,
  createDynamicAuthLimit,
  rateLimitConfigs
};
