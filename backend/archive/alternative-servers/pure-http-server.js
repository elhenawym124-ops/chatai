const http = require('http');
const url = require('url');
const querystring = require('querystring');

const PORT = 3001;

// Helper function to parse JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

// Helper function to send JSON response
function sendJSON(res, data, statusCode = 200) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// Create server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  console.log(`${method} ${path}`);

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  try {
    // Health check
    if (path === '/health' && method === 'GET') {
      sendJSON(res, {
        status: 'OK',
        message: 'Pure HTTP Broadcast Server is running',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Get campaigns
    if (path === '/api/v1/broadcast/campaigns' && method === 'GET') {
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

      sendJSON(res, {
        success: true,
        data: campaigns,
        pagination: {
          page: 1,
          limit: 10,
          total: campaigns.length,
          totalPages: 1
        }
      });
      return;
    }

    // Create campaign
    if (path === '/api/v1/broadcast/campaigns' && method === 'POST') {
      const body = await parseBody(req);
      console.log('📡 Creating broadcast campaign:', body);
      
      const campaign = {
        id: Date.now().toString(),
        name: body.name || 'حملة جديدة',
        message: body.message || 'رسالة تجريبية',
        targetAudience: body.targetAudience || 'all',
        status: body.sendNow ? 'sent' : 'scheduled',
        scheduledAt: body.scheduledAt,
        recipientCount: 100,
        createdAt: new Date().toISOString(),
        images: body.images || []
      };

      sendJSON(res, {
        success: true,
        data: campaign,
        message: 'Campaign created successfully'
      }, 201);
      return;
    }

    // Get analytics
    if (path === '/api/v1/broadcast/analytics' && method === 'GET') {
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

      sendJSON(res, {
        success: true,
        data: analytics
      });
      return;
    }

    // Get customer lists
    if (path === '/api/v1/broadcast/customer-lists' && method === 'GET') {
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

      sendJSON(res, {
        success: true,
        data: customerLists
      });
      return;
    }

    // Get settings
    if (path === '/api/v1/broadcast/settings' && method === 'GET') {
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

      sendJSON(res, {
        success: true,
        data: settings
      });
      return;
    }

    // Update settings
    if (path === '/api/v1/broadcast/settings' && method === 'PUT') {
      const body = await parseBody(req);
      console.log('⚙️ Updating broadcast settings:', body);
      
      const updatedSettings = {
        ...body,
        updatedAt: new Date().toISOString()
      };

      sendJSON(res, {
        success: true,
        data: updatedSettings,
        message: 'Settings updated successfully'
      });
      return;
    }

    // Mock image upload
    if (path === '/api/v1/uploads/single' && method === 'POST') {
      console.log('📤 Mock image upload');
      
      const mockImage = {
        filename: `mock-image-${Date.now()}.jpg`,
        originalName: 'test-image.jpg',
        size: 1024000,
        url: `/uploads/products/mock-image-${Date.now()}.jpg`,
        fullUrl: `http://localhost:${PORT}/uploads/products/mock-image-${Date.now()}.jpg`
      };

      sendJSON(res, {
        success: true,
        data: mockImage
      });
      return;
    }

    // 404 for all other routes
    sendJSON(res, {
      success: false,
      error: 'Route not found',
      path: path
    }, 404);

  } catch (error) {
    console.error('Error:', error);
    sendJSON(res, {
      success: false,
      error: 'Internal server error',
      message: error.message
    }, 500);
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Pure HTTP Broadcast Server running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 Broadcast API: http://localhost:${PORT}/api/v1/broadcast/campaigns`);
  console.log(`📊 Analytics: http://localhost:${PORT}/api/v1/broadcast/analytics`);
  console.log(`👥 Customer Lists: http://localhost:${PORT}/api/v1/broadcast/customer-lists`);
  console.log(`⚙️  Settings: http://localhost:${PORT}/api/v1/broadcast/settings`);
  console.log(`📤 Upload: http://localhost:${PORT}/api/v1/uploads/single`);
  console.log('✅ Server is ready for testing!');
});

module.exports = server;
