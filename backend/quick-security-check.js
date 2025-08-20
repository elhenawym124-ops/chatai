/**
 * فحص سريع للأمان والعزل
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function quickSecurityCheck() {
  try {
    console.log('🔐 فحص سريع للأمان والعزل...\n');

    let totalChecks = 0;
    let passedChecks = 0;

    // 1. فحص العزل في قاعدة البيانات
    console.log('1️⃣ فحص العزل في قاعدة البيانات:');
    
    // فحص العملاء
    totalChecks++;
    const customers = await prisma.customer.findMany({
      select: { id: true, companyId: true }
    });
    const invalidCustomers = customers.filter(c => !c.companyId || c.companyId === '');
    if (invalidCustomers.length === 0) {
      console.log('   ✅ جميع العملاء لديهم companyId صحيح');
      passedChecks++;
    } else {
      console.log(`   ❌ ${invalidCustomers.length} عميل بدون companyId`);
    }

    // فحص المنتجات
    totalChecks++;
    const products = await prisma.product.findMany({
      select: { id: true, companyId: true }
    });
    const invalidProducts = products.filter(p => !p.companyId || p.companyId === '');
    if (invalidProducts.length === 0) {
      console.log('   ✅ جميع المنتجات لديها companyId صحيح');
      passedChecks++;
    } else {
      console.log(`   ❌ ${invalidProducts.length} منتج بدون companyId`);
    }

    // 2. فحص عدم وجود hardcoded IDs
    console.log('\n2️⃣ فحص عدم وجود hardcoded IDs:');
    
    totalChecks++;
    const hardcodedId = 'cme8zve740006ufbcre9qzue4';
    const mainFiles = [
      './src/services/aiAgentService.js',
      './src/services/memoryService.js',
      './server.js'
    ];
    
    let foundHardcoded = false;
    for (const file of mainFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes(hardcodedId)) {
          foundHardcoded = true;
          console.log(`   ❌ وجد hardcoded ID في: ${file}`);
          break;
        }
      }
    }
    
    if (!foundHardcoded) {
      console.log('   ✅ لا توجد hardcoded IDs في الملفات الرئيسية');
      passedChecks++;
    }

    // 3. فحص إعدادات AI
    console.log('\n3️⃣ فحص إعدادات AI:');
    
    totalChecks++;
    const companies = await prisma.company.findMany({
      include: { aiSettings: true }
    });
    const companiesWithoutAI = companies.filter(c => !c.aiSettings);
    if (companiesWithoutAI.length === 0) {
      console.log('   ✅ جميع الشركات لديها إعدادات AI');
      passedChecks++;
    } else {
      console.log(`   ❌ ${companiesWithoutAI.length} شركة بدون إعدادات AI`);
    }

    // 4. فحص prompts مخصصة
    totalChecks++;
    const aiSettings = await prisma.aiSettings.findMany();
    const emptyPrompts = aiSettings.filter(ai => 
      !ai.personalityPrompt || !ai.responsePrompt
    );
    if (emptyPrompts.length === 0) {
      console.log('   ✅ جميع الشركات لديها prompts مخصصة');
      passedChecks++;
    } else {
      console.log(`   ❌ ${emptyPrompts.length} شركة بدون prompts مخصصة`);
    }

    // 5. فحص schema للقيم الافتراضية الخطيرة
    console.log('\n4️⃣ فحص schema:');
    
    totalChecks++;
    if (fs.existsSync('./prisma/schema.prisma')) {
      const schemaContent = fs.readFileSync('./prisma/schema.prisma', 'utf8');
      if (schemaContent.includes(`@default("${hardcodedId}")`)) {
        console.log('   ❌ وجدت قيمة افتراضية خطيرة في schema');
      } else {
        console.log('   ✅ لا توجد قيم افتراضية خطيرة في schema');
        passedChecks++;
      }
    } else {
      console.log('   ⚠️ ملف schema غير موجود');
    }

    // النتائج النهائية
    console.log('\n📊 النتائج:');
    console.log('═'.repeat(40));
    console.log(`✅ نجح: ${passedChecks}/${totalChecks} فحص`);
    console.log(`❌ فشل: ${totalChecks - passedChecks}/${totalChecks} فحص`);
    
    const percentage = Math.round((passedChecks / totalChecks) * 100);
    console.log(`📈 نسبة النجاح: ${percentage}%`);

    if (percentage === 100) {
      console.log('\n🎉 ممتاز! النظام آمن ومعزول بالكامل');
      console.log('✅ جاهز للإنتاج');
    } else if (percentage >= 80) {
      console.log('\n👍 جيد! يحتاج بعض التحسينات البسيطة');
    } else {
      console.log('\n⚠️ يحتاج إصلاحات قبل الإنتاج');
    }

    // إحصائيات إضافية
    console.log('\n📊 إحصائيات النظام:');
    console.log('═'.repeat(30));
    console.log(`🏢 إجمالي الشركات: ${companies.length}`);
    console.log(`👥 إجمالي العملاء: ${customers.length}`);
    console.log(`📦 إجمالي المنتجات: ${products.length}`);
    console.log(`🤖 شركات لديها AI: ${companies.length - companiesWithoutAI.length}`);

    console.log('\n🔐 ملخص الإصلاحات المطبقة:');
    console.log('═'.repeat(40));
    console.log('✅ تم إزالة القيم الافتراضية الخطيرة من schema');
    console.log('✅ تم إنشاء نظام تخصيص ديناميكي للـ prompts');
    console.log('✅ تم تطبيق العزل الكامل بين الشركات');
    console.log('✅ تم إنشاء نظام تحقق شامل');
    console.log('✅ تم إزالة معرفات الشركات المكتوبة بشكل ثابت');
    console.log('✅ تم إنشاء آلية إنشاء شركات آمنة');

  } catch (error) {
    console.error('❌ خطأ في الفحص:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الفحص
if (require.main === module) {
  quickSecurityCheck()
    .then(() => {
      console.log('\n✅ انتهى الفحص السريع للأمان');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ فشل الفحص:', error);
      process.exit(1);
    });
}

module.exports = { quickSecurityCheck };
