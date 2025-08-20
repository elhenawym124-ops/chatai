const axios = require('axios');

async function finalImageTest() {
  console.log('🖼️ Final Image Processing Test...\n');
  
  const baseURL = 'http://localhost:3001';
  
  try {
    // Test with a simple image message
    console.log('📱 Sending image message...');
    
    const imageWebhookData = {
      object: 'page',
      entry: [{
        messaging: [{
          sender: { id: 'final-test-user' },
          recipient: { id: 'page_id' },
          timestamp: Date.now(),
          message: {
            text: 'ما هذا الحذاء؟',
            attachments: [{
              type: 'image',
              payload: {
                url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400'
              }
            }]
          }
        }]
      }]
    };
    
    const response = await axios.post(`${baseURL}/webhook`, imageWebhookData);
    console.log('✅ Image message sent successfully');
    
    // Wait for processing
    console.log('⏳ Waiting for AI to process image...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log('✅ Image processing test completed!');
    console.log('🔍 Check server logs for detailed processing information');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

finalImageTest();
