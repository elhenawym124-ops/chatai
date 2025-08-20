const aiAgentService = require('./src/services/aiAgentService');
const ragService = require('./src/services/ragService');

async function testQuickFix() {
  console.log('🔧 اختبار سريع للإصلاحات...\n');

  try {
    // انتظار تهيئة النظام
    await ragService.ensureInitialized();
    
    console.log('='.repeat(60));
    console.log('🧪 اختبار سريع');
    console.log('='.repeat(60));
    
    const conversationId = 'test_quick_fix';
    const senderId = 'test_customer_quick';
    
    // اختبار واحد فقط
    console.log('📝 اختبار: "عايز اشوف كوتشي لمسه"');
    
    const messageData = {
      conversationId,
      senderId,
      content: 'عايز اشوف كوتشي لمسه',
      attachments: [],
      timestamp: new Date().toISOString(),
      customerData: {
        id: 'test_customer_quick',
        name: 'Test Customer',
        phone: '',
        email: 'test@example.com',
        orderCount: 0
      }
    };
    
    const response = await aiAgentService.processCustomerMessage(messageData);
    
    console.log(`✅ AI استجاب: ${response.success ? 'نعم' : 'لا'}`);
    console.log(`📸 عدد الصور: ${response.images?.length || 0}`);
    
    if (response.images && response.images.length > 0) {
      console.log('📋 تفاصيل الصور:');
      response.images.forEach((img, index) => {
        console.log(`   ${index + 1}. ${img.payload?.title}`);
      });
      
      // فحص نوع الصور
      const hasSpecificImages = response.images.some(img => 
        img.payload?.title?.includes('لمسة') || img.payload?.title?.includes('سوان')
      );
      
      const hasGenericImages = response.images.some(img => 
        img.payload?.title?.includes('صورة توضيحية')
      );
      
      console.log(`🎯 صور محددة: ${hasSpecificImages ? 'نعم' : 'لا'}`);
      console.log(`🔄 صور عامة: ${hasGenericImages ? 'نعم' : 'لا'}`);
      
      if (hasSpecificImages) {
        console.log('✅ النظام الجديد يعمل!');
      } else if (hasGenericImages) {
        console.log('⚠️ النظام القديم يعمل');
      } else {
        console.log('❓ نوع غير محدد');
      }
    } else {
      console.log('❌ لا توجد صور');
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

testQuickFix();
