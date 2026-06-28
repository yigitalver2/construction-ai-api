import React from 'react';
import Button from '../common/Button';
import './ResultsToolbar.css';

const ResultsToolbar = ({ 
  resultCount, 
  sortBy, 
  onSortChange, 
  onExport,
  viewMode,
  onViewModeChange 
}) => {
  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'latest', label: 'Latest First' },
    { value: 'oldest', label: 'Oldest First' }
  ];

  return (
    <div className="results-toolbar">
      <div className="results-toolbar-left">
        <h3 className="results-toolbar-title">Query Results</h3>
        {resultCount !== null && (
          <span className="results-toolbar-count">
            Found {resultCount} {resultCount === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>

      <div className="results-toolbar-right">
        <select
          className="results-toolbar-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              Sort: {option.label}
            </option>
          ))}
        </select>

        {onViewModeChange && (
          <div className="results-toolbar-view-mode">
            <button
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => onViewModeChange('grid')}
            >
              ⊞
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => onViewModeChange('list')}
            >
              ☰
            </button>
          </div>
        )}

        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            📥 Export Results
          </Button>
        )}
      </div>
    </div>
  );
};

export default ResultsToolbar;
