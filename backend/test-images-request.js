const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testImagesRequest() {
  console.log('📸 اختبار طلب الصور من الـ AI...\n');

  const conversationId = `images-test-${Date.now()}`;
  const senderId = 'images-customer';
  
  const customerData = {
    id: 'images-customer-id',
    name: 'عميل الصور',
    phone: '01777888999',
    email: 'images@example.com',
    orderCount: 0
  };

  try {
    console.log('📝 إرسال طلب صور الكوتشي...');
    
    const response = await axios.post(`${BASE_URL}/test-ai-direct`, {
      conversationId,
      senderId,
      content: 'عاوز أشوف صور الكوتشي المتاح',
      attachments: [],
      customerData
    });

    if (response.data.success) {
      console.log('✅ تم الرد بنجاح');
      console.log('📄 محتوى الرد:', response.data.data.content);
      
      // فحص الصور
      if (response.data.data.images && response.data.data.images.length > 0) {
        console.log(`\n📸 تم العثور على ${response.data.data.images.length} صور:`);
        response.data.data.images.forEach((img, index) => {
          console.log(`   ${index + 1}. ${img.title || 'صورة'}`);
          console.log(`      URL: ${img.payload?.url || img.url || 'غير محدد'}`);
          console.log(`      النوع: ${img.imageType || img.type || 'غير محدد'}`);
        });
      } else {
        console.log('\n⚠️ لم يتم العثور على صور في الرد');
        console.log('🔍 بيانات الرد الكاملة:', JSON.stringify(response.data.data, null, 2));
      }
      
    } else {
      console.log('❌ فشل في الرد:', response.data.error);
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    if (error.response) {
      console.error('📄 تفاصيل الخطأ:', error.response.data);
    }
  }
}

// تشغيل الاختبار
testImagesRequest();
