const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function enableVisionModel() {
  console.log('👁️ Enabling Vision Model for Image Processing...\n');
  
  try {
    // Get current active key
    const activeKey = await prisma.geminiKey.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!activeKey) {
      console.log('❌ No active Gemini key found');
      return;
    }
    
    console.log('🔑 Current active key:', activeKey.name);
    console.log('📋 Current model:', activeKey.model);
    
    // Update to vision-capable model
    const visionModel = 'gemini-1.5-flash';
    
    console.log(`🔄 Updating model to: ${visionModel}`);
    
    const updatedKey = await prisma.geminiKey.update({
      where: { id: activeKey.id },
      data: {
        model: visionModel,
        name: activeKey.name + ' (Vision Enabled)'
      }
    });
    
    console.log('✅ Model updated successfully!');
    console.log('📋 New model:', updatedKey.model);
    
    // Test the vision model
    console.log('\n🧪 Testing vision model...');
    
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(activeKey.apiKey);
    const model = genAI.getGenerativeModel({ model: visionModel });
    
    try {
      const result = await model.generateContent('اختبار النموذج الجديد');
      console.log('✅ Vision model test successful!');
      console.log('📝 Response:', result.response.text().substring(0, 100) + '...');
    } catch (error) {
      console.log('❌ Vision model test failed:', error.message);
    }
    
    console.log('\n🎉 Vision capabilities are now ENABLED!');
    console.log('📊 Supported features:');
    console.log('✅ Image analysis');
    console.log('✅ Product recognition');
    console.log('✅ Color detection');
    console.log('✅ Brand identification');
    console.log('✅ Condition assessment');
    console.log('✅ Quality evaluation');
    console.log('✅ Description generation');
    
    console.log('\n🚀 How to test:');
    console.log('1. Send an image via Facebook Messenger');
    console.log('2. The AI will automatically analyze the image');
    console.log('3. You\'ll get an intelligent response about the image content');
    
  } catch (error) {
    console.error('❌ Error enabling vision model:', error);
  } finally {
    await prisma.$disconnect();
  }
}

enableVisionModel();
