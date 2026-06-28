import React, { useState } from 'react';
import QueryBar from '../components/search/QueryBar';
import ImageCard from '../components/cards/ImageCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import { nlSearch } from '../services/api';
import './SearchPage.css';

const SearchPage = () => {
  const [results, setResults] = useState([]);
  const [parsedFilters, setParsedFilters] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (query) => {
    if (query.trim() === '') return;
    try {
      setLoading(true);
      setHasSearched(true);
      setError(null);
      const data = await nlSearch(query);
      setResults(data.results);
      setParsedFilters(data.parsed_filters);
    } catch (err) {
      console.error('Search error:', err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setHasSearched(false);
    setResults([]);
    setParsedFilters(null);
    setError(null);
  };

  const filterChips = parsedFilters ? [
    ...(parsedFilters.categories || []),
    parsedFilters.confidence_min != null
      ? `Confidence ≥ ${(parsedFilters.confidence_min * 100).toFixed(0)}%`
      : null,
    parsedFilters.date_from ? `From ${parsedFilters.date_from}` : null,
    parsedFilters.date_to   ? `To ${parsedFilters.date_to}`   : null,
  ].filter(Boolean) : [];

  return (
    <div className="search-page">
      <div className="search-header">
        <h1 className="page-title">AI Search</h1>
        <p className="page-description">
          Search through site photos using natural language
        </p>
      </div>

      <div className="search-query-section">
        <QueryBar
          onSearch={handleSearch}
          placeholder='e.g. "high confidence cracks from last week"'
        />
      </div>

      {hasSearched && !loading && parsedFilters && (
        <div className="search-understood">
          <span className="understood-label">Understood:</span>
          {filterChips.length > 0
            ? filterChips.map((chip) => (
                <span key={chip} className="understood-chip">{chip}</span>
              ))
            : <span className="understood-chip">All photos</span>
          }
          {parsedFilters.summary && (
            <span className="understood-summary">— {parsedFilters.summary}</span>
          )}
        </div>
      )}

      {loading && <LoadingSpinner text="Analysing query…" />}

      {!loading && error && (
        <EmptyState icon="⚠️" title="Error" description={error} action={<Button onClick={handleClear}>Clear</Button>} />
      )}

      {!loading && hasSearched && !error && results.length > 0 && (
        <div className="search-results-section">
          <div className="search-results-meta">
            {results.length} result{results.length === 1 ? '' : 's'}
          </div>
          <div className="search-results-grid">
            {results.map((image) => (
              <ImageCard key={image.id} image={image} />
            ))}
          </div>
        </div>
      )}

      {!loading && hasSearched && !error && results.length === 0 && (
        <EmptyState
          icon="🔍"
          title="No results found"
          description="Try a different query or broaden your criteria"
          action={<Button onClick={handleClear}>Clear Search</Button>}
        />
      )}

      {!loading && !hasSearched && (
        <EmptyState
          icon="🚀"
          title="Ask anything"
          description='Try: "crack detections with high confidence last month"'
        />
      )}
    </div>
  );
};

export default SearchPage;
