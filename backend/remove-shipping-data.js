const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeShippingData() {
  try {
    console.log('🗑️ مسح معلومات الشحن من قاعدة البيانات...\n');
    
    // 1. مسح من قاعدة المعرفة
    console.log('1️⃣ مسح من قاعدة المعرفة...');
    const deletedKB = await prisma.knowledgeBase.deleteMany({
      where: {
        OR: [
          { id: 'kb_shipping_cost' },
          { id: 'kb_delivery_time' },
          { content: { contains: 'شحن' } },
          { content: { contains: 'توصيل' } },
          { tags: { contains: 'شحن' } },
          { tags: { contains: 'توصيل' } }
        ]
      }
    });
    console.log(`✅ تم مسح ${deletedKB.count} سجل من قاعدة المعرفة`);
    
    // 2. فحص الجداول المتاحة
    console.log('\n2️⃣ فحص الجداول المتاحة...');

    // محاولة مسح من جداول مختلفة إذا كانت موجودة
    try {
      if (prisma.fAQ) {
        const deletedFAQs = await prisma.fAQ.deleteMany({
          where: {
            OR: [
              { question: { contains: 'شحن' } },
              { question: { contains: 'توصيل' } },
              { answer: { contains: 'شحن' } },
              { answer: { contains: 'توصيل' } }
            ]
          }
        });
        console.log(`✅ تم مسح ${deletedFAQs.count} سؤال شائع`);
      }
    } catch (e) {
      console.log('⚠️ جدول FAQ غير موجود');
    }

    try {
      if (prisma.companyPolicy) {
        const deletedPolicies = await prisma.companyPolicy.deleteMany({
          where: {
            OR: [
              { title: { contains: 'شحن' } },
              { title: { contains: 'توصيل' } },
              { content: { contains: 'شحن' } },
              { content: { contains: 'توصيل' } }
            ]
          }
        });
        console.log(`✅ تم مسح ${deletedPolicies.count} سياسة`);
      }
    } catch (e) {
      console.log('⚠️ جدول CompanyPolicy غير موجود');
    }
    
    console.log('\n🎉 تم مسح جميع معلومات الشحن من قاعدة البيانات بنجاح!');
    console.log('الآن معلومات الشحن ستأتي فقط من البرومبت الأساسي');
    
  } catch (error) {
    console.error('❌ خطأ في مسح البيانات:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

removeShippingData();
