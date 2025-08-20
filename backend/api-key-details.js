/**
 * سكريپت لعرض تفاصيل مفتاح API المحدد
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getApiKeyDetails() {
  const targetApiKey = 'AIzaSyAdWtZ3BgcAs3bN_UyCnpMl_tzMWtueH5k';
  
  console.log('🔍 تفاصيل مفتاح API في قاعدة البيانات');
  console.log(`🔑 المفتاح: ${targetApiKey}`);
  console.log('=' * 80);

  try {
    // البحث في جدول AiSettings
    const aiSettings = await prisma.aiSettings.findMany({
      include: {
        company: true
      }
    });

    for (const setting of aiSettings) {
      if (setting.modelSettings) {
        try {
          const modelSettings = JSON.parse(setting.modelSettings);
          if (modelSettings.apiKeys && Array.isArray(modelSettings.apiKeys)) {
            for (const apiKeyObj of modelSettings.apiKeys) {
              if (apiKeyObj.key === targetApiKey) {
                console.log('\n✅ تفاصيل المفتاح الموجود:');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                
                console.log('\n🏢 معلومات الشركة:');
                console.log(`   📛 اسم الشركة: ${setting.company.name}`);
                console.log(`   📧 البريد الإلكتروني: ${setting.company.email}`);
                console.log(`   🆔 معرف الشركة: ${setting.company.id}`);
                console.log(`   📞 الهاتف: ${setting.company.phone || 'غير محدد'}`);
                console.log(`   🌐 الموقع: ${setting.company.website || 'غير محدد'}`);
                console.log(`   📍 العنوان: ${setting.company.address || 'غير محدد'}`);
                console.log(`   📋 الخطة: ${setting.company.plan}`);
                console.log(`   ✅ نشط: ${setting.company.isActive ? 'نعم' : 'لا'}`);
                console.log(`   📅 تاريخ الإنشاء: ${setting.company.createdAt.toLocaleString('ar-SA')}`);
                console.log(`   🔄 آخر تحديث: ${setting.company.updatedAt.toLocaleString('ar-SA')}`);

                console.log('\n🔑 تفاصيل مفتاح API:');
                console.log(`   📛 اسم المفتاح: ${apiKeyObj.name || 'غير محدد'}`);
                console.log(`   🔑 المفتاح: ${apiKeyObj.key}`);
                console.log(`   🤖 النماذج المدعومة: ${apiKeyObj.models ? apiKeyObj.models.join(', ') : 'غير محدد'}`);
                console.log(`   ⭐ الأولوية: ${apiKeyObj.priority || 'غير محدد'}`);
                console.log(`   📊 الحد اليومي: ${apiKeyObj.dailyLimit || 'غير محدد'}`);
                console.log(`   📈 الحد الشهري: ${apiKeyObj.monthlyLimit || 'غير محدد'}`);
                console.log(`   ✅ نشط: ${apiKeyObj.isActive !== false ? 'نعم' : 'لا'}`);

                console.log('\n⚙️ إعدادات AI:');
                console.log(`   🆔 معرف الإعدادات: ${setting.id}`);
                console.log(`   🤖 الرد التلقائي: ${setting.autoReplyEnabled ? 'مفعل' : 'معطل'}`);
                console.log(`   🎯 عتبة الثقة: ${setting.confidenceThreshold}`);
                console.log(`   📝 قالب الشخصية: ${setting.personalityPrompt ? 'موجود' : 'غير موجود'}`);
                console.log(`   💬 قالب الرد: ${setting.responsePrompt ? 'موجود' : 'غير موجود'}`);
                console.log(`   🛍️ اقتراح المنتجات: ${setting.autoSuggestProducts ? 'مفعل' : 'معطل'}`);
                console.log(`   📊 أقصى اقتراحات: ${setting.maxSuggestions}`);
                console.log(`   🖼️ تضمين الصور: ${setting.includeImages ? 'نعم' : 'لا'}`);
                console.log(`   📅 تاريخ الإنشاء: ${setting.createdAt.toLocaleString('ar-SA')}`);
                console.log(`   🔄 آخر تحديث: ${setting.updatedAt.toLocaleString('ar-SA')}`);

                // عرض جميع مفاتيح API للشركة
                console.log('\n🔑 جميع مفاتيح API للشركة:');
                modelSettings.apiKeys.forEach((key, index) => {
                  const isCurrent = key.key === targetApiKey;
                  console.log(`   ${index + 1}. ${key.name || `مفتاح ${index + 1}`} ${isCurrent ? '👈 (المفتاح المطلوب)' : ''}`);
                  console.log(`      🔑 المفتاح: ${key.key.substring(0, 20)}...`);
                  console.log(`      ⭐ الأولوية: ${key.priority || 'غير محدد'}`);
                  console.log(`      ✅ نشط: ${key.isActive !== false ? 'نعم' : 'لا'}`);
                });

                // إحصائيات الاستخدام (إذا كانت متوفرة)
                console.log('\n📊 إحصائيات الاستخدام:');
                const aiInteractions = await prisma.aiInteraction.findMany({
                  where: { companyId: setting.company.id },
                  orderBy: { createdAt: 'desc' },
                  take: 5
                });

                console.log(`   📈 إجمالي التفاعلات: ${aiInteractions.length > 0 ? 'متوفر' : 'غير متوفر'}`);
                if (aiInteractions.length > 0) {
                  console.log(`   🕐 آخر تفاعل: ${aiInteractions[0].createdAt.toLocaleString('ar-SA')}`);
                  console.log(`   🤖 النموذج المستخدم: ${aiInteractions[0].modelUsed || 'غير محدد'}`);
                }

                console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              }
            }
          }
        } catch (e) {
          console.error('خطأ في تحليل modelSettings:', e.message);
        }
      }
    }

  } catch (error) {
    console.error('❌ خطأ في استرجاع التفاصيل:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريپت
getApiKeyDetails().catch(console.error);
