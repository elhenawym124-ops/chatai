/**
 * اختبار شامل للإصلاحات
 * Comprehensive Test for Pattern Fixes
 */

const PatternApplicationService = require('./src/services/patternApplicationService');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const patternService = new PatternApplicationService();

async function testPatternFixes() {
  console.log('🧪 بدء الاختبار الشامل للإصلاحات...\n');

  try {
    // 1. اختبار جلب الأنماط
    console.log('1️⃣ اختبار جلب الأنماط...');
    const patterns = await patternService.getApprovedPatterns('cme4yvrco002kuftceydlrwdi');
    console.log(`✅ تم جلب ${patterns.length} نمط`);
    
    patterns.forEach((pattern, index) => {
      console.log(`   النمط ${index + 1}:`);
      console.log(`   - ID: ${pattern.id}`);
      console.log(`   - Type: ${pattern.type}`);
      console.log(`   - Success Rate: ${pattern.successRate}`);
      console.log(`   - Pattern Data:`, JSON.stringify(pattern.pattern, null, 4));
    });

    // 2. اختبار تطبيق الأنماط
    console.log('\n2️⃣ اختبار تطبيق الأنماط...');
    const testMessages = [
      'مرحبا، كيف يمكنني مساعدتك؟',
      'أهلا وسهلا',
      'السلام عليكم',
      'مساء الخير'
    ];

    for (const message of testMessages) {
      console.log(`\n📝 اختبار الرسالة: "${message}"`);
      
      const enhanced = await patternService.applyAllPatterns(
        message, 
        'cme4yvrco002kuftceydlrwdi'
      );
      
      console.log(`✨ النتيجة: "${enhanced}"`);
      
      if (enhanced !== message) {
        console.log('✅ تم تطبيق الأنماط بنجاح!');
      } else {
        console.log('⚪ لم يتم تطبيق أي أنماط');
      }
    }

    // 3. اختبار تطبيق أنماط الكلمات مباشرة
    console.log('\n3️⃣ اختبار تطبيق أنماط الكلمات مباشرة...');
    const wordPatterns = patterns.filter(p => p.type === 'word_usage');
    console.log(`📊 وجدت ${wordPatterns.length} نمط كلمات`);

    const testText = 'مرحبا بك';
    console.log(`📝 النص الأصلي: "${testText}"`);
    
    const enhancedText = await patternService.applyWordPatterns(testText, wordPatterns);
    console.log(`✨ النص المحسن: "${enhancedText}"`);

    // 4. اختبار البيانات المحدثة
    console.log('\n4️⃣ فحص بنية البيانات المحدثة...');
    const dbPatterns = await prisma.successPattern.findMany({
      where: { companyId: 'cme4yvrco002kuftceydlrwdi' }
    });

    dbPatterns.forEach((pattern, index) => {
      console.log(`\nالنمط ${index + 1} في قاعدة البيانات:`);
      console.log(`- ID: ${pattern.id}`);
      console.log(`- Pattern Type: ${pattern.patternType}`);
      
      try {
        const parsedPattern = JSON.parse(pattern.pattern);
        console.log(`- Has successfulWords: ${!!parsedPattern.successfulWords}`);
        console.log(`- Has failureWords: ${!!parsedPattern.failureWords}`);
        console.log(`- Has frequency: ${!!parsedPattern.frequency}`);
        console.log(`- Pattern Structure:`, JSON.stringify(parsedPattern, null, 4));
      } catch (e) {
        console.log(`❌ خطأ في تحليل البيانات: ${e.message}`);
      }
    });

    console.log('\n🎉 انتهى الاختبار الشامل!');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الاختبار
if (require.main === module) {
  testPatternFixes();
}

module.exports = { testPatternFixes };
