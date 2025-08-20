const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * إصلاح المحادثات الموجودة من فيسبوك لإضافة معرفات العملاء المطلوبة
 */
async function fixFacebookConversations() {
  console.log('🔧 بدء إصلاح المحادثات من فيسبوك...');
  
  try {
    // البحث عن المحادثات من فيسبوك بدون معرف العميل
    const facebookConversations = await prisma.conversation.findMany({
      where: {
        channel: 'FACEBOOK'
      },
      include: {
        customer: true,
        messages: {
          take: 1,
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    console.log(`📊 وُجد ${facebookConversations.length} محادثة تحتاج إصلاح`);

    let fixedCount = 0;
    
    for (const conversation of facebookConversations) {
      try {
        // البحث عن معرف العميل من فيسبوك
        const customer = conversation.customer;
        
        if (customer && customer.facebookId) {
          // تحديث المحادثة بمعرف العميل من فيسبوك
          await prisma.conversation.update({
            where: { id: conversation.id },
            data: {
              // إضافة معرف العميل من فيسبوك في metadata
              metadata: {
                facebookPageScopedId: customer.facebookId,
                platform: 'FACEBOOK'
              }
            }
          });
          
          fixedCount++;
          console.log(`✅ تم إصلاح المحادثة ${conversation.id} للعميل ${customer.firstName} ${customer.lastName}`);
        } else {
          console.log(`⚠️ لا يمكن إصلاح المحادثة ${conversation.id} - معرف العميل من فيسبوك غير متوفر`);
        }
      } catch (error) {
        console.error(`❌ خطأ في إصلاح المحادثة ${conversation.id}:`, error.message);
      }
    }
    
    console.log(`🎉 تم إصلاح ${fixedCount} محادثة من أصل ${facebookConversations.length}`);
    
    // عرض المحادثات المُصلحة
    const fixedConversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { channel: 'FACEBOOK' },
          { platform: 'FACEBOOK' }
        ],
        facebookPageScopedId: { not: null }
      },
      include: {
        customer: true
      }
    });
    
    console.log('\n📋 المحادثات المُصلحة:');
    fixedConversations.forEach(conv => {
      console.log(`- المحادثة ${conv.id}: ${conv.customer.firstName} ${conv.customer.lastName} (${conv.facebookPageScopedId})`);
    });
    
  } catch (error) {
    console.error('❌ خطأ في إصلاح المحادثات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * فحص حالة المحادثات من فيسبوك
 */
async function checkFacebookConversations() {
  console.log('🔍 فحص حالة المحادثات من فيسبوك...');
  
  try {
    const totalConversations = await prisma.conversation.count({
      where: {
        channel: 'FACEBOOK'
      }
    });
    
    console.log('📊 إحصائيات المحادثات:');
    console.log(`- إجمالي محادثات فيسبوك: ${totalConversations}`);
    
    // فحص المحادثات التي تحتوي على معرف فيسبوك في metadata
    const conversationsWithMetadata = await prisma.conversation.findMany({
      where: {
        channel: 'FACEBOOK',
        metadata: { not: null }
      },
      select: {
        id: true,
        metadata: true
      }
    });
    
    let withFacebookId = 0;
    conversationsWithMetadata.forEach(conv => {
      if (conv.metadata && conv.metadata.facebookPageScopedId) {
        withFacebookId++;
      }
    });
    
    const withoutFacebookId = totalConversations - withFacebookId;
    
    console.log(`✅ محادثات بمعرف فيسبوك: ${withFacebookId}`);
    console.log(`❌ محادثات بدون معرف فيسبوك: ${withoutFacebookId}`);
    
  } catch (error) {
    console.error('❌ خطأ في فحص المحادثات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الإصلاح
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'check') {
    checkFacebookConversations();
  } else if (command === 'fix') {
    fixFacebookConversations();
  } else {
    console.log('الاستخدام:');
    console.log('node fix-facebook-conversations.js check  - فحص حالة المحادثات');
    console.log('node fix-facebook-conversations.js fix    - إصلاح المحادثات');
  }
}

module.exports = {
  fixFacebookConversations,
  checkFacebookConversations
};
