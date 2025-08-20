/**
 * خدمة تحليل المحادثات
 * Conversation Analysis Service for learning from real conversations
 */

class ConversationAnalysisService {
  constructor() {
    this.analysisQueue = [];
    this.learningPatterns = new Map();
    this.successFactors = new Map();
    this.failureReasons = new Map();
    this.isProcessing = false;
  }

  /**
   * تحليل محادثة مكتملة
   */
  async analyzeConversation(conversationId, messages, outcome) {
    try {
      console.log(`🔍 [Analysis] Analyzing conversation: ${conversationId}`);
      
      const analysis = {
        conversationId,
        timestamp: new Date(),
        messageCount: messages.length,
        outcome: outcome, // 'success', 'failure', 'partial'
        analysis: await this.performDeepAnalysis(messages, outcome),
        learningPoints: await this.extractLearningPoints(messages, outcome),
        recommendations: await this.generateRecommendations(messages, outcome)
      };

      // حفظ التحليل
      await this.saveAnalysis(analysis);
      
      // تحديث نماذج التعلم
      await this.updateLearningModels(analysis);
      
      // تطبيق التحسينات إذا كانت مؤكدة
      await this.applyLearnings(analysis);
      
      console.log(`✅ [Analysis] Conversation analysis completed: ${conversationId}`);
      return analysis;
    } catch (error) {
      console.error(`❌ [Analysis] Error analyzing conversation ${conversationId}:`, error);
      throw error;
    }
  }

  /**
   * تحليل عميق للمحادثة
   */
  async performDeepAnalysis(messages, outcome) {
    const analysis = {
      conversationFlow: this.analyzeConversationFlow(messages),
      responseQuality: this.analyzeResponseQuality(messages),
      customerSentiment: this.analyzeSentiment(messages),
      aiPerformance: this.analyzeAIPerformance(messages),
      conversionFactors: this.analyzeConversionFactors(messages, outcome)
    };

    return analysis;
  }

  /**
   * تحليل تدفق المحادثة
   */
  analyzeConversationFlow(messages) {
    const flow = {
      totalMessages: messages.length,
      customerMessages: messages.filter(m => m.sender === 'customer').length,
      aiMessages: messages.filter(m => m.sender === 'ai').length,
      averageResponseTime: this.calculateAverageResponseTime(messages),
      conversationDuration: this.calculateConversationDuration(messages),
      topicChanges: this.detectTopicChanges(messages)
    };

    return flow;
  }

  /**
   * تحليل جودة الردود
   */
  analyzeResponseQuality(messages) {
    const aiMessages = messages.filter(m => m.sender === 'ai');
    
    return {
      averageLength: aiMessages.reduce((sum, m) => sum + m.text.length, 0) / aiMessages.length,
      helpfulnessScore: this.calculateHelpfulnessScore(aiMessages),
      clarityScore: this.calculateClarityScore(aiMessages),
      relevanceScore: this.calculateRelevanceScore(aiMessages),
      personalizedResponses: this.countPersonalizedResponses(aiMessages)
    };
  }

  /**
   * تحليل مشاعر العميل
   */
  analyzeSentiment(messages) {
    const customerMessages = messages.filter(m => m.sender === 'customer');
    
    const sentiments = customerMessages.map(message => {
      return this.detectSentiment(message.text);
    });

    return {
      overallSentiment: this.calculateOverallSentiment(sentiments),
      sentimentProgression: sentiments,
      positivePoints: sentiments.filter(s => s.score > 0.3).length,
      negativePoints: sentiments.filter(s => s.score < -0.3).length,
      neutralPoints: sentiments.filter(s => Math.abs(s.score) <= 0.3).length
    };
  }

  /**
   * تحليل أداء الذكاء الاصطناعي
   */
  analyzeAIPerformance(messages) {
    const aiMessages = messages.filter(m => m.sender === 'ai');
    
    return {
      responseAccuracy: this.calculateResponseAccuracy(aiMessages),
      productRecommendations: this.countProductRecommendations(aiMessages),
      questionAnswering: this.analyzeQuestionAnswering(messages),
      proactiveHelp: this.countProactiveHelp(aiMessages),
      escalationHandling: this.analyzeEscalationHandling(messages)
    };
  }

  /**
   * تحليل عوامل التحويل
   */
  analyzeConversionFactors(messages, outcome) {
    const factors = {
      priceDiscussions: this.countPriceDiscussions(messages),
      productInterest: this.analyzeProductInterest(messages),
      objectionHandling: this.analyzeObjectionHandling(messages),
      urgencyCreation: this.analyzeUrgencyCreation(messages),
      trustBuilding: this.analyzeTrustBuilding(messages)
    };

    // ربط العوامل بالنتيجة
    factors.successCorrelation = this.calculateSuccessCorrelation(factors, outcome);
    
    return factors;
  }

  /**
   * استخراج نقاط التعلم
   */
  async extractLearningPoints(messages, outcome) {
    const learningPoints = [];

    // تحليل الردود الناجحة
    if (outcome === 'success') {
      const successfulPatterns = this.identifySuccessfulPatterns(messages);
      learningPoints.push(...successfulPatterns.map(pattern => ({
        type: 'success_pattern',
        pattern: pattern,
        confidence: pattern.confidence,
        applicability: 'high'
      })));
    }

    // تحليل نقاط الفشل
    if (outcome === 'failure') {
      const failurePoints = this.identifyFailurePoints(messages);
      learningPoints.push(...failurePoints.map(point => ({
        type: 'failure_point',
        issue: point.issue,
        suggestion: point.suggestion,
        priority: point.priority
      })));
    }

    // تحليل الفرص المفقودة
    const missedOpportunities = this.identifyMissedOpportunities(messages);
    learningPoints.push(...missedOpportunities.map(opp => ({
      type: 'missed_opportunity',
      opportunity: opp.opportunity,
      impact: opp.impact,
      recommendation: opp.recommendation
    })));

    return learningPoints;
  }

  /**
   * توليد التوصيات
   */
  async generateRecommendations(messages, outcome) {
    const recommendations = [];

    // توصيات تحسين الردود
    const responseImprovements = this.generateResponseImprovements(messages);
    recommendations.push(...responseImprovements);

    // توصيات تحسين التدفق
    const flowImprovements = this.generateFlowImprovements(messages);
    recommendations.push(...flowImprovements);

    // توصيات شخصنة
    const personalizationImprovements = this.generatePersonalizationImprovements(messages);
    recommendations.push(...personalizationImprovements);

    return recommendations;
  }

  /**
   * تحديث نماذج التعلم
   */
  async updateLearningModels(analysis) {
    try {
      // تحديث أنماط النجاح
      if (analysis.outcome === 'success') {
        await this.updateSuccessPatterns(analysis);
      }

      // تحديث أسباب الفشل
      if (analysis.outcome === 'failure') {
        await this.updateFailureReasons(analysis);
      }

      // تحديث نماذج التنبؤ
      await this.updatePredictionModels(analysis);

      console.log(`📊 [Analysis] Learning models updated for conversation: ${analysis.conversationId}`);
    } catch (error) {
      console.error('❌ [Analysis] Error updating learning models:', error);
    }
  }

  /**
   * تطبيق التعلم
   */
  async applyLearnings(analysis) {
    try {
      const highConfidenceLearnings = analysis.learningPoints.filter(
        point => point.confidence > 0.8 || point.priority === 'high'
      );

      for (const learning of highConfidenceLearnings) {
        await this.applyLearningPoint(learning);
      }

      console.log(`⚡ [Analysis] Applied ${highConfidenceLearnings.length} high-confidence learnings`);
    } catch (error) {
      console.error('❌ [Analysis] Error applying learnings:', error);
    }
  }

  /**
   * تطبيق نقطة تعلم واحدة
   */
  async applyLearningPoint(learning) {
    try {
      const continuousLearningService = require('./continuousLearningServiceV2');

      switch (learning.type) {
        case 'success_pattern':
          await this.applySuccessPattern(learning.pattern);
          break;
        case 'failure_point':
          await this.fixFailurePoint(learning);
          break;
        case 'missed_opportunity':
          await this.implementOpportunity(learning);
          break;
      }

      // تسجيل التطبيق
      await continuousLearningService.recordImprovementApplication({
        type: 'conversation_learning',
        source: learning.type,
        companyId: 'cmdt8nrjq003vufuss47dqc45'
      }, {
        success: true,
        message: `Applied learning: ${learning.type}`,
        details: learning
      });

    } catch (error) {
      console.error('❌ [Analysis] Error applying learning point:', error);
    }
  }

  /**
   * حساب متوسط وقت الاستجابة
   */
  calculateAverageResponseTime(messages) {
    const responseTimes = [];
    
    for (let i = 1; i < messages.length; i++) {
      if (messages[i].sender === 'ai' && messages[i-1].sender === 'customer') {
        const responseTime = new Date(messages[i].timestamp) - new Date(messages[i-1].timestamp);
        responseTimes.push(responseTime);
      }
    }

    return responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length / 1000 // بالثواني
      : 0;
  }

  /**
   * حساب مدة المحادثة
   */
  calculateConversationDuration(messages) {
    if (messages.length < 2) return 0;
    
    const start = new Date(messages[0].timestamp);
    const end = new Date(messages[messages.length - 1].timestamp);
    
    return (end - start) / 1000 / 60; // بالدقائق
  }

  /**
   * كشف تغييرات الموضوع
   */
  detectTopicChanges(messages) {
    // محاكاة كشف تغييرات الموضوع
    const topics = ['greeting', 'product_inquiry', 'pricing', 'ordering', 'support'];
    let changes = 0;
    let currentTopic = 'greeting';

    for (const message of messages) {
      const detectedTopic = this.detectMessageTopic(message.text);
      if (detectedTopic !== currentTopic) {
        changes++;
        currentTopic = detectedTopic;
      }
    }

    return changes;
  }

  /**
   * كشف موضوع الرسالة
   */
  detectMessageTopic(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('سعر') || lowerText.includes('كام') || lowerText.includes('تكلفة')) {
      return 'pricing';
    } else if (lowerText.includes('طلب') || lowerText.includes('اشتري') || lowerText.includes('عايز')) {
      return 'ordering';
    } else if (lowerText.includes('مشكلة') || lowerText.includes('عطل') || lowerText.includes('مساعدة')) {
      return 'support';
    } else if (lowerText.includes('منتج') || lowerText.includes('كوتشي') || lowerText.includes('حذاء')) {
      return 'product_inquiry';
    } else {
      return 'general';
    }
  }

  /**
   * كشف المشاعر
   */
  detectSentiment(text) {
    // محاكاة تحليل المشاعر
    const positiveWords = ['ممتاز', 'رائع', 'جميل', 'شكرا', 'حلو', 'عجبني'];
    const negativeWords = ['سيء', 'مش عاجبني', 'غالي', 'مشكلة', 'زعلان', 'مش كويس'];
    
    let score = 0;
    const lowerText = text.toLowerCase();
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) score += 0.3;
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) score -= 0.3;
    });
    
    return {
      score: Math.max(-1, Math.min(1, score)),
      label: score > 0.3 ? 'positive' : score < -0.3 ? 'negative' : 'neutral'
    };
  }

  /**
   * حساب المشاعر العامة
   */
  calculateOverallSentiment(sentiments) {
    if (sentiments.length === 0) return { score: 0, label: 'neutral' };
    
    const averageScore = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;
    
    return {
      score: averageScore,
      label: averageScore > 0.2 ? 'positive' : averageScore < -0.2 ? 'negative' : 'neutral'
    };
  }

  /**
   * تحديد الأنماط الناجحة
   */
  identifySuccessfulPatterns(messages) {
    const patterns = [];
    
    // نمط الاستجابة السريعة
    const avgResponseTime = this.calculateAverageResponseTime(messages);
    if (avgResponseTime < 5) {
      patterns.push({
        type: 'quick_response',
        description: 'استجابة سريعة تحت 5 ثواني',
        confidence: 0.9,
        impact: 'high'
      });
    }

    // نمط التخصيص
    const aiMessages = messages.filter(m => m.sender === 'ai');
    const personalizedCount = this.countPersonalizedResponses(aiMessages);
    if (personalizedCount > aiMessages.length * 0.5) {
      patterns.push({
        type: 'personalization',
        description: 'استخدام ردود مخصصة بنسبة عالية',
        confidence: 0.8,
        impact: 'medium'
      });
    }

    return patterns;
  }

  /**
   * تحديد نقاط الفشل
   */
  identifyFailurePoints(messages) {
    const failurePoints = [];
    
    // وقت استجابة طويل
    const avgResponseTime = this.calculateAverageResponseTime(messages);
    if (avgResponseTime > 15) {
      failurePoints.push({
        issue: 'slow_response',
        description: 'وقت استجابة طويل',
        suggestion: 'تحسين سرعة معالجة الطلبات',
        priority: 'high'
      });
    }

    // عدم فهم الاستفسار
    const misunderstandings = this.countMisunderstandings(messages);
    if (misunderstandings > 2) {
      failurePoints.push({
        issue: 'misunderstanding',
        description: 'عدم فهم متكرر لاستفسارات العميل',
        suggestion: 'تحسين نماذج فهم اللغة الطبيعية',
        priority: 'high'
      });
    }

    return failurePoints;
  }

  /**
   * عد الردود المخصصة
   */
  countPersonalizedResponses(aiMessages) {
    return aiMessages.filter(message => {
      const text = message.text.toLowerCase();
      return text.includes('حضرتك') || text.includes('اسم') || text.includes('خاص');
    }).length;
  }

  /**
   * عد سوء الفهم
   */
  countMisunderstandings(messages) {
    let count = 0;
    
    for (let i = 1; i < messages.length; i++) {
      if (messages[i].sender === 'customer') {
        const text = messages[i].text.toLowerCase();
        if (text.includes('مش ده اللي قصدي') || 
            text.includes('مفهمتنيش') || 
            text.includes('مش كده')) {
          count++;
        }
      }
    }
    
    return count;
  }

  /**
   * حفظ التحليل
   */
  async saveAnalysis(analysis) {
    try {
      // محاكاة حفظ في قاعدة البيانات
      console.log(`💾 [Analysis] Saving analysis for conversation: ${analysis.conversationId}`);
      
      // هنا يمكن إضافة حفظ حقيقي في قاعدة البيانات
      
    } catch (error) {
      console.error('❌ [Analysis] Error saving analysis:', error);
    }
  }

  /**
   * معالجة قائمة انتظار التحليل
   */
  async processAnalysisQueue() {
    if (this.isProcessing || this.analysisQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log(`🔄 [Analysis] Processing ${this.analysisQueue.length} conversations in queue`);

    try {
      while (this.analysisQueue.length > 0) {
        const item = this.analysisQueue.shift();
        await this.analyzeConversation(item.conversationId, item.messages, item.outcome);
      }
    } catch (error) {
      console.error('❌ [Analysis] Error processing queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * إضافة محادثة لقائمة التحليل
   */
  queueConversationForAnalysis(conversationId, messages, outcome) {
    this.analysisQueue.push({ conversationId, messages, outcome });
    console.log(`📝 [Analysis] Queued conversation for analysis: ${conversationId}`);
    
    // معالجة فورية إذا لم تكن هناك معالجة جارية
    setTimeout(() => this.processAnalysisQueue(), 1000);
  }

  /**
   * الحصول على إحصائيات التحليل
   */
  getAnalysisStats() {
    return {
      queueLength: this.analysisQueue.length,
      isProcessing: this.isProcessing,
      learningPatternsCount: this.learningPatterns.size,
      successFactorsCount: this.successFactors.size,
      failureReasonsCount: this.failureReasons.size
    };
  }
}

module.exports = new ConversationAnalysisService();
