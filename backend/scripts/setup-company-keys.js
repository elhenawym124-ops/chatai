const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupCompanyKeys() {
  try {
    console.log('🔧 إعداد مفاتيح إضافية للشركات...');

    // الحصول على جميع الشركات
    const companies = await prisma.company.findMany();
    console.log(`📋 تم العثور على ${companies.length} شركة`);

    // مفاتيح API إضافية (يمكن إضافة مفاتيح حقيقية هنا)
    const additionalApiKeys = [
      'AIzaSyDummy1-Additional-Key-For-Testing',
      'AIzaSyDummy2-Additional-Key-For-Testing',
      'AIzaSyDummy3-Additional-Key-For-Testing'
    ];

    // إضافة مفاتيح إضافية لكل شركة
    for (const company of companies) {
      console.log(`\n🏢 معالجة الشركة: ${company.name} (${company.id})`);

      // التحقق من عدد المفاتيح الحالية للشركة
      const companyKeys = await prisma.geminiKey.findMany({
        where: { companyId: company.id }
      });

      console.log(`📊 الشركة ${company.name} لديها ${companyKeys.length} مفتاح حالياً`);

      // إضافة مفاتيح إضافية إذا كانت أقل من 3
      const targetKeys = 3;
      const keysToAdd = Math.max(0, targetKeys - companyKeys.length);

      if (keysToAdd === 0) {
        console.log(`✅ الشركة ${company.name} لديها عدد كافي من المفاتيح`);
        continue;
      }

      console.log(`🔧 إضافة ${keysToAdd} مفتاح للشركة ${company.name}`);

      // إضافة المفاتيح الإضافية
      for (let i = 0; i < keysToAdd; i++) {
        const keyIndex = companyKeys.length + i;
        const baseApiKey = additionalApiKeys[i % additionalApiKeys.length];
        const uniqueApiKey = `${baseApiKey}-${company.id}-${keyIndex}`;

        const newKey = await prisma.geminiKey.create({
          data: {
            name: `${company.name}-Key-${keyIndex + 1}`,
            apiKey: uniqueApiKey,
            isActive: keyIndex === 0, // أول مفتاح يكون نشط
            priority: keyIndex + 1,
            companyId: company.id,
            model: 'gemini-2.0-flash-exp',
            usage: '{"used": 0, "limit": 1000000}',
            currentUsage: 0,
            maxRequestsPerDay: 1500
          }
        });

        console.log(`🔑 تم إنشاء مفتاح: ${newKey.name}`);

        // إنشاء النماذج للمفتاح الجديد
        const models = [
          { model: 'gemini-2.0-flash-exp', priority: 1 },
          { model: 'gemini-1.5-flash', priority: 2 },
          { model: 'gemini-1.5-pro', priority: 3 }
        ];

        for (const modelData of models) {
          await prisma.geminiKeyModel.create({
            data: {
              keyId: newKey.id,
              model: modelData.model,
              isEnabled: true,
              priority: modelData.priority,
              usage: '{"used": 0, "limit": 1000000, "resetDate": null}'
            }
          });
        }

        console.log(`📊 تم إنشاء ${models.length} نموذج للمفتاح ${newKey.name}`);
      }
    }

    // تحديث المفاتيح القديمة
    console.log('\n🔄 تحديث إعدادات المفاتيح...');

    console.log('✅ تم إعداد مفاتيح منفصلة للشركات بنجاح!');

    // عرض ملخص
    console.log('\n📊 ملخص الإعداد:');
    for (const company of companies) {
      const companyKeys = await prisma.geminiKey.findMany({
        where: { companyId: company.id },
        include: {
          models: true
        }
      });

      console.log(`🏢 ${company.name}: ${companyKeys.length} مفتاح، ${companyKeys.reduce((sum, key) => sum + key.models.length, 0)} نموذج`);
    }

  } catch (error) {
    console.error('❌ خطأ في إعداد مفاتيح الشركات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الإعداد
setupCompanyKeys();
