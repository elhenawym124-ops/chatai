const axios = require('axios');

async function debugResponseContent() {
  console.log('🔍 تشخيص محتوى الاستجابات...\n');

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
    const company1Id = company1Response.data.data.company.id;
    console.log(`✅ الشركة الأولى: ${company1Response.data.data.company.name} (${company1Id})`);

    const company2Response = await axios.post('http://localhost:3001/api/v1/auth/register', company2Data);
    const company2Token = company2Response.data.data.token;
    const company2Id = company2Response.data.data.company.id;
    console.log(`✅ الشركة الثانية: ${company2Response.data.data.company.name} (${company2Id})`);

    // اختبار محتوى المنتجات
    console.log('\n📦 محتوى استجابة المنتجات:');
    try {
      const company1Products = await axios.get('http://localhost:3001/api/v1/products', {
        headers: { 'Authorization': `Bearer ${company1Token}` }
      });
      
      const company2Products = await axios.get('http://localhost:3001/api/v1/products', {
        headers: { 'Authorization': `Bearer ${company2Token}` }
      });

      console.log('الشركة 1 - المنتجات:', JSON.stringify(company1Products.data, null, 2));
      console.log('الشركة 2 - المنتجات:', JSON.stringify(company2Products.data, null, 2));
      
      if (JSON.stringify(company1Products.data) === JSON.stringify(company2Products.data)) {
        console.log('❌ نفس البيانات!');
      } else {
        console.log('✅ بيانات مختلفة');
      }

    } catch (error) {
      console.log('❌ خطأ في المنتجات:', error.response?.data || error.message);
    }

    // اختبار محتوى العملاء
    console.log('\n👥 محتوى استجابة العملاء:');
    try {
      const company1Customers = await axios.get('http://localhost:3001/api/v1/customers', {
        headers: { 'Authorization': `Bearer ${company1Token}` }
      });
      
      const company2Customers = await axios.get('http://localhost:3001/api/v1/customers', {
        headers: { 'Authorization': `Bearer ${company2Token}` }
      });

      console.log('الشركة 1 - العملاء:', JSON.stringify(company1Customers.data, null, 2));
      console.log('الشركة 2 - العملاء:', JSON.stringify(company2Customers.data, null, 2));
      
      if (JSON.stringify(company1Customers.data) === JSON.stringify(company2Customers.data)) {
        console.log('❌ نفس البيانات!');
      } else {
        console.log('✅ بيانات مختلفة');
      }

    } catch (error) {
      console.log('❌ خطأ في العملاء:', error.response?.data || error.message);
    }

    // اختبار محتوى المحادثات
    console.log('\n💬 محتوى استجابة المحادثات:');
    try {
      const company1Conversations = await axios.get('http://localhost:3001/api/v1/conversations', {
        headers: { 'Authorization': `Bearer ${company1Token}` }
      });
      
      const company2Conversations = await axios.get('http://localhost:3001/api/v1/conversations', {
        headers: { 'Authorization': `Bearer ${company2Token}` }
      });

      console.log('الشركة 1 - المحادثات:', JSON.stringify(company1Conversations.data, null, 2));
      console.log('الشركة 2 - المحادثات:', JSON.stringify(company2Conversations.data, null, 2));
      
      if (JSON.stringify(company1Conversations.data) === JSON.stringify(company2Conversations.data)) {
        console.log('❌ نفس البيانات!');
      } else {
        console.log('✅ بيانات مختلفة');
      }

    } catch (error) {
      console.log('❌ خطأ في المحادثات:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error.response?.data || error.message);
  }
}

debugResponseContent();
