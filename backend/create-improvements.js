const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🚀 إنشاء التحسينات من الأنماط المكتشفة...\n');
    
    const company = await prisma.company.findFirst();
    if (!company) {
      console.error('❌ لا توجد شركة');
      return;
    }
    
    // الحصول على الأنماط المكتشفة
    const patterns = await prisma.discoveredPattern.findMany({
      where: { companyId: company.id }
    });
    
    console.log(`📊 الأنماط المكتشفة: ${patterns.length}`);
    
    if (patterns.length === 0) {
      console.log('⚠️ لا توجد أنماط مكتشفة لإنشاء تحسينات منها');
      return;
    }
    
    // إنشاء التحسينات
    const improvements = [];
    
    for (const pattern of patterns) {
      let improvement;
      
      if (pattern.pattern.includes('product_inquiry')) {
        improvement = {
          companyId: company.id,
          patternId: pattern.id,
          type: 'prompt_optimization',
          description: 'تحسين الردود على استفسارات المنتجات بناءً على الأنماط الناجحة',
          implementation: JSON.stringify({
            type: 'prompt_enhancement',
            focus: 'product_inquiries',
            improvements: [
              'إضافة تفاصيل أكثر عن المنتجات',
              'تقديم معلومات الأسعار بوضوح',
              'اقتراح منتجات مشابهة',
              'توضيح مميزات المنتج'
            ],
            expectedOutcome: 'زيادة معدل الرضا والشراء'
          }),
          rolloutPercentage: 25,
          status: 'testing'
        };
      } else if (pattern.pattern.includes('order_inquiry')) {
        improvement = {
          companyId: company.id,
          patternId: pattern.id,
          type: 'prompt_optimization',
          description: 'تحسين عملية معالجة طلبات الشراء والاستفسارات',
          implementation: JSON.stringify({
            type: 'process_optimization',
            focus: 'order_processing',
            improvements: [
              'تبسيط عملية الطلب',
              'توضيح خطوات الشراء',
              'تقديم خيارات دفع متعددة',
              'تأكيد سريع للطلبات'
            ],
            expectedOutcome: 'تقليل معدل التخلي عن الطلبات'
          }),
          rolloutPercentage: 30,
          status: 'testing'
        };
      } else if (pattern.pattern.includes('shipping_inquiry')) {
        improvement = {
          companyId: company.id,
          patternId: pattern.id,
          type: 'rule_adjustment',
          description: 'تحسين معلومات الشحن والتوصيل',
          implementation: JSON.stringify({
            type: 'information_enhancement',
            focus: 'shipping_details',
            improvements: [
              'توضيح أوقات التوصيل بدقة',
              'تقديم خيارات شحن متعددة',
              'معلومات تتبع الطلبات',
              'تكاليف الشحن الشفافة'
            ],
            expectedOutcome: 'تقليل استفسارات الشحن المتكررة'
          }),
          rolloutPercentage: 20,
          status: 'testing'
        };
      } else if (pattern.pattern.includes('rag_usage')) {
        improvement = {
          companyId: company.id,
          patternId: pattern.id,
          type: 'model_update',
          description: 'زيادة استخدام RAG لتحسين دقة الردود',
          implementation: JSON.stringify({
            type: 'system_enhancement',
            focus: 'rag_optimization',
            improvements: [
              'زيادة معدل استخدام RAG إلى 90%',
              'تحسين قاعدة المعرفة',
              'تحديث المعلومات بانتظام',
              'تحسين خوارزمية البحث'
            ],
            expectedOutcome: 'زيادة دقة الردود بنسبة 25%'
          }),
          rolloutPercentage: 15,
          status: 'testing'
        };
      } else {
        improvement = {
          companyId: company.id,
          patternId: pattern.id,
          type: 'prompt_optimization',
          description: `تحسين عام بناءً على النمط: ${pattern.description.substring(0, 50)}...`,
          implementation: JSON.stringify({
            type: 'general_improvement',
            focus: 'overall_performance',
            improvements: [
              'تحسين جودة الردود',
              'زيادة سرعة الاستجابة',
              'تحسين فهم النوايا',
              'تخصيص الردود أكثر'
            ],
            expectedOutcome: 'تحسين عام في الأداء'
          }),
          rolloutPercentage: 10,
          status: 'testing'
        };
      }
      
      improvements.push(improvement);
    }
    
    // حفظ التحسينات
    console.log(`💾 حفظ ${improvements.length} تحسين...\n`);
    
    let savedCount = 0;
    for (const improvement of improvements) {
      try {
        const saved = await prisma.appliedImprovement.create({ data: improvement });
        console.log(`✅ تم حفظ: ${improvement.description}`);
        console.log(`   النوع: ${improvement.type}`);
        console.log(`   نسبة التطبيق: ${improvement.rolloutPercentage}%`);
        console.log('');
        savedCount++;
      } catch (error) {
        console.log(`⚠️ خطأ في حفظ التحسين: ${error.message}`);
      }
    }
    
    // عرض النتائج النهائية
    console.log('📊 النتائج النهائية:');
    const finalPatterns = await prisma.discoveredPattern.count({ where: { companyId: company.id } });
    const finalImprovements = await prisma.appliedImprovement.count({ where: { companyId: company.id } });
    
    console.log(`   - الأنماط المكتشفة: ${finalPatterns}`);
    console.log(`   - التحسينات المحفوظة: ${finalImprovements}`);
    console.log(`   - التحسينات الجديدة: ${savedCount}`);
    
    console.log('\n🎉 تم إنشاء التحسينات بنجاح!');
    console.log('💡 يمكنك الآن مراجعة التحسينات في لوحة التحكم وتطبيقها تدريجياً');
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
