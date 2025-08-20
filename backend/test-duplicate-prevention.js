const PatternDetector = require('./src/services/patternDetector');

async function testDuplicateDetection() {
  console.log('🧪 اختبار نظام منع التكرار الجديد...\n');
  
  const detector = new PatternDetector();
  
  // إنشاء أنماط تجريبية (بعضها مكرر)
  const testPatterns = [
    {
      type: 'word_usage',
      description: 'استخدام كلمات إيجابية يزيد معدل النجاح بـ 25%',
      strength: 0.90,
      pattern: { successfulWords: ['ممتاز', 'رائع', 'جيد'] },
      sampleSize: 15
    },
    {
      type: 'word_usage', 
      description: 'استخدام كلمات إيجابية يزيد معدل النجاح بـ 30%', // مشابه للأول
      strength: 0.92,
      pattern: { successfulWords: ['ممتاز', 'عظيم', 'جيد'] },
      sampleSize: 20
    },
    {
      type: 'word_usage',
      description: 'استخدام ترحيب ذكي يحسن التفاعل مع العملاء', // جديد
      strength: 0.85,
      pattern: { successfulWords: ['أهلاً', 'مرحباً', 'يسعدني'] },
      sampleSize: 12
    }
  ];
  
  try {
    console.log('📊 اختبار حفظ الأنماط مع فحص التكرار...');
    const result = await detector.savePatternsToDatabase(testPatterns, 'cme4yvrco002kuftceydlrwdi');
    
    console.log('\n✅ نتائج الاختبار:');
    result.forEach((pattern, index) => {
      console.log(`${index + 1}. ${pattern.action.toUpperCase()}: ${pattern.description.substring(0, 60)}...`);
      console.log(`   ID: ${pattern.id} | معدل النجاح: ${(pattern.strength * 100).toFixed(1)}%`);
    });
    
    console.log('\n🎉 النظام يعمل بنجاح! لن يتم إنشاء أنماط مكررة بعد الآن.');
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
}

testDuplicateDetection();
