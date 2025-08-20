const fs = require('fs');
const path = require('path');

console.log('🔧 إصلاح مراجع GeminiKeyModel في aiAgentService...\n');

const filePath = path.join(__dirname, 'src/services/aiAgentService.js');

if (!fs.existsSync(filePath)) {
  console.log('❌ الملف غير موجود:', filePath);
  process.exit(1);
}

// قراءة الملف
let content = fs.readFileSync(filePath, 'utf8');

// قائمة الإصلاحات المطلوبة
const fixes = [
  {
    old: 'this.prisma.gemini_key_models.findMany(',
    new: 'this.prisma.geminiKeyModel.findMany(',
    description: 'تصحيح findMany للنماذج'
  },
  {
    old: 'this.prisma.gemini_key_models.update(',
    new: 'this.prisma.geminiKeyModel.update(',
    description: 'تصحيح update للنماذج'
  },
  {
    old: 'this.prisma.gemini_key_models.findFirst(',
    new: 'this.prisma.geminiKeyModel.findFirst(',
    description: 'تصحيح findFirst للنماذج'
  },
  {
    old: 'this.prisma.gemini_key_models.create(',
    new: 'this.prisma.geminiKeyModel.create(',
    description: 'تصحيح create للنماذج'
  },
  {
    old: 'this.prisma.gemini_keys.findUnique(',
    new: 'this.prisma.geminiKey.findUnique(',
    description: 'تصحيح findUnique للمفاتيح'
  },
  {
    old: 'this.prisma.gemini_keys.updateMany(',
    new: 'this.prisma.geminiKey.updateMany(',
    description: 'تصحيح updateMany للمفاتيح'
  },
  {
    old: 'this.prisma.gemini_keys.update(',
    new: 'this.prisma.geminiKey.update(',
    description: 'تصحيح update للمفاتيح'
  }
];

let totalFixed = 0;

console.log('📋 بدء الإصلاحات:\n');

fixes.forEach((fix, index) => {
  // عد المطابقات قبل الإصلاح
  const beforeCount = (content.match(new RegExp(fix.old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  
  if (beforeCount > 0) {
    content = content.replace(new RegExp(fix.old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.new);
    console.log(`${index + 1}. ✅ ${fix.description}: ${beforeCount} مطابقة`);
    totalFixed += beforeCount;
  } else {
    console.log(`${index + 1}. ⚪ ${fix.description}: لا توجد مطابقات`);
  }
});

// حفظ الملف المُصلح
fs.writeFileSync(filePath, content);

console.log(`\n📊 ملخص الإصلاح:`);
console.log(`✅ تم إصلاح ${totalFixed} مرجع`);
console.log(`📄 تم حفظ الملف المُصلح: ${filePath}`);

// التحقق من عدم وجود مراجع خاطئة متبقية
const remainingGeminiKeyModels = (content.match(/gemini_key_models/g) || []).length;
const remainingGeminiKeys = (content.match(/gemini_keys/g) || []).length;

console.log(`\n🔍 فحص المراجع المتبقية:`);
console.log(`   gemini_key_models: ${remainingGeminiKeyModels}`);
console.log(`   gemini_keys: ${remainingGeminiKeys}`);

if (remainingGeminiKeyModels === 0 && remainingGeminiKeys === 0) {
  console.log(`\n🎉 ممتاز! تم إصلاح جميع المراجع`);
  console.log(`✅ aiAgentService الآن يستخدم أسماء Prisma الصحيحة`);
} else {
  console.log(`\n⚠️  يوجد ${remainingGeminiKeyModels + remainingGeminiKeys} مرجع متبقي`);
}

console.log(`\n🧪 الخطوة التالية: اختبار aiAgentService مرة أخرى`);
