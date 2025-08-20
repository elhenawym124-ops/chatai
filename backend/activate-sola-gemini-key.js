const { PrismaClient } = require('@prisma/client');

console.log('🔧 تفعيل مفتاح Gemini لشركة الحلو...\n');

async function activateSolaGeminiKey() {
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
    
    // العثور على مفتاح شركة الحلو
    const solaKey = await prisma.geminiKey.findFirst({
      where: { companyId: solaCompany.id }
    });
    
    if (!solaKey) {
      console.log('❌ لم يتم العثور على مفتاح لشركة الحلو');
      return;
    }
    
    console.log(`🔑 تم العثور على المفتاح: ${solaKey.keyName}`);
    console.log(`   ✅ نشط حالياً: ${solaKey.isActive}`);
    
    if (solaKey.isActive) {
      console.log('✅ المفتاح نشط بالفعل');
      return;
    }
    
    // تفعيل المفتاح
    const updatedKey = await prisma.geminiKey.update({
      where: { id: solaKey.id },
      data: { 
        isActive: true,
        currentUsage: 0, // إعادة تعيين الاستخدام
        updatedAt: new Date()
      }
    });
    
    console.log('✅ تم تفعيل المفتاح بنجاح:');
    console.log(`   🔑 Key ID: ${updatedKey.id}`);
    console.log(`   📛 الاسم: ${updatedKey.keyName}`);
    console.log(`   ✅ نشط: ${updatedKey.isActive}`);
    console.log(`   📊 الاستخدام: ${updatedKey.currentUsage}/${updatedKey.dailyLimit}`);
    
    // التحقق من جميع مفاتيح الشركة
    const allKeys = await prisma.geminiKey.findMany({
      where: { companyId: solaCompany.id },
      include: { company: true }
    });
    
    console.log('\n🔍 جميع مفاتيح شركة الحلو:');
    allKeys.forEach((key, index) => {
      console.log(`   ${index + 1}. 🔑 "${key.keyName}"`);
      console.log(`      ✅ نشط: ${key.isActive}`);
      console.log(`      📊 الاستخدام: ${key.currentUsage}/${key.dailyLimit}`);
      console.log(`      🎯 النماذج: ${key.models || 'جميع النماذج'}`);
    });
    
    console.log('\n🎉 تم تفعيل مفتاح Gemini لشركة الحلو بنجاح!');
    console.log('✅ الآن سولا 132 ستتمكن من الرد على الرسائل');
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

activateSolaGeminiKey();
