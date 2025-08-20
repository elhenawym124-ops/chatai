const fs = require('fs');

console.log('🔍 فحص نهائي شامل للـ syntax...\n');

// 1. فحص Node.js syntax
console.log('1️⃣ فحص Node.js syntax...');
try {
  require('./frontend/src/services/successAnalyticsAPI.js');
  console.log('✅ Node.js: لا توجد أخطاء');
} catch (error) {
  console.log('❌ Node.js خطأ:', error.message);
  console.log('السطر:', error.stack?.match(/successAnalyticsAPI\.js:(\d+)/)?.[1] || 'غير محدد');
}

// 2. فحص الأقواس
console.log('\n2️⃣ فحص توازن الأقواس...');
const content = fs.readFileSync('frontend/src/services/successAnalyticsAPI.js', 'utf8');

let braces = 0;
let parens = 0;
let brackets = 0;

for (const char of content) {
  if (char === '{') braces++;
  if (char === '}') braces--;
  if (char === '(') parens++;
  if (char === ')') parens--;
  if (char === '[') brackets++;
  if (char === ']') brackets--;
}

console.log(`أقواس مجعدة { }: ${braces === 0 ? '✅ متوازنة' : '❌ غير متوازنة (' + braces + ')'}`);
console.log(`أقواس دائرية ( ): ${parens === 0 ? '✅ متوازنة' : '❌ غير متوازنة (' + parens + ')'}`);
console.log(`أقواس مربعة [ ]: ${brackets === 0 ? '✅ متوازنة' : '❌ غير متوازنة (' + brackets + ')'}`);

// 3. فحص الفواصل في الكلاس
console.log('\n3️⃣ فحص الفواصل في الكلاس...');
const lines = content.split('\n');
let inClass = false;
let methodCount = 0;
let commaErrors = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  const lineNum = i + 1;
  
  if (line.includes('class ')) {
    inClass = true;
    console.log(`📍 بداية كلاس في السطر ${lineNum}`);
  }
  
  if (inClass && line.includes('async ')) {
    methodCount++;
  }
  
  if (inClass && line === '},') {
    commaErrors++;
    console.log(`❌ السطر ${lineNum}: فاصلة خاطئة في نهاية method`);
  }
  
  if (inClass && line === '}' && lines[i + 1]?.trim() === '') {
    inClass = false;
    console.log(`📍 نهاية كلاس في السطر ${lineNum}`);
  }
}

console.log(`📊 إجمالي الـ methods: ${methodCount}`);
console.log(`❌ أخطاء الفواصل: ${commaErrors}`);

// 4. النتيجة النهائية
console.log('\n🎯 النتيجة النهائية:');
if (braces === 0 && parens === 0 && brackets === 0 && commaErrors === 0) {
  console.log('🎉 الملف صحيح 100% ولا توجد أخطاء syntax!');
} else {
  console.log('⚠️ لا يزال هناك مشاكل تحتاج إصلاح');
}

console.log('\n📋 ملخص الفحص:');
console.log(`✅ أقواس متوازنة: ${braces === 0 && parens === 0 && brackets === 0}`);
console.log(`✅ فواصل صحيحة: ${commaErrors === 0}`);
console.log(`📊 عدد الـ methods: ${methodCount}`);
