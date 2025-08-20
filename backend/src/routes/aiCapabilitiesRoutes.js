const express = require('express');
const router = express.Router();

// Mock data for capabilities
let capabilitiesSettings = {
  'product-recommendations': true,
  'smart-responses': true,
  'image-analysis': false,
  'sentiment-analysis': true,
  'intent-recognition': true,
  'auto-replies': false,
  'product-search': true,
  'conversation-memory': true
};

// Get all capabilities settings
router.get('/capabilities', async (req, res) => {
  try {
    console.log('📋 [AI-CAPABILITIES] Getting capabilities settings');
    
    res.json({
      success: true,
      data: capabilitiesSettings,
      message: 'تم جلب إعدادات القدرات بنجاح'
    });
  } catch (error) {
    console.error('❌ [AI-CAPABILITIES] Error getting capabilities:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في جلب إعدادات القدرات'
    });
  }
});

// Update capabilities settings
router.put('/capabilities', async (req, res) => {
  try {
    console.log('🔄 [AI-CAPABILITIES] Updating capabilities:', req.body);
    
    // Update capabilities settings
    Object.keys(req.body).forEach(key => {
      if (capabilitiesSettings.hasOwnProperty(key)) {
        capabilitiesSettings[key] = req.body[key];
        console.log(`✅ [AI-CAPABILITIES] ${key}: ${req.body[key] ? 'مفعل' : 'معطل'}`);
      }
    });
    
    res.json({
      success: true,
      data: capabilitiesSettings,
      message: 'تم تحديث إعدادات القدرات بنجاح'
    });
  } catch (error) {
    console.error('❌ [AI-CAPABILITIES] Error updating capabilities:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في تحديث إعدادات القدرات'
    });
  }
});

// Test a specific capability
router.post('/test/:capabilityId', async (req, res) => {
  try {
    const { capabilityId } = req.params;
    const testData = req.body;
    
    console.log(`🧪 [AI-CAPABILITIES] Testing capability: ${capabilityId}`);
    console.log(`📋 [AI-CAPABILITIES] Test data:`, testData);
    
    // Check if capability is enabled
    if (!capabilitiesSettings[capabilityId]) {
      return res.status(400).json({
        success: false,
        error: `القدرة ${capabilityId} غير مفعلة`
      });
    }
    
    // Simulate different test scenarios
    let testResult = {
      success: true,
      responseTime: Math.floor(Math.random() * 3000) + 500, // 500-3500ms
      accuracy: Math.floor(Math.random() * 30) + 70, // 70-100%
      data: null
    };
    
    switch (capabilityId) {
      case 'product-recommendations':
        testResult.data = {
          recommendations: [
            {
              productName: 'كوتشي حريمي أبيض',
              reason: 'يناسب طلب العميل للون الأبيض والراحة',
              confidence: 0.95,
              price: 300
            },
            {
              productName: 'كوتشي رياضي نسائي',
              reason: 'بديل رياضي مريح للاستخدام اليومي',
              confidence: 0.85,
              price: 299.99
            }
          ]
        };
        break;
        
      case 'smart-responses':
        testResult.data = {
          response: 'مرحباً! أهلاً وسهلاً بك. كيف يمكنني مساعدتك اليوم؟ 😊'
        };
        break;
        
      case 'image-analysis':
        // Simulate failure for image analysis (no real API key)
        testResult.success = false;
        testResult.data = {
          error: 'API Key غير صحيح لتحليل الصور'
        };
        break;
        
      case 'sentiment-analysis':
        testResult.data = {
          sentiment: 'positive',
          confidence: 0.92,
          emotions: ['joy', 'satisfaction']
        };
        break;
        
      case 'intent-recognition':
        testResult.data = {
          intent: 'purchase',
          confidence: 0.88,
          entities: ['product', 'shoes']
        };
        break;
        
      case 'auto-replies':
        testResult.data = {
          reply: 'شكراً لتواصلك معنا! سنرد عليك في أقرب وقت ممكن.',
          triggered: true
        };
        break;
        
      case 'product-search':
        testResult.data = {
          results: [
            { id: 1, name: 'كوتشي حريمي', relevance: 0.95 },
            { id: 2, name: 'حذاء رياضي', relevance: 0.87 }
          ]
        };
        break;
        
      case 'conversation-memory':
        testResult.data = {
          context: 'العميل سأل عن كوتشي أبيض في الرسالة السابقة',
          remembered: true
        };
        break;
        
      default:
        testResult.success = false;
        testResult.data = { error: 'اختبار غير مدعوم لهذه القدرة' };
    }
    
    console.log(`${testResult.success ? '✅' : '❌'} [AI-CAPABILITIES] Test result for ${capabilityId}:`, testResult);
    
    res.json({
      success: testResult.success,
      data: testResult.data,
      performance: {
        responseTime: testResult.responseTime,
        accuracy: testResult.accuracy
      },
      message: testResult.success ? 'نجح الاختبار' : 'فشل الاختبار'
    });
    
  } catch (error) {
    console.error('❌ [AI-CAPABILITIES] Error testing capability:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في اختبار القدرة'
    });
  }
});

// Get capability performance stats
router.get('/performance', async (req, res) => {
  try {
    console.log('📊 [AI-CAPABILITIES] Getting performance stats');
    
    // Mock performance data
    const performanceStats = {
      totalCapabilities: Object.keys(capabilitiesSettings).length,
      activeCapabilities: Object.values(capabilitiesSettings).filter(Boolean).length,
      averageResponseTime: 1850,
      averageAccuracy: 87,
      totalTests: 156,
      successfulTests: 142,
      failedTests: 14,
      uptime: '99.2%',
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: performanceStats,
      message: 'تم جلب إحصائيات الأداء بنجاح'
    });
  } catch (error) {
    console.error('❌ [AI-CAPABILITIES] Error getting performance:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في جلب إحصائيات الأداء'
    });
  }
});

// Get capability usage analytics
router.get('/analytics', async (req, res) => {
  try {
    console.log('📈 [AI-CAPABILITIES] Getting usage analytics');
    
    // Mock analytics data
    const analytics = {
      dailyUsage: [
        { date: '2024-01-01', requests: 45 },
        { date: '2024-01-02', requests: 67 },
        { date: '2024-01-03', requests: 52 },
        { date: '2024-01-04', requests: 78 },
        { date: '2024-01-05', requests: 89 },
        { date: '2024-01-06', requests: 94 },
        { date: '2024-01-07', requests: 103 }
      ],
      capabilityUsage: {
        'product-recommendations': 45,
        'smart-responses': 78,
        'sentiment-analysis': 32,
        'intent-recognition': 56,
        'product-search': 89,
        'conversation-memory': 67
      },
      topErrors: [
        { capability: 'image-analysis', count: 12, error: 'API Key invalid' },
        { capability: 'auto-replies', count: 3, error: 'Template not found' }
      ]
    };
    
    res.json({
      success: true,
      data: analytics,
      message: 'تم جلب تحليلات الاستخدام بنجاح'
    });
  } catch (error) {
    console.error('❌ [AI-CAPABILITIES] Error getting analytics:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في جلب تحليلات الاستخدام'
    });
  }
});

// Test endpoint to debug routing
router.post('/test-chat', async (req, res) => {
  console.log('🎯 [AI-CAPABILITIES] TEST CHAT endpoint hit!');
  res.json({
    success: true,
    message: 'Test endpoint working!',
    data: { test: true }
  });
});

// Interactive chat endpoint
router.post('/chat', async (req, res) => {
  try {
    console.log('🔍 [AI-CAPABILITIES] Chat endpoint hit!');
    console.log('📋 [AI-CAPABILITIES] Request body:', req.body);
    console.log('🌐 [AI-CAPABILITIES] Request URL:', req.originalUrl);
    console.log('🔧 [AI-CAPABILITIES] Request method:', req.method);

    const { message, capability } = req.body;

    console.log(`💬 [AI-CAPABILITIES] Interactive chat request: ${message}`);
    console.log(`🎯 [AI-CAPABILITIES] Using capability: ${capability}`);

    // Check if capability is enabled
    if (!capabilitiesSettings[capability]) {
      return res.status(400).json({
        success: false,
        error: `القدرة ${capability} غير مفعلة`
      });
    }

    // Simulate processing time
    const processingTime = Math.floor(Math.random() * 2000) + 500; // 500-2500ms
    await new Promise(resolve => setTimeout(resolve, processingTime));

    let response = {
      success: true,
      data: null,
      capability,
      responseTime: processingTime
    };

    // Generate contextual responses based on capability and message
    switch (capability) {
      case 'product-recommendations':
        response.data = generateProductRecommendations(message);
        break;

      case 'smart-responses':
        response.data = generateSmartResponse(message);
        break;

      case 'sentiment-analysis':
        response.data = analyzeSentiment(message);
        break;

      case 'intent-recognition':
        response.data = recognizeIntent(message);
        break;

      case 'product-search':
        response.data = searchProducts(message);
        break;

      case 'conversation-memory':
        response.data = {
          response: 'أتذكر محادثتنا السابقة. كيف يمكنني مساعدتك اليوم؟',
          context: 'تم حفظ سياق المحادثة'
        };
        break;

      default:
        response.data = {
          response: 'تم معالجة رسالتك بنجاح'
        };
    }

    console.log(`✅ [AI-CAPABILITIES] Chat response generated for ${capability}`);
    res.json(response);

  } catch (error) {
    console.error('❌ [AI-CAPABILITIES] Error in chat:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في معالجة الرسالة'
    });
  }
});

// Helper functions for generating responses
function generateProductRecommendations(message) {
  const products = [
    { name: 'كوتشي حريمي أبيض', price: 299, reason: 'يناسب طلبك للون الأبيض', confidence: 0.95 },
    { name: 'حذاء رياضي نسائي', price: 350, reason: 'مريح للاستخدام اليومي', confidence: 0.88 },
    { name: 'كوتشي كاجوال', price: 275, reason: 'تصميم عصري وأنيق', confidence: 0.82 },
    { name: 'حذاء جري احترافي', price: 450, reason: 'مناسب للرياضة والجري', confidence: 0.79 }
  ];

  // Filter based on message content
  let filteredProducts = products;
  if (message.includes('أبيض')) {
    filteredProducts = products.filter(p => p.name.includes('أبيض'));
  }
  if (message.includes('رياضي')) {
    filteredProducts = products.filter(p => p.name.includes('رياضي') || p.name.includes('جري'));
  }

  return {
    recommendations: filteredProducts.slice(0, 3).map(p => ({
      productName: p.name,
      price: p.price,
      reason: p.reason,
      confidence: p.confidence
    }))
  };
}

function generateSmartResponse(message) {
  const responses = [
    'مرحباً! أهلاً وسهلاً بك. كيف يمكنني مساعدتك اليوم؟ 😊',
    'أهلاً بك! أنا هنا لمساعدتك في أي شيء تحتاجه.',
    'مرحباً! سعيد بالتحدث معك. ما الذي يمكنني فعله لك؟',
    'أهلاً وسهلاً! كيف حالك اليوم؟ كيف يمكنني خدمتك؟'
  ];

  if (message.includes('مرحبا') || message.includes('السلام')) {
    return { response: responses[Math.floor(Math.random() * responses.length)] };
  }

  if (message.includes('شكرا') || message.includes('شكراً')) {
    return { response: 'العفو! أسعدني أن أساعدك. هل تحتاج أي شيء آخر؟ 😊' };
  }

  if (message.includes('كيف الحال')) {
    return { response: 'الحمد لله بخير! وأنت كيف حالك؟ كيف يمكنني مساعدتك اليوم؟' };
  }

  return { response: 'فهمت رسالتك. كيف يمكنني مساعدتك بشكل أفضل؟' };
}

function analyzeSentiment(message) {
  const positiveWords = ['سعيد', 'ممتاز', 'رائع', 'جميل', 'أحب', 'مبسوط'];
  const negativeWords = ['حزين', 'سيء', 'مشكلة', 'أكره', 'زعلان', 'مضايق'];

  let sentiment = 'neutral';
  let confidence = 0.7;

  const hasPositive = positiveWords.some(word => message.includes(word));
  const hasNegative = negativeWords.some(word => message.includes(word));

  if (hasPositive && !hasNegative) {
    sentiment = 'positive';
    confidence = 0.9;
  } else if (hasNegative && !hasPositive) {
    sentiment = 'negative';
    confidence = 0.85;
  }

  return {
    sentiment,
    confidence,
    emotions: sentiment === 'positive' ? ['joy', 'satisfaction'] :
             sentiment === 'negative' ? ['sadness', 'frustration'] : ['neutral']
  };
}

function recognizeIntent(message) {
  if (message.includes('أريد') || message.includes('شراء') || message.includes('اشتري')) {
    return { intent: 'purchase', confidence: 0.9, entities: ['product'] };
  }

  if (message.includes('مشكلة') || message.includes('شكوى') || message.includes('خطأ')) {
    return { intent: 'complaint', confidence: 0.85, entities: ['issue'] };
  }

  if (message.includes('كيف') || message.includes('ماذا') || message.includes('أين')) {
    return { intent: 'inquiry', confidence: 0.8, entities: ['question'] };
  }

  return { intent: 'general', confidence: 0.7, entities: ['conversation'] };
}

function searchProducts(message) {
  const allProducts = [
    { id: 1, name: 'كوتشي حريمي أبيض', relevance: 0.95 },
    { id: 2, name: 'حذاء رياضي نسائي', relevance: 0.88 },
    { id: 3, name: 'كوتشي كاجوال', relevance: 0.82 },
    { id: 4, name: 'حذاء جري احترافي', relevance: 0.79 },
    { id: 5, name: 'صندل صيفي', relevance: 0.65 },
    { id: 6, name: 'بوت شتوي', relevance: 0.60 }
  ];

  // Simple search based on keywords
  let results = allProducts;
  if (message.includes('كوتشي')) {
    results = allProducts.filter(p => p.name.includes('كوتشي'));
  } else if (message.includes('رياضي')) {
    results = allProducts.filter(p => p.name.includes('رياضي') || p.name.includes('جري'));
  }

  return {
    results: results.slice(0, 4)
  };
}

// Reset all capabilities to default
router.post('/reset', async (req, res) => {
  try {
    console.log('🔄 [AI-CAPABILITIES] Resetting capabilities to default');

    capabilitiesSettings = {
      'product-recommendations': true,
      'smart-responses': true,
      'image-analysis': false,
      'sentiment-analysis': true,
      'intent-recognition': true,
      'auto-replies': false,
      'product-search': true,
      'conversation-memory': true
    };

    res.json({
      success: true,
      data: capabilitiesSettings,
      message: 'تم إعادة تعيين القدرات للإعدادات الافتراضية'
    });
  } catch (error) {
    console.error('❌ [AI-CAPABILITIES] Error resetting capabilities:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في إعادة تعيين القدرات'
    });
  }
});

module.exports = router;
