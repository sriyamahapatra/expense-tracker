import React, { useState } from 'react';
import './../../styles/Savings/savingGoalCards.css';

export const SavingsGoalCards = ({ 
  goals, 
  onAddFunds, 
  onDeleteGoal,
  onEditGoal 
}) => {
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    targetAmount: '',
    targetDate: ''
  });

  const handleEditClick = (goal) => {
    setEditingGoalId(goal.id);
    setEditFormData({
      name: goal.name,
      targetAmount: goal.targetAmount,
      targetDate: goal.targetDate.split('T')[0]
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = (goalId) => {
    onEditGoal(goalId, editFormData);
    setEditingGoalId(null);
  };

  const handleCancelEdit = () => {
    setEditingGoalId(null);
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return '#4CAF50'; // Green
    if (progress >= 75) return '#8BC34A'; // Light green
    if (progress >= 50) return '#FFC107'; // Amber
    if (progress >= 25) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getAchievementLevel = (progress) => {
    if (progress >= 100) return '🏆 Goal Achieved!';
    if (progress >= 75) return '🔥 Almost There!';
    if (progress >= 50) return '🚀 Halfway Done';
    if (progress >= 25) return '👶 Getting Started';
    return '🆕 New Goal';
  };

  const calculateDaysLeft = (targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="savings-goals-container">
      {goals.map(goal => {
        const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
        const daysLeft = calculateDaysLeft(goal.targetDate);
        const progressColor = getProgressColor(progress);

        return (
          <div className="savings-goal-card" key={goal.id}>
            {editingGoalId === goal.id ? (
              <div className="edit-goal-form">
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  placeholder="Goal name"
                />
                <input
                  type="number"
                  name="targetAmount"
                  value={editFormData.targetAmount}
                  onChange={handleEditChange}
                  placeholder="Target amount"
                  min="0"
                  step="0.01"
                />
                <input
                  type="date"
                  name="targetDate"
                  value={editFormData.targetDate}
                  onChange={handleEditChange}
                  min={new Date().toISOString().split('T')[0]}
                />
                <div className="edit-actions">
                  <button 
                    className="save-edit"
                    onClick={() => handleEditSubmit(goal.id)}
                  >
                    Save
                  </button>
                  <button 
                    className="cancel-edit"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="goal-header">
                  <h3>{goal.name}</h3>
                  <div className="goal-actions">
                    <button 
                      className="edit-goal"
                      onClick={() => handleEditClick(goal)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-goal"
                      onClick={() => onDeleteGoal(goal.id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
                
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: progressColor
                      }}
                    ></div>
                  </div>
                  <div className="progress-text">
                    ${goal.currentAmount.toFixed(2)} of ${goal.targetAmount.toFixed(2)} ({Math.round(progress)}%)
                  </div>
                </div>
                
                <div className="goal-details">
                  <div className="detail-item">
                    <span className="detail-label">Target Date:</span>
                    <span className="detail-value">
                      {new Date(goal.targetDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Time Left:</span>
                    <span className="detail-value">
                      {daysLeft > 0 ? `${daysLeft} days` : 'Past due'}
                    </span>
                  </div>
                  <div className="achievement-badge">
                    {getAchievementLevel(progress)}
                  </div>
                </div>
                
                <div className="add-funds-container">
                  <input
                    type="number"
                    placeholder="Amount to add"
                    id={`add-${goal.id}`}
                    min="0"
                    step="0.01"
                  />
                  <button 
                    className="add-funds-btn"
                    onClick={() => onAddFunds(goal.id)}
                  >
                    Add Funds
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};