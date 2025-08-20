const axios = require('axios');

async function testCategoriesIsolation() {
  console.log('🔍 اختبار العزل في صفحة Categories...\n');

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

    // 2. فحص Categories للشركتين
    console.log('\n2️⃣ فحص Categories للشركتين:');
    console.log('═══════════════════════════════════════');

    const [categories1Response, categories2Response] = await Promise.all([
      axios.get(`${baseURL}/api/v1/products/categories`, {
        headers: { 'Authorization': `Bearer ${token1}` }
      }),
      axios.get(`${baseURL}/api/v1/products/categories`, {
        headers: { 'Authorization': `Bearer ${token2}` }
      })
    ]);

    console.log('📂 فئات الشركة 1:', {
      success: categories1Response.data.success,
      companyId: categories1Response.data.companyId,
      categoriesCount: categories1Response.data.data?.length || 0,
      categories: categories1Response.data.data?.map(c => ({ id: c.id, name: c.name, companyId: c.companyId })) || []
    });

    console.log('📂 فئات الشركة 2:', {
      success: categories2Response.data.success,
      companyId: categories2Response.data.companyId,
      categoriesCount: categories2Response.data.data?.length || 0,
      categories: categories2Response.data.data?.map(c => ({ id: c.id, name: c.name, companyId: c.companyId })) || []
    });

    // 3. إضافة فئات تجريبية لكل شركة
    console.log('\n3️⃣ إضافة فئات تجريبية:');
    console.log('═══════════════════════════════════════');

    const testCategory1 = {
      name: `فئة اختبار العزل - شركة 1 - ${Date.now()}`,
      description: 'فئة لاختبار العزل بين الشركات'
    };

    const testCategory2 = {
      name: `فئة اختبار العزل - شركة 2 - ${Date.now()}`,
      description: 'فئة لاختبار العزل بين الشركات'
    };

    const [addResponse1, addResponse2] = await Promise.all([
      axios.post(`${baseURL}/api/v1/products/categories`, testCategory1, {
        headers: { 'Authorization': `Bearer ${token1}` }
      }),
      axios.post(`${baseURL}/api/v1/products/categories`, testCategory2, {
        headers: { 'Authorization': `Bearer ${token2}` }
      })
    ]);

    console.log('✅ إضافة فئة الشركة 1:', {
      success: addResponse1.data.success,
      companyId: addResponse1.data.companyId,
      categoryId: addResponse1.data.data?.id,
      categoryName: addResponse1.data.data?.name
    });

    console.log('✅ إضافة فئة الشركة 2:', {
      success: addResponse2.data.success,
      companyId: addResponse2.data.companyId,
      categoryId: addResponse2.data.data?.id,
      categoryName: addResponse2.data.data?.name
    });

    // 4. فحص العزل بعد الإضافة
    console.log('\n4️⃣ فحص العزل بعد إضافة الفئات:');
    console.log('═══════════════════════════════════════');

    const [finalCategories1, finalCategories2] = await Promise.all([
      axios.get(`${baseURL}/api/v1/products/categories`, {
        headers: { 'Authorization': `Bearer ${token1}` }
      }),
      axios.get(`${baseURL}/api/v1/products/categories`, {
        headers: { 'Authorization': `Bearer ${token2}` }
      })
    ]);

    const company1Categories = finalCategories1.data.data || [];
    const company2Categories = finalCategories2.data.data || [];

    console.log(`📂 الشركة 1 النهائية: ${company1Categories.length} فئة`);
    company1Categories.forEach((category, index) => {
      console.log(`  ${index + 1}. ${category.name} (${category.id}) - Company: ${category.companyId}`);
    });

    console.log(`📂 الشركة 2 النهائية: ${company2Categories.length} فئة`);
    company2Categories.forEach((category, index) => {
      console.log(`  ${index + 1}. ${category.name} (${category.id}) - Company: ${category.companyId}`);
    });

    // 5. اختبار محاولة الوصول لفئة شركة أخرى
    console.log('\n5️⃣ اختبار Cross-Company Access:');
    console.log('═══════════════════════════════════════');

    if (company1Categories.length > 0 && company2Categories.length > 0) {
      const category1Id = company1Categories[0].id;
      const category2Id = company2Categories[0].id;

      try {
        // محاولة الشركة 1 الوصول لفئة الشركة 2
        const crossAccessResponse = await axios.get(`${baseURL}/api/v1/products/categories/${category2Id}`, {
          headers: { 'Authorization': `Bearer ${token1}` }
        });
        console.log('🔴 خطر أمني: الشركة 1 تمكنت من الوصول لفئة الشركة 2!');
      } catch (error) {
        if (error.response?.status === 404 || error.response?.status === 403) {
          console.log('✅ Cross-Company Access محظور بشكل صحيح');
        } else {
          console.log('⚠️ خطأ غير متوقع:', error.response?.status);
        }
      }
    }

    // 6. فحص العزل النهائي
    console.log('\n6️⃣ تقييم العزل النهائي:');
    console.log('═══════════════════════════════════════');

    let isolationPerfect = true;
    let issues = [];

    // فحص أن كل شركة ترى فئاتها فقط
    company1Categories.forEach(category => {
      if (category.companyId !== user1.companyId) {
        isolationPerfect = false;
        issues.push(`الشركة 1 ترى فئة من شركة أخرى: ${category.name}`);
      }
    });

    company2Categories.forEach(category => {
      if (category.companyId !== user2.companyId) {
        isolationPerfect = false;
        issues.push(`الشركة 2 ترى فئة من شركة أخرى: ${category.name}`);
      }
    });

    // فحص أن الفئات مختلفة
    const category1Names = company1Categories.map(c => c.name);
    const category2Names = company2Categories.map(c => c.name);
    const hasCommonCategories = category1Names.some(name => category2Names.includes(name));

    if (hasCommonCategories) {
      isolationPerfect = false;
      issues.push('الشركتان تريان نفس الفئات');
    }

    // فحص Company ID في الاستجابات
    if (finalCategories1.data.companyId !== user1.companyId) {
      isolationPerfect = false;
      issues.push('Company ID خطأ في استجابة الشركة 1');
    }

    if (finalCategories2.data.companyId !== user2.companyId) {
      isolationPerfect = false;
      issues.push('Company ID خطأ في استجابة الشركة 2');
    }

    // النتيجة النهائية
    if (isolationPerfect) {
      console.log('🟢 العزل مطبق بالكامل 100%!');
      console.log('✅ كل شركة ترى فئاتها فقط');
      console.log('✅ Company ID صحيح في جميع الاستجابات');
      console.log('✅ لا يوجد تداخل في البيانات');
      console.log('✅ Categories آمن للإنتاج');
    } else {
      console.log('🔴 مشاكل في العزل:');
      issues.forEach(issue => console.log(`❌ ${issue}`));
    }

    // تنظيف البيانات التجريبية
    console.log('\n7️⃣ تنظيف البيانات التجريبية:');
    console.log('═══════════════════════════════════════');

    try {
      const testCategory1ToDelete = company1Categories.find(c => c.name.includes('اختبار العزل'));
      const testCategory2ToDelete = company2Categories.find(c => c.name.includes('اختبار العزل'));

      if (testCategory1ToDelete) {
        await axios.delete(`${baseURL}/api/v1/products/categories/${testCategory1ToDelete.id}`, {
          headers: { 'Authorization': `Bearer ${token1}` }
        });
        console.log('🗑️ تم حذف فئة الشركة 1 التجريبية');
      }

      if (testCategory2ToDelete) {
        await axios.delete(`${baseURL}/api/v1/products/categories/${testCategory2ToDelete.id}`, {
          headers: { 'Authorization': `Bearer ${token2}` }
        });
        console.log('🗑️ تم حذف فئة الشركة 2 التجريبية');
      }
    } catch (error) {
      console.log('⚠️ خطأ في تنظيف البيانات:', error.response?.status);
    }

  } catch (error) {
    console.error('❌ خطأ عام في الاختبار:', error.message);
    console.error('❌ Stack trace:', error.stack);
    if (error.response) {
      console.log('📥 تفاصيل الخطأ:', error.response.data);
      console.log('📥 Status:', error.response.status);
    }
    if (error.code) {
      console.log('📥 Error code:', error.code);
    }
  }
}

testCategoriesIsolation();
