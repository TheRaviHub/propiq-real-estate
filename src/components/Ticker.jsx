// src/components/Ticker.jsx
import React from 'react';

const Ticker = () => {
  const items = [
    { label: '$Mumbai', val: '₹26.4K', change: '+0.12%', up: true },
    { label: '$Bangalore', val: '₹10.2K', change: '-0.05%', up: false },
    { label: '$Gurugram', val: '₹12.1K', change: '+1.87%', up: true },
    { label: '$Hyderabad', val: '₹8.5K', change: '+0.45%', up: true },
    { label: '$Pune', val: '₹7.8K', change: '-0.20%', up: false },
    { label: '$Noida', val: '₹9.1K', change: '+1.02%', up: true },
  ];
  return (
    <div className="ticker-container">
      <div className="ticker-wrapper">
        {[...items, ...items].map((item, i) => (
          <div key={i} className="ticker-item">
            {item.label} <span style={{ color: 'rgba(255,255,255,0.4)' }}>{item.val}</span> <span className={item.up ? 'up' : 'down'}>{item.change}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ticker;
