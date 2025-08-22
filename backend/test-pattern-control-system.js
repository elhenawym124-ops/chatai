#!/usr/bin/env node

/**
 * اختبار نظام التحكم في الأنماط للشركات
 * Test Pattern Control System for Companies
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

// معرفات الشركات للاختبار
const TEST_COMPANIES = [
  'cme8oj1fo000cufdcg2fquia9',  // شركة 1
  'cme8zve740006ufbcre9qzue4',  // شركة 2
  'cme8ondkz0000uf6s5gy28i17'   // شركة 3
];

async function testPatternControlSystem() {
  console.log('🧪 بدء اختبار نظام التحكم في الأنماط...\n');

  try {
    // 1. اختبار الحالة العامة للنظام
    console.log('📊 1. اختبار الحالة العامة للنظام:');
    const publicStatus = await axios.get(`${BASE_URL}/success-learning/public/system-status`);
    console.log('✅ الحالة العامة:', publicStatus.data);
    console.log('');

    // 2. اختبار حالة كل شركة
    console.log('🏢 2. اختبار حالة كل شركة:');
    for (const companyId of TEST_COMPANIES) {
      try {
        const response = await axios.get(`${BASE_URL}/success-learning/system/status`, {
          headers: {
            'x-company-id': companyId
          }
        });
        console.log(`   شركة ${companyId.slice(-8)}: ${response.data.data?.enabled ? '🟢 مفعل' : '🔴 معطل'}`);
      } catch (error) {
        console.log(`   شركة ${companyId.slice(-8)}: ❌ خطأ - ${error.message}`);
      }
    }
    console.log('');

    // 3. اختبار إيقاف النظام لشركة واحدة
    console.log('🛑 3. اختبار إيقاف النظام لشركة واحدة:');
    const testCompanyId = TEST_COMPANIES[0];
    try {
      const disableResponse = await axios.post(`${BASE_URL}/success-learning/system/disable`, {
        reason: 'اختبار النظام'
      }, {
        headers: {
          'x-company-id': testCompanyId
        }
      });
      console.log(`✅ تم إيقاف النظام للشركة ${testCompanyId.slice(-8)}`);
      console.log(`   الأنماط المتأثرة: ${disableResponse.data.data?.patternsAffected || 0}`);
    } catch (error) {
      console.log(`❌ فشل إيقاف النظام: ${error.message}`);
    }
    console.log('');

    // 4. التحقق من الحالة بعد الإيقاف
    console.log('🔍 4. التحقق من الحالة بعد الإيقاف:');
    try {
      const statusAfterDisable = await axios.get(`${BASE_URL}/success-learning/system/status`, {
        headers: {
          'x-company-id': testCompanyId
        }
      });
      console.log(`   الحالة الجديدة: ${statusAfterDisable.data.data?.enabled ? '🟢 مفعل' : '🔴 معطل'}`);
    } catch (error) {
      console.log(`❌ خطأ في فحص الحالة: ${error.message}`);
    }
    console.log('');

    // 5. اختبار تفعيل النظام مرة أخرى
    console.log('🚀 5. اختبار تفعيل النظام مرة أخرى:');
    try {
      const enableResponse = await axios.post(`${BASE_URL}/success-learning/system/enable`, {}, {
        headers: {
          'x-company-id': testCompanyId
        }
      });
      console.log(`✅ تم تفعيل النظام للشركة ${testCompanyId.slice(-8)}`);
      console.log(`   الأنماط المتأثرة: ${enableResponse.data.data?.patternsAffected || 0}`);
    } catch (error) {
      console.log(`❌ فشل تفعيل النظام: ${error.message}`);
    }
    console.log('');

    // 6. التحقق من الحالة النهائية
    console.log('✅ 6. التحقق من الحالة النهائية:');
    try {
      const finalStatus = await axios.get(`${BASE_URL}/success-learning/system/status`, {
        headers: {
          'x-company-id': testCompanyId
        }
      });
      console.log(`   الحالة النهائية: ${finalStatus.data.data?.enabled ? '🟢 مفعل' : '🔴 معطل'}`);
    } catch (error) {
      console.log(`❌ خطأ في فحص الحالة النهائية: ${error.message}`);
    }

    console.log('\n🎉 انتهى الاختبار بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    process.exit(1);
  }
}

// تشغيل الاختبار
if (require.main === module) {
  testPatternControlSystem();
}

module.exports = { testPatternControlSystem };
