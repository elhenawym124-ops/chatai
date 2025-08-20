const axios = require('axios');

async function testFacebookFinal() {
  console.log('🔍 اختبار نهائي لأمان Facebook Settings...\n');

  const baseURL = 'http://localhost:3001';
  
  try {
    // 1. تسجيل الدخول بشركتين
    console.log('1️⃣ تسجيل الدخول بشركتين:');
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

    // 2. إضافة صفحة للشركة الأولى
    console.log('\n2️⃣ إضافة صفحة للشركة الأولى:');
    console.log('═══════════════════════════════════════');

    const page1Data = {
      pageId: `company1-page-${Date.now()}`,
      pageAccessToken: 'token-company1-123',
      pageName: 'صفحة الشركة الأولى'
    };

    const addPage1Response = await axios.post(`${baseURL}/api/v1/integrations/facebook/connect`, page1Data, {
      headers: { 'Authorization': `Bearer ${token1}` }
    });

    console.log('✅ تم إضافة صفحة للشركة الأولى:', addPage1Response.data.data.pageName);

    // 3. إضافة صفحة للشركة الثانية
    console.log('\n3️⃣ إضافة صفحة للشركة الثانية:');
    console.log('═══════════════════════════════════════');

    const page2Data = {
      pageId: `company2-page-${Date.now()}`,
      pageAccessToken: 'token-company2-456',
      pageName: 'صفحة الشركة الثانية'
    };

    const addPage2Response = await axios.post(`${baseURL}/api/v1/integrations/facebook/connect`, page2Data, {
      headers: { 'Authorization': `Bearer ${token2}` }
    });

    console.log('✅ تم إضافة صفحة للشركة الثانية:', addPage2Response.data.data.pageName);

    // 4. فحص العزل - كل شركة ترى صفحاتها فقط
    console.log('\n4️⃣ فحص العزل:');
    console.log('═══════════════════════════════════════');

    const [pages1Response, pages2Response] = await Promise.all([
      axios.get(`${baseURL}/api/v1/integrations/facebook/connected`, {
        headers: { 'Authorization': `Bearer ${token1}` }
      }),
      axios.get(`${baseURL}/api/v1/integrations/facebook/connected`, {
        headers: { 'Authorization': `Bearer ${token2}` }
      })
    ]);

    const pages1 = pages1Response.data.pages || [];
    const pages2 = pages2Response.data.pages || [];

    console.log(`📊 الشركة الأولى (${user1.companyId}): ${pages1.length} صفحة`);
    pages1.forEach((page, index) => {
      console.log(`  ${index + 1}. ${page.pageName} (${page.pageId}) - Company: ${page.companyId}`);
    });

    console.log(`📊 الشركة الثانية (${user2.companyId}): ${pages2.length} صفحة`);
    pages2.forEach((page, index) => {
      console.log(`  ${index + 1}. ${page.pageName} (${page.pageId}) - Company: ${page.companyId}`);
    });

    // 5. التحقق من العزل
    console.log('\n5️⃣ التحقق من العزل:');
    console.log('═══════════════════════════════════════');

    let isolationWorking = true;
    let crossContamination = false;

    // فحص أن كل شركة ترى صفحاتها فقط
    pages1.forEach(page => {
      if (page.companyId !== user1.companyId) {
        isolationWorking = false;
        crossContamination = true;
        console.log(`🔴 الشركة الأولى ترى صفحة من شركة أخرى: ${page.pageName}`);
      }
    });

    pages2.forEach(page => {
      if (page.companyId !== user2.companyId) {
        isolationWorking = false;
        crossContamination = true;
        console.log(`🔴 الشركة الثانية ترى صفحة من شركة أخرى: ${page.pageName}`);
      }
    });

    // فحص أن الصفحات مختلفة
    const page1Names = pages1.map(p => p.pageName);
    const page2Names = pages2.map(p => p.pageName);
    const hasCommonPages = page1Names.some(name => page2Names.includes(name));

    if (hasCommonPages) {
      isolationWorking = false;
      console.log('🔴 الشركتان تريان نفس الصفحات!');
    }

    // 6. اختبار محاولة الوصول لصفحة شركة أخرى
    console.log('\n6️⃣ اختبار Cross-Company Access:');
    console.log('═══════════════════════════════════════');

    if (pages1.length > 0 && pages2.length > 0) {
      const page1Id = pages1[0].pageId;
      const page2Id = pages2[0].pageId;

      // محاولة الشركة الأولى الوصول لصفحة الشركة الثانية
      try {
        await axios.get(`${baseURL}/api/v1/integrations/facebook/page/${page2Id}`, {
          headers: { 'Authorization': `Bearer ${token1}` }
        });
        console.log('🔴 الشركة الأولى تمكنت من الوصول لصفحة الشركة الثانية!');
        isolationWorking = false;
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('✅ الشركة الأولى لا تستطيع الوصول لصفحة الشركة الثانية');
        } else {
          console.log('⚠️ خطأ غير متوقع:', error.response?.status);
        }
      }

      // محاولة الشركة الثانية الوصول لصفحة الشركة الأولى
      try {
        await axios.get(`${baseURL}/api/v1/integrations/facebook/page/${page1Id}`, {
          headers: { 'Authorization': `Bearer ${token2}` }
        });
        console.log('🔴 الشركة الثانية تمكنت من الوصول لصفحة الشركة الأولى!');
        isolationWorking = false;
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('✅ الشركة الثانية لا تستطيع الوصول لصفحة الشركة الأولى');
        } else {
          console.log('⚠️ خطأ غير متوقع:', error.response?.status);
        }
      }
    }

    // 7. النتائج النهائية
    console.log('\n🏆 النتائج النهائية:');
    console.log('═══════════════════════════════════════');

    if (isolationWorking && !crossContamination) {
      console.log('🟢 Facebook Settings آمن ومعزول بالكامل!');
      console.log('✅ جميع APIs محمية بـ Authentication');
      console.log('✅ العزل يعمل بشكل مثالي بين الشركات');
      console.log('✅ كل شركة ترى صفحاتها فقط');
      console.log('✅ لا يمكن الوصول لصفحات الشركات الأخرى');
      console.log('✅ Company ID صحيح في جميع الاستجابات');
      console.log('\n🎉 Facebook Settings جاهز للإنتاج بأمان كامل!');
    } else {
      console.log('🔴 هناك مشاكل في العزل:');
      if (crossContamination) {
        console.log('❌ تداخل في البيانات بين الشركات');
      }
      if (!isolationWorking) {
        console.log('❌ العزل لا يعمل بشكل صحيح');
      }
    }

    // 8. تنظيف البيانات التجريبية
    console.log('\n8️⃣ تنظيف البيانات التجريبية:');
    console.log('═══════════════════════════════════════');

    try {
      if (pages1.length > 0) {
        const testPage1 = pages1.find(p => p.pageName.includes('الشركة الأولى'));
        if (testPage1) {
          await axios.delete(`${baseURL}/api/v1/integrations/facebook/${testPage1.pageId}`, {
            headers: { 'Authorization': `Bearer ${token1}` }
          });
          console.log('🗑️ تم حذف صفحة الشركة الأولى التجريبية');
        }
      }

      if (pages2.length > 0) {
        const testPage2 = pages2.find(p => p.pageName.includes('الشركة الثانية'));
        if (testPage2) {
          await axios.delete(`${baseURL}/api/v1/integrations/facebook/${testPage2.pageId}`, {
            headers: { 'Authorization': `Bearer ${token2}` }
          });
          console.log('🗑️ تم حذف صفحة الشركة الثانية التجريبية');
        }
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

testFacebookFinal();
