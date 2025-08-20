/**
 * خدمة تخصيص العملاء
 * Customer Personalization Service for different response types based on customer history and behavior
 */

class CustomerPersonalizationService {
  constructor() {
    this.customerProfiles = new Map();
    this.customerSegments = new Map();
    this.behaviorPatterns = new Map();
    this.personalizationRules = new Map();
    
    // تهيئة أنواع العملاء والقواعد
    this.initializeCustomerSegments();
    this.initializePersonalizationRules();
  }

  /**
   * تهيئة شرائح العملاء
   */
  initializeCustomerSegments() {
    const segments = {
      new_customer: {
        id: 'new_customer',
        name: 'عميل جديد',
        criteria: {
          interactionCount: { max: 3 },
          daysSinceFirstContact: { max: 7 },
          purchaseHistory: { max: 0 }
        },
        characteristics: ['curious', 'needs_guidance', 'price_sensitive'],
        responseStyle: 'welcoming_detailed'
      },
      regular_customer: {
        id: 'regular_customer',
        name: 'عميل منتظم',
        criteria: {
          interactionCount: { min: 4, max: 20 },
          daysSinceFirstContact: { min: 8, max: 90 },
          purchaseHistory: { min: 1, max: 5 }
        },
        characteristics: ['familiar', 'knows_products', 'value_conscious'],
        responseStyle: 'friendly_efficient'
      },
      vip_customer: {
        id: 'vip_customer',
        name: 'عميل مميز',
        criteria: {
          interactionCount: { min: 21 },
          daysSinceFirstContact: { min: 91 },
          purchaseHistory: { min: 6 },
          totalSpent: { min: 5000 }
        },
        characteristics: ['loyal', 'high_value', 'expects_premium'],
        responseStyle: 'premium_personalized'
      },
      price_sensitive: {
        id: 'price_sensitive',
        name: 'حساس للسعر',
        criteria: {
          priceInquiries: { min: 3 },
          discountRequests: { min: 2 },
          abandonedCarts: { min: 1 }
        },
        characteristics: ['budget_conscious', 'deal_seeker', 'comparison_shopper'],
        responseStyle: 'value_focused'
      },
      impulse_buyer: {
        id: 'impulse_buyer',
        name: 'مشتري اندفاعي',
        criteria: {
          quickPurchases: { min: 2 },
          averageDecisionTime: { max: 300 }, // 5 دقائق
          emotionalLanguage: { min: 0.7 }
        },
        characteristics: ['quick_decision', 'emotion_driven', 'trend_follower'],
        responseStyle: 'urgent_exciting'
      },
      researcher: {
        id: 'researcher',
        name: 'باحث',
        criteria: {
          detailQuestions: { min: 5 },
          comparisonRequests: { min: 3 },
          averageSessionTime: { min: 600 } // 10 دقائق
        },
        characteristics: ['detail_oriented', 'analytical', 'thorough'],
        responseStyle: 'detailed_informative'
      }
    };

    Object.values(segments).forEach(segment => {
      this.customerSegments.set(segment.id, segment);
    });

    console.log('👥 [Personalization] Customer segments initialized');
  }

  /**
   * تهيئة قواعد التخصيص
   */
  initializePersonalizationRules() {
    const rules = {
      welcoming_detailed: {
        greeting: 'مرحباً بك! أهلاً وسهلاً في متجرنا. سأكون سعيداً جداً لمساعدتك في العثور على ما تبحث عنه. دعني أوضح لك كل التفاصيل التي تحتاجها.',
        product_inquiry: 'ممتاز! هذا منتج رائع ومناسب للمبتدئين. دعني أشرح لك جميع مميزاته وكيفية استخدامه بالتفصيل.',
        pricing: 'سعر هذا المنتج هو [PRICE] جنيه، وهو سعر ممتاز مقارنة بالجودة. كما أن لدينا ضمان شامل وخدمة ما بعد البيع.',
        closing: 'أتمنى أن أكون قد أجبت على جميع أسئلتك. لا تتردد في سؤالي عن أي شيء آخر، أنا هنا لمساعدتك!'
      },
      friendly_efficient: {
        greeting: 'أهلاً بعودتك! كيف يمكنني مساعدتك اليوم؟',
        product_inquiry: 'بالطبع! أعرف أنك تقدر الجودة. هذا المنتج سيعجبك بالتأكيد.',
        pricing: 'السعر [PRICE] جنيه، وكما تعرف، نحن نقدم أفضل الأسعار دائماً.',
        closing: 'شكراً لثقتك بنا! هل تحتاج أي شيء آخر؟'
      },
      premium_personalized: {
        greeting: 'أهلاً [NAME]! سعيد برؤيتك مرة أخرى. كيف يمكنني خدمتك اليوم؟',
        product_inquiry: 'اختيار ممتاز كالعادة! هذا من أفضل منتجاتنا الحصرية، وأعتقد أنه سيناسب ذوقك الرفيع.',
        pricing: 'السعر [PRICE] جنيه، وبالطبع ستحصل على خصم VIP الخاص بك 10%، ليصبح السعر [DISCOUNTED_PRICE] جنيه.',
        closing: 'كان من دواعي سروري خدمتك [NAME]. سأتابع معك شخصياً للتأكد من رضاك التام.'
      },
      value_focused: {
        greeting: 'مرحباً! لدينا عروض رائعة اليوم، دعني أعرض عليك أفضل الصفقات!',
        product_inquiry: 'هذا المنتج يقدم أفضل قيمة مقابل السعر! جودة ممتازة بسعر لا يُقاوم.',
        pricing: 'السعر الأصلي [ORIGINAL_PRICE] جنيه، لكن لديك عرض خاص [PRICE] جنيه فقط! وفر [SAVINGS] جنيه!',
        closing: 'لا تفوت هذا العرض المحدود! هل تريد الحجز الآن؟'
      },
      urgent_exciting: {
        greeting: 'مرحباً! 🔥 لديك توقيت مثالي، عندنا عروض ساخنة اليوم!',
        product_inquiry: 'واو! اختيار رائع! 😍 هذا المنتج يطير من المخزن، الكل بيطلبه!',
        pricing: 'السعر [PRICE] جنيه بس! 🚀 والعرض لفترة محدودة جداً!',
        closing: 'يلا احجز دلوقتي قبل ما ينتهي! 🏃‍♂️💨'
      },
      detailed_informative: {
        greeting: 'مرحباً! أقدر اهتمامك بالتفاصيل. سأقدم لك جميع المعلومات التي تحتاجها لاتخاذ قرار مدروس.',
        product_inquiry: 'هذا المنتج يتميز بـ: [DETAILED_SPECS]. المواد المستخدمة: [MATERIALS]. مقارنة بالمنافسين: [COMPARISON].',
        pricing: 'السعر [PRICE] جنيه يشمل: [INCLUDED_ITEMS]. تكلفة إضافية: [OPTIONAL_ITEMS]. إجمالي القيمة: [TOTAL_VALUE].',
        closing: 'هل تحتاج مقارنة مع منتجات أخرى؟ أم لديك أسئلة تقنية إضافية؟'
      }
    };

    Object.entries(rules).forEach(([style, templates]) => {
      this.personalizationRules.set(style, templates);
    });

    console.log('📋 [Personalization] Personalization rules initialized');
  }

  /**
   * تحليل العميل وتحديد نوعه
   */
  async analyzeCustomer(customerId, conversationHistory = []) {
    try {
      console.log(`🔍 [Personalization] Analyzing customer: ${customerId}`);
      
      // الحصول على ملف العميل أو إنشاؤه
      let profile = this.customerProfiles.get(customerId);
      if (!profile) {
        profile = await this.createCustomerProfile(customerId);
      }

      // تحديث الملف بناءً على المحادثة الحالية
      await this.updateCustomerProfile(profile, conversationHistory);
      
      // تحديد شريحة العميل
      const segment = this.determineCustomerSegment(profile);
      
      // حفظ التحديثات
      profile.segment = segment;
      profile.lastAnalysis = new Date();
      this.customerProfiles.set(customerId, profile);
      
      console.log(`✅ [Personalization] Customer ${customerId} classified as: ${segment.name}`);
      return { profile, segment };
    } catch (error) {
      console.error('❌ [Personalization] Error analyzing customer:', error);
      throw error;
    }
  }

  /**
   * إنشاء ملف عميل جديد
   */
  async createCustomerProfile(customerId) {
    const profile = {
      customerId,
      createdAt: new Date(),
      lastInteraction: new Date(),
      interactionCount: 0,
      purchaseHistory: [],
      totalSpent: 0,
      averageOrderValue: 0,
      preferences: {
        communicationStyle: 'unknown',
        priceRange: 'unknown',
        productCategories: [],
        responseTime: 'normal'
      },
      behavior: {
        priceInquiries: 0,
        discountRequests: 0,
        abandonedCarts: 0,
        quickPurchases: 0,
        detailQuestions: 0,
        comparisonRequests: 0,
        averageDecisionTime: 0,
        averageSessionTime: 0,
        emotionalLanguage: 0
      },
      demographics: {
        estimatedAge: 'unknown',
        gender: 'unknown',
        location: 'unknown'
      },
      segment: null,
      tags: []
    };

    console.log(`👤 [Personalization] Created new profile for customer: ${customerId}`);
    return profile;
  }

  /**
   * تحديث ملف العميل
   */
  async updateCustomerProfile(profile, conversationHistory) {
    try {
      // تحديث عدد التفاعلات
      profile.interactionCount += conversationHistory.length;
      profile.lastInteraction = new Date();

      // تحليل المحادثة الحالية
      const conversationAnalysis = this.analyzeConversation(conversationHistory);
      
      // تحديث السلوك
      this.updateBehaviorMetrics(profile, conversationAnalysis);
      
      // تحديث التفضيلات
      this.updatePreferences(profile, conversationAnalysis);
      
      // إضافة علامات جديدة
      this.updateTags(profile, conversationAnalysis);

      console.log(`📊 [Personalization] Updated profile for customer: ${profile.customerId}`);
    } catch (error) {
      console.error('❌ [Personalization] Error updating customer profile:', error);
    }
  }

  /**
   * تحليل المحادثة
   */
  analyzeConversation(messages) {
    const analysis = {
      messageCount: messages.length,
      customerMessages: messages.filter(m => m.sender === 'customer'),
      priceQuestions: 0,
      productQuestions: 0,
      urgentLanguage: 0,
      detailedQuestions: 0,
      emotionalWords: 0,
      sessionDuration: 0,
      topics: []
    };

    // حساب مدة الجلسة
    if (messages.length > 1) {
      const start = new Date(messages[0].timestamp);
      const end = new Date(messages[messages.length - 1].timestamp);
      analysis.sessionDuration = (end - start) / 1000; // بالثواني
    }

    // تحليل رسائل العميل
    analysis.customerMessages.forEach(message => {
      const text = message.text.toLowerCase();
      
      // أسئلة الأسعار
      if (text.includes('سعر') || text.includes('كام') || text.includes('تكلفة')) {
        analysis.priceQuestions++;
      }
      
      // أسئلة المنتجات
      if (text.includes('منتج') || text.includes('كوتشي') || text.includes('مواصفات')) {
        analysis.productQuestions++;
      }
      
      // لغة عاجلة
      if (text.includes('عاجل') || text.includes('سريع') || text.includes('فوراً')) {
        analysis.urgentLanguage++;
      }
      
      // أسئلة مفصلة
      if (text.length > 100 || text.split('؟').length > 2) {
        analysis.detailedQuestions++;
      }
      
      // كلمات عاطفية
      const emotionalWords = ['حب', 'عجبني', 'رائع', 'جميل', 'مش عاجبني', 'زعلان'];
      emotionalWords.forEach(word => {
        if (text.includes(word)) analysis.emotionalWords++;
      });
    });

    return analysis;
  }

  /**
   * تحديث مقاييس السلوك
   */
  updateBehaviorMetrics(profile, analysis) {
    const behavior = profile.behavior;
    
    // تحديث المتوسطات
    behavior.priceInquiries += analysis.priceQuestions;
    behavior.detailQuestions += analysis.detailedQuestions;
    behavior.averageSessionTime = (behavior.averageSessionTime + analysis.sessionDuration) / 2;
    behavior.emotionalLanguage = (behavior.emotionalLanguage + (analysis.emotionalWords / analysis.customerMessages.length)) / 2;
  }

  /**
   * تحديث التفضيلات
   */
  updatePreferences(profile, analysis) {
    const preferences = profile.preferences;
    
    // تحديد نمط التواصل
    if (analysis.detailedQuestions > 2) {
      preferences.communicationStyle = 'detailed';
    } else if (analysis.urgentLanguage > 0) {
      preferences.communicationStyle = 'quick';
    } else {
      preferences.communicationStyle = 'normal';
    }
    
    // تحديد الحساسية للسعر
    if (analysis.priceQuestions > 1) {
      preferences.priceRange = 'budget';
    } else if (profile.totalSpent > 5000) {
      preferences.priceRange = 'premium';
    } else {
      preferences.priceRange = 'mid';
    }
  }

  /**
   * تحديث العلامات
   */
  updateTags(profile, analysis) {
    const tags = profile.tags;
    
    // إضافة علامات جديدة
    if (analysis.priceQuestions > 2 && !tags.includes('price_sensitive')) {
      tags.push('price_sensitive');
    }
    
    if (analysis.detailedQuestions > 3 && !tags.includes('researcher')) {
      tags.push('researcher');
    }
    
    if (analysis.urgentLanguage > 0 && !tags.includes('urgent_buyer')) {
      tags.push('urgent_buyer');
    }
    
    if (analysis.emotionalWords > 2 && !tags.includes('emotional_buyer')) {
      tags.push('emotional_buyer');
    }
  }

  /**
   * تحديد شريحة العميل
   */
  determineCustomerSegment(profile) {
    let bestMatch = null;
    let bestScore = 0;

    for (const segment of this.customerSegments.values()) {
      const score = this.calculateSegmentScore(profile, segment);
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = segment;
      }
    }

    return bestMatch || this.customerSegments.get('new_customer');
  }

  /**
   * حساب نقاط الشريحة
   */
  calculateSegmentScore(profile, segment) {
    let score = 0;
    const criteria = segment.criteria;
    
    // فحص كل معيار
    Object.entries(criteria).forEach(([key, range]) => {
      const value = this.getProfileValue(profile, key);
      
      if (this.valueInRange(value, range)) {
        score += 1;
      }
    });

    // إضافة نقاط للعلامات المطابقة
    segment.characteristics.forEach(characteristic => {
      if (profile.tags.includes(characteristic)) {
        score += 0.5;
      }
    });

    return score;
  }

  /**
   * الحصول على قيمة من الملف
   */
  getProfileValue(profile, key) {
    switch (key) {
      case 'interactionCount':
        return profile.interactionCount;
      case 'daysSinceFirstContact':
        return Math.floor((new Date() - profile.createdAt) / (1000 * 60 * 60 * 24));
      case 'purchaseHistory':
        return profile.purchaseHistory.length;
      case 'totalSpent':
        return profile.totalSpent;
      case 'priceInquiries':
        return profile.behavior.priceInquiries;
      case 'discountRequests':
        return profile.behavior.discountRequests;
      case 'abandonedCarts':
        return profile.behavior.abandonedCarts;
      case 'quickPurchases':
        return profile.behavior.quickPurchases;
      case 'averageDecisionTime':
        return profile.behavior.averageDecisionTime;
      case 'detailQuestions':
        return profile.behavior.detailQuestions;
      case 'comparisonRequests':
        return profile.behavior.comparisonRequests;
      case 'averageSessionTime':
        return profile.behavior.averageSessionTime;
      case 'emotionalLanguage':
        return profile.behavior.emotionalLanguage;
      default:
        return 0;
    }
  }

  /**
   * فحص إذا كانت القيمة في النطاق
   */
  valueInRange(value, range) {
    if (range.min !== undefined && value < range.min) return false;
    if (range.max !== undefined && value > range.max) return false;
    return true;
  }

  /**
   * الحصول على رد مخصص
   */
  async getPersonalizedResponse(customerId, messageType, context = {}) {
    try {
      // تحليل العميل
      const { profile, segment } = await this.analyzeCustomer(customerId, context.conversationHistory || []);
      
      // الحصول على نمط الرد
      const responseStyle = segment.responseStyle;
      const templates = this.personalizationRules.get(responseStyle);
      
      if (!templates || !templates[messageType]) {
        return this.getDefaultResponse(messageType);
      }

      // تخصيص الرد
      let response = templates[messageType];
      response = this.personalizeResponse(response, profile, context);
      
      console.log(`💬 [Personalization] Generated ${responseStyle} response for ${segment.name}`);
      return {
        response,
        segment: segment.name,
        style: responseStyle,
        personalizationLevel: this.calculatePersonalizationLevel(profile)
      };
    } catch (error) {
      console.error('❌ [Personalization] Error getting personalized response:', error);
      return this.getDefaultResponse(messageType);
    }
  }

  /**
   * تخصيص الرد
   */
  personalizeResponse(template, profile, context) {
    let response = template;
    
    // استبدال المتغيرات
    response = response.replace(/\[NAME\]/g, profile.name || 'عزيزي العميل');
    response = response.replace(/\[PRICE\]/g, context.price || '0');
    response = response.replace(/\[ORIGINAL_PRICE\]/g, context.originalPrice || context.price || '0');
    response = response.replace(/\[DISCOUNTED_PRICE\]/g, context.discountedPrice || context.price || '0');
    response = response.replace(/\[SAVINGS\]/g, context.savings || '0');
    
    // إضافة تفاصيل حسب نوع العميل
    if (profile.segment?.id === 'vip_customer' && context.vipDiscount) {
      response = response.replace(/\[DISCOUNTED_PRICE\]/g, 
        Math.round(context.price * 0.9).toString()
      );
    }
    
    return response;
  }

  /**
   * حساب مستوى التخصيص
   */
  calculatePersonalizationLevel(profile) {
    let level = 0;
    
    // مستوى البيانات المتوفرة
    if (profile.interactionCount > 5) level += 0.3;
    if (profile.purchaseHistory.length > 0) level += 0.3;
    if (profile.preferences.communicationStyle !== 'unknown') level += 0.2;
    if (profile.tags.length > 0) level += 0.2;
    
    return Math.min(1, level);
  }

  /**
   * الحصول على رد افتراضي
   */
  getDefaultResponse(messageType) {
    const defaultResponses = {
      greeting: 'مرحباً! كيف يمكنني مساعدتك؟',
      product_inquiry: 'بالطبع! يمكنني مساعدتك في العثور على المنتج المناسب.',
      pricing: 'سعر هذا المنتج ممتاز ومناسب للجودة المقدمة.',
      closing: 'شكراً لك! هل هناك أي شيء آخر يمكنني مساعدتك فيه؟'
    };
    
    return {
      response: defaultResponses[messageType] || 'شكراً لتواصلك معنا!',
      segment: 'default',
      style: 'default',
      personalizationLevel: 0
    };
  }

  /**
   * الحصول على إحصائيات التخصيص
   */
  getPersonalizationStats() {
    const profiles = Array.from(this.customerProfiles.values());
    const segments = Array.from(this.customerSegments.values());
    
    const segmentDistribution = {};
    segments.forEach(segment => {
      segmentDistribution[segment.name] = profiles.filter(p => 
        p.segment?.id === segment.id
      ).length;
    });
    
    return {
      totalCustomers: profiles.length,
      segmentDistribution,
      averagePersonalizationLevel: profiles.reduce((sum, p) => 
        sum + this.calculatePersonalizationLevel(p), 0
      ) / profiles.length,
      topSegments: Object.entries(segmentDistribution)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3),
      recentAnalyses: profiles
        .filter(p => p.lastAnalysis)
        .sort((a, b) => new Date(b.lastAnalysis) - new Date(a.lastAnalysis))
        .slice(0, 10)
        .map(p => ({
          customerId: p.customerId,
          segment: p.segment?.name,
          personalizationLevel: this.calculatePersonalizationLevel(p),
          lastAnalysis: p.lastAnalysis
        }))
    };
  }
}

module.exports = new CustomerPersonalizationService();
