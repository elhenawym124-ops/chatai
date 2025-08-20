// ==================== محرك الذكاء الاصطناعي المتقدم ====================
const axios = require('axios');

class SmartAIEngine {
  constructor(database) {
    this.database = database;
    this.apiKey = null;
    this.isEnabled = false;
  }

  // تحديث الإعدادات
  updateSettings(settings) {
    this.apiKey = settings.apiKey;
    this.isEnabled = settings.isEnabled;
  }

  // تحليل الرسالة وتحديد النوع والسياق
  analyzeMessage(message, conversation) {
    const analysis = {
      type: 'general',
      language: this.detectLanguage(message),
      intent: this.detectIntent(message),
      keywords: this.extractKeywords(message),
      products: this.extractProductMentions(message),
      sentiment: this.analyzeSentiment(message)
    };

    console.log('📊 Message analysis:', analysis);
    return analysis;
  }

  // كشف اللغة
  detectLanguage(message) {
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(message) ? 'ar' : 'en';
  }

  // كشف نوع الاستفسار
  detectIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    // أنماط التحية
    const greetingPatterns = ['مرحبا', 'السلام', 'أهلا', 'hello', 'hi', 'hey'];
    if (greetingPatterns.some(pattern => lowerMessage.includes(pattern))) {
      return 'greeting';
    }

    // أنماط استفسار المنتجات
    const productPatterns = ['منتج', 'سعر', 'كم', 'product', 'price', 'cost', 'buy'];
    if (productPatterns.some(pattern => lowerMessage.includes(pattern))) {
      return 'product_inquiry';
    }

    // أنماط الدعم الفني
    const supportPatterns = ['مشكلة', 'عطل', 'لا يعمل', 'problem', 'issue', 'broken'];
    if (supportPatterns.some(pattern => lowerMessage.includes(pattern))) {
      return 'support';
    }

    // أنماط الشكر
    const thanksPatterns = ['شكرا', 'شكراً', 'تسلم', 'thanks', 'thank you'];
    if (thanksPatterns.some(pattern => lowerMessage.includes(pattern))) {
      return 'thanks';
    }

    return 'general';
  }

  // استخراج الكلمات المفتاحية
  extractKeywords(message) {
    const words = message.toLowerCase().split(/\s+/);
    const stopWords = ['في', 'من', 'إلى', 'على', 'عن', 'مع', 'the', 'a', 'an', 'and', 'or', 'but'];
    return words.filter(word => word.length > 2 && !stopWords.includes(word));
  }

  // استخراج ذكر المنتجات
  extractProductMentions(message) {
    const productKeywords = ['لابتوب', 'هاتف', 'جهاز', 'laptop', 'phone', 'device', 'computer'];
    const mentions = [];
    
    productKeywords.forEach(keyword => {
      if (message.toLowerCase().includes(keyword)) {
        mentions.push(keyword);
      }
    });
    
    return mentions;
  }

  // تحليل المشاعر البسيط
  analyzeSentiment(message) {
    const positiveWords = ['ممتاز', 'رائع', 'جيد', 'شكرا', 'great', 'excellent', 'good', 'thanks'];
    const negativeWords = ['سيء', 'مشكلة', 'عطل', 'bad', 'problem', 'issue', 'terrible'];
    
    const lowerMessage = message.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // بناء Prompt مخصص للشركة
  async buildCustomPrompt(companyId, messageAnalysis, context = {}) {
    const company = this.database.getCompany(companyId);
    if (!company) {
      return this.getDefaultPrompt(messageAnalysis.language);
    }

    let prompt = '';

    // إضافة شخصية الشركة
    prompt += `${company.personalityPrompt}\n\n`;

    // إضافة مهمة الشركة
    prompt += `${company.taskPrompt}\n\n`;

    // إضافة نماذج مخصصة حسب نوع الاستفسار
    const customPrompts = this.database.getCompanyPrompts(companyId, messageAnalysis.intent);
    if (customPrompts.length > 0) {
      prompt += `إرشادات خاصة: ${customPrompts[0].content}\n\n`;
    }

    // إضافة معلومات المنتجات ذات الصلة
    if (messageAnalysis.intent === 'product_inquiry' && messageAnalysis.products.length > 0) {
      const relevantProducts = await this.findRelevantProducts(companyId, messageAnalysis);
      if (relevantProducts.length > 0) {
        prompt += `المنتجات المتاحة:\n`;
        relevantProducts.forEach(product => {
          prompt += `- ${product.name}: ${product.price} ${product.currency} - ${product.description}\n`;
        });
        prompt += '\n';
      }
    }

    // إضافة تعليمات اللغة
    const languageInstruction = messageAnalysis.language === 'ar' 
      ? 'أجب باللغة العربية بطريقة مهذبة ومفيدة.'
      : 'Reply in English in a polite and helpful manner.';
    
    prompt += languageInstruction;

    console.log('🎯 Built custom prompt for company:', companyId);
    return prompt;
  }

  // البحث عن المنتجات ذات الصلة
  async findRelevantProducts(companyId, messageAnalysis) {
    const searchQuery = messageAnalysis.keywords.join(' ');
    const products = this.database.searchProducts(searchQuery, companyId, { limit: 3 });
    
    // إذا لم نجد منتجات بالكلمات المفتاحية، ابحث بذكر المنتجات
    if (products.length === 0 && messageAnalysis.products.length > 0) {
      const productQuery = messageAnalysis.products.join(' ');
      return this.database.searchProducts(productQuery, companyId, { limit: 3 });
    }
    
    return products;
  }

  // توليد رد ذكي متقدم
  async generateSmartResponse(message, conversation, companyId = '1') {
    try {
      if (!this.isEnabled || !this.apiKey) {
        return {
          success: false,
          error: 'AI Engine غير مفعل'
        };
      }

      // تحليل الرسالة
      const messageAnalysis = this.analyzeMessage(message, conversation);

      // بناء prompt مخصص
      const customPrompt = await this.buildCustomPrompt(companyId, messageAnalysis, { conversation });

      // استدعاء Gemini API
      const response = await this.callGeminiAPI(message, customPrompt);

      // إضافة معلومات المنتجات للرد إذا كان مناسباً
      if (messageAnalysis.intent === 'product_inquiry') {
        const relevantProducts = await this.findRelevantProducts(companyId, messageAnalysis);
        response.products = relevantProducts;
      }

      response.analysis = messageAnalysis;
      return response;

    } catch (error) {
      console.error('❌ Error in smart response generation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // استدعاء Gemini API
  async callGeminiAPI(message, customPrompt) {
    const fullPrompt = `${customPrompt}\n\nرسالة العميل: ${message}\n\nردك:`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
      {
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return {
        success: true,
        text: response.data.candidates[0].content.parts[0].text.trim(),
        confidence: 0.9
      };
    }

    throw new Error('Invalid response from Gemini API');
  }

  // Prompt افتراضي
  getDefaultPrompt(language = 'ar') {
    return language === 'ar' 
      ? 'أنت مساعد ذكي ومفيد. أجب بطريقة مهذبة ومختصرة.'
      : 'You are a smart and helpful assistant. Reply politely and concisely.';
  }

  // الحصول على رد سريع محسن
  getEnhancedQuickReply(message, companyId = '1') {
    const company = this.database.getCompany(companyId);
    const lowerMessage = message.toLowerCase().trim();
    
    // ردود سريعة مخصصة للشركة
    const quickReplies = {
      // التحيات العربية
      'مرحبا': company?.personalityPrompt ? 
        `مرحباً بك في ${company.name}! كيف يمكنني مساعدتك اليوم؟` :
        'مرحباً بك! كيف يمكنني مساعدتك اليوم؟',
      'مرحباً': company?.personalityPrompt ? 
        `مرحباً بك في ${company.name}! كيف يمكنني مساعدتك اليوم؟` :
        'مرحباً بك! كيف يمكنني مساعدتك اليوم؟',
      'السلام عليكم': 'وعليكم السلام ورحمة الله وبركاته! أهلاً وسهلاً بك.',
      
      // التحيات الإنجليزية
      'hello': company?.name ? 
        `Hello! Welcome to ${company.name}. How can I help you today?` :
        'Hello! How can I help you today?',
      'hi': 'Hi there! How can I assist you?',
      
      // الشكر
      'شكرا': 'العفو! هل تحتاج أي مساعدة أخرى؟',
      'شكراً': 'العفو! هل تحتاج أي مساعدة أخرى؟',
      'thanks': 'You\'re welcome! Is there anything else I can help you with?',
      'thank you': 'You\'re welcome! Is there anything else I can help you with?'
    };

    return quickReplies[lowerMessage] || null;
  }
}

module.exports = SmartAIEngine;
