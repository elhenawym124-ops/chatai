const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running', status: 'OK' });
});

// Mock product data
const mockProduct = {
  id: 'cmddrfmyz0001ufasa8utnezl',
  name: 'كوتشي كاجول',
  description: 'كوتشي رياضي مريح للاستخدام اليومي',
  price: 299.99,
  sku: 'SHOE-001',
  stock: 25,
  isActive: true,
  categoryId: 'cat-1',
  images: 'https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=صورة+1,https://via.placeholder.com/300x300/7C3AED/FFFFFF?text=صورة+2',
  variants: [
    {
      id: 'var-1',
      productId: 'cmddrfmyz0001ufasa8utnezl',
      name: 'أحمر',
      type: 'color',
      sku: 'SHOE-001-RED',
      price: 309.99,
      comparePrice: 329.99,
      cost: 200,
      images: 'https://via.placeholder.com/150x150/EF4444/FFFFFF?text=أحمر',
      stock: 15,
      isActive: true,
      sortOrder: 1
    },
    {
      id: 'var-2',
      productId: 'cmddrfmyz0001ufasa8utnezl',
      name: 'أزرق',
      type: 'color',
      sku: 'SHOE-001-BLUE',
      price: 304.99,
      comparePrice: 324.99,
      cost: 195,
      images: 'https://via.placeholder.com/150x150/3B82F6/FFFFFF?text=أزرق',
      stock: 8,
      isActive: true,
      sortOrder: 2
    }
  ]
};

const mockCategories = [
  { id: 'cat-1', name: 'أحذية رياضية' },
  { id: 'cat-2', name: 'أحذية كاجوال' },
  { id: 'cat-3', name: 'أحذية رسمية' }
];

// Product routes
app.get('/api/v1/products/:id', (req, res) => {
  console.log('GET /api/v1/products/' + req.params.id);
  res.json({
    success: true,
    data: mockProduct
  });
});

app.put('/api/v1/products/:id', (req, res) => {
  console.log('PUT /api/v1/products/' + req.params.id, req.body);
  res.json({
    success: true,
    data: { ...mockProduct, ...req.body }
  });
});

// Categories route
app.get('/api/v1/products/categories', (req, res) => {
  console.log('GET /api/v1/products/categories');
  res.json({
    success: true,
    data: mockCategories
  });
});

// Auth route (mock)
app.get('/api/v1/auth/me', (req, res) => {
  console.log('GET /api/v1/auth/me');
  res.json({
    success: true,
    data: {
      id: 'user-1',
      name: 'Test User',
      companyId: 'company-1'
    }
  });
});

// Company route (mock)
app.get('/api/v1/companies/:id', (req, res) => {
  console.log('GET /api/v1/companies/' + req.params.id);
  res.json({
    success: true,
    data: {
      company: {
        id: req.params.id,
        name: 'Test Company',
        currency: 'ج.م'
      }
    }
  });
});

// Image upload routes (mock)
app.post('/api/v1/products/:id/images', (req, res) => {
  console.log('POST /api/v1/products/' + req.params.id + '/images');
  res.json({
    success: true,
    data: {
      images: [
        'https://via.placeholder.com/300x300/10B981/FFFFFF?text=جديد+1',
        'https://via.placeholder.com/300x300/F59E0B/FFFFFF?text=جديد+2'
      ]
    }
  });
});

app.delete('/api/v1/products/:id/images', (req, res) => {
  console.log('DELETE /api/v1/products/' + req.params.id + '/images');
  res.json({ success: true });
});

// Variant routes (mock)
app.post('/api/v1/products/:id/variants', (req, res) => {
  console.log('POST /api/v1/products/' + req.params.id + '/variants', req.body);
  const newVariant = {
    id: 'var-' + Date.now(),
    productId: req.params.id,
    ...req.body
  };
  res.json({
    success: true,
    data: newVariant
  });
});

app.put('/api/v1/products/:id/variants/:variantId', (req, res) => {
  console.log('PUT /api/v1/products/' + req.params.id + '/variants/' + req.params.variantId, req.body);
  res.json({
    success: true,
    data: { id: req.params.variantId, ...req.body }
  });
});

app.delete('/api/v1/products/:id/variants/:variantId', (req, res) => {
  console.log('DELETE /api/v1/products/' + req.params.id + '/variants/' + req.params.variantId);
  res.json({ success: true });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api/v1`);
  console.log(`🔗 CORS enabled for http://localhost:3000`);
});
