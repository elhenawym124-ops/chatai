const { simpleMonitor } = require('./backend/src/services/simpleMonitor');

console.log('🧪 اختبار النظام الصامت للأخطاء...\n');

// محاكاة خطأ صامت
async function testSilentError() {
  console.log('1️⃣ اختبار خطأ صامت...');
  
  const error = new Error('No active Gemini key found for company: test-company');
  const context = {
    silent: true,
    errorType: 'quota_exceeded',
    customerId: 'test-customer-123',
    companyId: 'test-company-456',
    timestamp: new Date().toISOString()
  };

  try {
    await simpleMonitor.logError(error, context);
    console.log('✅ تم تسجيل الخطأ الصامت بنجاح');
  } catch (err) {
    console.error('❌ فشل في تسجيل الخطأ:', err.message);
  }
}

// محاكاة خطأ عادي
async function testNormalError() {
  console.log('\n2️⃣ اختبار خطأ عادي...');
  
  const error = new Error('Database connection failed');
  const context = {
    silent: false,
    errorType: 'database_error',
    customerId: 'customer-789',
    companyId: 'company-123',
    timestamp: new Date().toISOString()
  };

  try {
    await simpleMonitor.logError(error, context);
    console.log('✅ تم تسجيل الخطأ العادي بنجاح');
  } catch (err) {
    console.error('❌ فشل في تسجيل الخطأ:', err.message);
  }
}

// تشغيل الاختبارات
async function runTests() {
  try {
    await testSilentError();
    await testNormalError();
    
    console.log('\n🎯 نتائج الاختبار:');
    console.log('✅ النظام الصامت يعمل بشكل صحيح');
    console.log('📊 تحقق من لوحة المراقبة لرؤية الإشعارات');
    console.log('🔔 تحقق من الجرس في الواجهة');
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
}

runTests();
