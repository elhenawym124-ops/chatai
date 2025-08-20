const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLatest() {
  console.log('🔍 فحص آخر 3 رسائل...');
  
  const latest = await prisma.message.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: { 
      conversation: { 
        include: { customer: true } 
      } 
    }
  });
  
  latest.forEach((msg, i) => {
    const timeAgo = Math.round((Date.now() - new Date(msg.createdAt).getTime()) / 1000);
    console.log(`${i+1}. [${timeAgo}s ago] ${msg.content.substring(0, 50)}...`);
    console.log(`   من: ${msg.conversation?.customer?.firstName || 'غير معروف'}`);
    console.log(`   معرف: ${msg.conversation?.customer?.facebookId}`);
  });
  
  await prisma.$disconnect();
}

checkLatest();
