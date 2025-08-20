/**
 * اختبار API إدارة مصادر Gemini
 */

const GeminiSourceManager = require('./src/services/geminiSourceManager');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const geminiSourceManager = new GeminiSourceManager();

async function testSourcesAPI() {
  console.log('🧪 اختبار API إدارة مصادر Gemini');
  console.log('=' * 50);

  try {
    // الحصول على الشركة الأولى
    const firstCompany = await prisma.company.findFirst();
    if (!firstCompany) {
      console.log('❌ لا توجد شركات في قاعدة البيانات');
      return;
    }

    console.log(`🏢 الشركة: ${firstCompany.name} (${firstCompany.id})`);
    console.log('');

    // 1. اختبار getAllSources
    console.log('📋 1. اختبار getAllSources:');
    const sourcesResult = await geminiSourceManager.getAllSources(firstCompany.id);
    console.log('النتيجة:', JSON.stringify(sourcesResult, null, 2));
    console.log('');

    if (sourcesResult.success) {
      // 2. اختبار testSource لكل مصدر
      console.log('🧪 2. اختبار المصادر:');
      for (const source of sourcesResult.sources) {
        if (source.hasKey) {
          console.log(`\n🔍 اختبار ${source.name}:`);
          const testResult = await geminiSourceManager.testSource(firstCompany.id, source.id);
          console.log('النتيجة:', JSON.stringify(testResult, null, 2));
        } else {
          console.log(`\n⚠️ تخطي ${source.name}: لا يوجد مفتاح`);
        }
      }

      // 3. اختبار activateSource
      console.log('\n⚡ 3. اختبار تفعيل المصادر:');
      const sourcesWithKeys = sourcesResult.sources.filter(s => s.hasKey);
      if (sourcesWithKeys.length > 0) {
        const sourceToActivate = sourcesWithKeys[0];
        console.log(`\n🎯 تفعيل ${sourceToActivate.name}:`);
        const activateResult = await geminiSourceManager.activateSource(firstCompany.id, sourceToActivate.id);
        console.log('النتيجة:', JSON.stringify(activateResult, null, 2));
      }

      // 4. اختبار getSourcesStats
      console.log('\n📊 4. اختبار الإحصائيات:');
      const statsResult = await geminiSourceManager.getSourcesStats(firstCompany.id);
      console.log('النتيجة:', JSON.stringify(statsResult, null, 2));

      // 5. اختبار getActiveApiKey
      console.log('\n🔑 5. اختبار الحصول على المفتاح النشط:');
      const activeKey = await geminiSourceManager.getActiveApiKey(firstCompany.id);
      console.log('المفتاح النشط:', activeKey ? `${activeKey.substring(0, 20)}...` : 'لا يوجد');
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n🏁 انتهى الاختبار');
}

// تشغيل الاختبار
testSourcesAPI().catch(console.error);
