import React, { useState } from 'react';
import './../../styles//Savings/saving-form.css';

export const SavingsGoalForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    currentAmount: '0'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a goal name');
      return;
    }

    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      alert('Please enter a valid target amount');
      return;
    }

    if (!formData.targetDate) {
      alert('Please select a target date');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="savings-goal-form-container">
      <h3>Create New Savings Goal</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Goal Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Vacation, New Car, Emergency Fund"
          />
        </div>

        <div className="form-group">
          <label htmlFor="targetAmount">Target Amount ($)</label>
          <input
            type="number"
            id="targetAmount"
            name="targetAmount"
            value={formData.targetAmount}
            onChange={handleChange}
            min="0.01"
            step="0.01"
            placeholder="1000.00"
          />
        </div>

        <div className="form-group">
          <label htmlFor="currentAmount">Initial Amount ($)</label>
          <input
            type="number"
            id="currentAmount"
            name="currentAmount"
            value={formData.currentAmount}
            onChange={handleChange}
            min="0"
            step="0.01"
            placeholder="0.00"
          />
        </div>

        <div className="form-group">
          <label htmlFor="targetDate">Target Date</label>
          <input
            type="date"
            id="targetDate"
            name="targetDate"
            value={formData.targetDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="save-btn">
            Save Goal
          </button>
        </div>
      </form>
    </div>
  );
};