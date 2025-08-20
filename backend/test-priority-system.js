/**
 * اختبار نظام الأولوية الجديد
 * Test Priority System
 */

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

async function testPrioritySystem() {
  console.log('🧪 اختبار نظام الأولوية الجديد...\n');
  
  try {
    // 1. فحص إعدادات AI الحالية
    console.log('1️⃣ فحص إعدادات AI الحالية...');
    const aiSettings = await prisma.aiSettings.findFirst({
      where: { companyId: 'cme4yvrco002kuftceydlrwdi' }
    });
    
    if (aiSettings) {
      console.log('✅ وُجدت إعدادات AI:');
      console.log(`   - Company ID: ${aiSettings.companyId}`);
      console.log(`   - Auto Reply: ${aiSettings.autoReplyEnabled}`);
      console.log(`   - Confidence: ${aiSettings.confidenceThreshold}`);
      
      // فحص الأعمدة الجديدة
      if (aiSettings.promptPriority !== undefined) {
        console.log('✅ الأعمدة الجديدة موجودة:');
        console.log(`   - Prompt Priority: ${aiSettings.promptPriority}`);
        console.log(`   - Patterns Priority: ${aiSettings.patternsPriority}`);
        console.log(`   - Conflict Resolution: ${aiSettings.conflictResolution}`);
      } else {
        console.log('⚠️ الأعمدة الجديدة غير موجودة - سيتم إنشاؤها');
      }
    } else {
      console.log('❌ لم توجد إعدادات AI للشركة');
      return;
    }
    
    // 2. اختبار API
    console.log('\n2️⃣ اختبار Priority Settings API...');
    
    try {
      const response = await axios.get('http://localhost:3001/api/v1/priority-settings/cme4yvrco002kuftceydlrwdi');
      console.log('✅ API يعمل بنجاح:');
      console.log(JSON.stringify(response.data, null, 2));
    } catch (apiError) {
      console.log('❌ خطأ في API:', apiError.message);
    }
    
    // 3. اختبار كشف التعارض
    console.log('\n3️⃣ اختبار كشف التعارض...');
    
    const ConflictDetectionService = require('./src/services/conflictDetectionService');
    const conflictDetector = new ConflictDetectionService();
    
    const testPrompt = "انتي اسمك ساره بياعه شاطره اسلوبك كويس خلي الكلام بتاعك علي قد الحاجه";
    const testPatterns = [
      {
        type: 'word_usage',
        pattern: {
          successfulWords: ['بالطبع', 'يسعدني', 'أهلاً وسهلاً'],
          failureWords: ['للأسف', 'غير متوفر']
        }
      }
    ];
    
    const conflicts = await conflictDetector.detectAllConflicts(testPrompt, testPatterns);
    
    if (conflicts.hasConflicts) {
      console.log(`⚠️ تم اكتشاف ${conflicts.conflicts.length} تعارض:`);
      conflicts.conflicts.forEach((conflict, index) => {
        console.log(`   ${index + 1}. ${conflict.type}: ${conflict.description}`);
      });
    } else {
      console.log('✅ لا يوجد تعارض');
    }
    
    // 4. اختبار تحسين البرونت
    console.log('\n4️⃣ اختبار تحسين البرونت مع الأولوية...');
    
    const PromptEnhancementService = require('./src/services/promptEnhancementService');
    const promptEnhancer = new PromptEnhancementService();
    
    const enhancedPrompt = await promptEnhancer.enhancePromptWithPatterns(
      testPrompt,
      testPatterns,
      'general',
      'cme4yvrco002kuftceydlrwdi'
    );
    
    console.log('✅ البرونت المحسن:');
    console.log(enhancedPrompt.substring(0, 200) + '...');
    
    // 5. اختبار تحسين الرد
    console.log('\n5️⃣ اختبار تحسين الرد مع الأولوية...');
    
    const ResponseOptimizer = require('./src/services/responseOptimizer');
    const responseOptimizer = new ResponseOptimizer();
    
    const testResponse = "المقاسات المتاحة من 37 لحد 41";
    const optimizedResponse = await responseOptimizer.optimizeResponse(
      testResponse,
      testPatterns,
      { messageType: 'product_inquiry' },
      'cme4yvrco002kuftceydlrwdi',
      testPrompt
    );
    
    console.log('✅ الرد المحسن:');
    console.log(`   الأصلي: ${testResponse}`);
    console.log(`   المحسن: ${optimizedResponse}`);
    
    console.log('\n🎉 انتهى الاختبار بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الاختبار
testPrioritySystem();
