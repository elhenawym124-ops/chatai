const axios = require('axios');

async function testRegistration() {
  console.log('🧪 اختبار التسجيل...');
  
  try {
    const response = await axios.post('http://localhost:3001/api/v1/auth/register', {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'أحمد',
      lastName: 'محمد',
      companyName: 'شركة الاختبار',
      phone: '01234567890'
    });
    
    console.log('✅ التسجيل نجح:', response.data);
  } catch (error) {
    console.log('❌ خطأ في التسجيل:', error.response?.data || error.message);
  }
}

testRegistration();
