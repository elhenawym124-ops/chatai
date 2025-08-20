/**
 * اختبار حفظ الأنماط في قاعدة البيانات
 * Test Pattern Saving to Database
 */

const PatternDetector = require('./src/services/patternDetector');

async function testPatternSaving() {
  console.log('💾 اختبار حفظ الأنماط في قاعدة البيانات\n');

  try {
    const detector = new PatternDetector();
    
    // بيانات تجريبية مع نصوص كافية
    const testData = {
      outcomes: [
        { outcome: 'purchase', details: 'تم الشراء بنجاح' },
        { outcome: 'purchase', details: 'عميل راضي جداً' },
        { outcome: 'purchase', details: 'تجربة ممتازة' },
        { outcome: 'abandoned', details: 'لم يكمل الشراء' },
        { outcome: 'abandoned', details: 'غادر المحادثة' }
      ],
      responses: [
        { responseText: 'أهلاً بيك! يسعدني مساعدتك', effectiveness: 0.8 },
        { responseText: 'ممتاز اختيارك، بالطبع أقدر أساعدك', effectiveness: 0.9 },
        { responseText: 'تمام كده، هنخلص الطلب فوراً', effectiveness: 0.85 },
        { responseText: 'للأسف مش فاهم قصدك', effectiveness: 0.2 },
        { responseText: 'مش موجود حالياً', effectiveness: 0.1 }
      ],
      interactions: [],
      learningData: [],
      messages: [
        { content: 'مرحباً، كيف يمكنني مساعدتك؟' },
        { content: 'أهلاً وسهلاً بك في متجرنا' },
        { content: 'يسعدني خدمتك اليوم' },
        { content: 'ممتاز اختيارك للمنتج' },
        { content: 'بالطبع، هقدر أساعدك' },
        { content: 'تمام كده، هنخلص الطلب' },
        { content: 'للأسف مش متوفر' },
        { content: 'مش قادر أساعدك' },
        { content: 'خلاص كده، مفيش حاجة تانية' },
        { content: 'مش فاهم إيه المطلوب' }
      ]
    };

    console.log('1️⃣ اختبار تحضير البيانات...');
    const analysisData = detector.prepareDataForAI(testData);
    
    console.log(`📊 النتائج:`);
    console.log(`   - النصوص الناجحة: ${analysisData.successfulTexts.length}`);
    console.log(`   - النصوص الفاشلة: ${analysisData.unsuccessfulTexts.length}`);
    console.log(`   - البيانات كافية: ${analysisData.hasEnoughData}`);

    if (!analysisData.hasEnoughData) {
      console.log('❌ البيانات غير كافية للاختبار');
      return;
    }

    console.log('\n2️⃣ اختبار اكتشاف الأنماط بالذكاء الصناعي...');
    
    try {
      const patterns = await detector.detectPatternsWithAI(testData);
      
      console.log(`🎯 تم اكتشاف ${patterns.length} نمط`);
      
      patterns.forEach((pattern, index) => {
        console.log(`\n📋 النمط ${index + 1}:`);
        console.log(`   🏷️ المعرف: ${pattern.id || 'غير محفوظ'}`);
        console.log(`   📝 النوع: ${pattern.type}`);
        console.log(`   💪 القوة: ${pattern.strength}`);
        console.log(`   📄 الوصف: ${pattern.description.substring(0, 100)}...`);
        console.log(`   ✅ محفوظ: ${pattern.id ? 'نعم' : 'لا'}`);
        console.log(`   🔍 يحتاج موافقة: ${pattern.isApproved ? 'لا' : 'نعم'}`);
      });

      console.log('\n3️⃣ فحص الأنماط في قاعدة البيانات...');
      
      const savedPatterns = await detector.prisma.successPattern.findMany({
        where: { companyId: 'cme4yvrco002kuftceydlrwdi' },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      console.log(`📊 الأنماط في قاعدة البيانات:`);
      console.log(`   - إجمالي الأنماط: ${savedPatterns.length}`);
      
      const recentPatterns = savedPatterns.filter(p => {
        const createdAt = new Date(p.createdAt);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return createdAt > fiveMinutesAgo;
      });

      console.log(`   - الأنماط الحديثة (آخر 5 دقائق): ${recentPatterns.length}`);

      if (recentPatterns.length > 0) {
        console.log('\n🎉 الأنماط الحديثة المحفوظة:');
        recentPatterns.forEach((pattern, index) => {
          console.log(`   ${index + 1}. ${pattern.description.substring(0, 80)}...`);
          console.log(`      📅 تاريخ الإنشاء: ${pattern.createdAt}`);
          console.log(`      ✅ نشط: ${pattern.isActive ? 'نعم' : 'لا'}`);
          console.log(`      🔍 معتمد: ${pattern.isApproved ? 'نعم' : 'لا'}`);
        });
      }

      console.log('\n4️⃣ اختبار API اكتشاف الأنماط...');
      
      const apiResult = await detector.detectNewPatterns('cme4yvrco002kuftceydlrwdi', 7);
      
      console.log(`📊 نتيجة API:`);
      console.log(`   - النجاح: ${apiResult.success}`);
      console.log(`   - عدد الأنماط: ${apiResult.patterns?.length || 0}`);
      console.log(`   - إجمالي المكتشفة: ${apiResult.metadata?.totalDetected || 0}`);
      console.log(`   - المهمة: ${apiResult.metadata?.significantCount || 0}`);
      console.log(`   - المحفوظة: ${apiResult.metadata?.savedCount || 0}`);

      if (apiResult.patterns && apiResult.patterns.length > 0) {
        console.log('\n🎯 الأنماط من API:');
        apiResult.patterns.forEach((pattern, index) => {
          console.log(`   ${index + 1}. ${pattern.description.substring(0, 60)}... (قوة: ${pattern.strength})`);
        });
      }

      console.log('\n✅ انتهى اختبار حفظ الأنماط بنجاح!');

    } catch (aiError) {
      console.error('❌ خطأ في اكتشاف الأنماط:', aiError.message);
    }

  } catch (error) {
    console.error('❌ خطأ عام في الاختبار:', error);
  }
}

// تشغيل الاختبار
if (require.main === module) {
  testPatternSaving();
}

module.exports = { testPatternSaving };
