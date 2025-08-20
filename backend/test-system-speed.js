const axios = require('axios');

async function testSystemSpeed() {
  console.log('⚡ اختبار سرعة النظام...\n');
  
  const tests = [
    {
      name: 'Webhook Response',
      test: async () => {
        const testMessage = {
          object: 'page',
          entry: [{
            id: 'speed-test-page',
            time: Date.now(),
            messaging: [{
              sender: { id: 'speed-test-user-' + Date.now() },
              recipient: { id: 'speed-test-page' },
              timestamp: Date.now(),
              message: {
                mid: 'speed-test-' + Date.now(),
                text: 'اختبار سرعة'
              }
            }]
          }]
        };

        const startTime = Date.now();
        await axios.post('http://localhost:3001/webhook', testMessage, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        });
        return Date.now() - startTime;
      }
    },
    {
      name: 'Pattern Stats API',
      test: async () => {
        const startTime = Date.now();
        await axios.get('http://localhost:3001/api/v1/success-learning/cleanup-stats/cme4yvrco002kuftceydlrwdi');
        return Date.now() - startTime;
      }
    },
    {
      name: 'Maintenance Status API',
      test: async () => {
        const startTime = Date.now();
        await axios.get('http://localhost:3001/api/v1/success-learning/maintenance/status');
        return Date.now() - startTime;
      }
    },
    {
      name: 'Health Check API',
      test: async () => {
        const startTime = Date.now();
        await axios.get('http://localhost:3001/health');
        return Date.now() - startTime;
      }
    }
  ];

  const results = [];

  for (const test of tests) {
    try {
      console.log(`🧪 اختبار ${test.name}...`);
      const duration = await test.test();
      results.push({ name: test.name, duration, status: 'success' });
      
      let performance;
      if (duration < 100) {
        performance = '🚀 ممتاز';
      } else if (duration < 500) {
        performance = '✅ جيد جداً';
      } else if (duration < 1000) {
        performance = '👍 جيد';
      } else if (duration < 5000) {
        performance = '⚠️ مقبول';
      } else {
        performance = '🐌 بطيء';
      }
      
      console.log(`   ⏱️ ${duration}ms - ${performance}`);
      
    } catch (error) {
      results.push({ name: test.name, duration: -1, status: 'error', error: error.message });
      console.log(`   ❌ خطأ: ${error.message}`);
    }
  }

  // تحليل النتائج
  console.log('\n📊 ملخص نتائج الاختبار:');
  console.log('=' .repeat(50));
  
  const successfulTests = results.filter(r => r.status === 'success');
  const failedTests = results.filter(r => r.status === 'error');
  
  console.log(`✅ اختبارات ناجحة: ${successfulTests.length}/${tests.length}`);
  console.log(`❌ اختبارات فاشلة: ${failedTests.length}/${tests.length}`);
  
  if (successfulTests.length > 0) {
    const avgDuration = successfulTests.reduce((sum, r) => sum + r.duration, 0) / successfulTests.length;
    const minDuration = Math.min(...successfulTests.map(r => r.duration));
    const maxDuration = Math.max(...successfulTests.map(r => r.duration));
    
    console.log(`⚡ متوسط وقت الاستجابة: ${avgDuration.toFixed(0)}ms`);
    console.log(`🏃 أسرع استجابة: ${minDuration}ms`);
    console.log(`🐌 أبطأ استجابة: ${maxDuration}ms`);
    
    // تقييم الأداء العام
    let overallPerformance;
    if (avgDuration < 200) {
      overallPerformance = '🚀 ممتاز - النظام سريع جداً';
    } else if (avgDuration < 500) {
      overallPerformance = '✅ جيد جداً - أداء ممتاز';
    } else if (avgDuration < 1000) {
      overallPerformance = '👍 جيد - أداء مقبول';
    } else if (avgDuration < 2000) {
      overallPerformance = '⚠️ مقبول - يحتاج تحسين';
    } else {
      overallPerformance = '🐌 بطيء - يحتاج تحسين عاجل';
    }
    
    console.log(`🎯 التقييم العام: ${overallPerformance}`);
  }
  
  if (failedTests.length > 0) {
    console.log('\n❌ الاختبارات الفاشلة:');
    failedTests.forEach(test => {
      console.log(`   ${test.name}: ${test.error}`);
    });
  }
  
  console.log('\n' + '=' .repeat(50));
  
  // مقارنة مع الأهداف
  console.log('🎯 مقارنة مع الأهداف:');
  const webhookTest = results.find(r => r.name === 'Webhook Response');
  if (webhookTest && webhookTest.status === 'success') {
    if (webhookTest.duration < 100) {
      console.log('✅ هدف Webhook (< 100ms): تحقق');
    } else {
      console.log(`⚠️ هدف Webhook (< 100ms): لم يتحقق (${webhookTest.duration}ms)`);
    }
  }
  
  const apiTests = results.filter(r => r.name.includes('API') && r.status === 'success');
  const avgApiTime = apiTests.length > 0 ? apiTests.reduce((sum, r) => sum + r.duration, 0) / apiTests.length : 0;
  if (avgApiTime > 0) {
    if (avgApiTime < 200) {
      console.log('✅ هدف APIs (< 200ms): تحقق');
    } else {
      console.log(`⚠️ هدف APIs (< 200ms): لم يتحقق (${avgApiTime.toFixed(0)}ms)`);
    }
  }
}

testSystemSpeed();
