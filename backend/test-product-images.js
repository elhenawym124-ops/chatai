const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testProductImages() {
  try {
    console.log('🔍 اختبار صور المنتجات...');
    
    // فحص المنتجات وصورها
    const products = await prisma.product.findMany({
      where: { 
        companyId: 'cme8zve740006ufbcre9qzue4',
        isActive: true 
      },
      select: {
        id: true,
        name: true,
        images: true,
        price: true
      }
    });
    
    console.log(`📦 عدد المنتجات: ${products.length}`);
    
    products.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name} - ${product.price} ج.م`);
      
      try {
        const images = product.images ? JSON.parse(product.images) : [];
        console.log(`   📸 عدد الصور: ${images.length}`);
        
        if (images.length > 0) {
          images.forEach((img, imgIndex) => {
            console.log(`     ${imgIndex + 1}. ${img.substring(0, 80)}...`);
          });
        } else {
          console.log(`   ⚠️ لا توجد صور`);
        }
      } catch (e) {
        console.log(`   ❌ خطأ في تحليل الصور: ${e.message}`);
      }
    });
    
    // اختبار إرسال رسالة تطلب منتج
    console.log('\n🧪 اختبار محاكاة طلب منتج...');
    
    const aiAgentService = require('./src/services/aiAgentService');
    
    const testMessage = {
      conversationId: 'cmem7f5rp000zufak5m9zkap9',
      senderId: '23949903971327041',
      content: 'عايز أشوف كوتشي حريمي لمسه',
      attachments: [],
      timestamp: new Date(),
      companyId: 'cme8zve740006ufbcre9qzue4',
      customerData: {
        id: 'cme9y5xaf001pufr844p2m8up',
        name: 'مختار محمد',
        phone: '01017854018',
        email: null,
        orderCount: 0,
        companyId: 'cme8zve740006ufbcre9qzue4'
      }
    };
    
    console.log('📤 إرسال طلب للـ AI Agent...');
    
    try {
      const response = await aiAgentService.processCustomerMessage(testMessage);
      
      console.log('✅ رد الـ AI Agent:');
      console.log(`📝 المحتوى: ${response.content.substring(0, 200)}...`);
      console.log(`📸 عدد الصور: ${response.images ? response.images.length : 0}`);
      console.log(`🎯 النية: ${response.intent}`);
      console.log(`📊 الثقة: ${response.confidence}`);
      console.log(`🔧 النموذج: ${response.model}`);
      
      if (response.images && response.images.length > 0) {
        console.log('\n📸 الصور المرسلة:');
        response.images.forEach((img, index) => {
          console.log(`   ${index + 1}. ${img.title || 'بدون عنوان'}`);
          console.log(`      URL: ${img.payload?.url?.substring(0, 80)}...`);
        });
      } else {
        console.log('\n⚠️ لم يتم إرسال صور');
      }
      
    } catch (error) {
      console.error('❌ خطأ في الـ AI Agent:', error.message);
    }
    
    // اختبار محاكاة رد على صورة منتج
    console.log('\n🔄 اختبار محاكاة رد على صورة منتج...');
    
    const replyMessage = {
      conversationId: 'cmem7f5rp000zufak5m9zkap9',
      senderId: '23949903971327041',
      content: 'عايز اللون الأبيض',
      attachments: [],
      timestamp: new Date(),
      companyId: 'cme8zve740006ufbcre9qzue4',
      replyContext: {
        isReply: true,
        originalMessageId: 'test-image-message',
        originalMessage: {
          id: 'test-message-id',
          content: 'إليك صور كوتشي حريمي لمسه المتاحة:\n\n1. كوتشي حريمي لمسه - 349 ج.م\n   - متوفر بالألوان: الأبيض، الأسود، البيج',
          createdAt: new Date()
        }
      },
      customerData: {
        id: 'cme9y5xaf001pufr844p2m8up',
        name: 'مختار محمد',
        phone: '01017854018',
        email: null,
        orderCount: 0,
        companyId: 'cme8zve740006ufbcre9qzue4'
      }
    };
    
    console.log('📤 إرسال رد على صورة منتج للـ AI Agent...');
    
    try {
      const replyResponse = await aiAgentService.processCustomerMessage(replyMessage);
      
      console.log('✅ رد الـ AI Agent على الـ Reply:');
      console.log(`📝 المحتوى: ${replyResponse.content.substring(0, 300)}...`);
      console.log(`📸 عدد الصور: ${replyResponse.images ? replyResponse.images.length : 0}`);
      console.log(`🎯 النية: ${replyResponse.intent}`);
      console.log(`📊 الثقة: ${replyResponse.confidence}`);
      
      if (replyResponse.images && replyResponse.images.length > 0) {
        console.log('\n📸 الصور المرسلة في الرد:');
        replyResponse.images.forEach((img, index) => {
          console.log(`   ${index + 1}. ${img.title || 'بدون عنوان'}`);
          console.log(`      URL: ${img.payload?.url?.substring(0, 80)}...`);
        });
      }
      
    } catch (error) {
      console.error('❌ خطأ في رد الـ AI Agent:', error.message);
    }
    
  } catch (error) {
    console.error('❌ خطأ عام:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProductImages();
