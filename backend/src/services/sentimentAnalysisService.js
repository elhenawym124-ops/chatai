/**
 * Sentiment Analysis Service
 * 
 * Handles customer sentiment analysis, intent detection, and emotional insights
 */

class SentimentAnalysisService {
  constructor() {
    this.sentimentHistory = new Map(); // Sentiment analysis history
    this.intentPatterns = new Map(); // Intent detection patterns
    this.emotionKeywords = new Map(); // Emotion keywords mapping
    this.topicCategories = new Map(); // Topic categorization
    this.customerSentimentProfiles = new Map(); // Customer sentiment profiles
    this.sentimentAlerts = new Map(); // Sentiment-based alerts
    this.initializeMockData();
  }

  /**
   * Initialize mock data and patterns
   */
  initializeMockData() {
    // Mock emotion keywords
    const mockEmotionKeywords = {
      positive: {
        happiness: ['سعيد', 'ممتاز', 'رائع', 'مذهل', 'أحب', 'جميل', 'مثالي', 'ولا أروع', 'فرحان', 'مبسوط'],
        satisfaction: ['راضي', 'مقتنع', 'مناسب', 'جيد', 'لا بأس', 'حلو', 'تمام', 'كويس', 'مرضي'],
        excitement: ['متحمس', 'متشوق', 'أريد', 'أتطلع', 'بفارغ الصبر', 'ما أطيق انتظار', 'حماس'],
        gratitude: ['شكراً', 'ممتن', 'أقدر', 'جزاكم الله خير', 'بارك الله فيكم', 'الله يعطيكم العافية'],
      },
      negative: {
        anger: ['غاضب', 'زعلان', 'مستاء', 'محبط', 'مقهور', 'متضايق', 'عصبي', 'مش راضي'],
        disappointment: ['محبط', 'مخيب للآمال', 'ما توقعت', 'فاشل', 'سيء', 'مش حلو', 'مو زين'],
        frustration: ['متعب', 'مش قادر', 'صعب', 'معقد', 'مستحيل', 'ما يصير', 'مشكلة'],
        complaint: ['شكوى', 'مشكلة', 'عيب', 'خطأ', 'غلط', 'مو شغال', 'معطل', 'مكسور'],
      },
      neutral: {
        inquiry: ['سؤال', 'استفسار', 'أريد أعرف', 'ممكن', 'كيف', 'متى', 'أين', 'ما هو'],
        information: ['معلومات', 'تفاصيل', 'بيانات', 'شرح', 'توضيح', 'وضح لي'],
      }
    };

    Object.entries(mockEmotionKeywords).forEach(([sentiment, emotions]) => {
      Object.entries(emotions).forEach(([emotion, keywords]) => {
        this.emotionKeywords.set(`${sentiment}_${emotion}`, keywords);
      });
    });

    // Mock intent patterns
    const mockIntentPatterns = [
      {
        intent: 'purchase_intent',
        patterns: ['أريد أشتري', 'بكم', 'كم السعر', 'أبي أطلب', 'عايز أخذ', 'ممكن أشتري'],
        confidence: 0.9,
        category: 'sales',
      },
      {
        intent: 'product_inquiry',
        patterns: ['عندكم', 'متوفر', 'موجود', 'تبيعون', 'لديكم', 'في عندكم'],
        confidence: 0.8,
        category: 'product',
      },
      {
        intent: 'price_inquiry',
        patterns: ['بكم', 'كم سعر', 'كم ثمن', 'كم يكلف', 'السعر كم', 'بكام'],
        confidence: 0.9,
        category: 'pricing',
      },
      {
        intent: 'support_request',
        patterns: ['مساعدة', 'مشكلة', 'عطل', 'لا يعمل', 'خطأ', 'ساعدني'],
        confidence: 0.8,
        category: 'support',
      },
      {
        intent: 'complaint',
        patterns: ['شكوى', 'مشكلة', 'غير راضي', 'سيء', 'فاشل', 'مخيب'],
        confidence: 0.85,
        category: 'complaint',
      },
      {
        intent: 'compliment',
        patterns: ['ممتاز', 'رائع', 'شكراً', 'أحسنتم', 'جميل', 'مثالي'],
        confidence: 0.8,
        category: 'positive_feedback',
      },
    ];

    mockIntentPatterns.forEach(pattern => {
      this.intentPatterns.set(pattern.intent, pattern);
    });

    // Mock topic categories
    const mockTopicCategories = [
      { category: 'product_quality', keywords: ['جودة', 'نوعية', 'خامة', 'صناعة', 'متين', 'قوي'] },
      { category: 'shipping', keywords: ['شحن', 'توصيل', 'وصل', 'تأخير', 'سريع', 'بطيء'] },
      { category: 'customer_service', keywords: ['خدمة', 'موظف', 'رد', 'تعامل', 'احترام', 'مساعدة'] },
      { category: 'pricing', keywords: ['سعر', 'ثمن', 'غالي', 'رخيص', 'مناسب', 'تكلفة'] },
      { category: 'website_app', keywords: ['موقع', 'تطبيق', 'صفحة', 'رابط', 'تحميل', 'تسجيل'] },
    ];

    mockTopicCategories.forEach(topic => {
      this.topicCategories.set(topic.category, topic.keywords);
    });

    // Mock sentiment history
    const mockSentimentHistory = [
      {
        id: 'SENT001',
        conversationId: 'CONV001',
        messageId: 'MSG001',
        customerId: '1',
        customerName: 'أحمد محمد',
        message: 'مرحباً، أريد السؤال عن اللابتوبات المتوفرة عندكم',
        analysis: {
          sentiment: 'neutral',
          confidence: 0.85,
          emotion: 'inquiry',
          intent: 'product_inquiry',
          intentConfidence: 0.9,
          topics: ['product'],
          keywords: ['لابتوبات', 'متوفرة'],
          urgency: 'low',
          buyingIntent: 0.7,
        },
        metadata: {
          messageLength: 45,
          hasQuestions: true,
          hasEmojis: false,
          language: 'ar',
          processingTime: 120,
        },
        createdAt: new Date('2024-01-15T10:25:00'),
      },
      {
        id: 'SENT002',
        conversationId: 'CONV002',
        messageId: 'MSG002',
        customerId: '2',
        customerName: 'سارة أحمد',
        message: 'الجهاز اللي طلبته أمس لا يعمل! محبطة جداً 😞',
        analysis: {
          sentiment: 'negative',
          confidence: 0.95,
          emotion: 'frustration',
          intent: 'complaint',
          intentConfidence: 0.9,
          topics: ['product_quality', 'customer_service'],
          keywords: ['لا يعمل', 'محبطة'],
          urgency: 'high',
          buyingIntent: 0.1,
        },
        metadata: {
          messageLength: 38,
          hasQuestions: false,
          hasEmojis: true,
          language: 'ar',
          processingTime: 95,
        },
        alerts: [
          {
            type: 'negative_sentiment',
            severity: 'high',
            message: 'عميل محبط - يحتاج تدخل فوري',
            triggeredAt: new Date('2024-01-15T11:30:00'),
          }
        ],
        createdAt: new Date('2024-01-15T11:30:00'),
      },
      {
        id: 'SENT003',
        conversationId: 'CONV003',
        messageId: 'MSG003',
        customerId: '3',
        customerName: 'محمد علي',
        message: 'ممتاز! الخدمة رائعة والمنتج وصل بسرعة. شكراً لكم 👍',
        analysis: {
          sentiment: 'positive',
          confidence: 0.98,
          emotion: 'satisfaction',
          intent: 'compliment',
          intentConfidence: 0.95,
          topics: ['customer_service', 'shipping', 'product_quality'],
          keywords: ['ممتاز', 'رائعة', 'بسرعة', 'شكراً'],
          urgency: 'low',
          buyingIntent: 0.8,
        },
        metadata: {
          messageLength: 52,
          hasQuestions: false,
          hasEmojis: true,
          language: 'ar',
          processingTime: 110,
        },
        createdAt: new Date('2024-01-15T14:20:00'),
      },
    ];

    mockSentimentHistory.forEach(sentiment => {
      this.sentimentHistory.set(sentiment.id, sentiment);
    });

    // Mock customer sentiment profiles
    const mockCustomerProfiles = [
      {
        customerId: '1',
        customerName: 'أحمد محمد',
        overallSentiment: 'neutral',
        sentimentTrend: 'stable',
        totalMessages: 15,
        sentimentDistribution: {
          positive: 6,
          neutral: 8,
          negative: 1,
        },
        averageConfidence: 0.87,
        topEmotions: ['inquiry', 'satisfaction', 'excitement'],
        topIntents: ['product_inquiry', 'purchase_intent'],
        buyingIntentScore: 0.75,
        riskLevel: 'low',
        lastAnalyzed: new Date('2024-01-15T10:25:00'),
      },
      {
        customerId: '2',
        customerName: 'سارة أحمد',
        overallSentiment: 'negative',
        sentimentTrend: 'declining',
        totalMessages: 8,
        sentimentDistribution: {
          positive: 1,
          neutral: 2,
          negative: 5,
        },
        averageConfidence: 0.92,
        topEmotions: ['frustration', 'disappointment', 'anger'],
        topIntents: ['complaint', 'support_request'],
        buyingIntentScore: 0.2,
        riskLevel: 'high',
        lastAnalyzed: new Date('2024-01-15T11:30:00'),
      },
    ];

    mockCustomerProfiles.forEach(profile => {
      this.customerSentimentProfiles.set(profile.customerId, profile);
    });
  }

  /**
   * Analyze sentiment of a message
   */
  async analyzeSentiment(messageData) {
    try {
      const {
        conversationId,
        messageId,
        customerId,
        customerName,
        message,
        timestamp = new Date(),
      } = messageData;

      // Perform sentiment analysis
      const sentimentResult = await this.performSentimentAnalysis(message);
      const intentResult = await this.detectIntent(message);
      const topicResult = await this.categorizeTopics(message);
      const emotionResult = await this.detectEmotion(message);
      const urgencyResult = await this.assessUrgency(message, sentimentResult);
      const buyingIntentResult = await this.assessBuyingIntent(message, intentResult);

      const analysis = {
        id: this.generateAnalysisId(),
        conversationId,
        messageId,
        customerId,
        customerName,
        message,
        analysis: {
          sentiment: sentimentResult.sentiment,
          confidence: sentimentResult.confidence,
          emotion: emotionResult.emotion,
          intent: intentResult.intent,
          intentConfidence: intentResult.confidence,
          topics: topicResult.topics,
          keywords: this.extractKeywords(message),
          urgency: urgencyResult.level,
          buyingIntent: buyingIntentResult.score,
        },
        metadata: {
          messageLength: message.length,
          hasQuestions: this.hasQuestions(message),
          hasEmojis: this.hasEmojis(message),
          language: this.detectLanguage(message),
          processingTime: Math.round(Math.random() * 100 + 50),
        },
        createdAt: timestamp,
      };

      // Check for alerts
      const alerts = await this.checkForAlerts(analysis);
      if (alerts.length > 0) {
        analysis.alerts = alerts;
      }

      // Store analysis
      this.sentimentHistory.set(analysis.id, analysis);

      // Update customer profile
      await this.updateCustomerProfile(customerId, analysis);

      return {
        success: true,
        data: analysis,
        message: 'تم تحليل المشاعر بنجاح'
      };

    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return {
        success: false,
        error: 'فشل في تحليل المشاعر'
      };
    }
  }

  /**
   * Get sentiment analysis history
   */
  async getSentimentHistory(filters = {}) {
    try {
      const {
        customerId,
        conversationId,
        sentiment,
        startDate,
        endDate,
        page = 1,
        limit = 20,
      } = filters;

      let history = Array.from(this.sentimentHistory.values());

      // Apply filters
      if (customerId) {
        history = history.filter(h => h.customerId === customerId);
      }

      if (conversationId) {
        history = history.filter(h => h.conversationId === conversationId);
      }

      if (sentiment) {
        history = history.filter(h => h.analysis.sentiment === sentiment);
      }

      if (startDate) {
        history = history.filter(h => new Date(h.createdAt) >= new Date(startDate));
      }

      if (endDate) {
        history = history.filter(h => new Date(h.createdAt) <= new Date(endDate));
      }

      // Sort by creation date (newest first)
      history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedHistory = history.slice(startIndex, endIndex);

      return {
        success: true,
        data: paginatedHistory,
        pagination: {
          page,
          limit,
          total: history.length,
          pages: Math.ceil(history.length / limit)
        }
      };

    } catch (error) {
      console.error('Error getting sentiment history:', error);
      return {
        success: false,
        error: 'فشل في جلب تاريخ تحليل المشاعر'
      };
    }
  }

  /**
   * Get customer sentiment profile
   */
  async getCustomerSentimentProfile(customerId) {
    try {
      const profile = this.customerSentimentProfiles.get(customerId);
      
      if (!profile) {
        return {
          success: false,
          error: 'ملف العميل غير موجود'
        };
      }

      // Get recent sentiment history for this customer
      const recentHistory = Array.from(this.sentimentHistory.values())
        .filter(h => h.customerId === customerId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);

      return {
        success: true,
        data: {
          profile,
          recentHistory,
        }
      };

    } catch (error) {
      console.error('Error getting customer sentiment profile:', error);
      return {
        success: false,
        error: 'فشل في جلب ملف مشاعر العميل'
      };
    }
  }

  /**
   * Get sentiment analytics
   */
  async getSentimentAnalytics(filters = {}) {
    try {
      const { period = 'week', companyId } = filters;

      const history = Array.from(this.sentimentHistory.values());
      
      // Apply date filter based on period
      const dateRange = this.getDateRange(period);
      const filteredHistory = history.filter(h => {
        const date = new Date(h.createdAt);
        return date >= dateRange.start && date <= dateRange.end;
      });

      const analytics = {
        overview: this.calculateOverviewStats(filteredHistory),
        sentimentDistribution: this.calculateSentimentDistribution(filteredHistory),
        emotionDistribution: this.calculateEmotionDistribution(filteredHistory),
        intentDistribution: this.calculateIntentDistribution(filteredHistory),
        topicDistribution: this.calculateTopicDistribution(filteredHistory),
        urgencyDistribution: this.calculateUrgencyDistribution(filteredHistory),
        buyingIntentStats: this.calculateBuyingIntentStats(filteredHistory),
        trends: this.calculateSentimentTrends(filteredHistory, period),
        alerts: this.getActiveAlerts(),
        riskCustomers: this.getRiskCustomers(),
        opportunities: this.getOpportunities(),
      };

      return {
        success: true,
        data: analytics
      };

    } catch (error) {
      console.error('Error getting sentiment analytics:', error);
      return {
        success: false,
        error: 'فشل في جلب تحليلات المشاعر'
      };
    }
  }

  /**
   * Helper methods for sentiment analysis
   */
  async performSentimentAnalysis(message) {
    // Simple rule-based sentiment analysis
    const positiveKeywords = Array.from(this.emotionKeywords.keys())
      .filter(key => key.startsWith('positive_'))
      .flatMap(key => this.emotionKeywords.get(key));

    const negativeKeywords = Array.from(this.emotionKeywords.keys())
      .filter(key => key.startsWith('negative_'))
      .flatMap(key => this.emotionKeywords.get(key));

    const messageLower = message.toLowerCase();
    
    let positiveScore = 0;
    let negativeScore = 0;

    positiveKeywords.forEach(keyword => {
      if (messageLower.includes(keyword)) {
        positiveScore += 1;
      }
    });

    negativeKeywords.forEach(keyword => {
      if (messageLower.includes(keyword)) {
        negativeScore += 1;
      }
    });

    let sentiment = 'neutral';
    let confidence = 0.5;

    if (positiveScore > negativeScore) {
      sentiment = 'positive';
      confidence = Math.min(0.6 + (positiveScore * 0.1), 0.95);
    } else if (negativeScore > positiveScore) {
      sentiment = 'negative';
      confidence = Math.min(0.6 + (negativeScore * 0.1), 0.95);
    } else {
      confidence = 0.5 + Math.random() * 0.3;
    }

    return { sentiment, confidence };
  }

  async detectIntent(message) {
    const messageLower = message.toLowerCase();
    let bestMatch = null;
    let highestScore = 0;

    Array.from(this.intentPatterns.values()).forEach(pattern => {
      let score = 0;
      pattern.patterns.forEach(patternText => {
        if (messageLower.includes(patternText)) {
          score += 1;
        }
      });

      if (score > highestScore) {
        highestScore = score;
        bestMatch = pattern;
      }
    });

    if (bestMatch && highestScore > 0) {
      return {
        intent: bestMatch.intent,
        confidence: Math.min(bestMatch.confidence * (highestScore / bestMatch.patterns.length), 0.95),
        category: bestMatch.category,
      };
    }

    return {
      intent: 'general',
      confidence: 0.3,
      category: 'general',
    };
  }

  async categorizeTopics(message) {
    const messageLower = message.toLowerCase();
    const topics = [];

    Array.from(this.topicCategories.entries()).forEach(([category, keywords]) => {
      const matches = keywords.filter(keyword => messageLower.includes(keyword));
      if (matches.length > 0) {
        topics.push(category);
      }
    });

    return { topics: topics.length > 0 ? topics : ['general'] };
  }

  async detectEmotion(message) {
    const messageLower = message.toLowerCase();
    let detectedEmotion = 'neutral';
    let highestScore = 0;

    Array.from(this.emotionKeywords.entries()).forEach(([emotionKey, keywords]) => {
      const matches = keywords.filter(keyword => messageLower.includes(keyword));
      if (matches.length > highestScore) {
        highestScore = matches.length;
        detectedEmotion = emotionKey.split('_')[1];
      }
    });

    return { emotion: detectedEmotion };
  }

  async assessUrgency(message, sentimentResult) {
    const urgencyKeywords = ['عاجل', 'سريع', 'فوري', 'مستعجل', 'ضروري'];
    const messageLower = message.toLowerCase();
    
    let urgencyScore = 0;
    
    urgencyKeywords.forEach(keyword => {
      if (messageLower.includes(keyword)) {
        urgencyScore += 1;
      }
    });

    // Negative sentiment increases urgency
    if (sentimentResult.sentiment === 'negative') {
      urgencyScore += 1;
    }

    let level = 'low';
    if (urgencyScore >= 2) level = 'high';
    else if (urgencyScore >= 1) level = 'medium';

    return { level, score: urgencyScore };
  }

  async assessBuyingIntent(message, intentResult) {
    const buyingKeywords = ['أشتري', 'أطلب', 'أريد', 'بكم', 'السعر', 'أخذ'];
    const messageLower = message.toLowerCase();
    
    let score = 0.3; // Base score

    buyingKeywords.forEach(keyword => {
      if (messageLower.includes(keyword)) {
        score += 0.15;
      }
    });

    // Intent-based scoring
    if (intentResult.intent === 'purchase_intent') {
      score += 0.4;
    } else if (intentResult.intent === 'price_inquiry') {
      score += 0.3;
    } else if (intentResult.intent === 'product_inquiry') {
      score += 0.2;
    }

    return { score: Math.min(score, 1.0) };
  }

  extractKeywords(message) {
    // Simple keyword extraction
    const words = message.split(' ').filter(word => word.length > 3);
    return words.slice(0, 5); // Return top 5 words
  }

  hasQuestions(message) {
    return message.includes('؟') || message.includes('?');
  }

  hasEmojis(message) {
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu;
    return emojiRegex.test(message);
  }

  detectLanguage(message) {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(message) ? 'ar' : 'en';
  }

  async checkForAlerts(analysis) {
    const alerts = [];

    // Negative sentiment alert
    if (analysis.analysis.sentiment === 'negative' && analysis.analysis.confidence > 0.8) {
      alerts.push({
        type: 'negative_sentiment',
        severity: analysis.analysis.urgency === 'high' ? 'high' : 'medium',
        message: 'عميل محبط - يحتاج تدخل فوري',
        triggeredAt: new Date(),
      });
    }

    // High buying intent alert
    if (analysis.analysis.buyingIntent > 0.8) {
      alerts.push({
        type: 'high_buying_intent',
        severity: 'medium',
        message: 'فرصة مبيعات عالية - متابعة مطلوبة',
        triggeredAt: new Date(),
      });
    }

    // Complaint alert
    if (analysis.analysis.intent === 'complaint') {
      alerts.push({
        type: 'complaint',
        severity: 'high',
        message: 'شكوى عميل - تدخل إداري مطلوب',
        triggeredAt: new Date(),
      });
    }

    return alerts;
  }

  async updateCustomerProfile(customerId, analysis) {
    let profile = this.customerSentimentProfiles.get(customerId);
    
    if (!profile) {
      profile = {
        customerId,
        customerName: analysis.customerName,
        overallSentiment: 'neutral',
        sentimentTrend: 'stable',
        totalMessages: 0,
        sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
        averageConfidence: 0,
        topEmotions: [],
        topIntents: [],
        buyingIntentScore: 0,
        riskLevel: 'low',
        lastAnalyzed: new Date(),
      };
    }

    // Update statistics
    profile.totalMessages++;
    profile.sentimentDistribution[analysis.analysis.sentiment]++;
    profile.lastAnalyzed = new Date();

    // Calculate overall sentiment
    const total = profile.totalMessages;
    const positive = profile.sentimentDistribution.positive;
    const negative = profile.sentimentDistribution.negative;
    
    if (positive / total > 0.6) {
      profile.overallSentiment = 'positive';
    } else if (negative / total > 0.4) {
      profile.overallSentiment = 'negative';
    } else {
      profile.overallSentiment = 'neutral';
    }

    // Update risk level
    if (negative / total > 0.6) {
      profile.riskLevel = 'high';
    } else if (negative / total > 0.3) {
      profile.riskLevel = 'medium';
    } else {
      profile.riskLevel = 'low';
    }

    this.customerSentimentProfiles.set(customerId, profile);
  }

  calculateOverviewStats(history) {
    return {
      totalAnalyses: history.length,
      averageConfidence: history.length > 0 ? 
        history.reduce((sum, h) => sum + h.analysis.confidence, 0) / history.length : 0,
      averageBuyingIntent: history.length > 0 ?
        history.reduce((sum, h) => sum + h.analysis.buyingIntent, 0) / history.length : 0,
      alertsGenerated: history.reduce((sum, h) => sum + (h.alerts ? h.alerts.length : 0), 0),
    };
  }

  calculateSentimentDistribution(history) {
    const distribution = { positive: 0, neutral: 0, negative: 0 };
    history.forEach(h => {
      distribution[h.analysis.sentiment]++;
    });
    return distribution;
  }

  calculateEmotionDistribution(history) {
    const distribution = {};
    history.forEach(h => {
      const emotion = h.analysis.emotion;
      distribution[emotion] = (distribution[emotion] || 0) + 1;
    });
    return distribution;
  }

  calculateIntentDistribution(history) {
    const distribution = {};
    history.forEach(h => {
      const intent = h.analysis.intent;
      distribution[intent] = (distribution[intent] || 0) + 1;
    });
    return distribution;
  }

  calculateTopicDistribution(history) {
    const distribution = {};
    history.forEach(h => {
      h.analysis.topics.forEach(topic => {
        distribution[topic] = (distribution[topic] || 0) + 1;
      });
    });
    return distribution;
  }

  calculateUrgencyDistribution(history) {
    const distribution = { low: 0, medium: 0, high: 0 };
    history.forEach(h => {
      distribution[h.analysis.urgency]++;
    });
    return distribution;
  }

  calculateBuyingIntentStats(history) {
    const scores = history.map(h => h.analysis.buyingIntent);
    return {
      average: scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0,
      high: scores.filter(score => score > 0.7).length,
      medium: scores.filter(score => score > 0.4 && score <= 0.7).length,
      low: scores.filter(score => score <= 0.4).length,
    };
  }

  calculateSentimentTrends(history, period) {
    // Mock trend calculation
    return [
      { period: 'يوم 1', positive: 12, neutral: 8, negative: 3 },
      { period: 'يوم 2', positive: 15, neutral: 10, negative: 2 },
      { period: 'يوم 3', positive: 18, neutral: 12, negative: 4 },
      { period: 'يوم 4', positive: 14, neutral: 9, negative: 1 },
      { period: 'يوم 5', positive: 20, neutral: 11, negative: 2 },
    ];
  }

  getActiveAlerts() {
    const alerts = [];
    Array.from(this.sentimentHistory.values()).forEach(h => {
      if (h.alerts) {
        alerts.push(...h.alerts.map(alert => ({
          ...alert,
          customerId: h.customerId,
          customerName: h.customerName,
          conversationId: h.conversationId,
        })));
      }
    });
    return alerts.slice(0, 10); // Return latest 10 alerts
  }

  getRiskCustomers() {
    return Array.from(this.customerSentimentProfiles.values())
      .filter(profile => profile.riskLevel === 'high')
      .sort((a, b) => new Date(b.lastAnalyzed) - new Date(a.lastAnalyzed))
      .slice(0, 5);
  }

  getOpportunities() {
    return Array.from(this.sentimentHistory.values())
      .filter(h => h.analysis.buyingIntent > 0.7)
      .sort((a, b) => b.analysis.buyingIntent - a.analysis.buyingIntent)
      .slice(0, 5)
      .map(h => ({
        customerId: h.customerId,
        customerName: h.customerName,
        conversationId: h.conversationId,
        buyingIntent: h.analysis.buyingIntent,
        message: h.message,
        createdAt: h.createdAt,
      }));
  }

  getDateRange(period) {
    const now = new Date();
    let start, end = now;

    switch (period) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    return { start, end };
  }

  generateAnalysisId() {
    return `SENT${Date.now().toString(36).toUpperCase()}`;
  }
}

module.exports = new SentimentAnalysisService();
