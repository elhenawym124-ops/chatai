/**
 * فحص شامل لجميع الشركات في النظام
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllCompaniesStatus() {
  console.log('🔍 فحص شامل لجميع الشركات في النظام...');
  console.log('='.repeat(80));

  try {
    // 1. جلب جميع الشركات مع بياناتها
    const companies = await prisma.company.findMany({
      include: {
        facebookPages: true,
        geminiKeys: true,
        aiSettings: true,
        users: true
      }
    });

    console.log(`📊 إجمالي الشركات في النظام: ${companies.length}`);
    console.log('='.repeat(80));

    let totalIssues = 0;
    let companiesWithIssues = 0;
    let healthyCompanies = 0;

    // 2. فحص كل شركة بالتفصيل
    for (let i = 0; i < companies.length; i++) {
      const company = companies[i];
      console.log(`\n${i + 1}. 🏢 شركة: ${company.name} (${company.id})`);
      console.log(`   📅 تاريخ الإنشاء: ${company.createdAt}`);
      console.log(`   👥 المستخدمين: ${company.users.length}`);

      const companyIssues = [];

      // فحص الصفحات
      console.log(`   📄 الصفحات (${company.facebookPages.length}):`);
      if (company.facebookPages.length === 0) {
        companyIssues.push('لا توجد صفحات فيسبوك');
        console.log(`      ❌ لا توجد صفحات فيسبوك`);
      } else {
        company.facebookPages.forEach((page, index) => {
          console.log(`      ${index + 1}. ${page.pageName} (${page.pageId})`);
          console.log(`         نشط: ${page.isActive === true ? 'نعم' : page.isActive === false ? 'لا' : 'غير محدد ❌'}`);
          console.log(`         Token: ${page.pageAccessToken ? 'موجود' : 'مفقود ❌'}`);
          
          if (page.isActive !== true) {
            companyIssues.push(`صفحة ${page.pageName} غير نشطة`);
          }
          if (!page.pageAccessToken) {
            companyIssues.push(`صفحة ${page.pageName} بدون token`);
          }
        });
      }

      // فحص مفاتيح Gemini
      console.log(`   🔑 مفاتيح Gemini (${company.geminiKeys.length}):`);
      if (company.geminiKeys.length === 0) {
        companyIssues.push('لا توجد مفاتيح Gemini');
        console.log(`      ❌ لا توجد مفاتيح Gemini`);
      } else {
        const activeKeys = company.geminiKeys.filter(k => k.isActive);
        console.log(`      نشط: ${activeKeys.length} من ${company.geminiKeys.length}`);
        
        company.geminiKeys.forEach((key, index) => {
          console.log(`      ${index + 1}. ${key.keyName || 'بدون اسم'}`);
          console.log(`         نشط: ${key.isActive ? 'نعم' : 'لا'}`);
          console.log(`         النموذج: ${key.model || 'غير محدد'}`);
          console.log(`         تاريخ الإضافة: ${key.createdAt.toLocaleDateString()}`);
        });

        if (activeKeys.length === 0) {
          companyIssues.push('لا توجد مفاتيح Gemini نشطة');
        }
      }

      // فحص إعدادات AI
      console.log(`   ⚙️ إعدادات AI:`);
      if (!company.aiSettings || company.aiSettings.length === 0) {
        companyIssues.push('لا توجد إعدادات AI');
        console.log(`      ❌ لا توجد إعدادات AI`);
      } else {
        const aiSetting = company.aiSettings[0]; // عادة توجد إعدادات واحدة لكل شركة
        console.log(`      aiEnabled: ${aiSetting?.aiEnabled === true ? 'نعم' : aiSetting?.aiEnabled === false ? 'لا' : 'غير محدد ❌'}`);
        console.log(`      autoResponse: ${aiSetting?.autoResponse === true ? 'نعم' : aiSetting?.autoResponse === false ? 'لا' : 'غير محدد ❌'}`);
        console.log(`      autoReplyEnabled: ${aiSetting?.autoReplyEnabled === true ? 'نعم' : aiSetting?.autoReplyEnabled === false ? 'لا' : 'غير محدد ❌'}`);
        console.log(`      workingHoursEnabled: ${aiSetting?.workingHoursEnabled ? 'نعم' : 'لا'}`);
        console.log(`      maxRepliesPerCustomer: ${aiSetting?.maxRepliesPerCustomer || 'غير محدد'}`);
        console.log(`      model: ${aiSetting?.model || 'غير محدد'}`);

        if (aiSetting?.aiEnabled !== true) {
          companyIssues.push('aiEnabled غير مفعل');
        }
        if (aiSetting?.autoResponse !== true) {
          companyIssues.push('autoResponse غير مفعل');
        }
        if (aiSetting?.autoReplyEnabled !== true) {
          companyIssues.push('autoReplyEnabled غير مفعل');
        }
      }

      // فحص آخر الرسائل
      const recentMessages = await prisma.message.findMany({
        where: {
          conversation: {
            companyId: company.id
          },
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // آخر أسبوع
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      const customerMessages = recentMessages.filter(m => m.isFromCustomer);
      const botMessages = recentMessages.filter(m => !m.isFromCustomer);

      console.log(`   📨 الرسائل (آخر أسبوع):`);
      console.log(`      من العملاء: ${customerMessages.length}`);
      console.log(`      من البوت: ${botMessages.length}`);
      console.log(`      معدل الرد: ${customerMessages.length > 0 ? ((botMessages.length / customerMessages.length) * 100).toFixed(1) : 0}%`);

      if (customerMessages.length > 0 && botMessages.length === 0) {
        companyIssues.push('يوجد رسائل من العملاء بدون ردود');
      }

      // تلخيص حالة الشركة
      if (companyIssues.length > 0) {
        console.log(`   🚨 المشاكل (${companyIssues.length}):`);
        companyIssues.forEach(issue => console.log(`      ❌ ${issue}`));
        companiesWithIssues++;
        totalIssues += companyIssues.length;
      } else {
        console.log(`   ✅ الشركة تعمل بشكل صحيح`);
        healthyCompanies++;
      }

      console.log(`   📊 حالة الشركة: ${companyIssues.length === 0 ? '✅ صحية' : '❌ تحتاج إصلاح'}`);
    }

    // 3. تلخيص عام للنظام
    console.log('\n' + '='.repeat(80));
    console.log('📊 تلخيص عام للنظام:');
    console.log('='.repeat(80));
    console.log(`🏢 إجمالي الشركات: ${companies.length}`);
    console.log(`✅ شركات صحية: ${healthyCompanies} (${((healthyCompanies / companies.length) * 100).toFixed(1)}%)`);
    console.log(`❌ شركات تحتاج إصلاح: ${companiesWithIssues} (${((companiesWithIssues / companies.length) * 100).toFixed(1)}%)`);
    console.log(`🚨 إجمالي المشاكل: ${totalIssues}`);

    // 4. تحليل أنواع المشاكل الشائعة
    console.log('\n🔍 تحليل المشاكل الشائعة:');
    
    let pagesInactive = 0;
    let aiDisabled = 0;
    let autoResponseDisabled = 0;
    let noGeminiKeys = 0;
    let noAiSettings = 0;

    for (const company of companies) {
      // فحص الصفحات غير النشطة
      const inactivePages = company.facebookPages.filter(p => p.isActive !== true);
      if (inactivePages.length > 0) pagesInactive++;

      // فحص AI معطل
      if (!company.aiSettings || company.aiSettings.length === 0) {
        noAiSettings++;
      } else {
        const aiSetting = company.aiSettings[0];
        if (aiSetting?.aiEnabled !== true) aiDisabled++;
        if (aiSetting?.autoResponse !== true) autoResponseDisabled++;
      }

      // فحص مفاتيح Gemini
      const activeKeys = company.geminiKeys.filter(k => k.isActive);
      if (activeKeys.length === 0) noGeminiKeys++;
    }

    console.log(`   📄 شركات بصفحات غير نشطة: ${pagesInactive}`);
    console.log(`   🤖 شركات بـ AI معطل: ${aiDisabled}`);
    console.log(`   🔄 شركات بـ autoResponse معطل: ${autoResponseDisabled}`);
    console.log(`   🔑 شركات بدون مفاتيح Gemini نشطة: ${noGeminiKeys}`);
    console.log(`   ⚙️ شركات بدون إعدادات AI: ${noAiSettings}`);

    // 5. توصيات
    console.log('\n💡 التوصيات:');
    if (companiesWithIssues > 0) {
      console.log(`   🔧 يحتاج ${companiesWithIssues} شركة إلى إصلاح`);
      console.log(`   🎯 أولوية الإصلاح: الشركات التي لديها رسائل بدون ردود`);
      console.log(`   ⚡ يمكن إصلاح معظم المشاكل بتحديث قاعدة البيانات`);
    } else {
      console.log(`   ✅ جميع الشركات تعمل بشكل صحيح`);
    }

  } catch (error) {
    console.error('❌ خطأ في فحص الشركات:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الفحص
checkAllCompaniesStatus().catch(console.error);
