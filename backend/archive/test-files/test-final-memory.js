console.log('🧪 اختبار النظام النهائي...\n');

// محاكاة تاريخ المحادثة
const conversationHistory = [
  { content: 'عايز أعرف السعر', isFromCustomer: true },
  { content: 'سعر الكوتشي 250 جنيه... المتاحة عندنا؟ 🤔', isFromCustomer: false },
  { content: 'عايزه أعرف المقاسات', isFromCustomer: true },
  { content: 'المقاسات المتاحة عندنا من 36 لحد 41... مناسب ليكي؟ ✨', isFromCustomer: false },
  { content: '38 مقاس مناسب', isFromCustomer: true },
  { content: 'أهلاً يا قمر 😍، مقاس 38 متوفر. تحبي اللون إيه؟...', isFromCustomer: false },
  { content: 'الاسود', isFromCustomer: true }
];

// محاكاة إعدادات الذاكرة
const memorySettings = {
  conversationMemoryLimit: 15,
  memoryType: 'all',
  memoryDuration: 48,
  enableContextualMemory: true
};

// محاكاة الـ context
const context = {
  conversationHistory: conversationHistory,
  memorySettings: memorySettings,
  personalityPrompt: 'انتي اسمك ساره بياعه شاطره',
  responsePrompt: 'بتبعي كوتشيات حريمي علي صفحة سولا 123'
};

console.log('📝 تاريخ المحادثة:');
conversationHistory.forEach((msg, i) => {
  console.log(`${i+1}. [${msg.isFromCustomer ? 'عميل' : 'بوت'}] ${msg.content}`);
});

console.log('\n🧠 إعدادات الذاكرة:');
console.log(JSON.stringify(memorySettings, null, 2));

console.log('\n✅ النظام جاهز للاختبار!');
console.log('📱 أرسل رسالة على فيسبوك مثل: "تمام، عايز أأكد الطلب"');
console.log('🎯 يجب أن يتذكر البوت: مقاس 38 + كوتشي أسود');
console.log('❌ يجب ألا يسأل عن المقاس مرة أخرى!');

console.log('\n🔍 راقب اللوج للتأكد من:');
console.log('- 🧠 Loaded memory settings');
console.log('- 🧠 Loaded X messages for conversation memory');
console.log('- 🎯 معلومات مهمة من المحادثة');
console.log('- ⚠️ تذكر: لا تسأل مرة أخرى');
