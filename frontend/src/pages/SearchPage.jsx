import React, { useState } from 'react';
import QueryBar from '../components/search/QueryBar';
import FilterChips from '../components/search/FilterChips';
import ResultsToolbar from '../components/search/ResultsToolbar';
import ImageCard from '../components/cards/ImageCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { searchImages } from '../services/api';
import './SearchPage.css';

const SearchPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'Last 7 days',
    category: 'All'
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedImage, setSelectedImage] = useState(null);

  const handleSearch = async (query) => {
    try {
      setLoading(true);
      setHasSearched(true);
      const data = await searchImages(query, filters);
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = () => {
    alert('Exporting search results...');
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <h1 className="page-title">AI Search</h1>
        <p className="page-description">
          Search through site photos using natural language queries
        </p>
      </div>

      <div className="search-query-section">
        <QueryBar 
          onSearch={handleSearch}
          placeholder="Describe what you're looking for... (e.g., 'concrete work in the last week')"
        />
      </div>

      <div className="search-filters-section">
        <FilterChips filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {loading && (
        <LoadingSpinner text="Searching through photos..." />
      )}

      {!loading && hasSearched && results.length > 0 && (
        <div className="search-results-section">
          <ResultsToolbar
            resultCount={results.length}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onExport={handleExport}
          />
          <div className="search-results-grid">
            {results.map((image) => (
              <div key={image.image_id} className="search-result-item">
                <ImageCard
                  image={image}
                  onClick={() => setSelectedImage(image)}
                />
                {image.score && (
                  <div className="relevance-score">
                    Relevance: {(image.score * 100).toFixed(0)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && hasSearched && results.length === 0 && (
        <EmptyState
          icon="🔍"
          title="No results found"
          description="Try adjusting your query or filters"
          action={
            <Button onClick={() => setHasSearched(false)}>
              Clear Search
            </Button>
          }
        />
      )}

      {!loading && !hasSearched && (
        <EmptyState
          icon="🚀"
          title="Start searching"
          description="Enter a natural language query above to find relevant photos"
        />
      )}

      <Modal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        title="Photo Details"
        size="lg"
      >
        {selectedImage && (
          <div className="image-detail">
            <img
              src={selectedImage.image_url}
              alt={selectedImage.description}
              className="image-detail-photo"
            />
            <div className="image-detail-info">
              <p><strong>Category:</strong> {selectedImage.category}</p>
              <p><strong>Status:</strong> {selectedImage.status}</p>
              <p><strong>Uploaded:</strong> {new Date(selectedImage.uploaded_at).toLocaleDateString()}</p>
              <p><strong>Description:</strong> {selectedImage.description}</p>
              {selectedImage.score && (
                <p><strong>Relevance Score:</strong> {(selectedImage.score * 100).toFixed(1)}%</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SearchPage;
