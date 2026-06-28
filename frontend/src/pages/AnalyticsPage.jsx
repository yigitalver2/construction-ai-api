import React, { useState, useEffect } from 'react';
import StatCard from '../components/cards/StatCard';
import DonutChart from '../components/charts/DonutChart';
import TimelineChart from '../components/charts/TimelineChart';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getAnalytics } from '../services/api';
import './AnalyticsPage.css';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('7d');

  useEffect(() => {
    loadAnalytics();
  }, [timePeriod]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading analytics..." />;
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-description">
            Detailed insights and statistics about your construction site photos
          </p>
        </div>
        <select
          className="period-selector"
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="1y">Last Year</option>
        </select>
      </div>

      <div className="analytics-charts">
        <StatCard title="Activity Distribution by Category">
          <DonutChart data={analytics?.distribution || []} />
        </StatCard>

        <StatCard title="Photo Upload Timeline">
          <TimelineChart data={analytics?.timeline || []} />
        </StatCard>
      </div>

      <StatCard 
        title="Top Categories" 
        headerAction={
          <span className="table-info">Total: {analytics?.topCategories?.length || 0}</span>
        }
      >
        <div className="analytics-table-container">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Count</th>
                <th>Percentage</th>
                <th>Distribution</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.topCategories?.map((item, index) => (
                <tr key={index}>
                  <td>
                    <span className="category-badge">{item.category}</span>
                  </td>
                  <td className="count-cell">{item.count.toLocaleString()}</td>
                  <td className="percentage-cell">{item.percentage.toFixed(1)}%</td>
                  <td>
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </StatCard>

      <div className="analytics-insights">
        <StatCard title="AI Insights">
          <div className="insights-list">
            <div className="insight-item">
              <span className="insight-icon">📊</span>
              <div className="insight-content">
                <h4 className="insight-title">Most Active Category</h4>
                <p className="insight-text">
                  {analytics?.topCategories?.[0]?.category || 'N/A'} with {analytics?.topCategories?.[0]?.count || 0} photos
                </p>
              </div>
            </div>
            <div className="insight-item">
              <span className="insight-icon">📈</span>
              <div className="insight-content">
                <h4 className="insight-title">Upload Trend</h4>
                <p className="insight-text">
                  Average {Math.floor((analytics?.timeline?.reduce((sum, day) => sum + day.count, 0) || 0) / (analytics?.timeline?.length || 1))} photos per day
                </p>
              </div>
            </div>
            <div className="insight-item">
              <span className="insight-icon">🎯</span>
              <div className="insight-content">
                <h4 className="insight-title">Coverage</h4>
                <p className="insight-text">
                  Photos distributed across {analytics?.topCategories?.length || 0} categories
                </p>
              </div>
            </div>
          </div>
        </StatCard>
      </div>
    </div>
  );
};

export default AnalyticsPage;
