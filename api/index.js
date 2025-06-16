const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const Transaction = require('./models/transactions.js');

const app = express();

app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
  res.send('Server is running. Use /api routes.');
});

// Connect to MongoDB once at startup
let isMongoConnected = false;
let memoryTransactions = []; // Fallback in-memory storage

// Configure mongoose for better error handling
mongoose.set('bufferCommands', false);

async function connectToMongoDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 3000, // Timeout after 3s instead of 30s
      socketTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });

    // Test the connection with a simple operation
    await mongoose.connection.db.admin().ping();
    console.log('MongoDB connected successfully');
    isMongoConnected = true;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.log('Please make sure MongoDB is running on localhost:27017');
    console.log('Falling back to in-memory storage for demo purposes');
    isMongoConnected = false;
    // Disconnect to prevent buffering
    try {
      await mongoose.disconnect();
    } catch (disconnectErr) {
      // Ignore disconnect errors
    }
  }
}

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  isMongoConnected = false;
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
  isMongoConnected = false;
});

// Initialize connection
connectToMongoDB();

// Helper function to generate ID for in-memory storage
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Function to check if MongoDB is actually connected
function isMongoActuallyConnected() {
  return mongoose.connection.readyState === 1 && isMongoConnected;
}

// Add some sample data to in-memory storage for demo
function initializeSampleData() {
  if (memoryTransactions.length === 0) {
    memoryTransactions.push(
      {
        _id: generateId(),
        name: 'Salary',
        description: 'Monthly salary',
        datetime: new Date('2024-01-15'),
        price: 3000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: generateId(),
        name: 'Groceries',
        description: 'Weekly grocery shopping',
        datetime: new Date('2024-01-10'),
        price: -150,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: generateId(),
        name: 'Coffee',
        description: 'Morning coffee',
        datetime: new Date('2024-01-08'),
        price: -5,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );
    console.log('Sample data initialized for demo');
  }
}

app.get('/api/test', (req, res) => {
  res.json({
    message: 'Test ok',
    mongoConnected: isMongoConnected,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Server running',
    mongoConnected: isMongoConnected,
    timestamp: new Date().toISOString()
  });
});

// Create a new transaction
app.post('/api/transaction', async (req, res) => {
  try {
    const { name, description, datetime, price } = req.body;

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

    if (isMongoActuallyConnected()) {
      // Use MongoDB
      const transaction = await Transaction.create({
        name,
        description,
        datetime,
        price: numericPrice
      });
      res.json(transaction);
    } else {
      // Use in-memory storage
      console.log('Using in-memory storage for transaction');
      const transaction = {
        _id: generateId(),
        name,
        description,
        datetime,
        price: numericPrice,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryTransactions.push(transaction);
      res.json(transaction);
    }
  } catch (error) {
    console.error('Error creating transaction:', error);
    // If MongoDB fails, fallback to in-memory storage
    if (error.name === 'MongooseError' || error.name === 'ValidationError') {
      try {
        const { name, description, datetime, price } = req.body;
        const numericPrice = parseFloat(price);
        const transaction = {
          _id: generateId(),
          name,
          description,
          datetime,
          price: numericPrice,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        memoryTransactions.push(transaction);
        console.log('Fallback to in-memory storage successful');
        res.json(transaction);
      } catch (fallbackError) {
        res.status(500).json({ error: 'Failed to create transaction', details: error.message });
      }
    } else {
      res.status(500).json({ error: 'Failed to create transaction', details: error.message });
    }
  }
});

// Get all transactions
app.get('/api/transactions', async (req, res) => {
  try {
    if (isMongoActuallyConnected()) {
      // Use MongoDB
      const transactions = await Transaction.find();
      res.json(transactions);
    } else {
      // Use in-memory storage
      console.log('Using in-memory storage for transactions');
      initializeSampleData(); // Initialize sample data if needed
      res.json(memoryTransactions);
    }
  } catch (error) {
    console.error('Error fetching transactions:', error);
    // Fallback to in-memory storage if MongoDB fails
    initializeSampleData();
    res.json(memoryTransactions);
  }
});

// Delete a transaction
app.delete('/api/transaction/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'Transaction ID is required'
      });
    }

    if (isMongoActuallyConnected()) {
      // Use MongoDB
      const deletedTransaction = await Transaction.findByIdAndDelete(id);
      if (!deletedTransaction) {
        return res.status(404).json({
          error: 'Transaction not found'
        });
      }
      res.json({
        message: 'Transaction deleted successfully',
        deletedTransaction
      });
    } else {
      // Use in-memory storage
      console.log('Using in-memory storage for deletion');
      const transactionIndex = memoryTransactions.findIndex(t => t._id === id);
      if (transactionIndex === -1) {
        return res.status(404).json({
          error: 'Transaction not found'
        });
      }
      const deletedTransaction = memoryTransactions.splice(transactionIndex, 1)[0];
      res.json({
        message: 'Transaction deleted successfully',
        deletedTransaction
      });
    }
  } catch (error) {
    console.error('Error deleting transaction:', error);
    // If MongoDB fails, try in-memory storage
    if (error.name === 'MongooseError' || error.name === 'CastError') {
      try {
        const { id } = req.params;
        const transactionIndex = memoryTransactions.findIndex(t => t._id === id);
        if (transactionIndex === -1) {
          return res.status(404).json({
            error: 'Transaction not found'
          });
        }
        const deletedTransaction = memoryTransactions.splice(transactionIndex, 1)[0];
        console.log('Fallback to in-memory storage for deletion successful');
        res.json({
          message: 'Transaction deleted successfully',
          deletedTransaction
        });
      } catch (fallbackError) {
        res.status(500).json({
          error: 'Failed to delete transaction',
          details: error.message
        });
      }
    } else {
      res.status(500).json({
        error: 'Failed to delete transaction',
        details: error.message
      });
    }
  }
});

app.listen(4040, () => {
  console.log('Server is running on http://localhost:4040');
});
