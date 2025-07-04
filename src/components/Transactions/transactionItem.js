import React from 'react';
import './../../styles/transactions/transaction-item.css';

export const TransactionItem = ({ transaction, onDelete, formatDate }) => {
  const isIncome = transaction.price > 0;
  const amountColor = isIncome ? 'green' : 'red';
  const amountSign = isIncome ? '+' : '-';

  return (
    <div className={`transaction ${amountColor}`}>
      <div className="transaction-left">
        <div className="transaction-icon">
          {isIncome ? '📈' : '📉'}
        </div>
        <div className="transaction-details">
          <div className="transaction-name">{transaction.name}</div>
          <div className="transaction-description">{transaction.description}</div>
          <div className="transaction-datetime">{formatDate(transaction.datetime)}</div>
        </div>
      </div>
      <div className="transaction-right">
        <div className={`transaction-amount ${amountColor}`}>
          {amountSign}${Math.abs(transaction.price).toFixed(2)}
        </div>
        <button
          className="delete-btn"
          onClick={() => onDelete(transaction)}
          aria-label={`Delete transaction: ${transaction.name}`}
        >
          Delete
        </button>
      </div>
    </div>
  );
};