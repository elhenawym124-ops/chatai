const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🔍 فحص قاعدة البيانات...');
  
  try {
    // فحص جميع صفحات Facebook
    console.log('\n📱 صفحات Facebook في قاعدة البيانات:');
    const facebookPages = await prisma.facebookPage.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    if (facebookPages.length === 0) {
      console.log('❌ لا توجد صفحات Facebook في قاعدة البيانات');
    } else {
      console.log(`✅ تم العثور على ${facebookPages.length} صفحة:`);
      
      facebookPages.forEach((page, index) => {
        console.log(`\n${index + 1}. ${page.pageName}`);
        console.log(`   ID: ${page.id}`);
        console.log(`   Page ID: ${page.pageId}`);
        console.log(`   Company ID: ${page.companyId}`);
        console.log(`   Status: ${page.status}`);
        console.log(`   Connected At: ${page.connectedAt}`);
        console.log(`   Created At: ${page.createdAt}`);
        console.log(`   Updated At: ${page.updatedAt}`);
        console.log(`   Access Token: ${page.pageAccessToken.substring(0, 30)}...`);
      });
    }
    
    // فحص الصفحة المحددة
    console.log('\n🎯 فحص الصفحة المحددة 250528358137901:');
    const targetPage = await prisma.facebookPage.findUnique({
      where: { pageId: '250528358137901' }
    });
    
    if (targetPage) {
      console.log('✅ الصفحة موجودة في قاعدة البيانات:');
      console.log(`   اسم الصفحة: ${targetPage.pageName}`);
      console.log(`   Page ID: ${targetPage.pageId}`);
      console.log(`   Company ID: ${targetPage.companyId}`);
      console.log(`   Status: ${targetPage.status}`);
      console.log(`   Connected At: ${targetPage.connectedAt}`);
      console.log(`   Access Token: ${targetPage.pageAccessToken.substring(0, 50)}...`);
      console.log(`   Token Length: ${targetPage.pageAccessToken.length}`);
    } else {
      console.log('❌ الصفحة 250528358137901 غير موجودة في قاعدة البيانات');
    }
    
    // إحصائيات عامة
    console.log('\n📊 إحصائيات قاعدة البيانات:');
    const customerCount = await prisma.customer.count();
    const conversationCount = await prisma.conversation.count();
    const messageCount = await prisma.message.count();
    
    console.log(`   العملاء: ${customerCount}`);
    console.log(`   المحادثات: ${conversationCount}`);
    console.log(`   الرسائل: ${messageCount}`);
    
  } catch (error) {
    console.error('❌ خطأ في فحص قاعدة البيانات:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n✅ تم إنهاء الفحص');
  }
}

checkDatabase();
