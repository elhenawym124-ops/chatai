const { PrismaClient } = require('@prisma/client');

console.log('🔧 إضافة مفتاح Gemini لشركة الحلو...\n');

async function addGeminiKeyToSolaCompany() {
  const prisma = new PrismaClient();
  
  try {
    // العثور على شركة الحلو
    const solaCompany = await prisma.company.findFirst({
      where: { name: 'شركة الحلو' }
    });
    
    if (!solaCompany) {
      console.log('❌ لم يتم العثور على شركة الحلو');
      return;
    }
    
    console.log(`✅ تم العثور على شركة الحلو: ${solaCompany.id}`);
    
    // فحص إذا كان لديها مفتاح بالفعل
    const existingKey = await prisma.geminiKey.findFirst({
      where: { companyId: solaCompany.id }
    });
    
    if (existingKey) {
      console.log('✅ شركة الحلو لديها مفتاح Gemini بالفعل');
      console.log(`   🔑 Key ID: ${existingKey.id}`);
      console.log(`   ✅ نشط: ${existingKey.isActive}`);
      return;
    }
    
    // العثور على مفتاح من شركة أخرى لنسخه
    const sourceKey = await prisma.geminiKey.findFirst({
      where: { 
        isActive: true,
        companyId: 'cme8oj1fo000cufdcg2fquia9' // الشركة الافتراضية
      }
    });
    
    if (!sourceKey) {
      console.log('❌ لم يتم العثور على مفتاح مصدر للنسخ');
      return;
    }
    
    console.log(`✅ تم العثور على مفتاح مصدر: ${sourceKey.keyName}`);
    
    // إنشاء مفتاح جديد لشركة الحلو
    const newKey = await prisma.geminiKey.create({
      data: {
        keyName: 'مفتاح شركة الحلو',
        apiKey: sourceKey.apiKey, // نفس المفتاح
        companyId: solaCompany.id,
        isActive: true,
        dailyLimit: 1500,
        currentUsage: 0,
        models: sourceKey.models,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log('✅ تم إنشاء مفتاح Gemini جديد لشركة الحلو:');
    console.log(`   🔑 Key ID: ${newKey.id}`);
    console.log(`   📛 الاسم: ${newKey.keyName}`);
    console.log(`   🏢 الشركة: ${solaCompany.name}`);
    console.log(`   ✅ نشط: ${newKey.isActive}`);
    console.log(`   📊 الحد اليومي: ${newKey.dailyLimit}`);
    
    // التحقق من النتيجة
    const verification = await prisma.geminiKey.findMany({
      where: { companyId: solaCompany.id },
      include: { company: true }
    });
    
    console.log('\n🔍 التحقق من النتيجة:');
    verification.forEach((key, index) => {
      console.log(`   ${index + 1}. 🔑 "${key.keyName}"`);
      console.log(`      🏢 الشركة: ${key.company.name}`);
      console.log(`      ✅ نشط: ${key.isActive}`);
      console.log(`      📊 الاستخدام: ${key.currentUsage}/${key.dailyLimit}`);
    });
    
    console.log('\n🎉 تم إضافة مفتاح Gemini لشركة الحلو بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addGeminiKeyToSolaCompany();
