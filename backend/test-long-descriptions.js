const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testLongDescriptions() {
  console.log('📝 اختبار الأوصاف الطويلة بعد إصلاح قاعدة البيانات...\n');
  
  const companyId = 'cme4yvrco002kuftceydlrwdi';
  
  // إنشاء أنماط تجريبية بأوصاف طويلة
  const testPatterns = [
    {
      patternType: 'call_to_action',
      description: 'تفاصيل النمط: call_to_action - يتضمن هذا النمط استخدام عبارات دعوة للعمل قوية ومؤثرة تحفز العملاء على اتخاذ إجراءات فورية. يشمل النمط استخدام كلمات مثل "اطلب الآن"، "احجز فوراً"، "لا تفوت الفرصة"، "عرض محدود"، "سارع بالحجز" وغيرها من العبارات التي تخلق شعوراً بالإلحاح والحاجة للتصرف السريع. هذا النمط فعال بشكل خاص في زيادة معدلات التحويل وتحسين نتائج المبيعات عبر إنشاء دافع نفسي قوي للشراء.',
      successRate: 0.95,
      sampleSize: 25,
      confidenceLevel: 0.90,
      pattern: JSON.stringify({
        actionWords: ['اطلب الآن', 'احجز فوراً', 'لا تفوت', 'عرض محدود'],
        urgencyPhrases: ['سارع', 'فرصة محدودة', 'لوقت محدود'],
        conversionTriggers: ['خصم خاص', 'عرض حصري', 'توفر محدود']
      }),
      metadata: JSON.stringify({
        source: 'manual_test',
        testPurpose: 'long_description_support',
        createdBy: 'system_test',
        version: '1.0'
      })
    },
    {
      patternType: 'emotional_tone',
      description: 'نمط النبرة العاطفية المتقدم: يركز هذا النمط على استخدام لغة عاطفية مؤثرة تتصل مع مشاعر العملاء على مستوى عميق. يتضمن النمط استخدام كلمات وعبارات تثير المشاعر الإيجابية مثل "سعادة"، "راحة البال"، "الأمان"، "الثقة"، "الفخر"، "الإنجاز". كما يشمل تقنيات التعاطف والفهم مثل "نتفهم احتياجاتك"، "نقدر ظروفك"، "نهتم براحتك". هذا النمط مصمم لبناء علاقة عاطفية قوية مع العملاء مما يزيد من ولائهم ورضاهم عن الخدمة المقدمة ويحسن من تجربتهم الشاملة.',
      successRate: 0.88,
      sampleSize: 30,
      confidenceLevel: 0.85,
      pattern: JSON.stringify({
        emotionalWords: ['سعادة', 'راحة', 'أمان', 'ثقة', 'فخر'],
        empathyPhrases: ['نتفهم', 'نقدر', 'نهتم'],
        connectionTriggers: ['معاً', 'نحن هنا لك', 'في خدمتك']
      }),
      metadata: JSON.stringify({
        source: 'manual_test',
        testPurpose: 'long_description_support',
        emotionalImpact: 'high',
        version: '1.0'
      })
    }
  ];
  
  try {
    console.log('📊 إنشاء أنماط تجريبية بأوصاف طويلة...');
    
    const createdPatterns = [];
    
    for (const [index, patternData] of testPatterns.entries()) {
      console.log(`\n${index + 1}. إنشاء نمط: ${patternData.patternType}`);
      console.log(`   طول الوصف: ${patternData.description.length} حرف`);
      
      const pattern = await prisma.successPattern.create({
        data: {
          companyId,
          ...patternData,
          isActive: true,
          isApproved: true,
          approvedBy: 'system_test',
          approvedAt: new Date()
        }
      });
      
      createdPatterns.push(pattern);
      console.log(`   ✅ تم الإنشاء بنجاح - ID: ${pattern.id}`);
    }
    
    // فحص الأنماط المحفوظة
    console.log('\n📋 فحص الأنماط المحفوظة:');
    console.log('=' .repeat(80));
    
    for (const pattern of createdPatterns) {
      const savedPattern = await prisma.successPattern.findUnique({
        where: { id: pattern.id },
        select: {
          id: true,
          patternType: true,
          description: true,
          successRate: true
        }
      });
      
      console.log(`\n🎯 النمط: ${savedPattern.patternType}`);
      console.log(`   معدل النجاح: ${(savedPattern.successRate * 100).toFixed(1)}%`);
      console.log(`   طول الوصف المحفوظ: ${savedPattern.description.length} حرف`);
      console.log(`   الوصف الكامل: ${savedPattern.description}`);
      
      if (savedPattern.description.length > 191) {
        console.log('   🎉 نجح! الوصف أطول من 191 حرف');
      } else {
        console.log('   ⚠️ لا يزال مقطوع عند 191 حرف');
      }
    }
    
    // اختبار API
    console.log('\n🔗 اختبار API للتأكد من عرض الأوصاف الكاملة...');
    
    const axios = require('axios');
    try {
      const response = await axios.get(`http://localhost:3001/api/v1/success-learning/patterns?companyId=${companyId}&limit=5`);
      
      if (response.data.success) {
        const apiPatterns = response.data.data.patterns;
        console.log(`📊 تم جلب ${apiPatterns.length} أنماط من API`);
        
        const longDescriptionPatterns = apiPatterns.filter(p => p.description.length > 191);
        console.log(`🎯 أنماط بأوصاف طويلة: ${longDescriptionPatterns.length}`);
        
        if (longDescriptionPatterns.length > 0) {
          console.log('✅ API يعرض الأوصاف الكاملة!');
          longDescriptionPatterns.forEach((pattern, index) => {
            console.log(`   ${index + 1}. ${pattern.patternType}: ${pattern.description.length} حرف`);
          });
        } else {
          console.log('⚠️ API لا يزال يعرض أوصاف مقطوعة');
        }
      }
    } catch (apiError) {
      console.log('❌ خطأ في اختبار API:', apiError.message);
    }
    
    console.log('\n🎉 اكتمل اختبار الأوصاف الطويلة!');
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testLongDescriptions();
