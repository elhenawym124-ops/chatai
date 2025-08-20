// Simple in-memory database for conversations and messages
// مع نظام حفظ في ملفات JSON للاحتفاظ بالبيانات

const fs = require('fs');
const path = require('path');

class Database {
  constructor() {
    this.conversations = new Map();
    this.messages = new Map();
    this.users = new Map();

    // الجداول الجديدة للنظام المتقدم
    this.companies = new Map();
    this.products = new Map();
    this.customPrompts = new Map();
    this.categories = new Map();

    // مجلد حفظ البيانات
    this.dataDir = path.join(__dirname, 'data');
    this.ensureDataDirectory();

    // تحميل البيانات المحفوظة أو تهيئة البيانات الافتراضية
    this.loadData();
  }

  // التأكد من وجود مجلد البيانات
  ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  // تحميل البيانات من الملفات
  loadData() {
    try {
      // تحميل المحادثات
      const conversationsFile = path.join(this.dataDir, 'conversations.json');
      if (fs.existsSync(conversationsFile)) {
        const conversationsData = JSON.parse(fs.readFileSync(conversationsFile, 'utf8'));
        this.conversations = new Map(conversationsData);
        console.log(`📂 تم تحميل ${this.conversations.size} محادثة من الملف`);
      }

      // تحميل الرسائل
      const messagesFile = path.join(this.dataDir, 'messages.json');
      if (fs.existsSync(messagesFile)) {
        const messagesData = JSON.parse(fs.readFileSync(messagesFile, 'utf8'));
        this.messages = new Map(messagesData);
        console.log(`📂 تم تحميل ${this.messages.size} رسالة من الملف`);
      }

      // تحميل الشركات
      const companiesFile = path.join(this.dataDir, 'companies.json');
      if (fs.existsSync(companiesFile)) {
        const companiesData = JSON.parse(fs.readFileSync(companiesFile, 'utf8'));
        this.companies = new Map(companiesData);
        console.log(`📂 تم تحميل ${this.companies.size} شركة من الملف`);
      }

      // تحميل المنتجات
      const productsFile = path.join(this.dataDir, 'products.json');
      if (fs.existsSync(productsFile)) {
        const productsData = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
        this.products = new Map(productsData);
        console.log(`📂 تم تحميل ${this.products.size} منتج من الملف`);
      }

      // تحميل البرومبت المخصصة
      const promptsFile = path.join(this.dataDir, 'prompts.json');
      if (fs.existsSync(promptsFile)) {
        const promptsData = JSON.parse(fs.readFileSync(promptsFile, 'utf8'));
        this.customPrompts = new Map(promptsData);
        console.log(`📂 تم تحميل ${this.customPrompts.size} برومبت من الملف`);
      }

      // إذا لم توجد بيانات محفوظة، تهيئة البيانات الافتراضية
      if (this.companies.size === 0) {
        console.log('🔄 لا توجد بيانات محفوظة، تهيئة البيانات الافتراضية...');
        this.initializeDefaultData();
      }
    } catch (error) {
      console.error('❌ خطأ في تحميل البيانات:', error);
      console.log('🔄 تهيئة البيانات الافتراضية...');
      this.initializeDefaultData();
    }
  }

  // حفظ البيانات في الملفات
  saveData() {
    try {
      // حفظ المحادثات
      const conversationsFile = path.join(this.dataDir, 'conversations.json');
      fs.writeFileSync(conversationsFile, JSON.stringify([...this.conversations]), 'utf8');

      // حفظ الرسائل
      const messagesFile = path.join(this.dataDir, 'messages.json');
      fs.writeFileSync(messagesFile, JSON.stringify([...this.messages]), 'utf8');

      // حفظ الشركات
      const companiesFile = path.join(this.dataDir, 'companies.json');
      fs.writeFileSync(companiesFile, JSON.stringify([...this.companies]), 'utf8');

      // حفظ المنتجات
      const productsFile = path.join(this.dataDir, 'products.json');
      fs.writeFileSync(productsFile, JSON.stringify([...this.products]), 'utf8');

      // حفظ البرومبت المخصصة
      const promptsFile = path.join(this.dataDir, 'prompts.json');
      fs.writeFileSync(promptsFile, JSON.stringify([...this.customPrompts]), 'utf8');

      console.log('💾 تم حفظ جميع البيانات بنجاح');
    } catch (error) {
      console.error('❌ خطأ في حفظ البيانات:', error);
    }
  }

  // حفظ تلقائي كل 30 ثانية
  startAutoSave() {
    setInterval(() => {
      this.saveData();
    }, 30000); // كل 30 ثانية

    // حفظ عند إغلاق التطبيق
    process.on('SIGINT', () => {
      console.log('\n🔄 حفظ البيانات قبل الإغلاق...');
      this.saveData();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🔄 حفظ البيانات قبل الإغلاق...');
      this.saveData();
      process.exit(0);
    });
  }

  // إنشاء أو الحصول على محادثة
  getOrCreateConversation(senderId, pageId, senderName = null) {
    const conversationId = `${pageId}_${senderId}`;
    
    if (!this.conversations.has(conversationId)) {
      const conversation = {
        id: conversationId,
        senderId,
        pageId,
        senderName: senderName || `User ${senderId.slice(-4)}`,
        platform: 'facebook',
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
        isActive: true,
        lastMessage: null
      };
      
      this.conversations.set(conversationId, conversation);
      console.log('Created new conversation:', conversation);
    }
    
    return this.conversations.get(conversationId);
  }

  // إضافة رسالة جديدة
  addMessage(conversationId, messageData) {
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      senderId: messageData.senderId,
      senderName: messageData.senderName || 'Unknown',
      content: messageData.content,
      type: messageData.type || 'text',
      isFromCustomer: messageData.isFromCustomer,
      timestamp: new Date().toISOString(),
      status: 'delivered',
      facebookMessageId: messageData.facebookMessageId || null
    };

    this.messages.set(message.id, message);

    // تحديث المحادثة
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.lastMessage = message.content;
      conversation.lastMessageAt = message.timestamp;
      
      if (message.isFromCustomer) {
        conversation.unreadCount += 1;
      }
    }

    console.log('Added new message:', message);
    return message;
  }

  // الحصول على جميع المحادثات
  getAllConversations() {
    return Array.from(this.conversations.values())
      .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
  }

  // الحصول على رسائل محادثة معينة
  getConversationMessages(conversationId, limit = 50) {
    return Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-limit);
  }

  // تحديث عداد الرسائل غير المقروءة
  markConversationAsRead(conversationId) {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.unreadCount = 0;
      return true;
    }
    return false;
  }

  // البحث في المحادثات
  searchConversations(query) {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.conversations.values())
      .filter(conv => 
        conv.senderName.toLowerCase().includes(lowerQuery) ||
        (conv.lastMessage && conv.lastMessage.toLowerCase().includes(lowerQuery))
      );
  }

  // إحصائيات
  getStats() {
    const totalConversations = this.conversations.size;
    const totalMessages = this.messages.size;
    const unreadConversations = Array.from(this.conversations.values())
      .filter(conv => conv.unreadCount > 0).length;

    return {
      totalConversations,
      totalMessages,
      unreadConversations
    };
  }

  // ==================== إدارة الشركات ====================

  // إضافة شركة جديدة
  addCompany(companyData) {
    const company = {
      id: companyData.id || `company_${Date.now()}`,
      name: companyData.name,
      businessType: companyData.businessType,
      personalityPrompt: companyData.personalityPrompt || 'أنا مساعد ذكي ودود.',
      taskPrompt: companyData.taskPrompt || 'مهمتي مساعدة العملاء وتقديم أفضل خدمة.',
      defaultLanguage: companyData.defaultLanguage || 'ar',
      brandVoice: companyData.brandVoice || 'friendly',
      settings: companyData.settings || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.companies.set(company.id, company);
    console.log('Added new company:', company);
    return company;
  }

  // الحصول على شركة
  getCompany(companyId) {
    return this.companies.get(companyId);
  }

  // تحديث شركة
  updateCompany(companyId, updates) {
    const company = this.companies.get(companyId);
    if (company) {
      Object.assign(company, updates, { updatedAt: new Date().toISOString() });
      this.companies.set(companyId, company);
      return company;
    }
    return null;
  }

  // الحصول على جميع الشركات
  getAllCompanies() {
    return Array.from(this.companies.values());
  }

  // ==================== إدارة المنتجات ====================

  // إضافة منتج جديد
  addProduct(productData) {
    const product = {
      id: productData.id || `product_${Date.now()}`,
      companyId: productData.companyId,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      currency: productData.currency || 'EGP',
      images: productData.images || [],
      specifications: productData.specifications || {},
      category: productData.category,
      tags: productData.tags || [],
      availability: productData.availability !== false,
      stock: productData.stock || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.products.set(product.id, product);
    console.log('Added new product:', product);
    return product;
  }

  // البحث في المنتجات
  searchProducts(query, companyId, options = {}) {
    const lowerQuery = query.toLowerCase();
    const products = Array.from(this.products.values())
      .filter(product => {
        // فلترة حسب الشركة
        if (companyId && product.companyId !== companyId) return false;

        // البحث في الاسم والوصف والتاجز
        const matchesName = product.name.toLowerCase().includes(lowerQuery);
        const matchesDescription = product.description.toLowerCase().includes(lowerQuery);
        const matchesTags = product.tags.some(tag => tag.toLowerCase().includes(lowerQuery));

        return matchesName || matchesDescription || matchesTags;
      });

    // ترتيب النتائج حسب الصلة
    return products.slice(0, options.limit || 10);
  }

  // الحصول على منتجات شركة
  getCompanyProducts(companyId, options = {}) {
    const products = Array.from(this.products.values())
      .filter(product => product.companyId === companyId);

    if (options.category) {
      return products.filter(product => product.category === options.category);
    }

    return products.slice(0, options.limit || 50);
  }

  // ==================== إدارة النماذج المخصصة ====================

  // إضافة نموذج مخصص
  addCustomPrompt(promptData) {
    const prompt = {
      id: promptData.id || `prompt_${Date.now()}`,
      companyId: promptData.companyId,
      type: promptData.type, // 'personality', 'task', 'product', 'greeting', 'support'
      name: promptData.name,
      content: promptData.content,
      variables: promptData.variables || [],
      conditions: promptData.conditions || {},
      priority: promptData.priority || 1,
      isActive: promptData.isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.customPrompts.set(prompt.id, prompt);
    console.log('Added new custom prompt:', prompt);
    return prompt;
  }

  // الحصول على نماذج شركة
  getCompanyPrompts(companyId, type = null) {
    const prompts = Array.from(this.customPrompts.values())
      .filter(prompt => prompt.companyId === companyId && prompt.isActive);

    if (type) {
      return prompts.filter(prompt => prompt.type === type);
    }

    return prompts.sort((a, b) => b.priority - a.priority);
  }

  // تهيئة البيانات الافتراضية
  initializeDefaultData() {
    // إضافة شركة افتراضية
    const defaultCompany = {
      id: '1',
      name: 'متجر الإلكترونيات المتقدم',
      businessType: 'ecommerce',
      personalityPrompt: 'أنا مساعد ذكي ودود لمتجر الإلكترونيات المتقدم. أتحدث بطريقة مهنية ومفيدة وأحرص على تقديم أفضل خدمة للعملاء.',
      taskPrompt: 'مهمتي مساعدة العملاء في العثور على المنتجات المناسبة، تقديم المعلومات التقنية، والإجابة على استفساراتهم حول الأسعار والمواصفات.',
      defaultLanguage: 'ar',
      brandVoice: 'professional'
    };
    this.addCompany(defaultCompany);

    // إضافة منتجات تجريبية
    const sampleProducts = [
      {
        companyId: '1',
        name: 'لابتوب Dell Inspiron 15',
        description: 'لابتوب عالي الأداء مع معالج Intel Core i7 وذاكرة 16GB RAM',
        price: 25000,
        category: 'laptops',
        tags: ['dell', 'laptop', 'gaming', 'work'],
        specifications: {
          processor: 'Intel Core i7-12700H',
          ram: '16GB DDR4',
          storage: '512GB SSD',
          display: '15.6 inch Full HD',
          graphics: 'NVIDIA GTX 1650'
        },
        images: ['https://example.com/dell-laptop.jpg']
      },
      {
        companyId: '1',
        name: 'هاتف Samsung Galaxy S23',
        description: 'هاتف ذكي متطور مع كاميرا عالية الجودة وأداء ممتاز',
        price: 18000,
        category: 'phones',
        tags: ['samsung', 'smartphone', 'android', 'camera'],
        specifications: {
          display: '6.1 inch Dynamic AMOLED',
          camera: '50MP Triple Camera',
          battery: '3900mAh',
          storage: '256GB',
          ram: '8GB'
        },
        images: ['https://example.com/samsung-s23.jpg']
      }
    ];

    sampleProducts.forEach(product => this.addProduct(product));

    // إضافة نماذج مخصصة
    const samplePrompts = [
      {
        companyId: '1',
        type: 'greeting',
        name: 'ترحيب المتجر',
        content: 'مرحباً بك في متجر الإلكترونيات المتقدم! كيف يمكنني مساعدتك اليوم؟ نحن متخصصون في أحدث الأجهزة الإلكترونية.',
        priority: 5
      },
      {
        companyId: '1',
        type: 'product',
        name: 'استفسار المنتجات',
        content: 'لدينا مجموعة واسعة من {product_category}. هل تبحث عن مواصفات معينة أم لديك ميزانية محددة؟',
        variables: ['product_category'],
        priority: 4
      }
    ];

    samplePrompts.forEach(prompt => this.addCustomPrompt(prompt));
  }
}

// إنشاء instance واحد للاستخدام في التطبيق
const database = new Database();

// بدء الحفظ التلقائي
database.startAutoSave();

module.exports = database;
