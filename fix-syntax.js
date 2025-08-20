const fs = require('fs');

console.log('🔧 إصلاح syntax الملف...');

const content = fs.readFileSync('frontend/src/services/successAnalyticsAPI.js', 'utf8');
const lines = content.split('\n');

const fixedLines = [];
let inClass = false;

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  const lineNum = i + 1;
  
  // اكتشاف بداية الكلاس
  if (line.includes('class ')) {
    inClass = true;
  }
  
  // اكتشاف نهاية الكلاس
  if (inClass && line.trim() === '}' && !lines[i + 1]?.trim().startsWith('//')) {
    inClass = false;
  }
  
  // إزالة الفواصل من نهايات الدوال داخل الكلاس
  if (inClass && line.trim() === '},') {
    line = line.replace('},', '}');
    console.log(`🔧 السطر ${lineNum}: إزالة فاصلة من نهاية دالة`);
  }
  
  fixedLines.push(line);
}

const fixedContent = fixedLines.join('\n');
fs.writeFileSync('frontend/src/services/successAnalyticsAPI.js', fixedContent);

console.log('✅ تم إصلاح الملف');

// اختبار الملف المصحح
try {
  require('./frontend/src/services/successAnalyticsAPI.js');
  console.log('✅ الملف يعمل بدون أخطاء');
} catch (error) {
  console.log('❌ لا يزال هناك خطأ:', error.message);
}
