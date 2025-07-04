import React from 'react';
import './../../styles/UI/balanced-card.css';

export const BalanceCard = ({ dollars, cents }) => {
  return (
    <div className="balance-card">
      <div className="balance-label">Current Balance</div>
      <div className="balance-amount">
        ${dollars}<span className="cents">.{cents}</span>
      </div>
      <div className="balance-trend">
        <span className="trend-indicator positive">↑ 2.5% from last month</span>
      </div>
    </div>
  );
};