#!/usr/bin/env node

/**
 * اختبار سريع لاتصال قاعدة البيانات ونظام التعلم المستمر
 */

const { PrismaClient } = require('@prisma/client');
const ContinuousLearningServiceV2 = require('./backend/src/services/continuousLearningServiceV2');

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  console.log('🔍 اختبار اتصال قاعدة البيانات...\n');

  try {
    // اختبار الاتصال الأساسي
    console.log('1️⃣ اختبار الاتصال الأساسي...');
    await prisma.$connect();
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح\n');

    // اختبار وجود الجداول
    console.log('2️⃣ اختبار وجود جداول التعلم المستمر...');
    
    const learningDataCount = await prisma.learningData.count();
    console.log(`✅ جدول learning_data موجود - عدد السجلات: ${learningDataCount}`);
    
    const patternsCount = await prisma.discoveredPattern.count();
    console.log(`✅ جدول discovered_patterns موجود - عدد السجلات: ${patternsCount}`);
    
    const improvementsCount = await prisma.appliedImprovement.count();
    console.log(`✅ جدول applied_improvements موجود - عدد السجلات: ${improvementsCount}`);
    
    const settingsCount = await prisma.learningSettings.count();
    console.log(`✅ جدول learning_settings موجود - عدد السجلات: ${settingsCount}\n`);

    // اختبار إنشاء شركة تجريبية
    console.log('3️⃣ إنشاء بيانات تجريبية...');
    
    let testCompany;
    try {
      testCompany = await prisma.company.create({
        data: {
          name: 'شركة اختبار التعلم المستمر',
          email: 'test-learning@example.com',
          phone: '+966501234567'
        }
      });
      console.log(`✅ تم إنشاء شركة تجريبية: ${testCompany.name} (ID: ${testCompany.id})`);
    } catch (error) {
      if (error.code === 'P2002') {
        // الشركة موجودة بالفعل
        testCompany = await prisma.company.findUnique({
          where: { email: 'test-learning@example.com' }
        });
        console.log(`✅ الشركة التجريبية موجودة بالفعل: ${testCompany.name} (ID: ${testCompany.id})`);
      } else {
        throw error;
      }
    }

    // اختبار خدمة التعلم المستمر
    console.log('\n4️⃣ اختبار خدمة التعلم المستمر...');
    const learningService = new ContinuousLearningServiceV2();

    // إضافة بيانات تجريبية
    const testData = {
      companyId: testCompany.id,
      type: 'conversation',
      data: {
        userMessage: 'مرحبا، أريد معلومات عن منتجاتكم',
        aiResponse: 'مرحبا بك! يسعدني مساعدتك. لدينا مجموعة متنوعة من المنتجات...',
        context: { source: 'website', language: 'ar' }
      },
      outcome: 'success',
      metadata: {
        responseTime: 1200,
        confidence: 0.85,
        userSatisfaction: 4.5
      }
    };

    const savedData = await learningService.collectData(testData);
    console.log(`✅ تم حفظ بيانات تجريبية: ${savedData.id}`);

    // اختبار تحليل الأنماط
    console.log('\n5️⃣ اختبار تحليل الأنماط...');
    const patterns = await learningService.analyzePatterns(testCompany.id);
    console.log(`✅ تم تحليل الأنماط - عدد الأنماط المكتشفة: ${patterns.length}`);

    // اختبار الحصول على Dashboard
    console.log('\n6️⃣ اختبار Dashboard...');
    const dashboard = await learningService.getDashboard(testCompany.id);
    console.log('✅ تم جلب بيانات Dashboard:');
    console.log(`   - إجمالي التفاعلات: ${dashboard.overview.totalInteractions}`);
    console.log(`   - معدل النجاح: ${dashboard.overview.successRate}%`);
    console.log(`   - الأنماط المكتشفة: ${dashboard.patterns.totalPatterns}`);
    console.log(`   - التحسينات النشطة: ${dashboard.improvements.activeImprovements}`);

    // اختبار الإعدادات
    console.log('\n7️⃣ اختبار الإعدادات...');
    const settings = await learningService.getSettings(testCompany.id);
    console.log('✅ تم جلب الإعدادات:');
    console.log(`   - التعلم مفعل: ${settings.learning.enabled}`);
    console.log(`   - سرعة التعلم: ${settings.learning.learningSpeed}`);
    console.log(`   - التطبيق التلقائي: ${settings.learning.autoApplyImprovements}`);

    console.log('\n🎉 جميع الاختبارات نجحت! النظام متصل بقاعدة البيانات ويعمل بشكل صحيح.');
    
    // عرض معلومات الاتصال
    console.log('\n📊 معلومات الاتصال:');
    console.log(`   - قاعدة البيانات: ${process.env.DATABASE_URL ? 'متصلة' : 'محلية'}`);
    console.log(`   - البيئة: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   - Frontend API URL: ${process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1'}`);

    console.log('\n🚀 يمكنك الآن تشغيل Frontend والوصول لنظام التعلم المستمر:');
    console.log('   1. cd frontend && npm start');
    console.log('   2. افتح http://localhost:3000');
    console.log('   3. انتقل لقسم "🧠 التعلم المستمر" في القائمة الجانبية');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
    console.error('\n🔧 تأكد من:');
    console.error('   1. تشغيل قاعدة البيانات');
    console.error('   2. تشغيل Backend server');
    console.error('   3. صحة متغيرات البيئة');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الاختبار
if (require.main === module) {
  testDatabaseConnection().catch(console.error);
}

module.exports = testDatabaseConnection;
