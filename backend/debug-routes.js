const axios = require('axios');

async function debugRoutes() {
  console.log('🔍 تشخيص routes المختلفة...\n');

  try {
    // إنشاء شركتين للاختبار
    const company1Data = {
      email: `debug1_${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'مدير',
      lastName: 'الشركة الأولى',
      companyName: 'شركة التشخيص الأولى',
      phone: '01111111111'
    };

    const company2Data = {
      email: `debug2_${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'مدير',
      lastName: 'الشركة الثانية',
      companyName: 'شركة التشخيص الثانية',
      phone: '02222222222'
    };

    const company1Response = await axios.post('http://localhost:3001/api/v1/auth/register', company1Data);
    const company1Token = company1Response.data.data.token;
    console.log(`✅ الشركة الأولى: ${company1Response.data.data.company.name}`);

    const company2Response = await axios.post('http://localhost:3001/api/v1/auth/register', company2Data);
    const company2Token = company2Response.data.data.token;
    console.log(`✅ الشركة الثانية: ${company2Response.data.data.company.name}`);

    // اختبار routes مختلفة للمنتجات
    console.log('\n🔍 اختبار routes المنتجات:');
    
    const productRoutes = [
      '/api/v1/products',
      '/api/v1/products/',
      '/api/v1/product',
      '/api/v1/product/'
    ];

    for (const route of productRoutes) {
      try {
        console.log(`\n📦 اختبار ${route}:`);
        
        const company1Products = await axios.get(`http://localhost:3001${route}`, {
          headers: { 'Authorization': `Bearer ${company1Token}` }
        });
        
        const company2Products = await axios.get(`http://localhost:3001${route}`, {
          headers: { 'Authorization': `Bearer ${company2Token}` }
        });

        console.log(`   الشركة 1: ${JSON.stringify(company1Products.data).length} chars`);
        console.log(`   الشركة 2: ${JSON.stringify(company2Products.data).length} chars`);
        
        if (JSON.stringify(company1Products.data) === JSON.stringify(company2Products.data)) {
          console.log(`   ❌ نفس البيانات!`);
        } else {
          console.log(`   ✅ بيانات مختلفة`);
        }

      } catch (error) {
        console.log(`   ❓ خطأ: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }
    }

    // اختبار routes مختلفة للعملاء
    console.log('\n🔍 اختبار routes العملاء:');
    
    const customerRoutes = [
      '/api/v1/customers',
      '/api/v1/customers/',
      '/api/v1/customer',
      '/api/v1/customer/'
    ];

    for (const route of customerRoutes) {
      try {
        console.log(`\n👥 اختبار ${route}:`);
        
        const company1Customers = await axios.get(`http://localhost:3001${route}`, {
          headers: { 'Authorization': `Bearer ${company1Token}` }
        });
        
        const company2Customers = await axios.get(`http://localhost:3001${route}`, {
          headers: { 'Authorization': `Bearer ${company2Token}` }
        });

        console.log(`   الشركة 1: ${JSON.stringify(company1Customers.data).length} chars`);
        console.log(`   الشركة 2: ${JSON.stringify(company2Customers.data).length} chars`);
        
        if (JSON.stringify(company1Customers.data) === JSON.stringify(company2Customers.data)) {
          console.log(`   ❌ نفس البيانات!`);
        } else {
          console.log(`   ✅ بيانات مختلفة`);
        }

      } catch (error) {
        console.log(`   ❓ خطأ: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }
    }

    // اختبار routes مختلفة للمحادثات
    console.log('\n🔍 اختبار routes المحادثات:');
    
    const conversationRoutes = [
      '/api/v1/conversations',
      '/api/v1/conversations/',
      '/api/v1/conversation',
      '/api/v1/conversation/'
    ];

    for (const route of conversationRoutes) {
      try {
        console.log(`\n💬 اختبار ${route}:`);
        
        const company1Conversations = await axios.get(`http://localhost:3001${route}`, {
          headers: { 'Authorization': `Bearer ${company1Token}` }
        });
        
        const company2Conversations = await axios.get(`http://localhost:3001${route}`, {
          headers: { 'Authorization': `Bearer ${company2Token}` }
        });

        console.log(`   الشركة 1: ${JSON.stringify(company1Conversations.data).length} chars`);
        console.log(`   الشركة 2: ${JSON.stringify(company2Conversations.data).length} chars`);
        
        if (JSON.stringify(company1Conversations.data) === JSON.stringify(company2Conversations.data)) {
          console.log(`   ❌ نفس البيانات!`);
        } else {
          console.log(`   ✅ بيانات مختلفة`);
        }

      } catch (error) {
        console.log(`   ❓ خطأ: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }
    }

    console.log('\n📋 ملخص التشخيص:');
    console.log('═══════════════════════════════════════');
    console.log('تم اختبار routes مختلفة لكل نوع بيانات');
    console.log('المشكلة قد تكون في:');
    console.log('1. استخدام routes مختلفة غير محمية');
    console.log('2. عدم تطبيق middleware على جميع الـ routes');
    console.log('3. وجود routes مكررة بدون حماية');

  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error.response?.data || error.message);
  }
}

debugRoutes();
