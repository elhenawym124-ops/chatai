const http = require('http');

function testAPI() {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/ai/sources',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      try {
        const parsed = JSON.parse(data);
        console.log('Parsed:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('Not JSON:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.end();
}

testAPI();
