const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3003'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Simple health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test route registration one by one
console.log('🔍 Starting route registration test...');

try {
  console.log('✅ Step 1: Basic routes registered');
  
  // Try to register product routes
  console.log('🔍 Step 2: Attempting to register product routes...');
  const productRoutes = require('./src/routes/productRoutes.js');
  app.use('/api/v1/products', productRoutes);
  console.log('✅ Step 2: Product routes registered successfully');
  
} catch (error) {
  console.error('❌ Step 2 failed - Product routes error:', error.message);
  console.error('Stack:', error.stack);
}

try {
  // Try to register upload routes
  console.log('🔍 Step 3: Attempting to register upload routes...');
  const uploadRoutes = require('./src/routes/uploadRoutes.js');
  app.use('/api/v1/uploads', uploadRoutes);
  console.log('✅ Step 3: Upload routes registered successfully');
  
} catch (error) {
  console.error('❌ Step 3 failed - Upload routes error:', error.message);
  console.error('Stack:', error.stack);
}

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Debug server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
