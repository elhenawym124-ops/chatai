const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDeepMessages() {
  console.log('🔍 فحص عميق للرسائل والمشاكل...');
  
  try {
    // فحص آخر 5 رسائل بتفاصيل كاملة
    const messages = await prisma.message.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { 
        conversation: { 
          include: { customer: true } 
        } 
      }
    });
    
    console.log('\n📨 آخر 5 رسائل بالتفصيل:');
    console.log('='.repeat(80));
    
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const timeAgo = Math.round((Date.now() - new Date(msg.createdAt).getTime()) / 1000);
      const metadata = JSON.parse(msg.metadata || '{}');
      
      console.log(`\n${i+1}. رسالة منذ ${timeAgo} ثانية:`);
      console.log(`   📄 المحتوى: "${msg.content}"`);
      console.log(`   👤 من: ${msg.conversation?.customer?.firstName || 'غير معروف'}`);
      console.log(`   🔄 الاتجاه: ${msg.isFromCustomer ? 'من العميل' : 'من النظام'}`);
      console.log(`   📱 المنصة: ${metadata.platform || 'غير محدد'}`);
      console.log(`   🤖 AI: ${metadata.isAIGenerated ? 'نعم' : 'لا'}`);
      console.log(`   📊 Metadata: ${JSON.stringify(metadata, null, 2)}`);
      
      // فحص إذا كانت الرسالة تحتوي على صور
      if (msg.content.includes('صور') || msg.content.includes('صورة')) {
        console.log(`   🖼️ طلب صور: نعم`);
        
        // فحص إذا كان الرد يحتوي على صور فعلية
        if (metadata.images && metadata.images.length > 0) {
          console.log(`   📸 عدد الصور المرسلة: ${metadata.images.length}`);
          metadata.images.forEach((img, idx) => {
            console.log(`      ${idx+1}. ${img.title || 'بدون عنوان'}`);
          });
        } else {
          console.log(`   ⚠️ لا توجد صور في metadata`);
        }
      }
    }
    
    // فحص المحادثات النشطة
    console.log('\n💬 المحادثات النشطة:');
    console.log('='.repeat(50));
    
    const conversations = await prisma.conversation.findMany({
      where: { status: 'ACTIVE' },
      include: {
        customer: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 2
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 3
    });
    
    conversations.forEach((conv, i) => {
      console.log(`\n${i+1}. محادثة مع: ${conv.customer?.firstName || 'غير معروف'}`);
      console.log(`   📱 Facebook ID: ${conv.customer?.facebookId}`);
      console.log(`   📊 عدد الرسائل: ${conv.messages.length}`);
      
      if (conv.messages.length > 0) {
        const lastMsg = conv.messages[0];
        console.log(`   📝 آخر رسالة: "${lastMsg.content.substring(0, 50)}..."`);
        console.log(`   🔄 من: ${lastMsg.isFromCustomer ? 'العميل' : 'النظام'}`);
      }
    });
    
    // فحص الرسائل التي تحتوي على كلمات مفتاحية
    console.log('\n🔍 فحص الكلمات المفتاحية:');
    console.log('='.repeat(50));
    
    const keywords = ['كوتشي', 'صور', 'ابعت', 'التاني', 'الابيض'];
    
    for (const keyword of keywords) {
      const keywordMessages = await prisma.message.findMany({
        where: {
          content: {
            contains: keyword,
            mode: 'insensitive'
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 2,
        include: {
          conversation: {
            include: { customer: true }
          }
        }
      });
      
      console.log(`\n🔑 "${keyword}": ${keywordMessages.length} رسائل`);
      keywordMessages.forEach((msg, idx) => {
        const timeAgo = Math.round((Date.now() - new Date(msg.createdAt).getTime()) / 1000);
        console.log(`   ${idx+1}. [${timeAgo}s] "${msg.content.substring(0, 40)}..."`);
      });
    }
    
    // فحص الرسائل المولدة بـ AI
    console.log('\n🤖 الرسائل المولدة بالذكاء الصناعي:');
    console.log('='.repeat(50));
    
    const aiMessages = await prisma.message.findMany({
      where: {
        metadata: {
          contains: '"isAIGenerated":true'
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        conversation: {
          include: { customer: true }
        }
      }
    });
    
    aiMessages.forEach((msg, i) => {
      const timeAgo = Math.round((Date.now() - new Date(msg.createdAt).getTime()) / 1000);
      const metadata = JSON.parse(msg.metadata || '{}');
      
      console.log(`\n${i+1}. رسالة AI منذ ${timeAgo} ثانية:`);
      console.log(`   📄 المحتوى: "${msg.content.substring(0, 60)}..."`);
      console.log(`   ⏱️ وقت الاستجابة: ${metadata.responseTime || 'غير محدد'}ms`);
      console.log(`   📊 الثقة: ${metadata.confidence || 'غير محدد'}`);
      console.log(`   🎯 النية: ${metadata.intent || 'غير محدد'}`);
      
      if (metadata.images) {
        console.log(`   📸 الصور: ${metadata.images.length} صورة`);
      }
    });

  } catch (error) {
    console.error('❌ خطأ في الفحص العميق:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDeepMessages();
