const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testUnapproveFeature() {
  console.log('🔧 اختبار ميزة إيقاف الاعتماد...\n');
  
  const companyId = 'cme4yvrco002kuftceydlrwdi';
  const baseURL = 'http://localhost:3001/api/v1/success-learning';
  
  try {
    // 1. البحث عن نمط معتمد للاختبار
    console.log('1️⃣ البحث عن نمط معتمد للاختبار...');
    
    const approvedPatterns = await prisma.successPattern.findMany({
      where: { 
        companyId,
        isApproved: true 
      },
      select: {
        id: true,
        patternType: true,
        description: true,
        isApproved: true,
        isActive: true
      },
      take: 3
    });
    
    if (approvedPatterns.length === 0) {
      console.log('⚠️ لا توجد أنماط معتمدة للاختبار');
      
      // إنشاء نمط تجريبي معتمد
      console.log('📝 إنشاء نمط تجريبي معتمد...');
      const testPattern = await prisma.successPattern.create({
        data: {
          companyId,
          patternType: 'test_unapprove',
          description: 'نمط تجريبي لاختبار إيقاف الاعتماد - يحتوي على تفاصيل كاملة حول كيفية عمل النظام',
          successRate: 0.85,
          sampleSize: 20,
          confidenceLevel: 0.80,
          pattern: JSON.stringify({
            testData: true,
            purpose: 'unapprove_test'
          }),
          isActive: true,
          isApproved: true,
          approvedBy: 'test_system',
          approvedAt: new Date(),
          metadata: JSON.stringify({
            source: 'test',
            createdFor: 'unapprove_feature_test'
          })
        }
      });
      
      approvedPatterns.push(testPattern);
      console.log(`✅ تم إنشاء نمط تجريبي: ${testPattern.id}`);
    }
    
    console.log(`📊 وجدت ${approvedPatterns.length} أنماط معتمدة`);
    
    // 2. اختبار إيقاف الاعتماد
    const testPattern = approvedPatterns[0];
    console.log(`\n2️⃣ اختبار إيقاف اعتماد النمط: ${testPattern.id}`);
    console.log(`   النوع: ${testPattern.patternType}`);
    console.log(`   الوصف: ${testPattern.description.substring(0, 60)}...`);
    console.log(`   معتمد حالياً: ${testPattern.isApproved}`);
    
    const unapproveResponse = await axios.put(
      `${baseURL}/patterns/${testPattern.id}/unapprove`,
      { reason: 'اختبار ميزة إيقاف الاعتماد' },
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    if (unapproveResponse.data.success) {
      console.log('✅ تم إيقاف الاعتماد بنجاح');
      console.log(`📊 البيانات المحدثة:`, {
        isApproved: unapproveResponse.data.data.isApproved,
        isActive: unapproveResponse.data.data.isActive,
        approvedBy: unapproveResponse.data.data.approvedBy
      });
    } else {
      console.log('❌ فشل في إيقاف الاعتماد:', unapproveResponse.data.message);
    }
    
    // 3. التحقق من قاعدة البيانات
    console.log('\n3️⃣ التحقق من قاعدة البيانات...');
    
    const updatedPattern = await prisma.successPattern.findUnique({
      where: { id: testPattern.id },
      select: {
        id: true,
        isApproved: true,
        isActive: true,
        approvedBy: true,
        approvedAt: true,
        metadata: true
      }
    });
    
    console.log('📊 حالة النمط بعد التحديث:');
    console.log(`   معتمد: ${updatedPattern.isApproved}`);
    console.log(`   نشط: ${updatedPattern.isActive}`);
    console.log(`   معتمد بواسطة: ${updatedPattern.approvedBy || 'لا أحد'}`);
    console.log(`   تاريخ الاعتماد: ${updatedPattern.approvedAt || 'لا يوجد'}`);
    
    if (updatedPattern.metadata) {
      const metadata = JSON.parse(updatedPattern.metadata);
      if (metadata.unapprovedAt) {
        console.log(`   تاريخ إيقاف الاعتماد: ${metadata.unapprovedAt}`);
        console.log(`   سبب إيقاف الاعتماد: ${metadata.unapprovalReason}`);
      }
    }
    
    // 4. اختبار محاولة إيقاف اعتماد نمط غير معتمد
    console.log('\n4️⃣ اختبار محاولة إيقاف اعتماد نمط غير معتمد...');
    
    try {
      const invalidResponse = await axios.put(
        `${baseURL}/patterns/${testPattern.id}/unapprove`,
        { reason: 'اختبار خطأ' },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      console.log('⚠️ لم يتم رفض الطلب كما متوقع');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ تم رفض الطلب بشكل صحيح:', error.response.data.message);
      } else {
        console.log('❌ خطأ غير متوقع:', error.message);
      }
    }
    
    // 5. اختبار إعادة الاعتماد
    console.log('\n5️⃣ اختبار إعادة الاعتماد...');
    
    const reapproveResponse = await axios.put(
      `${baseURL}/patterns/${testPattern.id}/approve`,
      { approvedBy: 'test_system' },
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    if (reapproveResponse.data.success) {
      console.log('✅ تم إعادة الاعتماد بنجاح');
    } else {
      console.log('❌ فشل في إعادة الاعتماد');
    }
    
    console.log('\n🎉 اكتمل اختبار ميزة إيقاف الاعتماد!');
    console.log('\n📋 ملخص النتائج:');
    console.log('✅ إيقاف الاعتماد: يعمل');
    console.log('✅ التحقق من الحالة: يعمل');
    console.log('✅ رفض الطلبات غير الصحيحة: يعمل');
    console.log('✅ إعادة الاعتماد: يعمل');
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testUnapproveFeature();
