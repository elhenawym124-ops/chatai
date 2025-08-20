/**
 * حل شامل لإصلاح جميع الشركات الموجودة والمستقبلية
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAllCompaniesComprehensive() {
  console.log('🔧 بدء الحل الشامل لإصلاح جميع الشركات...');
  console.log('='.repeat(80));

  try {
    // 1. جلب جميع الشركات
    const companies = await prisma.company.findMany({
      include: {
        facebookPages: true,
        geminiKeys: true,
        aiSettings: true
      }
    });

    console.log(`📊 إجمالي الشركات للإصلاح: ${companies.length}`);
    console.log('='.repeat(80));

    let fixedCompanies = 0;
    let totalIssuesFixed = 0;

    // 2. إصلاح كل شركة
    for (let i = 0; i < companies.length; i++) {
      const company = companies[i];
      console.log(`\n${i + 1}. 🏢 إصلاح شركة: ${company.name}`);
      console.log(`   معرف الشركة: ${company.id}`);

      let companyIssuesFixed = 0;

      // أ. إصلاح الشركة نفسها
      if (company.isActive !== true) {
        console.log('   🔧 تفعيل الشركة...');
        await prisma.company.update({
          where: { id: company.id },
          data: { isActive: true }
        });
        console.log('   ✅ تم تفعيل الشركة');
        companyIssuesFixed++;
      } else {
        console.log('   ✅ الشركة نشطة بالفعل');
      }

      // ب. إصلاح صفحات فيسبوك
      console.log(`   📄 إصلاح صفحات فيسبوك (${company.facebookPages.length}):`);
      for (const page of company.facebookPages) {
        if (page.isActive !== true) {
          console.log(`      🔧 تفعيل صفحة: ${page.pageName}`);
          
          // إضافة حقل isActive إذا لم يكن موجوداً
          try {
            await prisma.$executeRaw`
              UPDATE facebook_pages 
              SET isActive = true 
              WHERE id = ${page.id}
            `;
            console.log(`      ✅ تم تفعيل صفحة: ${page.pageName}`);
            companyIssuesFixed++;
          } catch (error) {
            // إذا فشل، قد يكون الحقل غير موجود
            console.log(`      ⚠️ حقل isActive غير موجود في صفحة: ${page.pageName}`);
          }
        } else {
          console.log(`      ✅ صفحة ${page.pageName} نشطة بالفعل`);
        }
      }

      // ج. إصلاح مفاتيح Gemini
      console.log(`   🔑 إصلاح مفاتيح Gemini (${company.geminiKeys.length}):`);
      for (const key of company.geminiKeys) {
        if (key.isActive !== true) {
          console.log(`      🔧 تفعيل مفتاح: ${key.name || 'بدون اسم'}`);
          await prisma.geminiKey.update({
            where: { id: key.id },
            data: { isActive: true }
          });
          console.log(`      ✅ تم تفعيل المفتاح`);
          companyIssuesFixed++;
        } else {
          console.log(`      ✅ مفتاح ${key.name || 'بدون اسم'} نشط بالفعل`);
        }
      }

      // د. إصلاح إعدادات AI
      console.log(`   ⚙️ إصلاح إعدادات AI:`);

      if (!company.aiSettings || company.aiSettings.length === 0) {
        // إنشاء إعدادات AI جديدة
        console.log('      🔧 إنشاء إعدادات AI جديدة...');
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
        console.log('      ✅ تم إنشاء إعدادات AI جديدة');
        companyIssuesFixed++;
      } else {
        // تحديث إعدادات AI الموجودة
        const aiSetting = company.aiSettings[0];
        const updates = {};

        if (aiSetting?.autoReplyEnabled !== true) {
          updates.autoReplyEnabled = true;
          console.log('      🔧 تفعيل autoReplyEnabled');
        }

        if (Object.keys(updates).length > 0 && aiSetting && aiSetting.id) {
          await prisma.aiSettings.update({
            where: { id: aiSetting.id },
            data: updates
          });
          console.log('      ✅ تم تحديث إعدادات AI');
          companyIssuesFixed++;
        } else {
          console.log('      ✅ إعدادات AI صحيحة بالفعل');
        }
      }

      // هـ. التأكد من وجود مفتاح Gemini نشط
      const activeKeys = company.geminiKeys.filter(k => k.isActive);
      if (activeKeys.length === 0 && company.geminiKeys.length > 0) {
        console.log('      🔧 تفعيل أول مفتاح Gemini...');
        await prisma.geminiKey.update({
          where: { id: company.geminiKeys[0].id },
          data: { isActive: true }
        });
        console.log('      ✅ تم تفعيل مفتاح Gemini');
        companyIssuesFixed++;
      }

      // تلخيص إصلاح الشركة
      if (companyIssuesFixed > 0) {
        console.log(`   🎯 تم إصلاح ${companyIssuesFixed} مشكلة في هذه الشركة`);
        fixedCompanies++;
        totalIssuesFixed += companyIssuesFixed;
      } else {
        console.log(`   ✅ الشركة تعمل بشكل صحيح`);
      }
    }

    // 3. إضافة حقل isActive لجدول facebook_pages إذا لم يكن موجوداً
    console.log('\n📄 التأكد من وجود حقل isActive في جدول facebook_pages...');
    try {
      await prisma.$executeRaw`
        ALTER TABLE facebook_pages 
        ADD COLUMN isActive BOOLEAN DEFAULT TRUE
      `;
      console.log('✅ تم إضافة حقل isActive لجدول facebook_pages');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('✅ حقل isActive موجود بالفعل في جدول facebook_pages');
      } else {
        console.log('⚠️ خطأ في إضافة حقل isActive:', error.message);
      }
    }

    // 4. تحديث جميع صفحات فيسبوك لتكون نشطة
    console.log('\n📄 تفعيل جميع صفحات فيسبوك...');
    try {
      const updateResult = await prisma.$executeRaw`
        UPDATE facebook_pages 
        SET isActive = TRUE 
        WHERE isActive IS NULL OR isActive = FALSE
      `;
      console.log(`✅ تم تفعيل صفحات فيسبوك`);
    } catch (error) {
      console.log('⚠️ خطأ في تفعيل صفحات فيسبوك:', error.message);
    }

    // 5. إضافة حقول مفقودة لجدول ai_settings إذا لزم الأمر
    console.log('\n⚙️ التأكد من وجود حقول AI في قاعدة البيانات...');
    try {
      // محاولة إضافة aiEnabled إذا لم يكن موجوداً
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
      // محاولة إضافة autoResponse إذا لم يكن موجوداً
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

    // 6. تحديث جميع إعدادات AI لتكون مفعلة
    console.log('\n⚙️ تفعيل جميع إعدادات AI...');
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
    }

    // 7. تقرير نهائي
    console.log('\n' + '='.repeat(80));
    console.log('🎉 تم الانتهاء من الحل الشامل!');
    console.log('='.repeat(80));
    console.log(`📊 إجمالي الشركات: ${companies.length}`);
    console.log(`🔧 شركات تم إصلاحها: ${fixedCompanies}`);
    console.log(`✅ شركات صحية: ${companies.length - fixedCompanies}`);
    console.log(`🚨 إجمالي المشاكل المُصلحة: ${totalIssuesFixed}`);

    // 8. اختبار نهائي
    console.log('\n🧪 اختبار نهائي للتأكد من الإصلاح...');
    const testResults = await prisma.company.findMany({
      include: {
        facebookPages: true,
        geminiKeys: true,
        aiSettings: true
      }
    });

    let healthyCompanies = 0;
    for (const company of testResults) {
      const hasActivePages = company.facebookPages.length === 0 || company.facebookPages.some(p => p.isActive === true);
      const hasActiveKeys = company.geminiKeys.some(k => k.isActive === true);
      const hasValidAI = company.aiSettings && company.aiSettings.length > 0 &&
                        company.aiSettings[0].autoReplyEnabled === true;

      if (company.isActive && hasActivePages && hasActiveKeys && hasValidAI) {
        healthyCompanies++;
      }
    }

    console.log(`✅ شركات صحية بعد الإصلاح: ${healthyCompanies}/${testResults.length} (${((healthyCompanies/testResults.length)*100).toFixed(1)}%)`);

    if (healthyCompanies === testResults.length) {
      console.log('🎉 جميع الشركات تعمل بشكل صحيح الآن!');
    } else {
      console.log('⚠️ بعض الشركات تحتاج مراجعة إضافية');
    }

  } catch (error) {
    console.error('❌ خطأ في الحل الشامل:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الحل الشامل
fixAllCompaniesComprehensive().catch(console.error);
