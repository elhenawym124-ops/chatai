const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 فحص بيانات التعلم...\n');
    
    // إحصائيات عامة
    const total = await prisma.learningData.count();
    console.log(`📊 إجمالي السجلات: ${total}`);
    
    // توزيع النتائج
    const outcomes = await prisma.learningData.groupBy({
      by: ['outcome'],
      _count: { outcome: true }
    });
    
    console.log('\n📈 توزيع النتائج:');
    outcomes.forEach(o => {
      console.log(`   ${o.outcome}: ${o._count.outcome}`);
    });
    
    // عينة من البيانات
    const sample = await prisma.learningData.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('\n📋 عينة من البيانات:');
    sample.forEach((record, i) => {
      console.log(`${i+1}. النتيجة: ${record.outcome}`);
      console.log(`   النوع: ${record.type}`);
      console.log(`   التاريخ: ${record.createdAt.toLocaleDateString()}`);
      
      try {
        const data = JSON.parse(record.data);
        console.log(`   النية: ${data.intent || 'غير محدد'}`);
        console.log(`   المشاعر: ${data.sentiment || 'غير محدد'}`);
        if (data.userMessage) {
          console.log(`   الرسالة: ${data.userMessage.substring(0, 50)}...`);
        }
      } catch (e) {
        console.log('   البيانات غير قابلة للتحليل');
      }
      console.log('');
    });
    
    // البحث عن البيانات الناجحة
    const successful = await prisma.learningData.count({
      where: {
        OR: [
          { outcome: 'satisfied' },
          { outcome: 'purchase' },
          { outcome: 'resolved' }
        ]
      }
    });
    
    console.log(`🎯 البيانات الناجحة: ${successful} من ${total}`);
    console.log(`📊 معدل النجاح: ${((successful / total) * 100).toFixed(2)}%`);
    
    // فحص الشركة
    const company = await prisma.company.findFirst();
    console.log(`\n🏢 معرف الشركة: ${company?.id}`);
    
    // فحص إعدادات التعلم
    const settings = await prisma.learningSettings.findFirst({
      where: { companyId: company?.id }
    });
    
    if (settings) {
      console.log('\n⚙️ إعدادات التعلم:');
      console.log(`   مفعل: ${settings.enabled ? 'نعم' : 'لا'}`);
      console.log(`   التطبيق التلقائي: ${settings.autoApplyImprovements ? 'نعم' : 'لا'}`);
      console.log(`   حد الثقة: ${settings.confidenceThreshold}`);
    } else {
      console.log('\n⚠️ لا توجد إعدادات تعلم');
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
