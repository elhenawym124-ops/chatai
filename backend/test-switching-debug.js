const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSwitchingSystem() {
  console.log('🔍 اختبار نظام التبديل...\n');
  
  try {
    // تحميل خدمة الذكاء الصناعي
    const aiAgentService = require('./src/services/aiAgentService');
    
    console.log('1️⃣ فحص المفاتيح المتاحة...');
    const activeKeys = await prisma.geminiKey.findMany({
      where: { isActive: true },
      orderBy: { priority: 'asc' }
    });
    
    console.log(`✅ تم العثور على ${activeKeys.length} مفتاح نشط`);
    
    for (const key of activeKeys) {
      console.log(`   📋 ${key.name}: ${key.apiKey.substring(0, 20)}...`);
      
      // فحص النماذج في هذا المفتاح
      const models = await prisma.geminiKeyModel.findMany({
        where: { keyId: key.id, isEnabled: true },
        orderBy: { priority: 'asc' }
      });
      
      console.log(`   📊 النماذج المتاحة: ${models.length}`);
      
      for (const model of models) {
        const usage = JSON.parse(model.usage);
        const currentUsage = usage.used || 0;
        const maxRequests = usage.limit || 1000000;
        const isExhausted = currentUsage >= maxRequests;
        
        console.log(`      ${isExhausted ? '❌' : '✅'} ${model.model}: ${currentUsage}/${maxRequests}`);
        
        if (usage.exhaustedAt) {
          console.log(`         ⏰ استنفد في: ${usage.exhaustedAt}`);
        }
      }
    }
    
    console.log('\n2️⃣ اختبار getActiveGeminiKey...');
    const geminiConfig = await aiAgentService.getActiveGeminiKey();
    
    if (geminiConfig) {
      console.log('✅ تم الحصول على مفتاح نشط:');
      console.log(`   النموذج: ${geminiConfig.model}`);
      console.log(`   المفتاح: ${geminiConfig.apiKey.substring(0, 20)}...`);
      console.log(`   نوع التبديل: ${geminiConfig.switchType}`);
    } else {
      console.log('❌ لم يتم العثور على مفتاح نشط');
    }
    
    console.log('\n3️⃣ اختبار findNextAvailableModel...');
    const backupModel = await aiAgentService.findNextAvailableModel();
    
    if (backupModel) {
      console.log('✅ تم العثور على نموذج احتياطي:');
      console.log(`   النموذج: ${backupModel.model}`);
      console.log(`   المفتاح: ${backupModel.apiKey.substring(0, 20)}...`);
      console.log(`   نوع التبديل: ${backupModel.switchType}`);
    } else {
      console.log('❌ لم يتم العثور على نموذج احتياطي');
    }
    
    console.log('\n4️⃣ اختبار الذاكرة المؤقتة...');
    if (aiAgentService.exhaustedModelsCache) {
      console.log(`📋 النماذج المستنفدة في الذاكرة المؤقتة: ${aiAgentService.exhaustedModelsCache.size}`);
      for (const model of aiAgentService.exhaustedModelsCache) {
        console.log(`   ⚠️ ${model}`);
      }
    } else {
      console.log('📋 لا توجد ذاكرة مؤقتة للنماذج المستنفدة');
    }
    
    console.log('\n5️⃣ محاولة رسالة اختبار...');
    const testMessage = {
      conversationId: 'test_switching',
      senderId: 'test_user',
      content: 'مرحبا',
      customerData: { companyId: 'cmdkj6coz0000uf0cyscco6lr' }
    };
    
    const response = await aiAgentService.processCustomerMessage(testMessage);
    
    if (response) {
      console.log('✅ تم إنشاء رد:');
      console.log(`   النجاح: ${response.success}`);
      console.log(`   المحتوى: ${response.content.substring(0, 100)}...`);
      console.log(`   النموذج: ${response.model || 'غير محدد'}`);
      console.log(`   يحتاج تصعيد: ${response.shouldEscalate}`);
    } else {
      console.log('❌ لم يتم إنشاء رد');
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    console.error('📋 تفاصيل الخطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSwitchingSystem();
