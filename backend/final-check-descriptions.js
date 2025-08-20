const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function finalCheck() {
  console.log('🔍 فحص نهائي للأوصاف بعد الإصلاح...\n');
  
  try {
    const patterns = await prisma.successPattern.findMany({
      where: { companyId: 'cme4yvrco002kuftceydlrwdi' },
      select: {
        id: true,
        patternType: true,
        description: true,
        successRate: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log('📊 آخر 5 أنماط:');
    console.log('=' .repeat(80));
    
    patterns.forEach((pattern, index) => {
      console.log(`${index + 1}. النوع: ${pattern.patternType}`);
      console.log(`   معدل النجاح: ${(pattern.successRate * 100).toFixed(1)}%`);
      console.log(`   طول الوصف: ${pattern.description.length} حرف`);
      
      if (pattern.description.length > 191) {
        console.log('   ✅ وصف كامل (أطول من 191 حرف)');
      } else {
        console.log('   ⚠️ وصف قصير');
      }
      
      console.log(`   الوصف: ${pattern.description.substring(0, 100)}...`);
      console.log('   ' + '-'.repeat(60));
    });
    
    // إحصائيات
    const longDescriptions = patterns.filter(p => p.description.length > 191);
    console.log(`\n📈 الإحصائيات:`);
    console.log(`   📊 إجمالي الأنماط المفحوصة: ${patterns.length}`);
    console.log(`   ✅ أوصاف كاملة: ${longDescriptions.length}`);
    console.log(`   ⚠️ أوصاف قصيرة: ${patterns.length - longDescriptions.length}`);
    
    if (longDescriptions.length > 0) {
      console.log('\n🎉 تم إصلاح مشكلة الأوصاف المقطوعة بنجاح!');
      console.log('\n📋 الأوصاف الكاملة:');
      longDescriptions.forEach((pattern, index) => {
        console.log(`${index + 1}. ${pattern.patternType} (${pattern.description.length} حرف)`);
      });
    } else {
      console.log('\n⚠️ لا توجد أوصاف طويلة في العينة المفحوصة');
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

finalCheck();
