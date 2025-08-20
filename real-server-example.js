// مثال لخادم حقيقي يستقبل رسائل من مصادر متعددة
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// إعداد قاعدة البيانات
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'chat_system'
};

// 1️⃣ استقبال رسائل من WhatsApp Business API
app.post('/webhook/whatsapp', async (req, res) => {
  try {
    const { from, message, timestamp } = req.body;
    
    // حفظ الرسالة في قاعدة البيانات
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'INSERT INTO messages (conversation_id, content, is_from_customer, sender_name, timestamp, source) VALUES (?, ?, ?, ?, ?, ?)',
      [1, message, true, from, timestamp, 'whatsapp']
    );
    await connection.end();
    
    // إرسال إشعار فوري للواجهة
    io.emit('new_message', {
      conversationId: 1,
      content: message,
      isFromCustomer: true,
      senderName: from,
      timestamp: timestamp,
      source: 'whatsapp'
    });
    
    console.log('📱 WhatsApp message received:', message);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ WhatsApp webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2️⃣ استقبال رسائل من البريد الإلكتروني
app.post('/webhook/email', async (req, res) => {
  try {
    const { from, subject, body, timestamp } = req.body;
    
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'INSERT INTO messages (conversation_id, content, is_from_customer, sender_name, timestamp, source) VALUES (?, ?, ?, ?, ?, ?)',
      [2, `${subject}\n\n${body}`, true, from, timestamp, 'email']
    );
    await connection.end();
    
    io.emit('new_message', {
      conversationId: 2,
      content: `${subject}\n\n${body}`,
      isFromCustomer: true,
      senderName: from,
      timestamp: timestamp,
      source: 'email'
    });
    
    console.log('📧 Email received:', subject);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Email webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3️⃣ استقبال رسائل من موقع الويب
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'INSERT INTO messages (conversation_id, content, is_from_customer, sender_name, timestamp, source) VALUES (?, ?, ?, ?, ?, ?)',
      [3, message, true, `${name} (${email})`, new Date().toISOString(), 'website']
    );
    await connection.end();
    
    io.emit('new_message', {
      conversationId: 3,
      content: message,
      isFromCustomer: true,
      senderName: `${name} (${email})`,
      timestamp: new Date().toISOString(),
      source: 'website'
    });
    
    console.log('🌐 Website contact form:', message);
    res.status(200).json({ success: true, message: 'تم إرسال رسالتك بنجاح' });
  } catch (error) {
    console.error('❌ Contact form error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4️⃣ استقبال رسائل من Telegram Bot
app.post('/webhook/telegram', async (req, res) => {
  try {
    const { message } = req.body;
    const { from, text, date } = message;
    
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'INSERT INTO messages (conversation_id, content, is_from_customer, sender_name, timestamp, source) VALUES (?, ?, ?, ?, ?, ?)',
      [4, text, true, `${from.first_name} ${from.last_name || ''}`, new Date(date * 1000).toISOString(), 'telegram']
    );
    await connection.end();
    
    io.emit('new_message', {
      conversationId: 4,
      content: text,
      isFromCustomer: true,
      senderName: `${from.first_name} ${from.last_name || ''}`,
      timestamp: new Date(date * 1000).toISOString(),
      source: 'telegram'
    });
    
    console.log('📱 Telegram message:', text);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Telegram webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5️⃣ إرسال الرسائل للعملاء
app.post('/api/v1/conversations/:id/send', async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    
    // حفظ الرسالة في قاعدة البيانات
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'INSERT INTO messages (conversation_id, content, is_from_customer, sender_name, timestamp) VALUES (?, ?, ?, ?, ?)',
      [id, message, false, 'Support Agent', new Date().toISOString()]
    );
    await connection.end();
    
    // إرسال إشعار للواجهة
    io.emit('new_message', {
      conversationId: parseInt(id),
      content: message,
      isFromCustomer: false,
      senderName: 'Support Agent',
      timestamp: new Date().toISOString()
    });
    
    // هنا يمكنك إرسال الرسالة للعميل عبر القناة المناسبة
    // مثال: إرسال عبر WhatsApp، البريد الإلكتروني، إلخ
    
    console.log('📤 Message sent to customer:', message);
    res.json({ success: true, messageId: result.insertId });
  } catch (error) {
    console.error('❌ Send message error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Socket.IO للتحديث الفوري
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`🏠 Client joined conversation: ${conversationId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Real server running on port ${PORT}`);
  console.log(`📱 WhatsApp webhook: http://localhost:${PORT}/webhook/whatsapp`);
  console.log(`📧 Email webhook: http://localhost:${PORT}/webhook/email`);
  console.log(`🌐 Contact form: http://localhost:${PORT}/api/contact`);
  console.log(`📱 Telegram webhook: http://localhost:${PORT}/webhook/telegram`);
});
