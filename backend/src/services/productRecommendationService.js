/**
 * Product Recommendation Service
 * 
 * Handles intelligent product recommendations based on conversation context,
 * customer behavior, and purchase history
 */

class ProductRecommendationService {
  constructor() {
    this.recommendations = new Map(); // Recommendation history
    this.customerPreferences = new Map(); // Customer preference profiles
    this.productRelations = new Map(); // Product relationship mapping
    this.recommendationRules = new Map(); // Recommendation rules and algorithms
    this.performanceMetrics = new Map(); // Recommendation performance tracking
    this.contextualKeywords = new Map(); // Keywords to product mapping
    this.initializeMockData();
  }

  /**
   * Initialize mock data and recommendation rules
   */
  initializeMockData() {
    // Mock product data with categories and attributes
    const mockProducts = [
      {
        id: '1',
        name: 'لابتوب HP Pavilion',
        category: 'laptops',
        price: 2500,
        tags: ['gaming', 'work', 'student'],
        attributes: { brand: 'HP', ram: '8GB', storage: '512GB SSD', screen: '15.6"' },
        popularity: 0.85,
        rating: 4.5,
        inStock: true,
      },
      {
        id: '2',
        name: 'لابتوب Dell Inspiron',
        category: 'laptops',
        price: 2200,
        tags: ['work', 'business', 'portable'],
        attributes: { brand: 'Dell', ram: '8GB', storage: '256GB SSD', screen: '14"' },
        popularity: 0.78,
        rating: 4.3,
        inStock: true,
      },
      {
        id: '3',
        name: 'ماوس لاسلكي Logitech',
        category: 'accessories',
        price: 150,
        tags: ['wireless', 'ergonomic', 'gaming'],
        attributes: { brand: 'Logitech', type: 'wireless', dpi: '1600' },
        popularity: 0.92,
        rating: 4.7,
        inStock: true,
      },
      {
        id: '4',
        name: 'كيبورد ميكانيكي',
        category: 'accessories',
        price: 300,
        tags: ['mechanical', 'gaming', 'rgb'],
        attributes: { brand: 'Corsair', type: 'mechanical', backlight: 'RGB' },
        popularity: 0.75,
        rating: 4.6,
        inStock: true,
      },
      {
        id: '5',
        name: 'شاشة Samsung 24 بوصة',
        category: 'monitors',
        price: 800,
        tags: ['monitor', 'gaming', 'work'],
        attributes: { brand: 'Samsung', size: '24"', resolution: '1080p', refresh: '144Hz' },
        popularity: 0.88,
        rating: 4.4,
        inStock: true,
      },
      {
        id: '6',
        name: 'سماعات Sony WH-1000XM4',
        category: 'audio',
        price: 1200,
        tags: ['headphones', 'noise-cancelling', 'wireless'],
        attributes: { brand: 'Sony', type: 'over-ear', wireless: true, noiseCancelling: true },
        popularity: 0.95,
        rating: 4.8,
        inStock: true,
      },
    ];

    // Store products for easy access
    this.products = new Map();
    mockProducts.forEach(product => {
      this.products.set(product.id, product);
    });

    // Mock contextual keywords mapping
    const mockKeywords = {
      'لابتوب': ['1', '2'],
      'laptop': ['1', '2'],
      'gaming': ['1', '3', '4', '5'],
      'ألعاب': ['1', '3', '4', '5'],
      'عمل': ['1', '2', '5'],
      'work': ['1', '2', '5'],
      'ماوس': ['3'],
      'mouse': ['3'],
      'كيبورد': ['4'],
      'keyboard': ['4'],
      'شاشة': ['5'],
      'monitor': ['5'],
      'سماعات': ['6'],
      'headphones': ['6'],
      'صوت': ['6'],
      'audio': ['6'],
    };

    Object.entries(mockKeywords).forEach(([keyword, productIds]) => {
      this.contextualKeywords.set(keyword.toLowerCase(), productIds);
    });

    // Mock product relationships (frequently bought together, alternatives, etc.)
    const mockRelations = [
      {
        productId: '1',
        complementary: ['3', '4', '5'], // Mouse, keyboard, monitor
        alternatives: ['2'], // Other laptops
        upgrades: [], // Higher-end versions
        accessories: ['3', '4'], // Related accessories
      },
      {
        productId: '2',
        complementary: ['3', '4', '5'],
        alternatives: ['1'],
        upgrades: [],
        accessories: ['3', '4'],
      },
      {
        productId: '3',
        complementary: ['4'], // Keyboard goes with mouse
        alternatives: [], // Other mice
        upgrades: [],
        accessories: [],
      },
      {
        productId: '4',
        complementary: ['3'], // Mouse goes with keyboard
        alternatives: [],
        upgrades: [],
        accessories: [],
      },
      {
        productId: '5',
        complementary: ['1', '2'], // Monitors go with laptops
        alternatives: [],
        upgrades: [],
        accessories: [],
      },
      {
        productId: '6',
        complementary: ['1', '2'], // Headphones go with computers
        alternatives: [],
        upgrades: [],
        accessories: [],
      },
    ];

    mockRelations.forEach(relation => {
      this.productRelations.set(relation.productId, relation);
    });

    // Mock customer preferences
    const mockCustomerPreferences = [
      {
        customerId: '1',
        customerName: 'أحمد محمد',
        preferredCategories: ['laptops', 'accessories'],
        preferredBrands: ['HP', 'Logitech'],
        priceRange: { min: 100, max: 3000 },
        purchaseHistory: [
          { productId: '1', purchaseDate: '2024-01-01', rating: 5 },
        ],
        viewHistory: ['1', '3', '4'],
        searchHistory: ['لابتوب gaming', 'ماوس لاسلكي'],
        behaviorProfile: {
          pricesensitivity: 'medium',
          brandLoyalty: 'high',
          featurePreference: 'performance',
          purchaseFrequency: 'occasional',
        },
        lastUpdated: new Date('2024-01-15'),
      },
      {
        customerId: '2',
        customerName: 'سارة أحمد',
        preferredCategories: ['audio', 'accessories'],
        preferredBrands: ['Sony', 'Samsung'],
        priceRange: { min: 200, max: 1500 },
        purchaseHistory: [
          { productId: '6', purchaseDate: '2024-01-10', rating: 5 },
        ],
        viewHistory: ['6', '5'],
        searchHistory: ['سماعات', 'شاشة'],
        behaviorProfile: {
          pricesensitivity: 'low',
          brandLoyalty: 'medium',
          featurePreference: 'quality',
          purchaseFrequency: 'regular',
        },
        lastUpdated: new Date('2024-01-15'),
      },
    ];

    mockCustomerPreferences.forEach(pref => {
      this.customerPreferences.set(pref.customerId, pref);
    });

    // Mock recommendation history
    const mockRecommendations = [
      {
        id: 'REC001',
        customerId: '1',
        conversationId: 'CONV001',
        context: {
          message: 'أريد لابتوب للألعاب',
          detectedIntent: 'product_inquiry',
          extractedKeywords: ['لابتوب', 'ألعاب'],
          sentiment: 'positive',
          urgency: 'medium',
        },
        recommendations: [
          {
            productId: '1',
            score: 0.95,
            reason: 'مناسب للألعاب وضمن الميزانية',
            type: 'contextual',
            confidence: 0.9,
          },
          {
            productId: '3',
            score: 0.85,
            reason: 'ماوس مكمل للألعاب',
            type: 'complementary',
            confidence: 0.8,
          },
          {
            productId: '4',
            score: 0.80,
            reason: 'كيبورد ألعاب مناسب',
            type: 'complementary',
            confidence: 0.75,
          },
        ],
        performance: {
          shown: true,
          clicked: ['1', '3'],
          purchased: ['1'],
          revenue: 2500,
          conversionRate: 0.33,
        },
        createdAt: new Date('2024-01-15T10:30:00'),
      },
      {
        id: 'REC002',
        customerId: '2',
        conversationId: 'CONV002',
        context: {
          message: 'أبحث عن سماعات جودة عالية',
          detectedIntent: 'product_inquiry',
          extractedKeywords: ['سماعات', 'جودة'],
          sentiment: 'positive',
          urgency: 'low',
        },
        recommendations: [
          {
            productId: '6',
            score: 0.98,
            reason: 'سماعات عالية الجودة مع إلغاء الضوضاء',
            type: 'contextual',
            confidence: 0.95,
          },
        ],
        performance: {
          shown: true,
          clicked: ['6'],
          purchased: ['6'],
          revenue: 1200,
          conversionRate: 1.0,
        },
        createdAt: new Date('2024-01-15T14:20:00'),
      },
    ];

    mockRecommendations.forEach(rec => {
      this.recommendations.set(rec.id, rec);
    });

    // Mock recommendation rules
    const mockRules = [
      {
        id: 'RULE001',
        name: 'Contextual Keywords',
        type: 'contextual',
        weight: 0.4,
        description: 'اقتراح منتجات بناءً على الكلمات المفتاحية في المحادثة',
        enabled: true,
      },
      {
        id: 'RULE002',
        name: 'Customer History',
        type: 'behavioral',
        weight: 0.3,
        description: 'اقتراح منتجات بناءً على تاريخ العميل',
        enabled: true,
      },
      {
        id: 'RULE003',
        name: 'Complementary Products',
        type: 'complementary',
        weight: 0.2,
        description: 'اقتراح منتجات مكملة',
        enabled: true,
      },
      {
        id: 'RULE004',
        name: 'Popular Products',
        type: 'popularity',
        weight: 0.1,
        description: 'اقتراح المنتجات الأكثر شعبية',
        enabled: true,
      },
    ];

    mockRules.forEach(rule => {
      this.recommendationRules.set(rule.id, rule);
    });
  }

  /**
   * Generate product recommendations based on conversation context
   */
  async generateRecommendations(requestData) {
    try {
      const {
        customerId,
        conversationId,
        message,
        context = {},
        maxRecommendations = 5,
        includeReasons = true,
      } = requestData;

      // Analyze message context
      const messageAnalysis = await this.analyzeMessage(message);
      
      // Get customer preferences
      const customerProfile = this.customerPreferences.get(customerId) || this.createDefaultProfile(customerId);
      
      // Generate recommendations using different algorithms
      const contextualRecs = await this.getContextualRecommendations(messageAnalysis, customerProfile);
      const behavioralRecs = await this.getBehavioralRecommendations(customerProfile);
      const complementaryRecs = await this.getComplementaryRecommendations(context.currentProducts || []);
      const popularRecs = await this.getPopularRecommendations(customerProfile);

      // Combine and score recommendations
      const combinedRecs = this.combineRecommendations([
        ...contextualRecs,
        ...behavioralRecs,
        ...complementaryRecs,
        ...popularRecs,
      ]);

      // Sort by score and limit results
      const finalRecommendations = combinedRecs
        .sort((a, b) => b.score - a.score)
        .slice(0, maxRecommendations)
        .map(rec => ({
          ...rec,
          product: this.products.get(rec.productId),
        }));

      // Create recommendation record
      const recommendationRecord = {
        id: this.generateRecommendationId(),
        customerId,
        conversationId,
        context: {
          message,
          detectedIntent: messageAnalysis.intent,
          extractedKeywords: messageAnalysis.keywords,
          sentiment: context.sentiment || 'neutral',
          urgency: context.urgency || 'medium',
        },
        recommendations: finalRecommendations.map(rec => ({
          productId: rec.productId,
          score: rec.score,
          reason: rec.reason,
          type: rec.type,
          confidence: rec.confidence,
        })),
        performance: {
          shown: false,
          clicked: [],
          purchased: [],
          revenue: 0,
          conversionRate: 0,
        },
        createdAt: new Date(),
      };

      // Store recommendation
      this.recommendations.set(recommendationRecord.id, recommendationRecord);

      return {
        success: true,
        data: {
          recommendationId: recommendationRecord.id,
          recommendations: finalRecommendations,
          context: messageAnalysis,
        },
        message: 'تم توليد اقتراحات المنتجات بنجاح'
      };

    } catch (error) {
      console.error('Error generating recommendations:', error);
      return {
        success: false,
        error: 'فشل في توليد اقتراحات المنتجات'
      };
    }
  }

  /**
   * Track recommendation performance
   */
  async trackRecommendationPerformance(trackingData) {
    try {
      const {
        recommendationId,
        action, // 'shown', 'clicked', 'purchased'
        productId,
        revenue = 0,
      } = trackingData;

      const recommendation = this.recommendations.get(recommendationId);
      if (!recommendation) {
        return {
          success: false,
          error: 'الاقتراح غير موجود'
        };
      }

      // Update performance metrics
      switch (action) {
        case 'shown':
          recommendation.performance.shown = true;
          break;
        
        case 'clicked':
          if (!recommendation.performance.clicked.includes(productId)) {
            recommendation.performance.clicked.push(productId);
          }
          break;
        
        case 'purchased':
          if (!recommendation.performance.purchased.includes(productId)) {
            recommendation.performance.purchased.push(productId);
            recommendation.performance.revenue += revenue;
          }
          break;
      }

      // Calculate conversion rate
      const totalRecs = recommendation.recommendations.length;
      const purchased = recommendation.performance.purchased.length;
      recommendation.performance.conversionRate = totalRecs > 0 ? purchased / totalRecs : 0;

      // Update recommendation
      this.recommendations.set(recommendationId, recommendation);

      // Update customer preferences based on interaction
      await this.updateCustomerPreferences(recommendation.customerId, action, productId);

      return {
        success: true,
        data: recommendation.performance,
        message: 'تم تتبع أداء الاقتراح بنجاح'
      };

    } catch (error) {
      console.error('Error tracking recommendation performance:', error);
      return {
        success: false,
        error: 'فشل في تتبع أداء الاقتراح'
      };
    }
  }

  /**
   * Get recommendation analytics
   */
  async getRecommendationAnalytics(filters = {}) {
    try {
      const { customerId, period = 'week', startDate, endDate } = filters;

      let recommendations = Array.from(this.recommendations.values());

      // Apply filters
      if (customerId) {
        recommendations = recommendations.filter(r => r.customerId === customerId);
      }

      if (startDate) {
        recommendations = recommendations.filter(r => new Date(r.createdAt) >= new Date(startDate));
      }

      if (endDate) {
        recommendations = recommendations.filter(r => new Date(r.createdAt) <= new Date(endDate));
      }

      const analytics = {
        overview: this.calculateOverviewMetrics(recommendations),
        performance: this.calculatePerformanceMetrics(recommendations),
        topProducts: this.getTopRecommendedProducts(recommendations),
        customerInsights: this.getCustomerInsights(recommendations),
        revenueImpact: this.calculateRevenueImpact(recommendations),
        trends: this.calculateRecommendationTrends(recommendations, period),
        algorithmPerformance: this.getAlgorithmPerformance(recommendations),
      };

      return {
        success: true,
        data: analytics
      };

    } catch (error) {
      console.error('Error getting recommendation analytics:', error);
      return {
        success: false,
        error: 'فشل في جلب تحليلات الاقتراحات'
      };
    }
  }

  /**
   * Helper methods for recommendation generation
   */
  async analyzeMessage(message) {
    const messageLower = message.toLowerCase();
    const keywords = [];
    const intent = this.detectIntent(messageLower);

    // Extract keywords
    Array.from(this.contextualKeywords.keys()).forEach(keyword => {
      if (messageLower.includes(keyword)) {
        keywords.push(keyword);
      }
    });

    return {
      intent,
      keywords,
      categories: this.extractCategories(keywords),
      priceRange: this.extractPriceRange(messageLower),
    };
  }

  async getContextualRecommendations(analysis, customerProfile) {
    const recommendations = [];
    const rule = this.recommendationRules.get('RULE001');

    if (!rule.enabled) return recommendations;

    // Get products based on keywords
    const productIds = new Set();
    analysis.keywords.forEach(keyword => {
      const relatedProducts = this.contextualKeywords.get(keyword) || [];
      relatedProducts.forEach(id => productIds.add(id));
    });

    // Score and create recommendations
    Array.from(productIds).forEach(productId => {
      const product = this.products.get(productId);
      if (product && product.inStock) {
        const score = this.calculateContextualScore(product, analysis, customerProfile);
        recommendations.push({
          productId,
          score: score * rule.weight,
          reason: `مناسب لـ ${analysis.keywords.join(', ')}`,
          type: 'contextual',
          confidence: score,
        });
      }
    });

    return recommendations;
  }

  async getBehavioralRecommendations(customerProfile) {
    const recommendations = [];
    const rule = this.recommendationRules.get('RULE002');

    if (!rule.enabled) return recommendations;

    // Recommend based on preferred categories and brands
    Array.from(this.products.values()).forEach(product => {
      if (product.inStock) {
        const score = this.calculateBehavioralScore(product, customerProfile);
        if (score > 0.5) {
          recommendations.push({
            productId: product.id,
            score: score * rule.weight,
            reason: 'مناسب لتفضيلاتك السابقة',
            type: 'behavioral',
            confidence: score,
          });
        }
      }
    });

    return recommendations;
  }

  async getComplementaryRecommendations(currentProducts) {
    const recommendations = [];
    const rule = this.recommendationRules.get('RULE003');

    if (!rule.enabled || currentProducts.length === 0) return recommendations;

    currentProducts.forEach(productId => {
      const relations = this.productRelations.get(productId);
      if (relations) {
        relations.complementary.forEach(compId => {
          const product = this.products.get(compId);
          if (product && product.inStock) {
            recommendations.push({
              productId: compId,
              score: 0.8 * rule.weight,
              reason: 'منتج مكمل مناسب',
              type: 'complementary',
              confidence: 0.8,
            });
          }
        });
      }
    });

    return recommendations;
  }

  async getPopularRecommendations(customerProfile) {
    const recommendations = [];
    const rule = this.recommendationRules.get('RULE004');

    if (!rule.enabled) return recommendations;

    // Get top popular products in customer's preferred categories
    const popularProducts = Array.from(this.products.values())
      .filter(product => product.inStock && product.popularity > 0.8)
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 3);

    popularProducts.forEach(product => {
      recommendations.push({
        productId: product.id,
        score: product.popularity * rule.weight,
        reason: 'منتج شائع ومحبوب',
        type: 'popularity',
        confidence: product.popularity,
      });
    });

    return recommendations;
  }

  combineRecommendations(allRecommendations) {
    const combined = new Map();

    allRecommendations.forEach(rec => {
      if (combined.has(rec.productId)) {
        const existing = combined.get(rec.productId);
        existing.score += rec.score;
        existing.reasons = existing.reasons || [];
        existing.reasons.push(rec.reason);
        existing.types = existing.types || [];
        existing.types.push(rec.type);
      } else {
        combined.set(rec.productId, {
          ...rec,
          reasons: [rec.reason],
          types: [rec.type],
        });
      }
    });

    return Array.from(combined.values()).map(rec => ({
      ...rec,
      reason: rec.reasons[0], // Use primary reason
      score: Math.min(rec.score, 1.0), // Cap at 1.0
    }));
  }

  calculateContextualScore(product, analysis, customerProfile) {
    let score = 0.5; // Base score

    // Keyword relevance
    const relevantKeywords = analysis.keywords.filter(keyword => 
      product.tags.some(tag => tag.includes(keyword)) ||
      product.name.toLowerCase().includes(keyword)
    );
    score += relevantKeywords.length * 0.2;

    // Category match
    if (analysis.categories.includes(product.category)) {
      score += 0.2;
    }

    // Price range match
    if (analysis.priceRange && 
        product.price >= analysis.priceRange.min && 
        product.price <= analysis.priceRange.max) {
      score += 0.1;
    }

    // Customer preference alignment
    if (customerProfile.preferredCategories.includes(product.category)) {
      score += 0.1;
    }

    if (customerProfile.preferredBrands.includes(product.attributes.brand)) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  calculateBehavioralScore(product, customerProfile) {
    let score = 0;

    // Category preference
    if (customerProfile.preferredCategories.includes(product.category)) {
      score += 0.4;
    }

    // Brand preference
    if (customerProfile.preferredBrands.includes(product.attributes.brand)) {
      score += 0.3;
    }

    // Price range fit
    if (product.price >= customerProfile.priceRange.min && 
        product.price <= customerProfile.priceRange.max) {
      score += 0.2;
    }

    // Purchase history similarity
    const hasRelatedPurchase = customerProfile.purchaseHistory.some(purchase => {
      const purchasedProduct = this.products.get(purchase.productId);
      return purchasedProduct && purchasedProduct.category === product.category;
    });
    if (hasRelatedPurchase) {
      score += 0.1;
    }

    return score;
  }

  detectIntent(message) {
    if (message.includes('أريد') || message.includes('أبحث') || message.includes('عايز')) {
      return 'purchase_intent';
    }
    if (message.includes('بكم') || message.includes('سعر') || message.includes('ثمن')) {
      return 'price_inquiry';
    }
    if (message.includes('متوفر') || message.includes('موجود') || message.includes('عندكم')) {
      return 'availability_inquiry';
    }
    return 'general_inquiry';
  }

  extractCategories(keywords) {
    const categories = [];
    keywords.forEach(keyword => {
      const productIds = this.contextualKeywords.get(keyword) || [];
      productIds.forEach(id => {
        const product = this.products.get(id);
        if (product && !categories.includes(product.category)) {
          categories.push(product.category);
        }
      });
    });
    return categories;
  }

  extractPriceRange(message) {
    // Simple price range extraction
    if (message.includes('رخيص') || message.includes('اقتصادي')) {
      return { min: 0, max: 500 };
    }
    if (message.includes('متوسط')) {
      return { min: 500, max: 1500 };
    }
    if (message.includes('غالي') || message.includes('فاخر')) {
      return { min: 1500, max: 10000 };
    }
    return null;
  }

  createDefaultProfile(customerId) {
    return {
      customerId,
      customerName: 'عميل جديد',
      preferredCategories: [],
      preferredBrands: [],
      priceRange: { min: 0, max: 10000 },
      purchaseHistory: [],
      viewHistory: [],
      searchHistory: [],
      behaviorProfile: {
        pricesensitivity: 'medium',
        brandLoyalty: 'low',
        featurePreference: 'balanced',
        purchaseFrequency: 'occasional',
      },
      lastUpdated: new Date(),
    };
  }

  async updateCustomerPreferences(customerId, action, productId) {
    let profile = this.customerPreferences.get(customerId);
    if (!profile) {
      profile = this.createDefaultProfile(customerId);
    }

    const product = this.products.get(productId);
    if (!product) return;

    // Update based on action
    switch (action) {
      case 'clicked':
        if (!profile.viewHistory.includes(productId)) {
          profile.viewHistory.push(productId);
        }
        break;
      
      case 'purchased':
        profile.purchaseHistory.push({
          productId,
          purchaseDate: new Date().toISOString(),
          rating: null,
        });
        
        // Update preferences
        if (!profile.preferredCategories.includes(product.category)) {
          profile.preferredCategories.push(product.category);
        }
        if (!profile.preferredBrands.includes(product.attributes.brand)) {
          profile.preferredBrands.push(product.attributes.brand);
        }
        break;
    }

    profile.lastUpdated = new Date();
    this.customerPreferences.set(customerId, profile);
  }

  calculateOverviewMetrics(recommendations) {
    return {
      totalRecommendations: recommendations.length,
      averageScore: recommendations.length > 0 ? 
        recommendations.reduce((sum, r) => sum + (r.recommendations[0]?.score || 0), 0) / recommendations.length : 0,
      showRate: recommendations.filter(r => r.performance.shown).length / recommendations.length,
      clickRate: recommendations.filter(r => r.performance.clicked.length > 0).length / recommendations.length,
      conversionRate: recommendations.filter(r => r.performance.purchased.length > 0).length / recommendations.length,
    };
  }

  calculatePerformanceMetrics(recommendations) {
    const totalShown = recommendations.filter(r => r.performance.shown).length;
    const totalClicked = recommendations.reduce((sum, r) => sum + r.performance.clicked.length, 0);
    const totalPurchased = recommendations.reduce((sum, r) => sum + r.performance.purchased.length, 0);
    const totalRevenue = recommendations.reduce((sum, r) => sum + r.performance.revenue, 0);

    return {
      impressions: totalShown,
      clicks: totalClicked,
      purchases: totalPurchased,
      revenue: totalRevenue,
      ctr: totalShown > 0 ? totalClicked / totalShown : 0,
      conversionRate: totalClicked > 0 ? totalPurchased / totalClicked : 0,
      averageOrderValue: totalPurchased > 0 ? totalRevenue / totalPurchased : 0,
    };
  }

  getTopRecommendedProducts(recommendations) {
    const productCounts = new Map();
    
    recommendations.forEach(rec => {
      rec.recommendations.forEach(r => {
        const count = productCounts.get(r.productId) || 0;
        productCounts.set(r.productId, count + 1);
      });
    });

    return Array.from(productCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([productId, count]) => ({
        product: this.products.get(productId),
        recommendationCount: count,
      }));
  }

  getCustomerInsights(recommendations) {
    const customerData = new Map();
    
    recommendations.forEach(rec => {
      if (!customerData.has(rec.customerId)) {
        customerData.set(rec.customerId, {
          customerId: rec.customerId,
          totalRecommendations: 0,
          totalClicks: 0,
          totalPurchases: 0,
          totalRevenue: 0,
        });
      }
      
      const data = customerData.get(rec.customerId);
      data.totalRecommendations++;
      data.totalClicks += rec.performance.clicked.length;
      data.totalPurchases += rec.performance.purchased.length;
      data.totalRevenue += rec.performance.revenue;
    });

    return Array.from(customerData.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);
  }

  calculateRevenueImpact(recommendations) {
    const totalRevenue = recommendations.reduce((sum, r) => sum + r.performance.revenue, 0);
    const totalRecommendations = recommendations.length;
    
    return {
      totalRevenue,
      averageRevenuePerRecommendation: totalRecommendations > 0 ? totalRevenue / totalRecommendations : 0,
      revenueByType: this.getRevenueByType(recommendations),
    };
  }

  getRevenueByType(recommendations) {
    const revenueByType = {};
    
    recommendations.forEach(rec => {
      rec.recommendations.forEach(r => {
        if (!revenueByType[r.type]) {
          revenueByType[r.type] = 0;
        }
        if (rec.performance.purchased.includes(r.productId)) {
          const product = this.products.get(r.productId);
          if (product) {
            revenueByType[r.type] += product.price;
          }
        }
      });
    });

    return revenueByType;
  }

  calculateRecommendationTrends(recommendations, period) {
    // Mock trend calculation
    return [
      { period: 'يوم 1', recommendations: 15, clicks: 8, purchases: 3, revenue: 2500 },
      { period: 'يوم 2', recommendations: 18, clicks: 12, purchases: 5, revenue: 4200 },
      { period: 'يوم 3', recommendations: 22, clicks: 15, purchases: 7, revenue: 5800 },
      { period: 'يوم 4', recommendations: 20, clicks: 11, purchases: 4, revenue: 3600 },
      { period: 'يوم 5', recommendations: 25, clicks: 18, purchases: 9, revenue: 7200 },
    ];
  }

  getAlgorithmPerformance(recommendations) {
    const algorithmStats = {};
    
    Array.from(this.recommendationRules.values()).forEach(rule => {
      algorithmStats[rule.type] = {
        name: rule.name,
        weight: rule.weight,
        recommendations: 0,
        clicks: 0,
        purchases: 0,
        revenue: 0,
      };
    });

    recommendations.forEach(rec => {
      rec.recommendations.forEach(r => {
        if (algorithmStats[r.type]) {
          algorithmStats[r.type].recommendations++;
          if (rec.performance.clicked.includes(r.productId)) {
            algorithmStats[r.type].clicks++;
          }
          if (rec.performance.purchased.includes(r.productId)) {
            algorithmStats[r.type].purchases++;
            const product = this.products.get(r.productId);
            if (product) {
              algorithmStats[r.type].revenue += product.price;
            }
          }
        }
      });
    });

    return algorithmStats;
  }

  generateRecommendationId() {
    return `REC${Date.now().toString(36).toUpperCase()}`;
  }
}

module.exports = new ProductRecommendationService();
