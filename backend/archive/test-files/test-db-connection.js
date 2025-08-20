const mysql = require('mysql2/promise');

async function testDatabaseConnection() {
  console.log('🔍 اختبار الاتصال بقاعدة البيانات...');
  
  const config = {
    host: '92.113.22.70',
    port: 3306,
    user: 'u339372869_test',
    password: '0165676135Aa@A',
    database: 'u339372869_test',
    connectTimeout: 10000,
    acquireTimeout: 10000,
    timeout: 10000
  };
  
  try {
    console.log('📡 محاولة الاتصال بالخادم:', config.host + ':' + config.port);
    console.log('👤 المستخدم:', config.user);
    console.log('🗄️ قاعدة البيانات:', config.database);
    
    const connection = await mysql.createConnection(config);
    console.log('✅ تم الاتصال بنجاح!');
    
    // اختبار استعلام بسيط
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ اختبار الاستعلام نجح:', rows);
    
    // اختبار الجداول الموجودة
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 الجداول الموجودة:', tables);
    
    await connection.end();
    console.log('✅ تم إغلاق الاتصال بنجاح');
    
  } catch (error) {
    console.error('❌ فشل الاتصال:');
    console.error('🔴 نوع الخطأ:', error.code);
    console.error('🔴 رسالة الخطأ:', error.message);
    console.error('🔴 التفاصيل الكاملة:', error);
    
    // تحليل نوع الخطأ
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 السبب المحتمل: الخادم رفض الاتصال - قد يكون المنفذ مغلق');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('💡 السبب المحتمل: انتهت مهلة الاتصال - مشكلة في الشبكة');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 السبب المحتمل: لم يتم العثور على الخادم');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 السبب المحتمل: خطأ في اسم المستخدم أو كلمة المرور');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 السبب المحتمل: قاعدة البيانات غير موجودة');
    }
  }
}

testDatabaseConnection();
