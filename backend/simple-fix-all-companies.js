/**
 * حل مبسط لإصلاح جميع الشركات
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function simpleFixAllCompanies() {
  console.log('🔧 حل مبسط لإصلاح جميع الشركات...');
  console.log('='.repeat(60));

  try {
    // 1. إضافة حقل isActive لجدول facebook_pages
    console.log('1️⃣ إضافة حقل isActive لجدول facebook_pages...');
    try {
      await prisma.$executeRaw`
        ALTER TABLE facebook_pages 
        ADD COLUMN isActive BOOLEAN DEFAULT TRUE
      `;
      console.log('✅ تم إضافة حقل isActive');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('✅ حقل isActive موجود بالفعل');
      } else {
        console.log('⚠️ خطأ:', error.message);
      }
    }

    // 2. إضافة حقول AI مفقودة
    console.log('\n2️⃣ إضافة حقول AI مفقودة...');
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

    // 3. تفعيل جميع الشركات
    console.log('\n3️⃣ تفعيل جميع الشركات...');
    const companyResult = await prisma.company.updateMany({
      where: { isActive: { not: true } },
      data: { isActive: true }
    });
    console.log(`✅ تم تفعيل ${companyResult.count} شركة`);

    // 4. تفعيل جميع صفحات فيسبوك
    console.log('\n4️⃣ تفعيل جميع صفحات فيسبوك...');
    try {
      await prisma.$executeRaw`
        UPDATE facebook_pages 
        SET isActive = TRUE 
        WHERE isActive IS NULL OR isActive = FALSE
      `;
      console.log('✅ تم تفعيل جميع صفحات فيسبوك');
    } catch (error) {
      console.log('⚠️ خطأ في تفعيل صفحات فيسبوك:', error.message);
    }

    // 5. تفعيل جميع مفاتيح Gemini
    console.log('\n5️⃣ تفعيل جميع مفاتيح Gemini...');
    const geminiResult = await prisma.geminiKey.updateMany({
      where: { isActive: { not: true } },
      data: { isActive: true }
    });
    console.log(`✅ تم تفعيل ${geminiResult.count} مفتاح Gemini`);

    // 6. إنشاء إعدادات AI للشركات التي لا تملكها
    console.log('\n6️⃣ إنشاء إعدادات AI للشركات...');
    const companies = await prisma.company.findMany({
      include: { aiSettings: true }
    });

    let createdSettings = 0;
    for (const company of companies) {
      if (!company.aiSettings) {
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
        createdSettings++;
        console.log(`   ✅ تم إنشاء إعدادات AI للشركة: ${company.name}`);
      }
    }
    console.log(`✅ تم إنشاء ${createdSettings} إعدادات AI جديدة`);

    // 7. تفعيل جميع إعدادات AI
    console.log('\n7️⃣ تفعيل جميع إعدادات AI...');
    try {
      await prisma.$executeRaw`
        UPDATE ai_settings 
        SET 
          aiEnabled = TRUE,
          autoResponse = TRUE,
          autoReplyEnabled = TRUE
        WHERE 
          aiEnabled IS NULL OR aiEnabled = FALSE OR
          autoResponse IS NULL OR autoResponse = FALSE OR
          autoReplyEnabled = FALSE
      `;
      console.log('✅ تم تفعيل جميع إعدادات AI');
    } catch (error) {
      console.log('⚠️ خطأ في تفعيل إعدادات AI:', error.message);
      
      // محاولة بديلة
      console.log('   🔄 محاولة تحديث إعدادات AI بطريقة بديلة...');
      const aiUpdateResult = await prisma.aiSettings.updateMany({
        where: { autoReplyEnabled: { not: true } },
        data: { autoReplyEnabled: true }
      });
      console.log(`   ✅ تم تحديث ${aiUpdateResult.count} إعدادات AI`);
    }

    // 8. اختبار نهائي
    console.log('\n8️⃣ اختبار نهائي...');
    const finalCheck = await prisma.company.findMany({
      include: {
        facebookPages: true,
        geminiKeys: true,
        aiSettings: true
      }
    });

    console.log('\n📊 النتائج النهائية:');
    console.log('='.repeat(40));

    let healthyCompanies = 0;
    for (const company of finalCheck) {
      console.log(`\n🏢 ${company.name}:`);
      console.log(`   الشركة نشطة: ${company.isActive ? '✅' : '❌'}`);
      
      const activePages = company.facebookPages.filter(p => p.isActive === true);
      console.log(`   صفحات نشطة: ${activePages.length}/${company.facebookPages.length} ${activePages.length > 0 || company.facebookPages.length === 0 ? '✅' : '❌'}`);
      
      const activeKeys = company.geminiKeys.filter(k => k.isActive === true);
      console.log(`   مفاتيح Gemini نشطة: ${activeKeys.length}/${company.geminiKeys.length} ${activeKeys.length > 0 ? '✅' : '❌'}`);
      
      const hasAI = company.aiSettings && company.aiSettings.autoReplyEnabled === true;
      console.log(`   إعدادات AI: ${hasAI ? '✅' : '❌'}`);

      const isHealthy = company.isActive && 
                       (company.facebookPages.length === 0 || activePages.length > 0) &&
                       activeKeys.length > 0 && 
                       hasAI;

      console.log(`   الحالة العامة: ${isHealthy ? '✅ صحية' : '❌ تحتاج مراجعة'}`);
      
      if (isHealthy) healthyCompanies++;
    }

    console.log('\n🎯 الملخص النهائي:');
    console.log(`📊 إجمالي الشركات: ${finalCheck.length}`);
    console.log(`✅ شركات صحية: ${healthyCompanies}`);
    console.log(`❌ شركات تحتاج مراجعة: ${finalCheck.length - healthyCompanies}`);
    console.log(`📈 معدل النجاح: ${((healthyCompanies/finalCheck.length)*100).toFixed(1)}%`);

    if (healthyCompanies === finalCheck.length) {
      console.log('\n🎉 تم إصلاح جميع الشركات بنجاح!');
      console.log('🚀 الآن جميع الشركات ستعمل وترد على الرسائل!');
    } else {
      console.log('\n⚠️ بعض الشركات تحتاج مراجعة يدوية');
    }

  } catch (error) {
    console.error('❌ خطأ في الإصلاح:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الإصلاح
simpleFixAllCompanies().catch(console.error);
