/**
 * تشخيص نهائي لمشكلة عدم الرد على صفحة Swan-store
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function finalSwanDiagnosis() {
  console.log('🩺 تشخيص نهائي لمشكلة Swan-store...');
  console.log('='.repeat(60));

  try {
    // 1. فحص صفحة Swan-store
    const swanPage = await prisma.facebookPage.findFirst({
      where: { pageId: '675323792321557' },
      include: { company: true }
    });

    console.log('📄 صفحة Swan-store:');
    console.log(`   اسم الصفحة: ${swanPage.pageName}`);
    console.log(`   معرف الصفحة: ${swanPage.pageId}`);
    console.log(`   الشركة: ${swanPage.company.name}`);
    console.log(`   Token موجود: ${swanPage.pageAccessToken ? 'نعم' : 'لا'}`);
    console.log(`   نشط: ${swanPage.isActive ? 'نعم' : 'لا'} ⚠️`);

    // 2. فحص مفاتيح Gemini للشركة
    const geminiKeys = await prisma.geminiKey.findMany({
      where: { companyId: swanPage.companyId }
    });

    console.log(`\n🔑 مفاتيح Gemini (${geminiKeys.length}):`);
    geminiKeys.forEach((key, index) => {
      console.log(`   ${index + 1}. نشط: ${key.isActive ? 'نعم' : 'لا'}`);
      console.log(`      النموذج: ${key.model}`);
      console.log(`      المفتاح: ${key.apiKey.substring(0, 20)}...`);
    });

    // 3. فحص إعدادات AI للشركة
    const aiSettings = await prisma.aiSettings.findFirst({
      where: { companyId: swanPage.companyId }
    });

    console.log(`\n⚙️ إعدادات AI:`);
    if (aiSettings) {
      console.log(`   AI مفعل: ${aiSettings.aiEnabled ? 'نعم' : 'لا'} ⚠️`);
      console.log(`   الاستجابة التلقائية: ${aiSettings.autoResponse ? 'نعم' : 'لا'} ⚠️`);
      console.log(`   النموذج: ${aiSettings.model || 'غير محدد'}`);
    } else {
      console.log(`   ❌ لا توجد إعدادات AI للشركة`);
    }

    // 4. فحص آخر الرسائل للشركة
    const recentMessages = await prisma.message.findMany({
      where: {
        conversation: {
          companyId: swanPage.companyId
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        conversation: {
          include: { customer: true }
        }
      }
    });

    console.log(`\n📨 آخر الرسائل للشركة (${recentMessages.length}):`);
    recentMessages.forEach((msg, index) => {
      console.log(`   ${index + 1}. [${msg.createdAt.toISOString()}]`);
      console.log(`      من العميل: ${msg.isFromCustomer ? 'نعم' : 'لا'}`);
      console.log(`      المحتوى: ${msg.content.substring(0, 50)}...`);
    });

    // 5. تحليل المشاكل
    console.log(`\n🔍 تحليل المشاكل:`);
    
    const issues = [];
    const solutions = [];

    // فحص الصفحة غير نشطة
    if (!swanPage.isActive) {
      issues.push('❌ الصفحة غير نشطة (isActive = false)');
      solutions.push('✅ تفعيل الصفحة في قاعدة البيانات');
    }

    // فحص AI غير مفعل
    if (!aiSettings || !aiSettings.aiEnabled) {
      issues.push('❌ AI غير مفعل للشركة');
      solutions.push('✅ تفعيل AI في إعدادات الشركة');
    }

    // فحص الاستجابة التلقائية
    if (!aiSettings || !aiSettings.autoResponse) {
      issues.push('❌ الاستجابة التلقائية غير مفعلة');
      solutions.push('✅ تفعيل الاستجابة التلقائية');
    }

    // فحص مفاتيح Gemini
    const activeKeys = geminiKeys.filter(k => k.isActive);
    if (activeKeys.length === 0) {
      issues.push('❌ لا توجد مفاتيح Gemini نشطة');
      solutions.push('✅ تفعيل مفتاح Gemini موجود');
    }

    // عرض المشاكل والحلول
    if (issues.length > 0) {
      console.log('\n❌ المشاكل المكتشفة:');
      issues.forEach(issue => console.log(`   ${issue}`));
      
      console.log('\n💡 الحلول المقترحة:');
      solutions.forEach(solution => console.log(`   ${solution}`));
    } else {
      console.log('   ✅ جميع الإعدادات صحيحة');
    }

    // 6. خلاصة التشخيص
    console.log(`\n📋 خلاصة التشخيص:`);
    console.log(`   🔍 السبب الرئيسي: الصفحة غير نشطة + AI غير مفعل`);
    console.log(`   🎯 الحل المطلوب: تفعيل الصفحة وإعدادات AI`);
    console.log(`   ⚡ الأولوية: عالية - يحتاج تدخل فوري`);

    return {
      pageActive: swanPage.isActive,
      aiEnabled: aiSettings?.aiEnabled || false,
      autoResponse: aiSettings?.autoResponse || false,
      activeGeminiKeys: activeKeys.length,
      issues: issues.length,
      needsFix: issues.length > 0
    };

  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error.message);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل التشخيص
finalSwanDiagnosis()
  .then(result => {
    if (result && result.needsFix) {
      console.log('\n🚨 النتيجة: يحتاج إصلاح فوري!');
      console.log('📞 يرجى الموافقة على تطبيق الحلول المقترحة');
    } else if (result) {
      console.log('\n✅ النتيجة: النظام يعمل بشكل صحيح');
    }
  })
  .catch(console.error);
