/**
 * تحليل مشكلة العزل المكتشفة
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyzeProblem() {
  console.log('🔍 تحليل سبب مشكلة العزل...');
  
  const problematicSenders = ['260345600493273', '114497159957743', '8430624776960377'];
  
  for (const senderId of problematicSenders) {
    console.log(`\n📊 تحليل المرسل ${senderId}:`);
    console.log('='.repeat(50));
    
    const records = await prisma.conversationMemory.findMany({
      where: { senderId },
      select: { 
        id: true,
        companyId: true, 
        conversationId: true,
        userMessage: true, 
        timestamp: true,
        createdAt: true
      },
      orderBy: { timestamp: 'asc' }
    });
    
    // تجميع حسب الشركة
    const byCompany = {};
    for (const record of records) {
      if (!byCompany[record.companyId]) {
        byCompany[record.companyId] = [];
      }
      byCompany[record.companyId].push(record);
    }
    
    console.log('📅 توزيع زمني:');
    for (const [companyId, companyRecords] of Object.entries(byCompany)) {
      console.log(`   ${companyId}: ${companyRecords.length} سجل`);
      console.log(`     أول سجل: ${companyRecords[0].timestamp}`);
      console.log(`     آخر سجل: ${companyRecords[companyRecords.length - 1].timestamp}`);
      console.log(`     أول رسالة: ${companyRecords[0].userMessage.substring(0, 40)}...`);
    }
  }
  
  // فحص كيف تم إنشاء هذه السجلات
  console.log('\n🔍 فحص مصدر المشكلة...');
  
  // فحص إذا كانت هناك عملية نسخ أو تحديث خاطئة
  const duplicateCheck = await prisma.conversationMemory.findMany({
    where: {
      senderId: { in: problematicSenders }
    },
    select: {
      senderId: true,
      companyId: true,
      userMessage: true,
      timestamp: true
    },
    orderBy: [
      { senderId: 'asc' },
      { timestamp: 'asc' }
    ]
  });
  
  console.log('\n📋 جميع السجلات المكررة:');
  let currentSender = null;
  for (const record of duplicateCheck) {
    if (record.senderId !== currentSender) {
      currentSender = record.senderId;
      console.log(`\n👤 المرسل: ${record.senderId}`);
    }
    console.log(`   [${record.companyId}] ${record.userMessage.substring(0, 50)}... (${record.timestamp})`);
  }
  
  await prisma.$disconnect();
}

async function fixIsolationProblem() {
  console.log('\n🔧 إصلاح مشكلة العزل...');
  
  try {
    // الحل: حذف السجلات المكررة والاحتفاظ بالأحدث لكل شركة
    const problematicSenders = ['260345600493273', '114497159957743', '8430624776960377'];
    
    for (const senderId of problematicSenders) {
      console.log(`\n🔧 إصلاح المرسل ${senderId}...`);
      
      // جلب جميع السجلات لهذا المرسل
      const records = await prisma.conversationMemory.findMany({
        where: { senderId },
        orderBy: { timestamp: 'desc' }
      });
      
      // تجميع حسب الشركة والاحتفاظ بالأحدث
      const byCompany = {};
      for (const record of records) {
        if (!byCompany[record.companyId]) {
          byCompany[record.companyId] = [];
        }
        byCompany[record.companyId].push(record);
      }
      
      // تحديد الشركة الأساسية (التي لها أكثر سجلات أو أحدث نشاط)
      let primaryCompany = null;
      let maxRecords = 0;
      let latestTimestamp = new Date(0);
      
      for (const [companyId, companyRecords] of Object.entries(byCompany)) {
        const latestRecord = companyRecords[0]; // الأحدث لأننا رتبنا desc
        
        if (companyRecords.length > maxRecords || 
            (companyRecords.length === maxRecords && latestRecord.timestamp > latestTimestamp)) {
          primaryCompany = companyId;
          maxRecords = companyRecords.length;
          latestTimestamp = latestRecord.timestamp;
        }
      }
      
      console.log(`   الشركة الأساسية: ${primaryCompany} (${maxRecords} سجل)`);
      
      // حذف السجلات من الشركات الأخرى
      for (const [companyId, companyRecords] of Object.entries(byCompany)) {
        if (companyId !== primaryCompany) {
          console.log(`   حذف ${companyRecords.length} سجل من الشركة ${companyId}`);
          
          const recordIds = companyRecords.map(r => r.id);
          await prisma.conversationMemory.deleteMany({
            where: {
              id: { in: recordIds }
            }
          });
        }
      }
    }
    
    console.log('\n✅ تم إصلاح مشكلة العزل بنجاح');
    
  } catch (error) {
    console.error('❌ خطأ في إصلاح العزل:', error.message);
  }
}

async function main() {
  await analyzeProblem();
  
  console.log('\n' + '='.repeat(60));
  console.log('هل تريد إصلاح المشكلة؟ (سيتم حذف السجلات المكررة)');
  console.log('تشغيل: node fix-isolation-now.js');
  console.log('='.repeat(60));
  
  await prisma.$disconnect();
}

main().catch(console.error);
