
// Helper function للحصول على معرف الشركة بالاسم
async function getCompanyByName(name) {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  try {
    const company = await prisma.company.findFirst({
      where: { name: { contains: name } }
    });
    await prisma.$disconnect();
    return company?.id || null;
  } catch (error) {
    console.error('خطأ في البحث عن الشركة:', error);
    return null;
  }
}
/**
 * اختبار عزل إحصائيات الذاكرة
 */

const memoryService = require('./src/services/memoryService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testMemoryStatsIsolation() {
  console.log('🔍 اختبار عزل إحصائيات الذاكرة...');
  console.log('='.repeat(60));

  const company1 = 'cme8oj1fo000cufdcg2fquia9';
  // الحصول على شركة الحلو ديناميكياً
  const companies = await prisma.company.findMany({ where: { name: { contains: 'الحلو' } } });
  const company2 = companies[0]?.id || 'company-not-found';

  try {
    // 1. إضافة بيانات اختبار للشركة الأولى
    console.log('\n📤 إضافة بيانات اختبار للشركة الأولى...');
    await memoryService.saveInteraction({
      conversationId: 'stats-test-conv-1',
      senderId: 'stats-test-user-1',
      companyId: company1,
      userMessage: 'رسالة اختبار للشركة الأولى',
      aiResponse: 'رد الشركة الأولى',
      intent: 'test',
      sentiment: 'positive'
    });

    // 2. إضافة بيانات اختبار للشركة الثانية
    console.log('\n📤 إضافة بيانات اختبار للشركة الثانية...');
    await memoryService.saveInteraction({
      conversationId: 'stats-test-conv-2',
      senderId: 'stats-test-user-2',
      companyId: company2,
      userMessage: 'رسالة اختبار للشركة الثانية',
      aiResponse: 'رد الشركة الثانية',
      intent: 'test',
      sentiment: 'positive'
    });

    // 3. اختبار إحصائيات الشركة الأولى
    console.log('\n📊 اختبار إحصائيات الشركة الأولى...');
    const stats1 = await memoryService.getMemoryStats(company1);
    console.log('إحصائيات الشركة الأولى:');
    console.log(`   - إجمالي المحادثات: ${stats1.totalMemories}`);
    console.log(`   - إجمالي الرسائل: ${stats1.totalMessages}`);
    console.log(`   - إجمالي العملاء: ${stats1.totalCustomers}`);
    console.log(`   - سجلات الذاكرة: ${stats1.conversationMemoryRecords}`);
    console.log(`   - الذاكرة قصيرة المدى: ${stats1.shortTermMemorySize}`);
    console.log(`   - معزولة: ${stats1.isolated}`);
    console.log(`   - معرف الشركة: ${stats1.companyId}`);

    // 4. اختبار إحصائيات الشركة الثانية
    console.log('\n📊 اختبار إحصائيات الشركة الثانية...');
    const stats2 = await memoryService.getMemoryStats(company2);
    console.log('إحصائيات الشركة الثانية:');
    console.log(`   - إجمالي المحادثات: ${stats2.totalMemories}`);
    console.log(`   - إجمالي الرسائل: ${stats2.totalMessages}`);
    console.log(`   - إجمالي العملاء: ${stats2.totalCustomers}`);
    console.log(`   - سجلات الذاكرة: ${stats2.conversationMemoryRecords}`);
    console.log(`   - الذاكرة قصيرة المدى: ${stats2.shortTermMemorySize}`);
    console.log(`   - معزولة: ${stats2.isolated}`);
    console.log(`   - معرف الشركة: ${stats2.companyId}`);

    // 5. اختبار الإحصائيات العامة (بدون عزل)
    console.log('\n📊 اختبار الإحصائيات العامة (بدون عزل)...');
    const statsAll = await memoryService.getMemoryStats();
    console.log('الإحصائيات العامة:');
    console.log(`   - إجمالي المحادثات: ${statsAll.totalMemories}`);
    console.log(`   - إجمالي الرسائل: ${statsAll.totalMessages}`);
    console.log(`   - إجمالي العملاء: ${statsAll.totalCustomers}`);
    console.log(`   - سجلات الذاكرة: ${statsAll.conversationMemoryRecords}`);
    console.log(`   - الذاكرة قصيرة المدى: ${statsAll.shortTermMemorySize}`);
    console.log(`   - معزولة: ${statsAll.isolated}`);
    console.log(`   - معرف الشركة: ${statsAll.companyId}`);

    // 6. فحص العزل
    console.log('\n🔍 فحص العزل...');
    
    const isolationCheck = {
      company1HasOwnData: stats1.conversationMemoryRecords > 0,
      company2HasOwnData: stats2.conversationMemoryRecords > 0,
      company1DataDifferent: stats1.conversationMemoryRecords !== stats2.conversationMemoryRecords,
      allDataIsSum: statsAll.conversationMemoryRecords >= (stats1.conversationMemoryRecords + stats2.conversationMemoryRecords),
      bothIsolated: stats1.isolated && stats2.isolated,
      allNotIsolated: !statsAll.isolated
    };

    console.log('نتائج فحص العزل:');
    Object.entries(isolationCheck).forEach(([check, passed]) => {
      const status = passed ? '✅' : '❌';
      console.log(`   ${status} ${check}: ${passed}`);
    });

    // 7. اختبار توزيع الذاكرة
    if (stats1.memoryDistribution && stats2.memoryDistribution) {
      console.log('\n📈 توزيع الذاكرة:');
      console.log('الشركة الأولى:');
      console.log(`   - قاعدة البيانات: ${stats1.memoryDistribution.database}`);
      console.log(`   - قصيرة المدى: ${stats1.memoryDistribution.shortTerm}`);
      console.log(`   - الإجمالي: ${stats1.memoryDistribution.total}`);
      
      console.log('الشركة الثانية:');
      console.log(`   - قاعدة البيانات: ${stats2.memoryDistribution.database}`);
      console.log(`   - قصيرة المدى: ${stats2.memoryDistribution.shortTerm}`);
      console.log(`   - الإجمالي: ${stats2.memoryDistribution.total}`);
    }

    // 8. تحليل نهائي
    console.log('\n📊 تحليل نهائي:');
    
    const allChecksPassed = Object.values(isolationCheck).every(check => check === true);
    
    if (allChecksPassed) {
      console.log('🏆 العزل في إحصائيات الذاكرة يعمل بشكل مثالي!');
      console.log('✅ كل شركة ترى إحصائياتها فقط');
      console.log('✅ لا يوجد تسريب في الإحصائيات');
      console.log('✅ النظام آمن للإنتاج');
    } else {
      console.log('🚨 لا تزال هناك مشاكل في عزل الإحصائيات!');
      console.log('❌ النظام غير آمن');
    }

  } catch (error) {
    console.error('❌ خطأ في اختبار عزل الإحصائيات:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testMemoryStatsIsolation().catch(console.error);
