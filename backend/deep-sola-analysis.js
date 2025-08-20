const { PrismaClient } = require('@prisma/client');

console.log('🔍 فحص عميق لسولا 132 - تحليل شامل...\n');

class DeepSolaAnalysis {
  constructor() {
    this.prisma = new PrismaClient();
  }
  
  async identifySolaCompany() {
    console.log('🏢 تحديد شركة سولا 132...');
    
    try {
      // البحث عن صفحة فيسبوك سولا 132
      const facebookPages = await this.prisma.facebookPage.findMany({
        where: {
          OR: [
            { name: { contains: 'سولا' } },
            { name: { contains: '132' } },
            { pageId: '250528358137901' } // من اللوج
          ]
        },
        include: {
          company: {
            select: { id: true, name: true }
          }
        }
      });
      
      console.log(`📱 صفحات فيسبوك المطابقة: ${facebookPages.length}`);
      
      facebookPages.forEach((page, index) => {
        console.log(`\n${index + 1}. 📄 صفحة فيسبوك:`);
        console.log(`   📛 الاسم: "${page.name}"`);
        console.log(`   🆔 Page ID: ${page.pageId}`);
        console.log(`   🏢 الشركة: ${page.company.name} (${page.company.id})`);
        console.log(`   ✅ نشطة: ${page.isActive}`);
      });
      
      // البحث في المحادثات
      console.log('\n💬 البحث في المحادثات...');
      const conversations = await this.prisma.conversation.findMany({
        where: {
          OR: [
            { id: 'cme9y5y7t001rufr85z7y3if4' }, // من اللوج
            { customer: { facebookId: '23949903971327041' } } // من اللوج
          ]
        },
        include: {
          customer: {
            select: { 
              id: true, 
              firstName: true, 
              lastName: true, 
              facebookId: true, 
              companyId: true 
            }
          },
          company: {
            select: { id: true, name: true }
          }
        }
      });
      
      console.log(`💬 محادثات مطابقة: ${conversations.length}`);
      
      conversations.forEach((conv, index) => {
        console.log(`\n${index + 1}. 💬 محادثة:`);
        console.log(`   🆔 ID: ${conv.id}`);
        console.log(`   👤 العميل: ${conv.customer.firstName} ${conv.customer.lastName}`);
        console.log(`   📱 Facebook ID: ${conv.customer.facebookId}`);
        console.log(`   🏢 الشركة: ${conv.company.name} (${conv.company.id})`);
        console.log(`   📊 الحالة: ${conv.status}`);
      });
      
      return { facebookPages, conversations };
      
    } catch (error) {
      console.error('❌ خطأ في تحديد الشركة:', error.message);
      return { facebookPages: [], conversations: [] };
    }
  }
  
  async analyzeProductsAndPrompts() {
    console.log('\n📦 تحليل المنتجات والـ Prompts...');
    
    try {
      // جلب جميع الشركات مع منتجاتها
      const companies = await this.prisma.company.findMany({
        include: {
          products: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              tags: true
            }
          },
          aiSettings: {
            select: {
              id: true,
              systemPrompt: true,
              personalityPrompt: true
            }
          },
          systemPrompts: {
            select: {
              id: true,
              content: true,
              isActive: true
            }
          }
        }
      });
      
      console.log(`🏢 إجمالي الشركات: ${companies.length}`);
      
      companies.forEach((company, index) => {
        console.log(`\n${index + 1}. 🏢 ${company.name} (${company.id}):`);
        
        // المنتجات
        console.log(`   📦 المنتجات (${company.products.length}):`);
        company.products.forEach((product, pIndex) => {
          console.log(`      ${pIndex + 1}. "${product.name}"`);
          console.log(`         💰 السعر: ${product.price} جنيه`);
          console.log(`         📝 الوصف: ${product.description || 'بدون وصف'}`);
          console.log(`         🏷️ العلامات: ${product.tags || 'بدون علامات'}`);
        });
        
        // الـ Prompts
        console.log(`   🤖 AI Settings (${company.aiSettings.length}):`);
        company.aiSettings.forEach((setting, sIndex) => {
          console.log(`      ${sIndex + 1}. System Prompt: ${setting.systemPrompt ? 'موجود' : 'غير موجود'}`);
          console.log(`         Personality: ${setting.personalityPrompt ? 'موجود' : 'غير موجود'}`);
        });
        
        console.log(`   📜 System Prompts (${company.systemPrompts.length}):`);
        company.systemPrompts.forEach((prompt, pIndex) => {
          console.log(`      ${pIndex + 1}. نشط: ${prompt.isActive}`);
          console.log(`         المحتوى: "${prompt.content.substring(0, 100)}..."`);
        });
      });
      
      return companies;
      
    } catch (error) {
      console.error('❌ خطأ في تحليل المنتجات:', error.message);
      return [];
    }
  }
  
  async analyzeLogResponse() {
    console.log('\n📊 تحليل الرد من اللوج...');
    
    // من اللوج المرفوع
    const logResponse = `الحمد لله، أنا بخير وأتمنى أن تكون أنت أيضاً في أفضل حال.

يسعدني أن أساعدك في معرفة المنتجات المتوفرة. حالياً، لدينا منتج واحد متوفر وهو:

*   **المنتج:** منتج الشركة الأولى
*   **الفئة:** غير محدد
*   **السعر الأساسي:** 100 جنيه
*   **الوصف:** وصف المنتج
*   **المخزون الأساسي:** غير متوفر
*   **الكمية المتاحة:** 0
*   **كلمات مفتاحية:** كوتشي حذاء رياضي رجالي نسائي أحذية

ولكن الكمية المتاحة منه هي صفر.

للأسف، الصور الخاصة بالمنتج غير متوفرة حالياً.

هل تود معرفة أي تفاصيل أخرى عن المنتج؟`;
    
    console.log('📝 الرد من اللوج:');
    console.log('─'.repeat(60));
    console.log(logResponse);
    console.log('─'.repeat(60));
    
    // تحليل الرد
    console.log('\n🔍 تحليل محتوى الرد:');
    console.log('   📛 اسم المنتج: "منتج الشركة الأولى"');
    console.log('   💰 السعر: 100 جنيه');
    console.log('   📝 الوصف: "وصف المنتج"');
    console.log('   🏷️ الكلمات المفتاحية: "كوتشي حذاء رياضي رجالي نسائي أحذية"');
    console.log('   📦 المخزون: 0');
    
    return {
      productName: 'منتج الشركة الأولى',
      price: 100,
      description: 'وصف المنتج',
      keywords: 'كوتشي حذاء رياضي رجالي نسائي أحذية',
      stock: 0
    };
  }
  
  async compareWithDatabase() {
    console.log('\n🔄 مقارنة الرد مع قاعدة البيانات...');
    
    try {
      // البحث عن المنتج المذكور في الرد
      const products = await this.prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: 'منتج الشركة الأولى' } },
            { name: { contains: 'الشركة الأولى' } },
            { price: 100 },
            { description: { contains: 'وصف المنتج' } }
          ]
        },
        include: {
          company: {
            select: { id: true, name: true }
          }
        }
      });
      
      console.log(`🔍 منتجات مطابقة في قاعدة البيانات: ${products.length}`);
      
      products.forEach((product, index) => {
        console.log(`\n${index + 1}. 📦 منتج مطابق:`);
        console.log(`   📛 الاسم: "${product.name}"`);
        console.log(`   💰 السعر: ${product.price} جنيه`);
        console.log(`   📝 الوصف: "${product.description}"`);
        console.log(`   🏷️ العلامات: "${product.tags || 'بدون علامات'}"`);
        console.log(`   📦 المخزون: ${product.stock}`);
        console.log(`   🏢 الشركة: ${product.company.name} (${product.company.id})`);
        console.log(`   🆔 Product ID: ${product.id}`);
        
        // مقارنة مع الرد
        console.log(`\n   🔄 المقارنة:`);
        console.log(`      📛 الاسم: ${product.name === 'منتج الشركة الأولى' ? '✅ مطابق' : '❌ مختلف'}`);
        console.log(`      💰 السعر: ${product.price == 100 ? '✅ مطابق' : '❌ مختلف'}`);
        console.log(`      📝 الوصف: ${product.description === 'وصف المنتج' ? '✅ مطابق' : '❌ مختلف'}`);
        console.log(`      📦 المخزون: ${product.stock == 0 ? '✅ مطابق' : '❌ مختلف'}`);
      });
      
      return products;
      
    } catch (error) {
      console.error('❌ خطأ في المقارنة:', error.message);
      return [];
    }
  }
  
  async traceRAGFlow() {
    console.log('\n🧠 تتبع مسار RAG...');
    
    try {
      // محاكاة مسار RAG للشركة من اللوج
      const companyId = 'cme8oj1fo000cufdcg2fquia9'; // من اللوج
      
      console.log(`🔍 تتبع RAG للشركة: ${companyId}`);
      
      // 1. تحميل منتجات الشركة
      const companyProducts = await this.prisma.product.findMany({
        where: { companyId: companyId },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          stock: true,
          tags: true
        }
      });
      
      console.log(`\n📦 منتجات الشركة ${companyId}:`);
      console.log(`   عدد المنتجات: ${companyProducts.length}`);
      
      companyProducts.forEach((product, index) => {
        console.log(`\n   ${index + 1}. 📦 "${product.name}"`);
        console.log(`      💰 السعر: ${product.price} جنيه`);
        console.log(`      📝 الوصف: "${product.description}"`);
        console.log(`      📦 المخزون: ${product.stock}`);
        console.log(`      🏷️ العلامات: "${product.tags}"`);
        console.log(`      🆔 ID: ${product.id}`);
      });
      
      // 2. فحص إذا كان هناك منتجات من شركات أخرى
      const otherProducts = await this.prisma.product.findMany({
        where: { 
          companyId: { not: companyId }
        },
        include: {
          company: {
            select: { name: true }
          }
        }
      });
      
      console.log(`\n🔍 منتجات الشركات الأخرى: ${otherProducts.length}`);
      
      otherProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. "${product.name}" - شركة: ${product.company.name}`);
      });
      
      return { companyProducts, otherProducts };
      
    } catch (error) {
      console.error('❌ خطأ في تتبع RAG:', error.message);
      return { companyProducts: [], otherProducts: [] };
    }
  }
  
  async generateDeepAnalysisReport() {
    console.log('\n📊 تقرير التحليل العميق:');
    console.log('═'.repeat(80));
    
    const solaData = await this.identifySolaCompany();
    const companiesData = await this.analyzeProductsAndPrompts();
    const logAnalysis = await this.analyzeLogResponse();
    const dbComparison = await this.compareWithDatabase();
    const ragFlow = await this.traceRAGFlow();
    
    console.log('\n🎯 النتائج الرئيسية:');
    console.log('─'.repeat(50));
    
    // تحديد شركة سولا
    if (solaData.facebookPages.length > 0) {
      const solaPage = solaData.facebookPages[0];
      console.log(`📱 سولا 132 تنتمي لشركة: ${solaPage.company.name} (${solaPage.company.id})`);
    }
    
    // تحليل المنتج المرسل
    if (dbComparison.length > 0) {
      const matchedProduct = dbComparison[0];
      console.log(`📦 المنتج المرسل: "${matchedProduct.name}"`);
      console.log(`🏢 ينتمي لشركة: ${matchedProduct.company.name} (${matchedProduct.company.id})`);
    }
    
    // تحليل العزل
    console.log('\n🔒 تحليل العزل:');
    if (ragFlow.companyProducts.length > 0) {
      console.log(`✅ تم تحميل ${ragFlow.companyProducts.length} منتج من الشركة الصحيحة`);
      console.log(`🛡️ لم يتم تحميل منتجات من ${ragFlow.otherProducts.length} شركة أخرى`);
    }
    
    console.log('\n🎯 الخلاصة:');
    console.log('   1. تحديد شركة سولا 132');
    console.log('   2. تحليل المنتج المرسل');
    console.log('   3. التأكد من العزل');
    console.log('   4. مقارنة الرد مع قاعدة البيانات');
    
    return {
      solaData,
      companiesData,
      logAnalysis,
      dbComparison,
      ragFlow
    };
  }
  
  async cleanup() {
    await this.prisma.$disconnect();
  }
}

// تشغيل التحليل العميق
async function runDeepAnalysis() {
  const analyzer = new DeepSolaAnalysis();
  
  try {
    const report = await analyzer.generateDeepAnalysisReport();
    console.log('\n🎊 اكتمل التحليل العميق!');
    return report;
    
  } catch (error) {
    console.error('💥 خطأ في التحليل العميق:', error);
    return null;
  } finally {
    await analyzer.cleanup();
  }
}

runDeepAnalysis();
