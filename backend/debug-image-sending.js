const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

async function debugImageSending() {
  console.log('🔍 Debugging Image Sending Issue...\n');
  
  try {
    // 1. فحص إعدادات Facebook Page
    console.log('📋 Step 1: Checking Facebook Page settings...');
    const activePage = await prisma.facebookPage.findFirst({
      where: { status: 'connected' },
      orderBy: { connectedAt: 'desc' }
    });
    
    if (!activePage) {
      console.log('❌ No active Facebook page found');
      return;
    }
    
    console.log('✅ Active page found:', {
      pageName: activePage.pageName,
      pageId: activePage.pageId,
      hasToken: !!activePage.pageAccessToken,
      tokenLength: activePage.pageAccessToken?.length || 0
    });
    
    // 2. اختبار إرسال رسالة نصية
    console.log('\n📝 Step 2: Testing text message...');
    const textResult = await testSendMessage(
      activePage.pageId,
      '7801113803290451', // العميل الحقيقي من logs
      'اختبار رسالة نصية',
      activePage.pageAccessToken,
      'TEXT'
    );
    
    if (textResult.success) {
      console.log('✅ Text message sent successfully');
    } else {
      console.log('❌ Text message failed:', textResult.error);
    }
    
    // 3. اختبار إرسال صورة
    console.log('\n🖼️ Step 3: Testing image message...');
    const imageUrl = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop';
    
    const imageResult = await testSendMessage(
      activePage.pageId,
      '7801113803290451',
      imageUrl,
      activePage.pageAccessToken,
      'IMAGE'
    );
    
    if (imageResult.success) {
      console.log('✅ Image message sent successfully');
    } else {
      console.log('❌ Image message failed:', imageResult.error);
    }
    
    // 4. فحص صلاحيات Page
    console.log('\n🔐 Step 4: Checking page permissions...');
    const permissionsResult = await checkPagePermissions(activePage.pageAccessToken);
    console.log('Page permissions:', permissionsResult);
    
    // 5. فحص معلومات Page
    console.log('\n📊 Step 5: Checking page info...');
    const pageInfoResult = await getPageInfo(activePage.pageAccessToken);
    console.log('Page info:', pageInfoResult);
    
    // 6. اختبار مع Graph API مباشرة
    console.log('\n🌐 Step 6: Testing with Graph API directly...');
    const directResult = await testDirectGraphAPI(
      activePage.pageId,
      '7801113803290451',
      imageUrl,
      activePage.pageAccessToken
    );
    
    console.log('\n📋 Debug Summary:');
    console.log('================');
    console.log('Text message:', textResult.success ? '✅ Success' : '❌ Failed');
    console.log('Image message:', imageResult.success ? '✅ Success' : '❌ Failed');
    console.log('Page permissions:', permissionsResult.success ? '✅ Valid' : '❌ Invalid');
    console.log('Direct API test:', directResult.success ? '✅ Success' : '❌ Failed');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function testSendMessage(pageId, recipientId, message, pageAccessToken, messageType) {
  try {
    const messageData = {
      recipient: { id: recipientId },
      message: {}
    };
    
    if (messageType === 'TEXT') {
      messageData.message.text = message;
    } else if (messageType === 'IMAGE') {
      messageData.message.attachment = {
        type: 'image',
        payload: { url: message }
      };
    }
    
    console.log('📤 Sending message data:', JSON.stringify(messageData, null, 2));
    
    const response = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${pageAccessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData)
    });
    
    const responseText = await response.text();
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      return { success: true, data, messageId: data.message_id };
    } else {
      return { success: false, error: responseText, status: response.status };
    }
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function checkPagePermissions(pageAccessToken) {
  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/me/permissions?access_token=${pageAccessToken}`);
    const data = await response.json();
    
    if (response.ok) {
      return { success: true, permissions: data.data };
    } else {
      return { success: false, error: data };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getPageInfo(pageAccessToken) {
  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${pageAccessToken}`);
    const data = await response.json();
    
    if (response.ok) {
      return { success: true, info: data };
    } else {
      return { success: false, error: data };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testDirectGraphAPI(pageId, recipientId, imageUrl, pageAccessToken) {
  try {
    const messageData = {
      recipient: { id: recipientId },
      message: {
        attachment: {
          type: 'image',
          payload: { url: imageUrl }
        }
      }
    };
    
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${pageId}/messages`,
      messageData,
      {
        params: { access_token: pageAccessToken },
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

debugImageSending();
