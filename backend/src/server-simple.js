const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3003'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Simple broadcast routes for testing
app.get('/api/v1/broadcast/campaigns', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Broadcast API is working'
  });
});

app.post('/api/v1/broadcast/campaigns', (req, res) => {
  console.log('Creating campaign:', req.body);
  res.json({
    success: true,
    data: {
      id: Date.now().toString(),
      name: req.body.name || 'Test Campaign',
      status: 'created',
      createdAt: new Date().toISOString()
    },
    message: 'Campaign created successfully'
  });
});

// Upload routes
app.post('/api/v1/upload/image', (req, res) => {
  res.json({
    success: true,
    data: {
      filename: 'test-image.jpg',
      url: '/uploads/images/test-image.jpg'
    },
    message: 'Image uploaded successfully'
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
  console.log(`🚀 Simple Server running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 Broadcast API: http://localhost:${PORT}/api/v1/broadcast/campaigns`);
});

module.exports = app;
