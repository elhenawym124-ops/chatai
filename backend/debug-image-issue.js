const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugImageIssue() {
  try {
    console.log('🔍 فحص مشكلة إرسال الصور للعميل: 24174399225553309');
    
    // 1. فحص العميل والمحادثة
    const customer = await prisma.customer.findFirst({
      where: { facebookId: '24174399225553309' }
    });
    
    if (!customer) {
      console.log('❌ العميل غير موجود');
      return;
    }
    
    console.log(`✅ العميل موجود: ${customer.firstName} ${customer.lastName}`);
    
    // 2. فحص المحادثات
    const conversations = await prisma.conversation.findMany({
      where: { customerId: customer.id },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`💬 عدد المحادثات: ${conversations.length}`);
    
    if (conversations.length === 0) {
      console.log('❌ لا توجد محادثات');
      return;
    }
    
    const latestConversation = conversations[0];
    console.log(`📝 آخر محادثة: ${latestConversation.id}`);
    console.log(`📅 تاريخ الإنشاء: ${latestConversation.createdAt}`);
    console.log(`📊 عدد الرسائل: ${latestConversation.messages.length}`);
    
    // 3. فحص آخر الرسائل
    console.log('\n📝 آخر 10 رسائل:');
    console.log('='.repeat(80));
    
    latestConversation.messages.slice(0, 10).forEach((msg, i) => {
      const time = new Date(msg.createdAt).toLocaleString('ar-EG');
      const sender = msg.isFromCustomer ? '👤 العميل' : '🤖 الدعم';
      
      console.log(`${i+1}. [${time}] ${sender}:`);
      console.log(`   "${msg.content}"`);
      console.log(`   النوع: ${msg.type}`);
      
      if (msg.content.includes('السلام عليكم')) {
        console.log('   🎯 *** هذه رسالة "السلام عليكم" ***');
      }
      
      if (msg.content.includes('صور') || msg.content.includes('صورة')) {
        console.log('   🖼️ *** رسالة متعلقة بالصور ***');
      }
      
      console.log('   ' + '-'.repeat(60));
    });
    
    // 4. فحص الذاكرة
    console.log('\n🧠 فحص ذاكرة المحادثة:');
    const memoryRecords = await prisma.conversationMemory.findMany({
      where: {
        conversationId: latestConversation.id,
        senderId: '24174399225553309'
      },
      orderBy: { timestamp: 'desc' },
      take: 5
    });
    
    console.log(`💾 عدد سجلات الذاكرة: ${memoryRecords.length}`);
    
    memoryRecords.forEach((record, i) => {
      console.log(`${i+1}. رسالة العميل: "${record.userMessage}"`);
      console.log(`   رد AI: "${record.aiResponse.substring(0, 100)}..."`);
      console.log(`   التاريخ: ${record.timestamp}`);
      console.log('   ' + '-'.repeat(40));
    });
    
    console.log('\n✅ انتهى الفحص');
    
  } catch (error) {
    console.error('❌ خطأ في الفحص:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugImageIssue();
