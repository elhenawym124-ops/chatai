const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Test Broadcast Server is running',
    timestamp: new Date().toISOString()
  });
});

// Import broadcast routes
try {
  const broadcastRoutes = require('./src/routes/broadcastRoutes.js');
  app.use('/api/v1/broadcast', broadcastRoutes);
  console.log('✅ Broadcast routes registered successfully');
} catch (error) {
  console.error('❌ Failed to register broadcast routes:', error.message);
}

// Import upload routes for image upload testing
try {
  const uploadRoutes = require('./src/routes/uploadRoutes.js');
  app.use('/api/v1/uploads', uploadRoutes);
  console.log('✅ Upload routes registered successfully');
} catch (error) {
  console.error('❌ Failed to register upload routes:', error.message);
}

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
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
  console.log(`🚀 Test Broadcast Server running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 Broadcast API: http://localhost:${PORT}/api/v1/broadcast/campaigns`);
  console.log(`📊 Analytics: http://localhost:${PORT}/api/v1/broadcast/analytics`);
  console.log(`👥 Customer Lists: http://localhost:${PORT}/api/v1/broadcast/customer-lists`);
  console.log(`📤 Upload: http://localhost:${PORT}/api/v1/uploads/single`);
  console.log(`⚙️  Settings: http://localhost:${PORT}/api/v1/broadcast/settings`);
  console.log('✅ Server is ready for testing!');
});

module.exports = app;
