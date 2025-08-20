/**
 * اختبار نظام اكتشاف الأنماط بالذكاء الصناعي فقط
 * Test AI-Only Pattern Detection System
 */

const PatternDetector = require('./src/services/patternDetector');

async function testAIOnlyPatternDetection() {
  console.log('🤖 اختبار نظام اكتشاف الأنماط بالذكاء الصناعي فقط\n');

  try {
    const detector = new PatternDetector();
    
    // بيانات تجريبية للاختبار
    const mockData = {
      outcomes: [
        { outcome: 'purchase', value: 100, createdAt: new Date() },
        { outcome: 'purchase', value: 150, createdAt: new Date() },
        { outcome: 'purchase', value: 200, createdAt: new Date() },
        { outcome: 'abandoned', value: 0, createdAt: new Date() },
        { outcome: 'abandoned', value: 0, createdAt: new Date() }
      ],
      responses: [],
      interactions: [],
      learningData: [
        {
          customerMessage: 'أريد شراء منتج',
          aiResponse: 'أهلاً بيك! يسعدني مساعدتك، ممتاز اختيارك',
          outcome: 'purchase',
          createdAt: new Date()
        },
        {
          customerMessage: 'كم السعر؟',
          aiResponse: 'بالطبع! السعر ممتاز جداً، يسعدني أقولك إنه 100 جنيه',
          outcome: 'purchase',
          createdAt: new Date()
        },
        {
          customerMessage: 'عايز أشتري',
          aiResponse: 'أهلاً وسهلاً! ممتاز، تمام كده',
          outcome: 'purchase',
          createdAt: new Date()
        },
        {
          customerMessage: 'مش عارف',
          aiResponse: 'للأسف مش فاهم قصدك، مش واضح',
          outcome: 'abandoned',
          createdAt: new Date()
        },
        {
          customerMessage: 'غالي أوي',
          aiResponse: 'للأسف ده السعر، مش قادر أقلله',
          outcome: 'abandoned',
          createdAt: new Date()
        }
      ],
      messages: [
        {
          content: 'أهلاً بيك! ممتاز اختيارك',
          conversation: {
            outcomes: [{ outcome: 'purchase' }]
          }
        },
        {
          content: 'يسعدني خدمتك، تمام كده',
          conversation: {
            outcomes: [{ outcome: 'purchase' }]
          }
        },
        {
          content: 'للأسف مش موجود',
          conversation: {
            outcomes: [{ outcome: 'abandoned' }]
          }
        }
      ]
    };

    console.log('📊 البيانات التجريبية:');
    console.log(`   - النتائج: ${mockData.outcomes.length}`);
    console.log(`   - بيانات التعلم: ${mockData.learningData.length}`);
    console.log(`   - الرسائل: ${mockData.messages.length}`);

    // اختبار تحضير البيانات للذكاء الصناعي
    console.log('\n1️⃣ اختبار تحضير البيانات للذكاء الصناعي...');
    const analysisData = detector.prepareDataForAI(mockData);
    
    console.log('📋 نتائج التحضير:');
    console.log(`   - النصوص الناجحة: ${analysisData.successfulTexts.length}`);
    console.log(`   - النصوص الفاشلة: ${analysisData.unsuccessfulTexts.length}`);
    console.log(`   - البيانات كافية: ${analysisData.hasEnoughData}`);
    console.log(`   - إجمالي العينات: ${analysisData.totalSamples}`);

    if (analysisData.hasEnoughData) {
      console.log('\n📝 عينة من النصوص الناجحة:');
      analysisData.successfulTexts.slice(0, 3).forEach((text, i) => {
        console.log(`   ${i+1}. "${text}"`);
      });

      console.log('\n📝 عينة من النصوص الفاشلة:');
      analysisData.unsuccessfulTexts.slice(0, 3).forEach((text, i) => {
        console.log(`   ${i+1}. "${text}"`);
      });
    }

    // اختبار إنشاء prompt للذكاء الصناعي
    console.log('\n2️⃣ اختبار إنشاء prompt للذكاء الصناعي...');
    const prompt = detector.createAnalysisPrompt(analysisData);
    
    console.log('📝 Prompt تم إنشاؤه بنجاح');
    console.log(`📏 طول الـ prompt: ${prompt.length} حرف`);
    console.log('📋 معاينة الـ prompt:');
    console.log(prompt.substring(0, 300) + '...');

    // اختبار الاكتشاف الكامل بالذكاء الصناعي
    console.log('\n3️⃣ اختبار الاكتشاف الكامل بالذكاء الصناعي...');
    
    try {
      const aiPatterns = await detector.detectPatternsWithAI(mockData);
      
      console.log(`🎯 تم اكتشاف ${aiPatterns.length} نمط بالذكاء الصناعي`);
      
      aiPatterns.forEach((pattern, index) => {
        console.log(`\nالنمط ${index + 1}:`);
        console.log(`   - النوع: ${pattern.type}`);
        console.log(`   - القوة: ${pattern.strength}`);
        console.log(`   - الوصف: ${pattern.description}`);
        if (pattern.pattern.successfulWords) {
          console.log(`   - الكلمات الناجحة: ${pattern.pattern.successfulWords.slice(0, 3).join(', ')}`);
        }
        if (pattern.pattern.failureWords) {
          console.log(`   - الكلمات الفاشلة: ${pattern.pattern.failureWords.slice(0, 3).join(', ')}`);
        }
        console.log(`   - المصدر: ${pattern.metadata?.source || 'unknown'}`);
      });

    } catch (aiError) {
      console.log('⚠️ فشل الاختبار مع الذكاء الصناعي:', aiError.message);
      console.log('🔄 سيتم استخدام الأنماط الاحتياطية...');
    }

    // اختبار النظام الكامل
    console.log('\n4️⃣ اختبار النظام الكامل...');
    const fullResult = await detector.detectNewPatterns('cme4yvrco002kuftceydlrwdi', 30);
    
    console.log('📊 نتيجة النظام الكامل:');
    console.log(`   - النجاح: ${fullResult.success}`);
    console.log(`   - عدد الأنماط: ${fullResult.patterns?.length || 0}`);
    
    if (fullResult.patterns && fullResult.patterns.length > 0) {
      console.log('\n🎯 الأنماط المكتشفة:');
      fullResult.patterns.forEach((pattern, index) => {
        console.log(`   ${index + 1}. ${pattern.description} (قوة: ${pattern.strength})`);
      });
    }

    console.log('\n✅ انتهى اختبار نظام الذكاء الصناعي!');
    console.log('🤖 النظام الآن يعتمد على الذكاء الصناعي فقط');
    console.log('❌ تم إلغاء نظام الكلمات المفتاحية');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

// تشغيل الاختبار
if (require.main === module) {
  testAIOnlyPatternDetection();
}

module.exports = { testAIOnlyPatternDetection };
