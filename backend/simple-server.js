const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Mock data for testing
const mockPageData = {
  "250528358137901": {
    pageId: "250528358137901",
    pageName: "سولا 132",
    pageAccessToken: "EAAYour_Mock_Token_Here_For_Testing_250528358137901",
    status: "connected",
    connectedAt: "2025-07-23T01:01:54.484Z"
  }
};

// Mock Company endpoint
app.get('/api/v1/companies/:id', (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.id,
      name: "شركة تجريبية",
      dateFormat: "DD/MM/YYYY",
      timezone: "Asia/Riyadh",
      language: "ar"
    }
  });
});

// Mock Facebook endpoints
app.get('/api/v1/integrations/facebook/page/:pageId', (req, res) => {
  const { pageId } = req.params;
  const page = mockPageData[pageId];
  
  if (!page) {
    return res.status(404).json({
      success: false,
      error: 'Page not found'
    });
  }

  res.json({
    success: true,
    data: {
      ...page,
      pageAccessToken: page.pageAccessToken.substring(0, 20) + '...'
    }
  });
});

app.get('/api/v1/integrations/facebook/connected', (req, res) => {
  const pages = Object.values(mockPageData).map(page => ({
    id: page.pageId,
    pageId: page.pageId,
    pageName: page.pageName,
    status: page.status,
    connectedAt: page.connectedAt,
    lastActivity: page.connectedAt,
    messageCount: 0
  }));

  res.json({
    success: true,
    pages: pages
  });
});

app.get('/api/v1/integrations/facebook/diagnostics', (req, res) => {
  res.json({
    success: true,
    data: {
      timestamp: new Date().toISOString(),
      server: {
        status: "healthy",
        port: 3001,
        environment: "development"
      },
      facebook: {
        config: {
          appId: "your-facebook-app-id",
          webhookVerifyToken: "configured",
          backendUrl: "http://localhost:3001"
        },
        pages: {
          total: 1,
          connected: 1,
          list: ["سولا 132"]
        }
      },
      ai: {
        service: "enabled",
        status: "Ready for testing"
      },
      issues: [],
      recommendations: [
        {
          type: "info",
          message: "استخدم مفتاح Facebook حقيقي للاختبار الكامل"
        }
      ]
    }
  });
});

// Webhook endpoint for Facebook
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || 'simple_chat_verify_token_2025';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verified');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

app.post('/webhook', (req, res) => {
  const body = req.body;
  
  if (body.object === 'page') {
    body.entry.forEach(entry => {
      const webhookEvent = entry.messaging[0];
      console.log('📨 Received message:', webhookEvent);
      
      // Mock response
      if (webhookEvent.message) {
        console.log('✅ Message processed (mock mode)');
      }
    });
    
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log('🚀 Simple Server running on port', PORT);
  console.log('📱 Frontend URL: http://localhost:3000');
  console.log('🔗 Backend URL: http://localhost:3001');
  console.log('🧪 Mock mode - for testing Facebook integration');
});
