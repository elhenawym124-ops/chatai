const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const http = require('http');
const socketService = require('./src/services/socketService');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

// Initialize Prisma Client
const prisma = new PrismaClient();

// ==================== AI RESPONSE SYSTEM LOGGER ====================
class AIResponseLogger {
  constructor() {
    this.logFile = path.join(__dirname, 'logs', 'ai-responses.log');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(systemName, messageData, responseData, metadata = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      systemUsed: systemName,
      requestId: this.generateRequestId(),
      message: {
        content: messageData.content || messageData.message,
        customerId: messageData.customerId,
        conversationId: messageData.conversationId,
        platform: messageData.platform || 'unknown'
      },
      response: {
        content: responseData.content || responseData.response || responseData.text,
        confidence: responseData.confidence,
        model: responseData.model || responseData.modelUsed,
        tokensUsed: responseData.tokensUsed,
        responseTime: responseData.responseTime
      },
      metadata: {
        ...metadata,
        success: responseData.success !== false,
        error: responseData.error
      }
    };

    // Console log with color coding
    const systemColors = {
      'DirectGeminiAPI': '\x1b[32m', // Green
      'AdvancedGeminiService': '\x1b[34m', // Blue
      'GeminiService': '\x1b[36m', // Cyan
      'SmartResponseService': '\x1b[35m', // Magenta
      'StaticFallback': '\x1b[33m', // Yellow
    };

    const color = systemColors[systemName] || '\x1b[37m'; // White default
    const reset = '\x1b[0m';

    console.log(`${color}🤖 [${systemName}] ${reset}Response generated for message: "${logEntry.message.content?.substring(0, 50)}..."`);
    console.log(`${color}   └─ ${reset}Model: ${logEntry.response.model || 'N/A'}, Confidence: ${logEntry.response.confidence || 'N/A'}, Time: ${logEntry.response.responseTime || 'N/A'}ms`);

    // File log
    try {
      fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      console.error('❌ Failed to write AI response log:', error);
    }

    return logEntry.requestId;
  }

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getStats(hours = 24) {
    try {
      const logContent = fs.readFileSync(this.logFile, 'utf8');
      const lines = logContent.trim().split('\n').filter(line => line);
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

      const recentLogs = lines
        .map(line => {
          try { return JSON.parse(line); } catch { return null; }
        })
        .filter(log => log && new Date(log.timestamp) > cutoffTime);

      const stats = {
        totalResponses: recentLogs.length,
        systemUsage: {},
        averageResponseTime: 0,
        successRate: 0,
        modelUsage: {},
        platformUsage: {},
        hourlyDistribution: {}
      };

      recentLogs.forEach(log => {
        // System usage
        stats.systemUsage[log.systemUsed] = (stats.systemUsage[log.systemUsed] || 0) + 1;

        // Model usage
        if (log.response.model) {
          stats.modelUsage[log.response.model] = (stats.modelUsage[log.response.model] || 0) + 1;
        }

        // Platform usage
        if (log.message.platform) {
          stats.platformUsage[log.message.platform] = (stats.platformUsage[log.message.platform] || 0) + 1;
        }

        // Hourly distribution
        const hour = new Date(log.timestamp).getHours();
        stats.hourlyDistribution[hour] = (stats.hourlyDistribution[hour] || 0) + 1;
      });

      // Calculate averages
      const responseTimes = recentLogs.filter(log => log.response.responseTime).map(log => log.response.responseTime);
      stats.averageResponseTime = responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0;

      const successCount = recentLogs.filter(log => log.metadata.success).length;
      stats.successRate = recentLogs.length > 0 ? Math.round((successCount / recentLogs.length) * 100) : 0;

      return stats;
    } catch (error) {
      console.error('❌ Failed to read AI response stats:', error);
      return {
        totalResponses: 0,
        systemUsage: {},
        averageResponseTime: 0,
        successRate: 0,
        modelUsage: {},
        platformUsage: {},
        hourlyDistribution: {}
      };
    }
  }
}

const aiLogger = new AIResponseLogger();

// Facebook Graph API function - Updated to use same logic as AI messages
async function sendMessageToFacebook(recipientId, messageText, conversationId) {
  try {
    // البحث عن الصفحة المرتبطة بالمحادثة
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        customer: true
      }
    });
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    // البحث عن صفحة فيسبوك المناسبة
    const facebookPage = await prisma.facebookPage.findFirst({
      where: {
        companyId: conversation.companyId,
        status: 'connected'
      }
    });
    
    if (!facebookPage) {
      throw new Error('No connected Facebook page found for this conversation');
    }
    
    console.log(`📤 Sending message via Facebook page: ${facebookPage.pageName} (${facebookPage.pageId})`);
    console.log(`📤 To recipient: ${recipientId}`);
    console.log(`📤 Message: ${messageText}`);
    
    // استخدام نفس دالة الإرسال التي يستخدمها Gemini
    const result = await sendFacebookMessage(
      facebookPage.pageId,
      recipientId,
      messageText,
      facebookPage.pageAccessToken,
      'TEXT'
    );
    
    console.log('✅ Manual message sent to Facebook successfully:', result.message_id);
    return result;
    
  } catch (error) {
    console.error('❌ Error in sendMessageToFacebook:', error);
    throw error;
  }
}

// Facebook Integration will be added inline for now
// const { facebookRoutes } = require('./src/domains/integrations/routes/facebookRoutes');

// AI Routes will be added inline for now
// const { aiRoutes } = require('./src/domains/ai/routes/aiRoutes');

// Import middleware
const {
  jsonErrorHandler,
  validationErrorHandler,
  authErrorHandler,
  notFoundHandler,
  generalErrorHandler,
  securityErrorHandler
} = require('./src/middleware/errorHandler');

const {
  sanitizeInput,
  rateLimits,
  helmetConfig,
  requestSizeLimits,
  requestLogger
} = require('./src/middleware/security');

const logger = require('./src/utils/logger');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Initialize Socket.IO
socketService.initialize(server);

// Test database connection
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Test query
    const companyCount = await prisma.company.count();
    console.log(`📊 Found ${companyCount} companies in database`);

    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('⚠️ Falling back to mock mode');
    return false;
  }
}

// Skip security for test pages
app.use((req, res, next) => {
  if (req.path === '/no-csp-test') {
    return next();
  }
  helmetConfig(req, res, next);
});

app.use(requestLogger);

// Rate limiting
app.use('/api/', rateLimits.general);
app.use('/api/v1/auth/', rateLimits.auth);

// CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3003', 'http://localhost:3004'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing with size limits
app.use(express.json(requestSizeLimits.json));
app.use(express.urlencoded(requestSizeLimits.urlencoded));

// JSON error handling
app.use(jsonErrorHandler);

// Input sanitization (skip for AI settings endpoints)
app.use((req, res, next) => {
  // Skip sanitization for AI settings endpoints to allow JSON strings
  if (req.path === '/api/v1/ai/settings') {
    return next();
  }
  sanitizeInput(req, res, next);
});

// Import validation middleware
const { validate, schemas, requireFields, validateTypes } = require('./src/middleware/validation');

// Basic routes
app.get('/', (req, res) => {
  res.json({
    message: 'Communication Platform API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
});

// Test webhook page
app.get('/test-webhook', (req, res) => {
  res.removeHeader('Content-Security-Policy');
  res.setHeader('Content-Security-Policy', "script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; object-src 'none';");
  res.sendFile(path.join(__dirname, 'test-webhook.html'));
});

// Simple test page (no CSP issues)
app.get('/simple-test', (req, res) => {
  res.removeHeader('Content-Security-Policy');
  res.removeHeader('X-Content-Security-Policy');
  res.removeHeader('X-WebKit-CSP');
  res.setHeader('Content-Security-Policy', '');
  res.sendFile(path.join(__dirname, 'simple-test.html'));
});

// Middleware لتجاوز helmet تماماً
const bypassSecurity = (req, res, next) => {
  // إزالة جميع security headers
  res.removeHeader('Content-Security-Policy');
  res.removeHeader('X-Content-Security-Policy');
  res.removeHeader('X-WebKit-CSP');
  res.removeHeader('X-Content-Security-Policy-Report-Only');
  res.removeHeader('X-Frame-Options');
  res.removeHeader('X-Content-Type-Options');
  res.removeHeader('X-XSS-Protection');
  res.removeHeader('Strict-Transport-Security');

  // تجاوز helmet middleware
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    // إزالة أي headers أضافها helmet
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('X-Content-Security-Policy');
    res.removeHeader('X-WebKit-CSP');
    res.removeHeader('X-Content-Security-Policy-Report-Only');
    res.removeHeader('X-Frame-Options');
    res.removeHeader('X-Content-Type-Options');
    res.removeHeader('X-XSS-Protection');
    res.removeHeader('Strict-Transport-Security');

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Basic test page (absolutely no security headers)
app.get('/basic-test', bypassSecurity, (req, res) => {
  res.sendFile(path.join(__dirname, 'basic-test.html'));
});

// No CSP test page (completely bypasses helmet)
app.get('/no-csp-test', (req, res) => {
  res.sendFile(path.join(__dirname, 'no-csp-test.html'));
});

app.get('/add-facebook-page', (req, res) => {
  // Disable CSP for this specific page
  res.removeHeader('Content-Security-Policy');
  res.sendFile(path.join(__dirname, 'add-facebook-page.html'));
});

app.get('/test-message', (req, res) => {
  // Disable CSP for this specific page
  res.removeHeader('Content-Security-Policy');
  res.sendFile(path.join(__dirname, 'test-message.html'));
});

// Get recent messages for testing
app.get('/api/v1/test/recent-messages', async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        conversation: {
          include: {
            company: true,
            customer: true
          }
        }
      }
    });

    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      timestamp: msg.createdAt,
      channel: msg.conversation?.channel,
      companyName: msg.conversation?.company?.name,
      customerName: msg.conversation?.customer?.name,
      conversationId: msg.conversationId,
      isFromCustomer: msg.isFromCustomer
    }));

    res.json({
      success: true,
      messages: formattedMessages,
      total: messages.length
    });
  } catch (error) {
    console.error('Error fetching recent messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages',
      details: error.message
    });
  }
});

// Get connected Facebook pages
app.get('/api/v1/test/facebook-pages', async (req, res) => {
  try {
    const pages = await prisma.facebookPage.findMany({
      include: {
        company: true
      }
    });

    res.json({
      success: true,
      pages: pages,
      total: pages.length
    });
  } catch (error) {
    console.error('Error fetching Facebook pages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pages',
      details: error.message
    });
  }
});

// Test endpoint to verify products in database
app.get('/api/v1/test/products-verify', async (req, res) => {
  try {
    console.log('📦 Fetching products from database for verification...');
    
    const products = await prisma.product.findMany({
      include: {
        category: true,
        company: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10 // Get last 10 products
    });
    
    console.log(`✅ Found ${products.length} products in database`);
    
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      sku: product.sku,
      price: parseFloat(product.price),
      stock: product.stock,
      category: product.category?.name || 'غير محدد',
      company: product.company?.name || 'غير محدد',
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }));
    
    res.json({
      success: true,
      message: 'Products retrieved successfully from database',
      data: formattedProducts,
      total: products.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching products from database:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products from database',
      message: error.message
    });
  }
});

// Get connected Facebook pages for frontend
app.get('/api/v1/integrations/facebook/connected', async (req, res) => {
  try {
    const pages = await prisma.facebookPage.findMany({
      include: {
        company: true
      }
    });

    // Format pages for frontend
    const formattedPages = pages.map(page => ({
      id: page.id,
      pageId: page.pageId,
      pageName: page.pageName,
      pageAccessToken: page.pageAccessToken,
      status: page.status,
      connectedAt: page.connectedAt,
      lastActivity: page.updatedAt,
      messageCount: 0 // TODO: Calculate actual message count
    }));

    res.json({
      success: true,
      pages: formattedPages,
      total: formattedPages.length
    });
  } catch (error) {
    console.error('Error fetching connected Facebook pages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch connected pages',
      details: error.message
    });
  }
});

// Test Facebook page access token
app.post('/api/v1/integrations/facebook/test', async (req, res) => {
  try {
    const { pageId, pageAccessToken } = req.body;

    if (!pageAccessToken) {
      return res.status(400).json({
        success: false,
        error: 'pageAccessToken is required'
      });
    }

    // Test with Facebook API
    const testPageId = pageId === 'me' ? 'me' : pageId;
    const pageInfo = await verifyFacebookPageToken(testPageId, pageAccessToken);

    if (pageInfo) {
      res.json({
        success: true,
        data: pageInfo,
        message: 'Page access token is valid'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid page access token'
      });
    }
  } catch (error) {
    console.error('Error testing Facebook token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test token',
      details: error.message
    });
  }
});

// Get recent messages for testing
app.get('/api/v1/test/recent-messages', async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        conversation: {
          include: {
            facebookPage: true
          }
        }
      }
    });

    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      senderId: msg.senderId,
      content: msg.content,
      createdAt: msg.createdAt,
      pageName: msg.conversation?.facebookPage?.pageName || 'Unknown',
      pageId: msg.conversation?.facebookPage?.pageId || 'Unknown'
    }));

    res.json({
      success: true,
      messages: formattedMessages
    });

  } catch (error) {
    console.error('❌ Error fetching recent messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
});

// Test endpoint to send a message to a specific page
app.post('/api/v1/test/send-message', async (req, res) => {
  try {
    const { pageId, recipientId, message } = req.body;

    if (!pageId || !recipientId || !message) {
      return res.status(400).json({
        success: false,
        error: 'pageId, recipientId, and message are required'
      });
    }

    // Find the page
    const page = await prisma.facebookPage.findFirst({
      where: { pageId: pageId }
    });

    console.log(`🔍 Looking for page: ${pageId}`);
    console.log(`📄 Found page:`, page ? {
      id: page.id,
      pageId: page.pageId,
      pageName: page.pageName,
      status: page.status,
      hasToken: !!page.pageAccessToken,
      tokenLength: page.pageAccessToken ? page.pageAccessToken.length : 0
    } : 'Not found');

    if (!page) {
      return res.status(404).json({
        success: false,
        error: 'Page not found'
      });
    }

    if (page.status !== 'connected') {
      return res.status(400).json({
        success: false,
        error: `Page status is '${page.status}', not 'connected'`
      });
    }

    // Send message via Facebook API
    console.log(`📤 Sending message to ${recipientId} via page ${pageId}`);
    console.log(`🔑 Using token: ${page.pageAccessToken.substring(0, 20)}...`);

    const response = await fetch(`https://graph.facebook.com/v18.0/me/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${page.pageAccessToken}`
      },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text: message }
      })
    });

    const result = await response.json();

    if (response.ok) {
      res.json({
        success: true,
        data: result,
        message: 'Message sent successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to send message',
        details: result
      });
    }
  } catch (error) {
    console.error('Error sending test message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      details: error.message
    });
  }
});

// Debug webhook page lookup
app.get('/api/v1/test/debug-page/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;

    console.log(`🔍 Looking for page: ${pageId}`);

    // Try exact match
    const exactMatch = await prisma.facebookPage.findFirst({
      where: { pageId: pageId }
    });

    // Try all pages to see what we have
    const allPages = await prisma.facebookPage.findMany();

    res.json({
      success: true,
      searchedPageId: pageId,
      exactMatch: exactMatch,
      allPages: allPages.map(p => ({
        id: p.id,
        pageId: p.pageId,
        pageName: p.pageName,
        pageIdType: typeof p.pageId,
        pageIdLength: p.pageId.length
      }))
    });
  } catch (error) {
    console.error('Error debugging page lookup:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Handle method not allowed for health endpoint
app.all('/health', (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: `The ${req.method} method is not allowed for this resource`,
      code: 'METHOD_NOT_ALLOWED',
      allowedMethods: ['GET'],
      timestamp: new Date().toISOString()
    });
  }
});

// Facebook Integration Routes (will be added inline)
// app.use('/api/v1/integrations/facebook', facebookRoutes);

// AI Routes - Added inline
// AI Settings
app.get('/api/v1/ai/settings', async (req, res) => {
  try {
    // Get the first company (for now, we'll use the first company)
    const firstCompany = await prisma.company.findFirst();
    if (!firstCompany) {
      return res.status(500).json({
        success: false,
        error: 'No company found in database'
      });
    }

    // Load settings from database
    const aiSettings = await prisma.aiSettings.findUnique({
      where: { companyId: firstCompany.id }
    });

    let settings = {
      hasApiKey: !!process.env.GOOGLE_GEMINI_API_KEY,
      isEnabled: !!process.env.GOOGLE_GEMINI_API_KEY,
      autoReplyEnabled: false,
      confidenceThreshold: 0.8,
      maxResponseDelay: 30,
      model: 'gemini-1.5-flash',
      temperature: 0.7,
      maxTokens: 1000
    };

    if (aiSettings) {
      // Parse escalation rules and model settings
      let parsedRules = {};
      let parsedModelSettings = {};
      try {
        parsedRules = JSON.parse(aiSettings.escalationRules || '{}');
        parsedModelSettings = JSON.parse(aiSettings.modelSettings || '{}');
      } catch (e) {
        parsedRules = {};
        parsedModelSettings = {};
      }

      settings = {
        apiKey: parsedRules.apiKey || '',
        hasApiKey: !!(parsedRules.apiKey || process.env.GOOGLE_GEMINI_API_KEY),
        isEnabled: !!(parsedRules.apiKey || process.env.GOOGLE_GEMINI_API_KEY),
        autoReplyEnabled: aiSettings.autoReplyEnabled,
        confidenceThreshold: aiSettings.confidenceThreshold,
        maxResponseDelay: parsedRules.maxResponseDelay || 30,
        model: 'gemini-1.5-flash',
        temperature: 0.7,
        maxTokens: 1000,
        modelSettings: parsedModelSettings,
        escalationRules: parsedRules,
        updatedAt: aiSettings.updatedAt.toISOString()
      };
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error loading AI settings from database:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load settings from database',
      message: error.message
    });
  }
});

app.put('/api/v1/ai/settings', async (req, res) => {
  try {
    const {
      apiKey,
      isEnabled,
      autoReplyEnabled,
      confidenceThreshold,
      maxResponseDelay,
      modelSettings,
      escalationRules
    } = req.body;

    console.log('📝 Received AI settings update:', {
      autoReplyEnabled,
      confidenceThreshold,
      hasModelSettings: !!modelSettings,
      hasEscalationRules: !!escalationRules,
      modelSettingsContent: modelSettings ? JSON.parse(modelSettings) : null,
      escalationRulesContent: escalationRules ? JSON.parse(escalationRules) : null
    });

    // Get the first company (for now, we'll use the first company)
    const firstCompany = await prisma.company.findFirst();
    if (!firstCompany) {
      return res.status(500).json({
        success: false,
        error: 'No company found in database'
      });
    }

    // Parse existing escalation rules and model settings
    let existingEscalationRules = {};
    let existingModelSettings = {};

    try {
      const existingSettings = await prisma.aiSettings.findUnique({
        where: { companyId: firstCompany.id }
      });

      if (existingSettings) {
        existingEscalationRules = JSON.parse(existingSettings.escalationRules || '{}');
        existingModelSettings = JSON.parse(existingSettings.modelSettings || '{}');
      }
    } catch (e) {
      console.log('No existing settings found, using defaults');
    }

    // Merge escalation rules
    const newEscalationRules = {
      ...existingEscalationRules,
      ...(escalationRules ? JSON.parse(escalationRules) : {}),
      apiKey: apiKey || existingEscalationRules.apiKey || undefined,
      maxResponseDelay: maxResponseDelay || existingEscalationRules.maxResponseDelay || 30
    };

    // Merge model settings
    const newModelSettings = {
      ...existingModelSettings,
      ...(modelSettings ? JSON.parse(modelSettings) : {})
    };

    // Save to database using Prisma
    const aiSettings = await prisma.aiSettings.upsert({
      where: { companyId: firstCompany.id },
      update: {
        escalationRules: JSON.stringify(newEscalationRules),
        modelSettings: JSON.stringify(newModelSettings),
        autoReplyEnabled: autoReplyEnabled !== undefined ? autoReplyEnabled : false,
        confidenceThreshold: confidenceThreshold !== undefined ? confidenceThreshold : 0.8,
        updatedAt: new Date()
      },
      create: {
        companyId: firstCompany.id,
        escalationRules: JSON.stringify(newEscalationRules),
        modelSettings: JSON.stringify(newModelSettings),
        autoReplyEnabled: autoReplyEnabled !== undefined ? autoReplyEnabled : false,
        confidenceThreshold: confidenceThreshold !== undefined ? confidenceThreshold : 0.8,
      },
    });

    // Parse escalation rules and model settings
    let parsedRules = {};
    let parsedModelSettings = {};
    try {
      parsedRules = JSON.parse(aiSettings.escalationRules || '{}');
      parsedModelSettings = JSON.parse(aiSettings.modelSettings || '{}');
    } catch (e) {
      parsedRules = {};
      parsedModelSettings = {};
    }

    // Return response
    const responseSettings = {
      apiKey: parsedRules.apiKey || '',
      hasApiKey: !!parsedRules.apiKey,
      isEnabled: isEnabled !== undefined ? isEnabled : !!parsedRules.apiKey,
      autoReplyEnabled: aiSettings.autoReplyEnabled,
      confidenceThreshold: aiSettings.confidenceThreshold,
      maxResponseDelay: parsedRules.maxResponseDelay || 30,
      model: 'gemini-1.5-flash',
      temperature: 0.7,
      maxTokens: 1000,
      modelSettings: parsedModelSettings,
      escalationRules: parsedRules,
      updatedAt: aiSettings.updatedAt.toISOString()
    };

    console.log('✅ AI settings saved to database successfully:', {
      companyId: firstCompany.id,
      settingsId: aiSettings.id
    });

    res.json({
      success: true,
      data: responseSettings,
      message: 'تم حفظ إعدادات Gemini AI بنجاح في قاعدة البيانات الحقيقية!'
    });
  } catch (error) {
    console.error('❌ Error saving AI settings to database:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save settings to database',
      message: error.message
    });
  }
});

// ==================== AI RESPONSE TRACKING ROUTES ====================

// Get AI response statistics
app.get('/api/v1/ai/response-stats', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const stats = aiLogger.getStats(hours);

    res.json({
      success: true,
      data: stats,
      message: `Statistics for the last ${hours} hours`
    });
  } catch (error) {
    console.error('Error getting AI response stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get detailed AI response logs
app.get('/api/v1/ai/response-logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const system = req.query.system;

    if (!fs.existsSync(aiLogger.logFile)) {
      return res.json({
        success: true,
        data: [],
        message: 'No logs found'
      });
    }

    const logContent = fs.readFileSync(aiLogger.logFile, 'utf8');
    let logs = logContent.trim().split('\n')
      .filter(line => line)
      .map(line => {
        try { return JSON.parse(line); } catch { return null; }
      })
      .filter(log => log)
      .reverse() // Most recent first
      .slice(0, limit);

    // Filter by system if specified
    if (system) {
      logs = logs.filter(log => log.systemUsed === system);
    }

    res.json({
      success: true,
      data: logs,
      total: logs.length,
      message: `Retrieved ${logs.length} log entries`
    });
  } catch (error) {
    console.error('Error getting AI response logs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// AI Response Dashboard (HTML page)
app.get('/ai-dashboard', (req, res) => {
  const dashboardHTML = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة تحكم أنظمة الذكاء الصناعي</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .stat-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .stat-number { font-size: 2em; font-weight: bold; color: #667eea; }
        .system-usage { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .system-bar { display: flex; align-items: center; margin: 10px 0; }
        .system-name { width: 200px; font-weight: bold; }
        .bar { height: 20px; background: #e0e0e0; border-radius: 10px; flex: 1; margin: 0 10px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 10px; transition: width 0.3s ease; }
        .refresh-btn { background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
        .refresh-btn:hover { background: #5a6fd8; }
        .logs-section { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .log-entry { border-bottom: 1px solid #eee; padding: 10px 0; }
        .log-time { color: #666; font-size: 0.9em; }
        .log-system { font-weight: bold; padding: 2px 8px; border-radius: 4px; color: white; font-size: 0.8em; }
        .DirectGeminiAPI { background: #28a745; }
        .AdvancedGeminiService { background: #007bff; }
        .GeminiService { background: #17a2b8; }
        .SmartResponseService { background: #6f42c1; }
        .StaticFallback { background: #ffc107; color: #000; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 لوحة تحكم أنظمة الذكاء الصناعي</h1>
            <p>تتبع ومراقبة أنظمة الرد المختلفة</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number" id="totalResponses">-</div>
                <div>إجمالي الردود (24 ساعة)</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="successRate">-</div>
                <div>معدل النجاح</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="avgResponseTime">-</div>
                <div>متوسط وقت الاستجابة (مللي ثانية)</div>
            </div>
            <div class="stat-card">
                <button class="refresh-btn" onclick="loadStats()">🔄 تحديث البيانات</button>
            </div>
        </div>

        <div class="system-usage">
            <h3>استخدام الأنظمة</h3>
            <div id="systemUsage"></div>
        </div>

        <div class="logs-section">
            <h3>آخر الردود</h3>
            <div id="recentLogs"></div>
        </div>
    </div>

    <script>
        async function loadStats() {
            try {
                const response = await fetch('/api/v1/ai/response-stats');
                const data = await response.json();

                if (data.success) {
                    document.getElementById('totalResponses').textContent = data.data.totalResponses;
                    document.getElementById('successRate').textContent = data.data.successRate + '%';
                    document.getElementById('avgResponseTime').textContent = data.data.averageResponseTime;

                    // System usage
                    const systemUsageDiv = document.getElementById('systemUsage');
                    const maxUsage = Math.max(...Object.values(data.data.systemUsage));

                    systemUsageDiv.innerHTML = '';
                    Object.entries(data.data.systemUsage).forEach(([system, count]) => {
                        const percentage = maxUsage > 0 ? (count / maxUsage) * 100 : 0;
                        const colors = {
                            'DirectGeminiAPI': '#28a745',
                            'AdvancedGeminiService': '#007bff',
                            'GeminiService': '#17a2b8',
                            'SmartResponseService': '#6f42c1',
                            'StaticFallback': '#ffc107'
                        };

                        systemUsageDiv.innerHTML += \`
                            <div class="system-bar">
                                <div class="system-name">\${system}</div>
                                <div class="bar">
                                    <div class="bar-fill" style="width: \${percentage}%; background: \${colors[system] || '#ccc'}"></div>
                                </div>
                                <div>\${count} ردود</div>
                            </div>
                        \`;
                    });
                }
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        }

        async function loadRecentLogs() {
            try {
                const response = await fetch('/api/v1/ai/response-logs?limit=10');
                const data = await response.json();

                if (data.success) {
                    const logsDiv = document.getElementById('recentLogs');
                    logsDiv.innerHTML = '';

                    data.data.forEach(log => {
                        const time = new Date(log.timestamp).toLocaleString('ar-EG');
                        logsDiv.innerHTML += \`
                            <div class="log-entry">
                                <div class="log-time">\${time}</div>
                                <span class="log-system \${log.systemUsed}">\${log.systemUsed}</span>
                                <div>الرسالة: \${log.message.content?.substring(0, 100)}...</div>
                                <div>الرد: \${log.response.content?.substring(0, 100)}...</div>
                            </div>
                        \`;
                    });
                }
            } catch (error) {
                console.error('Error loading logs:', error);
            }
        }

        // Load data on page load
        loadStats();
        loadRecentLogs();

        // Auto refresh every 30 seconds
        setInterval(() => {
            loadStats();
            loadRecentLogs();
        }, 30000);
    </script>
</body>
</html>`;

  res.send(dashboardHTML);
});

// ==================== NEW PROMPT MANAGEMENT ROUTES ====================

// Static prompts management
app.get('/api/v1/ai/static-prompts', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const promptsPath = path.join(__dirname, 'data/prompts.json');
    
    if (!fs.existsSync(promptsPath)) {
      res.json({ success: true, data: [] });
      return;
    }

    const prompts = JSON.parse(fs.readFileSync(promptsPath, 'utf8'));
    res.json({ success: true, data: prompts });
  } catch (error) {
    console.error('Failed to get static prompts', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/v1/ai/static-prompts', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const promptsPath = path.join(__dirname, 'data/prompts.json');
    
    let prompts = [];
    if (fs.existsSync(promptsPath)) {
      prompts = JSON.parse(fs.readFileSync(promptsPath, 'utf8'));
    }
    
    const newPrompt = {
      id: `prompt_${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    prompts.push(newPrompt);
    fs.writeFileSync(promptsPath, JSON.stringify(prompts, null, 2));
    
    res.json({ success: true, data: newPrompt });
  } catch (error) {
    console.error('Failed to create static prompt', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/v1/ai/static-prompts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fs = require('fs');
    const path = require('path');
    const promptsPath = path.join(__dirname, 'data/prompts.json');
    
    if (!fs.existsSync(promptsPath)) {
      return res.status(404).json({ success: false, error: 'Prompts file not found' });
    }
    
    let prompts = JSON.parse(fs.readFileSync(promptsPath, 'utf8'));
    const promptIndex = prompts.findIndex(p => p.id === id);
    
    if (promptIndex === -1) {
      return res.status(404).json({ success: false, error: 'Prompt not found' });
    }
    
    prompts[promptIndex] = {
      ...prompts[promptIndex],
      ...req.body,
      id,
      updatedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(promptsPath, JSON.stringify(prompts, null, 2));
    
    res.json({ success: true, data: prompts[promptIndex] });
  } catch (error) {
    console.error('Failed to update static prompt', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/v1/ai/static-prompts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fs = require('fs');
    const path = require('path');
    const promptsPath = path.join(__dirname, 'data/prompts.json');
    
    if (!fs.existsSync(promptsPath)) {
      return res.status(404).json({ success: false, error: 'Prompts file not found' });
    }
    
    let prompts = JSON.parse(fs.readFileSync(promptsPath, 'utf8'));
    const promptIndex = prompts.findIndex(p => p.id === id);
    
    if (promptIndex === -1) {
      return res.status(404).json({ success: false, error: 'Prompt not found' });
    }
    
    prompts.splice(promptIndex, 1);
    fs.writeFileSync(promptsPath, JSON.stringify(prompts, null, 2));
    
    res.json({ success: true, message: 'Prompt deleted successfully' });
  } catch (error) {
    console.error('Failed to delete static prompt', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Business templates management
app.get('/api/v1/ai/business-templates', async (req, res) => {
  try {
    const promptManagementService = require('./src/services/promptManagementService');
    const result = await promptManagementService.getPromptTemplates();
    res.json(result);
  } catch (error) {
    console.error('Failed to get business templates', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/ai/business-types', async (req, res) => {
  try {
    const promptManagementService = require('./src/services/promptManagementService');
    const result = await promptManagementService.getBusinessTypes();
    res.json(result);
  } catch (error) {
    console.error('Failed to get business types', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Advanced services management
app.get('/api/v1/ai/advanced-services/company-prompts', async (req, res) => {
  try {
    const advancedPromptService = require('./src/services/advancedPromptService');
    const result = await advancedPromptService.getCompanyPrompts('default');
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Failed to get advanced company prompts', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/ai/advanced-services/active-services', async (req, res) => {
  try {
    const services = [
      { name: 'Gemini Service', status: 'active', lastUsed: new Date().toISOString() },
      { name: 'Smart Response Service', status: 'active', lastUsed: new Date().toISOString() },
      { name: 'Advanced Prompt Service', status: 'active', lastUsed: new Date().toISOString() }
    ];
    res.json({ success: true, data: services });
  } catch (error) {
    console.error('Failed to get active services', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/ai/advanced-services/configuration', async (req, res) => {
  try {
    const config = {
      autoReplyEnabled: true,
      confidenceThreshold: 0.8,
      maxResponseDelay: 5000,
      fallbackEnabled: true
    };
    res.json({ success: true, data: config });
  } catch (error) {
    console.error('Failed to get advanced configuration', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Additional endpoints for frontend compatibility
app.get('/api/v1/ai/advanced-services/status', async (req, res) => {
  try {
    const services = [
      { name: 'Gemini Service', status: 'active', lastUsed: new Date().toISOString() },
      { name: 'Smart Response Service', status: 'active', lastUsed: new Date().toISOString() },
      { name: 'Advanced Prompt Service', status: 'active', lastUsed: new Date().toISOString() }
    ];
    res.json({ success: true, data: services });
  } catch (error) {
    console.error('Failed to get services status', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/ai/advanced-services/config', async (req, res) => {
  try {
    const config = {
      autoReplyEnabled: true,
      confidenceThreshold: 0.8,
      maxResponseDelay: 5000,
      fallbackEnabled: true
    };
    res.json({ success: true, data: config });
  } catch (error) {
    console.error('Failed to get services config', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/v1/ai/advanced-services/restart', async (req, res) => {
  try {
    // Simulate service restart
    console.log('🔄 Restarting AI services...');
    
    // Add a small delay to simulate restart process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    res.json({ 
      success: true, 
      message: 'Services restarted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to restart services', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test AI connection
app.post('/api/v1/ai/test', async (req, res) => {
  try {
    console.log('🧪 Testing Gemini AI connection');

    const testMessage = req.body.message || 'مرحباً، هذا اختبار للذكاء الاصطناعي';

    // Get API keys from database
    let apiKeys = [];
    let hasApiKey = false;

    try {
      // Get the first company's AI settings
      const aiSettings = await prisma.aiSettings.findFirst({
        include: { company: true }
      });

      if (aiSettings?.modelSettings) {
        const modelSettings = JSON.parse(aiSettings.modelSettings);
        apiKeys = modelSettings.apiKeys || [];
        console.log(`🔑 Found ${apiKeys.length} API keys in database`);
      }

      // Fallback to escalationRules if no keys in modelSettings
      if (apiKeys.length === 0 && aiSettings?.escalationRules) {
        const escalationRules = JSON.parse(aiSettings.escalationRules);
        if (escalationRules.apiKey && escalationRules.apiKey.trim() !== '') {
          apiKeys = [{
            key: escalationRules.apiKey,
            name: 'Legacy Key',
            models: ['gemini-1.5-flash']
          }];
          console.log('🔄 Using legacy API key from escalationRules');
        }
      }

      // Final fallback to environment variable
      if (apiKeys.length === 0 && process.env.GOOGLE_GEMINI_API_KEY) {
        apiKeys = [{
          key: process.env.GOOGLE_GEMINI_API_KEY,
          name: 'Environment Key',
          models: ['gemini-1.5-flash']
        }];
        console.log('🌍 Using API key from environment variable');
      }

      hasApiKey = apiKeys.length > 0;

    } catch (dbError) {
      console.error('Error loading API keys from database:', dbError);
      // Fallback to environment variable
      if (process.env.GOOGLE_GEMINI_API_KEY) {
        apiKeys = [{
          key: process.env.GOOGLE_GEMINI_API_KEY,
          name: 'Environment Key (Fallback)',
          models: ['gemini-1.5-flash']
        }];
        hasApiKey = true;
      }
    }

    // Test Gemini AI with available keys
    let geminiResponse = null;
    let geminiError = null;
    let testedKeys = [];

    if (hasApiKey && apiKeys.length > 0) {
      // Test each API key until one works
      for (const apiKeyObj of apiKeys) {
        try {
          console.log(`🧪 Testing API key: ${apiKeyObj.name} (${apiKeyObj.key.substring(0, 20)}...)`);

          // Test with Advanced Gemini Service if available
          if (typeof advancedGeminiService !== 'undefined' && advancedGeminiService.testApiKey) {
            const testResult = await advancedGeminiService.testApiKey(apiKeyObj.key);
            if (testResult.success) {
              geminiResponse = {
                response: testResult.response || 'مرحباً! تم اختبار الاتصال بنجاح.',
                confidence: 0.95,
                intent: 'test_success',
                apiKeyUsed: apiKeyObj.name,
                model: testResult.model || 'gemini-1.5-flash'
              };
              testedKeys.push({ key: apiKeyObj.name, status: 'success' });
              break; // Stop testing if one key works
            } else {
              testedKeys.push({ key: apiKeyObj.name, status: 'failed', error: testResult.error });
            }
          } else if (typeof geminiService !== 'undefined' && geminiService.generateResponse) {
            // Fallback to regular gemini service
            geminiResponse = await geminiService.generateResponse(testMessage, {
              companyInfo: {
                name: 'شركة اختبار',
                businessType: 'ecommerce'
              }
            });
            testedKeys.push({ key: apiKeyObj.name, status: 'success' });
            break;
          }
        } catch (error) {
          console.error(`❌ API key ${apiKeyObj.name} failed:`, error.message);
          testedKeys.push({ key: apiKeyObj.name, status: 'failed', error: error.message });
          geminiError = error.message;
        }
      }
    }

    const isWorking = hasApiKey && !geminiError && geminiResponse;

    res.json({
      success: isWorking,
      message: isWorking ? 'تم الاتصال بـ Gemini AI بنجاح!' : (hasApiKey ? `فشل الاتصال: ${geminiError}` : 'لا توجد مفاتيح API متاحة'),
      data: {
        hasApiKey,
        isWorking,
        testMessage,
        apiKeysCount: apiKeys.length,
        testedKeys,
        results: {
          gemini: {
            hasApiKey,
            response: geminiResponse,
            working: isWorking,
            error: geminiError
          }
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI test error:', error);
    res.status(500).json({
      success: false,
      error: 'AI test failed',
      message: error.message
    });
  }
});

// Test Facebook Message (Simulate real Facebook webhook)
app.post('/api/v1/ai/test-facebook-message', async (req, res) => {
  try {
    console.log('🧪 Testing Facebook Message Simulation');

    const { pageId, senderId, messageText } = req.body;

    if (!pageId || !senderId || !messageText) {
      return res.status(400).json({
        success: false,
        error: 'pageId, senderId, and messageText are required'
      });
    }

    console.log(`📨 Simulating Facebook message from ${senderId}: "${messageText}"`);

    // Find connected Facebook page
    const facebookPage = await prisma.facebookPage.findFirst({
      where: {
        pageId,
        status: 'connected',
      },
      include: {
        company: true,
      },
    });

    if (!facebookPage) {
      return res.status(404).json({
        success: false,
        error: `Facebook page ${pageId} not found or not connected`
      });
    }

    console.log(`📄 Found connected page: ${facebookPage.pageName}`);

    // Find or create customer
    let customer = await prisma.customer.findFirst({
      where: {
        companyId: facebookPage.companyId,
        facebookId: senderId,
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          firstName: 'Facebook',
          lastName: 'User',
          facebookId: senderId,
          companyId: facebookPage.companyId,
        },
      });
      console.log(`👤 Created new customer: ${customer.id}`);
    }

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        companyId: facebookPage.companyId,
        customerId: customer.id,
        channel: 'FACEBOOK',
        status: { not: 'CLOSED' },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          subject: `Facebook - ${customer.firstName} ${customer.lastName}`,
          channel: 'FACEBOOK',
          status: 'ACTIVE',
          priority: 1,
          companyId: facebookPage.companyId,
          customerId: customer.id,
        },
      });
      console.log(`💬 Created new conversation: ${conversation.id}`);
    }

    // Create message in database
    const newMessage = await prisma.message.create({
      data: {
        content: messageText,
        type: 'TEXT',
        conversationId: conversation.id,
        isFromCustomer: true,
        metadata: JSON.stringify({
          facebookSenderId: senderId,
          pageId: pageId,
        }),
      },
    });

    console.log(`✅ Message saved: ${newMessage.id}`);

    // Generate and send AI auto-reply
    console.log('🚀 Starting AI auto-reply generation...');
    console.log('📋 Parameters:', {
      conversationId: conversation.id,
      customerId: customer.id,
      messageText,
      pageId: facebookPage.pageId
    });

    let aiReplyResult = null;

    // Generate AI auto-reply
    console.log('🤖 Starting AI auto-reply generation...');
    try {
      // Get AI settings from database
      const firstCompany = await prisma.company.findFirst();
      const aiSettings = await prisma.aiSettings.findUnique({
        where: { companyId: firstCompany.id }
      });

      // Check if Gemini AI is enabled (not auto-reply, just AI)
      const hasApiKey = aiSettings && aiSettings.escalationRules;
      let apiKeyFromSettings = null;
      try {
        const parsedRules = JSON.parse(aiSettings?.escalationRules || '{}');
        apiKeyFromSettings = parsedRules.apiKey;
      } catch (e) {
        apiKeyFromSettings = null;
      }

      if (aiSettings && hasApiKey && apiKeyFromSettings) {
        // Check if we already replied to this conversation recently
        const recentAIReply = await prisma.message.findFirst({
          where: {
            conversationId: conversation.id,
            isFromCustomer: false,
            metadata: {
              string_contains: 'aiGenerated'
            },
            createdAt: {
              gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
            }
          },
          orderBy: { createdAt: 'desc' }
        });

        if (recentAIReply) {
          console.log('⏭️ Skipping AI reply - already replied recently');
          aiReplyResult = { success: false, error: 'Already replied recently' };
        } else {
          // Parse API key from escalation rules
          let apiKey = null;
          try {
            const parsedRules = JSON.parse(aiSettings.escalationRules || '{}');
            apiKey = parsedRules.apiKey;
          } catch (e) {
            apiKey = null;
          }

          if (apiKey) {
            console.log('🤖 Generating AI response with Gemini...');
            const startTime = Date.now();

            // Use Gemini API directly
            const { GoogleGenerativeAI } = require('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

            const prompt = `أنت مساعد ذكي لخدمة العملاء في شركة تجارية. رد على رسالة العميل التالية بطريقة مهذبة ومفيدة:

رسالة العميل: "${messageText}"

اسم العميل: ${customer.firstName} ${customer.lastName}

قدم رداً مفيداً ومناسباً باللغة العربية. كن مهذباً ومساعداً.`;

            const result = await model.generateContent(prompt);
            const response = result.response;
            const aiResponse = response.text();
            const responseTime = Date.now() - startTime;

            console.log(`✅ AI response generated: "${aiResponse}"`);

            // Log the AI response
            aiLogger.log('DirectGeminiAPI', {
              content: messageText,
              customerId: customer.id,
              conversationId: conversation.id,
              platform: 'facebook'
            }, {
              content: aiResponse,
              confidence: 0.8,
              model: 'gemini-1.5-flash',
              responseTime: responseTime,
              success: true
            }, {
              prompt: prompt.substring(0, 100) + '...',
              apiKeySource: 'database'
            });

            // Save AI reply to database
            const aiReplyMessage = await prisma.message.create({
              data: {
                content: aiResponse,
                type: 'TEXT',
                conversationId: conversation.id,
                isFromCustomer: false,
                metadata: JSON.stringify({
                  aiGenerated: true,
                  confidence: 0.8,
                  model: 'gemini-1.5-flash',
                  timestamp: new Date().toISOString(),
                  systemUsed: 'DirectGeminiAPI',
                  responseTime: responseTime
                }),
              },
            });

            console.log(`💾 AI reply saved to database: ${aiReplyMessage.id}`);

            aiReplyResult = {
              success: true,
              message: aiResponse,
              messageId: aiReplyMessage.id,
              confidence: 0.8
            };
          } else {
            console.log('⚠️ No API key configured');
            aiReplyResult = { success: false, error: 'No API key configured' };
          }
        }
      } else {
        console.log('⚠️ Auto reply not enabled');
        aiReplyResult = { success: false, error: 'Auto reply not enabled' };
      }
    } catch (error) {
      console.error('❌ Error in AI auto-reply:', error);
      aiReplyResult = { success: false, error: error.message };
    }

    res.json({
      success: true,
      message: 'Facebook message simulation completed',
      data: {
        pageId,
        senderId,
        messageText,
        customer: {
          id: customer.id,
          name: `${customer.firstName} ${customer.lastName}`
        },
        conversation: {
          id: conversation.id,
          subject: conversation.subject
        },
        message: {
          id: newMessage.id,
          content: messageText
        },
        aiReply: aiReplyResult,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Facebook message simulation error:', error);
    res.status(500).json({
      success: false,
      error: 'Facebook message simulation failed',
      message: error.message
    });
  }
});

// Test Auto Reply System
app.post('/api/v1/ai/test-auto-reply', async (req, res) => {
  try {
    console.log('🧪 Testing Auto Reply System');

    const testMessage = req.body.message || 'مرحباً، أريد معرفة المزيد عن منتجاتكم';

    // Get AI settings from database
    const firstCompany = await prisma.company.findFirst();
    if (!firstCompany) {
      return res.status(500).json({
        success: false,
        error: 'No company found in database'
      });
    }

    const aiSettings = await prisma.aiSettings.findUnique({
      where: { companyId: firstCompany.id }
    });

    // Check if Gemini AI is available (not auto-reply, just AI)
    let apiKeyFromSettings = null;
    try {
      const parsedRules = JSON.parse(aiSettings?.escalationRules || '{}');
      apiKeyFromSettings = parsedRules.apiKey;
    } catch (e) {
      apiKeyFromSettings = null;
    }

    if (!aiSettings || !apiKeyFromSettings) {
      return res.json({
        success: false,
        message: 'Gemini AI is not configured',
        data: {
          hasApiKey: !!apiKeyFromSettings,
          hasSettings: !!aiSettings
        }
      });
    }

    // Parse API key from escalation rules
    let apiKey = null;
    try {
      const parsedRules = JSON.parse(aiSettings.escalationRules || '{}');
      apiKey = parsedRules.apiKey;
    } catch (e) {
      apiKey = null;
    }

    if (!apiKey) {
      return res.json({
        success: false,
        message: 'No API key configured',
        data: {
          hasApiKey: false
        }
      });
    }

    // Simulate auto reply generation
    console.log('🤖 Generating auto reply...');

    // Test the AI response generation
    let aiResponse = null;
    try {
      if (typeof geminiService !== 'undefined' && geminiService.generateResponse) {
        aiResponse = await geminiService.generateResponse(testMessage, {
          companyInfo: {
            name: firstCompany.name || 'شركة اختبار',
            businessType: 'خدمة عملاء'
          }
        });
      } else {
        // Fallback response
        aiResponse = {
          success: true,
          text: 'مرحباً! شكراً لتواصلك معنا. كيف يمكنني مساعدتك اليوم؟',
          confidence: 0.8
        };
      }
    } catch (error) {
      console.error('AI generation error:', error);
      aiResponse = {
        success: false,
        error: error.message
      };
    }

    res.json({
      success: true,
      message: 'Auto reply system test completed',
      data: {
        testMessage,
        autoReplyEnabled: true,
        hasApiKey: true,
        aiResponse,
        settings: {
          confidenceThreshold: aiSettings.confidenceThreshold,
          autoReplyEnabled: aiSettings.autoReplyEnabled
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Auto reply test error:', error);
    res.status(500).json({
      success: false,
      error: 'Auto reply test failed',
      message: error.message
    });
  }
});

// API routes placeholder
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'Communication Platform API v1',
    database: 'MySQL',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      customers: '/api/v1/customers',
      conversations: '/api/v1/conversations',
      products: '/api/v1/products',
      orders: '/api/v1/orders',
      ai: '/api/v1/ai',
    },
  });
});

// Mock auth endpoints
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Mock login with basic validation
  // Valid credentials: admin@test.com / password123
  if (email === 'admin@test.com' && password === 'password123') {
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: '1',
        email: email,
        firstName: 'أحمد',
        lastName: 'المدير',
        role: 'COMPANY_ADMIN',
        companyId: '1',
        company: {
          id: '1',
          name: 'شركة التواصل التجريبية',
          plan: 'PREMIUM'
        }
      },
      tokens: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      }
    });
  } else {
    // Invalid credentials
    res.status(401).json({
      success: false,
      message: 'Invalid email or password',
      error: 'INVALID_CREDENTIALS'
    });
  }
});

app.get('/api/v1/auth/me', (req, res) => {
  // Mock current user endpoint
  res.json({
    success: true,
    user: {
      id: '1',
      email: 'admin@example.com',
      firstName: 'أحمد',
      lastName: 'المدير',
      role: 'COMPANY_ADMIN',
      companyId: '1',
      company: {
        id: '1',
        name: 'شركة التواصل التجريبية',
        plan: 'PREMIUM'
      }
    }
  });
});

app.post('/api/v1/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Import security middleware
const { validateToken, optionalAuth } = require('./src/middleware/security');

// Protected routes with validation
app.post('/api/v1/customers',
  validateToken,
  validate(schemas.createCustomer),
  (req, res) => {
    try {
      // Simulate customer creation
      const newCustomer = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      res.status(201).json({
        success: true,
        data: newCustomer,
        message: 'Customer created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create customer',
        message: error.message
      });
    }
  }
);

// Test route for validation errors (without auth for testing)
app.post('/api/v1/test/customers',
  validate(schemas.createCustomer),
  (req, res) => {
    try {
      const newCustomer = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      res.status(201).json({
        success: true,
        data: newCustomer,
        message: 'Test customer created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create test customer',
        message: error.message
      });
    }
  }
);

app.put('/api/v1/customers/:id',
  validateToken,
  validate(schemas.idParam, 'params'),
  validate(schemas.updateCustomer),
  (req, res) => {
    try {
      const updatedCustomer = {
        id: req.params.id,
        ...req.body,
        updatedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        data: updatedCustomer,
        message: 'Customer updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update customer',
        message: error.message
      });
    }
  }
);

// Get single customer with validation (must come before general route)
app.get('/api/v1/customers/:id',
  optionalAuth,
  validate(schemas.idParam, 'params'),
  (req, res) => {
    try {
      const customerId = req.params.id;

      // Simulate customer not found for ID 999999
      if (customerId === '999999' || customerId === 999999) {
        return res.status(404).json({
          success: false,
          error: 'Customer not found',
          message: `Customer with ID ${customerId} does not exist`,
          code: 'CUSTOMER_NOT_FOUND'
        });
      }

      // Simulate customer lookup
      const customer = {
        id: customerId,
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        phone: '+966501234567',
        status: 'active',
        lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        totalOrders: 5,
        totalSpent: 2500,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      };

      res.json({
        success: true,
        data: customer
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch customer',
        message: error.message
      });
    }
  }
);

// Get all customers (must come after specific routes)
app.get('/api/v1/customers',
  optionalAuth,
  validate(schemas.search, 'query'),
  (req, res) => {
    res.json({
      success: true,
      data: [
        {
          id: '1',
          name: 'أحمد محمد',
          email: 'ahmed@example.com',
          phone: '+966501234567',
          status: 'active',
          lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          totalOrders: 5,
          totalSpent: 2450,
          source: 'facebook',
          tags: ['VIP', 'متكرر'],
        },
        {
          id: '2',
          name: 'سارة أحمد',
          email: 'sara@example.com',
          phone: '+966507654321',
          status: 'potential',
          lastContact: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          totalOrders: 1,
          totalSpent: 350,
          source: 'whatsapp',
          tags: ['جديد'],
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        pages: 1
      }
    });
  }
);

// Simple login endpoint for testing
app.post('/api/v1/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Simple test credentials
  if (username === 'admin' && password === 'admin123') {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        id: 1, 
        username: 'admin', 
        role: 'admin',
        permissions: ['create_product', 'edit_product', 'delete_product']
      }, 
      process.env.JWT_SECRET || 'test-secret-key-123',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: 1,
        username: 'admin',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

// Protected products endpoints
app.post('/api/v1/products',
  validateToken,
  validate(schemas.createProduct),
  async (req, res) => {
    try {
      const {
        name,
        description,
        sku,
        price,
        comparePrice,
        cost,
        stock,
        lowStockThreshold,
        category,
        tags,
        weight,
        dimensions,
        isActive = true
      } = req.body;

      // Get user's company ID from token (assuming it's available in req.user)
      const companyId = req.user?.companyId || 'default-company-id';

      // Find or create category if provided
      let categoryId = null;
      if (category) {
        let categoryRecord = await prisma.category.findFirst({
          where: {
            name: category,
            companyId: companyId
          }
        });

        if (!categoryRecord) {
          categoryRecord = await prisma.category.create({
            data: {
              name: category,
              companyId: companyId
            }
          });
        }
        categoryId = categoryRecord.id;
      }

      // Create product in database
      const newProduct = await prisma.product.create({
        data: {
          name,
          description,
          sku,
          price: parseFloat(price),
          comparePrice: comparePrice ? parseFloat(comparePrice) : null,
          cost: cost ? parseFloat(cost) : null,
          stock: parseInt(stock) || 0,
          weight: weight ? parseFloat(weight) : null,
          dimensions: dimensions || null,
          categoryId,
          isActive,
          tags: tags ? JSON.stringify(tags) : null,
          images: JSON.stringify([]), // Empty array for now
          companyId
        },
        include: {
          category: true,
          company: true
        }
      });

      console.log('✅ Product created successfully in database:', newProduct.id);

      res.status(201).json({
        success: true,
        data: newProduct,
        message: 'Product created successfully'
      });
    } catch (error) {
      console.error('❌ Error creating product:', error);
      
      // Handle unique constraint violation (duplicate SKU)
      if (error.code === 'P2002') {
        return res.status(400).json({
          success: false,
          error: 'Product with this SKU already exists',
          message: 'رمز المنتج (SKU) موجود مسبقاً'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to create product',
        message: error.message
      });
    }
  }
);

app.get('/api/v1/products/:id',
  validate(schemas.idParam, 'params'),
  (req, res) => {
    try {
      const productId = req.params.id;

      // Simulate product not found for ID 999999
      if (productId === '999999') {
        return res.status(404).json({
          success: false,
          error: 'Product not found',
          message: `Product with ID ${productId} does not exist`,
          code: 'PRODUCT_NOT_FOUND'
        });
      }

      const product = {
        id: productId,
        name: 'جهاز لابتوب Dell XPS 13',
        description: 'جهاز لابتوب عالي الأداء',
        price: 4500,
        sku: 'DELL-XPS-13-001',
        stock: 10,
        isActive: true
      };

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch product',
        message: error.message
      });
    }
  }
);

// Test route for products (without auth)
app.post('/api/v1/test/products',
  validate(schemas.createProduct),
  (req, res) => {
    try {
      // Test negative numbers
      if (req.body.price < 0) {
        return res.status(422).json({
          success: false,
          error: 'Validation failed',
          message: 'Price cannot be negative',
          code: 'VALIDATION_ERROR',
          details: [{
            field: 'price',
            message: 'Price must be a positive number',
            value: req.body.price
          }]
        });
      }

      const newProduct = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date().toISOString(),
        isActive: true
      };

      res.status(201).json({
        success: true,
        data: newProduct,
        message: 'Test product created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create test product',
        message: error.message
      });
    }
  }
);

// Mock products endpoints
app.get('/api/v1/products', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'جهاز لابتوب Dell XPS 13',
        description: 'جهاز لابتوب عالي الأداء مع معالج Intel Core i7 وذاكرة 16GB',
        price: 4500,
        comparePrice: 5000,
        sku: 'DELL-XPS-13-001',
        category: 'أجهزة كمبيوتر',
        stock: 15,
        isActive: true,
      },
      {
        id: '2',
        name: 'هاتف iPhone 15 Pro',
        description: 'أحدث هاتف من Apple مع كاميرا متطورة ومعالج A17 Pro',
        price: 4200,
        comparePrice: 4500,
        sku: 'IPHONE-15-PRO-001',
        category: 'هواتف ذكية',
        stock: 3,
        isActive: true,
      }
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 2,
      pages: 1
    }
  });
});

// Company management endpoints
const companyService = require('./src/services/companyService');

// Get subscription plans
app.get('/api/v1/companies/plans', (req, res) => {
  const plans = companyService.getSubscriptionPlans();
  res.json({
    success: true,
    data: plans
  });
});

// Get company details
app.get('/api/v1/companies/:id', (req, res) => {
  const { id } = req.params;
  companyService.getCompany(id).then(company => {
    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'الشركة غير موجودة'
      });
    }
    res.json({
      success: true,
      data: company
    });
  });
});

// Update company subscription
app.post('/api/v1/companies/:id/subscription', (req, res) => {
  const { id } = req.params;
  const { plan } = req.body;

  companyService.updateSubscription(id, plan).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get usage statistics
app.get('/api/v1/companies/:id/usage', (req, res) => {
  const { id } = req.params;

  companyService.getUsageStats(id).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Check limits
app.post('/api/v1/companies/:id/check-limit', (req, res) => {
  const { id } = req.params;
  const { resource, amount = 1 } = req.body;

  companyService.checkLimit(id, resource, amount).then(result => {
    res.json({
      success: true,
      data: result
    });
  });
});

// Notification endpoints
const notificationService = require('./src/services/notificationService');

// Get user notifications
app.get('/api/v1/notifications', (req, res) => {
  const userId = req.query.userId || '1'; // Mock user ID
  const limit = parseInt(req.query.limit) || 50;

  const result = notificationService.getUserNotifications(userId, limit);
  res.json(result);
});

// Mark notification as read
app.post('/api/v1/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  const userId = req.body.userId || '1'; // Mock user ID

  const result = notificationService.markAsRead(userId, id);
  res.json(result);
});

// Mark all notifications as read
app.post('/api/v1/notifications/read-all', (req, res) => {
  const userId = req.body.userId || '1'; // Mock user ID

  const result = notificationService.markAllAsRead(userId);
  res.json(result);
});

// Send test notification
app.post('/api/v1/notifications/test', (req, res) => {
  const { userId = '1', type = 'NEW_MESSAGE', data = {} } = req.body;

  notificationService.sendPushNotification(userId, type, data).then(result => {
    res.json(result);
  });
});

// Get notification stats
app.get('/api/v1/notifications/stats', (req, res) => {
  const stats = notificationService.getStats();
  res.json({
    success: true,
    data: stats
  });
});

// Protected conversations endpoints
app.get('/api/v1/conversations',
  optionalAuth,
  validate(schemas.search, 'query'),
  async (req, res) => {
    try {
      console.log('📞 Fetching conversations from database...');

      // Try to get conversations from real database
      const conversations = await prisma.conversation.findMany({
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
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
        take: 50
      });

      // Transform data to match frontend format
      const transformedConversations = conversations.map(conv => ({
        id: conv.id,
        customerId: conv.customerId,
        customerName: `${conv.customer.firstName} ${conv.customer.lastName}`,
        status: conv.status.toLowerCase(),
        lastMessage: conv.lastMessagePreview || 'لا توجد رسائل',
        lastMessageTime: conv.lastMessageAt || conv.createdAt,
        unreadCount: conv._count.messages,
        assignedAgent: conv.assignedUser ? `${conv.assignedUser.firstName} ${conv.assignedUser.lastName}` : null,
        priority: conv.priority === 1 ? 'low' : conv.priority === 2 ? 'medium' : 'high',
        tags: conv.tags ? JSON.parse(conv.tags) : [],
        channel: conv.channel,
        subject: conv.subject,
        createdAt: conv.createdAt,
      }));

      console.log(`📞 Found ${transformedConversations.length} conversations in database`);

      res.json({
        success: true,
        data: transformedConversations,
        pagination: {
          page: 1,
          limit: 50,
          total: transformedConversations.length,
          pages: 1
        }
      });
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);

      // Fallback to mock data if database fails
      const mockConversations = [
        {
          id: '1',
          customerId: '1',
          customerName: 'أحمد محمد',
          status: 'active',
          lastMessage: 'مرحباً، أحتاج مساعدة في طلبي',
          lastMessageTime: new Date(Date.now() - 30 * 60 * 1000),
          unreadCount: 2,
          assignedAgent: 'سارة أحمد',
          priority: 'medium',
          tags: ['دعم فني', 'طلب']
        },
        {
          id: '2',
          customerId: '2',
          customerName: 'فاطمة علي',
          status: 'pending',
          lastMessage: 'متى سيصل طلبي؟',
          lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
          unreadCount: 1,
          assignedAgent: null,
          priority: 'high',
          tags: ['استفسار', 'شحن']
        }
      ];

      res.json({
        success: true,
        data: mockConversations,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          pages: 1
        }
      });
    }
  }
);

app.post('/api/v1/conversations',
  optionalAuth,
  validate(schemas.createConversation),
  (req, res) => {
    try {
      const newConversation = {
        id: Date.now().toString(),
        ...req.body,
        status: 'active',
        createdAt: new Date().toISOString(),
        unreadCount: 1,
        assignedAgent: null
      };

      res.status(201).json({
        success: true,
        data: newConversation,
        message: 'Conversation created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create conversation',
        message: error.message
      });
    }
  }
);

// Opportunity management endpoints
const opportunityService = require('./src/services/opportunityService');

// Get all opportunities
app.get('/api/v1/opportunities', (req, res) => {
  opportunityService.getOpportunities(req.query).then(result => {
    res.json(result);
  });
});

// Get opportunity by ID
app.get('/api/v1/opportunities/:id', (req, res) => {
  const { id } = req.params;
  opportunityService.getOpportunity(id).then(result => {
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  });
});

// Create new opportunity
app.post('/api/v1/opportunities', (req, res) => {
  opportunityService.createOpportunity(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(201).json(result);
  });
});

// Update opportunity
app.put('/api/v1/opportunities/:id', (req, res) => {
  const { id } = req.params;
  opportunityService.updateOpportunity(id, req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Delete opportunity
app.delete('/api/v1/opportunities/:id', (req, res) => {
  const { id } = req.params;
  opportunityService.deleteOpportunity(id).then(result => {
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  });
});

// Add activity to opportunity
app.post('/api/v1/opportunities/:id/activities', (req, res) => {
  const { id } = req.params;
  opportunityService.addActivity(id, req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get pipeline statistics
app.get('/api/v1/opportunities/stats/pipeline', (req, res) => {
  opportunityService.getPipelineStats().then(result => {
    res.json(result);
  });
});

// Get sales forecast
app.get('/api/v1/opportunities/stats/forecast', (req, res) => {
  const period = req.query.period || 'month';
  opportunityService.getSalesForecast(period).then(result => {
    res.json(result);
  });
});

// Get opportunity stages
app.get('/api/v1/opportunities/stages', (req, res) => {
  const result = opportunityService.getStages();
  res.json(result);
});

// Customer Lifetime Value (CLV) endpoints
const clvService = require('./src/services/clvService');

// Calculate CLV for specific customer
app.get('/api/v1/customers/:id/clv', (req, res) => {
  const { id } = req.params;
  const method = req.query.method || 'predictive';

  clvService.calculateCLV(id, method).then(result => {
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  });
});

// Get CLV analysis for all customers
app.get('/api/v1/analytics/clv', (req, res) => {
  clvService.getCLVAnalysis(req.query).then(result => {
    res.json(result);
  });
});

// Cart and Order Management endpoints
const cartService = require('./src/services/cartService');

// Cart endpoints
app.get('/api/v1/cart/:customerId', (req, res) => {
  const { customerId } = req.params;
  cartService.getCart(customerId).then(result => {
    res.json(result);
  });
});

app.post('/api/v1/cart/:customerId/add', (req, res) => {
  const { customerId } = req.params;
  const { productId, quantity } = req.body;

  cartService.addToCart(customerId, productId, quantity).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

app.put('/api/v1/cart/:customerId/update', (req, res) => {
  const { customerId } = req.params;
  const { productId, quantity } = req.body;

  cartService.updateCartItem(customerId, productId, quantity).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

app.delete('/api/v1/cart/:customerId/remove/:productId', (req, res) => {
  const { customerId, productId } = req.params;

  cartService.removeFromCart(customerId, productId).then(result => {
    res.json(result);
  });
});

app.delete('/api/v1/cart/:customerId/clear', (req, res) => {
  const { customerId } = req.params;

  cartService.clearCart(customerId).then(result => {
    res.json(result);
  });
});

// Order endpoints
app.post('/api/v1/orders', (req, res) => {
  const { customerId, ...orderData } = req.body;

  cartService.createOrder(customerId, orderData).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(201).json(result);
  });
});

app.get('/api/v1/orders', async (req, res) => {
  try {
    const { status, paymentStatus, search, page = 1, limit = 10 } = req.query;

    // Build where clause
    const where = {};

    if (status) {
      where.status = status.toUpperCase();
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus.toUpperCase();
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customer: { firstName: { contains: search, mode: 'insensitive' } } },
        { customer: { lastName: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    // Get orders from database
    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    // Get total count
    const total = await prisma.order.count({ where });

    // Format orders for frontend
    const formattedOrders = orders.map(order => ({
      id: order.orderNumber,
      customerId: order.customerId,
      customerName: `${order.customer.firstName} ${order.customer.lastName}`,
      customerEmail: order.customer.email,
      customerPhone: order.customer.phone,
      status: order.status.toLowerCase(),
      items: order.items.map(item => ({
        productId: item.productId,
        productName: item.product?.name || 'منتج غير معروف',
        quantity: item.quantity,
        price: parseFloat(item.price),
        total: parseFloat(item.total)
      })),
      subtotal: parseFloat(order.subtotal),
      tax: parseFloat(order.tax),
      shipping: parseFloat(order.shipping),
      discount: parseFloat(order.discount),
      total: parseFloat(order.total),
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod.toLowerCase(),
      paymentStatus: order.paymentStatus.toLowerCase(),
      orderDate: order.createdAt,
      deliveryDate: order.updatedAt,
      trackingNumber: order.metadata?.trackingNumber || null,
      notes: order.notes || ''
    }));

    res.json({
      success: true,
      data: formattedOrders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب الطلبات'
    });
  }
});

app.get('/api/v1/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id },
          { orderNumber: id }
        ]
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'الطلب غير موجود'
      });
    }

    // Format order for frontend
    const formattedOrder = {
      id: order.orderNumber,
      customerId: order.customerId,
      customerName: `${order.customer.firstName} ${order.customer.lastName}`,
      customerEmail: order.customer.email,
      customerPhone: order.customer.phone,
      status: order.status.toLowerCase(),
      items: order.items.map(item => ({
        productId: item.productId,
        productName: item.product?.name || 'منتج غير معروف',
        quantity: item.quantity,
        price: parseFloat(item.price),
        total: parseFloat(item.total)
      })),
      subtotal: parseFloat(order.subtotal),
      tax: parseFloat(order.tax),
      shipping: parseFloat(order.shipping),
      discount: parseFloat(order.discount),
      total: parseFloat(order.total),
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod.toLowerCase(),
      paymentStatus: order.paymentStatus.toLowerCase(),
      orderDate: order.createdAt,
      deliveryDate: order.updatedAt,
      trackingNumber: order.metadata?.trackingNumber || null,
      notes: order.notes || ''
    };

    res.json({
      success: true,
      data: formattedOrder
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب الطلب'
    });
  }
});

app.put('/api/v1/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, trackingNumber } = req.body;

  cartService.updateOrderStatus(id, status, trackingNumber).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

app.get('/api/v1/orders/stats/summary', (req, res) => {
  cartService.getOrderStats().then(result => {
    res.json(result);
  });
});

// Order Settings endpoints
app.get('/api/v1/ai/order-settings', (req, res) => {
  const { companyId } = req.query;

  // Mock order settings - in real implementation, get from database
  const orderSettings = {
    success: true,
    data: {
      autoCreateOrders: false,
      requireShippingAddress: true,
      requirePaymentMethod: false,
      defaultPaymentMethod: 'CASH',
      autoConfirmOrders: false,
      sendOrderConfirmation: true
    }
  };

  res.json(orderSettings);
});

app.put('/api/v1/ai/order-settings', (req, res) => {
  const { companyId, ...settings } = req.body;

  // Mock save - in real implementation, save to database
  console.log('Saving order settings for company:', companyId, settings);

  res.json({
    success: true,
    data: settings,
    message: 'Order settings updated successfully'
  });
});

// Memory Settings endpoints
app.get('/api/v1/ai/memory-settings', async (req, res) => {
  try {
    const { companyId } = req.query;

    // Try to get from AISettings table
    let memorySettings = null;
    try {
      const aiSettings = await prisma.aiSettings.findFirst({
        where: { companyId }
      });

      if (aiSettings && aiSettings.memorySettings) {
        const settings = typeof aiSettings.memorySettings === 'string'
          ? JSON.parse(aiSettings.memorySettings)
          : aiSettings.memorySettings;

        memorySettings = {
          conversationMemoryLimit: settings.conversationMemoryLimit || 3,
          memoryType: settings.memoryType || 'recent',
          memoryDuration: settings.memoryDuration || 24,
          enableContextualMemory: settings.enableContextualMemory !== false
        };
      }
    } catch (error) {
      console.log('Error loading memory settings from database:', error.message);
    }

    // Default settings if not found
    if (!memorySettings) {
      memorySettings = {
        conversationMemoryLimit: 3,
        memoryType: 'recent',
        memoryDuration: 24,
        enableContextualMemory: true
      };
    }

    res.json({
      success: true,
      data: memorySettings
    });
  } catch (error) {
    console.error('Error getting memory settings:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.put('/api/v1/ai/memory-settings', async (req, res) => {
  try {
    const { companyId, ...settings } = req.body;

    console.log('🧠 Saving memory settings for company:', companyId, settings);

    // Save to AISettings table
    const memorySettingsJson = JSON.stringify(settings);

    await prisma.aiSettings.upsert({
      where: { companyId },
      update: {
        memorySettings: memorySettingsJson,
        updatedAt: new Date()
      },
      create: {
        companyId,
        memorySettings: memorySettingsJson,
        autoReplyEnabled: false,
        confidenceThreshold: 0.7
      }
    });

    res.json({
      success: true,
      data: settings,
      message: 'Memory settings updated successfully'
    });
  } catch (error) {
    console.error('Error saving memory settings:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create order from conversation
app.post('/api/v1/ai/create-order-from-conversation', async (req, res) => {
  const { customerId, conversationId, products, shippingAddress, notes } = req.body;

  try {
    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Calculate totals
    let subtotal = 0;
    const orderItems = products.map(product => {
      const total = product.price * product.quantity;
      subtotal += total;
      return {
        productId: product.productId || `product_${Date.now()}`,
        quantity: product.quantity,
        price: product.price,
        total: total
      };
    });

    const tax = subtotal * 0.15; // 15% VAT
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping over 500
    const total = subtotal + tax + shipping;

    // Get company ID (assuming first company for now)
    const company = await prisma.company.findFirst();
    if (!company) {
      return res.status(400).json({
        success: false,
        error: 'لم يتم العثور على الشركة'
      });
    }

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: 'CASH',
        subtotal,
        tax,
        shipping,
        discount: 0,
        total,
        currency: 'SAR',
        notes,
        shippingAddress: typeof shippingAddress === 'string' ?
          { address: shippingAddress } : shippingAddress,
        metadata: { conversationId },
        companyId: company.id,
        items: {
          create: orderItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            total: item.total
          }))
        }
      },
      include: {
        items: true
      }
    });

    console.log('Created order from conversation:', {
      id: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      conversationId,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      items: orderItems,
      subtotal: parseFloat(order.subtotal),
      tax: parseFloat(order.tax),
      shipping: parseFloat(order.shipping),
      discount: parseFloat(order.discount),
      total: parseFloat(order.total),
      currency: order.currency,
      shippingAddress,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    });

    res.status(201).json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        conversationId,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        items: orderItems,
        subtotal: parseFloat(order.subtotal),
        tax: parseFloat(order.tax),
        shipping: parseFloat(order.shipping),
        discount: parseFloat(order.discount),
        total: parseFloat(order.total),
        currency: order.currency,
        shippingAddress,
        notes: order.notes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      },
      message: 'تم إنشاء الطلب بنجاح'
    });
  } catch (error) {
    console.error('Error creating order from conversation:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في إنشاء الطلب'
    });
  }
});

// Inventory Management endpoints
const inventoryService = require('./src/services/inventoryService');

// Get inventory for all products
app.get('/api/v1/inventory', (req, res) => {
  inventoryService.getInventory(req.query).then(result => {
    res.json(result);
  });
});

// Get inventory for specific product
app.get('/api/v1/inventory/product/:productId', (req, res) => {
  const { productId } = req.params;
  inventoryService.getProductInventory(productId).then(result => {
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  });
});

// Update stock levels
app.post('/api/v1/inventory/update-stock', (req, res) => {
  const { productId, warehouseId, quantity, type, reason, reference, notes } = req.body;

  inventoryService.updateStock(productId, warehouseId, quantity, type, reason, reference, notes)
    .then(result => {
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    });
});

// Reserve stock
app.post('/api/v1/inventory/reserve', (req, res) => {
  const { productId, warehouseId, quantity } = req.body;

  inventoryService.reserveStock(productId, warehouseId, quantity).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Release reserved stock
app.post('/api/v1/inventory/release', (req, res) => {
  const { productId, warehouseId, quantity } = req.body;

  inventoryService.releaseStock(productId, warehouseId, quantity).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get stock movements
app.get('/api/v1/inventory/movements', (req, res) => {
  inventoryService.getStockMovements(req.query).then(result => {
    res.json(result);
  });
});

// Get stock alerts
app.get('/api/v1/inventory/alerts', (req, res) => {
  inventoryService.getStockAlerts().then(result => {
    res.json(result);
  });
});

// Get inventory statistics
app.get('/api/v1/inventory/stats', (req, res) => {
  inventoryService.getInventoryStats().then(result => {
    res.json(result);
  });
});

// Email Service endpoints
const emailService = require('./src/services/emailService');

// Send email
app.post('/api/v1/emails/send', (req, res) => {
  const { to, templateId, data, options } = req.body;

  emailService.sendEmail(to, templateId, data, options).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Send bulk emails
app.post('/api/v1/emails/send-bulk', (req, res) => {
  const { recipients, templateId, data, options } = req.body;

  emailService.sendBulkEmails(recipients, templateId, data, options).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get email status
app.get('/api/v1/emails/:emailId/status', (req, res) => {
  const { emailId } = req.params;

  emailService.getEmailStatus(emailId).then(result => {
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  });
});

// Get email history
app.get('/api/v1/emails/history', (req, res) => {
  emailService.getEmailHistory(req.query).then(result => {
    res.json(result);
  });
});

// Get email statistics
app.get('/api/v1/emails/stats', (req, res) => {
  emailService.getEmailStats().then(result => {
    res.json(result);
  });
});

// Get email templates
app.get('/api/v1/emails/templates', (req, res) => {
  const result = emailService.getTemplates();
  res.json(result);
});

// SMS Service endpoints
const smsService = require('./src/services/smsService');

// Send SMS
app.post('/api/v1/sms/send', (req, res) => {
  const { to, templateId, data, options } = req.body;

  smsService.sendSMS(to, templateId, data, options).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Send bulk SMS
app.post('/api/v1/sms/send-bulk', (req, res) => {
  const { recipients, templateId, data, options } = req.body;

  smsService.sendBulkSMS(recipients, templateId, data, options).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get SMS status
app.get('/api/v1/sms/:smsId/status', (req, res) => {
  const { smsId } = req.params;

  smsService.getSMSStatus(smsId).then(result => {
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  });
});

// Get SMS history
app.get('/api/v1/sms/history', (req, res) => {
  smsService.getSMSHistory(req.query).then(result => {
    res.json(result);
  });
});

// Get SMS statistics
app.get('/api/v1/sms/stats', (req, res) => {
  smsService.getSMSStats().then(result => {
    res.json(result);
  });
});

// Get SMS templates
app.get('/api/v1/sms/templates', (req, res) => {
  const result = smsService.getTemplates();
  res.json(result);
});

// Payment Service endpoints
const paymentService = require('./src/services/paymentService');

// Create payment intent
app.post('/api/v1/payments/create-intent', (req, res) => {
  paymentService.createPaymentIntent(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Process payment
app.post('/api/v1/payments/:paymentId/process', (req, res) => {
  const { paymentId } = req.params;

  paymentService.processPayment(paymentId, req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get payment status
app.get('/api/v1/payments/:paymentId/status', (req, res) => {
  const { paymentId } = req.params;

  paymentService.getPaymentStatus(paymentId).then(result => {
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  });
});

// Refund payment
app.post('/api/v1/payments/:paymentId/refund', (req, res) => {
  const { paymentId } = req.params;

  paymentService.refundPayment(paymentId, req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get payment history
app.get('/api/v1/payments/history', (req, res) => {
  paymentService.getPaymentHistory(req.query).then(result => {
    res.json(result);
  });
});

// Get payment statistics
app.get('/api/v1/payments/stats', (req, res) => {
  paymentService.getPaymentStats().then(result => {
    res.json(result);
  });
});

// Get available payment gateways
app.get('/api/v1/payments/gateways', (req, res) => {
  const currency = req.query.currency || 'SAR';
  const result = paymentService.getAvailableGateways(currency);
  res.json(result);
});

// Discount and Coupon Service endpoints
const discountService = require('./src/services/discountService');

// Validate coupon
app.post('/api/v1/coupons/validate', (req, res) => {
  const { couponCode, customerId, orderData } = req.body;

  discountService.validateCoupon(couponCode, customerId, orderData).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Apply coupon
app.post('/api/v1/coupons/apply', (req, res) => {
  const { couponCode, customerId, orderData } = req.body;

  discountService.applyCoupon(couponCode, customerId, orderData).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Create coupon
app.post('/api/v1/coupons', (req, res) => {
  discountService.createCoupon(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(201).json(result);
  });
});

// Get all coupons
app.get('/api/v1/coupons', (req, res) => {
  discountService.getCoupons(req.query).then(result => {
    res.json(result);
  });
});

// Get coupon usage history
app.get('/api/v1/coupons/usage', (req, res) => {
  discountService.getCouponUsage(req.query).then(result => {
    res.json(result);
  });
});

// Get discount statistics
app.get('/api/v1/coupons/stats', (req, res) => {
  discountService.getDiscountStats().then(result => {
    res.json(result);
  });
});

// Media and File Management endpoints
const mediaService = require('./src/services/mediaService');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
});

// Upload file
app.post('/api/v1/media/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'لم يتم اختيار ملف'
    });
  }

  const fileData = {
    filename: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    buffer: req.file.buffer,
    userId: req.body.userId || '1',
    companyId: req.body.companyId || '1',
    description: req.body.description || '',
    tags: req.body.tags ? req.body.tags.split(',') : [],
  };

  const metadata = {
    isPublic: req.body.isPublic === 'true',
    expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null,
  };

  mediaService.uploadFile(fileData, metadata).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get file information
app.get('/api/v1/media/:fileId', (req, res) => {
  const { fileId } = req.params;

  mediaService.getFile(fileId).then(result => {
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  });
});

// Download file
app.get('/api/v1/media/:fileId/download', (req, res) => {
  const { fileId } = req.params;
  const userId = req.query.userId;

  mediaService.downloadFile(fileId, userId).then(result => {
    if (!result.success) {
      return res.status(404).json(result);
    }

    const { buffer, filename, mimetype } = result.data;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', mimetype);
    res.send(buffer);
  });
});

// Delete file
app.delete('/api/v1/media/:fileId', (req, res) => {
  const { fileId } = req.params;
  const userId = req.body.userId;

  mediaService.deleteFile(fileId, userId).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get files list
app.get('/api/v1/media', (req, res) => {
  mediaService.getFiles(req.query).then(result => {
    res.json(result);
  });
});

// Get storage statistics
app.get('/api/v1/media/stats/storage', (req, res) => {
  const companyId = req.query.companyId;

  mediaService.getStorageStats(companyId).then(result => {
    res.json(result);
  });
});

// Get file types configuration
app.get('/api/v1/media/config/types', (req, res) => {
  const result = mediaService.getFileTypesConfig();
  res.json(result);
});

// Cleanup expired files
app.post('/api/v1/media/cleanup/expired', (req, res) => {
  mediaService.cleanupExpiredFiles().then(result => {
    res.json(result);
  });
});

// Appointment and Calendar Service endpoints
const appointmentService = require('./src/services/appointmentService');

// Create appointment
app.post('/api/v1/appointments', (req, res) => {
  appointmentService.createAppointment(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(201).json(result);
  });
});

// Get available time slots
app.get('/api/v1/appointments/available-slots', (req, res) => {
  const { staffId, date } = req.query;

  if (!staffId || !date) {
    return res.status(400).json({
      success: false,
      error: 'معرف الموظف والتاريخ مطلوبان'
    });
  }

  appointmentService.getAvailableTimeSlots(staffId, date).then(result => {
    res.json(result);
  });
});

// Update appointment status
app.put('/api/v1/appointments/:appointmentId/status', (req, res) => {
  const { appointmentId } = req.params;
  const { status, notes } = req.body;

  appointmentService.updateAppointmentStatus(appointmentId, status, notes).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get appointments
app.get('/api/v1/appointments', (req, res) => {
  appointmentService.getAppointments(req.query).then(result => {
    res.json(result);
  });
});

// Get appointment statistics
app.get('/api/v1/appointments/stats', (req, res) => {
  appointmentService.getAppointmentStats().then(result => {
    res.json(result);
  });
});

// Task and Project Management endpoints
const taskService = require('./src/services/taskService');

// Create project
app.post('/api/v1/projects', (req, res) => {
  taskService.createProject(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(201).json(result);
  });
});

// Get projects
app.get('/api/v1/projects', (req, res) => {
  taskService.getProjects(req.query).then(result => {
    res.json(result);
  });
});

// Create task
app.post('/api/v1/tasks', (req, res) => {
  taskService.createTask(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(201).json(result);
  });
});

// Get tasks
app.get('/api/v1/tasks', (req, res) => {
  taskService.getTasks(req.query).then(result => {
    res.json(result);
  });
});

// Update task status
app.put('/api/v1/tasks/:taskId/status', (req, res) => {
  const { taskId } = req.params;
  const { status, progress } = req.body;

  taskService.updateTaskStatus(taskId, status, progress).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Add task comment
app.post('/api/v1/tasks/:taskId/comments', (req, res) => {
  const { taskId } = req.params;
  const { userId, userName, content } = req.body;

  taskService.addTaskComment(taskId, userId, userName, content).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(201).json(result);
  });
});

// Get task comments
app.get('/api/v1/tasks/:taskId/comments', (req, res) => {
  const { taskId } = req.params;

  taskService.getTaskComments(taskId).then(result => {
    res.json(result);
  });
});

// Track time for task
app.post('/api/v1/tasks/:taskId/time', (req, res) => {
  const { taskId } = req.params;
  const { userId, hours, description } = req.body;

  taskService.trackTime(taskId, userId, hours, description).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(201).json(result);
  });
});

// Get project statistics
app.get('/api/v1/projects/stats', (req, res) => {
  taskService.getProjectStats().then(result => {
    res.json(result);
  });
});

// Content Management System (CMS) endpoints
const cmsService = require('./src/services/cmsService');

// Create page
app.post('/api/v1/cms/pages', (req, res) => {
  cmsService.createPage(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(201).json(result);
  });
});

// Get pages
app.get('/api/v1/cms/pages', (req, res) => {
  cmsService.getPages(req.query).then(result => {
    res.json(result);
  });
});

// Create blog post
app.post('/api/v1/cms/posts', (req, res) => {
  cmsService.createPost(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(201).json(result);
  });
});

// Get blog posts
app.get('/api/v1/cms/posts', (req, res) => {
  cmsService.getPosts(req.query).then(result => {
    res.json(result);
  });
});

// Get categories
app.get('/api/v1/cms/categories', (req, res) => {
  cmsService.getCategories().then(result => {
    res.json(result);
  });
});

// Get navigation menu
app.get('/api/v1/cms/menu', (req, res) => {
  const location = req.query.location || 'header';
  cmsService.getMenu(location).then(result => {
    res.json(result);
  });
});

// Get content statistics
app.get('/api/v1/cms/stats', (req, res) => {
  cmsService.getContentStats().then(result => {
    res.json(result);
  });
});

// Advanced Analytics and Reporting endpoints
const analyticsService = require('./src/services/analyticsService');

// Get dashboard data
app.get('/api/v1/analytics/dashboard', (req, res) => {
  analyticsService.getDashboardData(req.query).then(result => {
    res.json(result);
  });
});

// Generate sales report
app.post('/api/v1/analytics/reports/sales', (req, res) => {
  analyticsService.generateSalesReport(req.body).then(result => {
    res.json(result);
  });
});

// Generate customer report
app.post('/api/v1/analytics/reports/customers', (req, res) => {
  analyticsService.generateCustomerReport(req.body).then(result => {
    res.json(result);
  });
});

// Generate product report
app.post('/api/v1/analytics/reports/products', (req, res) => {
  analyticsService.generateProductReport(req.body).then(result => {
    res.json(result);
  });
});

// Generate conversation report
app.post('/api/v1/analytics/reports/conversations', (req, res) => {
  analyticsService.generateConversationReport(req.body).then(result => {
    res.json(result);
  });
});

// Get real-time analytics
app.get('/api/v1/analytics/realtime', (req, res) => {
  analyticsService.getRealTimeAnalytics().then(result => {
    res.json(result);
  });
});

// Export report
app.post('/api/v1/analytics/reports/:reportId/export', (req, res) => {
  const { reportId } = req.params;
  const { format } = req.body;

  analyticsService.exportReport(reportId, format).then(result => {
    res.json(result);
  });
});

// Automation and Workflow endpoints
const automationService = require('./src/services/automationService');

// Create workflow
app.post('/api/v1/automation/workflows', (req, res) => {
  automationService.createWorkflow(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(201).json(result);
  });
});

// Get workflows
app.get('/api/v1/automation/workflows', (req, res) => {
  automationService.getWorkflows(req.query).then(result => {
    res.json(result);
  });
});

// Execute workflow
app.post('/api/v1/automation/workflows/:workflowId/execute', (req, res) => {
  const { workflowId } = req.params;

  automationService.executeWorkflow(workflowId, req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get automation statistics
app.get('/api/v1/automation/stats', (req, res) => {
  automationService.getAutomationStats().then(result => {
    res.json(result);
  });
});

// ==================== FACEBOOK INTEGRATION ====================
// Facebook Integration endpoints with real database

// Facebook Webhook Verification (GET) - Main route
app.get('/api/v1/integrations/facebook/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const WEBHOOK_VERIFY_TOKEN = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || 'simple_chat_verify_token_2025';

  console.log('🔍 Facebook webhook verification request:', { mode, token: token ? 'provided' : 'missing' });

  if (mode && token) {
    if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
      console.log('✅ Facebook webhook verified successfully');
      res.status(200).send(challenge);
    } else {
      console.log('❌ Facebook webhook verification failed');
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// Facebook Webhook Verification (GET) - Simple route
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const WEBHOOK_VERIFY_TOKEN = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || 'simple_chat_verify_token_2025';

  console.log('🔍 Facebook webhook verification request (simple route):', { mode, token: token ? 'provided' : 'missing' });

  if (mode && token) {
    if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
      console.log('✅ Facebook webhook verified successfully (simple route)');
      res.status(200).send(challenge);
    } else {
      console.log('❌ Facebook webhook verification failed (simple route)');
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// Facebook Webhook Handler (POST) - Main route
app.post('/api/v1/integrations/facebook/webhook', async (req, res) => {
  try {
    const body = req.body;

    // Safe logging without circular references
    const safeBody = {
      object: body.object,
      entry: body.entry ? body.entry.map(entry => ({
        id: entry.id,
        time: entry.time,
        messaging: entry.messaging ? entry.messaging.length : 0,
        changes: entry.changes ? entry.changes.length : 0
      })) : []
    };
    console.log('📨 Facebook webhook received (main route):', JSON.stringify(safeBody, null, 2));

    if (body.object === 'page') {
      for (const entry of body.entry) {
        await processFacebookWebhookEntry(entry);
      }

      // Make sure we only send response once
      if (!res.headersSent) {
        res.status(200).send('EVENT_RECEIVED');
      }
    } else {
      if (!res.headersSent) {
        res.sendStatus(404);
      }
    }
  } catch (error) {
    console.error('❌ Error processing Facebook webhook (main route):', error);

    // Make sure we only send response once
    if (!res.headersSent) {
      res.status(500).send('ERROR');
    }
  }
});

// Facebook Webhook Handler (POST) - Simple route
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    // Safe logging without circular references
    const safeBody = {
      object: body.object,
      entry: body.entry ? body.entry.map(entry => ({
        id: entry.id,
        time: entry.time,
        messaging: entry.messaging ? entry.messaging.length : 0,
        changes: entry.changes ? entry.changes.length : 0
      })) : []
    };
    console.log('📨 Facebook webhook received:', JSON.stringify(safeBody, null, 2));

    if (body.object === 'page') {
      for (const entry of body.entry) {
        await processFacebookWebhookEntry(entry);
      }

      // Make sure we only send response once
      if (!res.headersSent) {
        res.status(200).send('EVENT_RECEIVED');
      }
    } else {
      if (!res.headersSent) {
        res.sendStatus(404);
      }
    }
  } catch (error) {
    console.error('❌ Error processing Facebook webhook:', error);

    // Make sure we only send response once
    if (!res.headersSent) {
      res.status(500).send('ERROR');
    }
  }
});

// Process Facebook webhook entry
async function processFacebookWebhookEntry(entry) {
  try {
    const pageId = entry.id;
    console.log(`📄 Processing entry for page ${pageId}`);

    // Find connected Facebook page
    const facebookPage = await prisma.facebookPage.findFirst({
      where: {
        pageId,
      },
      include: {
        company: true,
      },
    });

    if (!facebookPage) {
      console.log(`⚠️ No connected page found for ${pageId}`);
      return;
    }

    for (const messaging of entry.messaging) {
      if (messaging.message) {
        await processFacebookMessage(messaging, facebookPage);
      } else if (messaging.delivery) {
        console.log('📬 Message delivery receipt received');
      } else if (messaging.read) {
        console.log('👁️ Message read receipt received');
      }
    }
  } catch (error) {
    console.error('❌ Error processing webhook entry:', error);
  }
}

// Process incoming Facebook message
async function processFacebookMessage(messaging, facebookPage) {
  try {
    const senderId = messaging.sender.id;
    const messageText = messaging.message.text || '';
    const messageId = messaging.message.mid;
    const timestamp = new Date(messaging.timestamp);
    const attachments = messaging.message.attachments || [];

    console.log(`📨 Processing message from ${senderId}: "${messageText}"`);

    // Find or create customer
    let customer = await prisma.customer.findFirst({
      where: {
        companyId: facebookPage.companyId,
        facebookId: senderId,
      },
    });

    if (!customer) {
      // Get user info from Facebook
      const userInfo = await getFacebookUserInfo(senderId, facebookPage.pageAccessToken);

      customer = await prisma.customer.create({
        data: {
          firstName: userInfo.first_name || 'Facebook',
          lastName: userInfo.last_name || 'User',
          facebookId: senderId,
          companyId: facebookPage.companyId,
          status: 'LEAD',
        },
      });

      console.log(`👤 Created new customer: ${customer.firstName} ${customer.lastName}`);
    }

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        companyId: facebookPage.companyId,
        customerId: customer.id,
        channel: 'FACEBOOK',
        status: { not: 'CLOSED' },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          subject: `Facebook - ${customer.firstName} ${customer.lastName}`,
          channel: 'FACEBOOK',
          status: 'ACTIVE',
          priority: 1,
          companyId: facebookPage.companyId,
          customerId: customer.id,
        },
      });

      console.log(`💬 Created new conversation: ${conversation.id}`);
    }

    // Determine message type
    let messageType = 'TEXT';
    let content = messageText;

    if (attachments.length > 0) {
      const attachment = attachments[0];
      if (attachment.type === 'image') {
        messageType = 'IMAGE';
        content = attachment.payload.url;
      } else if (attachment.type === 'file') {
        messageType = 'FILE';
        content = attachment.payload.url;
      }
    }

    // Create message in database
    const newMessage = await prisma.message.create({
      data: {
        content: content,
        type: messageType,
        conversationId: conversation.id,
        isFromCustomer: true,
        metadata: JSON.stringify({
          platform: 'facebook',
          messageId: messageId,
          timestamp: messaging.timestamp || Date.now(),
          attachments: attachments ? attachments.map(att => ({
            type: att.type,
            url: att.payload?.url,
            title: att.payload?.title
          })) : [],
        }),
      },
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: timestamp,
        lastMessagePreview: messageText.length > 100 ? messageText.substring(0, 100) + '...' : messageText,
      },
    });

    console.log(`✅ Message saved: ${newMessage.id}`);

    // Generate and send AI auto-reply
    await generateAndSendAIReply(conversation, customer, messageText, facebookPage);

  } catch (error) {
    console.error('❌ Error processing Facebook message:', error);
  }
}

// Get Facebook user info
async function getFacebookUserInfo(userId, pageAccessToken) {
  try {
    const response = await axios.get(`https://graph.facebook.com/v18.0/${userId}`, {
      params: {
        access_token: pageAccessToken,
        fields: 'first_name,last_name,profile_pic',
      },
    });

    return response.data;
  } catch (error) {
    console.error('❌ Error getting Facebook user info:', error);
    return {
      first_name: 'Facebook',
      last_name: 'User',
    };
  }
}

// Facebook Page Management endpoints

// Connect Facebook Page
app.post('/api/v1/integrations/facebook/connect', async (req, res) => {
  try {
    const { pageAccessToken, pageName } = req.body;

    if (!pageAccessToken) {
      return res.status(400).json({
        success: false,
        error: 'pageAccessToken is required'
      });
    }

    // Get page info automatically from access token
    console.log('🔍 Getting page info from access token...');
    const pageInfo = await verifyFacebookPageToken('me', pageAccessToken);
    if (!pageInfo) {
      return res.status(400).json({
        success: false,
        error: 'Invalid page access token'
      });
    }

    // Extract page ID and name from the token
    const actualPageId = pageInfo.id;
    const actualPageName = pageName || pageInfo.name;

    console.log(`✅ Page info retrieved: ${actualPageName} (${actualPageId})`);

    // Verify with the actual page ID
    const verifyPageInfo = await verifyFacebookPageToken(actualPageId, pageAccessToken);
    if (!verifyPageInfo) {
      return res.status(400).json({
        success: false,
        error: 'Failed to verify page access token'
      });
    }

    // Get the first company ID
    const firstCompany = await prisma.company.findFirst();
    if (!firstCompany) {
      return res.status(500).json({
        success: false,
        error: 'No company found in database'
      });
    }

    // Save to database with the actual page ID
    const facebookPage = await prisma.facebookPage.upsert({
      where: {
        pageId: actualPageId,
      },
      update: {
        pageAccessToken: pageAccessToken,
        pageName: actualPageName,
        companyId: firstCompany.id,
        status: 'connected',
        connectedAt: new Date(),
      },
      create: {
        pageId: actualPageId,
        pageAccessToken: pageAccessToken,
        pageName: actualPageName,
        companyId: firstCompany.id,
        status: 'connected',
        connectedAt: new Date(),
      },
    });

    // Subscribe to webhooks
    await subscribeToFacebookWebhooks(actualPageId, pageAccessToken);

    console.log(`✅ Facebook page connected: ${actualPageName} (${actualPageId})`);

    res.json({
      success: true,
      data: {
        ...facebookPage,
        pageId: actualPageId,
        pageName: actualPageName
      },
      message: 'Facebook page connected successfully'
    });
  } catch (error) {
    console.error('❌ Error connecting Facebook page:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to connect Facebook page',
      message: error.message
    });
  }
});

// Get connected Facebook pages
app.get('/api/v1/integrations/facebook/connected', async (req, res) => {
  try {
    const pages = await prisma.facebookPage.findMany({
      where: {
        status: 'connected',
      },
      select: {
        id: true,
        pageId: true,
        pageName: true,
        status: true,
        connectedAt: true,
        companyId: true,
      },
    });

    res.json({
      success: true,
      data: pages,
      pages: pages, // For backward compatibility
      message: 'Connected pages retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error getting connected pages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get connected pages',
      message: error.message
    });
  }
});

// Send Facebook message
app.post('/api/v1/integrations/facebook/send-message', async (req, res) => {
  try {
    const { pageId, recipientId, message, messageType = 'TEXT' } = req.body;

    if (!pageId || !recipientId || !message) {
      return res.status(400).json({
        success: false,
        error: 'pageId, recipientId, and message are required'
      });
    }

    // Get page access token
    const facebookPage = await prisma.facebookPage.findFirst({
      where: {
        pageId,
        status: 'connected',
      },
    });

    if (!facebookPage) {
      return res.status(404).json({
        success: false,
        error: 'Facebook page not found or not connected'
      });
    }

    // Send message via Facebook API
    const result = await sendFacebookMessage(pageId, recipientId, message, facebookPage.pageAccessToken, messageType);

    console.log(`📤 Message sent via Facebook API: ${result.message_id}`);

    res.json({
      success: true,
      data: result,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('❌ Error sending Facebook message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      message: error.message
    });
  }
});

// Facebook Integration Status
app.get('/api/v1/integrations/facebook/status', async (req, res) => {
  try {
    const connectedPages = await prisma.facebookPage.count({
      where: {
        status: 'connected',
      },
    });

    const status = {
      isConnected: connectedPages > 0,
      connectedPagesCount: connectedPages,
      webhookUrl: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/v1/integrations/facebook/webhook`,
      verifyToken: process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || 'simple_chat_verify_token_2025',
    };

    res.json({
      success: true,
      data: status,
      message: 'Integration status retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error getting integration status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get integration status',
      message: error.message
    });
  }
});

// Facebook Page Disconnect
app.delete('/api/v1/integrations/facebook/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    console.log(`🔌 Disconnecting Facebook page: ${pageId}`);

    // Find the page
    const existingPage = await prisma.facebookPage.findUnique({
      where: {
        pageId: pageId,
      },
    });

    if (!existingPage) {
      return res.status(404).json({
        success: false,
        error: 'Page not found'
      });
    }

    // Update status to disconnected instead of deleting
    const disconnectedPage = await prisma.facebookPage.update({
      where: {
        pageId: pageId,
      },
      data: {
        status: 'disconnected',
        pageAccessToken: '', // Clear the token for security
        updatedAt: new Date(),
      },
    });

    console.log(`✅ Facebook page disconnected: ${pageId}`);

    res.json({
      success: true,
      data: disconnectedPage,
      message: 'Facebook page disconnected successfully'
    });

  } catch (error) {
    console.error('❌ Error disconnecting Facebook page:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disconnect Facebook page',
      message: error.message
    });
  }
});

// Facebook Configuration endpoint
app.get('/api/v1/integrations/facebook/config', async (req, res) => {
  try {
    const config = {
      appId: process.env.FACEBOOK_APP_ID || 'your-facebook-app-id',
      webhookUrl: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/v1/integrations/facebook/webhook`,
      verifyToken: process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || 'simple_chat_verify_token_2025',
      requiredPermissions: [
        'pages_manage_metadata',
        'pages_read_engagement',
        'pages_messaging',
        'pages_show_list'
      ],
      webhookFields: [
        'messages',
        'messaging_postbacks',
        'messaging_optins',
        'message_deliveries',
        'message_reads'
      ]
    };

    res.json({
      success: true,
      data: config,
      message: 'Facebook configuration retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error getting Facebook config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get Facebook configuration',
      message: error.message
    });
  }
});

// Facebook Token Test endpoint
app.post('/api/v1/integrations/facebook/test', async (req, res) => {
  try {
    const { pageId, pageAccessToken } = req.body;

    if (!pageAccessToken) {
      return res.status(400).json({
        success: false,
        error: 'pageAccessToken is required'
      });
    }

    // Test the page access token
    const pageInfo = await verifyFacebookPageToken(pageId || 'me', pageAccessToken);

    if (pageInfo) {
      res.json({
        success: true,
        data: pageInfo,
        message: 'Page access token is valid'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid page access token'
      });
    }
  } catch (error) {
    console.error('❌ Error testing Facebook token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test page access token',
      message: error.message
    });
  }
});

// Facebook Integration Diagnostics endpoint
app.get('/api/v1/integrations/facebook/diagnostics', async (req, res) => {
  try {
    console.log('🔍 Running Facebook integration diagnostics...');

    const diagnostics = {
      timestamp: new Date().toISOString(),
      server: {
        status: 'running',
        port: process.env.PORT || 3001,
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime()
      },
      database: {
        status: 'unknown',
        connection: false,
        tables: {}
      },
      facebook: {
        config: {},
        pages: {
          total: 0,
          connected: 0,
          list: []
        },
        webhooks: {
          url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/v1/integrations/facebook/webhook`,
          verifyToken: process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || 'simple_chat_verify_token_2025',
          lastReceived: 'unknown'
        }
      },
      ai: {
        service: 'unknown',
        status: 'unknown'
      },
      issues: [],
      recommendations: []
    };

    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      diagnostics.database.status = 'connected';
      diagnostics.database.connection = true;

      // Check tables
      try {
        const companies = await prisma.company.count();
        diagnostics.database.tables.companies = companies;

        const facebookPages = await prisma.facebookPage.count();
        diagnostics.database.tables.facebookPages = facebookPages;

        const conversations = await prisma.conversation.count();
        diagnostics.database.tables.conversations = conversations;

        const messages = await prisma.message.count();
        diagnostics.database.tables.messages = messages;

        const customers = await prisma.customer.count();
        diagnostics.database.tables.customers = customers;

      } catch (tableError) {
        diagnostics.issues.push({
          type: 'database',
          severity: 'warning',
          message: 'Some database tables may not exist',
          details: tableError.message
        });
      }
    } catch (dbError) {
      diagnostics.database.status = 'error';
      diagnostics.database.connection = false;
      diagnostics.issues.push({
        type: 'database',
        severity: 'critical',
        message: 'Database connection failed',
        details: dbError.message
      });
    }

    // Check Facebook configuration
    diagnostics.facebook.config = {
      appId: process.env.FACEBOOK_APP_ID || 'using-page-tokens',
      appSecret: process.env.FACEBOOK_APP_SECRET ? 'set' : 'using-page-tokens',
      webhookVerifyToken: process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || 'default',
      backendUrl: process.env.BACKEND_URL || 'http://localhost:3001',
      mode: 'page-access-token' // Using direct page access tokens
    };

    // Check Facebook pages
    if (diagnostics.database.connection) {
      try {
        const allPages = await prisma.facebookPage.findMany({
          select: {
            id: true,
            pageId: true,
            pageName: true,
            status: true,
            connectedAt: true,
            companyId: true
          }
        });

        diagnostics.facebook.pages.total = allPages.length;
        diagnostics.facebook.pages.connected = allPages.filter(p => p.status === 'connected').length;
        diagnostics.facebook.pages.list = allPages;

      } catch (pageError) {
        diagnostics.issues.push({
          type: 'facebook',
          severity: 'warning',
          message: 'Failed to load Facebook pages',
          details: pageError.message
        });
      }
    }

    // Check AI service
    try {
      if (process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY) {
        diagnostics.ai.service = 'gemini';
        diagnostics.ai.status = 'configured';
      } else {
        diagnostics.ai.service = 'mock';
        diagnostics.ai.status = 'mock-mode';
        diagnostics.issues.push({
          type: 'ai',
          severity: 'info',
          message: 'Using mock AI service',
          details: 'Set GOOGLE_GEMINI_API_KEY for production AI responses'
        });
      }
    } catch (aiError) {
      diagnostics.ai.status = 'error';
      diagnostics.issues.push({
        type: 'ai',
        severity: 'warning',
        message: 'AI service check failed',
        details: aiError.message
      });
    }

    // Generate recommendations
    // Skip App ID/Secret recommendations when using page access tokens
    if (diagnostics.facebook.config.appId === 'not-set' || diagnostics.facebook.config.appId === 'your-facebook-app-id') {
      diagnostics.recommendations.push({
        type: 'facebook',
        priority: 'low',
        message: 'Using page access tokens (recommended for simple setups)',
        action: 'Current setup is working fine with direct page tokens'
      });
    }

    if (diagnostics.facebook.pages.connected === 0) {
      diagnostics.recommendations.push({
        type: 'facebook',
        priority: 'medium',
        message: 'No Facebook pages connected',
        action: 'Connect at least one Facebook page to receive messages'
      });
    }

    if (diagnostics.ai.status === 'mock-mode') {
      diagnostics.recommendations.push({
        type: 'ai',
        priority: 'medium',
        message: 'Using mock AI responses',
        action: 'Set GOOGLE_GEMINI_API_KEY for real AI responses'
      });
    }

    console.log('✅ Diagnostics completed');

    res.json({
      success: true,
      data: diagnostics,
      message: 'Diagnostics completed successfully'
    });

  } catch (error) {
    console.error('❌ Error running diagnostics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to run diagnostics',
      message: error.message
    });
  }
});

// Test Facebook Message Simulation (for testing AI auto-reply)
app.post('/api/v1/integrations/facebook/test-message', async (req, res) => {
  try {
    const { pageId, senderId, messageText } = req.body;

    if (!pageId || !senderId || !messageText) {
      return res.status(400).json({
        success: false,
        error: 'pageId, senderId, and messageText are required'
      });
    }

    console.log(`🧪 Testing Facebook message simulation: "${messageText}"`);

    // Find connected Facebook page
    const facebookPage = await prisma.facebookPage.findFirst({
      where: {
        pageId,
        status: 'connected',
      },
      include: {
        company: true,
      },
    });

    if (!facebookPage) {
      return res.status(404).json({
        success: false,
        error: 'Facebook page not found or not connected'
      });
    }

    // Simulate webhook message processing
    const mockMessaging = {
      sender: { id: senderId },
      recipient: { id: pageId },
      timestamp: Date.now(),
      message: {
        mid: `test_${Date.now()}`,
        text: messageText,
        attachments: []
      }
    };

    // Process the simulated message
    await processFacebookMessage(mockMessaging, facebookPage);

    console.log(`✅ Test message processed successfully`);

    res.json({
      success: true,
      message: 'Test message processed successfully',
      data: {
        pageId,
        senderId,
        messageText,
        processed: true
      }
    });
  } catch (error) {
    console.error('❌ Error processing test message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process test message',
      message: error.message
    });
  }
});

// Helper functions for Facebook API

// Verify Facebook page token
async function verifyFacebookPageToken(pageId, pageAccessToken) {
  try {
    const response = await axios.get(`https://graph.facebook.com/v18.0/${pageId}`, {
      params: {
        access_token: pageAccessToken,
        fields: 'id,name,category,picture',
      },
    });

    console.log(`✅ Facebook API response for ${pageId}:`, {
      id: response.data.id,
      name: response.data.name,
      category: response.data.category
    });

    return response.data;
  } catch (error) {
    console.error('❌ Error verifying Facebook page token:', error.response?.data || error.message);
    return null;
  }
}

// Subscribe to Facebook webhooks
async function subscribeToFacebookWebhooks(pageId, pageAccessToken) {
  try {
    await axios.post(`https://graph.facebook.com/v18.0/${pageId}/subscribed_apps`, {
      access_token: pageAccessToken,
      subscribed_fields: 'messages,messaging_postbacks,messaging_optins,message_deliveries,message_reads',
    });

    console.log(`✅ Subscribed to webhooks for page ${pageId}`);
  } catch (error) {
    console.error('❌ Error subscribing to webhooks:', error);
    throw error;
  }
}

// Debug route to check database
app.post('/api/v1/integrations/facebook/debug-db', async (req, res) => {
  try {
    const { pageId } = req.body;

    // Check FacebookPage table
    const facebookPage = await prisma.facebookPage.findFirst({
      where: { pageId },
      include: { company: true }
    });

    // Check Integration table
    const integration = await prisma.integration.findFirst({
      where: {
        platform: 'FACEBOOK',
        externalId: pageId
      },
      include: { company: true }
    });

    res.json({
      success: true,
      data: {
        facebookPage,
        integration,
        pageId
      }
    });
  } catch (error) {
    console.error('Debug DB error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fix missing integration record
app.post('/api/v1/integrations/facebook/fix-integration', async (req, res) => {
  try {
    const { pageId } = req.body;

    // Find FacebookPage
    const facebookPage = await prisma.facebookPage.findFirst({
      where: { pageId }
    });

    if (!facebookPage) {
      return res.status(404).json({ success: false, error: 'Facebook page not found' });
    }

    // Check if Integration already exists
    const existingIntegration = await prisma.integration.findFirst({
      where: {
        platform: 'FACEBOOK',
        externalId: pageId
      }
    });

    if (existingIntegration) {
      return res.json({ success: true, message: 'Integration already exists', integration: existingIntegration });
    }

    // Create Integration record
    const integration = await prisma.integration.create({
      data: {
        platform: 'FACEBOOK',
        type: 'SOCIAL_MEDIA',
        externalId: pageId,
        name: facebookPage.pageName,
        companyId: facebookPage.companyId,
        isActive: true,
        config: {
          pageAccessToken: facebookPage.pageAccessToken,
          pageName: facebookPage.pageName
        },
        settings: JSON.stringify({
          pageAccessToken: facebookPage.pageAccessToken,
          pageName: facebookPage.pageName
        })
      }
    });

    console.log(`✅ Created Integration record for page ${pageId}`);

    res.json({
      success: true,
      message: 'Integration record created successfully',
      integration
    });
  } catch (error) {
    console.error('Fix integration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send message via Facebook API
async function sendFacebookMessage(pageId, recipientId, message, pageAccessToken, messageType = 'TEXT') {
  try {
    const messageData = {
      recipient: { id: recipientId },
      message: {},
    };

    if (messageType === 'TEXT') {
      messageData.message.text = message;
    } else if (messageType === 'IMAGE') {
      messageData.message.attachment = {
        type: 'image',
        payload: { url: message },
      };
    } else if (messageType === 'FILE') {
      messageData.message.attachment = {
        type: 'file',
        payload: { url: message },
      };
    }

    const response = await axios.post(`https://graph.facebook.com/v18.0/${pageId}/messages`, messageData, {
      params: {
        access_token: pageAccessToken,
      },
    });

    return response.data;
  } catch (error) {
    console.error('❌ Error sending Facebook message:', error);
    throw error;
  }
}

// Generate and send AI auto-reply
async function generateAndSendAIReply(conversation, customer, messageText, facebookPage) {
  console.log('🔥 FUNCTION CALLED: generateAndSendAIReply (ADVANCED)');
  console.log('🔥 PARAMETERS:', { conversation: conversation.id, customer: customer.id, messageText, page: facebookPage.pageId });

  try {
    console.log(`🤖 Generating AI reply for message: "${messageText}"`);
    console.log(`👤 Customer: ${customer.firstName} ${customer.lastName} (${customer.facebookId})`);
    console.log(`📄 Page: ${facebookPage.pageName} (${facebookPage.pageId})`);

    // Check if AI is enabled (simple check for now)
    const shouldReply = messageText.length > 0 && messageText.length < 500;

    if (!shouldReply) {
      console.log('⏭️ Skipping AI reply (message too short/long)');
      return { success: false, error: 'Message length invalid' };
    }

    // Initialize advanced services
    const AdvancedGeminiService = require('./src/services/advancedGeminiService');
    const AdvancedPromptService = require('./src/services/advancedPromptService');
    const AdvancedProductService = require('./src/services/advancedProductService');

    const advancedGeminiService = new AdvancedGeminiService();
    const advancedPromptService = new AdvancedPromptService();
    const advancedProductService = new AdvancedProductService();

    // Get AI settings from database
    const firstCompany = await prisma.company.findFirst();
    if (!firstCompany) {
      console.log('⚠️ No company found, using fallback response');
      return { success: false, error: 'No company found' };
    }

    const aiSettings = await prisma.aiSettings.findUnique({
      where: { companyId: firstCompany.id }
    });

    if (!aiSettings) {
      console.log('⚠️ AI settings not found, skipping');
      return { success: false, error: 'AI settings not found' };
    }

    // Check if AI is enabled (not auto-reply, just AI in general)
    console.log('🔍 AI Settings:', {
      hasSettings: !!aiSettings,
      autoReplyEnabled: aiSettings.autoReplyEnabled,
      confidenceThreshold: aiSettings.confidenceThreshold
    });

    // Parse API key from escalation rules
    let apiKey = null;
    try {
      const parsedRules = JSON.parse(aiSettings.escalationRules || '{}');
      apiKey = parsedRules.apiKey;
    } catch (e) {
      apiKey = null;
    }

    if (!apiKey) {
      console.log('⚠️ No API key configured, using fallback response');
      return { success: false, error: 'No API key' };
    }

    // Initialize advanced Gemini service
    await advancedGeminiService.initialize(facebookPage.companyId);

    // Get company prompts
    const promptsResult = await advancedPromptService.getCompanyPrompts(facebookPage.companyId);

    // Get memory settings
    let memorySettings = null;
    try {
      const aiSettings = await prisma.aiSettings.findFirst({
        where: { companyId: facebookPage.companyId }
      });

      if (aiSettings && aiSettings.memorySettings) {
        memorySettings = typeof aiSettings.memorySettings === 'string'
          ? JSON.parse(aiSettings.memorySettings)
          : aiSettings.memorySettings;
        console.log('🧠 Loaded memory settings:', memorySettings);
      }
    } catch (error) {
      console.log('⚠️ Error loading memory settings:', error.message);
    }

    // Get conversation history for memory
    let conversationHistory = [];
    try {
      const memoryLimit = memorySettings?.conversationMemoryLimit || 15;
      const messages = await prisma.message.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: 'desc' },
        take: memoryLimit,
        select: {
          content: true,
          isFromCustomer: true,
          createdAt: true
        }
      });

      // Reverse to get chronological order
      conversationHistory = messages.reverse();
      console.log(`🧠 Loaded ${conversationHistory.length} messages for conversation memory`);
    } catch (error) {
      console.log('⚠️ Error loading conversation history:', error.message);
    }

    // Build context for AI
    const context = {
      companyInfo: {
        name: facebookPage.pageName,
        businessType: 'ecommerce'
      },
      customerInfo: {
        name: `${customer.firstName} ${customer.lastName}`,
        facebookId: customer.facebookId
      },
      conversationHistory: conversationHistory,
      memorySettings: memorySettings || {
        conversationMemoryLimit: 15,
        memoryType: 'all',
        memoryDuration: 48,
        enableContextualMemory: true
      }
    };

    // Add prompts to context if available
    if (promptsResult.success) {
      context.personalityPrompt = promptsResult.data.personalityPrompt;
      context.responsePrompt = promptsResult.data.responsePrompt;
    }

    // Generate AI response using advanced service
    let aiResponse;
    let aiResult;
    try {
      console.log('🤖 Calling Advanced Gemini Service for auto reply...');

      aiResult = await advancedGeminiService.generateResponse(facebookPage.companyId, messageText, context);

      if (aiResult.success) {
        aiResponse = aiResult.response;
        console.log(`🎯 AI response generated: "${aiResponse}"`);
        console.log(`📊 Model used: ${aiResult.modelUsed}, Tokens: ${aiResult.tokensUsed}, Time: ${aiResult.responseTime}ms`);

        // Log the AI response
        aiLogger.log('AdvancedGeminiService', {
          content: messageText,
          customerId: customer.id,
          conversationId: conversation.id,
          platform: 'facebook'
        }, {
          content: aiResponse,
          confidence: aiResult.confidence,
          model: aiResult.modelUsed,
          tokensUsed: aiResult.tokensUsed,
          responseTime: aiResult.responseTime,
          success: true
        }, {
          companyId: facebookPage.companyId,
          hasPersonalityPrompt: !!context.personalityPrompt,
          hasResponsePrompt: !!context.responsePrompt
        });
      } else {
        throw new Error(aiResult.error);
      }

    } catch (aiError) {
      console.error('⚠️ Advanced Gemini API failed:', aiError);
      aiResponse = getSmartFallbackResponse(messageText);
      console.log(`🔄 Using fallback response: "${aiResponse}"`);
      aiResult = { success: false, error: aiError.message };

      // Log the fallback response
      aiLogger.log('StaticFallback', {
        content: messageText,
        customerId: customer.id,
        conversationId: conversation.id,
        platform: 'facebook'
      }, {
        content: aiResponse,
        confidence: 0.5,
        model: 'fallback',
        success: true
      }, {
        reason: 'AdvancedGeminiService failed',
        originalError: aiError.message
      });
    }

    // Check if we should suggest products
    let productSuggestions = null;
    try {
      const productResult = await advancedProductService.recommendProducts(facebookPage.companyId, messageText, customer.id);
      if (productResult.success && productResult.data.recommendations.length > 0) {
        productSuggestions = productResult.data.recommendations;
        console.log(`🛍️ Found ${productSuggestions.length} product suggestions`);

        // Add product suggestions to response
        if (productSuggestions.length > 0) {
          aiResponse += '\n\n🛍️ منتجات قد تهمك:\n';
          productSuggestions.slice(0, 2).forEach((product, index) => {
            aiResponse += `${index + 1}. ${product.name} - ${product.price} جنيه\n`;
          });
        }
      }
    } catch (productError) {
      console.error('⚠️ Product recommendation failed:', productError);
    }

    // Send AI response via Facebook
    try {
      const result = await sendFacebookMessage(
        facebookPage.pageId,
        customer.facebookId,
        aiResponse,
        facebookPage.pageAccessToken,
        'TEXT'
      );

      console.log(`📤 AI reply sent successfully: ${result.message_id}`);

      // Save AI response to database with advanced metadata
      await prisma.message.create({
        data: {
          content: aiResponse,
          type: 'TEXT',
          conversationId: conversation.id,
          isFromCustomer: false,
          metadata: JSON.stringify({
            platform: 'facebook',
            isAIGenerated: true,
            facebookMessageId: result.message_id,
            aiModel: aiResult?.modelUsed || 'fallback',
            tokensUsed: aiResult?.tokensUsed || 0,
            responseTime: aiResult?.responseTime || 0,
            confidence: aiResult?.confidence || 0.5,
            hasProductSuggestions: !!productSuggestions,
            productSuggestionsCount: productSuggestions?.length || 0,
            usedAdvancedService: true,
            timestamp: new Date().toISOString()
          }),
        },
      });

      // Update conversation
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: new Date(),
          lastMessagePreview: aiResponse.length > 100 ? aiResponse.substring(0, 100) + '...' : aiResponse,
        },
      });

      console.log(`✅ AI reply saved to database`);

    } catch (sendError) {
      console.error('❌ Failed to send AI reply via Facebook:', sendError);
    }

  } catch (error) {
    console.error('❌ Error in AI auto-reply:', error);
  }
}

// Smart fallback responses
function getSmartFallbackResponse(messageText) {
  const lowerMessage = messageText.toLowerCase();

  // Greeting responses
  if (lowerMessage.includes('مرحبا') || lowerMessage.includes('السلام') || lowerMessage.includes('أهلا')) {
    return 'مرحباً بك! أهلاً وسهلاً، كيف يمكنني مساعدتك اليوم؟ 😊';
  }

  // Question responses
  if (lowerMessage.includes('؟') || lowerMessage.includes('كيف') || lowerMessage.includes('متى') || lowerMessage.includes('أين')) {
    return 'شكراً لسؤالك! سأكون سعيداً لمساعدتك. دعني أتحقق من المعلومات وأعود إليك قريباً.';
  }

  // Problem/complaint responses
  if (lowerMessage.includes('مشكلة') || lowerMessage.includes('خطأ') || lowerMessage.includes('لا يعمل')) {
    return 'أعتذر عن أي إزعاج. سأقوم بتحويل استفسارك إلى فريق الدعم الفني للمساعدة الفورية. 🔧';
  }

  // Order/product responses
  if (lowerMessage.includes('طلب') || lowerMessage.includes('منتج') || lowerMessage.includes('شراء')) {
    return 'بخصوص طلبك، سأقوم بمراجعة التفاصيل وأعود إليك بالمعلومات المطلوبة قريباً. 📦';
  }

  // Default response
  return 'شكراً لتواصلك معنا! تم استلام رسالتك وسيقوم فريقنا بالرد عليك في أقرب وقت ممكن. 💬';
}

// Google Gemini AI endpoints
const geminiService = require('./src/services/geminiService');

// Generate AI response
app.post('/api/v1/ai/generate-response', (req, res) => {
  const { messageText, context } = req.body;

  geminiService.generateResponse(messageText, context).then(result => {
    if (!result.success) {
      // Log failed response
      aiLogger.log('GeminiService', {
        content: messageText,
        customerId: context?.customerId,
        conversationId: context?.conversationId,
        platform: 'api'
      }, {
        success: false,
        error: result.error
      }, {
        endpoint: '/api/v1/ai/generate-response'
      });
      return res.status(400).json(result);
    }

    // Log successful response
    aiLogger.log('GeminiService', {
      content: messageText,
      customerId: context?.customerId,
      conversationId: context?.conversationId,
      platform: 'api'
    }, {
      content: result.text || result.response,
      confidence: result.confidence,
      model: result.model,
      success: true
    }, {
      endpoint: '/api/v1/ai/generate-response'
    });

    res.json(result);
  });
});

// Analyze sentiment
app.post('/api/v1/ai/analyze-sentiment', (req, res) => {
  const { messageText, context } = req.body;

  geminiService.analyzeSentiment(messageText, context).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Suggest products
app.post('/api/v1/ai/suggest-products', (req, res) => {
  const { messageText, context } = req.body;

  geminiService.suggestProducts(messageText, context).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Create or update prompt
app.post('/api/v1/ai/prompts', (req, res) => {
  geminiService.createPrompt(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get prompts for company (removed - using advancedPromptService instead)

// Get AI statistics
app.get('/api/v1/ai/stats', (req, res) => {
  const { companyId } = req.query;

  geminiService.getAIStats(companyId).then(result => {
    res.json(result);
  });
});

// ==================== ADVANCED AI ENDPOINTS ====================

// Advanced Gemini Service endpoints
const AdvancedGeminiService = require('./src/services/advancedGeminiService');
const AdvancedPromptService = require('./src/services/advancedPromptService');
const AdvancedProductService = require('./src/services/advancedProductService');
const GeminiSourceManager = require('./src/services/geminiSourceManager');

const advancedGeminiService = new AdvancedGeminiService();
const advancedPromptService = new AdvancedPromptService();
const advancedProductService = new AdvancedProductService();
const geminiSourceManager = new GeminiSourceManager();

// Get available Gemini models (grouped by category)
app.get('/api/v1/ai/models', async (req, res) => {
  try {
    const companyId = req.query.companyId || 'default';
    const models = advancedGeminiService.getAvailableModels(companyId);
    res.json({
      success: true,
      data: models,
      message: `Found ${Object.values(models).flat().length} available models`
    });
  } catch (error) {
    console.error('Error getting available models:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all models (flat list)
app.get('/api/v1/ai/models/all', async (req, res) => {
  try {
    const models = advancedGeminiService.getAllModelsGrouped();
    const flatList = Object.values(models).flat();
    res.json({
      success: true,
      data: flatList,
      count: flatList.length,
      categories: Object.keys(models).map(key => ({
        name: key,
        count: models[key].length
      }))
    });
  } catch (error) {
    console.error('Error getting all models:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get recommended models for different use cases
app.get('/api/v1/ai/models/recommended', async (req, res) => {
  try {
    const recommended = advancedGeminiService.getRecommendedModels();
    res.json({
      success: true,
      data: recommended,
      message: 'Recommended models for different use cases'
    });
  } catch (error) {
    console.error('Error getting recommended models:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get usage statistics
app.get('/api/v1/ai/usage-stats', async (req, res) => {
  try {
    const companyId = req.query.companyId || 'default';
    const period = req.query.period || 'today';
    const stats = await advancedGeminiService.getUsageStats(companyId, period);
    res.json(stats);
  } catch (error) {
    console.error('Error getting usage stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate advanced response
app.post('/api/v1/ai/generate-advanced-response', async (req, res) => {
  try {
    let companyId = req.body.companyId;
    const { message, customerId, includeProducts = false } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    // If no companyId provided, get the first company from database
    if (!companyId || companyId === 'default') {
      const firstCompany = await prisma.company.findFirst();
      if (!firstCompany) {
        return res.status(404).json({ success: false, error: 'No company found' });
      }
      companyId = firstCompany.id;
      console.log(`🔧 Using first company ID: ${companyId}`);
    }

    // Initialize advanced service
    await advancedGeminiService.initialize(companyId);

    // Build context (simplified for now)
    const context = {
      companyInfo: { name: 'Test Company' },
      customerInfo: customerId ? { id: customerId } : {}
    };

    // Get company prompts
    const prompts = await advancedPromptService.getCompanyPrompts(companyId);
    if (prompts.success) {
      context.personalityPrompt = prompts.data.personalityPrompt;
      context.responsePrompt = prompts.data.responsePrompt;
    }

    // Generate response
    const result = await advancedGeminiService.generateResponse(companyId, message, context);

    // Log the response
    aiLogger.log('AdvancedGeminiService', {
      content: message,
      customerId: customerId,
      platform: 'api'
    }, {
      content: result.response,
      confidence: result.confidence,
      model: result.modelUsed,
      tokensUsed: result.tokensUsed,
      responseTime: result.responseTime,
      success: result.success
    }, {
      endpoint: '/api/v1/ai/generate-advanced-response',
      companyId: companyId,
      includeProducts: includeProducts
    });

    // Get product recommendations if requested
    let productRecommendations = null;
    if (includeProducts && result.success) {
      const productResult = await advancedProductService.recommendProducts(companyId, message, customerId);
      if (productResult.success) {
        productRecommendations = productResult.data.recommendations;
      }
    }

    res.json({
      ...result,
      productRecommendations
    });
  } catch (error) {
    console.error('Error generating advanced response:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== PROMPT MANAGEMENT ENDPOINTS ====================

// Get prompt templates
app.get('/api/v1/ai/prompt-templates', async (req, res) => {
  try {
    const { category, businessType } = req.query;
    const result = await advancedPromptService.getPromptTemplates({
      category,
      businessType
    });
    res.json(result);
  } catch (error) {
    console.error('Error getting prompt templates:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get company prompts
app.get('/api/v1/ai/prompts', async (req, res) => {
  try {
    const companyId = req.query.companyId || 'cmd5c0c9y0000ymzdd7wtv7ib';
    const result = await advancedPromptService.getCompanyPrompts(companyId);
    res.json(result);
  } catch (error) {
    console.error('Error getting company prompts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update company prompts
app.put('/api/v1/ai/prompts', async (req, res) => {
  try {
    const companyId = req.body.companyId || 'cmd5c0c9y0000ymzdd7wtv7ib';
    const { personalityPrompt, responsePrompt } = req.body;

    const result = await advancedPromptService.updateCompanyPrompts(companyId, {
      personalityPrompt,
      responsePrompt
    });

    res.json(result);
  } catch (error) {
    console.error('Error updating company prompts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Apply template to company
app.post('/api/v1/ai/prompts/apply-template', async (req, res) => {
  try {
    const companyId = req.body.companyId || 'cmd5c0c9y0000ymzdd7wtv7ib';
    const { templateId, promptType } = req.body;

    if (!templateId || !promptType) {
      return res.status(400).json({ success: false, error: 'Template ID and prompt type are required' });
    }

    const result = await advancedPromptService.applyTemplate(companyId, templateId, promptType);
    res.json(result);
  } catch (error) {
    console.error('Error applying template:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== PRODUCT AI ENDPOINTS ====================

// Get product AI settings
app.get('/api/v1/ai/product-settings', async (req, res) => {
  try {
    const companyId = req.query.companyId || 'default';
    const result = await advancedProductService.getProductAiSettings(companyId);
    res.json(result);
  } catch (error) {
    console.error('Error getting product AI settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update product AI settings
app.put('/api/v1/ai/product-settings', async (req, res) => {
  try {
    const companyId = req.body.companyId || 'default';
    const settings = req.body;
    const result = await advancedProductService.updateProductAiSettings(companyId, settings);
    res.json(result);
  } catch (error) {
    console.error('Error updating product AI settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Recommend products
app.post('/api/v1/ai/recommend-products-advanced', async (req, res) => {
  try {
    const companyId = req.body.companyId || 'default';
    const { message, customerId } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const result = await advancedProductService.recommendProducts(companyId, message, customerId);
    res.json(result);
  } catch (error) {
    console.error('Error recommending products:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Analyze customer image
app.post('/api/v1/ai/analyze-image', async (req, res) => {
  try {
    const companyId = req.body.companyId || 'default';
    const { imageUrl, message = '' } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ success: false, error: 'Image URL is required' });
    }

    const result = await advancedProductService.analyzeCustomerImage(companyId, imageUrl, message);
    res.json(result);
  } catch (error) {
    console.error('Error analyzing customer image:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Enhanced Conversation Management endpoints
const conversationService = require('./src/services/conversationService');

// Classify conversation
app.post('/api/v1/conversations/:conversationId/classify', (req, res) => {
  const { conversationId } = req.params;
  const { messageText } = req.body;

  conversationService.classifyConversation(conversationId, messageText).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Update conversation status
app.put('/api/v1/conversations/:conversationId/status', (req, res) => {
  const { conversationId } = req.params;
  const { status, notes } = req.body;

  conversationService.updateConversationStatus(conversationId, status, notes).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Assign conversation
app.put('/api/v1/conversations/:conversationId/assign', (req, res) => {
  const { conversationId } = req.params;
  const { agentId, agentName } = req.body;

  conversationService.assignConversation(conversationId, agentId, agentName).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get response templates
app.get('/api/v1/conversations/templates', (req, res) => {
  const { category } = req.query;

  conversationService.getResponseTemplates(category).then(result => {
    res.json(result);
  });
});

// Use response template
app.post('/api/v1/conversations/templates/:templateId/use', (req, res) => {
  const { templateId } = req.params;
  const { variables } = req.body;

  conversationService.useResponseTemplate(templateId, variables).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get conversation statistics
app.get('/api/v1/conversations/stats', (req, res) => {
  conversationService.getConversationStats().then(result => {
    res.json(result);
  });
});

// Get conversations with enhanced filters
app.get('/api/v1/conversations/enhanced', (req, res) => {
  conversationService.getConversations(req.query).then(result => {
    res.json(result);
  });
});

// Shipping and Tracking endpoints
const shippingService = require('./src/services/shippingService');

// Calculate shipping rates
app.post('/api/v1/shipping/calculate-rates', (req, res) => {
  shippingService.calculateShippingRates(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Create shipping label
app.post('/api/v1/shipping/create-label', (req, res) => {
  shippingService.createShippingLabel(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(201).json(result);
  });
});

// Track shipment
app.get('/api/v1/shipping/track/:trackingNumber', (req, res) => {
  const { trackingNumber } = req.params;

  shippingService.trackShipment(trackingNumber).then(result => {
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  });
});

// Get shipping statistics
app.get('/api/v1/shipping/stats', (req, res) => {
  shippingService.getShippingStats().then(result => {
    res.json(result);
  });
});

// Get available carriers
app.get('/api/v1/shipping/carriers', (req, res) => {
  shippingService.getCarriers().then(result => {
    res.json(result);
  });
});

// Product Reviews and Ratings endpoints
const reviewService = require('./src/services/reviewService');

// Add new review
app.post('/api/v1/reviews', (req, res) => {
  reviewService.addReview(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(201).json(result);
  });
});

// Update review status (moderation)
app.put('/api/v1/reviews/:reviewId/status', (req, res) => {
  const { reviewId } = req.params;
  const { status, moderatorNotes } = req.body;

  reviewService.updateReviewStatus(reviewId, status, moderatorNotes).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Vote on review helpfulness
app.post('/api/v1/reviews/:reviewId/vote', (req, res) => {
  const { reviewId } = req.params;
  const { userId, voteType } = req.body;

  reviewService.voteOnReview(reviewId, userId, voteType).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Report review
app.post('/api/v1/reviews/:reviewId/report', (req, res) => {
  const { reviewId } = req.params;
  const { reporterId, reason, description } = req.body;

  reviewService.reportReview(reviewId, reporterId, reason, description).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(201).json(result);
  });
});

// Get product reviews
app.get('/api/v1/products/:productId/reviews', (req, res) => {
  const { productId } = req.params;

  reviewService.getProductReviews(productId, req.query).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get all reviews (for moderation)
app.get('/api/v1/reviews', (req, res) => {
  reviewService.getAllReviews(req.query).then(result => {
    res.json(result);
  });
});

// Get review statistics
app.get('/api/v1/reviews/stats', (req, res) => {
  reviewService.getReviewStats().then(result => {
    res.json(result);
  });
});

// Returns and Exchange endpoints
const returnService = require('./src/services/returnService');

// Create return request
app.post('/api/v1/returns', (req, res) => {
  returnService.createReturnRequest(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(201).json(result);
  });
});

// Update return status
app.put('/api/v1/returns/:returnId/status', (req, res) => {
  const { returnId } = req.params;
  const { status, updatedBy, notes } = req.body;

  returnService.updateReturnStatus(returnId, status, updatedBy, notes).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get return requests
app.get('/api/v1/returns', (req, res) => {
  returnService.getReturnRequests(req.query).then(result => {
    res.json(result);
  });
});

// Get return policies
app.get('/api/v1/returns/policies', (req, res) => {
  returnService.getReturnPolicies().then(result => {
    res.json(result);
  });
});

// Get return reasons
app.get('/api/v1/returns/reasons', (req, res) => {
  returnService.getReturnReasons().then(result => {
    res.json(result);
  });
});

// Get return statistics
app.get('/api/v1/returns/stats', (req, res) => {
  returnService.getReturnStats().then(result => {
    res.json(result);
  });
});

// Response Templates endpoints
const templateService = require('./src/services/templateService');

// Create new template
app.post('/api/v1/templates', (req, res) => {
  templateService.createTemplate(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(201).json(result);
  });
});

// Update template
app.put('/api/v1/templates/:templateId', (req, res) => {
  const { templateId } = req.params;

  templateService.updateTemplate(templateId, req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Use template with variables
app.post('/api/v1/templates/:templateId/use', (req, res) => {
  const { templateId } = req.params;
  const { variables } = req.body;

  templateService.useTemplate(templateId, variables).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get templates
app.get('/api/v1/templates', (req, res) => {
  templateService.getTemplates(req.query).then(result => {
    res.json(result);
  });
});

// Get template categories
app.get('/api/v1/templates/categories', (req, res) => {
  templateService.getCategories().then(result => {
    res.json(result);
  });
});

// Get template variables
app.get('/api/v1/templates/variables', (req, res) => {
  const { category } = req.query;

  templateService.getVariables(category).then(result => {
    res.json(result);
  });
});

// Get template statistics
app.get('/api/v1/templates/stats', (req, res) => {
  const { companyId } = req.query;

  templateService.getTemplateStats(companyId).then(result => {
    res.json(result);
  });
});

// Response Statistics endpoints
const responseStatsService = require('./src/services/responseStatsService');

// Record response time
app.post('/api/v1/response-stats/record', (req, res) => {
  responseStatsService.recordResponseTime(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Mark conversation as resolved
app.post('/api/v1/response-stats/resolve/:conversationId', (req, res) => {
  const { conversationId } = req.params;
  const { satisfactionRating, tags, category } = req.body;

  responseStatsService.markConversationResolved(conversationId, satisfactionRating, tags, category).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get response statistics
app.get('/api/v1/response-stats', (req, res) => {
  responseStatsService.getResponseStats(req.query).then(result => {
    res.json(result);
  });
});

// Get agent performance
app.get('/api/v1/response-stats/agent-performance', (req, res) => {
  const { agentId, period } = req.query;

  responseStatsService.getAgentPerformance(agentId, period).then(result => {
    res.json(result);
  });
});

// Get conversation analytics
app.get('/api/v1/response-stats/analytics', (req, res) => {
  responseStatsService.getConversationAnalytics(req.query).then(result => {
    res.json(result);
  });
});

// Get real-time metrics
app.get('/api/v1/response-stats/real-time', (req, res) => {
  responseStatsService.getRealTimeMetrics().then(result => {
    res.json(result);
  });
});

// Sales Reports endpoints
const salesReportService = require('./src/services/salesReportService');

// Get sales overview
app.get('/api/v1/sales-reports/overview', (req, res) => {
  salesReportService.getSalesOverview(req.query).then(result => {
    res.json(result);
  });
});

// Get detailed sales report
app.get('/api/v1/sales-reports/detailed', (req, res) => {
  salesReportService.getDetailedSalesReport(req.query).then(result => {
    res.json(result);
  });
});

// Get product performance report
app.get('/api/v1/sales-reports/product-performance', (req, res) => {
  salesReportService.getProductPerformanceReport(req.query).then(result => {
    res.json(result);
  });
});

// Get customer analysis report
app.get('/api/v1/sales-reports/customer-analysis', (req, res) => {
  salesReportService.getCustomerAnalysisReport(req.query).then(result => {
    res.json(result);
  });
});

// Get sales trends and forecasting
app.get('/api/v1/sales-reports/trends', (req, res) => {
  salesReportService.getSalesTrends(req.query).then(result => {
    res.json(result);
  });
});

// Export sales report
app.post('/api/v1/sales-reports/export', (req, res) => {
  const { filters, format } = req.body;

  salesReportService.exportSalesReport(filters, format).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Prompt Management endpoints
const promptManagementService = require('./src/services/promptManagementService');

// Create new prompt
app.post('/api/v1/prompts', (req, res) => {
  promptManagementService.createPrompt(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(201).json(result);
  });
});

// Update prompt
app.put('/api/v1/prompts/:promptId', (req, res) => {
  const { promptId } = req.params;

  promptManagementService.updatePrompt(promptId, req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Test prompt
app.post('/api/v1/prompts/:promptId/test', (req, res) => {
  const { promptId } = req.params;
  const { testInput } = req.body;

  promptManagementService.testPrompt(promptId, testInput).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get company prompts
app.get('/api/v1/prompts/company/:companyId', (req, res) => {
  const { companyId } = req.params;

  promptManagementService.getCompanyPrompts(companyId).then(result => {
    res.json(result);
  });
});

// Get prompt templates
app.get('/api/v1/prompts/templates', (req, res) => {
  const { businessTypeId } = req.query;

  promptManagementService.getPromptTemplates(businessTypeId).then(result => {
    res.json(result);
  });
});

// Get business types
app.get('/api/v1/prompts/business-types', (req, res) => {
  promptManagementService.getBusinessTypes().then(result => {
    res.json(result);
  });
});

// Get prompt variables
app.get('/api/v1/prompts/variables', (req, res) => {
  const { category } = req.query;

  promptManagementService.getPromptVariables(category).then(result => {
    res.json(result);
  });
});

// Get prompt analytics
app.get('/api/v1/prompts/analytics/:companyId', (req, res) => {
  const { companyId } = req.params;
  const { period } = req.query;

  promptManagementService.getPromptAnalytics(companyId, period).then(result => {
    res.json(result);
  });
});

// Smart Response endpoints
const smartResponseService = require('./src/services/smartResponseService');

// Generate smart response
app.post('/api/v1/smart-responses/generate', (req, res) => {
  smartResponseService.generateSmartResponse(req.body).then(result => {
    // Log the response
    aiLogger.log('SmartResponseService', {
      content: req.body.message || req.body.messageText,
      customerId: req.body.customerId,
      conversationId: req.body.conversationId,
      platform: 'api'
    }, {
      content: result.response || result.text,
      confidence: result.confidence,
      model: result.model,
      success: result.success
    }, {
      endpoint: '/api/v1/smart-responses/generate',
      companyId: req.body.companyId
    });

    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Send smart response
app.post('/api/v1/smart-responses/:responseId/send', (req, res) => {
  const { responseId } = req.params;
  const { delay, forceApproval } = req.body;

  smartResponseService.sendSmartResponse(responseId, { delay, forceApproval }).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Manual intervention on response
app.post('/api/v1/smart-responses/:responseId/intervene', (req, res) => {
  const { responseId } = req.params;

  smartResponseService.interventeResponse(responseId, req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get smart responses for review
app.get('/api/v1/smart-responses', (req, res) => {
  smartResponseService.getSmartResponses(req.query).then(result => {
    res.json(result);
  });
});

// Update response settings
app.put('/api/v1/smart-responses/settings/:companyId', (req, res) => {
  const { companyId } = req.params;

  smartResponseService.updateResponseSettings(companyId, req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get response analytics
app.get('/api/v1/smart-responses/analytics/:companyId', (req, res) => {
  const { companyId } = req.params;
  const { period } = req.query;

  smartResponseService.getResponseAnalytics(companyId, period).then(result => {
    res.json(result);
  });
});

// Sentiment Analysis endpoints
const sentimentAnalysisService = require('./src/services/sentimentAnalysisService');

// Analyze sentiment of a message
app.post('/api/v1/sentiment/analyze', (req, res) => {
  sentimentAnalysisService.analyzeSentiment(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get sentiment analysis history
app.get('/api/v1/sentiment/history', (req, res) => {
  sentimentAnalysisService.getSentimentHistory(req.query).then(result => {
    res.json(result);
  });
});

// Get customer sentiment profile
app.get('/api/v1/sentiment/customer/:customerId', (req, res) => {
  const { customerId } = req.params;

  sentimentAnalysisService.getCustomerSentimentProfile(customerId).then(result => {
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  });
});

// Get sentiment analytics
app.get('/api/v1/sentiment/analytics', (req, res) => {
  sentimentAnalysisService.getSentimentAnalytics(req.query).then(result => {
    res.json(result);
  });
});

// Product Recommendation endpoints
const productRecommendationService = require('./src/services/productRecommendationService');

// Generate product recommendations
app.post('/api/v1/recommendations/generate', (req, res) => {
  productRecommendationService.generateRecommendations(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Track recommendation performance
app.post('/api/v1/recommendations/:recommendationId/track', (req, res) => {
  const { recommendationId } = req.params;

  productRecommendationService.trackRecommendationPerformance({
    recommendationId,
    ...req.body
  }).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get recommendation analytics
app.get('/api/v1/recommendations/analytics', (req, res) => {
  productRecommendationService.getRecommendationAnalytics(req.query).then(result => {
    res.json(result);
  });
});

// Continuous Learning endpoints
const continuousLearningService = require('./src/services/continuousLearningService');

// Collect learning data
app.post('/api/v1/learning/collect', (req, res) => {
  continuousLearningService.collectLearningData(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Apply improvement
app.post('/api/v1/learning/improvements', (req, res) => {
  continuousLearningService.applyImprovement(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Evaluate improvement
app.post('/api/v1/learning/improvements/:improvementId/evaluate', (req, res) => {
  const { improvementId } = req.params;

  continuousLearningService.evaluateImprovement(improvementId).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get learning analytics
app.get('/api/v1/learning/analytics', (req, res) => {
  continuousLearningService.getLearningAnalytics(req.query).then(result => {
    res.json(result);
  });
});

// Model Training endpoints
const modelTrainingService = require('./src/services/modelTrainingService');

// Start training job
app.post('/api/v1/training/start', (req, res) => {
  modelTrainingService.startTraining(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get training status
app.get('/api/v1/training/:jobId/status', (req, res) => {
  const { jobId } = req.params;

  modelTrainingService.getTrainingStatus(jobId).then(result => {
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  });
});

// Stop training job
app.post('/api/v1/training/:jobId/stop', (req, res) => {
  const { jobId } = req.params;

  modelTrainingService.stopTraining(jobId).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Deploy model
app.post('/api/v1/models/deploy', (req, res) => {
  modelTrainingService.deployModel(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Evaluate model
app.post('/api/v1/models/evaluate', (req, res) => {
  modelTrainingService.evaluateModel(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get training analytics
app.get('/api/v1/training/analytics', (req, res) => {
  modelTrainingService.getTrainingAnalytics(req.query).then(result => {
    res.json(result);
  });
});

// Reminder Service endpoints
const reminderService = require('./src/services/reminderService');

// Create reminder
app.post('/api/v1/reminders', (req, res) => {
  reminderService.createReminder(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get reminders
app.get('/api/v1/reminders', (req, res) => {
  reminderService.getReminders(req.query).then(result => {
    res.json(result);
  });
});

// Update reminder status
app.put('/api/v1/reminders/:reminderId/status', (req, res) => {
  const { reminderId } = req.params;
  const { status, notes } = req.body;

  reminderService.updateReminderStatus(reminderId, status, notes).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Snooze reminder
app.post('/api/v1/reminders/:reminderId/snooze', (req, res) => {
  const { reminderId } = req.params;
  const { snoozeMinutes } = req.body;

  reminderService.snoozeReminder(reminderId, snoozeMinutes).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get reminder statistics
app.get('/api/v1/reminders/stats', (req, res) => {
  reminderService.getReminderStats(req.query).then(result => {
    res.json(result);
  });
});

// Notification Settings Service endpoints
const notificationSettingsService = require('./src/services/notificationSettingsService');

// Get user notification settings
app.get('/api/v1/notifications/settings/:userId', (req, res) => {
  const { userId } = req.params;

  notificationSettingsService.getUserSettings(userId).then(result => {
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  });
});

// Update user notification settings
app.put('/api/v1/notifications/settings/:userId', (req, res) => {
  const { userId } = req.params;

  notificationSettingsService.updateUserSettings(userId, req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get notification types
app.get('/api/v1/notifications/types', (req, res) => {
  const { companyId } = req.query;

  notificationSettingsService.getNotificationTypes(companyId).then(result => {
    res.json(result);
  });
});

// Test notification
app.post('/api/v1/notifications/test', (req, res) => {
  const { userId, testConfig } = req.body;

  notificationSettingsService.testNotification(userId, testConfig).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get notification statistics
app.get('/api/v1/notifications/stats/:userId', (req, res) => {
  const { userId } = req.params;
  const { period } = req.query;

  notificationSettingsService.getNotificationStats(userId, period).then(result => {
    res.json(result);
  });
});

// Dashboard Service endpoints
const dashboardService = require('./src/services/dashboardService');

// Get user dashboard
app.get('/api/v1/dashboard/:userId', (req, res) => {
  const { userId } = req.params;
  const { dashboardId } = req.query;

  dashboardService.getUserDashboard(userId, dashboardId).then(result => {
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  });
});

// Update dashboard layout
app.put('/api/v1/dashboard/:dashboardId/layout', (req, res) => {
  const { dashboardId } = req.params;

  dashboardService.updateDashboardLayout(dashboardId, req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Add widget to dashboard
app.post('/api/v1/dashboard/:dashboardId/widgets', (req, res) => {
  const { dashboardId } = req.params;

  dashboardService.addWidget(dashboardId, req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Remove widget from dashboard
app.delete('/api/v1/dashboard/:dashboardId/widgets/:widgetId', (req, res) => {
  const { dashboardId, widgetId } = req.params;

  dashboardService.removeWidget(dashboardId, widgetId).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get available widgets
app.get('/api/v1/dashboard/widgets', (req, res) => {
  const { category } = req.query;

  dashboardService.getAvailableWidgets(category).then(result => {
    res.json(result);
  });
});

// Get real-time metrics
app.get('/api/v1/dashboard/metrics/:companyId', (req, res) => {
  const { companyId } = req.params;

  dashboardService.getRealTimeMetrics(companyId).then(result => {
    res.json(result);
  });
});

// Conversation Reports Service endpoints
const conversationReportsService = require('./src/services/conversationReportsService');

// Get conversation analytics
app.get('/api/v1/reports/conversations/analytics', (req, res) => {
  conversationReportsService.getConversationAnalytics(req.query).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get response time metrics
app.get('/api/v1/reports/conversations/response-times', (req, res) => {
  conversationReportsService.getResponseTimeMetrics(req.query).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get agent performance
app.get('/api/v1/reports/conversations/agent-performance', (req, res) => {
  conversationReportsService.getAgentPerformance(req.query).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get customer insights
app.get('/api/v1/reports/conversations/customer-insights', (req, res) => {
  conversationReportsService.getCustomerInsights(req.query).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Generate conversation report
app.post('/api/v1/reports/conversations/generate', (req, res) => {
  conversationReportsService.generateReport(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Advanced Sales Reports Service endpoints
const advancedSalesReportsService = require('./src/services/advancedSalesReportsService');

// Get sales report
app.get('/api/v1/reports/sales', (req, res) => {
  advancedSalesReportsService.getSalesReport(req.query).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get performance dashboard
app.get('/api/v1/reports/sales/performance', (req, res) => {
  advancedSalesReportsService.getPerformanceDashboard(req.query).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get revenue analysis
app.get('/api/v1/reports/sales/revenue', (req, res) => {
  advancedSalesReportsService.getRevenueAnalysis(req.query).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get customer analytics
app.get('/api/v1/reports/sales/customers', (req, res) => {
  advancedSalesReportsService.getCustomerAnalytics(req.query).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Generate comprehensive report
app.post('/api/v1/reports/sales/generate', (req, res) => {
  advancedSalesReportsService.generateComprehensiveReport(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Customer Behavior Service endpoints
const customerBehaviorService = require('./src/services/customerBehaviorService');

// Get behavior overview
app.get('/api/v1/analytics/behavior/overview', (req, res) => {
  customerBehaviorService.getBehaviorOverview(req.query).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get customer segmentation
app.get('/api/v1/analytics/behavior/segmentation', (req, res) => {
  customerBehaviorService.getCustomerSegmentation(req.query).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get customer journey
app.get('/api/v1/analytics/behavior/journey', (req, res) => {
  customerBehaviorService.getCustomerJourney(req.query).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get predictive analytics
app.get('/api/v1/analytics/behavior/predictive', (req, res) => {
  customerBehaviorService.getPredictiveAnalytics(req.query).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get cohort analysis
app.get('/api/v1/analytics/behavior/cohort', (req, res) => {
  customerBehaviorService.getCohortAnalysis(req.query).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Custom KPI Service endpoints
const customKPIService = require('./src/services/customKPIService');

// Get KPI definitions
app.get('/api/v1/kpis/definitions', (req, res) => {
  customKPIService.getKPIDefinitions(req.query).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Create custom KPI
app.post('/api/v1/kpis/definitions', (req, res) => {
  customKPIService.createCustomKPI(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get KPI dashboard
app.get('/api/v1/kpis/dashboard/:dashboardId', (req, res) => {
  const { dashboardId } = req.params;

  customKPIService.getKPIDashboard(dashboardId).then(result => {
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  });
});

// Update KPI value
app.put('/api/v1/kpis/:kpiId/value', (req, res) => {
  const { kpiId } = req.params;
  const { value, timestamp } = req.body;

  customKPIService.updateKPIValue(kpiId, value, timestamp).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get KPI analytics
app.get('/api/v1/kpis/analytics', (req, res) => {
  customKPIService.getKPIAnalytics(req.query).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Report Export Service endpoints
const reportExportService = require('./src/services/reportExportService');

// Export report
app.post('/api/v1/exports/report', (req, res) => {
  reportExportService.exportReport(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get export status
app.get('/api/v1/exports/:exportId/status', (req, res) => {
  const { exportId } = req.params;

  reportExportService.getExportStatus(exportId).then(result => {
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  });
});

// Get export templates
app.get('/api/v1/exports/templates', (req, res) => {
  reportExportService.getExportTemplates(req.query).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get export history
app.get('/api/v1/exports/history', (req, res) => {
  reportExportService.getExportHistory(req.query).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Schedule export
app.post('/api/v1/exports/schedule', (req, res) => {
  reportExportService.scheduleExport(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Escalation Rules Service endpoints
const escalationRulesService = require('./src/services/escalationRulesService');

// Create escalation rule
app.post('/api/v1/escalation/rules', (req, res) => {
  escalationRulesService.createEscalationRule(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Check escalation for conversation
app.post('/api/v1/escalation/check', (req, res) => {
  escalationRulesService.checkEscalation(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get escalation rules
app.get('/api/v1/escalation/rules', (req, res) => {
  escalationRulesService.getEscalationRules(req.query).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get escalation history
app.get('/api/v1/escalation/history', (req, res) => {
  escalationRulesService.getEscalationHistory(req.query).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get escalation statistics
app.get('/api/v1/escalation/stats', (req, res) => {
  escalationRulesService.getEscalationStats(req.query).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Follow-up Automation Service endpoints
const followUpAutomationService = require('./src/services/followUpAutomationService');

// Create follow-up rule
app.post('/api/v1/followup/rules', (req, res) => {
  followUpAutomationService.createFollowUpRule(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Schedule follow-up
app.post('/api/v1/followup/schedule', (req, res) => {
  followUpAutomationService.scheduleFollowUp(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get follow-up rules
app.get('/api/v1/followup/rules', (req, res) => {
  followUpAutomationService.getFollowUpRules(req.query).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get follow-up statistics
app.get('/api/v1/followup/stats', (req, res) => {
  followUpAutomationService.getFollowUpStats(req.query).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Message Scheduling Service endpoints
const messageSchedulingService = require('./src/services/messageSchedulingService');

// Schedule individual message
app.post('/api/v1/messages/schedule', (req, res) => {
  messageSchedulingService.scheduleMessage(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Create campaign
app.post('/api/v1/campaigns', (req, res) => {
  messageSchedulingService.createCampaign(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Launch campaign
app.post('/api/v1/campaigns/:campaignId/launch', (req, res) => {
  const { campaignId } = req.params;

  messageSchedulingService.launchCampaign(campaignId).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get scheduled messages
app.get('/api/v1/messages/scheduled', (req, res) => {
  messageSchedulingService.getScheduledMessages(req.query).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get campaigns
app.get('/api/v1/campaigns', (req, res) => {
  messageSchedulingService.getCampaigns(req.query).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get campaign analytics
app.get('/api/v1/campaigns/:campaignId/analytics', (req, res) => {
  const { campaignId } = req.params;

  messageSchedulingService.getCampaignAnalytics(campaignId).then(result => {
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  });
});

// Auto Response Scenarios Service endpoints
const autoResponseScenariosService = require('./src/services/autoResponseScenariosService');

// Create response scenario
app.post('/api/v1/scenarios', (req, res) => {
  autoResponseScenariosService.createScenario(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Process message for auto response
app.post('/api/v1/scenarios/process', (req, res) => {
  autoResponseScenariosService.processMessage(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Conversation Distribution Service endpoints
const conversationDistributionService = require('./src/services/conversationDistributionService');

// Distribute conversation
app.post('/api/v1/distribution/assign', (req, res) => {
  conversationDistributionService.distributeConversation(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get distribution statistics
app.get('/api/v1/distribution/stats', (req, res) => {
  conversationDistributionService.getDistributionStats(req.query).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get agent workload
app.get('/api/v1/distribution/workload', (req, res) => {
  conversationDistributionService.getAgentWorkload(req.query).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Admin Task Automation Service endpoints
const adminTaskAutomationService = require('./src/services/adminTaskAutomationService');

// Create automation task
app.post('/api/v1/admin/tasks', (req, res) => {
  adminTaskAutomationService.createAutomationTask(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Execute task
app.post('/api/v1/admin/tasks/:taskId/execute', (req, res) => {
  const { taskId } = req.params;

  adminTaskAutomationService.executeTask(taskId).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get automation tasks
app.get('/api/v1/admin/tasks', (req, res) => {
  adminTaskAutomationService.getAutomationTasks(req.query).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get task history
app.get('/api/v1/admin/tasks/history', (req, res) => {
  adminTaskAutomationService.getTaskHistory(req.query).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Advanced Notification Service endpoints
const advancedNotificationService = require('./src/services/advancedNotificationService');

// Send notification
app.post('/api/v1/notifications/send', (req, res) => {
  advancedNotificationService.sendNotification(req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get user notifications
app.get('/api/v1/notifications/user/:userId', (req, res) => {
  const { userId } = req.params;
  const filters = { ...req.query, userId };

  advancedNotificationService.getUserNotifications(filters).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Update notification preferences
app.put('/api/v1/notifications/preferences/:userId', (req, res) => {
  const { userId } = req.params;

  advancedNotificationService.updateNotificationPreferences(userId, req.body).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Get notification statistics
app.get('/api/v1/notifications/stats', (req, res) => {
  advancedNotificationService.getNotificationStats(req.query).then(result => {
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });
});

// Real messages endpoints
app.get('/api/v1/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📨 Fetching real messages for conversation ${id}...`);

    // Get messages for conversation from database
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

    // Transform data to match frontend format
    const transformedMessages = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      isFromCustomer: msg.isFromCustomer,
      timestamp: msg.createdAt,
      senderName: msg.isFromCustomer ? 'Customer' : (msg.sender ? `${msg.sender.firstName} ${msg.sender.lastName}` : 'Support Agent'),
      type: msg.type,
      attachments: msg.attachments ? JSON.parse(msg.attachments) : [],
      isRead: msg.isRead,
      readAt: msg.readAt,
    }));

    console.log(`📨 Found ${transformedMessages.length} messages for conversation ${id}`);

    res.json({
      success: true,
      data: transformedMessages,
      pagination: {
        page: 1,
        limit: 100,
        total: transformedMessages.length,
        pages: 1
      }
    });
  } catch (error) {
    console.error('❌ Error fetching messages:', error);

    // Fallback to mock data
    const mockMessages = [
      {
        id: 'msg1',
        content: 'مرحباً، أحتاج مساعدة',
        isFromCustomer: true,
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        senderName: 'العميل'
      },
      {
        id: 'msg2',
        content: 'مرحباً بك! كيف يمكنني مساعدتك؟',
        isFromCustomer: false,
        timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
        senderName: 'Support Agent'
      }
    ];

    res.json({
      success: true,
      data: mockMessages,
      pagination: {
        page: 1,
        limit: 100,
        total: mockMessages.length,
        pages: 1
      }
    });
  }
});

// Send message endpoint
app.post('/api/v1/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    console.log(`📤 Sending message to conversation ${id}:`, message);

    // Check if conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Create new message
    const newMessage = await prisma.message.create({
      data: {
        conversationId: id,
        content: message,
        isFromCustomer: false,
        type: 'TEXT',
        isRead: true,
        // senderId: 'system', // We'll use system for now since no auth
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    // Update conversation last message
    await prisma.conversation.update({
      where: { id },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: message.length > 100 ? message.substring(0, 100) + '...' : message,
      }
    });

    // Transform message to match frontend format
    const transformedMessage = {
      id: newMessage.id,
      content: newMessage.content,
      isFromCustomer: newMessage.isFromCustomer,
      timestamp: newMessage.createdAt,
      senderName: newMessage.isFromCustomer ? 'Customer' : 'Support Agent',
      type: newMessage.type,
      attachments: newMessage.attachments ? JSON.parse(newMessage.attachments) : [],
      isRead: newMessage.isRead,
      readAt: newMessage.readAt,
    };

    // إرسال الرسالة لفيسبوك إذا كانت المحادثة من فيسبوك
    let facebookSent = false;
    if (conversation.channel === 'FACEBOOK') {
      // البحث عن معرف العميل من metadata أو من الحقول المباشرة
      let recipientId = null;
      
      if (conversation.facebookPageScopedId) {
        recipientId = conversation.facebookPageScopedId;
      } else if (conversation.metadata && conversation.metadata.facebookPageScopedId) {
        recipientId = conversation.metadata.facebookPageScopedId;
      }
      
      if (recipientId) {
        try {
          console.log(`📤 Sending message to Facebook recipient: ${recipientId}`);
          await sendMessageToFacebook(recipientId, message, conversation.id);
          facebookSent = true;
          console.log('📱 Message sent to Facebook successfully');
        } catch (facebookError) {
          console.error('❌ Failed to send message to Facebook:', facebookError.message);
          console.error('❌ Facebook Error Details:', facebookError.response?.data || facebookError);
          // نستمر حتى لو فشل الإرسال لفيسبوك
        }
      } else {
        console.log('⚠️ No Facebook recipient ID found for conversation:', conversation.id);
      }
    }

    console.log('✅ Message sent successfully:', transformedMessage.id);

    res.json({
      success: true,
      data: transformedMessage,
      message: 'Message sent successfully',
      facebookSent: facebookSent
    });
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      message: error.message
    });
  }
});

// Database test endpoint
app.get('/api/v1/test-db', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1 as test`;

    // Get counts from tables
    const [companiesCount, usersCount, customersCount, productsCount, conversationsCount, messagesCount] = await Promise.all([
      prisma.company.count(),
      prisma.user.count(),
      prisma.customer.count(),
      prisma.product.count(),
      prisma.conversation.count(),
      prisma.message.count(),
    ]);

    res.json({
      success: true,
      message: 'Database connection successful',
      database: 'MySQL (Real)',
      stats: {
        companies: companiesCount,
        users: usersCount,
        customers: customersCount,
        products: productsCount,
        conversations: conversationsCount,
        messages: messagesCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.json({
      success: true,
      message: 'Database connection failed - using mock data',
      database: 'MySQL (Mock)',
      stats: {
        companies: 1,
        users: 4,
        customers: 3,
        products: 4,
        conversations: 2,
        messages: 5,
      },
      timestamp: new Date().toISOString(),
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// ==================== GEMINI SOURCE MANAGEMENT ROUTES ====================

// Get all Gemini API sources
app.get('/api/v1/ai/sources', async (req, res) => {
  try {
    // Get the first company (for now, we'll use the first company)
    const firstCompany = await prisma.company.findFirst();
    if (!firstCompany) {
      return res.status(500).json({
        success: false,
        error: 'No company found in database'
      });
    }

    const result = await geminiSourceManager.getAllSources(firstCompany.id);

    if (result.success) {
      res.json({
        success: true,
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error getting sources:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Test a specific source
app.post('/api/v1/ai/test-source', async (req, res) => {
  try {
    const { sourceType } = req.body;

    if (!sourceType) {
      return res.status(400).json({
        success: false,
        error: 'sourceType is required'
      });
    }

    // Get the first company
    const firstCompany = await prisma.company.findFirst();
    if (!firstCompany) {
      return res.status(500).json({
        success: false,
        error: 'No company found in database'
      });
    }

    const result = await geminiSourceManager.testSource(firstCompany.id, sourceType);

    res.json(result);
  } catch (error) {
    console.error('Error testing source:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Activate a specific source
app.post('/api/v1/ai/activate-source', async (req, res) => {
  try {
    const { sourceType } = req.body;

    if (!sourceType) {
      return res.status(400).json({
        success: false,
        error: 'sourceType is required'
      });
    }

    // Get the first company
    const firstCompany = await prisma.company.findFirst();
    if (!firstCompany) {
      return res.status(500).json({
        success: false,
        error: 'No company found in database'
      });
    }

    const result = await geminiSourceManager.activateSource(firstCompany.id, sourceType);

    res.json(result);
  } catch (error) {
    console.error('Error activating source:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get sources statistics
app.get('/api/v1/ai/sources/stats', async (req, res) => {
  try {
    // Get the first company
    const firstCompany = await prisma.company.findFirst();
    if (!firstCompany) {
      return res.status(500).json({
        success: false,
        error: 'No company found in database'
      });
    }

    const result = await geminiSourceManager.getSourcesStats(firstCompany.id);

    res.json(result);
  } catch (error) {
    console.error('Error getting sources stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Test page route
app.get('/test', (req, res) => {
  console.log('📄 Serving test page at /test');
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test Page</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .test-section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; }
        button { padding: 10px 20px; margin: 10px; background: #007bff; color: white; border: none; cursor: pointer; }
        .result { margin-top: 10px; padding: 10px; background: #f8f9fa; }
      </style>
    </head>
    <body>
      <h1>🧪 Test Page</h1>

      <div class="test-section">
        <h3>Database Connection Test</h3>
        <button onclick="testDatabase()">Test Database</button>
        <div id="dbResult" class="result"></div>
      </div>

      <div class="test-section">
        <h3>AI Service Test</h3>
        <button onclick="testAI()">Test AI</button>
        <div id="aiResult" class="result"></div>
      </div>

      <div class="test-section">
        <h3>🔑 API Keys Test</h3>
        <button onclick="testApiKeysAdvanced()">Test API Keys (Advanced)</button>
        <button onclick="loadApiKeysInfo()">Load API Keys Info</button>
        <div id="apiKeysResult" class="result"></div>
      </div>

      <script>
        async function testDatabase() {
          try {
            const response = await fetch('/api/v1/companies');
            const data = await response.json();
            document.getElementById('dbResult').innerHTML =
              '<strong>✅ Database Connected</strong><br>' +
              'Companies found: ' + (data.data ? data.data.length : 0);
          } catch (error) {
            document.getElementById('dbResult').innerHTML =
              '<strong>❌ Database Error</strong><br>' + error.message;
          }
        }

        async function testAI() {
          try {
            const response = await fetch('/api/v1/ai/test', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: 'Test message' })
            });
            const data = await response.json();
            document.getElementById('aiResult').innerHTML =
              '<strong>' + (data.success ? '✅' : '❌') + ' AI Test</strong><br>' +
              JSON.stringify(data, null, 2);
          } catch (error) {
            document.getElementById('aiResult').innerHTML =
              '<strong>❌ AI Error</strong><br>' + error.message;
          }
        }

        async function testApiKeysAdvanced() {
          try {
            document.getElementById('apiKeysResult').innerHTML = '🔄 Testing API keys...';
            const response = await fetch('/api/v1/ai/test', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: 'اختبار المفاتيح الجديدة' })
            });
            const data = await response.json();

            let result = '📊 نتيجة اختبار المفاتيح:\\n\\n';
            result += '✅ النجاح: ' + (data.success ? 'نعم' : 'لا') + '\\n';
            result += '📝 الرسالة: ' + data.message + '\\n';
            result += '🔑 يوجد مفاتيح: ' + (data.data?.hasApiKey ? 'نعم' : 'لا') + '\\n';
            result += '📊 عدد المفاتيح: ' + (data.data?.apiKeysCount || 0) + '\\n';
            result += '🔧 يعمل: ' + (data.data?.isWorking ? 'نعم' : 'لا') + '\\n\\n';

            if (data.data?.testedKeys) {
              result += '🧪 المفاتيح المختبرة:\\n';
              data.data.testedKeys.forEach((key, index) => {
                result += '   ' + (index + 1) + '. ' + key.key + ': ' + key.status + '\\n';
                if (key.error) {
                  result += '      الخطأ: ' + key.error + '\\n';
                }
              });
            }

            document.getElementById('apiKeysResult').innerHTML =
              '<strong>' + (data.success ? '✅' : '❌') + ' API Keys Test</strong><br><pre>' + result + '</pre>';
          } catch (error) {
            document.getElementById('apiKeysResult').innerHTML =
              '<strong>❌ API Keys Error</strong><br>' + error.message;
          }
        }

        async function loadApiKeysInfo() {
          try {
            document.getElementById('apiKeysResult').innerHTML = '🔄 Loading API keys info...';
            const response = await fetch('/api/v1/ai/settings');
            const data = await response.json();

            if (data.success && data.data.modelSettings) {
              const modelSettings = data.data.modelSettings;
              const apiKeys = modelSettings.apiKeys || [];

              let result = '📊 تم العثور على ' + apiKeys.length + ' مفتاح API:\\n\\n';
              apiKeys.forEach((key, index) => {
                result += '🔑 المفتاح ' + (index + 1) + ':\\n';
                result += '   الاسم: ' + key.name + '\\n';
                result += '   المفتاح: ' + key.key.substring(0, 20) + '...\\n';
                result += '   النماذج: ' + key.models.join(', ') + '\\n';
                result += '   الأولوية: ' + key.priority + '\\n';
                result += '   الحد اليومي: ' + key.dailyLimit + '\\n';
                result += '   الحد الشهري: ' + key.monthlyLimit + '\\n\\n';
              });

              document.getElementById('apiKeysResult').innerHTML =
                '<strong>✅ API Keys Info</strong><br><pre>' + result + '</pre>';
            } else {
              document.getElementById('apiKeysResult').innerHTML =
                '<strong>❌ No API Keys Found</strong>';
            }
          } catch (error) {
            document.getElementById('apiKeysResult').innerHTML =
              '<strong>❌ API Keys Info Error</strong><br>' + error.message;
          }
        }
      </script>
    </body>
    </html>
  `);
});

// API Keys test page
app.get('/test-keys', (req, res) => {
  try {
    console.log('📄 Serving test-keys page');
    res.sendFile(path.join(__dirname, 'test-keys-page.html'));
  } catch (error) {
    console.error('❌ Error serving test-keys page:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to serve test page',
      message: error.message
    });
  }
});

// Alternative route for API keys test
app.get('/api-keys-test', (req, res) => {
  try {
    console.log('📄 Serving api-keys-test page (alternative route)');
    res.sendFile(path.join(__dirname, 'test-keys-page.html'));
  } catch (error) {
    console.error('❌ Error serving api-keys-test page:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to serve test page',
      message: error.message
    });
  }
});

// Error handling middleware (order is important!)
app.use(securityErrorHandler);
app.use(authErrorHandler);
app.use(validationErrorHandler);
app.use(notFoundHandler);
app.use(generalErrorHandler);

// Start server with database initialization
async function startServer() {
  try {
    // Test database connection first
    const dbConnected = await testDatabaseConnection();
    
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Server will not start.');
      process.exit(1);
    }

    // Start the server with Socket.IO
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Frontend URL: http://localhost:3000`);
      console.log(`🔗 Backend URL: http://localhost:${PORT}`);
      console.log(`📊 API Base URL: http://localhost:${PORT}/api/v1`);
      console.log(`🧪 Test Page: http://localhost:${PORT}/test`);
      console.log(`🔍 Diagnostics: http://localhost:${PORT}/api/v1/integrations/facebook/diagnostics`);
      console.log(`🔌 Socket.IO enabled for real-time messaging`);
      console.log('\n✅ Server is ready to accept connections!');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// API endpoint for testing keys
app.get('/api/test-keys', (req, res) => {
  console.log('🔑 API test keys endpoint called');
  res.json({
    success: true,
    message: 'API Keys Test Endpoint Working',
    timestamp: new Date().toISOString(),
    endpoint: '/api/test-keys'
  });
});

// Alternative test route
app.get('/testpage', (req, res) => {
  console.log('📄 Serving test page at /testpage');
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>API Keys Test Page</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .test-section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; }
        button { padding: 10px 20px; margin: 10px; background: #007bff; color: white; border: none; cursor: pointer; }
        .result { margin-top: 10px; padding: 10px; background: #f8f9fa; }
      </style>
    </head>
    <body>
      <h1>🔑 API Keys Test Page</h1>

      <div class="test-section">
        <h3>🧪 Test API Keys</h3>
        <button onclick="testApiKeys()">Test API Keys</button>
        <button onclick="loadApiKeysInfo()">Load API Keys Info</button>
        <div id="apiKeysResult" class="result"></div>
      </div>

      <script>
        async function testApiKeys() {
          try {
            document.getElementById('apiKeysResult').innerHTML = '🔄 Testing API keys...';
            const response = await fetch('/api/v1/ai/test', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: 'اختبار المفاتيح الجديدة' })
            });
            const data = await response.json();

            let result = '📊 نتيجة اختبار المفاتيح:\\n\\n';
            result += '✅ النجاح: ' + (data.success ? 'نعم' : 'لا') + '\\n';
            result += '📝 الرسالة: ' + data.message + '\\n';
            result += '🔑 يوجد مفاتيح: ' + (data.data?.hasApiKey ? 'نعم' : 'لا') + '\\n';
            result += '📊 عدد المفاتيح: ' + (data.data?.apiKeysCount || 0) + '\\n';
            result += '🔧 يعمل: ' + (data.data?.isWorking ? 'نعم' : 'لا') + '\\n\\n';

            if (data.data?.testedKeys) {
              result += '🧪 المفاتيح المختبرة:\\n';
              data.data.testedKeys.forEach((key, index) => {
                result += '   ' + (index + 1) + '. ' + key.key + ': ' + key.status + '\\n';
                if (key.error) {
                  result += '      الخطأ: ' + key.error + '\\n';
                }
              });
            }

            document.getElementById('apiKeysResult').innerHTML =
              '<strong>' + (data.success ? '✅' : '❌') + ' API Keys Test</strong><br><pre>' + result + '</pre>';
          } catch (error) {
            document.getElementById('apiKeysResult').innerHTML =
              '<strong>❌ API Keys Error</strong><br>' + error.message;
          }
        }

        async function loadApiKeysInfo() {
          try {
            document.getElementById('apiKeysResult').innerHTML = '🔄 Loading API keys info...';
            const response = await fetch('/api/v1/ai/settings');
            const data = await response.json();

            if (data.success && data.data.modelSettings) {
              const modelSettings = data.data.modelSettings;
              const apiKeys = modelSettings.apiKeys || [];

              let result = '📊 تم العثور على ' + apiKeys.length + ' مفتاح API:\\n\\n';
              apiKeys.forEach((key, index) => {
                result += '🔑 المفتاح ' + (index + 1) + ':\\n';
                result += '   الاسم: ' + key.name + '\\n';
                result += '   المفتاح: ' + key.key.substring(0, 20) + '...\\n';
                result += '   النماذج: ' + key.models.join(', ') + '\\n';
                result += '   الأولوية: ' + key.priority + '\\n';
                result += '   الحد اليومي: ' + key.dailyLimit + '\\n';
                result += '   الحد الشهري: ' + key.monthlyLimit + '\\n\\n';
              });

              document.getElementById('apiKeysResult').innerHTML =
                '<strong>✅ API Keys Info</strong><br><pre>' + result + '</pre>';
            } else {
              document.getElementById('apiKeysResult').innerHTML =
                '<strong>❌ No API Keys Found</strong>';
            }
          } catch (error) {
            document.getElementById('apiKeysResult').innerHTML =
              '<strong>❌ API Keys Info Error</strong><br>' + error.message;
          }
        }
      </script>
    </body>
    </html>
  `);
});

// Start the server
startServer();

module.exports = app;
