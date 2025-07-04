import React, { useState } from 'react';
import './../../styles/transactions/transaction-form.css';

export const TransactionForm = ({ onSubmit, isLoading, setTransactions, setIsLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    datetime: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateInputs()) return;

    setIsLoading(true);
    const parts = formData.name.trim().split(' ');
    const price = parseFloat(parts[0]);
    const itemName = parts.slice(1).join(' ');

    try {
      const url = process.env.REACT_APP_API_URL + '/transaction';
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: itemName,
          description: formData.description,
          datetime: formData.datetime,
          price,
        }),
      });

      if (!response.ok) throw new Error('Failed to create transaction');

      // Reset form
      setFormData({
        name: '',
        datetime: '',
        description: ''
      });

      // Refresh transactions
      const updatedTransactions = await getTransactions();
      setTransactions(updatedTransactions);
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert(`Failed to create transaction: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const validateInputs = () => {
    if (!formData.name.trim()) {
      alert('Please enter a transaction (e.g., "+200 groceries" or "-50 coffee")');
      return false;
    }
    if (!formData.description.trim()) {
      alert('Please enter a description');
      return false;
    }
    if (!formData.datetime) {
      alert('Please select a date and time');
      return false;
    }
    return true;
  };

  const getTransactions = async () => {
    try {
      const url = process.env.REACT_APP_API_URL + '/transactions';
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  };

  return (
    <div className="form-card">
      <h2 className="form-title">Add New Transaction</h2>
      <form onSubmit={handleSubmit}>
        <div className='form-group basics'>
          <div className='input-group'>
            <label htmlFor="name">Amount & Item Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder='e.g., +3000 salary or -150 groceries'
              disabled={isLoading}
            />
            <small>Start with + for income or - for expense, followed by item name</small>
          </div>
          <div className='input-group'>
            <label htmlFor="datetime">Date & Time</label>
            <input
              id="datetime"
              name="datetime"
              type="datetime-local"
              value={formData.datetime}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
        </div>
        <div className='form-group description'>
          <div className='input-group'>
            <label htmlFor="description">Description</label>
            <input
              id="description"
              name="description"
              type="text"
              value={formData.description}
              onChange={handleChange}
              placeholder='e.g., Monthly salary, Weekly shopping, Coffee with friends'
              disabled={isLoading}
            />
          </div>
        </div>
        <div className='form-actions'>
          <button 
            type='submit' 
            disabled={isLoading}
            className={`submit-btn ${isLoading ? 'loading' : ''}`}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              'Add New Transaction'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};