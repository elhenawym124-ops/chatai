const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addModernGeminiModels() {
  console.log('🚀 إضافة نماذج Gemini الحديثة...\n');
  
  try {
    // إلغاء تفعيل النماذج القديمة
    console.log('❌ إلغاء تفعيل النماذج القديمة...');
    await prisma.geminiKey.updateMany({
      where: {
        model: {
          in: ['gemini-2.0-flash-exp', 'gemini-1.5-flash', 'gemini-1.5-pro']
        }
      },
      data: { isActive: false }
    });

    // إضافة النماذج الحديثة
    const modernModels = [
      {
        name: 'Gemini 2.5 Flash - الأحدث والأفضل',
        model: 'gemini-2.5-flash',
        apiKey: process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE',
        isActive: true,
        usage: JSON.stringify({
          used: 0,
          limit: 1000000,  // حصة عالية للنموذج الحديث
          perMinute: 1000,
          resetDate: new Date().toISOString()
        })
      },
      {
        name: 'Gemini 2.5 Pro - الأقوى للمهام المعقدة',
        model: 'gemini-2.5-pro',
        apiKey: process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE',
        isActive: false, // احتياطي
        usage: JSON.stringify({
          used: 0,
          limit: 500000,  // حصة متوسطة
          perMinute: 500,
          resetDate: new Date().toISOString()
        })
      },
      {
        name: 'Gemini 2.0 Flash - سريع ومستقر',
        model: 'gemini-2.0-flash',
        apiKey: process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE',
        isActive: false, // احتياطي
        usage: JSON.stringify({
          used: 0,
          limit: 750000,
          perMinute: 750,
          resetDate: new Date().toISOString()
        })
      }
    ];

    console.log('✅ إضافة النماذج الحديثة...');
    for (const modelData of modernModels) {
      // فحص إذا كان النموذج موجود
      const existingModel = await prisma.geminiKey.findFirst({
        where: { model: modelData.model }
      });

      if (existingModel) {
        // تحديث النموذج الموجود
        await prisma.geminiKey.update({
          where: { id: existingModel.id },
          data: {
            name: modelData.name,
            isActive: modelData.isActive,
            usage: modelData.usage
          }
        });
        console.log(`🔄 تم تحديث: ${modelData.name}`);
      } else {
        // إضافة نموذج جديد
        await prisma.geminiKey.create({
          data: modelData
        });
        console.log(`➕ تم إضافة: ${modelData.name}`);
      }
    }

    // عرض الحالة النهائية
    console.log('\n📊 النماذج المتاحة الآن:');
    const allModels = await prisma.geminiKey.findMany({
      orderBy: { createdAt: 'desc' }
    });

    allModels.forEach((model, index) => {
      const usage = JSON.parse(model.usage || '{"used": 0, "limit": 1000}');
      console.log(`${index + 1}. ${model.name}:`);
      console.log(`   النموذج: ${model.model}`);
      console.log(`   نشط: ${model.isActive ? '✅' : '❌'}`);
      console.log(`   الاستخدام: ${usage.used}/${usage.limit}`);
      console.log('');
    });

    console.log('🎉 تم تحديث النماذج بنجاح!');
    console.log('🔄 أعد تشغيل الـ server لتطبيق التغييرات');
    
  } catch (error) {
    console.error('❌ خطأ في إضافة النماذج:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addModernGeminiModels();
