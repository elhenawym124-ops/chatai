const aiAgentService = require('./src/services/aiAgentService');

async function testSystemPrompt() {
  try {
    console.log('🧪 اختبار نظام البرومبت الجديد...\n');
    
    // 1. اختبار تحميل البرومبت
    console.log('1️⃣ اختبار تحميل البرومبت:');
    const companyId = 'cmdkj6coz0000uf0cyscco6lr';
    const companyPrompts = await aiAgentService.getCompanyPrompts(companyId);
    
    console.log('📊 نتائج تحميل البرومبت:');
    console.log('المصدر:', companyPrompts.source);
    console.log('يحتوي على برومبت مخصص:', companyPrompts.hasCustomPrompts);
    console.log('اسم البرومبت:', companyPrompts.promptName || 'غير محدد');
    
    if (companyPrompts.personalityPrompt) {
      console.log('طول البرومبت:', companyPrompts.personalityPrompt.length, 'حرف');
      console.log('بداية البرومبت:', companyPrompts.personalityPrompt.substring(0, 100) + '...');
    } else {
      console.log('❌ لا يوجد برومبت شخصية');
    }
    
    // 2. اختبار رسالة كاملة
    console.log('\n2️⃣ اختبار رسالة كاملة:');
    
    const testMessage = {
      conversationId: 'test-system-prompt',
      senderId: 'test-user-prompt',
      content: 'مرحبا، ايه اخبارك؟',
      attachments: [],
      customerData: {
        id: 'test-user-prompt',
        name: 'مختبر البرومبت',
        phone: '01234567890',
        orderCount: 0,
        companyId: companyId
      }
    };
    
    console.log('إرسال الرسالة:', testMessage.content);
    
    const response = await aiAgentService.processCustomerMessage(testMessage);
    
    console.log('\n📊 نتائج المعالجة:');
    console.log('نجح:', response.success);
    console.log('النية:', response.intent);
    console.log('استخدم RAG:', response.ragDataUsed);
    console.log('استخدم الذاكرة:', response.memoryUsed);
    console.log('الثقة:', response.confidence);
    console.log('وقت المعالجة:', response.processingTime + 'ms');
    
    console.log('\n💬 الرد:');
    console.log(response.content);
    
    // 3. فحص إذا كان الرد يتبع البرومبت المخصص
    console.log('\n3️⃣ تحليل الرد:');
    
    if (companyPrompts.hasCustomPrompts && companyPrompts.personalityPrompt) {
      // فحص إذا كان الرد يحتوي على عناصر من البرومبت المخصص
      const promptKeywords = ['سارة', 'مساعدة', 'متجر', 'أحذية', 'شحن'];
      const foundKeywords = promptKeywords.filter(keyword => 
        response.content.includes(keyword)
      );
      
      console.log('الكلمات المفتاحية الموجودة:', foundKeywords);
      
      if (foundKeywords.length > 0) {
        console.log('✅ الرد يبدو أنه يتبع البرومبت المخصص');
      } else {
        console.log('❌ الرد لا يبدو أنه يتبع البرومبت المخصص');
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ في اختبار البرومبت:', error.message);
  }
}

testSystemPrompt();
