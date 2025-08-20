const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupMultiKeySystem() {
  console.log('🚀 إعداد نظام المفاتيح المتعددة...\n');
  
  try {
    // 1. الحصول على المفتاح الحالي
    const currentKey = await prisma.geminiKey.findFirst({
      where: { isActive: true }
    });
    
    if (!currentKey) {
      console.log('❌ لا يوجد مفتاح نشط حالياً');
      return;
    }
    
    console.log(`🔑 المفتاح الحالي: ${currentKey.name}`);
    console.log(`🔑 API Key: ${currentKey.apiKey.substring(0, 20)}...`);
    
    // 2. النماذج المتاحة مع حصصها (بترتيب الأولوية)
    const availableModels = [
      {
        name: 'gemini-2.0-flash-exp',
        displayName: 'Gemini 2.0 Flash (Experimental)',
        quota: 10, // 10 requests per minute
        dailyQuota: 1000,
        description: 'أحدث نموذج تجريبي - سريع وذكي'
      },
      {
        name: 'gemini-1.5-flash',
        displayName: 'Gemini 1.5 Flash',
        quota: 15, // 15 requests per minute
        dailyQuota: 1500,
        description: 'سريع وموثوق للمهام العامة'
      },
      {
        name: 'gemini-1.5-pro',
        displayName: 'Gemini 1.5 Pro',
        quota: 2, // 2 requests per minute
        dailyQuota: 50,
        description: 'أكثر ذكاءً لكن أبطأ'
      },
      {
        name: 'gemini-pro',
        displayName: 'Gemini Pro (Legacy)',
        quota: 60, // 60 requests per minute
        dailyQuota: 1000,
        description: 'النموذج القديم مع حصة جيدة'
      }
    ];
    
    console.log('\n📊 النماذج المتاحة:');
    availableModels.forEach((model, index) => {
      console.log(`${index + 1}. ${model.displayName}`);
      console.log(`   النموذج: ${model.name}`);
      console.log(`   الحصة: ${model.quota}/دقيقة، ${model.dailyQuota}/يوم`);
      console.log(`   الوصف: ${model.description}`);
      console.log('');
    });
    
    // 3. إلغاء تفعيل المفتاح الحالي
    await prisma.geminiKey.update({
      where: { id: currentKey.id },
      data: { isActive: false }
    });
    console.log('🔄 تم إلغاء تفعيل المفتاح الحالي');
    
    // 4. إنشاء مفتاح لكل نموذج
    console.log('\n🔧 إنشاء مفاتيح متعددة...');
    
    for (let i = 0; i < availableModels.length; i++) {
      const model = availableModels[i];
      
      try {
        // فحص إذا كان المفتاح موجود بالفعل
        const existingKey = await prisma.geminiKey.findFirst({
          where: {
            apiKey: currentKey.apiKey,
            model: model.name
          }
        });
        
        if (existingKey) {
          console.log(`⚠️ مفتاح ${model.displayName} موجود بالفعل`);
          
          // تحديث المفتاح الموجود
          await prisma.geminiKey.update({
            where: { id: existingKey.id },
            data: {
              name: `${model.displayName} - Auto Rotation`,
              isActive: i === 0, // تفعيل النموذج الأول (أعلى أولوية)
              usage: JSON.stringify({ 
                used: 0, 
                limit: model.dailyQuota,
                perMinute: model.quota 
              }),
              maxRequestsPerDay: model.dailyQuota
            }
          });
          
          console.log(`✅ تم تحديث: ${model.displayName} ${i === 0 ? '(نشط)' : '(احتياطي)'}`);
        } else {
          // إنشاء مفتاح جديد
          const newKey = await prisma.geminiKey.create({
            data: {
              name: `${model.displayName} - Auto Rotation`,
              apiKey: currentKey.apiKey,
              model: model.name,
              isActive: i === 0, // تفعيل النموذج الأول
              usage: JSON.stringify({ 
                used: 0, 
                limit: model.dailyQuota,
                perMinute: model.quota 
              }),
              maxRequestsPerDay: model.dailyQuota,
              currentUsage: 0
            }
          });
          
          console.log(`✅ تم إنشاء: ${model.displayName} ${i === 0 ? '(نشط)' : '(احتياطي)'}`);
        }
        
      } catch (error) {
        console.log(`❌ خطأ في معالجة ${model.displayName}:`, error.message);
      }
    }
    
    // 5. عرض النتيجة النهائية
    console.log('\n📋 النتيجة النهائية:');
    const finalKeys = await prisma.geminiKey.findMany({
      orderBy: { isActive: 'desc' }
    });
    
    finalKeys.forEach((key, index) => {
      console.log(`${index + 1}. ${key.name}`);
      console.log(`   النموذج: ${key.model}`);
      console.log(`   الحالة: ${key.isActive ? '🟢 نشط' : '🔵 احتياطي'}`);
      
      let usageInfo = 'غير محدد';
      if (key.usage) {
        try {
          const usage = JSON.parse(key.usage);
          usageInfo = `${usage.used || 0}/${usage.limit || 1500} (${usage.perMinute || 10}/دقيقة)`;
        } catch (e) {
          usageInfo = `${key.currentUsage || 0}/${key.maxRequestsPerDay || 1500}`;
        }
      }
      
      console.log(`   الاستخدام: ${usageInfo}`);
      console.log('   ─'.repeat(40));
    });
    
    console.log('\n🎉 تم إعداد نظام المفاتيح المتعددة بنجاح!');
    console.log('✅ النظام سيتبديل تلقائياً بين النماذج عند الحاجة');
    console.log('🔄 أعد تشغيل الخادم لتطبيق التغييرات');
    
  } catch (error) {
    console.error('❌ خطأ في إعداد النظام:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupMultiKeySystem();
