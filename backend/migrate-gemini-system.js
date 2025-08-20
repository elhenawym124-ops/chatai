const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateGeminiSystem() {
  console.log('🚀 بدء ترقية نظام مفاتيح Gemini...\n');
  
  try {
    // المرحلة الأولى: تحليل البيانات الحالية
    console.log('📊 المرحلة الأولى: تحليل البيانات الحالية...');
    
    const currentKeys = await prisma.geminiKey.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`✅ تم العثور على ${currentKeys.length} مفتاح حالي`);
    
    // تحليل المفاتيح
    const analysis = {
      validKeys: [],
      duplicateKeys: [],
      fakeKeys: [],
      uniqueApiKeys: new Set()
    };
    
    currentKeys.forEach((key, index) => {
      console.log(`\n${index + 1}. تحليل: ${key.name}`);
      console.log(`   النموذج: ${key.model}`);
      console.log(`   المفتاح: ${key.apiKey.substring(0, 20)}...`);
      
      // فحص المفاتيح الوهمية
      if (key.apiKey.includes('YOUR_API_KEY') || key.apiKey.length < 30) {
        console.log(`   ❌ مفتاح وهمي - سيتم حذفه`);
        analysis.fakeKeys.push(key);
        return;
      }
      
      // فحص المفاتيح المكررة
      if (analysis.uniqueApiKeys.has(key.apiKey)) {
        console.log(`   ⚠️ مفتاح مكرر - سيتم دمجه`);
        analysis.duplicateKeys.push(key);
        return;
      }
      
      console.log(`   ✅ مفتاح صالح`);
      analysis.validKeys.push(key);
      analysis.uniqueApiKeys.add(key.apiKey);
    });
    
    console.log(`\n📊 نتائج التحليل:`);
    console.log(`   ✅ مفاتيح صالحة: ${analysis.validKeys.length}`);
    console.log(`   ⚠️ مفاتيح مكررة: ${analysis.duplicateKeys.length}`);
    console.log(`   ❌ مفاتيح وهمية: ${analysis.fakeKeys.length}`);
    
    // المرحلة الثانية: إنشاء الهيكل الجديد
    console.log('\n🏗️ المرحلة الثانية: إنشاء الهيكل الجديد...');
    
    // إنشاء جدول النماذج الجديد
    console.log('📋 إنشاء جدول gemini_key_models...');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \`gemini_key_models\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`keyId\` VARCHAR(191) NOT NULL,
        \`model\` VARCHAR(191) NOT NULL,
        \`usage\` JSON NOT NULL DEFAULT ('{"used": 0, "limit": 1000000, "resetDate": null}'),
        \`isEnabled\` BOOLEAN NOT NULL DEFAULT true,
        \`priority\` INT NOT NULL DEFAULT 1,
        \`lastUsed\` DATETIME(3),
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`unique_key_model\` (\`keyId\`, \`model\`),
        INDEX \`idx_enabled_priority\` (\`isEnabled\`, \`priority\`),
        INDEX \`idx_key_model\` (\`keyId\`, \`model\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `;
    
    console.log('✅ تم إنشاء جدول gemini_key_models');
    
    // إضافة حقول جديدة لجدول المفاتيح الحالي
    console.log('🔧 تحديث جدول gemini_keys...');
    
    try {
      await prisma.$executeRaw`ALTER TABLE \`gemini_keys\` ADD COLUMN \`priority\` INT NOT NULL DEFAULT 1`;
      console.log('✅ تم إضافة حقل priority');
    } catch (error) {
      if (!error.message.includes('Duplicate column')) {
        console.log('⚠️ خطأ في إضافة حقل priority:', error.message);
      }
    }
    
    try {
      await prisma.$executeRaw`ALTER TABLE \`gemini_keys\` ADD COLUMN \`description\` TEXT`;
      console.log('✅ تم إضافة حقل description');
    } catch (error) {
      if (!error.message.includes('Duplicate column')) {
        console.log('⚠️ خطأ في إضافة حقل description:', error.message);
      }
    }
    
    // المرحلة الثالثة: ترحيل البيانات
    console.log('\n📦 المرحلة الثالثة: ترحيل البيانات...');
    
    // النماذج المتاحة مع حصصها
    const availableModels = [
      { model: 'gemini-2.5-flash', limit: 1000000, priority: 1, description: 'الأحدث والأفضل - مستقر' },
      { model: 'gemini-2.5-pro', limit: 500000, priority: 2, description: 'الأقوى للمهام المعقدة - مستقر' },
      { model: 'gemini-2.0-flash', limit: 750000, priority: 3, description: 'سريع ومستقر' },
      { model: 'gemini-2.0-flash-exp', limit: 1000, priority: 4, description: 'تجريبي - احتياطي' },
      { model: 'gemini-1.5-flash', limit: 1500, priority: 5, description: 'مُهمل لكن يعمل' },
      { model: 'gemini-1.5-pro', limit: 50, priority: 6, description: 'مُهمل لكن قوي' }
    ];
    
    // حذف المفاتيح الوهمية
    console.log('🗑️ حذف المفاتيح الوهمية...');
    for (const fakeKey of analysis.fakeKeys) {
      await prisma.geminiKey.delete({ where: { id: fakeKey.id } });
      console.log(`   ❌ تم حذف: ${fakeKey.name}`);
    }
    
    // معالجة المفاتيح الصالحة
    console.log('✅ معالجة المفاتيح الصالحة...');
    
    let keyPriority = 1;
    for (const validKey of analysis.validKeys) {
      console.log(`\n🔧 معالجة مفتاح: ${validKey.name}`);
      
      // تحديث المفتاح الرئيسي (استخدام SQL مباشر لتجنب مشاكل Prisma)
      await prisma.$executeRaw`
        UPDATE \`gemini_keys\`
        SET
          \`priority\` = ${keyPriority},
          \`description\` = ${`مفتاح رقم ${keyPriority} - يدعم جميع النماذج`},
          \`isActive\` = ${keyPriority === 1},
          \`updatedAt\` = NOW()
        WHERE \`id\` = ${validKey.id}
      `;
      
      console.log(`   ✅ تم تحديث المفتاح الرئيسي (أولوية: ${keyPriority})`);
      
      // إنشاء النماذج لهذا المفتاح
      console.log(`   📋 إنشاء النماذج...`);
      
      for (const modelInfo of availableModels) {
        // الحصول على الاستخدام الحالي إذا كان هذا النموذج موجود
        let currentUsage = { used: 0, limit: modelInfo.limit, resetDate: null };
        
        // إذا كان هذا النموذج الحالي للمفتاح، احتفظ بالاستخدام
        if (validKey.model === modelInfo.model && validKey.usage) {
          try {
            const existingUsage = JSON.parse(validKey.usage);
            currentUsage.used = existingUsage.used || 0;
          } catch (error) {
            console.log(`     ⚠️ خطأ في قراءة الاستخدام الحالي`);
          }
        }
        
        try {
          await prisma.$executeRaw`
            INSERT INTO \`gemini_key_models\` 
            (\`id\`, \`keyId\`, \`model\`, \`usage\`, \`isEnabled\`, \`priority\`, \`createdAt\`, \`updatedAt\`)
            VALUES 
            (${generateId()}, ${validKey.id}, ${modelInfo.model}, ${JSON.stringify(currentUsage)}, true, ${modelInfo.priority}, NOW(), NOW())
            ON DUPLICATE KEY UPDATE
            \`usage\` = ${JSON.stringify(currentUsage)},
            \`priority\` = ${modelInfo.priority}
          `;
          
          console.log(`     ✅ ${modelInfo.model} (حصة: ${currentUsage.used}/${modelInfo.limit})`);
        } catch (error) {
          console.log(`     ❌ خطأ في إنشاء ${modelInfo.model}:`, error.message);
        }
      }
      
      keyPriority++;
    }
    
    // حذف المفاتيح المكررة
    console.log('\n🔄 حذف المفاتيح المكررة...');
    for (const duplicateKey of analysis.duplicateKeys) {
      await prisma.geminiKey.delete({ where: { id: duplicateKey.id } });
      console.log(`   ❌ تم حذف المكرر: ${duplicateKey.name}`);
    }
    
    console.log('\n🎉 تم الانتهاء من ترقية النظام بنجاح!');
    
    // عرض النتائج النهائية
    await showFinalResults();
    
  } catch (error) {
    console.error('❌ خطأ في ترقية النظام:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// دالة مساعدة لتوليد ID
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// دالة عرض النتائج النهائية
async function showFinalResults() {
  console.log('\n📊 النتائج النهائية:');
  
  const keys = await prisma.geminiKey.findMany({
    orderBy: { priority: 'asc' }
  });
  
  console.log(`✅ إجمالي المفاتيح النشطة: ${keys.length}`);
  
  for (const key of keys) {
    console.log(`\n🔑 ${key.name} (أولوية: ${key.priority})`);
    console.log(`   المفتاح: ${key.apiKey.substring(0, 20)}...`);
    console.log(`   الحالة: ${key.isActive ? '🟢 نشط' : '⚪ غير نشط'}`);
    
    // عرض النماذج
    const models = await prisma.$queryRaw`
      SELECT * FROM \`gemini_key_models\` 
      WHERE \`keyId\` = ${key.id} 
      ORDER BY \`priority\` ASC
    `;
    
    console.log(`   النماذج المتاحة: ${models.length}`);
    models.forEach((model, index) => {
      const usage = JSON.parse(model.usage);
      console.log(`     ${index + 1}. ${model.model} - ${usage.used}/${usage.limit} (${model.isEnabled ? 'مُفعل' : 'معطل'})`);
    });
  }
  
  const totalModels = await prisma.$queryRaw`SELECT COUNT(*) as count FROM \`gemini_key_models\``;
  console.log(`\n🎯 إجمالي النماذج المتاحة: ${totalModels[0].count}`);
  console.log('🚀 النظام جاهز للعمل بكامل طاقته!');
}

// تشغيل الترقية
migrateGeminiSystem();
