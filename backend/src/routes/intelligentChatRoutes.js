/**
 * Routes للدردشة الذكية الطبيعية
 */

const express = require('express');
const IntelligentChatController = require('../controllers/intelligentChatController');

const router = express.Router();
const intelligentChatController = new IntelligentChatController();

/**
 * توليد رد ذكي وطبيعي
 * POST /api/v1/ai/intelligent-response
 */
router.post('/intelligent-response', async (req, res) => {
  await intelligentChatController.generateIntelligentResponse(req, res);
});

/**
 * الحصول على إحصائيات النظام
 * GET /api/v1/ai/intelligent-analytics
 */
router.get('/intelligent-analytics', async (req, res) => {
  await intelligentChatController.getSystemAnalytics(req, res);
});

/**
 * الحصول على ذاكرة محادثة عميل
 * GET /api/v1/ai/conversation-memory/:customerId
 */
router.get('/conversation-memory/:customerId', async (req, res) => {
  await intelligentChatController.getConversationMemory(req, res);
});

/**
 * تنظيف الذاكرة يدوياً
 * POST /api/v1/ai/cleanup-memory
 */
router.post('/cleanup-memory', async (req, res) => {
  await intelligentChatController.cleanupMemory(req, res);
});

/**
 * اختبار النظام الذكي
 * POST /api/v1/ai/test-intelligent
 */
router.post('/test-intelligent', async (req, res) => {
  await intelligentChatController.testIntelligentSystem(req, res);
});

/**
 * معلومات النظام الذكي
 * GET /api/v1/ai/intelligent-info
 */
router.get('/intelligent-info', (req, res) => {
  res.json({
    success: true,
    data: {
      systemName: 'Intelligent Natural Chat System',
      version: '1.0.0',
      description: 'نظام دردشة ذكي وطبيعي مع اقتراح منتجات حسب السياق',
      features: [
        'تحليل نية العميل الذكي',
        'محادثة طبيعية',
        'اقتراح منتجات حسب السياق',
        'ذاكرة محادثة',
        'تحليل المشاعر',
        'ردود تفاعلية'
      ],
      endpoints: [
        'POST /api/v1/ai/intelligent-response - توليد رد ذكي',
        'GET /api/v1/ai/intelligent-analytics - إحصائيات النظام',
        'GET /api/v1/ai/conversation-memory/:customerId - ذاكرة المحادثة',
        'POST /api/v1/ai/cleanup-memory - تنظيف الذاكرة',
        'POST /api/v1/ai/test-intelligent - اختبار النظام'
      ]
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
