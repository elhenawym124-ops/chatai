const aiAgentService = require('./src/services/aiAgentService');
const memoryService = require('./src/services/memoryService');

async function testMemorySystem() {
  try {
    console.log('🧠 اختبار نظام الذاكرة...\n');
    
    // بيانات اختبار
    const testData = {
      conversationId: 'test-conv-123',
      senderId: 'test-user-456',
      companyId: 'cme8oj1fo000cufdcg2fquia9', // ✅ إضافة companyId للعزل الأمني
      content: 'مرحبا، عايز أعرف عن المنتجات',
      customerData: {
        id: 'test-user-456',
        name: 'عميل تجريبي',
        phone: '01234567890',
        orderCount: 0
      }
    };
    
    // 1. اختبار حفظ تفاعل في الذاكرة
    console.log('1️⃣ اختبار حفظ التفاعل:');
    console.log('='.repeat(50));
    
    await memoryService.saveInteraction({
      conversationId: testData.conversationId,
      senderId: testData.senderId,
      companyId: testData.companyId, // ✅ إضافة companyId للعزل الأمني
      userMessage: 'مرحبا',
      aiResponse: 'أهلاً وسهلاً! كيف يمكنني مساعدتك؟',
      intent: 'greeting',
      sentiment: 'positive',
      timestamp: new Date()
    });
    
    console.log('✅ تم حفظ التفاعل الأول');
    
    // 2. اختبار استرجاع الذاكرة
    console.log('\n2️⃣ اختبار استرجاع الذاكرة:');
    console.log('='.repeat(50));
    
    const memory = await memoryService.getConversationMemory(
      testData.conversationId,
      testData.senderId,
      5,
      testData.companyId // ✅ إضافة companyId للعزل الأمني
    );
    
    console.log('عدد التفاعلات المسترجعة:', memory.length);
    memory.forEach((interaction, index) => {
      console.log(`\nتفاعل ${index + 1}:`);
      console.log('رسالة العميل:', interaction.userMessage);
      console.log('رد الذكاء الاصطناعي:', interaction.aiResponse);
      console.log('النية:', interaction.intent);
      console.log('الوقت:', interaction.timestamp);
    });
    
    // 3. اختبار معالجة رسالة مع الذاكرة
    console.log('\n3️⃣ اختبار معالجة رسالة مع الذاكرة:');
    console.log('='.repeat(50));
    
    const response = await aiAgentService.processCustomerMessage(testData);
    
    console.log('نجح المعالجة:', response.success);
    console.log('استخدم الذاكرة:', response.memoryUsed);
    console.log('الرد:', response.content);
    
    // 4. فحص الذاكرة بعد المعالجة
    console.log('\n4️⃣ فحص الذاكرة بعد المعالجة:');
    console.log('='.repeat(50));
    
    const updatedMemory = await memoryService.getConversationMemory(
      testData.conversationId,
      testData.senderId,
      10,
      testData.companyId // ✅ إضافة companyId للعزل الأمني
    );
    
    console.log('عدد التفاعلات الآن:', updatedMemory.length);
    
    // 5. إحصائيات الذاكرة
    console.log('\n5️⃣ إحصائيات الذاكرة:');
    console.log('='.repeat(50));
    
    const stats = await memoryService.getMemoryStats();
    console.log('إحصائيات الذاكرة:', JSON.stringify(stats, null, 2));
    
  } catch (error) {
    console.error('❌ خطأ في اختبار الذاكرة:', error.message);
    console.error('التفاصيل:', error.stack);
  }
}

testMemorySystem();
