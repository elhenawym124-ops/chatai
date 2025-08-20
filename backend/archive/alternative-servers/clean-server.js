const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3003', 'http://localhost:3004'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Basic routes
app.get('/', (req, res) => {
  res.json({
    message: 'Communication Platform API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
});

// Product Routes
try {
  const productRoutes = require('./src/routes/productRoutes.js');
  app.use('/api/v1/products', productRoutes);
  console.log('✅ Product routes loaded');
} catch (error) {
  console.error('❌ Failed to load product routes:', error.message);
}

// Upload Routes
try {
  const uploadRoutes = require('./src/routes/uploadRoutes.js');
  app.use('/api/v1/uploads', uploadRoutes);
  console.log('✅ Upload routes loaded');
} catch (error) {
  console.error('❌ Failed to load upload routes:', error.message);
}

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test database connection
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Get company count
    const companyCount = await prisma.company.count();
    console.log(`📊 Found ${companyCount} companies in database`);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Start server
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    const dbConnected = await connectDatabase();
    
    const server = app.listen(PORT, () => {
      console.log('🚀 Server running on port', PORT);
      console.log('📱 Frontend URL: http://localhost:3000');
      console.log('🔗 Backend URL: http://localhost:3001');
      console.log('📊 API Base URL: http://localhost:3001/api/v1');
      console.log('🖼️ Upload API: http://localhost:3001/api/v1/uploads');
      console.log('📁 Static Files: http://localhost:3001/uploads');
      console.log('💾 Database:', dbConnected ? 'Connected' : 'Disconnected');
      console.log('');
      console.log('✅ Server is ready to accept connections!');
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('🔄 SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        prisma.$disconnect();
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('🔄 SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        prisma.$disconnect();
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
