/**
 * اختبار بسيط لتشغيل الخادم
 */

console.log('🚀 بدء اختبار الخادم...');

try {
  // تحميل المتطلبات الأساسية
  console.log('📦 تحميل المتطلبات...');
  const express = require('express');
  console.log('✅ Express تم تحميله');
  
  const { PrismaClient } = require('@prisma/client');
  console.log('✅ Prisma تم تحميله');
  
  require('dotenv').config();
  console.log('✅ dotenv تم تحميله');
  
  // إنشاء التطبيق
  console.log('🔧 إنشاء التطبيق...');
  const app = express();
  const port = process.env.PORT || 3001;
  
  // اختبار الاتصال بقاعدة البيانات
  console.log('🔍 اختبار الاتصال بقاعدة البيانات...');
  const prisma = new PrismaClient();
  
  // إضافة route بسيط
  app.get('/', (req, res) => {
    res.json({ message: 'الخادم يعمل بشكل صحيح!' });
  });
  
  app.get('/test', (req, res) => {
    res.json({ 
      message: 'اختبار الخادم',
      timestamp: new Date().toISOString(),
      port: port
    });
  });
  
  // بدء الخادم
  const server = app.listen(port, () => {
    console.log(`✅ الخادم يعمل على المنفذ ${port}`);
    console.log(`🌐 URL: http://localhost:${port}`);
    console.log('🎉 الخادم جاهز لاستقبال الطلبات!');
  });
  
  // اختبار قاعدة البيانات
  prisma.$connect()
    .then(() => {
      console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
    })
    .catch((error) => {
      console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error.message);
    });
  
  // معالجة الأخطاء
  process.on('uncaughtException', (error) => {
    console.error('❌ خطأ غير متوقع:', error);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ رفض غير معالج:', reason);
  });
  
} catch (error) {
  console.error('❌ خطأ في بدء الخادم:', error);
  console.error('📊 تفاصيل الخطأ:', error.stack);
}
