const { PrismaClient } = require('@prisma/client');

console.log('🚨 فحص عاجل لمشكلة العزل المكتشفة...\n');

class EmergencyIsolationChecker {
  constructor() {
    this.prisma = new PrismaClient();
  }
  
  async checkProductIsolation() {
    console.log('📦 فحص عزل المنتجات...');
    
    try {
      // جلب جميع الشركات
      const companies = await this.prisma.company.findMany({
        select: { id: true, name: true }
      });
      
      console.log(`✅ تم العثور على ${companies.length} شركة:`);
      companies.forEach((company, index) => {
        console.log(`   ${index + 1}. ${company.name} (${company.id})`);
      });
      
      console.log('\n📊 فحص المنتجات لكل شركة:');
      
      for (const company of companies) {
        const products = await this.prisma.product.findMany({
          where: { companyId: company.id },
          select: { 
            id: true, 
            name: true, 
            companyId: true,
            description: true 
          }
        });
        
        console.log(`\n🏢 ${company.name}:`);
        console.log(`   📦 عدد المنتجات: ${products.length}`);
        
        products.forEach((product, index) => {
          console.log(`   ${index + 1}. "${product.name}" - ${product.description || 'بدون وصف'}`);
          console.log(`      🆔 ID: ${product.id}`);
          console.log(`      🏢 Company ID: ${product.companyId}`);
        });
        
        if (products.length === 0) {
          console.log('   ⚪ لا توجد منتجات');
        }
      }
      
      // فحص المنتجات بدون companyId
      console.log('\n⚠️ فحص المنتجات بدون عزل:');
      const orphanProducts = await this.prisma.product.findMany({
        where: { companyId: null },
        select: { id: true, name: true, description: true }
      });
      
      if (orphanProducts.length > 0) {
        console.log(`🚨 تم العثور على ${orphanProducts.length} منتج بدون عزل:`);
        orphanProducts.forEach((product, index) => {
          console.log(`   ${index + 1}. "${product.name}" - ${product.description || 'بدون وصف'}`);
        });
      } else {
        console.log('✅ لا توجد منتجات بدون عزل');
      }
      
    } catch (error) {
      console.error('❌ خطأ في فحص المنتجات:', error.message);
    }
  }
  
  async checkRAGIsolation() {
    console.log('\n🧠 فحص عزل RAG...');
    
    try {
      // محاكاة استعلام RAG
      const companyId = 'cme8oj1fo000cufdcg2fquia9'; // الشركة من اللوج
      
      console.log(`🔍 محاكاة استعلام RAG للشركة: ${companyId}`);
      
      const products = await this.prisma.product.findMany({
        where: { companyId: companyId },
        select: { 
          id: true, 
          name: true, 
          companyId: true,
          description: true 
        }
      });
      
      console.log(`📦 منتجات الشركة ${companyId}:`);
      console.log(`   عدد المنتجات: ${products.length}`);
      
      products.forEach((product, index) => {
        console.log(`   ${index + 1}. "${product.name}"`);
        console.log(`      🆔 ID: ${product.id}`);
        console.log(`      📝 الوصف: ${product.description || 'بدون وصف'}`);
      });
      
      // فحص إذا كان هناك منتجات من شركات أخرى
      console.log('\n🔍 فحص تسريب من شركات أخرى...');
      
      const otherCompanyProducts = await this.prisma.product.findMany({
        where: { 
          companyId: { not: companyId }
        },
        select: { 
          id: true, 
          name: true, 
          companyId: true,
          description: true 
        }
      });
      
      console.log(`📦 منتجات الشركات الأخرى: ${otherCompanyProducts.length}`);
      
      otherCompanyProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. "${product.name}" (شركة: ${product.companyId})`);
        
        // فحص إذا كان اسم المنتج يحتوي على "الشركة الأولى"
        if (product.name.includes('الشركة الأولى') || product.name.includes('الأولى')) {
          console.log(`      🚨 هذا المنتج قد يكون السبب في التسريب!`);
        }
      });
      
    } catch (error) {
      console.error('❌ خطأ في فحص RAG:', error.message);
    }
  }
  
  async checkConversationIsolation() {
    console.log('\n💬 فحص عزل المحادثات...');
    
    try {
      const conversationId = 'cme9y5y7t001rufr85z7y3if4'; // من اللوج
      
      console.log(`🔍 فحص المحادثة: ${conversationId}`);
      
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          customer: {
            select: { id: true, name: true, companyId: true }
          }
        }
      });
      
      if (conversation) {
        console.log(`✅ المحادثة موجودة:`);
        console.log(`   🆔 ID: ${conversation.id}`);
        console.log(`   🏢 Company ID: ${conversation.companyId}`);
        console.log(`   👤 العميل: ${conversation.customer.name}`);
        console.log(`   🏢 شركة العميل: ${conversation.customer.companyId}`);
        
        // فحص الرسائل
        const messages = await this.prisma.message.findMany({
          where: { conversationId: conversationId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            content: true,
            sender: true,
            createdAt: true
          }
        });
        
        console.log(`\n📨 آخر ${messages.length} رسائل:`);
        messages.forEach((message, index) => {
          console.log(`   ${index + 1}. ${message.sender}: "${message.content.substring(0, 50)}..."`);
          console.log(`      🕐 ${message.createdAt}`);
        });
        
      } else {
        console.log('❌ المحادثة غير موجودة');
      }
      
    } catch (error) {
      console.error('❌ خطأ في فحص المحادثة:', error.message);
    }
  }
  
  async findProductLeakSource() {
    console.log('\n🕵️ البحث عن مصدر تسريب "منتج الشركة الأولى"...');
    
    try {
      // البحث في جميع المنتجات
      const suspiciousProducts = await this.prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: 'الشركة الأولى' } },
            { name: { contains: 'الأولى' } },
            { description: { contains: 'الشركة الأولى' } },
            { description: { contains: 'الأولى' } }
          ]
        },
        select: {
          id: true,
          name: true,
          description: true,
          companyId: true
        }
      });
      
      console.log(`🔍 تم العثور على ${suspiciousProducts.length} منتج مشبوه:`);
      
      suspiciousProducts.forEach((product, index) => {
        console.log(`\n${index + 1}. 🚨 منتج مشبوه:`);
        console.log(`   📛 الاسم: "${product.name}"`);
        console.log(`   📝 الوصف: "${product.description || 'بدون وصف'}"`);
        console.log(`   🏢 Company ID: ${product.companyId}`);
        console.log(`   🆔 Product ID: ${product.id}`);
        
        if (product.companyId !== 'cme8oj1fo000cufdcg2fquia9') {
          console.log(`   🚨 هذا المنتج ينتمي لشركة أخرى!`);
        }
      });
      
      // البحث في الكلمات المفتاحية
      const keywordProducts = await this.prisma.product.findMany({
        where: {
          keywords: { contains: 'الشركة' }
        },
        select: {
          id: true,
          name: true,
          keywords: true,
          companyId: true
        }
      });
      
      if (keywordProducts.length > 0) {
        console.log(`\n🔍 منتجات بكلمات مفتاحية مشبوهة: ${keywordProducts.length}`);
        keywordProducts.forEach((product, index) => {
          console.log(`   ${index + 1}. "${product.name}" - Keywords: "${product.keywords}"`);
          console.log(`      🏢 Company: ${product.companyId}`);
        });
      }
      
    } catch (error) {
      console.error('❌ خطأ في البحث عن التسريب:', error.message);
    }
  }
  
  async generateEmergencyReport() {
    console.log('\n🚨 تقرير الطوارئ للعزل:');
    console.log('═'.repeat(60));
    
    console.log('📋 الملخص:');
    console.log('   🔍 تم اكتشاف تسريب محتمل في البيانات');
    console.log('   📦 المنتج المشبوه: "منتج الشركة الأولى"');
    console.log('   👤 العميل: سولا 132');
    console.log('   💬 المحادثة: cme9y5y7t001rufr85z7y3if4');
    
    console.log('\n🎯 التوصيات العاجلة:');
    console.log('   1. فحص فوري لجميع المنتجات');
    console.log('   2. التأكد من عزل RAG');
    console.log('   3. مراجعة آلية تحميل البيانات');
    console.log('   4. إصلاح أي تسريب مكتشف');
  }
  
  async cleanup() {
    await this.prisma.$disconnect();
  }
}

// تشغيل الفحص العاجل
async function runEmergencyCheck() {
  const checker = new EmergencyIsolationChecker();
  
  try {
    await checker.checkProductIsolation();
    await checker.checkRAGIsolation();
    await checker.checkConversationIsolation();
    await checker.findProductLeakSource();
    await checker.generateEmergencyReport();
    
  } catch (error) {
    console.error('💥 خطأ في الفحص العاجل:', error);
  } finally {
    await checker.cleanup();
  }
}

runEmergencyCheck();
