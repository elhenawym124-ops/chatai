#!/usr/bin/env node

/**
 * اختبار سلوك الأنماط عند إيقاف/تفعيل النظام
 */

const { PrismaClient } = require('@prisma/client');
const PatternApplicationService = require('./src/services/patternApplicationService');

const prisma = new PrismaClient();

async function testPatternBehavior() {
  try {
    console.log('🧪 اختبار سلوك الأنماط عند إيقاف النظام...\n');
    
    const halawCompanyId = 'cme8zve740006ufbcre9qzue4';
    
    // 1. فحص حالة النظام
    console.log('1️⃣ فحص حالة النظام لشركة الحلو:');
    const company = await prisma.company.findUnique({
      where: { id: halawCompanyId },
      select: { settings: true, name: true }
    });
    
    let systemSettings = {};
    try {
      systemSettings = company.settings ? JSON.parse(company.settings) : {};
    } catch (e) {
      systemSettings = {};
    }
    
    const isSystemEnabled = systemSettings.patternSystemEnabled !== false;
    console.log(`   🏢 الشركة: ${company.name}`);
    console.log(`   🎯 حالة النظام: ${isSystemEnabled ? '🟢 مفعل' : '🔴 معطل'}`);
    
    // 2. فحص الأنماط الموجودة
    console.log('\n2️⃣ فحص الأنماط الموجودة:');
    const allPatterns = await prisma.successPattern.findMany({
      where: { companyId: halawCompanyId },
      select: {
        id: true,
        description: true,
        isActive: true,
        isApproved: true,
        successRate: true
      }
    });
    
    console.log(`   📊 إجمالي الأنماط: ${allPatterns.length}`);
    console.log(`   ✅ الأنماط النشطة: ${allPatterns.filter(p => p.isActive).length}`);
    console.log(`   🎯 الأنماط المعتمدة: ${allPatterns.filter(p => p.isApproved).length}`);
    console.log(`   🚀 الأنماط النشطة والمعتمدة: ${allPatterns.filter(p => p.isActive && p.isApproved).length}`);
    
    // 3. محاولة تفعيل نمط واحد يدوياً
    if (allPatterns.length > 0) {
      console.log('\n3️⃣ محاولة تفعيل نمط واحد يدوياً:');
      const firstPattern = allPatterns[0];
      console.log(`   🎯 النمط المختار: ${firstPattern.description.substring(0, 50)}...`);
      console.log(`   📊 الحالة الحالية: نشط=${firstPattern.isActive}, معتمد=${firstPattern.isApproved}`);
      
      // تفعيل النمط
      const updatedPattern = await prisma.successPattern.update({
        where: { id: firstPattern.id },
        data: { 
          isActive: true,
          isApproved: true
        }
      });
      
      console.log(`   ✅ تم تفعيل النمط بنجاح!`);
      console.log(`   📊 الحالة الجديدة: نشط=${updatedPattern.isActive}, معتمد=${updatedPattern.isApproved}`);
      
      // 4. اختبار ما إذا كان سيتم تطبيقه
      console.log('\n4️⃣ اختبار تطبيق النمط:');
      
      const patternService = new PatternApplicationService();
      
      const approvedPatterns = await patternService.getApprovedPatterns(halawCompanyId);
      console.log(`   🔍 الأنماط التي سيتم تطبيقها: ${approvedPatterns.length}`);
      
      if (approvedPatterns.length === 0) {
        console.log('   🔴 لن يتم تطبيق أي أنماط لأن النظام معطل');
      } else {
        console.log('   🟢 سيتم تطبيق الأنماط لأن النظام مفعل');
        approvedPatterns.forEach((pattern, index) => {
          console.log(`      ${index + 1}. ${pattern.description.substring(0, 60)}...`);
        });
      }
      
      // 5. اختبار تطبيق فعلي
      console.log('\n5️⃣ اختبار تطبيق فعلي على نص:');
      const testText = 'مرحبا، أريد معرفة أسعار المنتجات';
      console.log(`   📝 النص الأصلي: "${testText}"`);
      
      const enhancedText = await patternService.applyAllPatterns(
        testText,
        halawCompanyId,
        'test-conversation-123'
      );
      
      console.log(`   🚀 النص المحسن: "${enhancedText}"`);
      
      if (enhancedText === testText) {
        console.log('   📊 النتيجة: لم يتم تطبيق أي تحسينات');
      } else {
        console.log('   📊 النتيجة: تم تطبيق تحسينات بنجاح');
      }
    }
    
    console.log('\n🎯 الخلاصة:');
    console.log('   - إذا كان النظام معطل: لن يتم تطبيق أي أنماط حتى لو كانت مفعلة');
    console.log('   - إذا كان النظام مفعل: سيتم تطبيق الأنماط المفعلة والمعتمدة');
    console.log('   - تفعيل نمط واحد لا يفعل النظام بالكامل');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    console.error(error.stack);
  }
}

// تشغيل الاختبار
if (require.main === module) {
  testPatternBehavior();
}

module.exports = { testPatternBehavior };
