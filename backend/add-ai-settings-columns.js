const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addAISettingsColumns() {
  console.log('🔧 إضافة أعمدة جديدة لجدول AiSettings...');
  
  try {
    // إضافة الأعمدة الجديدة باستخدام raw SQL
    console.log('📝 إضافة عمود workingHours...');
    try {
      await prisma.$executeRaw`
        ALTER TABLE ai_settings
        ADD COLUMN workingHours TEXT NULL
      `;
      console.log('✅ تم إضافة عمود workingHours');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('⚠️ عمود workingHours موجود بالفعل');
      } else {
        throw error;
      }
    }
    
    console.log('📝 إضافة عمود maxRepliesPerCustomer...');
    try {
      await prisma.$executeRaw`
        ALTER TABLE ai_settings
        ADD COLUMN maxRepliesPerCustomer INT DEFAULT 5
      `;
      console.log('✅ تم إضافة عمود maxRepliesPerCustomer');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('⚠️ عمود maxRepliesPerCustomer موجود بالفعل');
      } else {
        throw error;
      }
    }
    
    // تحديث القيم الافتراضية للسجلات الموجودة
    console.log('🔄 تحديث القيم الافتراضية...');
    await prisma.$executeRaw`
      UPDATE ai_settings
      SET
        workingHours = '{"start":"09:00","end":"18:00"}',
        maxRepliesPerCustomer = 5
      WHERE workingHours IS NULL OR maxRepliesPerCustomer IS NULL
    `;
    
    console.log('✅ تم تحديث القيم الافتراضية');
    
    // اختبار الإعدادات الجديدة
    console.log('\n🧪 اختبار الإعدادات الجديدة...');
    
    const firstCompany = await prisma.company.findFirst();
    if (firstCompany) {
      const aiSettings = await prisma.aiSettings.upsert({
        where: { companyId: firstCompany.id },
        update: {
          autoReplyEnabled: true,
          workingHours: '{"start":"09:00","end":"18:00"}',
          maxRepliesPerCustomer: 5,
          confidenceThreshold: 0.7,
          updatedAt: new Date()
        },
        create: {
          companyId: firstCompany.id,
          autoReplyEnabled: true,
          workingHours: '{"start":"09:00","end":"18:00"}',
          maxRepliesPerCustomer: 5,
          confidenceThreshold: 0.7
        }
      });
      
      console.log('✅ تم حفظ إعدادات الذكاء الصناعي:');
      console.log(`   - مُفعل: ${aiSettings.autoReplyEnabled}`);
      console.log(`   - ساعات العمل: ${aiSettings.workingHours}`);
      console.log(`   - الحد الأقصى للردود: ${aiSettings.maxRepliesPerCustomer}`);
    }

  } catch (error) {
    console.error('❌ خطأ في إضافة الأعمدة:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addAISettingsColumns();
