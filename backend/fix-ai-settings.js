const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAISettings() {
  console.log('🔧 إصلاح إعدادات الذكاء الصناعي...');
  
  try {
    // 1. تحديث مفتاح Gemini ليستخدم النموذج الصحيح
    console.log('\n🔑 تحديث مفتاح Gemini...');
    const geminiKey = await prisma.geminiKey.findFirst({
      where: { isActive: true }
    });
    
    if (geminiKey) {
      await prisma.geminiKey.update({
        where: { id: geminiKey.id },
        data: {
          model: 'gemini-1.5-flash',
          name: 'Gemini 1.5 Flash - Working'
        }
      });
      console.log('✅ تم تحديث مفتاح Gemini إلى gemini-1.5-flash');
    }
    
    // 2. تحديث إعدادات AI للشركة
    console.log('\n⚙️ تحديث إعدادات AI للشركة...');
    const companyId = 'cmd5c0c9y0000ymzdd7wtv7ib';
    
    await prisma.aiSettings.upsert({
      where: { companyId },
      update: {
        autoReplyEnabled: true,
        confidenceThreshold: 0.8,
        maxResponseDelay: 30,
        model: 'gemini-1.5-flash',
        temperature: 0.7,
        maxTokens: 1000,
        updatedAt: new Date()
      },
      create: {
        companyId,
        autoReplyEnabled: true,
        confidenceThreshold: 0.8,
        maxResponseDelay: 30,
        model: 'gemini-1.5-flash',
        temperature: 0.7,
        maxTokens: 1000
      }
    });
    console.log('✅ تم تحديث إعدادات AI للشركة');
    
    // 3. إضافة مفتاح Gemini جديد إذا لم يكن موجود
    console.log('\n🔑 التأكد من وجود مفتاح Gemini صالح...');
    const workingApiKey = process.env.GEMINI_API_KEY || 'AIzaSyCgrI96CyFIhT6D_RjiWYaghI-hZYUpPQE';
    
    // اختبار المفتاح أولاً
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(workingApiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const result = await model.generateContent('اختبار');
      console.log('✅ مفتاح Gemini يعمل بنجاح');
      
      // إضافة أو تحديث المفتاح في قاعدة البيانات
      await prisma.geminiKey.upsert({
        where: { apiKey: workingApiKey },
        update: {
          model: 'gemini-1.5-flash',
          isActive: true,
          name: 'Working Gemini Key'
        },
        create: {
          name: 'Working Gemini Key',
          apiKey: workingApiKey,
          model: 'gemini-1.5-flash',
          isActive: true,
          usage: JSON.stringify({ used: 0, limit: 1000000 })
        }
      });
      console.log('✅ تم حفظ مفتاح Gemini الصالح في قاعدة البيانات');
      
    } catch (error) {
      console.log('❌ مفتاح Gemini لا يعمل:', error.message);
    }
    
    // 4. تفعيل الذكاء الصناعي في النظام
    console.log('\n🤖 تفعيل الذكاء الصناعي...');
    
    // تحديث ملف ai-settings.json
    const fs = require('fs');
    const aiSettingsPath = './data/ai-settings.json';
    
    const aiSettings = {
      apiKey: workingApiKey,
      isEnabled: true,
      autoReplyEnabled: true,
      confidenceThreshold: 0.8,
      maxResponseDelay: 30,
      model: "gemini-1.5-flash",
      temperature: 0.7,
      maxTokens: 1000,
      updatedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(aiSettingsPath, JSON.stringify(aiSettings, null, 2));
    console.log('✅ تم تحديث ملف ai-settings.json');
    
    // 5. التحقق النهائي
    console.log('\n🔍 التحقق النهائي من الإعدادات...');
    
    const finalCheck = await prisma.aiSettings.findUnique({
      where: { companyId }
    });
    
    const finalGeminiKey = await prisma.geminiKey.findFirst({
      where: { isActive: true, model: 'gemini-1.5-flash' }
    });
    
    console.log('📊 النتائج النهائية:');
    console.log(`   Auto Reply: ${finalCheck?.autoReplyEnabled ? '✅ مفعل' : '❌ معطل'}`);
    console.log(`   Model: ${finalCheck?.model || 'غير محدد'}`);
    console.log(`   Confidence: ${finalCheck?.confidenceThreshold || 'غير محدد'}`);
    console.log(`   Gemini Key: ${finalGeminiKey ? '✅ موجود' : '❌ غير موجود'}`);
    console.log(`   Gemini Model: ${finalGeminiKey?.model || 'غير محدد'}`);
    
    console.log('\n🎉 تم إصلاح جميع إعدادات الذكاء الصناعي بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في إصلاح إعدادات AI:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAISettings();
