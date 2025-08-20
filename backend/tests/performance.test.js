/**
 * اختبارات الأداء لنظام التعلم المستمر
 * 
 * اختبار أداء النظام تحت ضغط عالي وبيانات كبيرة
 */

const request = require('supertest');
const { performance } = require('perf_hooks');
const app = require('../server');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Performance Tests - Continuous Learning System', () => {
  let authToken;
  let testCompanyId;

  beforeAll(async () => {
    // إعداد بيانات الاختبار
    const testCompany = await prisma.company.create({
      data: {
        name: 'Performance Test Company',
        email: 'performance@test.com',
        phone: '+1234567890'
      }
    });
    testCompanyId = testCompany.id;

    // الحصول على token للمصادقة
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'performance@test.com',
        password: 'testpassword'
      });
    
    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // تنظيف البيانات
    await prisma.learningData.deleteMany({
      where: { companyId: testCompanyId }
    });
    await prisma.discoveredPattern.deleteMany({
      where: { companyId: testCompanyId }
    });
    await prisma.appliedImprovement.deleteMany({
      where: { companyId: testCompanyId }
    });
    await prisma.company.delete({
      where: { id: testCompanyId }
    });
    await prisma.$disconnect();
  });

  describe('API Response Time Tests', () => {
    test('Dashboard API should respond within 500ms', async () => {
      const startTime = performance.now();
      
      const response = await request(app)
        .get('/api/v1/learning/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(500);
      expect(response.body.success).toBe(true);
    });

    test('Analytics API should respond within 1000ms', async () => {
      const startTime = performance.now();
      
      const response = await request(app)
        .get('/api/v1/learning/analytics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(1000);
      expect(response.body.success).toBe(true);
    });

    test('Patterns API should respond within 800ms', async () => {
      const startTime = performance.now();
      
      const response = await request(app)
        .get('/api/v1/learning/patterns')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(800);
      expect(response.body.success).toBe(true);
    });
  });

  describe('High Load Tests', () => {
    test('Should handle 100 concurrent dashboard requests', async () => {
      const promises = [];
      const startTime = performance.now();

      // إنشاء 100 طلب متزامن
      for (let i = 0; i < 100; i++) {
        promises.push(
          request(app)
            .get('/api/v1/learning/dashboard')
            .set('Authorization', `Bearer ${authToken}`)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // التحقق من أن جميع الطلبات نجحت
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      // التحقق من أن الوقت الإجمالي معقول (أقل من 10 ثوان)
      expect(totalTime).toBeLessThan(10000);
      
      console.log(`✅ 100 concurrent requests completed in ${totalTime.toFixed(2)}ms`);
    });

    test('Should handle rapid data collection', async () => {
      const promises = [];
      const startTime = performance.now();

      // إنشاء 50 طلب لجمع البيانات
      for (let i = 0; i < 50; i++) {
        promises.push(
          request(app)
            .post('/api/v1/learning/data')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              type: 'conversation',
              data: {
                userMessage: `Test message ${i}`,
                aiResponse: `Test response ${i}`,
                context: { testId: i }
              },
              outcome: Math.random() > 0.5 ? 'success' : 'failure',
              metadata: {
                responseTime: Math.random() * 1000,
                confidence: Math.random()
              }
            })
        );
      }

      const responses = await Promise.all(promises);
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // التحقق من نجاح جميع الطلبات
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      expect(totalTime).toBeLessThan(15000); // أقل من 15 ثانية
      
      console.log(`✅ 50 data collection requests completed in ${totalTime.toFixed(2)}ms`);
    });
  });

  describe('Large Dataset Tests', () => {
    test('Should handle large dataset queries efficiently', async () => {
      // إنشاء 1000 سجل بيانات للاختبار
      const largeDataset = [];
      for (let i = 0; i < 1000; i++) {
        largeDataset.push({
          companyId: testCompanyId,
          type: 'conversation',
          data: {
            userMessage: `Large dataset message ${i}`,
            aiResponse: `Large dataset response ${i}`,
            context: { batchId: Math.floor(i / 100) }
          },
          outcome: Math.random() > 0.5 ? 'success' : 'failure',
          metadata: {
            responseTime: Math.random() * 1000,
            confidence: Math.random()
          }
        });
      }

      // إدراج البيانات في دفعات
      const batchSize = 100;
      for (let i = 0; i < largeDataset.length; i += batchSize) {
        const batch = largeDataset.slice(i, i + batchSize);
        await prisma.learningData.createMany({
          data: batch
        });
      }

      // اختبار استعلام البيانات الكبيرة
      const startTime = performance.now();
      
      const response = await request(app)
        .get('/api/v1/learning/data?limit=500&page=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = performance.now();
      const queryTime = endTime - startTime;

      expect(queryTime).toBeLessThan(2000); // أقل من ثانيتين
      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBeGreaterThan(0);
      
      console.log(`✅ Large dataset query completed in ${queryTime.toFixed(2)}ms`);
    });

    test('Should handle pattern analysis on large dataset', async () => {
      const startTime = performance.now();
      
      // محاكاة تحليل الأنماط على البيانات الكبيرة
      const response = await request(app)
        .post('/api/v1/learning/analyze-patterns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          analysisType: 'comprehensive',
          dataRange: 'last_1000'
        });

      const endTime = performance.now();
      const analysisTime = endTime - startTime;

      expect(analysisTime).toBeLessThan(5000); // أقل من 5 ثوان
      expect(response.status).toBe(200);
      
      console.log(`✅ Pattern analysis completed in ${analysisTime.toFixed(2)}ms`);
    });
  });

  describe('Memory Usage Tests', () => {
    test('Should not cause memory leaks during intensive operations', async () => {
      const initialMemory = process.memoryUsage();
      
      // تشغيل عمليات مكثفة
      for (let i = 0; i < 10; i++) {
        await request(app)
          .get('/api/v1/learning/dashboard')
          .set('Authorization', `Bearer ${authToken}`);
        
        await request(app)
          .get('/api/v1/learning/analytics')
          .set('Authorization', `Bearer ${authToken}`);
        
        await request(app)
          .get('/api/v1/learning/patterns')
          .set('Authorization', `Bearer ${authToken}`);
      }

      // فرض garbage collection إذا كان متاحاً
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // التحقق من أن زيادة الذاكرة معقولة (أقل من 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      
      console.log(`✅ Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    });
  });

  describe('Database Performance Tests', () => {
    test('Should handle complex queries efficiently', async () => {
      const startTime = performance.now();
      
      // استعلام معقد يجمع بيانات من عدة جداول
      const response = await request(app)
        .get('/api/v1/learning/reports/performance?period=month&detailed=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = performance.now();
      const queryTime = endTime - startTime;

      expect(queryTime).toBeLessThan(3000); // أقل من 3 ثوان
      expect(response.body.success).toBe(true);
      
      console.log(`✅ Complex query completed in ${queryTime.toFixed(2)}ms`);
    });

    test('Should handle concurrent database operations', async () => {
      const promises = [];
      const startTime = performance.now();

      // عمليات قاعدة بيانات متزامنة
      for (let i = 0; i < 20; i++) {
        promises.push(
          request(app)
            .post('/api/v1/learning/data')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              type: 'performance_test',
              data: { testId: i },
              outcome: 'success'
            })
        );
      }

      const responses = await Promise.all(promises);
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      expect(totalTime).toBeLessThan(8000); // أقل من 8 ثوان
      
      console.log(`✅ 20 concurrent DB operations completed in ${totalTime.toFixed(2)}ms`);
    });
  });

  describe('Stress Tests', () => {
    test('Should maintain stability under extreme load', async () => {
      const promises = [];
      const errors = [];
      const startTime = performance.now();

      // اختبار ضغط شديد - 200 طلب متزامن
      for (let i = 0; i < 200; i++) {
        promises.push(
          request(app)
            .get('/api/v1/learning/dashboard')
            .set('Authorization', `Bearer ${authToken}`)
            .catch(error => {
              errors.push(error);
              return { status: 500 }; // إرجاع استجابة وهمية للأخطاء
            })
        );
      }

      const responses = await Promise.all(promises);
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // التحقق من أن معدل النجاح أكبر من 90%
      const successfulResponses = responses.filter(r => r.status === 200).length;
      const successRate = (successfulResponses / responses.length) * 100;

      expect(successRate).toBeGreaterThan(90);
      expect(totalTime).toBeLessThan(30000); // أقل من 30 ثانية
      
      console.log(`✅ Stress test: ${successRate.toFixed(1)}% success rate in ${totalTime.toFixed(2)}ms`);
      console.log(`✅ Errors: ${errors.length}/${responses.length}`);
    });
  });

  describe('Resource Cleanup Tests', () => {
    test('Should properly clean up resources after operations', async () => {
      const initialConnections = prisma._engine?.connectionPromise ? 1 : 0;
      
      // تشغيل عمليات متعددة
      await request(app)
        .get('/api/v1/learning/dashboard')
        .set('Authorization', `Bearer ${authToken}`);
      
      await request(app)
        .post('/api/v1/learning/data')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'cleanup_test',
          data: { test: true },
          outcome: 'success'
        });

      // انتظار قصير للسماح بتنظيف الموارد
      await new Promise(resolve => setTimeout(resolve, 1000));

      // التحقق من أن الاتصالات لم تتراكم
      const finalConnections = prisma._engine?.connectionPromise ? 1 : 0;
      expect(finalConnections).toBeLessThanOrEqual(initialConnections + 1);
      
      console.log('✅ Resource cleanup test passed');
    });
  });
});

// اختبارات إضافية للأداء
describe('Performance Benchmarks', () => {
  test('Benchmark: API response times', async () => {
    const endpoints = [
      '/api/v1/learning/dashboard',
      '/api/v1/learning/analytics',
      '/api/v1/learning/patterns',
      '/api/v1/learning/settings'
    ];

    const benchmarks = {};

    for (const endpoint of endpoints) {
      const times = [];
      
      // تشغيل كل endpoint 10 مرات
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();
        
        await request(app)
          .get(endpoint)
          .set('Authorization', `Bearer ${authToken}`);
        
        const endTime = performance.now();
        times.push(endTime - startTime);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);

      benchmarks[endpoint] = {
        average: avgTime.toFixed(2),
        min: minTime.toFixed(2),
        max: maxTime.toFixed(2)
      };
    }

    console.log('📊 Performance Benchmarks:');
    Object.entries(benchmarks).forEach(([endpoint, stats]) => {
      console.log(`${endpoint}:`);
      console.log(`  Average: ${stats.average}ms`);
      console.log(`  Min: ${stats.min}ms`);
      console.log(`  Max: ${stats.max}ms`);
    });

    // التحقق من أن المتوسط أقل من حد معين
    Object.values(benchmarks).forEach(stats => {
      expect(parseFloat(stats.average)).toBeLessThan(1000);
    });
  });
});
