#!/usr/bin/env node

/**
 * اختبار سريع لـ Learning API
 */

const http = require('http');

const API_BASE = 'http://localhost:3001/api/v1/learning';

const testEndpoint = (endpoint, description) => {
  return new Promise((resolve) => {
    const url = `${API_BASE}${endpoint}`;
    console.log(`🔍 اختبار: ${description}`);
    console.log(`   URL: ${url}`);
    
    const req = http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`   ✅ نجح (${res.statusCode})`);
          try {
            const parsed = JSON.parse(data);
            console.log(`   📊 البيانات: ${JSON.stringify(parsed).substring(0, 100)}...`);
          } catch (e) {
            console.log(`   📊 البيانات: ${data.substring(0, 100)}...`);
          }
        } else {
          console.log(`   ❌ فشل (${res.statusCode})`);
          console.log(`   📄 الرد: ${data.substring(0, 200)}`);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ خطأ في الاتصال: ${error.message}`);
      resolve();
    });
    
    req.setTimeout(5000, () => {
      console.log(`   ⏰ انتهت مهلة الاتصال`);
      req.destroy();
      resolve();
    });
  });
};

async function runTests() {
  console.log('🚀 اختبار Learning API endpoints...\n');
  
  const tests = [
    { endpoint: '/dashboard', description: 'Dashboard - لوحة التحكم' },
    { endpoint: '/analytics', description: 'Analytics - التحليلات' },
    { endpoint: '/patterns', description: 'Patterns - الأنماط المكتشفة' },
    { endpoint: '/settings', description: 'Settings - الإعدادات' },
    { endpoint: '/performance', description: 'Performance - مراقبة الأداء' }
  ];
  
  for (const test of tests) {
    await testEndpoint(test.endpoint, test.description);
    console.log(''); // سطر فارغ
  }
  
  console.log('🎯 انتهى الاختبار!');
  console.log('\n📋 النتائج:');
  console.log('   - إذا رأيت ✅ فالـ endpoint يعمل');
  console.log('   - إذا رأيت ❌ فهناك مشكلة في Backend أو الـ endpoint');
  console.log('   - إذا رأيت ⏰ فالخادم لا يستجيب');
  
  console.log('\n🔧 لحل المشاكل:');
  console.log('   1. تأكد من تشغيل Backend: cd backend && npm run dev');
  console.log('   2. تأكد من أن Backend يعمل على المنفذ 3001');
  console.log('   3. تحقق من وجود ملفات Learning API في backend/src/');
  
  console.log('\n🌐 بعد إصلاح المشاكل، شغل Frontend:');
  console.log('   cd frontend && npm start');
  console.log('   ثم انتقل إلى: http://localhost:3000/learning');
}

runTests().catch(console.error);
