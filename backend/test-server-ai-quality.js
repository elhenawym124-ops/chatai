/**
 * خادم اختبار مؤقت لنظام التقييم الذكي
 */

const express = require('express');
const cors = require('cors');
const aiQualityRoutes = require('./src/routes/aiQualityRoutes');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/ai-quality', aiQualityRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'AI Quality Test Server' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Quality Test Server running on port ${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   - GET  /api/v1/ai-quality/statistics`);
  console.log(`   - GET  /api/v1/ai-quality/recent`);
  console.log(`   - GET  /api/v1/ai-quality/trends`);
  console.log(`   - GET  /api/v1/ai-quality/system-status`);
  console.log(`   - GET  /api/v1/ai-quality/metrics-summary`);
  console.log(`\n🧪 Run test first: node test-ai-quality-direct.js`);
  console.log(`🌐 Then open: http://localhost:3002/ai-quality`);
});
