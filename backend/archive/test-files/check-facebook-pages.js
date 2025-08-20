const mysql = require('mysql2/promise');

async function checkFacebookPages() {
  console.log('🔍 فحص صفحات الفيس بوك في قاعدة البيانات...');
  
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
    
    // فحص جميع صفحات الفيس بوك
    console.log('\n📊 فحص جميع صفحات الفيس بوك:');
    const [pages] = await connection.execute(`
      SELECT fp.*, c.name as company_name 
      FROM facebook_pages fp 
      LEFT JOIN companies c ON fp.companyId = c.id
    `);
    
    console.log(`📄 إجمالي الصفحات: ${pages.length}`);
    
    pages.forEach((page, index) => {
      console.log(`\n📄 صفحة ${index + 1}:`);
      console.log(`   🆔 Page ID: ${page.pageId}`);
      console.log(`   📝 اسم الصفحة: ${page.pageName}`);
      console.log(`   🏢 الشركة: ${page.company_name || 'غير محدد'}`);
      console.log(`   📊 الحالة: ${page.status}`);
      console.log(`   🔗 تاريخ الربط: ${page.connectedAt}`);
    });
    
    // فحص الصفحة المحددة
    console.log('\n🎯 فحص الصفحة المحددة 250528358137901:');
    const [targetPage] = await connection.execute(`
      SELECT fp.*, c.name as company_name 
      FROM facebook_pages fp 
      LEFT JOIN companies c ON fp.companyId = c.id 
      WHERE fp.pageId = ?
    `, ['250528358137901']);
    
    if (targetPage.length > 0) {
      console.log('✅ الصفحة موجودة في قاعدة البيانات:');
      console.log(targetPage[0]);
    } else {
      console.log('❌ الصفحة 250528358137901 غير موجودة في قاعدة البيانات');
    }
    
    // فحص العملاء من الفيس بوك
    console.log('\n👥 فحص العملاء من الفيس بوك:');
    const [customers] = await connection.execute(`
      SELECT id, firstName, lastName, facebookId, companyId, createdAt 
      FROM customers 
      WHERE facebookId IS NOT NULL
    `);
    
    console.log(`👤 إجمالي العملاء من الفيس بوك: ${customers.length}`);
    customers.forEach((customer, index) => {
      console.log(`   ${index + 1}. ${customer.firstName} ${customer.lastName} (FB: ${customer.facebookId})`);
    });
    
    // فحص المحادثات من الفيس بوك
    console.log('\n💬 فحص المحادثات من الفيس بوك:');
    const [conversations] = await connection.execute(`
      SELECT c.*, cust.firstName, cust.lastName, cust.facebookId,
             (SELECT COUNT(*) FROM messages WHERE conversationId = c.id) as messageCount
      FROM conversations c 
      LEFT JOIN customers cust ON c.customerId = cust.id 
      WHERE c.channel = 'FACEBOOK'
      ORDER BY c.createdAt DESC
    `);
    
    console.log(`💬 إجمالي المحادثات من الفيس بوك: ${conversations.length}`);
    conversations.forEach((conv, index) => {
      console.log(`\n💬 محادثة ${index + 1}:`);
      console.log(`   🆔 ID: ${conv.id}`);
      console.log(`   👤 العميل: ${conv.firstName} ${conv.lastName}`);
      console.log(`   📱 Facebook ID: ${conv.facebookId}`);
      console.log(`   📊 الحالة: ${conv.status}`);
      console.log(`   📨 عدد الرسائل: ${conv.messageCount}`);
      console.log(`   📅 تاريخ الإنشاء: ${conv.createdAt}`);
      console.log(`   📝 آخر رسالة: ${conv.lastMessageAt || 'لا توجد'}`);
    });
    
    // فحص الرسائل الأخيرة من الفيس بوك
    console.log('\n📨 فحص آخر 10 رسائل من الفيس بوك:');
    const [messages] = await connection.execute(`
      SELECT m.*, c.channel, cust.firstName, cust.lastName, cust.facebookId
      FROM messages m
      JOIN conversations c ON m.conversationId = c.id
      JOIN customers cust ON c.customerId = cust.id
      WHERE c.channel = 'FACEBOOK'
      ORDER BY m.createdAt DESC
      LIMIT 10
    `);
    
    console.log(`📨 آخر ${messages.length} رسائل من الفيس بوك:`);
    messages.forEach((msg, index) => {
      console.log(`\n📨 رسالة ${index + 1}:`);
      console.log(`   🆔 ID: ${msg.id}`);
      console.log(`   👤 من: ${msg.firstName} ${msg.lastName} (FB: ${msg.facebookId})`);
      console.log(`   📝 المحتوى: ${msg.content}`);
      console.log(`   📅 التاريخ: ${msg.createdAt}`);
      console.log(`   📊 من العميل: ${msg.isFromCustomer ? 'نعم' : 'لا'}`);
    });
    
    await connection.end();
    console.log('\n✅ تم إنهاء الفحص بنجاح');
    
  } catch (error) {
    console.error('❌ خطأ في الفحص:', error);
  }
}

checkFacebookPages();
