import React from 'react';
import './StatCard.css';

const StatCard = ({ title, children, headerAction }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <h3 className="stat-card-title">{title}</h3>
        {headerAction && (
          <div className="stat-card-action">{headerAction}</div>
        )}
      </div>
      <div className="stat-card-body">
        {children}
      </div>
    </div>
  );
};

export default StatCard;
