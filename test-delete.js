const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsedBody = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            data: parsedBody
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testDelete() {
  try {
    console.log('Testing delete functionality...\n');

    // First, get all transactions to see what IDs exist
    console.log('1. Getting all transactions...');
    const getTransactions = await makeRequest({
      hostname: 'localhost',
      port: 4040,
      path: '/api/transactions',
      method: 'GET'
    });

    console.log(`   Status: ${getTransactions.status}`);
    if (getTransactions.status === 200) {
      console.log(`   Found ${getTransactions.data.length} transactions:`);
      getTransactions.data.forEach((t, index) => {
        console.log(`     ${index + 1}. ID: ${t._id}, Name: ${t.name}`);
      });

      if (getTransactions.data.length > 0) {
        const firstTransaction = getTransactions.data[0];
        console.log(`\n2. Attempting to delete transaction: ${firstTransaction.name} (ID: ${firstTransaction._id})`);
        
        const deleteResult = await makeRequest({
          hostname: 'localhost',
          port: 4040,
          path: `/api/transaction/${firstTransaction._id}`,
          method: 'DELETE'
        });

        console.log(`   Delete Status: ${deleteResult.status}`);
        console.log(`   Delete Response:`, deleteResult.data);

        // Check transactions again
        console.log('\n3. Getting transactions after delete...');
        const afterDelete = await makeRequest({
          hostname: 'localhost',
          port: 4040,
          path: '/api/transactions',
          method: 'GET'
        });

        console.log(`   Status: ${afterDelete.status}`);
        console.log(`   Remaining transactions: ${afterDelete.data.length}`);
      } else {
        console.log('   No transactions found to delete');
      }
    } else {
      console.log(`   Error: ${JSON.stringify(getTransactions.data)}`);
    }

    console.log('\nDelete test completed!');

  } catch (error) {
    console.error('Error testing delete:', error.message);
    console.log('\nMake sure the API server is running: npm run dev');
  }
}

testDelete();
