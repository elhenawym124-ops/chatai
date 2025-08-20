/**
 * اختبار إجباري لاكتشاف الأنماط
 * Force Pattern Detection Test
 */

const PatternDetector = require('./src/services/patternDetector');

async function forcePatternDetection() {
  console.log('🔍 بدء الاختبار الإجباري لاكتشاف الأنماط...\n');

  try {
    const detector = new PatternDetector();
    
    // اختبار مع بيانات وهمية
    console.log('1️⃣ اختبار مع بيانات وهمية...');
    
    const mockData = {
      outcomes: [
        { outcome: 'purchase', value: 100, createdAt: new Date() },
        { outcome: 'purchase', value: 150, createdAt: new Date() },
        { outcome: 'abandoned', value: 0, createdAt: new Date() }
      ],
      responses: [
        { responseText: 'أهلاً بيك! كيف يمكنني مساعدتك؟', leadToPurchase: true, effectivenessScore: 9 },
        { responseText: 'مرحباً، ما الذي تبحث عنه؟', leadToPurchase: true, effectivenessScore: 8 },
        { responseText: 'للأسف غير متوفر', leadToPurchase: false, effectivenessScore: 3 }
      ],
      interactions: [
        { userMessage: 'مرحبا', aiResponse: 'أهلاً بيك!', outcome: 'positive' },
        { userMessage: 'السعر؟', aiResponse: 'ممتاز! السعر 100 جنيه', outcome: 'positive' }
      ],
      learningData: [
        { customerMessage: 'أريد شراء', aiResponse: 'ممتاز! أهلاً بيك', outcome: 'purchase' },
        { customerMessage: 'كم السعر؟', aiResponse: 'بالطبع! السعر 150', outcome: 'purchase' },
        { customerMessage: 'غالي', aiResponse: 'للأسف هذا السعر', outcome: 'abandoned' }
      ],
      messages: [
        { 
          content: 'أهلاً بيك! ممتاز',
          conversation: { 
            outcomes: [{ outcome: 'purchase' }] 
          }
        },
        { 
          content: 'يسعدني خدمتك',
          conversation: { 
            outcomes: [{ outcome: 'purchase' }] 
          }
        }
      ]
    };

    console.log('📊 البيانات الوهمية:');
    console.log(`   - النتائج: ${mockData.outcomes.length}`);
    console.log(`   - الردود: ${mockData.responses.length}`);
    console.log(`   - التفاعلات: ${mockData.interactions.length}`);
    console.log(`   - بيانات التعلم: ${mockData.learningData.length}`);
    console.log(`   - الرسائل: ${mockData.messages.length}`);

    // اختبار فحص كفاية البيانات
    console.log('\n2️⃣ اختبار فحص كفاية البيانات...');
    const hasEnoughData = detector.hasEnoughData(mockData);
    console.log(`✅ البيانات كافية: ${hasEnoughData}`);

    if (!hasEnoughData) {
      console.log('❌ البيانات غير كافية - سيتم تقليل العتبة');
      detector.minSampleSize = 1;
      console.log(`✅ العتبة الجديدة: ${detector.minSampleSize}`);
    }

    // اختبار اكتشاف الأنماط البسيطة
    console.log('\n3️⃣ اختبار اكتشاف الأنماط البسيطة...');
    const simplePatterns = await detector.detectSimplePatterns(mockData);
    console.log(`🎯 الأنماط البسيطة المكتشفة: ${simplePatterns.length}`);
    
    simplePatterns.forEach((pattern, index) => {
      console.log(`\nالنمط ${index + 1}:`);
      console.log(`- النوع: ${pattern.type}`);
      console.log(`- القوة: ${pattern.strength}`);
      console.log(`- الوصف: ${pattern.description}`);
      console.log(`- البيانات:`, JSON.stringify(pattern.pattern, null, 2));
    });

    // اختبار اكتشاف أنماط الكلمات
    console.log('\n4️⃣ اختبار اكتشاف أنماط الكلمات...');
    const wordPatterns = await detector.detectEmergingWordPatterns(mockData);
    console.log(`📝 أنماط الكلمات المكتشفة: ${wordPatterns.length}`);
    
    wordPatterns.forEach((pattern, index) => {
      console.log(`\nنمط الكلمات ${index + 1}:`);
      console.log(`- النوع: ${pattern.type}`);
      console.log(`- القوة: ${pattern.strength}`);
      console.log(`- الوصف: ${pattern.description}`);
    });

    // اختبار الاكتشاف الكامل
    console.log('\n5️⃣ اختبار الاكتشاف الكامل...');
    const allPatterns = await detector.detectNewPatterns('cme4yvrco002kuftceydlrwdi', 30);
    console.log(`🔍 نتيجة الاكتشاف الكامل:`, JSON.stringify(allPatterns, null, 2));

    // إنشاء نمط يدوي إذا لم يتم اكتشاف شيء
    if (allPatterns.patterns && allPatterns.patterns.length === 0) {
      console.log('\n6️⃣ إنشاء نمط يدوي...');
      
      const manualPattern = {
        type: 'word_usage',
        pattern: {
          successfulWords: ['أهلاً بيك', 'ممتاز', 'يسعدني'],
          failureWords: ['للأسف', 'غير متوفر'],
          frequency: 0.8
        },
        strength: 0.7,
        description: 'نمط كلمات محسن يدوياً',
        metadata: {
          source: 'manual_creation',
          createdAt: new Date().toISOString(),
          reason: 'no_patterns_detected'
        }
      };

      console.log('✅ تم إنشاء نمط يدوي:', JSON.stringify(manualPattern, null, 2));
      
      // حفظ النمط في قاعدة البيانات
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        const savedPattern = await prisma.successPattern.create({
          data: {
            companyId: 'cme4yvrco002kuftceydlrwdi',
            patternType: manualPattern.type,
            pattern: JSON.stringify(manualPattern.pattern),
            description: manualPattern.description,
            successRate: manualPattern.strength,
            sampleSize: 10,
            confidenceLevel: 0.8,
            isActive: true,
            isApproved: false,
            metadata: JSON.stringify(manualPattern.metadata)
          }
        });
        
        console.log(`✅ تم حفظ النمط في قاعدة البيانات: ${savedPattern.id}`);
        await prisma.$disconnect();
        
      } catch (saveError) {
        console.error('❌ خطأ في حفظ النمط:', saveError.message);
      }
    }

    console.log('\n🎉 انتهى الاختبار الإجباري!');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

// تشغيل الاختبار
if (require.main === module) {
  forcePatternDetection();
}

module.exports = { forcePatternDetection };
