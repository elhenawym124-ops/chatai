const axios = require('axios');

async function testFinalImageFix() {
  console.log('🧪 Testing Final Image Fix...\n');
  
  console.log('📝 Test: "أريد صور أديداس فقط"');
  console.log('   Expected: Only Adidas images should be sent');
  
  const testData = {
    object: 'page',
    entry: [{
      messaging: [{
        sender: { id: '7801113803290451' },
        recipient: { id: 'page_id' },
        timestamp: Date.now(),
        message: { text: 'أريد صور أديداس فقط' }
      }]
    }]
  };
  
  try {
    await axios.post('http://localhost:3001/webhook', testData);
    console.log('✅ Test sent successfully');
    
    console.log('\n⏳ Waiting for response...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    console.log('\n🔍 Check server logs for:');
    console.log('✅ "🎯 Filtered to X products for brand: أديداس"');
    console.log('✅ "📸 Added image for product: كوتشي أديداس ستان سميث" (ONLY)');
    console.log('❌ Should NOT see: "📸 Added image for product: كوتشي اسكوتش"');
    console.log('❌ Should NOT see: "📸 Added image for product: كوتشي نايك"');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFinalImageFix().catch(console.error);
