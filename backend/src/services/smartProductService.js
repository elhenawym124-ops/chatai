/**
 * خدمة المنتجات الذكية
 * تدير عرض المنتجات بشكل طبيعي وذكي حسب السياق
 */

const { PrismaClient } = require('@prisma/client');

class SmartProductService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * الحصول على المنتجات بشكل ذكي حسب السياق
   */
  async getContextualProducts(companyId, message, intentAnalysis) {
    try {
      const { type, needsProducts } = intentAnalysis;
      
      if (!needsProducts) {
        return {
          success: true,
          products: [],
          shouldDisplay: false,
          reason: 'لا يحتاج منتجات في هذا السياق'
        };
      }

      // جلب المنتجات من قاعدة البيانات
      const products = await this.prisma.product.findMany({
        where: { 
          companyId,
          isActive: true 
        },
        include: {
          category: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 3 // عدد محدود من المنتجات
      });

      if (products.length === 0) {
        return {
          success: false,
          products: [],
          shouldDisplay: false,
          reason: 'لا توجد منتجات متاحة'
        };
      }

      // تصفية المنتجات حسب الرسالة
      const filteredProducts = this.filterProductsByMessage(products, message);
      
      // تنسيق المنتجات للعرض
      const formattedProducts = this.formatProductsForDisplay(filteredProducts, type);

      return {
        success: true,
        products: formattedProducts,
        shouldDisplay: true,
        displayStyle: this.getDisplayStyle(type),
        reason: 'منتجات مناسبة للسياق'
      };

    } catch (error) {
      console.error('❌ خطأ في جلب المنتجات الذكية:', error);
      return {
        success: false,
        products: [],
        shouldDisplay: false,
        reason: 'خطأ في النظام'
      };
    }
  }

  /**
   * تصفية المنتجات حسب الرسالة
   */
  filterProductsByMessage(products, message) {
    const text = message.toLowerCase();
    
    // البحث عن كلمات مفتاحية
    const keywords = {
      shoes: ['كوتشي', 'حذاء', 'أحذية', 'جزمة'],
      clothes: ['ملابس', 'قميص', 'بنطلون', 'فستان'],
      accessories: ['اكسسوار', 'ساعة', 'حقيبة', 'محفظة']
    };

    // إذا ذكر نوع معين من المنتجات
    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => text.includes(word))) {
        const filtered = products.filter(product => 
          product.name.toLowerCase().includes(words[0]) ||
          product.description?.toLowerCase().includes(words[0]) ||
          product.category?.name.toLowerCase().includes(category)
        );
        if (filtered.length > 0) return filtered;
      }
    }

    // إذا لم يذكر نوع معين، أرجع كل المنتجات
    return products;
  }

  /**
   * تنسيق المنتجات للعرض
   */
  formatProductsForDisplay(products, messageType) {
    return products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency || 'EGP',
      description: product.description,
      image: product.image,
      category: product.category?.name,
      displayText: this.generateProductDisplayText(product, messageType)
    }));
  }

  /**
   * توليد نص عرض المنتج
   */
  generateProductDisplayText(product, messageType) {
    const price = `${product.price} ${product.currency || 'EGP'}`;
    
    switch (messageType) {
      case 'product_request':
        return `${product.name} - ${price}`;
      
      case 'product_inquiry':
        return `${product.name}\nالسعر: ${price}\n${product.description || ''}`;
      
      case 'service_inquiry':
        return `${product.name} - ${price} (+ 50 جنيه شحن)`;
      
      default:
        return `${product.name} - ${price}`;
    }
  }

  /**
   * تحديد أسلوب العرض
   */
  getDisplayStyle(messageType) {
    switch (messageType) {
      case 'product_request':
        return 'grid'; // عرض شبكي
      
      case 'product_inquiry':
        return 'detailed'; // عرض مفصل
      
      case 'service_inquiry':
        return 'simple'; // عرض بسيط
      
      default:
        return 'grid';
    }
  }

  /**
   * توليد رسالة عرض المنتجات
   */
  generateProductMessage(products, displayStyle, baseResponse) {
    if (!products || products.length === 0) {
      return baseResponse;
    }

    let productMessage = baseResponse + '\n\n';

    switch (displayStyle) {
      case 'detailed':
        productMessage += this.generateDetailedProductList(products);
        break;
      
      case 'simple':
        productMessage += this.generateSimpleProductList(products);
        break;
      
      case 'grid':
      default:
        productMessage += this.generateGridProductList(products);
        break;
    }

    // إضافة سؤال تفاعلي
    productMessage += '\n\n' + this.generateInteractiveQuestion(products.length);

    return productMessage;
  }

  /**
   * عرض مفصل للمنتجات
   */
  generateDetailedProductList(products) {
    return products.map((product, index) => 
      `${index + 1}. **${product.name}**\n` +
      `   💰 السعر: ${product.price} ${product.currency}\n` +
      `   📝 ${product.description || 'منتج عالي الجودة'}\n` +
      `   🆔 رقم المنتج: ${product.id}`
    ).join('\n\n');
  }

  /**
   * عرض بسيط للمنتجات
   */
  generateSimpleProductList(products) {
    return products.map((product, index) => 
      `${index + 1}. ${product.name} - ${product.price} ${product.currency}`
    ).join('\n');
  }

  /**
   * عرض شبكي للمنتجات
   */
  generateGridProductList(products) {
    let message = '🛍️ **المنتجات المتاحة:**\n\n';
    
    message += products.map((product, index) => 
      `${index + 1}. **${product.name}**\n` +
      `   💰 ${product.price} ${product.currency}\n` +
      `   🆔 ${product.id}`
    ).join('\n\n');

    return message;
  }

  /**
   * توليد سؤال تفاعلي
   */
  generateInteractiveQuestion(productCount) {
    if (productCount === 1) {
      return 'ايه رأيك في المنتج ده؟ عجبك ولا تشوف حاجة تانية؟ 👀';
    } else if (productCount === 2) {
      return 'أي واحد فيهم عجبك؟ ولا عايز تشوف تفاصيل أكتر؟ 🤔';
    } else {
      return 'أي منتج فيهم لفت نظرك؟ عايز تعرف تفاصيل أكتر عن أي واحد؟ ✨';
    }
  }

  /**
   * إضافة صور المنتجات
   */
  async getProductImages(products) {
    const images = [];
    
    for (const product of products) {
      if (product.image) {
        images.push({
          productId: product.id,
          productName: product.name,
          imageUrl: product.image,
          caption: `${product.name} - ${product.price} ${product.currency}`
        });
      }
    }

    return images;
  }

  /**
   * تتبع تفاعل العميل مع المنتجات
   */
  async trackProductInteraction(companyId, customerId, productId, interactionType) {
    try {
      // حفظ التفاعل في قاعدة البيانات للتحليل لاحقاً
      console.log(`📊 تفاعل العميل: ${customerId} مع المنتج: ${productId} - ${interactionType}`);
      
      // يمكن إضافة جدول للتفاعلات لاحقاً
      return true;
    } catch (error) {
      console.error('❌ خطأ في تتبع التفاعل:', error);
      return false;
    }
  }

  /**
   * إغلاق الاتصال
   */
  async disconnect() {
    await this.prisma.$disconnect();
  }
}

module.exports = SmartProductService;
