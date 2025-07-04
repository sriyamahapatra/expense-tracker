import React from 'react';
import './../../styles/layout/footer.css';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-text">
          <p>© {currentYear} Money Tracker by Sriya Mahapatra</p>
          <p>Built with React and ❤️</p>
        </div>
        <div className="footer-links">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/contact">Contact</a>
        </div>
      </div>
    </footer>
  );
};