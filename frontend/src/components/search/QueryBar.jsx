import React, { useState } from 'react';
import Button from '../common/Button';
import './QueryBar.css';

const QueryBar = ({ onSearch, placeholder = 'Enter your query in natural language...' }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const exampleQueries = [
    'Last 7 days concrete work',
    'Excavation progress this month',
    'Foundation photos with safety equipment',
    'Electrical installations in March'
  ];

  return (
    <div className="query-bar">
      <form onSubmit={handleSubmit} className="query-bar-form">
        <div className="query-bar-input-wrapper">
          <textarea
            className="query-bar-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            rows={3}
          />
        </div>
        <Button type="submit" variant="primary" size="lg">
          🔍 Analyze
        </Button>
      </form>
      
      <div className="query-bar-examples">
        <span className="query-bar-examples-label">Try:</span>
        {exampleQueries.map((example, index) => (
          <button
            key={index}
            className="query-bar-example-chip"
            onClick={() => setQuery(example)}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QueryBar;
