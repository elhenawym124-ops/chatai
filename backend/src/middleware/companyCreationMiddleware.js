/**
 * Middleware لإنشاء الشركات مع إعدادات مخصصة تلقائية
 * 
 * يضمن أن كل شركة جديدة تحصل على:
 * - إعدادات AI مخصصة
 * - Prompts مخصصة
 * - مفاتيح Gemini (إذا كانت متوفرة)
 * - إعدادات افتراضية آمنة
 */

// تم إزالة DynamicPromptService - الشركات تكتب prompts بنفسها
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CompanyCreationMiddleware {
  constructor() {
    // لا نحتاج promptService - الشركات تكتب prompts بنفسها
  }

  /**
   * إنشاء شركة جديدة مع جميع الإعدادات المطلوبة
   */
  async createCompanyWithDefaults(companyData) {
    const transaction = await prisma.$transaction(async (tx) => {
      try {
        console.log(`🏢 إنشاء شركة جديدة: ${companyData.name}`);

        // 1. إنشاء الشركة
        const company = await tx.company.create({
          data: {
            ...companyData,
            currency: companyData.currency || 'EGP',
            plan: companyData.plan || 'BASIC',
            isActive: true
          }
        });

        console.log(`✅ تم إنشاء الشركة: ${company.name} (${company.id})`);

        // 2. إنشاء إعدادات AI مخصصة
        const aiResult = await this.createAISettings(tx, company);
        if (!aiResult.success) {
          throw new Error(`فشل في إنشاء إعدادات AI: ${aiResult.error}`);
        }

        // 3. إنشاء warehouse افتراضي
        const warehouse = await this.createDefaultWarehouse(tx, company);

        // 4. إنشاء مستخدم admin للشركة (إذا تم تمرير بيانات المستخدم)
        let adminUser = null;
        if (companyData.adminUser) {
          adminUser = await this.createAdminUser(tx, company, companyData.adminUser);
        }

        console.log(`🎉 تم إنشاء الشركة بنجاح مع جميع الإعدادات المطلوبة`);

        return {
          success: true,
          company,
          aiSettings: aiResult.aiSettings,
          warehouse,
          adminUser,
          requiresAISetup: aiResult.requiresSetup,
          setupMessage: aiResult.message
        };

      } catch (error) {
        console.error(`❌ خطأ في إنشاء الشركة:`, error);
        throw error;
      }
    });

    return transaction;
  }

  /**
   * إنشاء إعدادات AI أساسية للشركة (بدون prompts)
   */
  async createAISettings(tx, company) {
    try {
      console.log(`🤖 إنشاء إعدادات AI أساسية للشركة: ${company.name}`);

      // إنشاء إعدادات AI بدون prompts (الشركة ستكتبها بنفسها)
      const aiSettings = await tx.aiSettings.create({
        data: {
          companyId: company.id,
          personalityPrompt: `# يجب إعداد شخصية المساعد الذكي

يرجى كتابة شخصية المساعد الذكي الخاص بشركة ${company.name} هنا.

مثال:
أنت [اسم المساعد]، مساعدة مبيعات متخصصة في ${company.name}.

أسلوبك:
- ودود ومهني
- متخصص في [نوع المنتجات]
- يستخدم اللغة العربية الواضحة

مهامك:
- مساعدة العملاء في اختيار المنتجات
- تقديم معلومات دقيقة عن الأسعار
- الإجابة على الاستفسارات بطريقة مفيدة`,

          responsePrompt: `# قواعد الاستجابة

يرجى كتابة قواعد الاستجابة الخاصة بشركة ${company.name} هنا.

مثال:
1. استخدم فقط المعلومات الموجودة في قاعدة البيانات
2. لا تذكر منتجات غير متوفرة
3. اذكر الأسعار بعملة ${company.currency || 'جنيه'}
4. كن مفيداً وودوداً في جميع الردود`,

          autoReplyEnabled: true,
          confidenceThreshold: 0.7,
          maxRepliesPerCustomer: 10,
          multimodalEnabled: true,
          ragEnabled: true,
          workingHoursEnabled: false,
          autoCreateOrders: false,
          autoSuggestProducts: true,
          includeImages: true,
          maxSuggestions: 3,
          useAdvancedTools: false,
          qualityEvaluationEnabled: true
        }
      });

      console.log(`✅ تم إنشاء إعدادات AI أساسية - يجب على الشركة إعداد الـ prompts`);

      return {
        success: true,
        aiSettings,
        requiresSetup: true,
        message: 'يجب على الشركة إعداد شخصية المساعد الذكي من لوحة التحكم'
      };

    } catch (error) {
      console.error(`❌ خطأ في إنشاء إعدادات AI:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * إنشاء warehouse افتراضي للشركة
   */
  async createDefaultWarehouse(tx, company) {
    try {
      console.log(`📦 إنشاء مستودع افتراضي للشركة: ${company.name}`);

      const warehouse = await tx.warehouse.create({
        data: {
          name: 'المستودع الرئيسي',
          location: 'المقر الرئيسي',
          type: 'main',
          isActive: true,
          companyId: company.id
        }
      });

      console.log(`✅ تم إنشاء المستودع الافتراضي`);
      return warehouse;

    } catch (error) {
      console.error(`❌ خطأ في إنشاء المستودع:`, error);
      throw error;
    }
  }

  /**
   * إنشاء مستخدم admin للشركة
   */
  async createAdminUser(tx, company, userData) {
    try {
      console.log(`👤 إنشاء مستخدم admin للشركة: ${company.name}`);

      const adminUser = await tx.user.create({
        data: {
          email: userData.email,
          password: userData.password, // يجب أن يكون مُشفر مسبقاً
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: 'COMPANY_ADMIN',
          isActive: true,
          isEmailVerified: userData.isEmailVerified || false,
          companyId: company.id
        }
      });

      console.log(`✅ تم إنشاء مستخدم admin: ${adminUser.email}`);
      return adminUser;

    } catch (error) {
      console.error(`❌ خطأ في إنشاء مستخدم admin:`, error);
      throw error;
    }
  }

  /**
   * التحقق من صحة بيانات الشركة قبل الإنشاء
   */
  validateCompanyData(companyData) {
    const errors = [];

    // التحقق من الحقول المطلوبة
    if (!companyData.name || companyData.name.trim() === '') {
      errors.push('اسم الشركة مطلوب');
    }

    if (!companyData.email || !this.isValidEmail(companyData.email)) {
      errors.push('بريد إلكتروني صحيح مطلوب');
    }

    // التحقق من العملة
    const validCurrencies = ['EGP', 'USD', 'EUR', 'SAR'];
    if (companyData.currency && !validCurrencies.includes(companyData.currency)) {
      errors.push('عملة غير صحيحة');
    }

    // التحقق من خطة الاشتراك
    const validPlans = ['BASIC', 'PRO', 'ENTERPRISE'];
    if (companyData.plan && !validPlans.includes(companyData.plan)) {
      errors.push('خطة اشتراك غير صحيحة');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * التحقق من صحة البريد الإلكتروني
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * إنشاء إعدادات للشركات الموجودة التي تفتقر للإعدادات
   */
  async fixExistingCompanies() {
    try {
      console.log('🔧 فحص الشركات الموجودة وإصلاح الإعدادات المفقودة...');

      // البحث عن الشركات بدون إعدادات AI
      const companiesWithoutAI = await prisma.company.findMany({
        where: {
          aiSettings: null
        }
      });

      // البحث عن الشركات بدون مستودعات
      const companiesWithoutWarehouses = await prisma.company.findMany({
        where: {
          warehouses: {
            none: {}
          }
        }
      });

      console.log(`📊 الشركات التي تحتاج إصلاح:`);
      console.log(`   - بدون إعدادات AI: ${companiesWithoutAI.length}`);
      console.log(`   - بدون مستودعات: ${companiesWithoutWarehouses.length}`);

      // إصلاح إعدادات AI
      for (const company of companiesWithoutAI) {
        console.log(`🤖 إضافة إعدادات AI للشركة: ${company.name}`);
        await this.promptService.createCompanyAISettings(company.id, company);
      }

      // إصلاح المستودعات
      for (const company of companiesWithoutWarehouses) {
        console.log(`📦 إضافة مستودع للشركة: ${company.name}`);
        await prisma.warehouse.create({
          data: {
            name: 'المستودع الرئيسي',
            location: 'المقر الرئيسي',
            type: 'main',
            isActive: true,
            companyId: company.id
          }
        });
      }

      console.log('✅ تم إصلاح جميع الشركات الموجودة');

      return {
        success: true,
        fixedAI: companiesWithoutAI.length,
        fixedWarehouses: companiesWithoutWarehouses.length
      };

    } catch (error) {
      console.error('❌ خطأ في إصلاح الشركات الموجودة:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = CompanyCreationMiddleware;
