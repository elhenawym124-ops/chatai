
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
 * اختبار حقيقي لعزل الذاكرة - نفس العميل مع شركتين
 */

const memoryService = require('./src/services/memoryService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testRealMemoryIsolation() {
  console.log('🔍 اختبار عزل الذاكرة الحقيقي...');
  console.log('السيناريو: نفس العميل يرسل لشركتين مختلفتين');
  console.log('='.repeat(60));

  const testCustomer = 'real-customer-123';
  const company1 = 'cme8oj1fo000cufdcg2fquia9';
  // الحصول على شركة الحلو ديناميكياً
  const companies = await prisma.company.findMany({ where: { name: { contains: 'الحلو' } } });
  const company2 = companies[0]?.id || 'company-not-found';

  try {
    // 1. العميل يرسل للشركة الأولى
    console.log('\n📤 العميل يرسل للشركة الأولى...');
    await memoryService.saveInteraction({
      conversationId: 'conv-company1-123',
      senderId: testCustomer,
      companyId: company1,
      userMessage: 'مرحبا، أريد منتج من الشركة الأولى',
      aiResponse: 'أهلاً بك في الشركة الأولى! كيف يمكنني مساعدتك؟',
      intent: 'greeting',
      sentiment: 'positive'
    });

    await memoryService.saveInteraction({
      conversationId: 'conv-company1-123',
      senderId: testCustomer,
      companyId: company1,
      userMessage: 'عايز أشوف المنتجات المتاحة',
      aiResponse: 'إليك منتجات الشركة الأولى المتاحة...',
      intent: 'product_inquiry',
      sentiment: 'positive'
    });

    // 2. نفس العميل يرسل للشركة الثانية
    console.log('\n📤 نفس العميل يرسل للشركة الثانية...');
    await memoryService.saveInteraction({
      conversationId: 'conv-company2-456',
      senderId: testCustomer,
      companyId: company2,
      userMessage: 'مرحبا، أريد منتج من الشركة الثانية',
      aiResponse: 'أهلاً بك في الشركة الثانية! نحن نقدم خدمات مختلفة',
      intent: 'greeting',
      sentiment: 'positive'
    });

    await memoryService.saveInteraction({
      conversationId: 'conv-company2-456',
      senderId: testCustomer,
      companyId: company2,
      userMessage: 'إيه الخدمات اللي عندكم؟',
      aiResponse: 'نحن في الشركة الثانية نقدم خدمات متميزة...',
      intent: 'service_inquiry',
      sentiment: 'positive'
    });

    // 3. اختبار استرجاع الذاكرة للشركة الأولى
    console.log('\n🧠 اختبار ذاكرة الشركة الأولى...');
    const memory1 = await memoryService.getConversationMemory(
      'conv-company1-123',
      testCustomer,
      10,
      company1
    );

    console.log(`📊 الشركة الأولى - عدد الذكريات: ${memory1.length}`);
    memory1.forEach((mem, index) => {
      console.log(`   ${index + 1}. [${mem.companyId}] ${mem.userMessage.substring(0, 40)}...`);
    });

    // 4. اختبار استرجاع الذاكرة للشركة الثانية
    console.log('\n🧠 اختبار ذاكرة الشركة الثانية...');
    const memory2 = await memoryService.getConversationMemory(
      'conv-company2-456',
      testCustomer,
      10,
      company2
    );

    console.log(`📊 الشركة الثانية - عدد الذكريات: ${memory2.length}`);
    memory2.forEach((mem, index) => {
      console.log(`   ${index + 1}. [${mem.companyId}] ${mem.userMessage.substring(0, 40)}...`);
    });

    // 5. فحص التسريب - هل الشركة الأولى ترى ذاكرة الثانية؟
    console.log('\n🚨 فحص التسريب...');
    
    // محاولة الشركة الأولى الوصول لمحادثة الشركة الثانية
    const leakTest1 = await memoryService.getConversationMemory(
      'conv-company2-456', // محادثة الشركة الثانية
      testCustomer,
      10,
      company1 // بهوية الشركة الأولى
    );

    console.log(`🔍 الشركة الأولى تحاول الوصول لمحادثة الثانية: ${leakTest1.length} ذكريات`);
    if (leakTest1.length > 0) {
      console.log('🚨 تسريب مكتشف! الشركة الأولى ترى بيانات الثانية');
      leakTest1.forEach((mem, index) => {
        console.log(`   ${index + 1}. [${mem.companyId}] ${mem.userMessage.substring(0, 40)}...`);
      });
    } else {
      console.log('✅ لا يوجد تسريب - الشركة الأولى لا ترى بيانات الثانية');
    }

    // محاولة الشركة الثانية الوصول لمحادثة الشركة الأولى
    const leakTest2 = await memoryService.getConversationMemory(
      'conv-company1-123', // محادثة الشركة الأولى
      testCustomer,
      10,
      company2 // بهوية الشركة الثانية
    );

    console.log(`🔍 الشركة الثانية تحاول الوصول لمحادثة الأولى: ${leakTest2.length} ذكريات`);
    if (leakTest2.length > 0) {
      console.log('🚨 تسريب مكتشف! الشركة الثانية ترى بيانات الأولى');
      leakTest2.forEach((mem, index) => {
        console.log(`   ${index + 1}. [${mem.companyId}] ${mem.userMessage.substring(0, 40)}...`);
      });
    } else {
      console.log('✅ لا يوجد تسريب - الشركة الثانية لا ترى بيانات الأولى');
    }

    // 6. اختبار البحث في الذاكرة
    console.log('\n🔍 اختبار البحث في الذاكرة...');
    
    const search1 = await memoryService.searchMemories(
      'conv-company1-123',
      testCustomer,
      'منتج',
      5,
      company1
    );

    console.log(`🔍 بحث الشركة الأولى عن "منتج": ${search1.length} نتيجة`);
    search1.forEach((result, index) => {
      console.log(`   ${index + 1}. [${result.companyId}] ${result.userMessage.substring(0, 40)}...`);
    });

    const search2 = await memoryService.searchMemories(
      'conv-company2-456',
      testCustomer,
      'خدمات',
      5,
      company2
    );

    console.log(`🔍 بحث الشركة الثانية عن "خدمات": ${search2.length} نتيجة`);
    search2.forEach((result, index) => {
      console.log(`   ${index + 1}. [${result.companyId}] ${result.userMessage.substring(0, 40)}...`);
    });

    // 7. فحص الذاكرة قصيرة المدى
    console.log('\n💾 فحص الذاكرة قصيرة المدى...');
    console.log('عدد المفاتيح في الذاكرة قصيرة المدى:', memoryService.shortTermMemory.size);
    
    for (const [key, value] of memoryService.shortTermMemory.entries()) {
      console.log(`🔑 مفتاح: ${key}`);
      console.log(`📊 عدد السجلات: ${Array.isArray(value) ? value.length : 0}`);
      
      if (Array.isArray(value) && value.length > 0) {
        value.forEach((item, index) => {
          console.log(`   ${index + 1}. [${item.companyId || 'غير محدد'}] ${item.userMessage?.substring(0, 30)}...`);
        });
      }
    }

    // 8. تحليل نهائي
    console.log('\n📊 تحليل نهائي:');
    
    const hasLeak = leakTest1.length > 0 || leakTest2.length > 0;
    
    if (hasLeak) {
      console.log('🚨 مشكلة عزل مكتشفة!');
      console.log('❌ الشركات يمكنها الوصول لبيانات بعضها البعض');
      console.log('⚠️ النظام غير آمن للإنتاج');
    } else {
      console.log('✅ العزل يعمل بشكل صحيح');
      console.log('✅ كل شركة ترى بياناتها فقط');
      console.log('✅ النظام آمن');
    }

  } catch (error) {
    console.error('❌ خطأ في اختبار العزل:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testRealMemoryIsolation().catch(console.error);
