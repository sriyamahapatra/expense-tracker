import React from 'react';
import './../../styles/layout/navbar.css';

export const Navbar = ({ transactionCount, goalCount }) => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="logo">💰 Money Tracker</div>
        <div className="nav-stats">
          <span>{transactionCount} transactions | {goalCount} goals</span>
        </div>
      </div>
    </nav>
  );
};