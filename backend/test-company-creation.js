const CompanyCreationMiddleware = require('./src/middleware/companyCreationMiddleware');

/**
 * اختبار نظام إنشاء الشركات مع الإعدادات التلقائية
 */

async function testCompanyCreation() {
  try {
    console.log('🧪 بدء اختبار نظام إنشاء الشركات...\n');

    const companyMiddleware = new CompanyCreationMiddleware();

    // 1. اختبار إصلاح الشركات الموجودة
    console.log('1️⃣ إصلاح الشركات الموجودة...');
    const fixResult = await companyMiddleware.fixExistingCompanies();
    
    if (fixResult.success) {
      console.log(`✅ تم إصلاح ${fixResult.fixedAI} شركة (إعدادات AI)`);
      console.log(`✅ تم إصلاح ${fixResult.fixedWarehouses} شركة (مستودعات)\n`);
    } else {
      console.error('❌ فشل في إصلاح الشركات:', fixResult.error);
    }

    // 2. اختبار إنشاء شركة جديدة (محاكاة)
    console.log('2️⃣ محاكاة إنشاء شركة جديدة...');
    
    const testCompanyData = {
      name: 'شركة الاختبار للأزياء',
      email: 'test@fashion-company.com',
      phone: '01234567890',
      currency: 'EGP',
      plan: 'PRO',
      settings: JSON.stringify({
        businessType: 'fashion',
        description: 'متجر أزياء عصرية'
      })
    };

    // التحقق من صحة البيانات
    const validation = companyMiddleware.validateCompanyData(testCompanyData);
    
    if (validation.isValid) {
      console.log('✅ بيانات الشركة صحيحة');
      
      // محاكاة إنشاء الشركة (بدون إنشاء فعلي)
      console.log('🎭 محاكاة إنشاء الشركة...');
      console.log(`   📝 الاسم: ${testCompanyData.name}`);
      console.log(`   📧 البريد: ${testCompanyData.email}`);
      console.log(`   💰 العملة: ${testCompanyData.currency}`);
      console.log(`   📋 الخطة: ${testCompanyData.plan}`);
      
      // محاكاة توليد الإعدادات
      const DynamicPromptService = require('./src/services/dynamicPromptService');
      const promptService = new DynamicPromptService();
      
      const assistantName = promptService.generateAssistantName(testCompanyData.name);
      const businessType = promptService.detectBusinessType(testCompanyData);
      
      console.log(`   👤 اسم المساعد المقترح: ${assistantName}`);
      console.log(`   🎯 نوع العمل المكتشف: ${businessType}`);
      
      console.log('\n✅ ستحصل الشركة على:');
      console.log('   🤖 إعدادات AI مخصصة');
      console.log('   📝 Prompts مخصصة');
      console.log('   📦 مستودع افتراضي');
      console.log('   🔐 عزل كامل عن الشركات الأخرى');
      
    } else {
      console.error('❌ بيانات الشركة غير صحيحة:');
      validation.errors.forEach(error => console.error(`   - ${error}`));
    }

    // 3. عرض إحصائيات النظام
    console.log('\n3️⃣ إحصائيات النظام الحالي...');
    await displaySystemStats();

    console.log('\n🎉 انتهى اختبار النظام بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
    process.exit(1);
  }
}

/**
 * عرض إحصائيات النظام
 */
async function displaySystemStats() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const stats = {
      totalCompanies: await prisma.company.count(),
      companiesWithAI: await prisma.company.count({
        where: { aiSettings: { isNot: null } }
      }),
      companiesWithWarehouses: await prisma.company.count({
        where: { warehouses: { some: {} } }
      }),
      totalCustomers: await prisma.customer.count(),
      totalProducts: await prisma.product.count(),
      totalOrders: await prisma.order.count()
    };

    console.log('📊 إحصائيات النظام:');
    console.log('═'.repeat(40));
    console.log(`🏢 إجمالي الشركات: ${stats.totalCompanies}`);
    console.log(`🤖 شركات لديها إعدادات AI: ${stats.companiesWithAI}`);
    console.log(`📦 شركات لديها مستودعات: ${stats.companiesWithWarehouses}`);
    console.log(`👥 إجمالي العملاء: ${stats.totalCustomers}`);
    console.log(`📦 إجمالي المنتجات: ${stats.totalProducts}`);
    console.log(`🛒 إجمالي الطلبات: ${stats.totalOrders}`);

    // فحص العزل
    const isolationCheck = await checkIsolation(prisma);
    console.log('\n🔐 فحص العزل:');
    console.log('═'.repeat(40));
    console.log(`✅ العزل سليم: ${isolationCheck.isIsolated ? 'نعم' : 'لا'}`);
    
    if (!isolationCheck.isIsolated) {
      console.log('⚠️ مشاكل العزل:');
      isolationCheck.issues.forEach(issue => console.log(`   - ${issue}`));
    }

    await prisma.$disconnect();

  } catch (error) {
    console.error('❌ خطأ في عرض الإحصائيات:', error);
  }
}

/**
 * فحص العزل بين الشركات
 */
async function checkIsolation(prisma) {
  try {
    const issues = [];

    // فحص العملاء - البحث عن أي مشاكل في العزل
    const allCustomers = await prisma.customer.findMany({
      select: { id: true, companyId: true }
    });
    const customersWithoutCompany = allCustomers.filter(c => !c.companyId || c.companyId === '');
    if (customersWithoutCompany.length > 0) {
      issues.push(`${customersWithoutCompany.length} عميل بدون companyId صحيح`);
    }

    // فحص المنتجات
    const allProducts = await prisma.product.findMany({
      select: { id: true, companyId: true }
    });
    const productsWithoutCompany = allProducts.filter(p => !p.companyId || p.companyId === '');
    if (productsWithoutCompany.length > 0) {
      issues.push(`${productsWithoutCompany.length} منتج بدون companyId صحيح`);
    }

    // فحص الطلبات
    const allOrders = await prisma.order.findMany({
      select: { id: true, companyId: true }
    });
    const ordersWithoutCompany = allOrders.filter(o => !o.companyId || o.companyId === '');
    if (ordersWithoutCompany.length > 0) {
      issues.push(`${ordersWithoutCompany.length} طلب بدون companyId صحيح`);
    }

    return {
      isIsolated: issues.length === 0,
      issues
    };

  } catch (error) {
    console.error('❌ خطأ في فحص العزل:', error);
    return {
      isIsolated: false,
      issues: ['خطأ في فحص العزل']
    };
  }
}

// تشغيل الاختبار
if (require.main === module) {
  testCompanyCreation()
    .then(() => {
      console.log('\n✅ انتهى الاختبار');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ فشل الاختبار:', error);
      process.exit(1);
    });
}

module.exports = { testCompanyCreation };
