import React, { useState, useEffect } from 'react';
import KpiCard from '../components/cards/KpiCard';
import StatCard from '../components/cards/StatCard';
import ImageCard from '../components/cards/ImageCard';
import DonutChart from '../components/charts/DonutChart';
import TimelineChart from '../components/charts/TimelineChart';
import QueryBar from '../components/search/QueryBar';
import FilterChips from '../components/search/FilterChips';
import ResultsToolbar from '../components/search/ResultsToolbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { getStats, searchImages, getDistribution, getTimeline } from '../services/api';
import './DashboardPage.css';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'Last 7 days',
    category: 'All'
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, distData, timeData] = await Promise.all([
        getStats(),
        getDistribution(),
        getTimeline()
      ]);
      setStats(statsData);
      setDistribution(distData);
      setTimeline(timeData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    try {
      setSearching(true);
      const results = await searchImages(query, filters);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExportResults = () => {
    alert('Export functionality - coming soon!');
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  return (
    <div className="dashboard-page">
      {/* Scheduled Reports Banner */}
      <div className="scheduled-reports-banner">
        <div className="banner-content">
          <span className="banner-icon">📅</span>
          <span className="banner-text">
            <strong>Scheduled Reports Active</strong> - Weekly reports will be sent every Monday
          </span>
        </div>
        <Button variant="outline" size="sm">
          Manage Schedules
        </Button>
      </div>

      {/* AI Query Panel */}
      <div className="query-panel">
        <h2 className="section-title">Enter Your Query</h2>
        <QueryBar onSearch={handleSearch} />
        <div className="query-filters">
          <FilterChips filters={filters} onFilterChange={handleFilterChange} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KpiCard
          title="Site Photos"
          value={stats?.total_photos?.toLocaleString() || '0'}
          icon="📷"
          change={stats?.delta_total_photos_pct}
          changeType="positive"
          description="Total photos uploaded"
        />
        <KpiCard
          title="Completion Rate"
          value={`${((stats?.completion_rate || 0) * 100).toFixed(1)}%`}
          icon="✅"
          change={5.2}
          changeType="positive"
          description={`${stats?.analyzed_photos || 0} / ${stats?.total_photos || 0} analyzed`}
        />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <StatCard title="Activity Distribution">
          <DonutChart data={distribution} />
        </StatCard>
        <StatCard title="Activity Timeline">
          <TimelineChart data={timeline} />
        </StatCard>
      </div>

      {/* Query Results */}
      {searching && (
        <div className="query-results">
          <LoadingSpinner text="Analyzing query..." />
        </div>
      )}

      {!searching && searchResults.length > 0 && (
        <div className="query-results">
          <ResultsToolbar
            resultCount={searchResults.length}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onExport={handleExportResults}
          />
          <div className="results-grid">
            {searchResults.map((image) => (
              <ImageCard
                key={image.image_id}
                image={image}
                onClick={() => setSelectedImage(image)}
              />
            ))}
          </div>
        </div>
      )}

      {!searching && searchResults.length === 0 && (
        <div className="query-results">
          <StatCard title="Construction Site Photos">
            <EmptyState
              icon="🔍"
              title="No search results yet"
              description="Enter a query above to search through site photos using natural language"
            />
          </StatCard>
        </div>
      )}

      {/* Image Detail Modal */}
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

export default DashboardPage;
