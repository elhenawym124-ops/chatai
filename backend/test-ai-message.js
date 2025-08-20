const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAIMessage() {
  try {
    console.log('🧪 اختبار رسالة للذكاء الاصطناعي...\n');

    // البحث عن شركة لديها مفتاح نشط
    const activeKey = await prisma.geminiKey.findFirst({
      where: { isActive: true },
      include: { company: true }
    });

    if (!activeKey) {
      console.log('❌ لا توجد مفاتيح نشطة');
      return;
    }

    console.log(`✅ استخدام شركة: ${activeKey.company.name}`);
    console.log(`✅ مفتاح Gemini: ${activeKey.id}`);

    const conversationId = 'test-conversation-' + Date.now();
    const customerId = 'test-customer-' + Date.now();

    // إنشاء عميل أولاً
    const customer = await prisma.customer.create({
      data: {
        id: customerId,
        firstName: 'عميل',
        lastName: 'تجريبي',
        phone: '+201234567890',
        companyId: activeKey.companyId,
        facebookId: 'test-facebook-' + Date.now()
      }
    });

    // إنشاء محادثة
    const conversation = await prisma.conversation.create({
      data: {
        id: conversationId,
        customerId: customerId,
        companyId: activeKey.companyId,
        channel: 'FACEBOOK',
        status: 'ACTIVE'
      }
    });

    // إنشاء رسالة اختبار
    const testMessage = await prisma.message.create({
      data: {
        conversationId: conversationId,
        content: 'مرحباً، أريد معرفة المزيد عن منتجاتكم',
        type: 'TEXT',
        isFromCustomer: true,
        metadata: JSON.stringify({
          companyId: activeKey.companyId,
          customerId: customerId,
          customerName: 'عميل تجريبي',
          customerPhone: '+201234567890'
        })
      }
    });

    console.log(`✅ تم إنشاء رسالة اختبار: ${testMessage.id}`);
    console.log(`📝 المحتوى: ${testMessage.content}`);
    
    // انتظار قليل لمعالجة الرسالة
    console.log('\n⏳ انتظار معالجة الرسالة...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // فحص إذا تم إنشاء رد AI
    const aiInteraction = await prisma.aiInteraction.findFirst({
      where: {
        customerId: customerId,
        companyId: activeKey.companyId
      },
      orderBy: { createdAt: 'desc' }
    });

    if (aiInteraction) {
      console.log('\n✅ تم إنشاء رد من الذكاء الاصطناعي!');
      console.log(`🤖 الرد: ${aiInteraction.response}`);
      console.log(`⚡ النموذج: ${aiInteraction.model}`);
      console.log(`🎯 الثقة: ${aiInteraction.confidence}`);
    } else {
      console.log('\n❌ لم يتم إنشاء رد من الذكاء الاصطناعي');
      
      // فحص الرسائل الأخيرة في اللوج
      console.log('\n🔍 فحص آخر رسائل اللوج...');
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAIMessage();
