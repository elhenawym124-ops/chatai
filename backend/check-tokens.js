/**
 * فحص صلاحية Access Tokens لجميع الصفحات
 */

const axios = require('axios');

// Access Tokens من ملف .env
const tokens = {
  'Swan-store': process.env.SWAN_STORE_PAGE_ACCESS_TOKEN,
  'Simple A42': process.env.PAGE_ACCESS_TOKEN,
  'Default': process.env.DEFAULT_PAGE_TOKEN
};

async function checkTokenValidity(tokenName, token) {
  if (!token) {
    console.log(`❌ [${tokenName}] Token غير موجود في .env`);
    return false;
  }

  try {
    console.log(`🔍 [${tokenName}] فحص صلاحية Token...`);
    console.log(`📝 [${tokenName}] Token: ${token.substring(0, 20)}...`);

    // فحص صلاحية Token عبر Graph API
    const response = await axios.get(`https://graph.facebook.com/v18.0/me`, {
      params: {
        access_token: token
      }
    });

    console.log(`✅ [${tokenName}] Token صالح!`);
    console.log(`📄 [${tokenName}] Page Info:`, {
      id: response.data.id,
      name: response.data.name,
      category: response.data.category
    });

    // فحص صلاحيات Token
    const permissionsResponse = await axios.get(`https://graph.facebook.com/v18.0/me/permissions`, {
      params: {
        access_token: token
      }
    });

    console.log(`🔑 [${tokenName}] Permissions:`, permissionsResponse.data.data);

    return true;

  } catch (error) {
    console.log(`❌ [${tokenName}] Token غير صالح!`);
    console.log(`📊 [${tokenName}] Error:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.error?.message,
      code: error.response?.data?.error?.code,
      subcode: error.response?.data?.error?.error_subcode
    });

    // فحص نوع الخطأ
    if (error.response?.data?.error?.code === 190) {
      console.log(`🚨 [${tokenName}] Token منتهي الصلاحية أو غير صالح!`);
    } else if (error.response?.data?.error?.code === 100) {
      console.log(`🚨 [${tokenName}] Token لا يملك الصلاحيات المطلوبة!`);
    }

    return false;
  }
}

async function checkAllTokens() {
  console.log('🚀 فحص صلاحية جميع Access Tokens...');
  console.log('='.repeat(60));

  const results = {};

  for (const [tokenName, token] of Object.entries(tokens)) {
    console.log('\n' + '-'.repeat(40));
    results[tokenName] = await checkTokenValidity(tokenName, token);
    await new Promise(resolve => setTimeout(resolve, 1000)); // انتظار ثانية بين الطلبات
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 ملخص النتائج:');
  
  for (const [tokenName, isValid] of Object.entries(results)) {
    const status = isValid ? '✅ صالح' : '❌ غير صالح';
    console.log(`   ${tokenName}: ${status}`);
  }

  const validTokens = Object.values(results).filter(Boolean).length;
  const totalTokens = Object.keys(results).length;
  
  console.log(`\n🎯 النتيجة: ${validTokens}/${totalTokens} tokens صالحة`);
  
  if (validTokens === 0) {
    console.log('\n🚨 جميع الـ tokens غير صالحة! يجب تجديدها.');
  } else if (validTokens < totalTokens) {
    console.log('\n⚠️ بعض الـ tokens غير صالحة. يجب تجديد الـ tokens غير الصالحة.');
  } else {
    console.log('\n🎉 جميع الـ tokens صالحة!');
  }
}

// تشغيل الفحص
checkAllTokens().catch(console.error);
