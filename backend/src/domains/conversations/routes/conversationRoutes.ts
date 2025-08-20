import { Router } from 'express';

const router = Router();

// Mock data للاختبار
const mockConversations = [
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

// Mock messages data
const mockMessages: { [key: string]: any[] } = {
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

// GET /api/v1/conversations - جلب جميع المحادثات
router.get('/', (req, res) => {
  try {
    console.log('📞 Fetching conversations from real server');
    
    res.json({
      success: true,
      data: mockConversations,
      pagination: {
        page: 1,
        limit: 20,
        total: mockConversations.length,
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

// GET /api/v1/conversations/:id - جلب محادثة محددة
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const conversation = mockConversations.find(conv => conv.id === id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    console.log(`📞 Fetching conversation ${id} from real server`);

    return res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('❌ Error fetching conversation:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch conversation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/v1/conversations/:id/messages - جلب رسائل المحادثة
router.get('/:id/messages', (req, res) => {
  try {
    const { id } = req.params;
    const messages = mockMessages[id] || [];
    
    console.log(`📨 Fetching messages for conversation ${id} from real server`);
    
    res.json({
      success: true,
      data: messages,
      pagination: {
        page: 1,
        limit: 50,
        total: messages.length,
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

// POST /api/v1/conversations/:id/send - إرسال رسالة
router.post('/:id/send', (req, res) => {
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

    // إضافة الرسالة للمحادثة
    if (!mockMessages[id]) {
      mockMessages[id] = [];
    }

    const newMessage = {
      id: `msg_${Date.now()}`,
      content: message,
      isFromCustomer: false,
      timestamp: new Date().toISOString(),
      senderName: 'Support Agent'
    };

    mockMessages[id].push(newMessage);

    // تحديث آخر رسالة في المحادثة
    const conversation = mockConversations.find(conv => conv.id === id);
    if (conversation) {
      conversation.lastMessage = message;
      conversation.lastMessageTime = new Date().toISOString();
    }

    return res.json({
      success: true,
      data: newMessage,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('❌ Error sending message:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send message',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/v1/conversations/:id - حذف محادثة
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // البحث عن المحادثة
    const conversationIndex = mockConversations.findIndex(conv => conv.id === id);
    
    if (conversationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // حذف المحادثة من القائمة
    const deletedConversation = mockConversations.splice(conversationIndex, 1)[0];
    
    // حذف جميع رسائل المحادثة
    if (mockMessages[id]) {
      delete mockMessages[id];
    }
    
    console.log(`🗑️ Deleted conversation ${id} and its messages`);
    
    res.json({
      success: true,
      message: 'Conversation deleted successfully',
      data: {
        deletedConversation,
        deletedMessagesCount: mockMessages[id]?.length || 0
      }
    });
  } catch (error) {
    console.error('❌ Error deleting conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete conversation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/v1/conversations - إنشاء محادثة جديدة
router.post('/', (req, res) => {
  try {
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
    
    mockConversations.push(newConversation);
    
    console.log('📞 Created new conversation:', newConversation);
    
    res.status(201).json({
      success: true,
      data: newConversation,
      message: 'Conversation created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create conversation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as conversationRoutes };
