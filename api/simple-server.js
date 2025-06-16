const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// In-memory storage
let transactions = [
  {
    _id: '1',
    name: 'Salary',
    description: 'Monthly salary',
    datetime: new Date('2024-01-15'),
    price: 3000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '2',
    name: 'Groceries',
    description: 'Weekly grocery shopping',
    datetime: new Date('2024-01-10'),
    price: -150,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '3',
    name: 'Coffee',
    description: 'Morning coffee',
    datetime: new Date('2024-01-08'),
    price: -5,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Helper function to generate ID
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

app.get('/', (req, res) => {
  res.send('Simple Money Tracker API is running!');
});

app.get('/api/test', (req, res) => {
  res.json({
    message: 'Test ok',
    timestamp: new Date().toISOString(),
    storage: 'in-memory'
  });
});

// Get all transactions
app.get('/api/transactions', (req, res) => {
  console.log('GET /api/transactions - returning', transactions.length, 'transactions');
  res.json(transactions);
});

// Create a new transaction
app.post('/api/transaction', (req, res) => {
  try {
    const { name, description, datetime, price } = req.body;
    
    console.log('POST /api/transaction - received:', { name, description, datetime, price });
    
    // Validate required fields
    if (!name || !description || !datetime || price === undefined || price === null) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['name', 'description', 'datetime', 'price'],
        received: { name, description, datetime, price }
      });
    }

    // Convert price to number
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) {
      return res.status(400).json({ 
        error: 'Price must be a valid number', 
        received: price 
      });
    }
    
    const transaction = {
      _id: generateId(),
      name,
      description,
      datetime,
      price: numericPrice,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    transactions.push(transaction);
    console.log('Transaction created successfully:', transaction);
    res.json(transaction);
    
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction', details: error.message });
  }
});

// Delete a transaction
app.delete('/api/transaction/:id', (req, res) => {
  try {
    const { id } = req.params;
    console.log('DELETE request received for transaction ID:', id);
    console.log('Current transactions:', transactions.map(t => ({ id: t._id, name: t.name })));

    if (!id) {
      console.log('No ID provided in request');
      return res.status(400).json({
        error: 'Transaction ID is required'
      });
    }

    console.log('Looking for transaction with ID:', id);

    const transactionIndex = transactions.findIndex(t => {
      console.log('Comparing:', t._id, 'with', id, 'Match:', t._id === id);
      return t._id === id;
    });

    console.log('Transaction index found:', transactionIndex);

    if (transactionIndex === -1) {
      console.log('Transaction not found');
      return res.status(404).json({
        error: 'Transaction not found'
      });
    }

    const deletedTransaction = transactions.splice(transactionIndex, 1)[0];
    console.log('Transaction deleted successfully:', deletedTransaction);
    console.log('Remaining transactions:', transactions.length);

    res.json({
      message: 'Transaction deleted successfully',
      deletedTransaction
    });

  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({
      error: 'Failed to delete transaction',
      details: error.message
    });
  }
});

const server = app.listen(4040, () => {
  console.log('Simple Money Tracker API is running on http://localhost:4040');
  console.log('Using in-memory storage with', transactions.length, 'sample transactions');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('Port 4040 is already in use. Trying port 4041...');
    server.listen(4041, () => {
      console.log('Simple Money Tracker API is running on http://localhost:4041');
    });
  } else {
    console.error('Server error:', err);
  }
});

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    process.exit(0);
  });
});
