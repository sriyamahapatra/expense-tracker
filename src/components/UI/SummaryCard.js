import React from 'react';
import './../../styles/UI/summary-cards.css';

export const SummaryCards = ({ incomeTotal, expenseTotal, savingsTotal }) => {
  return (
    <div className="summary-cards">
      <div className="summary-card income">
        <div className="card-icon">💰</div>
        <div className="card-content">
          <h3>Total Income</h3>
          <p>${incomeTotal}</p>
        </div>
      </div>
      
      <div className="summary-card expense">
        <div className="card-icon">💸</div>
        <div className="card-content">
          <h3>Total Expenses</h3>
          <p>${Math.abs(expenseTotal)}</p>
        </div>
      </div>
      
      <div className="summary-card net">
        <div className="card-icon">📊</div>
        <div className="card-content">
          <h3>Net Balance</h3>
          <p>${(parseFloat(incomeTotal) + parseFloat(expenseTotal)).toFixed(2)}</p>
        </div>
      </div>
      
      <div className="summary-card savings">
        <div className="card-icon">🏦</div>
        <div className="card-content">
          <h3>Total Savings</h3>
          <p>${savingsTotal}</p>
        </div>
      </div>
    </div>
  );
};