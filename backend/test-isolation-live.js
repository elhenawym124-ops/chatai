const axios = require('axios');

async function testIsolationLive() {
  console.log('🔍 اختبار العزل المباشر لـ Facebook Settings...\n');

  const baseURL = 'http://localhost:3001';
  
  try {
    // 1. تسجيل الدخول بشركتين مختلفتين
    console.log('1️⃣ تسجيل الدخول بشركتين:');
    console.log('═══════════════════════════════════════');

    const [login1, login2] = await Promise.all([
      axios.post(`${baseURL}/api/v1/auth/login`, {
        email: 'admin@example.com',
        password: 'admin123'
      }),
      axios.post(`${baseURL}/api/v1/auth/login`, {
        email: 'admin58@test.com', 
        password: 'admin123'
      })
    ]);

    const user1 = login1.data.data.user;
    const user2 = login2.data.data.user;
    const token1 = login1.data.data.token;
    const token2 = login2.data.data.token;

    console.log('✅ شركة 1:', user1.companyId, '- المستخدم:', user1.email);
    console.log('✅ شركة 2:', user2.companyId, '- المستخدم:', user2.email);

    // 2. فحص Facebook Connected Pages للشركتين
    console.log('\n2️⃣ فحص Facebook Connected Pages:');
    console.log('═══════════════════════════════════════');

    const [pages1Response, pages2Response] = await Promise.all([
      axios.get(`${baseURL}/api/v1/integrations/facebook/connected`, {
        headers: { 'Authorization': `Bearer ${token1}` }
      }),
      axios.get(`${baseURL}/api/v1/integrations/facebook/connected`, {
        headers: { 'Authorization': `Bearer ${token2}` }
      })
    ]);

    console.log('📊 استجابة الشركة 1:', {
      success: pages1Response.data.success,
      companyId: pages1Response.data.companyId,
      pagesCount: pages1Response.data.pages?.length || 0,
      pages: pages1Response.data.pages?.map(p => ({ id: p.pageId, name: p.pageName, company: p.companyId })) || []
    });

    console.log('📊 استجابة الشركة 2:', {
      success: pages2Response.data.success,
      companyId: pages2Response.data.companyId,
      pagesCount: pages2Response.data.pages?.length || 0,
      pages: pages2Response.data.pages?.map(p => ({ id: p.pageId, name: p.pageName, company: p.companyId })) || []
    });

    // 3. فحص Facebook Config للشركتين
    console.log('\n3️⃣ فحص Facebook Config:');
    console.log('═══════════════════════════════════════');

    const [config1Response, config2Response] = await Promise.all([
      axios.get(`${baseURL}/api/v1/integrations/facebook/config`, {
        headers: { 'Authorization': `Bearer ${token1}` }
      }),
      axios.get(`${baseURL}/api/v1/integrations/facebook/config`, {
        headers: { 'Authorization': `Bearer ${token2}` }
      })
    ]);

    console.log('⚙️ Config الشركة 1:', {
      success: config1Response.data.success,
      companyId: config1Response.data.companyId,
      appId: config1Response.data.data?.appId
    });

    console.log('⚙️ Config الشركة 2:', {
      success: config2Response.data.success,
      companyId: config2Response.data.companyId,
      appId: config2Response.data.data?.appId
    });

    // 4. فحص Facebook Diagnostics للشركتين
    console.log('\n4️⃣ فحص Facebook Diagnostics:');
    console.log('═══════════════════════════════════════');

    try {
      const [diag1Response, diag2Response] = await Promise.all([
        axios.get(`${baseURL}/api/v1/integrations/facebook/diagnostics`, {
          headers: { 'Authorization': `Bearer ${token1}` }
        }),
        axios.get(`${baseURL}/api/v1/integrations/facebook/diagnostics`, {
          headers: { 'Authorization': `Bearer ${token2}` }
        })
      ]);

      console.log('🔍 Diagnostics الشركة 1:', {
        companyId: diag1Response.data.companyId,
        customers: diag1Response.data.database?.tables?.customers,
        conversations: diag1Response.data.database?.tables?.conversations,
        messages: diag1Response.data.database?.tables?.messages,
        facebookPages: diag1Response.data.facebook?.pages?.total
      });

      console.log('🔍 Diagnostics الشركة 2:', {
        companyId: diag2Response.data.companyId,
        customers: diag2Response.data.database?.tables?.customers,
        conversations: diag2Response.data.database?.tables?.conversations,
        messages: diag2Response.data.database?.tables?.messages,
        facebookPages: diag2Response.data.facebook?.pages?.total
      });
    } catch (error) {
      console.log('⚠️ خطأ في Diagnostics:', error.response?.status);
    }

    // 5. إضافة صفحة تجريبية لكل شركة
    console.log('\n5️⃣ إضافة صفحات تجريبية:');
    console.log('═══════════════════════════════════════');

    const testPage1 = {
      pageId: `isolation-test-1-${Date.now()}`,
      pageAccessToken: 'test-token-company-1',
      pageName: 'صفحة اختبار العزل - شركة 1'
    };

    const testPage2 = {
      pageId: `isolation-test-2-${Date.now()}`,
      pageAccessToken: 'test-token-company-2',
      pageName: 'صفحة اختبار العزل - شركة 2'
    };

    const [addResponse1, addResponse2] = await Promise.all([
      axios.post(`${baseURL}/api/v1/integrations/facebook/connect`, testPage1, {
        headers: { 'Authorization': `Bearer ${token1}` }
      }),
      axios.post(`${baseURL}/api/v1/integrations/facebook/connect`, testPage2, {
        headers: { 'Authorization': `Bearer ${token2}` }
      })
    ]);

    console.log('✅ إضافة صفحة الشركة 1:', addResponse1.data.success);
    console.log('✅ إضافة صفحة الشركة 2:', addResponse2.data.success);

    // 6. فحص العزل بعد الإضافة
    console.log('\n6️⃣ فحص العزل بعد إضافة الصفحات:');
    console.log('═══════════════════════════════════════');

    const [finalPages1, finalPages2] = await Promise.all([
      axios.get(`${baseURL}/api/v1/integrations/facebook/connected`, {
        headers: { 'Authorization': `Bearer ${token1}` }
      }),
      axios.get(`${baseURL}/api/v1/integrations/facebook/connected`, {
        headers: { 'Authorization': `Bearer ${token2}` }
      })
    ]);

    const company1Pages = finalPages1.data.pages || [];
    const company2Pages = finalPages2.data.pages || [];

    console.log(`📊 الشركة 1 النهائية: ${company1Pages.length} صفحة`);
    company1Pages.forEach((page, index) => {
      console.log(`  ${index + 1}. ${page.pageName} (${page.pageId}) - Company: ${page.companyId}`);
    });

    console.log(`📊 الشركة 2 النهائية: ${company2Pages.length} صفحة`);
    company2Pages.forEach((page, index) => {
      console.log(`  ${index + 1}. ${page.pageName} (${page.pageId}) - Company: ${page.companyId}`);
    });

    // 7. فحص العزل النهائي
    console.log('\n7️⃣ تقييم العزل النهائي:');
    console.log('═══════════════════════════════════════');

    let isolationPerfect = true;
    let issues = [];

    // فحص أن كل شركة ترى صفحاتها فقط
    company1Pages.forEach(page => {
      if (page.companyId !== user1.companyId) {
        isolationPerfect = false;
        issues.push(`الشركة 1 ترى صفحة من شركة أخرى: ${page.pageName}`);
      }
    });

    company2Pages.forEach(page => {
      if (page.companyId !== user2.companyId) {
        isolationPerfect = false;
        issues.push(`الشركة 2 ترى صفحة من شركة أخرى: ${page.pageName}`);
      }
    });

    // فحص أن الصفحات مختلفة
    const page1Names = company1Pages.map(p => p.pageName);
    const page2Names = company2Pages.map(p => p.pageName);
    const hasCommonPages = page1Names.some(name => page2Names.includes(name));

    if (hasCommonPages) {
      isolationPerfect = false;
      issues.push('الشركتان تريان نفس الصفحات');
    }

    // فحص Company ID في الاستجابات
    if (pages1Response.data.companyId !== user1.companyId) {
      isolationPerfect = false;
      issues.push('Company ID خطأ في استجابة الشركة 1');
    }

    if (pages2Response.data.companyId !== user2.companyId) {
      isolationPerfect = false;
      issues.push('Company ID خطأ في استجابة الشركة 2');
    }

    // النتيجة النهائية
    if (isolationPerfect) {
      console.log('🟢 العزل مطبق بالكامل 100%!');
      console.log('✅ كل شركة ترى صفحاتها فقط');
      console.log('✅ Company ID صحيح في جميع الاستجابات');
      console.log('✅ لا يوجد تداخل في البيانات');
      console.log('✅ Facebook Settings آمن للإنتاج');
    } else {
      console.log('🔴 مشاكل في العزل:');
      issues.forEach(issue => console.log(`❌ ${issue}`));
    }

    // تنظيف البيانات التجريبية
    console.log('\n8️⃣ تنظيف البيانات التجريبية:');
    console.log('═══════════════════════════════════════');

    try {
      const testPage1ToDelete = company1Pages.find(p => p.pageName.includes('اختبار العزل'));
      const testPage2ToDelete = company2Pages.find(p => p.pageName.includes('اختبار العزل'));

      if (testPage1ToDelete) {
        await axios.delete(`${baseURL}/api/v1/integrations/facebook/${testPage1ToDelete.pageId}`, {
          headers: { 'Authorization': `Bearer ${token1}` }
        });
        console.log('🗑️ تم حذف صفحة الشركة 1 التجريبية');
      }

      if (testPage2ToDelete) {
        await axios.delete(`${baseURL}/api/v1/integrations/facebook/${testPage2ToDelete.pageId}`, {
          headers: { 'Authorization': `Bearer ${token2}` }
        });
        console.log('🗑️ تم حذف صفحة الشركة 2 التجريبية');
      }
    } catch (error) {
      console.log('⚠️ خطأ في تنظيف البيانات:', error.response?.status);
    }

  } catch (error) {
    console.error('❌ خطأ عام في الاختبار:', error.message);
    if (error.response) {
      console.log('📥 تفاصيل الخطأ:', error.response.data);
    }
  }
}

testIsolationLive();
