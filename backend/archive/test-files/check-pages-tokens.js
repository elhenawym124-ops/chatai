const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function checkPagesAndTokens() {
  try {
    console.log('🔍 فحص الصفحات والتوكينات...\n');
    
    const pages = await prisma.facebookPage.findMany({
      where: { status: 'connected' },
      include: { company: true }
    });
    
    if (pages.length === 0) {
      console.log('❌ لا توجد صفحات مربوطة');
      return;
    }
    
    console.log(`📄 وُجد ${pages.length} صفحة مربوطة:\n`);
    
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      console.log(`${i + 1}. ${page.pageName}`);
      console.log(`   🆔 معرف الصفحة: ${page.pageId}`);
      console.log(`   🏢 الشركة: ${page.company.name}`);
      console.log(`   🔑 طول التوكن: ${page.pageAccessToken ? page.pageAccessToken.length : 0}`);
      console.log(`   🔑 أول 30 حرف: ${page.pageAccessToken ? page.pageAccessToken.substring(0, 30) + '...' : 'غير متوفر'}`);
      console.log(`   📊 الحالة: ${page.status}`);
      
      // اختبار صحة التوكن
      if (page.pageAccessToken) {
        console.log('   🧪 اختبار صحة التوكن...');
        try {
          const response = await axios.get(`https://graph.facebook.com/v18.0/${page.pageId}`, {
            params: {
              access_token: page.pageAccessToken,
              fields: 'id,name'
            }
          });
          
          console.log(`   ✅ التوكن صحيح - اسم الصفحة: ${response.data.name}`);
          console.log(`   ✅ معرف الصفحة المؤكد: ${response.data.id}`);
          
          if (response.data.id === page.pageId) {
            console.log('   ✅ التوكن يطابق الصفحة تماماً');
          } else {
            console.log('   ❌ التوكن لا يطابق الصفحة!');
            console.log(`       المتوقع: ${page.pageId}`);
            console.log(`       الفعلي: ${response.data.id}`);
          }
          
        } catch (error) {
          console.log('   ❌ التوكن غير صحيح أو منتهي الصلاحية');
          if (error.response && error.response.data) {
            console.log(`   ❌ خطأ فيسبوك: ${error.response.data.error?.message}`);
          }
        }
      } else {
        console.log('   ❌ لا يوجد توكن');
      }
      
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function testMessageSending() {
  console.log('🧪 اختبار إرسال رسالة بالتوكن الصحيح...\n');
  
  try {
    const pages = await prisma.facebookPage.findMany({
      where: { status: 'connected' }
    });
    
    if (pages.length === 0) {
      console.log('❌ لا توجد صفحات للاختبار');
      return;
    }
    
    const page = pages[0]; // استخدام أول صفحة
    console.log(`📄 اختبار الصفحة: ${page.pageName} (${page.pageId})`);
    
    // معرف تجريبي رقمي
    const testRecipientId = '1234567890123456';
    const testMessage = `🧪 اختبار إرسال - ${new Date().toLocaleString('ar-EG')}`;
    
    console.log(`🎯 إرسال لـ: ${testRecipientId}`);
    console.log(`💬 الرسالة: ${testMessage}`);
    
    const messageData = {
      recipient: { id: testRecipientId },
      message: { text: testMessage }
    };
    
    const url = `https://graph.facebook.com/v18.0/${page.pageId}/messages`;
    
    try {
      const response = await axios.post(url, messageData, {
        params: { access_token: page.pageAccessToken },
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('🎉 تم إرسال الرسالة بنجاح!');
      console.log('📋 معرف الرسالة:', response.data.message_id);
      
    } catch (error) {
      console.log('❌ فشل الإرسال:', error.message);
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        console.log('🔍 تفاصيل الخطأ:');
        console.log(`- الكود: ${errorData.error?.code}`);
        console.log(`- النوع: ${errorData.error?.type}`);
        console.log(`- الرسالة: ${errorData.error?.message}`);
        
        // تحليل الأخطاء الشائعة
        if (errorData.error?.code === 100) {
          if (errorData.error.message.includes('معرف الصفحة')) {
            console.log('\n💡 المشكلة: عدم تطابق Page Access Token مع الصفحة');
            console.log('🔧 الحل: تحديث التوكن أو استخدام الصفحة الصحيحة');
          } else if (errorData.error.message.includes('recipient')) {
            console.log('\n💡 المشكلة: معرف المستلم غير صحيح');
            console.log('🔧 الحل: استخدام معرف عميل حقيقي تفاعل مع الصفحة');
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

// تشغيل الاختبارات
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'check') {
    checkPagesAndTokens();
  } else if (command === 'test') {
    testMessageSending();
  } else {
    console.log('الاستخدام:');
    console.log('node check-pages-tokens.js check  - فحص الصفحات والتوكينات');
    console.log('node check-pages-tokens.js test   - اختبار إرسال رسالة');
  }
}

module.exports = {
  checkPagesAndTokens,
  testMessageSending
};
