const axios = require('axios');

async function checkServers() {
  console.log('🔍 فحص حالة الخوادم...\n');

  // فحص الخادم الخلفي
  console.log('1️⃣ فحص الخادم الخلفي (Backend):');
  try {
    const backendResponse = await axios.get('http://localhost:3001');
    console.log('✅ الخادم الخلفي يعمل');
    console.log(`📡 العنوان: http://localhost:3001`);
  } catch (error) {
    console.log('❌ الخادم الخلفي لا يعمل');
    console.log(`🔧 تشغيل: cd backend && node server.js`);
  }

  // فحص APIs المهمة
  console.log('\n2️⃣ فحص APIs المهمة:');
  
  try {
    const walletsResponse = await axios.get('http://localhost:3001/api/v1/wallet-payment/wallet-numbers');
    console.log('✅ API المحافظ يعمل');
    console.log(`📱 عدد المحافظ: ${walletsResponse.data.data?.length || 0}`);
  } catch (error) {
    console.log('❌ API المحافظ لا يعمل');
  }

  // فحص الخادم الأمامي
  console.log('\n3️⃣ فحص الخادم الأمامي (Frontend):');
  try {
    const frontendResponse = await axios.get('http://localhost:3000');
    console.log('✅ الخادم الأمامي يعمل');
    console.log(`🌐 العنوان: http://localhost:3000`);
  } catch (error) {
    console.log('❌ الخادم الأمامي لا يعمل');
    console.log(`🔧 تشغيل: cd frontend && npm start`);
  }

  console.log('\n4️⃣ الروابط المهمة:');
  console.log('🔗 الواجهات:');
  console.log('   📝 التسجيل: http://localhost:3000/auth/register');
  console.log('   🔑 تسجيل الدخول: http://localhost:3000/auth/login');
  console.log('   📊 لوحة التحكم: http://localhost:3000/dashboard');
  console.log('   💳 الاشتراك: http://localhost:3000/subscription');
  console.log('   🧾 الفواتير: http://localhost:3000/invoices');
  console.log('   💰 المدفوعات: http://localhost:3000/payments');
  console.log('   🏦 إدارة المحافظ: http://localhost:3000/super-admin/wallet-management');

  console.log('\n🔗 APIs:');
  console.log('   📝 التسجيل: http://localhost:3001/api/v1/auth/register');
  console.log('   🔑 تسجيل الدخول: http://localhost:3001/api/v1/auth/login');
  console.log('   📱 المحافظ: http://localhost:3001/api/v1/wallet-payment/wallet-numbers');
  console.log('   📄 الفاتورة: http://localhost:3001/api/v1/wallet-payment/invoice/{id}');

  console.log('\n🎉 فحص الخوادم مكتمل!');
}

checkServers();
