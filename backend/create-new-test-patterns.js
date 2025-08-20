/**
 * إنشاء أنماط جديدة للاختبار
 * Create New Test Patterns
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createNewTestPatterns() {
  console.log('🆕 إنشاء أنماط جديدة للاختبار...\n');

  try {
    const companyId = 'cme4yvrco002kuftceydlrwdi';
    const now = new Date();

    // أنماط جديدة للاختبار
    const newPatterns = [
      {
        patternType: 'word_usage',
        pattern: JSON.stringify({
          successfulWords: ['حبيبي', 'عزيزي', 'يا قمر', 'حبيب قلبي'],
          failureWords: ['سيدي', 'حضرتك', 'أستاذ'],
          frequency: 0.88
        }),
        description: 'استخدام كلمات حميمة يزيد الألفة والثقة بنسبة 60%',
        successRate: 0.88,
        sampleSize: 35,
        confidenceLevel: 0.88,
        isActive: true,
        isApproved: false, // يحتاج موافقة
        metadata: JSON.stringify({
          source: 'ai_detection',
          aiGenerated: true,
          name: 'نمط الألفة الشخصية',
          aiInsights: 'الكلمات الحميمة تكسر الحواجز وتبني علاقة أقوى مع العميل',
          aiRecommendations: [
            'استخدم كلمات حميمة مناسبة للثقافة',
            'تجنب الرسمية المفرطة',
            'اجعل التواصل شخصي وودود'
          ],
          createdAt: now.toISOString(),
          version: '2.0',
          autoDetected: true
        })
      },
      {
        patternType: 'word_usage',
        pattern: JSON.stringify({
          successfulWords: ['خصم خاص', 'عرض محدود', 'فرصة ذهبية', 'لفترة قصيرة'],
          failureWords: ['السعر العادي', 'بدون خصم', 'نفس السعر'],
          frequency: 0.82
        }),
        description: 'كلمات العجلة والحصرية تزيد قرار الشراء الفوري بـ 55%',
        successRate: 0.82,
        sampleSize: 28,
        confidenceLevel: 0.82,
        isActive: true,
        isApproved: false,
        metadata: JSON.stringify({
          source: 'ai_detection',
          aiGenerated: true,
          name: 'نمط العجلة والحصرية',
          aiInsights: 'خلق إحساس بالعجلة يحفز العميل على اتخاذ قرار سريع',
          aiRecommendations: [
            'استخدم كلمات تدل على الحصرية',
            'اخلق إحساس بالعجلة',
            'أظهر قيمة العرض المحدود'
          ],
          createdAt: now.toISOString(),
          version: '2.0',
          autoDetected: true
        })
      },
      {
        patternType: 'word_usage',
        pattern: JSON.stringify({
          successfulWords: ['هتوفر كتير', 'استثمار ذكي', 'قيمة ممتازة', 'يستاهل كل قرش'],
          failureWords: ['غالي شوية', 'فوق الميزانية', 'مكلف'],
          frequency: 0.79
        }),
        description: 'التركيز على القيمة بدلاً من السعر يزيد الإقناع بـ 50%',
        successRate: 0.79,
        sampleSize: 32,
        confidenceLevel: 0.79,
        isActive: true,
        isApproved: false,
        metadata: JSON.stringify({
          source: 'ai_detection',
          aiGenerated: true,
          name: 'نمط القيمة مقابل السعر',
          aiInsights: 'تحويل التركيز من التكلفة إلى القيمة يغير نظرة العميل',
          aiRecommendations: [
            'ركز على الفوائد والقيمة',
            'تجنب ذكر السعر مباشرة',
            'أظهر التوفير والاستثمار'
          ],
          createdAt: now.toISOString(),
          version: '2.0',
          autoDetected: true
        })
      },
      {
        patternType: 'word_usage',
        pattern: JSON.stringify({
          successfulWords: ['جرب مجاناً', 'بدون التزام', 'ضمان استرداد', 'مخاطرة صفر'],
          failureWords: ['لازم تدفع', 'مفيش ضمان', 'مخاطرة عالية'],
          frequency: 0.85
        }),
        description: 'تقليل المخاطر المدركة يزيد الثقة والإقدام بـ 65%',
        successRate: 0.85,
        sampleSize: 22,
        confidenceLevel: 0.85,
        isActive: true,
        isApproved: false,
        metadata: JSON.stringify({
          source: 'ai_detection',
          aiGenerated: true,
          name: 'نمط تقليل المخاطر',
          aiInsights: 'إزالة الخوف من المخاطرة يجعل القرار أسهل للعميل',
          aiRecommendations: [
            'قدم ضمانات واضحة',
            'اذكر إمكانية التجربة المجانية',
            'أكد على عدم وجود التزامات'
          ],
          createdAt: now.toISOString(),
          version: '2.0',
          autoDetected: true
        })
      },
      {
        patternType: 'word_usage',
        pattern: JSON.stringify({
          successfulWords: ['عملاء راضيين', 'تقييمات ممتازة', 'ناس كتير جربوا', 'نجح مع آلاف'],
          failureWords: ['منتج جديد', 'لسه مجربناهوش', 'مفيش تقييمات'],
          frequency: 0.77
        }),
        description: 'الدليل الاجتماعي يزيد الثقة والمصداقية بـ 45%',
        successRate: 0.77,
        sampleSize: 26,
        confidenceLevel: 0.77,
        isActive: true,
        isApproved: false,
        metadata: JSON.stringify({
          source: 'ai_detection',
          aiGenerated: true,
          name: 'نمط الدليل الاجتماعي',
          aiInsights: 'رؤية نجاح الآخرين يشجع العميل على اتخاذ نفس القرار',
          aiRecommendations: [
            'اذكر قصص نجاح العملاء',
            'استخدم أرقام وإحصائيات',
            'أظهر التقييمات الإيجابية'
          ],
          createdAt: now.toISOString(),
          version: '2.0',
          autoDetected: true
        })
      }
    ];

    console.log(`📝 سيتم إنشاء ${newPatterns.length} نمط جديد...\n`);

    // إنشاء الأنماط
    for (const [index, patternData] of newPatterns.entries()) {
      try {
        const savedPattern = await prisma.successPattern.create({
          data: {
            companyId,
            ...patternData
          }
        });

        console.log(`✅ تم إنشاء النمط ${index + 1}:`);
        console.log(`   📝 المعرف: ${savedPattern.id}`);
        console.log(`   📄 الوصف: ${patternData.description}`);
        console.log(`   💪 معدل النجاح: ${(patternData.successRate * 100).toFixed(0)}%`);
        console.log(`   🔍 يحتاج موافقة: ${!patternData.isApproved ? 'نعم' : 'لا'}`);
        console.log('');

      } catch (error) {
        console.error(`❌ خطأ في إنشاء النمط ${index + 1}:`, error.message);
      }
    }

    // فحص إجمالي الأنماط
    const totalPatterns = await prisma.successPattern.count({
      where: { companyId }
    });

    const newPatternsCount = await prisma.successPattern.count({
      where: {
        companyId,
        createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) } // آخر 5 دقائق
      }
    });

    console.log('📊 النتيجة النهائية:');
    console.log(`   - إجمالي الأنماط: ${totalPatterns}`);
    console.log(`   - الأنماط الجديدة (آخر 5 دقائق): ${newPatternsCount}`);
    console.log(`   - تحتاج موافقة: ${newPatterns.length}`);

    console.log('\n🎉 تم إنشاء الأنماط الجديدة بنجاح!');
    console.log('✅ يمكنك الآن رؤيتها في صفحة إدارة الأنماط');
    console.log('🔍 الأنماط الجديدة تحتاج موافقة من المدير');

  } catch (error) {
    console.error('❌ خطأ عام في إنشاء الأنماط:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الإنشاء
if (require.main === module) {
  createNewTestPatterns();
}

module.exports = { createNewTestPatterns };
