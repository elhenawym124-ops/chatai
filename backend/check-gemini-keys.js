const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkGeminiKeys() {
  console.log('🔍 فحص نظام مفاتيح Gemini...\n');
  
  try {
    // 1. فحص المفاتيح الموجودة
    const keys = await prisma.geminiKey.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📊 إجمالي المفاتيح: ${keys.length}\n`);
    
    if (keys.length === 0) {
      console.log('❌ لا توجد مفاتيح Gemini في النظام!');
      return;
    }
    
    // 2. عرض تفاصيل كل مفتاح
    keys.forEach((key, index) => {
      console.log(`${index + 1}. ${key.name}`);
      console.log(`   🔑 المفتاح: ${key.apiKey.substring(0, 20)}...`);
      console.log(`   🤖 النموذج: ${key.model}`);
      console.log(`   ✅ نشط: ${key.isActive ? 'نعم' : 'لا'}`);
      
      // فحص الاستخدام
      let usageInfo = 'غير محدد';
      if (key.usage) {
        try {
          const usage = JSON.parse(key.usage);
          usageInfo = `${usage.used || 0}/${usage.limit || 1500}`;
        } catch (e) {
          usageInfo = `${key.currentUsage || 0}/${key.maxRequestsPerDay || 1500}`;
        }
      } else {
        usageInfo = `${key.currentUsage || 0}/${key.maxRequestsPerDay || 1500}`;
      }
      
      console.log(`   📊 الاستخدام: ${usageInfo}`);
      console.log(`   📅 تاريخ الإنشاء: ${key.createdAt.toLocaleString('ar-EG')}`);
      console.log('   ─'.repeat(40));
    });
    
    // 3. فحص النماذج المتاحة
    const uniqueModels = [...new Set(keys.map(k => k.model))];
    console.log(`\n🤖 النماذج المتاحة: ${uniqueModels.length}`);
    uniqueModels.forEach((model, index) => {
      const modelKeys = keys.filter(k => k.model === model);
      const activeCount = modelKeys.filter(k => k.isActive).length;
      console.log(`${index + 1}. ${model} (${modelKeys.length} مفتاح، ${activeCount} نشط)`);
    });
    
    // 4. فحص المفتاح النشط الحالي
    const activeKey = keys.find(k => k.isActive);
    if (activeKey) {
      console.log(`\n✅ المفتاح النشط الحالي:`);
      console.log(`   الاسم: ${activeKey.name}`);
      console.log(`   النموذج: ${activeKey.model}`);
      
      let currentUsage = 0;
      let maxUsage = 1500;
      
      if (activeKey.usage) {
        try {
          const usage = JSON.parse(activeKey.usage);
          currentUsage = usage.used || 0;
          maxUsage = usage.limit || 1500;
        } catch (e) {
          currentUsage = activeKey.currentUsage || 0;
          maxUsage = activeKey.maxRequestsPerDay || 1500;
        }
      }
      
      console.log(`   الاستخدام: ${currentUsage}/${maxUsage}`);
      console.log(`   المتبقي: ${maxUsage - currentUsage}`);
      
      if (currentUsage >= maxUsage) {
        console.log('   ⚠️ تجاوز الحد الأقصى!');
      } else if (currentUsage > maxUsage * 0.8) {
        console.log('   ⚠️ قريب من الحد الأقصى!');
      } else {
        console.log('   ✅ الاستخدام طبيعي');
      }
    } else {
      console.log('\n❌ لا يوجد مفتاح نشط!');
    }
    
    // 5. التوصيات
    console.log('\n💡 التوصيات:');
    
    if (keys.length === 1) {
      console.log('⚠️ يوجد مفتاح واحد فقط - يُنصح بإضافة مفاتيح احتياطية');
    }
    
    if (uniqueModels.length === 1) {
      console.log('⚠️ يوجد نموذج واحد فقط - يُنصح بإضافة نماذج متعددة');
    }
    
    const inactiveKeys = keys.filter(k => !k.isActive);
    if (inactiveKeys.length > 0) {
      console.log(`✅ يوجد ${inactiveKeys.length} مفتاح احتياطي متاح`);
    }
    
  } catch (error) {
    console.error('❌ خطأ في فحص المفاتيح:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGeminiKeys();
