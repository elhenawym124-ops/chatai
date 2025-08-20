const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLatestMessages() {
  console.log('📨 فحص آخر الرسائل الواردة...');
  
  try {
    // جلب آخر 10 رسائل
    const latestMessages = await prisma.message.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        conversation: {
          include: {
            customer: true
          }
        }
      }
    });
    
    console.log(`\n📊 آخر ${latestMessages.length} رسائل:`);
    console.log('=====================================');
    
    latestMessages.forEach((message, index) => {
      const timeAgo = Math.round((Date.now() - new Date(message.createdAt).getTime()) / 1000);
      const customer = message.conversation?.customer;
      
      console.log(`\n${index + 1}. رسالة من: ${customer?.firstName || 'غير معروف'} ${customer?.lastName || ''}`);
      console.log(`   المحتوى: ${message.content}`);
      console.log(`   النوع: ${message.messageType}`);
      console.log(`   الاتجاه: ${message.direction}`);
      console.log(`   المنصة: ${message.platform}`);
      console.log(`   الوقت: ${message.createdAt} (منذ ${timeAgo} ثانية)`);
      console.log(`   معرف المحادثة: ${message.conversationId}`);
      console.log(`   معرف العميل: ${customer?.facebookId || 'غير محدد'}`);
    });
    
    // فحص المحادثات النشطة
    console.log('\n💬 المحادثات النشطة:');
    const activeConversations = await prisma.conversation.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        customer: true,
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 5
    });
    
    activeConversations.forEach((conv, index) => {
      const timeAgo = Math.round((Date.now() - new Date(conv.updatedAt).getTime()) / 1000);
      console.log(`\n${index + 1}. محادثة مع: ${conv.customer?.firstName || 'غير معروف'}`);
      console.log(`   عدد الرسائل: ${conv._count.messages}`);
      console.log(`   آخر تحديث: منذ ${timeAgo} ثانية`);
      console.log(`   المنصة: ${conv.platform}`);
      console.log(`   الحالة: ${conv.status}`);
    });
    
    // فحص العملاء الجدد
    console.log('\n👥 العملاء الجدد:');
    const newCustomers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3
    });
    
    newCustomers.forEach((customer, index) => {
      const timeAgo = Math.round((Date.now() - new Date(customer.createdAt).getTime()) / 1000);
      console.log(`\n${index + 1}. ${customer.firstName || 'غير معروف'} ${customer.lastName || ''}`);
      console.log(`   Facebook ID: ${customer.facebookId}`);
      console.log(`   الهاتف: ${customer.phone || 'غير محدد'}`);
      console.log(`   تاريخ التسجيل: منذ ${timeAgo} ثانية`);
    });
    
  } catch (error) {
    console.error('❌ خطأ في فحص الرسائل:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLatestMessages();
