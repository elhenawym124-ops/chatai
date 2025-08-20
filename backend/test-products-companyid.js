const axios = require('axios');

async function testProductsCompanyId() {
  console.log('🔍 اختبار Company ID في APIs المنتجات...\n');

  const baseURL = 'http://localhost:3001';
  
  try {
    // تسجيل الدخول
    const loginResponse = await axios.post(`${baseURL}/api/v1/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });

    const token = loginResponse.data.data.token;
    const expectedCompanyId = loginResponse.data.data.user.companyId;

    console.log('✅ تسجيل الدخول نجح');
    console.log('🏢 Company ID المتوقع:', expectedCompanyId);

    // اختبار GET /api/v1/products
    const productsResponse = await axios.get(`${baseURL}/api/v1/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('\n📦 استجابة GET /api/v1/products:');
    console.log('✅ Success:', productsResponse.data.success);
    console.log('🏢 Company ID في الاستجابة:', productsResponse.data.companyId);
    console.log('📊 عدد المنتجات:', productsResponse.data.data?.length || 0);
    console.log('📋 Message:', productsResponse.data.message);

    // فحص Company ID
    if (productsResponse.data.companyId === expectedCompanyId) {
      console.log('✅ Company ID صحيح في استجابة المنتجات!');
    } else {
      console.log('❌ Company ID خطأ في استجابة المنتجات!');
      console.log('   المتوقع:', expectedCompanyId);
      console.log('   الفعلي:', productsResponse.data.companyId);
    }

    // اختبار GET /api/v1/products/categories
    try {
      const categoriesResponse = await axios.get(`${baseURL}/api/v1/products/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('\n📂 استجابة GET /api/v1/products/categories:');
      console.log('✅ Success:', categoriesResponse.data.success);
      console.log('🏢 Company ID في الاستجابة:', categoriesResponse.data.companyId);
      console.log('📊 عدد الفئات:', categoriesResponse.data.data?.length || 0);

    } catch (error) {
      console.log('\n❌ خطأ في Categories:', error.response?.status, error.response?.data?.message);
    }

    // اختبار POST /api/v1/products (إنشاء منتج تجريبي)
    try {
      const newProduct = {
        name: 'منتج اختبار العزل',
        description: 'منتج لاختبار العزل بين الشركات',
        price: 100,
        categoryId: null
      };

      const createResponse = await axios.post(`${baseURL}/api/v1/products`, newProduct, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('\n➕ استجابة POST /api/v1/products:');
      console.log('✅ Success:', createResponse.data.success);
      console.log('🏢 Company ID في الاستجابة:', createResponse.data.companyId);
      console.log('📦 Product ID:', createResponse.data.data?.id);

      // حذف المنتج التجريبي
      if (createResponse.data.data?.id) {
        try {
          await axios.delete(`${baseURL}/api/v1/products/${createResponse.data.data.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          console.log('🗑️ تم حذف المنتج التجريبي');
        } catch (deleteError) {
          console.log('⚠️ خطأ في حذف المنتج التجريبي');
        }
      }

    } catch (error) {
      console.log('\n❌ خطأ في إنشاء المنتج:', error.response?.status, error.response?.data?.message);
    }

  } catch (error) {
    console.error('❌ خطأ عام في الاختبار:', error.message);
    console.error('❌ Stack trace:', error.stack);
    if (error.response) {
      console.log('📥 تفاصيل الخطأ:', error.response.data);
    }
  }
}

testProductsCompanyId();
