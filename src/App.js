import './App.css';
import {useEffect,useState} from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

function App() {
  const[name,setName]=useState('');
  const[datetime,setDatetime]= useState('');
  const[description,setDescription]= useState('');
  const[transactions,setTransactions]= useState([]);
  const[isLoading,setIsLoading]= useState(false);
  const[deleteModal,setDeleteModal]= useState({ show: false, transactionId: null, transactionName: '' });
  const [activeChart, setActiveChart] = useState('line'); // 'pie', 'bar', 'line'
  const [timeRange, setTimeRange] = useState('all'); // 'all', 'month', 'week'

  const [savingsGoals, setSavingsGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    currentAmount: '0'
  });
  const [showGoalForm, setShowGoalForm] = useState(false);

  useEffect(()=>{
    getTransactions().then(transactions => {
      if (Array.isArray(transactions)) {
        setTransactions(transactions);
      } else {
        console.error('Transactions is not an array:', transactions);
        setTransactions([]);
      }
    }).catch(error => {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    });
  },[]);
  useEffect(() => {
    getTransactions().then(transactions => {
      if (Array.isArray(transactions)) {
        setTransactions(transactions);
      }
    });

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
}, []); 
 useEffect(() => {
  if (savingsGoals.length > 0 || localStorage.getItem('savingsGoals')) {
    localStorage.setItem('savingsGoals', JSON.stringify(savingsGoals));
  }
}, [savingsGoals]); 


  async function getTransactions(){
    try {
      const url = process.env.REACT_APP_API_URL + '/transactions';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in getTransactions:', error);
      return [];
    }
  }
  function addNewTransaction(ev){
    ev.preventDefault();

    // Validate inputs
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
    const url = process.env.REACT_APP_API_URL + '/transaction';
    const parts = name.trim().split(' ');
    const price = parseFloat(parts[0]); // +200 or -300
    const itemName = parts.slice(1).join(' ');

    // Validate price
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

    fetch(url,{
      method:'POST',
      headers: { 'Content-Type': 'application/json' },
      body:JSON.stringify({
        name: itemName,
        description,
        datetime,
        price,
      }),
    }).then(response=>{
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    }).then(json=>{
      setName('');
      setDatetime('');
      setDescription('');

      console.log('Transaction created successfully:', json);
      // Refresh transactions after adding new one
      getTransactions().then(transactions => {
        if (Array.isArray(transactions)) {
          setTransactions(transactions);
        }
      });
    }).catch(error => {
      console.error('Error creating transaction:', error);
      alert('Failed to create transaction. Please try again.');
    }).finally(() => {
      setIsLoading(false);
    });

  }

  // Delete transaction function
  async function deleteTransaction(transactionId) {
    try {
      const url = process.env.REACT_APP_API_URL + `/transaction/${transactionId}`;
      console.log('Attempting to delete transaction:', transactionId);
      console.log('Delete URL:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete response status:', response.status);
      console.log('Delete response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('Transaction deleted successfully:', result);

      // Refresh transactions after deletion
      const updatedTransactions = await getTransactions();
      if (Array.isArray(updatedTransactions)) {
        setTransactions(updatedTransactions);
      }

      return true;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert(`Failed to delete transaction: ${error.message}`);
      return false;
    }
  }

  // Handle delete confirmation
  function handleDeleteClick(transaction) {
    console.log('Delete clicked for transaction:', transaction);
    console.log('Transaction ID:', transaction._id);
    setDeleteModal({
      show: true,
      transactionId: transaction._id,
      transactionName: transaction.name
    });
  }

  // Confirm deletion
  async function confirmDelete() {
    if (deleteModal.transactionId) {
      const success = await deleteTransaction(deleteModal.transactionId);
      if (success) {
        setDeleteModal({ show: false, transactionId: null, transactionName: '' });
      }
    }
  }

  // Cancel deletion
  function cancelDelete() {
    setDeleteModal({ show: false, transactionId: null, transactionName: '' });
  }
   // Filter transactions based on time range
  const filteredTransactions = transactions.filter(transaction => {
    if (timeRange === 'all') return true;
    
    const transactionDate = new Date(transaction.datetime);
    const now = new Date();
    const diffTime = now - transactionDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    if (timeRange === 'month') return diffDays <= 30;
    if (timeRange === 'week') return diffDays <= 7;
    return true;
  });

  // Prepare data for charts
  const prepareChartData = () => {
    const categoryMap = {};
    
    filteredTransactions.forEach(transaction => {
      const category = transaction.description || 'Uncategorized';
      if (!categoryMap[category]) {
        categoryMap[category] = 0;
      }
      categoryMap[category] += transaction.price;
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

  // Prepare data for line chart (daily balance)
  const prepareDailyBalanceData = () => {
    const dailyBalance = {};
    let runningBalance = 0;
    
    // Sort transactions by date
    const sortedTransactions = [...filteredTransactions].sort((a, b) => 
      new Date(a.datetime) - new Date(b.datetime)
    );


    sortedTransactions.forEach(transaction => {
      const date = new Date(transaction.datetime).toLocaleDateString();
      runningBalance += transaction.price;
      
      if (!dailyBalance[date]) {
        dailyBalance[date] = 0;
      }
      dailyBalance[date] = runningBalance;
    });

    return Object.keys(dailyBalance).map(date => ({
      date,
      balance: dailyBalance[date]
    }));
  };

  const dailyBalanceData = prepareDailyBalanceData();

  // Calculate income and expense totals
  const incomeTotal = filteredTransactions
    .filter(t => t.price > 0)
    .reduce((sum, t) => sum + t.price, 0)
    .toFixed(2);

  const expenseTotal = filteredTransactions
    .filter(t => t.price < 0)
    .reduce((sum, t) => sum + t.price, 0)
    .toFixed(2);
   const handleSaveGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.targetDate) {
      alert('Please fill all fields');
      return;
    }
    const goal = {
      id: Date.now(),
      ...newGoal,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: parseFloat(newGoal.currentAmount),
      createdAt: new Date().toISOString()
    };
    setSavingsGoals([...savingsGoals, goal]);
    setNewGoal({ name: '', targetAmount: '', targetDate: '', currentAmount: '0' });
    setShowGoalForm(false);
  };
   const handleAddFunds = async (goalId) => {
  const amountInput = document.getElementById(`add-${goalId}`);
  const amount = parseFloat(amountInput.value);

     if (isNaN(amount) || amount <= 0) {
    alert('Please enter a valid amount');
    return;
  }
   try {
    setIsLoading(true);
   // 1. Create a transaction for the deduction
    const transactionUrl = process.env.REACT_APP_API_URL + '/transaction';
    const transactionResponse = await fetch(transactionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Savings: ${savingsGoals.find(g => g.id === goalId).name}`,
        description: 'Savings transfer',
        datetime: new Date().toISOString(),
        price: -amount, // Negative because it's an expense
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
    if (Array.isArray(updatedTransactions)) {
      setTransactions(updatedTransactions);
    }
    amountInput.value = '';    
  }catch (error) {
    console.error('Error adding funds:', error);
    alert(`Failed to add funds: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};
  const handleDeleteGoal = (goalId) => {
    setSavingsGoals(savingsGoals.filter(goal => goal.id !== goalId));
  };
  const getAchievementLevel = (progress) => {
    if (progress >= 100) return '🏆 Champion';
    if (progress >= 75) return '🔥 On Fire';
    if (progress >= 50) return '🚀 Halfway There';
    if (progress >= 25) return '👶 Beginner';
    return '🆕 New Goal';
  };
  const SavingsGoalCard = ({ goal, onAddFunds, onDelete }) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    const daysLeft = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
      return (
      <div className="goal-card">
        <div className="goal-header">
          <h3>{goal.name}</h3>
          <button className="delete-goal" onClick={() => onDelete(goal.id)}>
            ×
          </button>
        </div>
        
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
          <span className="progress-text">
            ${goal.currentAmount.toFixed(2)} of ${goal.targetAmount.toFixed(2)} ({Math.round(progress)}%)
          </span>
        </div>
        
        <div className="goal-details">
          <span>Target Date: {new Date(goal.targetDate).toLocaleDateString()}</span>
          <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Past due'}</span>
          <div className="achievement-badge">
            {getAchievementLevel(progress)}
          </div>
        </div>
        
        <div className="goal-actions">
          <input
            type="number"
            placeholder="Add amount"
            id={`add-${goal.id}`}
            min="0"
            step="0.01"
          />
          <button onClick={() => onAddFunds(goal.id)}>
            Add Funds
          </button>
        </div>
      </div>
    );
  };


  const savingsTotal = savingsGoals
    .reduce((sum, goal) => sum + goal.currentAmount, 0)
    .toFixed(2);
  
  
  // Format date for better display
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  let balance = 0;
  if (Array.isArray(transactions)) {
    for(const transaction of transactions){
      balance = balance + transaction.price;
    }
  }
  balance = balance.toFixed(2);
  const fraction = balance.split('.')[1];
  balance = balance.split('.')[0];
 
  

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="logo">💰 Money Tracker</div>
          <div className="nav-stats">
            <span>{transactions.length} transactions | {savingsGoals.length} goals</span>
          </div>
        </div>
      </nav>

      <main>
        <div className="hero-section">
          <div className="app-title">
            <h1 className="project-name">Money Tracker</h1>
            <p className="app-subtitle">Take control of your finances with our modern, intuitive expense tracking platform</p>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="balance-card">
            <div className="balance-label">Current Balance</div>
            <div className="balance-amount">
              ${balance}<span className="cents">{fraction}</span>
            </div>
          </div>

          <div className="form-card">
            <h2 className="form-title">Add New Transaction</h2>
        <form onSubmit={addNewTransaction}>
          <div className='basics'>
            <div className='input-group'>
              <label htmlFor="amount-name">Amount & Item Name</label>
              <input
                id="amount-name"
                type="text"
                value={name}
                onChange={ev=>setName(ev.target.value)}
                placeholder='e.g., +3000 salary or -150 groceries'
                disabled={isLoading}
              />
              <small>Start with + for income or - for expense, followed by item name</small>
            </div>
            <div className='input-group'>
              <label htmlFor="datetime">Date & Time</label>
              <input
                id="datetime"
                value={datetime}
                onChange={ev=>setDatetime(ev.target.value)}
                type="datetime-local"
                disabled={isLoading}
              />
            </div>
          </div>
          <div className='description'>
            <div className='input-group'>
              <label htmlFor="description">Description</label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={ev=>setDescription(ev.target.value)}
                placeholder='e.g., Monthly salary, Weekly shopping, Coffee with friends'
                disabled={isLoading}
              />
            </div>
          </div>
          <div className='button'>
            <button type='submit' disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add New Transaction'}
            </button>
          </div>
        </form>
          </div>
        </div>
         <div className="data-visualization-section">
        <h2 className="section-title">Financial Insights</h2>
        
        <div className="chart-controls">
          <div className="time-range-selector">
            <button 
              className={timeRange === 'all' ? 'active' : ''} 
              onClick={() => setTimeRange('all')}
            >
              All Time
            </button>
            <button 
              className={timeRange === 'month' ? 'active' : ''} 
              onClick={() => setTimeRange('month')}
            >
              Last 30 Days
            </button>
            <button 
              className={timeRange === 'week' ? 'active' : ''} 
              onClick={() => setTimeRange('week')}
            >
              Last 7 Days
            </button>
          </div>
          
          <div className="chart-type-selector">
            <button 
              className={activeChart === 'line' ? 'active' : ''} 
              onClick={() => setActiveChart('line')}
            >
              Trend
            </button>
            <button 
              className={activeChart === 'pie' ? 'active' : ''} 
              onClick={() => setActiveChart('pie')}
            >
              Pie Chart
            </button>
            <button 
              className={activeChart === 'bar' ? 'active' : ''} 
              onClick={() => setActiveChart('bar')}
            >
              Bar Chart
            </button>
            
          </div>
        </div>

        <div className="summary-cards">
          <div className="summary-card income">
            <h3>Total Income</h3>
            <p>${incomeTotal}</p>
          </div>
          <div className="summary-card expense">
            <h3>Total Expenses</h3>
            <p>${Math.abs(expenseTotal)}</p>
          </div>
          <div className="summary-card net">
            <h3>Net Balance</h3>
            <p>${(parseFloat(incomeTotal) + parseFloat(expenseTotal)).toFixed(2)}</p>
          </div>
        </div>

        <div className="chart-container">
          {activeChart === 'line' && (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={dailyBalanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Balance']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  name="Balance Over Time" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
          {activeChart === 'pie' && (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={sortedChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {sortedChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}

          {activeChart === 'bar' && (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={sortedChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                <Legend />
                <Bar dataKey="value" name="Amount">
                  {sortedChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
  
        </div>
      </div>
       {/* Summary Cards - Updated with Savings */}
        <div className="summary-cards">
          <div className="summary-card income">
            <h3>Total Income</h3>
            <p>${incomeTotal}</p>
          </div>
          <div className="summary-card expense">
            <h3>Total Expenses</h3>
            <p>${Math.abs(expenseTotal)}</p>
          </div>
          <div className="summary-card net">
            <h3>Net Balance</h3>
            <p>${(parseFloat(incomeTotal) + parseFloat(expenseTotal)).toFixed(2)}</p>
          </div>
          <div className="summary-card savings">
            <h3>Total Savings</h3>
            <p>${savingsTotal}</p>
          </div>
        </div>
        

        <div className="transactions-section">
          <h2 className="section-title">Recent Transactions</h2>
          <div className='transactions'>
          {Array.isArray(transactions) && transactions.length > 0 && transactions.map(transaction => (
            <div className='transaction' key={transaction._id}>
              <div className='left'>
                <div className='name'>{transaction.name}</div>
                <div className='description'>{transaction.description}</div>
                <div className='datetime'>
                  {formatDate(transaction.datetime)}
                </div>
              </div>
              <div className='right'>
                <div className={"price " + (transaction.price < 0 ? 'red' : 'green')}>
                  {transaction.price < 0 ? '-' : '+'}${Math.abs(transaction.price).toFixed(2)}
                </div>
                <div className='transaction-actions'>
                  <button
                    className='delete-btn'
                    onClick={() => handleDeleteClick(transaction)}
                    title="Delete transaction"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {Array.isArray(transactions) && transactions.length === 0 && (
            <div className='empty-state'>
              <h3>No transactions yet</h3>
              <p>Add your first transaction above to get started tracking your money!</p>
            </div>
          )}
          </div>
        </div>


        {/* Delete Confirmation Modal */}
        {deleteModal.show && (
          <div className='modal-overlay' onClick={cancelDelete}>
            <div className='modal' onClick={(e) => e.stopPropagation()}>
              <h3>Delete Transaction</h3>
              <p>
                Are you sure you want to delete the transaction "{deleteModal.transactionName}"?
                This action cannot be undone.
              </p>
              <div className='modal-actions'>
                <button className='modal-btn cancel' onClick={cancelDelete}>
                  Cancel
                </button>
                <button className='modal-btn confirm' onClick={confirmDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        {/* NEW Savings Section */}
        <div className="savings-section">
          <h2 className="section-title">Savings Goals</h2>
          
          <button 
            className="add-goal-btn"
            onClick={() => setShowGoalForm(!showGoalForm)}
          >
            {showGoalForm ? 'Cancel' : '+ Add New Goal'}
          </button>

          {showGoalForm && (
            <div className="goal-form">
              <h3>Create New Savings Goal</h3>
              <input
                type="text"
                placeholder="Goal name (e.g. Vacation)"
                value={newGoal.name}
                onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
              />
              <input
                type="number"
                placeholder="Target amount ($)"
                value={newGoal.targetAmount}
                onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})}
                min="0"
                step="0.01"
              />
              <input
                type="date"
                value={newGoal.targetDate}
                onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
              <button 
                className="save-goal-btn"
                onClick={handleSaveGoal}
              >
                Save Goal
              </button>
            </div>
          )}

          <div className="goals-list">
            {savingsGoals.length > 0 ? (
              savingsGoals.map((goal) => (
                <SavingsGoalCard 
                  key={goal.id}
                  goal={goal}
                  onAddFunds={handleAddFunds}
                  onDelete={handleDeleteGoal}
                />
              ))
            ) : (
              <div className="empty-goals">
                <p>No savings goals yet. Create your first goal to start saving!</p>
              </div>
            )}
          </div>
        </div>

      </main>

      <footer className="footer">
      </footer>
    </div>
  );
}

export default App;
