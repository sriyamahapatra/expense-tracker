import './App.css';
import {useEffect,useState} from 'react';


function App() {
  const[name,setName]=useState('');
  const[datetime,setDatetime]= useState('');
  const[description,setDescription]= useState('');
  const[transactions,setTransactions]= useState([]);
  const[isLoading,setIsLoading]= useState(false);
  const[deleteModal,setDeleteModal]= useState({ show: false, transactionId: null, transactionName: '' });
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

    console.log('Sending transaction:', { name: itemName, description, datetime, price });

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
            <span>{transactions.length} transactions</span>
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

      </main>

      <footer className="footer">
      </footer>
    </div>
  );
}

export default App;
