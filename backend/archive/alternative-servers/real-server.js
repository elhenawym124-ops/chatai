const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Import services
const SmartAIEngine = require('./smart-ai-engine');
const geminiService = require('./src/services/geminiService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3003"],
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Initialize Prisma Client
const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3003'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Smart AI Engine
const smartAI = new SmartAIEngine();

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
    return false;
  }
}

// Initialize default data if needed
async function initializeData() {
  try {
    const companyCount = await prisma.company.count();
    
    if (companyCount === 0) {
      console.log('🔄 Initializing default data...');
      
      // Create default company
      const company = await prisma.company.create({
        data: {
          name: 'متجر الإلكترونيات المتقدم',
          businessType: 'ecommerce',
          personalityPrompt: 'أنا مساعد ذكي ودود لمتجر الإلكترونيات المتقدم. أتحدث بطريقة مهنية ومفيدة وأحرص على تقديم أفضل خدمة للعملاء.',
          taskPrompt: 'مهمتي مساعدة العملاء في العثور على المنتجات المناسبة، تقديم المعلومات التقنية، والإجابة على استفساراتهم حول الأسعار والمواصفات.',
          defaultLanguage: 'ar',
          brandVoice: 'professional',
          settings: {}
        }
      });
      
      console.log('✅ Default company created:', company.name);
      
      // Create sample products
      const products = await Promise.all([
        prisma.product.create({
          data: {
            companyId: company.id,
            name: 'لابتوب Dell Inspiron 15',
            description: 'لابتوب عالي الأداء مع معالج Intel Core i7 وذاكرة 16GB RAM',
            price: 25000,
            currency: 'EGP',
            images: ['https://example.com/dell-laptop.jpg'],
            specifications: {
              processor: 'Intel Core i7-12700H',
              ram: '16GB DDR4',
              storage: '512GB SSD',
              display: '15.6 inch Full HD',
              graphics: 'NVIDIA GTX 1650'
            },
            category: 'laptops',
            tags: ['dell', 'laptop', 'gaming', 'work'],
            isActive: true,
            stock: 10
          }
        }),
        prisma.product.create({
          data: {
            companyId: company.id,
            name: 'هاتف Samsung Galaxy S23',
            description: 'هاتف ذكي متطور مع كاميرا عالية الجودة وأداء ممتاز',
            price: 18000,
            currency: 'EGP',
            images: ['https://example.com/samsung-s23.jpg'],
            specifications: {
              display: '6.1 inch Dynamic AMOLED',
              camera: '50MP Triple Camera',
              battery: '3900mAh',
              storage: '256GB',
              ram: '8GB'
            },
            category: 'phones',
            tags: ['samsung', 'smartphone', 'android', 'camera'],
            isActive: true,
            stock: 15
          }
        })
      ]);
      
      console.log(`✅ Created ${products.length} sample products`);
      
      // Create sample conversation
      const conversation = await prisma.conversation.create({
        data: {
          companyId: company.id,
          customerId: 'facebook_1234567890',
          platform: 'FACEBOOK',
          status: 'ACTIVE',
          metadata: {
            pageId: '351400718067673',
            senderName: 'أحمد محمد'
          }
        }
      });
      
      console.log('✅ Sample conversation created');
      
      // Create sample messages
      await Promise.all([
        prisma.message.create({
          data: {
            conversationId: conversation.id,
            content: 'مرحباً، أريد الاستفسار عن المنتج الجديد',
            type: 'TEXT',
            isFromCustomer: true,
            metadata: {
              senderName: 'أحمد محمد',
              platform: 'facebook'
            }
          }
        }),
        prisma.message.create({
          data: {
            conversationId: conversation.id,
            content: 'مرحباً بك! كيف يمكنني مساعدتك؟',
            type: 'TEXT',
            isFromCustomer: false,
            metadata: {
              senderName: 'Support Agent',
              platform: 'facebook'
            }
          }
        })
      ]);
      
      console.log('✅ Sample messages created');
    }
  } catch (error) {
    console.error('❌ Error initializing data:', error);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Real Server with MySQL Database',
    timestamp: new Date().toISOString(),
    database: 'MySQL (Real)',
    port: PORT
  });
});

// Basic route - الصفحة الرئيسية
app.get('/', (req, res) => {
  res.send(`
    <html dir="rtl">
      <head>
        <title>منصة التواصل التجارية</title>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #2c3e50; text-align: center; }
          .status { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .api-list { background: #f8f9fa; padding: 20px; border-radius: 5px; }
          .api-item { margin: 10px 0; padding: 10px; background: white; border-radius: 3px; }
          a { color: #3498db; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 منصة التواصل التجارية</h1>
          <div class="status">
            <h3>✅ الخادم الحقيقي يعمل بنجاح</h3>
            <p>🗄️ قاعدة البيانات: MySQL (حقيقية)</p>
            <p>🌐 المنفذ: ${PORT}</p>
            <p>⏰ الوقت: ${new Date().toLocaleString('ar-EG')}</p>
          </div>
          <div class="api-list">
            <h3>📡 APIs المتاحة:</h3>
            <div class="api-item">🔍 <a href="/health">فحص الصحة</a></div>
            <div class="api-item">💬 <a href="/api/v1/conversations">المحادثات</a></div>
            <div class="api-item">🛍️ <a href="/api/v1/products">المنتجات</a></div>
            <div class="api-item">🤖 <a href="/api/v1/ai/settings">إعدادات الذكاء الاصطناعي</a></div>
            <div class="api-item">🌐 <a href="/api/v1">معلومات API</a></div>
          </div>
        </div>
      </body>
    </html>
  `);
});

// API Routes
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'Communication Platform API v1 - Real Database',
    database: 'MySQL (Real)',
    endpoints: {
      conversations: '/api/v1/conversations',
      messages: '/api/v1/messages',
      products: '/api/v1/products',
      ai: '/api/v1/ai',
      health: '/health'
    }
  });
});

// Get all conversations
app.get('/api/v1/conversations', async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    const formattedConversations = conversations.map(conv => ({
      id: conv.id,
      customerId: conv.customerId,
      platform: conv.platform ? conv.platform.toLowerCase() : 'unknown',
      status: conv.status ? conv.status.toLowerCase() : 'active',
      lastMessage: conv.messages[0]?.content || null,
      lastMessageAt: conv.messages[0]?.createdAt || conv.createdAt,
      messageCount: conv._count.messages,
      unreadCount: 0, // TODO: Calculate actual unread count
      metadata: conv.metadata || {}
    }));
    
    res.json({
      success: true,
      data: formattedConversations,
      count: formattedConversations.length
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations'
    });
  }
});

// Get messages for a conversation
app.get('/api/v1/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    
    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' }
    });
    
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      conversationId: msg.conversationId,
      content: msg.content,
      type: msg.type.toLowerCase(),
      direction: msg.isFromCustomer ? 'inbound' : 'outbound',
      isFromCustomer: msg.isFromCustomer,
      timestamp: msg.createdAt,
      status: 'delivered',
      metadata: msg.metadata
    }));
    
    res.json({
      success: true,
      data: formattedMessages,
      count: formattedMessages.length
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
});

// Send a message
app.post('/api/v1/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Check if conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { company: true }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Create the message
    const newMessage = await prisma.message.create({
      data: {
        conversationId: id,
        content: message,
        type: 'TEXT',
        isFromCustomer: false, // This is an outbound message from support
        metadata: {
          senderName: 'Support Agent',
          platform: conversation.platform ? conversation.platform.toLowerCase() : 'unknown'
        }
      }
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() }
    });

    // Format response
    const formattedMessage = {
      id: newMessage.id,
      conversationId: newMessage.conversationId,
      content: newMessage.content,
      type: newMessage.type.toLowerCase(),
      direction: 'outbound',
      isFromCustomer: newMessage.isFromCustomer,
      timestamp: newMessage.createdAt,
      status: 'delivered',
      metadata: newMessage.metadata
    };

    // Emit to Socket.IO
    io.emit('new_message', formattedMessage);

    res.json(formattedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark conversation as read
app.post('/api/v1/conversations/:conversationId/read', async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    console.log(`Marking conversation as read: ${conversationId}`);

    // Update conversation (in a real app, you might track read status)
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    res.json({ success: true, conversationId });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({ error: 'Failed to mark conversation as read' });
  }
});

// Send message to Facebook (for outbound messages)
app.post('/api/v1/conversations/:conversationId/send', async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const { message } = req.body;

    console.log(`Sending message to Facebook for conversation: ${conversationId}`);
    console.log('Message:', message);

    // Get conversation to find customer ID and page info
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Extract Facebook user ID from customer ID
    const facebookUserId = conversation.customerId.replace('facebook_', '');
    const pageId = conversation.metadata?.pageId;

    // In production, send actual message to Facebook
    // For now, just save the message and simulate success
    const newMessage = await prisma.message.create({
      data: {
        conversationId,
        content: message,
        type: 'TEXT',
        isFromCustomer: false,
        metadata: {
          senderName: 'Support Agent',
          platform: 'facebook',
          facebookUserId,
          pageId
        }
      }
    });

    // Emit to Socket.IO
    io.emit('new_message', {
      id: newMessage.id,
      conversationId: newMessage.conversationId,
      content: newMessage.content,
      type: newMessage.type.toLowerCase(),
      direction: 'outbound',
      isFromCustomer: false,
      timestamp: newMessage.createdAt,
      status: 'sent',
      metadata: newMessage.metadata
    });

    res.json({
      success: true,
      message: 'Message sent successfully',
      messageId: newMessage.id,
      facebookUserId,
      pageId
    });

  } catch (error) {
    console.error('Error sending message to Facebook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message to Facebook'
    });
  }
});

// Test endpoint to simulate Facebook message
app.post('/api/v1/test/simulate-message', async (req, res) => {
  try {
    console.log('Simulating Facebook message:', req.body);

    const { senderId, pageId, message, senderName } = req.body;

    if (!senderId || !message) {
      return res.status(400).json({
        success: false,
        message: 'senderId and message are required'
      });
    }

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        customerId: `facebook_${senderId}`,
        metadata: {
          path: ['pageId'],
          equals: pageId || 'test_page'
        }
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          companyId: (await prisma.company.findFirst())?.id || '1',
          customerId: `facebook_${senderId}`,
          platform: 'FACEBOOK',
          status: 'ACTIVE',
          metadata: {
            pageId: pageId || 'test_page',
            senderName: senderName || `User ${senderId.slice(-4)}`
          }
        }
      });
    }

    // Create message
    const newMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: message,
        type: 'TEXT',
        isFromCustomer: true,
        metadata: {
          facebookMessageId: `sim_${Date.now()}`,
          senderId,
          pageId: pageId || 'test_page',
          senderName: senderName || `User ${senderId.slice(-4)}`
        }
      }
    });

    // Emit to Socket.IO
    io.emit('new_message', {
      id: newMessage.id,
      conversationId: newMessage.conversationId,
      content: newMessage.content,
      type: newMessage.type.toLowerCase(),
      direction: 'inbound',
      isFromCustomer: true,
      timestamp: newMessage.createdAt,
      status: 'delivered',
      metadata: newMessage.metadata
    });

    res.json({
      success: true,
      message: 'Facebook message simulated successfully',
      conversation: conversation,
      messageId: newMessage.id
    });

  } catch (error) {
    console.error('Error simulating Facebook message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to simulate Facebook message'
    });
  }
});

// Get all products
app.get('/api/v1/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// ===== COMPANIES ENDPOINTS =====
app.get('/api/v1/companies', async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

app.get('/api/v1/companies/:companyId', async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.params.companyId },
      include: { products: true }
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

app.put('/api/v1/companies/:companyId', async (req, res) => {
  try {
    const updatedCompany = await prisma.company.update({
      where: { id: req.params.companyId },
      data: req.body
    });
    res.json(updatedCompany);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Failed to update company' });
  }
});

// ===== PRODUCTS ENDPOINTS =====
app.get('/api/v1/companies/:companyId/products', async (req, res) => {
  try {
    const { category, limit } = req.query;
    const where = { companyId: req.params.companyId, isActive: true };

    if (category) {
      where.category = category;
    }

    const products = await prisma.product.findMany({
      where,
      take: limit ? parseInt(limit) : undefined,
      orderBy: { createdAt: 'desc' }
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching company products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/v1/companies/:companyId/products', async (req, res) => {
  try {
    const productData = {
      ...req.body,
      companyId: req.params.companyId
    };

    const product = await prisma.product.create({
      data: productData
    });

    res.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.get('/api/v1/companies/:companyId/products/search', async (req, res) => {
  try {
    const { q, limit } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const products = await prisma.product.findMany({
      where: {
        companyId: req.params.companyId,
        isActive: true,
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
          { sku: { contains: q } }
        ]
      },
      take: limit ? parseInt(limit) : 10,
      orderBy: { createdAt: 'desc' }
    });

    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
});

// AI Endpoints
app.post('/api/v1/ai/generate-response', async (req, res) => {
  try {
    const { message, conversationId, companyId = '1' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get company info - use first company if companyId is default
    let company;
    if (companyId === '1') {
      company = await prisma.company.findFirst({
        include: { products: true }
      });
    } else {
      company = await prisma.company.findUnique({
        where: { id: companyId },
        include: { products: true }
      });
    }

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Get conversation history if conversationId provided
    let conversationHistory = [];
    if (conversationId) {
      const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        take: 10 // Last 10 messages for context
      });

      conversationHistory = messages.map(msg => ({
        role: msg.direction === 'INBOUND' ? 'user' : 'assistant',
        content: msg.content
      }));
    }

    // Use Smart AI Engine
    const analysis = smartAI.analyzeMessage(message);

    let response;
    if (analysis.needsAI) {
      // Use Gemini for complex responses
      response = await geminiService.generateResponse(message, {
        companyInfo: {
          name: company.name,
          businessType: company.businessType,
          personalityPrompt: company.personalityPrompt,
          taskPrompt: company.taskPrompt,
          products: company.products.map(p => ({
            name: p.name,
            description: p.description,
            price: p.price,
            currency: p.currency
          }))
        },
        conversationHistory,
        userMessage: message,
        language: analysis.language
      });
    } else {
      // Use quick response
      response = analysis.quickResponse || 'شكراً لك على رسالتك. كيف يمكنني مساعدتك؟';
    }

    res.json({
      response,
      analysis,
      needsHumanIntervention: analysis.sentiment === 'negative' && analysis.confidence > 0.8
    });

  } catch (error) {
    console.error('Error generating AI response:', error);
    res.status(500).json({
      error: 'Failed to generate response',
      response: 'عذراً، حدث خطأ في النظام. سيتم التواصل معك قريباً.'
    });
  }
});

// AI Settings
app.get('/api/v1/ai/settings', (req, res) => {
  const settings = {
    hasApiKey: !!process.env.GOOGLE_GEMINI_API_KEY,
    isEnabled: !!process.env.GOOGLE_GEMINI_API_KEY,
    model: 'gemini-pro',
    temperature: 0.7,
    maxTokens: 1000
  };
  res.json(settings);
});

app.put('/api/v1/ai/settings', (req, res) => {
  try {
    const { apiKey, isEnabled } = req.body;

    // In a real app, you'd save this to database or config file
    // For now, just return the current settings
    const settings = {
      hasApiKey: !!apiKey,
      isEnabled: !!isEnabled,
      model: 'gemini-pro',
      temperature: 0.7,
      maxTokens: 1000
    };

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Test AI connection
app.post('/api/v1/ai/test', async (req, res) => {
  try {
    console.log('🧪 Testing Gemini AI connection');

    const testMessage = req.body.message || 'مرحباً، هذا اختبار للذكاء الاصطناعي';

    // Test with Smart AI Engine first
    const analysis = smartAI.analyzeMessage(testMessage);

    let geminiResponse = null;
    if (process.env.GOOGLE_GEMINI_API_KEY) {
      try {
        geminiResponse = await geminiService.generateResponse(testMessage, {
          companyInfo: {
            name: 'شركة اختبار',
            businessType: 'ecommerce'
          }
        });
      } catch (geminiError) {
        console.error('Gemini test error:', geminiError);
      }
    }

    res.json({
      success: true,
      message: 'AI test completed',
      results: {
        smartAI: {
          analysis,
          working: true
        },
        gemini: {
          hasApiKey: !!process.env.GOOGLE_GEMINI_API_KEY,
          response: geminiResponse,
          working: !!geminiResponse
        }
      },
      timestamp: new Date().toISOString()
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

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`👤 User ${socket.id} joined conversation ${conversationId}`);
  });

  socket.on('leave_conversation', (conversationId) => {
    socket.leave(conversationId);
    console.log(`👤 User ${socket.id} left conversation ${conversationId}`);
  });

  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
  });
});

// ===== FACEBOOK INTEGRATION =====

// Connected pages storage - now using database
let connectedPages = new Map();

// Load connected pages from database on startup
async function loadConnectedPagesFromDB() {
  try {
    const pages = await prisma.facebookPage.findMany({
      where: { status: 'connected' }
    });

    pages.forEach(page => {
      connectedPages.set(page.pageId, {
        pageId: page.pageId,
        pageAccessToken: page.pageAccessToken,
        pageName: page.pageName,
        connectedAt: page.connectedAt.toISOString(),
        status: page.status
      });
    });

    console.log(`📱 Loaded ${pages.length} connected Facebook pages from database`);
  } catch (error) {
    console.error('❌ Error loading Facebook pages from database:', error);
  }
}

// Save page to database
async function savePageToDB(pageData) {
  try {
    await prisma.facebookPage.upsert({
      where: { pageId: pageData.pageId },
      update: {
        pageAccessToken: pageData.pageAccessToken,
        pageName: pageData.pageName,
        status: pageData.status,
        connectedAt: new Date(pageData.connectedAt)
      },
      create: {
        pageId: pageData.pageId,
        pageAccessToken: pageData.pageAccessToken,
        pageName: pageData.pageName,
        status: pageData.status,
        connectedAt: new Date(pageData.connectedAt),
        companyId: 'cmd5c0c9y0000ymzdd7wtv7ib' // Default company ID
      }
    });
    console.log('💾 Saved Facebook page to database:', pageData.pageId);
  } catch (error) {
    console.error('❌ Error saving Facebook page to database:', error);
  }
}

// Remove page from database
async function removePageFromDB(pageId) {
  try {
    await prisma.facebookPage.update({
      where: { pageId },
      data: { status: 'disconnected' }
    });
    console.log('💾 Removed Facebook page from database:', pageId);
  } catch (error) {
    console.error('❌ Error removing Facebook page from database:', error);
  }
}

// Test Facebook connection
app.post('/api/v1/integrations/facebook/test', async (req, res) => {
  console.log('Received Facebook test request:', req.body);
  try {
    const { pageAccessToken, pageId } = req.body;

    if (!pageAccessToken || !pageId) {
      return res.status(400).json({
        success: false,
        message: 'Page access token and page ID are required'
      });
    }

    // Test actual Facebook API
    try {
      const endpoint = pageId === 'me' ? '/me' : `/${pageId}`;
      const testUrl = `https://graph.facebook.com/v18.0${endpoint}?access_token=${pageAccessToken}&fields=id,name,category`;

      console.log('Testing Facebook API:', testUrl.replace(pageAccessToken, '[HIDDEN]'));

      const response = await fetch(testUrl);
      const data = await response.json();

      if (response.ok && data.id) {
        console.log('Facebook API test successful:', data.name);
        res.json({
          success: true,
          data: {
            isValid: true,
            pageInfo: data,
            message: 'Facebook connection is valid'
          },
          message: 'Connection test successful'
        });
      } else {
        console.log('Facebook API test failed:', data);
        res.json({
          success: true,
          data: {
            isValid: false,
            error: data.error?.message || 'Invalid token',
            message: 'Facebook connection failed'
          },
          message: 'Connection test completed'
        });
      }
    } catch (apiError) {
      console.error('Facebook API error:', apiError);
      res.json({
        success: true,
        data: {
          isValid: false,
          error: 'Failed to connect to Facebook API',
          message: 'Facebook connection failed'
        },
        message: 'Connection test completed'
      });
    }
  } catch (error) {
    console.error('Facebook test error:', error);
    res.status(500).json({
      success: false,
      message: 'Facebook connection test failed',
      error: error.message
    });
  }
});

// Get connected pages
app.get('/api/v1/integrations/facebook/connected', (req, res) => {
  console.log('Received request for connected pages');
  console.log('Current connected pages:', connectedPages);

  const pages = Array.from(connectedPages.values());
  res.json({
    success: true,
    pages: pages,
    count: pages.length
  });
});

// Get Facebook config
app.get('/api/v1/integrations/facebook/config', (req, res) => {
  console.log('Received Facebook config request');
  res.json({
    success: true,
    config: {
      webhookUrl: `${req.protocol}://${req.get('host')}/api/v1/integrations/facebook/webhook`,
      verifyToken: process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || 'simple_chat_verify_token_2025',
      appId: process.env.FACEBOOK_APP_ID || 'your-app-id',
      hasAppSecret: !!process.env.FACEBOOK_APP_SECRET,
      connectedPagesCount: connectedPages.size
    }
  });
});

// Connect page
app.post('/api/v1/integrations/facebook/connect', async (req, res) => {
  console.log('Received connect request:', req.body);
  const { pageId, pageAccessToken, pageName } = req.body;

  if (!pageId || !pageAccessToken) {
    return res.status(400).json({
      success: false,
      message: 'Page ID and access token are required'
    });
  }

  const pageData = {
    pageId,
    pageAccessToken,
    pageName: pageName || `Page ${pageId}`,
    connectedAt: new Date().toISOString(),
    status: 'connected'
  };

  // Save to both memory and database
  connectedPages.set(pageId, pageData);
  await savePageToDB(pageData);

  console.log('Page connected successfully:', pageData);

  res.json({
    success: true,
    message: 'Page connected successfully',
    page: pageData
  });
});

// Disconnect page
app.delete('/api/v1/integrations/facebook/disconnect/:pageId', async (req, res) => {
  console.log('Received disconnect request for page:', req.params.pageId);
  const pageId = req.params.pageId;

  if (connectedPages.has(pageId)) {
    // Remove from both memory and database
    connectedPages.delete(pageId);
    await removePageFromDB(pageId);
    console.log('Page disconnected successfully:', pageId);

    res.json({
      success: true,
      message: 'Page disconnected successfully',
      pageId
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Page not found or not connected',
      pageId
    });
  }
});

// Facebook Webhook - Verification
app.get('/api/v1/integrations/facebook/webhook', (req, res) => {
  const VERIFY_TOKEN = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || 'simple_chat_verify_token_2025';
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

app.post('/api/v1/integrations/facebook/webhook', async (req, res) => {
  try {
    const body = req.body;

    if (body.object === 'page') {
      body.entry.forEach(async (entry) => {
        const webhookEvent = entry.messaging[0];

        if (webhookEvent.message) {
          // Handle incoming message
          const senderId = webhookEvent.sender.id;
          const pageId = webhookEvent.recipient.id;
          const messageText = webhookEvent.message.text;

          console.log(`📨 Received message from ${senderId}: ${messageText}`);

          // Find or create conversation
          let conversation = await prisma.conversation.findFirst({
            where: {
              customerId: `facebook_${senderId}`,
              companyId: 'cld5c0ey0000oymzdbqo3s4so' // Default company ID
            }
          });

          if (!conversation) {
            // First, ensure customer exists
            let customer = await prisma.customer.findUnique({
              where: { id: `facebook_${senderId}` }
            });

            if (!customer) {
              customer = await prisma.customer.create({
                data: {
                  id: `facebook_${senderId}`,
                  firstName: `User`,
                  lastName: `${senderId.slice(-4)}`,
                  email: `facebook_${senderId}@example.com`,
                  companyId: 'cld5c0ey0000oymzdbqo3s4so'
                }
              });
            }

            conversation = await prisma.conversation.create({
              data: {
                companyId: 'cld5c0ey0000oymzdbqo3s4so', // Default company
                customerId: `facebook_${senderId}`,
                channel: 'FACEBOOK',
                status: 'ACTIVE',
                metadata: {
                  pageId,
                  senderName: `User ${senderId.slice(-4)}`
                }
              }
            });
          }

          // Create message
          const message = await prisma.message.create({
            data: {
              conversationId: conversation.id,
              content: messageText,
              type: 'TEXT',
              isFromCustomer: true,
              metadata: {
                facebookMessageId: webhookEvent.message.mid,
                senderId,
                pageId
              }
            }
          });

          // Emit to Socket.IO
          io.emit('new_message', {
            id: message.id,
            conversationId: message.conversationId,
            content: message.content,
            type: message.type.toLowerCase(),
            direction: 'inbound',
            isFromCustomer: message.isFromCustomer,
            timestamp: message.createdAt,
            status: 'delivered',
            metadata: message.metadata
          });
        }
      });

      res.status(200).send('EVENT_RECEIVED');
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('Error processing Facebook webhook:', error);
    res.sendStatus(500);
  }
});

// Start server
async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      console.error('❌ Cannot start server without database connection');
      process.exit(1);
    }

    // Initialize data
    await initializeData();

    // Initialize Gemini AI
    console.log('🤖 Initializing Gemini AI service...');
    const geminiSettings = {
      hasApiKey: !!process.env.GOOGLE_GEMINI_API_KEY,
      isEnabled: !!process.env.GOOGLE_GEMINI_API_KEY
    };
    console.log('🤖 Gemini settings:', geminiSettings);

    // Load connected Facebook pages from database
    await loadConnectedPagesFromDB();

    server.listen(PORT, () => {
      console.log(`🚀 Real server running on port ${PORT}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log(`💚 Health check: http://localhost:${PORT}/health`);
      console.log(`🗄️  Database: MySQL (Real)`);
      console.log(`🔌 Socket.IO enabled for real-time updates`);
      console.log(`🤖 Gemini AI endpoints: http://localhost:${PORT}/api/v1/ai/`);
      console.log(`📘 Facebook webhook: http://localhost:${PORT}/api/v1/integrations/facebook/webhook`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
