/**
 * فحص صلاحية Access Tokens المحفوظة في قاعدة البيانات
 */

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

async function checkTokenFromDB(pageId, pageName, token) {
  if (!token) {
    console.log(`❌ [${pageName}] Token غير موجود في قاعدة البيانات`);
    return false;
  }

  try {
    console.log(`🔍 [${pageName}] فحص صلاحية Token من قاعدة البيانات...`);
    console.log(`📝 [${pageName}] Page ID: ${pageId}`);
    console.log(`📝 [${pageName}] Token: ${token.substring(0, 20)}...`);

    // فحص صلاحية Token عبر Graph API
    const response = await axios.get(`https://graph.facebook.com/v18.0/me`, {
      params: {
        access_token: token
      }
    });

    console.log(`✅ [${pageName}] Token صالح!`);
    console.log(`📄 [${pageName}] Page Info:`, {
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

    console.log(`🔑 [${pageName}] Permissions:`, permissionsResponse.data.data.map(p => `${p.permission}: ${p.status}`));

    // فحص Webhook subscriptions
    try {
      const subscriptionsResponse = await axios.get(`https://graph.facebook.com/v18.0/${response.data.id}/subscribed_apps`, {
        params: {
          access_token: token
        }
      });
      console.log(`📡 [${pageName}] Webhook Subscriptions:`, subscriptionsResponse.data.data);
    } catch (subError) {
      console.log(`⚠️ [${pageName}] لا يمكن فحص Webhook subscriptions:`, subError.response?.data?.error?.message);
    }

    return true;

  } catch (error) {
    console.log(`❌ [${pageName}] Token غير صالح!`);
    console.log(`📊 [${pageName}] Error:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.error?.message,
      code: error.response?.data?.error?.code,
      subcode: error.response?.data?.error?.error_subcode,
      type: error.response?.data?.error?.type
    });

    // فحص نوع الخطأ
    if (error.response?.data?.error?.code === 190) {
      console.log(`🚨 [${pageName}] Token منتهي الصلاحية أو غير صالح!`);
    } else if (error.response?.data?.error?.code === 100) {
      console.log(`🚨 [${pageName}] Token لا يملك الصلاحيات المطلوبة!`);
    } else if (error.response?.data?.error?.type === 'OAuthException') {
      console.log(`🚨 [${pageName}] مشكلة في OAuth - قد يحتاج Token جديد!`);
    }

    return false;
  }
}

async function checkAllDBTokens() {
  console.log('🚀 فحص صلاحية جميع Access Tokens من قاعدة البيانات...');
  console.log('='.repeat(70));

  try {
    // جلب جميع الصفحات من قاعدة البيانات
    const pages = await prisma.facebookPage.findMany({
      select: {
        pageId: true,
        pageName: true,
        pageAccessToken: true,
        status: true,
        connectedAt: true
      }
    });

    if (pages.length === 0) {
      console.log('❌ لا توجد صفحات محفوظة في قاعدة البيانات!');
      return;
    }

    console.log(`📊 تم العثور على ${pages.length} صفحة في قاعدة البيانات:`);
    pages.forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.pageName} (${page.pageId}) - Status: ${page.status}`);
    });

    const results = {};

    for (const page of pages) {
      console.log('\n' + '-'.repeat(50));
      results[page.pageName] = await checkTokenFromDB(page.pageId, page.pageName, page.pageAccessToken);
      await new Promise(resolve => setTimeout(resolve, 1000)); // انتظار ثانية بين الطلبات
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 ملخص النتائج:');
    
    for (const [pageName, isValid] of Object.entries(results)) {
      const status = isValid ? '✅ صالح' : '❌ غير صالح';
      console.log(`   ${pageName}: ${status}`);
    }

    const validTokens = Object.values(results).filter(Boolean).length;
    const totalTokens = Object.keys(results).length;
    
    console.log(`\n🎯 النتيجة: ${validTokens}/${totalTokens} tokens صالحة`);
    
    if (validTokens === 0) {
      console.log('\n🚨 جميع الـ tokens غير صالحة! يجب تجديدها من Facebook Developer Console.');
      console.log('📋 خطوات التجديد:');
      console.log('   1. اذهب إلى Facebook Developer Console');
      console.log('   2. اختر التطبيق الخاص بك');
      console.log('   3. اذهب إلى Tools > Graph API Explorer');
      console.log('   4. اختر الصفحة وولد token جديد');
      console.log('   5. احفظ الـ token الجديد في قاعدة البيانات');
    } else if (validTokens < totalTokens) {
      console.log('\n⚠️ بعض الـ tokens غير صالحة. يجب تجديد الـ tokens غير الصالحة.');
    } else {
      console.log('\n🎉 جميع الـ tokens صالحة! المشكلة ليست في الـ tokens.');
      console.log('🔍 المشكلة قد تكون في إعدادات Webhook أو الصلاحيات.');
    }

  } catch (error) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الفحص
checkAllDBTokens().catch(console.error);
