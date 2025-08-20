import 'dotenv/config';
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { initializeDatabase, getPrismaClient } from './config/database';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public'));
app.use('/uploads', express.static('uploads'));

// Rate limiting will be added after database initialization

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

// API routes will be added after database initialization

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
    },
  });
});

// Database test endpoint
app.get('/api/v1/test-db', async (req, res) => {
  try {
    const prisma = getPrismaClient();

    // SECURITY: Safe connection test query - no user data or company isolation needed
    // This is a simple database connectivity test that doesn't access any user tables
    await prisma.$queryRaw`SELECT 1 as connection_test`;

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
      database: 'MySQL',
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
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Real conversations endpoint
app.get('/api/v1/conversations', async (req, res) => {
  try {
    const prisma = getPrismaClient();

    // التحقق من المصادقة والشركة
    const companyId = (req as any).user?.companyId;
    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح بالوصول - معرف الشركة مطلوب'
      });
    }

    console.log('📞 Fetching real conversations from database for company:', companyId);

    // Get conversations with customer info - فلترة بـ companyId
    const conversations = await prisma.conversation.findMany({
      where: { companyId }, // إضافة فلترة الشركة
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
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Real messages endpoint
app.get('/api/v1/conversations/:id/messages', async (req, res) => {
  try {
    const prisma = getPrismaClient();
    const { id } = req.params;

    console.log(`📨 Fetching real messages for conversation ${id}...`);

    // Get messages for conversation
    const messages = await prisma.message.findMany({
      where: { conversation: { companyId: req.user?.companyId } },
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
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Send message endpoint
app.post('/api/v1/conversations/:conversationId/send', async (req, res): Promise<void> => {
  try {
    const prisma = getPrismaClient();
    const { conversationId } = req.params;
    const { message } = req.body;

    if (!message) {
      res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
      return;
    }

    console.log(`📤 Sending message to conversation ${conversationId}:`, message);

    // Check if conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
      return;
    }

    // Create new message
    const newMessage = await prisma.message.create({
      data: {
        conversationId: conversationId,
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
      where: { id: conversationId },
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

    console.log('✅ Message sent successfully:', transformedMessage.id);

    res.json({
      success: true,
      data: transformedMessage,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database connection
    await initializeDatabase();
    console.log('✅ Database connected successfully');

    // Import routes after database initialization
    const { authRoutes } = await import('./domains/auth/routes/authRoutes');
    const { facebookRoutes } = await import('./domains/integrations/routes/facebookRoutes');
    const { conversationRoutes } = await import('./domains/conversations/routes/conversationRoutes');
    const { aiRoutes } = await import('./domains/ai/routes/aiRoutes');
    const productRoutes = (await import('./routes/productRoutes')).default;
    const { rateLimitMiddleware } = await import('./domains/auth/middleware/rateLimitMiddleware');

    // Apply rate limiting
    app.use(rateLimitMiddleware.general);

    // Setup API routes
    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/integrations/facebook', facebookRoutes);
    app.use('/api/v1/conversations', conversationRoutes);
    app.use('/api/v1/ai', aiRoutes);
    app.use('/api/v1/products', productRoutes);
    
    // Import and setup upload routes
    const { uploadRoutes } = await import('./domains/upload/routes/uploadRoutes');
    app.use('/api/v1/upload', uploadRoutes);
    
    // Import and setup broadcast routes
    const { broadcastRoutes } = await import('./domains/broadcast/routes/broadcastRoutes');
    app.use('/api/v1/broadcast', broadcastRoutes);

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log(`💚 Health check: http://localhost:${PORT}/health`);
      console.log(`🗄️  Database: MySQL`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
