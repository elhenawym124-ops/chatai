const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  console.log('🔍 فحص بنية البيانات...');
  
  const conv = await prisma.conversation.findFirst({
    include: { messages: true }
  });
  
  if (conv) {
    console.log('محادثة:', conv.id);
    console.log('عدد الرسائل:', conv.messages.length);
    if (conv.messages[0]) {
      console.log('أول رسالة:', JSON.stringify(conv.messages[0], null, 2));
    }
  }
  
  // فحص الردود الموجودة
  const responses = await prisma.responseEffectiveness.count();
  console.log('عدد الردود الموجودة:', responses);
  
  // فحص النتائج الموجودة
  const outcomes = await prisma.conversationOutcome.count();
  console.log('عدد النتائج الموجودة:', outcomes);
  
  await prisma.$disconnect();
}

checkData().catch(console.error);
