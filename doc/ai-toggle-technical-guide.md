# دليل المطور التقني - ميزة تشغيل/إيقاف AI

## هيكل الملفات المُعدلة

### Backend Files
```
backend/
├── server.js                     # إضافة endpoint وlogic التحقق
├── src/
│   └── routes/
│       └── conversations.js      # AI toggle route
```

### Frontend Files
```
frontend/
├── src/
│   ├── components/
│   │   └── AIToggleButton.jsx    # مكون زر التبديل
│   └── pages/
│       └── ConversationPage.jsx  # دمج الزر في واجهة المحادثة
```

## تفاصيل التنفيذ

### 1. Backend Implementation

#### API Route Handler
```javascript
// في server.js
app.patch('/api/v1/conversations/:conversationId/ai-toggle', 
  authenticateToken, 
  async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { aiEnabled } = req.body;
      const userId = req.user.id;
      const companyId = req.user.companyId;

      console.log(`🎯 [AI-TOGGLE-ROUTE] Route hit! Params:`, req.params, 'Body:', req.body, 'User:', userId);

      // التحقق من وجود المحادثة والصلاحيات
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          companyId: companyId
        },
        include: {
          customer: true
        }
      });

      if (!conversation) {
        return res.status(404).json({ 
          success: false, 
          error: 'Conversation not found' 
        });
      }

      console.log(`🤖 [AI-TOGGLE] Toggling AI for conversation ${conversationId} to ${aiEnabled} (Company: ${companyId})`);

      // تحديث حالة AI في metadata
      const currentMetadata = conversation.metadata || {};
      const updatedMetadata = {
        ...currentMetadata,
        aiEnabled: aiEnabled
      };

      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          metadata: updatedMetadata
        }
      });

      console.log(`✅ [AI-TOGGLE] AI ${aiEnabled ? 'enabled' : 'disabled'} for conversation ${conversationId}`);
      console.log(`👤 [AI-TOGGLE] Customer: ${conversation.customer.facebookId}`);

      res.json({
        success: true,
        conversationId,
        aiEnabled,
        customerId: conversation.customer.facebookId
      });

    } catch (error) {
      console.error('❌ [AI-TOGGLE] Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  }
);
```

#### Webhook Message Processing
```javascript
// في handleFacebookMessage function
async function handleFacebookMessage(conversation, messageData) {
  // ... كود حفظ الرسالة

  // التحقق من حالة AI
  console.log('🔍 Checking AI status for conversation:', conversation.id);
  try {
    const conversationRecord = await prisma.conversation.findUnique({
      where: { id: conversation.id },
      select: { metadata: true }
    });
    
    // تحليل metadata للحصول على aiEnabled
    let aiEnabled = true; // Default to true
    if (conversationRecord?.metadata) {
      try {
        const metadata = typeof conversationRecord.metadata === 'string' 
          ? JSON.parse(conversationRecord.metadata) 
          : conversationRecord.metadata;
        aiEnabled = metadata.aiEnabled ?? true;
      } catch (parseError) {
        console.error('❌ Error parsing conversation metadata:', parseError);
        aiEnabled = true; // Default to true if parsing fails
      }
    }
    
    console.log('🤖 AI Status for conversation:', aiEnabled ? 'ENABLED' : 'DISABLED');
    
    if (!aiEnabled) {
      console.log('⏸️ AI is disabled for this conversation - skipping AI processing');
      console.log('📝 [AI-DISABLED] Message saved but no AI response will be generated');
      return; // Exit early without AI processing
    }
  } catch (error) {
    console.error('❌ Error checking AI status:', error);
    // Continue with AI processing if check fails (fail-safe)
  }

  // معالجة AI العادية
  console.log('🤖 Processing message with AI Agent...');
  // ... باقي كود معالجة AI
}
```

### 2. Frontend Implementation

#### AI Toggle Button Component
```jsx
// AIToggleButton.jsx
import React, { useState } from 'react';
import './AIToggleButton.css';

const AIToggleButton = ({ conversationId, initialAiEnabled, onToggle }) => {
  const [aiEnabled, setAiEnabled] = useState(initialAiEnabled);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/conversations/${conversationId}/ai-toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ aiEnabled: !aiEnabled })
      });

      if (response.ok) {
        const result = await response.json();
        setAiEnabled(result.aiEnabled);
        if (onToggle) {
          onToggle(result.aiEnabled);
        }
      } else {
        console.error('Failed to toggle AI status');
      }
    } catch (error) {
      console.error('Error toggling AI:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`ai-toggle-btn ${aiEnabled ? 'enabled' : 'disabled'} ${isLoading ? 'loading' : ''}`}
      title={aiEnabled ? 'إيقاف الذكاء الاصطناعي' : 'تشغيل الذكاء الاصطناعي'}
    >
      <span className="ai-toggle-icon">
        {aiEnabled ? '🤖' : '⏸️'}
      </span>
      <span className="ai-toggle-text">
        {isLoading ? 'جاري التحديث...' : (aiEnabled ? 'AI مُفعل' : 'AI مُعطل')}
      </span>
    </button>
  );
};

export default AIToggleButton;
```

#### CSS Styling
```css
/* AIToggleButton.css */
.ai-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
  justify-content: center;
}

.ai-toggle-btn.enabled {
  background-color: #10b981;
  color: white;
}

.ai-toggle-btn.enabled:hover {
  background-color: #059669;
}

.ai-toggle-btn.disabled {
  background-color: #ef4444;
  color: white;
}

.ai-toggle-btn.disabled:hover {
  background-color: #dc2626;
}

.ai-toggle-btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.ai-toggle-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.ai-toggle-icon {
  font-size: 16px;
}

.ai-toggle-text {
  font-size: 13px;
}
```

### 3. Database Schema

#### Conversation Table
```sql
-- الجدول الموجود مع إضافة استخدام metadata
CREATE TABLE Conversation (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  customerId VARCHAR(191) NOT NULL,
  assignedUserId VARCHAR(191),
  channel VARCHAR(191) NOT NULL DEFAULT 'FACEBOOK',
  status VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
  subject VARCHAR(191),
  priority VARCHAR(191) NOT NULL DEFAULT 'MEDIUM',
  tags TEXT,
  lastMessageAt DATETIME(3),
  lastMessagePreview TEXT,
  isRead BOOLEAN NOT NULL DEFAULT false,
  metadata JSON, -- يحتوي على { "aiEnabled": true/false }
  companyId VARCHAR(191) NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL
);
```

#### Metadata Structure
```json
{
  "aiEnabled": true,
  "lastAiToggle": "2025-08-20T19:32:15.123Z",
  "toggledBy": "user_id",
  "customSettings": {
    "autoReply": true,
    "priority": "high"
  }
}
```

## Error Handling

### Backend Error Scenarios
```javascript
// معالجة الأخطاء المختلفة
try {
  // ... كود التحديث
} catch (error) {
  if (error.code === 'P2025') {
    // Record not found
    return res.status(404).json({ error: 'Conversation not found' });
  } else if (error.code === 'P2002') {
    // Unique constraint violation
    return res.status(409).json({ error: 'Conflict in data' });
  } else {
    // General error
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

### Frontend Error Handling
```jsx
const handleToggle = async () => {
  try {
    // ... كود التبديل
  } catch (error) {
    // عرض رسالة خطأ للمستخدم
    setError('فشل في تحديث حالة الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.');
    
    // إعادة الحالة السابقة
    setAiEnabled(prevState => !prevState);
  }
};
```

## Performance Considerations

### Database Optimization
```sql
-- إضافة فهرس لتحسين أداء الاستعلامات
CREATE INDEX idx_conversation_metadata_ai ON Conversation 
USING GIN ((metadata->>'$.aiEnabled'));

-- استعلام محسن للتحقق من حالة AI
SELECT metadata->>'$.aiEnabled' as aiEnabled 
FROM Conversation 
WHERE id = ? AND companyId = ?;
```

### Caching Strategy
```javascript
// تخزين مؤقت لحالة AI
const aiStatusCache = new Map();

async function getAIStatus(conversationId) {
  // التحقق من الذاكرة المؤقتة أولاً
  if (aiStatusCache.has(conversationId)) {
    const cached = aiStatusCache.get(conversationId);
    if (Date.now() - cached.timestamp < 60000) { // 1 minute cache
      return cached.aiEnabled;
    }
  }
  
  // جلب من قاعدة البيانات
  const result = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { metadata: true }
  });
  
  const aiEnabled = result?.metadata?.aiEnabled ?? true;
  
  // حفظ في الذاكرة المؤقتة
  aiStatusCache.set(conversationId, {
    aiEnabled,
    timestamp: Date.now()
  });
  
  return aiEnabled;
}
```

## Testing

### Unit Tests
```javascript
// اختبار API endpoint
describe('AI Toggle API', () => {
  test('should toggle AI status successfully', async () => {
    const response = await request(app)
      .patch('/api/v1/conversations/test-id/ai-toggle')
      .send({ aiEnabled: false })
      .set('Authorization', `Bearer ${validToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.aiEnabled).toBe(false);
  });
  
  test('should return 404 for non-existent conversation', async () => {
    const response = await request(app)
      .patch('/api/v1/conversations/invalid-id/ai-toggle')
      .send({ aiEnabled: false })
      .set('Authorization', `Bearer ${validToken}`);
    
    expect(response.status).toBe(404);
  });
});
```

### Integration Tests
```javascript
// اختبار تكامل مع webhook
describe('Webhook AI Processing', () => {
  test('should skip AI when disabled', async () => {
    // إعداد محادثة مع AI معطل
    await setupConversationWithAIDisabled();
    
    // إرسال رسالة webhook
    const webhookResponse = await sendTestWebhook();
    
    // التحقق من عدم إرسال رد AI
    expect(mockAIService.processMessage).not.toHaveBeenCalled();
  });
});
```

---

**آخر تحديث**: 2025-08-20  
**المطور**: فريق التطوير  
**الحالة**: مُطبق ومُختبر ✅
