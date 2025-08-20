const axios = require('axios');

async function testFacebookToken() {
  const accessToken = 'EAAUpPO0SIEABPHgK38b6AfeIgIBaG7BE6ZBkFqzqDrGHtL9ANYVgtiEozqnZAEgjo7TEwYy6ig5o8PZASPB0Hkq1QbT9Bx6Ks9dOErXIWFvKN7l8YO1ahcWurqNiIxmAfPSpqkYXjPsEasroQnml4mVVx6ER1sEmmkV2ZCZBnaXm6g2vAOCIy636LpAXMph4jXjSzGOB1pBz8FsZAdDqMWfMZBe';
  
  console.log('🧪 Testing Facebook Access Token...');
  console.log('🔑 Token length:', accessToken.length);
  console.log('🔑 Token preview:', accessToken.substring(0, 30) + '...');
  
  try {
    // Test with Facebook Graph API
    const response = await axios.get(`https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,category,about,verification_status`);
    
    console.log('✅ Facebook API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Test permissions
    try {
      const permissionsResponse = await axios.get(`https://graph.facebook.com/me/permissions?access_token=${accessToken}`);
      console.log('🔐 Permissions:');
      console.log(JSON.stringify(permissionsResponse.data, null, 2));
    } catch (permError) {
      console.log('⚠️ Could not fetch permissions:', permError.response?.data || permError.message);
    }
    
  } catch (error) {
    console.error('❌ Facebook API Error:');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Message:', error.message);
  }
}

testFacebookToken();
