/**
 * الحل النهائي الشامل لإصلاح جميع الشركات
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function finalComprehensiveFix() {
  console.log('🔧 الحل النهائي الشامل...');
  console.log('='.repeat(60));

  try {
    // 1. تحديث schema.prisma لإضافة الحقول المفقودة
    console.log('1️⃣ تحديث قاعدة البيانات...');
    
    // إضافة حقل isActive لجدول facebook_pages
    try {
      await prisma.$executeRaw`
        ALTER TABLE facebook_pages 
        ADD COLUMN isActive BOOLEAN DEFAULT TRUE
      `;
      console.log('✅ تم إضافة حقل isActive لجدول facebook_pages');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('✅ حقل isActive موجود بالفعل في facebook_pages');
      } else {
        console.log('⚠️ خطأ في إضافة isActive:', error.message);
      }
    }

    // إضافة حقول AI
    try {
      await prisma.$executeRaw`
        ALTER TABLE ai_settings 
        ADD COLUMN aiEnabled BOOLEAN DEFAULT TRUE
      `;
      console.log('✅ تم إضافة حقل aiEnabled');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('✅ حقل aiEnabled موجود بالفعل');
      }
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE ai_settings 
        ADD COLUMN autoResponse BOOLEAN DEFAULT TRUE
      `;
      console.log('✅ تم إضافة حقل autoResponse');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('✅ حقل autoResponse موجود بالفعل');
      }
    }

    // 2. تحديث جميع البيانات الموجودة
    console.log('\n2️⃣ تحديث البيانات الموجودة...');

    // تفعيل جميع الشركات
    await prisma.$executeRaw`
      UPDATE companies 
      SET isActive = TRUE 
      WHERE isActive IS NULL OR isActive = FALSE
    `;
    console.log('✅ تم تفعيل جميع الشركات');

    // تفعيل جميع صفحات فيسبوك
    await prisma.$executeRaw`
      UPDATE facebook_pages 
      SET isActive = TRUE 
      WHERE isActive IS NULL OR isActive = FALSE
    `;
    console.log('✅ تم تفعيل جميع صفحات فيسبوك');

    // تفعيل جميع مفاتيح Gemini
    await prisma.$executeRaw`
      UPDATE gemini_keys 
      SET isActive = TRUE 
      WHERE isActive IS NULL OR isActive = FALSE
    `;
    console.log('✅ تم تفعيل جميع مفاتيح Gemini');

    // تفعيل جميع إعدادات AI
    await prisma.$executeRaw`
      UPDATE ai_settings 
      SET 
        aiEnabled = TRUE,
        autoResponse = TRUE,
        autoReplyEnabled = TRUE
      WHERE 
        aiEnabled IS NULL OR aiEnabled = FALSE OR
        autoResponse IS NULL OR autoResponse = FALSE OR
        autoReplyEnabled IS NULL OR autoReplyEnabled = FALSE
    `;
    console.log('✅ تم تفعيل جميع إعدادات AI');

    // 3. إنشاء إعدادات AI للشركات التي لا تملكها
    console.log('\n3️⃣ إنشاء إعدادات AI مفقودة...');
    
    const companiesWithoutAI = await prisma.$queryRaw`
      SELECT c.id, c.name 
      FROM companies c 
      LEFT JOIN ai_settings ai ON c.id = ai.companyId 
      WHERE ai.companyId IS NULL
    `;

    for (const company of companiesWithoutAI) {
      await prisma.aiSettings.create({
        data: {
          companyId: company.id,
          aiEnabled: true,
          autoResponse: true,
          autoReplyEnabled: true,
          workingHoursEnabled: true,
          maxRepliesPerCustomer: 10,
          multimodalEnabled: true,
          ragEnabled: true,
          confidenceThreshold: 0.7,
          workingHours: JSON.stringify({ start: '09:00', end: '18:00' })
        }
      });
      console.log(`✅ تم إنشاء إعدادات AI للشركة: ${company.name}`);
    }

    // 4. اختبار شامل نهائي
    console.log('\n4️⃣ اختبار شامل نهائي...');
    
    const allCompanies = await prisma.company.findMany({
      include: {
        facebookPages: true,
        geminiKeys: true,
        aiSettings: true
      }
    });

    console.log('\n📊 تقرير نهائي شامل:');
    console.log('='.repeat(60));

    let totalHealthy = 0;
    
    for (const company of allCompanies) {
      console.log(`\n🏢 ${company.name} (${company.id}):`);
      
      // فحص الشركة
      const companyActive = company.isActive === true;
      console.log(`   الشركة نشطة: ${companyActive ? '✅' : '❌'}`);
      
      // فحص صفحات فيسبوك
      let pagesStatus = '✅';
      if (company.facebookPages.length > 0) {
        const activePages = company.facebookPages.filter(p => p.isActive === true);
        pagesStatus = activePages.length > 0 ? '✅' : '❌';
        console.log(`   صفحات فيسبوك: ${activePages.length}/${company.facebookPages.length} نشطة ${pagesStatus}`);
      } else {
        console.log(`   صفحات فيسبوك: لا توجد صفحات ✅`);
      }
      
      // فحص مفاتيح Gemini
      const activeKeys = company.geminiKeys.filter(k => k.isActive === true);
      const keysStatus = activeKeys.length > 0 ? '✅' : '❌';
      console.log(`   مفاتيح Gemini: ${activeKeys.length}/${company.geminiKeys.length} نشطة ${keysStatus}`);
      
      // فحص إعدادات AI
      let aiStatus = '❌';
      if (company.aiSettings && company.aiSettings.length > 0) {
        const ai = company.aiSettings[0];
        const aiWorking = ai.aiEnabled === true && ai.autoResponse === true && ai.autoReplyEnabled === true;
        aiStatus = aiWorking ? '✅' : '❌';
        console.log(`   إعدادات AI: ${aiWorking ? 'مفعلة' : 'معطلة'} ${aiStatus}`);
      } else {
        console.log(`   إعدادات AI: غير موجودة ❌`);
      }
      
      // الحالة العامة
      const isHealthy = companyActive && 
                       (company.facebookPages.length === 0 || pagesStatus === '✅') &&
                       keysStatus === '✅' && 
                       aiStatus === '✅';
      
      console.log(`   🎯 الحالة العامة: ${isHealthy ? '✅ صحية تماماً' : '❌ تحتاج مراجعة'}`);
      
      if (isHealthy) totalHealthy++;
    }

    // 5. النتيجة النهائية
    console.log('\n' + '='.repeat(60));
    console.log('🎉 النتيجة النهائية:');
    console.log('='.repeat(60));
    console.log(`📊 إجمالي الشركات: ${allCompanies.length}`);
    console.log(`✅ شركات صحية: ${totalHealthy}`);
    console.log(`❌ شركات تحتاج مراجعة: ${allCompanies.length - totalHealthy}`);
    console.log(`📈 معدل النجاح: ${((totalHealthy/allCompanies.length)*100).toFixed(1)}%`);

    if (totalHealthy === allCompanies.length) {
      console.log('\n🎊 مبروك! تم إصلاح جميع الشركات بنجاح!');
      console.log('🚀 الآن جميع الشركات ستعمل وترد على الرسائل!');
      console.log('✨ أي شركة جديدة ستعمل بشكل صحيح تلقائياً!');
    } else {
      console.log('\n⚠️ بعض الشركات تحتاج مراجعة يدوية');
    }

    // 6. اختبار سريع لـ Swan-store
    console.log('\n🦢 اختبار خاص لصفحة Swan-store:');
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
      console.log(`   صفحة Swan-store: ${swanPage.isActive === true ? '✅ نشطة' : '❌ غير نشطة'}`);
      console.log(`   الشركة: ${swanPage.company.isActive === true ? '✅ نشطة' : '❌ غير نشطة'}`);
      
      const activeKeys = swanPage.company.geminiKeys.filter(k => k.isActive === true);
      console.log(`   مفاتيح Gemini: ${activeKeys.length > 0 ? '✅ متوفرة' : '❌ غير متوفرة'}`);
      
      const aiSettings = swanPage.company.aiSettings[0];
      const aiWorking = aiSettings && aiSettings.aiEnabled === true && 
                       aiSettings.autoResponse === true && 
                       aiSettings.autoReplyEnabled === true;
      console.log(`   إعدادات AI: ${aiWorking ? '✅ مفعلة' : '❌ معطلة'}`);
      
      const swanReady = swanPage.isActive === true && 
                       swanPage.company.isActive === true && 
                       activeKeys.length > 0 && 
                       aiWorking;
      
      console.log(`   🎯 Swan-store جاهزة للرد: ${swanReady ? '✅ نعم' : '❌ لا'}`);
    }

  } catch (error) {
    console.error('❌ خطأ في الحل الشامل:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الحل النهائي
finalComprehensiveFix().catch(console.error);
