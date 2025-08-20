const fs = require('fs');
const path = require('path');

console.log('🔧 إصلاح مراجع Prisma في aiAgentService...\n');

const filePath = path.join(__dirname, 'src/services/aiAgentService.js');

if (!fs.existsSync(filePath)) {
  console.log('❌ الملف غير موجود:', filePath);
  process.exit(1);
}

// قراءة الملف
let content = fs.readFileSync(filePath, 'utf8');

// قائمة الإصلاحات المطلوبة
const fixes = [
  'await prisma.systemPrompt.findFirst(',
  'await prisma.aiSettings.findFirst(',
  'await prisma.company.findUnique(',
  'await prisma.order.findFirst(',
  'await prisma.product.findMany(',
  'await prisma.product.findUnique(',
  'await prisma.geminiKey.findFirst(',
  'await prisma.gemini_key_models.findMany(',
  'await prisma.gemini_key_models.update(',
  'await prisma.geminiKey.findUnique(',
  'await prisma.geminiKey.findMany(',
  'await prisma.gemini_keys.findUnique(',
  'await prisma.gemini_keys.updateMany(',
  'await prisma.gemini_keys.update(',
  'await prisma.aiSettings.findUnique(',
  'await prisma.aiSettings.update(',
  'await prisma.aiSettings.create('
];

let fixedCount = 0;

console.log('📋 بدء الإصلاحات:\n');

fixes.forEach((fix, index) => {
  const oldPattern = fix;
  const newPattern = fix.replace('await prisma.', 'await this.prisma.');
  
  // عد المطابقات قبل الإصلاح
  const beforeCount = (content.match(new RegExp(oldPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  
  if (beforeCount > 0) {
    content = content.replace(new RegExp(oldPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newPattern);
    console.log(`${index + 1}. ✅ تم إصلاح ${beforeCount} مطابقة: ${oldPattern}`);
    fixedCount += beforeCount;
  } else {
    console.log(`${index + 1}. ⚪ لا توجد مطابقات: ${oldPattern}`);
  }
});

// حفظ الملف المُصلح
fs.writeFileSync(filePath, content);

console.log(`\n📊 ملخص الإصلاح:`);
console.log(`✅ تم إصلاح ${fixedCount} مرجع Prisma`);
console.log(`📄 تم حفظ الملف المُصلح: ${filePath}`);

// التحقق من عدم وجود مراجع خاطئة متبقية
const remainingIssues = (content.match(/await prisma\./g) || []).length;

if (remainingIssues === 0) {
  console.log(`\n🎉 ممتاز! تم إصلاح جميع مراجع Prisma`);
  console.log(`✅ النظام الآن جاهز للاختبار`);
} else {
  console.log(`\n⚠️  يوجد ${remainingIssues} مرجع متبقي يحتاج مراجعة يدوية`);
}

console.log(`\n🔍 الخطوة التالية: اختبار aiAgentService للتأكد من عمله`);
