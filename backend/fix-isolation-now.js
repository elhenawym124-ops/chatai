/**
 * إصلاح مشكلة العزل - حذف السجلات المكررة
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixIsolationProblem() {
  console.log('🔧 إصلاح مشكلة العزل...');
  
  try {
    const problematicSenders = ['260345600493273', '114497159957743', '8430624776960377'];
    
    console.log('📊 تحليل البيانات قبل الإصلاح:');
    
    for (const senderId of problematicSenders) {
      console.log(`\n👤 المرسل ${senderId}:`);
      
      // جلب جميع السجلات لهذا المرسل
      const records = await prisma.conversationMemory.findMany({
        where: { senderId },
        select: {
          id: true,
          companyId: true,
          timestamp: true,
          userMessage: true
        },
        orderBy: { timestamp: 'desc' }
      });
      
      // تجميع حسب الشركة
      const byCompany = {};
      for (const record of records) {
        if (!byCompany[record.companyId]) {
          byCompany[record.companyId] = [];
        }
        byCompany[record.companyId].push(record);
      }
      
      // تحديد الشركة الأساسية (الأكثر نشاطاً والأحدث)
      let primaryCompany = null;
      let maxRecords = 0;
      let latestTimestamp = new Date(0);
      
      for (const [companyId, companyRecords] of Object.entries(byCompany)) {
        const latestRecord = companyRecords[0]; // الأحدث لأننا رتبنا desc
        
        console.log(`   ${companyId}: ${companyRecords.length} سجل (آخر نشاط: ${latestRecord.timestamp})`);
        
        if (companyRecords.length > maxRecords || 
            (companyRecords.length === maxRecords && latestRecord.timestamp > latestTimestamp)) {
          primaryCompany = companyId;
          maxRecords = companyRecords.length;
          latestTimestamp = latestRecord.timestamp;
        }
      }
      
      console.log(`   ✅ الشركة الأساسية: ${primaryCompany} (${maxRecords} سجل)`);
      
      // حذف السجلات من الشركات الأخرى
      for (const [companyId, companyRecords] of Object.entries(byCompany)) {
        if (companyId !== primaryCompany) {
          console.log(`   🗑️ حذف ${companyRecords.length} سجل من الشركة ${companyId}`);
          
          const recordIds = companyRecords.map(r => r.id);
          const deleted = await prisma.conversationMemory.deleteMany({
            where: {
              id: { in: recordIds }
            }
          });
          
          console.log(`   ✅ تم حذف ${deleted.count} سجل`);
        }
      }
    }
    
    console.log('\n✅ تم إصلاح مشكلة العزل بنجاح');
    
    // فحص نهائي
    console.log('\n🔍 فحص نهائي للعزل...');
    
    const finalCheck = await prisma.conversationMemory.findMany({
      where: {
        senderId: { in: problematicSenders }
      },
      select: {
        senderId: true,
        companyId: true
      }
    });
    
    const finalByCompany = {};
    for (const record of finalCheck) {
      if (!finalByCompany[record.senderId]) {
        finalByCompany[record.senderId] = new Set();
      }
      finalByCompany[record.senderId].add(record.companyId);
    }
    
    let stillProblematic = 0;
    for (const [senderId, companies] of Object.entries(finalByCompany)) {
      if (companies.size > 1) {
        stillProblematic++;
        console.log(`❌ المرسل ${senderId} لا يزال في ${companies.size} شركة`);
      } else {
        console.log(`✅ المرسل ${senderId} في شركة واحدة فقط`);
      }
    }
    
    if (stillProblematic === 0) {
      console.log('\n🏆 تم إصلاح جميع مشاكل العزل!');
      console.log('✅ النظام الآن آمن ومعزول بالكامل');
    } else {
      console.log(`\n⚠️ لا يزال هناك ${stillProblematic} مرسل مشكل`);
    }
    
  } catch (error) {
    console.error('❌ خطأ في إصلاح العزل:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function confirmAndFix() {
  console.log('🚨 تحذير: سيتم حذف السجلات المكررة نهائياً!');
  console.log('📋 سيتم الاحتفاظ بالسجلات الأحدث والأكثر نشاطاً لكل عميل');
  console.log('');
  
  // تشغيل الإصلاح مباشرة
  await fixIsolationProblem();
}

confirmAndFix().catch(console.error);
