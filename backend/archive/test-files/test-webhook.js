let totalMessages = 0;
let messagesFromTarget = 0;
const targetPageId = '351400718067673'; // Simple A42

// تحديث وقت البداية
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('startTime').textContent = new Date().toLocaleString('ar-SA');

    // إضافة event listeners للأزرار
    document.getElementById('refreshBtn').addEventListener('click', refreshData);
    document.getElementById('clearBtn').addEventListener('click', clearMessages);
    document.getElementById('testBtn').addEventListener('click', testConnection);

    // فحص الاتصال كل 5 ثوان
    setInterval(checkConnection, 5000);

    // تحديث البيانات كل 3 ثوان
    setInterval(fetchMessages, 3000);

    // بدء فحص الاتصال
    checkConnection();

    // محاكاة رسالة اختبار بعد 2 ثانية
    setTimeout(() => {
        addMessage('system', 'system', '📱 الصفحة جاهزة لاستقبال الرسائل من Simple A42', Date.now());
    }, 2000);
});

async function checkConnection() {
    try {
        const response = await fetch('/health');
        const status = document.getElementById('status');
        
        if (response.ok) {
            status.className = 'status connected';
            status.innerHTML = '🟢 متصل - الخادم يعمل بشكل طبيعي';
        } else {
            status.className = 'status disconnected';
            status.innerHTML = '🟡 مشكلة في الاتصال - كود الاستجابة: ' + response.status;
        }
    } catch (error) {
        const status = document.getElementById('status');
        status.className = 'status disconnected';
        status.innerHTML = '🔴 غير متصل - خطأ في الشبكة';
    }
}

async function fetchMessages() {
    try {
        const response = await fetch('/api/v1/test/recent-messages');
        const data = await response.json();
        
        if (data.success && data.messages.length > 0) {
            // مسح الرسائل القديمة
            const messagesContainer = document.getElementById('messages');
            messagesContainer.innerHTML = '';
            
            // إضافة الرسائل الجديدة
            data.messages.forEach(msg => {
                addMessageFromAPI(msg);
            });
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}

function addMessageFromAPI(msg) {
    const messagesContainer = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = msg.isFromTarget ? 'message new' : 'message';
    
    const time = new Date(msg.timestamp).toLocaleString('ar-SA');
    const pageInfo = msg.isFromTarget ? 'Simple A42 ✅' : `صفحة ${msg.pageId}`;
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <span class="page-info">${pageInfo}</span>
            <span class="timestamp">${time}</span>
        </div>
        <div class="message-content">
            <strong>من:</strong> ${msg.senderId}<br>
            <strong>المحتوى:</strong> ${msg.content || 'رسالة بدون نص'}
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    
    // تحديث الإحصائيات
    if (msg.isFromTarget) {
        messagesFromTarget++;
    }
    
    updateStats(time);
}

function addMessage(pageId, senderId, content, timestamp, isFromTarget = false) {
    const messagesContainer = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = isFromTarget ? 'message new' : 'message';
    
    const time = new Date(timestamp).toLocaleString('ar-SA');
    const pageInfo = isFromTarget ? 'Simple A42 ✅' : `صفحة ${pageId}`;
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <span class="page-info">${pageInfo}</span>
            <span class="timestamp">${time}</span>
        </div>
        <div class="message-content">
            <strong>من:</strong> ${senderId}<br>
            <strong>المحتوى:</strong> ${content || 'رسالة بدون نص'}
        </div>
    `;
    
    messagesContainer.insertBefore(messageDiv, messagesContainer.firstChild);
    
    // تحديث الإحصائيات
    totalMessages++;
    if (isFromTarget) {
        messagesFromTarget++;
    }
    
    updateStats(time);
    
    // إزالة الرسائل القديمة (الاحتفاظ بآخر 50 رسالة)
    const messages = messagesContainer.children;
    if (messages.length > 50) {
        messagesContainer.removeChild(messages[messages.length - 1]);
    }
}

function updateStats(lastTime) {
    document.getElementById('totalMessages').textContent = totalMessages;
    document.getElementById('messagesFromTarget').textContent = messagesFromTarget;
    document.getElementById('lastMessageTime').textContent = lastTime || '--';
}

function clearMessages() {
    const messagesContainer = document.getElementById('messages');
    messagesContainer.innerHTML = '';
    totalMessages = 0;
    messagesFromTarget = 0;
    updateStats();
    
    // إضافة رسالة البداية مرة أخرى
    addMessage('system', 'system', '🚀 تم مسح الرسائل... ابعث رسالة جديدة إلى صفحة Simple A42!', Date.now());
}

function refreshData() {
    location.reload();
}

async function testConnection(event) {
    const btn = event.target;
    btn.disabled = true;
    btn.textContent = '🔄 جاري الاختبار...';

    try {
        const response = await fetch('/api/v1/integrations/facebook/debug-db', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pageId: targetPageId })
        });

        const data = await response.json();

        if (data.success) {
            addMessage('system', 'system',
                `✅ اختبار الاتصال نجح!<br>
                 📄 الصفحة: ${data.data.facebookPage.pageName}<br>
                 🔗 الحالة: ${data.data.facebookPage.status}<br>
                 ⚡ Integration: ${data.data.integration ? 'موجود' : 'غير موجود'}`,
                Date.now());
        } else {
            addMessage('system', 'system', '❌ فشل اختبار الاتصال: ' + (data.error || 'خطأ غير معروف'), Date.now());
        }
    } catch (error) {
        addMessage('system', 'system', '❌ خطأ في اختبار الاتصال: ' + error.message, Date.now());
    }

    btn.disabled = false;
    btn.textContent = '🔍 اختبار الاتصال';
}
