/**
 * اختبار التحديث التلقائي لصفحة إدارة الأنماط
 * Test Auto-Refresh for Pattern Management Page
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAutoRefresh() {
  console.log('🧪 اختبار التحديث التلقائي لصفحة إدارة الأنماط\n');

  const companyId = 'cme4yvrco002kuftceydlrwdi';
  
  try {
    // عرض عدد الأنماط الحالي
    const currentPatterns = await prisma.successPattern.findMany({
      where: { companyId }
    });
    
    console.log(`📊 عدد الأنماط الحالي: ${currentPatterns.length}`);
    console.log('⏰ سيتم إضافة نمط جديد كل 45 ثانية لاختبار التحديث التلقائي...\n');

    let testCounter = 1;
    
    const addTestPattern = async () => {
      try {
        const testPattern = {
          companyId: companyId,
          patternType: 'test_pattern',
          pattern: JSON.stringify({
            successfulWords: [`كلمة اختبار ${testCounter}`, `عبارة تجريبية ${testCounter}`],
            failureWords: [`كلمة فاشلة ${testCounter}`],
            frequency: 0.75 + (Math.random() * 0.2) // 75-95%
          }),
          description: `نمط اختبار رقم ${testCounter} - تم إنشاؤه لاختبار التحديث التلقائي`,
          successRate: 0.75 + (Math.random() * 0.2),
          sampleSize: 20 + Math.floor(Math.random() * 30),
          confidenceLevel: 0.8 + (Math.random() * 0.15),
          isActive: true,
          isApproved: false, // يحتاج موافقة
          metadata: JSON.stringify({
            source: 'auto_refresh_test',
            aiGenerated: true,
            testPattern: true,
            createdAt: new Date().toISOString(),
            testNumber: testCounter
          })
        };

        const newPattern = await prisma.successPattern.create({
          data: testPattern
        });

        console.log(`✅ تم إضافة نمط اختبار جديد #${testCounter}:`);
        console.log(`   📝 الوصف: ${newPattern.description}`);
        console.log(`   💪 معدل النجاح: ${(newPattern.successRate * 100).toFixed(1)}%`);
        console.log(`   🆔 المعرف: ${newPattern.id}`);
        console.log(`   ⏰ الوقت: ${new Date().toLocaleTimeString('ar-EG')}`);
        console.log('');

        // تحديث العداد
        testCounter++;

        // جدولة النمط التالي
        if (testCounter <= 5) { // إضافة 5 أنماط كحد أقصى
          console.log(`⏳ النمط التالي سيتم إضافته خلال 45 ثانية...`);
          setTimeout(addTestPattern, 45000); // 45 ثانية
        } else {
          console.log('🎉 انتهى اختبار التحديث التلقائي!');
          console.log('📊 تم إضافة 5 أنماط اختبار جديدة');
          console.log('👀 تحقق من صفحة إدارة الأنماط لرؤية التحديث التلقائي');
          
          // عرض الإحصائيات النهائية
          const finalPatterns = await prisma.successPattern.findMany({
            where: { companyId }
          });
          console.log(`📈 إجمالي الأنماط الآن: ${finalPatterns.length}`);
        }

      } catch (error) {
        console.error(`❌ خطأ في إضافة نمط اختبار #${testCounter}:`, error.message);
        
        // المحاولة مرة أخرى بعد 10 ثوان
        setTimeout(addTestPattern, 10000);
      }
    };

    // بدء الاختبار
    console.log('🚀 بدء اختبار التحديث التلقائي...');
    console.log('📱 افتح صفحة إدارة الأنماط: http://localhost:3000/pattern-management');
    console.log('👁️ راقب التحديث التلقائي كل 30 ثانية\n');
    
    // إضافة أول نمط بعد 5 ثوان
    setTimeout(addTestPattern, 5000);

  } catch (error) {
    console.error('❌ خطأ في اختبار التحديث التلقائي:', error);
  }
}

// دالة لتنظيف أنماط الاختبار
async function cleanupTestPatterns() {
  console.log('🧹 تنظيف أنماط الاختبار...');
  
  try {
    const deletedPatterns = await prisma.successPattern.deleteMany({
      where: {
        companyId: 'cme4yvrco002kuftceydlrwdi',
        metadata: {
          contains: 'auto_refresh_test'
        }
      }
    });

    console.log(`✅ تم حذف ${deletedPatterns.count} نمط اختبار`);
  } catch (error) {
    console.error('❌ خطأ في تنظيف أنماط الاختبار:', error);
  }
}

// معالجة الأوامر
const command = process.argv[2];

if (command === 'cleanup') {
  cleanupTestPatterns();
} else if (command === 'test') {
  testAutoRefresh();
} else {
  console.log('🧪 أداة اختبار التحديث التلقائي');
  console.log('');
  console.log('الأوامر المتاحة:');
  console.log('  node test-auto-refresh.js test    - بدء اختبار التحديث التلقائي');
  console.log('  node test-auto-refresh.js cleanup - تنظيف أنماط الاختبار');
  console.log('');
  console.log('📱 تأكد من فتح صفحة إدارة الأنماط قبل بدء الاختبار:');
  console.log('   http://localhost:3000/pattern-management');
}

module.exports = { testAutoRefresh, cleanupTestPatterns };
