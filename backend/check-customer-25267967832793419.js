const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findConversation() {
  try {
    console.log('🔍 البحث عن المحادثة للعميل: 25267967832793419');
    
    // البحث عن العميل
    const customer = await prisma.customer.findFirst({
      where: {
        facebookId: '25267967832793419'
      },
      include: {
        company: true
      }
    });
    
    if (!customer) {
      console.log('❌ لم يتم العثور على العميل');
      return;
    }
    
    console.log('✅ تم العثور على العميل:');
    console.log('   🆔 ID:', customer.id);
    console.log('   👤 الاسم:', customer.firstName, customer.lastName);
    console.log('   📱 Facebook ID:', customer.facebookId);
    console.log('   🏢 الشركة:', customer.company?.name);
    
    // البحث عن المحادثات
    const conversations = await prisma.conversation.findMany({
      where: {
        customerId: customer.id
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('\n💬 المحادثات الموجودة:', conversations.length);
    
    conversations.forEach((conv, index) => {
      console.log('\n' + '='.repeat(60));
      console.log('📋 محادثة', index + 1, ':', conv.id);
      console.log('📅 تاريخ الإنشاء:', conv.createdAt.toLocaleString('ar-EG'));
      console.log('📊 الحالة:', conv.status);
      console.log('📝 عدد الرسائل:', conv.messages.length);
      
      if (conv.messages.length > 0) {
        console.log('\n📨 آخر الرسائل:');
        conv.messages.forEach((msg, i) => {
          const sender = msg.isFromCustomer ? '👤 العميل' : '🤖 النظام';
          const time = msg.createdAt.toLocaleString('ar-EG');
          console.log('   ' + (i+1) + '. [' + time + '] ' + sender + ':');
          console.log('      ' + msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : ''));
        });
      }
    });
    
    // البحث عن الطلبات
    console.log('\n🛒 البحث عن الطلبات...');
    const orders = await prisma.order.findMany({
      where: {
        customerId: customer.id
      },
      include: {
        items: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('📦 عدد الطلبات:', orders.length);
    orders.forEach((order, index) => {
      console.log('\n📦 طلب', index + 1, ':', order.orderNumber);
      console.log('   💰 الإجمالي:', order.total, order.currency);
      console.log('   📊 الحالة:', order.status);
      console.log('   📅 تاريخ الإنشاء:', order.createdAt.toLocaleString('ar-EG'));
      console.log('   🔗 المحادثة:', order.conversationId);
      console.log('   🎯 طريقة الاستخراج:', order.extractionMethod);
      console.log('   📊 مستوى الثقة:', order.confidence);
    });
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

findConversation();
