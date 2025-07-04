import React from 'react';
import './../../styles/charts/chartsControl.css';

export const ChartControls = ({ 
  timeRange, 
  setTimeRange, 
  activeChart, 
  setActiveChart 
}) => {
  return (
    <div className="chart-controls">
      <div className="time-range-selector">
        <button
          className={`time-range-btn ${timeRange === 'all' ? 'active' : ''}`}
          onClick={() => setTimeRange('all')}
        >
          All Time
        </button>
        <button
          className={`time-range-btn ${timeRange === 'month' ? 'active' : ''}`}
          onClick={() => setTimeRange('month')}
        >
          Last 30 Days
        </button>
        <button
          className={`time-range-btn ${timeRange === 'week' ? 'active' : ''}`}
          onClick={() => setTimeRange('week')}
        >
          Last 7 Days
        </button>
      </div>
      
      <div className="chart-type-selector">
        <button
          className={`chart-type-btn ${activeChart === 'line' ? 'active' : ''}`}
          onClick={() => setActiveChart('line')}
          aria-label="Line chart"
        >
          <i className="fas fa-chart-line"></i>
          Trend
        </button>
        <button
          className={`chart-type-btn ${activeChart === 'pie' ? 'active' : ''}`}
          onClick={() => setActiveChart('pie')}
          aria-label="Pie chart"
        >
          <i className="fas fa-chart-pie"></i>
          Categories
        </button>
        <button
          className={`chart-type-btn ${activeChart === 'bar' ? 'active' : ''}`}
          onClick={() => setActiveChart('bar')}
          aria-label="Bar chart"
        >
          <i className="fas fa-chart-bar"></i>
          Breakdown
        </button>
      </div>
    </div>
  );
};