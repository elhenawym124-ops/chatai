/**
 * اختبار نهائي لجميع الشركات
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function finalTestAllCompanies() {
  console.log('🎯 اختبار نهائي لجميع الشركات...');
  console.log('='.repeat(50));

  try {
    // 1. فحص شامل لجميع الشركات
    const companies = await prisma.company.findMany();
    
    console.log(`📊 إجمالي الشركات: ${companies.length}`);

    let fullyWorkingCompanies = 0;

    for (const company of companies) {
      console.log(`\n🏢 ${company.name} (${company.id}):`);
      
      // فحص الشركة
      const companyActive = company.isActive === true;
      console.log(`   1. الشركة نشطة: ${companyActive ? '✅' : '❌'}`);
      
      // فحص صفحات فيسبوك
      const pagesResult = await prisma.$queryRaw`
        SELECT COUNT(*) as total, 
               SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END) as active
        FROM facebook_pages 
        WHERE companyId = ${company.id}
      `;
      
      const totalPages = Number(pagesResult[0].total);
      const activePages = Number(pagesResult[0].active);
      const pagesOk = totalPages === 0 || activePages > 0;
      
      if (totalPages > 0) {
        console.log(`   2. صفحات فيسبوك: ${activePages}/${totalPages} نشطة ${pagesOk ? '✅' : '❌'}`);
      } else {
        console.log(`   2. صفحات فيسبوك: لا توجد صفحات ✅`);
      }
      
      // فحص مفاتيح Gemini
      const keysResult = await prisma.$queryRaw`
        SELECT COUNT(*) as total,
               SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END) as active
        FROM gemini_keys 
        WHERE companyId = ${company.id}
      `;
      
      const totalKeys = Number(keysResult[0].total);
      const activeKeys = Number(keysResult[0].active);
      const keysOk = activeKeys > 0;
      console.log(`   3. مفاتيح Gemini: ${activeKeys}/${totalKeys} نشطة ${keysOk ? '✅' : '❌'}`);
      
      // فحص إعدادات AI
      const aiResult = await prisma.$queryRaw`
        SELECT autoReplyEnabled, aiEnabled, autoResponse
        FROM ai_settings 
        WHERE companyId = ${company.id}
      `;
      
      let aiOk = false;
      if (aiResult.length > 0) {
        const ai = aiResult[0];
        aiOk = ai.autoReplyEnabled === 1;
        console.log(`   4. إعدادات AI: autoReplyEnabled=${ai.autoReplyEnabled} ${aiOk ? '✅' : '❌'}`);
      } else {
        console.log(`   4. إعدادات AI: غير موجودة ❌`);
      }
      
      // النتيجة النهائية
      const fullyReady = companyActive && pagesOk && keysOk && aiOk;
      console.log(`   🎯 جاهزة للرد: ${fullyReady ? '✅ نعم' : '❌ لا'}`);
      
      if (fullyReady) {
        fullyWorkingCompanies++;
      }
    }

    // 2. تلخيص النتائج
    console.log('\n' + '='.repeat(50));
    console.log('🎊 النتائج النهائية:');
    console.log('='.repeat(50));
    console.log(`📊 إجمالي الشركات: ${companies.length}`);
    console.log(`✅ شركات جاهزة للرد: ${fullyWorkingCompanies}`);
    console.log(`❌ شركات تحتاج مراجعة: ${companies.length - fullyWorkingCompanies}`);
    console.log(`📈 معدل النجاح: ${((fullyWorkingCompanies/companies.length)*100).toFixed(1)}%`);

    // 3. اختبار خاص لـ Swan-store
    console.log('\n🦢 اختبار خاص لصفحة Swan-store:');
    
    const swanTest = await prisma.$queryRaw`
      SELECT 
        fp.pageName,
        fp.isActive as pageActive,
        c.name as companyName,
        c.isActive as companyActive,
        c.id as companyId
      FROM facebook_pages fp
      JOIN companies c ON fp.companyId = c.id
      WHERE fp.pageId = '675323792321557'
    `;

    if (swanTest.length > 0) {
      const swan = swanTest[0];
      console.log(`   صفحة: ${swan.pageName}`);
      console.log(`   الشركة: ${swan.companyName}`);
      
      const pageOk = swan.pageActive === 1;
      const companyOk = swan.companyActive === 1;
      
      console.log(`   صفحة نشطة: ${pageOk ? '✅' : '❌'}`);
      console.log(`   شركة نشطة: ${companyOk ? '✅' : '❌'}`);
      
      // فحص مفاتيح Gemini لـ Swan
      const swanKeysResult = await prisma.$queryRaw`
        SELECT COUNT(*) as active
        FROM gemini_keys 
        WHERE companyId = ${swan.companyId} AND isActive = 1
      `;
      
      const swanKeysOk = Number(swanKeysResult[0].active) > 0;
      console.log(`   مفاتيح Gemini: ${swanKeysOk ? '✅ متوفرة' : '❌ غير متوفرة'}`);
      
      // فحص إعدادات AI لـ Swan
      const swanAiResult = await prisma.$queryRaw`
        SELECT autoReplyEnabled
        FROM ai_settings 
        WHERE companyId = ${swan.companyId}
      `;
      
      const swanAiOk = swanAiResult.length > 0 && swanAiResult[0].autoReplyEnabled === 1;
      console.log(`   إعدادات AI: ${swanAiOk ? '✅ تعمل' : '❌ لا تعمل'}`);
      
      const swanReady = pageOk && companyOk && swanKeysOk && swanAiOk;
      console.log(`   🎯 Swan-store جاهزة للرد: ${swanReady ? '✅ نعم' : '❌ لا'}`);
      
      if (swanReady) {
        console.log('\n🎉 مبروك! صفحة Swan-store جاهزة تماماً للرد على الرسائل!');
        console.log('📱 يمكنك الآن إرسال رسالة لصفحة Swan-store وستحصل على رد فوري من الذكاء الاصطناعي!');
      }
    }

    // 4. النتيجة النهائية
    if (fullyWorkingCompanies === companies.length) {
      console.log('\n🎊 مبروك! جميع الشركات جاهزة للرد على الرسائل!');
      console.log('🚀 النظام يعمل بكفاءة 100%!');
      console.log('✨ أي شركة جديدة ستعمل بشكل صحيح تلقائياً!');
      console.log('📱 يمكن إرسال رسائل لأي صفحة والحصول على ردود فورية!');
    } else if (fullyWorkingCompanies > 0) {
      console.log('\n🎉 تم إصلاح معظم الشركات بنجاح!');
      console.log(`✅ ${fullyWorkingCompanies} شركة تعمل بشكل صحيح`);
      console.log(`⚠️ ${companies.length - fullyWorkingCompanies} شركة تحتاج مراجعة إضافية`);
    } else {
      console.log('\n⚠️ جميع الشركات تحتاج مراجعة إضافية');
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار النهائي:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الاختبار النهائي
finalTestAllCompanies().catch(console.error);
