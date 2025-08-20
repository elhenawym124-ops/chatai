/**
 * فحص مشكلة إعدادات AI
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugAISettings() {
  console.log('🔍 فحص مشكلة إعدادات AI...');
  console.log('='.repeat(40));

  try {
    // 1. فحص إعدادات AI مباشرة
    const aiSettings = await prisma.aiSettings.findMany({
      include: { company: true }
    });

    console.log(`📊 إجمالي إعدادات AI: ${aiSettings.length}`);

    for (const setting of aiSettings) {
      console.log(`\n⚙️ ${setting.company.name}:`);
      console.log(`   ID: ${setting.id}`);
      console.log(`   autoReplyEnabled: ${setting.autoReplyEnabled} (${typeof setting.autoReplyEnabled})`);
      console.log(`   aiEnabled: ${setting.aiEnabled} (${typeof setting.aiEnabled})`);
      console.log(`   autoResponse: ${setting.autoResponse} (${typeof setting.autoResponse})`);
      console.log(`   workingHoursEnabled: ${setting.workingHoursEnabled}`);
      console.log(`   multimodalEnabled: ${setting.multimodalEnabled}`);
      console.log(`   ragEnabled: ${setting.ragEnabled}`);
    }

    // 2. فحص مباشر من قاعدة البيانات
    console.log('\n📊 فحص مباشر من قاعدة البيانات:');
    
    const rawData = await prisma.$queryRaw`
      SELECT 
        c.name as companyName,
        ai.autoReplyEnabled,
        ai.aiEnabled,
        ai.autoResponse,
        ai.workingHoursEnabled
      FROM ai_settings ai
      JOIN companies c ON ai.companyId = c.id
    `;

    for (const row of rawData) {
      console.log(`\n🏢 ${row.companyName}:`);
      console.log(`   autoReplyEnabled: ${row.autoReplyEnabled} (${typeof row.autoReplyEnabled})`);
      console.log(`   aiEnabled: ${row.aiEnabled} (${typeof row.aiEnabled})`);
      console.log(`   autoResponse: ${row.autoResponse} (${typeof row.autoResponse})`);
      console.log(`   workingHoursEnabled: ${row.workingHoursEnabled}`);
    }

    // 3. تحديث مباشر
    console.log('\n🔧 تحديث مباشر لإعدادات AI:');
    
    const updateResult = await prisma.$executeRaw`
      UPDATE ai_settings 
      SET autoReplyEnabled = 1
    `;
    
    console.log(`✅ تم تحديث ${updateResult} سجل`);

    // 4. فحص بعد التحديث
    console.log('\n📊 فحص بعد التحديث:');
    
    const afterUpdate = await prisma.$queryRaw`
      SELECT 
        c.name as companyName,
        ai.autoReplyEnabled
      FROM ai_settings ai
      JOIN companies c ON ai.companyId = c.id
    `;

    for (const row of afterUpdate) {
      console.log(`   ${row.companyName}: autoReplyEnabled = ${row.autoReplyEnabled} (${typeof row.autoReplyEnabled})`);
    }

    // 5. اختبار نهائي للنظام
    console.log('\n🎯 اختبار نهائي للنظام:');
    
    const companies = await prisma.company.findMany({
      include: {
        facebookPages: true,
        geminiKeys: true,
        aiSettings: true
      }
    });

    for (const company of companies) {
      console.log(`\n🏢 ${company.name}:`);
      
      // فحص الشركة
      console.log(`   الشركة نشطة: ${company.isActive ? '✅' : '❌'}`);
      
      // فحص الصفحات
      let pagesOk = true;
      if (company.facebookPages.length > 0) {
        const activePagesResult = await prisma.$queryRaw`
          SELECT COUNT(*) as count 
          FROM facebook_pages 
          WHERE companyId = ${company.id} AND isActive = 1
        `;
        const activeCount = Number(activePagesResult[0].count);
        pagesOk = activeCount > 0;
        console.log(`   الصفحات نشطة: ${activeCount}/${company.facebookPages.length} ${pagesOk ? '✅' : '❌'}`);
      } else {
        console.log(`   الصفحات: لا توجد ✅`);
      }
      
      // فحص مفاتيح Gemini
      const activeKeys = company.geminiKeys.filter(k => k.isActive === true);
      const keysOk = activeKeys.length > 0;
      console.log(`   مفاتيح Gemini نشطة: ${activeKeys.length}/${company.geminiKeys.length} ${keysOk ? '✅' : '❌'}`);
      
      // فحص إعدادات AI بطريقة مختلفة
      let aiOk = false;
      if (company.aiSettings && company.aiSettings.length > 0) {
        const aiSetting = company.aiSettings[0];
        // فحص مباشر من قاعدة البيانات
        const aiCheck = await prisma.$queryRaw`
          SELECT autoReplyEnabled 
          FROM ai_settings 
          WHERE companyId = ${company.id}
        `;
        
        if (aiCheck.length > 0) {
          aiOk = aiCheck[0].autoReplyEnabled === 1;
          console.log(`   إعدادات AI: autoReplyEnabled = ${aiCheck[0].autoReplyEnabled} ${aiOk ? '✅' : '❌'}`);
        }
      } else {
        console.log(`   إعدادات AI: غير موجودة ❌`);
      }
      
      // النتيجة النهائية
      const fullyReady = company.isActive && pagesOk && keysOk && aiOk;
      console.log(`   🎯 جاهزة للرد: ${fullyReady ? '✅ نعم' : '❌ لا'}`);
    }

  } catch (error) {
    console.error('❌ خطأ في فحص إعدادات AI:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الفحص
debugAISettings().catch(console.error);
