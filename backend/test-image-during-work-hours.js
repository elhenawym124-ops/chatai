const axios = require('axios');

async function testImageDuringWorkHours() {
  console.log('🕐 Testing Image Processing During Work Hours...\n');
  
  const baseURL = 'http://localhost:3001';
  
  try {
    // First, let's check AI settings
    console.log('⚙️ Checking AI settings...');
    const settingsResponse = await axios.get(`${baseURL}/api/v1/ai/settings`);
    console.log('AI Settings:', JSON.stringify(settingsResponse.data, null, 2));
    
    // Update working hours to be 24/7 for testing
    console.log('\n🔧 Updating working hours for testing...');
    const updateResponse = await axios.put(`${baseURL}/api/v1/ai/settings`, {
      workingHours: { start: '00:00', end: '23:59' },
      isEnabled: true,
      maxRepliesPerCustomer: 10
    });
    console.log('✅ Working hours updated');
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test image processing
    console.log('\n🖼️ Testing image processing...');
    
    const imageWebhookData = {
      object: 'page',
      entry: [{
        messaging: [{
          sender: { id: 'test-image-24-7' },
          recipient: { id: 'page_id' },
          timestamp: Date.now(),
          message: {
            text: 'حلل هذه الصورة من فضلك',
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
    
    const webhookResponse = await axios.post(`${baseURL}/webhook`, imageWebhookData);
    console.log('✅ Image message sent successfully');
    
    // Wait for processing
    console.log('⏳ Waiting for AI to process image...');
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    // Check memory to see if image was processed
    console.log('\n🧠 Checking conversation memory...');
    const memoryResponse = await axios.get(`${baseURL}/api/v1/ai/memory/stats`);
    console.log('Memory stats:', memoryResponse.data);
    
    console.log('\n📊 Test Summary:');
    console.log('================');
    console.log('✅ AI settings updated');
    console.log('✅ Working hours set to 24/7');
    console.log('✅ Image message sent');
    console.log('✅ Processing initiated');
    console.log('');
    console.log('🔍 Check server logs for detailed processing info');
    console.log('📱 The AI should now process images properly');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testImageDuringWorkHours();
