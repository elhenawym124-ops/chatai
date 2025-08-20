/**
 * فحص اشتراكات الـ webhook
 */

const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testWebhookSubscription() {
  console.log('🔍 فحص اشتراكات الـ webhook...');
  console.log('='.repeat(50));

  try {
    // 1. جلب معلومات صفحة Swan-store
    const swanPage = await prisma.facebookPage.findFirst({
      where: { pageId: '675323792321557' }
    });

    if (!swanPage) {
      console.log('❌ لم يتم العثور على صفحة Swan-store');
      return;
    }

    console.log(`✅ صفحة Swan-store موجودة:`);
    console.log(`   اسم الصفحة: ${swanPage.pageName}`);
    console.log(`   معرف الصفحة: ${swanPage.pageId}`);
    console.log(`   Token: ${swanPage.pageAccessToken ? 'موجود' : 'مفقود'}`);

    // 2. فحص اشتراكات الـ webhook للصفحة
    console.log('\n🔍 فحص اشتراكات الـ webhook...');
    
    const webhookUrl = `https://graph.facebook.com/v18.0/${swanPage.pageId}/subscribed_apps`;
    
    try {
      const response = await axios.get(webhookUrl, {
        params: {
          access_token: swanPage.pageAccessToken
        }
      });

      console.log('📊 اشتراكات الـ webhook:');
      console.log(JSON.stringify(response.data, null, 2));

      if (response.data.data && response.data.data.length > 0) {
        const subscription = response.data.data[0];
        console.log(`\n✅ التطبيق مشترك:`);
        console.log(`   معرف التطبيق: ${subscription.id}`);
        console.log(`   الاشتراكات: ${subscription.subscribed_fields ? subscription.subscribed_fields.join(', ') : 'غير محددة'}`);
        
        // فحص إذا كان مشترك في messages
        if (subscription.subscribed_fields && subscription.subscribed_fields.includes('messages')) {
          console.log('   ✅ مشترك في الرسائل (messages)');
        } else {
          console.log('   ❌ غير مشترك في الرسائل (messages) - هذه هي المشكلة!');
        }
        
        // فحص إذا كان مشترك في message_reads
        if (subscription.subscribed_fields && subscription.subscribed_fields.includes('message_reads')) {
          console.log('   ✅ مشترك في قراءة الرسائل (message_reads)');
        }
      } else {
        console.log('❌ لا توجد اشتراكات webhook');
      }

    } catch (error) {
      console.error('❌ خطأ في فحص اشتراكات الـ webhook:', error.response?.data || error.message);
    }

    // 3. محاولة الاشتراك في الرسائل
    console.log('\n🔧 محاولة الاشتراك في الرسائل...');
    
    const subscribeUrl = `https://graph.facebook.com/v18.0/${swanPage.pageId}/subscribed_apps`;
    
    try {
      const subscribeResponse = await axios.post(subscribeUrl, {
        subscribed_fields: 'messages,messaging_postbacks,message_reads,message_deliveries'
      }, {
        params: {
          access_token: swanPage.pageAccessToken
        }
      });

      console.log('✅ تم الاشتراك في الرسائل بنجاح!');
      console.log('📊 النتيجة:', subscribeResponse.data);

    } catch (error) {
      console.error('❌ خطأ في الاشتراك:', error.response?.data || error.message);
    }

    // 4. فحص مرة أخرى بعد الاشتراك
    console.log('\n🔍 فحص الاشتراكات مرة أخرى...');
    
    try {
      const finalResponse = await axios.get(webhookUrl, {
        params: {
          access_token: swanPage.pageAccessToken
        }
      });

      console.log('📊 الاشتراكات بعد التحديث:');
      if (finalResponse.data.data && finalResponse.data.data.length > 0) {
        const subscription = finalResponse.data.data[0];
        console.log(`   الاشتراكات: ${subscription.subscribed_fields ? subscription.subscribed_fields.join(', ') : 'غير محددة'}`);
        
        if (subscription.subscribed_fields && subscription.subscribed_fields.includes('messages')) {
          console.log('   ✅ الآن مشترك في الرسائل!');
          console.log('   🎉 يمكنك الآن إرسال رسالة وستحصل على رد!');
        } else {
          console.log('   ❌ لا يزال غير مشترك في الرسائل');
        }
      }

    } catch (error) {
      console.error('❌ خطأ في الفحص النهائي:', error.response?.data || error.message);
    }

    // 5. اختبار إرسال رسالة تجريبية
    console.log('\n🧪 إرسال رسالة تجريبية للاختبار...');
    
    const testWebhook = {
      "object": "page",
      "entry": [
        {
          "time": Date.now(),
          "id": swanPage.pageId,
          "messaging": [
            {
              "sender": {
                "id": "TEST_USER_123"
              },
              "recipient": {
                "id": swanPage.pageId
              },
              "timestamp": Date.now(),
              "message": {
                "mid": "test_message_" + Date.now(),
                "text": "السلام عليكم - رسالة اختبار"
              }
            }
          ]
        }
      ]
    };

    try {
      const testResponse = await axios.post('http://localhost:3001/webhook', testWebhook, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'facebookexternalua'
        }
      });

      console.log('✅ تم إرسال الرسالة التجريبية بنجاح');
      console.log('📊 الاستجابة:', testResponse.data);
      
      // انتظار قليل لمعالجة الرسالة
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('🔍 تحقق من اللوج لرؤية معالجة الرسالة...');

    } catch (error) {
      console.error('❌ خطأ في إرسال الرسالة التجريبية:', error.message);
    }

  } catch (error) {
    console.error('❌ خطأ عام:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الفحص
testWebhookSubscription().catch(console.error);
