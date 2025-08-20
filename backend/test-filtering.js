const aiAgentService = require('./src/services/aiAgentService');

async function testFiltering() {
  console.log('🧪 اختبار فلترة الصور...\n');
  
  try {
    // انتظار التهيئة
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const testCases = [
      {
        message: 'عايز اشوف صور الهاف كوتشي الاسود',
        description: 'طلب منتج محدد + لون محدد'
      },
      {
        message: 'صور الهاف كوتشي',
        description: 'طلب منتج محدد فقط'
      },
      {
        message: 'عايز اشوف الكوتشي الابيض',
        description: 'طلب لون محدد'
      },
      {
        message: 'ايه المنتجات الموجودة',
        description: 'طلب عام لجميع المنتجات'
      },
      {
        message: 'عندك ايه',
        description: 'طلب عام آخر'
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n🔍 اختبار: "${testCase.message}"`);
      console.log(`📝 الوصف: ${testCase.description}`);
      console.log('==========================================');
      
      try {
        // محاكاة معالجة الرسالة
        const result = await aiAgentService.processCustomerMessage({
          conversationId: 'test-conversation',
          senderId: 'test-user',
          content: testCase.message,
          attachments: [],
          timestamp: new Date(),
          customerData: {
            id: 'test-customer',
            name: 'Test User',
            phone: '',
            email: 'test@example.com',
            orderCount: 0
          }
        });
        
        console.log(`✅ النتيجة: ${result.success ? 'نجح' : 'فشل'}`);
        if (result.images && result.images.length > 0) {
          console.log(`📸 عدد الصور المرسلة: ${result.images.length}`);
          result.images.forEach((image, index) => {
            console.log(`   ${index + 1}. ${image.title || 'بدون عنوان'}`);
          });
        } else {
          console.log(`📸 لا توجد صور`);
        }
        
        if (result.response) {
          console.log(`💬 الرد: ${result.response.substring(0, 100)}...`);
        }
        
      } catch (error) {
        console.log(`❌ خطأ في الاختبار: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار العام:', error);
  }
}

testFiltering();
