const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addFeaturesColumns() {
  console.log('🔧 إضافة أعمدة المميزات لجدول ai_settings...');
  
  try {
    // إضافة عمود multimodalEnabled
    console.log('📝 إضافة عمود multimodalEnabled...');
    try {
      await prisma.$executeRaw`
        ALTER TABLE ai_settings 
        ADD COLUMN multimodalEnabled BOOLEAN DEFAULT TRUE
      `;
      console.log('✅ تم إضافة عمود multimodalEnabled');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('⚠️ عمود multimodalEnabled موجود بالفعل');
      } else {
        throw error;
      }
    }
    
    // إضافة عمود ragEnabled
    console.log('📝 إضافة عمود ragEnabled...');
    try {
      await prisma.$executeRaw`
        ALTER TABLE ai_settings 
        ADD COLUMN ragEnabled BOOLEAN DEFAULT TRUE
      `;
      console.log('✅ تم إضافة عمود ragEnabled');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('⚠️ عمود ragEnabled موجود بالفعل');
      } else {
        throw error;
      }
    }
    
    // تحديث القيم الافتراضية للسجلات الموجودة
    console.log('🔄 تحديث القيم الافتراضية...');
    await prisma.$executeRaw`
      UPDATE ai_settings 
      SET 
        multimodalEnabled = TRUE,
        ragEnabled = TRUE
      WHERE multimodalEnabled IS NULL OR ragEnabled IS NULL
    `;
    
    console.log('✅ تم تحديث القيم الافتراضية');
    
    // اختبار الحقول الجديدة
    console.log('\n🧪 اختبار الحقول الجديدة...');
    
    const firstCompany = await prisma.company.findFirst();
    if (firstCompany) {
      const aiSettings = await prisma.aiSettings.upsert({
        where: { companyId: firstCompany.id },
        update: {
          multimodalEnabled: true,
          ragEnabled: true,
          updatedAt: new Date()
        },
        create: {
          companyId: firstCompany.id,
          autoReplyEnabled: true,
          workingHours: '{"start":"09:00","end":"18:00"}',
          maxRepliesPerCustomer: 5,
          multimodalEnabled: true,
          ragEnabled: true,
          confidenceThreshold: 0.7
        }
      });
      
      console.log('✅ تم حفظ إعدادات المميزات:');
      console.log(`   - معالجة الوسائط المتعددة: ${aiSettings.multimodalEnabled}`);
      console.log(`   - نظام RAG: ${aiSettings.ragEnabled}`);
    }
    
    // فحص البيانات النهائية
    console.log('\n🔍 فحص البيانات النهائية...');
    const finalSettings = await prisma.aiSettings.findMany();
    finalSettings.forEach(setting => {
      console.log(`✅ الشركة ${setting.companyId}:`);
      console.log(`   - مُفعل: ${setting.autoReplyEnabled}`);
      console.log(`   - ساعات العمل: ${setting.workingHours}`);
      console.log(`   - الحد الأقصى للردود: ${setting.maxRepliesPerCustomer}`);
      console.log(`   - معالجة الوسائط المتعددة: ${setting.multimodalEnabled}`);
      console.log(`   - نظام RAG: ${setting.ragEnabled}`);
    });

  } catch (error) {
    console.error('❌ خطأ في إضافة الأعمدة:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addFeaturesColumns();
