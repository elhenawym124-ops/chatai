const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function testSolaPageSending() {
  console.log('🧪 اختبار إرسال رسالة من صفحة "سولا 132"...\n');
  
  try {
    // البحث عن صفحة "سولا 132" تحديداً
    const solaPage = await prisma.facebookPage.findFirst({
      where: {
        pageName: 'سولا 132',
        status: 'connected'
      }
    });
    
    if (!solaPage) {
      console.log('❌ لم يتم العثور على صفحة "سولا 132"');
      return;
    }
    
    console.log(`✅ وُجدت صفحة "سولا 132"`);
    console.log(`   🆔 معرف الصفحة: ${solaPage.pageId}`);
    console.log(`   🔑 طول التوكن: ${solaPage.pageAccessToken.length}`);
    
    // اختبار صحة التوكن أولاً
    console.log('\n🔍 اختبار صحة التوكن...');
    try {
      const tokenTest = await axios.get(`https://graph.facebook.com/v18.0/${solaPage.pageId}`, {
        params: {
          access_token: solaPage.pageAccessToken,
          fields: 'id,name'
        }
      });
      
      console.log(`✅ التوكن صحيح - اسم الصفحة: ${tokenTest.data.name}`);
      console.log(`✅ معرف الصفحة المؤكد: ${tokenTest.data.id}`);
      
    } catch (error) {
      console.log('❌ التوكن غير صحيح:', error.message);
      return;
    }
    
    // الآن اختبار إرسال رسالة
    console.log('\n📤 اختبار إرسال رسالة...');
    
    // معرف تجريبي رقمي للاختبار
    const testRecipientId = '1234567890123456';
    const testMessage = `🧪 رسالة اختبار من صفحة "سولا 132" - ${new Date().toLocaleString('ar-EG')}`;
    
    console.log(`🎯 إرسال لـ: ${testRecipientId}`);
    console.log(`💬 الرسالة: ${testMessage}`);
    
    const messageData = {
      recipient: { id: testRecipientId },
      message: { text: testMessage }
    };
    
    const url = `https://graph.facebook.com/v18.0/${solaPage.pageId}/messages`;
    
    try {
      const response = await axios.post(url, messageData, {
        params: { access_token: solaPage.pageAccessToken },
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('\n🎉 تم إرسال الرسالة بنجاح!');
      console.log('📋 معرف الرسالة:', response.data.message_id);
      console.log('✅ الصفحة المستخدمة: سولا 132');
      
    } catch (error) {
      console.log('\n❌ فشل الإرسال:', error.message);
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        console.log('🔍 تفاصيل الخطأ من فيسبوك:');
        console.log(`- الكود: ${errorData.error?.code}`);
        console.log(`- النوع: ${errorData.error?.type}`);
        console.log(`- الرسالة: ${errorData.error?.message}`);
        
        // تحليل نوع الخطأ
        if (errorData.error?.code === 100) {
          if (errorData.error.message.includes('recipient')) {
            console.log('\n💡 المشكلة: معرف المستلم غير صحيح أو لم يتفاعل مع الصفحة');
            console.log('🔧 الحل: استخدام معرف عميل حقيقي تفاعل مع صفحة "سولا 132"');
          } else if (errorData.error.message.includes('معرف الصفحة')) {
            console.log('\n💡 المشكلة: عدم تطابق Page Access Token مع الصفحة');
            console.log('🔧 الحل: تحديث التوكن الخاص بصفحة "سولا 132"');
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ عام:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function findRealConversationForSola() {
  console.log('🔍 البحث عن محادثة حقيقية مع صفحة "سولا 132"...\n');
  
  try {
    // البحث عن محادثات تحتوي على معرف صفحة "سولا 132"
    const solaPage = await prisma.facebookPage.findFirst({
      where: { pageName: 'سولا 132' }
    });
    
    if (!solaPage) {
      console.log('❌ لم يتم العثور على صفحة "سولا 132"');
      return;
    }
    
    console.log(`📄 صفحة "سولا 132" - معرف: ${solaPage.pageId}`);
    
    // البحث عن محادثات مرتبطة بهذه الصفحة
    const conversations = await prisma.conversation.findMany({
      where: {
        channel: 'FACEBOOK',
        OR: [
          {
            metadata: {
              path: ['facebookPageId'],
              equals: solaPage.pageId
            }
          },
          {
            metadata: {
              path: ['platform'],
              equals: 'FACEBOOK'
            }
          }
        ]
      },
      include: {
        customer: true,
        messages: {
          take: 2,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log(`📊 وُجد ${conversations.length} محادثة من فيسبوك:`);
    
    conversations.forEach((conv, index) => {
      console.log(`\n${index + 1}. المحادثة ${conv.id}:`);
      console.log(`   👤 العميل: ${conv.customer.firstName} ${conv.customer.lastName}`);
      
      const facebookId = conv.customer.facebookId || 
        (conv.metadata && conv.metadata.facebookPageScopedId);
      
      console.log(`   🆔 معرف فيسبوك: ${facebookId || 'غير متوفر'}`);
      console.log(`   📋 Metadata:`, conv.metadata || 'غير متوفر');
      
      if (conv.messages.length > 0) {
        console.log(`   📝 آخر رسالة: "${conv.messages[0].content.substring(0, 50)}..."`);
      }
      
      // تحديد إذا كان معرف صحيح
      const isValidId = facebookId && /^\d+$/.test(facebookId) && facebookId !== 'test-gemini-final';
      console.log(`   ${isValidId ? '✅ معرف صحيح' : '❌ معرف غير صحيح'}`);
      
      if (isValidId) {
        console.log(`   🎯 يمكن اختبار الإرسال لهذا العميل`);
      }
    });
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الاختبارات
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'test') {
    testSolaPageSending();
  } else if (command === 'find') {
    findRealConversationForSola();
  } else {
    console.log('الاستخدام:');
    console.log('node test-sola-page.js test  - اختبار إرسال رسالة من صفحة سولا 132');
    console.log('node test-sola-page.js find  - البحث عن محادثات حقيقية مع سولا 132');
  }
}

module.exports = {
  testSolaPageSending,
  findRealConversationForSola
};
