const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// Upload Routes
const uploadRoutes = require('./src/routes/uploadRoutes.js');
app.use('/api/v1/uploads', uploadRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve test page
app.get('/test-upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-upload.html'));
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
  console.log('Test upload page: http://localhost:3001/test-upload');
});
