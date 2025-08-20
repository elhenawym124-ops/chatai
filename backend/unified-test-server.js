/**
 * خادم موحد لاختبار نظام التقييم الذكي مع البيانات
 */

const express = require('express');
const cors = require('cors');
const QualityMonitorService = require('./src/services/qualityMonitorService');

const app = express();
const PORT = 3001;

// إنشاء خدمة التقييم الذكي
let qualityMonitor = null;

// تهيئة الخدمة مع بيانات تجريبية
async function initializeWithTestData() {
  console.log('🚀 تهيئة خدمة التقييم الذكي مع بيانات تجريبية...');
  
  qualityMonitor = new QualityMonitorService();
  
  // بيانات تجريبية متنوعة
  const testData = [
    {
      messageId: 'demo_msg_001',
      conversationId: 'demo_conv_001',
      userMessage: 'كم سعر الجاكيت الأزرق؟',
      botResponse: 'سعر الجاكيت الأزرق 250 جنيه مصري. متوفر بجميع المقاسات من S إلى XL. يمكنك طلبه الآن مع خدمة التوصيل المجاني داخل القاهرة.',
      ragData: {
        used: true,
        sources: [{ title: 'جاكيت أزرق', price: 250, sizes: ['S', 'M', 'L', 'XL'] }]
      },
      confidence: 0.95,
      model: 'gemini-2.5-pro',
      timestamp: new Date(Date.now() - 3600000) // منذ ساعة
    },
    {
      messageId: 'demo_msg_002',
      conversationId: 'demo_conv_002',
      userMessage: 'هل يمكن التوصيل للإسكندرية؟',
      botResponse: 'نعم، نوفر خدمة التوصيل للإسكندرية. رسوم التوصيل 30 جنيه ويستغرق من 2-3 أيام عمل.',
      ragData: {
        used: true,
        sources: [{ city: 'الإسكندرية', cost: 30, time: '2-3 أيام' }]
      },
      confidence: 0.88,
      model: 'gemini-2.5-pro',
      timestamp: new Date(Date.now() - 7200000) // منذ ساعتين
    },
    {
      messageId: 'demo_msg_003',
      conversationId: 'demo_conv_003',
      userMessage: 'أريد معلومات عن الحقائب الجلدية',
      botResponse: 'لدينا مجموعة متنوعة من الحقائب الجلدية عالية الجودة. أسعارها تتراوح من 200 إلى 800 جنيه حسب الحجم والتصميم.',
      ragData: {
        used: true,
        sources: [{ category: 'حقائب جلدية', price_range: '200-800' }]
      },
      confidence: 0.82,
      model: 'gemini-2.0-flash',
      timestamp: new Date(Date.now() - 10800000) // منذ 3 ساعات
    },
    {
      messageId: 'demo_msg_004',
      conversationId: 'demo_conv_004',
      userMessage: 'ما هي مواصفات الحذاء الرياضي؟',
      botResponse: 'نعم',
      ragData: {
        used: false,
        sources: []
      },
      confidence: 0.30,
      model: 'gemini-2.0-flash',
      timestamp: new Date(Date.now() - 14400000) // منذ 4 ساعات
    },
    {
      messageId: 'demo_msg_005',
      conversationId: 'demo_conv_005',
      userMessage: 'كيف يمكنني إرجاع المنتج؟',
      botResponse: 'يمكنك إرجاع أي منتج خلال 14 يوم من تاريخ الاستلام بشرط أن يكون في حالته الأصلية. سنقوم بإرجاع كامل المبلغ أو استبدال المنتج حسب رغبتك. للإرجاع، يرجى التواصل معنا على رقم خدمة العملاء.',
      ragData: {
        used: true,
        sources: [{ policy: 'return_policy', duration: '14 days' }]
      },
      confidence: 0.92,
      model: 'gemini-2.5-pro',
      timestamp: new Date(Date.now() - 18000000) // منذ 5 ساعات
    },
    {
      messageId: 'demo_msg_006',
      conversationId: 'demo_conv_006',
      userMessage: 'هل عندكم خصومات؟',
      botResponse: 'نعم، لدينا خصومات تصل إلى 30% على مجموعة مختارة من المنتجات. كما نوفر خصم 10% للعملاء الجدد عند أول طلب.',
      ragData: {
        used: true,
        sources: [{ discount: '30%', new_customer: '10%' }]
      },
      confidence: 0.89,
      model: 'gemini-2.5-pro',
      timestamp: new Date(Date.now() - 21600000) // منذ 6 ساعات
    }
  ];

  // إضافة البيانات للتقييم
  for (const data of testData) {
    await qualityMonitor.evaluateResponse(data);
  }

  // انتظار معالجة التقييمات
  console.log('⏳ انتظار معالجة التقييمات...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('✅ تم تحميل البيانات التجريبية بنجاح');
}

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Unified AI Quality Server',
    hasData: qualityMonitor ? qualityMonitor.getQualityStatistics().overall.totalEvaluations > 0 : false
  });
});

// AI Quality Routes
app.get('/api/v1/ai-quality/statistics', (req, res) => {
  try {
    if (!qualityMonitor) {
      return res.status(503).json({ success: false, error: 'Service not initialized' });
    }
    
    const statistics = qualityMonitor.getQualityStatistics();
    res.json({ success: true, data: statistics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/ai-quality/recent', (req, res) => {
  try {
    if (!qualityMonitor) {
      return res.status(503).json({ success: false, error: 'Service not initialized' });
    }
    
    const limit = parseInt(req.query.limit) || 10;
    const evaluations = qualityMonitor.getRecentEvaluations(limit);
    res.json({ success: true, data: evaluations, count: evaluations.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/ai-quality/trends', (req, res) => {
  try {
    if (!qualityMonitor) {
      return res.status(503).json({ success: false, error: 'Service not initialized' });
    }
    
    const days = parseInt(req.query.days) || 7;
    const trends = qualityMonitor.analyzeTrends(days);
    res.json({ success: true, data: trends });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/ai-quality/system-status', (req, res) => {
  try {
    if (!qualityMonitor) {
      return res.status(503).json({ success: false, error: 'Service not initialized' });
    }
    
    const status = qualityMonitor.getSystemStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/ai-quality/problematic', (req, res) => {
  try {
    if (!qualityMonitor) {
      return res.status(503).json({ success: false, error: 'Service not initialized' });
    }
    
    const limit = parseInt(req.query.limit) || 20;
    const evaluations = qualityMonitor.getProblematicEvaluations(limit);
    res.json({ success: true, data: evaluations, count: evaluations.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/ai-quality/by-quality/:level', (req, res) => {
  try {
    if (!qualityMonitor) {
      return res.status(503).json({ success: false, error: 'Service not initialized' });
    }
    
    const { level } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    
    const validLevels = ['excellent', 'good', 'acceptable', 'poor', 'very_poor'];
    if (!validLevels.includes(level)) {
      return res.status(400).json({ success: false, error: 'Invalid quality level' });
    }
    
    const evaluations = qualityMonitor.getEvaluationsByQuality(level, limit);
    res.json({ success: true, data: evaluations, qualityLevel: level, count: evaluations.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Legacy quality routes (للتوافق مع الواجهة القديمة)
app.get('/api/v1/monitor/quality/stats', (req, res) => {
  try {
    if (!qualityMonitor) {
      return res.status(503).json({ success: false, error: 'Service not initialized' });
    }
    
    const statistics = qualityMonitor.getQualityStatistics();
    const recentEvaluations = qualityMonitor.getRecentEvaluations(10);
    
    // تحويل البيانات للتنسيق المتوقع
    const legacyFormat = {
      ratings: {
        total: statistics.overall.totalEvaluations,
        positive: statistics.overall.qualityDistribution.excellent + statistics.overall.qualityDistribution.good,
        negative: statistics.overall.qualityDistribution.poor + statistics.overall.qualityDistribution.very_poor,
        satisfaction: statistics.overall.averageScore
      },
      responses: {
        rated: statistics.overall.totalEvaluations,
        unrated: 0,
        totalResponses: statistics.overall.totalEvaluations
      },
      analysis: {
        status: statistics.overall.averageScore >= 85 ? 'excellent' : 
                statistics.overall.averageScore >= 70 ? 'good' : 
                statistics.overall.averageScore >= 60 ? 'acceptable' : 'poor',
        satisfaction: statistics.overall.averageScore,
        negativeRate: Math.round(((statistics.overall.qualityDistribution.poor + statistics.overall.qualityDistribution.very_poor) / statistics.overall.totalEvaluations) * 100) || 0,
        concerns: statistics.overall.topIssues.map(issue => issue.issue),
        hasEnoughData: statistics.overall.totalEvaluations >= 5,
        recommendation: statistics.overall.averageScore >= 70 ? 'الأداء جيد' : 'يحتاج تحسين'
      },
      recentRatings: recentEvaluations.map(eval => ({
        id: eval.messageId,
        rating: eval.qualityLevel === 'excellent' || eval.qualityLevel === 'good' ? 'positive' : 'negative',
        comment: eval.issues.length > 0 ? eval.issues[0] : 'تقييم تلقائي',
        timestamp: eval.timestamp,
        customerId: eval.conversationId
      }))
    };
    
    res.json({ success: true, data: legacyFormat });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
async function startServer() {
  try {
    await initializeWithTestData();
    
    app.listen(PORT, () => {
      console.log(`🚀 Unified AI Quality Server running on port ${PORT}`);
      console.log(`📊 Available endpoints:`);
      console.log(`   - GET  /api/v1/ai-quality/statistics`);
      console.log(`   - GET  /api/v1/ai-quality/recent`);
      console.log(`   - GET  /api/v1/ai-quality/trends`);
      console.log(`   - GET  /api/v1/ai-quality/system-status`);
      console.log(`   - GET  /api/v1/monitor/quality/stats (legacy)`);
      console.log(`\n🌐 Open: http://localhost:3002/ai-quality`);
      console.log(`🌐 Or: http://localhost:3002/quality-advanced`);
      
      // عرض إحصائيات سريعة
      if (qualityMonitor) {
        const stats = qualityMonitor.getQualityStatistics();
        console.log(`\n📈 Quick Stats:`);
        console.log(`   - Total Evaluations: ${stats.overall.totalEvaluations}`);
        console.log(`   - Average Quality: ${stats.overall.averageScore}%`);
        console.log(`   - Quality Distribution: ${JSON.stringify(stats.overall.qualityDistribution)}`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
