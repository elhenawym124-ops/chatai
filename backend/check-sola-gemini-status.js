const { PrismaClient } = require('@prisma/client');

console.log('🔍 فحص حالة مفتاح Gemini لشركة الحلو...\n');

async function checkSolaGeminiStatus() {
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
    
    console.log(`✅ شركة الحلو: ${solaCompany.name} (${solaCompany.id})`);
    
    // فحص جميع مفاتيح الشركة
    const geminiKeys = await prisma.geminiKey.findMany({
      where: { companyId: solaCompany.id }
    });
    
    console.log(`\n🔑 مفاتيح Gemini لشركة الحلو: ${geminiKeys.length}`);
    
    geminiKeys.forEach((key, index) => {
      console.log(`\n${index + 1}. 🔑 مفتاح:`);
      console.log(`   🆔 ID: ${key.id}`);
      console.log(`   📛 الاسم: ${key.keyName || 'غير محدد'}`);
      console.log(`   ✅ نشط: ${key.isActive}`);
      console.log(`   📊 الاستخدام: ${key.currentUsage}/${key.dailyLimit}`);
      console.log(`   🎯 النماذج: ${key.models || 'جميع النماذج'}`);
      console.log(`   📅 تم الإنشاء: ${key.createdAt}`);
      console.log(`   🔄 آخر تحديث: ${key.updatedAt}`);
    });
    
    // فحص المفاتيح النشطة
    const activeKeys = geminiKeys.filter(key => key.isActive);
    console.log(`\n✅ المفاتيح النشطة: ${activeKeys.length}`);
    
    if (activeKeys.length === 0) {
      console.log('❌ لا توجد مفاتيح نشطة لشركة الحلو!');
      
      // محاولة تفعيل أول مفتاح
      if (geminiKeys.length > 0) {
        console.log('\n🔧 محاولة تفعيل أول مفتاح...');
        
        const firstKey = geminiKeys[0];
        const updatedKey = await prisma.geminiKey.update({
          where: { id: firstKey.id },
          data: { 
            isActive: true,
            currentUsage: 0,
            dailyLimit: 1500,
            keyName: 'مفتاح شركة الحلو',
            models: 'gemini-1.5-flash,gemini-2.0-flash,gemini-2.5-flash',
            updatedAt: new Date()
          }
        });
        
        console.log('✅ تم تفعيل المفتاح:');
        console.log(`   🆔 ID: ${updatedKey.id}`);
        console.log(`   📛 الاسم: ${updatedKey.keyName}`);
        console.log(`   ✅ نشط: ${updatedKey.isActive}`);
        console.log(`   📊 الحد اليومي: ${updatedKey.dailyLimit}`);
      }
    } else {
      console.log('✅ يوجد مفاتيح نشطة');
      activeKeys.forEach((key, index) => {
        console.log(`   ${index + 1}. ${key.keyName || key.id} - ${key.currentUsage}/${key.dailyLimit}`);
      });
    }
    
    // اختبار النظام
    console.log('\n🧪 اختبار النظام...');
    
    // محاكاة البحث عن مفتاح نشط
    console.log(`🔍 البحث عن مفتاح نشط للشركة: ${solaCompany.id}`);
    
    const testActiveKey = await prisma.geminiKey.findFirst({
      where: { 
        companyId: solaCompany.id,
        isActive: true
      }
    });
    
    if (testActiveKey) {
      console.log('✅ تم العثور على مفتاح نشط:');
      console.log(`   🆔 ID: ${testActiveKey.id}`);
      console.log(`   📛 الاسم: ${testActiveKey.keyName}`);
      console.log(`   📊 الاستخدام: ${testActiveKey.currentUsage}/${testActiveKey.dailyLimit}`);
      console.log('✅ النظام جاهز للعمل');
    } else {
      console.log('❌ لم يتم العثور على مفتاح نشط');
      console.log('❌ النظام لن يتمكن من الرد');
    }
    
    console.log('\n🎯 الخلاصة:');
    console.log(`   🏢 الشركة: ${solaCompany.name}`);
    console.log(`   🔑 إجمالي المفاتيح: ${geminiKeys.length}`);
    console.log(`   ✅ المفاتيح النشطة: ${activeKeys.length}`);
    console.log(`   🎯 الحالة: ${testActiveKey ? 'جاهز للعمل' : 'يحتاج إصلاح'}`);
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSolaGeminiStatus();
