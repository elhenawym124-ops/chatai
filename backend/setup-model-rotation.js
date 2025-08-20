const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupModelRotation() {
  console.log('🔄 Setting up Model Rotation System...\n');
  
  try {
    // الحصول على المفتاح الحالي
    const currentKey = await prisma.geminiKey.findFirst({
      where: { isActive: true }
    });
    
    if (!currentKey) {
      console.log('❌ No active key found');
      return;
    }
    
    console.log('📋 Current key:', currentKey.name);
    console.log('🔑 API Key:', currentKey.apiKey.substring(0, 20) + '...');
    
    // النماذج المتاحة مع حصصها (من الأعلى للأقل)
    const availableModels = [
      {
        name: 'gemini-2.0-flash-exp',
        displayName: 'Gemini 2.0 Flash (Experimental)',
        quota: 10000, // حصة تجريبية عالية
        description: 'أحدث نموذج تجريبي - حصة عالية'
      },
      {
        name: 'gemini-1.5-flash',
        displayName: 'Gemini 1.5 Flash',
        quota: 1500,
        description: 'سريع وفعال - حصة جيدة'
      },
      {
        name: 'gemini-pro',
        displayName: 'Gemini Pro (Legacy)',
        quota: 1000,
        description: 'نموذج قديم مستقر'
      },
      {
        name: 'gemini-1.5-pro',
        displayName: 'Gemini 1.5 Pro',
        quota: 50,
        description: 'الأقوى لكن حصة منخفضة'
      }
    ];
    
    console.log('\n📊 Available models (ordered by quota):');
    availableModels.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`);
      console.log(`   Display: ${model.displayName}`);
      console.log(`   Quota: ${model.quota} requests/day`);
      console.log(`   Description: ${model.description}`);
      console.log('');
    });
    
    // إنشاء مفاتيح متعددة بنماذج مختلفة
    console.log('🔧 Creating multiple model configurations...');
    
    // إلغاء تفعيل المفتاح الحالي
    await prisma.geminiKey.update({
      where: { id: currentKey.id },
      data: { isActive: false }
    });
    
    // إنشاء مفتاح لكل نموذج
    for (let i = 0; i < availableModels.length; i++) {
      const model = availableModels[i];
      
      try {
        const newKey = await prisma.geminiKey.create({
          data: {
            name: `${model.displayName} - Auto Rotation`,
            apiKey: currentKey.apiKey, // نفس المفتاح
            model: model.name,
            isActive: i === 0, // تفعيل النموذج الأول (أعلى حصة)
            usage: JSON.stringify({ used: 0, limit: model.quota })
          }
        });
        
        console.log(`✅ Created: ${model.displayName} ${i === 0 ? '(ACTIVE)' : ''}`);
        
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️ Key for ${model.displayName} already exists`);
        } else {
          console.log(`❌ Error creating ${model.displayName}:`, error.message);
        }
      }
    }
    
    // التحقق من النتيجة
    console.log('\n📋 Final configuration:');
    const allKeys = await prisma.geminiKey.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    allKeys.forEach((key, index) => {
      const usage = JSON.parse(key.usage || '{"used": 0, "limit": 50}');
      console.log(`${index + 1}. ${key.name}`);
      console.log(`   Model: ${key.model}`);
      console.log(`   Active: ${key.isActive}`);
      console.log(`   Usage: ${usage.used}/${usage.limit}`);
      console.log('');
    });
    
    console.log('🎉 Model rotation system setup complete!');
    console.log('');
    console.log('🔄 How it works:');
    console.log('1. System starts with highest quota model (gemini-2.0-flash-exp)');
    console.log('2. When quota exceeded, automatically switches to next model');
    console.log('3. Falls back through models until finding available quota');
    console.log('4. Provides better error messages to users');
    console.log('');
    console.log('🚀 Please restart the server to apply changes');
    
  } catch (error) {
    console.error('❌ Error setting up model rotation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupModelRotation();
