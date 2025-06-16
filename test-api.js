// Simple API test script
// Run with: node test-api.js

const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAPI() {
  console.log('Testing Money Tracker API...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connection...');
    const serverTest = await makeRequest({
      hostname: 'localhost',
      port: 4040,
      path: '/',
      method: 'GET'
    });
    console.log(`   Status: ${serverTest.status}`);
    console.log(`   Response: ${serverTest.data}\n`);

    // Test 2: Test API endpoint
    console.log('2. Testing /api/test endpoint...');
    const apiTest = await makeRequest({
      hostname: 'localhost',
      port: 4040,
      path: '/api/test',
      method: 'GET'
    });
    console.log(`   Status: ${apiTest.status}`);
    console.log(`   Response: ${JSON.stringify(apiTest.data)}\n`);

    // Test 3: Get transactions
    console.log('3. Testing GET /api/transactions...');
    const getTransactions = await makeRequest({
      hostname: 'localhost',
      port: 4040,
      path: '/api/transactions',
      method: 'GET'
    });
    console.log(`   Status: ${getTransactions.status}`);
    console.log(`   Transactions count: ${getTransactions.data.length}\n`);

    // Test 4: Create a test transaction
    console.log('4. Testing POST /api/transaction...');
    const testTransaction = {
      name: 'Test Transaction',
      description: 'API Test',
      datetime: new Date().toISOString(),
      price: 100
    };

    const createTransaction = await makeRequest({
      hostname: 'localhost',
      port: 4040,
      path: '/api/transaction',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, testTransaction);

    console.log(`   Status: ${createTransaction.status}`);
    if (createTransaction.status === 200) {
      console.log(`   Created transaction: ${createTransaction.data.name}`);
    } else {
      console.log(`   Error: ${JSON.stringify(createTransaction.data)}`);
    }

    console.log('\nAPI tests completed!');

  } catch (error) {
    console.error('Error testing API:', error.message);
    console.log('\nMake sure the API server is running: npm run start-api');
  }
}

testAPI();
