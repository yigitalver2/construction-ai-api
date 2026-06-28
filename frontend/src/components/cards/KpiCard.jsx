import React from 'react';
import './KpiCard.css';

const KpiCard = ({ 
  title, 
  value, 
  icon, 
  change, 
  changeType = 'positive',
  description 
}) => {
  return (
    <div className="kpi-card">
      <div className="kpi-card-header">
        <div className="kpi-card-icon">{icon}</div>
        {change && (
          <div className={`kpi-card-change ${changeType}`}>
            {changeType === 'positive' ? '↑' : '↓'} {change}%
          </div>
        )}
      </div>
      <div className="kpi-card-body">
        <h3 className="kpi-card-value">{value}</h3>
        <p className="kpi-card-title">{title}</p>
        {description && (
          <p className="kpi-card-description">{description}</p>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
