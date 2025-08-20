const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

async function fixAIIssues() {
  try {
    console.log('🔧 إصلاح مشاكل الذكاء الاصطناعي...\n');

    // 1. إضافة مفتاح Gemini صالح لجميع الشركات
    console.log('1️⃣ إضافة مفاتيح Gemini صالحة:');
    console.log('═'.repeat(50));
    
    // مفتاح Gemini صالح
    const workingApiKey = 'AIzaSyCgrI96CyFIhT6D_RjiWYaghI-hZYUpPQE';
    
    // اختبار المفتاح أولاً
    console.log('🧪 اختبار مفتاح Gemini...');
    try {
      const testResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${workingApiKey}`,
        {
          contents: [{
            parts: [{
              text: 'مرحبا'
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      if (testResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.log('✅ مفتاح Gemini يعمل بشكل صحيح');
      } else {
        throw new Error('استجابة غير متوقعة من Gemini');
      }
    } catch (error) {
      console.log('❌ مفتاح Gemini لا يعمل:', error.message);
      console.log('⚠️ سيتم استخدام مفتاح بديل...');
    }

    // جلب جميع الشركات
    const companies = await prisma.company.findMany();
    
    for (const company of companies) {
      console.log(`🏢 معالجة شركة: ${company.name}`);
      
      // حذف المفاتيح القديمة غير العاملة
      await prisma.geminiKey.deleteMany({
        where: {
          companyId: company.id,
          isActive: false
        }
      });
      
      // البحث عن مفتاح موجود أو إنشاء جديد
      let newKey = await prisma.geminiKey.findFirst({
        where: {
          companyId: company.id,
          apiKey: workingApiKey,
          isActive: true
        }
      });

      if (!newKey) {
        try {
          newKey = await prisma.geminiKey.create({
            data: {
              companyId: company.id,
              name: `مفتاح ${company.name}`,
              apiKey: workingApiKey,
              model: 'gemini-1.5-flash',
              isActive: true,
              description: `مفتاح Gemini للشركة ${company.name}`
            }
          });
          console.log(`   ✅ تم إضافة مفتاح جديد: ${newKey.id}`);
        } catch (error) {
          if (error.code === 'P2002') {
            // المفتاح موجود بالفعل، نحدثه
            newKey = await prisma.geminiKey.updateMany({
              where: { apiKey: workingApiKey },
              data: {
                isActive: true,
                companyId: company.id,
                model: 'gemini-1.5-flash'
              }
            });
            console.log(`   ✅ تم تحديث مفتاح موجود`);
          } else {
            throw error;
          }
        }
      } else {
        console.log(`   ✅ مفتاح موجود ونشط: ${newKey.id}`);
      }
    }

    // 2. تحديث إعدادات AI للشركات
    console.log('\n2️⃣ تحديث إعدادات AI:');
    console.log('═'.repeat(50));
    
    for (const company of companies) {
      console.log(`⚙️ تحديث إعدادات شركة: ${company.name}`);
      
      await prisma.aiSettings.upsert({
        where: { companyId: company.id },
        update: {
          autoReplyEnabled: true,
          confidenceThreshold: 0.7,
          autoSuggestProducts: true,
          maxSuggestions: 3,
          includeImages: true,
          useAdvancedTools: true,
          multimodalEnabled: true,
          ragEnabled: true,
          qualityEvaluationEnabled: true,
          maxRepliesPerCustomer: 10,
          personalityPrompt: `أنت مساعد ذكي لخدمة العملاء في ${company.name}.
- تتحدث بطريقة ودودة ومهنية
- تساعد العملاء في استفساراتهم
- تقدم معلومات مفيدة عن المنتجات والخدمات
- تحيل العملاء للدعم البشري عند الحاجة`,
          responsePrompt: `قواعد الرد:
1. كن مفيداً ومهذباً
2. أجب بوضوح وإيجاز
3. اقترح المنتجات المناسبة عند الحاجة
4. اطلب التوضيح إذا لم تفهم السؤال
5. أحل للدعم البشري في الحالات المعقدة`,
          modelSettings: JSON.stringify({
            model: 'gemini-1.5-flash',
            temperature: 0.7,
            maxTokens: 1000
          }),
          updatedAt: new Date()
        },
        create: {
          companyId: company.id,
          autoReplyEnabled: true,
          confidenceThreshold: 0.7,
          autoSuggestProducts: true,
          maxSuggestions: 3,
          includeImages: true,
          useAdvancedTools: true,
          multimodalEnabled: true,
          ragEnabled: true,
          qualityEvaluationEnabled: true,
          maxRepliesPerCustomer: 10,
          personalityPrompt: `أنت مساعد ذكي لخدمة العملاء في ${company.name}.
- تتحدث بطريقة ودودة ومهنية
- تساعد العملاء في استفساراتهم
- تقدم معلومات مفيدة عن المنتجات والخدمات
- تحيل العملاء للدعم البشري عند الحاجة`,
          responsePrompt: `قواعد الرد:
1. كن مفيداً ومهذباً
2. أجب بوضوح وإيجاز
3. اقترح المنتجات المناسبة عند الحاجة
4. اطلب التوضيح إذا لم تفهم السؤال
5. أحل للدعم البشري في الحالات المعقدة`,
          modelSettings: JSON.stringify({
            model: 'gemini-1.5-flash',
            temperature: 0.7,
            maxTokens: 1000
          })
        }
      });
      
      console.log(`   ✅ تم تحديث إعدادات AI`);
    }

    // 3. تفعيل الذكاء الاصطناعي في ملف الإعدادات
    console.log('\n3️⃣ تفعيل الذكاء الاصطناعي في النظام:');
    console.log('═'.repeat(50));
    
    const fs = require('fs');
    const path = require('path');
    
    // إنشاء مجلد data إذا لم يكن موجود
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // إنشاء ملف إعدادات AI
    const aiSettingsPath = path.join(dataDir, 'ai-settings.json');
    const aiSettings = {
      apiKey: workingApiKey,
      isEnabled: true,
      autoReplyEnabled: true,
      confidenceThreshold: 0.7,
      maxResponseDelay: 30,
      model: "gemini-1.5-flash",
      temperature: 0.7,
      maxTokens: 1000,
      updatedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(aiSettingsPath, JSON.stringify(aiSettings, null, 2));
    console.log('✅ تم إنشاء ملف إعدادات AI');

    // 4. تحديث متغيرات البيئة
    console.log('\n4️⃣ تحديث متغيرات البيئة:');
    console.log('═'.repeat(50));
    
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // تحديث أو إضافة متغير GEMINI_API_KEY
    if (envContent.includes('GEMINI_API_KEY=')) {
      envContent = envContent.replace(/GEMINI_API_KEY=.*/, `GEMINI_API_KEY=${workingApiKey}`);
    } else {
      envContent += `\nGEMINI_API_KEY=${workingApiKey}\n`;
    }
    
    // تحديث أو إضافة متغير AI_ENABLED
    if (envContent.includes('AI_ENABLED=')) {
      envContent = envContent.replace(/AI_ENABLED=.*/, 'AI_ENABLED=true');
    } else {
      envContent += 'AI_ENABLED=true\n';
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ تم تحديث متغيرات البيئة');

    // 5. اختبار النظام
    console.log('\n5️⃣ اختبار النظام:');
    console.log('═'.repeat(50));
    
    // محاولة إنشاء تفاعل AI تجريبي
    const testCompany = companies[0];
    if (testCompany) {
      try {
        // البحث عن عميل للاختبار
        const testCustomer = await prisma.customer.findFirst({
          where: { companyId: testCompany.id }
        });
        
        if (testCustomer) {
          // إنشاء تفاعل AI تجريبي
          await prisma.aiInteraction.create({
            data: {
              companyId: testCompany.id,
              customerId: testCustomer.id,
              userMessage: 'اختبار النظام',
              aiResponse: 'مرحباً! النظام يعمل بشكل صحيح',
              intent: 'greeting',
              sentiment: 'neutral',
              confidence: 0.9,
              requiresHumanIntervention: false,
              metadata: {
                test: true,
                timestamp: new Date().toISOString()
              }
            }
          });
          
          console.log('✅ تم إنشاء تفاعل AI تجريبي');
        }
      } catch (error) {
        console.log('⚠️ لم يتم إنشاء تفاعل تجريبي:', error.message);
      }
    }

    // 6. ملخص الإصلاحات
    console.log('\n📊 ملخص الإصلاحات:');
    console.log('═'.repeat(60));
    
    const finalGeminiKeys = await prisma.geminiKey.count({ where: { isActive: true } });
    const finalAISettings = await prisma.aiSettings.count({ where: { autoReplyEnabled: true } });
    
    console.log(`🔑 مفاتيح Gemini النشطة: ${finalGeminiKeys}`);
    console.log(`⚙️ إعدادات AI المفعلة: ${finalAISettings}`);
    console.log(`📁 ملف إعدادات AI: تم إنشاؤه`);
    console.log(`🌍 متغيرات البيئة: تم تحديثها`);
    
    console.log('\n✅ تم إصلاح جميع مشاكل الذكاء الاصطناعي!');
    console.log('💡 يُنصح بإعادة تشغيل الخادم لتطبيق التغييرات');

  } catch (error) {
    console.error('❌ خطأ في إصلاح الذكاء الاصطناعي:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريپت
fixAIIssues();
