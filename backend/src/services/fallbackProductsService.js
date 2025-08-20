/**
 * نظام بديل لعرض المنتجات بدون AI
 * يستخدم عندما يكون Gemini API غير متاح
 */

const ProductsPromptBuilder = require('./productsPromptBuilder');

class FallbackProductsService {
  constructor() {
    this.productsPromptBuilder = new ProductsPromptBuilder();
  }

  /**
   * تحليل بسيط للرسالة لتحديد نوع الطلب
   */
  analyzeMessage(message) {
    const text = message.toLowerCase().trim();
    
    // إزالة علامات الترقيم والكلمات الزائدة
    const cleanText = text
      .replace(/[؟!.،]/g, '')
      .replace(/\s+/g, ' ');
    
    // تحليل النية
    if (cleanText.includes('شائع') || cleanText.includes('مشهور') || cleanText.includes('أفضل') || cleanText.includes('أكثر مبيع')) {
      return 'popular';
    }
    
    if (cleanText.includes('جديد') || cleanText.includes('حديث') || cleanText.includes('آخر') || cleanText.includes('أحدث')) {
      return 'new';
    }
    
    if (cleanText.includes('كوتشي') || cleanText.includes('حذاء') || cleanText.includes('أحذية') || cleanText.includes('كوتشيات')) {
      return 'shoes';
    }
    
    if (cleanText.includes('سعر') || cleanText.includes('جنيه') || cleanText.includes('رخيص') || cleanText.includes('غالي')) {
      return 'price';
    }
    
    if (cleanText.includes('منتج') || cleanText.includes('موجود') || cleanText.includes('عندك') || cleanText.includes('متوفر')) {
      return 'general';
    }
    
    if (cleanText.includes('مرحبا') || cleanText.includes('السلام') || cleanText.includes('أهلا') || cleanText.includes('ازيك')) {
      return 'greeting';
    }
    
    // إذا لم يفهم، يعتبره طلب عام
    return 'general';
  }

  /**
   * بناء رد مناسب بناءً على نوع الطلب
   */
  async buildResponse(message, companyId) {
    try {
      const intent = this.analyzeMessage(message);
      console.log(`🎯 تحليل الرسالة: "${message}" -> النية: ${intent}`);
      
      // جلب المنتجات
      const products = await this.productsPromptBuilder.fetchCompanyProducts(companyId);
      
      if (!products || products.length === 0) {
        return this.buildNoProductsResponse();
      }
      
      switch (intent) {
        case 'greeting':
          return this.buildGreetingResponse(products.slice(0, 3));
          
        case 'popular':
          return this.buildPopularResponse(products.slice(0, 5));
          
        case 'new':
          return this.buildNewResponse(products.slice(0, 5));
          
        case 'shoes':
          return this.buildShoesResponse(products);
          
        case 'price':
          return this.buildPriceResponse(products);
          
        case 'general':
        default:
          return this.buildGeneralResponse(products.slice(0, 5));
      }
      
    } catch (error) {
      console.error('❌ خطأ في بناء الرد:', error);
      return this.buildErrorResponse();
    }
  }

  /**
   * رد التحية مع عرض بعض المنتجات
   */
  buildGreetingResponse(products) {
    let response = "أهلاً وسهلاً! 😊 مرحباً بك في متجرنا\n\n";
    response += "إليك بعض منتجاتنا المميزة:\n\n";
    
    products.forEach((product, index) => {
      const name = product.name || 'منتج مميز';
      const price = product.price ? parseFloat(product.price) : 0;
      const stock = product.stock > 0 ? 'متوفر' : 'نافد';
      
      response += `${index + 1}. ${name}\n`;
      response += `   💰 ${price} جنيه\n`;
      response += `   📦 ${stock}\n\n`;
    });
    
    response += "كيف يمكنني مساعدتك اليوم؟ 🛍️";
    return response;
  }

  /**
   * رد المنتجات الشائعة
   */
  buildPopularResponse(products) {
    let response = "🔥 إليك أشهر منتجاتنا والأكثر مبيعاً:\n\n";
    
    products.forEach((product, index) => {
      const name = product.name || 'منتج مميز';
      const price = product.price ? parseFloat(product.price) : 0;
      const description = product.description || 'منتج عالي الجودة';
      const stock = product.stock > 0 ? 'متوفر' : 'نافد';
      
      response += `⭐ ${index + 1}. ${name}\n`;
      response += `   💰 السعر: ${price} جنيه\n`;
      response += `   📝 ${description}\n`;
      response += `   📦 الحالة: ${stock}\n\n`;
    });
    
    response += "أي منتج يعجبك؟ يمكنني إعطاؤك المزيد من التفاصيل! 😊";
    return response;
  }

  /**
   * رد المنتجات الجديدة
   */
  buildNewResponse(products) {
    let response = "🆕 إليك أحدث منتجاتنا:\n\n";
    
    products.forEach((product, index) => {
      const name = product.name || 'منتج جديد';
      const price = product.price ? parseFloat(product.price) : 0;
      const description = product.description || 'منتج حديث وعصري';
      const stock = product.stock > 0 ? 'متوفر' : 'نافد';
      
      response += `✨ ${index + 1}. ${name}\n`;
      response += `   💰 السعر: ${price} جنيه\n`;
      response += `   📝 ${description}\n`;
      response += `   📦 الحالة: ${stock}\n\n`;
    });
    
    response += "هل تريد معرفة المزيد عن أي منتج؟ 🤔";
    return response;
  }

  /**
   * رد الأحذية
   */
  buildShoesResponse(products) {
    // فلترة الأحذية
    const shoes = products.filter(product => 
      product.name?.toLowerCase().includes('كوتشي') ||
      product.name?.toLowerCase().includes('حذاء') ||
      product.category?.name?.toLowerCase().includes('أحذية')
    );
    
    if (shoes.length === 0) {
      return "عذراً، لا توجد أحذية متاحة حالياً. 😔\n\nلكن لدينا منتجات أخرى رائعة! هل تريد رؤيتها؟";
    }
    
    let response = "👠 إليك تشكيلة الأحذية المتاحة:\n\n";
    
    shoes.slice(0, 5).forEach((product, index) => {
      const name = product.name || 'حذاء أنيق';
      const price = product.price ? parseFloat(product.price) : 0;
      const description = product.description || 'حذاء مريح وأنيق';
      const stock = product.stock > 0 ? 'متوفر' : 'نافد';
      
      response += `👟 ${index + 1}. ${name}\n`;
      response += `   💰 السعر: ${price} جنيه\n`;
      response += `   📝 ${description}\n`;
      response += `   📦 الحالة: ${stock}\n\n`;
    });
    
    response += "أي حذاء يعجبك؟ يمكنني إعطاؤك تفاصيل أكثر! 👍";
    return response;
  }

  /**
   * رد الأسعار
   */
  buildPriceResponse(products) {
    // ترتيب المنتجات حسب السعر
    const sortedProducts = products
      .filter(product => product.price && product.price > 0)
      .sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    
    if (sortedProducts.length === 0) {
      return "عذراً، لا توجد معلومات أسعار متاحة حالياً. 😔";
    }
    
    let response = "💰 إليك منتجاتنا مرتبة حسب السعر:\n\n";
    
    sortedProducts.slice(0, 5).forEach((product, index) => {
      const name = product.name || 'منتج مميز';
      const price = parseFloat(product.price);
      const stock = product.stock > 0 ? 'متوفر' : 'نافد';
      
      response += `💵 ${index + 1}. ${name}\n`;
      response += `   💰 السعر: ${price} جنيه\n`;
      response += `   📦 الحالة: ${stock}\n\n`;
    });
    
    response += "هل تريد منتجات في نطاق سعري معين؟ 🤔";
    return response;
  }

  /**
   * رد عام
   */
  buildGeneralResponse(products) {
    let response = "مرحباً بك! 😊 إليك مجموعة من منتجاتنا:\n\n";
    
    products.forEach((product, index) => {
      const name = product.name || 'منتج مميز';
      const price = product.price ? parseFloat(product.price) : 0;
      const stock = product.stock > 0 ? 'متوفر' : 'نافد';
      
      response += `🛍️ ${index + 1}. ${name}\n`;
      response += `   💰 ${price} جنيه\n`;
      response += `   📦 ${stock}\n\n`;
    });
    
    response += "هل تبحث عن شيء محدد؟ يمكنني مساعدتك! 🤝";
    return response;
  }

  /**
   * رد عدم وجود منتجات
   */
  buildNoProductsResponse() {
    return "عذراً، لا توجد منتجات متاحة حالياً. 😔\n\nيرجى المحاولة مرة أخرى لاحقاً أو التواصل مع خدمة العملاء.";
  }

  /**
   * رد الخطأ
   */
  buildErrorResponse() {
    return "عذراً، حدث خطأ مؤقت. 😔\n\nيرجى المحاولة مرة أخرى أو التواصل مع خدمة العملاء للمساعدة.";
  }

  /**
   * توليد رد كامل
   */
  async generateResponse(message, conversationHistory = [], companyId) {
    const startTime = Date.now();
    
    try {
      console.log(`🔄 النظام البديل - توليد رد للرسالة: "${message}"`);
      console.log(`🏢 معرف الشركة: ${companyId}`);
      
      const response = await this.buildResponse(message, companyId);
      const responseTime = Date.now() - startTime;
      
      console.log(`✅ تم توليد الرد بنجاح في ${responseTime}ms`);
      
      return {
        success: true,
        data: {
          response: response,
          systemType: 'fallback-products',
          confidence: 0.8,
          usedProducts: true
        },
        metadata: {
          model: 'fallback',
          responseTime,
          hasProductsPrompt: true,
          contextLength: response.length
        }
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      console.error('❌ خطأ في النظام البديل:', error);
      
      return {
        success: false,
        error: error.message,
        data: {
          response: this.buildErrorResponse(),
          systemType: 'fallback-products',
          confidence: 0.3
        },
        metadata: {
          model: 'fallback',
          responseTime,
          error: true
        }
      };
    }
  }
}

module.exports = FallbackProductsService;
