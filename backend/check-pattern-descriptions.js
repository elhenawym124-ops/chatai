const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPatternDescriptions() {
  console.log('🔍 فحص أوصاف الأنماط في قاعدة البيانات...\n');
  
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
      take: 10
    });
    
    console.log(`📊 فحص آخر ${patterns.length} أنماط:`);
    console.log('=' .repeat(80));
    
    patterns.forEach((pattern, index) => {
      console.log(`${index + 1}. النوع: ${pattern.patternType}`);
      console.log(`   معدل النجاح: ${(pattern.successRate * 100).toFixed(1)}%`);
      console.log(`   الوصف: ${pattern.description}`);
      console.log(`   طول الوصف: ${pattern.description.length} حرف`);
      
      if (pattern.description.length > 100) {
        console.log('   ⚠️ وصف طويل - قد يحتاج اقتطاع في الواجهة');
      }
      
      console.log('   ' + '-'.repeat(60));
    });
    
    // فحص الأنماط الطويلة
    const longDescriptions = patterns.filter(p => p.description.length > 150);
    if (longDescriptions.length > 0) {
      console.log(`\n⚠️ وجدت ${longDescriptions.length} أنماط بأوصاف طويلة (>150 حرف)`);
      longDescriptions.forEach(pattern => {
        console.log(`   - ${pattern.patternType}: ${pattern.description.length} حرف`);
      });
    }
    
    // البحث عن النمط المحدد في الصورة
    const callToActionPatterns = await prisma.successPattern.findMany({
      where: { 
        companyId: 'cme4yvrco002kuftceydlrwdi',
        patternType: 'call_to_action'
      },
      select: {
        id: true,
        description: true,
        successRate: true
      },
      orderBy: { successRate: 'desc' }
    });
    
    console.log(`\n🎯 أنماط call_to_action (${callToActionPatterns.length}):`);
    callToActionPatterns.forEach((pattern, index) => {
      console.log(`${index + 1}. معدل النجاح: ${(pattern.successRate * 100).toFixed(1)}%`);
      console.log(`   الوصف الكامل: ${pattern.description}`);
      console.log(`   طول الوصف: ${pattern.description.length} حرف`);
      console.log('   ' + '-'.repeat(60));
    });
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPatternDescriptions();
