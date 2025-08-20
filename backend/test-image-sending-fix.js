const { PrismaClient } = require('@prisma/client');
const aiAgent = require('./src/services/aiAgentService');

const prisma = new PrismaClient();

async function testImageSendingFix() {
  console.log('🧪 Testing Image Sending Fix...\n');

  try {
    // AI Agent Service is already initialized as singleton
    
    // Test cases for image requests
    const testCases = [
      {
        name: 'Direct Image Request',
        message: 'ممكن صورة للكوتشي',
        expectImages: true
      },
      {
        name: 'Indirect Image Request',
        message: 'عايز أشوف شكل المنتج',
        expectImages: true
      },
      {
        name: 'Product Inquiry',
        message: 'كيف شكل الكوتشي الأبيض؟',
        expectImages: true
      },
      {
        name: 'General Question',
        message: 'ايه أسعار المنتجات؟',
        expectImages: false
      },
      {
        name: 'Show Me Request',
        message: 'وريني المنتجات المتاحة',
        expectImages: true
      }
    ];

    console.log('📋 Running test cases...\n');

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`🧪 Test ${i + 1}: ${testCase.name}`);
      console.log(`📝 Message: "${testCase.message}"`);
      console.log(`🎯 Expected images: ${testCase.expectImages ? 'YES' : 'NO'}`);

      try {
        // Test image request detection
        const wantsImages = await aiAgent.isCustomerRequestingImages(testCase.message, []);
        console.log(`🔍 Detected image request: ${wantsImages ? 'YES' : 'NO'}`);

        // Test smart response
        const smartResponse = await aiAgent.getSmartResponse(
          testCase.message,
          'product_inquiry',
          [],
          'test_customer_123'
        );

        console.log(`📸 Images returned: ${smartResponse.images.length}`);
        console.log(`📊 RAG data items: ${smartResponse.ragData.length}`);
        console.log(`🎯 Has specific product: ${smartResponse.hasSpecificProduct}`);

        if (smartResponse.images.length > 0) {
          console.log(`📋 Image details:`);
          smartResponse.images.forEach((img, idx) => {
            console.log(`   ${idx + 1}. ${img.payload.title}: ${img.payload.url.substring(0, 50)}...`);
          });
        }

        // Check if test passed
        const testPassed = testCase.expectImages ? 
          (wantsImages && smartResponse.images.length > 0) : 
          (!wantsImages || smartResponse.images.length === 0);

        console.log(`${testPassed ? '✅' : '❌'} Test ${testPassed ? 'PASSED' : 'FAILED'}`);

      } catch (error) {
        console.log(`❌ Test failed with error: ${error.message}`);
      }

      console.log('─'.repeat(60));
    }

    // Test full message processing
    console.log('\n🔄 Testing full message processing...\n');

    const messageData = {
      conversationId: 'test_conversation_123',
      senderId: 'test_user_123',
      content: 'ممكن أشوف صور الكوتشي الأبيض؟',
      attachments: [],
      customerData: {
        companyId: 'cmdkj6coz0000uf0cyscco6lr',
        id: 'test_customer_123',
        name: 'عميل تجريبي'
      }
    };

    console.log(`📤 Processing message: "${messageData.content}"`);
    
    const result = await aiAgent.processCustomerMessage(messageData);
    
    console.log(`\n📋 Full Processing Results:`);
    console.log(`✅ Success: ${result.success}`);
    console.log(`📝 Content length: ${result.content?.length || 0} characters`);
    console.log(`📸 Images: ${result.images?.length || 0}`);
    console.log(`🎯 Intent: ${result.intent}`);
    console.log(`💭 Sentiment: ${result.sentiment}`);
    console.log(`🧠 Model used: ${result.model}`);
    console.log(`⏱️ Processing time: ${result.processingTime}ms`);

    if (result.images && result.images.length > 0) {
      console.log(`\n📸 Images to be sent:`);
      result.images.forEach((img, idx) => {
        console.log(`   ${idx + 1}. ${img.payload.title}`);
        console.log(`      URL: ${img.payload.url}`);
      });
    } else {
      console.log(`\n⚠️ No images returned - this might be the issue!`);
    }

    console.log('\n🎉 Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testImageSendingFix();
