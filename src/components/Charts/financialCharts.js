import React from 'react';
import { 
  PieChart, Pie, Cell,
  BarChart, Bar, 
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import './../../styles/charts/financial-charts.css';

export const FinancialCharts = ({ 
  activeChart, 
  dailyBalanceData, 
  sortedChartData 
}) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-value">
            {payload[0].value < 0 ? '-' : '+'}
            ${Math.abs(payload[0].value).toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={400}>
        {activeChart === 'line' ? (
          <LineChart data={dailyBalanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="#8b949e"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="#8b949e"
              tickFormatter={(value) => `$${value}`}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="balance" 
              name="Balance" 
              stroke="#8884d8" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={500}
            />
          </LineChart>
        ) : activeChart === 'pie' ? (
          <PieChart>
            <Pie
              data={sortedChartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => 
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              animationBegin={0}
              animationDuration={500}
            >
              {sortedChartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`$${value}`, 'Amount']}
              contentStyle={{
                background: 'rgba(30, 30, 50, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px'
              }}
            />
            <Legend />
          </PieChart>
        ) : (
          <BarChart data={sortedChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis 
              dataKey="name" 
              stroke="#8b949e"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="#8b949e"
              tickFormatter={(value) => `$${value}`}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value) => [`$${value}`, 'Amount']}
              contentStyle={{
                background: 'rgba(30, 30, 50, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar 
              dataKey="value" 
              name="Amount"
              animationDuration={500}
            >
              {sortedChartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};