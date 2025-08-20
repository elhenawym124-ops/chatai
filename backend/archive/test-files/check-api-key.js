/**
 * سكريپت للبحث عن مفتاح API محدد في قاعدة البيانات
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkApiKey() {
  const targetApiKey = 'AIzaSyAdWtZ3BgcAs3bN_UyCnpMl_tzMWtueH5k';
  
  console.log('🔍 البحث عن مفتاح API في قاعدة البيانات...');
  console.log(`🔑 المفتاح المطلوب: ${targetApiKey}`);
  console.log('=' * 60);

  try {
    // البحث في جدول AiSettings
    console.log('\n📋 البحث في جدول AiSettings...');
    const aiSettings = await prisma.aiSettings.findMany({
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    let foundInAiSettings = false;
    for (const setting of aiSettings) {
      if (setting.escalationRules) {
        try {
          const rules = JSON.parse(setting.escalationRules);
          if (rules.apiKey === targetApiKey) {
            console.log('✅ تم العثور على المفتاح في AiSettings!');
            console.log(`   - Company: ${setting.company.name} (${setting.company.email})`);
            console.log(`   - Company ID: ${setting.company.id}`);
            console.log(`   - Settings ID: ${setting.id}`);
            foundInAiSettings = true;
          }
        } catch (e) {
          // تجاهل الأخطاء في تحليل JSON
        }
      }

      if (setting.modelSettings) {
        try {
          const modelSettings = JSON.parse(setting.modelSettings);
          if (modelSettings.apiKeys && Array.isArray(modelSettings.apiKeys)) {
            for (const apiKeyObj of modelSettings.apiKeys) {
              if (apiKeyObj.key === targetApiKey) {
                console.log('✅ تم العثور على المفتاح في modelSettings!');
                console.log(`   - Company: ${setting.company.name} (${setting.company.email})`);
                console.log(`   - Company ID: ${setting.company.id}`);
                console.log(`   - Settings ID: ${setting.id}`);
                console.log(`   - Key Name: ${apiKeyObj.name || 'غير محدد'}`);
                foundInAiSettings = true;
              }
            }
          }
        } catch (e) {
          // تجاهل الأخطاء في تحليل JSON
        }
      }
    }

    if (!foundInAiSettings) {
      console.log('❌ لم يتم العثور على المفتاح في جدول AiSettings');
    }

    // البحث في جدول Integrations
    console.log('\n📋 البحث في جدول Integrations...');
    const integrations = await prisma.integration.findMany({
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    let foundInIntegrations = false;
    for (const integration of integrations) {
      // البحث في accessToken
      if (integration.accessToken && integration.accessToken.includes(targetApiKey)) {
        console.log('✅ تم العثور على المفتاح في Integrations accessToken!');
        console.log(`   - Company: ${integration.company.name} (${integration.company.email})`);
        console.log(`   - Integration: ${integration.name} (${integration.platform})`);
        console.log(`   - Integration ID: ${integration.id}`);
        foundInIntegrations = true;
      }

      // البحث في config
      if (integration.config) {
        const configStr = JSON.stringify(integration.config);
        if (configStr.includes(targetApiKey)) {
          console.log('✅ تم العثور على المفتاح في Integrations config!');
          console.log(`   - Company: ${integration.company.name} (${integration.company.email})`);
          console.log(`   - Integration: ${integration.name} (${integration.platform})`);
          console.log(`   - Integration ID: ${integration.id}`);
          foundInIntegrations = true;
        }
      }

      // البحث في settings
      if (integration.settings) {
        if (integration.settings.includes(targetApiKey)) {
          console.log('✅ تم العثور على المفتاح في Integrations settings!');
          console.log(`   - Company: ${integration.company.name} (${integration.company.email})`);
          console.log(`   - Integration: ${integration.name} (${integration.platform})`);
          console.log(`   - Integration ID: ${integration.id}`);
          foundInIntegrations = true;
        }
      }
    }

    if (!foundInIntegrations) {
      console.log('❌ لم يتم العثور على المفتاح في جدول Integrations');
    }

    // البحث في جدول Companies (في حقل settings)
    console.log('\n📋 البحث في جدول Companies...');
    const companies = await prisma.company.findMany();
    
    let foundInCompanies = false;
    for (const company of companies) {
      if (company.settings) {
        const settingsStr = JSON.stringify(company.settings);
        if (settingsStr.includes(targetApiKey)) {
          console.log('✅ تم العثور على المفتاح في Company settings!');
          console.log(`   - Company: ${company.name} (${company.email})`);
          console.log(`   - Company ID: ${company.id}`);
          foundInCompanies = true;
        }
      }
    }

    if (!foundInCompanies) {
      console.log('❌ لم يتم العثور على المفتاح في جدول Companies');
    }

    // ملخص النتائج
    console.log('\n' + '=' * 60);
    console.log('📊 ملخص النتائج:');
    console.log(`🔑 المفتاح: ${targetApiKey}`);
    console.log(`📋 موجود في AiSettings: ${foundInAiSettings ? '✅ نعم' : '❌ لا'}`);
    console.log(`🔗 موجود في Integrations: ${foundInIntegrations ? '✅ نعم' : '❌ لا'}`);
    console.log(`🏢 موجود في Companies: ${foundInCompanies ? '✅ نعم' : '❌ لا'}`);

    const isFound = foundInAiSettings || foundInIntegrations || foundInCompanies;
    console.log(`\n🎯 النتيجة النهائية: ${isFound ? '✅ المفتاح موجود في قاعدة البيانات' : '❌ المفتاح غير موجود في قاعدة البيانات'}`);

    // إحصائيات إضافية
    console.log('\n📈 إحصائيات قاعدة البيانات:');
    console.log(`   - عدد الشركات: ${companies.length}`);
    console.log(`   - عدد إعدادات AI: ${aiSettings.length}`);
    console.log(`   - عدد التكاملات: ${integrations.length}`);

  } catch (error) {
    console.error('❌ خطأ في البحث:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
checkApiKey().catch(console.error);
