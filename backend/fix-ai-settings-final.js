/**
 * إصلاح نهائي لإعدادات AI
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAISettingsFinal() {
  console.log('⚙️ إصلاح نهائي لإعدادات AI...');
  console.log('='.repeat(40));

  try {
    // 1. فحص إعدادات AI الحالية
    const aiSettings = await prisma.aiSettings.findMany({
      include: { company: true }
    });

    console.log(`📊 إجمالي إعدادات AI: ${aiSettings.length}`);

    // 2. تحديث كل إعدادات AI
    for (const setting of aiSettings) {
      console.log(`\n⚙️ تحديث إعدادات AI للشركة: ${setting.company.name}`);
      
      await prisma.aiSettings.update({
        where: { id: setting.id },
        data: {
          autoReplyEnabled: true
        }
      });
      
      console.log('✅ تم تحديث autoReplyEnabled إلى true');
    }

    // 3. اختبار نهائي
    console.log('\n📊 اختبار نهائي لإعدادات AI:');
    
    const updatedSettings = await prisma.aiSettings.findMany({
      include: { company: true }
    });

    let workingSettings = 0;
    for (const setting of updatedSettings) {
      const isWorking = setting.autoReplyEnabled === true;
      console.log(`   ${setting.company.name}: ${isWorking ? '✅ يعمل' : '❌ لا يعمل'}`);
      if (isWorking) workingSettings++;
    }

    console.log(`\n🎯 النتيجة: ${workingSettings}/${updatedSettings.length} إعدادات تعمل`);

    // 4. اختبار شامل للنظام
    console.log('\n🔍 اختبار شامل للنظام:');
    
    const companies = await prisma.company.findMany({
      include: {
        facebookPages: true,
        geminiKeys: true,
        aiSettings: true
      }
    });

    let fullyWorking = 0;
    
    for (const company of companies) {
      console.log(`\n🏢 ${company.name}:`);
      
      // فحص الشركة
      const companyOk = company.isActive === true;
      console.log(`   الشركة: ${companyOk ? '✅' : '❌'}`);
      
      // فحص الصفحات
      let pagesOk = true;
      if (company.facebookPages.length > 0) {
        const activePagesResult = await prisma.$queryRaw`
          SELECT COUNT(*) as count 
          FROM facebook_pages 
          WHERE companyId = ${company.id} AND isActive = TRUE
        `;
        const activeCount = Number(activePagesResult[0].count);
        pagesOk = activeCount > 0;
        console.log(`   الصفحات: ${activeCount}/${company.facebookPages.length} ${pagesOk ? '✅' : '❌'}`);
      } else {
        console.log(`   الصفحات: لا توجد ✅`);
      }
      
      // فحص مفاتيح Gemini
      const activeKeys = company.geminiKeys.filter(k => k.isActive === true);
      const keysOk = activeKeys.length > 0;
      console.log(`   مفاتيح Gemini: ${activeKeys.length}/${company.geminiKeys.length} ${keysOk ? '✅' : '❌'}`);
      
      // فحص إعدادات AI
      const aiOk = company.aiSettings && company.aiSettings.length > 0 && 
                   company.aiSettings[0].autoReplyEnabled === true;
      console.log(`   إعدادات AI: ${aiOk ? '✅' : '❌'}`);
      
      // النتيجة النهائية
      const fullyReady = companyOk && pagesOk && keysOk && aiOk;
      console.log(`   🎯 جاهزة للرد: ${fullyReady ? '✅ نعم' : '❌ لا'}`);
      
      if (fullyReady) fullyWorking++;
    }

    console.log('\n🎊 النتيجة النهائية:');
    console.log(`📊 إجمالي الشركات: ${companies.length}`);
    console.log(`✅ شركات جاهزة للرد: ${fullyWorking}`);
    console.log(`❌ شركات تحتاج مراجعة: ${companies.length - fullyWorking}`);
    console.log(`📈 معدل النجاح: ${((fullyWorking/companies.length)*100).toFixed(1)}%`);

    if (fullyWorking === companies.length) {
      console.log('\n🎉 مبروك! جميع الشركات جاهزة للرد على الرسائل!');
      console.log('🚀 يمكنك الآن إرسال رسالة لأي صفحة وستحصل على رد!');
    } else {
      console.log('\n⚠️ بعض الشركات تحتاج مراجعة إضافية');
    }

    // 5. اختبار خاص لـ Swan-store
    console.log('\n🦢 اختبار نهائي لـ Swan-store:');
    
    const swanPage = await prisma.facebookPage.findFirst({
      where: { pageId: '675323792321557' },
      include: {
        company: {
          include: {
            aiSettings: true,
            geminiKeys: true
          }
        }
      }
    });

    if (swanPage) {
      const pageActive = await prisma.$queryRaw`
        SELECT isActive 
        FROM facebook_pages 
        WHERE pageId = '675323792321557'
      `;
      
      const isPageActive = pageActive[0]?.isActive === 1;
      const isCompanyActive = swanPage.company.isActive === true;
      const hasActiveKeys = swanPage.company.geminiKeys.some(k => k.isActive === true);
      const hasWorkingAI = swanPage.company.aiSettings && 
                          swanPage.company.aiSettings.length > 0 && 
                          swanPage.company.aiSettings[0].autoReplyEnabled === true;

      console.log(`   صفحة Swan-store: ${isPageActive ? '✅ نشطة' : '❌ غير نشطة'}`);
      console.log(`   الشركة: ${isCompanyActive ? '✅ نشطة' : '❌ غير نشطة'}`);
      console.log(`   مفاتيح Gemini: ${hasActiveKeys ? '✅ متوفرة' : '❌ غير متوفرة'}`);
      console.log(`   إعدادات AI: ${hasWorkingAI ? '✅ تعمل' : '❌ لا تعمل'}`);

      const swanReady = isPageActive && isCompanyActive && hasActiveKeys && hasWorkingAI;
      console.log(`   🎯 Swan-store جاهزة للرد: ${swanReady ? '✅ نعم' : '❌ لا'}`);

      if (swanReady) {
        console.log('\n🎊 Swan-store جاهزة تماماً!');
        console.log('📱 يمكنك الآن إرسال رسالة لصفحة Swan-store وستحصل على رد فوري!');
      }
    }

  } catch (error) {
    console.error('❌ خطأ في إصلاح إعدادات AI:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الإصلاح
fixAISettingsFinal().catch(console.error);
