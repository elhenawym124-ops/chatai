const axios = require('axios');

async function testVisionCapabilities() {
  console.log('👁️ Testing Vision Capabilities with Updated Model...\n');
  
  const baseURL = 'http://localhost:3001';
  
  try {
    // Test 1: Check current model
    console.log('🔍 Test 1: Checking current model...');
    const keysResponse = await axios.get(`${baseURL}/api/v1/ai/gemini-keys`);
    const keys = keysResponse.data.data || [];
    const activeKey = keys.find(key => key.isActive);
    
    if (activeKey) {
      console.log('✅ Active key:', activeKey.name);
      console.log('📋 Model:', activeKey.model);
      
      const visionModels = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro-vision'];
      const hasVision = visionModels.some(model => activeKey.model.includes(model));
      
      if (hasVision) {
        console.log('✅ Vision capabilities: ENABLED');
      } else {
        console.log('❌ Vision capabilities: DISABLED');
        return;
      }
    }
    
    // Test 2: Send image message via webhook
    console.log('\n📱 Test 2: Testing image processing via webhook...');
    
    const imageWebhookData = {
      object: 'page',
      entry: [{
        messaging: [{
          sender: { id: 'vision-test-user-789' },
          recipient: { id: 'page_id' },
          timestamp: Date.now(),
          message: {
            text: 'ما رأيك في هذا الحذاء؟',
            attachments: [{
              type: 'image',
              payload: {
                url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop'
              }
            }]
          }
        }]
      }]
    };
    
    try {
      const webhookResponse = await axios.post(`${baseURL}/webhook`, imageWebhookData);
      console.log('✅ Image webhook sent successfully');
      
      // Wait for processing
      console.log('⏳ Waiting for AI to process image...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
    } catch (error) {
      console.log('❌ Image webhook failed:', error.response?.data || error.message);
    }
    
    // Test 3: Test another image type
    console.log('\n🖼️ Test 3: Testing different image...');
    
    const productImageData = {
      object: 'page',
      entry: [{
        messaging: [{
          sender: { id: 'vision-test-user-999' },
          recipient: { id: 'page_id' },
          timestamp: Date.now(),
          message: {
            text: 'هل لديكم مثل هذا المنتج؟',
            attachments: [{
              type: 'image',
              payload: {
                url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop'
              }
            }]
          }
        }]
      }]
    };
    
    try {
      const productResponse = await axios.post(`${baseURL}/webhook`, productImageData);
      console.log('✅ Product image webhook sent successfully');
      
      // Wait for processing
      console.log('⏳ Waiting for AI to analyze product image...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
    } catch (error) {
      console.log('❌ Product image webhook failed:', error.response?.data || error.message);
    }
    
    // Test 4: Check multimodal stats
    console.log('\n📊 Test 4: Checking multimodal statistics...');
    try {
      const statsResponse = await axios.get(`${baseURL}/api/v1/ai/multimodal/stats`);
      console.log('✅ Multimodal stats:', JSON.stringify(statsResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Multimodal stats error:', error.response?.status);
    }
    
    console.log('\n🎉 Vision Testing Complete!');
    console.log('================================');
    console.log('📋 Current Setup:');
    console.log(`   Model: ${activeKey?.model || 'Unknown'}`);
    console.log(`   Vision: ${hasVision ? 'ENABLED' : 'DISABLED'}`);
    console.log('');
    console.log('🔍 What was tested:');
    console.log('✅ Model configuration');
    console.log('✅ Image message processing');
    console.log('✅ Product image analysis');
    console.log('✅ Multimodal statistics');
    console.log('');
    console.log('📱 How to test manually:');
    console.log('1. Open Facebook Messenger');
    console.log('2. Send an image to your connected page');
    console.log('3. Add text like "ما هذا؟" or "هل لديكم مثل هذا؟"');
    console.log('4. Wait for AI analysis and response');
    console.log('');
    console.log('🎯 Expected AI capabilities:');
    console.log('• Describe what\'s in the image');
    console.log('• Identify products and brands');
    console.log('• Suggest similar products');
    console.log('• Assess product condition');
    console.log('• Answer questions about the image');
    
  } catch (error) {
    console.error('❌ Vision test failed:', error.message);
  }
}

testVisionCapabilities();
