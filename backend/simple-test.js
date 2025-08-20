const axios = require('axios');

async function simpleTest() {
  console.log('🔍 اختبار بسيط للخادم...');

  try {
    const response = await axios.get('http://localhost:3001/api/v1/health');
    console.log('✅ الخادم يعمل:', response.status);
  } catch (error) {
    console.log('❌ الخادم لا يعمل:', error.message);
  }
}

simpleTest();
