console.log('🧪 اختبار طول النصوص العربية والإنجليزية...\n');

const testMessages = [
  '37',      // أرقام إنجليزية
  '٣٧',      // أرقام عربية
  '234',     // أرقام إنجليزية
  '٢٣٤',     // أرقام عربية
  '1',       // رقم واحد إنجليزي
  '١',       // رقم واحد عربي
  'لا',      // كلمة عربية
  'نعم',     // كلمة عربية
];

console.log('📊 نتائج اختبار الطول:');
console.log('='.repeat(40));

testMessages.forEach((msg, i) => {
  const length = msg.length;
  const oldCondition = length > 2 && length < 500;
  const newCondition = length > 0 && length < 500;
  
  console.log(`${i+1}. "${msg}"`);
  console.log(`   الطول: ${length} حرف`);
  console.log(`   الشرط القديم (>2): ${oldCondition ? '✅ يمر' : '❌ لا يمر'}`);
  console.log(`   الشرط الجديد (>0): ${newCondition ? '✅ يمر' : '❌ لا يمر'}`);
  console.log('');
});

console.log('🔍 تحليل المشكلة:');
console.log('- الأرقام العربية "٣٧" طولها 2 حرف');
console.log('- الشرط القديم (length > 2) يرفض الرسائل التي طولها 2 حرف أو أقل');
console.log('- الشرط الجديد (length > 0) يقبل أي رسالة غير فارغة');
console.log('');
console.log('✅ الحل: تم تغيير الشرط من messageText.length > 2 إلى messageText.length > 0');
console.log('🔄 يجب إعادة تشغيل الخادم لتطبيق التغيير');
