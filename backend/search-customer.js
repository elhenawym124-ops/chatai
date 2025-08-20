const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function searchSpecificCustomer() {
  try {
    const targetId = '24283883604576317';
    console.log(`🔍 البحث المفصل عن العميل: ${targetId}`);
    
    // البحث في جدول العملاء
    console.log('📋 البحث في جدول العملاء...');
    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { facebookId: targetId },
          { firstName: { contains: targetId } },
          { lastName: { contains: targetId } },
          { email: { contains: targetId } }
        ]
      }
    });

    console.log(`عدد العملاء الموجودين: ${customers.length}`);
    customers.forEach(customer => {
      console.log(`✅ عميل: ${customer.id} - ${customer.firstName} ${customer.lastName} - ${customer.facebookId}`);
    });
    
    // البحث في جدول الرسائل
    console.log('\n📨 البحث في جدول الرسائل...');
    const messages = await prisma.message.findMany({
      where: {
        senderId: targetId
      },
      include: {
        conversation: {
          include: {
            customer: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`عدد الرسائل الموجودة: ${messages.length}`);
    messages.forEach((msg, index) => {
      console.log(`📝 رسالة ${index + 1}:`);
      console.log(`   المحتوى: ${msg.content.substring(0, 50)}...`);
      console.log(`   التاريخ: ${msg.createdAt}`);
      console.log(`   المحادثة: ${msg.conversationId}`);
      console.log(`   العميل: ${msg.conversation?.customer?.name || 'غير محدد'}`);
    });
    
    // البحث في جدول المحادثات
    console.log('\n💬 البحث في جدول المحادثات...');
    const conversations = await prisma.conversation.findMany({
      where: {
        customer: {
          OR: [
            { facebookId: targetId },
            { firstName: { contains: targetId } },
            { lastName: { contains: targetId } }
          ]
        }
      },
      include: {
        customer: true,
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 3
        }
      }
    });

    console.log(`عدد المحادثات الموجودة: ${conversations.length}`);
    conversations.forEach((conv, index) => {
      console.log(`💬 محادثة ${index + 1}: ${conv.id}`);
      console.log(`   العميل: ${conv.customer.firstName} ${conv.customer.lastName}`);
      console.log(`   عدد الرسائل: ${conv.messages.length}`);
    });
    
    // البحث العام في جميع العملاء للتأكد
    console.log('\n🔍 البحث العام في جميع العملاء...');
    const allCustomers = await prisma.customer.findMany({
      where: {
        OR: [
          { firstName: { contains: '24283883604576317' } },
          { lastName: { contains: '24283883604576317' } }
        ]
      }
    });

    console.log(`عدد العملاء المطابقين: ${allCustomers.length}`);

    if (allCustomers.length === 0) {
      console.log('❌ العميل غير موجود في قاعدة البيانات');

      // فحص آخر 10 عملاء تم إنشاؤهم
      console.log('\n📊 آخر 10 عملاء تم إنشاؤهم:');
      const recentCustomers = await prisma.customer.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      });

      recentCustomers.forEach((customer, index) => {
        console.log(`${index + 1}. ${customer.firstName} ${customer.lastName} - ${customer.facebookId} - ${customer.createdAt}`);
      });
    }
    
  } catch (error) {
    console.error('❌ خطأ في البحث:', error);
  } finally {
    await prisma.$disconnect();
  }
}

searchSpecificCustomer();
