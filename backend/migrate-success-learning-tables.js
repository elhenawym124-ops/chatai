/**
 * Migration Script for Success Learning System
 * 
 * ينشئ الجداول الجديدة لنظام تعلم أنماط النجاح
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function migrateSuccessLearningTables() {
  console.log('🚀 بدء migration لنظام تعلم أنماط النجاح...\n');

  try {
    // قراءة ملف SQL
    const sqlPath = path.join(__dirname, 'prisma', 'migrations', 'add_success_learning_tables.sql');
    
    if (!fs.existsSync(sqlPath)) {
      console.error('❌ ملف SQL غير موجود:', sqlPath);
      return;
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // تقسيم الأوامر
    const sqlCommands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📝 تنفيذ ${sqlCommands.length} أمر SQL...\n`);

    // تنفيذ كل أمر
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      
      try {
        console.log(`⚡ تنفيذ الأمر ${i + 1}/${sqlCommands.length}...`);
        
        await prisma.$executeRawUnsafe(command);
        
        console.log(`✅ نجح الأمر ${i + 1}`);
        
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️ الجدول موجود مسبقاً - تم التخطي`);
        } else {
          console.error(`❌ فشل الأمر ${i + 1}:`, error.message);
          throw error;
        }
      }
    }

    console.log('\n🎉 تم إنشاء جميع الجداول بنجاح!');

    // التحقق من الجداول
    await verifyTables();

    // إنشاء بيانات تجريبية اختيارية
    const createSampleData = process.argv.includes('--sample-data');
    if (createSampleData) {
      await createSampleData();
    }

  } catch (error) {
    console.error('❌ خطأ في Migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * التحقق من وجود الجداول
 */
async function verifyTables() {
  console.log('\n🔍 التحقق من الجداول...');

  const tables = [
    { name: 'success_patterns', model: 'successPattern' },
    { name: 'conversation_outcomes', model: 'conversationOutcome' },
    { name: 'response_effectiveness', model: 'responseEffectiveness' }
  ];

  for (const table of tables) {
    try {
      const count = await prisma[table.model].count();
      console.log(`✅ ${table.name}: موجود (${count} سجل)`);
    } catch (error) {
      console.error(`❌ ${table.name}: غير موجود أو خطأ -`, error.message);
    }
  }
}

/**
 * إنشاء بيانات تجريبية
 */
async function createSampleData() {
  console.log('\n📝 إنشاء بيانات تجريبية...');

  try {
    // الحصول على معرف الشركة الافتراضي
    const company = await prisma.company.findFirst();
    if (!company) {
      console.log('⚠️ لا توجد شركات في قاعدة البيانات');
      return;
    }

    const companyId = company.id;
    console.log(`🏢 استخدام الشركة: ${company.name} (${companyId})`);

    // إنشاء أنماط نجاح تجريبية
    const successPatterns = [
      {
        companyId,
        patternType: 'word_usage',
        pattern: JSON.stringify({
          significantWords: ['ممتاز', 'رائع', 'مناسب', 'جودة'],
          successWords: [
            { word: 'ممتاز', count: 15, frequency: 0.3 },
            { word: 'رائع', count: 12, frequency: 0.24 },
            { word: 'مناسب', count: 10, frequency: 0.2 }
          ]
        }),
        description: 'الكلمات الإيجابية تزيد معدل النجاح',
        successRate: 0.85,
        sampleSize: 50,
        confidenceLevel: 0.9,
        isActive: true,
        isApproved: true,
        approvedBy: 'system',
        approvedAt: new Date()
      },
      {
        companyId,
        patternType: 'timing',
        pattern: JSON.stringify({
          optimalResponseTime: 12,
          avgSuccessTime: 12,
          avgFailTime: 25,
          timeDifference: 13
        }),
        description: 'الرد السريع خلال 12 دقيقة يزيد النجاح',
        successRate: 0.78,
        sampleSize: 35,
        confidenceLevel: 0.8,
        isActive: true,
        isApproved: false
      },
      {
        companyId,
        patternType: 'response_style',
        pattern: JSON.stringify({
          optimalWordCount: 25,
          avgSuccessWords: 25,
          avgFailWords: 45,
          stylePreference: 'concise'
        }),
        description: 'الردود المختصرة (25 كلمة) أكثر فعالية',
        successRate: 0.72,
        sampleSize: 40,
        confidenceLevel: 0.75,
        isActive: true,
        isApproved: false
      }
    ];

    for (const pattern of successPatterns) {
      const created = await prisma.successPattern.create({ data: pattern });
      console.log(`✅ تم إنشاء نمط: ${created.description}`);
    }

    // إنشاء نتائج محادثات تجريبية
    const conversationOutcomes = [];
    for (let i = 0; i < 20; i++) {
      const outcome = {
        companyId,
        conversationId: `sample_conv_${Date.now()}_${i}`,
        customerId: `sample_customer_${Date.now()}_${i}`,
        outcome: i < 12 ? 'purchase' : (i < 16 ? 'abandoned' : 'resolved'),
        outcomeValue: i < 12 ? 300 + (i * 25) : null,
        responseQuality: i < 12 ? 7 + (i * 0.2) : 4 + (i * 0.1),
        customerSatisfaction: i < 12 ? 4 + (i * 0.05) : 2.5 + (i * 0.1),
        conversionTime: 8 + (i * 2),
        messageCount: 4 + i,
        aiResponseCount: 2 + Math.floor(i / 3),
        humanHandoff: i > 17,
        metadata: JSON.stringify({
          sampleData: true,
          createdAt: new Date()
        })
      };

      const created = await prisma.conversationOutcome.create({ data: outcome });
      conversationOutcomes.push(created);
    }

    console.log(`✅ تم إنشاء ${conversationOutcomes.length} نتيجة محادثة`);

    // إنشاء فعالية ردود تجريبية
    const responseTexts = [
      'أهلاً وسهلاً! كيف يمكنني مساعدتك؟',
      'الكوتشي متوفر بسعر ممتاز 349 جنيه',
      'جودة رائعة ومضمونة 100%',
      'الشحن مجاني والتوصيل سريع',
      'مقاسك متوفر بالتأكيد',
      'ألوان جميلة ومناسبة لكل الأذواق',
      'ضمان سنة كاملة على المنتج',
      'يمكنك الدفع عند الاستلام',
      'عرض خاص لفترة محدودة',
      'شكراً لثقتك فينا'
    ];

    for (let i = 0; i < 30; i++) {
      const response = {
        companyId,
        conversationId: conversationOutcomes[i % conversationOutcomes.length].conversationId,
        responseText: responseTexts[i % responseTexts.length],
        responseType: ['greeting', 'price_quote', 'product_info', 'shipping_info', 'closing'][i % 5],
        effectivenessScore: i < 18 ? 7 + (i * 0.15) : 3 + (i * 0.1),
        leadToPurchase: i < 18,
        responseTime: 800 + (i * 100),
        wordCount: 8 + (i % 15),
        sentimentScore: i < 18 ? 0.4 + (i * 0.03) : -0.1 + (i * 0.02),
        keywords: ['أهلاً', 'سعر', 'جودة', 'شحن', 'مقاس'][i % 5],
        metadata: JSON.stringify({
          sampleData: true,
          createdAt: new Date()
        })
      };

      await prisma.responseEffectiveness.create({ data: response });
    }

    console.log('✅ تم إنشاء 30 رد فعالية');

    console.log('\n🎉 تم إنشاء جميع البيانات التجريبية بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في إنشاء البيانات التجريبية:', error);
  }
}

/**
 * عرض معلومات الاستخدام
 */
function showUsage() {
  console.log(`
الاستخدام:
  node migrate-success-learning-tables.js [options]

الخيارات:
  --sample-data    إنشاء بيانات تجريبية بعد Migration
  --help          عرض هذه الرسالة

أمثلة:
  node migrate-success-learning-tables.js
  node migrate-success-learning-tables.js --sample-data
`);
}

// تشغيل إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  if (process.argv.includes('--help')) {
    showUsage();
    process.exit(0);
  }

  migrateSuccessLearningTables()
    .then(() => {
      console.log('\n✅ Migration مكتمل بنجاح!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration فشل:', error);
      process.exit(1);
    });
}

module.exports = { migrateSuccessLearningTables, createSampleData };
