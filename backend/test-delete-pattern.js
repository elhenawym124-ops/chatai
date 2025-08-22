const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDeletePattern() {
  try {
    console.log('🧪 اختبار حذف الأنماط...');
    
    const companyId = 'cme8zve740006ufbcre9qzue4';
    
    // 1. عرض الأنماط الحالية
    const currentPatterns = await prisma.successPattern.findMany({
      where: { companyId },
      select: {
        id: true,
        patternType: true,
        description: true,
        isApproved: true,
        isActive: true,
        successRate: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log(`📊 الأنماط الحالية: ${currentPatterns.length}`);
    
    if (currentPatterns.length === 0) {
      console.log('❌ لا توجد أنماط للاختبار');
      return;
    }
    
    currentPatterns.forEach((pattern, index) => {
      console.log(`${index + 1}. ${pattern.patternType} - ${pattern.description.substring(0, 50)}...`);
      console.log(`   معتمد: ${pattern.isApproved}, نشط: ${pattern.isActive}, نجاح: ${pattern.successRate}`);
      console.log(`   ID: ${pattern.id}`);
      console.log('');
    });
    
    // 2. اختيار نمط للحذف (أقل نمط في معدل النجاح)
    const patternToDelete = currentPatterns
      .filter(p => !p.isApproved) // نحذف نمط غير معتمد فقط للأمان
      .sort((a, b) => a.successRate - b.successRate)[0];
    
    if (!patternToDelete) {
      console.log('⚠️ لا توجد أنماط غير معتمدة للحذف الآمن');
      
      // إنشاء نمط تجريبي للحذف
      console.log('🔧 إنشاء نمط تجريبي للحذف...');
      
      const testPattern = await prisma.successPattern.create({
        data: {
          companyId,
          patternType: 'test_pattern',
          description: 'نمط تجريبي للحذف - تم إنشاؤه للاختبار',
          pattern: JSON.stringify({
            type: 'test',
            content: 'هذا نمط تجريبي للحذف'
          }),
          successRate: 0.1,
          confidenceLevel: 0.1,
          isApproved: false,
          isActive: false,
          metadata: JSON.stringify({
            createdForTesting: true,
            createdAt: new Date().toISOString()
          })
        }
      });
      
      console.log(`✅ تم إنشاء نمط تجريبي: ${testPattern.id}`);
      
      // استخدام النمط التجريبي للحذف
      patternToDelete = testPattern;
    }
    
    console.log(`🎯 النمط المختار للحذف:`);
    console.log(`   النوع: ${patternToDelete.patternType}`);
    console.log(`   الوصف: ${patternToDelete.description}`);
    console.log(`   ID: ${patternToDelete.id}`);
    
    // 3. فحص سجلات الاستخدام قبل الحذف
    const usageRecords = await prisma.patternUsage.findMany({
      where: {
        patternId: patternToDelete.id,
        companyId
      },
      select: {
        id: true,
        applied: true,
        createdAt: true
      }
    });
    
    console.log(`📊 سجلات الاستخدام للنمط: ${usageRecords.length}`);
    
    if (usageRecords.length > 0) {
      console.log('📋 سجلات الاستخدام:');
      usageRecords.slice(0, 3).forEach((usage, index) => {
        console.log(`   ${index + 1}. مطبق: ${usage.applied}, التاريخ: ${usage.createdAt}`);
      });
    }
    
    // 4. محاكاة استدعاء API للحذف
    console.log('\n🔥 محاكاة حذف النمط...');
    
    try {
      // حذف سجلات الاستخدام أولاً
      const deletedUsageCount = await prisma.patternUsage.deleteMany({
        where: { 
          patternId: patternToDelete.id,
          companyId 
        }
      });
      
      console.log(`🗑️ تم حذف ${deletedUsageCount.count} سجل استخدام`);
      
      // حذف النمط نهائياً
      await prisma.successPattern.delete({
        where: { id: patternToDelete.id }
      });
      
      console.log(`✅ تم حذف النمط نهائياً: ${patternToDelete.id}`);
      
    } catch (deleteError) {
      console.error(`❌ خطأ في الحذف: ${deleteError.message}`);
      throw deleteError;
    }
    
    // 5. التحقق من الحذف
    console.log('\n🔍 التحقق من الحذف...');
    
    const deletedPattern = await prisma.successPattern.findUnique({
      where: { id: patternToDelete.id }
    });
    
    if (deletedPattern) {
      console.log('❌ النمط لا يزال موجود! فشل الحذف');
    } else {
      console.log('✅ تم التأكد من حذف النمط نهائياً');
    }
    
    const remainingUsage = await prisma.patternUsage.findMany({
      where: {
        patternId: patternToDelete.id,
        companyId
      }
    });
    
    if (remainingUsage.length > 0) {
      console.log(`❌ لا تزال هناك ${remainingUsage.length} سجلات استخدام!`);
    } else {
      console.log('✅ تم حذف جميع سجلات الاستخدام');
    }
    
    // 6. عرض الأنماط بعد الحذف
    const finalPatterns = await prisma.successPattern.findMany({
      where: { companyId },
      select: {
        id: true,
        patternType: true,
        description: true,
        isApproved: true,
        isActive: true
      }
    });
    
    console.log(`\n📊 الأنماط بعد الحذف: ${finalPatterns.length}`);
    console.log(`📉 تم حذف ${currentPatterns.length - finalPatterns.length} نمط`);
    
    console.log('\n🎉 اختبار الحذف مكتمل بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في اختبار الحذف:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDeletePattern();
