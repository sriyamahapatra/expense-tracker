import React from 'react';
import { TransactionItem } from './transactionItem';
import './../../styles/transactions/transaction-list.css';

export const TransactionList = ({ transactions, onDeleteClick, formatDate }) => {
  const handleDelete = (transaction) => {
    onDeleteClick(transaction);
  };

  return (
    <div className="transactions-section">
      <h2 className="section-title">Recent Transactions</h2>
      <div className="transactions-container">
        {transactions.length > 0 ? (
          <div className="transactions-list">
            {transactions.map((transaction) => (
              <TransactionItem
                key={transaction._id}
                transaction={transaction}
                onDelete={handleDelete}
                formatDate={formatDate}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No transactions yet</h3>
            <p>Add your first transaction to get started tracking your money!</p>
          </div>
        )}
      </div>
    </div>
  );
};