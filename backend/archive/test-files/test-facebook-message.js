const axios = require('axios');

async function testFacebookMessage() {
  console.log('🧪 اختبار إرسال رسالة Facebook...');
  
  // محاكاة webhook من Facebook للصفحة المستهدفة
  const testWebhookData = {
    object: 'page',
    entry: [
      {
        id: '250528358137901', // الصفحة المستهدفة
        time: Date.now(),
        messaging: [
          {
            sender: {
              id: 'test_user_250528358137901'
            },
            recipient: {
              id: '250528358137901'
            },
            timestamp: Date.now(),
            message: {
              mid: `test_message_${Date.now()}`,
              text: 'مرحباً! هذه رسالة اختبار من الصفحة المستهدفة 250528358137901'
            }
          }
        ]
      }
    ]
  };
  
  try {
    console.log('📨 إرسال webhook تجريبي...');
    console.log('البيانات المرسلة:', JSON.stringify(testWebhookData, null, 2));
    
    const response = await axios.post('http://localhost:3001/webhook', testWebhookData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'facebookexternalua'
      }
    });
    
    console.log('✅ تم إرسال الـ webhook بنجاح');
    console.log('📊 استجابة الخادم:', response.status, response.statusText);
    
    // انتظار قليل ثم فحص قاعدة البيانات
    console.log('\n⏳ انتظار 2 ثانية ثم فحص قاعدة البيانات...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // فحص المحادثات الجديدة
    const mysql = require('mysql2/promise');
    const config = {
      host: '92.113.22.70',
      port: 3306,
      user: 'u339372869_test',
      password: '0165676135Aa@A',
      database: 'u339372869_test',
      connectTimeout: 10000
    };
    
    const connection = await mysql.createConnection(config);
    
    // فحص آخر المحادثات
    const [conversations] = await connection.execute(`
      SELECT c.*, cust.firstName, cust.lastName, cust.facebookId,
             (SELECT COUNT(*) FROM messages WHERE conversationId = c.id) as messageCount
      FROM conversations c 
      LEFT JOIN customers cust ON c.customerId = cust.id 
      WHERE c.channel = 'FACEBOOK'
      ORDER BY c.createdAt DESC
      LIMIT 5
    `);
    
    console.log('\n💬 آخر المحادثات من Facebook:');
    conversations.forEach((conv, index) => {
      console.log(`\n💬 محادثة ${index + 1}:`);
      console.log(`   🆔 ID: ${conv.id}`);
      console.log(`   👤 العميل: ${conv.firstName} ${conv.lastName}`);
      console.log(`   📱 Facebook ID: ${conv.facebookId}`);
      console.log(`   📊 الحالة: ${conv.status}`);
      console.log(`   📨 عدد الرسائل: ${conv.messageCount}`);
      console.log(`   📅 تاريخ الإنشاء: ${conv.createdAt}`);
    });
    
    // فحص آخر الرسائل
    const [messages] = await connection.execute(`
      SELECT m.*, c.channel, cust.firstName, cust.lastName, cust.facebookId
      FROM messages m
      JOIN conversations c ON m.conversationId = c.id
      JOIN customers cust ON c.customerId = cust.id
      WHERE c.channel = 'FACEBOOK'
      ORDER BY m.createdAt DESC
      LIMIT 5
    `);
    
    console.log('\n📨 آخر الرسائل من Facebook:');
    messages.forEach((msg, index) => {
      console.log(`\n📨 رسالة ${index + 1}:`);
      console.log(`   🆔 ID: ${msg.id}`);
      console.log(`   👤 من: ${msg.firstName} ${msg.lastName} (FB: ${msg.facebookId})`);
      console.log(`   📝 المحتوى: ${msg.content}`);
      console.log(`   📅 التاريخ: ${msg.createdAt}`);
      console.log(`   📊 من العميل: ${msg.isFromCustomer ? 'نعم' : 'لا'}`);
    });
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    if (error.response) {
      console.error('📊 تفاصيل الخطأ:', error.response.status, error.response.data);
    }
  }
}

testFacebookMessage();
