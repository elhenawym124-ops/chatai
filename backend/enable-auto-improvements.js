const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('⚙️ تفعيل التطبيق التلقائي للتحسينات...\n');
    
    // الحصول على الشركة
    const company = await prisma.company.findFirst();
    if (!company) {
      console.error('❌ لا توجد شركة');
      return;
    }
    
    // تحديث إعدادات التعلم
    const settings = await prisma.learningSettings.upsert({
      where: { companyId: company.id },
      update: {
        enabled: true,
        autoApplyImprovements: true,
        confidenceThreshold: 0.6, // تقليل حد الثقة لاكتشاف أنماط أكثر
        learningSpeed: 'medium',
        minimumSampleSize: 5, // تقليل الحد الأدنى للعينات
        dataRetentionDays: 90
      },
      create: {
        companyId: company.id,
        enabled: true,
        autoApplyImprovements: true,
        confidenceThreshold: 0.6,
        learningSpeed: 'medium',
        minimumSampleSize: 5,
        dataRetentionDays: 90
      }
    });
    
    console.log('✅ تم تحديث الإعدادات:');
    console.log(`   - مفعل: ${settings.enabled ? 'نعم' : 'لا'}`);
    console.log(`   - التطبيق التلقائي: ${settings.autoApplyImprovements ? 'نعم' : 'لا'}`);
    console.log(`   - حد الثقة: ${settings.confidenceThreshold}`);
    console.log(`   - الحد الأدنى للعينات: ${settings.minimumSampleSize}`);
    
    console.log('\n🎉 تم تفعيل التطبيق التلقائي للتحسينات!');
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
