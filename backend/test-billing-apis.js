const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWU4b25lN2kwMDAydWY2czV2ajFncHYwIiwiZW1haWwiOiJzdXBlcmFkbWluQHN5c3RlbS5jb20iLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJjb21wYW55SWQiOiJjbWU4b25ka3owMDAwdWY2czVneTI4aTE3IiwiaWF0IjoxNzU1MDExNzI3LCJleHAiOjE3NTUwOTgxMjd9.JGIrMvMHcNWbFxFJvpI22ZBlCyFWE3dm6W0W0wU_YOk';

async function testAPI(endpoint, description) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: endpoint,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`✅ ${description}:`);
        try {
          const jsonData = JSON.parse(data);
          if (jsonData.success) {
            console.log(`   📊 النتيجة: نجح`);
            if (jsonData.data && Array.isArray(jsonData.data.subscriptions)) {
              console.log(`   📈 عدد الاشتراكات: ${jsonData.data.subscriptions.length}`);
            }
            if (jsonData.data && Array.isArray(jsonData.data.invoices)) {
              console.log(`   📄 عدد الفواتير: ${jsonData.data.invoices.length}`);
            }
            if (jsonData.data && Array.isArray(jsonData.data.payments)) {
              console.log(`   💰 عدد المدفوعات: ${jsonData.data.payments.length}`);
            }
            if (jsonData.data && jsonData.data.stats) {
              console.log(`   📊 الإحصائيات: ${JSON.stringify(jsonData.data.stats)}`);
            }
          } else {
            console.log(`   ❌ خطأ: ${jsonData.message}`);
          }
        } catch (error) {
          console.log(`   📄 الاستجابة: ${data.substring(0, 200)}...`);
        }
        console.log('');
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error(`❌ خطأ في ${description}:`, error.message);
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 اختبار APIs نظام الفواتير والاشتراكات...\n');
  
  await testAPI('/api/v1/admin/subscriptions', 'جلب الاشتراكات');
  await testAPI('/api/v1/admin/invoices', 'جلب الفواتير');
  await testAPI('/api/v1/admin/payments', 'جلب المدفوعات');
  await testAPI('/api/v1/admin/invoices/stats/overview', 'إحصائيات الفواتير');
  
  console.log('🎉 انتهى الاختبار!');
}

runTests();
