import React, { useState } from 'react';
import { SavingsGoalCards } from './savingGoalCards';
import { SavingsGoalForm } from './SavingsGoalForm';
import './../../styles/Savings/savinggoals.css';

export const SavingsGoals = () => {
  const [goals, setGoals] = useState(() => {
    const savedGoals = localStorage.getItem('savingGoals');
    return savedGoals ? JSON.parse(savedGoals) : [];
  });
  const [showForm, setShowForm] = useState(false);

  const addNewGoal = (newGoal) => {
    const goal = {
      id: Date.now(),
      ...newGoal,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: parseFloat(newGoal.currentAmount) || 0,
      createdAt: new Date().toISOString()
    };
    const updatedGoals = [...goals, goal];
    setGoals(updatedGoals);
    setShowForm(false);
  };

  const addFundsToGoal = (goalId) => {
    const amountInput = document.getElementById(`add-${goalId}`);
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount)) {
      alert('Please enter a valid amount');
      return;
    }

    if (amount <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    const updatedGoals = goals.map(goal => 
      goal.id === goalId 
        ? { ...goal, currentAmount: goal.currentAmount + amount }
        : goal
    );
    setGoals(updatedGoals);
    amountInput.value = '';
  };

  const editGoal = (goalId, updatedData) => {
    const updatedGoals = goals.map(goal => 
      goal.id === goalId
        ? { 
            ...goal, 
            name: updatedData.name,
            targetAmount: parseFloat(updatedData.targetAmount),
            targetDate: new Date(updatedData.targetDate).toISOString()
          }
        : goal
    );
    setGoals(updatedGoals);
  };

  const deleteGoal = (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      const updatedGoals = goals.filter(goal => goal.id !== goalId);
      setGoals(updatedGoals);
    }
  };

  // Save to localStorage whenever goals change
  React.useEffect(() => {
    localStorage.setItem('savingsGoals', JSON.stringify(goals));
  }, [goals]);

  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalGoals = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);

  return (
    <section className="savings-goals-section">
      <div className="savings-header">
        <h2>Savings Goals</h2>
        <div className="savings-summary">
          <div className="summary-item">
            <span className="summary-label">Total Saved:</span>
            <span className="summary-value">${totalSaved.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Goals:</span>
            <span className="summary-value">${totalGoals.toFixed(2)}</span>
          </div>
        </div>
        <button 
          className="add-goal-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ New Goal'}
        </button>
      </div>

      {showForm && (
        <SavingsGoalForm 
          onSave={addNewGoal} 
          onCancel={() => setShowForm(false)} 
        />
      )}

      {goals.length > 0 ? (
        <SavingsGoalCards 
          goals={goals} 
          onAddFunds={addFundsToGoal}
          onDeleteGoal={deleteGoal}
          onEditGoal={editGoal}
        />
      ) : (
        <div className="empty-state">
          <h3>No savings goals yet</h3>
          <p>Create your first goal to start saving!</p>
          <button 
            className="add-first-goal"
            onClick={() => setShowForm(true)}
          >
            Create Goal
          </button>
        </div>
      )}
    </section>
  );
};