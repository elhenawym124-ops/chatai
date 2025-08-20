const { PrismaClient } = require('@prisma/client');

console.log('🔧 إصلاح تفاصيل مفتاح Gemini لشركة الحلو...\n');

async function fixSolaGeminiDetails() {
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
    
    console.log(`✅ شركة الحلو: ${solaCompany.id}`);
    
    // العثور على المفتاح النشط
    const activeKey = await prisma.geminiKey.findFirst({
      where: { 
        companyId: solaCompany.id,
        isActive: true
      }
    });
    
    if (!activeKey) {
      console.log('❌ لم يتم العثور على مفتاح نشط');
      return;
    }
    
    console.log(`🔑 المفتاح الحالي: ${activeKey.id}`);
    console.log(`   📛 الاسم: ${activeKey.keyName || 'غير محدد'}`);
    console.log(`   📊 الحد اليومي: ${activeKey.dailyLimit || 'غير محدد'}`);
    
    // تحديث تفاصيل المفتاح
    const updatedKey = await prisma.geminiKey.update({
      where: { id: activeKey.id },
      data: {
        keyName: 'مفتاح شركة الحلو - سولا 132',
        dailyLimit: 1500,
        currentUsage: 0,
        models: 'gemini-1.5-flash,gemini-2.0-flash,gemini-2.5-flash,gemini-2.5-pro',
        isActive: true,
        updatedAt: new Date()
      }
    });
    
    console.log('\n✅ تم تحديث المفتاح بنجاح:');
    console.log(`   🆔 ID: ${updatedKey.id}`);
    console.log(`   📛 الاسم: ${updatedKey.keyName}`);
    console.log(`   📊 الحد اليومي: ${updatedKey.dailyLimit}`);
    console.log(`   📊 الاستخدام الحالي: ${updatedKey.currentUsage}`);
    console.log(`   🎯 النماذج: ${updatedKey.models}`);
    console.log(`   ✅ نشط: ${updatedKey.isActive}`);
    
    // التحقق من النتيجة
    console.log('\n🧪 اختبار النتيجة...');
    
    const verifyKey = await prisma.geminiKey.findFirst({
      where: { 
        companyId: solaCompany.id,
        isActive: true
      }
    });
    
    if (verifyKey && verifyKey.dailyLimit && verifyKey.keyName) {
      console.log('✅ المفتاح جاهز للعمل:');
      console.log(`   📛 ${verifyKey.keyName}`);
      console.log(`   📊 ${verifyKey.currentUsage}/${verifyKey.dailyLimit}`);
      console.log('✅ سولا 132 ستتمكن من الرد الآن');
    } else {
      console.log('❌ لا يزال هناك مشكلة في المفتاح');
    }
    
    console.log('\n🎉 تم إصلاح مفتاح شركة الحلو بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixSolaGeminiDetails();
