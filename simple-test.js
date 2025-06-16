// Simple test to verify API is working
const http = require('http');

function testAPI() {
  console.log('Testing API...');
  
  // Test GET /api/transactions
  const options = {
    hostname: 'localhost',
    port: 4041,
    path: '/api/transactions',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Response:', data);
      
      if (res.statusCode === 200) {
        try {
          const transactions = JSON.parse(data);
          console.log('✅ API is working! Found', transactions.length, 'transactions');
          console.log('Sample transaction:', transactions[0]);
        } catch (e) {
          console.log('❌ Invalid JSON response');
        }
      } else {
        console.log('❌ API returned error status');
      }
    });
  });

  req.on('error', (err) => {
    console.log('❌ Error connecting to API:', err.message);
    console.log('Make sure the API server is running: node api/index.js');
  });

  req.end();
}

testAPI();
