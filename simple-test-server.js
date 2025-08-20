const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

console.log('🔧 Setting up simple test server...');

// Mock data للمحادثات
const conversations = [
  {
    id: '1',
    customerId: '1',
    customerName: 'أحمد محمد',
    status: 'active',
    lastMessage: 'مرحباً، أحتاج مساعدة في طلبي',
    lastMessageTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
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
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    unreadCount: 1,
    assignedAgent: null,
    priority: 'high',
    tags: ['استفسار', 'شحن']
  },
  {
    id: '3',
    customerId: '3',
    customerName: 'محمد حسن',
    status: 'closed',
    lastMessage: 'شكراً لكم، تم حل المشكلة',
    lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
    assignedAgent: 'أحمد علي',
    priority: 'low',
    tags: ['مُحل']
  }
];

// Mock data للرسائل
const messages = {
  '1': [
    {
      id: 'msg1',
      content: 'مرحباً، أحتاج مساعدة في طلبي',
      isFromCustomer: true,
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      senderName: 'أحمد محمد'
    },
    {
      id: 'msg2',
      content: 'مرحباً بك! كيف يمكنني مساعدتك؟',
      isFromCustomer: false,
      timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
      senderName: 'سارة أحمد'
    }
  ],
  '2': [
    {
      id: 'msg4',
      content: 'متى سيصل طلبي؟',
      isFromCustomer: true,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      senderName: 'فاطمة علي'
    }
  ]
};

// Routes
app.get('/', (req, res) => {
  console.log('📍 Root endpoint accessed');
  res.json({
    message: 'Simple Test Server is running!',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      conversations: '/api/v1/conversations'
    }
  });
});

app.get('/health', (req, res) => {
  console.log('💚 Health check accessed');
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    server: 'Simple Test Server'
  });
});

// جلب جميع المحادثات
app.get('/api/v1/conversations', (req, res) => {
  console.log('📞 Fetching conversations from simple test server');
  res.json({
    success: true,
    data: conversations,
    pagination: {
      page: 1,
      limit: 20,
      total: conversations.length,
      pages: 1
    }
  });
});

// جلب رسائل محادثة محددة
app.get('/api/v1/conversations/:id/messages', (req, res) => {
  const { id } = req.params;
  console.log(`📨 Fetching messages for conversation ${id}`);
  
  const conversationMessages = messages[id] || [];
  
  res.json({
    success: true,
    data: conversationMessages,
    pagination: {
      page: 1,
      limit: 100,
      total: conversationMessages.length,
      pages: 1
    }
  });
});

// إرسال رسالة
app.post('/api/v1/conversations/:id/messages', (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  
  console.log(`📤 Sending message to conversation ${id}:`, message);
  
  if (!message) {
    return res.status(400).json({
      success: false,
      message: 'Message content is required'
    });
  }
  
  // إنشاء رسالة جديدة
  const newMessage = {
    id: `msg_${Date.now()}`,
    content: message,
    isFromCustomer: false,
    timestamp: new Date().toISOString(),
    senderName: 'Support Agent'
  };
  
  // إضافة الرسالة للمحادثة
  if (!messages[id]) {
    messages[id] = [];
  }
  messages[id].push(newMessage);
  
  // تحديث آخر رسالة في المحادثة
  const conversation = conversations.find(conv => conv.id === id);
  if (conversation) {
    conversation.lastMessage = message;
    conversation.lastMessageTime = new Date().toISOString();
  }
  
  res.json({
    success: true,
    data: newMessage,
    message: 'Message sent successfully'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple test server running on port ${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`📞 Conversations: http://localhost:${PORT}/api/v1/conversations`);
  console.log(`📨 Messages: http://localhost:${PORT}/api/v1/conversations/1/messages`);
  console.log('✅ Server is ready for connections!');
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Server shutting down...');
  process.exit(0);
});
