const { PrismaClient } = require('@prisma/client');

async function checkData() {
  const prisma = new PrismaClient();
  
  try {
    const customerCount = await prisma.customer.count();
    const productCount = await prisma.product.count();
    const conversationCount = await prisma.conversation.count();
    const messageCount = await prisma.message.count();
    const orderCount = await prisma.order.count();
    
    console.log('📊 Database Status:');
    console.log('- Customers:', customerCount);
    console.log('- Products:', productCount);
    console.log('- Conversations:', conversationCount);
    console.log('- Messages:', messageCount);
    console.log('- Orders:', orderCount);
    
    if (customerCount > 0) {
      console.log('\n✅ البيانات موجودة في قاعدة البيانات!');
    } else {
      console.log('\n❌ لا توجد بيانات في قاعدة البيانات');
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
