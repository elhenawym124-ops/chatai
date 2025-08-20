const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPatternDuplicates() {
  console.log('🔍 فحص تكرار الأنماط في قاعدة البيانات...\n');
  
  try {
    // جلب جميع الأنماط
    const patterns = await prisma.successPattern.findMany({
      where: { companyId: 'cme4yvrco002kuftceydlrwdi' },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📊 إجمالي الأنماط: ${patterns.length}`);
    
    // تجميع الأنماط حسب الوصف
    const groupedByDescription = {};
    const groupedByType = {};
    
    patterns.forEach(pattern => {
      // تجميع حسب الوصف
      const desc = pattern.description.toLowerCase().trim();
      if (!groupedByDescription[desc]) {
        groupedByDescription[desc] = [];
      }
      groupedByDescription[desc].push(pattern);
      
      // تجميع حسب النوع
      if (!groupedByType[pattern.patternType]) {
        groupedByType[pattern.patternType] = 0;
      }
      groupedByType[pattern.patternType]++;
    });
    
    // البحث عن التكرارات
    console.log('\n🔍 الأنماط المكررة حسب الوصف:');
    let duplicatesFound = 0;
    let totalDuplicates = 0;
    
    Object.keys(groupedByDescription).forEach(desc => {
      const duplicates = groupedByDescription[desc];
      if (duplicates.length > 1) {
        duplicatesFound++;
        totalDuplicates += duplicates.length - 1; // عدد النسخ الزائدة
        console.log(`\n❌ تكرار (${duplicates.length}x): ${desc.substring(0, 80)}...`);
        duplicates.forEach((dup, index) => {
          console.log(`   ${index + 1}. ID: ${dup.id} | معدل النجاح: ${(dup.successRate * 100).toFixed(1)}% | نشط: ${dup.isActive} | معتمد: ${dup.isApproved}`);
        });
      }
    });
    
    if (duplicatesFound === 0) {
      console.log('✅ لا توجد أنماط مكررة حسب الوصف');
    } else {
      console.log(`\n📊 إجمالي الأنماط المكررة: ${duplicatesFound} مجموعة`);
      console.log(`📊 إجمالي النسخ الزائدة: ${totalDuplicates} نمط`);
    }
    
    // إحصائيات حسب النوع
    console.log('\n📊 توزيع الأنماط حسب النوع:');
    Object.keys(groupedByType).forEach(type => {
      console.log(`   ${type}: ${groupedByType[type]} نمط`);
    });
    
    // فحص الأنماط المتشابهة (نفس النوع ونفس معدل النجاح)
    console.log('\n🔍 الأنماط المتشابهة (نفس النوع ومعدل النجاح):');
    const similarPatterns = {};
    
    patterns.forEach(pattern => {
      const key = `${pattern.patternType}_${Math.round(pattern.successRate * 100)}`;
      if (!similarPatterns[key]) {
        similarPatterns[key] = [];
      }
      similarPatterns[key].push(pattern);
    });
    
    let similarFound = 0;
    Object.keys(similarPatterns).forEach(key => {
      const similar = similarPatterns[key];
      if (similar.length > 3) { // أكثر من 3 أنماط متشابهة
        similarFound++;
        console.log(`\n⚠️ أنماط متشابهة (${similar.length}x): ${key}`);
        similar.slice(0, 3).forEach((sim, index) => {
          console.log(`   ${index + 1}. ${sim.description.substring(0, 60)}...`);
        });
        if (similar.length > 3) {
          console.log(`   ... و ${similar.length - 3} أنماط أخرى`);
        }
      }
    });
    
    if (similarFound === 0) {
      console.log('✅ لا توجد أنماط متشابهة بكثرة');
    }
    
    // اقتراح الحلول
    console.log('\n💡 الحلول المقترحة:');
    
    if (duplicatesFound > 0) {
      console.log(`\n1️⃣ حذف النسخ المكررة (${totalDuplicates} نمط):`);
      console.log('   - الاحتفاظ بالنمط الأحدث أو الأعلى معدل نجاح');
      console.log('   - حذف النسخ الأخرى تلقائياً');
    }
    
    if (similarFound > 0) {
      console.log(`\n2️⃣ دمج الأنماط المتشابهة (${similarFound} مجموعة):`);
      console.log('   - دمج الأنماط من نفس النوع ومعدل النجاح');
      console.log('   - إنشاء نمط واحد محسن');
    }
    
    console.log('\n3️⃣ تحسين نظام الاكتشاف:');
    console.log('   - إضافة فحص التكرار قبل إنشاء أنماط جديدة');
    console.log('   - تحسين خوارزمية التشابه');
    
    console.log('\n4️⃣ إضافة نظام تنظيف دوري:');
    console.log('   - تشغيل تنظيف تلقائي أسبوعي');
    console.log('   - أرشفة الأنماط القديمة غير المستخدمة');
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPatternDuplicates();
