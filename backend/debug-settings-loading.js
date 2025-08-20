const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugSettingsLoading() {
  console.log('🔍 فحص تحميل الإعدادات بالتفصيل...\n');
  
  try {
    // 1. فحص قاعدة البيانات مباشرة
    console.log('📊 1. فحص قاعدة البيانات مباشرة:');
    console.log('================================');
    
    const companies = await prisma.company.findMany();
    console.log(`✅ عدد الشركات: ${companies.length}`);
    
    if (companies.length > 0) {
      const firstCompany = companies[0];
      console.log(`🏢 الشركة الأولى: ${firstCompany.name} (${firstCompany.id})`);
      
      const aiSettings = await prisma.aiSettings.findFirst({
        where: { companyId: firstCompany.id }
      });
      
      if (aiSettings) {
        console.log('✅ إعدادات AI موجودة:');
        console.log(`   - autoReplyEnabled: ${aiSettings.autoReplyEnabled}`);
        console.log(`   - workingHours (raw): "${aiSettings.workingHours}"`);
        console.log(`   - workingHours type: ${typeof aiSettings.workingHours}`);
        console.log(`   - maxRepliesPerCustomer: ${aiSettings.maxRepliesPerCustomer}`);
        
        // محاولة parse ساعات العمل
        if (aiSettings.workingHours) {
          try {
            const parsed = JSON.parse(aiSettings.workingHours);
            console.log(`   - workingHours parsed: ${JSON.stringify(parsed)}`);
          } catch (e) {
            console.log(`   - خطأ في parse: ${e.message}`);
          }
        } else {
          console.log('   - workingHours is null/undefined');
        }
      } else {
        console.log('❌ لا توجد إعدادات AI');
      }
    }
    
    // 2. محاكاة كود aiAgentService
    console.log('\n🔄 2. محاكاة كود aiAgentService:');
    console.log('================================');
    
    let isEnabled = true;
    let workingHours = { start: "09:00", end: "18:00" };
    let maxRepliesPerCustomer = 5;
    
    const firstCompany = await prisma.company.findFirst();
    if (firstCompany) {
      console.log(`🏢 تم العثور على الشركة: ${firstCompany.id}`);
      
      const aiSettings = await prisma.aiSettings.findFirst({
        where: { companyId: firstCompany.id }
      });
      
      if (aiSettings) {
        console.log('✅ تم العثور على إعدادات AI');
        
        // تحديث isEnabled
        isEnabled = aiSettings.autoReplyEnabled ?? isEnabled;
        console.log(`   - isEnabled updated to: ${isEnabled}`);
        
        // تحديث maxRepliesPerCustomer
        maxRepliesPerCustomer = aiSettings.maxRepliesPerCustomer ?? maxRepliesPerCustomer;
        console.log(`   - maxRepliesPerCustomer updated to: ${maxRepliesPerCustomer}`);
        
        // تحديث workingHours
        if (aiSettings.workingHours) {
          try {
            workingHours = JSON.parse(aiSettings.workingHours);
            console.log(`   - workingHours updated to: ${JSON.stringify(workingHours)}`);
          } catch (e) {
            console.log(`   - خطأ في parse workingHours: ${e.message}`);
            workingHours = { start: "09:00", end: "18:00" };
            console.log(`   - using default workingHours: ${JSON.stringify(workingHours)}`);
          }
        } else {
          workingHours = { start: "09:00", end: "18:00" };
          console.log(`   - workingHours is null, using default: ${JSON.stringify(workingHours)}`);
        }
      } else {
        console.log('❌ لم يتم العثور على إعدادات AI');
      }
    } else {
      console.log('❌ لم يتم العثور على شركة');
    }
    
    // 3. النتيجة النهائية
    console.log('\n📋 3. النتيجة النهائية:');
    console.log('================================');
    
    const finalResult = {
      isEnabled: isEnabled,
      workingHours: workingHours,
      maxRepliesPerCustomer: maxRepliesPerCustomer
    };
    
    console.log('✅ الإعدادات النهائية:');
    console.log(JSON.stringify(finalResult, null, 2));
    
    // 4. اختبار تحديث workingHours في قاعدة البيانات
    console.log('\n🔄 4. اختبار تحديث workingHours:');
    console.log('================================');
    
    if (firstCompany) {
      const testWorkingHours = '{"start":"09:00","end":"18:00"}';
      
      await prisma.aiSettings.upsert({
        where: { companyId: firstCompany.id },
        update: {
          workingHours: testWorkingHours,
          updatedAt: new Date()
        },
        create: {
          companyId: firstCompany.id,
          autoReplyEnabled: true,
          workingHours: testWorkingHours,
          maxRepliesPerCustomer: 5,
          confidenceThreshold: 0.7
        }
      });
      
      console.log('✅ تم تحديث workingHours في قاعدة البيانات');
      
      // التحقق من التحديث
      const updatedSettings = await prisma.aiSettings.findFirst({
        where: { companyId: firstCompany.id }
      });
      
      console.log(`✅ workingHours بعد التحديث: "${updatedSettings.workingHours}"`);
    }

  } catch (error) {
    console.error('❌ خطأ في الفحص:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugSettingsLoading();
