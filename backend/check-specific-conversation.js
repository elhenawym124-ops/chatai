const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSpecificConversation() {
  try {
    const conversationId = process.argv[2] || 'cme2vbssx000juf94ybxi6xk7';
    console.log(`🔍 فحص المحادثة: ${conversationId}`);
    
    // جلب المحادثة
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        customer: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 100
        }
      }
    });
    
    if (!conversation) {
      console.log('❌ المحادثة غير موجودة');
      return;
    }
    
    console.log(`✅ المحادثة موجودة - العميل: ${conversation.customer.firstName} ${conversation.customer.lastName}`);
    console.log(`📱 معرف فيسبوك: ${conversation.customer.facebookId}`);
    console.log(`📅 تاريخ الإنشاء: ${conversation.createdAt}`);
    console.log(`📊 عدد الرسائل: ${conversation.messages.length}`);
    
    console.log('\n📝 تسلسل الرسائل:');
    console.log('='.repeat(100));
    
    conversation.messages.forEach((msg, i) => {
      const time = new Date(msg.createdAt).toLocaleString('ar-EG');
      const sender = msg.isFromCustomer ? '👤 العميل' : '🤖 الدعم';
      const type = msg.type || 'TEXT';
      
      console.log(`\n${i+1}. [${time}] ${sender} (${type}):`);
      console.log(`   ${msg.content}`);
      
      // فحص إذا كانت رسالة تحتوي على صور
      if (msg.type === 'IMAGE' || msg.content.includes('صور') || msg.content.includes('صورة') || msg.content.includes('ابعت')) {
        console.log('   🖼️ *** رسالة متعلقة بالصور ***');
      }
      
      // فحص الـ metadata
      if (msg.metadata) {
        try {
          const metadata = JSON.parse(msg.metadata);
          console.log(`   📋 Metadata:`, metadata);
        } catch (e) {
          console.log(`   📋 Metadata (raw): ${msg.metadata}`);
        }
      }
      
      console.log('   ' + '-'.repeat(80));
    });
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSpecificConversation();
