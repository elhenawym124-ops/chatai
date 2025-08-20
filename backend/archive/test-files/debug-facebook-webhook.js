const axios = require('axios');
const mysql = require('mysql2/promise');

async function debugFacebookWebhook() {
  console.log('🔍 فحص إعدادات Facebook Webhook...');
  
  const config = {
    host: '92.113.22.70',
    port: 3306,
    user: 'u339372869_test',
    password: '0165676135Aa@A',
    database: 'u339372869_test',
    connectTimeout: 10000
  };
  
  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ تم الاتصال بقاعدة البيانات');
    
    // فحص الصفحة المستهدفة
    console.log('\n🎯 فحص الصفحة المستهدفة 250528358137901:');
    const [targetPage] = await connection.execute(`
      SELECT * FROM facebook_pages WHERE pageId = ?
    `, ['250528358137901']);
    
    if (targetPage.length > 0) {
      const page = targetPage[0];
      console.log('✅ الصفحة موجودة:');
      console.log(`   📝 اسم الصفحة: ${page.pageName}`);
      console.log(`   📊 الحالة: ${page.status}`);
      console.log(`   🔗 تاريخ الربط: ${page.connectedAt}`);
      console.log(`   🔑 Access Token: ${page.pageAccessToken.substring(0, 50)}...`);
      
      // اختبار صحة الـ Access Token
      console.log('\n🔍 اختبار صحة Access Token...');
      try {
        const response = await axios.get(`https://graph.facebook.com/v18.0/${page.pageId}`, {
          params: {
            access_token: page.pageAccessToken,
            fields: 'id,name,category'
          }
        });
        
        console.log('✅ Access Token صحيح:');
        console.log(`   📝 اسم الصفحة: ${response.data.name}`);
        console.log(`   🆔 Page ID: ${response.data.id}`);
        console.log(`   📂 الفئة: ${response.data.category}`);
        
        // فحص إعدادات الـ webhook للصفحة
        console.log('\n🔍 فحص إعدادات Webhook للصفحة...');
        try {
          const webhookResponse = await axios.get(`https://graph.facebook.com/v18.0/${page.pageId}/subscribed_apps`, {
            params: {
              access_token: page.pageAccessToken
            }
          });
          
          console.log('📡 التطبيقات المشتركة في الـ webhook:');
          console.log(JSON.stringify(webhookResponse.data, null, 2));
          
        } catch (webhookError) {
          console.log('❌ خطأ في فحص إعدادات الـ webhook:');
          console.log(webhookError.response?.data || webhookError.message);
        }
        
      } catch (tokenError) {
        console.log('❌ Access Token غير صحيح أو منتهي الصلاحية:');
        console.log(tokenError.response?.data || tokenError.message);
      }
      
    } else {
      console.log('❌ الصفحة غير موجودة في قاعدة البيانات');
    }
    
    // فحص الصفحات التي ترسل webhook حالياً
    console.log('\n📨 فحص الصفحات التي ترسل webhook حالياً:');
    const problematicPages = ['114497159957743', '260345600493273'];
    
    for (const pageId of problematicPages) {
      console.log(`\n🔍 فحص الصفحة ${pageId}:`);
      
      // البحث في قاعدة البيانات
      const [dbPage] = await connection.execute(`
        SELECT * FROM facebook_pages WHERE pageId = ?
      `, [pageId]);
      
      if (dbPage.length > 0) {
        console.log('✅ موجودة في قاعدة البيانات:');
        console.log(`   📝 اسم الصفحة: ${dbPage[0].pageName}`);
        console.log(`   📊 الحالة: ${dbPage[0].status}`);
      } else {
        console.log('❌ غير موجودة في قاعدة البيانات');
        
        // محاولة الحصول على معلومات الصفحة من Facebook
        console.log('🔍 محاولة الحصول على معلومات من Facebook...');
        
        // استخدام access token من الصفحة المستهدفة للاختبار
        if (targetPage.length > 0) {
          try {
            const response = await axios.get(`https://graph.facebook.com/v18.0/${pageId}`, {
              params: {
                access_token: targetPage[0].pageAccessToken,
                fields: 'id,name,category'
              }
            });
            
            console.log('✅ معلومات الصفحة من Facebook:');
            console.log(`   📝 اسم الصفحة: ${response.data.name}`);
            console.log(`   🆔 Page ID: ${response.data.id}`);
            console.log(`   📂 الفئة: ${response.data.category}`);
            
          } catch (error) {
            console.log('❌ لا يمكن الوصول للصفحة:');
            console.log(error.response?.data?.error?.message || error.message);
          }
        }
      }
    }
    
    // فحص إعدادات الـ webhook العامة
    console.log('\n🔧 توصيات الحل:');
    console.log('1. تحقق من إعدادات Facebook App في Developer Console');
    console.log('2. تأكد من أن Webhook URL يشير للصفحة الصحيحة');
    console.log('3. قم بإعادة ربط الصفحة 250528358137901');
    console.log('4. احذف الصفحات غير المرغوب فيها من الـ webhook');
    
    await connection.end();
    console.log('\n✅ تم إنهاء الفحص');
    
  } catch (error) {
    console.error('❌ خطأ في الفحص:', error);
  }
}

debugFacebookWebhook();
