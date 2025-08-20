const axios = require('axios');

async function testImprovedImageSending() {
  console.log('🔧 Testing Improved Image Sending...\n');
  
  const baseURL = 'http://localhost:3001';
  
  try {
    // Test 1: طلب صور المنتجات مع التحسينات الجديدة
    console.log('📸 Test 1: Requesting product images with improvements...');
    
    const imageRequestData = {
      object: 'page',
      entry: [{
        messaging: [{
          sender: { id: '7801113803290451' }, // العميل الحقيقي
          recipient: { id: 'page_id' },
          timestamp: Date.now(),
          message: {
            text: 'ابعت لي صور الكوتشيات المتاحة'
          }
        }]
      }]
    };
    
    const response1 = await axios.post(`${baseURL}/webhook`, imageRequestData);
    console.log('✅ Image request sent successfully');
    
    // انتظار المعالجة والإرسال
    console.log('⏳ Waiting for AI to process and send images with confirmations...');
    await new Promise(resolve => setTimeout(resolve, 15000)); // انتظار أطول للتأكيدات
    
    // Test 2: طلب صور محددة
    console.log('\n🎯 Test 2: Requesting specific brand images...');
    
    const specificRequestData = {
      object: 'page',
      entry: [{
        messaging: [{
          sender: { id: '7801113803290451' },
          recipient: { id: 'page_id' },
          timestamp: Date.now(),
          message: {
            text: 'ورني صور أحذية أديداس'
          }
        }]
      }]
    };
    
    const response2 = await axios.post(`${baseURL}/webhook`, specificRequestData);
    console.log('✅ Specific brand request sent successfully');
    
    // انتظار المعالجة
    console.log('⏳ Waiting for brand-specific images...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    console.log('\n🎉 Improved image sending tests completed!');
    console.log('🔍 Check server logs for detailed processing information');
    console.log('');
    console.log('📊 Expected Improvements:');
    console.log('✅ Confirmation message before sending images');
    console.log('✅ Individual success/failure tracking for each image');
    console.log('✅ Final confirmation message after all images sent');
    console.log('✅ Better error handling and reporting');
    console.log('✅ Message IDs logged for tracking');
    console.log('');
    console.log('📱 What the customer should see:');
    console.log('1. AI text response');
    console.log('2. "جاري إرسال X صور للمنتجات..."');
    console.log('3. Product images (one by one)');
    console.log('4. "تم إرسال X صور بنجاح! هل تريد المزيد من التفاصيل؟"');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testImprovedImageSending();
