/**
 * إصلاح مباشر لجميع المشاكل
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function directFixAll() {
  console.log('🔧 إصلاح مباشر لجميع المشاكل...');
  console.log('='.repeat(50));

  try {
    // 1. إصلاح صفحات فيسبوك مباشرة
    console.log('1️⃣ إصلاح صفحات فيسبوك...');
    
    const pages = await prisma.facebookPage.findMany();
    for (const page of pages) {
      // استخدام raw SQL لتحديث isActive
      await prisma.$executeRaw`
        UPDATE facebook_pages 
        SET isActive = TRUE 
        WHERE id = ${page.id}
      `;
      console.log(`✅ تم تفعيل صفحة: ${page.pageName}`);
    }

    // 2. إصلاح إعدادات AI مباشرة
    console.log('\n2️⃣ إصلاح إعدادات AI...');
    
    const companies = await prisma.company.findMany();
    
    for (const company of companies) {
      // حذف إعدادات AI القديمة إن وجدت
      await prisma.aiSettings.deleteMany({
        where: { companyId: company.id }
      });
      
      // إنشاء إعدادات AI جديدة صحيحة
      await prisma.aiSettings.create({
        data: {
          companyId: company.id,
          autoReplyEnabled: true,
          workingHoursEnabled: true,
          maxRepliesPerCustomer: 10,
          multimodalEnabled: true,
          ragEnabled: true,
          confidenceThreshold: 0.7,
          workingHours: JSON.stringify({ start: '09:00', end: '18:00' })
        }
      });
      
      // إضافة الحقول المفقودة باستخدام raw SQL
      await prisma.$executeRaw`
        UPDATE ai_settings 
        SET aiEnabled = TRUE, autoResponse = TRUE 
        WHERE companyId = ${company.id}
      `;
      
      console.log(`✅ تم إصلاح إعدادات AI للشركة: ${company.name}`);
    }

    // 3. اختبار نهائي
    console.log('\n3️⃣ اختبار نهائي...');
    
    const testCompanies = await prisma.company.findMany({
      include: {
        facebookPages: true,
        geminiKeys: true,
        aiSettings: true
      }
    });

    console.log('\n📊 النتائج النهائية:');
    console.log('='.repeat(40));

    let healthyCount = 0;
    
    for (const company of testCompanies) {
      console.log(`\n🏢 ${company.name}:`);
      
      // فحص الشركة
      console.log(`   الشركة نشطة: ${company.isActive ? '✅' : '❌'}`);
      
      // فحص صفحات فيسبوك
      let pagesOk = true;
      if (company.facebookPages.length > 0) {
        // فحص مباشر من قاعدة البيانات
        const activePagesCount = await prisma.$queryRaw`
          SELECT COUNT(*) as count 
          FROM facebook_pages 
          WHERE companyId = ${company.id} AND isActive = TRUE
        `;
        const activeCount = Number(activePagesCount[0].count);
        pagesOk = activeCount > 0;
        console.log(`   صفحات فيسبوك: ${activeCount}/${company.facebookPages.length} نشطة ${pagesOk ? '✅' : '❌'}`);
      } else {
        console.log(`   صفحات فيسبوك: لا توجد صفحات ✅`);
      }
      
      // فحص مفاتيح Gemini
      const activeKeys = company.geminiKeys.filter(k => k.isActive === true);
      const keysOk = activeKeys.length > 0;
      console.log(`   مفاتيح Gemini: ${activeKeys.length}/${company.geminiKeys.length} نشطة ${keysOk ? '✅' : '❌'}`);
      
      // فحص إعدادات AI
      const aiOk = company.aiSettings && company.aiSettings.length > 0 && 
                   company.aiSettings[0].autoReplyEnabled === true;
      console.log(`   إعدادات AI: ${aiOk ? 'مفعلة ✅' : 'معطلة ❌'}`);
      
      // الحالة العامة
      const isHealthy = company.isActive && pagesOk && keysOk && aiOk;
      console.log(`   🎯 الحالة: ${isHealthy ? '✅ صحية' : '❌ تحتاج مراجعة'}`);
      
      if (isHealthy) healthyCount++;
    }

    console.log('\n🎯 الملخص النهائي:');
    console.log(`📊 إجمالي الشركات: ${testCompanies.length}`);
    console.log(`✅ شركات صحية: ${healthyCount}`);
    console.log(`❌ شركات تحتاج مراجعة: ${testCompanies.length - healthyCount}`);
    console.log(`📈 معدل النجاح: ${((healthyCount/testCompanies.length)*100).toFixed(1)}%`);

    // 4. اختبار خاص لـ Swan-store
    console.log('\n🦢 اختبار Swan-store:');
    
    const swanCheck = await prisma.$queryRaw`
      SELECT 
        fp.pageName,
        fp.isActive as pageActive,
        c.isActive as companyActive,
        c.name as companyName
      FROM facebook_pages fp
      JOIN companies c ON fp.companyId = c.id
      WHERE fp.pageId = '675323792321557'
    `;

    if (swanCheck.length > 0) {
      const swan = swanCheck[0];
      console.log(`   صفحة: ${swan.pageName}`);
      console.log(`   الشركة: ${swan.companyName}`);
      console.log(`   صفحة نشطة: ${swan.pageActive ? '✅' : '❌'}`);
      console.log(`   شركة نشطة: ${swan.companyActive ? '✅' : '❌'}`);
      
      const swanReady = swan.pageActive && swan.companyActive;
      console.log(`   🎯 جاهزة للرد: ${swanReady ? '✅ نعم' : '❌ لا'}`);
      
      if (swanReady) {
        console.log('\n🎉 Swan-store جاهزة الآن للرد على الرسائل!');
      }
    }

    if (healthyCount === testCompanies.length) {
      console.log('\n🎊 تم إصلاح جميع الشركات بنجاح!');
      console.log('🚀 الآن جميع الشركات ستعمل وترد على الرسائل!');
    }

  } catch (error) {
    console.error('❌ خطأ في الإصلاح المباشر:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الإصلاح المباشر
directFixAll().catch(console.error);
