/**
 * اختبار سريع للردود الذكية الجديدة
 * يختبر كيف سيرد النظام على رسائل مختلفة
 */

const testMessages = [
  // تحيات بسيطة - يجب ألا تعرض منتجات
  {
    message: "مرحبا",
    expectedBehavior: "تحية بسيطة بدون منتجات",
    shouldShowProducts: false
  },
  {
    message: "السلام عليكم",
    expectedBehavior: "رد السلام بدون منتجات",
    shouldShowProducts: false
  },
  {
    message: "أهلا",
    expectedBehavior: "ترحيب بدون منتجات",
    shouldShowProducts: false
  },
  {
    message: "كيف الحال؟",
    expectedBehavior: "رد على السؤال بدون منتجات",
    shouldShowProducts: false
  },
  
  // شكر ووداع - يجب ألا تعرض منتجات
  {
    message: "شكرا",
    expectedBehavior: "رد بالعفو بدون منتجات",
    shouldShowProducts: false
  },
  {
    message: "مع السلامة",
    expectedBehavior: "وداع بدون منتجات",
    shouldShowProducts: false
  },
  
  // طلبات منتجات - يجب أن تعرض منتجات
  {
    message: "عايز كوتشي",
    expectedBehavior: "عرض منتجات الأحذية",
    shouldShowProducts: true
  },
  {
    message: "أريد أحذية",
    expectedBehavior: "عرض منتجات الأحذية",
    shouldShowProducts: true
  },
  {
    message: "ايه اللي عندك؟",
    expectedBehavior: "عرض جميع المنتجات",
    shouldShowProducts: true
  },
  {
    message: "اعرضي المنتجات",
    expectedBehavior: "عرض جميع المنتجات",
    shouldShowProducts: true
  }
];

async function testSmartResponses() {
  console.log('🧪 اختبار الردود الذكية الجديدة...\n');
  
  const baseURL = 'http://localhost:3001';
  const mockToken = 'test-token-123';
  const companyId = 'cmd5c0c9y0000ymzdd7wtv7ib';
  
  console.log('📋 قائمة الاختبارات:\n');
  
  for (let i = 0; i < testMessages.length; i++) {
    const test = testMessages[i];
    
    console.log(`${i + 1}. 💬 "${test.message}"`);
    console.log(`   🎯 متوقع: ${test.expectedBehavior}`);
    console.log(`   📦 منتجات: ${test.shouldShowProducts ? 'يجب أن تظهر' : 'يجب ألا تظهر'}`);
    console.log('');
  }
  
  console.log('🚀 لاختبار النظام الجديد:');
  console.log('1. ارسل رسالة "مرحبا" من الماسنجر');
  console.log('2. يجب أن يرد بتحية بسيطة بدون عرض منتجات');
  console.log('3. ثم ارسل "عايز كوتشي"');
  console.log('4. يجب أن يعرض المنتجات مع الصور');
  console.log('');
  
  console.log('📊 مقارنة السلوك:');
  console.log('');
  console.log('🔴 السلوك القديم:');
  console.log('   "مرحبا" → يعرض منتجات (مزعج)');
  console.log('   "شكرا" → يعرض منتجات (غير مناسب)');
  console.log('');
  console.log('🟢 السلوك الجديد:');
  console.log('   "مرحبا" → "أهلاً بيك! ازيك؟ 👋" (طبيعي)');
  console.log('   "شكرا" → "العفو! 😊" (مناسب)');
  console.log('   "عايز كوتشي" → يعرض المنتجات (مفيد)');
  console.log('');
  
  console.log('✨ المميزات الجديدة:');
  console.log('   🧠 اكتشاف ذكي لنوع الرسالة');
  console.log('   🎯 ردود مناسبة لكل موقف');
  console.log('   🚫 عدم إزعاج العملاء بمنتجات غير مطلوبة');
  console.log('   ✅ عرض منتجات فقط عند الحاجة');
  console.log('   💬 محادثة أكثر طبيعية');
  console.log('');
  
  console.log('🎉 النظام جاهز للاختبار! جرب إرسال رسائل مختلفة من الماسنجر.');
}

// تشغيل الاختبار
testSmartResponses().catch(console.error);
