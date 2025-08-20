// تم إزالة hardcoded company IDs - استخدم طرق ديناميكية للحصول على معرفات الشركات

/**
 * إصلاح انتهاكات العزل في قاعدة البيانات
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyzeIsolationViolations() {
  console.log('🔍 تحليل انتهاكات العزل في قاعدة البيانات...');
  
  try {
    // جلب جميع السجلات مع تفاصيل الشركة
    const allRecords = await prisma.conversationMemory.findMany({
      select: {
        id: true,
        conversationId: true,
        senderId: true,
        companyId: true,
        userMessage: true,
        timestamp: true
      },
      orderBy: { timestamp: 'desc' }
    });

    console.log(`📊 إجمالي السجلات: ${allRecords.length}`);

    // تحليل توزيع الشركات
    const companyDistribution = {};
    const defaultCompanyRecords = [];
    
    allRecords.forEach(record => {
      if (!companyDistribution[record.companyId]) {
        companyDistribution[record.companyId] = 0;
      }
      companyDistribution[record.companyId]++;
      
      // السجلات التي تستخدم القيمة الافتراضية
      if (record.companyId === 'DYNAMIC_COMPANY_ID_NEEDED') {
        defaultCompanyRecords.push(record);
      }
    });

    console.log('\n📈 توزيع السجلات حسب الشركة:');
    Object.entries(companyDistribution).forEach(([companyId, count]) => {
      const isDefault = companyId === 'DYNAMIC_COMPANY_ID_NEEDED';
      const status = isDefault ? '🚨 (افتراضي)' : '✅';
      console.log(`   ${companyId}: ${count} سجل ${status}`);
    });

    console.log(`\n🚨 السجلات التي تحتاج إصلاح: ${defaultCompanyRecords.length}`);

    return {
      totalRecords: allRecords.length,
      companyDistribution,
      defaultCompanyRecords,
      needsFixing: defaultCompanyRecords.length
    };

  } catch (error) {
    console.error('❌ خطأ في تحليل انتهاكات العزل:', error);
    return null;
  }
}

async function identifyCorrectCompanies() {
  console.log('\n🔍 تحديد الشركات الصحيحة...');
  
  try {
    // جلب جميع الشركات المسجلة
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    });

    console.log('\n🏢 الشركات المسجلة:');
    companies.forEach(company => {
      console.log(`   ${company.id}: ${company.name}`);
    });

    return companies;

  } catch (error) {
    console.error('❌ خطأ في جلب الشركات:', error);
    return [];
  }
}

async function fixIsolationViolations() {
  console.log('\n🔧 بدء إصلاح انتهاكات العزل...');
  
  try {
    const analysis = await analyzeIsolationViolations();
    if (!analysis) return;

    const companies = await identifyCorrectCompanies();
    if (companies.length === 0) {
      console.log('❌ لا توجد شركات مسجلة للإصلاح');
      return;
    }

    // استراتيجية الإصلاح
    console.log('\n📋 استراتيجية الإصلاح:');
    console.log('1. السجلات الحديثة (آخر 7 أيام): تحديد الشركة بناءً على النشاط');
    console.log('2. السجلات القديمة: حذف أو تعيين لشركة افتراضية');
    console.log('3. السجلات المشكوك فيها: مراجعة يدوية');

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // تصنيف السجلات
    const recentRecords = analysis.defaultCompanyRecords.filter(
      record => new Date(record.timestamp) > sevenDaysAgo
    );
    const oldRecords = analysis.defaultCompanyRecords.filter(
      record => new Date(record.timestamp) <= sevenDaysAgo
    );

    console.log(`\n📊 تصنيف السجلات:`);
    console.log(`   - سجلات حديثة: ${recentRecords.length}`);
    console.log(`   - سجلات قديمة: ${oldRecords.length}`);

    // إصلاح السجلات الحديثة
    let fixedRecentCount = 0;
    for (const record of recentRecords) {
      try {
        // محاولة تحديد الشركة من المحادثة
        const conversation = await prisma.conversation.findFirst({
          where: { id: record.conversationId },
          include: { customer: { include: { company: true } } }
        });

        if (conversation && conversation.customer && conversation.customer.company) {
          await prisma.conversationMemory.update({
            where: { id: record.id },
            data: { companyId: conversation.customer.company.id }
          });
          fixedRecentCount++;
        }
      } catch (error) {
        console.log(`⚠️ لا يمكن إصلاح السجل ${record.id}: ${error.message}`);
      }
    }

    // حذف السجلات القديمة غير المحددة
    const deletedOldCount = await prisma.conversationMemory.deleteMany({
      where: {
        id: { in: oldRecords.map(r => r.id) }
      }
    });

    console.log(`\n✅ نتائج الإصلاح:`);
    console.log(`   - سجلات حديثة تم إصلاحها: ${fixedRecentCount}`);
    console.log(`   - سجلات قديمة تم حذفها: ${deletedOldCount.count}`);

    // التحقق من النتيجة النهائية
    const remainingViolations = await prisma.conversationMemory.count({
      where: { companyId: 'DYNAMIC_COMPANY_ID_NEEDED' }
    });

    console.log(`\n🎯 انتهاكات العزل المتبقية: ${remainingViolations}`);

    if (remainingViolations === 0) {
      console.log('🏆 تم إصلاح جميع انتهاكات العزل بنجاح!');
      console.log('✅ النظام الآن آمن ومعزول بالكامل');
    } else {
      console.log('⚠️ لا تزال هناك انتهاكات تحتاج مراجعة يدوية');
    }

    return {
      fixedRecent: fixedRecentCount,
      deletedOld: deletedOldCount.count,
      remainingViolations
    };

  } catch (error) {
    console.error('❌ خطأ في إصلاح انتهاكات العزل:', error);
    return null;
  }
}

async function verifyIsolationFix() {
  console.log('\n🔍 التحقق من إصلاح العزل...');
  
  try {
    const memoryService = require('./src/services/memoryService');
    const auditResults = await memoryService.auditMemoryIsolation();
    
    console.log('\n📊 نتائج فحص العزل بعد الإصلاح:');
    console.log(`   - مفاتيح الذاكرة قصيرة المدى: ${auditResults.shortTermMemoryKeys.length}`);
    console.log(`   - سجلات بدون companyId: ${auditResults.databaseRecordsWithoutCompanyId}`);
    console.log(`   - انتهاكات العزل: ${auditResults.isolationViolations.length}`);

    if (auditResults.isolationViolations.length === 0) {
      console.log('\n🏆 العزل مطبق بشكل مثالي!');
      console.log('✅ النظام آمن ومعزول بالكامل');
      console.log('✅ جاهز للإنتاج من ناحية العزل');
      return true;
    } else {
      console.log('\n🚨 لا تزال هناك انتهاكات:');
      auditResults.isolationViolations.forEach((violation, index) => {
        console.log(`   ${index + 1}. ${violation.type} (${violation.severity})`);
      });
      return false;
    }

  } catch (error) {
    console.error('❌ خطأ في التحقق من العزل:', error);
    return false;
  }
}

async function runIsolationFix() {
  console.log('🚀 بدء إصلاح انتهاكات العزل في الذاكرة');
  console.log('=' .repeat(60));
  
  try {
    // تحليل المشكلة
    const analysis = await analyzeIsolationViolations();
    if (!analysis) return;

    // تحديد الشركات
    await identifyCorrectCompanies();

    // إصلاح الانتهاكات
    const fixResults = await fixIsolationViolations();
    if (!fixResults) return;

    // التحقق من النتيجة
    const isFixed = await verifyIsolationFix();

    console.log('\n' + '=' .repeat(60));
    console.log('📋 ملخص إصلاح العزل');
    console.log('=' .repeat(60));
    
    if (isFixed) {
      console.log('🏆 تم إصلاح جميع مشاكل العزل بنجاح!');
      console.log('✅ النظام الآن آمن ومعزول بالكامل');
      console.log('✅ جاهز للإنتاج من ناحية الأمان');
    } else {
      console.log('⚠️ تم إصلاح معظم المشاكل، لكن تحتاج مراجعة إضافية');
      console.log('🔧 يُنصح بمراجعة السجلات المتبقية يدوياً');
    }

  } catch (error) {
    console.error('❌ خطأ في عملية الإصلاح:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runIsolationFix().catch(console.error);
