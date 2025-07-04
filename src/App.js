import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';
import { BalanceCard } from './components/UI/BalancedCard';
import { TransactionForm } from './components/Transactions/transactionForm';
import { FinancialCharts } from './components/Charts/financialCharts';
import { ChartControls } from './components/Charts/chartControls';
import { SummaryCards } from './components/UI/SummaryCard';
import { TransactionList } from './components/Transactions/transactionList';
import { Modal } from './components/UI/Modal';
import { SavingsGoals } from './components/Savings/savingGoals';
import './App.css';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ 
    show: false, 
    transactionId: null, 
    transactionName: '' 
  });
  const [activeChart, setActiveChart] = useState('line');
  const [timeRange, setTimeRange] = useState('all');
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [showGoalForm, setShowGoalForm] = useState(false);

  useEffect(() => {
    getTransactions().then(setTransactions);
    loadSavingsGoals();
  }, []);

  useEffect(() => {
    saveSavingsGoals();
  }, [savingsGoals]);

  async function getTransactions() {
    try {
      const url = process.env.REACT_APP_API_URL + '/transactions';
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error in getTransactions:', error);
      return [];
    }
  }

  function loadSavingsGoals() {
    const savedGoals = localStorage.getItem('savingsGoals');
    if (savedGoals) {
      try {
        const parsedGoals = JSON.parse(savedGoals);
        if (Array.isArray(parsedGoals)) {
          setSavingsGoals(parsedGoals);
        }
      } catch (e) {
        console.error('Failed to parse saved goals', e);
      }
    }
  }

  function saveSavingsGoals() {
    if (savingsGoals.length > 0 || localStorage.getItem('savingsGoals')) {
      localStorage.setItem('savingsGoals', JSON.stringify(savingsGoals));
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    if (timeRange === 'all') return true;
    const transactionDate = new Date(transaction.datetime);
    const now = new Date();
    const diffDays = (now - transactionDate) / (1000 * 60 * 60 * 24);
    if (timeRange === 'month') return diffDays <= 30;
    if (timeRange === 'week') return diffDays <= 7;
    return true;
  });

  const prepareChartData = () => {
    const categoryMap = {};
    filteredTransactions.forEach(transaction => {
      const category = transaction.description || 'Uncategorized';
      categoryMap[category] = (categoryMap[category] || 0) + transaction.price;
    });
    return Object.keys(categoryMap).map(category => ({
      name: category,
      value: Math.abs(categoryMap[category]),
      type: categoryMap[category] > 0 ? 'Income' : 'Expense',
      color: categoryMap[category] > 0 ? '#4CAF50' : '#F44336'
    }));
  };

  const chartData = prepareChartData();
  const sortedChartData = [...chartData].sort((a, b) => b.value - a.value).slice(0, 8);

  const prepareDailyBalanceData = () => {
    const dailyBalance = {};
    let runningBalance = 0;
    const sortedTransactions = [...filteredTransactions].sort((a, b) => 
      new Date(a.datetime) - new Date(b.datetime)
    );

    sortedTransactions.forEach(transaction => {
      const date = new Date(transaction.datetime).toLocaleDateString();
      runningBalance += transaction.price;
      dailyBalance[date] = runningBalance;
    });

    return Object.keys(dailyBalance).map(date => ({
      date,
      balance: dailyBalance[date]
    }));
  };

  const dailyBalanceData = prepareDailyBalanceData();

  const incomeTotal = filteredTransactions
    .filter(t => t.price > 0)
    .reduce((sum, t) => sum + t.price, 0)
    .toFixed(2);

  const expenseTotal = filteredTransactions
    .filter(t => t.price < 0)
    .reduce((sum, t) => sum + t.price, 0)
    .toFixed(2);

  const savingsTotal = savingsGoals
    .reduce((sum, goal) => sum + goal.currentAmount, 0)
    .toFixed(2);

  let balance = 0;
  if (Array.isArray(transactions)) {
    balance = transactions.reduce((sum, t) => sum + t.price, 0);
  }
  const [dollars, cents] = balance.toFixed(2).split('.');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteClick = (transaction) => {
    setDeleteModal({
      show: true,
      transactionId: transaction._id,
      transactionName: transaction.name
    });
  };

  const confirmDelete = async () => {
    if (deleteModal.transactionId) {
      setIsLoading(true);
      try {
        const url = process.env.REACT_APP_API_URL + `/transaction/${deleteModal.transactionId}`;
        const response = await fetch(url, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error('Failed to delete transaction');

        const updatedTransactions = await getTransactions();
        setTransactions(updatedTransactions);
        setDeleteModal({ show: false, transactionId: null, transactionName: '' });
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert(`Failed to delete transaction: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ show: false, transactionId: null, transactionName: '' });
  };

  const handleAddFunds = async (goalId) => {
  const amountInput = document.getElementById(`add-${goalId}`);
  const amount = parseFloat(amountInput.value);

   if (isNaN(amount) || amount <= 0) {
    alert('Please enter a valid amount greater than 0');
    return;
  }

    setIsLoading(true);
    try {
      // Create a transaction for the deduction
      const transactionUrl = process.env.REACT_APP_API_URL + '/transaction';
      const transactionResponse = await fetch(transactionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Savings: ${savingsGoals.find(g => g.id === goalId).name}`,
          description: 'Savings transfer',
          datetime: new Date().toISOString(),
          price: -amount,
        }),
      });

      if (!transactionResponse.ok) {
        throw new Error('Failed to create transaction');
      }

      setSavingsGoals(savingsGoals.map(goal => 
        goal.id === goalId 
          ? { ...goal, currentAmount: goal.currentAmount + amount }
          : goal
      ));
      const updatedTransactions = await getTransactions();
      setTransactions(updatedTransactions);
      amountInput.value = '';    
    } catch (error) {
      console.error('Error adding funds:', error);
      alert(`Failed to add funds: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar transactionCount={transactions.length} goalCount={savingsGoals.length} />
      
      <main>
        <div className="hero-section">
          <div className="app-title">
            <h1 className="project-name">Money Tracker</h1>
            <p className="app-subtitle">Take control of your finances with our modern, intuitive expense tracking platform</p>
          </div>
        </div>

        <div className="dashboard-grid">
          <BalanceCard dollars={dollars} cents={cents} />
          <TransactionForm 
            onSubmit={addNewTransaction} 
            isLoading={isLoading} 
            setTransactions={setTransactions}
            setIsLoading={setIsLoading}
          />
        </div>

        <div className="data-visualization-section">
          <h2 className="section-title">Financial Insights</h2>
          
          <ChartControls 
            timeRange={timeRange} 
            setTimeRange={setTimeRange}
            activeChart={activeChart}
            setActiveChart={setActiveChart}
          />
          
          <SummaryCards 
            incomeTotal={incomeTotal}
            expenseTotal={expenseTotal}
            savingsTotal={savingsTotal}
          />

          <FinancialCharts 
            activeChart={activeChart}
            dailyBalanceData={dailyBalanceData}
            sortedChartData={sortedChartData}
          />
        </div>

        <TransactionList 
          transactions={transactions}
          onDeleteClick={handleDeleteClick}
          formatDate={formatDate}
        />

        {deleteModal.show && (
          <Modal 
            title="Delete Transaction"
            message={`Are you sure you want to delete the transaction "${deleteModal.transactionName}"?`}
            onCancel={cancelDelete}
            onConfirm={confirmDelete}
          />
        )}

        <SavingsGoals 
          savingsGoals={savingsGoals}
          setSavingsGoals={setSavingsGoals}
          showGoalForm={showGoalForm}
          setShowGoalForm={setShowGoalForm}
          handleAddFunds={handleAddFunds}
          getTransactions={getTransactions}
          setTransactions={setTransactions}
          setIsLoading={setIsLoading}
        />
      </main>

      <Footer />
    </div>
  );

  async function addNewTransaction(transactionData) {
    const { name, datetime, description } = transactionData;
    
    if (!name.trim()) {
      alert('Please enter a transaction (e.g., "+200 groceries" or "-50 coffee")');
      return;
    }

    if (!description.trim()) {
      alert('Please enter a description');
      return;
    }

    if (!datetime) {
      alert('Please select a date and time');
      return;
    }

    setIsLoading(true);
    const parts = name.trim().split(' ');
    const price = parseFloat(parts[0]);
    const itemName = parts.slice(1).join(' ');

    if (isNaN(price)) {
      alert('Please start with a valid number (e.g., "+200 groceries" or "-50 coffee")');
      setIsLoading(false);
      return;
    }

    if (!itemName.trim()) {
      alert('Please include a name after the amount (e.g., "+200 groceries")');
      setIsLoading(false);
      return;
    }

    try {
      const url = process.env.REACT_APP_API_URL + '/transaction';
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: itemName,
          description,
          datetime,
          price,
        }),
      });

      if (!response.ok) throw new Error('Failed to create transaction');

      const updatedTransactions = await getTransactions();
      setTransactions(updatedTransactions);
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert(`Failed to create transaction: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }
}

export default App;