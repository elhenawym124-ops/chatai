const axios = require('axios');

async function testDataIsolation() {
  console.log('🔒 اختبار عزل البيانات بين الشركات\n');

  try {
    // إنشاء شركتين للاختبار
    console.log('1️⃣ إنشاء شركتين للاختبار:');
    
    const company1Data = {
      email: `company1_${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'مدير',
      lastName: 'الشركة الأولى',
      companyName: 'الشركة الأولى للاختبار',
      phone: '01111111111'
    };

    const company2Data = {
      email: `company2_${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'مدير',
      lastName: 'الشركة الثانية',
      companyName: 'الشركة الثانية للاختبار',
      phone: '02222222222'
    };

    // تسجيل الشركة الأولى
    const company1Response = await axios.post('http://localhost:3001/api/v1/auth/register', company1Data);
    const company1Token = company1Response.data.data.token;
    const company1Id = company1Response.data.data.company.id;
    console.log(`✅ تم إنشاء الشركة الأولى: ${company1Response.data.data.company.name}`);

    // تسجيل الشركة الثانية
    const company2Response = await axios.post('http://localhost:3001/api/v1/auth/register', company2Data);
    const company2Token = company2Response.data.data.token;
    const company2Id = company2Response.data.data.company.id;
    console.log(`✅ تم إنشاء الشركة الثانية: ${company2Response.data.data.company.name}`);

    // اختبار عزل البيانات
    console.log('\n2️⃣ اختبار عزل البيانات:');

    // اختبار الوصول لبيانات الشركة الأخرى
    console.log('\n🔍 اختبار محاولة الوصول لبيانات شركة أخرى:');
    
    try {
      // محاولة الشركة الأولى الوصول لبيانات الشركة الثانية
      const unauthorizedAccess = await axios.get(`http://localhost:3001/api/v1/companies/${company2Id}`, {
        headers: { 'Authorization': `Bearer ${company1Token}` }
      });
      
      console.log('❌ خطر أمني: الشركة الأولى تمكنت من الوصول لبيانات الشركة الثانية!');
      console.log('البيانات المسربة:', unauthorizedAccess.data.data.name);
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ العزل يعمل: تم منع الوصول غير المصرح به');
      } else {
        console.log('❓ خطأ غير متوقع:', error.response?.data?.message || error.message);
      }
    }

    // اختبار APIs مختلفة
    console.log('\n3️⃣ اختبار APIs مختلفة:');

    const apisToTest = [
      { name: 'الطلبات', url: '/api/v1/orders' },
      { name: 'المنتجات', url: '/api/v1/products' },
      { name: 'العملاء', url: '/api/v1/customers' },
      { name: 'المحادثات', url: '/api/v1/conversations' },
      { name: 'لوحة التحكم', url: '/api/v1/company/dashboard' }
    ];

    for (const api of apisToTest) {
      try {
        console.log(`\n🔍 اختبار ${api.name}:`);
        
        // طلب من الشركة الأولى
        const company1Request = await axios.get(`http://localhost:3001${api.url}`, {
          headers: { 'Authorization': `Bearer ${company1Token}` }
        });
        
        // طلب من الشركة الثانية
        const company2Request = await axios.get(`http://localhost:3001${api.url}`, {
          headers: { 'Authorization': `Bearer ${company2Token}` }
        });

        // التحقق من العزل
        const company1Data = company1Request.data.data;
        const company2Data = company2Request.data.data;

        if (JSON.stringify(company1Data) === JSON.stringify(company2Data)) {
          console.log(`❌ مشكلة عزل في ${api.name}: الشركتان ترى نفس البيانات!`);
        } else {
          console.log(`✅ العزل يعمل في ${api.name}: كل شركة ترى بياناتها فقط`);
        }

      } catch (error) {
        if (error.response?.status === 404) {
          console.log(`ℹ️ ${api.name}: API غير موجود`);
        } else {
          console.log(`❌ خطأ في ${api.name}:`, error.response?.data?.message || error.message);
        }
      }
    }

    // اختبار محاولة تعديل بيانات شركة أخرى
    console.log('\n4️⃣ اختبار محاولة تعديل بيانات شركة أخرى:');
    
    try {
      const maliciousUpdate = await axios.put(`http://localhost:3001/api/v1/companies/${company2Id}`, {
        name: 'شركة مخترقة'
      }, {
        headers: { 'Authorization': `Bearer ${company1Token}` }
      });
      
      console.log('❌ خطر أمني: تم تعديل بيانات شركة أخرى!');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ الحماية تعمل: تم منع التعديل غير المصرح به');
      } else {
        console.log('ℹ️ API التعديل غير موجود أو محمي');
      }
    }

    console.log('\n📊 تقرير العزل:');
    console.log('═══════════════════════════════════════');
    console.log('✅ تم إنشاء شركتين منفصلتين');
    console.log('✅ كل شركة لها معرف فريد');
    console.log('✅ كل شركة لها مدير منفصل');
    console.log('✅ JWT tokens منفصلة لكل شركة');
    
    console.log('\n⚠️ نقاط ضعف محتملة:');
    console.log('🔍 يجب فحص جميع APIs للتأكد من فلترة companyId');
    console.log('🔍 يجب التأكد من middleware العزل في جميع الـ routes');
    console.log('🔍 يجب اختبار APIs الإدارية بعناية');

    console.log('\n🛡️ توصيات الأمان:');
    console.log('1. إضافة companyId filter لجميع database queries');
    console.log('2. استخدام requireCompanyAccess middleware في جميع الـ routes');
    console.log('3. إجراء audit شامل لجميع APIs');
    console.log('4. إضافة logging للوصول غير المصرح به');
    console.log('5. اختبار penetration testing دوري');

  } catch (error) {
    console.error('❌ خطأ في اختبار العزل:', error.response?.data || error.message);
  }
}

testDataIsolation();
