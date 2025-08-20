const { exec } = require('child_process');
const path = require('path');

console.log('🔄 تحديث قاعدة البيانات وإعداد نظام الإشعارات...\n');

// Change to backend directory and run prisma db push
const backendPath = path.join(__dirname, 'backend');

console.log('1️⃣ تحديث schema قاعدة البيانات...');
exec('npx prisma db push', { cwd: backendPath }, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ خطأ في تحديث قاعدة البيانات:', error);
    return;
  }

  if (stderr && !stderr.includes('warnings')) {
    console.error('⚠️ تحذير:', stderr);
  }

  console.log('✅ تم تحديث قاعدة البيانات بنجاح!');

  // إنشاء الإشعارات التجريبية
  console.log('\n2️⃣ إنشاء إشعارات تجريبية...');
  exec('node create-test-notifications.js', (error2, stdout2, stderr2) => {
    if (error2) {
      console.error('❌ خطأ في إنشاء الإشعارات:', error2);
      return;
    }

    console.log(stdout2);

    console.log('\n🎉 تم إعداد نظام الإشعارات بالكامل!');
    console.log('🔔 افتح الموقع وتحقق من الجرس');
    console.log('📊 تحقق من لوحة المراقبة /monitoring');
    console.log('🧪 استخدم test-notification-system.html للاختبار');
  });
});
