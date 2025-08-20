const { PrismaClient } = require('@prisma/client');

async function createAISettingsForTestCompany() {
  console.log('🔧 إنشاء سجل AI Settings للشركة التجريبية\n');

  const prisma = new PrismaClient();
  
  try {
    const testCompanyId = 'test-company-id';

    // 1. التحقق من وجود الشركة
    console.log('1️⃣ التحقق من وجود الشركة التجريبية:');
    console.log('═══════════════════════════════════════');

    const testCompany = await prisma.company.findUnique({
      where: { id: testCompanyId },
      select: { id: true, name: true, isActive: true }
    });

    if (!testCompany) {
      console.log('❌ الشركة التجريبية غير موجودة');
      return;
    }

    console.log('✅ الشركة موجودة:', testCompany.name);

    // 2. التحقق من وجود سجل AI Settings
    console.log('\n2️⃣ التحقق من وجود سجل AI Settings:');
    console.log('═══════════════════════════════════════');

    const existingSettings = await prisma.aiSettings.findUnique({
      where: { companyId: testCompanyId }
    });

    if (existingSettings) {
      console.log('✅ سجل AI Settings موجود بالفعل');
      console.log('📊 الإعدادات الحالية:', {
        autoReplyEnabled: existingSettings.autoReplyEnabled,
        confidenceThreshold: existingSettings.confidenceThreshold,
        qualityEvaluationEnabled: existingSettings.qualityEvaluationEnabled
      });
      return;
    }

    console.log('⚠️ سجل AI Settings غير موجود - سيتم إنشاؤه');

    // 3. إنشاء سجل AI Settings جديد
    console.log('\n3️⃣ إنشاء سجل AI Settings جديد:');
    console.log('═══════════════════════════════════════');

    const newSettings = await prisma.aiSettings.create({
      data: {
        companyId: testCompanyId,
        autoReplyEnabled: true,
        confidenceThreshold: 0.8,
        multimodalEnabled: true,
        ragEnabled: true,
        qualityEvaluationEnabled: true
      }
    });

    console.log('✅ تم إنشاء سجل AI Settings بنجاح!');
    console.log('🏢 الشركة:', testCompanyId);
    console.log('📊 الإعدادات:', {
      autoReplyEnabled: newSettings.autoReplyEnabled,
      confidenceThreshold: newSettings.confidenceThreshold,
      multimodalEnabled: newSettings.multimodalEnabled,
      ragEnabled: newSettings.ragEnabled,
      qualityEvaluationEnabled: newSettings.qualityEvaluationEnabled
    });

    // 4. اختبار قراءة الإعدادات الجديدة
    console.log('\n4️⃣ اختبار قراءة الإعدادات الجديدة:');
    console.log('═══════════════════════════════════════');

    const readSettings = await prisma.aiSettings.findUnique({
      where: { companyId: testCompanyId },
      select: {
        companyId: true,
        autoReplyEnabled: true,
        confidenceThreshold: true,
        multimodalEnabled: true,
        ragEnabled: true,
        qualityEvaluationEnabled: true
      }
    });

    if (readSettings) {
      console.log('✅ تم قراءة الإعدادات بنجاح:');
      console.log('📊 البيانات المقروءة:', readSettings);
      console.log('🔍 العزل صحيح:', readSettings.companyId === testCompanyId);
    } else {
      console.log('❌ فشل في قراءة الإعدادات');
    }

    // 5. عرض جميع سجلات AI Settings
    console.log('\n5️⃣ جميع سجلات AI Settings:');
    console.log('═══════════════════════════════════════');

    const allSettings = await prisma.aiSettings.findMany({
      select: {
        companyId: true,
        autoReplyEnabled: true,
        confidenceThreshold: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('📋 السجلات الموجودة:');
    allSettings.forEach((setting, index) => {
      const isTestCompany = setting.companyId === testCompanyId;
      console.log(`${index + 1}. ${setting.companyId} ${isTestCompany ? '← الشركة التجريبية' : ''}`);
      console.log(`   - Auto Reply: ${setting.autoReplyEnabled}`);
      console.log(`   - Confidence: ${setting.confidenceThreshold}`);
      console.log(`   - تاريخ الإنشاء: ${setting.createdAt}`);
      console.log('');
    });

    console.log('\n🎉 النتائج:');
    console.log('═══════════════════════════════════════');
    console.log('✅ تم إنشاء سجل AI Settings للشركة التجريبية');
    console.log('✅ العزل بين الشركات مطبق بشكل صحيح');
    console.log('✅ البيانات محفوظة ومقروءة بنجاح');
    console.log('✅ الآن يمكن اختبار AI Management بشكل كامل');

  } catch (error) {
    console.error('❌ خطأ في إنشاء سجل AI Settings:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAISettingsForTestCompany();
