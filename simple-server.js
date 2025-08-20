const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

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
      content: 'مرحباً، أريد الاستفسار عن المنتج',
      isFromCustomer: true,
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      senderName: 'أحمد محمد'
    },
    {
      id: 'msg2',
      content: 'مرحباً بك! كيف يمكنني مساعدتك؟',
      isFromCustomer: false,
      timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
      senderName: 'Support Agent'
    },
    {
      id: 'msg3',
      content: 'أحتاج معلومات عن الضمان',
      isFromCustomer: true,
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      senderName: 'أحمد محمد'
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
  ],
  '3': [
    {
      id: 'msg5',
      content: 'لدي مشكلة في المنتج',
      isFromCustomer: true,
      timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
      senderName: 'محمد حسن'
    },
    {
      id: 'msg6',
      content: 'سنقوم بحل المشكلة فوراً',
      isFromCustomer: false,
      timestamp: new Date(Date.now() - 24.5 * 60 * 60 * 1000).toISOString(),
      senderName: 'Support Agent'
    },
    {
      id: 'msg7',
      content: 'شكراً لكم، تم حل المشكلة',
      isFromCustomer: true,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      senderName: 'محمد حسن'
    }
  ]
};

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// جلب جميع المحادثات
app.get('/api/v1/conversations', (req, res) => {
  console.log('📞 Fetching conversations from simple server');
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

// جلب محادثة محددة
app.get('/api/v1/conversations/:id', (req, res) => {
  const { id } = req.params;
  const conversation = conversations.find(conv => conv.id === id);
  
  if (!conversation) {
    return res.status(404).json({
      success: false,
      message: 'Conversation not found'
    });
  }
  
  console.log(`📞 Fetching conversation ${id} from simple server`);
  res.json({
    success: true,
    data: conversation
  });
});

// جلب رسائل المحادثة
app.get('/api/v1/conversations/:id/messages', (req, res) => {
  const { id } = req.params;
  const conversationMessages = messages[id] || [];
  
  console.log(`📨 Fetching messages for conversation ${id} from simple server`);
  res.json({
    success: true,
    data: conversationMessages,
    pagination: {
      page: 1,
      limit: 50,
      total: conversationMessages.length,
      pages: 1
    }
  });
});

// إرسال رسالة
app.post('/api/v1/conversations/:id/send', (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({
      success: false,
      message: 'Message content is required'
    });
  }
  
  console.log(`📤 Sending message to conversation ${id}:`, message);
  
  // إضافة الرسالة للمحادثة
  if (!messages[id]) {
    messages[id] = [];
  }
  
  const newMessage = {
    id: `msg_${Date.now()}`,
    content: message,
    isFromCustomer: false,
    timestamp: new Date().toISOString(),
    senderName: 'Support Agent'
  };
  
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

// إنشاء محادثة جديدة
app.post('/api/v1/conversations', (req, res) => {
  const { customerId, customerName, message } = req.body;
  
  const newConversation = {
    id: Date.now().toString(),
    customerId: customerId || Date.now().toString(),
    customerName: customerName || 'عميل جديد',
    status: 'active',
    lastMessage: message || 'محادثة جديدة',
    lastMessageTime: new Date().toISOString(),
    unreadCount: 1,
    assignedAgent: null,
    priority: 'medium',
    tags: ['جديد']
  };
  
  conversations.push(newConversation);
  
  console.log('📞 Created new conversation:', newConversation);
  
  res.status(201).json({
    success: true,
    data: newConversation,
    message: 'Conversation created successfully'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`📞 Conversations: http://localhost:${PORT}/api/v1/conversations`);
  console.log(`📨 Messages: http://localhost:${PORT}/api/v1/conversations/1/messages`);
});
