import React from 'react';
import './FilterChips.css';

const FilterChips = ({ filters, onFilterChange }) => {
  const dateRanges = ['Last 7 days', 'Last 30 days', 'Last 3 months', 'Custom'];
  const categories = ['All', 'Excavation', 'Concrete', 'Electrical', 'Finishing', 'Safety'];

  return (
    <div className="filter-chips">
      <div className="filter-chips-group">
        <label className="filter-chips-label">Date Range:</label>
        <div className="filter-chips-list">
          {dateRanges.map((range) => (
            <button
              key={range}
              className={`filter-chip ${filters.dateRange === range ? 'active' : ''}`}
              onClick={() => onFilterChange('dateRange', range)}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-chips-group">
        <label className="filter-chips-label">Category:</label>
        <div className="filter-chips-list">
          {categories.map((category) => (
            <button
              key={category}
              className={`filter-chip ${filters.category === category ? 'active' : ''}`}
              onClick={() => onFilterChange('category', category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterChips;
