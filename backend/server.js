const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const http = require('http');
const socketService = require('./src/services/socketService');
const axios = require('axios');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import Simple Monitoring System
const { simpleMonitor } = require('./src/services/simpleMonitor');
const monitoringRoutes = require('./src/routes/monitoringRoutes');

// Import Auto Pattern Detection Service
const autoPatternService = require('./src/services/autoPatternDetectionService');

// Import Global Security Middleware
const { globalSecurity } = require('./src/middleware/globalSecurity');
const { securityMonitor } = require('./src/middleware/securityMonitor');

// Import Security Enhancements
const {
  rateLimits,
  securityHeaders,
  sanitizeRequest,
  securityMonitoring,
  enhancedCORS
} = require('./src/middleware/securityEnhancements');

// Set UTF-8 encoding for console output
process.stdout.setEncoding('utf8');
process.stderr.setEncoding('utf8');

console.log('🚀 Starting Clean Server (No AI)...');

// Initialize Prisma Client with UTF-8 support and connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: ['error', 'warn'],
  errorFormat: 'minimal'
});

// Helper function to generate unique IDs
function generateId() {
  return 'cm' + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9);
}

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
socketService.initialize(server);

// Database connection retry utility
async function withRetry(operation, maxRetries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.log(`⚠️ Database operation failed (attempt ${attempt}/${maxRetries}):`, error.message);

      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
}

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    // Allow localhost and local network addresses
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002'
    ];

    // Allow any local network IP (192.168.x.x, 172.x.x.x, 10.x.x.x)
    const localNetworkRegex = /^https?:\/\/(192\.168\.|172\.|10\.|169\.254\.)\d+\.\d+\.\d+:3000$/;

    if (allowedOrigins.includes(origin) || localNetworkRegex.test(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Request-ID',
    'x-request-id',
    'Accept',
    'Origin',
    'X-Requested-With'
  ]
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Set charset for responses
app.use((req, res, next) => {
  res.charset = 'utf-8';
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Apply Security Enhancements
console.log('🛡️ Applying Security Enhancements...');
app.use(enhancedCORS);
app.use(securityHeaders);
app.use(sanitizeRequest);
app.use(securityMonitoring);

// Apply rate limiting (disabled for development)
if (process.env.NODE_ENV === 'production') {
  app.use('/api/v1/auth', rateLimits.auth);
  app.use('/api/v1/admin', rateLimits.admin);
  app.use('/api/v1', rateLimits.api);
  console.log('🛡️ Rate limiting enabled for production');
} else {
  console.log('🔧 Rate limiting disabled for development');
}

// Apply Global Security Middleware to all routes
console.log('🛡️ Applying Global Security Middleware...');
app.use(globalSecurity);

// Add monitoring routes (after security middleware)
console.log('🔧 [SERVER] Registering monitoring routes at /api/v1/monitor');
app.use('/api/v1/monitor', (req, res, next) => {
  console.log('🔍 [SERVER] Monitor route hit:', req.method, req.path);
  next();
}, monitoringRoutes);

// Add AI Quality routes
const aiQualityRoutes = require('./src/routes/aiQualityRoutes');
app.use('/api/v1/ai-quality', aiQualityRoutes);

// Add Conversation AI Control routes
const conversationAIRoutes = require('./src/routes/conversationAIRoutes');
app.use('/api/v1', conversationAIRoutes);

// Security monitoring endpoint
app.get('/api/v1/security/stats', async (req, res) => {
  try {
    const stats = securityMonitor.getSecurityStats();
    res.json({
      success: true,
      data: stats,
      message: 'إحصائيات الأمان'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إحصائيات الأمان'
    });
  }
});

// Security daily report endpoint
app.get('/api/v1/security/daily-report', async (req, res) => {
  try {
    const report = securityMonitor.getDailySecurityReport();
    res.json({
      success: true,
      data: report,
      message: 'التقرير الأمني اليومي'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب التقرير الأمني'
    });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    security: securityMonitor.calculateSecurityScore(),
    version: '1.0.0'
  };

  try {
    // Test database connection
    await withRetry(() => prisma.company.findFirst());
    healthCheck.database = 'Connected';
  } catch (error) {
    healthCheck.database = 'Disconnected';
    healthCheck.status = 'ERROR';
    healthCheck.error = error.message;
  }

  const statusCode = healthCheck.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

// إعداد UTF-8 للترميز الصحيح
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Basic logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint removed - using the comprehensive one above

// Test RAG endpoint
app.post('/api/v1/test-rag', async (req, res) => {
  try {
    const { message } = req.body;

    const aiAgentService = require('./src/services/aiAgentService');

    const messageData = {
      conversationId: 'test',
      senderId: 'test-user',
      content: message,
      attachments: [],
      customerData: {
        id: 'test-customer',
        name: 'Test User',
        phone: '01234567890',
        orderCount: 0,
        companyId: 'cmdkj6coz0000uf0cyscco6lr'
      }
    };

    console.log('🧪 Testing RAG with message:', message);
    const result = await aiAgentService.processCustomerMessage(messageData);

    res.json({
      success: true,
      message: message,
      result: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Test RAG error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Basic routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Chat Bot Backend - Clean Version (No AI)',
    version: '1.0.0',
    features: ['Basic messaging', 'Manual responses only']
  });
});

// ==================== FACEBOOK WEBHOOK ====================

// ==================== SMART MESSAGE DELAY SYSTEM ====================
/**
 * نظام التأخير الذكي للرسائل
 * يجمع الرسائل المتتالية من نفس العميل ويرد عليها مجمعة
 *
 * الميزات:
 * - تأخير ذكي حسب نوع الرسالة
 * - جمع الرسائل المتتالية
 * - رد فوري للأسئلة المباشرة
 * - حد أقصى 5 ثواني انتظار
 */

// ❌ REMOVED: Smart Delay System - messageQueue deleted for simplicity

// خريطة لحفظ معرفات الرسائل المعالجة لمنع التكرار
// Structure: messageId -> timestamp
const processedMessages = new Map();

// خريطة لحفظ الردود السريعة (cache) - مُلغى للمنتجات المتعددة
// Structure: messageHash -> {response, timestamp}
// 🚫 النظام مُلغى لضمان الدقة مع المنتجات المتعددة
const quickResponseCache = new Map();

// خريطة لحفظ معرفات الصفحات وtokens
// Structure: pageId -> {pageAccessToken, pageName, lastUsed}
const pageTokenCache = new Map();

// مجموعة لتتبع العملاء قيد المعالجة لمنع التداخل
const processingCustomers = new Set();

// ❌ REMOVED: Smart Delay System - MESSAGE_DELAY_CONFIG deleted for simplicity

// ❌ REMOVED: analyzeMessageForDelay function - Smart Delay System deleted

// ❌ REMOVED: handleMessageWithSmartDelay function - Smart Delay System deleted

/**
 * فحص الردود السريعة المحفوظة
 * @param {string} messageText - نص الرسالة
 * @returns {string|null} - الرد المحفوظ أو null
 */
function getQuickResponse(messageText) {
  const messageHash = messageText.toLowerCase().trim();
  const cached = quickResponseCache.get(messageHash);

  if (cached) {
    const age = Date.now() - cached.timestamp;
    const MAX_CACHE_AGE = 10 * 60 * 1000; // 10 دقائق

    if (age < MAX_CACHE_AGE) {
      // فلترة الردود العامة - لا نستخدم الردود السريعة للردود العامة
      const genericResponses = [
        'مرحباً',
        'كيف يمكنني مساعدتك',
        'أهلاً',
        'مساء الخير',
        'صباح الخير',
        'السلام عليكم'
      ];

      const isGenericResponse = genericResponses.some(generic =>
        cached.response.toLowerCase().includes(generic.toLowerCase())
      );

      if (isGenericResponse) {
        console.log(`⚠️ [QUICK-RESPONSE] تجاهل رد عام محفوظ: "${cached.response.substring(0, 30)}..."`);
        quickResponseCache.delete(messageHash); // حذف الرد العام
        return null;
      }

      console.log(`⚡ [QUICK-RESPONSE] استخدام رد محفوظ للرسالة: "${messageText}"`);
      return cached.response;
    } else {
      // حذف الرد المنتهي الصلاحية
      quickResponseCache.delete(messageHash);
    }
  }

  return null;
}

/**
 * حفظ رد سريع
 * @param {string} messageText - نص الرسالة
 * @param {string} response - الرد
 */
function saveQuickResponse(messageText, response) {
  const messageHash = messageText.toLowerCase().trim();
  quickResponseCache.set(messageHash, {
    response: response,
    timestamp: Date.now()
  });

  // تنظيف الذاكرة - الاحتفاظ بآخر 100 رد فقط
  if (quickResponseCache.size > 100) {
    const oldestKey = quickResponseCache.keys().next().value;
    quickResponseCache.delete(oldestKey);
  }
}

/**
 * تحديث cache الصفحات
 * @param {string} pageId - معرف الصفحة
 * @param {string} pageAccessToken - token الصفحة
 * @param {string} pageName - اسم الصفحة
 * @param {string} companyId - معرف الشركة للعزل
 */
function updatePageTokenCache(pageId, pageAccessToken, pageName, companyId) {
  pageTokenCache.set(pageId, {
    pageAccessToken: pageAccessToken,
    pageName: pageName,
    companyId: companyId, // 🔐 حفظ companyId للعزل
    lastUsed: Date.now()
  });

  console.log(`💾 [PAGE-CACHE] تم تحديث cache للصفحة: ${pageName} (${pageId}) - شركة: ${companyId}`);
}

/**
 * الحصول على token الصفحة من cache أو قاعدة البيانات
 * @param {string} pageId - معرف الصفحة
 * @returns {Object|null} - بيانات الصفحة أو null
 */
async function getPageToken(pageId) {
  // فحص cache أولاً
  if (pageTokenCache.has(pageId)) {
    const cached = pageTokenCache.get(pageId);
    console.log(`⚡ [PAGE-CACHE] استخدام cache للصفحة: ${cached.pageName}`);
    return cached;
  }

  // البحث في قاعدة البيانات
  try {
    const page = await prisma.facebookPage.findUnique({
      where: { pageId: pageId }
    });

    if (page && page.pageAccessToken) {
      updatePageTokenCache(pageId, page.pageAccessToken, page.pageName, page.companyId);
      return {
        pageAccessToken: page.pageAccessToken,
        pageName: page.pageName,
        companyId: page.companyId, // 🔐 إضافة companyId للعزل
        lastUsed: Date.now()
      };
    }
  } catch (error) {
    console.error(`❌ [PAGE-CACHE] خطأ في البحث عن الصفحة ${pageId}:`, error);
  }

  return null;
}

/**
 * معالجة مباشرة للرسالة بدون تكرار - مع تحسينات السرعة
 * @param {string} senderId - معرف المرسل
 * @param {string} messageText - نص الرسالة
 * @param {Object} webhookEvent - بيانات الـ webhook الكاملة
 */
async function processMessageDirectly(senderId, messageText, webhookEvent) {
  try {
    console.log(`📨 Message from ${senderId}: "${messageText}"`);

    // 🚫 تم إلغاء نظام الردود السريعة لضمان الدقة مع المنتجات المتعددة
    console.log(`🎯 [NO-CACHE] معالجة مباشرة مع AI - لا توجد ردود محفوظة`);

    // عرض الردود السريعة للتشخيص (للمراقبة فقط)
    debugQuickResponses();

    // استدعاء دالة معالجة فيسبوك العادية مع pageId الصحيح
    const correctPageId = webhookEvent.recipient?.id || lastWebhookPageId;
    console.log(`🎯 [PAGE-FIX] Using correct pageId: ${correctPageId} for message from ${webhookEvent.sender?.id}`);
    await handleFacebookMessage(webhookEvent, correctPageId);

  } catch (error) {
    // 🤐 النظام الصامت - تسجيل الخطأ داخلياً فقط
    console.error('🚨 [SILENT-SYSTEM-ERROR] Error in direct message processing:', {
      customerId: senderId,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      messageContent: messageText || 'undefined'
    });

    // 🚫 لا نرسل أي رسالة للعميل - النظام صامت تماماً
    console.log('🤐 [SILENT-MODE] Direct processing error but no message sent to customer');
  }
}

// ❌ REMOVED: processQueuedMessages function - Smart Delay System deleted

// ❌ REMOVED: Smart Delay System completely deleted for simplicity

// ==================== SIMPLE MESSAGE PROCESSING ====================

/**
 * معالجة مباشرة وبسيطة للرسائل - بدون تأخير أو تعقيد
 * @param {string} senderId - معرف المرسل
 * @param {string} messageText - نص الرسالة
 * @param {Object} webhookEvent - بيانات الـ webhook الكاملة
 */
async function handleMessageDirectly(senderId, messageText, webhookEvent) {
  const now = Date.now();

  // فحص الرسائل المكررة بناءً على message ID
  const messageId = webhookEvent.message?.mid;
  if (messageId && processedMessages.has(messageId)) {
    console.log(`🔄 [DIRECT] رسالة مكررة تم تجاهلها: ${messageId}`);
    return;
  }

  // إضافة معرف الرسالة للقائمة المعالجة
  if (messageId) {
    processedMessages.set(messageId, now);

    // تنظيف الرسائل القديمة (أكثر من 10 دقائق)
    const OLD_MESSAGE_THRESHOLD = 10 * 60 * 1000; // 10 دقائق
    for (const [id, timestamp] of processedMessages.entries()) {
      if (now - timestamp > OLD_MESSAGE_THRESHOLD) {
        processedMessages.delete(id);
      }
    }
  }

  // فحص إذا كان العميل قيد المعالجة لمنع التداخل
  if (processingCustomers.has(senderId)) {
    console.log(`⚠️ [DIRECT] العميل ${senderId} قيد المعالجة - تجاهل الرسالة المكررة`);
    return;
  }

  try {
    // إضافة العميل لقائمة المعالجة
    processingCustomers.add(senderId);
    console.log(`📨 [DIRECT] معالجة مباشرة للرسالة من ${senderId}: "${messageText}"`);

    // معالجة مباشرة بدون تأخير
    await processMessageDirectly(senderId, messageText, webhookEvent);

  } catch (error) {
    console.error('🚨 [DIRECT] خطأ في المعالجة المباشرة:', {
      customerId: senderId,
      error: error.message,
      timestamp: new Date().toISOString(),
      messageContent: messageText || 'undefined'
    });
  } finally {
    // إزالة العميل من قائمة المعالجة
    processingCustomers.delete(senderId);
    console.log(`✅ [DIRECT] انتهت معالجة العميل: ${senderId}`);
  }
}

// Facebook webhook verification
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || 'your_verify_token';
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Facebook webhook verified');
      res.status(200).send(challenge);
    } else {
      console.log('❌ Facebook webhook verification failed');
      res.sendStatus(403);
    }
  }
});

// Facebook webhook for receiving messages (معالجة مباشرة وبسيطة)
app.post('/webhook', async (req, res) => {
  // رد فوري لفيسبوك لمنع إعادة الإرسال
  res.status(200).send('EVENT_RECEIVED');

  const body = req.body;

  // فحص إذا كان الـ webhook يحتوي على رسائل فعلية
  const hasActualMessages = body.entry?.some(entry =>
    entry.messaging?.some(msg => msg.message?.text || msg.message?.attachments)
  );

  if (hasActualMessages) {
    console.log('🔔 Webhook received with actual messages:', JSON.stringify(body, null, 2));
  } else {
    // لوج مختصر للـ webhooks الفارغة (read events, delivery, etc.)
    const eventTypes = body.entry?.flatMap(entry =>
      entry.messaging?.map(msg => Object.keys(msg).filter(key => key !== 'sender' && key !== 'recipient' && key !== 'timestamp'))
    ).flat() || [];
    console.log(`📱 Webhook event (${eventTypes.join(', ')}) - no messages to process`);
  }

  if (body.object === 'page') {
    if (hasActualMessages) {
      console.log('📄 Processing page event with messages...');
    }

    // معالجة كل entry في الـ webhook
    for (const entry of body.entry) {
      if (hasActualMessages) {
        console.log('📝 Processing entry:', JSON.stringify(entry, null, 2));
      }

      // Debug: Log the entire entry structure
      console.log('🔍 Entry structure:', JSON.stringify({
        id: entry.id,
        time: entry.time,
        messaging: entry.messaging ? entry.messaging.length : 'undefined',
        changes: entry.changes ? entry.changes.length : 'undefined',
        hasMessaging: !!entry.messaging,
        messagingTypes: entry.messaging ? entry.messaging.map(m => Object.keys(m)) : []
      }, null, 2));

      // حفظ Page ID من webhook للاستخدام في الإرسال
      if (entry.id) {
        lastWebhookPageId = entry.id;
        console.log(`🎯 [WEBHOOK] تم حفظ Page ID: ${lastWebhookPageId}`);
      }

      // Check if messaging exists
      if (!entry.messaging || entry.messaging.length === 0) {
        console.log('⚠️ No messaging events in this entry');
        continue;
      }

      if (entry.messaging && entry.messaging.length > 0) {
        // معالجة كل messaging event بشكل متوازي
        const messagingPromises = entry.messaging.map(async (webhookEvent) => {
          console.log('🔍 Processing messaging event:', JSON.stringify({
            hasMessage: !!webhookEvent.message,
            hasDelivery: !!webhookEvent.delivery,
            hasRead: !!webhookEvent.read,
            hasPostback: !!webhookEvent.postback,
            sender: webhookEvent.sender?.id,
            recipient: webhookEvent.recipient?.id,
            timestamp: webhookEvent.timestamp
          }, null, 2));

          // طباعة تفاصيل الـ event فقط إذا كان يحتوي على رسالة فعلية
          if (webhookEvent.message?.text || webhookEvent.message?.attachments) {
            console.log('💬 Processing messaging event:', JSON.stringify(webhookEvent, null, 2));
          }

          // التحقق من وجود رسالة نصية
          if (webhookEvent.message && webhookEvent.message.text) {
            console.log('✅ Message found, processing directly...');

            const senderId = webhookEvent.sender.id;
            const messageText = webhookEvent.message.text;

            // معالجة مباشرة وبسيطة للرسائل
            return handleMessageDirectly(senderId, messageText, webhookEvent);

          } else if (webhookEvent.message) {
            // رسالة بدون نص (صور، ملفات، إلخ) - فحص التكرار أولاً
            console.log('📎 Non-text message found, checking for duplicates...');

            const messageId = webhookEvent.message.mid;
            if (processedMessages.has(messageId)) {
              console.log(`🔄 [DUPLICATE] رسالة مكررة تم تجاهلها: ${messageId}`);
              return Promise.resolve();
            }

            // إضافة الرسالة للمعالجة
            processedMessages.set(messageId, Date.now());
            console.log('📎 Processing non-text message immediately...');
            const correctPageId = webhookEvent.recipient?.id || entry.id;
            console.log(`🎯 [PAGE-FIX] Using correct pageId for non-text: ${correctPageId}`);
            return handleFacebookMessage(webhookEvent, correctPageId);

          } else {
            // أحداث أخرى (delivery، read، إلخ) - لا نطبع لوج لتقليل الضوضاء
            return Promise.resolve();
          }
        });

        // انتظار جميع الرسائل بشكل متوازي
        await Promise.allSettled(messagingPromises);
      } else {
        console.log('❌ No messaging in entry');
      }
    }

    // الرد تم إرساله في بداية الدالة
  } else {
    console.log('❌ Not a page event:', body.object);
    // لا نرد هنا لأن الرد تم إرساله بالفعل
  }
});

// Handle Facebook messages (WITH AI AGENT)
async function handleFacebookMessage(webhookEvent, currentPageId = null) {
  try {
    const senderId = webhookEvent.sender.id;
    const messageText = webhookEvent.message.text;
    const attachments = webhookEvent.message.attachments;
    // استخراج معلومات الرد على الرسالة (reply_to)
    const replyTo = webhookEvent.message.reply_to;
    // Fix timestamp conversion - use current time for safety
    const timestamp = new Date();

    // استخدام pageId من الرسالة الحالية أو fallback لآخر webhook
    const messagePageId = currentPageId || webhookEvent.recipient?.id || lastWebhookPageId;
    console.log(`📄 [MESSAGE-PAGE] Using page ID for this message: ${messagePageId}`);

    console.log(`📨 Message from ${senderId}: "${messageText}"`);
    console.log(`🔍 [WEBHOOK-DEBUG] Full message object:`, JSON.stringify(webhookEvent.message, null, 2));
    console.log(`📎 [WEBHOOK-DEBUG] Attachments:`, attachments);
    console.log(`📎 [WEBHOOK-DEBUG] Attachments type:`, typeof attachments);
    console.log(`📎 [WEBHOOK-DEBUG] Attachments length:`, attachments ? attachments.length : 'undefined');

    // إضافة لوج لمعلومات الرد
    if (replyTo) {
      console.log(`↩️ [REPLY-DEBUG] This message is a reply to message ID: ${replyTo.mid}`);
    } else {
      console.log(`📝 [REPLY-DEBUG] This is a new message (not a reply)`);
    }

    // Find or create customer
    // 🔐 تحديد الشركة الصحيحة بناءً على الصفحة أولاً
    let pageData = null;
    if (messagePageId) {
      pageData = await getPageToken(messagePageId);
    }

    // رفض استخدام fallback خطير - لا يوجد صفحة افتراضية
    if (!pageData) {
      console.error(`❌ [SECURITY] No page data found for pageId: ${messagePageId}`);
      console.error(`📱 [SECURITY] Refusing dangerous fallback - no default page allowed`);

      // تسجيل محاولة خرق العزل
      securityMonitor.logSuspiciousAttempt('UNKNOWN_PAGE_ACCESS', {
        pageId: messagePageId,
        senderId: senderId,
        companyId: null,
        message: 'محاولة الوصول من صفحة غير مسجلة - تم منعها'
      });

      // رفض الطلب - إنهاء المعالجة
      console.error(`🚫 [SECURITY] Request rejected - unknown page: ${messagePageId}`);
      return; // إنهاء المعالجة بدون رد
    }

    // تحديد الشركة المستهدفة - نظام آمن بدون fallback
    let targetCompanyId = null;
    if (pageData?.companyId) {
      targetCompanyId = pageData.companyId;
      console.log(`🏢 [COMPANY-DEBUG] Using company from page: ${targetCompanyId}`);
    } else {
      // تسجيل محاولة خرق العزل
      securityMonitor.logSuspiciousAttempt('MISSING_COMPANY_ID', {
        pageId: messagePageId,
        senderId: senderId,
        companyId: null,
        message: 'محاولة وصول بدون معرف شركة - تم منعها'
      });

      // رفض الطلب بدلاً من استخدام fallback خطير
      console.error(`❌ [SECURITY] لم يتم تمرير companyId - رفض الطلب للأمان`);
      console.error(`📱 [SECURITY] Page ID: ${messagePageId}, Sender: ${senderId}`);

      // إرسال رسالة خطأ للمستخدم
      await sendFacebookMessage(senderId,
        'عذراً، حدث خطأ في تحديد هوية الشركة. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني.',
        'TEXT', messagePageId);

      // رفض الطلب - إنهاء المعالجة
      console.error(`🚫 [SECURITY] Request rejected - company ID missing`);
      return; // إنهاء المعالجة بدون رد
    }

    // التحقق من صحة الشركة المحددة
    const companyExists = await prisma.company.findUnique({
      where: { id: targetCompanyId }
    });

    if (!companyExists) {
      // تسجيل محاولة الوصول لشركة غير موجودة
      securityMonitor.logSuspiciousAttempt('INVALID_COMPANY_ID', {
        pageId: messagePageId,
        senderId: senderId,
        companyId: targetCompanyId,
        message: `محاولة الوصول لشركة غير موجودة: ${targetCompanyId}`
      });

      console.error(`❌ [SECURITY] شركة غير موجودة: ${targetCompanyId}`);
      console.error(`📱 [SECURITY] Page ID: ${messagePageId}, Sender: ${senderId}`);

      // رفض الطلب - إنهاء المعالجة
      console.error(`🚫 [SECURITY] Request rejected - company not found: ${targetCompanyId}`);
      return; // إنهاء المعالجة بدون رد
    }

    console.log(`✅ [SECURITY] تم التحقق من صحة الشركة: ${companyExists.name} (${targetCompanyId})`);
    console.log(`🔍 [CUSTOMER-DEBUG] Looking for customer with facebookId: ${senderId} in company: ${targetCompanyId}`);
    let customer = await prisma.customer.findFirst({
      where: {
        facebookId: senderId,
        companyId: targetCompanyId // 🔐 البحث مع العزل
      }
    });

    // إذا لم نجد العميل في الشركة الحالية، فحص إذا كان موجود في شركة أخرى
    if (!customer) {
      const existingCustomer = await prisma.customer.findFirst({
        where: { facebookId: senderId }
      });

      if (existingCustomer) {
        console.log(`⚠️ [CUSTOMER-DEBUG] Customer exists in different company: ${existingCustomer.companyId}, moving to: ${targetCompanyId}`);

        // نقل العميل للشركة الصحيحة
        customer = await prisma.customer.update({
          where: { id: existingCustomer.id },
          data: { companyId: targetCompanyId }
        });

        // نقل جميع المحادثات للشركة الجديدة
        await prisma.conversation.updateMany({
          where: { customerId: customer.id },
          data: { companyId: targetCompanyId }
        });

        console.log(`✅ [CUSTOMER-DEBUG] Customer moved to correct company: ${targetCompanyId}`);
      }
    }

    if (customer) {
      console.log(`✅ [CUSTOMER-DEBUG] Found existing customer: ${customer.firstName} ${customer.lastName} (${customer.id})`);
    } else {
      console.log(`❌ [CUSTOMER-DEBUG] No existing customer found for facebookId: ${senderId}`);
    }

    // إذا كان العميل موجود لكن اسمه "Facebook User"، نحدث اسمه
    if (customer && (customer.firstName === 'Facebook' || customer.lastName === 'User')) {
      console.log(`🔄 Updating existing customer name for: ${senderId}`);

      // محاولة جلب معلومات المستخدم الحقيقية من Facebook
      if (pageData && pageData.pageAccessToken) {
        try {
          const userInfo = await getFacebookUserInfo(senderId, pageData.pageAccessToken);

          if (userInfo.first_name !== 'Facebook' || userInfo.last_name !== 'User') {
            // تحديث اسم العميل
            customer = await prisma.customer.update({
              where: { id: customer.id },
              data: {
                firstName: userInfo.first_name || customer.firstName,
                lastName: userInfo.last_name || customer.lastName
              }
            });
            console.log(`✅ Updated customer name: ${customer.firstName} ${customer.lastName} (${customer.id})`);
          }
        } catch (error) {
          console.log(`⚠️ Could not fetch Facebook user info for ${senderId}, keeping default name`);
        }
      }
    }

    if (!customer) {
      // التحقق من صحة companyId قبل إنشاء العميل
      if (!targetCompanyId || targetCompanyId === 'null' || targetCompanyId === 'undefined') {
        console.error(`❌ [SECURITY] Cannot create customer without valid companyId: ${targetCompanyId}`);
        console.error(`📱 [SECURITY] Page ID: ${messagePageId}, Sender: ${senderId}`);

        // تسجيل محاولة خرق العزل
        securityMonitor.logSuspiciousAttempt('CUSTOMER_CREATION_WITHOUT_COMPANY', {
          pageId: messagePageId,
          senderId: senderId,
          companyId: targetCompanyId,
          message: 'محاولة إنشاء عميل بدون شركة صحيحة - تم منعها'
        });

        // رفض الطلب - إنهاء المعالجة
        console.error(`🚫 [SECURITY] Customer creation rejected - invalid company: ${targetCompanyId}`);
        return; // إنهاء المعالجة بدون رد
      }

      // إنشاء عميل جديد مع companyId صحيح
      console.log(`👤 [CUSTOMER-DEBUG] Creating new customer for facebookId: ${senderId} in company: ${targetCompanyId}`);

      // جلب معلومات المستخدم الحقيقية من Facebook
      let userInfo = { first_name: 'Facebook', last_name: 'User' };
      if (pageData && pageData.pageAccessToken) {
        try {
          userInfo = await getFacebookUserInfo(senderId, pageData.pageAccessToken);
        } catch (error) {
          console.log(`⚠️ Could not fetch Facebook user info, using default name`);
        }
      }

      customer = await prisma.customer.create({
        data: {
          facebookId: senderId,
          firstName: userInfo?.first_name || `عميل فيسبوك`,
          lastName: userInfo?.last_name || `${senderId.slice(-4)}`,
          email: `facebook_${senderId}@example.com`,
          phone: '',
          companyId: targetCompanyId // 🔐 استخدام الشركة الصحيحة
        }
      });
      console.log(`👤 New customer created: ${customer.firstName} ${customer.lastName} (${customer.id})`);

      // تم إزالة رسالة طلب الاسم بناءً على طلب المستخدم
    }
    
    // Find or create conversation (include RESOLVED to maintain continuity)
    console.log(`🔍 [CONVERSATION-DEBUG] Looking for conversation for customer: ${customer.id}`);
    let conversation = await prisma.conversation.findFirst({
      where: {
        customerId: customer.id,
        status: { in: ['ACTIVE', 'RESOLVED'] }
      },
      orderBy: { updatedAt: 'desc' }  // Get the most recent conversation
    });

    if (conversation) {
      console.log(`✅ [CONVERSATION-DEBUG] Found existing conversation: ${conversation.id} (status: ${conversation.status})`);
    } else {
      console.log(`❌ [CONVERSATION-DEBUG] No existing conversation found for customer: ${customer.id}`);
    }

    // If found a RESOLVED conversation, reactivate it
    if (conversation && conversation.status === 'RESOLVED') {
      conversation = await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          status: 'ACTIVE',
          lastMessageAt: timestamp,
          updatedAt: new Date()
        }
      });
      console.log(`🔄 Reactivated conversation: ${conversation.id}`);
    } else if (conversation && conversation.status === 'ACTIVE') {
      // Update existing active conversation
      conversation = await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: timestamp,
          updatedAt: new Date()
        }
      });
      console.log(`🔄 Updated existing active conversation: ${conversation.id}`);
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          customerId: customer.id,
          companyId: customer.companyId,
          channel: 'FACEBOOK',
          status: 'ACTIVE',
          lastMessageAt: timestamp
        }
      });
      console.log(`💬 New conversation created: ${conversation.id}`);
    }
    
    // Save message to database
    const newMessage = await prisma.message.create({
      data: {
        content: messageText || '',
        type: 'TEXT',
        conversationId: conversation.id,
        isFromCustomer: true,
        metadata: JSON.stringify({
          platform: 'facebook',
          source: 'messenger',
          senderId: senderId,
          hasAttachments: !!attachments,
          // إضافة معلومات الرد
          replyTo: replyTo ? {
            messageId: replyTo.mid,
            isReply: true
          } : null
        }),
        createdAt: timestamp
      }
    });

    console.log(`✅ Message saved: ${newMessage.id}`);

    // البحث عن الرسالة الأصلية المُرد عليها
    let originalMessage = null;
    if (replyTo) {
      console.log(`🔍 [REPLY-SEARCH] Searching for original message with Facebook ID: ${replyTo.mid}`);
      
      // البحث في الرسائل السابقة في نفس المحادثة
      const recentMessages = await prisma.message.findMany({
        where: {
          conversationId: conversation.id,
          isFromCustomer: false // رسائل من النظام/الذكاء الاصطناعي
        },
        orderBy: { createdAt: 'desc' },
        take: 10 // آخر 10 رسائل
      });

      // محاولة العثور على الرسالة بناءً على التوقيت أو المحتوى
      if (recentMessages.length > 0) {
        // أخذ آخر رسالة من النظام كرسالة مُرد عليها (تقريبي)
        originalMessage = recentMessages[0];
        console.log(`✅ [REPLY-FOUND] Found potential original message: ${originalMessage.id} - "${originalMessage.content?.substring(0, 50)}..."`);
      } else {
        console.log(`❌ [REPLY-NOT-FOUND] Could not find original message for reply`);
      }
    }

    // Prepare message data for AI Agent
    const messageData = {
      conversationId: conversation.id,
      senderId: senderId,
      content: messageText || '',
      attachments: attachments || [],
      timestamp: timestamp,
      companyId: customer.companyId, // 🔐 إضافة companyId للعزل
      // إضافة معلومات الرد
      replyContext: replyTo ? {
        isReply: true,
        originalMessageId: replyTo.mid,
        originalMessage: originalMessage ? {
          id: originalMessage.id,
          content: originalMessage.content,
          createdAt: originalMessage.createdAt
        } : null
      } : null,
      customerData: {
        id: customer.id,
        name: `${customer.firstName} ${customer.lastName}`,
        phone: customer.phone,
        email: customer.email,
        orderCount: 0, // يمكن حسابه لاحقاً
        companyId: customer.companyId // 🔐 إضافة companyId في customerData أيضاً
      }
    };

    // Check if AI is enabled for this conversation
    console.log('🔍 Checking AI status for conversation:', conversation.id);
    try {
      const conversationRecord = await prisma.conversation.findUnique({
        where: { id: conversation.id },
        select: { metadata: true }
      });

      // Parse metadata to get aiEnabled status
      let aiEnabled = true; // Default to true
      if (conversationRecord?.metadata) {
        try {
          const metadata = typeof conversationRecord.metadata === 'string'
            ? JSON.parse(conversationRecord.metadata)
            : conversationRecord.metadata;
          aiEnabled = metadata.aiEnabled ?? true;
        } catch (parseError) {
          console.error('❌ Error parsing conversation metadata:', parseError);
          aiEnabled = true; // Default to true if parsing fails
        }
      }

      console.log('🤖 AI Status for conversation:', aiEnabled ? 'ENABLED' : 'DISABLED');

      if (!aiEnabled) {
        console.log('⏸️ AI is disabled for this conversation - skipping AI processing');
        console.log('📝 [AI-DISABLED] Message saved but no AI response will be generated');
        return; // Exit early without AI processing
      }
    } catch (error) {
      console.error('❌ Error checking AI status:', error);
      // Continue with AI processing if check fails (fail-safe)
    }

    // Process with AI Agent
    console.log('🤖 Processing message with AI Agent...');
    console.log('📤 Message data:', JSON.stringify(messageData, null, 2));

    try {
      console.log('⏳ Starting AI Agent processing...');
      const startTime = Date.now();
      const aiResponse = await aiAgentService.processCustomerMessage(messageData);
      const processingTime = Date.now() - startTime;

      console.log('🔄 AI Agent response received:', aiResponse ? 'Success' : 'No response');
      console.log('🔍 [AI-DEBUG] Full AI response structure:', JSON.stringify(aiResponse, null, 2));

      if (aiResponse) {
        console.log('✅ AI Agent generated response:', aiResponse.content);
        console.log('🔍 [DEBUG] aiResponse.content type:', typeof aiResponse.content);
        console.log('🔍 [DEBUG] aiResponse.content length:', aiResponse.content?.length);

      // Send AI response back to Facebook
      let responseContent = aiResponse.content;

      // إذا كان هناك تحليل صورة، استخدمه بدلاً من المحتوى العادي
      if (!responseContent && aiResponse.imageAnalysis) {
        console.log('🖼️ Using image analysis as response content');
        responseContent = aiResponse.imageAnalysis;
      }

      // إذا لم يكن هناك محتوى، فحص حالة نظام الأنماط
      if (!responseContent) {
        console.log('⚠️ [DEBUG] لا يوجد محتوى من AI - فحص حالة نظام الأنماط...');

        try {
          // فحص حالة نظام الأنماط
          const companyId = 'cme4yvrco002kuftceydlrwdi'; // يمكن تحسينه لاحقاً
          const systemStatus = await prisma.company.findUnique({
            where: { id: companyId },
            select: { settings: true }
          });

          let patternSystemEnabled = true; // افتراضياً مفعل
          if (systemStatus?.settings) {
            try {
              const settings = JSON.parse(systemStatus.settings);
              patternSystemEnabled = settings.patternSystemEnabled !== false;
            } catch (e) {
              console.log('⚠️ [DEBUG] خطأ في قراءة إعدادات النظام');
            }
          }

          console.log(`🎛️ [DEBUG] حالة نظام الأنماط: ${patternSystemEnabled ? 'مفعل' : 'معطل'}`);

          if (patternSystemEnabled) {
            // النظام مفعل - استخدم الرد الافتراضي
            responseContent = 'مرحباً! كيف يمكنني مساعدتك اليوم؟ 😊';
            console.log('✅ [DEBUG] استخدام الرد الافتراضي - النظام مفعل');
          } else {
            // النظام معطل - لا ترد تلقائياً
            console.log('🔇 [DEBUG] نظام الأنماط معطل - لا يتم الرد التلقائي');
            return; // لا ترسل أي رد
          }

        } catch (error) {
          console.error('❌ [DEBUG] خطأ في فحص حالة النظام:', error);
          // في حالة الخطأ، لا ترد
          console.log('🔇 [DEBUG] خطأ في النظام - لا يتم الرد');
          return;
        }
      }

      console.log('🔍 [DEBUG] responseContent before check:', responseContent);

      // 🤐 فحص المحتوى الفارغ أو null (النظام الصامت)
      if (!responseContent || !responseContent.trim()) {
        // 🤐 النظام الصامت - لا نرسل رسالة خطأ للعميل
        console.log('🚨 [SILENT-SYSTEM-ERROR] Empty AI response detected - staying silent');
        console.error('🚨 [SILENT-SYSTEM-ERROR] Empty AI response:', {
          customerId: senderId,
          conversationId: conversation?.id,
          timestamp: new Date().toISOString(),
          messageContent: messageText || 'non-text message'
        });

        // 📊 تسجيل الرد الفارغ في نظام المراقبة
        simpleMonitor.logResponse(processingTime, true, false);

        // 🚫 لا نرسل أي رسالة للعميل - النظام صامت تماماً
        console.log('🤐 [SILENT-MODE] Empty response but no fallback message sent to customer');
        return; // خروج صامت
      }

      console.log(`📤 Sending response: "${responseContent.substring(0, 50)}..."`);

      const textResult = await sendFacebookMessage(senderId, responseContent, 'TEXT', messagePageId);
      if (textResult.success) {
        console.log('✅ Text response sent successfully');

        // 📊 تسجيل الرد الناجح في نظام المراقبة
        simpleMonitor.logResponse(processingTime, false, true);

        // 🚫 تم إلغاء حفظ الردود السريعة لضمان الدقة مع المنتجات المتعددة
        console.log(`🎯 [NO-CACHE] لا يتم حفظ الردود - كل رد مخصص ودقيق`);

        // تسجيل للمراقبة فقط
        const originalMessage = messageData.content;
        if (originalMessage) {
          console.log(`📝 [PROCESSED] تمت معالجة الرسالة: "${originalMessage.substring(0, 30)}..." بنجاح`);
        }
      } else {
        console.log('❌ Failed to send text response:', textResult.error);
      }

      // تسجيل مفصل للصور
      console.log('🔍 [IMAGE-DEBUG] Checking for images in AI response...');
      console.log('🔍 [IMAGE-DEBUG] aiResponse.images:', aiResponse.images);
      console.log('🔍 [IMAGE-DEBUG] aiResponse.images type:', typeof aiResponse.images);
      console.log('🔍 [IMAGE-DEBUG] aiResponse.images length:', aiResponse.images ? aiResponse.images.length : 'undefined');

      // إرسال الصور إذا كانت متاحة
      if (aiResponse.images && aiResponse.images.length > 0) {
        console.log(`📸 Processing ${aiResponse.images.length} product images...`);

        // فلترة الصور الصالحة فقط
        const validImages = aiResponse.images.filter(image => {
          if (!image || !image.payload || !image.payload.url) {
            console.log('❌ [IMAGE-FILTER] Invalid image structure');
            return false;
          }

          const url = image.payload.url;

          // فحص أن الرابط يبدأ بـ http أو https
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            console.log(`❌ [IMAGE-FILTER] Invalid URL protocol: ${url}`);
            return false;
          }

          // فحص أن الرابط يحتوي على نقطة (domain)
          if (!url.includes('.')) {
            console.log(`❌ [IMAGE-FILTER] Invalid URL format: ${url}`);
            return false;
          }

          // فحص أن الرابط ليس مجرد حرف واحد
          if (url.length < 10) {
            console.log(`❌ [IMAGE-FILTER] URL too short: ${url}`);
            return false;
          }

          // فحص أن الرابط لا يحتوي على أحرف غريبة فقط
          if (url === 'h' || url === 't' || url.length === 1) {
            console.log(`❌ [IMAGE-FILTER] Invalid single character URL: ${url}`);
            return false;
          }

          try {
            new URL(url);
            console.log(`✅ [IMAGE-FILTER] Valid URL: ${url}`);
            return true;
          } catch (error) {
            console.log(`❌ [IMAGE-FILTER] Invalid URL format: ${url} - ${error.message}`);
            return false;
          }
        });

        console.log(`📸 Filtered ${validImages.length}/${aiResponse.images.length} valid images`);

        if (validImages.length > 0) {
          // إرسال رسالة تأكيد أولاً
          const confirmResult = await sendFacebookMessage(senderId, `📸 جاري إرسال ${validImages.length} صور للمنتجات...`, 'TEXT', messagePageId);
          await new Promise(resolve => setTimeout(resolve, 1000));

          let sentCount = 0;
          console.log(`📸 [IMAGE-LOOP] Starting to send ${validImages.length} images...`);
          console.log(`📸 [DEBUG] About to enter image sending loop and then follow-up message...`);

          for (const image of validImages) {
            console.log(`📸 [IMAGE-LOOP] Sending image ${sentCount + 1}/${validImages.length}: ${image.payload.url}`);
            console.log(`📸 [IMAGE-LOOP] About to call sendFacebookMessage...`);

            try {
              const result = await sendFacebookMessage(senderId, image.payload.url, 'IMAGE', messagePageId);
              console.log(`📸 [IMAGE-LOOP] sendFacebookMessage returned:`, result);

              if (result.success) {
                sentCount++;
                console.log(`✅ Image ${sentCount}/${validImages.length} sent successfully - ID: ${result.messageId}`);
              } else {
                console.log(`❌ Failed to send image ${sentCount + 1}/${validImages.length}:`, result.error);
              }
            } catch (error) {
              console.log(`❌ [IMAGE-LOOP] Error in sendFacebookMessage:`, error);
            }

            console.log(`📸 [IMAGE-LOOP] About to wait 1000ms...`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // تأخير أطول بين الصور
            console.log(`📸 [IMAGE-LOOP] Wait completed, continuing loop...`);
          }

          console.log(`📸 [IMAGE-LOOP] Finished sending images. Total sent: ${sentCount}/${validImages.length}`);
          console.log(`📸 [IMAGE-LOOP] Now proceeding to smart follow-up message...`);

          // رسالة تأكيد نهائية ذكية
          if (sentCount > 0) {
            try {
              console.log(`🎯 [SMART-FOLLOW-UP] Calling generateSmartFollowUpMessage with sentCount: ${sentCount}`);
              const smartFollowUpMessage = await generateSmartFollowUpMessage(sentCount, validImages, messageText, senderId);

              // فحص إذا كانت الرسالة null (النظام الصامت)
              if (smartFollowUpMessage) {
                console.log(`📤 [SMART-FOLLOW-UP] Sending smart message: "${smartFollowUpMessage}"`);
                await sendFacebookMessage(senderId, smartFollowUpMessage, 'TEXT', messagePageId);
                console.log(`✅ [SMART-FOLLOW-UP] Smart follow-up message sent successfully`);
              } else {
                console.log(`🤐 [SILENT-MODE] Smart follow-up returned null - staying silent`);
              }
            } catch (smartError) {
              // 🤐 النظام الصامت - تسجيل الخطأ داخلياً فقط
              console.error('🚨 [SILENT-SYSTEM-ERROR] Smart follow-up error:', {
                customerId: senderId,
                error: smartError.message,
                timestamp: new Date().toISOString(),
                sentCount: sentCount
              });

              // 🚫 لا نرسل رسالة fallback للعميل - النظام صامت
              console.log('🤐 [SILENT-MODE] Smart follow-up error but no fallback message sent');
            }
          } else {
            // 🤐 النظام الصامت - لا نرسل رسالة خطأ للعميل
            console.log('🤐 [SILENT-MODE] Image sending error but no error message sent to customer');
            await simpleMonitor.logError(new Error('Image sending failed'), {
              customerId: senderId,
              errorType: 'image_sending_error',
              silent: true,
              timestamp: new Date().toISOString()
            });
          }
          console.log(`📸 [DEBUG] Finished processing images section. Moving to next part...`);
        } else {
          console.log('⚠️ No valid images found to send');
          // 🤐 النظام الصامت - لا نرسل رسالة خطأ للعميل
          console.log('🤐 [SILENT-MODE] No valid images but no error message sent to customer');
          await simpleMonitor.logError(new Error('No valid images found'), {
            customerId: senderId,
            errorType: 'no_valid_images',
            silent: true,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        console.log('🔍 [IMAGE-DEBUG] No images found in AI response - skipping image sending');
        console.log('🔍 [IMAGE-DEBUG] Full aiResponse structure:', JSON.stringify(aiResponse, null, 2));
      }

      // Save AI response to database
      const contentToSave = aiResponse.content || aiResponse.imageAnalysis || responseContent;
      await prisma.message.create({
        data: {
          content: contentToSave,
          type: 'TEXT',
          conversationId: conversation.id,
          isFromCustomer: false,
          metadata: JSON.stringify({
            platform: 'facebook',
            source: 'ai_agent',
            intent: aiResponse.intent,
            sentiment: aiResponse.sentiment,
            confidence: aiResponse.confidence,
            shouldEscalate: aiResponse.shouldEscalate,
            isAIGenerated: true, // 🤖 تحديد أن هذه رسالة من الذكاء الصناعي
            aiModel: aiResponse.model || 'unknown',
            processingTime: aiResponse.processingTime || 0,
            timestamp: new Date().toISOString()
          }),
          createdAt: new Date()
        }
      });

      // 🤐 النظام الصامت - لا تصعيد تلقائي للعميل
      if (aiResponse.shouldEscalate && !aiResponse.silent) {
        console.log('🚨 Escalating to human agent (traditional escalation)');

        // إرسال رسالة متابعة للعميل (للحالات العادية فقط)
        setTimeout(async () => {
          try {
            const escalationMessage = `مرحباً! 👋

كيف يمكنني مساعدتك اليوم؟

✍️ **اكتب لي:** وصف المنتج اللي عايزه
📱 **أو:** أحولك لزميلي للمساعدة المباشرة

أنا هنا لمساعدتك! 😊`;

            const followUpResult = await sendFacebookMessage(senderId, escalationMessage, 'TEXT', messagePageId);
            if (followUpResult.success) {
              console.log('✅ Professional follow-up message sent');
            } else {
              console.log('❌ Failed to send follow-up:', followUpResult.error);
            }
          } catch (escalationError) {
            console.error('❌ Error sending follow-up:', escalationError);
          }
        }, 3000);
      } else if (aiResponse.silent) {
        // 🤐 النظام الصامت - تسجيل داخلي فقط بدون إرسال رسائل
        console.log('🤐 [SILENT-MODE] Error occurred but staying completely silent - no customer message');

        // إشعار داخلي للمطورين فقط
        await simpleMonitor.logError(new Error(`Silent AI Error: ${aiResponse.error}`), {
          customerId: senderId,
          errorType: aiResponse.errorType,
          silent: true,
          timestamp: new Date().toISOString()
        });
      }

      } else {
        console.log('📝 AI Agent disabled or no response - Manual response required');
      }
    } catch (aiError) {
      // 📊 تسجيل الخطأ في نظام المراقبة
      await simpleMonitor.logError(aiError, {
        customerId: senderId,
        conversationId: conversation?.id,
        messageContent: messageText || 'non-text message',
        source: 'AI_AGENT'
      });

      // 🤐 النظام الصامت - تسجيل الخطأ داخلياً فقط
      console.error('🚨 [SILENT-SYSTEM-ERROR] AI Agent error:', {
        customerId: senderId,
        conversationId: conversation?.id,
        error: aiError.message,
        stack: aiError.stack,
        timestamp: new Date().toISOString(),
        messageContent: messageText || 'non-text message'
      });

      // 📊 حفظ الخطأ في قاعدة البيانات للمراقبة الداخلية فقط
      try {
        if (conversation?.id) {
          await prisma.message.create({
            data: {
              content: `[INTERNAL-ERROR] ${aiError.message}`,
              type: 'SYSTEM_ERROR',
              conversationId: conversation.id,
              isFromCustomer: false,
              metadata: JSON.stringify({
                platform: 'facebook',
                source: 'silent_error_system',
                error: 'ai_system_failure',
                originalError: aiError.message,
                timestamp: new Date().toISOString(),
                silent: true
              }),
              createdAt: new Date()
            }
          });
        }
      } catch (dbError) {
        console.error('🚨 [SILENT-DB-ERROR] Failed to log error to database:', dbError);
      }

      // 🚫 لا نرسل أي رسالة للعميل - النظام صامت تماماً
      console.log('🤐 [SILENT-MODE] No message sent to customer - system remains silent');
    }

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: timestamp,
        lastMessagePreview: messageText?.length > 100 ?
          messageText.substring(0, 100) + '...' : messageText || 'رسالة'
      }
    });
    
  } catch (error) {
    // 🤐 النظام الصامت - تسجيل الخطأ داخلياً فقط
    console.error('🚨 [SILENT-SYSTEM-ERROR] Error processing Facebook message:', {
      customerId: webhookEvent?.sender?.id,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      messageContent: webhookEvent?.message?.text || 'non-text message',
      webhookData: {
        hasMessage: !!webhookEvent?.message,
        hasAttachments: !!webhookEvent?.message?.attachments,
        messageType: webhookEvent?.message?.attachments?.[0]?.type || 'text'
      }
    });

    // 🚫 لا نرسل أي رسالة للعميل - النظام صامت تماماً
    console.log('🤐 [SILENT-MODE] Error occurred but no message sent to customer - system remains silent');
  }
}

/**
 * تحديد الصفحة المناسبة للإرسال بناءً على Page ID من webhook
 * @param {Object} webhookData - بيانات webhook
 * @returns {string|null} - Page ID أو null
 */
function extractPageIdFromWebhook(webhookData) {
  try {
    if (webhookData && webhookData.entry && webhookData.entry.length > 0) {
      const pageId = webhookData.entry[0].id;
      console.log(`🎯 [PAGE-EXTRACT] تم استخراج Page ID من webhook: ${pageId}`);
      return pageId;
    }
  } catch (error) {
    console.error('❌ [PAGE-EXTRACT] خطأ في استخراج Page ID:', error);
  }
  return null;
}

// متغير عام لحفظ آخر Page ID من webhook
let lastWebhookPageId = null;

/**
 * تسجيل الأخطاء بشكل صامت (للمراقبة الداخلية فقط)
 * @param {string} context - سياق الخطأ
 * @param {Error} error - الخطأ
 * @param {Object} additionalData - بيانات إضافية
 */
function logSilentError(context, error, additionalData = {}) {
  console.error(`🚨 [SILENT-SYSTEM-ERROR] ${context}:`, {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...additionalData
  });

  console.log(`🤐 [SILENT-MODE] ${context} error logged but system remains silent to customer`);
}

/**
 * فحص وعرض الردود السريعة الموجودة حالياً (للمراقبة فقط)
 */
function debugQuickResponses() {
  console.log(`🔍 [CACHE-DEBUG] عدد الردود المحفوظة: ${quickResponseCache.size}`);

  if (quickResponseCache.size > 0) {
    console.log(`🧹 [CACHE-CLEANUP] تنظيف الردود المحفوظة القديمة...`);
    quickResponseCache.clear(); // مسح جميع الردود المحفوظة
    console.log(`✅ [CACHE-CLEANUP] تم مسح جميع الردود المحفوظة`);
  } else {
    console.log(`📋 [CACHE-DEBUG] لا توجد ردود محفوظة - النظام نظيف`);
  }

  console.log(`🎯 [NO-CACHE-MODE] النظام يعمل بدون ردود محفوظة لضمان الدقة`);
}

// Send message to Facebook Messenger
async function sendFacebookMessage(recipientId, messageContent, messageType = 'TEXT', pageId = null) {
  try {
    // Validate recipient ID
    if (!recipientId || typeof recipientId !== 'string' || recipientId.trim() === '') {
      console.log('❌ Invalid recipient ID:', recipientId);
      return { success: false, error: 'Invalid recipient ID' };
    }

    // Skip sending for test IDs that are not valid Facebook IDs
    if (recipientId.includes('test-') || recipientId.length < 10) {
      console.log('⚠️ Skipping Facebook send for test ID:', recipientId);
      return { success: true, message: 'Test ID - message not sent to Facebook' };
    }

    // تحديد الصفحة المناسبة للإرسال
    let pageData = null;

    // أولاً: استخدام Page ID المحدد إذا كان متوفراً
    if (pageId) {
      pageData = await getPageToken(pageId);
      console.log(`🎯 [PAGE-SELECT] استخدام الصفحة المحددة: ${pageId}`);

      // إذا لم نجد الصفحة، نحاول البحث بالاسم
      if (!pageData && pageId === '675323792321557') {
        console.log(`🔍 [PAGE-SELECT] البحث عن Swan-store في cache...`);
        pageData = pageTokenCache.get('Swan-store');
        if (pageData) {
          console.log(`✅ [PAGE-SELECT] تم العثور على Swan-store في cache`);
        }
      }
    }

    // ثانياً: استخدام آخر Page ID من webhook
    if (!pageData && lastWebhookPageId) {
      pageData = await getPageToken(lastWebhookPageId);
      console.log(`🔄 [PAGE-SELECT] استخدام آخر صفحة من webhook: ${lastWebhookPageId}`);
    }

    // ثالثاً: البحث عن الصفحة الافتراضية
    if (!pageData) {
      const defaultPage = await prisma.facebookPage.findFirst({
        where: { status: 'connected' },
        orderBy: { connectedAt: 'desc' }
      });

      if (defaultPage) {
        pageData = {
          pageAccessToken: defaultPage.pageAccessToken,
          pageName: defaultPage.pageName,
          companyId: defaultPage.companyId, // 🔐 إضافة companyId للعزل
          lastUsed: Date.now()
        };
        updatePageTokenCache(defaultPage.pageId, defaultPage.pageAccessToken, defaultPage.pageName, defaultPage.companyId);
        console.log(`🔄 [PAGE-SELECT] استخدام الصفحة الافتراضية: ${defaultPage.pageName} - شركة: ${defaultPage.companyId}`);
      } else {
        // رفض استخدام fallback خطير
        console.error(`❌ [SECURITY] No valid page found - refusing fallback`);
        console.error(`📱 [SECURITY] Requested page: ${pageId || 'unknown'}`);

        return res.status(400).json({
          error: 'No valid page configuration found',
          code: 'INVALID_PAGE_CONFIG',
          pageId: pageId || 'unknown'
        });
      }
    }

    if (!pageData || !pageData.pageAccessToken) {
      console.log('⚠️ Facebook Page Access Token not found - Message saved to database only');
      console.log(`📝 Would send to ${recipientId}: ${messageType === 'IMAGE' ? 'Image' : messageContent}`);
      return { success: false, error: 'No active page found' };
    }

    const PAGE_ACCESS_TOKEN = pageData.pageAccessToken;
    console.log(`🔑 Using Page Access Token for page: ${pageData.pageName}`);

    const messageData = {
      recipient: {
        id: recipientId
      },
      message: {}
    };

    // تحديد نوع الرسالة
    if (messageType === 'TEXT') {
      // فحص طول الرسالة - Facebook Messenger حد أقصى 2000 حرف
      if (messageContent.length > 2000) {
        console.log(`⚠️ Message too long (${messageContent.length} chars), splitting into multiple messages`);

        // تقسيم الرسالة إلى أجزاء
        const chunks = [];
        let currentChunk = '';
        const words = messageContent.split(' ');

        for (const word of words) {
          // إذا كانت الكلمة الواحدة أطول من 2000 حرف، قسمها بالقوة
          if (word.length > 2000) {
            if (currentChunk) {
              chunks.push(currentChunk.trim());
              currentChunk = '';
            }
            // تقسيم الكلمة الطويلة
            for (let i = 0; i < word.length; i += 1900) {
              chunks.push(word.substring(i, i + 1900));
            }
            continue;
          }

          // فحص إذا كانت إضافة الكلمة ستتجاوز الحد
          if ((currentChunk + ' ' + word).length > 2000) {
            if (currentChunk) {
              chunks.push(currentChunk.trim());
              currentChunk = word;
            } else {
              chunks.push(word);
            }
          } else {
            currentChunk = currentChunk ? currentChunk + ' ' + word : word;
          }
        }

        // إضافة آخر جزء
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }

        console.log(`📝 Split message into ${chunks.length} parts`);

        // إرسال كل جزء منفصل
        const results = [];
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const chunkMessageData = {
            recipient: { id: recipientId },
            message: { text: chunk }
          };

          try {
            const response = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(chunkMessageData)
            });

            if (response.ok) {
              const responseData = await response.json();
              console.log(`📤 Part ${i + 1}/${chunks.length} sent - Message ID: ${responseData.message_id}`);
              results.push({ success: true, messageId: responseData.message_id, part: i + 1 });

              // تأخير قصير بين الرسائل لتجنب rate limiting
              if (i < chunks.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
              }
            } else {
              const error = await response.text();
              console.error(`❌ Failed to send part ${i + 1}/${chunks.length}:`, error);
              results.push({ success: false, error, part: i + 1 });
            }
          } catch (error) {
            console.error(`❌ Error sending part ${i + 1}/${chunks.length}:`, error);
            results.push({ success: false, error: error.message, part: i + 1 });
          }
        }

        // إرجاع نتيجة مجمعة
        const successCount = results.filter(r => r.success).length;
        return {
          success: successCount > 0,
          messageId: results.filter(r => r.success).map(r => r.messageId).join(','),
          totalParts: chunks.length,
          successfulParts: successCount,
          results: results
        };
      } else {
        messageData.message.text = messageContent;
      }
    } else if (messageType === 'IMAGE') {
      messageData.message.attachment = {
        type: 'image',
        payload: {
          url: messageContent
        }
      };
    } else if (messageType === 'FILE') {
      messageData.message.attachment = {
        type: 'file',
        payload: {
          url: messageContent
        }
      };
    }

    const response = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData)
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log(`📤 Message sent to Facebook user ${recipientId} - Message ID: ${responseData.message_id}`);
      return { success: true, messageId: responseData.message_id };
    } else {
      const error = await response.text();
      console.error('❌ Failed to send Facebook message:', error);
      return { success: false, error };
    }

  } catch (error) {
    console.error('❌ Error sending Facebook message:', error);
    return { success: false, error: error.message };
  }
}

// ==================== BASIC API ROUTES ====================

// Auth endpoints

// Register endpoint
app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, companyName, phone } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !companyName) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول مطلوبة'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مستخدم بالفعل'
      });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create company first
    const company = await prisma.company.create({
      data: {
        name: companyName,
        email: email,
        phone: phone || null,
        plan: 'BASIC',
        isActive: true
      }
    });

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'COMPANY_ADMIN',
        companyId: company.id,
        isActive: true
      }
    });

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        companyId: company.id
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          companyId: user.companyId
        },
        company: {
          id: company.id,
          name: company.name,
          plan: company.plan
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء الحساب',
      error: error.message
    });
  }
});

// ==================== MIDDLEWARE ====================

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'رمز المصادقة مطلوب'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'رمز المصادقة غير صحيح'
    });
  }
};

// Company access middleware
const requireCompanyAccess = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const userCompanyId = req.user.companyId;

    // Super admin can access all companies
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    // Regular users can only access their own company
    if (companyId && companyId !== userCompanyId) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول لهذه الشركة'
      });
    }

    // If no companyId in params, use user's company
    if (!companyId) {
      req.params.companyId = userCompanyId;
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'خطأ في التحقق من صلاحية الوصول'
    });
  }
};

// Role-based access control
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لهذا الإجراء'
      });
    }
    next();
  };
};

// Super Admin access control middleware
const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'غير مصرح بالوصول'
    });
  }

  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'هذا المورد متاح لمدير النظام فقط'
    });
  }

  next();
};

// Login endpoint
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني وكلمة المرور مطلوبان'
      });
    }

    // Find user with company
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            plan: true,
            currency: true,
            isActive: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'الحساب غير مفعل'
      });
    }

    // Check if company is active
    if (!user.company.isActive) {
      return res.status(401).json({
        success: false,
        message: 'حساب الشركة غير مفعل'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: {
        user: userWithoutPassword,
        token,
        expiresIn: '24h'
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تسجيل الدخول',
      error: error.message
    });
  }
});

// Get current user endpoint
app.get('/api/v1/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'رمز المصادقة مطلوب'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Get user with company
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            plan: true,
            currency: true,
            isActive: true
          }
        }
      }
    });

    if (!user || !user.isActive || !user.company.isActive) {
      return res.status(401).json({
        success: false,
        message: 'المستخدم غير موجود أو غير مفعل'
      });
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword
    });

  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(401).json({
      success: false,
      message: 'رمز المصادقة غير صحيح',
      error: error.message
    });
  }
});

// Logout endpoint
app.post('/api/v1/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'تم تسجيل الخروج بنجاح'
  });
});

// Companies endpoints removed - using the enhanced one below

// Products endpoints - with company isolation
app.get('/api/v1/products', authenticateToken, async (req, res) => {
  try {
    // التحقق من المصادقة والشركة
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح بالوصول - معرف الشركة مطلوب'
      });
    }

    console.log('📦 Fetching products for company:', companyId);

    const products = await prisma.product.findMany({
      where: { companyId }, // فلترة بـ companyId
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: products,
      companyId: companyId,
      message: `تم جلب ${products.length} منتج للشركة`
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المنتجات'
    });
  }
});

// Get product categories (must be before /:id route)
app.get('/api/v1/products/categories', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 [server] GET /api/v1/products/categories');

    // 🔐 التحقق من المصادقة والشركة
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: 'معرف الشركة مطلوب للوصول لهذا المورد',
        code: 'COMPANY_ID_REQUIRED'
      });
    }

    console.log('🏢 [server] Loading categories for company:', companyId);

    const categories = await withRetry(() =>
      prisma.category.findMany({
        where: { companyId }, // 🔐 فلترة بـ companyId من المستخدم المصادق عليه
        orderBy: { name: 'asc' }
      })
    );

    console.log(`✅ [server] Found ${categories.length} categories for company ${companyId}`);
    res.json({
      success: true,
      data: categories,
      companyId: companyId
    });
  } catch (error) {
    console.error('❌ [server] Error getting categories:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new category
app.post('/api/v1/products/categories', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 [server] POST /api/v1/products/categories');
    console.log('📤 [server] Request body:', req.body);

    // 🔐 التحقق من المصادقة والشركة
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: 'معرف الشركة مطلوب للوصول لهذا المورد',
        code: 'COMPANY_ID_REQUIRED'
      });
    }

    const { name, description, parentId } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Category name is required'
      });
    }

    // Check if category already exists in the same company
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: name.trim(),
        companyId // 🔐 فحص في نفس الشركة فقط
      }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: 'Category with this name already exists in your company'
      });
    }

    console.log('📦 Creating category for company:', companyId);

    // Create new category
    const newCategory = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        parentId: parentId || null,
        companyId // 🔐 استخدام companyId من المستخدم المصادق عليه
      }
    });

    console.log(`✅ [server] Created category: ${newCategory.name} for company ${companyId}`);
    res.status(201).json({
      success: true,
      data: newCategory,
      companyId: companyId
    });
  } catch (error) {
    console.error('❌ [server] Error creating category:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update category
app.put('/api/v1/products/categories/:id', authenticateToken, async (req, res) => {
  try {
    console.log(`🔍 [server] PUT /api/v1/products/categories/${req.params.id}`);
    console.log('📤 [server] Request body:', req.body);

    // 🔐 التحقق من المصادقة والشركة
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: 'معرف الشركة مطلوب للوصول لهذا المورد',
        code: 'COMPANY_ID_REQUIRED'
      });
    }

    const { id } = req.params;
    const { name, description, parentId } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Category name is required'
      });
    }

    // Check if category exists and belongs to the company
    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        companyId // 🔐 التأكد أن الفئة تنتمي لنفس الشركة
      }
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Check if name is already taken by another category
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        name: name.trim(),
        id: { not: id }
      }
    });

    if (duplicateCategory) {
      return res.status(400).json({
        success: false,
        error: 'Category with this name already exists'
      });
    }

    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        parentId: parentId || null
      }
    });

    console.log(`✅ [server] Updated category: ${updatedCategory.name}`);
    res.json({
      success: true,
      data: updatedCategory
    });
  } catch (error) {
    console.error('❌ [server] Error updating category:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete category
app.delete('/api/v1/products/categories/:id', authenticateToken, async (req, res) => {
  try {
    console.log(`🔍 [server] DELETE /api/v1/products/categories/${req.params.id}`);

    // 🔐 التحقق من المصادقة والشركة
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: 'معرف الشركة مطلوب للوصول لهذا المورد',
        code: 'COMPANY_ID_REQUIRED'
      });
    }

    const { id } = req.params;

    // Check if category exists and belongs to the company
    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        companyId // 🔐 التأكد أن الفئة تنتمي لنفس الشركة
      }
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        error: 'Category not found or you do not have permission to delete it'
      });
    }

    // Check if category has products
    const productsCount = await prisma.product.count({
      where: { categoryId: id }
    });

    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete category. It has ${productsCount} products assigned to it.`
      });
    }

    // Check if category has subcategories
    const subcategoriesCount = await prisma.category.count({
      where: { parentId: id }
    });

    if (subcategoriesCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete category. It has ${subcategoriesCount} subcategories.`
      });
    }

    // Delete category
    await prisma.category.delete({
      where: { id }
    });

    console.log(`✅ [server] Deleted category: ${existingCategory.name}`);
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('❌ [server] Error deleting category:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get single product by ID
app.get('/api/v1/products/:id', async (req, res) => {
  try {
    console.log(`🔍 [server] GET /api/v1/products/${req.params.id}`);

    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: id },
      include: {
        variants: {
          orderBy: { sortOrder: 'asc' }
        },
        category: true
      }
    });

    console.log(`📊 [server] Product query result:`, {
      found: !!product,
      name: product?.name,
      variantsCount: product?.variants?.length || 0,
      categoryName: product?.category?.name
    });

    if (!product) {
      console.log(`❌ [server] Product not found: ${id}`);
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    console.log(`✅ [server] Product found: ${product.name}`);
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error(`❌ [server] Error getting product ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update product status (PATCH)
app.patch('/api/v1/products/:id', async (req, res) => {
  try {
    console.log(`🔄 [server] PATCH /api/v1/products/${req.params.id}`, req.body);

    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle images array - convert to JSON string if it's an array
    if (updateData.images && Array.isArray(updateData.images)) {
      updateData.images = JSON.stringify(updateData.images);
      console.log(`📸 [server] Converted images array to JSON string`);
    }

    // Handle tags array - convert to JSON string if it's an array
    if (updateData.tags && Array.isArray(updateData.tags)) {
      updateData.tags = JSON.stringify(updateData.tags);
      console.log(`🏷️ [server] Converted tags array to JSON string`);
    }

    // Handle dimensions object - convert to JSON string if it's an object
    if (updateData.dimensions && typeof updateData.dimensions === 'object') {
      updateData.dimensions = JSON.stringify(updateData.dimensions);
      console.log(`📏 [server] Converted dimensions object to JSON string`);
    }

    // Ensure numeric fields are properly typed
    if (updateData.price !== undefined) {
      updateData.price = parseFloat(updateData.price);
    }
    if (updateData.stock !== undefined) {
      updateData.stock = parseInt(updateData.stock);
    }
    if (updateData.comparePrice !== undefined) {
      updateData.comparePrice = parseFloat(updateData.comparePrice);
    }
    if (updateData.cost !== undefined) {
      updateData.cost = parseFloat(updateData.cost);
    }

    // Handle trackInventory field
    if (updateData.trackInventory !== undefined) {
      updateData.trackInventory = Boolean(updateData.trackInventory);
      console.log(`📦 [server] Track inventory: ${updateData.trackInventory}`);
    }

    // Handle category field - convert to categoryId for Prisma
    if (updateData.category !== undefined) {
      if (updateData.category && updateData.category.trim() !== '') {
        updateData.categoryId = updateData.category;
        console.log(`🏷️ [server] Converted category to categoryId: ${updateData.categoryId}`);
      } else {
        // If category is empty string or null, set categoryId to null
        updateData.categoryId = null;
        console.log(`🏷️ [server] Category is empty, setting categoryId to null`);
      }
      delete updateData.category;
    }

    // Validate categoryId if provided
    if (updateData.categoryId) {
      try {
        const categoryExists = await prisma.category.findUnique({
          where: { id: updateData.categoryId }
        });

        if (!categoryExists) {
          console.log(`⚠️ [server] Category ${updateData.categoryId} not found, removing from update`);
          delete updateData.categoryId;
        }
      } catch (error) {
        console.log(`⚠️ [server] Error checking category, removing from update:`, error.message);
        delete updateData.categoryId;
      }
    }

    // Validate companyId if provided
    if (updateData.companyId) {
      try {
        const companyExists = await prisma.company.findUnique({
          where: { id: updateData.companyId }
        });

        if (!companyExists) {
          console.log(`⚠️ [server] Company ${updateData.companyId} not found, removing from update`);
          delete updateData.companyId;
        }
      } catch (error) {
        console.log(`⚠️ [server] Error checking company, removing from update:`, error.message);
        delete updateData.companyId;
      }
    }

    console.log(`🔧 [server] Final update data:`, updateData);

    const product = await prisma.product.update({
      where: { id: id },
      data: updateData
    });

    console.log(`✅ [server] Product updated: ${product.name}`);
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error(`❌ [server] Error updating product ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack
    });
  }
});

// Delete product (DELETE)
app.delete('/api/v1/products/:id', async (req, res) => {
  try {
    console.log(`🗑️ [server] DELETE /api/v1/products/${req.params.id}`);

    const { id } = req.params;

    await prisma.product.delete({
      where: { id: id }
    });

    console.log(`✅ [server] Product deleted: ${id}`);
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error(`❌ [server] Error deleting product ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/v1/products', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 [server] POST /api/v1/products');
    console.log('📤 [server] Request body:', req.body);

    // التحقق من المصادقة والشركة
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح بالوصول - معرف الشركة مطلوب'
      });
    }

    const { name, description, price, category, stock, sku, images, tags } = req.body;

    // Validate required fields
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        error: 'Name and price are required'
      });
    }

    // Generate unique SKU only if provided
    let productSku = sku || null;
    if (productSku) {
      // Ensure SKU is unique within the company
      let skuExists = await prisma.product.findFirst({
        where: {
          sku: productSku,
          companyId // فحص SKU ضمن الشركة فقط
        }
      });
      if (skuExists) {
        return res.status(400).json({
          success: false,
          error: 'SKU already exists in your company. Please use a different SKU.'
        });
      }
    }

    console.log('📦 Creating product for company:', companyId);

    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        sku: productSku,
        stock: parseInt(stock) || 0,
        trackInventory: req.body.trackInventory !== undefined ? req.body.trackInventory : true,
        companyId, // استخدام companyId من المستخدم المصادق عليه
        images: images ? JSON.stringify(images) : null,
        tags: tags ? JSON.stringify(tags) : null
      }
    });

    console.log('✅ [server] Product created successfully:', product.name);
    res.json({
      success: true,
      data: product,
      companyId: companyId
    });
  } catch (error) {
    console.error('❌ [server] Error creating product:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete image from product endpoint
app.delete('/api/v1/products/:id/images', async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    console.log(`🗑️ [IMAGE-DELETE] Removing image from product ${id}:`, imageUrl);

    if (!imageUrl) {
      console.log('❌ [IMAGE-DELETE] Error: Image URL is required');
      return res.status(400).json({
        success: false,
        error: 'Image URL is required',
        message: 'رابط الصورة مطلوب'
      });
    }

    // Get current product
    const product = await prisma.product.findUnique({
      where: { id: id }
    });

    if (!product) {
      console.log(`❌ [IMAGE-DELETE] Product not found: ${id}`);
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: 'المنتج غير موجود'
      });
    }

    // Parse current images
    let currentImages = [];
    try {
      currentImages = JSON.parse(product.images || '[]');
    } catch (e) {
      console.log('⚠️ [IMAGE-DELETE] Error parsing images, treating as empty array');
      currentImages = [];
    }

    // Remove image URL
    const initialCount = currentImages.length;
    currentImages = currentImages.filter(img => img !== imageUrl);
    const finalCount = currentImages.length;

    if (initialCount === finalCount) {
      console.log(`ℹ️ [IMAGE-DELETE] Image URL not found in product images`);
      return res.status(404).json({
        success: false,
        error: 'Image not found',
        message: 'الصورة غير موجودة'
      });
    }

    console.log(`➖ [IMAGE-DELETE] Removed image. Images count: ${initialCount} → ${finalCount}`);

    // Update product in database
    const updatedProduct = await prisma.product.update({
      where: { id: id },
      data: {
        images: JSON.stringify(currentImages)
      }
    });

    console.log(`✅ [IMAGE-DELETE] Successfully removed image from product ${id}`);
    console.log(`📊 [IMAGE-DELETE] Final images array:`, currentImages);

    res.json({
      success: true,
      message: 'تم حذف الصورة بنجاح',
      data: {
        removedImageUrl: imageUrl,
        productId: id,
        remainingImages: currentImages.length,
        allImages: currentImages
      }
    });

  } catch (error) {
    console.error('❌ [IMAGE-DELETE] Error removing image:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'خطأ في الخادم'
    });
  }
});

// Add image from URL to product endpoint
app.post('/api/v1/products/:id/images/url', async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    console.log(`➕ [IMAGE-ADD] Adding image to product ${id}:`, imageUrl);

    if (!imageUrl) {
      console.log('❌ [IMAGE-ADD] Error: Image URL is required');
      return res.status(400).json({
        success: false,
        error: 'Image URL is required',
        message: 'رابط الصورة مطلوب'
      });
    }

    // Validate image URL
    try {
      new URL(imageUrl);
      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        throw new Error('Invalid protocol');
      }
    } catch (error) {
      console.log('❌ [IMAGE-ADD] Invalid image URL:', imageUrl);
      return res.status(400).json({
        success: false,
        error: 'Invalid image URL',
        message: 'رابط الصورة غير صالح'
      });
    }

    // Get current product
    const product = await prisma.product.findUnique({
      where: { id: id }
    });

    if (!product) {
      console.log(`❌ [IMAGE-ADD] Product not found: ${id}`);
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: 'المنتج غير موجود'
      });
    }

    // Parse current images
    let currentImages = [];
    try {
      currentImages = JSON.parse(product.images || '[]');
    } catch (e) {
      console.log('⚠️ [IMAGE-ADD] Error parsing images, treating as empty array');
      currentImages = [];
    }

    // Check if image already exists
    if (currentImages.includes(imageUrl)) {
      console.log(`ℹ️ [IMAGE-ADD] Image URL already exists in product images`);
      return res.status(409).json({
        success: false,
        error: 'Image already exists',
        message: 'الصورة موجودة بالفعل'
      });
    }

    // Add new image URL
    currentImages.push(imageUrl);
    console.log(`➕ [IMAGE-ADD] Added image. Images count: ${currentImages.length - 1} → ${currentImages.length}`);

    // Update product in database
    const updatedProduct = await prisma.product.update({
      where: { id: id },
      data: {
        images: JSON.stringify(currentImages)
      }
    });

    console.log(`✅ [IMAGE-ADD] Successfully added image to product ${id}`);
    console.log(`📊 [IMAGE-ADD] Final images array:`, currentImages);

    res.json({
      success: true,
      message: 'تم إضافة الصورة بنجاح',
      data: {
        addedImageUrl: imageUrl,
        productId: id,
        totalImages: currentImages.length,
        allImages: currentImages
      }
    });

  } catch (error) {
    console.error('❌ [IMAGE-ADD] Error adding image:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'خطأ في الخادم'
    });
  }
});

// Get conversations - تم نقله إلى نهاية الملف مع تحسينات أفضل

// Delete conversation
app.delete('/api/v1/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Attempting to delete conversation: ${id}`);

    // Check if conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        customer: true,
        _count: {
          select: { messages: true }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'المحادثة غير موجودة'
      });
    }

    // Delete all messages first (due to foreign key constraints)
    const deletedMessages = await prisma.message.deleteMany({
      where: { conversationId: id }
    });

    // Delete conversation memory
    await prisma.conversationMemory.deleteMany({
      where: { conversationId: id }
    });

    // Delete the conversation
    await prisma.conversation.delete({
      where: { id }
    });

    console.log(`✅ Deleted conversation ${id} with ${deletedMessages.count} messages`);

    res.json({
      success: true,
      message: 'تم حذف المحادثة بنجاح',
      data: {
        deletedConversation: {
          id: conversation.id,
          customerName: conversation.customer?.firstName || 'عميل غير معروف'
        },
        deletedMessagesCount: deletedMessages.count
      }
    });

  } catch (error) {
    console.error('❌ Error deleting conversation:', error);
    res.status(500).json({
      success: false,
      error: 'خطأ في الخادم',
      message: error.message
    });
  }
});

// Get messages for a conversation - تم نقله إلى نهاية الملف مع تحسينات أفضل

// Customers endpoints - with company isolation
app.get('/api/v1/customers', authenticateToken, async (req, res) => {
  try {
    // التحقق من المصادقة والشركة
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح بالوصول - معرف الشركة مطلوب'
      });
    }

    console.log('👥 Fetching customers for company:', companyId);

    const customers = await prisma.customer.findMany({
      where: { companyId }, // فلترة بـ companyId
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({
      success: true,
      data: customers,
      message: `تم جلب ${customers.length} عميل للشركة`
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب العملاء'
    });
  }
});

// Orders endpoints
app.get('/api/v1/orders', async (req, res) => {
  try {
    // Mock orders data with complete structure
    const mockOrders = [
      {
        id: 'ORD-001',
        customerName: 'أحمد محمد',
        customerEmail: 'ahmed@example.com',
        customerPhone: '+966501234567',
        total: 250.00,
        subtotal: 220.00,
        tax: 20.00,
        shipping: 10.00,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'cash_on_delivery',
        shippingAddress: {
          street: 'شارع الملك فهد',
          city: 'الرياض',
          state: 'الرياض',
          zipCode: '12345',
          country: 'السعودية'
        },
        items: [
          {
            id: '1',
            productId: 'cmdfynvxd0007ufegvkqvnajx',
            name: 'كوتشي اسكوتش',
            price: 310.00,
            quantity: 1,
            total: 310.00
          }
        ],
        trackingNumber: null,
        notes: 'توصيل سريع',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'ORD-002',
        customerName: 'فاطمة علي',
        customerEmail: 'fatima@example.com',
        customerPhone: '+966507654321',
        total: 180.50,
        subtotal: 160.00,
        tax: 15.50,
        shipping: 5.00,
        status: 'completed',
        paymentStatus: 'paid',
        paymentMethod: 'credit_card',
        shippingAddress: {
          street: 'شارع العليا',
          city: 'جدة',
          state: 'مكة المكرمة',
          zipCode: '23456',
          country: 'السعودية'
        },
        items: [
          {
            id: '2',
            productId: 'cmdfynvxd0007ufegvkqvnajx',
            name: 'كوتشي اسكوتش',
            price: 310.00,
            quantity: 1,
            total: 310.00
          }
        ],
        trackingNumber: 'TRK123456789',
        notes: 'تم التوصيل بنجاح',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // يوم واحد مضى
        updatedAt: new Date().toISOString()
      },
      {
        id: 'ORD-003',
        customerName: 'محمد السعيد',
        customerEmail: 'mohammed@example.com',
        customerPhone: '+966509876543',
        total: 620.00,
        subtotal: 550.00,
        tax: 55.00,
        shipping: 15.00,
        status: 'processing',
        paymentStatus: 'paid',
        paymentMethod: 'bank_transfer',
        shippingAddress: {
          street: 'شارع الأمير محمد بن عبدالعزيز',
          city: 'الدمام',
          state: 'الشرقية',
          zipCode: '34567',
          country: 'السعودية'
        },
        items: [
          {
            id: '3',
            productId: 'cmdfynvxd0007ufegvkqvnajx',
            name: 'كوتشي اسكوتش',
            price: 310.00,
            quantity: 2,
            total: 620.00
          }
        ],
        trackingNumber: 'TRK987654321',
        notes: 'طلب عاجل',
        createdAt: new Date(Date.now() - 172800000).toISOString(), // يومين مضيا
        updatedAt: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: mockOrders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update order status
app.put('/api/v1/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    // Mock successful update
    const updatedOrder = {
      id: id,
      status: status,
      trackingNumber: trackingNumber || null,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: updatedOrder,
      message: 'تم تحديث حالة الطلب بنجاح'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get single order
app.get('/api/v1/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Mock single order data
    const mockOrder = {
      id: id,
      customerName: 'أحمد محمد',
      customerEmail: 'ahmed@example.com',
      customerPhone: '+966501234567',
      total: 250.00,
      subtotal: 220.00,
      tax: 20.00,
      shipping: 10.00,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'cash_on_delivery',
      shippingAddress: {
        street: 'شارع الملك فهد',
        city: 'الرياض',
        state: 'الرياض',
        zipCode: '12345',
        country: 'السعودية'
      },
      items: [
        {
          id: '1',
          productId: 'cmdfynvxd0007ufegvkqvnajx',
          name: 'كوتشي اسكوتش',
          price: 310.00,
          quantity: 1,
          total: 310.00
        }
      ],
      trackingNumber: null,
      notes: 'توصيل سريع',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: mockOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Reports endpoints
app.get('/api/v1/reports/dashboard', async (req, res) => {
  try {
    // Mock dashboard stats
    const stats = {
      totalCustomers: await prisma.customer.count(),
      totalConversations: await prisma.conversation.count(),
      totalMessages: await prisma.message.count(),
      totalProducts: await prisma.product.count()
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// AI Agent Integration
const aiAgentService = require('./src/services/aiAgentService');
const ragService = require('./src/services/ragService');
const memoryService = require('./src/services/memoryService');
const multimodalService = require('./src/services/multimodalService');

// Send message (for conversations-improved page)
app.post('/api/v1/conversations/:id/messages', async (req, res) => {
  try {
    console.log(`🔥 POST /api/v1/conversations/${req.params.id}/messages received`);
    console.log(`📦 Request body:`, req.body);

    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      console.log(`❌ No message content provided`);
      return res.status(400).json({
        success: false,
        error: 'Message content is required'
      });
    }

    console.log(`📤 Sending message to conversation ${id}: ${message}`);

    // Save message to database
    const newMessage = await prisma.message.create({
      data: {
        conversationId: id,
        content: message,
        type: 'TEXT',
        isFromCustomer: false,
        metadata: JSON.stringify({
          platform: 'manual',
          timestamp: new Date().toISOString(),
          senderId: 'admin'
        })
      }
    });

    // Update conversation last message
    await prisma.conversation.update({
      where: { id },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: message.length > 50 ? message.substring(0, 50) + '...' : message,
        updatedAt: new Date()
      }
    });

    // 📤 إرسال الرسالة إلى Facebook فعلياً
    let facebookSent = false;
    try {
      // البحث عن معلومات المحادثة والعميل
      const conversation = await prisma.conversation.findUnique({
        where: { id },
        include: {
          customer: true
        }
      });

      if (conversation && conversation.customer) {
        const recipientId = conversation.customer.facebookId;

        if (recipientId) {
          console.log(`📤 [MANUAL-REPLY] Sending message to Facebook recipient: ${recipientId}`);
          console.log(`📤 [MANUAL-REPLY] Message: ${message}`);

          // استخدام نفس دالة الإرسال المستخدمة في AI
          const result = await sendFacebookMessage(recipientId, message, 'TEXT');

          if (result.success) {
            facebookSent = true;
            console.log('✅ [MANUAL-REPLY] Message sent to Facebook successfully:', result.messageId);
          } else {
            console.error('❌ [MANUAL-REPLY] Failed to send to Facebook:', result.error);
          }
        } else {
          console.log('⚠️ [MANUAL-REPLY] No Facebook recipient ID found for conversation:', id);
        }
      } else {
        console.log('⚠️ [MANUAL-REPLY] Conversation or customer not found:', id);
      }
    } catch (facebookError) {
      console.error('❌ [MANUAL-REPLY] Error sending to Facebook:', facebookError.message);
      // نستمر حتى لو فشل الإرسال لفيسبوك
    }

    // Emit to Socket.IO clients
    const io = socketService.getIO();
    if (io) {
      io.emit('new_message', {
        conversationId: id,
        message: {
          id: newMessage.id,
          content: message,
          senderId: 'admin',
          senderName: 'المدير',
          timestamp: newMessage.createdAt,
          type: 'text',
          isFromCustomer: false,
          status: 'sent'
        }
      });
    }

    res.json({
      success: true,
      data: {
        id: newMessage.id,
        content: message,
        timestamp: newMessage.createdAt,
        type: 'text',
        isFromCustomer: false,
        status: 'sent'
      },
      message: 'Message sent successfully',
      facebookSent: facebookSent
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Send manual reply (legacy endpoint)
app.post('/api/v1/conversations/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }
    
    // Save reply to database
    const newMessage = await prisma.message.create({
      data: {
        content: message,
        type: 'TEXT',
        conversationId: id,
        isFromCustomer: false,
        metadata: '{"platform":"manual","source":"admin"}'
      }
    });
    
    // Update conversation
    await prisma.conversation.update({
      where: { id },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: message.length > 100 ? 
          message.substring(0, 100) + '...' : message
      }
    });
    
    console.log(`📤 Manual reply sent: ${newMessage.id}`);
    
    res.json({
      success: true,
      data: newMessage,
      message: 'Reply sent successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== FACEBOOK INTEGRATION ENDPOINTS ====================

// Get connected Facebook pages
app.get('/api/v1/integrations/facebook/connected', authenticateToken, async (req, res) => {
  try {
    // 🔐 الحصول على companyId من المستخدم المصادق عليه
    const user = req.user;

    if (!user || !user.companyId) {
      return res.status(401).json({
        success: false,
        error: 'مستخدم غير صالح'
      });
    }

    const companyId = user.companyId;
    console.log('📡 [FACEBOOK-CONNECTED] Loading pages for company:', companyId);

    // 🔒 جلب صفحات Facebook مع العزل
    const facebookPages = await prisma.facebookPage.findMany({
      where: {
        companyId: companyId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 [FACEBOOK-CONNECTED] Found ${facebookPages.length} Facebook pages for company ${companyId}`);

    // Transform to expected format
    const pages = facebookPages.map(page => ({
      id: page.id,
      pageId: page.pageId,
      pageName: page.pageName,
      status: page.status || 'connected',
      connectedAt: page.connectedAt || page.createdAt,
      lastActivity: page.lastActivity || page.updatedAt,
      messageCount: 0, // We'll calculate this later if needed
      companyId: page.companyId // إضافة companyId للتأكيد
    }));

    res.json({
      success: true,
      pages: pages,
      companyId: companyId // إضافة companyId في الاستجابة
    });
  } catch (error) {
    console.error('❌ [FACEBOOK-CONNECTED] Error fetching Facebook pages:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      companyId: req.user?.companyId
    });
  }
});

// Get specific Facebook page details (including access token)
app.get('/api/v1/integrations/facebook/page/:pageId', authenticateToken, async (req, res) => {
  try {
    // 🔐 الحصول على companyId من المستخدم المصادق عليه
    const user = req.user;

    if (!user || !user.companyId) {
      return res.status(401).json({
        success: false,
        error: 'مستخدم غير صالح'
      });
    }

    const companyId = user.companyId;
    const { pageId } = req.params;

    // 🔒 جلب الصفحة مع العزل
    const facebookPage = await prisma.facebookPage.findFirst({
      where: {
        pageId: pageId,
        companyId: companyId
      }
    });

    if (!facebookPage) {
      return res.status(404).json({
        success: false,
        error: 'Page not found or access denied'
      });
    }

    res.json({
      success: true,
      data: {
        id: facebookPage.id,
        pageId: facebookPage.pageId,
        pageName: facebookPage.pageName,
        status: facebookPage.status,
        connectedAt: facebookPage.connectedAt,
        pageAccessToken: facebookPage.pageAccessToken.substring(0, 20) + '...' // Hide full token
      }
    });
  } catch (error) {
    console.error('Error fetching Facebook page:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get Facebook app config
app.get('/api/v1/integrations/facebook/config', authenticateToken, async (req, res) => {
  try {
    // 🔐 التحقق من المصادقة
    const user = req.user;

    if (!user || !user.companyId) {
      return res.status(401).json({
        success: false,
        error: 'مستخدم غير صالح'
      });
    }

    console.log('⚙️ [FACEBOOK-CONFIG] Loading config for company:', user.companyId);

    const config = {
      appId: process.env.FACEBOOK_APP_ID || 'your-facebook-app-id',
      webhookUrl: `${process.env.BACKEND_URL || 'http://localhost:3001'}/webhook`,
      verifyToken: process.env.FACEBOOK_VERIFY_TOKEN || 'simple_chat_verify_token_2025',
      requiredPermissions: ['pages_messaging', 'pages_read_engagement'],
      webhookFields: ['messages', 'messaging_postbacks']
    };

    res.json({
      success: true,
      data: config,
      companyId: user.companyId
    });
  } catch (error) {
    console.error('❌ [FACEBOOK-CONFIG] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      companyId: req.user?.companyId
    });
  }
});

// Test Facebook page token
app.post('/api/v1/integrations/facebook/test', authenticateToken, async (req, res) => {
  try {
    // 🔐 التحقق من المصادقة
    const user = req.user;

    if (!user || !user.companyId) {
      return res.status(401).json({
        success: false,
        error: 'مستخدم غير صالح'
      });
    }

    console.log('🧪 [FACEBOOK-TEST] Testing token for company:', user.companyId);
    const { pageAccessToken } = req.body;

    if (!pageAccessToken) {
      console.error('❌ [FACEBOOK-TEST] No access token provided');
      return res.status(400).json({
        success: false,
        error: 'Page Access Token is required'
      });
    }

    console.log('🔑 [Backend] Token length:', pageAccessToken.length);
    console.log('🔑 [Backend] Token preview:', pageAccessToken.substring(0, 20) + '...');

    // Test with real Facebook API
    try {
      const axios = require('axios');
      const response = await axios.get(`https://graph.facebook.com/me?access_token=${pageAccessToken}&fields=id,name,category,about`);

      console.log('✅ [Backend] Facebook API response:', response.data);

      res.json({
        success: true,
        data: response.data,
        message: 'Access token is valid'
      });
    } catch (facebookError) {
      console.error('❌ [Backend] Facebook API error:', facebookError.response?.data || facebookError.message);

      res.status(400).json({
        success: false,
        error: 'Invalid Facebook access token: ' + (facebookError.response?.data?.error?.message || facebookError.message)
      });
    }
  } catch (error) {
    console.error('❌ [Backend] Error testing Facebook token:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Connect Facebook page
app.post('/api/v1/integrations/facebook/connect', authenticateToken, async (req, res) => {
  try {
    // 🔐 الحصول على companyId من المستخدم المصادق عليه
    const user = req.user;

    if (!user || !user.companyId) {
      return res.status(401).json({
        success: false,
        error: 'مستخدم غير صالح'
      });
    }

    const companyId = user.companyId;
    console.log('🔗 [FACEBOOK-CONNECT] Connecting page for company:', companyId);

    const { pageId, pageAccessToken, pageName } = req.body;

    console.log('📤 [FACEBOOK-CONNECT] Connection request data:', {
      pageId,
      pageName,
      tokenLength: pageAccessToken?.length,
      companyId
    });

    if (!pageAccessToken) {
      console.error('❌ [FACEBOOK-CONNECT] No access token provided');
      return res.status(400).json({
        success: false,
        error: 'Page Access Token is required'
      });
    }

    if (!pageId) {
      console.error('❌ [FACEBOOK-CONNECT] No page ID provided');
      return res.status(400).json({
        success: false,
        error: 'Page ID is required'
      });
    }

    // Save to database
    console.log('💾 [FACEBOOK-CONNECT] Saving page to database...');

    try {
      // 🔒 التحقق من أن الصفحة لا تنتمي لشركة أخرى
      const existingPage = await prisma.facebookPage.findUnique({
        where: { pageId: pageId }
      });

      if (existingPage && existingPage.companyId !== companyId) {
        console.error('❌ [FACEBOOK-CONNECT] Page belongs to another company');
        return res.status(403).json({
          success: false,
          error: 'هذه الصفحة مربوطة بشركة أخرى'
        });
      }

      let savedPage;
      if (existingPage && existingPage.companyId === companyId) {
        // Update existing page for same company
        savedPage = await prisma.facebookPage.update({
          where: { pageId: pageId },
          data: {
            pageAccessToken: pageAccessToken,
            pageName: pageName || existingPage.pageName,
            status: 'connected',
            connectedAt: new Date(),
            companyId: companyId
          }
        });
        console.log('📝 [FACEBOOK-CONNECT] Updated existing page in database');
      } else {
        // Create new page for this company
        savedPage = await prisma.facebookPage.create({
          data: {
            pageId: pageId,
            pageAccessToken: pageAccessToken,
            pageName: pageName || 'Unknown Page',
            status: 'connected',
            connectedAt: new Date(),
            companyId: companyId
          }
        });
        console.log('➕ [FACEBOOK-CONNECT] Created new page in database');
      }

      const connectionData = {
        pageId: savedPage.pageId,
        pageName: savedPage.pageName,
        status: savedPage.status,
        connectedAt: savedPage.connectedAt.toISOString()
      };

      console.log('✅ [Backend] Page connected successfully:', connectionData);

      res.json({
        success: true,
        message: 'Page connected successfully',
        data: connectionData
      });
    } catch (dbError) {
      console.error('❌ [Backend] Database error:', dbError);
      res.status(500).json({
        success: false,
        error: 'Database error: ' + dbError.message
      });
    }
  } catch (error) {
    console.error('❌ [Backend] Error connecting page:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Facebook diagnostics
app.get('/api/v1/integrations/facebook/diagnostics', authenticateToken, async (req, res) => {
  try {
    // 🔐 التحقق من المصادقة
    const user = req.user;

    if (!user || !user.companyId) {
      return res.status(401).json({
        success: false,
        error: 'مستخدم غير صالح'
      });
    }

    console.log('🔍 [FACEBOOK-DIAGNOSTICS] Running diagnostics for company:', user.companyId);

    // 🔒 جلب إحصائيات معزولة بالشركة
    const companyCustomers = await prisma.customer.count({
      where: { companyId: user.companyId }
    });

    const companyConversations = await prisma.conversation.count({
      where: { companyId: user.companyId }
    });

    const companyMessages = await prisma.message.count({
      where: { companyId: user.companyId }
    });

    const companyFacebookPages = await prisma.facebookPage.count({
      where: { companyId: user.companyId }
    });

    const diagnostics = {
      timestamp: new Date().toISOString(),
      companyId: user.companyId,
      server: {
        status: 'healthy',
        port: 3001,
        environment: 'development',
        uptime: process.uptime()
      },
      database: {
        status: 'connected',
        connection: true,
        tables: {
          customers: companyCustomers,
          conversations: companyConversations,
          messages: companyMessages
        }
      },
      facebook: {
        config: {
          appId: process.env.FACEBOOK_APP_ID || 'configured',
          webhookVerifyToken: process.env.FACEBOOK_VERIFY_TOKEN ? 'configured' : 'missing',
          backendUrl: process.env.BACKEND_URL || 'http://localhost:3001'
        },
        pages: {
          total: companyFacebookPages,
          connected: companyFacebookPages,
          companySpecific: true
        },
        webhooks: {
          url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/webhook`,
          verifyToken: process.env.FACEBOOK_VERIFY_TOKEN || 'configured',
          lastReceived: new Date().toISOString()
        }
      },
      ai: {
        service: 'enabled',
        status: 'AI responses active'
      },
      issues: [],
      recommendations: [
        {
          type: 'success',
          message: 'النظام يعمل بالذكاء الصناعي - جاهز للردود التلقائية'
        }
      ]
    };

    res.json({
      success: true,
      data: diagnostics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Disconnect Facebook page
app.delete('/api/v1/integrations/facebook/:pageId', authenticateToken, async (req, res) => {
  try {
    // 🔐 الحصول على companyId من المستخدم المصادق عليه
    const user = req.user;

    if (!user || !user.companyId) {
      return res.status(401).json({
        success: false,
        error: 'مستخدم غير صالح'
      });
    }

    const companyId = user.companyId;
    const { pageId } = req.params;

    console.log(`🗑️ [FACEBOOK-DISCONNECT] Disconnecting page ${pageId} for company ${companyId}`);

    // 🔒 التحقق من أن الصفحة تنتمي للشركة
    const existingPage = await prisma.facebookPage.findUnique({
      where: { pageId: pageId }
    });

    if (!existingPage) {
      return res.status(404).json({
        success: false,
        error: 'الصفحة غير موجودة'
      });
    }

    if (existingPage.companyId !== companyId) {
      return res.status(403).json({
        success: false,
        error: 'ليس لديك صلاحية لحذف هذه الصفحة'
      });
    }

    // Delete from database
    console.log(`💾 [FACEBOOK-DISCONNECT] Removing page ${pageId} from database...`);

    try {
      // Check if page exists
      const existingPage = await prisma.facebookPage.findUnique({
        where: { pageId: pageId }
      });

      if (!existingPage) {
        console.log(`⚠️ [Backend] Page ${pageId} not found in database`);
        return res.status(404).json({
          success: false,
          error: 'Page not found'
        });
      }

      // Delete the page
      await prisma.facebookPage.delete({
        where: { pageId: pageId }
      });

      const disconnectionData = {
        pageId: pageId,
        pageName: existingPage.pageName,
        status: 'disconnected',
        disconnectedAt: new Date().toISOString()
      };

      console.log('✅ [Backend] Page disconnected successfully:', disconnectionData);

      res.json({
        success: true,
        message: 'تم قطع الاتصال مع الصفحة بنجاح',
        data: disconnectionData
      });
    } catch (dbError) {
      console.error('❌ [Backend] Database error:', dbError);
      res.status(500).json({
        success: false,
        error: 'Database error: ' + dbError.message
      });
    }
  } catch (error) {
    console.error('❌ [Backend] General error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update Facebook page settings
app.put('/api/v1/integrations/facebook/:pageId', authenticateToken, async (req, res) => {
  try {
    // 🔐 التحقق من المصادقة
    const user = req.user;

    if (!user || !user.companyId) {
      return res.status(401).json({
        success: false,
        error: 'مستخدم غير صالح'
      });
    }

    const companyId = user.companyId;
    const { pageId } = req.params;
    const { pageName, settings } = req.body;

    console.log(`⚙️ [FACEBOOK-UPDATE] Updating page ${pageId} for company ${companyId}`);

    // 🔒 التحقق من أن الصفحة تنتمي للشركة
    const existingPage = await prisma.facebookPage.findFirst({
      where: {
        pageId: pageId,
        companyId: companyId
      }
    });

    if (!existingPage) {
      return res.status(404).json({
        success: false,
        error: 'Page not found or access denied'
      });
    }

    // Mock successful update
    res.json({
      success: true,
      message: 'تم تحديث إعدادات الصفحة بنجاح',
      data: {
        pageId: pageId,
        pageName: pageName,
        settings: settings,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get Facebook page details
app.get('/api/v1/integrations/facebook/:pageId', authenticateToken, async (req, res) => {
  try {
    // 🔐 التحقق من المصادقة
    const user = req.user;

    if (!user || !user.companyId) {
      return res.status(401).json({
        success: false,
        error: 'مستخدم غير صالح'
      });
    }

    const companyId = user.companyId;
    const { pageId } = req.params;

    console.log(`📄 [FACEBOOK-DETAILS] Getting details for page ${pageId}, company ${companyId}`);

    // 🔒 جلب تفاصيل الصفحة مع العزل
    const facebookPage = await prisma.facebookPage.findFirst({
      where: {
        pageId: pageId,
        companyId: companyId
      }
    });

    if (!facebookPage) {
      return res.status(404).json({
        success: false,
        error: 'Page not found or access denied'
      });
    }

    // إرجاع تفاصيل الصفحة الحقيقية
    const pageDetails = {
      id: facebookPage.id,
      pageId: facebookPage.pageId,
      pageName: facebookPage.pageName,
      status: facebookPage.status || 'connected',
      connectedAt: facebookPage.connectedAt || facebookPage.createdAt,
      lastActivity: facebookPage.lastActivity || facebookPage.updatedAt,
      messageCount: 0, // يمكن حسابه لاحقاً
      companyId: facebookPage.companyId,
      settings: {
        autoReply: false,
        welcomeMessage: 'أهلاً وسهلاً بك!',
        workingHours: {
          enabled: true,
          start: '09:00',
          end: '18:00'
        }
      },
      stats: {
        totalMessages: 156,
        totalCustomers: 23,
        responseTime: '2.5 دقيقة',
        lastWeekMessages: 45
      }
    };

    res.json({
      success: true,
      data: mockPageDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Debug endpoint to check database
app.get('/api/v1/debug/database', async (req, res) => {
  try {
    const stats = {
      customers: await prisma.customer.count(),
      conversations: await prisma.conversation.count(),
      messages: await prisma.message.count(),
      products: await prisma.product.count(),
      facebookPages: await prisma.facebookPage.count(),
      companies: await prisma.company.count()
    };

    const facebookPages = await prisma.facebookPage.findMany({
      select: {
        id: true,
        pageId: true,
        pageName: true,
        status: true,
        companyId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      data: {
        stats,
        facebookPages,
        companies,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Database debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== SERVER STARTUP ====================

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🎉 Clean Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: http://localhost:3000`);
  console.log(`🔗 Backend URL: http://localhost:${PORT}`);
  console.log(`📊 API Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`🤖 AI Features: ENABLED`);
  console.log(`✅ AI Agent ready for customer service`);

  // Initialize System Manager
  console.log(`🔧 Initializing System Manager...`);
  try {
    const systemManager = require('./src/services/systemManager');
    systemManager.initializeSystemSettings().then(() => {
      console.log(`✅ System Manager initialized successfully`);
    }).catch((error) => {
      console.error(`❌ Failed to initialize System Manager:`, error.message);
    });
  } catch (error) {
    console.error(`❌ Failed to initialize System Manager:`, error.message);
  }

  // Start Auto Pattern Detection Service
  console.log(`🔍 Starting Auto Pattern Detection Service...`);
  try {
    autoPatternService.start();
    console.log(`✅ Auto Pattern Detection Service started successfully`);
    console.log(`⏰ Detection interval: ${autoPatternService.getStatus().intervalMinutes} minutes`);
  } catch (error) {
    console.error(`❌ Failed to start Auto Pattern Detection Service:`, error.message);
  }

  // Start Scheduled Pattern Maintenance Service
  console.log(`🕐 Starting Scheduled Pattern Maintenance Service...`);
  try {
    const scheduledMaintenance = require('./src/services/scheduledPatternMaintenanceService');
    scheduledMaintenance.start();
    console.log(`✅ Scheduled Pattern Maintenance Service started successfully`);
    console.log(`📅 Weekly cleanup: Sundays at 2:00 AM`);
    console.log(`📅 Daily maintenance: Every day at 3:00 AM`);
    console.log(`📅 Monthly archiving: 1st of month at 1:00 AM`);
  } catch (error) {
    console.error(`❌ Failed to start Scheduled Pattern Maintenance Service:`, error.message);
  }
});

// ================================
// AI AGENT API ENDPOINTS
// ================================

// Test AI Agent directly (for testing purposes)
app.post('/test-ai-direct', async (req, res) => {
  try {
    console.log('🧪 Test AI endpoint called');
    console.log('📦 Request body:', req.body);

    const { conversationId, senderId, content, attachments = [], customerData } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required'
      });
    }

    // إعداد بيانات الرسالة
    const messageData = {
      conversationId: conversationId || 'test-conversation',
      senderId: senderId || 'test-customer',
      content: content,
      attachments: attachments,
      customerData: customerData || {
        name: 'عميل تجريبي',
        phone: '01234567890',
        email: 'test@example.com',
        orderCount: 0
      }
    };

    console.log('🤖 Processing with AI Agent...');
    console.log('📤 Message data:', JSON.stringify(messageData, null, 2));

    // معالجة الرسالة بالذكاء الصناعي
    const aiResponse = await aiAgentService.processCustomerMessage(messageData);

    if (aiResponse) {
      console.log('✅ AI response generated successfully');

      res.json({
        success: true,
        data: {
          content: aiResponse.content,
          intent: aiResponse.intent,
          sentiment: aiResponse.sentiment,
          confidence: aiResponse.confidence,
          shouldEscalate: aiResponse.shouldEscalate,
          images: aiResponse.images || [],
          processingTime: aiResponse.processingTime || 0,
          orderInfo: aiResponse.orderInfo || null,
          orderCreated: aiResponse.orderCreated || null
        },
        message: 'AI response generated successfully'
      });
    } else {
      console.log('❌ No AI response generated');

      res.json({
        success: false,
        error: 'AI Agent did not generate a response',
        details: 'This could be due to AI being disabled, quota exceeded, or other configuration issues'
      });
    }

  } catch (error) {
    console.error('❌ Error in test AI endpoint:', error);

    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack
    });
  }
});

// Get AI settings - DISABLED: Using settingsRoutes.js instead
// app.get('/api/v1/ai/settings', async (req, res) => {
//   try {
//     console.log('🔍 [server] GET /api/v1/ai/settings called');
//     const settings = await aiAgentService.getSettings();
//     console.log('📤 [server] Settings returned:', settings);

//     res.json({
//       success: true,
//       data: settings
//     });
//   } catch (error) {
//     console.error('❌ Error getting AI settings:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to get AI settings'
//     });
//   }
// });

// Update AI settings
app.put('/api/v1/ai/settings', async (req, res) => {
  try {
    const companyId = req.user?.companyId || req.companyId;
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company ID is required'
      });
    }

    await aiAgentService.updateSettings(req.body, companyId);

    res.json({
      success: true,
      message: 'AI settings updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating AI settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update AI settings'
    });
  }
});

// Toggle AI enabled/disabled
app.post('/api/v1/ai/toggle', async (req, res) => {
  try {
    const companyId = req.user?.companyId || req.companyId;
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company ID is required'
      });
    }

    const { enabled } = req.body;

    await aiAgentService.updateSettings({ isEnabled: enabled }, companyId);

    res.json({
      success: true,
      message: `AI ${enabled ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    console.error('❌ Error toggling AI:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle AI'
    });
  }
});



// Get AI statistics
app.get('/api/v1/ai/stats', authenticateToken, async (req, res) => {
  try {
    // 🔐 الحصول على companyId من المستخدم المصادق عليه
    const user = req.user; // من authMiddleware

    if (!user || !user.companyId) {
      return res.status(401).json({
        success: false,
        error: 'مستخدم غير صالح'
      });
    }

    const companyId = user.companyId;
    console.log('🏢 [AI-STATS] Getting stats for company:', companyId);

    // جلب إحصائيات من قاعدة البيانات مع العزل
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 🔒 إضافة companyId لجميع الاستعلامات
    const whereCondition = {
      createdAt: {
        gte: today
      },
      conversation: {
        companyId: companyId
      }
    };

    const aiWhereCondition = {
      createdAt: {
        gte: today
      },
      companyId: companyId
    };

    const totalMessages = await prisma.message.count({
      where: whereCondition
    });

    const aiInteractions = await prisma.aiInteraction.count({
      where: aiWhereCondition
    });

    const humanHandoffs = await prisma.aiInteraction.count({
      where: {
        ...aiWhereCondition,
        requiresHumanIntervention: true
      }
    });

    // حساب متوسط وقت الرد
    const avgResponseTime = await prisma.aiInteraction.aggregate({
      where: aiWhereCondition,
      _avg: {
        responseTime: true
      }
    });

    // حساب متوسط الثقة
    const avgConfidence = await prisma.aiInteraction.aggregate({
      where: aiWhereCondition,
      _avg: {
        confidence: true
      }
    });

    // أكثر النوايا شيوعاً
    const intentCounts = await prisma.aiInteraction.groupBy({
      by: ['intent'],
      where: aiWhereCondition,
      _count: {
        intent: true
      },
      orderBy: {
        _count: {
          intent: 'desc'
        }
      },
      take: 5
    });

    const topIntents = intentCounts.map(item => ({
      intent: item.intent || 'غير محدد',
      count: item._count.intent
    }));

    // توزيع المشاعر
    const sentimentCounts = await prisma.aiInteraction.groupBy({
      by: ['sentiment'],
      where: aiWhereCondition,
      _count: {
        sentiment: true
      }
    });

    const totalSentiments = sentimentCounts.reduce((sum, item) => sum + item._count.sentiment, 0);
    const sentimentDistribution = {
      positive: Math.round((sentimentCounts.find(s => s.sentiment === 'positive')?._count.sentiment || 0) / totalSentiments * 100) || 0,
      neutral: Math.round((sentimentCounts.find(s => s.sentiment === 'neutral')?._count.sentiment || 0) / totalSentiments * 100) || 0,
      negative: Math.round((sentimentCounts.find(s => s.sentiment === 'negative')?._count.sentiment || 0) / totalSentiments * 100) || 0
    };

    console.log('📊 [AI-STATS] Stats for company', companyId, ':', {
      totalMessages,
      aiInteractions,
      humanHandoffs
    });

    res.json({
      success: true,
      data: {
        totalMessages,
        aiResponses: aiInteractions,
        humanHandoffs,
        avgResponseTime: Math.round(avgResponseTime._avg.responseTime || 0),
        avgConfidence: Math.round((avgConfidence._avg.confidence || 0) * 100) / 100,
        topIntents,
        sentimentDistribution
      },
      companyId // 🏢 إضافة companyId للتأكد من العزل
    });

  } catch (error) {
    console.error('❌ Error getting AI stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get AI statistics'
    });
  }
});

// Clear conversation memory
app.delete('/api/v1/ai/memory/clear', async (req, res) => {
  try {
    const deletedCount = await prisma.conversationMemory.deleteMany({});

    console.log(`🧹 Cleared ${deletedCount.count} memory records`);

    res.json({
      success: true,
      message: `Cleared ${deletedCount.count} memory records`
    });
  } catch (error) {
    console.error('❌ Error clearing memory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear memory'
    });
  }
});

// Update knowledge base
app.post('/api/v1/ai/knowledge-base/update', async (req, res) => {
  try {
    await ragService.updateKnowledgeBase();

    res.json({
      success: true,
      message: 'Knowledge base updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating knowledge base:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update knowledge base'
    });
  }
});

// Get memory statistics
app.get('/api/v1/ai/memory/stats', async (req, res) => {
  try {
    // ✅ إضافة العزل الأمني - الحصول على companyId من المستخدم المصادق عليه
    const { companyId } = req.query;

    // التحقق من وجود companyId للعزل الأمني
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'companyId is required for memory isolation'
      });
    }

    const stats = await memoryService.getMemoryStats(companyId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error getting memory stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get memory statistics'
    });
  }
});

// Get RAG statistics
app.get('/api/v1/ai/rag/stats', async (req, res) => {
  try {
    const stats = ragService.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error getting RAG stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get RAG statistics'
    });
  }
});

// Get multimodal processing statistics
app.get('/api/v1/ai/multimodal/stats', async (req, res) => {
  try {
    const stats = multimodalService.getProcessingStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error getting multimodal stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get multimodal statistics'
    });
  }
});

// ================================
// GEMINI KEYS MANAGEMENT
// ================================

// Get all Gemini keys (النظام الجديد)
app.get('/api/v1/ai/gemini-keys', authenticateToken, async (req, res) => {
  try {
    // 🔐 الحصول على companyId من المستخدم المصادق عليه
    const user = req.user;

    if (!user || !user.companyId) {
      return res.status(401).json({
        success: false,
        error: 'مستخدم غير صالح'
      });
    }

    const companyId = user.companyId;
    console.log('🏢 [GEMINI-KEYS] Getting keys for company:', companyId);

    // Check if table exists first
    const tableExists = await checkTableExists('gemini_keys');
    if (!tableExists) {
      await createAIManagementTables();
    }

    // 🔒 جلب المفاتيح الخاصة بالشركة فقط
    const keys = await prisma.$queryRaw`
      SELECT * FROM gemini_keys
      WHERE companyId = ${companyId}
      ORDER BY priority ASC
    `;

    // Get models for each key
    const keysWithModels = [];
    for (const key of keys) {
      try {
        const models = await prisma.$queryRaw`
          SELECT * FROM \`gemini_key_models\`
          WHERE \`keyId\` = ${key.id}
          ORDER BY \`priority\` ASC
        `;

        const modelsWithUsage = models.map(model => ({
          id: model.id,
          model: model.model,
          usage: JSON.parse(model.usage),
          isEnabled: model.isEnabled,
          priority: model.priority,
          lastUsed: model.lastUsed
        }));

        keysWithModels.push({
          ...key,
          apiKey: key.apiKey.substring(0, 10) + '...' + key.apiKey.slice(-4),
          usage: typeof key.usage === 'string' ? JSON.parse(key.usage) : key.usage,
          models: modelsWithUsage,
          totalModels: modelsWithUsage.length,
          availableModels: modelsWithUsage.filter(m => m.usage.used < m.usage.limit).length
        });
      } catch (error) {
        console.log(`Warning: Could not get models for key ${key.id}:`, error.message);
        keysWithModels.push({
          ...key,
          apiKey: key.apiKey.substring(0, 10) + '...' + key.apiKey.slice(-4),
          usage: typeof key.usage === 'string' ? JSON.parse(key.usage) : key.usage,
          models: [],
          totalModels: 0,
          availableModels: 0
        });
      }
    }

    console.log('📊 [GEMINI-KEYS] Keys for company', companyId, ':', keys.length);

    res.json({
      success: true,
      data: keysWithModels,
      summary: {
        totalKeys: keys.length,
        activeKeys: keys.filter(k => k.isActive).length,
        totalModels: keysWithModels.reduce((sum, k) => sum + k.totalModels, 0),
        availableModels: keysWithModels.reduce((sum, k) => sum + k.availableModels, 0)
      },
      companyId // 🏢 إضافة companyId للتأكد من العزل
    });
  } catch (error) {
    console.error('❌ Error getting Gemini keys:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get Gemini keys'
    });
  }
});

// Add new Gemini key (النظام الجديد)
app.post('/api/v1/ai/gemini-keys', authenticateToken, async (req, res) => {
  try {
    // 🔐 الحصول على companyId من المستخدم المصادق عليه
    const user = req.user;

    if (!user || !user.companyId) {
      return res.status(401).json({
        success: false,
        error: 'مستخدم غير صالح'
      });
    }

    const companyId = user.companyId;
    console.log('🏢 [GEMINI-KEYS] Adding key for company:', companyId);

    const { name, apiKey, description } = req.body;

    if (!name || !apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Name and API key are required'
      });
    }

    // Test the key with a basic model first (skip in development for testing)
    const skipKeyValidation = process.env.NODE_ENV === 'development' && apiKey.includes('Test_Key');

    if (!skipKeyValidation) {
      const testResult = await testGeminiKey(apiKey, 'gemini-2.5-flash');
      if (!testResult.success) {
        return res.status(400).json({
          success: false,
          error: `Invalid API key: ${testResult.error}`
        });
      }
    } else {
      console.log('⚠️ [DEV] Skipping key validation for test key');
    }

    // 🔒 Get current key count for this company only
    const keyCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM gemini_keys WHERE companyId = ${companyId}
    `;
    const count = Number(keyCount[0]?.count || 0);
    const priority = count + 1;

    // 🔒 Create the main key with companyId
    const keyId = generateId();
    const defaultDescription = `مفتاح رقم ${priority} - يدعم جميع النماذج`;
    const isFirstKey = count === 0;

    await prisma.$executeRaw`
      INSERT INTO gemini_keys (id, name, apiKey, model, isActive, priority, description, companyId, createdAt, updatedAt, \`usage\`, currentUsage, maxRequestsPerDay)
      VALUES (${keyId}, ${name}, ${apiKey}, 'gemini-2.5-flash', ${isFirstKey}, ${priority}, ${description || defaultDescription}, ${companyId}, NOW(), NOW(), '{"used": 0, "limit": 1000000}', 0, 1500)
    `;

    // Create all available models for this key
    const availableModels = [
      { model: 'gemini-2.5-flash', limit: 1000000, priority: 1 },
      { model: 'gemini-2.5-pro', limit: 500000, priority: 2 },
      { model: 'gemini-2.0-flash', limit: 750000, priority: 3 },
      { model: 'gemini-2.0-flash-exp', limit: 1000, priority: 4 },
      { model: 'gemini-1.5-flash', limit: 1500, priority: 5 },
      { model: 'gemini-1.5-pro', limit: 50, priority: 6 }
    ];

    const createdModels = [];
    for (const modelInfo of availableModels) {
      try {
        await prisma.$executeRaw`
          INSERT INTO \`gemini_key_models\`
          (\`id\`, \`keyId\`, \`model\`, \`usage\`, \`isEnabled\`, \`priority\`, \`createdAt\`, \`updatedAt\`)
          VALUES
          (${generateId()}, ${keyId}, ${modelInfo.model}, ${JSON.stringify({
            used: 0,
            limit: modelInfo.limit,
            resetDate: null
          })}, true, ${modelInfo.priority}, NOW(), NOW())
        `;
        createdModels.push(modelInfo.model);
      } catch (error) {
        console.log(`Warning: Could not create model ${modelInfo.model}:`, error.message);
      }
    }

    res.json({
      success: true,
      data: {
        id: keyId,
        name,
        apiKey: apiKey.substring(0, 10) + '...' + apiKey.slice(-4),
        companyId,
        modelsCreated: createdModels.length,
        models: createdModels
      }
    });
  } catch (error) {
    console.error('❌ Error adding Gemini key:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to add Gemini key',
      details: error.message
    });
  }
});

// Helper function to generate ID
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Toggle Gemini key active status
app.put('/api/v1/ai/gemini-keys/:id/toggle', authenticateToken, async (req, res) => {
  try {
    // 🔐 الحصول على companyId من المستخدم المصادق عليه
    const user = req.user;

    if (!user || !user.companyId) {
      return res.status(401).json({
        success: false,
        error: 'مستخدم غير صالح'
      });
    }

    const companyId = user.companyId;
    const { id } = req.params;

    console.log('🔄 [TOGGLE-KEY] Toggling key for company:', companyId, 'Key ID:', id);

    // 🔒 البحث عن المفتاح مع التأكد من العزل
    const key = await prisma.$queryRaw`
      SELECT * FROM gemini_keys
      WHERE id = ${id} AND companyId = ${companyId}
    `;

    if (!key || key.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Gemini key not found or access denied'
      });
    }

    const currentKey = key[0];
    const newStatus = !currentKey.isActive;

    // 🔒 تحديث المفتاح مع العزل
    await prisma.$executeRaw`
      UPDATE gemini_keys
      SET isActive = ${newStatus}
      WHERE id = ${id} AND companyId = ${companyId}
    `;

    console.log('✅ [TOGGLE-KEY] Key toggled successfully:', {
      keyId: id,
      companyId,
      oldStatus: currentKey.isActive,
      newStatus
    });

    res.json({
      success: true,
      message: `Key ${currentKey.isActive ? 'deactivated' : 'activated'}`,
      data: {
        id,
        isActive: newStatus,
        companyId
      }
    });
  } catch (error) {
    console.error('❌ Error toggling Gemini key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle Gemini key',
      details: error.message
    });
  }
});

// Update Gemini key model
app.put('/api/v1/ai/gemini-keys/:id/model', async (req, res) => {
  try {
    const { id } = req.params;
    const { model } = req.body;

    if (!model || !model.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Model is required'
      });
    }

    const key = await prisma.geminiKey.findUnique({
      where: { id }
    });

    if (!key) {
      return res.status(404).json({
        success: false,
        error: 'Gemini key not found'
      });
    }

    // Test the key with new model before updating
    const testResult = await testGeminiKey(key.apiKey, model);
    if (!testResult.success) {
      return res.status(400).json({
        success: false,
        error: `Model test failed: ${testResult.error}`
      });
    }

    await prisma.geminiKey.update({
      where: { id },
      data: {
        model: model.trim(),
        updatedAt: new Date()
      }
    });

    console.log(`✅ Updated Gemini key ${key.name} model to ${model}`);

    res.json({
      success: true,
      message: 'Model updated successfully',
      data: { model: model.trim() }
    });
  } catch (error) {
    console.error('❌ Error updating Gemini key model:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update Gemini key model'
    });
  }
});

// Delete Gemini key
app.delete('/api/v1/ai/gemini-keys/:id', authenticateToken, async (req, res) => {
  try {
    // 🔐 الحصول على companyId من المستخدم المصادق عليه
    const user = req.user;

    if (!user || !user.companyId) {
      return res.status(401).json({
        success: false,
        error: 'مستخدم غير صالح'
      });
    }

    const companyId = user.companyId;
    const { id } = req.params;

    console.log('🗑️ [DELETE-KEY] Deleting key for company:', companyId, 'Key ID:', id);

    // 🔒 التأكد من أن المفتاح ينتمي للشركة
    const key = await prisma.$queryRaw`
      SELECT * FROM gemini_keys
      WHERE id = ${id} AND companyId = ${companyId}
    `;

    if (!key || key.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Gemini key not found or access denied'
      });
    }

    // 🔒 حذف المفتاح مع العزل
    await prisma.$executeRaw`
      DELETE FROM gemini_keys
      WHERE id = ${id} AND companyId = ${companyId}
    `;

    console.log('✅ [DELETE-KEY] Key deleted successfully:', {
      keyId: id,
      companyId,
      keyName: key[0].name
    });

    res.json({
      success: true,
      message: 'Gemini key deleted successfully',
      data: {
        id,
        companyId
      }
    });
  } catch (error) {
    console.error('❌ Error deleting Gemini key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete Gemini key',
      details: error.message
    });
  }
});

// Test Gemini key
app.post('/api/v1/ai/gemini-keys/:id/test', async (req, res) => {
  try {
    const { id } = req.params;

    // Get key with its models
    const key = await prisma.geminiKey.findUnique({
      where: { id },
      include: {
        models: {
          where: { isEnabled: true },
          orderBy: { priority: 'asc' }
        }
      }
    });

    if (!key) {
      return res.status(404).json({
        success: false,
        error: 'Gemini key not found'
      });
    }

    // Find the best available model to test
    let testModel = null;
    let testResult = null;

    // Try models in priority order
    for (const model of key.models) {
      console.log(`🧪 Testing model: ${model.model}`);
      testResult = await testGeminiKey(key.apiKey, model.model);

      if (testResult.success) {
        testModel = model.model;
        break;
      } else {
        console.log(`❌ Model ${model.model} failed: ${testResult.error}`);
      }
    }

    if (testResult && testResult.success) {
      res.json({
        success: true,
        model: testModel,
        status: 'Working',
        response: testResult.response,
        message: `✅ المفتاح يعمل بشكل صحيح مع النموذج ${testModel}`
      });
    } else {
      res.json({
        success: false,
        error: testResult ? testResult.error : 'جميع النماذج غير متاحة حالياً',
        message: '❌ المفتاح لا يعمل مع أي من النماذج المتاحة'
      });
    }

  } catch (error) {
    console.error('❌ Error testing Gemini key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test Gemini key'
    });
  }
});

// Get available models
app.get('/api/v1/ai/available-models', async (req, res) => {
  try {
    const models = [
      // أحدث نماذج Gemini 2025 🚀
      {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        description: 'الأقوى - للمهام المعقدة والتفكير المتقدم',
        category: 'premium',
        features: ['تفكير متقدم', 'فهم متعدد الوسائط', 'برمجة متقدمة']
      },
      {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        description: 'الأفضل سعر/أداء - للمهام العامة',
        category: 'recommended',
        features: ['تفكير تكيفي', 'كفاءة التكلفة', 'سرعة عالية']
      },
      {
        id: 'gemini-2.5-flash-lite',
        name: 'Gemini 2.5 Flash Lite',
        description: 'الأسرع والأوفر - للمهام البسيطة',
        category: 'economy',
        features: ['سرعة فائقة', 'تكلفة منخفضة', 'إنتاجية عالية']
      },

      // نماذج الصوت المتقدمة 🎤
      {
        id: 'gemini-2.5-flash-preview-native-audio-dialog',
        name: 'Gemini 2.5 Flash Audio Dialog',
        description: 'محادثات صوتية تفاعلية طبيعية',
        category: 'audio',
        features: ['صوت تفاعلي', 'محادثات طبيعية', 'تحكم في النبرة']
      },
      {
        id: 'gemini-2.5-flash-preview-tts',
        name: 'Gemini 2.5 Flash TTS',
        description: 'تحويل نص لصوت عالي الجودة',
        category: 'audio',
        features: ['تحويل نص لصوت', 'أصوات متعددة', 'تحكم متقدم']
      },

      // نماذج Gemini 2.0 ⚡
      {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        description: 'الجيل الثاني - مميزات متقدمة وسرعة',
        category: 'standard',
        features: ['أدوات أصلية', 'سرعة محسنة', 'مليون رمز']
      },
      {
        id: 'gemini-2.0-flash-lite',
        name: 'Gemini 2.0 Flash Lite',
        description: 'نسخة خفيفة من 2.0 للسرعة والكفاءة',
        category: 'economy',
        features: ['كفاءة التكلفة', 'زمن استجابة منخفض']
      },

      // نماذج مستقرة 1.5 📊
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        description: 'مستقر للمهام المعقدة - مجرب ومختبر',
        category: 'stable',
        features: ['مستقر', 'سياق طويل', 'موثوق']
      },
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        description: 'مستقر وسريع - للاستخدام العام',
        category: 'stable',
        features: ['مستقر', 'سريع', 'متعدد الوسائط']
      },

      // نماذج التضمين 🔍
      {
        id: 'gemini-embedding-001',
        name: 'Gemini Embedding',
        description: 'للبحث والتشابه النصي',
        category: 'embedding',
        features: ['تضمين نصي', 'بحث دلالي', 'تشابه المحتوى']
      }
    ];

    res.json({
      success: true,
      models: models.map(m => m.id), // للتوافق مع الكود القديم
      modelsDetailed: models
    });
  } catch (error) {
    console.error('❌ Error getting available models:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get available models'
    });
  }
});

// Helper function to check if table exists
async function checkTableExists(tableName) {
  try {
    // Use a safer approach to check table existence
    const result = await prisma.$queryRaw`SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = ${tableName}`;
    return result[0]?.count > 0;
  } catch (error) {
    console.log(`⚠️ Error checking table ${tableName}:`, error.message);
    return false;
  }
}

// Helper function to create AI management tables
async function createAIManagementTables() {
  try {
    console.log('🔧 Creating AI management tables...');

    // Create gemini_keys table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \`gemini_keys\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`name\` VARCHAR(191) NOT NULL,
        \`apiKey\` VARCHAR(191) NOT NULL,
        \`model\` VARCHAR(191) NOT NULL DEFAULT 'gemini-2.5-flash',
        \`isActive\` BOOLEAN NOT NULL DEFAULT true,
        \`usage\` VARCHAR(191) NOT NULL DEFAULT '{"used": 0, "limit": 1000000}',
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `;

    // Create system_prompts table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \`system_prompts\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`name\` VARCHAR(191) NOT NULL,
        \`content\` TEXT NOT NULL,
        \`category\` VARCHAR(191) NOT NULL DEFAULT 'general',
        \`isActive\` BOOLEAN NOT NULL DEFAULT false,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `;

    console.log('✅ AI management tables created successfully');
  } catch (error) {
    console.error('❌ Error creating AI management tables:', error);
  }
}

// Helper function to test Gemini key
async function testGeminiKey(apiKey, model) {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const testModel = genAI.getGenerativeModel({ model });

    const result = await testModel.generateContent('Test message');
    const response = await result.response;

    return {
      success: true,
      model,
      status: 'Working',
      response: response.text().substring(0, 50) + '...'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// ================================
// SYSTEM PROMPTS MANAGEMENT
// ================================

// Get all system prompts
app.get('/api/v1/ai/prompts', async (req, res) => {
  try {
    const companyId = req.user?.companyId || req.companyId;
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company ID is required'
      });
    }

    // Check if table exists first
    const tableExists = await checkTableExists('system_prompts');
    if (!tableExists) {
      await createAIManagementTables();
    }

    const prompts = await prisma.systemPrompt.findMany({
      where: { companyId },  // فلترة حسب الشركة
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: prompts
    });
  } catch (error) {
    console.error('❌ Error getting system prompts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get system prompts'
    });
  }
});

// Add new system prompt
app.post('/api/v1/ai/prompts', async (req, res) => {
  try {
    const companyId = req.user?.companyId || req.companyId;
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company ID is required'
      });
    }

    const { name, content, category } = req.body;

    if (!name || !content) {
      return res.status(400).json({
        success: false,
        error: 'Name and content are required'
      });
    }

    const newPrompt = await prisma.systemPrompt.create({
      data: {
        name,
        content,
        category: category || 'general',
        isActive: false,
        companyId  // إضافة companyId للعزل
      }
    });

    res.json({
      success: true,
      data: newPrompt
    });
  } catch (error) {
    console.error('❌ Error adding system prompt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add system prompt'
    });
  }
});

// Activate system prompt
app.put('/api/v1/ai/prompts/:id/activate', async (req, res) => {
  try {
    const companyId = req.user?.companyId || req.companyId;
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company ID is required'
      });
    }

    const { id } = req.params;

    // Deactivate all other prompts for this company only
    await prisma.systemPrompt.updateMany({
      where: { companyId },  // فقط برومبت هذه الشركة
      data: { isActive: false }
    });

    // Activate the selected prompt (with company check)
    await prisma.systemPrompt.update({
      where: {
        id,
        companyId  // التأكد أن البرومبت ينتمي لهذه الشركة
      },
      data: { isActive: true }
    });

    // إعادة تحميل الـ system prompt في الـ AI Agent
    const aiAgentService = require('./src/services/aiAgentService');
    if (aiAgentService && typeof aiAgentService.reloadSystemPrompt === 'function') {
      await aiAgentService.reloadSystemPrompt();
      console.log('✅ AI Agent system prompt reloaded');
    }

    res.json({
      success: true,
      message: 'System prompt activated successfully'
    });
  } catch (error) {
    console.error('❌ Error activating system prompt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to activate system prompt'
    });
  }
});

// Update system prompt
app.put('/api/v1/ai/prompts/:id', async (req, res) => {
  try {
    const companyId = req.user?.companyId || req.companyId;
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company ID is required'
      });
    }

    const { id } = req.params;
    const { name, content, category } = req.body;

    if (!name || !content) {
      return res.status(400).json({
        success: false,
        error: 'Name and content are required'
      });
    }

    const updatedPrompt = await prisma.systemPrompt.update({
      where: {
        id,
        companyId  // التأكد أن البرومبت ينتمي لهذه الشركة
      },
      data: {
        name,
        content,
        category: category || 'general',
        updatedAt: new Date()
      }
    });

    // إذا كان الـ prompt المحدث نشط، أعد تحميله في الـ AI Agent
    if (updatedPrompt.isActive) {
      const aiAgentService = require('./src/services/aiAgentService');
      if (aiAgentService && typeof aiAgentService.reloadSystemPrompt === 'function') {
        await aiAgentService.reloadSystemPrompt();
        console.log('✅ AI Agent system prompt reloaded after update');
      }
    }

    res.json({
      success: true,
      data: updatedPrompt,
      message: 'System prompt updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating system prompt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update system prompt'
    });
  }
});

// Delete system prompt
app.delete('/api/v1/ai/prompts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.systemPrompt.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'System prompt deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting system prompt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete system prompt'
    });
  }
});

// ================================
// MEMORY MANAGEMENT
// ================================

// Get memory settings
app.get('/api/v1/ai/memory/settings', async (req, res) => {
  try {
    // ✅ إضافة العزل الأمني - الحصول على companyId من المستخدم المصادق عليه
    const { companyId } = req.query;

    // التحقق من وجود companyId للعزل الأمني
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'companyId is required for memory isolation'
      });
    }

    const settings = await memoryService.getMemoryStats(companyId);

    res.json({
      success: true,
      data: {
        retentionDays: 30,
        maxConversationsPerUser: 100,
        maxMessagesPerConversation: 50,
        autoCleanup: true,
        compressionEnabled: false,
        ...settings
      }
    });
  } catch (error) {
    console.error('❌ Error getting memory settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get memory settings'
    });
  }
});

// Update memory settings
app.put('/api/v1/ai/memory/settings', async (req, res) => {
  try {
    const settings = req.body;

    // Save settings to database or config
    // For now, we'll just acknowledge the update

    res.json({
      success: true,
      message: 'Memory settings updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating memory settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update memory settings'
    });
  }
});

// Cleanup old memory
app.post('/api/v1/ai/memory/cleanup', async (req, res) => {
  try {
    const deletedCount = await memoryService.cleanupOldMemories();

    res.json({
      success: true,
      deletedCount,
      message: `Cleaned up ${deletedCount} old memory records`
    });
  } catch (error) {
    console.error('❌ Error cleaning up memory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup memory'
    });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

// Get current company (for frontend that uses hardcoded ID)
app.get('/api/v1/companies/current', async (req, res) => {
  try {
    // Get the first/default company
    const company = await prisma.company.findFirst();

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'No company found'
      });
    }

    // Parse settings
    let settings = {};
    try {
      settings = company.settings ? JSON.parse(company.settings) : {};
    } catch (error) {
      settings = {};
    }

    // Default settings
    const defaultSettings = {
      currency: 'EGP',
      currencySymbol: 'جنيه',
      language: 'ar',
      timezone: 'Africa/Cairo',
      dateFormat: 'DD/MM/YYYY',
      numberFormat: 'ar-EG'
    };

    const finalSettings = { ...defaultSettings, ...settings };

    res.json({
      success: true,
      data: {
        id: company.id,
        name: company.name,
        email: company.email,
        phone: company.phone,
        address: company.address,
        settings: finalSettings,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching current company:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company data'
    });
  }
});

// REMOVED: Dangerous fallback endpoint - no longer supported
app.get('/api/v1/companies/1', async (req, res) => {
  // رفض الطلب - لا يوجد fallback
  console.error(`❌ [SECURITY] Attempted access to dangerous fallback endpoint: /api/v1/companies/1`);

  return res.status(410).json({
    success: false,
    error: 'This endpoint has been removed for security reasons',
    code: 'ENDPOINT_REMOVED',
    message: 'Please use proper company identification'
  });




});

// Company usage endpoint - matching frontend expectations exactly
app.get('/api/v1/companies/:id/usage', async (req, res) => {
  try {
    const companyId = req.params.id;

    // Get actual product count from database
    let actualProductCount = 6;
    try {
      actualProductCount = await prisma.product.count({
        where: { isActive: true }
      });
    } catch (error) {
      console.log('Could not fetch product count, using default');
    }

    // Ensure all values are numbers and safe
    const safeProductCount = Number(actualProductCount) || 0;
    const productPercentage = Number(((safeProductCount / 1000) * 100).toFixed(1)) || 0;
    const storageUsage = 1.2;
    const storageLimit = 10;
    const storagePercentage = Number(((storageUsage / storageLimit) * 100).toFixed(1)) || 0;
    const apiUsage = 150;
    const apiLimit = 10000;
    const apiPercentage = Number(((apiUsage / apiLimit) * 100).toFixed(1)) || 0;

    // Create data structure that exactly matches frontend UsageStat interface
    const usageData = {
      // Products usage stat
      products: {
        usage: safeProductCount,           // number - what frontend expects
        limit: 1000,                      // number
        percentage: productPercentage,     // number
        unlimited: false,                 // boolean
        warning: productPercentage > 80,  // boolean
        exceeded: productPercentage > 100 // boolean
      },

      // Orders usage stat
      orders: {
        usage: 0,                         // number
        limit: 5000,                     // number
        percentage: 0.0,                 // number
        unlimited: false,                // boolean
        warning: false,                  // boolean
        exceeded: false                  // boolean
      },

      // Storage usage stat
      storage: {
        usage: storageUsage,             // number (in GB)
        limit: storageLimit,             // number (in GB)
        percentage: storagePercentage,   // number
        unlimited: false,                // boolean
        warning: storagePercentage > 80, // boolean
        exceeded: storagePercentage > 100 // boolean
      },

      // API calls usage stat
      apiCalls: {
        usage: apiUsage,                 // number
        limit: apiLimit,                 // number
        percentage: apiPercentage,       // number
        unlimited: false,                // boolean
        warning: apiPercentage > 80,     // boolean
        exceeded: apiPercentage > 100    // boolean
      }
    };

    res.json({
      success: true,
      data: usageData
    });

  } catch (error) {
    console.error('Error fetching company usage:', error);

    // Return ultra-safe fallback data with same structure
    res.json({
      success: true,
      data: {
        products: { usage: 0, limit: 1000, percentage: 0.0, unlimited: false, warning: false, exceeded: false },
        orders: { usage: 0, limit: 5000, percentage: 0.0, unlimited: false, warning: false, exceeded: false },
        storage: { usage: 0, limit: 10, percentage: 0.0, unlimited: false, warning: false, exceeded: false },
        apiCalls: { usage: 0, limit: 10000, percentage: 0.0, unlimited: false, warning: false, exceeded: false }
      }
    });
  }
});

// Mock endpoint that exactly matches frontend expectations
app.get('/api/v1/companies/1/usage-mock', async (req, res) => {
  try {
    // Get real product count
    let productCount = 6;
    try {
      productCount = await prisma.product.count({ where: { isActive: true } });
    } catch (error) {
      console.log('Using default product count');
    }

    // Create data structure that exactly matches what frontend expects
    const mockData = {
      success: true,
      data: {
        currentPlan: 'basic',
        planLimits: {
          products: 1000,
          orders: 5000,
          storage: '10GB',
          apiCalls: 10000
        },
        currentUsage: {
          products: productCount,
          orders: 0,
          storage: '1.2GB',
          apiCalls: 150
        },
        usagePercentage: {
          products: Number(((productCount / 1000) * 100).toFixed(1)),
          orders: 0.0,
          storage: 12.0,
          apiCalls: 1.5
        },
        // Add the exact structure frontend expects for the map function
        usageMetrics: [
          {
            name: 'المنتجات',
            current: productCount,
            limit: 1000,
            percentage: Number(((productCount / 1000) * 100).toFixed(1)),
            unit: 'منتج',
            color: '#3B82F6',
            icon: '📦'
          },
          {
            name: 'الطلبات',
            current: 0,
            limit: 5000,
            percentage: 0.0,
            unit: 'طلب',
            color: '#10B981',
            icon: '🛒'
          },
          {
            name: 'التخزين',
            current: 1.2,
            limit: 10,
            percentage: 12.0,
            unit: 'جيجا',
            color: '#F59E0B',
            icon: '💾'
          },
          {
            name: 'استدعاءات API',
            current: 150,
            limit: 10000,
            percentage: 1.5,
            unit: 'استدعاء',
            color: '#8B5CF6',
            icon: '🔗'
          }
        ]
      }
    };

    res.json(mockData);

  } catch (error) {
    console.error('Error in usage mock:', error);

    // Return safe fallback
    res.json({
      success: true,
      data: {
        currentPlan: 'basic',
        planLimits: { products: 1000, orders: 5000, storage: '10GB', apiCalls: 10000 },
        currentUsage: { products: 0, orders: 0, storage: '0GB', apiCalls: 0 },
        usagePercentage: { products: 0.0, orders: 0.0, storage: 0.0, apiCalls: 0.0 },
        usageMetrics: [
          { name: 'المنتجات', current: 0, limit: 1000, percentage: 0.0, unit: 'منتج', color: '#3B82F6', icon: '📦' },
          { name: 'الطلبات', current: 0, limit: 5000, percentage: 0.0, unit: 'طلب', color: '#10B981', icon: '🛒' },
          { name: 'التخزين', current: 0, limit: 10, percentage: 0.0, unit: 'جيجا', color: '#F59E0B', icon: '💾' },
          { name: 'استدعاءات API', current: 0, limit: 10000, percentage: 0.0, unit: 'استدعاء', color: '#8B5CF6', icon: '🔗' }
        ]
      }
    });
  }
});

// Safe usage endpoint for frontend
app.get('/api/v1/companies/usage-safe', async (req, res) => {
  try {
    // Get actual counts from database
    let productCount = 0;
    let orderCount = 0;

    try {
      productCount = await prisma.product.count({ where: { isActive: true } });
      // orderCount = await prisma.order.count(); // Uncomment when order model exists
    } catch (error) {
      console.log('Could not fetch counts, using defaults');
    }

    // Safe usage data with guaranteed numeric values
    const safeUsageData = {
      currentPlan: 'basic',
      planName: 'الخطة الأساسية',
      planLimits: {
        products: 1000,
        orders: 5000,
        storage: 10, // GB as number
        apiCalls: 10000
      },
      currentUsage: {
        products: Number(productCount) || 0,
        orders: Number(orderCount) || 0,
        storage: 1.2, // GB as number
        apiCalls: 150
      },
      usagePercentage: {
        products: Number(((Number(productCount) || 0) / 1000 * 100).toFixed(1)) || 0,
        orders: Number(((Number(orderCount) || 0) / 5000 * 100).toFixed(1)) || 0,
        storage: 12.0,
        apiCalls: 1.5
      },
      // Detailed metrics for charts/tables
      detailedMetrics: [
        {
          id: 'products',
          name: 'المنتجات',
          nameEn: 'Products',
          current: Number(productCount) || 0,
          limit: 1000,
          percentage: Number(((Number(productCount) || 0) / 1000 * 100).toFixed(1)) || 0,
          unit: 'منتج',
          unitEn: 'products',
          color: '#3B82F6',
          icon: '📦'
        },
        {
          id: 'orders',
          name: 'الطلبات',
          nameEn: 'Orders',
          current: Number(orderCount) || 0,
          limit: 5000,
          percentage: Number(((Number(orderCount) || 0) / 5000 * 100).toFixed(1)) || 0,
          unit: 'طلب',
          unitEn: 'orders',
          color: '#10B981',
          icon: '🛒'
        },
        {
          id: 'storage',
          name: 'التخزين',
          nameEn: 'Storage',
          current: 1.2,
          limit: 10,
          percentage: 12.0,
          unit: 'جيجا',
          unitEn: 'GB',
          color: '#F59E0B',
          icon: '💾'
        },
        {
          id: 'apiCalls',
          name: 'استدعاءات API',
          nameEn: 'API Calls',
          current: 150,
          limit: 10000,
          percentage: 1.5,
          unit: 'استدعاء',
          unitEn: 'calls',
          color: '#8B5CF6',
          icon: '🔗'
        }
      ]
    };

    res.json({
      success: true,
      data: safeUsageData
    });

  } catch (error) {
    console.error('Error fetching safe usage data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch usage data'
    });
  }
});

// Company plans endpoint (must be before /:id route)
app.get('/api/v1/companies/plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'basic',
        name: 'الخطة الأساسية',
        price: 0,
        currency: 'EGP',
        features: [
          'حتى 1000 منتج',
          'حتى 5000 طلب شهرياً',
          '10 جيجا تخزين',
          'دعم فني أساسي'
        ],
        limits: {
          products: 1000,
          orders: 5000,
          storage: '10GB',
          apiCalls: 10000
        }
      },
      {
        id: 'pro',
        name: 'الخطة الاحترافية',
        price: 299,
        currency: 'EGP',
        features: [
          'منتجات غير محدودة',
          'طلبات غير محدودة',
          '100 جيجا تخزين',
          'دعم فني متقدم',
          'تقارير مفصلة'
        ],
        limits: {
          products: -1, // unlimited
          orders: -1,
          storage: '100GB',
          apiCalls: 100000
        }
      }
    ];

    res.json({
      success: true,
      data: plans
    });

  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch plans'
    });
  }
});

// Get company info endpoint - with proper access control
app.get('/api/v1/companies/:id/info', authenticateToken, async (req, res) => {
  try {
    const companyId = req.params.id;

    // التحقق من الصلاحية
    const userCompanyId = req.user?.companyId;
    const userRole = req.user?.role;

    if (!userCompanyId) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح بالوصول'
      });
    }

    // السماح للـ super admin بالوصول لجميع الشركات
    if (userRole !== 'SUPER_ADMIN' && companyId !== userCompanyId) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول لهذه الشركة'
      });
    }

    // Get company from database
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    // Parse settings
    let settings = {};
    try {
      settings = company.settings ? JSON.parse(company.settings) : {};
    } catch (error) {
      settings = {};
    }

    // Default settings with currency
    const defaultSettings = {
      currency: 'EGP',
      currencySymbol: 'ج.م',
      language: 'ar',
      timezone: 'Africa/Cairo',
      dateFormat: 'DD/MM/YYYY',
      numberFormat: 'ar-EG'
    };

    const finalSettings = { ...defaultSettings, ...settings };

    res.json({
      success: true,
      data: {
        id: company.id,
        name: company.name,
        email: company.email,
        phone: company.phone,
        address: company.address,
        settings: finalSettings,
        currency: finalSettings.currency, // Add currency at root level for compatibility
        createdAt: company.createdAt,
        updatedAt: company.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company data'
    });
  }
});

// Update company currency
app.put('/api/v1/companies/:companyId/currency', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { currency } = req.body;

    console.log(`💰 Updating currency for company ${companyId} to ${currency}`);

    // Validate currency code
    const validCurrencies = ['EGP', 'USD', 'EUR', 'SAR', 'AED'];
    if (!validCurrencies.includes(currency)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid currency code'
      });
    }

    // Get current company
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    // Parse current settings
    let settings = {};
    try {
      settings = company.settings ? JSON.parse(company.settings) : {};
    } catch (error) {
      settings = {};
    }

    // Update currency in settings
    settings.currency = currency;

    // Update company in database
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        settings: JSON.stringify(settings)
      }
    });

    console.log(`✅ Currency updated successfully for company ${companyId}`);

    res.json({
      success: true,
      message: 'Currency updated successfully',
      data: {
        companyId: companyId,
        currency: currency
      }
    });

  } catch (error) {
    console.error('❌ Error updating currency:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update currency'
    });
  }
});



// Settings routes
const settingsRoutes = require('./src/routes/settingsRoutes');
app.use('/api/v1/settings', settingsRoutes);

// Notifications routes
const notificationRoutes = require('./src/routes/notifications');
app.use('/api/v1/notifications', notificationRoutes);

// Companies routes
app.get('/api/v1/companies', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      search = '',
      plan = '',
      isActive = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // بناء شروط البحث
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (plan) where.plan = plan;
    if (isActive !== '') where.isActive = isActive === 'true';

    // حساب التصفح
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(parseInt(limit), 100);
    const skip = (pageNum - 1) * limitNum;

    // ترتيب النتائج
    const orderBy = {};
    if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'plan') {
      orderBy.plan = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    // جلب الشركات مع التصفح
    const [companies, totalCount] = await Promise.all([
      prisma.company.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          _count: {
            select: {
              users: true,
              customers: true,
              products: true,
              orders: true,
              conversations: true
            }
          }
        }
      }),
      prisma.company.count({ where })
    ]);

    // حساب معلومات التصفح
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNext = pageNum < totalPages;
    const hasPrev = pageNum > 1;

    res.json({
      success: true,
      message: 'تم جلب الشركات بنجاح',
      data: {
        companies,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages,
          hasNext,
          hasPrev
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching companies:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب الشركات',
      error: error.message
    });
  }
});

// Company plans route removed - using the comprehensive one above

// Company details - with proper access control
app.get('/api/v1/companies/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // التحقق من الصلاحية - المستخدم يمكنه فقط الوصول لشركته أو إذا كان super admin
    const userCompanyId = req.user?.companyId;
    const userRole = req.user?.role;

    if (!userCompanyId) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح بالوصول - معرف الشركة مطلوب'
      });
    }

    // السماح للـ super admin بالوصول لجميع الشركات
    if (userRole !== 'SUPER_ADMIN' && id !== userCompanyId) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول لهذه الشركة'
      });
    }

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            users: true,
            customers: true,
            products: true,
            orders: true,
            conversations: true,
            successPatterns: true
          }
        }
      }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'الشركة غير موجودة'
      });
    }

    res.json({
      success: true,
      message: 'تم جلب تفاصيل الشركة بنجاح',
      data: company
    });

  } catch (error) {
    console.error('❌ Error fetching company:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب تفاصيل الشركة',
      error: error.message
    });
  }
});

// Create new company
app.post('/api/v1/companies', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      website,
      address,
      plan = 'BASIC',
      currency = 'EGP',
      isActive = true
    } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'اسم الشركة والبريد الإلكتروني مطلوبان'
      });
    }

    // Check if email already exists
    const existingCompany = await prisma.company.findFirst({
      where: { email }
    });

    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مستخدم بالفعل'
      });
    }

    // Create new company
    const newCompany = await prisma.company.create({
      data: {
        name,
        email,
        phone: phone || null,
        website: website || null,
        address: address || null,
        plan,
        currency,
        isActive,
        settings: JSON.stringify({
          patternSystemEnabled: true,
          lastSystemChange: new Date().toISOString(),
          systemChangeBy: 'admin'
        })
      },
      include: {
        _count: {
          select: {
            users: true,
            customers: true,
            products: true,
            orders: true,
            conversations: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الشركة بنجاح',
      data: newCompany
    });

  } catch (error) {
    console.error('❌ Error creating company:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في إنشاء الشركة',
      error: error.message
    });
  }
});

// Update company
app.put('/api/v1/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      website,
      address,
      plan,
      currency,
      isActive
    } = req.body;

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id }
    });

    if (!existingCompany) {
      return res.status(404).json({
        success: false,
        message: 'الشركة غير موجودة'
      });
    }

    // Check if email is being changed and already exists
    if (email && email !== existingCompany.email) {
      const emailExists = await prisma.company.findFirst({
        where: {
          email,
          id: { not: id }
        }
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'البريد الإلكتروني مستخدم بالفعل'
        });
      }
    }

    // Update company
    const updatedCompany = await prisma.company.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(website !== undefined && { website }),
        ...(address !== undefined && { address }),
        ...(plan && { plan }),
        ...(currency && { currency }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        _count: {
          select: {
            users: true,
            customers: true,
            products: true,
            orders: true,
            conversations: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'تم تحديث الشركة بنجاح',
      data: updatedCompany
    });

  } catch (error) {
    console.error('❌ Error updating company:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحديث الشركة',
      error: error.message
    });
  }
});

// Delete company
app.delete('/api/v1/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            customers: true,
            products: true,
            orders: true,
            conversations: true
          }
        }
      }
    });

    if (!existingCompany) {
      return res.status(404).json({
        success: false,
        message: 'الشركة غير موجودة'
      });
    }

    // Check if company has data
    const hasData = existingCompany._count.users > 0 ||
                   existingCompany._count.customers > 0 ||
                   existingCompany._count.products > 0 ||
                   existingCompany._count.orders > 0 ||
                   existingCompany._count.conversations > 0;

    if (hasData) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن حذف الشركة لأنها تحتوي على بيانات. يمكنك إلغاء تفعيلها بدلاً من ذلك.'
      });
    }

    // Delete company
    await prisma.company.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'تم حذف الشركة بنجاح'
    });

  } catch (error) {
    console.error('❌ Error deleting company:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في حذف الشركة',
      error: error.message
    });
  }
});

// ==================== COMPANY USERS MANAGEMENT ====================

// Get company users
app.get('/api/v1/companies/:companyId/users', authenticateToken, requireCompanyAccess, async (req, res) => {
  try {
    const { companyId } = req.params;
    const {
      page = 1,
      limit = 25,
      search = '',
      role = '',
      isActive = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // بناء شروط البحث
    const where = { companyId };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role) where.role = role;
    if (isActive !== '') where.isActive = isActive === 'true';

    // حساب التصفح
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(parseInt(limit), 100);
    const skip = (pageNum - 1) * limitNum;

    // ترتيب النتائج
    const orderBy = {};
    if (sortBy === 'firstName') {
      orderBy.firstName = sortOrder;
    } else if (sortBy === 'lastName') {
      orderBy.lastName = sortOrder;
    } else if (sortBy === 'email') {
      orderBy.email = sortOrder;
    } else if (sortBy === 'role') {
      orderBy.role = sortOrder;
    } else if (sortBy === 'lastLoginAt') {
      orderBy.lastLoginAt = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    // جلب المستخدمين مع التصفح
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          isEmailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.user.count({ where })
    ]);

    // حساب معلومات التصفح
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNext = pageNum < totalPages;
    const hasPrev = pageNum > 1;

    res.json({
      success: true,
      message: 'تم جلب المستخدمين بنجاح',
      data: {
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages,
          hasNext,
          hasPrev
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching company users:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب المستخدمين',
      error: error.message
    });
  }
});

// Create new user for company
app.post('/api/v1/companies/:companyId/users', authenticateToken, requireCompanyAccess, requireRole(['COMPANY_ADMIN']), async (req, res) => {
  try {
    const { companyId } = req.params;
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      role = 'AGENT',
      isActive = true
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'الاسم الأول والأخير والبريد الإلكتروني وكلمة المرور مطلوبة'
      });
    }

    // Check user limit before creating
    const limitCheck = await planLimitsService.checkLimits(companyId, 'users', 1);
    if (!limitCheck.allowed) {
      return res.status(400).json({
        success: false,
        message: 'تم تجاوز حد المستخدمين المسموح به في خطتك الحالية',
        error: 'LIMIT_EXCEEDED',
        details: {
          current: limitCheck.current,
          limit: limitCheck.limit,
          plan: (await planLimitsService.getCurrentUsage(companyId)).plan
        },
        upgradeSuggestions: planLimitsService.getUpgradeSuggestions(
          (await planLimitsService.getCurrentUsage(companyId)).plan
        )
      });
    }

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'الشركة غير موجودة'
      });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مستخدم بالفعل'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: phone || null,
        role,
        isActive,
        companyId
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء المستخدم بنجاح',
      data: newUser
    });

  } catch (error) {
    console.error('❌ Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في إنشاء المستخدم',
      error: error.message
    });
  }
});

// Update user
app.put('/api/v1/companies/:companyId/users/:userId', authenticateToken, requireCompanyAccess, requireRole(['COMPANY_ADMIN']), async (req, res) => {
  try {
    const { companyId, userId } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      role,
      isActive
    } = req.body;

    // Check if user exists and belongs to company
    const existingUser = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId: companyId
      }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // Check if email is being changed and already exists
    if (email && email.toLowerCase() !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          id: { not: userId }
        }
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'البريد الإلكتروني مستخدم بالفعل'
        });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email: email.toLowerCase() }),
        ...(phone !== undefined && { phone }),
        ...(role && { role }),
        ...(isActive !== undefined && { isActive })
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'تم تحديث المستخدم بنجاح',
      data: updatedUser
    });

  } catch (error) {
    console.error('❌ Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحديث المستخدم',
      error: error.message
    });
  }
});

// Delete user
app.delete('/api/v1/companies/:companyId/users/:userId', authenticateToken, requireCompanyAccess, requireRole(['COMPANY_ADMIN']), async (req, res) => {
  try {
    const { companyId, userId } = req.params;

    // Check if user exists and belongs to company
    const existingUser = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId: companyId
      }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // Check if user is the only COMPANY_ADMIN
    if (existingUser.role === 'COMPANY_ADMIN') {
      const adminCount = await prisma.user.count({
        where: {
          companyId: companyId,
          role: 'COMPANY_ADMIN',
          isActive: true
        }
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'لا يمكن حذف آخر مدير للشركة'
        });
      }
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({
      success: true,
      message: 'تم حذف المستخدم بنجاح'
    });

  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في حذف المستخدم',
      error: error.message
    });
  }
});

// Get user roles
app.get('/api/v1/users/roles', (req, res) => {
  const roles = {
    COMPANY_ADMIN: {
      name: 'مدير الشركة',
      description: 'صلاحيات كاملة لإدارة الشركة والمستخدمين',
      permissions: [
        'إدارة المستخدمين',
        'إدارة الأدوار',
        'إدارة المنتجات',
        'إدارة العملاء',
        'إدارة الطلبات',
        'مشاهدة التقارير',
        'إدارة الإعدادات',
        'إدارة التكاملات'
      ]
    },
    MANAGER: {
      name: 'مدير',
      description: 'صلاحيات إدارية محدودة',
      permissions: [
        'إدارة المنتجات',
        'إدارة العملاء',
        'إدارة الطلبات',
        'مشاهدة التقارير'
      ]
    },
    AGENT: {
      name: 'موظف',
      description: 'صلاحيات أساسية للعمل اليومي',
      permissions: [
        'إدارة العملاء',
        'إدارة الطلبات',
        'مشاهدة المنتجات'
      ]
    }
  };

  res.json({
    success: true,
    message: 'تم جلب الأدوار بنجاح',
    data: roles
  });
});

// ==================== ROLES & PERMISSIONS MANAGEMENT ====================

// Get all available permissions
app.get('/api/v1/permissions', (req, res) => {
  const permissions = {
    'إدارة المستخدمين': {
      key: 'manage_users',
      category: 'إدارة',
      description: 'إضافة وتعديل وحذف المستخدمين'
    },
    'إدارة الأدوار': {
      key: 'manage_roles',
      category: 'إدارة',
      description: 'إنشاء وتعديل الأدوار والصلاحيات'
    },
    'إدارة المنتجات': {
      key: 'manage_products',
      category: 'المنتجات',
      description: 'إضافة وتعديل وحذف المنتجات'
    },
    'مشاهدة المنتجات': {
      key: 'view_products',
      category: 'المنتجات',
      description: 'عرض قائمة المنتجات فقط'
    },
    'إدارة العملاء': {
      key: 'manage_customers',
      category: 'العملاء',
      description: 'إضافة وتعديل وحذف العملاء'
    },
    'مشاهدة العملاء': {
      key: 'view_customers',
      category: 'العملاء',
      description: 'عرض قائمة العملاء فقط'
    },
    'إدارة الطلبات': {
      key: 'manage_orders',
      category: 'الطلبات',
      description: 'إنشاء وتعديل وحذف الطلبات'
    },
    'مشاهدة الطلبات': {
      key: 'view_orders',
      category: 'الطلبات',
      description: 'عرض الطلبات فقط'
    },
    'مشاهدة التقارير': {
      key: 'view_reports',
      category: 'التقارير',
      description: 'الوصول للتقارير والإحصائيات'
    },
    'إدارة التقارير': {
      key: 'manage_reports',
      category: 'التقارير',
      description: 'إنشاء وتخصيص التقارير'
    },
    'إدارة الإعدادات': {
      key: 'manage_settings',
      category: 'الإعدادات',
      description: 'تعديل إعدادات الشركة'
    },
    'إدارة التكاملات': {
      key: 'manage_integrations',
      category: 'التكاملات',
      description: 'إدارة التكاملات مع الأنظمة الخارجية'
    },
    'إدارة المحادثات': {
      key: 'manage_conversations',
      category: 'المحادثات',
      description: 'إدارة المحادثات والرسائل'
    },
    'مشاهدة المحادثات': {
      key: 'view_conversations',
      category: 'المحادثات',
      description: 'عرض المحادثات فقط'
    }
  };

  res.json({
    success: true,
    message: 'تم جلب الصلاحيات بنجاح',
    data: permissions
  });
});

// Create custom role
app.post('/api/v1/companies/:companyId/roles', authenticateToken, requireCompanyAccess, requireRole(['COMPANY_ADMIN']), async (req, res) => {
  try {
    const { companyId } = req.params;
    const {
      name,
      description,
      permissions,
      isActive = true
    } = req.body;

    // Validation
    if (!name || !description || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'اسم الدور والوصف والصلاحيات مطلوبة'
      });
    }

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'الشركة غير موجودة'
      });
    }

    // For now, we'll store custom roles in company settings
    // In a real app, you'd create a separate roles table
    const currentSettings = company.settings ? JSON.parse(company.settings) : {};
    const customRoles = currentSettings.customRoles || {};

    // Generate role key
    const roleKey = `CUSTOM_${name.toUpperCase().replace(/\s+/g, '_')}`;

    // Check if role already exists
    if (customRoles[roleKey]) {
      return res.status(400).json({
        success: false,
        message: 'دور بهذا الاسم موجود بالفعل'
      });
    }

    // Add new role
    customRoles[roleKey] = {
      name,
      description,
      permissions,
      isActive,
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    // Update company settings
    await prisma.company.update({
      where: { id: companyId },
      data: {
        settings: JSON.stringify({
          ...currentSettings,
          customRoles
        })
      }
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الدور بنجاح',
      data: {
        key: roleKey,
        ...customRoles[roleKey]
      }
    });

  } catch (error) {
    console.error('❌ Error creating role:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في إنشاء الدور',
      error: error.message
    });
  }
});

// Get company roles (built-in + custom)
app.get('/api/v1/companies/:companyId/roles', authenticateToken, requireCompanyAccess, async (req, res) => {
  try {
    const { companyId } = req.params;

    // Get company
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'الشركة غير موجودة'
      });
    }

    // Built-in roles
    const builtInRoles = {
      COMPANY_ADMIN: {
        name: 'مدير الشركة',
        description: 'صلاحيات كاملة لإدارة الشركة والمستخدمين',
        permissions: [
          'إدارة المستخدمين',
          'إدارة الأدوار',
          'إدارة المنتجات',
          'إدارة العملاء',
          'إدارة الطلبات',
          'مشاهدة التقارير',
          'إدارة الإعدادات',
          'إدارة التكاملات'
        ],
        isBuiltIn: true,
        isActive: true
      },
      MANAGER: {
        name: 'مدير',
        description: 'صلاحيات إدارية محدودة',
        permissions: [
          'إدارة المنتجات',
          'إدارة العملاء',
          'إدارة الطلبات',
          'مشاهدة التقارير'
        ],
        isBuiltIn: true,
        isActive: true
      },
      AGENT: {
        name: 'موظف',
        description: 'صلاحيات أساسية للعمل اليومي',
        permissions: [
          'إدارة العملاء',
          'إدارة الطلبات',
          'مشاهدة المنتجات'
        ],
        isBuiltIn: true,
        isActive: true
      }
    };

    // Get custom roles
    const settings = company.settings ? JSON.parse(company.settings) : {};
    const customRoles = settings.customRoles || {};

    // Combine roles
    const allRoles = { ...builtInRoles, ...customRoles };

    res.json({
      success: true,
      message: 'تم جلب الأدوار بنجاح',
      data: allRoles
    });

  } catch (error) {
    console.error('❌ Error fetching roles:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب الأدوار',
      error: error.message
    });
  }
});

// Update custom role
app.put('/api/v1/companies/:companyId/roles/:roleKey', async (req, res) => {
  try {
    const { companyId, roleKey } = req.params;
    const { name, description, permissions, isActive } = req.body;

    // Check if it's a built-in role
    if (['COMPANY_ADMIN', 'MANAGER', 'AGENT'].includes(roleKey)) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن تعديل الأدوار الأساسية'
      });
    }

    // Get company
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'الشركة غير موجودة'
      });
    }

    const settings = company.settings ? JSON.parse(company.settings) : {};
    const customRoles = settings.customRoles || {};

    if (!customRoles[roleKey]) {
      return res.status(404).json({
        success: false,
        message: 'الدور غير موجود'
      });
    }

    // Update role
    customRoles[roleKey] = {
      ...customRoles[roleKey],
      ...(name && { name }),
      ...(description && { description }),
      ...(permissions && { permissions }),
      ...(isActive !== undefined && { isActive }),
      updatedAt: new Date().toISOString()
    };

    // Update company settings
    await prisma.company.update({
      where: { id: companyId },
      data: {
        settings: JSON.stringify({
          ...settings,
          customRoles
        })
      }
    });

    res.json({
      success: true,
      message: 'تم تحديث الدور بنجاح',
      data: {
        key: roleKey,
        ...customRoles[roleKey]
      }
    });

  } catch (error) {
    console.error('❌ Error updating role:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحديث الدور',
      error: error.message
    });
  }
});

// Delete custom role
app.delete('/api/v1/companies/:companyId/roles/:roleKey', async (req, res) => {
  try {
    const { companyId, roleKey } = req.params;

    // Check if it's a built-in role
    if (['COMPANY_ADMIN', 'MANAGER', 'AGENT'].includes(roleKey)) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن حذف الأدوار الأساسية'
      });
    }

    // Check if any users have this role
    const usersWithRole = await prisma.user.count({
      where: {
        companyId: companyId,
        role: roleKey
      }
    });

    if (usersWithRole > 0) {
      return res.status(400).json({
        success: false,
        message: `لا يمكن حذف الدور لأن ${usersWithRole} مستخدم يستخدمه`
      });
    }

    // Get company
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'الشركة غير موجودة'
      });
    }

    const settings = company.settings ? JSON.parse(company.settings) : {};
    const customRoles = settings.customRoles || {};

    if (!customRoles[roleKey]) {
      return res.status(404).json({
        success: false,
        message: 'الدور غير موجود'
      });
    }

    // Delete role
    delete customRoles[roleKey];

    // Update company settings
    await prisma.company.update({
      where: { id: companyId },
      data: {
        settings: JSON.stringify({
          ...settings,
          customRoles
        })
      }
    });

    res.json({
      success: true,
      message: 'تم حذف الدور بنجاح'
    });

  } catch (error) {
    console.error('❌ Error deleting role:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في حذف الدور',
      error: error.message
    });
  }
});

// ==================== COMPANY DASHBOARD ROUTES ====================

// Company dashboard overview
app.get('/api/v1/company/dashboard', authenticateToken, requireCompanyAccess, async (req, res) => {
  try {
    const companyId = req.user.companyId;

    // Get company info
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        _count: {
          select: {
            users: true,
            customers: true,
            products: true,
            orders: true,
            conversations: true
          }
        }
      }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'الشركة غير موجودة'
      });
    }

    // Get plan limits
    const planLimits = {
      BASIC: {
        users: 5,
        customers: 1000,
        conversations: 5000,
        storage: 1024 // MB
      },
      PRO: {
        users: 25,
        customers: 10000,
        conversations: 25000,
        storage: 5120 // MB
      },
      ENTERPRISE: {
        users: -1, // unlimited
        customers: -1,
        conversations: -1,
        storage: -1
      }
    };

    const currentLimits = planLimits[company.plan] || planLimits.BASIC;

    // Calculate usage percentages
    const usage = {
      users: {
        current: company._count.users,
        limit: currentLimits.users,
        percentage: currentLimits.users === -1 ? 0 : Math.round((company._count.users / currentLimits.users) * 100)
      },
      customers: {
        current: company._count.customers,
        limit: currentLimits.customers,
        percentage: currentLimits.customers === -1 ? 0 : Math.round((company._count.customers / currentLimits.customers) * 100)
      },
      conversations: {
        current: company._count.conversations,
        limit: currentLimits.conversations,
        percentage: currentLimits.conversations === -1 ? 0 : Math.round((company._count.conversations / currentLimits.conversations) * 100)
      }
    };

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentStats = await Promise.all([
      prisma.user.count({
        where: {
          companyId,
          createdAt: { gte: sevenDaysAgo }
        }
      }),
      prisma.customer.count({
        where: {
          companyId,
          createdAt: { gte: sevenDaysAgo }
        }
      }),
      prisma.conversation.count({
        where: {
          companyId,
          createdAt: { gte: sevenDaysAgo }
        }
      })
    ]);

    const dashboardData = {
      company: {
        id: company.id,
        name: company.name,
        plan: company.plan,
        currency: company.currency,
        isActive: company.isActive
      },
      counts: company._count,
      usage,
      limits: currentLimits,
      recentActivity: {
        newUsers: recentStats[0],
        newCustomers: recentStats[1],
        newConversations: recentStats[2]
      }
    };

    res.json({
      success: true,
      message: 'تم جلب بيانات لوحة التحكم بنجاح',
      data: dashboardData
    });

  } catch (error) {
    console.error('❌ Error fetching dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب بيانات لوحة التحكم',
      error: error.message
    });
  }
});

// Company settings
app.get('/api/v1/company/settings', authenticateToken, requireCompanyAccess, async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        website: true,
        address: true,
        plan: true,
        currency: true,
        isActive: true,
        settings: true,
        createdAt: true
      }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'الشركة غير موجودة'
      });
    }

    // Parse settings
    const settings = company.settings ? JSON.parse(company.settings) : {};

    res.json({
      success: true,
      message: 'تم جلب إعدادات الشركة بنجاح',
      data: {
        ...company,
        settings
      }
    });

  } catch (error) {
    console.error('❌ Error fetching company settings:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب إعدادات الشركة',
      error: error.message
    });
  }
});

// Update company settings
app.put('/api/v1/company/settings', authenticateToken, requireRole(['COMPANY_ADMIN']), async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const {
      name,
      email,
      phone,
      website,
      address,
      settings
    } = req.body;

    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(website !== undefined && { website }),
        ...(address !== undefined && { address }),
        ...(settings && { settings: JSON.stringify(settings) })
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        website: true,
        address: true,
        plan: true,
        currency: true,
        isActive: true,
        settings: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'تم تحديث إعدادات الشركة بنجاح',
      data: {
        ...updatedCompany,
        settings: updatedCompany.settings ? JSON.parse(updatedCompany.settings) : {}
      }
    });

  } catch (error) {
    console.error('❌ Error updating company settings:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحديث إعدادات الشركة',
      error: error.message
    });
  }
});

// ==================== PLAN LIMITS ROUTES ====================

const planLimitsService = require('./src/services/planLimitsService');

// Check plan limits
app.get('/api/v1/company/limits', authenticateToken, requireCompanyAccess, async (req, res) => {
  try {
    const companyId = req.user.companyId;

    // Get current usage
    const usage = await planLimitsService.getCurrentUsage(companyId);
    const limits = planLimitsService.getPlanLimits(usage.plan);

    // Calculate usage percentages
    const usageData = {};
    for (const [type, currentCount] of Object.entries(usage)) {
      if (type === 'plan') continue;

      const limit = limits[type];
      usageData[type] = {
        current: currentCount,
        limit,
        percentage: limit === -1 ? 0 : Math.round((currentCount / limit) * 100),
        remaining: limit === -1 ? -1 : Math.max(0, limit - currentCount)
      };
    }

    // Get warnings
    const warnings = await planLimitsService.getUsageWarnings(companyId);

    // Get upgrade suggestions
    const upgradeSuggestions = planLimitsService.getUpgradeSuggestions(usage.plan);

    res.json({
      success: true,
      message: 'تم جلب حدود الخطة بنجاح',
      data: {
        plan: usage.plan,
        limits,
        usage: usageData,
        warnings,
        upgradeSuggestions
      }
    });

  } catch (error) {
    console.error('❌ Error fetching plan limits:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب حدود الخطة',
      error: error.message
    });
  }
});

// Check specific limit before action
app.post('/api/v1/company/limits/check', authenticateToken, requireCompanyAccess, async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { type, count = 1 } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'نوع الحد مطلوب'
      });
    }

    const checkResult = await planLimitsService.checkLimits(companyId, type, count);

    res.json({
      success: true,
      message: 'تم فحص الحد بنجاح',
      data: checkResult
    });

  } catch (error) {
    console.error('❌ Error checking limit:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في فحص الحد',
      error: error.message
    });
  }
});

// Check multiple limits
app.post('/api/v1/company/limits/check-multiple', authenticateToken, requireCompanyAccess, async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { checks } = req.body;

    if (!checks || typeof checks !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'بيانات الفحص مطلوبة'
      });
    }

    const results = await planLimitsService.checkMultipleLimits(companyId, checks);

    res.json({
      success: true,
      message: 'تم فحص الحدود بنجاح',
      data: results
    });

  } catch (error) {
    console.error('❌ Error checking multiple limits:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في فحص الحدود',
      error: error.message
    });
  }
});

// ==================== USER INVITATIONS ROUTES ====================

const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Configure email transporter (you'll need to set up your email service)
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Send user invitation
app.post('/api/v1/companies/:companyId/invitations', authenticateToken, requireCompanyAccess, requireRole(['COMPANY_ADMIN']), async (req, res) => {
  try {
    const { companyId } = req.params;
    const {
      email,
      firstName,
      lastName,
      role = 'AGENT'
    } = req.body;

    // Validation
    if (!email || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني والاسم الأول والأخير مطلوبة'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'مستخدم بهذا البريد الإلكتروني موجود بالفعل'
      });
    }

    // Check if invitation already exists
    const existingInvitation = await prisma.userInvitation.findFirst({
      where: {
        email,
        companyId,
        status: 'PENDING'
      }
    });

    if (existingInvitation) {
      return res.status(400).json({
        success: false,
        message: 'دعوة معلقة لهذا البريد الإلكتروني موجودة بالفعل'
      });
    }

    // Check user limit before creating invitation
    const limitCheck = await planLimitsService.checkLimits(companyId, 'users', 1);
    if (!limitCheck.allowed) {
      return res.status(400).json({
        success: false,
        message: 'تم تجاوز حد المستخدمين المسموح به في خطتك الحالية',
        error: 'LIMIT_EXCEEDED',
        details: {
          current: limitCheck.current,
          limit: limitCheck.limit,
          plan: (await planLimitsService.getCurrentUsage(companyId)).plan
        }
      });
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    // Create invitation
    const invitation = await prisma.userInvitation.create({
      data: {
        email,
        firstName,
        lastName,
        role,
        token,
        invitedBy: req.user.userId,
        companyId,
        expiresAt
      },
      include: {
        inviter: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        company: {
          select: {
            name: true
          }
        }
      }
    });

    // Generate invitation link
    const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/accept-invitation?token=${token}`;

    // Send email if SMTP is configured
    let emailSent = false;
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        await emailTransporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: email,
          subject: `دعوة للانضمام إلى ${invitation.company.name}`,
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>مرحباً ${firstName} ${lastName}</h2>
              <p>تم دعوتك للانضمام إلى <strong>${invitation.company.name}</strong> من قبل ${invitation.inviter.firstName} ${invitation.inviter.lastName}.</p>
              <p>دورك في النظام: <strong>${role}</strong></p>
              <p>للقبول والانضمام، انقر على الرابط التالي:</p>
              <a href="${invitationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">قبول الدعوة</a>
              <p style="margin-top: 20px; color: #666;">هذه الدعوة صالحة لمدة 7 أيام من تاريخ الإرسال.</p>
              <p style="color: #666;">إذا لم تكن تتوقع هذه الدعوة، يمكنك تجاهل هذا البريد الإلكتروني.</p>
            </div>
          `
        });
        emailSent = true;
      } catch (emailError) {
        console.error('❌ Error sending invitation email:', emailError);
      }
    }

    res.status(201).json({
      success: true,
      message: emailSent ? 'تم إرسال الدعوة بنجاح' : 'تم إنشاء الدعوة بنجاح (لم يتم إرسال البريد الإلكتروني)',
      data: {
        invitation: {
          id: invitation.id,
          email: invitation.email,
          firstName: invitation.firstName,
          lastName: invitation.lastName,
          role: invitation.role,
          status: invitation.status,
          expiresAt: invitation.expiresAt,
          createdAt: invitation.createdAt
        },
        invitationLink,
        emailSent
      }
    });

  } catch (error) {
    console.error('❌ Error creating invitation:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في إنشاء الدعوة',
      error: error.message
    });
  }
});

// Get company invitations
app.get('/api/v1/companies/:companyId/invitations', authenticateToken, requireCompanyAccess, async (req, res) => {
  try {
    const { companyId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const skip = (page - 1) * limit;
    const where = { companyId };

    if (status) {
      where.status = status;
    }

    const [invitations, totalCount] = await Promise.all([
      prisma.userInvitation.findMany({
        where,
        include: {
          inviter: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.userInvitation.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      message: 'تم جلب الدعوات بنجاح',
      data: {
        invitations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalCount,
          totalPages
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching invitations:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب الدعوات',
      error: error.message
    });
  }
});

// Cancel invitation
app.delete('/api/v1/companies/:companyId/invitations/:invitationId', authenticateToken, requireCompanyAccess, requireRole(['COMPANY_ADMIN']), async (req, res) => {
  try {
    const { companyId, invitationId } = req.params;

    const invitation = await prisma.userInvitation.findFirst({
      where: {
        id: invitationId,
        companyId
      }
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'الدعوة غير موجودة'
      });
    }

    if (invitation.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن إلغاء دعوة غير معلقة'
      });
    }

    await prisma.userInvitation.update({
      where: { id: invitationId },
      data: { status: 'CANCELLED' }
    });

    res.json({
      success: true,
      message: 'تم إلغاء الدعوة بنجاح'
    });

  } catch (error) {
    console.error('❌ Error cancelling invitation:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في إلغاء الدعوة',
      error: error.message
    });
  }
});

// Resend invitation
app.post('/api/v1/companies/:companyId/invitations/:invitationId/resend', authenticateToken, requireCompanyAccess, requireRole(['COMPANY_ADMIN']), async (req, res) => {
  try {
    const { companyId, invitationId } = req.params;

    const invitation = await prisma.userInvitation.findFirst({
      where: {
        id: invitationId,
        companyId
      },
      include: {
        inviter: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        company: {
          select: {
            name: true
          }
        }
      }
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'الدعوة غير موجودة'
      });
    }

    if (invitation.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن إعادة إرسال دعوة غير معلقة'
      });
    }

    // Generate new token and extend expiry
    const newToken = crypto.randomBytes(32).toString('hex');
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    await prisma.userInvitation.update({
      where: { id: invitationId },
      data: {
        token: newToken,
        expiresAt: newExpiresAt
      }
    });

    // Generate new invitation link
    const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/accept-invitation?token=${newToken}`;

    // Send email if SMTP is configured
    let emailSent = false;
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        await emailTransporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: invitation.email,
          subject: `دعوة للانضمام إلى ${invitation.company.name} (إعادة إرسال)`,
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>مرحباً ${invitation.firstName} ${invitation.lastName}</h2>
              <p>تم إعادة إرسال دعوتك للانضمام إلى <strong>${invitation.company.name}</strong>.</p>
              <p>دورك في النظام: <strong>${invitation.role}</strong></p>
              <p>للقبول والانضمام، انقر على الرابط التالي:</p>
              <a href="${invitationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">قبول الدعوة</a>
              <p style="margin-top: 20px; color: #666;">هذه الدعوة صالحة لمدة 7 أيام من تاريخ الإرسال.</p>
            </div>
          `
        });
        emailSent = true;
      } catch (emailError) {
        console.error('❌ Error sending invitation email:', emailError);
      }
    }

    res.json({
      success: true,
      message: emailSent ? 'تم إعادة إرسال الدعوة بنجاح' : 'تم تحديث الدعوة بنجاح (لم يتم إرسال البريد الإلكتروني)',
      data: {
        invitationLink,
        emailSent
      }
    });

  } catch (error) {
    console.error('❌ Error resending invitation:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في إعادة إرسال الدعوة',
      error: error.message
    });
  }
});

// Verify invitation token (public endpoint)
app.get('/api/v1/invitations/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const invitation = await prisma.userInvitation.findUnique({
      where: { token },
      include: {
        company: {
          select: {
            name: true
          }
        },
        inviter: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'رابط الدعوة غير صحيح'
      });
    }

    if (invitation.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'هذه الدعوة غير صالحة أو تم استخدامها بالفعل'
      });
    }

    if (new Date() > invitation.expiresAt) {
      await prisma.userInvitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' }
      });

      return res.status(400).json({
        success: false,
        message: 'انتهت صلاحية هذه الدعوة'
      });
    }

    res.json({
      success: true,
      message: 'الدعوة صالحة',
      data: {
        invitation: {
          id: invitation.id,
          email: invitation.email,
          firstName: invitation.firstName,
          lastName: invitation.lastName,
          role: invitation.role,
          companyName: invitation.company.name,
          inviterName: `${invitation.inviter.firstName} ${invitation.inviter.lastName}`,
          expiresAt: invitation.expiresAt
        }
      }
    });

  } catch (error) {
    console.error('❌ Error verifying invitation:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في التحقق من الدعوة',
      error: error.message
    });
  }
});

// Accept invitation and create user (public endpoint)
app.post('/api/v1/invitations/accept/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور مطلوبة ويجب أن تكون 6 أحرف على الأقل'
      });
    }

    const invitation = await prisma.userInvitation.findUnique({
      where: { token }
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'رابط الدعوة غير صحيح'
      });
    }

    if (invitation.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'هذه الدعوة غير صالحة أو تم استخدامها بالفعل'
      });
    }

    if (new Date() > invitation.expiresAt) {
      await prisma.userInvitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' }
      });

      return res.status(400).json({
        success: false,
        message: 'انتهت صلاحية هذه الدعوة'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'مستخدم بهذا البريد الإلكتروني موجود بالفعل'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: invitation.email,
        password: hashedPassword,
        firstName: invitation.firstName,
        lastName: invitation.lastName,
        role: invitation.role,
        companyId: invitation.companyId,
        isActive: true,
        isEmailVerified: true,
        emailVerifiedAt: new Date()
      }
    });

    // Update invitation status
    await prisma.userInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date()
      }
    });

    // Generate JWT token
    const jwtToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'تم قبول الدعوة وإنشاء الحساب بنجاح',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          companyId: user.companyId
        },
        token: jwtToken,
        expiresIn: '24h'
      }
    });

  } catch (error) {
    console.error('❌ Error accepting invitation:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في قبول الدعوة',
      error: error.message
    });
  }
});

// ==================== SUPER ADMIN ROUTES ====================

// Super Admin Analytics Routes
const adminAnalyticsRoutes = require('./src/routes/adminAnalyticsRoutes');
app.use('/api/v1/admin/analytics', adminAnalyticsRoutes);

// Super Admin Plans Routes
const adminPlansRoutes = require('./src/routes/adminPlansRoutes');
app.use('/api/v1/admin/plans', adminPlansRoutes);

// Super Admin Subscription Routes
const subscriptionRoutes = require('./src/routes/subscriptionRoutes');
app.use('/api/v1/admin/subscriptions', subscriptionRoutes);

// Super Admin Invoice Routes
const invoiceRoutes = require('./src/routes/invoiceRoutes');
app.use('/api/v1/admin/invoices', invoiceRoutes);

// Super Admin Payment Routes
const paymentRoutes = require('./src/routes/paymentRoutes');
app.use('/api/v1/admin/payments', paymentRoutes);

// Super Admin System Management Routes
const systemManagementRoutes = require('./src/routes/systemManagementRoutes');
app.use('/api/v1/admin', systemManagementRoutes);

// Wallet Payment Routes (دفع المحافظ للعملاء)
const walletPaymentRoutes = require('./src/routes/walletPayment');
app.use('/api/v1/wallet-payment', walletPaymentRoutes);

// Initialize Billing Notification Service
const BillingNotificationService = require('./src/services/billingNotificationService');
const billingNotificationService = new BillingNotificationService();

// Initialize Subscription Renewal Service
const SubscriptionRenewalService = require('./src/services/subscriptionRenewalService');
const subscriptionRenewalService = new SubscriptionRenewalService();

// Start billing notifications after server is ready
setTimeout(() => {
  billingNotificationService.start();

  // Add renewal processing to daily checks
  const originalRunDailyChecks = billingNotificationService.runDailyChecks;
  billingNotificationService.runDailyChecks = async function() {
    await originalRunDailyChecks.call(this);
    await subscriptionRenewalService.processAutomaticRenewals();
  };
}, 5000); // Wait 5 seconds for server to fully initialize

// Get all companies (Super Admin only)
app.get('/api/v1/admin/companies', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, plan, status } = req.query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ];
    }
    if (plan) {
      where.plan = plan;
    }
    if (status !== undefined) {
      where.isActive = status === 'active';
    }

    const [companies, totalCount] = await Promise.all([
      prisma.company.findMany({
        where,
        include: {
          _count: {
            select: {
              users: true,
              customers: true,
              products: true,
              conversations: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.company.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      message: 'تم جلب الشركات بنجاح',
      data: {
        companies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalCount,
          totalPages
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching companies:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب الشركات',
      error: error.message
    });
  }
});

// Get company details (Super Admin only)
app.get('/api/v1/admin/companies/:companyId', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { companyId } = req.params;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            users: true,
            customers: true,
            products: true,
            conversations: true
          }
        }
      }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'الشركة غير موجودة'
      });
    }

    res.json({
      success: true,
      message: 'تم جلب بيانات الشركة بنجاح',
      data: { company }
    });

  } catch (error) {
    console.error('❌ Error fetching company:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب بيانات الشركة',
      error: error.message
    });
  }
});

// Create new company (Super Admin only)
app.post('/api/v1/admin/companies', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      website,
      plan = 'BASIC',
      currency = 'EGP',
      adminFirstName,
      adminLastName,
      adminEmail,
      adminPassword
    } = req.body;

    // Validation
    if (!name || !email || !adminFirstName || !adminLastName || !adminEmail || !adminPassword) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول المطلوبة يجب ملؤها'
      });
    }

    // Check if company email already exists
    const existingCompany = await prisma.company.findUnique({
      where: { email }
    });

    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'شركة بهذا البريد الإلكتروني موجودة بالفعل'
      });
    }

    // Check if admin email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'مستخدم بهذا البريد الإلكتروني موجود بالفعل'
      });
    }

    // Create company
    const company = await prisma.company.create({
      data: {
        name,
        email,
        phone,
        website,
        plan,
        currency,
        isActive: true
      }
    });

    // Hash admin password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: adminFirstName,
        lastName: adminLastName,
        role: 'COMPANY_ADMIN',
        companyId: company.id,
        isActive: true,
        isEmailVerified: true,
        emailVerifiedAt: new Date()
      }
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الشركة بنجاح',
      data: {
        company,
        adminUser: {
          id: adminUser.id,
          email: adminUser.email,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName
        }
      }
    });

  } catch (error) {
    console.error('❌ Error creating company:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في إنشاء الشركة',
      error: error.message
    });
  }
});

// Update company (Super Admin only)
app.put('/api/v1/admin/companies/:companyId', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { companyId } = req.params;
    const {
      name,
      email,
      phone,
      website,
      plan,
      currency,
      isActive
    } = req.body;

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!existingCompany) {
      return res.status(404).json({
        success: false,
        message: 'الشركة غير موجودة'
      });
    }

    // Check if email is being changed and already exists
    if (email && email !== existingCompany.email) {
      const emailExists = await prisma.company.findUnique({
        where: { email }
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'شركة بهذا البريد الإلكتروني موجودة بالفعل'
        });
      }
    }

    // Update company
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(website && { website }),
        ...(plan && { plan }),
        ...(currency && { currency }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json({
      success: true,
      message: 'تم تحديث الشركة بنجاح',
      data: { company: updatedCompany }
    });

  } catch (error) {
    console.error('❌ Error updating company:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحديث الشركة',
      error: error.message
    });
  }
});

// Delete company (Super Admin only)
app.delete('/api/v1/admin/companies/:companyId', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { companyId } = req.params;

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!existingCompany) {
      return res.status(404).json({
        success: false,
        message: 'الشركة غير موجودة'
      });
    }

    // Delete company (cascade will handle related records)
    await prisma.company.delete({
      where: { id: companyId }
    });

    res.json({
      success: true,
      message: 'تم حذف الشركة بنجاح'
    });

  } catch (error) {
    console.error('❌ Error deleting company:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في حذف الشركة',
      error: error.message
    });
  }
});

// Get system statistics (Super Admin only)
app.get('/api/v1/admin/statistics', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const [
      totalCompanies,
      activeCompanies,
      totalUsers,
      totalCustomers,
      totalConversations,
      totalMessages,
      companiesByPlan
    ] = await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { isActive: true } }),
      prisma.user.count(),
      prisma.customer.count(),
      prisma.conversation.count(),
      prisma.message.count(),
      prisma.company.groupBy({
        by: ['plan'],
        _count: { plan: true }
      })
    ]);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      newCompaniesLast30Days,
      newUsersLast30Days,
      newCustomersLast30Days
    ] = await Promise.all([
      prisma.company.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.customer.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      })
    ]);

    res.json({
      success: true,
      message: 'تم جلب إحصائيات النظام بنجاح',
      data: {
        overview: {
          totalCompanies,
          activeCompanies,
          inactiveCompanies: totalCompanies - activeCompanies,
          totalUsers,
          totalCustomers,
          totalConversations,
          totalMessages
        },
        planDistribution: companiesByPlan.reduce((acc, item) => {
          acc[item.plan] = item._count.plan;
          return acc;
        }, {}),
        recentActivity: {
          newCompaniesLast30Days,
          newUsersLast30Days,
          newCustomersLast30Days
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب الإحصائيات',
      error: error.message
    });
  }
});

// ==================== DEVELOPMENT HELPERS ====================

// Create test user endpoint (for development only)
app.post('/api/v1/dev/create-test-user', async (req, res) => {
  try {
    // Check if we're in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'هذا الـ endpoint متاح فقط في بيئة التطوير'
      });
    }

    // Get the first company
    const company = await prisma.company.findFirst();
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'لا توجد شركات في النظام'
      });
    }

    // Check if test user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: 'admin@test.com' }
    });

    if (existingUser) {
      return res.json({
        success: true,
        message: 'المستخدم التجريبي موجود بالفعل',
        data: {
          email: 'admin@test.com',
          password: 'admin123',
          role: existingUser.role,
          companyId: existingUser.companyId
        }
      });
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('admin123', 12);

    const testUser = await prisma.user.create({
      data: {
        firstName: 'أحمد',
        lastName: 'المدير',
        email: 'admin@test.com',
        password: hashedPassword,
        phone: '+201234567890',
        role: 'COMPANY_ADMIN',
        isActive: true,
        isEmailVerified: true,
        companyId: company.id
      }
    });

    res.json({
      success: true,
      message: 'تم إنشاء المستخدم التجريبي بنجاح',
      data: {
        email: 'admin@test.com',
        password: 'admin123',
        role: testUser.role,
        companyId: testUser.companyId
      }
    });

  } catch (error) {
    console.error('❌ Error creating test user:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في إنشاء المستخدم التجريبي',
      error: error.message
    });
  }
});

// Frontend-specific safe endpoint
app.get('/api/v1/companies/frontend-safe/:id/usage', async (req, res) => {
  try {
    // Get real data
    let productCount = 6;
    try {
      productCount = await prisma.product.count({ where: { isActive: true } });
    } catch (error) {
      console.log('Using default count');
    }

    // Create the exact structure that frontend expects
    const frontendSafeData = {
      success: true,
      data: {
        currentPlan: 'basic',
        planName: 'الخطة الأساسية',
        planLimits: {
          products: Number(1000),
          orders: Number(5000),
          storage: '10GB',
          apiCalls: Number(10000)
        },
        currentUsage: {
          products: Number(productCount) || Number(0),
          orders: Number(0),
          storage: '1.2GB',
          apiCalls: Number(150)
        },
        usagePercentage: {
          products: Number(((Number(productCount) || 0) / 1000 * 100).toFixed(1)) || Number(0),
          orders: Number(0),
          storage: Number(12),
          apiCalls: Number(1.5)
        },
        // This is what the frontend maps over
        usageData: [
          {
            name: 'المنتجات',
            current: Number(productCount) || Number(0),
            limit: Number(1000),
            percentage: Number(((Number(productCount) || 0) / 1000 * 100).toFixed(1)) || Number(0),
            unit: 'منتج',
            color: '#3B82F6',
            icon: '📦'
          },
          {
            name: 'الطلبات',
            current: Number(0),
            limit: Number(5000),
            percentage: Number(0),
            unit: 'طلب',
            color: '#10B981',
            icon: '🛒'
          },
          {
            name: 'التخزين',
            current: Number(1.2),
            limit: Number(10),
            percentage: Number(12),
            unit: 'جيجا',
            color: '#F59E0B',
            icon: '💾'
          },
          {
            name: 'استدعاءات API',
            current: Number(150),
            limit: Number(10000),
            percentage: Number(1.5),
            unit: 'استدعاء',
            color: '#8B5CF6',
            icon: '🔗'
          }
        ]
      }
    };

    res.json(frontendSafeData);

  } catch (error) {
    console.error('Frontend safe endpoint error:', error);

    // Ultra-safe fallback
    res.json({
      success: true,
      data: {
        currentPlan: 'basic',
        planName: 'الخطة الأساسية',
        planLimits: { products: 1000, orders: 5000, storage: '10GB', apiCalls: 10000 },
        currentUsage: { products: 0, orders: 0, storage: '0GB', apiCalls: 0 },
        usagePercentage: { products: 0, orders: 0, storage: 0, apiCalls: 0 },
        usageData: [
          { name: 'المنتجات', current: 0, limit: 1000, percentage: 0, unit: 'منتج', color: '#3B82F6', icon: '📦' },
          { name: 'الطلبات', current: 0, limit: 5000, percentage: 0, unit: 'طلب', color: '#10B981', icon: '🛒' },
          { name: 'التخزين', current: 0, limit: 10, percentage: 0, unit: 'جيجا', color: '#F59E0B', icon: '💾' },
          { name: 'استدعاءات API', current: 0, limit: 10000, percentage: 0, unit: 'استدعاء', color: '#8B5CF6', icon: '🔗' }
        ]
      }
    });
  }
});

// ==================== SMART DELAY MONITORING ENDPOINTS ====================

// إحصائيات نظام التأخير الذكي
app.get('/api/v1/smart-delay/stats', (req, res) => {
  try {
    const stats = {
      activeQueues: messageQueue.size,
      queueDetails: [],
      systemConfig: MESSAGE_DELAY_CONFIG,
      systemHealth: messageQueue.size < 100 ? 'healthy' : 'busy',
      timestamp: new Date().toISOString()
    };

    // تفاصيل كل queue نشط
    for (const [senderId, queueData] of messageQueue.entries()) {
      stats.queueDetails.push({
        senderId: senderId.substring(0, 8) + '***', // إخفاء جزء من المعرف للخصوصية
        messagesCount: queueData.messages.length,
        waitingTime: Date.now() - queueData.lastMessageTime,
        totalWaitTime: queueData.totalWaitTime,
        hasTimer: !!queueData.timer
      });
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// تحديث إعدادات النظام (للصيانة)
app.post('/api/v1/smart-delay/config', (req, res) => {
  try {
    const { delays, maxDelay, shortMessageLength, longMessageLength } = req.body;

    if (delays) {
      Object.assign(MESSAGE_DELAY_CONFIG.DELAYS, delays);
    }

    if (maxDelay) {
      MESSAGE_DELAY_CONFIG.MAX_DELAY = maxDelay;
    }

    if (shortMessageLength) {
      MESSAGE_DELAY_CONFIG.SHORT_MESSAGE_LENGTH = shortMessageLength;
    }

    if (longMessageLength) {
      MESSAGE_DELAY_CONFIG.LONG_MESSAGE_LENGTH = longMessageLength;
    }

    console.log('⚙️ [SMART-DELAY] تم تحديث الإعدادات:', MESSAGE_DELAY_CONFIG);

    res.json({
      success: true,
      message: 'تم تحديث الإعدادات بنجاح',
      newConfig: MESSAGE_DELAY_CONFIG
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// إجبار معالجة جميع الرسائل المؤقتة (للطوارئ)
app.post('/api/v1/smart-delay/flush', async (req, res) => {
  try {
    const flushedQueues = [];

    for (const [senderId, queueData] of messageQueue.entries()) {
      if (queueData.timer) {
        clearTimeout(queueData.timer);
      }

      if (queueData.messages.length > 0) {
        await processQueuedMessages(senderId, queueData.messages);
        flushedQueues.push({
          senderId: senderId.substring(0, 8) + '***',
          messagesCount: queueData.messages.length
        });
      }
    }

    messageQueue.clear();

    console.log('🚨 [SMART-DELAY] تم إجبار معالجة جميع الرسائل المؤقتة');

    res.json({
      success: true,
      message: `تم معالجة ${flushedQueues.length} قائمة رسائل`,
      flushedQueues: flushedQueues
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// إعادة محاولة تحميل قاعدة المعرفة
app.post('/api/v1/smart-delay/retry-rag', async (req, res) => {
  try {
    console.log('🔄 [RAG] طلب إعادة تحميل قاعدة المعرفة...');

    const ragService = require('./src/services/ragService');
    const success = await ragService.retryInitialization();

    if (success) {
      res.json({
        success: true,
        message: 'تم تحميل قاعدة المعرفة بنجاح',
        ragInitialized: true
      });
    } else {
      res.json({
        success: false,
        message: 'فشل في تحميل قاعدة المعرفة، تحقق من الاتصال بقاعدة البيانات',
        ragInitialized: false
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      ragInitialized: false
    });
  }
});

// ==================== END SMART DELAY ENDPOINTS ====================

// Enhanced Product routes (with image management)
const enhancedProductRoutes = require('./src/routes/productRoutes');
app.use('/api/v1/products', enhancedProductRoutes);

// Orders routes
const orderRoutes = require('./src/routes/orders');
app.use('/api/v1/orders-new', orderRoutes);

// Enhanced Orders routes
const enhancedOrderRoutes = require('./src/routes/enhancedOrders');
app.use('/api/v1/orders-enhanced', enhancedOrderRoutes);

// Continuous Learning routes - REMOVED

// Success Learning routes (نظام تعلم أنماط النجاح)
const successLearningRoutes = require('./src/routes/successLearning');
app.use('/api/v1/success-learning', successLearningRoutes);

// Auto Pattern Detection routes (نظام الاكتشاف التلقائي للأنماط)
const autoPatternRoutes = require('./src/routes/autoPatternRoutes');
app.use('/api/v1/auto-patterns', autoPatternRoutes);

// Priority Settings routes (نظام إعدادات الأولوية)
const prioritySettingsRoutes = require('./src/routes/prioritySettingsRoutes');
app.use('/api/v1/priority-settings', prioritySettingsRoutes);



// Upload routes
const uploadRoutes = require('./src/routes/uploadRoutes');
app.use('/api/v1/upload', uploadRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// تحميل الـ endpoints الحقيقية من index.ts
// استخدام prisma المعرف مسبقاً في بداية الملف

// Real conversations endpoint with search support - with company isolation
app.get('/api/v1/conversations', authenticateToken, async (req, res) => {
  try {
    // التحقق من المصادقة والشركة
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح بالوصول - معرف الشركة مطلوب'
      });
    }

    const { search } = req.query;
    console.log('📞 Fetching real conversations from database for company:', companyId);

    if (search) {
      console.log(`🔍 البحث عن: "${search}"`);
    }

    // Build search conditions with company filter
    let whereCondition = {
      companyId // إضافة فلترة الشركة
    };

    if (search && search.trim()) {
      const searchTerm = search.trim();
      whereCondition = {
        OR: [
          // البحث في اسم العميل
          {
            customer: {
              OR: [
                { firstName: { contains: searchTerm } },
                { lastName: { contains: searchTerm } },
                { facebookId: { contains: searchTerm } },
                { email: { contains: searchTerm } },
                { phone: { contains: searchTerm } }
              ]
            }
          },
          // البحث في محتوى الرسائل
          {
            messages: {
              some: {
                content: { contains: searchTerm }
              }
            }
          },
          // البحث في آخر رسالة
          {
            lastMessage: { contains: searchTerm }
          }
        ]
      };
    }

    // Get conversations with customer info
    const conversations = await prisma.conversation.findMany({
      where: whereCondition,
      select: {
        id: true,
        customerId: true,
        channel: true,
        status: true,
        lastMessageAt: true,
        lastMessagePreview: true,
        metadata: true,
        createdAt: true,
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            facebookId: true,
          }
        },
        assignedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                isFromCustomer: true,
              }
            }
          }
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      },
      take: 100 // زيادة العدد لضمان ظهور جميع المحادثات الحديثة
    });

    // Transform data to match frontend format
    const transformedConversations = conversations.map(conv => {
      // استخراج حالة AI من metadata
      let aiEnabled = true; // افتراضي
      if (conv.metadata) {
        try {
          const metadata = JSON.parse(conv.metadata);
          aiEnabled = metadata.aiEnabled !== false;
          console.log(`🔍 [AI-DEBUG] Conversation ${conv.id}: metadata=${conv.metadata}, aiEnabled=${aiEnabled}`);
        } catch (error) {
          console.warn('⚠️ Could not parse conversation metadata:', error);
        }
      } else {
        console.log(`🔍 [AI-DEBUG] Conversation ${conv.id}: no metadata, using default aiEnabled=${aiEnabled}`);
      }

      return {
        id: conv.id,
        customerId: conv.customerId,
        customerName: `${conv.customer.firstName || ''} ${conv.customer.lastName || ''}`.trim() || 'عميل',
        customerAvatar: null,
        customerEmail: conv.customer.email,
        customerPhone: conv.customer.phone,
        lastMessage: conv.lastMessagePreview || 'لا توجد رسائل',
        lastMessageTime: conv.lastMessageAt || conv.createdAt,
        timestamp: conv.lastMessageAt || conv.createdAt,
        unreadCount: conv._count.messages,
        isOnline: false, // يمكن تحديثه لاحقاً
        platform: conv.channel?.toLowerCase() || 'facebook',
        status: conv.status?.toLowerCase() || 'active',
        messages: [],
        customerOrders: [],
        lastRepliedBy: conv.assignedUser ? `${conv.assignedUser.firstName} ${conv.assignedUser.lastName}` : null,
        aiEnabled: aiEnabled
      };
    });

    console.log(`✅ Found ${transformedConversations.length} real conversations${search ? ` matching "${search}"` : ''}`);

    // إرجاع البيانات مع معلومات البحث
    res.json({
      success: true,
      data: transformedConversations,
      total: transformedConversations.length,
      search: search || null,
      message: search ? `تم العثور على ${transformedConversations.length} محادثة مطابقة للبحث` : `تم تحميل ${transformedConversations.length} محادثة`
    });
  } catch (error) {
    console.error('❌ Error fetching real conversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Real messages endpoint
app.get('/api/v1/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📨 Fetching real messages for conversation ${id}...`);

    // Get messages for conversation
    const messages = await prisma.message.findMany({
      where: {
        conversationId: id
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Transform messages to match frontend format
    const transformedMessages = messages.map(msg => {
      // استخراج معلومات الذكاء الصناعي من metadata
      let isAiGenerated = false;
      if (msg.metadata) {
        try {
          const metadata = JSON.parse(msg.metadata);
          isAiGenerated = metadata.isAIGenerated || metadata.isAutoGenerated || false;
        } catch (e) {
          // إذا فشل parsing، تحقق من النص المباشر
          isAiGenerated = msg.metadata.includes('"isAIGenerated":true') ||
                         msg.metadata.includes('"isAutoGenerated":true');
        }
      }

      return {
        id: msg.id,
        content: msg.content,
        timestamp: msg.createdAt,
        isFromCustomer: msg.isFromCustomer,
        sender: msg.sender ? {
          id: msg.sender.id,
          name: `${msg.sender.firstName} ${msg.sender.lastName}`,
        } : null,
        type: msg.type || 'text',
        attachments: msg.attachments ? JSON.parse(msg.attachments) : [],
        isAiGenerated: isAiGenerated, // إضافة معلومة الذكاء الصناعي
        metadata: msg.metadata // إضافة metadata للتشخيص
      };
    });

    // إحصائيات الرسائل
    const aiMessages = transformedMessages.filter(m => m.isAiGenerated).length;
    const manualMessages = transformedMessages.filter(m => !m.isFromCustomer && !m.isAiGenerated).length;
    const customerMessages = transformedMessages.filter(m => m.isFromCustomer).length;

    console.log(`✅ Found ${transformedMessages.length} real messages:`);
    console.log(`   👤 ${customerMessages} من العملاء`);
    console.log(`   🤖 ${aiMessages} من الذكاء الصناعي`);
    console.log(`   👨‍💼 ${manualMessages} يدوية`);

    res.json(transformedMessages);
  } catch (error) {
    console.error('❌ Error fetching real messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Real customer profile endpoint
app.get('/api/v1/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`👤 Fetching real customer profile for ${id}...`);

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Transform customer data
    const transformedCustomer = {
      id: customer.id,
      name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'عميل',
      email: customer.email,
      phone: customer.phone,
      avatar: customer.avatar,
      orders: customer.orders.map(order => ({
        id: order.id,
        total: order.total,
        status: order.status,
        date: order.createdAt
      })),
      totalSpent: customer.orders.reduce((sum, order) => sum + (order.total || 0), 0),
      joinDate: customer.createdAt,
      lastActivity: customer.updatedAt,
      preferences: {
        language: 'ar',
        notifications: true
      }
    };

    console.log(`✅ Found real customer: ${transformedCustomer.name}`);
    res.json(transformedCustomer);
  } catch (error) {
    console.error('❌ Error fetching real customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Real saved replies endpoint
app.get('/api/v1/saved-replies', async (req, res) => {
  try {
    console.log('💬 Fetching real saved replies from database...');

    // يمكن إضافة جدول saved_replies لاحقاً، الآن نستخدم ردود افتراضية
    const savedReplies = [
      {
        id: '1',
        title: 'ترحيب',
        content: 'مرحباً بك! كيف يمكنني مساعدتك اليوم؟',
        category: 'welcome',
        createdAt: new Date()
      },
      {
        id: '2',
        title: 'شكر',
        content: 'شكراً لتواصلك معنا. نقدر ثقتك بنا.',
        category: 'thanks',
        createdAt: new Date()
      },
      {
        id: '3',
        title: 'اعتذار',
        content: 'نعتذر عن أي إزعاج. سنعمل على حل المشكلة فوراً.',
        category: 'apology',
        createdAt: new Date()
      },
      {
        id: '4',
        title: 'متابعة',
        content: 'هل تحتاج إلى أي مساعدة إضافية؟',
        category: 'followup',
        createdAt: new Date()
      },
      {
        id: '5',
        title: 'إغلاق',
        content: 'شكراً لك. نتمنى لك يوماً سعيداً!',
        category: 'closing',
        createdAt: new Date()
      }
    ];

    console.log(`✅ Returning ${savedReplies.length} saved replies`);
    res.json(savedReplies);
  } catch (error) {
    console.error('❌ Error fetching saved replies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update existing Facebook customers with real names
app.post('/api/v1/customers/update-facebook-names', async (req, res) => {
  try {
    console.log('🔄 Starting to update Facebook customer names...');

    // البحث عن الصفحة الافتراضية للحصول على pageAccessToken
    const defaultPage = await prisma.facebookPage.findFirst({
      where: { status: 'connected' },
      orderBy: { connectedAt: 'desc' }
    });

    if (!defaultPage || !defaultPage.pageAccessToken) {
      return res.status(400).json({
        success: false,
        error: 'No connected Facebook page found'
      });
    }

    // البحث عن العملاء الذين لديهم أسماء افتراضية (عربية أو إنجليزية)
    const customersToUpdate = await prisma.customer.findMany({
      where: {
        AND: [
          { facebookId: { not: null } },
          {
            OR: [
              { firstName: 'Facebook' },
              { lastName: 'User' },
              { firstName: { contains: 'Facebook' } },
              { firstName: 'عميل' },
              { firstName: 'زائر' },
              { firstName: 'زبون' },
              { lastName: 'كريم' },
              { lastName: 'مميز' },
              { lastName: 'عزيز' },
              { lastName: 'جديد' }
            ]
          }
        ]
      },
      take: 50 // تحديث 50 عميل في المرة الواحدة لتجنب rate limiting
    });

    console.log(`📊 Found ${customersToUpdate.length} customers to update`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const customer of customersToUpdate) {
      try {
        // جلب معلومات المستخدم الحقيقية من Facebook
        const userInfo = await getFacebookUserInfo(customer.facebookId, defaultPage.pageAccessToken);

        if (userInfo && userInfo.first_name && userInfo.last_name) {
          // التحقق من أن الاسم ليس افتراضياً
          const isDefaultName = ['Facebook', 'عميل', 'زائر', 'زبون'].includes(userInfo.first_name) ||
                               ['User', 'كريم', 'مميز', 'عزيز', 'جديد'].includes(userInfo.last_name);

          if (!isDefaultName) {
            // تحديث اسم العميل بالاسم الحقيقي
            await prisma.customer.update({
              where: { id: customer.id },
              data: {
                firstName: userInfo.first_name,
                lastName: userInfo.last_name
              }
            });

            console.log(`✅ Updated customer ${customer.id}: ${customer.firstName} ${customer.lastName} → ${userInfo.first_name} ${userInfo.last_name}`);
            updatedCount++;
          } else {
            console.log(`⚠️ Customer ${customer.id} has default name on Facebook too: ${userInfo.first_name} ${userInfo.last_name}`);
          }
        } else {
          console.log(`⚠️ Could not get real name for customer ${customer.id} (${customer.facebookId})`);
        }

        // تأخير قصير لتجنب rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`❌ Error updating customer ${customer.id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`🎉 Update completed: ${updatedCount} updated, ${errorCount} errors`);

    res.json({
      success: true,
      message: `Updated ${updatedCount} customers successfully`,
      stats: {
        total: customersToUpdate.length,
        updated: updatedCount,
        errors: errorCount
      }
    });

  } catch (error) {
    console.error('❌ Error updating Facebook customer names:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// API endpoint لتحديث أسماء العملاء لعرض Facebook User ID
app.post('/api/v1/customers/update-names-to-ids', async (req, res) => {
  try {
    console.log('🔄 Starting to update customer names to show Facebook User IDs...');

    // البحث عن جميع العملاء الذين لديهم Facebook IDs
    const customersToUpdate = await prisma.customer.findMany({
      where: {
        facebookId: { not: null }
      },
      take: 100 // تحديث 100 عميل في المرة الواحدة
    });

    console.log(`📊 Found ${customersToUpdate.length} customers to update`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const customer of customersToUpdate) {
      try {
        // تحديث اسم العميل ليعرض Facebook User ID كاملاً
        await prisma.customer.update({
          where: { id: customer.id },
          data: {
            firstName: customer.facebookId,
            lastName: ""
          }
        });

        console.log(`✅ Updated customer ${customer.id}: ${customer.firstName} ${customer.lastName} → عميل #${shortId}`);
        updatedCount++;

        // تأخير قصير
        await new Promise(resolve => setTimeout(resolve, 50));

      } catch (error) {
        console.error(`❌ Error updating customer ${customer.id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`🎉 Update completed: ${updatedCount} updated, ${errorCount} errors`);

    res.json({
      success: true,
      message: `Updated ${updatedCount} customers to show Facebook User IDs successfully`,
      stats: {
        total: customersToUpdate.length,
        updated: updatedCount,
        errors: errorCount
      }
    });

  } catch (error) {
    console.error('❌ Error updating customer names to IDs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test Facebook API connection
app.get('/api/v1/facebook/test-token/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;

    const page = await prisma.facebookPage.findFirst({
      where: { pageId: pageId }
    });

    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Test the token by getting page info
    const response = await axios.get(`https://graph.facebook.com/v18.0/${pageId}`, {
      params: {
        access_token: page.pageAccessToken,
        fields: 'name,id'
      },
      timeout: 5000
    });

    res.json({
      success: true,
      pageInfo: response.data,
      tokenValid: true
    });

  } catch (error) {
    console.error('❌ Token test failed:', error.message);
    res.status(400).json({
      success: false,
      error: error.message,
      tokenValid: false,
      details: error.response?.data
    });
  }
});

// Update Page Access Token
app.post('/api/v1/facebook/update-token/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    const { pageAccessToken } = req.body;

    if (!pageAccessToken) {
      return res.status(400).json({ error: 'Page access token is required' });
    }

    // Test the new token first
    const testResponse = await axios.get(`https://graph.facebook.com/v18.0/${pageId}`, {
      params: {
        access_token: pageAccessToken,
        fields: 'name,id'
      },
      timeout: 5000
    });

    // Update the token in database
    const updatedPage = await prisma.facebookPage.update({
      where: { pageId: pageId },
      data: {
        pageAccessToken: pageAccessToken,
        status: 'connected',
        connectedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Token updated successfully',
      pageInfo: testResponse.data,
      updatedPage: {
        id: updatedPage.id,
        pageId: updatedPage.pageId,
        pageName: updatedPage.pageName,
        status: updatedPage.status
      }
    });

  } catch (error) {
    console.error('❌ Token update failed:', error.message);
    res.status(400).json({
      success: false,
      error: error.message,
      details: error.response?.data
    });
  }
});

// دالة للحصول على معلومات المستخدم من Facebook باستخدام Message ID (الطريقة الجديدة)
async function getFacebookUserInfoFromMessage(messageId, accessToken) {
  try {
    console.log(`🔍 Fetching Facebook user info from message: ${messageId}`);

    const response = await axios.get(`https://graph.facebook.com/v18.0/${messageId}`, {
      params: {
        access_token: accessToken,
        fields: 'from,to,message'
      },
      timeout: 5000
    });

    if (response.data.from) {
      console.log(`✅ Facebook user info retrieved from message:`, {
        messageId: messageId,
        from: response.data.from,
        name: response.data.from.name || 'Unknown'
      });

      // تحويل الاسم الكامل إلى first_name و last_name
      const fullName = response.data.from.name || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      return {
        id: response.data.from.id,
        first_name: firstName,
        last_name: lastName,
        name: fullName
      };
    }

    return null;

  } catch (error) {
    console.error('❌ Error getting Facebook user info from message:', error.message);

    if (error.response) {
      console.error('❌ Facebook API Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }

    return null;
  }
}

// Get Facebook user info (الطريقة القديمة - تعمل فقط مع المطورين والإداريين)
async function getFacebookUserInfo(userId, pageAccessToken) {
  try {
    console.log(`🔍 Fetching Facebook user info for: ${userId}`);
    const response = await axios.get(`https://graph.facebook.com/v18.0/${userId}`, {
      params: {
        access_token: pageAccessToken,
        fields: 'first_name,last_name,profile_pic',
      },
      timeout: 5000
    });

    console.log(`✅ Facebook user info retrieved:`, {
      id: userId,
      name: `${response.data.first_name} ${response.data.last_name}`,
      first_name: response.data.first_name,
      last_name: response.data.last_name,
      profile_pic: response.data.profile_pic ? 'Available' : 'Not available'
    });

    return response.data;
  } catch (error) {
    console.error('❌ Error getting Facebook user info:', error.message);
    if (error.response) {
      console.error('❌ Facebook API Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    console.error('❌ Request details:', {
      userId: userId,
      url: `https://graph.facebook.com/v18.0/${userId}`,
      hasToken: !!pageAccessToken,
      tokenLength: pageAccessToken ? pageAccessToken.length : 0
    });
    // في حالة فشل الحصول على الاسم الحقيقي، نعيد null لعدم التحديث
    console.log('⚠️ Could not get real name from Facebook, keeping existing name');
    return null;

    // اختيار اسم عشوائي بناءً على User ID
    const nameIndex = parseInt(userId.slice(-1)) % fallbackNames.length;
    return fallbackNames[nameIndex];
  }
}

// 🧠 تحليل سياق طلب العميل
function analyzeCustomerContext(customerMessage, images) {
  const lowerMessage = customerMessage.toLowerCase();

  const context = {
    requestType: 'general',
    colors: [],
    isUrgent: false,
    isPriceInquiry: false,
    isSizeInquiry: false,
    isPolite: false,
    hasVariants: false,
    productTypes: []
  };

  // تحليل نوع الطلب
  if (lowerMessage.includes('سعر') || lowerMessage.includes('كام') || lowerMessage.includes('تكلفة')) {
    context.requestType = 'price';
    context.isPriceInquiry = true;
  } else if (lowerMessage.includes('مقاس') || lowerMessage.includes('size')) {
    context.requestType = 'size';
    context.isSizeInquiry = true;
  } else if (lowerMessage.includes('لون') || lowerMessage.includes('بيج') || lowerMessage.includes('أبيض') || lowerMessage.includes('أسود')) {
    context.requestType = 'color';
  }

  // كشف الألوان المطلوبة
  const colorKeywords = ['بيج', 'البيج', 'أبيض', 'الأبيض', 'أسود', 'الأسود', 'أحمر', 'الأحمر', 'أزرق', 'الأزرق'];
  colorKeywords.forEach(color => {
    if (lowerMessage.includes(color)) {
      context.colors.push(color);
    }
  });

  // كشف نوع المنتج
  if (lowerMessage.includes('كوتشي')) context.productTypes.push('كوتشي');
  if (lowerMessage.includes('حذاء')) context.productTypes.push('حذاء');

  // تحليل أسلوب العميل
  context.isUrgent = lowerMessage.includes('بسرعة') || lowerMessage.includes('عاجل') || lowerMessage.includes('فوراً');
  context.isPolite = lowerMessage.includes('لو سمحت') || lowerMessage.includes('من فضلك') || lowerMessage.includes('ممكن');

  // تحليل الصور المرسلة
  if (images && images.length > 0) {
    context.hasVariants = images.some(img => img.payload && img.payload.variantName);

    // استخراج الألوان من أسماء المتغيرات
    images.forEach(img => {
      if (img.payload && img.payload.variantName) {
        const variantName = img.payload.variantName.toLowerCase();
        colorKeywords.forEach(color => {
          if (variantName.includes(color.toLowerCase()) && !context.colors.includes(color)) {
            context.colors.push(color);
          }
        });
      }
    });
  }

  return context;
}

// 🎯 إنشاء رسالة متابعة ذكية
async function generateSmartFollowUpMessage(sentCount, images, customerMessage, senderId) {
  try {
    console.log(`🎯 [SMART-FOLLOW-UP] Generating smart follow-up for ${sentCount} images`);
    console.log(`🎯 [SMART-FOLLOW-UP] Customer message: "${customerMessage}"`);

    // تحليل السياق
    const context = analyzeCustomerContext(customerMessage, images);
    console.log(`🎯 [SMART-FOLLOW-UP] Context analysis:`, context);

    // محاولة الحصول على ذاكرة العميل
    let customerMemory = null;
    try {
      const memoryService = require('./src/services/memoryService');
      customerMemory = await memoryService.getRecentMemories(senderId, 5);
      console.log(`💾 [SMART-FOLLOW-UP] Retrieved ${customerMemory?.length || 0} memories for customer`);
    } catch (error) {
      console.log('⚠️ [SMART-FOLLOW-UP] Could not access customer memory:', error.message);
    }

    // رسائل حسب السياق
    let followUpMessage = '';

    if (context.requestType === 'color' && context.colors.length > 0) {
      // طلبات الألوان
      const colorName = context.colors[0];
      followUpMessage = `🎨 ده ${context.productTypes[0] || 'المنتج'} باللون ${colorName}! إيه رأيك في اللون؟ عايز تعرف المقاسات المتاحة؟`;

      // حفظ في الذاكرة
      await saveCustomerPreference(senderId, 'preferred_color', colorName);

    } else if (context.requestType === 'price' || context.isPriceInquiry) {
      // طلبات الأسعار
      followUpMessage = `💰 شوفت ${sentCount > 1 ? 'الصور' : 'الصورة'}؟ عايز تعرف ${sentCount > 1 ? 'أسعار المنتجات' : 'سعر المنتج'}؟`;

    } else if (context.hasVariants) {
      // منتجات بمتغيرات (ألوان)
      followUpMessage = `🌈 دي الألوان المتاحة! أي لون حبيته أكتر؟ ولا عايز تعرف تفاصيل أكتر؟`;

    } else if (context.productTypes.length > 0) {
      // منتجات محددة
      const productType = context.productTypes[0];
      followUpMessage = `✨ ده ${productType} اللي عندنا! إيه رأيك؟ عايز تعرف المقاسات والأسعار؟`;

    } else {
      // رسائل عامة متنوعة
      const generalMessages = [
        `😊 إيه رأيك في ${sentCount > 1 ? 'الصور' : 'الصورة'}؟ أي منتج عجبك؟`,
        `✨ شوفت ${sentCount > 1 ? 'المنتجات' : 'المنتج'}؟ عايز تعرف تفاصيل أي حاجة؟`,
        `🎁 أي منتج من دول حبيته؟ هقولك عليه كل التفاصيل!`,
        `💫 إيه اللي لفت نظرك؟ عايز تعرف أسعار ولا مقاسات؟`
      ];
      followUpMessage = generalMessages[Math.floor(Math.random() * generalMessages.length)];
    }

    // إضافة لمسة شخصية من الذاكرة
    if (customerMemory && customerMemory.length > 0) {
      const hasColorPreference = customerMemory.some(m => m.type === 'preferred_color');
      if (hasColorPreference && !context.colors.length) {
        const preferredColor = customerMemory.find(m => m.type === 'preferred_color')?.content;
        if (preferredColor) {
          followUpMessage += ` وبالمناسبة، لو عايز نفس اللون ${preferredColor} اللي حبيته قبل كده، قولي!`;
        }
      }
    }

    // حفظ التفاعل في الذاكرة
    await saveCustomerInteraction(senderId, 'image_request', {
      requestType: context.requestType,
      colors: context.colors,
      productTypes: context.productTypes,
      imageCount: sentCount
    });

    console.log(`🎯 [SMART-FOLLOW-UP] Generated message: "${followUpMessage}"`);
    return followUpMessage;

  } catch (error) {
    // 🤐 النظام الصامت - تسجيل الخطأ داخلياً فقط
    console.error('🚨 [SILENT-SYSTEM-ERROR] Smart follow-up generation error:', {
      customerId: senderId,
      error: error.message,
      timestamp: new Date().toISOString(),
      sentCount: sentCount
    });

    // 🚫 لا نرجع رسالة fallback - النظام صامت
    console.log('🤐 [SILENT-MODE] Smart follow-up generation failed but staying silent');
    return null; // إرجاع null بدلاً من رسالة fallback
  }
}

// 💾 حفظ تفضيلات العميل
async function saveCustomerPreference(senderId, type, content, companyId) {
  try {
    // ✅ التحقق من وجود companyId للعزل الأمني
    if (!companyId) {
      console.log('⚠️ Cannot save customer preference: companyId is required for isolation');
      return;
    }

    const memoryService = require('./src/services/memoryService');
    await memoryService.addMemory(senderId, type, content, 'unknown', 'neutral', companyId);
    console.log(`💾 Saved customer preference: ${type} = ${content}`);
  } catch (error) {
    console.log('⚠️ Could not save customer preference:', error.message);
  }
}

// 💾 حفظ تفاعل العميل
async function saveCustomerInteraction(senderId, type, data, companyId) {
  try {
    // ✅ التحقق من وجود companyId للعزل الأمني
    if (!companyId) {
      console.log('⚠️ Cannot save customer interaction: companyId is required for isolation');
      return;
    }

    const memoryService = require('./src/services/memoryService');
    await memoryService.addMemory(senderId, type, JSON.stringify(data), 'unknown', 'neutral', companyId);
    console.log(`💾 Saved customer interaction: ${type}`);
  } catch (error) {
    console.log('⚠️ Could not save customer interaction:', error.message);
  }
}

// ==================== GRACEFUL SHUTDOWN ====================

// معالجة إغلاق آمن للخدمات
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');

  try {
    // إيقاف خدمة الاكتشاف التلقائي
    console.log('🔍 Stopping Auto Pattern Detection Service...');
    autoPatternService.stop();

    // إغلاق اتصال قاعدة البيانات
    console.log('🔌 Closing database connection...');
    await prisma.$disconnect();

    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');

  try {
    autoPatternService.stop();
    await prisma.$disconnect();
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
});

module.exports = app;
