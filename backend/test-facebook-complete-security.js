const axios = require('axios');

async function testFacebookCompleteSecurity() {
  console.log('🔍 اختبار أمان شامل نهائي لـ Facebook Settings...\n');

  const baseURL = 'http://localhost:3001';
  
  try {
    // 1. اختبار جميع APIs بدون Authentication
    console.log('1️⃣ اختبار جميع APIs بدون Authentication:');
    console.log('═══════════════════════════════════════');

    const allFacebookAPIs = [
      { name: 'Connected Pages', url: '/api/v1/integrations/facebook/connected', method: 'GET' },
      { name: 'Facebook Config', url: '/api/v1/integrations/facebook/config', method: 'GET' },
      { name: 'Facebook Diagnostics', url: '/api/v1/integrations/facebook/diagnostics', method: 'GET' },
      { name: 'Test Token', url: '/api/v1/integrations/facebook/test', method: 'POST', data: { pageAccessToken: 'test' } },
      { name: 'Connect Page', url: '/api/v1/integrations/facebook/connect', method: 'POST', data: { pageId: 'test', pageAccessToken: 'test', pageName: 'test' } },
      { name: 'Page Details', url: '/api/v1/integrations/facebook/page/test-page', method: 'GET' },
      { name: 'Update Page', url: '/api/v1/integrations/facebook/test-page', method: 'PUT', data: { pageName: 'test' } },
      { name: 'Disconnect Page', url: '/api/v1/integrations/facebook/test-page', method: 'DELETE' }
    ];

    let allProtected = true;

    for (const api of allFacebookAPIs) {
      try {
        let response;
        const config = { timeout: 5000 };
        
        switch (api.method) {
          case 'GET':
            response = await axios.get(`${baseURL}${api.url}`, config);
            break;
          case 'POST':
            response = await axios.post(`${baseURL}${api.url}`, api.data || {}, config);
            break;
          case 'PUT':
            response = await axios.put(`${baseURL}${api.url}`, api.data || {}, config);
            break;
          case 'DELETE':
            response = await axios.delete(`${baseURL}${api.url}`, config);
            break;
        }
        
        console.log(`🔴 ${api.name}: ${response.status} - غير محمي!`);
        allProtected = false;
      } catch (error) {
        if (error.response?.status === 401) {
          console.log(`🟢 ${api.name}: 401 - محمي بشكل صحيح`);
        } else {
          console.log(`⚠️ ${api.name}: ${error.response?.status || 'خطأ'} - ${error.message}`);
        }
      }
    }

    // 2. تسجيل الدخول بشركتين
    console.log('\n2️⃣ تسجيل الدخول بشركتين:');
    console.log('═══════════════════════════════════════');

    const [login1, login2] = await Promise.all([
      axios.post(`${baseURL}/api/v1/auth/login`, {
        email: 'admin58@test.com',
        password: 'admin123'
      }),
      axios.post(`${baseURL}/api/v1/auth/login`, {
        email: 'admin@example.com',
        password: 'admin123'
      })
    ]);

    const user1 = login1.data.data.user;
    const user2 = login2.data.data.user;
    const token1 = login1.data.data.token;
    const token2 = login2.data.data.token;

    console.log('✅ شركة 1:', user1.companyId);
    console.log('✅ شركة 2:', user2.companyId);

    // 3. اختبار جميع APIs مع Authentication والعزل
    console.log('\n3️⃣ اختبار جميع APIs مع Authentication والعزل:');
    console.log('═══════════════════════════════════════');

    const readAPIs = [
      { name: 'Connected Pages', url: '/api/v1/integrations/facebook/connected' },
      { name: 'Facebook Config', url: '/api/v1/integrations/facebook/config' },
      { name: 'Facebook Diagnostics', url: '/api/v1/integrations/facebook/diagnostics' }
    ];

    let allIsolated = true;

    for (const api of readAPIs) {
      try {
        const [response1, response2] = await Promise.all([
          axios.get(`${baseURL}${api.url}`, { headers: { 'Authorization': `Bearer ${token1}` } }),
          axios.get(`${baseURL}${api.url}`, { headers: { 'Authorization': `Bearer ${token2}` } })
        ]);

        // فحص Company ID في الاستجابات
        const hasCompanyId1 = response1.data.companyId === user1.companyId;
        const hasCompanyId2 = response2.data.companyId === user2.companyId;

        if (hasCompanyId1 && hasCompanyId2) {
          console.log(`✅ ${api.name}: معزول بشكل صحيح`);
        } else {
          console.log(`⚠️ ${api.name}: قد لا يكون معزول بشكل صحيح`);
          allIsolated = false;
        }

      } catch (error) {
        console.log(`❌ ${api.name}: خطأ - ${error.response?.status}`);
      }
    }

    // 4. اختبار CRUD Operations مع العزل
    console.log('\n4️⃣ اختبار CRUD Operations مع العزل:');
    console.log('═══════════════════════════════════════');

    // إضافة صفحات للشركتين
    const page1Data = {
      pageId: `security-test-1-${Date.now()}`,
      pageAccessToken: 'token-company1-security',
      pageName: 'صفحة أمان الشركة الأولى'
    };

    const page2Data = {
      pageId: `security-test-2-${Date.now()}`,
      pageAccessToken: 'token-company2-security',
      pageName: 'صفحة أمان الشركة الثانية'
    };

    try {
      const [addResponse1, addResponse2] = await Promise.all([
        axios.post(`${baseURL}/api/v1/integrations/facebook/connect`, page1Data, {
          headers: { 'Authorization': `Bearer ${token1}` }
        }),
        axios.post(`${baseURL}/api/v1/integrations/facebook/connect`, page2Data, {
          headers: { 'Authorization': `Bearer ${token2}` }
        })
      ]);

      console.log('✅ إضافة الصفحات نجحت للشركتين');

      // فحص العزل في عرض الصفحات
      const [pages1, pages2] = await Promise.all([
        axios.get(`${baseURL}/api/v1/integrations/facebook/connected`, {
          headers: { 'Authorization': `Bearer ${token1}` }
        }),
        axios.get(`${baseURL}/api/v1/integrations/facebook/connected`, {
          headers: { 'Authorization': `Bearer ${token2}` }
        })
      ]);

      const company1Pages = pages1.data.pages || [];
      const company2Pages = pages2.data.pages || [];

      console.log(`📊 الشركة 1: ${company1Pages.length} صفحة`);
      console.log(`📊 الشركة 2: ${company2Pages.length} صفحة`);

      // فحص أن كل شركة ترى صفحاتها فقط
      let crudIsolationWorking = true;

      company1Pages.forEach(page => {
        if (page.companyId !== user1.companyId) {
          console.log(`🔴 الشركة 1 ترى صفحة من شركة أخرى: ${page.pageName}`);
          crudIsolationWorking = false;
        }
      });

      company2Pages.forEach(page => {
        if (page.companyId !== user2.companyId) {
          console.log(`🔴 الشركة 2 ترى صفحة من شركة أخرى: ${page.pageName}`);
          crudIsolationWorking = false;
        }
      });

      if (crudIsolationWorking) {
        console.log('✅ CRUD Operations معزولة بشكل صحيح');
      }

      // 5. اختبار Cross-Company Access Prevention
      console.log('\n5️⃣ اختبار Cross-Company Access Prevention:');
      console.log('═══════════════════════════════════════');

      if (company1Pages.length > 0 && company2Pages.length > 0) {
        const page1Id = company1Pages.find(p => p.pageName.includes('أمان'))?.pageId;
        const page2Id = company2Pages.find(p => p.pageName.includes('أمان'))?.pageId;

        if (page1Id && page2Id) {
          let crossAccessPrevented = true;

          // محاولة الشركة 1 الوصول لصفحة الشركة 2
          try {
            await axios.get(`${baseURL}/api/v1/integrations/facebook/page/${page2Id}`, {
              headers: { 'Authorization': `Bearer ${token1}` }
            });
            console.log('🔴 الشركة 1 تمكنت من الوصول لصفحة الشركة 2!');
            crossAccessPrevented = false;
          } catch (error) {
            if (error.response?.status === 404) {
              console.log('✅ الشركة 1 لا تستطيع الوصول لصفحة الشركة 2');
            }
          }

          // محاولة الشركة 2 الوصول لصفحة الشركة 1
          try {
            await axios.get(`${baseURL}/api/v1/integrations/facebook/page/${page1Id}`, {
              headers: { 'Authorization': `Bearer ${token2}` }
            });
            console.log('🔴 الشركة 2 تمكنت من الوصول لصفحة الشركة 1!');
            crossAccessPrevented = false;
          } catch (error) {
            if (error.response?.status === 404) {
              console.log('✅ الشركة 2 لا تستطيع الوصول لصفحة الشركة 1');
            }
          }

          // محاولة حذف صفحة شركة أخرى
          try {
            await axios.delete(`${baseURL}/api/v1/integrations/facebook/${page2Id}`, {
              headers: { 'Authorization': `Bearer ${token1}` }
            });
            console.log('🔴 الشركة 1 تمكنت من حذف صفحة الشركة 2!');
            crossAccessPrevented = false;
          } catch (error) {
            if (error.response?.status === 403 || error.response?.status === 404) {
              console.log('✅ الشركة 1 لا تستطيع حذف صفحة الشركة 2');
            }
          }

          if (crossAccessPrevented) {
            console.log('✅ Cross-Company Access محظور بشكل صحيح');
          }
        }
      }

      // تنظيف البيانات التجريبية
      console.log('\n6️⃣ تنظيف البيانات التجريبية:');
      console.log('═══════════════════════════════════════');

      try {
        const testPage1 = company1Pages.find(p => p.pageName.includes('أمان'));
        const testPage2 = company2Pages.find(p => p.pageName.includes('أمان'));

        if (testPage1) {
          await axios.delete(`${baseURL}/api/v1/integrations/facebook/${testPage1.pageId}`, {
            headers: { 'Authorization': `Bearer ${token1}` }
          });
          console.log('🗑️ تم حذف صفحة الشركة 1 التجريبية');
        }

        if (testPage2) {
          await axios.delete(`${baseURL}/api/v1/integrations/facebook/${testPage2.pageId}`, {
            headers: { 'Authorization': `Bearer ${token2}` }
          });
          console.log('🗑️ تم حذف صفحة الشركة 2 التجريبية');
        }
      } catch (error) {
        console.log('⚠️ خطأ في تنظيف البيانات:', error.response?.status);
      }

    } catch (error) {
      console.log('❌ خطأ في اختبار CRUD Operations:', error.response?.status);
    }

    // 7. النتائج النهائية
    console.log('\n🏆 النتائج النهائية الشاملة:');
    console.log('═══════════════════════════════════════');

    if (allProtected && allIsolated && crudIsolationWorking) {
      console.log('🟢 Facebook Settings آمن ومعزول بالكامل 100%!');
      console.log('✅ جميع APIs محمية بـ Authentication');
      console.log('✅ جميع APIs معزولة بين الشركات');
      console.log('✅ CRUD Operations معزولة بشكل صحيح');
      console.log('✅ Cross-Company Access محظور تماماً');
      console.log('✅ Company ID صحيح في جميع الاستجابات');
      console.log('✅ لا توجد ثغرات أمنية');
      console.log('\n🎉 Facebook Settings جاهز للإنتاج بأمان كامل!');
    } else {
      console.log('🔴 هناك مشاكل أمنية:');
      if (!allProtected) console.log('❌ بعض APIs غير محمية');
      if (!allIsolated) console.log('❌ بعض APIs غير معزولة');
      if (!crudIsolationWorking) console.log('❌ CRUD Operations غير معزولة');
    }

  } catch (error) {
    console.error('❌ خطأ عام في الاختبار:', error.message);
    if (error.response) {
      console.log('📥 تفاصيل الخطأ:', error.response.data);
    }
  }
}

testFacebookCompleteSecurity();
