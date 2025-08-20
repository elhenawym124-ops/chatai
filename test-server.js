const http = require('http');
const url = require('url');

const PORT = 3001;

// Mock data
let companies = {
  'cmd5c0c9y0000ymzdd7wtv7ib': {
    id: 'cmd5c0c9y0000ymzdd7wtv7ib',
    name: 'شركة تجريبية',
    currency: 'EGP',
    settings: {
      dateFormat: 'gregorian',
      timezone: 'Africa/Cairo',
      language: 'ar'
    }
  }
};

let conversations = [
  {
    id: '1',
    customerName: 'أحمد محمد',
    lastMessage: 'مرحباً، أريد الاستفسار عن المنتج',
    lastMessageTime: new Date().toISOString(),
    unreadCount: 2,
    isOnline: true,
    messages: [
      {
        id: 'msg1',
        content: 'مرحباً، أريد الاستفسار عن المنتج',
        isFromCustomer: true,
        timestamp: new Date(Date.now() - 300000).toISOString(),
        senderName: 'أحمد محمد'
      },
      {
        id: 'msg2',
        content: 'مرحباً بك! كيف يمكنني مساعدتك؟',
        isFromCustomer: false,
        timestamp: new Date(Date.now() - 240000).toISOString(),
        senderName: 'Support Agent'
      }
    ]
  },
  {
    id: '2',
    customerName: 'فاطمة أحمد',
    lastMessage: 'شكراً لك',
    lastMessageTime: new Date(Date.now() - 600000).toISOString(),
    unreadCount: 0,
    isOnline: false,
    messages: [
      {
        id: 'msg3',
        content: 'شكراً لك',
        isFromCustomer: true,
        timestamp: new Date(Date.now() - 600000).toISOString(),
        senderName: 'فاطمة أحمد'
      }
    ]
  }
];

// Helper functions
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function sendJSON(res, statusCode, data) {
  setCORSHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// Create server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    setCORSHeaders(res);
    res.writeHead(200);
    res.end();
    return;
  }

  // Routes
  if (method === 'GET' && path === '/api/v1/conversations') {
    console.log('📊 Fetching conversations');
    sendJSON(res, 200, {
      success: true,
      data: conversations
    });
  }
  else if (method === 'GET' && path.startsWith('/api/v1/conversations/') && path.endsWith('/messages')) {
    const id = path.split('/')[4];
    console.log('📨 Fetching messages for conversation:', id);

    const conversation = conversations.find(c => c.id === id);
    if (!conversation) {
      return sendJSON(res, 404, { success: false, message: 'Conversation not found' });
    }

    sendJSON(res, 200, {
      success: true,
      data: conversation.messages || []
    });
  }
  else if (method === 'POST' && path.startsWith('/api/v1/conversations/') && path.endsWith('/send')) {
    const id = path.split('/')[4];

    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { message } = JSON.parse(body);
        console.log('📤 Sending message to conversation:', id, 'Message:', message);

        const conversation = conversations.find(c => c.id === id);
        if (!conversation) {
          return sendJSON(res, 404, { success: false, message: 'Conversation not found' });
        }

        // Add new message
        const newMessage = {
          id: 'msg_' + Date.now(),
          content: message,
          isFromCustomer: false,
          timestamp: new Date().toISOString(),
          senderName: 'Support Agent'
        };

        conversation.messages.push(newMessage);
        conversation.lastMessage = message;
        conversation.lastMessageTime = new Date().toISOString();

        sendJSON(res, 200, {
          success: true,
          message: 'Message sent successfully'
        });
      } catch (error) {
        sendJSON(res, 400, { success: false, message: 'Invalid JSON' });
      }
    });
  }
  // Company settings endpoints
  else if (method === 'GET' && path.startsWith('/api/v1/companies/')) {
    const companyId = path.split('/')[4];
    console.log('🏢 Fetching company data:', companyId);
    
    const company = companies[companyId];
    if (!company) {
      return sendJSON(res, 404, { success: false, message: 'Company not found' });
    }
    
    sendJSON(res, 200, {
      success: true,
      company: company
    });
  }
  else if (method === 'PUT' && path.includes('/date-format')) {
    const companyId = path.split('/')[4];
    console.log('📅 Updating date format for company:', companyId);
    
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const { dateFormat } = JSON.parse(body);
        
        if (!companies[companyId]) {
          return sendJSON(res, 404, { success: false, message: 'Company not found' });
        }
        
        if (dateFormat !== 'gregorian' && dateFormat !== 'hijri') {
          return sendJSON(res, 400, { success: false, message: 'Invalid date format' });
        }
        
        companies[companyId].settings.dateFormat = dateFormat;
        
        console.log('✅ Date format updated to:', dateFormat);
        sendJSON(res, 200, {
          success: true,
          message: 'Date format updated successfully',
          dateFormat: dateFormat
        });
      } catch (error) {
        console.error('❌ Error updating date format:', error);
        sendJSON(res, 400, { success: false, message: 'Invalid JSON' });
      }
    });
  }
  else {
    sendJSON(res, 404, { success: false, message: 'Route not found' });
  }
});

// Simulate new customer message every 10 seconds
setInterval(() => {
  const conversation = conversations[0];
  const newMessage = {
    id: 'msg_' + Date.now(),
    content: 'رسالة تجريبية جديدة من العميل',
    isFromCustomer: true,
    timestamp: new Date().toISOString(),
    senderName: conversation.customerName
  };
  
  conversation.messages.push(newMessage);
  conversation.lastMessage = newMessage.content;
  conversation.lastMessageTime = new Date().toISOString();
  conversation.unreadCount++;
  
  console.log('🔔 Simulated new customer message');
}, 10000);

server.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log('📱 Ready for testing!');
});
