const ProductSearchService = require('./productSearchService');
const { validateFunctionCall } = require('./geminiToolsService');

/**
 * معالج استدعاءات الدوال من Gemini
 * يتولى تنفيذ الدوال المطلوبة وإرجاع النتائج
 */
class FunctionCallHandler {
  constructor() {
    this.productSearchService = new ProductSearchService();
  }

  /**
   * معالجة استدعاء دالة من Gemini
   */
  async handleFunctionCall(functionCall, companyId) {
    try {
      console.log(`🔧 معالجة استدعاء دالة: ${functionCall.name}`);
      console.log(`📋 المعاملات:`, functionCall.args);

      // التحقق من صحة الاستدعاء
      const validation = validateFunctionCall(functionCall);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
          data: null
        };
      }

      // إضافة companyId للمعاملات إذا لم يكن موجوداً
      const args = {
        ...functionCall.args,
        companyId: companyId
      };

      // تنفيذ الدالة المطلوبة
      switch (functionCall.name) {
        case 'search_products':
          return await this.handleSearchProducts(args);
          
        case 'get_product_details':
          return await this.handleGetProductDetails(args);
          
        case 'get_products_by_category':
          return await this.handleGetProductsByCategory(args);
          
        case 'get_popular_products':
          return await this.handleGetPopularProducts(args);
          
        case 'get_new_products':
          return await this.handleGetNewProducts(args);
          
        case 'get_products_by_price_range':
          return await this.handleGetProductsByPriceRange(args);
          
        case 'get_available_categories':
          return await this.handleGetAvailableCategories(args);
          
        case 'get_product_stats':
          return await this.handleGetProductStats(args);
          
        case 'analyze_customer_intent':
          return await this.handleAnalyzeCustomerIntent(args);
          
        case 'suggest_related_products':
          return await this.handleSuggestRelatedProducts(args);
          
        default:
          return {
            success: false,
            error: `دالة غير مدعومة: ${functionCall.name}`,
            data: null
          };
      }

    } catch (error) {
      console.error(`❌ خطأ في معالجة استدعاء الدالة:`, error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * معالجة البحث في المنتجات
   */
  async handleSearchProducts(args) {
    const { keywords = '', category, priceMin, priceMax, inStock, limit = 10, companyId } = args;
    
    const filters = {
      category,
      priceMin,
      priceMax,
      inStock,
      limit: Math.min(limit, 20), // حد أقصى 20 منتج
      companyId
    };

    return await this.productSearchService.searchProducts(keywords, filters);
  }

  /**
   * معالجة جلب تفاصيل منتج
   */
  async handleGetProductDetails(args) {
    const { productId, companyId } = args;
    return await this.productSearchService.getProductDetails(productId, companyId);
  }

  /**
   * معالجة جلب منتجات حسب الفئة
   */
  async handleGetProductsByCategory(args) {
    const { categoryName, limit = 10, companyId } = args;
    return await this.productSearchService.getProductsByCategory(categoryName, companyId, limit);
  }

  /**
   * معالجة جلب المنتجات الشائعة
   */
  async handleGetPopularProducts(args) {
    const { limit = 5, companyId } = args;
    const finalLimit = Math.min(limit, 10); // حد أقصى 10 منتجات
    return await this.productSearchService.getPopularProducts(companyId, finalLimit);
  }

  /**
   * معالجة جلب المنتجات الجديدة
   */
  async handleGetNewProducts(args) {
    const { limit = 5, companyId } = args;
    const finalLimit = Math.min(limit, 10); // حد أقصى 10 منتجات
    return await this.productSearchService.getNewProducts(companyId, finalLimit);
  }

  /**
   * معالجة جلب منتجات بنطاق سعري
   */
  async handleGetProductsByPriceRange(args) {
    const { minPrice, maxPrice, limit = 10, companyId } = args;
    return await this.productSearchService.getProductsByPriceRange(companyId, minPrice, maxPrice, limit);
  }

  /**
   * معالجة جلب الفئات المتاحة
   */
  async handleGetAvailableCategories(args) {
    const { companyId } = args;
    return await this.productSearchService.getAvailableCategories(companyId);
  }

  /**
   * معالجة جلب إحصائيات المنتجات
   */
  async handleGetProductStats(args) {
    const { companyId } = args;
    return await this.productSearchService.getProductStats(companyId);
  }

  /**
   * معالجة تحليل نية العميل
   */
  async handleAnalyzeCustomerIntent(args) {
    const { message } = args;
    
    // تحليل بسيط لنية العميل
    const intent = this.analyzeIntent(message);
    
    return {
      success: true,
      data: {
        message,
        intent: intent.type,
        confidence: intent.confidence,
        keywords: intent.keywords,
        suggestions: intent.suggestions
      }
    };
  }

  /**
   * معالجة اقتراح منتجات مشابهة
   */
  async handleSuggestRelatedProducts(args) {
    const { productId, limit = 3, companyId } = args;
    
    // جلب تفاصيل المنتج الأساسي
    const productResult = await this.productSearchService.getProductDetails(productId, companyId);
    
    if (!productResult.success) {
      return productResult;
    }
    
    const product = productResult.data;
    
    // البحث عن منتجات مشابهة في نفس الفئة
    const relatedResult = await this.productSearchService.getProductsByCategory(
      product.category, 
      companyId, 
      limit + 1 // +1 لاستبعاد المنتج نفسه
    );
    
    if (relatedResult.success) {
      // استبعاد المنتج الأساسي من النتائج
      const filteredProducts = relatedResult.data.filter(p => p.id !== productId);
      
      return {
        success: true,
        data: filteredProducts.slice(0, limit)
      };
    }
    
    return relatedResult;
  }

  /**
   * تحليل نية العميل من رسالته
   */
  analyzeIntent(message) {
    const text = message.toLowerCase();
    
    // كلمات مفتاحية للبحث
    const searchKeywords = ['أريد', 'عايز', 'محتاج', 'ابحث', 'أبحث'];
    const helpKeywords = ['انصحني', 'اقترح', 'ساعدني', 'مش عارف'];
    const priceKeywords = ['رخيص', 'غالي', 'سعر', 'ميزانية', 'فلوس'];
    
    let intent = { type: 'general', confidence: 0.5, keywords: [], suggestions: [] };
    
    if (searchKeywords.some(keyword => text.includes(keyword))) {
      intent = { type: 'search', confidence: 0.8, keywords: ['بحث'], suggestions: ['استخدم البحث المتقدم'] };
    } else if (helpKeywords.some(keyword => text.includes(keyword))) {
      intent = { type: 'help', confidence: 0.9, keywords: ['مساعدة'], suggestions: ['اقتراح منتجات شائعة'] };
    } else if (priceKeywords.some(keyword => text.includes(keyword))) {
      intent = { type: 'price_inquiry', confidence: 0.7, keywords: ['سعر'], suggestions: ['فلترة بالسعر'] };
    }
    
    return intent;
  }

  /**
   * إغلاق الاتصالات
   */
  async disconnect() {
    await this.productSearchService.prisma.$disconnect();
  }
}

module.exports = FunctionCallHandler;
