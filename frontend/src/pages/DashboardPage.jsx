import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KpiCard from '../components/cards/KpiCard';
import StatCard from '../components/cards/StatCard';
import DonutChart from '../components/charts/DonutChart';
import TimelineChart from '../components/charts/TimelineChart';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getStats, getDistribution, getTimeline } from '../services/api';
import './DashboardPage.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, distData, timeData] = await Promise.all([
          getStats(),
          getDistribution(),
          getTimeline(),
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
    load();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  return (
    <div className="dashboard-page">
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

      {/* AI Search CTA */}
      <div className="search-cta">
        <div className="search-cta-content">
          <span className="search-cta-icon">🔍</span>
          <div>
            <strong>AI Search</strong>
            <p>Search through site photos using natural language</p>
          </div>
        </div>
        <button className="search-cta-btn" onClick={() => navigate('/search')}>
          Go to AI Search
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
