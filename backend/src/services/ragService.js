const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const prisma = new PrismaClient();

class RAGService {
  constructor() {
    // سيتم تهيئة Gemini عند الحاجة من قاعدة البيانات
    this.genAI = null;
    this.embeddingModel = null;
    this.knowledgeBase = new Map();
    this.isInitialized = false;
    this.initializationPromise = null;
    // إضافة cache للاستفسارات المتكررة
    this.aiChoiceCache = new Map();
    this.cacheMaxSize = 100;
    this.cacheExpiryTime = 30 * 60 * 1000; // 30 دقيقة
    this.initializeKnowledgeBase();
  }

  // ضمان التهيئة قبل أي عملية بحث
  async ensureInitialized() {
    if (this.isInitialized) {
      return true;
    }

    if (this.initializationPromise) {
      await this.initializationPromise;
      return this.isInitialized;
    }

    // انتظار حتى 10 ثوان للتهيئة
    let attempts = 0;
    while (!this.isInitialized && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 200));
      attempts++;
    }

    return this.isInitialized;
  }

  async initializeGemini() {
    if (!this.genAI) {
      // الحصول على مفتاح نشط من قاعدة البيانات
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const activeKey = await prisma.geminiKey.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      });

      if (activeKey) {
        this.genAI = new GoogleGenerativeAI(activeKey.apiKey);
        this.embeddingModel = this.genAI.getGenerativeModel({ model: "embedding-001" });
      }
    }
    return this.genAI !== null;
  }

  async initializeKnowledgeBase(companyId = null) {
    console.log('🧠 Initializing RAG Knowledge Base...');
    if (companyId) {
      console.log(`🏢 [RAG] Initializing for company: ${companyId}`);
    }

    try {
      this.initializationPromise = this._doInitialization(companyId);
      await this.initializationPromise;
      this.isInitialized = true;
      console.log('✅ RAG Knowledge Base initialized');
    } catch (error) {
      console.error('❌ Error initializing RAG:', error);
      console.log('⚠️ [RAG] النظام سيعمل بدون قاعدة المعرفة مؤقتاً');
      console.log('🔄 [RAG] يمكن إعادة المحاولة لاحقاً عند استقرار الاتصال');
      this.isInitialized = false;

      // لا نرمي الخطأ هنا لأن النظام يجب أن يستمر في العمل
      // حتى لو فشل تحميل قاعدة المعرفة
    } finally {
      this.initializationPromise = null;
    }
  }

  // دالة لإعادة محاولة تحميل قاعدة المعرفة
  async retryInitialization() {
    if (this.isInitialized) {
      console.log('✅ [RAG] قاعدة المعرفة محملة بالفعل');
      return true;
    }

    console.log('🔄 [RAG] إعادة محاولة تحميل قاعدة المعرفة...');
    await this.initializeKnowledgeBase();
    return this.isInitialized;
  }

  async _doInitialization(companyId = null) {
    // 🔐 لا نحمل أي منتجات عند التشغيل - سيتم تحميلها عند الطلب فقط
    console.log('🔐 [RAG] تهيئة RAG بدون تحميل منتجات - العزل الكامل مفعل');

    // جلب الأسئلة الشائعة العامة فقط
    await this.loadFAQs(companyId);

    // جلب سياسات الشركة العامة فقط
    await this.loadPolicies(companyId);

    console.log('✅ [RAG] تم تهيئة RAG مع العزل الكامل');
  }

  // 🔐 تحميل منتجات شركة محددة فقط
  async loadProductsForCompany(companyId) {
    if (!companyId) {
      console.log('⚠️ [RAG] لا يمكن تحميل منتجات بدون companyId');
      return;
    }

    // تنظيف المنتجات السابقة
    for (const [key, item] of this.knowledgeBase.entries()) {
      if (item.type === 'product') {
        this.knowledgeBase.delete(key);
      }
    }

    console.log(`🔐 [RAG] تحميل منتجات الشركة: ${companyId}`);
    await this.loadProducts(companyId);
  }

  async loadProducts(companyId = null) {
    let products;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        console.log(`🔄 [RAG] محاولة الاتصال بقاعدة البيانات (${retryCount + 1}/${maxRetries})...`);

        // 🔐 إضافة العزل حسب الشركة
        const whereClause = { isActive: true };
        if (companyId) {
          whereClause.companyId = companyId;
          console.log(`🏢 [RAG] تحميل منتجات الشركة: ${companyId}`);
        } else {
          console.log(`⚠️ [RAG] تحميل جميع المنتجات (لا يوجد companyId)`);
        }

        products = await prisma.product.findMany({
        where: { companyId: companyId },
          where: whereClause,
          include: {
            category: true,
            variants: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' }
            }
          }
        });

        console.log(`✅ [RAG] تم تحميل ${products.length} منتج من قاعدة البيانات بنجاح`);
        break; // نجح الاتصال، اخرج من الحلقة

      } catch (error) {
        retryCount++;
        console.log(`❌ [RAG] فشل في الاتصال (محاولة ${retryCount}/${maxRetries}):`, error.message);

        if (retryCount < maxRetries) {
          console.log(`⏳ [RAG] انتظار 5 ثواني قبل المحاولة التالية...`);
          await new Promise(resolve => setTimeout(resolve, 5000)); // انتظار 5 ثواني
        } else {
          console.log('❌ [RAG] فشل في جميع المحاولات، سيتم استخدام النظام بدون قاعدة بيانات');
          throw error; // إعادة رمي الخطأ بعد فشل جميع المحاولات
        }
      }
    }

    for (const product of products) {
      // معلومات المنتج الأساسية
      let content = `
        المنتج: ${product.name}
        الفئة: ${product.category?.name || 'غير محدد'}
        السعر الأساسي: ${product.price} جنيه
        الوصف: ${product.description || ''}
        المخزون الأساسي: ${product.stock > 0 ? 'متوفر' : 'غير متوفر'}
        الكمية المتاحة: ${product.stock}
        كلمات مفتاحية: كوتشي حذاء رياضي رجالي نسائي أحذية
      `.trim();

      // إضافة معلومات الصور
      let productImages = [];
      try {
        if (product.images) {
          // محاولة تحليل JSON مع معالجة أفضل للأخطاء
          if (typeof product.images === 'string') {
            // تنظيف JSON قبل التحليل
            let cleanImages = product.images.trim();

            // إصلاح JSON المقطوع
            if (!cleanImages.endsWith(']')) {
              console.log('🔧 Fixing truncated JSON...');
              // البحث عن آخر URL كامل
              const lastCompleteUrl = cleanImages.lastIndexOf('","');
              if (lastCompleteUrl > 0) {
                cleanImages = cleanImages.substring(0, lastCompleteUrl + 1) + ']';
              } else {
                // إذا لم نجد URL كامل، نستخدم صور افتراضية
                cleanImages = '["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop","https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop","https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop"]';
              }
            }

            productImages = JSON.parse(cleanImages);
          } else if (Array.isArray(product.images)) {
            productImages = product.images;
          }

          // استخدام ImageHelper لتحليل الصور
          const tempImageInfo = ImageHelper.getImageStatus(productImages);
          if (tempImageInfo.hasImages) {
            content += `\nالصور المتاحة: ${tempImageInfo.count} صورة (${tempImageInfo.status})`;
            console.log(`📸 Loaded ${tempImageInfo.count} validated images for product: ${product.name}`);
          } else {
            content += `\nالصور: ${tempImageInfo.status}`;
            console.log(`⚠️ No valid images found for product: ${product.name}`);
          }
        }
      } catch (error) {
        console.log('⚠️ Error parsing product images:', error.message);
        console.log('🔧 Using fallback images...');
        // استخدام صور افتراضية في حالة الخطأ
        productImages = [
          "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop"
        ];
        content += `\nالصور المتاحة: ${productImages.length} صورة (افتراضية)`;
      }

      // إضافة معلومات المتغيرات إذا وجدت
      if (product.variants && product.variants.length > 0) {
        content += '\n\nالمتغيرات المتاحة:';

        // تجميع المتغيرات حسب النوع
        const variantsByType = {};
        product.variants.forEach(variant => {
          if (!variantsByType[variant.type]) {
            variantsByType[variant.type] = [];
          }
          variantsByType[variant.type].push(variant);
        });

        // إضافة معلومات كل نوع من المتغيرات
        Object.keys(variantsByType).forEach(type => {
          const typeLabel = type === 'color' ? 'الألوان' :
                           type === 'size' ? 'المقاسات' :
                           type === 'style' ? 'الأنماط' : type;

          content += `\n${typeLabel}:`;

          variantsByType[type].forEach(variant => {
            content += `\n  - ${variant.name}: ${variant.price} جنيه (متوفر: ${variant.stock} قطعة)`;
          });
        });

        // إضافة نطاق الأسعار
        const prices = product.variants.map(v => v.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        if (minPrice !== maxPrice) {
          content += `\nنطاق الأسعار: من ${minPrice} إلى ${maxPrice} جنيه`;
        }

        // إضافة إجمالي المخزون
        const totalVariantStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
        content += `\nإجمالي المخزون للمتغيرات: ${totalVariantStock} قطعة`;
      }

      // استخدام ImageHelper لتحليل حالة الصور
      const imageInfo = ImageHelper.getImageStatus(productImages);

      this.knowledgeBase.set(`product_${product.id}`, {
        type: 'product',
        content,
        metadata: {
          id: product.id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          category: product.category?.name,
          companyId: product.companyId, // 🔐 إضافة companyId للعزل
          images: imageInfo.validImages, // الصور المتحققة فقط
          // معلومات الصور الجديدة
          imageStatus: imageInfo.status,
          imageCount: imageInfo.count,
          hasValidImages: imageInfo.hasImages,
          variants: product.variants?.map(v => {
            // معالجة صور المتغير
            let variantImages = [];
            if (v.images) {
              try {
                const parsedImages = JSON.parse(v.images);
                if (Array.isArray(parsedImages)) {
                  variantImages = parsedImages;
                }
              } catch (error) {
                console.log(`⚠️ [RAG] Failed to parse variant images for ${v.name}: ${error.message}`);
              }
            }

            return {
              id: v.id,
              name: v.name,
              type: v.type,
              price: v.price,
              stock: v.stock,
              images: variantImages, // ✅ إضافة صور المتغير
              hasImages: variantImages.length > 0
            };
          }) || []
        }
      });
    }

    console.log(`📦 Loaded ${products.length} products with variants to knowledge base`);
  }

  async loadFAQs(companyId = null) {
    // 🔐 في المستقبل، يمكن جلب FAQs من قاعدة البيانات حسب الشركة
    // const faqs = await prisma.faq.findMany({ where: { companyId } });

    const faqs = [
      {
        question: 'ما هي طرق الدفع المتاحة؟',
        answer: 'نقبل الدفع نقداً عند الاستلام، أو عن طريق فودافون كاش، أو التحويل البنكي.'
      },
      // تم حذف معلومات الشحن من هنا - موجودة في البرومبت الأساسي
      {
        question: 'هل يمكن إرجاع المنتج؟',
        answer: 'نعم، يمكن إرجاع المنتج خلال 14 يوم من تاريخ الاستلام بشرط عدم الاستخدام.'
      },
      {
        question: 'ما هي أوقات العمل؟',
        answer: 'نعمل يومياً من 9 صباحاً حتى 6 مساءً، عدا يوم الجمعة.'
      }
    ];

    if (companyId) {
      console.log(`🏢 [RAG] تحميل FAQs للشركة: ${companyId}`);
    }

    faqs.forEach((faq, index) => {
      this.knowledgeBase.set(`faq_${index}`, {
        type: 'faq',
        content: `السؤال: ${faq.question}\nالإجابة: ${faq.answer}`,
        metadata: {
          question: faq.question,
          answer: faq.answer
        }
      });
    });

    console.log(`❓ Loaded ${faqs.length} FAQs to knowledge base`);
  }

  async loadPolicies(companyId = null) {
    // 🔐 في المستقبل، يمكن جلب Policies من قاعدة البيانات حسب الشركة
    // const policies = await prisma.policy.findMany({ where: { companyId } });

    const policies = [
      {
        title: 'سياسة الإرجاع',
        content: 'يمكن إرجاع المنتجات خلال 14 يوم من تاريخ الشراء. يجب أن يكون المنتج في حالته الأصلية وغير مستخدم.'
      },
      // تم حذف سياسة الشحن من هنا - موجودة في البرومبت الأساسي
      {
        title: 'سياسة الضمان',
        content: 'جميع منتجاتنا مضمونة ضد عيوب التصنيع لمدة 6 أشهر من تاريخ الشراء.'
      }
    ];

    if (companyId) {
      console.log(`🏢 [RAG] تحميل Policies للشركة: ${companyId}`);
    }

    policies.forEach((policy, index) => {
      this.knowledgeBase.set(`policy_${index}`, {
        type: 'policy',
        content: `${policy.title}: ${policy.content}`,
        metadata: {
          title: policy.title,
          content: policy.content
        }
      });
    });

    console.log(`📋 Loaded ${policies.length} policies to knowledge base`);
  }

  async retrieveRelevantData(query, intent, customerId, companyId = null) {
    console.log(`🔍 RAG retrieving data for query: "${query}" with intent: ${intent}`);
    if (companyId) {
      console.log(`🏢 [RAG] Filtering data for company: ${companyId}`);
    }

    // ضمان التهيئة قبل البحث
    await this.ensureInitialized();

    // 🔐 تحميل منتجات الشركة المحددة فقط عند الطلب
    if (companyId && (intent === 'product_inquiry' || intent === 'price_inquiry')) {
      console.log(`🔐 [RAG] Loading products for company: ${companyId}`);
      await this.loadProductsForCompany(companyId);
    }

    let relevantData = [];

    try {
      // البحث حسب النية
      switch (intent) {
        case 'product_inquiry':
          relevantData.push(...await this.searchProducts(query, companyId));
          break;

        case 'price_inquiry':
          relevantData.push(...await this.searchProducts(query, companyId));
          break;
          
        case 'shipping_info':
        case 'shipping_inquiry':
          relevantData.push(...this.searchByType('faq', ['شحن', 'توصيل']));
          relevantData.push(...this.searchByType('policy', ['شحن']));
          break;
          
        case 'order_status':
          const customerOrders = await this.getCustomerOrders(customerId);
          relevantData.push(...customerOrders);
          break;
          
        case 'complaint':
          relevantData.push(...this.searchByType('policy', ['إرجاع', 'ضمان']));
          break;
          
        default:
          // بحث عام في جميع البيانات
          relevantData.push(...await this.generalSearch(query, companyId));
      }

      // 🔐 تحقق نهائي من العزل - إزالة أي منتجات من شركات أخرى
      if (companyId) {
        const filteredData = relevantData.filter(item => {
          if (item.type === 'product') {
            const isCorrectCompany = item.metadata?.companyId === companyId;
            if (!isCorrectCompany) {
              console.log(`🚨 [RAG] Blocked product from wrong company: ${item.metadata?.name} (company: ${item.metadata?.companyId})`);
            }
            return isCorrectCompany;
          }
          return true; // FAQs و Policies مسموحة
        });

        console.log(`🔐 [RAG] Filtered ${relevantData.length} → ${filteredData.length} items for company: ${companyId}`);
        relevantData = filteredData;
      }

      console.log(`✅ Found ${relevantData.length} relevant items`);
      return relevantData.slice(0, 5); // أفضل 5 نتائج

    } catch (error) {
      console.error('❌ Error in RAG retrieval:', error);
      return [];
    }
  }

  async searchProducts(query, companyId = null) {
    const results = [];
    const searchTerms = query.toLowerCase().split(' ');

    // فحص إذا كان الاستفسار عام عن المنتجات
    const generalProductQueries = [
      'ايه المنتجات',
      'المنتجات الموجود',
      'المنتجات المتاح',
      'عندك ايه',
      'ايه عندك',
      'المنتجات',
      'منتجات',
      'كوتشي',
      'احذية',
      'أحذية',
      'shoes',
      'sneakers',
      'متوفر ايه',
      'ايه المتوفر',
      'عايز أشوف',
      'ممكن أشوف',
      'اشوف المنتجات'
    ];

    const isGeneralQuery = generalProductQueries.some(pattern =>
      query.toLowerCase().includes(pattern)
    );

    // إذا كان استفسار عام، أرجع جميع المنتجات
    if (isGeneralQuery) {
      console.log('🔍 Detected general product query, returning all products');
      for (const [key, item] of this.knowledgeBase.entries()) {
        if (item.type === 'product') {
          results.push({
            ...item,
            score: 10, // نقاط عالية للاستفسارات العامة
            key
          });
        }
      }
      return results.slice(0, 5); // أرجع جميع المنتجات
    }

    // البحث العادي مع تحسينات
    for (const [key, item] of this.knowledgeBase.entries()) {
      if (item.type === 'product') {
        // 🔐 فلترة حسب الشركة إذا تم تمرير companyId
        if (companyId && item.metadata?.companyId && item.metadata.companyId !== companyId) {
          continue; // تخطي المنتجات من شركات أخرى
        }

        const content = item.content.toLowerCase();
        let score = this.calculateRelevanceScore(content, searchTerms);

        // بونص إضافي للمطابقات الدلالية
        score += this.calculateSemanticScore(query, item);

        if (score > 0) {
          results.push({
            ...item,
            score,
            key
          });
        }
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  searchByType(type, keywords) {
    const results = [];

    for (const [key, item] of this.knowledgeBase.entries()) {
      if (item.type === type) {
        const content = item.content.toLowerCase();
        const hasKeyword = keywords.some(keyword => 
          content.includes(keyword.toLowerCase())
        );
        
        if (hasKeyword) {
          results.push({
            ...item,
            key
          });
        }
      }
    }

    return results;
  }

  async generalSearch(query, companyId = null) {
    const results = [];
    const searchTerms = query.toLowerCase().split(' ');

    for (const [key, item] of this.knowledgeBase.entries()) {
      // 🔐 فلترة حسب الشركة للمنتجات فقط (FAQs و Policies عامة)
      if (item.type === 'product' && companyId && item.metadata?.companyId && item.metadata.companyId !== companyId) {
        continue; // تخطي المنتجات من شركات أخرى
      }

      const content = item.content.toLowerCase();
      const score = this.calculateRelevanceScore(content, searchTerms);

      if (score > 0) {
        results.push({
          ...item,
          score,
          key
        });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  // تطبيع النص العربي
  normalizeArabicText(text) {
    if (!text) return '';

    return text
      // توحيد الألف
      .replace(/[أإآا]/g, 'ا')
      // توحيد الياء
      .replace(/[يى]/g, 'ي')
      // توحيد التاء المربوطة
      .replace(/[ة]/g, 'ه')
      // إزالة التشكيل
      .replace(/[ًٌٍَُِّْ]/g, '')
      // توحيد المسافات
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  // إضافة مرادفات العلامات التجارية والمصطلحات
  expandSearchTerms(searchTerms) {
    const synonyms = {
      // العلامات التجارية
      'اديداس': ['أديداس', 'adidas', 'اديداس', 'ستان سميث'],
      'أديداس': ['اديداس', 'adidas', 'ستان سميث'],
      'adidas': ['أديداس', 'اديداس', 'ستان سميث'],
      'نايك': ['nike', 'نايكي', 'اير فورس'],
      'نايكي': ['نايك', 'nike', 'اير فورس'],
      'nike': ['نايك', 'نايكي', 'اير فورس'],
      'بوما': ['puma', 'بومة', 'سويد'],
      'puma': ['بوما', 'بومة', 'سويد'],
      'اسكوتش': ['scotch', 'اسكتش', 'سكوتش'],
      'scotch': ['اسكوتش', 'اسكتش', 'سكوتش'],

      // الألوان
      'ابيض': ['أبيض', 'الابيض', 'الأبيض', 'white'],
      'أبيض': ['ابيض', 'الابيض', 'الأبيض', 'white'],
      'الابيض': ['ابيض', 'أبيض', 'الأبيض', 'white'],
      'الأبيض': ['ابيض', 'أبيض', 'الابيض', 'white'],
      'white': ['ابيض', 'أبيض', 'الابيض', 'الأبيض'],
      'اسود': ['أسود', 'الاسود', 'الأسود', 'black'],
      'أسود': ['اسود', 'الاسود', 'الأسود', 'black'],
      'الاسود': ['اسود', 'أسود', 'الأسود', 'black'],
      'الأسود': ['اسود', 'أسود', 'الاسود', 'black'],
      'black': ['اسود', 'أسود', 'الاسود', 'الأسود'],

      // المقاسات والخصائص
      'مقاس': ['مقاسات', 'size', 'sizes', 'حجم', 'أحجام'],
      'مقاسات': ['مقاس', 'size', 'sizes', 'حجم', 'أحجام'],
      'size': ['مقاس', 'مقاسات', 'حجم', 'أحجام'],
      'sizes': ['مقاس', 'مقاسات', 'حجم', 'أحجام'],

      // أنواع المنتجات
      'كوتشي': ['حذاء', 'أحذية', 'احذية', 'shoes', 'sneakers'],
      'حذاء': ['كوتشي', 'أحذية', 'احذية', 'shoes', 'sneakers'],
      'أحذية': ['كوتشي', 'حذاء', 'احذية', 'shoes', 'sneakers'],
      'احذية': ['كوتشي', 'حذاء', 'أحذية', 'shoes', 'sneakers'],
      'shoes': ['كوتشي', 'حذاء', 'أحذية', 'احذية', 'sneakers'],
      'sneakers': ['كوتشي', 'حذاء', 'أحذية', 'احذية', 'shoes'],

      // الجنس
      'حريمي': ['نسائي', 'نساء', 'women', 'female'],
      'نسائي': ['حريمي', 'نساء', 'women', 'female'],
      'نساء': ['حريمي', 'نسائي', 'women', 'female'],
      'women': ['حريمي', 'نسائي', 'نساء', 'female'],
      'رجالي': ['رجال', 'men', 'male'],
      'رجال': ['رجالي', 'men', 'male'],
      'men': ['رجالي', 'رجال', 'male']
    };

    const expandedTerms = [...searchTerms];

    for (const term of searchTerms) {
      const normalizedTerm = this.normalizeArabicText(term);
      if (synonyms[normalizedTerm]) {
        expandedTerms.push(...synonyms[normalizedTerm]);
      }
    }

    return [...new Set(expandedTerms)]; // إزالة التكرار
  }

  calculateRelevanceScore(content, searchTerms) {
    const normalizedContent = this.normalizeArabicText(content);
    const expandedTerms = this.expandSearchTerms(searchTerms);
    let score = 0;

    expandedTerms.forEach(term => {
      const normalizedTerm = this.normalizeArabicText(term);

      if (normalizedTerm.length > 1) { // قبول الكلمات القصيرة أيضاً
        try {
          // تنظيف المصطلح من الأحرف الخاصة في regex
          const escapedTerm = normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

          // البحث عن المطابقة التامة (نقاط أعلى)
          const exactMatches = (normalizedContent.match(new RegExp(`\\b${escapedTerm}\\b`, 'g')) || []).length;
          score += exactMatches * 5;

          // البحث عن المطابقة الجزئية (نقاط أقل)
          const partialMatches = (normalizedContent.match(new RegExp(escapedTerm, 'g')) || []).length;
          score += (partialMatches - exactMatches) * 2;

          // بونص للكلمات المهمة
          const importantWords = ['كوتشي', 'حذاء', 'أحذية', 'نايك', 'أديداس', 'بوما'];
          if (importantWords.some(word => this.normalizeArabicText(word) === normalizedTerm)) {
            score += 3;
          }

        } catch (error) {
          // في حالة فشل regex، استخدم البحث البسيط
          const occurrences = normalizedContent.split(normalizedTerm).length - 1;
          score += occurrences * 2;
        }
      }
    });

    return score;
  }

  // البحث الدلالي المحسن
  calculateSemanticScore(query, item) {
    const normalizedQuery = this.normalizeArabicText(query);
    let semanticScore = 0;

    // تحليل نية البحث
    const colorQueries = ['لون', 'ألوان', 'الوان', 'أبيض', 'ابيض', 'أسود', 'اسود'];
    const sizeQueries = ['مقاس', 'مقاسات', 'حجم', 'أحجام', 'size'];
    const priceQueries = ['سعر', 'اسعار', 'أسعار', 'كام', 'بكام', 'price'];
    const imageQueries = ['صور', 'صورة', 'شوف', 'أشوف', 'اشوف', 'image'];

    // إذا كان البحث عن الألوان وهناك متغيرات ألوان
    if (colorQueries.some(term => normalizedQuery.includes(term))) {
      if (item.metadata?.variants?.some(v => v.type === 'color')) {
        semanticScore += 5;
      }
    }

    // إذا كان البحث عن المقاسات وهناك متغيرات مقاسات
    if (sizeQueries.some(term => normalizedQuery.includes(term))) {
      if (item.metadata?.variants?.some(v => v.type === 'size')) {
        semanticScore += 5;
      }
    }

    // إذا كان البحث عن السعر
    if (priceQueries.some(term => normalizedQuery.includes(term))) {
      if (item.metadata?.price) {
        semanticScore += 3;
      }
    }

    // إذا كان البحث عن الصور
    if (imageQueries.some(term => normalizedQuery.includes(term))) {
      if (item.metadata?.images?.length > 0) {
        semanticScore += 5;
      }
    }

    // بونص للمنتجات المتوفرة
    if (item.metadata?.stock > 0 ||
        item.metadata?.variants?.some(v => v.stock > 0)) {
      semanticScore += 2;
    }

    return semanticScore;
  }

  async getCustomerOrders(customerId) {
    try {
      const orders = await prisma.order.findMany({
        where: { companyId: companyId },
        where: { customerId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      return orders.map(order => ({
        type: 'order',
        content: `
          طلب رقم: ${order.id}
          التاريخ: ${order.createdAt.toLocaleDateString('ar-EG')}
          الحالة: ${this.translateOrderStatus(order.status)}
          المبلغ الإجمالي: ${order.total} جنيه
          المنتجات: ${order.items.map(item => item.product.name).join(', ')}
        `.trim(),
        metadata: {
          orderId: order.id,
          status: order.status,
          total: order.total,
          date: order.createdAt
        }
      }));
    } catch (error) {
      console.error('❌ Error getting customer orders:', error);
      return [];
    }
  }

  translateOrderStatus(status) {
    const statusMap = {
      'PENDING': 'قيد المراجعة',
      'CONFIRMED': 'مؤكد',
      'SHIPPED': 'تم الشحن',
      'DELIVERED': 'تم التوصيل',
      'CANCELLED': 'ملغي'
    };
    
    return statusMap[status] || status;
  }

  // تحديث البيانات
  async updateKnowledgeBase() {
    console.log('🔄 Updating RAG Knowledge Base...');
    this.knowledgeBase.clear();
    await this.initializeKnowledgeBase();
  }

  // إضافة بيانات جديدة
  async addToKnowledgeBase(type, content, metadata) {
    const key = `${type}_${Date.now()}`;
    this.knowledgeBase.set(key, {
      type,
      content,
      metadata
    });
    
    console.log(`✅ Added new ${type} to knowledge base`);
  }

  // استخراج المنتجات المذكورة في السياق
  extractProductsFromContext(conversationMemory) {
    const productKeywords = [];

    // البحث في الرسائل السابقة عن أسماء المنتجات
    conversationMemory.forEach(interaction => {
      const userMessage = interaction.userMessage?.toLowerCase() || '';
      const aiResponse = interaction.aiResponse?.toLowerCase() || '';

      // البحث عن كلمات مفتاحية للمنتجات
      const productPatterns = [
        /كوتشي\s*(حريمي|لمسة|سوان)/g,
        /لمسة\s*(من\s*)?سوان/g,
        /حريمي/g,
        /سوان/g
      ];

      productPatterns.forEach(pattern => {
        const userMatches = userMessage.match(pattern);
        const aiMatches = aiResponse.match(pattern);

        if (userMatches) {
          userMatches.forEach(match => {
            if (!productKeywords.includes(match.trim())) {
              productKeywords.push(match.trim());
              console.log(`🔍 [CONTEXT] Found product in user message: "${match.trim()}"`);
            }
          });
        }

        if (aiMatches) {
          aiMatches.forEach(match => {
            if (!productKeywords.includes(match.trim())) {
              productKeywords.push(match.trim());
              console.log(`🔍 [CONTEXT] Found product in AI response: "${match.trim()}"`);
            }
          });
        }
      });
    });

    return productKeywords;
  }

  // استخراج الكلمات المفتاحية من الاستفسار
  extractSearchTerms(query) {
    // تنظيف النص وتقسيمه إلى كلمات
    const words = query
      .toLowerCase()
      .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s]/g, ' ') // إبقاء العربية والمسافات فقط
      .split(/\s+/)
      .filter(word => word.length > 1); // إزالة الكلمات القصيرة جداً

    // إزالة كلمات الوصل والأدوات
    const stopWords = ['في', 'من', 'إلى', 'على', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'تلك', 'التي', 'الذي', 'عايز', 'اشوف', 'ممكن', 'صور', 'صورة'];

    return words.filter(word => !stopWords.includes(word));
  }

  // البحث عن منتج محدد باستخدام AI للفهم المباشر
  async retrieveSpecificProduct(query, intent, customerId, conversationMemory = [], companyId = null) {
    // 🔐 تحميل منتجات الشركة المحددة فقط
    if (companyId) {
      console.log(`🔐 [RAG] Loading products for specific search - company: ${companyId}`);
      await this.loadProductsForCompany(companyId);
    }
    try {
      console.log(`🤖 [AI-PRODUCT-SEARCH] Using AI to understand product request: "${query}"`);

      // جمع المنتجات المتاحة مع فلترة حسب الشركة
      const availableProducts = [];
      for (const [key, item] of this.knowledgeBase.entries()) {
        if (item.type === 'product') {
          // 🔐 فلترة حسب الشركة إذا تم تمرير companyId
          if (companyId && item.metadata?.companyId && item.metadata.companyId !== companyId) {
            continue; // تخطي المنتجات من شركات أخرى
          }

          availableProducts.push({
            name: item.metadata?.name || 'منتج غير محدد',
            description: item.content || '',
            price: item.metadata?.price || 0
          });
        }
      }

      if (companyId) {
        console.log(`🏢 [RAG] Filtered products for company ${companyId}: ${availableProducts.length} products`);
      }

      if (availableProducts.length === 0) {
        console.log(`❌ [AI-PRODUCT-SEARCH] No products available in knowledge base`);
        return { product: null, confidence: 0, isSpecific: false };
      }

      // استخدام AI لفهم المنتج المطلوب
      const aiResult = await this.askAIForProductChoice(query, availableProducts, conversationMemory);

      if (aiResult && aiResult.productName && aiResult.confidence >= 0.3) {
        // البحث عن المنتج في قاعدة المعرفة
        const foundProduct = this.findProductByName(aiResult.productName);

        if (foundProduct) {
          console.log(`✅ [AI-PRODUCT-SEARCH] AI selected: ${aiResult.productName} (Confidence: ${(aiResult.confidence * 100).toFixed(1)}%)`);
          console.log(`🧠 [AI-REASONING] ${aiResult.reasoning}`);

          return {
            product: foundProduct,
            confidence: aiResult.confidence,
            isSpecific: true,
            reasoning: aiResult.reasoning
          };
        }
      }

      // Fallback محسن: إذا فشل AI، استخدم البحث البسيط
      console.log(`⚠️ [AI-PRODUCT-SEARCH] AI failed, trying simple fallback...`);
      const fallbackResult = await this.simpleProductSearch(query, availableProducts, conversationMemory);

      if (fallbackResult) {
        console.log(`🔄 [FALLBACK-SEARCH] Found product using simple search: ${fallbackResult.product.metadata?.name}`);
        return fallbackResult;
      }

      console.log(`❌ [AI-PRODUCT-SEARCH] No product found with AI or fallback (AI Confidence: ${aiResult?.confidence || 0})`);

      // 🔐 تحقق نهائي من العزل قبل الإرجاع
      if (companyId) {
        console.log(`🔐 [RAG] Final isolation check - no products found for company: ${companyId}`);
      }

      return { product: null, confidence: aiResult?.confidence || 0, isSpecific: false };

    } catch (error) {
      console.error('❌ [RAG-SPECIFIC] Error in retrieveSpecificProduct:', error);
      return {
        product: null,
        confidence: 0,
        isSpecific: false
      };
    }
  }

  // تطبيع الكلمات للمطابقة الأفضل
  normalizeWordForMatching(word) {
    return word
      .replace(/ة$/g, 'ه')  // تاء مربوطة → هاء
      .replace(/ه$/g, 'ة')  // هاء → تاء مربوطة
      .replace(/ى$/g, 'ي')  // ألف مقصورة → ياء
      .replace(/أ|إ|آ/g, 'ا'); // همزات → ألف
  }

  // فحص المطابقة المرنة بين كلمتين
  isFlexibleMatch(word1, word2) {
    const normalized1 = this.normalizeWordForMatching(word1.toLowerCase());
    const normalized2 = this.normalizeWordForMatching(word2.toLowerCase());

    return normalized1 === normalized2 ||
           normalized1.includes(normalized2) ||
           normalized2.includes(normalized1);
  }

  // حساب بونص السياق للمنتج مع مراعاة طلب "منتج آخر"
  calculateContextBonus(item, conversationMemory, currentQuery = '') {
    if (!conversationMemory || conversationMemory.length === 0) {
      return 0;
    }

    let bonus = 0;
    const productName = (item.metadata?.name || '').toLowerCase();

    // فحص إذا كان العميل يطلب منتج آخر/مختلف
    const requestingDifferentProduct = this.isRequestingDifferentProduct(currentQuery);

    conversationMemory.forEach((interaction, index) => {
      const userMessage = interaction.userMessage?.toLowerCase() || '';
      const aiResponse = interaction.aiResponse?.toLowerCase() || '';

      // كلما كانت المحادثة أحدث، كلما زاد البونص
      const recencyMultiplier = conversationMemory.length - index;

      // فحص ذكر المنتج في رسالة المستخدم
      if (userMessage.includes(productName) || this.productMentionedInText(productName, userMessage)) {
        let userBonus = 15 * recencyMultiplier;

        // إذا كان يطلب منتج آخر، قلل البونص للمنتج المذكور مؤخراً
        if (requestingDifferentProduct && index === 0) {
          userBonus = Math.max(5, userBonus * 0.3); // تقليل كبير للتفاعل الأخير
          console.log(`🔄 [CONTEXT-PENALTY] Requesting different product, reducing bonus for recent mention: ${userBonus}`);
        }

        bonus += userBonus;
        console.log(`🧠 [CONTEXT-BONUS] Product mentioned in user message (interaction ${index + 1}): +${userBonus}`);
      }

      // فحص ذكر المنتج في رد AI
      if (aiResponse.includes(productName) || this.productMentionedInText(productName, aiResponse)) {
        let aiBonus = 10 * recencyMultiplier;

        // إذا كان يطلب منتج آخر، قلل البونص للمنتج المذكور مؤخراً
        if (requestingDifferentProduct && index === 0) {
          aiBonus = Math.max(3, aiBonus * 0.2); // تقليل أكبر للتفاعل الأخير
          console.log(`🔄 [CONTEXT-PENALTY] Requesting different product, reducing AI bonus: ${aiBonus}`);
        }

        bonus += aiBonus;
        console.log(`🧠 [CONTEXT-BONUS] Product mentioned in AI response (interaction ${index + 1}): +${aiBonus}`);
      }
    });

    return bonus;
  }

  // فحص إذا كان العميل يطلب منتج مختلف/آخر
  isRequestingDifferentProduct(query) {
    const differentProductKeywords = [
      'التاني', 'الثاني', 'الاخر', 'الآخر', 'غيره', 'غيرها', 'مختلف', 'تاني', 'ثاني',
      'اخر', 'آخر', 'بديل', 'غير', 'سوا', 'كمان', 'برضو', 'تاني حاجة'
    ];

    const normalizedQuery = query.toLowerCase();
    const found = differentProductKeywords.some(keyword => normalizedQuery.includes(keyword));

    if (found) {
      console.log(`🔄 [DIFFERENT-PRODUCT] Detected request for different product in: "${query}"`);
    }

    return found;
  }

  // فحص ذكر المنتج في النص
  productMentionedInText(productName, text) {
    // تقسيم اسم المنتج إلى كلمات
    const productWords = productName.split(' ').filter(word => word.length > 2);

    // فحص وجود معظم كلمات المنتج في النص
    const foundWords = productWords.filter(word =>
      text.includes(word) ||
      this.isFlexibleMatch(word, text)
    );

    // إذا وجدت 70% من كلمات المنتج أو أكثر
    return foundWords.length >= Math.ceil(productWords.length * 0.7);
  }

  // إنشاء مفتاح cache
  createCacheKey(query, availableProducts, conversationMemory) {
    const productsKey = availableProducts.map(p => p.name).sort().join('|');
    const contextKey = conversationMemory.map(m => m.userMessage).join('|');
    return `${query}:${productsKey}:${contextKey}`;
  }

  // فحص وتنظيف cache
  cleanExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.aiChoiceCache.entries()) {
      if (now - value.timestamp > this.cacheExpiryTime) {
        this.aiChoiceCache.delete(key);
      }
    }

    // تحديد حجم cache
    if (this.aiChoiceCache.size > this.cacheMaxSize) {
      const entries = Array.from(this.aiChoiceCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toDelete = entries.slice(0, entries.length - this.cacheMaxSize);
      toDelete.forEach(([key]) => this.aiChoiceCache.delete(key));
    }
  }

  // استخدام AI لاختيار المنتج المناسب مع cache
  async askAIForProductChoice(query, availableProducts, conversationMemory = []) {
    try {
      // فحص cache أولاً
      const cacheKey = this.createCacheKey(query, availableProducts, conversationMemory);
      const cached = this.aiChoiceCache.get(cacheKey);

      if (cached && (Date.now() - cached.timestamp) < this.cacheExpiryTime) {
        console.log(`🚀 [AI-CACHE] Using cached result for: "${query.substring(0, 50)}..."`);
        return cached.result;
      }

      // تنظيف cache منتهي الصلاحية
      this.cleanExpiredCache();

      // تحضير السياق
      let contextText = '';
      if (conversationMemory && conversationMemory.length > 0) {
        contextText = conversationMemory.map((interaction, index) =>
          `${index + 1}. العميل: "${interaction.userMessage}" | AI: "${interaction.aiResponse}"`
        ).join('\n');
      }

      // تحضير قائمة المنتجات
      const productsText = availableProducts.map((product, index) =>
        `${index + 1}. ${product.name} (${product.price} جنيه)`
      ).join('\n');

      const prompt = `أنت خبير في فهم طلبات العملاء للمنتجات. حلل الطلب التالي وحدد المنتج المطلوب.

رسالة العميل: "${query}"

المنتجات المتاحة:
${productsText}

المحادثة السابقة:
${contextText || 'لا توجد محادثة سابقة'}

قواعد مهمة:
- إذا قال العميل "التاني" أو "الآخر" أو "غيره"، اختر منتج مختلف عن آخر منتج ذُكر
- إذا ذكر اسم منتج صريح، اختره
- إذا ذكر لون فقط، استخدم السياق لتحديد المنتج
- إذا لم تكن متأكد، ضع confidence أقل من 0.3

أجب بـ JSON فقط:
{
  "productName": "اسم المنتج الدقيق أو null",
  "confidence": 0.95,
  "reasoning": "سبب الاختيار"
}`;

      // استدعاء AI
      await this.initializeGemini();
      if (!this.genAI) {
        console.log(`❌ [AI-CHOICE] Gemini not initialized`);
        return null;
      }

      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = result.response.text();

      console.log(`🤖 [AI-CHOICE] Raw AI response: ${response.substring(0, 200)}...`);

      // تنظيف وتحليل الرد
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
      }
      if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      // إزالة أي نصوص إضافية بعد JSON
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[0];
      }

      // تنظيف إضافي للنصوص المقطوعة
      cleanResponse = cleanResponse.replace(/\.\.\.$/, '');

      const aiChoice = JSON.parse(cleanResponse);

      // التحقق من صحة الرد
      if (aiChoice.productName && typeof aiChoice.confidence === 'number') {
        console.log(`🎯 [AI-CHOICE] Product: ${aiChoice.productName}, Confidence: ${aiChoice.confidence}, Reason: ${aiChoice.reasoning}`);

        // حفظ النتيجة في cache
        this.aiChoiceCache.set(cacheKey, {
          result: aiChoice,
          timestamp: Date.now()
        });
        console.log(`💾 [AI-CACHE] Cached result for future use`);

        return aiChoice;
      }

      // حفظ النتيجة السلبية في cache أيضاً
      const nullResult = null;
      this.aiChoiceCache.set(cacheKey, {
        result: nullResult,
        timestamp: Date.now()
      });

      return nullResult;

    } catch (error) {
      console.error(`❌ [AI-CHOICE] Error asking AI for product choice:`, error);
      return null;
    }
  }

  // البحث عن منتج بالاسم
  findProductByName(productName) {
    if (!productName) return null;

    const normalizedSearchName = this.normalizeArabicText(productName.toLowerCase());

    for (const [key, item] of this.knowledgeBase.entries()) {
      if (item.type === 'product') {
        const itemName = this.normalizeArabicText((item.metadata?.name || '').toLowerCase());

        // مطابقة دقيقة
        if (itemName === normalizedSearchName) {
          return item;
        }

        // مطابقة جزئية (يحتوي على معظم الكلمات)
        const searchWords = normalizedSearchName.split(' ').filter(w => w.length > 2);
        const itemWords = itemName.split(' ').filter(w => w.length > 2);

        const matchingWords = searchWords.filter(searchWord =>
          itemWords.some(itemWord => this.isFlexibleMatch(searchWord, itemWord))
        );

        if (matchingWords.length >= Math.ceil(searchWords.length * 0.7)) {
          return item;
        }
      }
    }

    return null;
  }

  // حساب نقاط المطابقة للمنتج المحدد
  calculateSpecificProductScore(query, searchTerms, item, conversationMemory = []) {
    let score = 0;
    const productName = (item.metadata?.name || '').toLowerCase();
    const productContent = (item.content || '').toLowerCase();

    // بونص إضافي إذا كان المنتج مذكور في السياق
    const contextBonus = this.calculateContextBonus(item, conversationMemory, query);
    if (contextBonus > 0) {
      score += contextBonus;
      console.log(`🧠 [SCORE] Context bonus: +${contextBonus} (product mentioned in conversation)`);
    }

    // مطابقة اسم المنتج (أعلى أولوية)
    if (productName) {
      // مطابقة تامة لاسم المنتج
      if (query.includes(productName)) {
        score += 10;
        console.log(`🎯 [SCORE] Full name match: +10 (${productName})`);
      }

      // مطابقة جزئية لكلمات اسم المنتج
      const nameWords = productName.split(' ').filter(word => word.length > 2);
      nameWords.forEach(word => {
        if (query.includes(word)) {
          score += 5;
          console.log(`🎯 [SCORE] Name word match: +5 (${word})`);
        }
      });
    }

    // مطابقة الكلمات المفتاحية مع المرونة
    searchTerms.forEach(term => {
      // مطابقة مباشرة
      if (productName.includes(term)) {
        score += 3;
        console.log(`🔍 [SCORE] Search term in name: +3 (${term})`);
      } else if (productContent.includes(term)) {
        score += 1;
        console.log(`🔍 [SCORE] Search term in content: +1 (${term})`);
      } else {
        // مطابقة مرنة
        const nameWords = productName.split(' ');
        nameWords.forEach(nameWord => {
          if (this.isFlexibleMatch(term, nameWord)) {
            score += 4; // نقاط أعلى للمطابقة المرنة
            console.log(`🔄 [SCORE] Flexible match: +4 (${term} ≈ ${nameWord})`);
          }
        });
      }
    });

    // بونص للكلمات المميزة مع المرونة
    const uniqueWords = ['لمسة', 'سوان', 'حريمي'];
    uniqueWords.forEach(uniqueWord => {
      searchTerms.forEach(searchTerm => {
        if (this.isFlexibleMatch(searchTerm, uniqueWord) && productName.includes(uniqueWord)) {
          score += 8; // نقاط عالية للكلمات المميزة
          console.log(`⭐ [SCORE] Unique flexible match: +8 (${searchTerm} ≈ ${uniqueWord})`);
        }
      });
    });

    return score;
  }

  // إحصائيات
  getStats() {
    const stats = {};

    for (const [key, item] of this.knowledgeBase.entries()) {
      stats[item.type] = (stats[item.type] || 0) + 1;
    }

    return {
      total: this.knowledgeBase.size,
      byType: stats
    };
  }

  // بحث بسيط كـ fallback عند فشل AI
  async simpleProductSearch(query, availableProducts, conversationMemory = []) {
    try {
      console.log(`🔍 [SIMPLE-FALLBACK] Trying simple keyword matching...`);

      const normalizedQuery = this.normalizeArabicText(query.toLowerCase());
      const queryWords = normalizedQuery.split(' ').filter(word => word.length > 2);

      let bestMatch = null;
      let bestScore = 0;

      // البحث في المنتجات المتاحة
      for (const product of availableProducts) {
        const normalizedProductName = this.normalizeArabicText(product.name.toLowerCase());
        const productWords = normalizedProductName.split(' ').filter(word => word.length > 2);

        let score = 0;

        // حساب المطابقات
        for (const queryWord of queryWords) {
          for (const productWord of productWords) {
            if (this.isFlexibleMatch(queryWord, productWord)) {
              score += 5;
            } else if (productWord.includes(queryWord) || queryWord.includes(productWord)) {
              score += 3;
            }
          }
        }

        // بونص للسياق
        if (conversationMemory.length > 0) {
          const lastInteraction = conversationMemory[0];
          if (lastInteraction && lastInteraction.aiResponse) {
            const contextText = this.normalizeArabicText(lastInteraction.aiResponse.toLowerCase());
            if (contextText.includes(normalizedProductName)) {
              score += 10;
              console.log(`🧠 [SIMPLE-FALLBACK] Context bonus for: ${product.name}`);
            }
          }
        }

        console.log(`📊 [SIMPLE-FALLBACK] ${product.name}: ${score} points`);

        if (score > bestScore) {
          bestScore = score;
          bestMatch = product;
        }
      }

      // إذا وجدنا مطابقة جيدة
      if (bestMatch && bestScore >= 5) {
        const foundProduct = this.findProductByName(bestMatch.name);
        if (foundProduct) {
          return {
            product: foundProduct,
            confidence: Math.min(bestScore / 20, 0.8), // حد أقصى 80% للـ fallback
            isSpecific: true,
            reasoning: `Simple keyword matching (${bestScore} points)`
          };
        }
      }

      return null;

    } catch (error) {
      console.error(`❌ [SIMPLE-FALLBACK] Error in simple search:`, error);
      return null;
    }
  }
}

// دوال مساعدة لإدارة حالة الصور
class ImageHelper {
  static getImageStatus(images) {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return {
        status: 'غير متوفرة',
        count: 0,
        hasImages: false,
        validImages: []
      };
    }

    const validImages = images.filter(img =>
      img &&
      typeof img === 'string' &&
      (img.includes('http') || img.includes('https')) &&
      img.length > 10
    );

    return {
      status: validImages.length > 0 ? 'متوفرة' : 'غير متوفرة',
      count: validImages.length,
      hasImages: validImages.length > 0,
      validImages: validImages
    };
  }

  static validateImageUrl(url) {
    if (!url || typeof url !== 'string') return false;

    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  static getImageQualityInfo(images) {
    const imageInfo = this.getImageStatus(images);

    return {
      ...imageInfo,
      quality: imageInfo.hasImages ? 'جيدة' : 'غير متوفرة',
      isComplete: imageInfo.count >= 1,
      needsMore: imageInfo.count < 3
    };
  }
}

// Export both the class and a singleton instance
module.exports = new RAGService();
module.exports.RAGService = RAGService;
module.exports.ImageHelper = ImageHelper;
