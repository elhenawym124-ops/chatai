const aiAgent = require('./src/services/aiAgentService');

async function testImageFixDirect() {
  console.log('🧪 Testing Image Fix Directly...\n');
  
  try {
    // اختبار مباشر للدالة الجديدة
    console.log('📸 Testing getSmartResponse with image request...');
    
    const testMessage = 'عايزه اشوف الصور';
    const intent = 'product_inquiry';
    const conversationMemory = [];
    const customerId = 'test_customer_123';

    console.log(`📝 Message: "${testMessage}"`);
    console.log(`🎯 Intent: ${intent}`);
    
    const smartResponse = await aiAgent.getSmartResponse(
      testMessage,
      intent,
      conversationMemory,
      customerId
    );

    console.log('\n📋 Smart Response Results:');
    console.log(`📸 Images count: ${smartResponse.images?.length || 0}`);
    console.log(`📊 RAG data items: ${smartResponse.ragData?.length || 0}`);
    console.log(`🎯 Has specific product: ${smartResponse.hasSpecificProduct}`);
    console.log(`ℹ️ Product info: ${smartResponse.productInfo ? 'Available' : 'None'}`);

    if (smartResponse.images && smartResponse.images.length > 0) {
      console.log('\n📸 Images found:');
      smartResponse.images.forEach((img, idx) => {
        console.log(`   ${idx + 1}. ${img.payload?.title || 'No title'}`);
        console.log(`      URL: ${img.payload?.url || 'No URL'}`);
        console.log(`      Valid: ${img.payload?.url?.startsWith('http') ? '✅' : '❌'}`);
      });
    } else {
      console.log('\n⚠️ No images returned');
    }

    if (smartResponse.ragData && smartResponse.ragData.length > 0) {
      console.log('\n📊 RAG Data:');
      smartResponse.ragData.forEach((item, idx) => {
        console.log(`   ${idx + 1}. Type: ${item.type}`);
        console.log(`      Content: ${item.content?.substring(0, 50)}...`);
        if (item.metadata) {
          console.log(`      Metadata: ${Object.keys(item.metadata).join(', ')}`);
        }
      });
    }

    // اختبار إضافي: تجربة رسالة أخرى
    console.log('\n' + '='.repeat(60));
    console.log('📸 Testing with different message...');
    
    const testMessage2 = 'ممكن أشوف صور الكوتشي؟';
    console.log(`📝 Message: "${testMessage2}"`);
    
    const smartResponse2 = await aiAgent.getSmartResponse(
      testMessage2,
      intent,
      conversationMemory,
      customerId
    );

    console.log('\n📋 Second Test Results:');
    console.log(`📸 Images count: ${smartResponse2.images?.length || 0}`);
    console.log(`📊 RAG data items: ${smartResponse2.ragData?.length || 0}`);

    if (smartResponse2.images && smartResponse2.images.length > 0) {
      console.log('\n📸 Images found:');
      smartResponse2.images.forEach((img, idx) => {
        console.log(`   ${idx + 1}. ${img.payload?.title || 'No title'}`);
      });
    }

    // اختبار كشف طلب الصور
    console.log('\n' + '='.repeat(60));
    console.log('🔍 Testing image request detection...');
    
    const testMessages = [
      'عايزه اشوف الصور',
      'ممكن صورة للكوتشي',
      'وريني المنتجات',
      'كيف شكل الكوتشي؟',
      'ايه السعر؟' // should not detect images
    ];

    for (const msg of testMessages) {
      const wantsImages = await aiAgent.isCustomerRequestingImages(msg, []);
      console.log(`📝 "${msg}" -> ${wantsImages ? '✅ YES' : '❌ NO'}`);
    }

    console.log('\n🎉 Direct test completed!');

  } catch (error) {
    console.error('❌ Direct test failed:', error);
  }
}

testImageFixDirect();
