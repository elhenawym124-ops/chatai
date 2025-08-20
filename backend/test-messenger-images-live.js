const { PrismaClient } = require('@prisma/client');
const aiAgent = require('./src/services/aiAgentService');

const prisma = new PrismaClient();

async function testMessengerImagesLive() {
  console.log('🧪 Testing Live Messenger Image Sending...\n');
  
  try {
    // 1. فحص إعدادات Facebook Page
    console.log('📋 Step 1: Checking Facebook Page settings...');
    const activePage = await prisma.facebookPage.findFirst({
      where: { status: 'connected' },
      orderBy: { connectedAt: 'desc' }
    });
    
    if (!activePage) {
      console.log('❌ No active Facebook page found');
      return;
    }
    
    console.log('✅ Active page found:', {
      pageName: activePage.pageName,
      pageId: activePage.pageId,
      hasToken: !!activePage.pageAccessToken,
      tokenLength: activePage.pageAccessToken?.length || 0
    });

    // 2. فحص المنتجات المتاحة
    console.log('\n📦 Step 2: Checking available products...');
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        images: {
          not: null
        }
      },
      take: 3
    });

    console.log(`✅ Found ${products.length} products with images`);
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name}`);
      try {
        const images = JSON.parse(product.images);
        console.log(`      Images: ${images.length} (${images[0]?.substring(0, 50)}...)`);
      } catch (e) {
        console.log(`      Images: Parse error`);
      }
    });

    // 3. اختبار AI Agent مع رسالة طلب صور
    console.log('\n🤖 Step 3: Testing AI Agent with image request...');
    
    const testMessage = {
      conversationId: 'test_live_conversation',
      senderId: '9873704269401712', // ID حقيقي من قاعدة البيانات
      content: 'ممكن أشوف صور الكوتشي المتاح؟',
      attachments: [],
      customerData: {
        companyId: 'cmdkj6coz0000uf0cyscco6lr',
        id: 'test_customer_live',
        name: 'عميل تجريبي'
      }
    };

    console.log(`📤 Processing message: "${testMessage.content}"`);
    
    const aiResult = await aiAgent.processCustomerMessage(testMessage);
    
    console.log('\n📋 AI Agent Results:');
    console.log(`✅ Success: ${aiResult.success}`);
    console.log(`📝 Content: ${aiResult.content?.substring(0, 100)}...`);
    console.log(`📸 Images count: ${aiResult.images?.length || 0}`);
    console.log(`🎯 Intent: ${aiResult.intent}`);
    console.log(`⏱️ Processing time: ${aiResult.processingTime}ms`);

    if (aiResult.images && aiResult.images.length > 0) {
      console.log('\n📸 Images to be sent:');
      aiResult.images.forEach((img, idx) => {
        console.log(`   ${idx + 1}. ${img.payload.title}`);
        console.log(`      URL: ${img.payload.url}`);
        console.log(`      Valid URL: ${img.payload.url.startsWith('http') ? '✅' : '❌'}`);
      });

      // 4. اختبار إرسال الصور مباشرة عبر Facebook API
      console.log('\n📤 Step 4: Testing direct Facebook image sending...');
      
      for (let i = 0; i < aiResult.images.length; i++) {
        const image = aiResult.images[i];
        console.log(`\n📸 Sending image ${i + 1}/${aiResult.images.length}: ${image.payload.title}`);
        
        try {
          const messageData = {
            recipient: {
              id: testMessage.senderId
            },
            message: {
              attachment: {
                type: 'image',
                payload: {
                  url: image.payload.url
                }
              }
            }
          };

          const response = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${activePage.pageAccessToken}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(messageData)
          });

          if (response.ok) {
            const responseData = await response.json();
            console.log(`✅ Image sent successfully - Message ID: ${responseData.message_id}`);
          } else {
            const error = await response.text();
            console.log(`❌ Failed to send image:`);
            console.log(`   Status: ${response.status} ${response.statusText}`);
            console.log(`   Response: ${error.substring(0, 200)}...`);
            
            // محاولة تحليل الخطأ
            try {
              const errorData = JSON.parse(error);
              if (errorData.error) {
                console.log(`   Error Code: ${errorData.error.code}`);
                console.log(`   Error Type: ${errorData.error.type}`);
                console.log(`   Error Message: ${errorData.error.message}`);
              }
            } catch (parseError) {
              console.log(`   Could not parse error response`);
            }
          }

        } catch (error) {
          console.log(`❌ Exception sending image: ${error.message}`);
        }

        // تأخير بين الصور
        if (i < aiResult.images.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

    } else {
      console.log('\n⚠️ No images returned from AI Agent');
      console.log('🔍 This is the main issue - AI is not returning images');
      
      // تشخيص إضافي
      console.log('\n🔍 Additional Diagnostics:');
      console.log(`- AI Response structure:`, JSON.stringify(aiResult, null, 2));
    }

    // 5. اختبار إرسال رسالة نصية للتأكد من عمل الاتصال
    console.log('\n📝 Step 5: Testing text message to confirm connection...');
    
    try {
      const textMessageData = {
        recipient: {
          id: testMessage.senderId
        },
        message: {
          text: '🧪 اختبار اتصال - تم اختبار النظام بنجاح!'
        }
      };

      const textResponse = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${activePage.pageAccessToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(textMessageData)
      });

      if (textResponse.ok) {
        const textResponseData = await textResponse.json();
        console.log(`✅ Text message sent successfully - Message ID: ${textResponseData.message_id}`);
      } else {
        const textError = await textResponse.text();
        console.log(`❌ Failed to send text message: ${textError.substring(0, 200)}...`);
      }

    } catch (error) {
      console.log(`❌ Exception sending text message: ${error.message}`);
    }

    console.log('\n🎉 Live test completed!');

  } catch (error) {
    console.error('❌ Live test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testMessengerImagesLive();
