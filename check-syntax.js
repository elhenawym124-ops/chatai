const fs = require('fs');

try {
  console.log('🔍 فحص syntax للملف...');
  
  const content = fs.readFileSync('frontend/src/services/successAnalyticsAPI.js', 'utf8');
  
  // محاولة تقييم الملف
  eval(content);
  
  console.log('✅ الملف صحيح syntactically');
  
} catch (error) {
  console.error('❌ خطأ في syntax:');
  console.error('الرسالة:', error.message);
  console.error('السطر:', error.stack?.match(/eval.*:(\d+):/)?.[1] || 'غير محدد');
  
  // فحص الأقواس والفواصل
  const lines = fs.readFileSync('frontend/src/services/successAnalyticsAPI.js', 'utf8').split('\n');
  
  console.log('\n🔍 فحص الأقواس والفواصل:');
  
  let openBraces = 0;
  let openParens = 0;
  let openBrackets = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // عد الأقواس
    openBraces += (line.match(/\{/g) || []).length;
    openBraces -= (line.match(/\}/g) || []).length;
    
    openParens += (line.match(/\(/g) || []).length;
    openParens -= (line.match(/\)/g) || []).length;
    
    openBrackets += (line.match(/\[/g) || []).length;
    openBrackets -= (line.match(/\]/g) || []).length;
    
    // فحص الأخطاء الشائعة
    if (line.trim().endsWith(',,')) {
      console.log(`⚠️ السطر ${lineNum}: فاصلة مضاعفة`);
    }
    
    if (line.trim() === ',') {
      console.log(`⚠️ السطر ${lineNum}: فاصلة وحيدة`);
    }
    
    // فحص الفواصل قبل الأقواس المغلقة
    if (line.trim().match(/,\s*\}/)) {
      console.log(`⚠️ السطر ${lineNum}: فاصلة قبل قوس مغلق`);
    }
  }
  
  console.log(`\nإجمالي الأقواس المفتوحة:`);
  console.log(`{ } : ${openBraces}`);
  console.log(`( ) : ${openParens}`);
  console.log(`[ ] : ${openBrackets}`);
  
  if (openBraces !== 0 || openParens !== 0 || openBrackets !== 0) {
    console.log('❌ أقواس غير متوازنة!');
  } else {
    console.log('✅ الأقواس متوازنة');
  }
}
