const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/v1/admin/plans/plans',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWU4b25lN2kwMDAydWY2czV2ajFncHYwIiwiZW1haWwiOiJzdXBlcmFkbWluQHN5c3RlbS5jb20iLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJjb21wYW55SWQiOiJjbWU4b25ka3owMDAwdWY2czVneTI4aTE3IiwiaWF0IjoxNzU1MDExNzI3LCJleHAiOjE3NTUwOTgxMjd9.JGIrMvMHcNWbFxFJvpI22ZBlCyFWE3dm6W0W0wU_YOk'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('✅ API Response:');
    try {
      const jsonData = JSON.parse(data);
      console.log('📊 Plans Data:');
      jsonData.data.forEach(plan => {
        console.log(`- ${plan.name}: ${plan.price} ${plan.currency}`);
      });
    } catch (error) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.end();
