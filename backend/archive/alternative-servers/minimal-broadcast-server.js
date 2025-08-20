const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Basic middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Minimal Broadcast Server is running',
    timestamp: new Date().toISOString()
  });
});

// Direct broadcast routes (no external files)
app.get('/api/v1/broadcast/campaigns', (req, res) => {
  console.log('📡 Getting broadcast campaigns');
  
  const campaigns = [
    {
      id: '1',
      name: 'حملة ترويجية',
      message: 'عروض خاصة لعملائنا الكرام',
      targetAudience: 'all',
      status: 'sent',
      recipientCount: 150,
      deliveredCount: 145,
      openedCount: 120,
      clickedCount: 80,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      name: 'حملة مجدولة',
      message: 'رسالة مجدولة للإرسال غداً',
      targetAudience: 'active_24h',
      status: 'scheduled',
      recipientCount: 75,
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    }
  ];

  res.json({
    success: true,
    data: campaigns,
    pagination: {
      page: 1,
      limit: 10,
      total: campaigns.length,
      totalPages: 1
    }
  });
});

app.post('/api/v1/broadcast/campaigns', (req, res) => {
  console.log('📡 Creating broadcast campaign:', req.body);
  
  const campaign = {
    id: Date.now().toString(),
    name: req.body.name || 'حملة جديدة',
    message: req.body.message || 'رسالة تجريبية',
    targetAudience: req.body.targetAudience || 'all',
    status: req.body.sendNow ? 'sent' : 'scheduled',
    scheduledAt: req.body.scheduledAt,
    recipientCount: 100,
    createdAt: new Date().toISOString(),
    images: req.body.images || []
  };

  res.status(201).json({
    success: true,
    data: campaign,
    message: 'Campaign created successfully'
  });
});

app.get('/api/v1/broadcast/analytics', (req, res) => {
  console.log('📊 Getting broadcast analytics');
  
  const analytics = {
    totalCampaigns: 5,
    activeCampaigns: 2,
    campaignsThisMonth: 3,
    totalRecipients: 500,
    totalDelivered: 475,
    totalOpened: 380,
    totalClicked: 250,
    deliveryRate: 95,
    openRate: 80,
    clickRate: 66,
    recentCampaigns: [
      {
        id: '1',
        name: 'حملة ترويجية',
        sentAt: new Date().toISOString(),
        recipientCount: 150,
        deliveredCount: 145,
        openedCount: 120,
        clickedCount: 80,
        deliveryRate: 97,
        openRate: 83,
        clickRate: 67
      }
    ]
  };

  res.json({
    success: true,
    data: analytics
  });
});

app.get('/api/v1/broadcast/customer-lists', (req, res) => {
  console.log('👥 Getting customer lists');
  
  const customerLists = [
    {
      id: 'active_24h',
      name: 'العملاء النشطين خلال 24 ساعة',
      description: 'العملاء الذين تفاعلوا خلال آخر 24 ساعة',
      count: 75,
      criteria: { type: 'active_24h' }
    },
    {
      id: 'active_30d',
      name: 'العملاء النشطين خلال 30 يوم',
      description: 'العملاء الذين تفاعلوا خلال آخر 30 يوم',
      count: 200,
      criteria: { type: 'active_30d' }
    },
    {
      id: 'all',
      name: 'جميع العملاء',
      description: 'جميع العملاء المسجلين في النظام',
      count: 500,
      criteria: { type: 'all' }
    },
    {
      id: 'high_value',
      name: 'العملاء المميزين',
      description: 'العملاء ذوي القيمة العالية',
      count: 50,
      criteria: { type: 'high_value' }
    }
  ];

  res.json({
    success: true,
    data: customerLists
  });
});

app.get('/api/v1/broadcast/settings', (req, res) => {
  console.log('⚙️ Getting broadcast settings');
  
  const settings = {
    defaultSendTime: '10:00',
    timezone: 'Asia/Riyadh',
    maxRecipientsPerCampaign: 5000,
    maxCampaignsPerDay: 10,
    enableDeliveryReports: true,
    enableOpenTracking: true,
    enableClickTracking: true,
    messagesPerMinute: 60,
    messagesPerHour: 1000,
    messagesPerDay: 10000
  };

  res.json({
    success: true,
    data: settings
  });
});

// Simple image upload endpoint
app.post('/api/v1/uploads/single', (req, res) => {
  console.log('📤 Mock image upload');
  
  const mockImage = {
    filename: `mock-image-${Date.now()}.jpg`,
    originalName: 'test-image.jpg',
    size: 1024000,
    url: `/uploads/products/mock-image-${Date.now()}.jpg`,
    fullUrl: `http://localhost:${PORT}/uploads/products/mock-image-${Date.now()}.jpg`
  };

  res.json({
    success: true,
    data: mockImage
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Minimal Broadcast Server running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 Broadcast API: http://localhost:${PORT}/api/v1/broadcast/campaigns`);
  console.log(`📊 Analytics: http://localhost:${PORT}/api/v1/broadcast/analytics`);
  console.log(`👥 Customer Lists: http://localhost:${PORT}/api/v1/broadcast/customer-lists`);
  console.log(`⚙️  Settings: http://localhost:${PORT}/api/v1/broadcast/settings`);
  console.log(`📤 Upload: http://localhost:${PORT}/api/v1/uploads/single`);
  console.log('✅ Server is ready for testing!');
});

module.exports = app;
