/**
 * خدمة التحقق الشاملة من صحة البيانات والإعدادات
 * 
 * تضمن أن جميع الطلبات تحتوي على:
 * - companyId صحيح
 * - إعدادات AI مطلوبة
 * - بيانات صحيحة ومعزولة
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ValidationService {
  constructor() {
    this.cache = new Map(); // cache للشركات المتحققة
    this.cacheTimeout = 5 * 60 * 1000; // 5 دقائق
  }

  /**
   * التحقق الشامل من صحة الشركة وإعداداتها
   */
  async validateCompanySetup(companyId, options = {}) {
    try {
      if (!companyId) {
        return {
          isValid: false,
          error: 'MISSING_COMPANY_ID',
          message: 'معرف الشركة مطلوب',
          critical: true
        };
      }

      // فحص cache أولاً
      const cacheKey = `company_${companyId}`;
      const cached = this.cache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
        return cached.result;
      }

      console.log(`🔍 [VALIDATION] فحص إعدادات الشركة: ${companyId}`);

      // فحص وجود الشركة
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        include: {
          aiSettings: true,
          warehouses: true,
          geminiKeys: {
            where: { isActive: true }
          }
        }
      });

      if (!company) {
        const result = {
          isValid: false,
          error: 'COMPANY_NOT_FOUND',
          message: `الشركة غير موجودة: ${companyId}`,
          critical: true
        };
        this.cache.set(cacheKey, { result, timestamp: Date.now() });
        return result;
      }

      // فحص حالة الشركة
      if (!company.isActive) {
        return {
          isValid: false,
          error: 'COMPANY_INACTIVE',
          message: `الشركة غير نشطة: ${company.name}`,
          critical: true
        };
      }

      // فحص الإعدادات المطلوبة
      const validationResults = await this.validateRequiredSettings(company, options);

      // حفظ في cache
      this.cache.set(cacheKey, { result: validationResults, timestamp: Date.now() });

      return validationResults;

    } catch (error) {
      console.error(`❌ [VALIDATION] خطأ في فحص الشركة ${companyId}:`, error);
      return {
        isValid: false,
        error: 'VALIDATION_ERROR',
        message: `خطأ في التحقق: ${error.message}`,
        critical: true
      };
    }
  }

  /**
   * فحص الإعدادات المطلوبة للشركة
   */
  async validateRequiredSettings(company, options = {}) {
    const issues = [];
    const warnings = [];

    // 1. فحص إعدادات AI
    if (!company.aiSettings) {
      issues.push({
        type: 'MISSING_AI_SETTINGS',
        message: 'إعدادات AI غير موجودة',
        severity: 'HIGH',
        fixable: true
      });
    } else {
      // فحص prompts - الآن مطلوبة وليست اختيارية
      if (!company.aiSettings.personalityPrompt ||
          company.aiSettings.personalityPrompt.trim() === '' ||
          company.aiSettings.personalityPrompt.includes('# يجب إعداد شخصية المساعد الذكي')) {
        issues.push({
          type: 'MISSING_PERSONALITY_PROMPT',
          message: 'يجب إعداد شخصية المساعد الذكي من لوحة التحكم',
          severity: 'HIGH',
          fixable: false
        });
      }

      if (!company.aiSettings.responsePrompt ||
          company.aiSettings.responsePrompt.trim() === '' ||
          company.aiSettings.responsePrompt.includes('# قواعد الاستجابة')) {
        issues.push({
          type: 'MISSING_RESPONSE_PROMPT',
          message: 'يجب إعداد قواعد الاستجابة من لوحة التحكم',
          severity: 'HIGH',
          fixable: false
        });
      }
    }

    // 2. فحص المستودعات
    if (!company.warehouses || company.warehouses.length === 0) {
      warnings.push({
        type: 'MISSING_WAREHOUSES',
        message: 'لا توجد مستودعات',
        severity: 'LOW',
        fixable: true
      });
    }

    // 3. فحص مفاتيح Gemini (إذا كان مطلوب)
    if (options.requireGeminiKeys && (!company.geminiKeys || company.geminiKeys.length === 0)) {
      warnings.push({
        type: 'MISSING_GEMINI_KEYS',
        message: 'لا توجد مفاتيح Gemini نشطة',
        severity: 'MEDIUM',
        fixable: false
      });
    }

    // 4. فحص العملة
    const validCurrencies = ['EGP', 'USD', 'EUR', 'SAR'];
    if (!validCurrencies.includes(company.currency)) {
      warnings.push({
        type: 'INVALID_CURRENCY',
        message: `عملة غير صحيحة: ${company.currency}`,
        severity: 'LOW',
        fixable: true
      });
    }

    const isValid = issues.length === 0;
    const hasWarnings = warnings.length > 0;

    return {
      isValid,
      hasWarnings,
      company: {
        id: company.id,
        name: company.name,
        currency: company.currency,
        plan: company.plan
      },
      issues,
      warnings,
      critical: issues.some(i => i.severity === 'HIGH'),
      fixable: [...issues, ...warnings].every(i => i.fixable)
    };
  }

  /**
   * إصلاح تلقائي للمشاكل القابلة للإصلاح
   */
  async autoFixIssues(companyId, validationResult) {
    try {
      if (!validationResult.fixable) {
        return {
          success: false,
          message: 'المشاكل غير قابلة للإصلاح التلقائي'
        };
      }

      console.log(`🔧 [AUTO-FIX] إصلاح تلقائي للشركة: ${companyId}`);

      const fixes = [];

      // لا يمكن إصلاح prompts تلقائياً - يجب على الشركة كتابتها
      const promptIssues = [...validationResult.issues, ...validationResult.warnings]
        .filter(i => i.type.includes('PROMPT'));

      if (promptIssues.length > 0) {
        return {
          success: false,
          message: 'يجب على الشركة إعداد الـ prompts من لوحة التحكم - لا يمكن الإصلاح التلقائي'
        };
      }

      // إصلاح المستودعات المفقودة
      const warehouseIssues = [...validationResult.issues, ...validationResult.warnings]
        .filter(i => i.type === 'MISSING_WAREHOUSES');

      if (warehouseIssues.length > 0) {
        await prisma.warehouse.create({
          data: {
            name: 'المستودع الرئيسي',
            location: 'المقر الرئيسي',
            type: 'main',
            isActive: true,
            companyId: companyId
          }
        });
        fixes.push('تم إنشاء مستودع افتراضي');
      }

      // مسح cache للشركة
      this.cache.delete(`company_${companyId}`);

      return {
        success: true,
        fixes,
        message: `تم إصلاح ${fixes.length} مشكلة`
      };

    } catch (error) {
      console.error(`❌ [AUTO-FIX] خطأ في الإصلاح التلقائي:`, error);
      return {
        success: false,
        message: `خطأ في الإصلاح: ${error.message}`
      };
    }
  }

  /**
   * التحقق من صحة طلب API
   */
  async validateAPIRequest(req, options = {}) {
    try {
      // استخراج companyId من مصادر مختلفة
      const companyId = this.extractCompanyId(req);

      if (!companyId) {
        return {
          isValid: false,
          error: 'MISSING_COMPANY_ID',
          message: 'معرف الشركة مطلوب في الطلب',
          statusCode: 400
        };
      }

      // التحقق من إعدادات الشركة
      const validation = await this.validateCompanySetup(companyId, options);

      if (!validation.isValid) {
        return {
          isValid: false,
          error: validation.error,
          message: validation.message,
          statusCode: validation.critical ? 403 : 400,
          companyId
        };
      }

      // إصلاح تلقائي إذا كان مطلوب ومتاح
      if (validation.hasWarnings && validation.fixable && options.autoFix) {
        const fixResult = await this.autoFixIssues(companyId, validation);
        if (fixResult.success) {
          console.log(`🔧 [AUTO-FIX] ${fixResult.message} للشركة ${companyId}`);
        }
      }

      return {
        isValid: true,
        companyId,
        company: validation.company,
        warnings: validation.warnings
      };

    } catch (error) {
      console.error('❌ [VALIDATION] خطأ في التحقق من الطلب:', error);
      return {
        isValid: false,
        error: 'VALIDATION_ERROR',
        message: 'خطأ في التحقق من صحة الطلب',
        statusCode: 500
      };
    }
  }

  /**
   * استخراج companyId من الطلب
   */
  extractCompanyId(req) {
    // من المستخدم المصادق عليه
    if (req.user && req.user.companyId) {
      return req.user.companyId;
    }

    // من parameters
    if (req.params && req.params.companyId) {
      return req.params.companyId;
    }

    // من body
    if (req.body && req.body.companyId) {
      return req.body.companyId;
    }

    // من headers
    if (req.headers && req.headers['x-company-id']) {
      return req.headers['x-company-id'];
    }

    return null;
  }

  /**
   * مسح cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🧹 [VALIDATION] تم مسح cache التحقق');
  }

  /**
   * إحصائيات cache
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      timeout: this.cacheTimeout
    };
  }
}

/**
 * Middleware للتحقق من صحة الطلبات
 */
function createValidationMiddleware(options = {}) {
  const validationService = new ValidationService();

  return async (req, res, next) => {
    try {
      console.log(`🔍 [VALIDATION-MW] فحص طلب: ${req.method} ${req.path}`);

      const validation = await validationService.validateAPIRequest(req, options);

      if (!validation.isValid) {
        console.log(`❌ [VALIDATION-MW] طلب مرفوض: ${validation.message}`);

        return res.status(validation.statusCode || 400).json({
          success: false,
          error: validation.error,
          message: validation.message,
          companyId: validation.companyId
        });
      }

      // إضافة بيانات الشركة للطلب
      req.companyId = validation.companyId;
      req.company = validation.company;

      if (validation.warnings && validation.warnings.length > 0) {
        console.log(`⚠️ [VALIDATION-MW] تحذيرات للشركة ${validation.companyId}:`,
          validation.warnings.map(w => w.message));
      }

      next();

    } catch (error) {
      console.error('❌ [VALIDATION-MW] خطأ في middleware:', error);
      res.status(500).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'خطأ في التحقق من صحة الطلب'
      });
    }
  };
}

module.exports = { ValidationService, createValidationMiddleware };
