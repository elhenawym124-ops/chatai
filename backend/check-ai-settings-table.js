const { PrismaClient } = require('@prisma/client');

async function checkAISettingsTable() {
  console.log('🔍 فحص جدول AI Settings في قاعدة البيانات\n');

  const prisma = new PrismaClient();
  
  try {
    // 1. فحص وجود الجدول
    console.log('1️⃣ فحص وجود جدول aiSettings:');
    console.log('═══════════════════════════════════════');

    try {
      const count = await prisma.aiSettings.count();
      console.log('✅ جدول aiSettings موجود');
      console.log('📊 عدد السجلات:', count);
    } catch (error) {
      console.log('❌ جدول aiSettings غير موجود:', error.message);
      return;
    }

    // 2. فحص السجلات الموجودة
    console.log('\n2️⃣ فحص السجلات الموجودة:');
    console.log('═══════════════════════════════════════');

    const allSettings = await prisma.aiSettings.findMany({
      select: {
        id: true,
        companyId: true,
        autoReplyEnabled: true,
        confidenceThreshold: true,
        qualityEvaluationEnabled: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (allSettings.length === 0) {
      console.log('⚠️ لا توجد سجلات في جدول aiSettings');
    } else {
      console.log('📋 السجلات الموجودة:');
      allSettings.forEach((setting, index) => {
        console.log(`${index + 1}. الشركة: ${setting.companyId}`);
        console.log(`   - Auto Reply: ${setting.autoReplyEnabled}`);
        console.log(`   - Confidence: ${setting.confidenceThreshold}`);
        console.log(`   - Quality Eval: ${setting.qualityEvaluationEnabled}`);
        console.log(`   - تاريخ الإنشاء: ${setting.createdAt}`);
        console.log('');
      });
    }

    // 3. فحص الشركات الموجودة
    console.log('3️⃣ فحص الشركات الموجودة:');
    console.log('═══════════════════════════════════════');

    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        isActive: true
      }
    });

    console.log('🏢 الشركات الموجودة:');
    companies.forEach((company, index) => {
      console.log(`${index + 1}. ${company.name} (${company.id}) - ${company.isActive ? 'نشط' : 'غير نشط'}`);
    });

    // 4. إنشاء سجل AI Settings للشركة الأولى إذا لم يكن موجوداً
    if (allSettings.length === 0 && companies.length > 0) {
      console.log('\n4️⃣ إنشاء سجل AI Settings للشركة الأولى:');
      console.log('═══════════════════════════════════════');

      const firstCompany = companies[0];
      
      try {
        const newSettings = await prisma.aiSettings.create({
          data: {
            companyId: firstCompany.id,
            autoReplyEnabled: true,
            confidenceThreshold: 0.7,
            multimodalEnabled: true,
            ragEnabled: true,
            qualityEvaluationEnabled: true
          }
        });

        console.log('✅ تم إنشاء سجل AI Settings:');
        console.log('🏢 الشركة:', firstCompany.name);
        console.log('🆔 معرف الشركة:', firstCompany.id);
        console.log('⚙️ الإعدادات:', {
          autoReplyEnabled: newSettings.autoReplyEnabled,
          confidenceThreshold: newSettings.confidenceThreshold,
          qualityEvaluationEnabled: newSettings.qualityEvaluationEnabled
        });
      } catch (error) {
        console.log('❌ فشل في إنشاء سجل AI Settings:', error.message);
      }
    }

    // 5. اختبار قراءة الإعدادات للشركة الأولى
    if (companies.length > 0) {
      console.log('\n5️⃣ اختبار قراءة الإعدادات:');
      console.log('═══════════════════════════════════════');

      const firstCompany = companies[0];
      
      const settings = await prisma.aiSettings.findUnique({
        where: { companyId: firstCompany.id },
        select: {
          companyId: true,
          autoReplyEnabled: true,
          confidenceThreshold: true,
          multimodalEnabled: true,
          ragEnabled: true,
          qualityEvaluationEnabled: true
        }
      });

      if (settings) {
        console.log('✅ تم قراءة الإعدادات بنجاح:');
        console.log('📊 البيانات:', settings);
        console.log('🔍 العزل صحيح:', settings.companyId === firstCompany.id);
      } else {
        console.log('❌ لم يتم العثور على إعدادات للشركة');
      }
    }

  } catch (error) {
    console.error('❌ خطأ في فحص قاعدة البيانات:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAISettingsTable();
