/**
 * خدمة تحسين الردود التلقائي
 * Response Optimization Service for analyzing successful responses and updating templates automatically
 */

class ResponseOptimizationService {
  constructor() {
    this.responseTemplates = new Map();
    this.successfulResponses = [];
    this.responseAnalytics = new Map();
    this.optimizationQueue = [];
    this.isOptimizing = false;
    
    // تهيئة القوالب الافتراضية
    this.initializeDefaultTemplates();
  }

  /**
   * تهيئة القوالب الافتراضية
   */
  initializeDefaultTemplates() {
    const defaultTemplates = {
      greeting: {
        id: 'greeting',
        category: 'greeting',
        template: 'مرحباً! كيف يمكنني مساعدتك اليوم؟',
        successRate: 0.85,
        usageCount: 0,
        lastUpdated: new Date(),
        variations: [
          'أهلاً وسهلاً! كيف يمكنني خدمتك؟',
          'مرحباً بك! ما الذي تبحث عنه؟',
          'أهلاً! سعيد بوجودك هنا، كيف يمكنني مساعدتك؟'
        ]
      },
      product_inquiry: {
        id: 'product_inquiry',
        category: 'product',
        template: 'بالطبع! يمكنني مساعدتك في العثور على المنتج المناسب. ما نوع المنتج الذي تبحث عنه؟',
        successRate: 0.78,
        usageCount: 0,
        lastUpdated: new Date(),
        variations: [
          'ممتاز! دعني أساعدك في اختيار المنتج الأنسب لك. ما هي احتياجاتك؟',
          'سأكون سعيداً لمساعدتك! أخبرني عن المنتج الذي تريده.',
          'رائع! لدينا مجموعة متنوعة من المنتجات. ما الذي يهمك؟'
        ]
      },
      pricing: {
        id: 'pricing',
        category: 'pricing',
        template: 'سعر هذا المنتج هو [PRICE] جنيه. يمكنني أيضاً أن أعرض عليك عروض خاصة إذا كنت مهتماً.',
        successRate: 0.72,
        usageCount: 0,
        lastUpdated: new Date(),
        variations: [
          'المنتج متوفر بسعر [PRICE] جنيه، ولدينا عروض رائعة يمكنني مشاركتها معك.',
          'السعر [PRICE] جنيه، وهناك خصومات متاحة للطلبات الكبيرة.',
          'يبلغ سعر المنتج [PRICE] جنيه، ويمكنني ترتيب خصم خاص لك.'
        ]
      },
      closing: {
        id: 'closing',
        category: 'closing',
        template: 'شكراً لك! هل هناك أي شيء آخر يمكنني مساعدتك فيه؟',
        successRate: 0.88,
        usageCount: 0,
        lastUpdated: new Date(),
        variations: [
          'كان من دواعي سروري مساعدتك! هل تحتاج لأي شيء آخر؟',
          'أتمنى أن أكون قد ساعدتك. هل لديك أي استفسارات أخرى؟',
          'سعيد لأنني استطعت مساعدتك! أي خدمة أخرى؟'
        ]
      }
    };

    Object.values(defaultTemplates).forEach(template => {
      this.responseTemplates.set(template.id, template);
    });

    console.log('📝 [ResponseOpt] Default templates initialized');
  }

  /**
   * تحليل رد ناجح وتعلم منه
   */
  async analyzeSuccessfulResponse(responseData) {
    try {
      console.log(`✅ [ResponseOpt] Analyzing successful response: ${responseData.id}`);
      
      const analysis = {
        responseId: responseData.id,
        category: this.categorizeResponse(responseData.text),
        text: responseData.text,
        context: responseData.context,
        successMetrics: {
          customerSatisfaction: responseData.satisfaction || 0.8,
          conversionRate: responseData.converted ? 1 : 0,
          responseTime: responseData.responseTime || 2.5,
          followUpNeeded: responseData.followUpNeeded || false
        },
        timestamp: new Date(),
        features: this.extractResponseFeatures(responseData.text)
      };

      // حفظ الرد الناجح
      this.successfulResponses.push(analysis);
      
      // تحديث الإحصائيات
      this.updateResponseAnalytics(analysis);
      
      // إضافة للقائمة للتحسين
      this.queueForOptimization(analysis);
      
      console.log(`📊 [ResponseOpt] Response analysis completed: ${analysis.category}`);
      return analysis;
    } catch (error) {
      console.error('❌ [ResponseOpt] Error analyzing response:', error);
      throw error;
    }
  }

  /**
   * تصنيف الرد
   */
  categorizeResponse(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('مرحب') || lowerText.includes('أهلا')) {
      return 'greeting';
    } else if (lowerText.includes('سعر') || lowerText.includes('جنيه') || lowerText.includes('تكلفة')) {
      return 'pricing';
    } else if (lowerText.includes('منتج') || lowerText.includes('كوتشي') || lowerText.includes('حذاء')) {
      return 'product';
    } else if (lowerText.includes('شكرا') || lowerText.includes('شيء آخر')) {
      return 'closing';
    } else if (lowerText.includes('طلب') || lowerText.includes('اشتري')) {
      return 'ordering';
    } else {
      return 'general';
    }
  }

  /**
   * استخراج ميزات الرد
   */
  extractResponseFeatures(text) {
    return {
      length: text.length,
      wordCount: text.split(' ').length,
      hasEmoji: /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(text),
      hasPersonalization: text.includes('حضرتك') || text.includes('لك') || text.includes('معك'),
      hasQuestion: text.includes('؟'),
      hasNumbers: /\d/.test(text),
      hasProductMention: text.includes('منتج') || text.includes('كوتشي'),
      tone: this.analyzeTone(text),
      urgency: this.analyzeUrgency(text),
      clarity: this.analyzeClarity(text)
    };
  }

  /**
   * تحليل نبرة الرد
   */
  analyzeTone(text) {
    const friendlyWords = ['سعيد', 'ممتاز', 'رائع', 'بالطبع', 'أكيد'];
    const professionalWords = ['يمكنني', 'سأقوم', 'بالتأكيد', 'حضرتك'];
    
    const friendlyCount = friendlyWords.filter(word => text.includes(word)).length;
    const professionalCount = professionalWords.filter(word => text.includes(word)).length;
    
    if (friendlyCount > professionalCount) return 'friendly';
    if (professionalCount > friendlyCount) return 'professional';
    return 'neutral';
  }

  /**
   * تحليل الإلحاح
   */
  analyzeUrgency(text) {
    const urgentWords = ['فوراً', 'سريع', 'عاجل', 'الآن', 'محدود'];
    const urgentCount = urgentWords.filter(word => text.includes(word)).length;
    
    if (urgentCount > 1) return 'high';
    if (urgentCount === 1) return 'medium';
    return 'low';
  }

  /**
   * تحليل الوضوح
   */
  analyzeClarity(text) {
    const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);
    const avgSentenceLength = text.length / sentences.length;
    
    if (avgSentenceLength < 50 && sentences.length <= 3) return 'high';
    if (avgSentenceLength < 80 && sentences.length <= 5) return 'medium';
    return 'low';
  }

  /**
   * تحديث إحصائيات الردود
   */
  updateResponseAnalytics(analysis) {
    const category = analysis.category;
    
    if (!this.responseAnalytics.has(category)) {
      this.responseAnalytics.set(category, {
        totalResponses: 0,
        totalSuccess: 0,
        averageSatisfaction: 0,
        averageConversion: 0,
        commonFeatures: new Map(),
        bestPerformers: []
      });
    }

    const analytics = this.responseAnalytics.get(category);
    analytics.totalResponses++;
    analytics.totalSuccess++;
    
    // تحديث المتوسطات
    analytics.averageSatisfaction = (
      (analytics.averageSatisfaction * (analytics.totalSuccess - 1) + 
       analysis.successMetrics.customerSatisfaction) / analytics.totalSuccess
    );
    
    analytics.averageConversion = (
      (analytics.averageConversion * (analytics.totalSuccess - 1) + 
       analysis.successMetrics.conversionRate) / analytics.totalSuccess
    );

    // تحديث الميزات الشائعة
    Object.entries(analysis.features).forEach(([feature, value]) => {
      if (typeof value === 'boolean' && value) {
        const count = analytics.commonFeatures.get(feature) || 0;
        analytics.commonFeatures.set(feature, count + 1);
      }
    });

    // إضافة للأفضل أداءً
    analytics.bestPerformers.push({
      text: analysis.text,
      satisfaction: analysis.successMetrics.customerSatisfaction,
      conversion: analysis.successMetrics.conversionRate,
      timestamp: analysis.timestamp
    });

    // الاحتفاظ بأفضل 10 فقط
    analytics.bestPerformers.sort((a, b) => 
      (b.satisfaction + b.conversion) - (a.satisfaction + a.conversion)
    );
    analytics.bestPerformers = analytics.bestPerformers.slice(0, 10);
  }

  /**
   * إضافة للقائمة للتحسين
   */
  queueForOptimization(analysis) {
    this.optimizationQueue.push(analysis);
    
    // تشغيل التحسين إذا وصلت القائمة لحد معين
    if (this.optimizationQueue.length >= 5) {
      setTimeout(() => this.processOptimizationQueue(), 1000);
    }
  }

  /**
   * معالجة قائمة التحسين
   */
  async processOptimizationQueue() {
    if (this.isOptimizing || this.optimizationQueue.length === 0) {
      return;
    }

    this.isOptimizing = true;
    console.log(`🔄 [ResponseOpt] Processing ${this.optimizationQueue.length} responses for optimization`);

    try {
      // تجميع الردود حسب الفئة
      const responsesByCategory = new Map();
      
      while (this.optimizationQueue.length > 0) {
        const response = this.optimizationQueue.shift();
        
        if (!responsesByCategory.has(response.category)) {
          responsesByCategory.set(response.category, []);
        }
        responsesByCategory.get(response.category).push(response);
      }

      // تحسين كل فئة
      for (const [category, responses] of responsesByCategory) {
        await this.optimizeTemplateCategory(category, responses);
      }

    } catch (error) {
      console.error('❌ [ResponseOpt] Error processing optimization queue:', error);
    } finally {
      this.isOptimizing = false;
    }
  }

  /**
   * تحسين قوالب فئة معينة
   */
  async optimizeTemplateCategory(category, responses) {
    try {
      console.log(`🎯 [ResponseOpt] Optimizing templates for category: ${category}`);
      
      const currentTemplate = this.responseTemplates.get(category);
      if (!currentTemplate) {
        // إنشاء قالب جديد
        await this.createNewTemplate(category, responses);
        return;
      }

      // تحليل الردود الناجحة
      const analysis = this.analyzeResponsePatterns(responses);
      
      // توليد تحسينات
      const improvements = this.generateTemplateImprovements(currentTemplate, analysis);
      
      // تطبيق التحسينات إذا كانت مفيدة
      if (improvements.confidence > 0.7) {
        await this.applyTemplateImprovements(category, improvements);
      }

      console.log(`✅ [ResponseOpt] Template optimization completed for: ${category}`);
    } catch (error) {
      console.error(`❌ [ResponseOpt] Error optimizing category ${category}:`, error);
    }
  }

  /**
   * تحليل أنماط الردود
   */
  analyzeResponsePatterns(responses) {
    const patterns = {
      commonPhrases: this.extractCommonPhrases(responses),
      successfulFeatures: this.identifySuccessfulFeatures(responses),
      optimalLength: this.calculateOptimalLength(responses),
      bestTone: this.identifyBestTone(responses),
      effectiveStructure: this.analyzeEffectiveStructure(responses)
    };

    return patterns;
  }

  /**
   * استخراج العبارات الشائعة
   */
  extractCommonPhrases(responses) {
    const phrases = new Map();
    
    responses.forEach(response => {
      const words = response.text.split(' ');
      
      // استخراج العبارات من 2-4 كلمات
      for (let i = 0; i < words.length - 1; i++) {
        for (let len = 2; len <= Math.min(4, words.length - i); len++) {
          const phrase = words.slice(i, i + len).join(' ');
          
          if (phrase.length > 5) { // تجاهل العبارات القصيرة جداً
            const count = phrases.get(phrase) || 0;
            phrases.set(phrase, count + 1);
          }
        }
      }
    });

    // إرجاع أكثر العبارات شيوعاً
    return Array.from(phrases.entries())
      .filter(([phrase, count]) => count >= 2)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([phrase, count]) => ({ phrase, frequency: count }));
  }

  /**
   * تحديد الميزات الناجحة
   */
  identifySuccessfulFeatures(responses) {
    const featureSuccess = new Map();
    
    responses.forEach(response => {
      const satisfaction = response.successMetrics.customerSatisfaction;
      
      Object.entries(response.features).forEach(([feature, value]) => {
        if (typeof value === 'boolean' && value) {
          if (!featureSuccess.has(feature)) {
            featureSuccess.set(feature, { count: 0, totalSatisfaction: 0 });
          }
          
          const stats = featureSuccess.get(feature);
          stats.count++;
          stats.totalSatisfaction += satisfaction;
        }
      });
    });

    // حساب متوسط النجاح لكل ميزة
    const successfulFeatures = Array.from(featureSuccess.entries())
      .map(([feature, stats]) => ({
        feature,
        averageSatisfaction: stats.totalSatisfaction / stats.count,
        frequency: stats.count,
        impact: stats.totalSatisfaction / stats.count > 0.8 ? 'high' : 'medium'
      }))
      .filter(f => f.frequency >= 2)
      .sort((a, b) => b.averageSatisfaction - a.averageSatisfaction);

    return successfulFeatures;
  }

  /**
   * حساب الطول الأمثل
   */
  calculateOptimalLength(responses) {
    const lengthSatisfaction = responses.map(r => ({
      length: r.features.length,
      satisfaction: r.successMetrics.customerSatisfaction
    }));

    // تجميع حسب نطاقات الطول
    const ranges = [
      { min: 0, max: 50, name: 'short' },
      { min: 51, max: 150, name: 'medium' },
      { min: 151, max: 300, name: 'long' },
      { min: 301, max: Infinity, name: 'very_long' }
    ];

    const rangeStats = ranges.map(range => {
      const inRange = lengthSatisfaction.filter(ls => 
        ls.length >= range.min && ls.length <= range.max
      );
      
      return {
        range: range.name,
        count: inRange.length,
        averageSatisfaction: inRange.length > 0 
          ? inRange.reduce((sum, ls) => sum + ls.satisfaction, 0) / inRange.length 
          : 0
      };
    }).filter(rs => rs.count > 0);

    return rangeStats.sort((a, b) => b.averageSatisfaction - a.averageSatisfaction)[0];
  }

  /**
   * توليد تحسينات القالب
   */
  generateTemplateImprovements(currentTemplate, analysis) {
    const improvements = {
      newTemplate: currentTemplate.template,
      changes: [],
      confidence: 0,
      reasoning: []
    };

    // تحسين بناءً على العبارات الشائعة
    if (analysis.commonPhrases.length > 0) {
      const topPhrase = analysis.commonPhrases[0];
      if (!currentTemplate.template.includes(topPhrase.phrase)) {
        improvements.newTemplate = this.incorporatePhrase(improvements.newTemplate, topPhrase.phrase);
        improvements.changes.push(`Added common phrase: "${topPhrase.phrase}"`);
        improvements.confidence += 0.2;
        improvements.reasoning.push(`العبارة "${topPhrase.phrase}" تظهر في ${topPhrase.frequency} ردود ناجحة`);
      }
    }

    // تحسين بناءً على الميزات الناجحة
    const topFeatures = analysis.successfulFeatures.slice(0, 3);
    topFeatures.forEach(feature => {
      if (feature.impact === 'high') {
        const enhancement = this.applyFeatureEnhancement(improvements.newTemplate, feature.feature);
        if (enhancement !== improvements.newTemplate) {
          improvements.newTemplate = enhancement;
          improvements.changes.push(`Enhanced with feature: ${feature.feature}`);
          improvements.confidence += 0.15;
          improvements.reasoning.push(`الميزة ${feature.feature} تحقق رضا ${(feature.averageSatisfaction * 100).toFixed(1)}%`);
        }
      }
    });

    // تحسين الطول
    if (analysis.optimalLength && analysis.optimalLength.range !== 'medium') {
      const lengthAdjustment = this.adjustTemplateLength(improvements.newTemplate, analysis.optimalLength.range);
      if (lengthAdjustment !== improvements.newTemplate) {
        improvements.newTemplate = lengthAdjustment;
        improvements.changes.push(`Adjusted length to ${analysis.optimalLength.range}`);
        improvements.confidence += 0.1;
        improvements.reasoning.push(`الطول ${analysis.optimalLength.range} يحقق أفضل نتائج`);
      }
    }

    return improvements;
  }

  /**
   * دمج عبارة في القالب
   */
  incorporatePhrase(template, phrase) {
    // محاولة دمج العبارة بطريقة طبيعية
    if (phrase.includes('يمكنني') && !template.includes('يمكنني')) {
      return template.replace(/^/, phrase + ' ');
    }
    
    if (phrase.includes('بالطبع') && !template.includes('بالطبع')) {
      return phrase + '! ' + template;
    }
    
    return template + ' ' + phrase;
  }

  /**
   * تطبيق تحسين الميزة
   */
  applyFeatureEnhancement(template, feature) {
    switch (feature) {
      case 'hasPersonalization':
        if (!template.includes('حضرتك') && !template.includes('لك')) {
          return template.replace(/يمكنني/, 'يمكنني مساعدة حضرتك');
        }
        break;
      case 'hasEmoji':
        if (!/[\u{1F600}-\u{1F64F}]/u.test(template)) {
          return template + ' 😊';
        }
        break;
      case 'hasQuestion':
        if (!template.includes('؟')) {
          return template + ' هل هذا يساعدك؟';
        }
        break;
    }
    
    return template;
  }

  /**
   * تعديل طول القالب
   */
  adjustTemplateLength(template, targetRange) {
    if (targetRange === 'short' && template.length > 50) {
      // تقصير القالب
      const sentences = template.split(/[.!?]/).filter(s => s.trim().length > 0);
      return sentences[0] + (sentences[0].endsWith('؟') ? '' : '؟');
    }
    
    if (targetRange === 'long' && template.length < 100) {
      // إطالة القالب
      return template + ' سأكون سعيداً لمساعدتك في أي شيء تحتاجه.';
    }
    
    return template;
  }

  /**
   * تطبيق تحسينات القالب
   */
  async applyTemplateImprovements(category, improvements) {
    try {
      const currentTemplate = this.responseTemplates.get(category);
      
      // إنشاء نسخة محدثة من القالب
      const updatedTemplate = {
        ...currentTemplate,
        template: improvements.newTemplate,
        lastUpdated: new Date(),
        optimizationHistory: [
          ...(currentTemplate.optimizationHistory || []),
          {
            timestamp: new Date(),
            changes: improvements.changes,
            confidence: improvements.confidence,
            reasoning: improvements.reasoning,
            previousTemplate: currentTemplate.template
          }
        ]
      };

      // حفظ القالب المحدث
      this.responseTemplates.set(category, updatedTemplate);
      
      // تطبيق على نظام الذكاء الاصطناعي
      await this.updateAITemplates(category, updatedTemplate);
      
      console.log(`✅ [ResponseOpt] Template updated for ${category} with confidence ${improvements.confidence.toFixed(2)}`);
      
      // تسجيل التحسين
      const continuousLearningService = require('./continuousLearningServiceV2');
      await continuousLearningService.recordImprovementApplication({
        type: 'template_optimization',
        category: category,
        companyId: 'cmdt8nrjq003vufuss47dqc45'
      }, {
        success: true,
        message: `Template optimized: ${category}`,
        details: improvements
      });

    } catch (error) {
      console.error('❌ [ResponseOpt] Error applying template improvements:', error);
    }
  }

  /**
   * تحديث قوالب الذكاء الاصطناعي
   */
  async updateAITemplates(category, template) {
    try {
      // تحديث في نظام الذكاء الاصطناعي
      console.log(`🤖 [ResponseOpt] Updating AI templates for category: ${category}`);
      
      // هنا يمكن إضافة تكامل مع نظام الذكاء الاصطناعي الفعلي
      
    } catch (error) {
      console.error('❌ [ResponseOpt] Error updating AI templates:', error);
    }
  }

  /**
   * إنشاء قالب جديد
   */
  async createNewTemplate(category, responses) {
    try {
      console.log(`➕ [ResponseOpt] Creating new template for category: ${category}`);
      
      const analysis = this.analyzeResponsePatterns(responses);
      const bestResponse = responses.reduce((best, current) => 
        current.successMetrics.customerSatisfaction > best.successMetrics.customerSatisfaction 
          ? current : best
      );

      const newTemplate = {
        id: category,
        category: category,
        template: bestResponse.text,
        successRate: analysis.successfulFeatures.length > 0 
          ? analysis.successfulFeatures[0].averageSatisfaction 
          : 0.8,
        usageCount: 0,
        lastUpdated: new Date(),
        variations: responses.slice(0, 3).map(r => r.text),
        createdFrom: 'optimization',
        confidence: 0.8
      };

      this.responseTemplates.set(category, newTemplate);
      console.log(`✅ [ResponseOpt] New template created for: ${category}`);
      
    } catch (error) {
      console.error('❌ [ResponseOpt] Error creating new template:', error);
    }
  }

  /**
   * الحصول على أفضل قالب لفئة معينة
   */
  getBestTemplate(category) {
    const template = this.responseTemplates.get(category);
    if (!template) {
      return this.responseTemplates.get('general') || null;
    }
    
    // تحديث عداد الاستخدام
    template.usageCount++;
    
    return template;
  }

  /**
   * الحصول على إحصائيات التحسين
   */
  getOptimizationStats() {
    const stats = {
      totalTemplates: this.responseTemplates.size,
      successfulResponses: this.successfulResponses.length,
      queueLength: this.optimizationQueue.length,
      isOptimizing: this.isOptimizing,
      categoryStats: {}
    };

    // إحصائيات كل فئة
    for (const [category, analytics] of this.responseAnalytics) {
      stats.categoryStats[category] = {
        totalResponses: analytics.totalResponses,
        averageSatisfaction: analytics.averageSatisfaction.toFixed(2),
        averageConversion: analytics.averageConversion.toFixed(2),
        topFeatures: Array.from(analytics.commonFeatures.entries())
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
      };
    }

    return stats;
  }

  /**
   * الحصول على تقرير التحسين
   */
  getOptimizationReport() {
    const templates = Array.from(this.responseTemplates.values());
    
    return {
      summary: {
        totalTemplates: templates.length,
        optimizedTemplates: templates.filter(t => t.optimizationHistory?.length > 0).length,
        averageSuccessRate: templates.reduce((sum, t) => sum + t.successRate, 0) / templates.length,
        lastOptimization: Math.max(...templates.map(t => new Date(t.lastUpdated).getTime()))
      },
      templates: templates.map(template => ({
        category: template.category,
        successRate: template.successRate,
        usageCount: template.usageCount,
        lastUpdated: template.lastUpdated,
        optimizations: template.optimizationHistory?.length || 0
      })),
      recentOptimizations: templates
        .filter(t => t.optimizationHistory?.length > 0)
        .flatMap(t => t.optimizationHistory.map(h => ({
          category: t.category,
          timestamp: h.timestamp,
          confidence: h.confidence,
          changes: h.changes
        })))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10)
    };
  }
}

}

module.exports = new ResponseOptimizationService();
