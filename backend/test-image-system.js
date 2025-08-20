const aiAgentService = require('./src/services/aiAgentService');

async function testImageSystem() {
  try {
    console.log('📸 اختبار نظام الصور...\n');
    
    // بيانات اختبار
    const testData = {
      conversationId: 'test-conv-images',
      senderId: 'test-user-images',
      content: 'اه يا ريت ابعت الصور',
      customerData: {
        id: 'test-user-images',
        name: 'عميل يطلب صور',
        phone: '01234567890',
        orderCount: 0
      }
    };
    
    // 1. اختبار تحليل النية
    console.log('1️⃣ اختبار تحليل النية:');
    console.log('='.repeat(50));
    
    const intent = aiAgentService.analyzeIntent(testData.content);
    console.log('الرسالة:', testData.content);
    console.log('النية المكتشفة:', intent);
    
    if (intent === 'product_inquiry') {
      console.log('✅ تم اكتشاف طلب الصور بنجاح');
    } else {
      console.log('❌ لم يتم اكتشاف طلب الصور');
    }
    
    // 2. اختبار معالجة الرسالة الكاملة
    console.log('\n2️⃣ اختبار معالجة الرسالة:');
    console.log('='.repeat(50));
    
    const response = await aiAgentService.processCustomerMessage(testData);
    
    console.log('نجح المعالجة:', response.success);
    console.log('النية:', response.intent);
    console.log('استخدم RAG:', response.ragDataUsed);
    console.log('استخدم الذاكرة:', response.memoryUsed);
    console.log('الصور:', response.images ? response.images.length : 0);
    
    if (response.images && response.images.length > 0) {
      console.log('\n📸 الصور المولدة:');
      response.images.forEach((image, index) => {
        console.log(`صورة ${index + 1}:`);
        console.log('النوع:', image.type);
        console.log('الرابط:', image.payload.url);
        console.log('العنوان:', image.payload.title);
      });
    }
    
    console.log('\nالرد:', response.content);
    
    // 3. اختبار رسائل أخرى تطلب صور
    console.log('\n3️⃣ اختبار رسائل أخرى:');
    console.log('='.repeat(50));
    
    const testMessages = [
      'عايز أشوف صور الكوتشي',
      'ممكن تبعتلي صور المنتج',
      'عندك صور للمنتجات؟',
      'أوريني الصور'
    ];
    
    for (const message of testMessages) {
      const intent = aiAgentService.analyzeIntent(message);
      console.log(`"${message}" -> ${intent}`);
    }
    
  } catch (error) {
    console.error('❌ خطأ في اختبار الصور:', error.message);
    console.error('التفاصيل:', error.stack);
  }
}

testImageSystem();
