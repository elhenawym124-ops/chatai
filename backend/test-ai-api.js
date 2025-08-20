const http = require('http');

// Test AI status endpoint
function testAIStatus(conversationId) {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: `/api/v1/conversations/${conversationId}/ai-status`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
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
      testToggleAI(conversationId, false);
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error:', error);
  });

  req.end();
}

// Test AI toggle endpoint
function testToggleAI(conversationId, aiEnabled) {
  const postData = JSON.stringify({ aiEnabled });
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: `/api/v1/conversations/${conversationId}/ai-toggle`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
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
        setTimeout(() => testToggleAI(conversationId, true), 1000);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error:', error);
  });

  req.write(postData);
  req.end();
}

// Start test
console.log('🧪 Testing AI Control API...');
testAIStatus('cmehrqu48009ruff8ec01mk8p');
