const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

const PORT = 3001;

// Simple JSON response helper
function sendJSON(res, data, statusCode = 200) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
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

// Parse JSON body
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

// Create server
const server = http.createServer(async (req, res) => {
  // Handle CORS
  if (handleCORS(req, res)) return;

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  console.log(`${method} ${pathname}`);

  try {
    // Health check
    if (pathname === '/health') {
      return sendJSON(res, {
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'Test server is running'
      });
    }

    // Broadcast campaigns endpoint
    if (pathname === '/api/v1/broadcast/campaigns') {
      if (method === 'GET') {
        return sendJSON(res, {
          success: true,
          data: [
            {
              id: '1',
              name: 'حملة تجريبية',
              status: 'active',
              createdAt: new Date().toISOString()
            }
          ],
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
            status: 'created',
            createdAt: new Date().toISOString(),
            ...body
          },
          message: 'Campaign created successfully'
        }, 201);
      }
    }

    // Upload endpoint
    if (pathname === '/api/v1/upload/image' && method === 'POST') {
      return sendJSON(res, {
        success: true,
        data: {
          filename: 'test-image.jpg',
          url: '/uploads/images/test-image.jpg',
          fullUrl: `http://localhost:${PORT}/uploads/images/test-image.jpg`
        },
        message: 'Image uploaded successfully'
      });
    }

    // Customer lists endpoint
    if (pathname === '/api/v1/broadcast/customer-lists' && method === 'GET') {
      return sendJSON(res, {
        success: true,
        data: [
          {
            id: '1',
            name: 'جميع العملاء',
            count: 150
          },
          {
            id: '2', 
            name: 'العملاء النشطين',
            count: 75
          }
        ],
        message: 'Customer lists retrieved successfully'
      });
    }

    // Analytics endpoint
    if (pathname === '/api/v1/broadcast/analytics' && method === 'GET') {
      return sendJSON(res, {
        success: true,
        data: {
          totalCampaigns: 5,
          activeCampaigns: 2,
          totalSent: 1250,
          totalDelivered: 1200,
          totalOpened: 800,
          totalClicked: 150
        },
        message: 'Analytics retrieved successfully'
      });
    }

    // Static files (uploads)
    if (pathname.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', pathname);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath);
        const contentType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                           ext === '.png' ? 'image/png' :
                           ext === '.gif' ? 'image/gif' : 'application/octet-stream';
        
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
        return;
      }
    }

    // 404 for all other routes
    sendJSON(res, {
      success: false,
      error: 'Route not found',
      path: pathname,
      method: method
    }, 404);

  } catch (error) {
    console.error('Server error:', error);
    sendJSON(res, {
      success: false,
      error: 'Internal server error',
      message: error.message
    }, 500);
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Test Server running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 Broadcast API: http://localhost:${PORT}/api/v1/broadcast/campaigns`);
  console.log(`📊 Analytics: http://localhost:${PORT}/api/v1/broadcast/analytics`);
  console.log(`👥 Customer Lists: http://localhost:${PORT}/api/v1/broadcast/customer-lists`);
  console.log(`📤 Upload: http://localhost:${PORT}/api/v1/upload/image`);
});

module.exports = server;
