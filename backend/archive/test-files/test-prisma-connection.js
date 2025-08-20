const { PrismaClient } = require('@prisma/client');

async function testPrismaConnection() {
  console.log('🔍 اختبار Prisma...');
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  
  try {
    console.log('📡 محاولة الاتصال بـ Prisma...');
    
    // اختبار الاتصال
    await prisma.$connect();
    console.log('✅ تم الاتصال بـ Prisma بنجاح!');
    
    // اختبار استعلام بسيط
    const companyCount = await prisma.company.count();
    console.log('✅ عدد الشركات:', companyCount);
    
    // اختبار جلب الشركات
    const companies = await prisma.company.findMany();
    console.log('✅ الشركات:', companies);
    
    // اختبار جلب المحادثات
    const conversations = await prisma.conversation.findMany({
      take: 2
    });
    console.log('✅ المحادثات:', conversations);
    
    // اختبار جلب الرسائل
    const messages = await prisma.message.findMany({
      take: 2
    });
    console.log('✅ الرسائل:', messages);
    
  } catch (error) {
    console.error('❌ فشل اختبار Prisma:');
    console.error('🔴 نوع الخطأ:', error.code);
    console.error('🔴 رسالة الخطأ:', error.message);
    console.error('🔴 التفاصيل:', error);
  } finally {
    await prisma.$disconnect();
    console.log('✅ تم قطع الاتصال من Prisma');
  }
}

testPrismaConnection();
