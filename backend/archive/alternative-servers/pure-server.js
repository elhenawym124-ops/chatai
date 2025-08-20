const http = require('http');
const url = require('url');
const querystring = require('querystring');

const PORT = 3001;

// Helper function to parse JSON body
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
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
  res.end(JSON.stringify(data, null, 2));
}

// Handle CORS preflight
function handleCORS(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return true;
  }
  return false;
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  // Handle CORS
  if (handleCORS(req, res)) return;

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;
  const query = parsedUrl.query;

  console.log(`${new Date().toISOString()} - ${method} ${pathname}`);

  try {
    // Health check
    if (pathname === '/health') {
      return sendJSON(res, {
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'Pure Node.js server is running',
        uptime: process.uptime()
      });
    }

    // Broadcast campaigns
    if (pathname === '/api/v1/broadcast/campaigns') {
      if (method === 'GET') {
        return sendJSON(res, {
          success: true,
          data: [
            {
              id: '1',
              name: 'حملة تجريبية 1',
              status: 'active',
              createdAt: new Date().toISOString(),
              targetAudience: 'جميع العملاء',
              message: 'مرحباً بكم في حملتنا الجديدة',
              deliveredCount: 120,
              openedCount: 85,
              clickedCount: 23
            },
            {
              id: '2',
              name: 'حملة تجريبية 2',
              status: 'scheduled',
              createdAt: new Date().toISOString(),
              targetAudience: 'العملاء النشطين',
              message: 'عرض خاص لعملائنا المميزين',
              scheduledAt: new Date(Date.now() + 24*60*60*1000).toISOString()
            }
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 2,
            pages: 1
          },
          message: 'Campaigns retrieved successfully'
        });
      }
      
      if (method === 'POST') {
        const body = await parseBody(req);
        console.log('Creating campaign:', body);
        
        return sendJSON(res, {
          success: true,
          data: {
            id: Date.now().toString(),
            name: body.name || 'حملة جديدة',
            status: body.sendNow ? 'sent' : 'created',
            createdAt: new Date().toISOString(),
            targetAudience: body.targetAudience || 'جميع العملاء',
            message: body.message || 'رسالة جديدة',
            scheduledAt: body.scheduledAt || null,
            images: body.images || [],
            tags: body.tags || [],
            priority: body.priority || 'medium'
          },
          message: 'Campaign created successfully'
        }, 201);
      }
    }

    // Campaign send
    if (pathname.match(/^\/api\/v1\/broadcast\/campaigns\/\d+\/send$/)) {
      const campaignId = pathname.split('/')[5];
      if (method === 'POST') {
        console.log(`Sending campaign ${campaignId}`);
        return sendJSON(res, {
          success: true,
          data: {
            campaignId: campaignId,
            status: 'sent',
            sentAt: new Date().toISOString(),
            recipientCount: 150,
            estimatedDelivery: '5-10 minutes'
          },
          message: 'Campaign sent successfully'
        });
      }
    }

    // Customer lists
    if (pathname === '/api/v1/broadcast/customer-lists') {
      return sendJSON(res, {
        success: true,
        data: [
          {
            id: '1',
            name: 'جميع العملاء',
            count: 150,
            description: 'جميع العملاء المسجلين في النظام'
          },
          {
            id: '2', 
            name: 'العملاء النشطين',
            count: 75,
            description: 'العملاء الذين تفاعلوا خلال آخر 30 يوم'
          },
          {
            id: '3',
            name: 'العملاء النشطين خلال 24 ساعة',
            count: 25,
            description: 'العملاء الذين تفاعلوا خلال آخر 24 ساعة'
          },
          {
            id: '4',
            name: 'عملاء VIP',
            count: 12,
            description: 'العملاء المميزين والمهمين'
          }
        ],
        message: 'Customer lists retrieved successfully'
      });
    }

    // Analytics
    if (pathname === '/api/v1/broadcast/analytics') {
      return sendJSON(res, {
        success: true,
        data: {
          totalCampaigns: 5,
          activeCampaigns: 2,
          scheduledCampaigns: 1,
          completedCampaigns: 2,
          totalSent: 1250,
          totalDelivered: 1200,
          totalOpened: 800,
          totalClicked: 150,
          totalReplied: 45,
          deliveryRate: 96.0,
          openRate: 66.7,
          clickRate: 18.8,
          replyRate: 5.6,
          lastUpdated: new Date().toISOString()
        },
        message: 'Analytics retrieved successfully'
      });
    }

    // Upload image
    if (pathname === '/api/v1/upload/image' && method === 'POST') {
      const filename = `image_${Date.now()}.jpg`;
      return sendJSON(res, {
        success: true,
        data: {
          filename: filename,
          url: `/uploads/images/${filename}`,
          fullUrl: `http://localhost:${PORT}/uploads/images/${filename}`,
          size: 1024 * 50, // 50KB
          uploadedAt: new Date().toISOString()
        },
        message: 'Image uploaded successfully'
      });
    }

    // Settings
    if (pathname === '/api/v1/broadcast/settings') {
      if (method === 'GET') {
        return sendJSON(res, {
          success: true,
          data: {
            facebookPageToken: '****',
            autoSendEnabled: true,
            defaultScheduleTime: '09:00',
            maxRecipientsPerBatch: 100,
            retryFailedMessages: true,
            enableAnalytics: true
          },
          message: 'Settings retrieved successfully'
        });
      }
      
      if (method === 'PUT') {
        const body = await parseBody(req);
        return sendJSON(res, {
          success: true,
          data: body,
          message: 'Settings updated successfully'
        });
      }
    }

    // 404 for all other routes
    sendJSON(res, {
      success: false,
      error: 'Route not found',
      path: pathname,
      method: method,
      availableEndpoints: [
        'GET /health',
        'GET /api/v1/broadcast/campaigns',
        'POST /api/v1/broadcast/campaigns',
        'POST /api/v1/broadcast/campaigns/:id/send',
        'GET /api/v1/broadcast/customer-lists',
        'GET /api/v1/broadcast/analytics',
        'POST /api/v1/upload/image',
        'GET /api/v1/broadcast/settings',
        'PUT /api/v1/broadcast/settings'
      ]
    }, 404);

  } catch (error) {
    console.error('Server error:', error);
    sendJSON(res, {
      success: false,
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Start server
server.listen(PORT, () => {
  console.log('🚀 Pure Node.js Server started successfully!');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log(`📡 Broadcast: http://localhost:${PORT}/api/v1/broadcast/campaigns`);
  console.log(`📊 Analytics: http://localhost:${PORT}/api/v1/broadcast/analytics`);
  console.log(`👥 Customers: http://localhost:${PORT}/api/v1/broadcast/customer-lists`);
  console.log(`📤 Upload: http://localhost:${PORT}/api/v1/upload/image`);
  console.log(`⚙️  Settings: http://localhost:${PORT}/api/v1/broadcast/settings`);
  console.log('✅ Server is ready for broadcast testing!');
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. Please stop other servers first.`);
  }
});

module.exports = server;
