console.log('🧪 اختبار الرسائل القصيرة...\n');

// محاكاة اختبار الشروط
function testMessageLength(message) {
  // الشرط القديم (كان يمنع الرسائل القصيرة)
  const oldCondition = message.length > 2 && message.length < 500;
  
  // الشرط الجديد (يسمح بالرسائل القصيرة)
  const newCondition = message.length > 0 && message.length < 500;
  
  return {
    message,
    length: message.length,
    oldCondition,
    newCondition,
    fixed: !oldCondition && newCondition
  };
}

// اختبار رسائل مختلفة
const testMessages = [
  '1',           // رقم واحد
  '38',          // رقمين
  'لا',          // حرفين
  'نعم',         // 3 أحرف
  'تمام',        // 4 أحرف
  'شكرا',        // 5 أحرف
  'عايز أعرف السعر'  // رسالة طويلة
];

console.log('📝 نتائج الاختبار:');
console.log('='.repeat(60));

testMessages.forEach((msg, i) => {
  const result = testMessageLength(msg);
  const status = result.fixed ? '✅ تم الإصلاح' : 
                 result.newCondition ? '✅ يعمل' : '❌ لا يعمل';
  
  console.log(`${i+1}. "${msg}" (${result.length} حرف)`);
  console.log(`   الشرط القديم: ${result.oldCondition ? '✅' : '❌'}`);
  console.log(`   الشرط الجديد: ${result.newCondition ? '✅' : '❌'}`);
  console.log(`   النتيجة: ${status}`);
  console.log('');
});

console.log('🎯 الخلاصة:');
console.log('- تم تعديل الشرط من messageText.length > 2 إلى messageText.length > 0');
console.log('- الآن النظام سيرد على الرسائل التي تحتوي على حرف واحد أو أكثر');
console.log('- الرسائل القصيرة مثل "1" و "38" و "لا" ستحصل على رد');
console.log('');
console.log('🧪 للاختبار الحقيقي:');
console.log('1. أرسل رسالة قصيرة على فيسبوك مثل "38"');
console.log('2. راقب اللوج للتأكد من عدم ظهور "Skipping AI reply (message too short/long)"');
console.log('3. يجب أن يرد البوت على الرسالة القصيرة');
