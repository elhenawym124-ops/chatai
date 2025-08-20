const { PrismaClient } = require('@prisma/client');

console.log('🔍 فحص schema جدول geminiKey...\n');

async function checkGeminiSchema() {
  const prisma = new PrismaClient();
  
  try {
    // فحص schema الجدول
    console.log('📋 فحص أعمدة جدول gemini_keys:');
    const columns = await prisma.$queryRaw`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'gemini_keys'
      ORDER BY ORDINAL_POSITION
    `;
    
    console.log(`✅ تم العثور على ${columns.length} عمود:`);
    columns.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.COLUMN_NAME} (${col.DATA_TYPE}) - ${col.IS_NULLABLE === 'YES' ? 'nullable' : 'not null'}`);
    });
    
    // فحص البيانات الحالية
    console.log('\n📊 البيانات الحالية:');
    const keys = await prisma.geminiKey.findMany({
      include: { company: true }
    });
    
    console.log(`🔑 عدد المفاتيح: ${keys.length}`);
    keys.forEach((key, index) => {
      console.log(`\n${index + 1}. 🔑 "${key.name || key.id}"`);
      console.log(`   🆔 ID: ${key.id}`);
      console.log(`   📛 الاسم: ${key.name || 'غير محدد'}`);
      console.log(`   🔑 API Key: ${key.apiKey ? key.apiKey.substring(0, 20) + '...' : 'غير محدد'}`);
      console.log(`   🎯 النموذج: ${key.model || 'غير محدد'}`);
      console.log(`   📊 الاستخدام: ${key.usage || 'غير محدد'}`);
      console.log(`   📈 الحد الأقصى: ${key.maxRequestsPerDay || 'غير محدد'}`);
      console.log(`   🏢 الشركة: ${key.company.name} (${key.company.id})`);
      console.log(`   📅 تم الإنشاء: ${key.createdAt}`);
    });
    
    // تحديث مفتاح شركة الحلو بالـ schema الصحيح
    console.log('\n🔧 تحديث مفتاح شركة الحلو...');
    
    const solaCompany = await prisma.company.findFirst({
      where: { name: 'شركة الحلو' }
    });
    
    if (solaCompany) {
      const solaKey = await prisma.geminiKey.findFirst({
        where: { companyId: solaCompany.id }
      });
      
      if (solaKey) {
        console.log(`🔑 تحديث المفتاح: ${solaKey.id}`);
        
        const updatedKey = await prisma.geminiKey.update({
          where: { id: solaKey.id },
          data: {
            name: 'مفتاح شركة الحلو - سولا 132',
            maxRequestsPerDay: 1500,
            usage: '0',
            model: 'gemini-1.5-flash',
            description: 'مفتاح Gemini لصفحة سولا 132'
          }
        });
        
        console.log('✅ تم تحديث المفتاح بنجاح:');
        console.log(`   📛 الاسم: ${updatedKey.name}`);
        console.log(`   📈 الحد الأقصى: ${updatedKey.maxRequestsPerDay}`);
        console.log(`   📊 الاستخدام: ${updatedKey.usage}`);
        console.log(`   🎯 النموذج: ${updatedKey.model}`);
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkGeminiSchema();
