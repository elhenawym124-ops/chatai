const http = require('http');

// You need to get a valid JWT token from login first
// For testing, you can get it from browser dev tools after logging in
const AUTH_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token

// Test AI status endpoint with authentication
function testAIStatusWithAuth(conversationId) {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: `/api/v1/conversations/${conversationId}/ai-status`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('✅ AI Status Response:');
      console.log(JSON.stringify(JSON.parse(data), null, 2));
      
      // Test toggle AI
      testToggleAIWithAuth(conversationId, false);
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error:', error);
  });

  req.end();
}

// Test AI toggle endpoint with authentication
function testToggleAIWithAuth(conversationId, aiEnabled) {
  const postData = JSON.stringify({ aiEnabled });
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: `/api/v1/conversations/${conversationId}/ai-toggle`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Authorization': `Bearer ${AUTH_TOKEN}`
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`✅ AI Toggle Response (${aiEnabled ? 'Enable' : 'Disable'}):`);
      console.log(JSON.stringify(JSON.parse(data), null, 2));
      
      if (!aiEnabled) {
        // Test enabling it back
        setTimeout(() => testToggleAIWithAuth(conversationId, true), 1000);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error:', error);
  });

  req.write(postData);
  req.end();
}

// Check if token is provided
if (AUTH_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
  console.log('❌ Please replace AUTH_TOKEN with a valid JWT token');
  console.log('💡 You can get it from browser dev tools after logging in');
  console.log('💡 Look for Authorization header in Network tab');
  process.exit(1);
}

// Start test
console.log('🧪 Testing AI Control API with Authentication...');
testAIStatusWithAuth('cmehrqu48009ruff8ec01mk8p');
