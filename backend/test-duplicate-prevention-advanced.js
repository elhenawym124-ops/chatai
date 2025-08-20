const PatternDetector = require('./src/services/patternDetector');

async function testDuplicatePrevention() {
  console.log('🧪 اختبار منع التكرار في الحفظ...\n');
  
  const detector = new PatternDetector();
  const companyId = 'cme4yvrco002kuftceydlrwdi';
  
  // إنشاء أنماط تجريبية مكررة
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
      description: 'استخدام كلمات إيجابية يزيد معدل النجاح بـ 30%', // مشابه 85%+
      strength: 0.92,
      pattern: { successfulWords: ['ممتاز', 'عظيم', 'جيد'] },
      sampleSize: 20
    },
    {
      type: 'word_usage',
      description: 'استخدام ترحيب ذكي يحسن التفاعل مع العملاء', // مختلف
      strength: 0.85,
      pattern: { successfulWords: ['أهلاً', 'مرحباً', 'يسعدني'] },
      sampleSize: 12
    },
    {
      type: 'word_usage',
      description: 'استخدام كلمات إيجابية يزيد معدل النجاح', // مشابه جداً
      strength: 0.88,
      pattern: { successfulWords: ['ممتاز', 'رائع'] },
      sampleSize: 18
    }
  ];
  
  try {
    console.log('📊 محاولة حفظ 4 أنماط (2 مكررة + 2 فريدة)...');
    const result = await detector.savePatternsToDatabase(testPatterns, companyId);
    
    console.log('\n✅ نتائج الاختبار:');
    console.log(`📊 أنماط تم معالجتها: ${testPatterns.length}`);
    console.log(`🆕 أنماط جديدة: ${result.filter(p => p.action === 'created').length}`);
    console.log(`🔄 أنماط محدثة: ${result.filter(p => p.action === 'updated').length}`);
    
    result.forEach((pattern, index) => {
      const action = pattern.action === 'created' ? '🆕 جديد' : '🔄 محدث';
      console.log(`${index + 1}. ${action}: ${pattern.description.substring(0, 50)}...`);
    });
    
    if (result.filter(p => p.action === 'updated').length > 0) {
      console.log('\n🎉 نجح! النظام منع التكرار وحدث الأنماط المشابهة');
    } else {
      console.log('\n⚠️ لم يتم اكتشاف تكرار - قد تحتاج مراجعة المعايير');
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
}

testDuplicatePrevention();
