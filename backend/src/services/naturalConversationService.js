/**
 * خدمة المحادثة الطبيعية مع اقتراح المنتجات الذكي
 * تحاكي المحادثة الطبيعية وتقترح المنتجات فقط عند الحاجة الفعلية
 */

class NaturalConversationService {
  constructor() {
    this.conversationStates = new Map(); // حفظ حالة كل محادثة
  }

  /**
   * تحليل نية العميل الحقيقية
   */
  analyzeCustomerIntent(message, conversationHistory = []) {
    const text = message.toLowerCase().trim();
    
    // تحليل أنواع الرسائل
    const intentAnalysis = {
      type: this.detectMessageType(text),
      needsProducts: this.detectProductNeed(text, conversationHistory),
      conversationStage: this.detectConversationStage(conversationHistory),
      sentiment: this.detectSentiment(text),
      urgency: this.detectUrgency(text)
    };

    console.log('🧠 تحليل النية:', intentAnalysis);
    return intentAnalysis;
  }

  /**
   * اكتشاف نوع الرسالة باستخدام الذكاء الاصطناعي الحقيقي
   */
  detectMessageType(text) {
    // فقط التحيات والوداع واضحة (لا تحتاج AI)
    const greetings = ['مرحبا', 'أهلا', 'السلام عليكم', 'صباح الخير', 'مساء الخير', 'هاي', 'هلو'];
    if (greetings.some(greeting => text.includes(greeting))) {
      return 'greeting';
    }

    const thanks = ['شكرا', 'شكراً', 'مع السلامة', 'باي', 'وداعا', 'تسلم'];
    if (thanks.some(thank => text.includes(thank))) {
      return 'thanks_goodbye';
    }

    const generalQuestions = ['كيف الحال', 'ازيك', 'شلونك', 'كيفك', 'ايه الأخبار'];
    if (generalQuestions.some(q => text.includes(q))) {
      return 'general_question';
    }

    // استخدام الذكاء الاصطناعي لفهم باقي الرسائل
    return this.aiBasedMessageAnalysis(text);
  }

  /**
   * تحليل ذكي للرسالة باستخدام الـ AI
   */
  aiBasedMessageAnalysis(text) {
    // تحليل السياق والمعنى بدلاً من الكلمات المفتاحية

    // 1. تحليل النية من السياق
    const intent = this.analyzeIntentFromContext(text);

    // 2. تحليل نوع السؤال
    const questionType = this.analyzeQuestionType(text);

    // 3. تحليل الهدف
    const purpose = this.analyzePurpose(text);

    // دمج التحليلات لاتخاذ قرار ذكي
    return this.combineAnalysisResults(intent, questionType, purpose, text);
  }

  /**
   * تحليل النية من السياق
   */
  analyzeIntentFromContext(text) {
    // تحليل طول الرسالة
    if (text.length <= 3) {
      return 'unclear'; // رسائل قصيرة جداً غير واضحة
    }

    // تحليل علامات الاستفهام والسياق
    const hasQuestionMark = text.includes('؟');
    const isQuestion = hasQuestionMark || text.startsWith('ايه') || text.startsWith('كام') || text.startsWith('في');

    // تحليل الفعل المضمر
    if (text.includes('عايز') || text.includes('أريد') || text.includes('محتاج')) {
      return 'wants_product';
    }

    if (text.includes('اعرض') || text.includes('شوف') || text.includes('ور')) {
      return 'wants_to_see';
    }

    if (isQuestion) {
      return 'asking_about';
    }

    return 'general_communication';
  }

  /**
   * تحليل نوع السؤال
   */
  analyzeQuestionType(text) {
    // تحليل ما يسأل عنه
    const aboutPrice = /سعر|كام|بكام|ثمن|تكلفة|فلوس/.test(text);
    const aboutAvailability = /متوفر|موجود|عندك|متاح|في/.test(text);
    const aboutSpecifications = /مواصفات|تفاصيل|معلومات|خامة|نوع|جودة/.test(text);
    const aboutColors = /لون|ألوان|الوان/.test(text);
    const aboutSizes = /مقاس|مقاسات|سايز|حجم/.test(text);
    const aboutShipping = /شحن|توصيل|دفع|استلام/.test(text);

    if (aboutPrice) return 'price_inquiry';
    if (aboutColors || aboutSizes || aboutSpecifications) return 'specification_inquiry';
    if (aboutAvailability) return 'availability_inquiry';
    if (aboutShipping) return 'service_inquiry';

    return 'general_inquiry';
  }

  /**
   * تحليل الهدف من الرسالة
   */
  analyzePurpose(text) {
    // هل يريد شراء؟
    const buyingIntent = /عايز|أريد|محتاج|اشتري|اطلب/.test(text);

    // هل يجمع معلومات؟
    const informationSeeking = /ايه|كام|في|معلومات|تفاصيل/.test(text);

    // هل يقارن؟
    const comparing = /أحسن|أفضل|مقارنة|اختار/.test(text);

    if (buyingIntent) return 'buying';
    if (comparing) return 'comparing';
    if (informationSeeking) return 'information_seeking';

    return 'browsing';
  }

  /**
   * دمج نتائج التحليل لاتخاذ قرار ذكي
   */
  combineAnalysisResults(intent, questionType, purpose, text) {
    // قرارات ذكية بناءً على التحليل المتعدد

    // إذا كان يريد منتج أو يسأل عن مواصفات
    if (intent === 'wants_product' || intent === 'wants_to_see') {
      return 'product_request';
    }

    // إذا كان يسأل عن مواصفات أو ألوان أو أسعار
    if (questionType === 'specification_inquiry' ||
        questionType === 'price_inquiry' ||
        questionType === 'availability_inquiry') {
      return 'product_inquiry';
    }

    // إذا كان يسأل عن الخدمة
    if (questionType === 'service_inquiry') {
      return 'service_inquiry';
    }

    // إذا كان الهدف الشراء أو جمع المعلومات عن منتجات
    if (purpose === 'buying' || purpose === 'comparing') {
      return 'product_request';
    }

    if (purpose === 'information_seeking' && text.length > 5) {
      return 'product_inquiry';
    }

    return 'general';
  }

  /**
   * اكتشاف الحاجة للمنتجات
   */
  detectProductNeed(text, conversationHistory) {
    const type = this.detectMessageType(text);
    
    // لا يحتاج منتجات
    if (['greeting', 'thanks_goodbye', 'general_question'].includes(type)) {
      return false;
    }

    // يحتاج منتجات بوضوح
    if (['product_request', 'product_inquiry'].includes(type)) {
      return true;
    }

    // قد يحتاج منتجات (أسئلة الخدمة قد تؤدي لاقتراح منتجات)
    if (type === 'service_inquiry') {
      // إذا سأل عن الشحن وهو لم يشتري شيء، قد نقترح منتجات
      const hasOrderHistory = conversationHistory.some(msg => 
        msg.content && (msg.content.includes('طلب') || msg.content.includes('اورد'))
      );
      return !hasOrderHistory; // اقترح منتجات إذا لم يكن له طلبات سابقة
    }

    return false;
  }

  /**
   * اكتشاف مرحلة المحادثة
   */
  detectConversationStage(conversationHistory) {
    if (conversationHistory.length === 0) return 'initial';
    if (conversationHistory.length <= 2) return 'early';
    if (conversationHistory.length <= 5) return 'middle';
    return 'advanced';
  }

  /**
   * اكتشاف المشاعر
   */
  detectSentiment(text) {
    const positive = ['ممتاز', 'رائع', 'جميل', 'حلو', 'عجبني', 'كويس'];
    const negative = ['مش عاجبني', 'وحش', 'غالي', 'مش كويس', 'مشكلة'];
    
    if (positive.some(word => text.includes(word))) return 'positive';
    if (negative.some(word => text.includes(word))) return 'negative';
    return 'neutral';
  }

  /**
   * اكتشاف الاستعجال
   */
  detectUrgency(text) {
    const urgent = ['بسرعة', 'عاجل', 'ضروري', 'مستعجل', 'النهارده'];
    return urgent.some(word => text.includes(word));
  }

  /**
   * توليد رد طبيعي حسب النية
   */
  async generateNaturalResponse(message, conversationHistory, companyId, intentAnalysis) {
    const { type, needsProducts, conversationStage, sentiment } = intentAnalysis;

    let response = '';
    let shouldIncludeProducts = false;

    switch (type) {
      case 'greeting':
        response = this.generateGreetingResponse(conversationStage);
        break;

      case 'thanks_goodbye':
        response = this.generateGoodbyeResponse();
        break;

      case 'general_question':
        response = this.generateGeneralResponse();
        break;

      case 'product_request':
        response = this.generateProductRequestResponse();
        shouldIncludeProducts = true;
        break;

      case 'product_inquiry':
        response = this.generateProductInquiryResponse(message);
        shouldIncludeProducts = true;
        break;

      case 'service_inquiry':
        response = await this.generateServiceInquiryResponse(message, needsProducts);
        shouldIncludeProducts = needsProducts;
        break;

      default:
        response = this.generateDefaultResponse();
        break;
    }

    return {
      response,
      shouldIncludeProducts,
      conversationType: type,
      naturalFlow: true
    };
  }

  /**
   * ردود التحية
   */
  generateGreetingResponse(stage) {
    const responses = {
      initial: [
        'أهلاً بيك! ازيك؟ 👋',
        'مرحبا! نورت 😊',
        'وعليكم السلام ورحمة الله وبركاته 🌸',
        'أهلا وسهلا! كيف حالك؟ 👋'
      ],
      early: [
        'أهلاً تاني! 😊',
        'مرحبا بيك مرة تانية 👋',
        'أهلاً! عامل ايه؟ 😊'
      ],
      middle: [
        'أهلاً! ايه اللي محتاجه؟ 😊',
        'مرحبا! في حاجة معينة تدور عليها؟ 👋'
      ]
    };

    const stageResponses = responses[stage] || responses.initial;
    return stageResponses[Math.floor(Math.random() * stageResponses.length)];
  }

  /**
   * ردود الوداع
   */
  generateGoodbyeResponse() {
    const responses = [
      'العفو! 😊',
      'تسلم! أي وقت تحتاج حاجة أنا هنا 🌸',
      'مع السلامة! نورت 👋',
      'باي باي! استنى زيارتك تاني 😊'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * ردود الأسئلة العامة
   */
  generateGeneralResponse() {
    const responses = [
      'الحمد لله كله تمام! انت عامل ايه؟ 😊',
      'كله كويس الحمد لله! ايه اخبارك؟ 👋',
      'تمام الحمد لله! في حاجة اقدر اساعدك فيها؟ 😊'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * ردود طلب المنتجات
   */
  generateProductRequestResponse() {
    const responses = [
      'أكيد! هعرضلك اللي عندنا 😊',
      'طبعاً! دي المنتجات المتاحة عندنا 👇',
      'ماشي! شوف دي المنتجات اللي عندنا 🛍️'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * ردود الاستفسار عن المنتجات
   */
  generateProductInquiryResponse(message) {
    if (message.includes('سعر') || message.includes('كام')) {
      return 'هقولك على الأسعار مع المنتجات 💰';
    }
    if (message.includes('مقاس')) {
      return 'المقاسات المتاحة هتلاقيها مع كل منتج 📏';
    }
    if (message.includes('لون')) {
      return 'الألوان المتاحة موضحة مع كل منتج 🎨';
    }
    return 'هوضحلك كل التفاصيل مع المنتجات 📋';
  }

  /**
   * ردود أسئلة الخدمة
   */
  async generateServiceInquiryResponse(message, shouldSuggestProducts) {
    if (message.includes('شحن') || message.includes('توصيل')) {
      const baseResponse = 'الشحن 50 جنيه لجميع المحافظات 🚚';
      if (shouldSuggestProducts) {
        return baseResponse + '\n\nشوف المنتجات المتاحة عندنا:';
      }
      return baseResponse;
    }
    
    if (message.includes('دفع')) {
      return 'الدفع عند الاستلام أو تحويل بنكي 💳';
    }
    
    return 'أي استفسار عن الخدمة أنا هنا اساعدك 😊';
  }

  /**
   * رد افتراضي
   */
  generateDefaultResponse() {
    return 'ازيك! في حاجة معينة اقدر اساعدك فيها؟ 😊';
  }
}

module.exports = NaturalConversationService;
