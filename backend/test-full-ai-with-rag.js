const aiAgentService = require('./src/services/aiAgentService');

async function testFullAIWithRAG() {
  console.log('🧪 اختبار النظام الكامل: AI Agent + RAG...');
  
  try {
    // انتظار تهيئة النظام
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const testMessages = [
      {
        content: 'كوتشي اسكوتش',
        conversationId: 'test-conv-1',
        senderId: 'test-customer-1',
        customerData: {
          name: 'أحمد محمد',
          phone: '+966501234567',
          orderCount: 0
        }
      },
      {
        content: 'كم سعر الكوتشي؟',
        conversationId: 'test-conv-2',
        senderId: 'test-customer-2',
        customerData: {
          name: 'فاطمة علي',
          phone: '+966507654321',
          orderCount: 2
        }
      },
      {
        content: 'هل الكوتشي متوفر؟',
        conversationId: 'test-conv-3',
        senderId: 'test-customer-3',
        customerData: {
          name: 'محمد السعيد',
          phone: '+966509876543',
          orderCount: 1
        }
      },
      {
        content: 'أريد أحذية نسائية',
        conversationId: 'test-conv-4',
        senderId: 'test-customer-4',
        customerData: {
          name: 'نورا أحمد',
          phone: '+966502345678',
          orderCount: 0
        }
      }
    ];
    
    for (const [index, messageData] of testMessages.entries()) {
      console.log(`\n🔄 اختبار ${index + 1}: "${messageData.content}"`);
      console.log(`👤 العميل: ${messageData.customerData.name}`);
      
      try {
        const response = await aiAgentService.processCustomerMessage(messageData);
        
        if (response) {
          console.log('✅ رد الذكاء الصناعي:');
          console.log(`📝 المحتوى: ${response.content}`);
          console.log(`🎯 النية: ${response.intent || 'غير محدد'}`);
          console.log(`😊 المشاعر: ${response.sentiment || 'غير محدد'}`);
          console.log(`🔢 الثقة: ${response.confidence || 'غير محدد'}`);
          console.log(`🚨 يحتاج تدخل بشري: ${response.shouldEscalate ? 'نعم' : 'لا'}`);
        } else {
          console.log('❌ لم يتم الحصول على رد من الذكاء الصناعي');
        }
        
      } catch (error) {
        console.error(`❌ خطأ في معالجة الرسالة ${index + 1}:`, error.message);
      }
      
      // فاصل زمني بين الاختبارات
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار الشامل:', error);
  }
}

testFullAIWithRAG();
