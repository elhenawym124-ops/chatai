/**
 * اختبار نظام اكتشاف الأنماط المُصلح بالذكاء الصناعي
 * Test Fixed AI Pattern Detection System
 */

const PatternDetector = require('./src/services/patternDetector');

async function testFixedAIDetection() {
  console.log('🤖 اختبار نظام اكتشاف الأنماط المُصلح بالذكاء الصناعي\n');

  try {
    const detector = new PatternDetector();
    
    // بيانات تجريبية واقعية للاختبار
    const realData = {
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
          aiResponse: 'أهلاً بيك! يسعدني مساعدتك، ممتاز اختيارك للمنتج',
          outcome: 'purchase',
          createdAt: new Date()
        },
        {
          customerMessage: 'كم السعر؟',
          aiResponse: 'بالطبع! السعر ممتاز جداً، يسعدني أقولك إنه 100 جنيه فقط',
          outcome: 'purchase',
          createdAt: new Date()
        },
        {
          customerMessage: 'عايز أشتري دلوقتي',
          aiResponse: 'أهلاً وسهلاً! ممتاز، تمام كده، هنخلص الطلب فوراً',
          outcome: 'purchase',
          createdAt: new Date()
        },
        {
          customerMessage: 'مش عارف أقرر',
          aiResponse: 'للأسف مش فاهم قصدك، مش واضح إيه اللي محتاجه',
          outcome: 'abandoned',
          createdAt: new Date()
        },
        {
          customerMessage: 'غالي أوي',
          aiResponse: 'للأسف ده السعر، مش قادر أقلله، مش موجود خصم',
          outcome: 'abandoned',
          createdAt: new Date()
        },
        {
          customerMessage: 'عايز حاجة رخيصة',
          aiResponse: 'مفيش حاجة أرخص، خلاص كده، مش هقدر أساعدك',
          outcome: 'abandoned',
          createdAt: new Date()
        }
      ],
      messages: [
        {
          content: 'أهلاً بيك! ممتاز اختيارك، يسعدني خدمتك',
          conversation: {
            outcomes: [{ outcome: 'purchase' }]
          }
        },
        {
          content: 'بالطبع! تمام كده، هنخلص الطلب',
          conversation: {
            outcomes: [{ outcome: 'purchase' }]
          }
        },
        {
          content: 'للأسف مش موجود، خلاص كده',
          conversation: {
            outcomes: [{ outcome: 'abandoned' }]
          }
        }
      ]
    };

    console.log('📊 البيانات التجريبية الواقعية:');
    console.log(`   - النتائج: ${realData.outcomes.length}`);
    console.log(`   - بيانات التعلم: ${realData.learningData.length}`);
    console.log(`   - الرسائل: ${realData.messages.length}`);

    // اختبار تحضير البيانات للذكاء الصناعي
    console.log('\n1️⃣ اختبار تحضير البيانات للذكاء الصناعي...');
    const analysisData = detector.prepareDataForAI(realData);
    
    console.log('📋 نتائج التحضير:');
    console.log(`   - النصوص الناجحة: ${analysisData.successfulTexts.length}`);
    console.log(`   - النصوص الفاشلة: ${analysisData.unsuccessfulTexts.length}`);
    console.log(`   - البيانات كافية: ${analysisData.hasEnoughData}`);
    console.log(`   - إجمالي العينات: ${analysisData.totalSamples}`);

    if (analysisData.hasEnoughData) {
      console.log('\n📝 عينة من النصوص الناجحة:');
      analysisData.successfulTexts.forEach((text, i) => {
        console.log(`   ${i+1}. "${text}"`);
      });

      console.log('\n📝 عينة من النصوص الفاشلة:');
      analysisData.unsuccessfulTexts.forEach((text, i) => {
        console.log(`   ${i+1}. "${text}"`);
      });
    }

    // اختبار إنشاء prompt للذكاء الصناعي
    console.log('\n2️⃣ اختبار إنشاء prompt للذكاء الصناعي...');
    const prompt = detector.createAnalysisPrompt(analysisData);
    
    console.log('📝 Prompt تم إنشاؤه بنجاح');
    console.log(`📏 طول الـ prompt: ${prompt.length} حرف`);
    console.log('📋 معاينة الـ prompt:');
    console.log('=' .repeat(50));
    console.log(prompt.substring(0, 500) + '...');
    console.log('=' .repeat(50));

    // اختبار الاكتشاف الكامل بالذكاء الصناعي
    console.log('\n3️⃣ اختبار الاكتشاف الكامل بالذكاء الصناعي...');
    
    try {
      console.log('🚀 بدء عملية الاكتشاف...');
      const aiPatterns = await detector.detectPatternsWithAI(realData);
      
      console.log(`🎯 تم اكتشاف ${aiPatterns.length} نمط بالذكاء الصناعي`);
      
      aiPatterns.forEach((pattern, index) => {
        console.log(`\n🔍 النمط ${index + 1}:`);
        console.log(`   📝 النوع: ${pattern.type}`);
        console.log(`   💪 القوة: ${pattern.strength}`);
        console.log(`   📋 الوصف: ${pattern.description}`);
        if (pattern.pattern.successfulWords) {
          console.log(`   ✅ الكلمات الناجحة: ${pattern.pattern.successfulWords.slice(0, 3).join(', ')}`);
        }
        if (pattern.pattern.failureWords) {
          console.log(`   ❌ الكلمات الفاشلة: ${pattern.pattern.failureWords.slice(0, 3).join(', ')}`);
        }
        console.log(`   🔬 المصدر: ${pattern.metadata?.source || 'unknown'}`);
        if (pattern.metadata?.reasoning) {
          console.log(`   🧠 التفسير: ${pattern.metadata.reasoning}`);
        }
      });

      // حفظ الأنماط المكتشفة
      console.log('\n4️⃣ محاكاة حفظ الأنماط المكتشفة...');
      
      aiPatterns.forEach((pattern, index) => {
        console.log(`💾 حفظ النمط ${index + 1}: ${pattern.description}`);
        console.log(`   معدل النجاح: ${(pattern.strength * 100).toFixed(0)}%`);
        console.log(`   الحالة: جاهز للتطبيق`);
      });

      console.log('\n✅ نجح الاختبار! النظام يكتشف أنماط جديدة بالذكاء الصناعي');

    } catch (aiError) {
      console.log('\n❌ فشل الاختبار مع الذكاء الصناعي:');
      console.log(`   الخطأ: ${aiError.message}`);
      console.log(`   النوع: ${aiError.constructor.name}`);
      
      if (aiError.message.includes('Insufficient data')) {
        console.log('   💡 الحل: إضافة المزيد من البيانات للتحليل');
      } else if (aiError.message.includes('AI analysis')) {
        console.log('   💡 الحل: فحص اتصال الذكاء الصناعي');
      } else {
        console.log('   💡 الحل: فحص إعدادات النظام');
      }
    }

    // اختبار النظام الكامل مع API
    console.log('\n5️⃣ اختبار النظام الكامل مع API...');
    try {
      const fullResult = await detector.detectNewPatterns('cme4yvrco002kuftceydlrwdi', 30);
      
      console.log('📊 نتيجة النظام الكامل:');
      console.log(`   - النجاح: ${fullResult.success}`);
      console.log(`   - عدد الأنماط: ${fullResult.patterns?.length || 0}`);
      console.log(`   - الرسالة: ${fullResult.message || 'لا توجد رسالة'}`);
      
      if (fullResult.patterns && fullResult.patterns.length > 0) {
        console.log('\n🎯 الأنماط المكتشفة من النظام الكامل:');
        fullResult.patterns.forEach((pattern, index) => {
          console.log(`   ${index + 1}. ${pattern.description} (قوة: ${pattern.strength})`);
        });
      }
    } catch (fullError) {
      console.log(`❌ خطأ في النظام الكامل: ${fullError.message}`);
    }

    console.log('\n🎉 انتهى اختبار النظام المُصلح!');
    console.log('🤖 النظام الآن يعتمد على الذكاء الصناعي فقط');
    console.log('❌ تم إلغاء جميع البدائل والأنظمة الأخرى');

  } catch (error) {
    console.error('❌ خطأ عام في الاختبار:', error);
  }
}

// تشغيل الاختبار
if (require.main === module) {
  testFixedAIDetection();
}

module.exports = { testFixedAIDetection };
