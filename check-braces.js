const fs = require('fs');

const content = fs.readFileSync('frontend/src/services/successAnalyticsAPI.js', 'utf8');
const lines = content.split('\n');

console.log('🔍 فحص الأقواس والهيكل:');

let braceCount = 0;
let parenCount = 0;
let inFunction = false;
let functionDepth = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const lineNum = i + 1;
  
  // عد الأقواس
  const openBraces = (line.match(/\{/g) || []).length;
  const closeBraces = (line.match(/\}/g) || []).length;
  const openParens = (line.match(/\(/g) || []).length;
  const closeParens = (line.match(/\)/g) || []).length;
  
  braceCount += openBraces - closeBraces;
  parenCount += openParens - closeParens;
  
  // اكتشاف بداية دالة
  if (line.includes('async ') && line.includes('(')) {
    inFunction = true;
    functionDepth = braceCount;
    console.log(`📍 السطر ${lineNum}: بداية دالة - عمق الأقواس: ${braceCount}`);
  }
  
  // اكتشاف نهاية دالة
  if (inFunction && closeBraces > 0 && braceCount === functionDepth - 1) {
    console.log(`📍 السطر ${lineNum}: نهاية دالة - عمق الأقواس: ${braceCount}`);
    
    // فحص الفاصلة
    if (line.includes(',')) {
      console.log(`   ✅ يحتوي على فاصلة`);
    } else {
      console.log(`   ⚠️ لا يحتوي على فاصلة`);
    }
    
    inFunction = false;
  }
  
  // فحص الأخطاء
  if (braceCount < 0) {
    console.log(`❌ السطر ${lineNum}: أقواس مغلقة زائدة - العدد: ${braceCount}`);
  }
  
  if (parenCount < 0) {
    console.log(`❌ السطر ${lineNum}: أقواس دائرية مغلقة زائدة - العدد: ${parenCount}`);
  }
  
  // فحص السطر 36 بالتفصيل
  if (lineNum === 36) {
    console.log(`\n🎯 تحليل السطر 36:`);
    console.log(`   المحتوى: "${line}"`);
    console.log(`   عمق الأقواس: ${braceCount}`);
    console.log(`   في دالة: ${inFunction}`);
    console.log(`   عمق الدالة: ${functionDepth}`);
  }
}

console.log(`\nالنتيجة النهائية:`);
console.log(`أقواس مجعدة: ${braceCount}`);
console.log(`أقواس دائرية: ${parenCount}`);

if (braceCount === 0 && parenCount === 0) {
  console.log('✅ الأقواس متوازنة');
} else {
  console.log('❌ الأقواس غير متوازنة');
}
