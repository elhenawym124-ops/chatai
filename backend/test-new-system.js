const aiAgentService = require('./src/services/aiAgentService');

async function testNewGeminiSystem() {
  console.log('🧪 اختبار النظام الجديد لمفاتيح Gemini...\n');
  
  try {
    // اختبار 1: الحصول على مفتاح نشط بالنظام الجديد
    console.log('📋 اختبار 1: الحصول على مفتاح نشط...');
    const activeKey = await aiAgentService.getActiveGeminiKeyNew();
    
    if (activeKey) {
      console.log('✅ تم العثور على مفتاح نشط:');
      console.log(`   المفتاح: ${activeKey.apiKey.substring(0, 20)}...`);
      console.log(`   النموذج: ${activeKey.model}`);
      console.log(`   معرف المفتاح: ${activeKey.keyId}`);
      console.log(`   معرف النموذج: ${activeKey.modelId}`);
    } else {
      console.log('❌ لم يتم العثور على مفتاح نشط');
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // اختبار 2: البحث عن نموذج احتياطي
    console.log('📋 اختبار 2: البحث عن نموذج احتياطي...');
    const backupModel = await aiAgentService.findNextAvailableModel();
    
    if (backupModel) {
      console.log('✅ تم العثور على نموذج احتياطي:');
      console.log(`   المفتاح: ${backupModel.apiKey.substring(0, 20)}...`);
      console.log(`   النموذج: ${backupModel.model}`);
      console.log(`   اسم المفتاح: ${backupModel.keyName}`);
      console.log(`   نوع التبديل: ${backupModel.switchType}`);
    } else {
      console.log('❌ لم يتم العثور على نموذج احتياطي');
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // اختبار 3: عرض حالة جميع المفاتيح والنماذج
    console.log('📋 اختبار 3: عرض حالة جميع المفاتيح والنماذج...');
    await showAllKeysAndModels();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // اختبار 4: محاكاة استنفاد حصة نموذج
    console.log('📋 اختبار 4: محاكاة استنفاد حصة نموذج...');
    await simulateQuotaExhaustion();
    
    console.log('\n🎉 انتهى الاختبار بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

async function showAllKeysAndModels() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  try {
    const keys = await prisma.geminiKey.findMany({
      orderBy: { priority: 'asc' }
    });
    
    console.log(`📊 إجمالي المفاتيح: ${keys.length}`);
    
    for (const key of keys) {
      console.log(`\n🔑 ${key.name} (أولوية: ${key.priority})`);
      console.log(`   المفتاح: ${key.apiKey.substring(0, 20)}...`);
      console.log(`   الحالة: ${key.isActive ? '🟢 نشط' : '⚪ غير نشط'}`);
      
      // عرض النماذج
      const models = await prisma.$queryRaw`
        SELECT * FROM \`gemini_key_models\` 
        WHERE \`keyId\` = ${key.id} 
        ORDER BY \`priority\` ASC
      `;
      
      console.log(`   النماذج المتاحة: ${models.length}`);
      models.forEach((model, index) => {
        const usage = JSON.parse(model.usage);
        const percentage = ((usage.used || 0) / (usage.limit || 1)) * 100;
        console.log(`     ${index + 1}. ${model.model} - ${usage.used}/${usage.limit} (${percentage.toFixed(1)}%) ${model.isEnabled ? '✅' : '❌'}`);
      });
    }
    
    const totalModels = await prisma.$queryRaw`SELECT COUNT(*) as count FROM \`gemini_key_models\``;
    console.log(`\n🎯 إجمالي النماذج المتاحة: ${totalModels[0].count}`);
    
  } catch (error) {
    console.error('❌ خطأ في عرض المفاتيح:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function simulateQuotaExhaustion() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 محاكاة استنفاد حصة النموذج الأول...');
    
    // العثور على أول نموذج نشط
    const firstModel = await prisma.$queryRaw`
      SELECT km.* FROM \`gemini_key_models\` km
      JOIN \`gemini_keys\` k ON km.keyId = k.id
      WHERE k.isActive = true AND km.isEnabled = true
      ORDER BY km.priority ASC
      LIMIT 1
    `;
    
    if (firstModel && firstModel.length > 0) {
      const model = firstModel[0];
      const usage = JSON.parse(model.usage);
      
      console.log(`📊 النموذج الحالي: ${model.model}`);
      console.log(`📊 الاستخدام الحالي: ${usage.used}/${usage.limit}`);
      
      // استنفاد الحصة
      const exhaustedUsage = {
        ...usage,
        used: usage.limit,
        exhaustedAt: new Date().toISOString()
      };
      
      await prisma.$executeRaw`
        UPDATE \`gemini_key_models\` 
        SET \`usage\` = ${JSON.stringify(exhaustedUsage)}
        WHERE \`id\` = ${model.id}
      `;
      
      console.log(`⚠️ تم استنفاد حصة ${model.model}`);
      
      // اختبار التبديل التلقائي
      console.log('🔄 اختبار التبديل التلقائي...');
      const newActiveKey = await aiAgentService.getActiveGeminiKeyNew();
      
      if (newActiveKey) {
        console.log(`✅ تم التبديل بنجاح إلى: ${newActiveKey.model}`);
      } else {
        console.log('❌ فشل في التبديل التلقائي');
      }
      
      // إعادة تعيين الحصة
      await prisma.$executeRaw`
        UPDATE \`gemini_key_models\` 
        SET \`usage\` = ${JSON.stringify(usage)}
        WHERE \`id\` = ${model.id}
      `;
      
      console.log(`🔄 تم إعادة تعيين حصة ${model.model}`);
      
    } else {
      console.log('❌ لم يتم العثور على نموذج للاختبار');
    }
    
  } catch (error) {
    console.error('❌ خطأ في محاكاة استنفاد الحصة:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الاختبار
testNewGeminiSystem();
