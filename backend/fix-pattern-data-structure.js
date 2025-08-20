/**
 * إصلاح بنية بيانات الأنماط
 * Fix Pattern Data Structure
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixPatternDataStructure() {
  console.log('🔧 بدء إصلاح بنية بيانات الأنماط...\n');

  try {
    // 1. جلب جميع الأنماط
    const patterns = await prisma.successPattern.findMany({
      where: { companyId: 'cme4yvrco002kuftceydlrwdi' }
    });

    console.log(`📊 وجدت ${patterns.length} نمط للإصلاح`);

    for (const pattern of patterns) {
      console.log(`\n🔍 معالجة النمط: ${pattern.id}`);
      console.log(`📝 الوصف: ${pattern.description}`);
      
      try {
        const currentPattern = JSON.parse(pattern.pattern);
        console.log('📋 البنية الحالية:', JSON.stringify(currentPattern, null, 2));

        let needsUpdate = false;
        let newPattern = { ...currentPattern };

        // إصلاح successWords إلى successfulWords
        if (currentPattern.successWords && !currentPattern.successfulWords) {
          console.log('🔄 تحويل successWords إلى successfulWords');
          
          if (Array.isArray(currentPattern.successWords)) {
            // إذا كانت مصفوفة من الكائنات
            if (currentPattern.successWords[0] && typeof currentPattern.successWords[0] === 'object') {
              newPattern.successfulWords = currentPattern.successWords.map(item => item.word || item);
            } else {
              // إذا كانت مصفوفة من النصوص
              newPattern.successfulWords = currentPattern.successWords;
            }
          }
          
          delete newPattern.successWords;
          needsUpdate = true;
        }

        // إضافة failureWords إذا لم تكن موجودة
        if (!newPattern.failureWords) {
          console.log('➕ إضافة failureWords فارغة');
          newPattern.failureWords = [];
          needsUpdate = true;
        }

        // إضافة frequency إذا لم تكن موجودة
        if (!newPattern.frequency) {
          console.log('➕ إضافة frequency افتراضية');
          newPattern.frequency = pattern.successRate || 0.8;
          needsUpdate = true;
        }

        if (needsUpdate) {
          console.log('✨ البنية الجديدة:', JSON.stringify(newPattern, null, 2));
          
          await prisma.successPattern.update({
            where: { id: pattern.id },
            data: {
              pattern: JSON.stringify(newPattern)
            }
          });
          
          console.log('✅ تم تحديث النمط بنجاح');
        } else {
          console.log('✅ النمط لا يحتاج تحديث');
        }

      } catch (parseError) {
        console.error(`❌ خطأ في تحليل النمط ${pattern.id}:`, parseError.message);
      }
    }

    console.log('\n🎉 تم إصلاح جميع الأنماط بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في إصلاح الأنماط:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الإصلاح
if (require.main === module) {
  fixPatternDataStructure();
}

module.exports = { fixPatternDataStructure };
