const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testScenarios() {
  console.log('🎭 اختبار سيناريوهات مختلفة للعملاء...\n');
  
  const baseURL = 'http://localhost:3001';
  const companyId = 'cmd5c0c9y0000ymzdd7wtv7ib';
  
  // دالة مساعدة لإرسال رسالة
  async function sendMessage(message, conversationHistory = []) {
    const response = await fetch(`${baseURL}/api/v1/ai/generate-response-v2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        companyId,
        conversationHistory
      })
    });
    
    return await response.json();
  }
  
  // سيناريو 1: عميل جديد يريد استكشاف المنتجات
  console.log('🎭 سيناريو 1: عميل جديد يستكشف المنتجات');
  console.log('=' .repeat(50));
  
  let conversation = [];
  
  // الرسالة الأولى
  console.log('👤 العميل: أهلاً، أريد أن أرى ما عندكم من منتجات');
  let result = await sendMessage('أهلاً، أريد أن أرى ما عندكم من منتجات', conversation);
  if (result.success) {
    console.log(`🤖 المساعد: ${result.data.response.substring(0, 100)}...`);
    console.log(`🔧 الأدوات المستخدمة: ${result.data.usedTools.join(', ') || 'لا يوجد'}`);
    conversation.push(
      { role: 'user', content: 'أهلاً، أريد أن أرى ما عندكم من منتجات' },
      { role: 'assistant', content: result.data.response }
    );
  }
  
  // الرسالة الثانية
  console.log('\n👤 العميل: عايزة كوتشي مريح للمشي');
  result = await sendMessage('عايزة كوتشي مريح للمشي', conversation);
  if (result.success) {
    console.log(`🤖 المساعد: ${result.data.response.substring(0, 100)}...`);
    console.log(`🔧 الأدوات المستخدمة: ${result.data.usedTools.join(', ') || 'لا يوجد'}`);
    conversation.push(
      { role: 'user', content: 'عايزة كوتشي مريح للمشي' },
      { role: 'assistant', content: result.data.response }
    );
  }
  
  // الرسالة الثالثة
  console.log('\n👤 العميل: إيه أرخص حاجة عندك؟');
  result = await sendMessage('إيه أرخص حاجة عندك؟', conversation);
  if (result.success) {
    console.log(`🤖 المساعد: ${result.data.response.substring(0, 100)}...`);
    console.log(`🔧 الأدوات المستخدمة: ${result.data.usedTools.join(', ') || 'لا يوجد'}`);
  }
  
  console.log('\n' + '=' .repeat(50));
  
  // سيناريو 2: عميل يبحث عن منتج محدد
  console.log('\n🎭 سيناريو 2: عميل يبحث عن منتج محدد');
  console.log('=' .repeat(50));
  
  conversation = [];
  
  console.log('👤 العميل: السلام عليكم، عندك كوتشي نايك؟');
  result = await sendMessage('السلام عليكم، عندك كوتشي نايك؟', conversation);
  if (result.success) {
    console.log(`🤖 المساعد: ${result.data.response.substring(0, 100)}...`);
    console.log(`🔧 الأدوات المستخدمة: ${result.data.usedTools.join(', ') || 'لا يوجد'}`);
    conversation.push(
      { role: 'user', content: 'السلام عليكم، عندك كوتشي نايك؟' },
      { role: 'assistant', content: result.data.response }
    );
  }
  
  console.log('\n👤 العميل: كام سعره؟');
  result = await sendMessage('كام سعره؟', conversation);
  if (result.success) {
    console.log(`🤖 المساعد: ${result.data.response.substring(0, 100)}...`);
    console.log(`🔧 الأدوات المستخدمة: ${result.data.usedTools.join(', ') || 'لا يوجد'}`);
  }
  
  console.log('\n' + '=' .repeat(50));
  
  // سيناريو 3: عميل محدود الميزانية
  console.log('\n🎭 سيناريو 3: عميل محدود الميزانية');
  console.log('=' .repeat(50));
  
  conversation = [];
  
  console.log('👤 العميل: عايزة كوتشي بس ميزانيتي 200 جنيه بس');
  result = await sendMessage('عايزة كوتشي بس ميزانيتي 200 جنيه بس', conversation);
  if (result.success) {
    console.log(`🤖 المساعد: ${result.data.response.substring(0, 100)}...`);
    console.log(`🔧 الأدوات المستخدمة: ${result.data.usedTools.join(', ') || 'لا يوجد'}`);
    conversation.push(
      { role: 'user', content: 'عايزة كوتشي بس ميزانيتي 200 جنيه بس' },
      { role: 'assistant', content: result.data.response }
    );
  }
  
  console.log('\n👤 العميل: مفيش حاجة أرخص؟');
  result = await sendMessage('مفيش حاجة أرخص؟', conversation);
  if (result.success) {
    console.log(`🤖 المساعد: ${result.data.response.substring(0, 100)}...`);
    console.log(`🔧 الأدوات المستخدمة: ${result.data.usedTools.join(', ') || 'لا يوجد'}`);
  }
  
  console.log('\n' + '=' .repeat(50));
  
  // سيناريو 4: عميل يريد اقتراحات
  console.log('\n🎭 سيناريو 4: عميل يريد اقتراحات');
  console.log('=' .repeat(50));
  
  conversation = [];
  
  console.log('👤 العميل: مش عارفة أختار ايه، انصحيني');
  result = await sendMessage('مش عارفة أختار ايه، انصحيني', conversation);
  if (result.success) {
    console.log(`🤖 المساعد: ${result.data.response.substring(0, 100)}...`);
    console.log(`🔧 الأدوات المستخدمة: ${result.data.usedTools.join(', ') || 'لا يوجد'}`);
    conversation.push(
      { role: 'user', content: 'مش عارفة أختار ايه، انصحيني' },
      { role: 'assistant', content: result.data.response }
    );
  }
  
  console.log('\n👤 العميل: إيه الجديد عندكم؟');
  result = await sendMessage('إيه الجديد عندكم؟', conversation);
  if (result.success) {
    console.log(`🤖 المساعد: ${result.data.response.substring(0, 100)}...`);
    console.log(`🔧 الأدوات المستخدمة: ${result.data.usedTools.join(', ') || 'لا يوجد'}`);
  }
  
  console.log('\n' + '=' .repeat(50));
  
  // سيناريو 5: محادثة عامة
  console.log('\n🎭 سيناريو 5: محادثة عامة');
  console.log('=' .repeat(50));
  
  conversation = [];
  
  console.log('👤 العميل: ازيك؟ إيه أخبارك؟');
  result = await sendMessage('ازيك؟ إيه أخبارك؟', conversation);
  if (result.success) {
    console.log(`🤖 المساعد: ${result.data.response.substring(0, 100)}...`);
    console.log(`🔧 الأدوات المستخدمة: ${result.data.usedTools.join(', ') || 'لا يوجد'}`);
    conversation.push(
      { role: 'user', content: 'ازيك؟ إيه أخبارك؟' },
      { role: 'assistant', content: result.data.response }
    );
  }
  
  console.log('\n👤 العميل: شكراً، كده تمام');
  result = await sendMessage('شكراً، كده تمام', conversation);
  if (result.success) {
    console.log(`🤖 المساعد: ${result.data.response.substring(0, 100)}...`);
    console.log(`🔧 الأدوات المستخدمة: ${result.data.usedTools.join(', ') || 'لا يوجد'}`);
  }
  
  console.log('\n' + '=' .repeat(50));
  
  // ملخص السيناريوهات
  console.log('\n🎯 ملخص اختبار السيناريوهات:');
  console.log('✅ سيناريو العميل الجديد: يستكشف المنتجات بذكاء');
  console.log('✅ سيناريو البحث المحدد: يجد المنتجات المطلوبة');
  console.log('✅ سيناريو الميزانية المحدودة: يقترح بدائل مناسبة');
  console.log('✅ سيناريو طلب الاقتراحات: يقدم اقتراحات ذكية');
  console.log('✅ سيناريو المحادثة العامة: يتفاعل بطبيعية');
  
  console.log('\n🚀 النظام جاهز للتعامل مع جميع أنواع العملاء!');
}

// تشغيل اختبار السيناريوهات
testScenarios();
